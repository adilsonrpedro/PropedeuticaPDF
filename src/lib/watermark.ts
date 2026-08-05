import { PDFDocument, degrees } from 'pdf-lib';

const LOGO_URL = '/file_000000003874720e8c35415ee6d4d0b6.png';

let cachedBytes: Promise<Uint8Array> | null = null;

async function fetchLogoBytes(): Promise<Uint8Array> {
  if (cachedBytes) return cachedBytes;
  cachedBytes = (async () => {
    const res = await fetch(LOGO_URL);
    const buf = await res.arrayBuffer();
    return new Uint8Array(buf);
  })();
  return cachedBytes;
}

let cachedDataUrl: Promise<string> | null = null;
async function fetchLogoDataUrl(): Promise<string> {
  if (cachedDataUrl) return cachedDataUrl;
  cachedDataUrl = (async () => {
    const bytes = await fetchLogoBytes();
    let b64 = '';
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      b64 += String.fromCharCode(...bytes.subarray(i, i + chunk));
    }
    return `data:image/png;base64,${btoa(b64)}`;
  })();
  return cachedDataUrl;
}

export async function applyWatermarkToPdfDoc(pdf: PDFDocument): Promise<void> {
  try {
    const bytes = await fetchLogoBytes();
    let img;
    try {
      img = await pdf.embedPng(bytes);
    } catch {
      img = await pdf.embedJpg(bytes);
    }
    for (const page of pdf.getPages()) {
      const { width, height } = page.getSize();
      const maxW = width * 0.3;
      const maxH = height * 0.3;
      const scale = Math.min(maxW / img.width, maxH / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      page.drawImage(img, {
        x: width / 2 - w / 2,
        y: height / 2 - h / 2,
        width: w,
        height: h,
        opacity: 0.12,
        rotate: degrees(0),
      });
    }
  } catch {
    // logo unavailable; skip silently
  }
}

export async function applyWatermarkToJsPdf(pdf: import('jspdf').jsPDF): Promise<void> {
  try {
    const dataUrl = await fetchLogoDataUrl();
    const props = pdf.getImageProperties(dataUrl);
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const maxW = pageW * 0.3;
    const maxH = pageH * 0.3;
    const scale = Math.min(maxW / props.width, maxH / props.height);
    const w = props.width * scale;
    const h = props.height * scale;
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.saveGraphicsState();
      pdf.setGState(pdf.GState({ opacity: 0.12 }));
      let format: 'PNG' | 'JPEG' = 'PNG';
      try {
        pdf.addImage(dataUrl, format, pageW / 2 - w / 2, pageH / 2 - h / 2, w, h, undefined, 'FAST');
      } catch {
        format = 'JPEG';
        pdf.addImage(dataUrl, format, pageW / 2 - w / 2, pageH / 2 - h / 2, w, h, undefined, 'FAST');
      }
      pdf.restoreGraphicsState();
    }
  } catch {
    // skip
  }
}

export { LOGO_URL };
