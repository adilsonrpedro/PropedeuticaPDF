import { useEffect, useRef, useState } from 'react';
import { FileText, FileType2, Presentation, FileCode2, Music, File } from 'lucide-react';
import { detectKind, formatSize, fileExtension } from '../lib/fileUtils';
import { renderPdfPages } from '../lib/pdfUtils';
import type { Translation } from '../lib/i18n';

interface FilePreviewProps {
  file: File;
  t: Translation;
  onRemove?: () => void;
  compact?: boolean;
}

export default function FilePreview({ file, t, onRemove, compact }: FilePreviewProps) {
  const kind = detectKind(file);
  const objectUrlRef = useRef('');
  const [pdfThumb, setPdfThumb] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState(false);
  const objectUrl = objectUrlRef.current || (objectUrlRef.current = URL.createObjectURL(file));

  useEffect(() => {
    if (kind === 'pdf' && !pdfThumb && !pdfError) {
      renderPdfPages(file, 0.5)
        .then((thumbs) => thumbs[0] && setPdfThumb(thumbs[0]))
        .catch(() => setPdfError(true));
    }
    return () => { if (objectUrlRef.current) { URL.revokeObjectURL(objectUrlRef.current); objectUrlRef.current = ''; } };
  }, [file, kind, pdfThumb, pdfError]);

  const ext = fileExtension(file.name);
  const sizeStr = formatSize(file.size);
  const docIcons: Record<string, typeof FileText> = { docx: FileType2, pptx: Presentation, potx: Presentation, markdown: FileCode2, text: FileCode2, unknown: File };
  const DocIcon = docIcons[kind] || FileText;

  return (
    <div className={`group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md ${compact ? '' : 'p-3'}`}>
      {onRemove && (
        <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-slate-400 shadow-sm transition hover:bg-red-50 hover:text-red-500" aria-label={t.pdfRemoveFile}>✕</button>
      )}
      <div className="flex flex-col items-center gap-2">
        {kind === 'image' && <img src={objectUrl} alt={file.name} className={`max-h-32 rounded-lg object-contain ${compact ? 'max-h-20' : ''}`} />}
        {kind === 'pdf' && (pdfThumb ? <img src={pdfThumb} alt={file.name} className={`max-h-32 rounded-lg border border-slate-100 shadow-sm ${compact ? 'max-h-20' : ''}`} /> : pdfError ? <div className="flex h-24 w-20 items-center justify-center rounded-lg bg-red-50 text-red-400"><FileText size={32} /></div> : <div className="flex h-24 w-20 items-center justify-center rounded-lg bg-slate-100"><div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-teal-500" /></div>)}
        {kind === 'audio' && (<div className="flex w-full flex-col items-center gap-1.5"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-teal-500"><Music size={24} /></div><audio src={objectUrl} controls className="w-full" style={{ height: 32 }} /></div>)}
        {kind === 'video' && <video src={objectUrl} controls className="max-h-32 w-full rounded-lg" />}
        {(kind === 'docx' || kind === 'pptx' || kind === 'potx' || kind === 'markdown' || kind === 'text' || kind === 'unknown') && (<div className="flex flex-col items-center gap-1.5"><div className="flex h-16 w-16 items-center justify-center rounded-xl bg-blue-50 text-blue-500"><DocIcon size={32} /></div><span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">{ext}</span></div>)}
        <div className="w-full text-center">
          <p className="truncate text-xs font-medium text-slate-700" title={file.name}>{file.name}</p>
          {!compact && <p className="mt-0.5 text-[10px] text-slate-400">{ext} · {sizeStr}</p>}
        </div>
      </div>
    </div>
  );
}
