import { useState } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Loader as Loader2, ScanText, Copy, Check, Download, CircleAlert as AlertCircle } from 'lucide-react';
import DropZone from './DropZone';
import ReviewForm from './ReviewForm';
import { applyWatermarkToPdfDoc } from '../lib/watermark';
import { saveAs } from 'file-saver';

interface OcrTabProps {
  t?: any;
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

  // Função interna de segurança para evitar quebras por falta de strings de tradução
  const safeStr = (key: string, fallback: string): string => {
    if (t && typeof t === 'object' && key in t) {
      return t[key] || fallback;
    }
    return fallback;
  };

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
          if (m.status === 'recognizing text') { 
            setProgress(Math.round(m.progress * 100)); 
            setStatusLabel(safeStr('ocrRecognizing', 'Reconhecendo texto...')); 
          }
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
          setStatusLabel(`${safeStr('ocrRecognizing', 'Reconhecendo texto...')} ${i}/${pdf.numPages}`);
          const { data } = await worker.recognize(blob as unknown as import('tesseract.js').ImageLike);
          fullText += data.text + '\n\n';
          setProgress(Math.round((i / pdf.numPages) * 100));
        }
        setOcrText(fullText.trim());
      } else {
        setStatusLabel(safeStr('ocrRecognizing', 'Reconhecendo texto...'));
        const { data } = await worker.recognize(file as unknown as import('tesseract.js').ImageLike);
        setOcrText(data.text);
        setProgress(100);
      }
      await worker.terminate();
      setShowReview(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : safeStr('convError', 'Erro na conversão.'));
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
        setStatusLabel(`${safeStr('ocrRecognizing', 'Reconhecendo texto...')} ${i}/${pdf.numPages}`);

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
      await applyWatermarkToPdfDoc(pdfDoc);
      setSearchablePdf(await pdfDoc.save() as unknown as ArrayBuffer);
      setShowReview(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : safeStr('convError', 'Erro na conversão.'));
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
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">{safeStr('ocrTitle', 'Reconhecimento de Texto (OCR)')}</h2>
        <p className="mt-2 text-sm text-slate-500">{safeStr('ocrSubtitle', 'Extraia texto de imagens ou transforme PDFs digitalizados em pesquisáveis.')}</p>
      </div>

      <DropZone 
        onFile={setFile} 
        title={safeStr('ocrDropTitle', 'Escolha uma imagem ou arquivo PDF')} 
        subtitle={safeStr('ocrDropSubtitle', 'Arraste ou clique para carregar')} 
        accept=".jpeg,.jpg,.png,.pdf" 
        hasItems={!!file} 
        accent="teal" 
      />

      {file && (
        <div className="mt-5 space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="text-sm font-medium text-slate-700">
            Arquivo carregado: <span className="font-mono text-xs text-teal-600">{file.name}</span>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">{safeStr('ocrLanguage', 'Idioma do Documento')}</label>
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
              {busy === 'ocr' ? safeStr('ocrProcessing', 'Processando...') : safeStr('ocrProcess', 'Extrair Texto Puro')}
            </button>
            <button onClick={handleSearchablePdf} disabled={busy !== 'idle' || !file.name.toLowerCase().endsWith('.pdf')} className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60">
              {busy === 'searchable' ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
              {busy === 'searchable' ? safeStr('ocrProcessing', 'Processando...') : safeStr('ocrSearchable', 'Tornar PDF Pesquisável')}
            </button>
          </div>
        </div>
      )}

      {busy !== 'idle' && (
        <div className="mt-6 rounded-2xl border border-teal-100 bg-teal-50 p-4 text-center">
          <div className="text-sm font-medium text-teal-800 mb-2">{statusLabel}</div>
          <div className="w-full bg-teal-200 h-2 rounded-full overflow-hidden">
            <div className="bg-teal-600 h-2 transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="text-xs text-teal-600 mt-1">{progress}%</div>
