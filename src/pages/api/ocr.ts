import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PDFDocument } from 'pdf-lib';

export const config = {
  api: { bodyParser: { sizeLimit: '32mb' } }
};

interface PageResult {
  page: number;
  text: string;
  engine: string;
}

const LLAMA_KEY = process.env.LLAMA_CLOUD_API_KEY || '';
const GEMINI_KEY = process.env.GEMINI_API_KEY || '';

// Chamada LlamaParse API (Llama Cloud)
async function callLlamaParse(pdfBuffer: Buffer, mode: 'premium' | 'fast'): Promise<string> {
  if (!LLAMA_KEY) throw new Error('LLAMA_CLOUD_API_KEY ausente');

  const formData = new FormData();
  formData.append('file', new Blob([pdfBuffer], { type: 'application/pdf' }), 'document.pdf');
  formData.append('parsing_instruction', mode === 'premium' ? 'Parse tables and layout' : 'Extract text cleanly');

  const uploadRes = await fetch('https://api.cloud.llamaindex.ai/api/parsing/upload', {
    method: 'POST',
    headers: { Authorization: `Bearer ${LLAMA_KEY}` },
    body: formData
  });

  if (!uploadRes.ok) throw new Error(`LlamaParse HTTP ${uploadRes.status}`);
  const { id } = await uploadRes.json();

  for (let i = 0; i < 15; i++) {
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

// Chamada Google Gemini 2.5 Flash API (Recebe o Buffer do PDF nativamente)
async function callGeminiFlash(pdfBuffer: Buffer): Promise<string> {
  if (!GEMINI_KEY) throw new Error('GEMINI_API_KEY ausente');

  const base64Pdf = pdfBuffer.toString('base64');
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: 'Extraia todo o texto deste documento PDF mantendo a ordem e estrutura original com alta precisão.' },
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  try {
    const { pdfBase64 } = req.body;
    if (!pdfBase64) return res.status(400).json({ error: 'pdfBase64 é obrigatório' });

    const rawBuffer = Buffer.from(pdfBase64, 'base64');
    const pdfDoc = await PDFDocument.load(rawBuffer);
    const totalPages = pdfDoc.getPageCount();

    const results: PageResult[] = [];

    for (let i = 0; i < totalPages; i++) {
      const pageIndex = i + 1;
      const subDoc = await PDFDocument.create();
      const [copiedPage] = await subDoc.copyPages(pdfDoc, [i]);
      subDoc.addPage(copiedPage);
      const singleBuffer = Buffer.from(await subDoc.save());

      let pageText = '';
      let usedEngine = '';

      const isComplexPage = i % 3 === 0;
      const targetMode = isComplexPage ? 'premium' : 'fast';

      // Tentativa 1: LlamaParse
      try {
        pageText = await callLlamaParse(singleBuffer, targetMode);
        usedEngine = isComplexPage ? 'Llama Agentic' : 'Llama Flash';
      } catch (llamaErr) {
        console.warn(`LlamaParse falhou na Pág ${pageIndex}. Ativando Failover Gemini 2.5 Flash...`, llamaErr);
        // Failover para Gemini usando o buffer PDF real (application/pdf)
        try {
          pageText = await callGeminiFlash(singleBuffer);
          usedEngine = 'Gemini 2.5 Flash (Failover)';
        } catch (geminiErr) {
          console.error(`Gemini falhou na Pág ${pageIndex}. Usando Fallback Seguro.`, geminiErr);
          pageText = `[Página ${pageIndex}: Falha temporária nos motores de OCR.]`;
          usedEngine = 'Fallback Seguro';
        }
      }

      results.push({ page: pageIndex, text: pageText, engine: usedEngine });
    }

    // Remontagem Sequencial Perfeita
    results.sort((a, b) => a.page - b.page);
    const fullText = results.map((r) => `--- PÁGINA ${r.page} [${r.engine}] ---\n\n${r.text}`).join('\n\n');

    return res.status(200).json({
      success: true,
      text: fullText,
      summary: results.map((r) => ({ page: r.page, engine: r.engine }))
    });
  } catch (error: any) {
    console.error('Erro na API OCR:', error);
    return res.status(500).json({ error: error.message || 'Erro interno no servidor' });
  }
}