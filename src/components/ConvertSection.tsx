import { useState } from 'react';
import { Loader as Loader2, Download, CircleCheck as CheckCircle2, CircleAlert as AlertCircle, FileText, FileType2, FileCode2, Plus, Package, Layers, Clock, Eye } from 'lucide-react';
import DropZone from './DropZone';
import FilePreview from './FilePreview';
import { convertBatch, downloadBlob, type ConvertTarget, type DownloadMode, type ConvertedFile } from '../lib/convertUtils';
import { ACCEPTED_CONVERT, baseName, fileExtension, detectKind } from '../lib/fileUtils';
import type { Translation } from '../lib/i18n';
import type { ProgressInfo } from '../lib/visualConvert';

interface ConvertSectionProps { t: Translation; }

type FileStatus = 'pending' | 'converting' | 'done' | 'error';

interface FileState {
  file: File;
  status: FileStatus;
  converted?: ConvertedFile;
  progress?: ProgressInfo;
}

export default function ConvertSection({ t }: ConvertSectionProps) {
  const [fileStates, setFileStates] = useState<FileState[]>([]);
  const [target, setTarget] = useState<ConvertTarget>('pdf');
  const [downloadMode, setDownloadMode] = useState<DownloadMode>('separate');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [progressIdx, setProgressIdx] = useState(0);
  const [summary, setSummary] = useState<{ ok: number; fail: number; total: number } | null>(null);

  const handleFiles = (newFiles: File[]) => {
    setFileStates((prev) => [...prev, ...newFiles.map((f) => ({ file: f, status: 'pending' as FileStatus }))]);
    setDone(false);
    setError('');
    setSummary(null);
  };
  const removeFile = (idx: number) => {
    setFileStates((prev) => prev.filter((_, i) => i !== idx));
    setDone(false);
    setSummary(null);
  };

  const handleConvert = async () => {
    if (fileStates.length === 0) return;
    setBusy(true);
    setError('');
    setDone(false);
    setSummary(null);
    const files = fileStates.map((fs) => fs.file);

    try {
      const result = await convertBatch(files, target, downloadMode, t.pdfConvertUnifiedName, (fileIndex, info) => {
        setProgressIdx(fileIndex);
        setFileStates((prev) => prev.map((fs, idx) => {
          if (idx !== fileIndex) return fs;
          return { ...fs, status: 'converting' as FileStatus, progress: info };
        }));
      });

      setFileStates((prev) => prev.map((fs, idx) => {
        const converted = result.files[idx];
        if (!converted) return fs;
        return { ...fs, status: converted.error ? ('error' as FileStatus) : ('done' as FileStatus), converted, progress: undefined };
      }));

      setSummary({ ok: result.successes.length, fail: result.failures.length, total: files.length });

      if (downloadMode === 'unified' && result.unifiedBlob && result.unifiedFilename) {
        downloadBlob(result.unifiedBlob, result.unifiedFilename);
      } else if (result.zipBlob && result.zipFilename) {
        downloadBlob(result.zipBlob, result.zipFilename);
      } else if (result.successes.length === 1) {
        downloadBlob(result.successes[0].blob, result.successes[0].filename);
      }

      setDone(true);
    } catch (e) {
      setError(`${t.pdfError} ${e instanceof Error ? e.message : ''}`);
      setFileStates((prev) => prev.map((fs) => fs.status === 'converting' ? { ...fs, status: 'error' as FileStatus } : fs));
    } finally {
      setBusy(false);
      setProgressIdx(0);
    }
  };

  const handleDownloadOne = (cf: ConvertedFile) => {
    downloadBlob(cf.blob, cf.filename);
  };

  const targets: { id: ConvertTarget; label: string; icon: typeof FileText }[] = [
    { id: 'pdf', label: t.pdfConvertToPdf, icon: FileText },
    { id: 'docx', label: t.pdfConvertToDocx, icon: FileType2 },
    { id: 'md', label: t.pdfConvertToMd, icon: FileCode2 },
  ];

  const modes: { id: DownloadMode; label: string; hint: string; icon: typeof Layers }[] = [
    { id: 'separate', label: t.pdfConvertSeparate, hint: t.pdfConvertSeparateHint, icon: Package },
    { id: 'unified', label: t.pdfConvertUnified, hint: t.pdfConvertUnifiedHint, icon: Layers },
  ];

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">{t.pdfConvertHint}</p>

      <DropZone onFile={(f) => handleFiles([f])} onFiles={handleFiles} multiple accept={ACCEPTED_CONVERT} title={t.pdfConvertDropTitle} subtitle={t.pdfConvertDropSubtitle} accent="teal" hasItems={fileStates.length > 0}>
        <div className="w-full space-y-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {fileStates.map((fs, i) => (
              <FilePreview key={`${fs.file.name}-${i}`} file={fs.file} t={t} onRemove={() => removeFile(i)} compact />
            ))}
          </div>
          <button onClick={(e) => { e.stopPropagation(); }} className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-teal-300 py-2 text-xs font-medium text-teal-600">
            <Plus size={14} /> {t.pdfAddFile}
          </button>
        </div>
      </DropZone>

      {fileStates.length > 0 && (
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div>
            <p className="mb-2 text-sm font-medium text-slate-600">{t.pdfConvertTarget}</p>
            <div className="grid grid-cols-3 gap-2">
              {targets.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => { setTarget(id); setDone(false); }} className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-medium transition ${target === id ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}>
                  <Icon size={18} /> {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-600">{t.pdfConvertDownloadMode}</p>
            <div className="grid grid-cols-2 gap-2">
              {modes.map(({ id, label, hint, icon: Icon }) => (
                <button key={id} onClick={() => { setDownloadMode(id); setDone(false); }} className={`flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition ${downloadMode === id ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}>
                  <span className="flex items-center gap-2 text-sm font-medium"><Icon size={16} /> {label}</span>
                  <span className="text-xs text-slate-400">{hint}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-slate-500">{fileStates.length} {t.pdfFilesAdded}</span>
            <button onClick={handleConvert} disabled={busy} className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:opacity-50">
              {busy ? <Loader2 size={17} className="animate-spin" /> : <Download size={17} />}
              {busy ? t.pdfConvertConverting : t.pdfConvertCta}
            </button>
          </div>

          {busy && (
            <div className="space-y-3 rounded-xl bg-teal-50 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-teal-700">
                <Clock size={16} className="text-teal-600" />
                {t.pdfConvertProgress.replace('{n}', String(progressIdx + 1)).replace('{total}', String(fileStates.length))}
              </div>
              {fileStates.map((fs, i) => {
                if (fs.status !== 'converting' || !fs.progress) return null;
                const ext = fileExtension(fs.file.name);
                const kind = detectKind(fs.file);
                const isVisual = kind === 'docx' || kind === 'pptx' || kind === 'potx';
                return (
                  <div key={i} className="space-y-2 rounded-lg bg-white p-3 shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 truncate">
                        {isVisual && <Eye size={14} className="shrink-0 text-teal-500" />}
                        <span className="truncate text-sm font-medium text-slate-700">{fs.file.name}</span>
                        <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">{ext}</span>
                      </div>
                      <span className="shrink-0 text-xs font-semibold text-teal-600">{fs.progress.percent}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                      <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-300" style={{ width: `${fs.progress.percent}%` }} />
                    </div>
                    <p className="text-xs text-slate-500">{fs.progress.phase}</p>
                  </div>
                );
              })}
            </div>
          )}

          {done && summary && (
            summary.fail === 0 ? (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
                <CheckCircle2 size={18} /> {t.pdfConvertDone}
              </div>
            ) : summary.ok === 0 ? (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700">
                <AlertCircle size={18} /> {t.pdfConvertAllFailed}
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-xl bg-amber-50 p-4 text-sm font-medium text-amber-800">
                <AlertCircle size={18} />
                {t.pdfConvertSomeFailed.replace('{ok}', String(summary.ok)).replace('{total}', String(summary.total)).replace('{fail}', String(summary.fail))}
              </div>
            )
          )}

          {done && downloadMode === 'separate' && fileStates.length > 1 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">{t.pdfConvertResults}</p>
              {fileStates.map((fs, i) => (
                <div key={i} className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 ${fs.status === 'error' ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-slate-50'}`}>
                  <span className="flex items-center gap-2 truncate text-sm text-slate-700">
                    {fs.status === 'done' && fs.converted ? <CheckCircle2 size={16} className="shrink-0 text-emerald-500" /> : fs.status === 'error' ? <AlertCircle size={16} className="shrink-0 text-red-500" /> : <FileText size={16} className="shrink-0 text-slate-400" />}
                    <span className="truncate">{fs.converted?.filename || baseName(fs.file.name)}</span>
                    {fs.status === 'error' && fs.converted?.error && <span className="truncate text-xs text-red-500">— {fs.converted.error}</span>}
                  </span>
                  {fs.converted && !fs.converted.error && (
                    <button onClick={() => handleDownloadOne(fs.converted!)} className="flex shrink-0 items-center gap-1.5 rounded-lg bg-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-300">
                      <Download size={14} /> {t.pdfConvertDownload}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
