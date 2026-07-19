import { useState } from 'react';
import { Loader as Loader2, Plus, Download, CircleCheck as CheckCircle2, CircleAlert as AlertCircle } from 'lucide-react';
import DropZone from './DropZone';
import FilePreview from './FilePreview';
import { detectKind } from '../lib/fileUtils';
import { fileToPdfPages } from '../lib/pdfUtils';
import { convertDocxToPdf, convertPptxToPdf } from '../lib/visualConvert';
import { PDFDocument } from 'pdf-lib';
import { downloadBlob } from '../lib/convertUtils';
import type { Translation } from '../lib/i18n';

interface MergeSectionProps { t: Translation; }
const ACCEPTED = ['.pdf', '.jpg', '.jpeg', '.png', '.docx', '.pptx', '.potx', '.md', '.txt',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.presentationml.template',
  'text/plain', 'text/markdown', 'image/jpeg', 'image/png',
].join(',');

export default function MergeSection({ t }: MergeSectionProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleFiles = (newFiles: File[]) => { setFiles((prev) => [...prev, ...newFiles]); setError(''); setDone(false); };
  const removeFile = (idx: number) => { setFiles((prev) => prev.filter((_, i) => i !== idx)); setDone(false); };

  const handleMerge = async () => {
    if (files.length < 1) return;
    setBusy(true); setError(''); setDone(false);
    try {
      const pdf = await PDFDocument.create();
      for (const file of files) {
        const kind = detectKind(file);
        if (kind === 'docx') {
          const docxBlob = await convertDocxToPdf(file);
          const docxPdf = await PDFDocument.load(await docxBlob.arrayBuffer());
          const pages = await pdf.copyPages(docxPdf, docxPdf.getPageIndices());
          pages.forEach((p) => pdf.addPage(p));
        } else if (kind === 'pptx' || kind === 'potx') {
          const pptxBlob = await convertPptxToPdf(file);
          const pptxPdf = await PDFDocument.load(await pptxBlob.arrayBuffer());
          const pages = await pdf.copyPages(pptxPdf, pptxPdf.getPageIndices());
          pages.forEach((p) => pdf.addPage(p));
        } else {
          await fileToPdfPages(file, pdf, kind);
        }
      }
      const out = await pdf.save();
      downloadBlob(new Blob([out as unknown as BlobPart], { type: 'application/pdf' }), 'merged.pdf');
      setDone(true);
    } catch (e) { setError(`${t.pdfError} ${e instanceof Error ? e.message : ''}`); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">{t.pdfMergeHint}</p>
      <DropZone onFile={(f) => handleFiles([f])} onFiles={handleFiles} multiple accept={ACCEPTED} title={t.pdfMergeDropTitle} subtitle={t.pdfMergeDropSubtitle} accent="teal" hasItems={files.length > 0}>
        <div className="w-full space-y-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {files.map((f, i) => <FilePreview key={`${f.name}-${i}`} file={f} t={t} onRemove={() => removeFile(i)} compact />)}
          </div>
          <button onClick={(e) => { e.stopPropagation(); }} className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-teal-300 py-2 text-xs font-medium text-teal-600"><Plus size={14} /> {t.pdfAddFile}</button>
        </div>
      </DropZone>
      {files.length > 0 && (
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-slate-500">{files.length} {t.pdfFilesAdded}</span>
          <button onClick={handleMerge} disabled={busy} className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:opacity-50">
            {busy ? <Loader2 size={17} className="animate-spin" /> : <Download size={17} />}{busy ? t.pdfMergeConverting : t.pdfMergeCta}
          </button>
        </div>
      )}
      {done && <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-sm font-medium text-emerald-700"><CheckCircle2 size={18} /> {t.pdfMergeDone}</div>}
      {error && <div className="flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-700"><AlertCircle size={18} className="mt-0.5 shrink-0" /><span>{error}</span></div>}
    </div>
  );
}
