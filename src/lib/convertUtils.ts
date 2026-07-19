import { PDFDocument } from 'pdf-lib';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import JSZip from 'jszip';
import { detectKind, baseName, type FileKind } from './fileUtils';
import { fileToPdfPages, extractPdfText, extractPptxAsHtml, extractDocxAsHtml, extractDocxText, extractPptxText } from './pdfUtils';
import { convertPptxToPdf, convertDocxToPdf, type ProgressInfo } from './visualConvert';

export type ConvertTarget = 'pdf' | 'docx' | 'md';
export type DownloadMode = 'unified' | 'separate';

export interface ConvertedFile {
  filename: string;
  blob: Blob;
  sourceName: string;
  text: string;
  html?: string;
  error?: string;
}

export interface BatchConvertResult {
  files: ConvertedFile[];
  successes: ConvertedFile[];
  failures: ConvertedFile[];
  unifiedBlob?: Blob;
  unifiedFilename?: string;
  zipBlob?: Blob;
  zipFilename?: string;
}

async function extractText(file: File): Promise<string> {
  const kind = detectKind(file);
  switch (kind) {
    case 'pdf': return extractPdfText(file);
    case 'docx': return extractDocxText(file);
    case 'pptx':
    case 'potx': return extractPptxText(file);
    case 'markdown':
    case 'text': return file.text();
    case 'image': return `[Imagen: ${file.name}]`;
    default: return `[Archivo: ${file.name}]`;
  }
}

async function extractHtml(file: File): Promise<string | undefined> {
  const kind = detectKind(file);
  switch (kind) {
    case 'docx': return extractDocxAsHtml(file);
    case 'pptx':
    case 'potx': return extractPptxAsHtml(file);
    case 'markdown': {
      const text = await file.text();
      return markdownToHtml(text);
    }
    case 'text': {
      const text = await file.text();
      return `<p>${escapeHtml(text).replace(/\n/g, '</p><p>')}</p>`;
    }
    default: return undefined;
  }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function markdownToHtml(md: string): string {
  const lines = md.split('\n');
  const html: string[] = [];
  let inList = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (/^#{1}\s/.test(trimmed)) { if (inList) { html.push('</ul>'); inList = false; } html.push(`<h1>${inlineMd(trimmed.replace(/^#\s/, ''))}</h1>`); }
    else if (/^#{2}\s/.test(trimmed)) { if (inList) { html.push('</ul>'); inList = false; } html.push(`<h2>${inlineMd(trimmed.replace(/^##\s/, ''))}</h2>`); }
    else if (/^#{3}\s/.test(trimmed)) { if (inList) { html.push('</ul>'); inList = false; } html.push(`<h3>${inlineMd(trimmed.replace(/^###\s/, ''))}</h3>`); }
    else if (/^[-*]\s/.test(trimmed)) { if (!inList) { html.push('<ul>'); inList = true; } html.push(`<li>${inlineMd(trimmed.replace(/^[-*]\s/, ''))}</li>`); }
    else if (trimmed === '') { if (inList) { html.push('</ul>'); inList = false; } html.push('<br>'); }
    else { if (inList) { html.push('</ul>'); inList = false; } html.push(`<p>${inlineMd(trimmed)}</p>`); }
  }
  if (inList) html.push('</ul>');
  return html.join('');
}

function inlineMd(s: string): string {
  return s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>').replace(/`(.+?)`/g, '<strong>$1</strong>');
}

async function convertSingleToPdf(file: File, kind: FileKind, onProgress?: (p: ProgressInfo) => void): Promise<Blob> {
  if (kind === 'docx') return convertDocxToPdf(file, onProgress);
  if (kind === 'pptx' || kind === 'potx') return convertPptxToPdf(file, onProgress);
  if (kind === 'image') {
    const pdf = await PDFDocument.create();
    await fileToPdfPages(file, pdf, 'image');
    const out = await pdf.save();
    return new Blob([out as unknown as BlobPart], { type: 'application/pdf' });
  }
  if (kind === 'pdf') {
    const bytes = await file.arrayBuffer();
    return new Blob([bytes], { type: 'application/pdf' });
  }
  const pdf = await PDFDocument.create();
  await fileToPdfPages(file, pdf, kind);
  const out = await pdf.save();
  return new Blob([out as unknown as BlobPart], { type: 'application/pdf' });
}

interface DocxToken { text: string; bold: boolean; italic: boolean; }
interface DocxBlock { type: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'li' | 'bullet' | 'quote'; tokens: DocxToken[]; indent: number; }

function parseHtmlToDocxBlocks(html: string): DocxBlock[] {
  const blocks: DocxBlock[] = [];
  const container = document.createElement('div');
  container.innerHTML = html;
  for (const node of Array.from(container.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) { const t = (node.textContent || '').trim(); if (t) blocks.push({ type: 'p', tokens: [{ text: t, bold: false, italic: false }], indent: 0 }); continue; }
    if (node.nodeType !== Node.ELEMENT_NODE) continue;
    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();
    const tokens = parseInlineDocxTokens(el.innerHTML);
    switch (tag) {
      case 'h1': blocks.push({ type: 'h1', tokens, indent: 0 }); break;
      case 'h2': blocks.push({ type: 'h2', tokens, indent: 0 }); break;
      case 'h3': blocks.push({ type: 'h3', tokens, indent: 0 }); break;
      case 'h4': case 'h5': case 'h6': blocks.push({ type: 'h4', tokens, indent: 0 }); break;
      case 'ul': case 'ol': {
        Array.from(el.children).filter((c) => c.tagName.toLowerCase() === 'li').forEach((li) => {
          blocks.push({ type: 'bullet', tokens: parseInlineDocxTokens(li.innerHTML), indent: 20 });
        });
        break;
      }
      case 'blockquote': blocks.push({ type: 'quote', tokens, indent: 20 }); break;
      case 'p': if (tokens.length) blocks.push({ type: 'p', tokens, indent: 0 }); break;
      case 'table': blocks.push(...parseTableToDocx(el)); break;
      case 'br': break;
      default: if (tokens.length) blocks.push({ type: 'p', tokens, indent: 0 });
    }
  }
  return blocks;
}

function parseInlineDocxTokens(html: string): DocxToken[] {
  const tokens: DocxToken[] = [];
  const regex = /<(strong|b|em|i)>([\s\S]*?)<\/\1>|([^<]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(html)) !== null) {
    if (m[3] !== undefined) { const t = decodeEntities(m[3]).replace(/<br\s*\/?>/gi, ' '); if (t) tokens.push({ text: t, bold: false, italic: false }); continue; }
    const tag = m[1].toLowerCase();
    const isBold = tag === 'strong' || tag === 'b';
    const isItalic = tag === 'em' || tag === 'i';
    for (const st of parseInlineDocxTokens(m[2])) tokens.push({ text: st.text, bold: st.bold || isBold, italic: st.italic || isItalic });
  }
  if (tokens.length === 0 && html) tokens.push({ text: decodeEntities(html), bold: false, italic: false });
  return tokens;
}

function parseTableToDocx(table: HTMLElement): DocxBlock[] {
  const blocks: DocxBlock[] = [];
  Array.from(table.querySelectorAll('tr')).forEach((row, ri) => {
    const cells = Array.from(row.children).filter((c) => ['td', 'th'].includes(c.tagName.toLowerCase()));
    const isHeader = ri === 0 && cells.some((c) => c.tagName.toLowerCase() === 'th');
    const cellTexts = cells.map((c) => c.textContent || '').join('  |  ');
    if (cellTexts.trim()) blocks.push({ type: isHeader ? 'h4' : 'p', tokens: [{ text: cellTexts, bold: isHeader, italic: false }], indent: 10 });
  });
  return blocks;
}

function decodeEntities(s: string): string {
  return s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&nbsp;/g, ' ').trim();
}

async function convertHtmlToDocx(html: string): Promise<Blob> {
  const blocks = parseHtmlToDocxBlocks(html);
  const paragraphs: Paragraph[] = [];
  for (const block of blocks) {
    const textRuns = block.tokens.map((t) => new TextRun({ text: t.text, bold: t.bold, italics: t.italic }));
    switch (block.type) {
      case 'h1': paragraphs.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: textRuns })); break;
      case 'h2': paragraphs.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: textRuns })); break;
      case 'h3': paragraphs.push(new Paragraph({ heading: HeadingLevel.HEADING_3, children: textRuns })); break;
      case 'h4': paragraphs.push(new Paragraph({ heading: HeadingLevel.HEADING_4, children: textRuns })); break;
      case 'bullet': paragraphs.push(new Paragraph({ bullet: { level: 0 }, children: textRuns, indent: { left: block.indent * 20 } })); break;
      case 'quote': paragraphs.push(new Paragraph({ children: textRuns, indent: { left: block.indent * 20 }, spacing: { before: 100, after: 100 } })); break;
      default: paragraphs.push(new Paragraph({ children: textRuns }));
    }
  }
  if (paragraphs.length === 0) paragraphs.push(new Paragraph({ children: [new TextRun('')] }));
  const doc = new Document({ sections: [{ properties: {}, children: paragraphs }] });
  return Packer.toBlob(doc);
}

function convertHtmlToMd(html: string): string {
  const container = document.createElement('div');
  container.innerHTML = html;
  const lines: string[] = [];
  for (const node of Array.from(container.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) { const t = (node.textContent || '').trim(); if (t) lines.push(t); continue; }
    if (node.nodeType !== Node.ELEMENT_NODE) continue;
    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();
    const text = el.textContent || '';
    switch (tag) {
      case 'h1': lines.push(`# ${text}`); break;
      case 'h2': lines.push(`## ${text}`); break;
      case 'h3': lines.push(`### ${text}`); break;
      case 'h4': case 'h5': case 'h6': lines.push(`#### ${text}`); break;
      case 'ul': case 'ol': Array.from(el.children).filter((c) => c.tagName.toLowerCase() === 'li').forEach((li) => lines.push(`- ${li.textContent || ''}`)); break;
      case 'blockquote': lines.push(`> ${text}`); break;
      case 'p': if (text.trim()) lines.push(text); break;
      case 'br': break;
      default: if (text.trim()) lines.push(text);
    }
    lines.push('');
  }
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

async function convertSingleFile(file: File, target: ConvertTarget, onProgress?: (p: ProgressInfo) => void): Promise<ConvertedFile> {
  const kind = detectKind(file);
  const text = await extractText(file);
  const html = await extractHtml(file);
  const name = baseName(file.name);
  let blob: Blob;
  let filename: string;
  switch (target) {
    case 'pdf': blob = await convertSingleToPdf(file, kind, onProgress); filename = `${name}.pdf`; break;
    case 'docx': blob = html ? await convertHtmlToDocx(html) : await convertHtmlToDocx(`<p>${escapeHtml(text)}</p>`); filename = `${name}.docx`; break;
    case 'md': blob = new Blob([html ? convertHtmlToMd(html) : text], { type: 'text/markdown' }); filename = `${name}.md`; break;
  }
  return { blob, filename, sourceName: file.name, text, html };
}

async function buildUnifiedPdf(files: File[]): Promise<Blob> {
  const pdf = await PDFDocument.create();
  for (const file of files) {
    const kind = detectKind(file);
    await fileToPdfPages(file, pdf, kind);
  }
  const out = await pdf.save();
  return new Blob([out as unknown as BlobPart], { type: 'application/pdf' });
}

async function buildUnifiedDocx(successes: ConvertedFile[]): Promise<Blob> {
  const allHtml = successes.map((f) => f.html || `<p>${escapeHtml(f.text)}</p>`).join('<br>');
  return convertHtmlToDocx(allHtml);
}

function buildUnifiedMd(successes: ConvertedFile[]): Blob {
  const allMd = successes.map((f) => (f.html ? convertHtmlToMd(f.html) : f.text)).join('\n\n---\n\n');
  return new Blob([allMd], { type: 'text/markdown' });
}

export async function convertBatch(
  files: File[],
  target: ConvertTarget,
  mode: DownloadMode,
  unifiedName: string,
  onProgress?: (fileIndex: number, info: ProgressInfo) => void
): Promise<BatchConvertResult> {
  const convertedFiles: ConvertedFile[] = [];
  const successes: ConvertedFile[] = [];
  const failures: ConvertedFile[] = [];

  for (let fi = 0; fi < files.length; fi++) {
    const file = files[fi];
    try {
      const converted = await convertSingleFile(file, target, (info) => onProgress?.(fi, info));
      convertedFiles.push(converted);
      successes.push(converted);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      const failed: ConvertedFile = {
        blob: new Blob([], { type: 'application/octet-stream' }),
        filename: '',
        sourceName: file.name,
        text: '',
        error: message,
      };
      convertedFiles.push(failed);
      failures.push(failed);
    }
  }

  const result: BatchConvertResult = { files: convertedFiles, successes, failures };

  if (mode === 'unified') {
    const goodFiles = files.filter((_, i) => !convertedFiles[i].error);
    if (target === 'pdf') {
      if (goodFiles.length > 0) {
        result.unifiedBlob = await buildUnifiedPdf(goodFiles);
        result.unifiedFilename = `${unifiedName}.pdf`;
      }
    } else if (target === 'docx') {
      result.unifiedBlob = await buildUnifiedDocx(successes);
      result.unifiedFilename = `${unifiedName}.docx`;
    } else {
      result.unifiedBlob = buildUnifiedMd(successes);
      result.unifiedFilename = `${unifiedName}.md`;
    }
  } else {
    if (successes.length > 1) {
      const zip = new JSZip();
      for (const cf of successes) zip.file(cf.filename, cf.blob);
      result.zipBlob = await zip.generateAsync({ type: 'blob' });
      result.zipFilename = `${unifiedName}.zip`;
    }
  }

  return result;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
