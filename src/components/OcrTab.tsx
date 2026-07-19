import { useState } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Loader as Loader2, ScanText, Copy, Check, Download, Search, CircleAlert as AlertCircle, FileSearch } from 'lucide-react';
import DropZone from './DropZone';
import ReviewForm from './ReviewForm';
import type { Translation } from '../lib/i18n';
import { saveAs } from 'file-saver';

interface OcrTabProps {
  t: Translation;
  onReviewSubmitted?: () => void;
}

async function loadPdfjs() {
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
  return pdfjs;
}

export default function OcrTab({ t, onReviewSubmitted }: OcrTabProps) {
  const [file, setFile] = useState<File | null>(null);
  const [lang, setLang] = useState('por');
  const [progress, setProgress] = useState(0);
  const [statusLabel, setStatusLabel] = useState('');
  const [ocrText, setOcrText] = useState('');
  const [busy, setBusy] = useState<'idle' | 'ocr' | 'searchable'>('idle');
  const [searchablePdf, setSearchablePdf] = useState<ArrayBuffer | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [showReview, setShowReview] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(ocrText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderPage = async (pdf: import('pdfjs-dist').PDFDocumentProxy, i: number) => {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport, canvas } as unknown as Parameters<typeof page.render>[0]).promise;
    return canvas;
  };

  const handleOcr = async () => {
    if (!file) return;
    setBusy('ocr');
    setProgress(0);
    setError('');
    setOcrText('');
    setShowReview(false);
    try {
      const Tesseract = await import('tesseract.js');
      const worker = await Tesseract.createWorker(lang, 1, {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === 'recognizing text') { setProgress(Math.round(m.progress * 100)); setStatusLabel(t.ocrRecognizing); }
        },
      });

      const ext = file.name.toLowerCase().split('.').pop();
      if (ext === 'pdf') {
        const pdfjs = await loadPdfjs();
        const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const canvas = await renderPage(pdf, i);
          const blob: Blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.9));
          setStatusLabel(`${t.ocrRecognizing} ${i}/${pdf.numPages}`);
          const { data } = await worker.recognize(blob as unknown as import('tesseract.js').ImageLike);
          fullText += data.text + '\n\n';
          setProgress(Math.round((i / pdf.numPages) * 100));
        }
        setOcrText(fullText.trim());
      } else {
        setStatusLabel(t.ocrRecognizing);
        const { data } = await worker.recognize(file as unknown as import('tesseract.js').ImageLike);
        setOcrText(data.text);
        setProgress(100);
      }
      await worker.terminate();
      setShowReview(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : t.convError);
    } finally {
      setBusy('idle');
    }
  };

  const handleSearchablePdf = async () => {
    if (!file || !file.name.toLowerCase().endsWith('.pdf')) return;
    setBusy('searchable');
    setProgress(0);
    setError('');
    setSearchablePdf(null);
    setShowReview(false);
    try {
      const Tesseract = await import('tesseract.js');
      const worker = await Tesseract.createWorker(lang, 1, {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === 'recognizing text') setProgress(Math.round(m.progress * 100));
        },
      });

      const pdfjs = await loadPdfjs();
      const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      for (let i = 1; i <= pdf.numPages; i++) {
        const canvas = await renderPage(pdf, i);
        const jpegBlob: Blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.85));
        const jpegBuf = await jpegBlob.arrayBuffer();
        setStatusLabel(`${t.ocrRecognizing} ${i}/${pdf.numPages}`);

        const { data } = await worker.recognize(jpegBlob as unknown as import('tesseract.js').ImageLike);
        const img = await pdfDoc.embedJpg(jpegBuf);
        const newPage = pdfDoc.addPage([img.width, img.height]);
        newPage.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });

        let y = img.height - 20;
        for (const line of data.text.split('\n')) {
          if (line.trim() && y > 0) {
            try { newPage.drawText(line.slice(0, 200), { x: 10, y, size: 4, font, color: rgb(1, 1, 1), opacity: 0.01 }); } catch { /* skip */ }
            y -= 6;
          }
        }
        setProgress(Math.round((i / pdf.numPages) * 100));
      }
      await worker.terminate();
      setSearchablePdf(await pdfDoc.save() as unknown as ArrayBuffer);
      setShowReview(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : t.convError);
    } finally {
      setBusy('idle');
    }
  };

  const downloadSearchablePdf = () => {
    if (searchablePdf) {
      const baseName = file?.name.replace(/\.[^/.]+$/, '') || 'searchable';
      saveAs(new Blob([searchablePdf], { type: 'application/pdf' }), `${baseName}_searchable.pdf`);
    }
  };

  const ocrLangs = [
    { code: 'por', label: 'Português' },
    { code: 'spa', label: 'Español' },
    { code: 'eng', label: 'English' },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">{t.ocrTitle}</h2>
        <p className="mt-2 text-sm text-slate-500">{t.ocrSubtitle}</p>
      </div>

      <DropZone onFile={setFile} title={t.ocrDropTitle} subtitle={t.ocrDropSubtitle} accept=".jpeg,.jpg,.png,.pdf" hasItems={!!file} accent="teal" />

      {file && (
        <div className="mt-5 space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">{t.ocrLanguage}</label>
            <div className="flex flex-wrap gap-2">
              {ocrLangs.map((l) => (
                <button key={l.code} onClick={() => setLang(l.code)} className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${lang === l.code ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button onClick={handleOcr} disabled={busy !== 'idle'} className="flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:opacity-60">
              {busy === 'ocr' ? <Loader2 size={18} className="animate-spin" /> : <ScanText size={18} />}
              {busy === 'ocr' ? t.ocrProcessing : t.ocrProcess}
            </button>
            <button onClick={handleSearchablePdf} disabled={busy !== 'idle' || !file.name.toLowerCase().endsWith('.pdf')} className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40">
              {busy === 'searchable' ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
              {busy === 'searchable' ? t.ocrSearchableGen : t.ocrSearchableBtn}
            </button>
          </div>

          {file.name.toLowerCase().endsWith('.pdf') && (
            <p className="flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
              <FileSearch size={15} className="mt-0.5 shrink-0 text-teal-600" />
              {t.ocrSearchableDesc}
            </p>
          )}

          {busy !== 'idle' && (
            <div>
              <div className="mb-1.5 flex justify-between text-xs text-slate-500">
                <span>{statusLabel || t.ocrProgress}</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-blue-500 transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {searchablePdf && (
            <div className="flex flex-col gap-3 rounded-xl bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-emerald-800">{t.ocrSearchable}</p>
              <button onClick={downloadSearchablePdf} className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700">
                <Download size={18} /> {t.ocrDownloadPdf}
              </button>
            </div>
          )}

          {ocrText && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">{t.ocrResult}</label>
                <button onClick={handleCopy} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${copied ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                  {copied ? t.ocrCopied : t.ocrCopy}
                </button>
              </div>
              <textarea value={ocrText} onChange={(e) => setOcrText(e.target.value)} placeholder={t.ocrResultPlaceholder} rows={10} className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200" />
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {showReview && <ReviewForm t={t} onSubmitted={onReviewSubmitted} />}
        </div>
      )}
    </div>
  );
}
