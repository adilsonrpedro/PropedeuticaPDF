import { Check, Copy, Download } from 'lucide-react';

interface OcrResultsProps {
  ocrText: string;
  copied: boolean;
  handleCopy: () => void;
  searchablePdf: ArrayBuffer | null;
  downloadSearchablePdf: () => void;
}

export default function OcrResults({ ocrText, copied, handleCopy, searchablePdf, downloadSearchablePdf }: OcrResultsProps) {
  return (
    <>
      {ocrText && (
        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-md font-bold text-slate-800">Texto Extraído</h3>
            <button onClick={handleCopy} className="flex items-center gap-1 text-xs text-teal-600 font-medium hover:text-teal-700">
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copiado!' : 'Copiar Texto'}
            </button>
          </div>
          <textarea readOnly value={ocrText} className="w-full h-64 p-3 bg-slate-100 border border-slate-200 rounded-xl font-mono text-sm text-slate-700 focus:outline-none" />
        </div>
      )}
      {searchablePdf && (
        <div className="mt-6 text-center">
          <button onClick={downloadSearchablePdf} className="inline-flex items-center gap-2 bg-green-600 text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-md hover:bg-green-700 transition">
            <Download size={18} /> Baixar PDF Pesquisável
          </button>
        </div>
      )}
    </>
  );
}
