import { useRef, useState, type DragEvent, type ReactNode } from 'react';
import { CloudUpload as UploadCloud } from 'lucide-react';

interface DropZoneProps {
  onFile: (file: File) => void;
  title: string;
  subtitle: string;
  accept: string;
  hasItems?: boolean;
  accent?: 'teal' | 'amber' | 'blue' | 'slate';
  multiple?: boolean;
  onFiles?: (files: File[]) => void;
  children?: ReactNode;
}

const accentMap = {
  teal: { border: 'border-teal-300', bg: 'bg-teal-50', text: 'text-teal-600', hover: 'hover:border-teal-400 hover:bg-teal-100' },
  amber: { border: 'border-amber-300', bg: 'bg-amber-50', text: 'text-amber-600', hover: 'hover:border-amber-400 hover:bg-amber-100' },
  blue: { border: 'border-blue-300', bg: 'bg-blue-50', text: 'text-blue-600', hover: 'hover:border-blue-400 hover:bg-blue-100' },
  slate: { border: 'border-slate-300', bg: 'bg-slate-50', text: 'text-slate-600', hover: 'hover:border-slate-400 hover:bg-slate-100' },
};

export default function DropZone({ onFile, title, subtitle, accept, hasItems, accent = 'teal', multiple, onFiles, children }: DropZoneProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const a = accentMap[accent];

  const handleDrop = (e: DragEvent) => {
    e.preventDefault(); setDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    if (dropped.length === 0) return;
    if (multiple && onFiles) onFiles(dropped);
    else onFile(dropped[0]);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;
    if (multiple && onFiles) onFiles(selected);
    else onFile(selected[0]);
    e.target.value = '';
  };

  return (
    <div onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={handleDrop} onClick={() => inputRef.current?.click()} className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition ${dragging ? `${a.bg} ${a.border}` : 'border-slate-200 bg-slate-50'} ${!hasItems ? a.hover : ''}`}>
      <input ref={inputRef} type="file" accept={accept} multiple={multiple} onChange={handleChange} className="hidden" />
      {children || (<><UploadCloud size={40} className={`mb-3 ${a.text}`} /><p className="text-sm font-semibold text-slate-700">{title}</p><p className="mt-1 text-xs text-slate-400">{subtitle}</p></>)}
    </div>
  );
}
