import JSZip from 'jszip';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { FileKind } from './fileUtils';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

let pdfjsReady: Promise<typeof import('pdfjs-dist')> | null = null;

async function loadPdfjs(): Promise<typeof import('pdfjs-dist')> {
  if (pdfjsReady) return pdfjsReady;
  pdfjsReady = (async () => {
    const pdfjs = await import('pdfjs-dist');
    pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
    return pdfjs;
  })();
  return pdfjsReady;
}

async function imageToPdfPages(file: File, pdf: PDFDocument): Promise<void> {
  const bytes = await file.arrayBuffer();
  const ext = file.name.toLowerCase().split('.').pop() || '';
  let img;
  if (ext === 'jpg' || ext === 'jpeg') { img = await pdf.embedJpg(bytes); }
  else if (ext === 'png') { img = await pdf.embedPng(bytes); }
  else {
    const bitmap = await createImageBitmap(new Blob([bytes]));
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width; canvas.height = bitmap.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(bitmap, 0, 0);
    const pngBlob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'));
    img = await pdf.embedPng(await pngBlob.arrayBuffer());
  }
  const page = pdf.addPage([img.width, img.height]);
  page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
}

export async function fileToPdfPages(file: File, pdf: PDFDocument, kind: FileKind): Promise<void> {
  switch (kind) {
    case 'image': await imageToPdfPages(file, pdf); break;
    case 'pdf': {
      const bytes = await file.arrayBuffer();
      const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const copied = await pdf.copyPages(src, src.getPageIndices());
      copied.forEach((p) => pdf.addPage(p));
      break;
    }
    case 'markdown': {
      const text = await file.text();
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      drawPlain(text, pdf, font);
      break;
    }
    case 'text': {
      const text = await file.text();
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      drawPlain(text, pdf, font);
      break;
    }
    default: {
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      const page = pdf.addPage([595, 842]);
      page.drawText(`[Archivo no soportado: ${file.name}]`, { x: 50, y: 800, size: 11, font });
    }
  }
}

function drawPlain(text: string, pdf: PDFDocument, font: Awaited<ReturnType<PDFDocument['embedFont']>>): void {
  const paragraphs = text.split(/\n+/);
  let y = 800; let page = pdf.addPage([595, 842]);
  for (const para of paragraphs) {
    const words = para.split(/\s+/).filter(Boolean);
    let line = '';
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(test, 11) > 500 && line) {
        page.drawText(line, { x: 50, y, size: 11, font, color: rgb(0.1, 0.1, 0.1) });
        y -= 16; line = word;
        if (y < 50) { page = pdf.addPage([595, 842]); y = 800; }
      } else { line = test; }
    }
    if (line) { page.drawText(line, { x: 50, y, size: 11, font, color: rgb(0.1, 0.1, 0.1) }); y -= 16; }
    y -= 4;
  }
}

const ENTITY_MAP: Record<string, string> = {
  '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'", '&#39;': "'", '&nbsp;': ' ',
};
function decodeEntities(s: string): string {
  return s.replace(/&(amp|lt|gt|quot|apos|nbsp|#\d+);/g, (m) => {
    if (m in ENTITY_MAP) return ENTITY_MAP[m];
    const num = m.match(/^&#(\d+);$/);
    return num ? String.fromCharCode(parseInt(num[1], 10)) : m;
  });
}

export async function extractPptxText(file: File): Promise<string> {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const slideFiles = Object.keys(zip.files)
    .filter((n) => /^ppt\/slides\/slide\d+\.xml$/i.test(n))
    .sort((a, b) => parseInt((a.match(/slide(\d+)/) || [])[1] || '0', 10) - parseInt((b.match(/slide(\d+)/) || [])[1] || '0', 10));
  const slides: string[] = [];
  for (const sf of slideFiles) {
    const xml = await zip.files[sf].async('string');
    const regex = /<a:t\b[^>]*>([\s\S]*?)<\/a:t>/g;
    const texts: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = regex.exec(xml)) !== null) { const t = decodeEntities(m[1].replace(/<[^>]+>/g, '')); if (t) texts.push(t); }
    if (texts.length) slides.push(texts.join(' '));
  }
  return slides.join('\n\n');
}

export async function extractDocxText(file: File): Promise<string> {
  const mammoth = await import('mammoth');
  const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  return result.value;
}

export async function extractDocxAsHtml(file: File): Promise<string> {
  const mammoth = await import('mammoth');
  const result = await mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() });
  return result.value;
}

export async function extractPptxAsHtml(file: File): Promise<string> {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const slideFiles = Object.keys(zip.files)
    .filter((n) => /^ppt\/slides\/slide\d+\.xml$/i.test(n))
    .sort((a, b) => parseInt((a.match(/slide(\d+)/) || [])[1] || '0', 10) - parseInt((b.match(/slide(\d+)/) || [])[1] || '0', 10));
  const parts: string[] = [];
  for (let i = 0; i < slideFiles.length; i++) {
    const xml = await zip.files[slideFiles[i]].async('string');
    const regex = /<a:t\b[^>]*>([\s\S]*?)<\/a:t>/g;
    const texts: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = regex.exec(xml)) !== null) { const t = decodeEntities(m[1].replace(/<[^>]+>/g, '')); if (t) texts.push(t); }
    parts.push(`<h2>Slide ${i + 1}</h2><p>${texts.join(' ')}</p>`);
  }
  return parts.join('');
}

export async function renderPdfPages(file: File, scale = 1.0): Promise<string[]> {
  const pdfjs = await loadPdfjs();
  const buf = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buf }).promise;
  const thumbnails: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width; canvas.height = viewport.height;
    const ctx = canvas.getContext('2d')!;
    await page.render({ canvasContext: ctx, viewport }).promise;
    thumbnails.push(canvas.toDataURL('image/png'));
  }
  return thumbnails;
}

export async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await loadPdfjs();
  const buf = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buf }).promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item) => 'str' in item ? item.str : '').join(' ') + '\n\n';
  }
  return text.trim();
}

export async function loadPdfDocument(file: File): Promise<PDFDocument> {
  const bytes = await file.arrayBuffer();
  return PDFDocument.load(bytes, { ignoreEncryption: true });
}
