// src/pages/api/ocr.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PDFDocument } from 'pdf-lib';

export const config = {
  api: { bodyParser: { sizeLimit: '32mb' } }
};

interface SubBatch {
  pageIndices: number[];
  buffer: Buffer;
  type: 'llama_agentic' | 'llama_flash' | 'gemini_flash';
}

interface PageResult {
  page: number;
  text: string;
  engine: string;
}

const LLAMA_KEY = process.env.LLAMA_CLOUD_API_KEY || '';
const GEMINI_KEY = process.env.GEMINI_API_KEY || '';

// Call LlamaParse API (Llama Cloud)
async function callLlamaParse(
  pdfBuffer: Buffer,
  isPremium: boolean,
  language: string
): Promise<string> {
  if (!LLAMA_KEY) throw new Error('LLAMA_CLOUD_API_KEY ausente');

  const formData = new FormData();
  formData.append('file', new Blob([pdfBuffer], { type: 'application/pdf' }), 'batch.pdf');
  formData.append('premium_mode', isPremium ? 'true' : 'false');
  formData.append('language', language || 'por');
  formData.append(
    'parsing_instruction',
    `Extract text in language '${language || 'pt'}'. ${
      isPremium ? 'Parse tables and complex layouts with agentic precision.' : 'Extract clean text.'
    }`
  );

  const uploadRes = await fetch('https://api.cloud.llamaindex.ai/api/parsing/upload', {
    method: 'POST',
    headers: { Authorization: `Bearer ${LLAMA_KEY}` },
    body: formData
  });

  if (!uploadRes.ok) throw new Error(`LlamaParse HTTP ${uploadRes.status}`);
  const { id } = await uploadRes.json();

  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const statusRes = await fetch(`https://api.cloud.llamaindex.ai/api/parsing/job/${id}`, {
      headers: { Authorization: `Bearer ${LLAMA_KEY}` }
    });
    const statusData = await statusRes.json();

    if (statusData.status === 'SUCCESS') {
      const resultRes = await fetch(`https://api.cloud.llamaindex.ai/api/parsing/job/${id}/result/text`, {
        headers: { Authorization: `Bearer ${LLAMA_KEY}` }
      });
      return await resultRes.text();
    }
    if (statusData.status === 'ERROR') throw new Error('LlamaParse Job Error');
  }
  throw new Error('LlamaParse Timeout');
}

// Call Google Gemini 2.5 Flash API (Supports PDF buffer natively)
async function callGeminiFlash(pdfBuffer: Buffer, deskew: boolean): Promise<string> {
  if (!GEMINI_KEY) throw new Error('GEMINI_API_KEY ausente');

  const base64Pdf = pdfBuffer.toString('base64');
  const deskewInstruction = deskew
    ? 'Detecte e corrija a rotação/inclinação das páginas (deskew) durante o OCR.'
    : '';
  const prompt = `Extraia todo o texto deste documento PDF mantendo a ordem e estrutura original com alta precisão. ${deskewInstruction}`.trim();

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              { inline_data: { mime_type: 'application/pdf', data: base64Pdf } }
            ]
          }
        ]
      })
    }
  );

  if (!response.ok) throw new Error(`Gemini HTTP ${response.status}`);
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// Helper: Create a sub-PDF buffer from specific page indices
async function createSubBatchPDF(sourcePdf: PDFDocument, pageIndices: number[]): Promise<Buffer> {
  const subDoc = await PDFDocument.create();
  const copied = await subDoc.copyPages(sourcePdf, pageIndices);
  copied.forEach((p) => subDoc.addPage(p));
  const bytes = await subDoc.save({ useObjectStreams: true });
  return Buffer.from(bytes);
}

// PASSO 1 & 2: Predictive Compression & Batch Slicing with Strict Limits
async function sliceIntoSafeBatches(
  sourcePdf: PDFDocument,
  pageIndices: number[],
  batchType: 'llama_agentic' | 'llama_flash' | 'gemini_flash'
): Promise<SubBatch[]> {
  // LlamaParse Limits: < 750 pages AND < 512MB
  // Gemini Limits: < 1000 pages AND < 50MB
  const maxPages = batchType === 'gemini_flash' ? 999 : 749;
  const maxBytes = batchType === 'gemini_flash' ? 48 * 1024 * 1024 : 480 * 1024 * 1024;

  const resultBatches: SubBatch[] = [];
  let currentPages: number[] = [];

  for (const pageIdx of pageIndices) {
    currentPages.push(pageIdx);

    if (currentPages.length >= maxPages) {
      const buf = await createSubBatchPDF(sourcePdf, currentPages);
      if (buf.byteLength > maxBytes && currentPages.length > 1) {
        // Subdivide recursively into half
        const mid = Math.floor(currentPages.length / 2);
        const left = currentPages.slice(0, mid);
        const right = currentPages.slice(mid);
        const leftBuf = await createSubBatchPDF(sourcePdf, left);
        const rightBuf = await createSubBatchPDF(sourcePdf, right);
        resultBatches.push({ pageIndices: left, buffer: leftBuf, type: batchType });
        resultBatches.push({ pageIndices: right, buffer: rightBuf, type: batchType });
      } else {
        resultBatches.push({ pageIndices: currentPages, buffer: buf, type: batchType });
      }
      currentPages = [];
    }
  }

  if (currentPages.length > 0) {
    const buf = await createSubBatchPDF(sourcePdf, currentPages);
    if (buf.byteLength > maxBytes && currentPages.length > 1) {
      for (const pIdx of currentPages) {
        const singleBuf = await createSubBatchPDF(sourcePdf, [pIdx]);
        resultBatches.push({ pageIndices: [pIdx], buffer: singleBuf, type: batchType });
      }
    } else {
      resultBatches.push({ pageIndices: currentPages, buffer: buf, type: batchType });
    }
  }

  return resultBatches;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  try {
    const { pdfBase64, documentLanguage = 'por', deskew = false } = req.body;
    if (!pdfBase64) return res.status(400).json({ error: 'pdfBase64 é obrigatório' });

    // PASSO 1: Análise e Compressão Preditiva
    const rawBuffer = Buffer.from(pdfBase64, 'base64');
    const pdfDoc = await PDFDocument.load(rawBuffer);
    const totalPages = pdfDoc.getPageCount();

    // Group page indices by processing type
    const agenticPages: number[] = [];
    const flashPages: number[] = [];
    const geminiPages: number[] = [];

    for (let i = 0; i < totalPages; i++) {
      if (i % 3 === 0) agenticPages.push(i);
      else if (i % 2 === 0) geminiPages.push(i);
      else flashPages.push(i);
    }

    // PASSO 2: Fatiamento por Subgrupos Seguros
    const allBatches: SubBatch[] = [
      ...(await sliceIntoSafeBatches(pdfDoc, agenticPages, 'llama_agentic')),
      ...(await sliceIntoSafeBatches(pdfDoc, flashPages, 'llama_flash')),
      ...(await sliceIntoSafeBatches(pdfDoc, geminiPages, 'gemini_flash'))
    ];

    // PASSO 3: Execução de Lotes com Failover Automático
    const pageResultsMap = new Map<number, { text: string; engine: string }>();

    await Promise.all(
      allBatches.map(async (batch) => {
        let pageText = '';
        let usedEngine = '';

        if (batch.type === 'llama_agentic' || batch.type === 'llama_flash') {
          const isPremium = batch.type === 'llama_agentic';
          try {
            pageText = await callLlamaParse(batch.buffer, isPremium, documentLanguage);
            usedEngine = isPremium ? 'Llama Agentic' : 'Llama Flash';
          } catch (llamaErr) {
            console.warn(
              `LlamaParse falhou nas páginas [${batch.pageIndices.map((p) => p + 1).join(', ')}]. Ativando Failover Gemini...`,
              llamaErr
            );
            // Failover para Gemini Flash com fatiamento de emergência (< 50MB)
            try {
              const geminiSubBatches = await sliceIntoSafeBatches(pdfDoc, batch.pageIndices, 'gemini_flash');
              let combinedText = '';
              for (const gBatch of geminiSubBatches) {
                const txt = await callGeminiFlash(gBatch.buffer, deskew);
                combinedText += txt + '\n\n';
              }
              pageText = combinedText;
              usedEngine = 'Gemini Flash (Failover)';
            } catch (geminiErr) {
              console.error(`Gemini Failover também falhou para as páginas [${batch.pageIndices.map((p) => p + 1).join(', ')}].`, geminiErr);
              pageText = `[Páginas ${batch.pageIndices.map((p) => p + 1).join(', ')}: Falha temporária no processamento de OCR.]`;
              usedEngine = 'Fallback Seguro';
            }
          }
        } else {
          // Direct Gemini Flash Execution
          try {
            pageText = await callGeminiFlash(batch.buffer, deskew);
            usedEngine = 'Gemini Flash';
          } catch (geminiErr) {
            console.error(`Gemini Flash falhou para as páginas [${batch.pageIndices.map((p) => p + 1).join(', ')}].`, geminiErr);
            pageText = `[Páginas ${batch.pageIndices.map((p) => p + 1).join(', ')}: Falha temporária no processamento de OCR.]`;
            usedEngine = 'Fallback Seguro';
          }
        }

        // Store result for each page index
        batch.pageIndices.forEach((pageIdx) => {
          pageResultsMap.set(pageIdx, { text: pageText, engine: usedEngine });
        });
      })
    );

    // PASSO 4: Remontagem Sequencial Perfeita
    const finalResults: PageResult[] = [];
    for (let i = 0; i < totalPages; i++) {
      const resData = pageResultsMap.get(i) || { text: `[Página ${i + 1}: Sem dados.]`, engine: 'Desconhecido' };
      finalResults.push({ page: i + 1, text: resData.text, engine: resData.engine });
    }

    const fullText = finalResults
      .map((r) => `--- PÁGINA ${r.page} [${r.engine}] ---\n\n${r.text}`)
      .join('\n\n');

    return res.status(200).json({
      success: true,
      text: fullText,
      summary: finalResults.map((r) => ({ page: r.page, engine: r.engine }))
    });
  } catch (error: any) {
    console.error('Erro na API de OCR:', error);
    return res.status(500).json({ error: error.message || 'Erro interno no servidor de OCR' });
  }
}