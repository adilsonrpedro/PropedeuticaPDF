// src/pages/api/ocr.ts
import { PDFDocument } from 'pdf-lib';

export const config = {
  api: { bodyParser: false }
};

interface PageResult {
  page: number;
  text: string;
  engine: string;
}

const LLAMA_KEY = process.env.LLAMA_CLOUD_API_KEY || '';
const GEMINI_KEY = process.env.GEMINI_API_KEY || '';

// Polling ultrarrápido do LlamaParse (máximo 3 segundos para evitar Timeout na Vercel)
async function callLlamaParse(pdfBuffer: Buffer, isPremium: boolean, language: string): Promise<string> {
  if (!LLAMA_KEY) throw new Error('LLAMA_CLOUD_API_KEY ausente');

  const formData = new FormData();
  formData.append('file', new Blob([pdfBuffer], { type: 'application/pdf' }), 'page.pdf');
  formData.append('premium_mode', isPremium ? 'true' : 'false');
  formData.append('language', language || 'por');

  const uploadRes = await fetch('https://api.cloud.llamaindex.ai/api/parsing/upload', {
    method: 'POST',
    headers: { Authorization: `Bearer ${LLAMA_KEY}` },
    body: formData
  });

  if (!uploadRes.ok) throw new Error(`LlamaParse HTTP ${uploadRes.status}`);
  const { id } = await uploadRes.json();

  // Trava de timeout: 3 tentativas de 1s
  for (let i = 0; i < 3; i++) {
    await new Promise((r) => setTimeout(r, 1000));
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
    if (statusData.status === 'ERROR') throw new Error('LlamaParse Error');
  }
  throw new Error('LlamaParse Timeout - Forçando Failover Gemini');
}

// Google Gemini 2.5 Flash Ultra-Rápido (~1 a 2 segundos de resposta)
async function callGeminiFlash(pdfBuffer: Buffer, deskew: boolean): Promise<string> {
  if (!GEMINI_KEY) throw new Error('GEMINI_API_KEY ausente');

  const base64Pdf = pdfBuffer.toString('base64');
  const prompt = `Extraia todo o texto deste documento PDF mantendo a estrutura e ordem original com alta precisão. ${
    deskew ? 'Corrija a inclinação das páginas (deskew).' : ''
  }`;

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

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const documentLanguage = (formData.get('documentLanguage') as string) || 'por';
    const deskew = formData.get('deskew') === 'true';

    if (!file) {
      return new Response(JSON.stringify({ error: 'Nenhum arquivo enviado' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const arrayBuffer = await file.arrayBuffer();
    const rawBuffer = Buffer.from(arrayBuffer);
    const pdfDoc = await PDFDocument.load(rawBuffer);
    const totalPages = pdfDoc.getPageCount();

    // Processamento paralelo assíncrono por página (Completa em menos de 5 segundos)
    const results: PageResult[] = await Promise.all(
      Array.from({ length: totalPages }).map(async (_, i) => {
        const pageIndex = i + 1;
        const subDoc = await PDFDocument.create();
        const [copiedPage] = await subDoc.copyPages(pdfDoc, [i]);
        subDoc.addPage(copiedPage);
        const singleBuffer = Buffer.from(await subDoc.save({ useObjectStreams: true }));

        let pageText = '';
        let usedEngine = '';

        const isComplex = i % 3 === 0;

        try {
          pageText = await callLlamaParse(singleBuffer, isComplex, documentLanguage);
          usedEngine = isComplex ? 'Llama Agentic' : 'Llama Flash';
        } catch {
          // Failover Instantâneo para Gemini 2.5 Flash
          try {
            pageText = await callGeminiFlash(singleBuffer, deskew);
            usedEngine = 'Gemini 2.5 Flash (Failover)';
          } catch (geminiErr) {
            console.error(`Falha total na Pág ${pageIndex}:`, geminiErr);
            pageText = `[Página ${pageIndex}: Não foi possível extrair o texto.]`;
            usedEngine = 'Fallback';
          }
        }

        return { page: pageIndex, text: pageText, engine: usedEngine };
      })
    );

    // Remontagem Sequencial Perfeita
    results.sort((a, b) => a.page - b.page);
    const fullText = results.map((r) => `--- PÁGINA ${r.page} [${r.engine}] ---\n\n${r.text}`).join('\n\n');

    return new Response(
      JSON.stringify({
        success: true,
        text: fullText,
        summary: results.map((r) => ({ page: r.page, engine: r.engine }))
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Erro na API OCR:', error);
    return new Response(JSON.stringify({ error: error.message || 'Erro interno no servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}