import React, { useState } from 'react';
import DropZone from './components/DropZone';
import ConvertSection from './components/ConvertSection';
import OcrTab from './components/OcrTab';
import TranscriptionTab from './components/TranscriptionTab';

interface AppProps {
  t?: any;
}

const App: React.FC<AppProps> = ({ t }) => {
  const [navOption, setNavOption] = useState<string>('convert');
  const [files, setFiles] = useState<File[]>([]);

  const handleFileDrop = (droppedFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...droppedFiles]);
  };

  const handleNavChange = (option: string) => {
    setNavOption(option);
  };

  // Função de segurança: se 't' não for uma função válida, usa o texto padrão (fallback)
  const safeT = (key: string, fallback: string): string => {
    if (t && typeof t === 'function') {
      try {
        return t(key) || fallback;
      } catch (e) {
        return fallback;
      }
    }
    return fallback;
  };

  const SplitSection: React.FC = () => (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100">
      <h2 className="text-xl font-bold text-slate-800 mb-2">Dividir PDF</h2>
      <p className="text-sm text-slate-500">Funcionalidade em desenvolvimento pela IA.</p>
    </div>
  );

  const CompressSection: React.FC = () => (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100">
      <h2 className="text-xl font-bold text-slate-800 mb-2">Comprimir PDF</h2>
      <p className="text-sm text-slate-500">Funcionalidade em desenvolvimento pela IA.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-4 py-4 sm:px-6 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <h1 className="text-2xl font-extrabold text-teal-600 tracking-tight">PropedeuticaPDF</h1>
          <nav className="flex flex-wrap gap-2">
            {[
              { id: 'convert', label: 'Unir PDF' },
              { id: 'split', label: 'Dividir PDF' },
              { id: 'compress', label: 'Comprimir PDF' },
              { id: 'ocr', label: 'OCR' },
              { id: 'transcription', label: 'Transcrição' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavChange(item.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  navOption === item.id
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <DropZone
          onFile={(file) => handleFileDrop([file])}
          onFiles={handleFileDrop}
          title={safeT('uploadTitle', 'Arraste seus arquivos aqui')}
          subtitle={safeT('uploadSubtitle', 'Suporta arquivos PDF, áudios e vídeos')}
          accept="application/pdf,audio/*,video/*"
          accent="teal"
          multiple={true}
        />
        
        <div className="mt-6 animate-fade-in">
          {navOption === 'convert' && <ConvertSection t={t} />}
          {navOption === 'split' && <SplitSection />}
          {navOption === 'compress' && <CompressSection />}
          {navOption === 'ocr' && <OcrTab t={t} />}
          {navOption === 'transcription' && <TranscriptionTab t={t} />}
        </div>
      </main>
    </div>
  );
};

export default App;
