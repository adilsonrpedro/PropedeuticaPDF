// src/pages/api/convert-office.ts
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export const config = {
  api: { bodyParser: false }
};

const GEMINI_KEY = process.env.GEMINI_API_KEY || '';

const MIME_TYPES: Record<string, string> = {
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  doc: 'application/msword',
  xls: 'application/msexcel',
  ppt: 'application/mspowerpoint'
};

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(JSON.stringify({ error: 'Nenhum arquivo enviado' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const fileName = file.name.toLowerCase();
    const ext = fileName.split('.').pop() || '';
    const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');

    if (!GEMINI_KEY) {
      throw new Error('GEMINI_API_KEY não configurada no servidor');
    }

    // Renderização do Office via Gemini 2.5 Flash
    const prompt = 'Analise este documento do Microsoft Office e converta todo o seu conteúdo, tabelas e formatação em um texto limpo e bem estruturado em Markdown com títulos (#), listas e tabelas legíveis.';

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                { inline_data: { mime_type: mimeType, data: base64Data } }
              ]
            }
          ]
        })
      }
    );

    if (!geminiRes.ok) {
      throw new Error(`Erro na API Gemini: ${geminiRes.status}`);
    }

    const data = await geminiRes.json();
    const extractedText =
      data.candidates?.[0]?.content?.parts?.[0]?.text || 'Documento sem texto detectável.';

    // Geração do PDF com pdf-lib (100% Serverless Vercel)
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let page = pdfDoc.addPage([595.28, 841.89]); // Formato A4
    const { height } = page.getSize();
    const margin = 50;
    let y = height - margin;
    const lineHeight = 16;

    const lines = extractedText.split('\n');

    for (const line of lines) {
      if (y < margin + 20) {
        page = pdfDoc.addPage([595.28, 841.89]);
        y = height - margin;
      }

      const trimmed = line.trim();
      if (trimmed.startsWith('#')) {
        const cleanHeader = trimmed.replace(/^#+\s*/, '');
        page.drawText(cleanHeader.substring(0, 80), {
          x: margin,
          y,
          size: 14,
          font: boldFont,
          color: rgb(0.09, 0.45, 0.45)
        });
        y -= lineHeight * 1.5;
      } else if (trimmed) {
        const sanitized = trimmed.replace(/[*_~`]/g, '');
        page.drawText(sanitized.substring(0, 95), {
          x: margin,
          y,
          size: 10,
          font,
          color: rgb(0.2, 0.2, 0.2)
        });
        y -= lineHeight;
      } else {
        y -= lineHeight * 0.5;
      }
    }

    const pdfBytes = await pdfDoc.save();

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${file.name}.pdf"`
      }
    });
  } catch (error: any) {
    console.error('Erro na conversão de Office:', error);
    return new Response(JSON.stringify({ error: error.message || 'Erro ao converter arquivo Office' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}