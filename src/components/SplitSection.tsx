import { useState } from 'react';
import { Loader as Loader2, Scissors, Download, CircleAlert as AlertCircle, FileText } from 'lucide-react';
import DropZone from './DropZone';
import FilePreview from './FilePreview';
import { renderPdfPages, loadPdfDocument } from '../lib/pdfUtils';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import { downloadBlob } from '../lib/convertUtils';
import type { Translation } from '../lib/i18n';

interface SplitSectionProps { t: Translation; }

export default function SplitSection({ t }: SplitSectionProps) {
  const [file, setFile] = useState<File | null>(null);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [cutPoints, setCutPoints] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (f: File) => {
    setFile(f); setThumbnails([]); setCutPoints([]); setError(''); setRendering(true);
    try { const thumbs = await renderPdfPages(f, 1.0); setThumbnails(thumbs); }
    catch (e) { setError(`${t.pdfSplitRenderError} ${e instanceof Error ? e.message : ''}`); }
    finally { setRendering(false); }
  };

  const toggleCut = (pageIndex: number) => {
    setCutPoints((prev) => prev.includes(pageIndex) ? prev.filter((p) => p !== pageIndex) : [...prev, pageIndex].sort((a, b) => a - b));
  };

  const handleSplit = async () => {
    if (!file || cutPoints.length === 0) return;
    setBusy(true); setError('');
    try {
      const srcDoc = await loadPdfDocument(file);
      const totalPages = srcDoc.getPageCount();
      const allCuts = [0, ...cutPoints, totalPages];
      const parts: { name: string; bytes: Uint8Array }[] = [];
      for (let i = 0; i < allCuts.length - 1; i++) {
        const partDoc = await PDFDocument.create();
        const indices: number[] = [];
        for (let p = allCuts[i]; p < allCuts[i + 1]; p++) indices.push(p);
        const copied = await partDoc.copyPages(srcDoc, indices);
        copied.forEach((p) => partDoc.addPage(p));
        parts.push({ name: `${t.pdfSplitPart}-${i + 1}.pdf`, bytes: await partDoc.save() });
      }
      if (parts.length === 1) { downloadBlob(new Blob([parts[0].bytes as unknown as BlobPart], { type: 'application/pdf' }), parts[0].name); }
      else { const zip = new JSZip(); parts.forEach((p) => zip.file(p.name, p.bytes)); downloadBlob(await zip.generateAsync({ type: 'blob' }), 'split-pdf.zip'); }
    } catch (e) { setError(`${t.pdfError} ${e instanceof Error ? e.message : ''}`); }
    finally { setBusy(false); }
  };

  const sortedCuts = [...cutPoints].sort((a, b) => a - b);

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">{t.pdfSplitHint}</p>
      {!file && <DropZone onFile={handleFile} accept="application/pdf,.pdf" title={t.pdfSplitDropTitle} subtitle={t.pdfSplitDropSubtitle} accent="teal" />}
      {file && (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-28 shrink-0"><FilePreview file={file} t={t} compact /></div>
            <div className="flex flex-1 flex-col gap-2">
              <p className="text-sm font-medium text-slate-700">{file.name} — {thumbnails.length} {t.pdfSplitPages}</p>
              <button onClick={() => { setFile(null); setThumbnails([]); setCutPoints([]); }} className="self-start rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-200">{t.pdfRemoveFile}</button>
            </div>
          </div>
          {rendering && <div className="flex items-center gap-2 rounded-xl bg-teal-50 p-4 text-sm text-teal-700"><Loader2 size={18} className="animate-spin" /> {t.pdfProcessing}</div>}
          {thumbnails.length > 0 && (
            <>
              <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-xs text-blue-800"><Scissors size={15} className="mt-0.5 shrink-0 text-blue-600" /><span>{t.pdfSplitClickHint}</span></div>
              <div className="space-y-1">
                {thumbnails.map((thumb, idx) => {
                  const isCut = cutPoints.includes(idx);
                  const isFirst = idx === 0;
                  const showStartLabel = isFirst || isCut;
                  return (
                    <div key={idx}>
                      {isCut && idx !== 0 && (<div className="relative my-1 flex items-center gap-2"><div className="h-0 flex-1 border-t-2 border-dashed border-red-500" /><span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">{t.pdfSplitCutHere}</span><div className="h-0 flex-1 border-t-2 border-dashed border-red-500" /></div>)}
                      <button onClick={() => toggleCut(idx)} className={`group flex w-full items-center gap-3 rounded-xl border-2 p-2 text-left transition ${isCut ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white hover:border-teal-300 hover:bg-teal-50'}`}>
                        <div className="relative shrink-0">
                          <img src={thumb} alt={`Page ${idx + 1}`} className="h-24 rounded-lg border border-slate-200 shadow-sm" />
                          {showStartLabel && <span className="absolute -left-1 -top-1 rounded-full bg-teal-600 px-1.5 py-0.5 text-[9px] font-bold text-white shadow">{isFirst ? t.pdfSplitStartDoc : `${t.pdfSplitPart} ${sortedCuts.indexOf(idx) + 2}`}</span>}
                        </div>
                        <div className="flex flex-1 flex-col gap-1">
                          <span className="flex items-center gap-1.5 text-sm font-medium text-slate-700"><FileText size={15} className="text-slate-400" />{idx + 1}</span>
                          <span className={`text-xs font-medium ${isCut ? 'text-red-600' : 'text-slate-400'}`}>{isCut ? t.pdfSplitCutHere : `→ ${t.pdfSplitPart} ${getPartNumber(idx, sortedCuts)}`}</span>
                        </div>
                        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition ${isCut ? 'border-red-500 bg-red-500 text-white' : 'border-slate-300 text-transparent group-hover:border-teal-400'}`}>✂</div>
                      </button>
                    </div>
                  );
                })}
              </div>
              {cutPoints.length === 0 && <p className="text-center text-xs text-amber-600">{t.pdfSplitNoCuts}</p>}
              {cutPoints.length > 0 && (
                <div className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 p-3">
                  <span className="text-xs text-slate-600">{cutPoints.length + 1} {t.pdfSplitPart}s</span>
                  <button onClick={handleSplit} disabled={busy} className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:opacity-50">
                    {busy ? <Loader2 size={17} className="animate-spin" /> : <Download size={17} />}{busy ? t.pdfSplitGenerating : cutPoints.length > 1 ? t.pdfSplitDownloadZip : t.pdfSplitDownloadParts}
                  </button>
                </div>
              )}
            </>
          )}
          {error && <div className="flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-700"><AlertCircle size={18} className="mt-0.5 shrink-0" /><span>{error}</span></div>}
        </div>
      )}
    </div>
  );
}

function getPartNumber(pageIndex: number, sortedCuts: number[]): number {
  let part = 1;
  for (const cut of sortedCuts) { if (pageIndex >= cut) part++; }
  return part;
}
