import JSZip from 'jszip';
import { jsPDF } from 'jspdf';

export interface ProgressInfo { phase: string; percent: number; }

const EMU_PER_PX = 9525;
const SLIDE_W_PX = 960;
const SLIDE_H_PX = 540;
const A4_W_MM = 210;
const A4_H_MM = 297;
const A4_MARGIN_MM = 15;

function emuToPx(emu: number): number { return emu / EMU_PER_PX; }

interface PptxTextRun { text: string; bold: boolean; italic: boolean; underline: boolean; strike: boolean; size: number; color: string; }
interface PptxParagraph { runs: PptxTextRun[]; align: string; bullet: boolean; level: number; }
interface PptxTextBody { paragraphs: PptxParagraph[]; }
interface PptxShape {
  type: 'text' | 'image';
  left: number; top: number; width: number; height: number;
  textBody?: PptxTextBody;
  imageRelId?: string;
  rotation?: number;
  fill?: string;
  line?: string;
}
interface PptxSlide { shapes: PptxShape[]; bgImageRelId?: string; }

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

function getAttr(xml: string, attr: string): number | undefined {
  const re = new RegExp(`\\b${attr}="(-?\\d+)"`);
  const m = xml.match(re);
  return m ? parseInt(m[1], 10) : undefined;
}
function getColorFromFill(xml: string): string | undefined {
  const m = xml.match(/<a:srgbClr val="([0-9A-Fa-f]{6})"/);
  return m ? '#' + m[1] : undefined;
}
function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function parseTextRuns(pXml: string): PptxTextRun[] {
  const runs: PptxTextRun[] = [];
  const rRegex = /<a:r\b[\s\S]*?<\/a:r>/g;
  let m: RegExpExecArray | null;
  while ((m = rRegex.exec(pXml)) !== null) {
    const rXml = m[0];
    const rPrMatch = rXml.match(/<a:rPr\b([^>]*)\/?>/);
    let bold = false, italic = false, underline = false, strike = false, size = 0, color = '';
    if (rPrMatch) {
      const attrs = rPrMatch[1];
      bold = /b="1"/.test(attrs);
      italic = /i="1"/.test(attrs);
      underline = /u="(?!none)[^"]*"/.test(attrs);
      strike = /strike="(?!noStrike)[^"]*"/.test(attrs);
      const sz = attrs.match(/sz="(\d+)"/);
      size = sz ? parseInt(sz[1], 10) / 100 : 0;
      color = getColorFromFill(rXml) || '';
    }
    const tMatch = rXml.match(/<a:t\b[^>]*>([\s\S]*?)<\/a:t>/);
    if (tMatch) {
      const text = decodeEntities(tMatch[1].replace(/<[^>]+>/g, ''));
      if (text) runs.push({ text, bold, italic, underline, strike, size, color });
    }
  }
  return runs;
}

function parseParagraphs(bodyXml: string): PptxParagraph[] {
  const paragraphs: PptxParagraph[] = [];
  const pRegex = /<a:p\b[\s\S]*?<\/a:p>/g;
  let m: RegExpExecArray | null;
  while ((m = pRegex.exec(bodyXml)) !== null) {
    const pXml = m[0];
    const pPrMatch = pXml.match(/<a:pPr\b([^>]*)\/?>/);
    let align = 'left', bullet = false, level = 0;
    if (pPrMatch) {
      const attrs = pPrMatch[1];
      const algn = attrs.match(/algn="([^"]+)"/);
      align = algn ? algn[1] : 'left';
      bullet = /<a:buChar|<a:buAutoNum/.test(pXml);
      const lvl = attrs.match(/level="(\d+)"/);
      level = lvl ? parseInt(lvl[1], 10) : 0;
    }
    const runs = parseTextRuns(pXml);
    if (runs.length > 0) paragraphs.push({ runs, align, bullet, level });
  }
  return paragraphs;
}

function parseSlideXml(xml: string): PptxSlide {
  const shapes: PptxShape[] = [];
  let bgImageRelId: string | undefined;

  const bgMatch = xml.match(/<p:bg\b[\s\S]*?<a:blip[^>]*r:embed="([^"]+)"/);
  if (bgMatch) bgImageRelId = bgMatch[1];

  const spRegex = /<p:sp\b[\s\S]*?<\/p:sp>/g;
  let m: RegExpExecArray | null;
  while ((m = spRegex.exec(xml)) !== null) {
    const spXml = m[0];
    const spPrMatch = spXml.match(/<p:spPr\b([\s\S]*?)<\/p:spPr>/);
    if (!spPrMatch) continue;
    const spPr = spPrMatch[1];
    const xfrmMatch = spPr.match(/<a:xfrm\b([\s\S]*?)<\/a:xfrm>/);
    if (!xfrmMatch) continue;
    const xfrm = xfrmMatch[1];
    const offMatch = xfrm.match(/<a:off\b([^>]*)\/?>/);
    const extMatch = xfrm.match(/<a:ext\b([^>]*)\/?>/);
    const left = offMatch ? getAttr(offMatch[1], 'cx') || 0 : 0;
    const top = offMatch ? getAttr(offMatch[1], 'cy') || 0 : 0;
    const width = extMatch ? getAttr(extMatch[1], 'cx') || 0 : 0;
    const height = extMatch ? getAttr(extMatch[1], 'cy') || 0 : 0;
    const rotationMatch = xfrm.match(/rot="(-?\d+)"/);
    const rotation = rotationMatch ? parseInt(rotationMatch[1], 10) / 60000 : undefined;
    const fill = getColorFromFill(spPr);
    const lineMatch = spPr.match(/<a:ln\b[\s\S]*?<a:solidFill[\s\S]*?<a:srgbClr val="([0-9A-Fa-f]{6})"/);
    const line = lineMatch ? '#' + lineMatch[1] : undefined;

    const txBodyMatch = spXml.match(/<p:txBody\b([\s\S]*?)<\/p:txBody>/);
    if (txBodyMatch) {
      const paragraphs = parseParagraphs(txBodyMatch[1]);
      if (paragraphs.length > 0 && paragraphs.some((p) => p.runs.some((r) => r.text.trim()))) {
        shapes.push({ type: 'text', left, top, width, height, textBody: { paragraphs }, rotation, fill, line });
      }
    }
  }

  const picRegex = /<p:pic\b[\s\S]*?<\/p:pic>/g;
  let picM: RegExpExecArray | null;
  while ((picM = picRegex.exec(xml)) !== null) {
    const picXml = picM[0];
    const xfrmMatch = picXml.match(/<a:xfrm\b([\s\S]*?)<\/a:xfrm>/);
    if (!xfrmMatch) continue;
    const xfrm = xfrmMatch[1];
    const offMatch = xfrm.match(/<a:off\b([^>]*)\/?>/);
    const extMatch = xfrm.match(/<a:ext\b([^>]*)\/?>/);
    const left = offMatch ? getAttr(offMatch[1], 'cx') || 0 : 0;
    const top = offMatch ? getAttr(offMatch[1], 'cy') || 0 : 0;
    const width = extMatch ? getAttr(extMatch[1], 'cx') || 0 : 0;
    const height = extMatch ? getAttr(extMatch[1], 'cy') || 0 : 0;
    const blipMatch = picXml.match(/<a:blip[^>]*r:embed="([^"]+)"/);
    if (blipMatch) {
      shapes.push({ type: 'image', left, top, width, height, imageRelId: blipMatch[1] });
    }
  }

  shapes.sort((a, b) => a.top - b.top);
  return { shapes, bgImageRelId };
}

function buildSlideHtml(slide: PptxSlide, images: Record<string, string>, slideIndex: number): string {
  const bgStyle = slide.bgImageRelId && images[slide.bgImageRelId]
    ? `background-image:url(${images[slide.bgImageRelId]});background-size:cover;background-position:center;`
    : 'background:#ffffff;';

  let shapesHtml = '';
  for (const shape of slide.shapes) {
    const left = emuToPx(shape.left);
    const top = emuToPx(shape.top);
    const width = emuToPx(shape.width);
    const height = emuToPx(shape.height);
    const rotate = shape.rotation ? `transform:rotate(${shape.rotation}deg);` : '';
    const fillStyle = shape.fill ? `background:${shape.fill};` : '';
    const borderStyle = shape.line ? `border:1px solid ${shape.line};` : '';

    if (shape.type === 'image' && shape.imageRelId && images[shape.imageRelId]) {
      shapesHtml += `<img src="${images[shape.imageRelId]}" style="position:absolute;left:${left}px;top:${top}px;width:${width}px;height:${height}px;object-fit:contain;${rotate}" />`;
    } else if (shape.type === 'text' && shape.textBody) {
      let parasHtml = '';
      for (const para of shape.textBody.paragraphs) {
        const align = para.align === 'ctr' ? 'center' : para.align === 'r' ? 'right' : 'left';
        const indent = para.level * 20;
        const bulletPrefix = para.bullet ? '• ' : '';
        let runsHtml = '';
        for (const run of para.runs) {
          let s = escapeHtml(run.text);
          if (run.bold) s = `<strong>${s}</strong>`;
          if (run.italic) s = `<em>${s}</em>`;
          if (run.underline) s = `<u>${s}</u>`;
          if (run.strike) s = `<s>${s}</s>`;
          const colorStyle = run.color ? `color:${run.color};` : '';
          const sizeStyle = run.size > 0 ? `font-size:${run.size}px;` : '';
          runsHtml += `<span style="${colorStyle}${sizeStyle}">${s}</span>`;
        }
        parasHtml += `<div style="text-align:${align};margin:0 0 4px 0;padding-left:${indent}px;line-height:1.3;">${bulletPrefix}${runsHtml}</div>`;
      }
      shapesHtml += `<div style="position:absolute;left:${left}px;top:${top}px;width:${width}px;height:${height}px;overflow:hidden;box-sizing:border-box;padding:8px;${fillStyle}${borderStyle}${rotate}font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#222;">${parasHtml}</div>`;
    }
  }

  return `<div data-slide="${slideIndex}" style="position:relative;width:${SLIDE_W_PX}px;height:${SLIDE_H_PX}px;${bgStyle}overflow:hidden;">${shapesHtml}</div>`;
}

async function renderHtmlToCanvas(html: string, width: number, height: number): Promise<HTMLCanvasElement> {
  const container = document.createElement('div');
  container.style.cssText = `position:fixed;left:-99999px;top:0;width:${width}px;height:${height}px;background:#fff;`;
  container.innerHTML = html;
  document.body.appendChild(container);
  await new Promise((r) => setTimeout(r, 100));
  const html2canvas = (await import('html2canvas')).default;
  const canvas = await html2canvas(container.firstElementChild as HTMLElement, {
    scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false, width, height,
  });
  document.body.removeChild(container);
  return canvas;
}

export async function convertPptxToPdf(
  file: File,
  onProgress?: (p: ProgressInfo) => void
): Promise<Blob> {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  onProgress?.({ phase: 'Parsing PPTX structure', percent: 5 });

  const images: Record<string, string> = {};
  const relsFiles = Object.keys(zip.files).filter((n) => /^ppt\/slides\/_rels\/slide\d+\.xml\.rels$/i.test(n));
  for (const relsPath of relsFiles) {
    const relsXml = await zip.files[relsPath].async('string');
    const relRegex = /<Relationship\s+Id="([^"]+)"[^>]*Target="([^"]+)"/g;
    let rm: RegExpExecArray | null;
    while ((rm = relRegex.exec(relsXml)) !== null) {
      const id = rm[1];
      let target = rm[2];
      if (!/\.(png|jpe?g|gif|bmp|webp)$/i.test(target)) continue;
      if (target.startsWith('..')) target = 'ppt/' + target.replace(/^\.\.\//, '');
      else if (!target.startsWith('ppt/')) target = 'ppt/slides/' + target;
      const imgFile = zip.file(target);
      if (imgFile) {
        const blob = await imgFile.async('blob');
        images[id] = URL.createObjectURL(new Blob([blob], { type: 'image/png' }));
      }
    }
  }

  const presentationXml = await zip.file('ppt/presentation.xml')?.async('string') || '';
  const relsXml = await zip.file('ppt/_rels/presentation.xml.rels')?.async('string') || '';

  let slideTargets: string[] = [];
  const relMap: Record<string, string> = {};
  const relRegex = /<Relationship\s+Id="([^"]+)"[^>]*Target="([^"]+)"/g;
  let rm: RegExpExecArray | null;
  while ((rm = relRegex.exec(relsXml)) !== null) relMap[rm[1]] = rm[2];
  const sldIdLstMatch = presentationXml.match(/<p:sldIdLst>([\s\S]*?)<\/p:sldIdLst>/);
  if (sldIdLstMatch) {
    const sldIdRegex = /r:id="([^"]+)"/g;
    let sm: RegExpExecArray | null;
    while ((sm = sldIdRegex.exec(sldIdLstMatch[1])) !== null) {
      const t = relMap[sm[1]];
      if (t) slideTargets.push(t);
    }
  }
  if (slideTargets.length === 0) {
    slideTargets = Object.keys(zip.files)
      .filter((n) => /^ppt\/slides\/slide\d+\.xml$/i.test(n))
      .sort((a, b) => parseInt((a.match(/slide(\d+)/) || [])[1] || '0', 10) - parseInt((b.match(/slide(\d+)/) || [])[1] || '0', 10))
      .map((p) => p.replace(/^ppt\//, ''));
  }

  const slides: PptxSlide[] = [];
  for (let i = 0; i < slideTargets.length; i++) {
    let path = slideTargets[i].startsWith('/') ? slideTargets[i].slice(1) : `ppt/${slideTargets[i]}`;
    const slideFile = zip.file(path) || zip.file(`ppt/slides/${slideTargets[i].replace(/^slides\//, '')}`);
    if (!slideFile) continue;
    const xml = await slideFile.async('string');
    const relsPath = `ppt/slides/_rels/${path.split('/').pop()}.rels`;
    const slideRelsXml = await zip.file(relsPath)?.async('string') || '';
    const slideRelMap: Record<string, string> = {};
    const srRegex = /<Relationship\s+Id="([^"]+)"[^>]*Target="([^"]+)"/g;
    let srm: RegExpExecArray | null;
    while ((srm = srRegex.exec(slideRelsXml)) !== null) slideRelMap[srm[1]] = srm[2];
    try {
      slides.push(parseSlideXml(xml));
    } catch {
      slides.push({ shapes: [] });
    }
    onProgress?.({ phase: `Parsing slide ${i + 1}/${slideTargets.length}`, percent: 5 + Math.round(((i + 1) / slideTargets.length) * 25) });
  }

  if (slides.length === 0) throw new Error('No slides found in PPTX');

  const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: [SLIDE_W_PX, SLIDE_H_PX] });

  for (let i = 0; i < slides.length; i++) {
    try {
      const html = buildSlideHtml(slides[i], images, i);
      const canvas = await renderHtmlToCanvas(html, SLIDE_W_PX, SLIDE_H_PX);
      const imgData = canvas.toDataURL('image/jpeg', 0.92);
      if (i > 0) pdf.addPage([SLIDE_W_PX, SLIDE_H_PX], 'landscape');
      pdf.addImage(imgData, 'JPEG', 0, 0, SLIDE_W_PX, SLIDE_H_PX);
    } catch {
      if (i > 0) pdf.addPage([SLIDE_W_PX, SLIDE_H_PX], 'landscape');
      pdf.setTextColor(150);
      pdf.setFontSize(14);
      pdf.text(`Slide ${i + 1} - contenido no disponible`, 40, 40);
    }
    onProgress?.({ phase: `Rendering slide ${i + 1}/${slides.length}`, percent: 30 + Math.round(((i + 1) / slides.length) * 65) });
  }

  Object.values(images).forEach((url) => URL.revokeObjectURL(url));
  onProgress?.({ phase: 'Finalizing PDF', percent: 100 });
  return pdf.output('blob');
}

export async function convertDocxToPdf(
  file: File,
  onProgress?: (p: ProgressInfo) => void
): Promise<Blob> {
  onProgress?.({ phase: 'Extracting DOCX content', percent: 5 });
  const mammoth = await import('mammoth');
  const result = await mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() });
  let html = result.value;
  onProgress?.({ phase: 'Building document layout', percent: 20 });

  const docStyles = `
    <style>
      body { font-family: 'Times New Roman', Georgia, serif; font-size: 12pt; color: #222; line-height: 1.6; }
      h1 { font-size: 22pt; font-weight: bold; margin: 18px 0 10px; color: #111; }
      h2 { font-size: 18pt; font-weight: bold; margin: 16px 0 8px; color: #111; }
      h3 { font-size: 14pt; font-weight: bold; margin: 14px 0 6px; color: #222; }
      h4, h5, h6 { font-size: 12pt; font-weight: bold; margin: 10px 0 4px; }
      p { margin: 0 0 8px 0; text-align: justify; }
      ul, ol { margin: 0 0 8px 0; padding-left: 24px; }
      li { margin: 0 0 4px 0; }
      table { border-collapse: collapse; width: 100%; margin: 8px 0; }
      th, td { border: 1px solid #999; padding: 4px 8px; font-size: 11pt; }
      th { background: #eee; font-weight: bold; }
      blockquote { border-left: 3px solid #ccc; padding-left: 12px; margin: 8px 0; color: #555; }
      img { max-width: 100%; }
      strong, b { font-weight: bold; }
      em, i { font-style: italic; }
      u { text-decoration: underline; }
    </style>`;

  const contentWidthPx = ((A4_W_MM - A4_MARGIN_MM * 2) / 25.4) * 96;
  const wrapper = document.createElement('div');
  wrapper.style.cssText = `position:fixed;left:-99999px;top:0;width:${contentWidthPx}px;background:#fff;padding:0;`;
  wrapper.innerHTML = `${docStyles}<div class="doc-body">${html}</div>`;
  document.body.appendChild(wrapper);
  await new Promise((r) => setTimeout(r, 100));

  const html2canvas = (await import('html2canvas')).default;
  const docBody = wrapper.querySelector('.doc-body') as HTMLElement;

  const contentHeightPx = docBody.scrollHeight;

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const canvas = await html2canvas(docBody, {
    scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false, width: contentWidthPx, height: contentHeightPx, windowWidth: contentWidthPx,
  });
  document.body.removeChild(wrapper);

  onProgress?.({ phase: 'Rendering PDF pages', percent: 50 });

  const canvasW = canvas.width;
  const canvasH = canvas.height;
  const pdfContentW = A4_W_MM - A4_MARGIN_MM * 2;
  const pdfContentH = A4_H_MM - A4_MARGIN_MM * 2;
  const pxPerMm = canvasW / pdfContentW;
  const sliceHeightPx = Math.floor(pdfContentH * pxPerMm);
  const numPages = Math.ceil(canvasH / sliceHeightPx);

  for (let i = 0; i < numPages; i++) {
    const srcY = i * sliceHeightPx;
    const sliceH = Math.min(sliceHeightPx, canvasH - srcY);
    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = canvasW;
    pageCanvas.height = sliceH;
    const ctx = pageCanvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasW, sliceH);
    ctx.drawImage(canvas, 0, srcY, canvasW, sliceH, 0, 0, canvasW, sliceH);
    const imgData = pageCanvas.toDataURL('image/jpeg', 0.92);
    if (i > 0) pdf.addPage('a4', 'portrait');
    pdf.addImage(imgData, 'JPEG', A4_MARGIN_MM, A4_MARGIN_MM, pdfContentW, (sliceH / pxPerMm));
    onProgress?.({ phase: `Writing page ${i + 1}/${numPages}`, percent: 50 + Math.round(((i + 1) / numPages) * 45) });
  }

  onProgress?.({ phase: 'Finalizing PDF', percent: 100 });
  return pdf.output('blob');
}
