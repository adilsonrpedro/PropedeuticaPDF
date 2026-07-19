import { useState } from 'react';
import { Loader as Loader2, FileText, Copy, Check, CircleAlert as AlertCircle, Download, Layers, Scissors, FileType2, Repeat } from 'lucide-react';
import DropZone from './DropZone';
import FilePreview from './FilePreview';
import MergeSection from './MergeSection';
import SplitSection from './SplitSection';
import ConvertSection from './ConvertSection';
import { extractPdfText } from '../lib/pdfUtils';
import { downloadBlob } from '../lib/convertUtils';
import type { Translation } from '../lib/i18n';

interface PdfTabProps { t: Translation; }
type Mode = 'convert' | 'merge' | 'split' | 'extract';

export default function PdfTab({ t }: PdfTabProps) {
  const [mode, setMode] = useState<Mode>('convert');

  const modes: { id: Mode; label: string; icon: typeof Layers; hint: string }[] = [
    { id: 'convert', label: t.pdfConvert, icon: Repeat, hint: t.pdfConvertHint },
    { id: 'merge', label: t.pdfMerge, icon: Layers, hint: t.pdfMergeHint },
    { id: 'split', label: t.pdfSplit, icon: Scissors, hint: t.pdfSplitHint },
    { id: 'extract', label: t.pdfExtract, icon: FileText, hint: t.pdfExtractHint },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">{t.pdfTitle}</h2>
        <p className="mt-2 text-sm text-slate-500">{t.pdfSubtitle}</p>
      </div>
      <div className="mb-5">
        <p className="mb-2 text-sm font-medium text-slate-600">{t.pdfSelectMode}</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {modes.map(({ id, label, icon: Icon, hint }) => (
            <button key={id} onClick={() => setMode(id)} title={hint} className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-medium transition ${mode === id ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}>
              <Icon size={20} />{label}
            </button>
          ))}
        </div>
      </div>
      {mode === 'convert' && <ConvertSection t={t} />}
      {mode === 'merge' && <MergeSection t={t} />}
      {mode === 'split' && <SplitSection t={t} />}
      {mode === 'extract' && <ExtractSection t={t} />}
    </div>
  );
}

function ExtractSection({ t }: { t: Translation }) {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleFile = (f: File) => { setFile(f); setText(''); setError(''); };
  const handleExtract = async () => {
    if (!file) return;
    setBusy(true); setError('');
    try { setText((await extractPdfText(file)) || '(empty)'); }
    catch (e) { setError(`${t.pdfError} ${e instanceof Error ? e.message : ''}`); }
    finally { setBusy(false); }
  };
  const handleCopy = async () => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const handleDownloadTxt = () => { downloadBlob(new Blob([text], { type: 'text/plain' }), `${file?.name.replace(/\.[^/.]+$/, '') || 'extracted'}.txt`); };

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">{t.pdfExtractHint}</p>
      {!file && <DropZone onFile={handleFile} accept="application/pdf,.pdf" title={t.pdfSplitDropTitle} subtitle={t.pdfSplitDropSubtitle} accent="teal" />}
      {file && (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-28 shrink-0"><FilePreview file={file} t={t} compact /></div>
            <div className="flex flex-1 flex-col gap-2">
              <p className="truncate text-sm font-medium text-slate-700">{file.name}</p>
              <button onClick={() => { setFile(null); setText(''); }} className="self-start rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-200">{t.pdfRemoveFile}</button>
            </div>
          </div>
          <button onClick={handleExtract} disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:opacity-50">
            {busy ? <Loader2 size={18} className="animate-spin" /> : <FileType2 size={18} />}{busy ? t.pdfProcessing : t.pdfExtractCta}
          </button>
          {text && (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label className="text-sm font-medium text-slate-700">{t.pdfResult}</label>
                <div className="flex gap-2">
                  <button onClick={handleDownloadTxt} className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-200"><Download size={15} /> {t.pdfDownloadTxt}</button>
                  <button onClick={handleCopy} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${copied ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? t.pdfCopied : t.pdfCopy}</button>
                </div>
              </div>
              <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={t.pdfResultPlaceholder} rows={10} className="w-full resize-y rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm leading-relaxed text-slate-800 focus:outline-none" />
            </div>
          )}
          {error && <div className="flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-700"><AlertCircle size={18} className="mt-0.5 shrink-0" /><span>{error}</span></div>}
        </div>
      )}
    </div>
  );
}
