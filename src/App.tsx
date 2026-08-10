import React, { useState } from 'react';
import './App.css';
import AboutTab from './components/AboutTab';
import ConvertSection from './components/ConvertSection';
import DropZone from './components/DropZone';
import FilePreview from './components/FilePreview';
import MergeSection from './components/MergeSection';
import Modal from './components/Modal';
import PdfTab from './components/PdfTab';
import ReviewForm from './components/ReviewForm';
import SpeechTab from './components/SpeechTab';
import SplitSection from './components/SplitSection';
import TranscriptionTab from './components/TranscriptionTab';

type Language = 'pt' | 'es' | 'en';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('pdf');
  const [language, setLanguage] = useState<Language>('pt');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estado para gerenciar arquivo ativo na conversão/fala
  const [activeFileId, setActiveFileId] = useState<string | null>(null);

  // Tradução simples fallback (ajuste conforme seu i18n.ts)
  const t = (key: string): string => {
    return key; 
  };

  const tabsData = [
    { id: 'pdf', label: 'PDF Básico', icon: '📄', desc: 'Operações básicas' },
    { id: 'convert', label: 'Conversor', icon: '🔄', desc: 'Converter formatos' },
    { id: 'speech', label: 'Voz em Texto', icon: '🎙️', desc: 'Dictado ao vivo' },
    { id: 'transcription', label: 'Transcrição', icon: '📝', desc: 'Audio para texto' },
    { id: 'about', label: 'Sobre', icon: 'ℹ️', desc: 'Informações' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'pdf':
        return (
          <div className="space-y-6">
            {/* Abas internas para PDF */}
            <div className="flex gap-2 mb-4 border-b pb-2">
              <button 
                onClick={() => setActivePdfSubTab('basic')}
                className={`px-3 py-1.5 text-sm font-medium rounded-t-lg transition ${activePdfSubTab === 'basic' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
              >
                PDF Básico
              </button>
              <button 
                onClick={() => setActivePdfSubTab('merge')}
                className={`px-3 py-1.5 text-sm font-medium rounded-t-lg transition ${activePdfSubTab === 'merge' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
              >
                Unir PDFs
              </button>
              <button 
                onClick={() => setActivePdfSubTab('split')}
                className={`px-3 py-1.5 text-sm font-medium rounded-t-lg transition ${activePdfSubTab === 'split' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
              >
                Dividir PDFs
              </button>
            </div>

            {activePdfSubTab === 'basic' && <PdfTab lang={language} />}
            
            {(activePdfSubTab === 'merge' || activePdfSubTab === 'split') && (
              <>
                {/* DropZone compartilhado para Merge/Split */}
                <DropZone 
                  lang={language} 
                  onFileSelect={(id) => setActiveFileId(id)}
                />
                
                {activeFileId && <FilePreview fileId={activeFileId} />}

                {activePdfSubTab === 'merge' ? (
                  <MergeSection lang={language} onFeedback={() => setIsModalOpen(true)} />
                ) : (
                  <SplitSection lang={language} />
                )}
              </>
            )}
          </div>
        );

      case 'convert':
        return (
          <div className="space-y-4">
            <DropZone 
              lang={language} 
              onFileSelect={(id) => setActiveFileId(id)}
            />
            
            {activeFileId && <FilePreview fileId={activeFileId} />}

            <ConvertSection 
              lang={language} 
              activeFileId={activeFileId} 
              onFileSelect={(id) => setActiveFileId(id)}
            />
          </div>
        );

      case 'speech':
        return (
          <div className="space-y-4">
            {/* DropZone para upload de áudio antes da fala */}
            <DropZone 
              lang={language} 
              onFileSelect={(id) => setActiveFileId(id)}
            />
            
            {activeFileId && <FilePreview fileId={activeFileId} />}

            <SpeechTab 
              lang={language} 
              activeFileId={activeFileId} 
              onFileSelect={(id) => setActiveFileId(id)}
            />
          </div>
        );

      case 'transcription':
        return (
          <TranscriptionTab lang={language} />
        );

      case 'about':
        return (
          <AboutTab lang={language} />
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* Layout Desktop/Tablet */}
      <div className="flex h-screen bg-slate-950 text-slate-100">
        
        {/* Sidebar - Visível em telas grandes (Tablet/Desktop) */}
        <aside className="hidden md:flex w-64 flex-col border-r border-slate-800/50 bg-slate-900/30 backdrop-blur-xl p-4 gap-2">
          {/* Logo / Header da Sidebar */}
          <div className="mb-6 px-2 py-1">
            <h1 className="text-lg font-bold text-teal-400 tracking-tight flex items-center gap-2">
              🧠 PropedeuticaPDF
            </h1>
            <p className="text-xs text-slate-500 mt-1 pl-8">Proced. Méd. Inteligente</p>
          </div>

          {/* Menu de Navegação */}
          <nav className="flex flex-col gap-1">
            {tabsData.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                title={tab.desc}
                aria-label={`Abrir ${tab.label}`}
                className={`group flex items-center justify-between rounded-xl px-3.5 py-2 text-sm font-semibold transition-all duration-200 cursor-pointer border-none outline-none ${
                  activeTab === tab.id 
                    ? 'bg-teal-600/10 text-teal-400 shadow-md shadow-teal-900/20 ring-1 ring-teal-500/30' 
                    : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-100 active:scale-[0.98]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{tab.icon}</span>
                  {tab.label}
                </div>
              </button>
            ))}
          </nav>

          {/* Seletor de Idioma (Rodapé da Sidebar) */}
          <div className="mt-auto pt-4 border-t border-slate-800/50">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2 px-3">Idioma</p>
            <div className="flex gap-1.5 px-1">
              {['pt', 'es', 'en'].map((code) => (
                <button
                  key={code}
                  onClick={() => setLanguage(code as Language)}
                  title={`Mudar para ${code === 'pt' ? 'Português' : code === 'es' ? 'Español' : 'English'}`}
                  aria-label={`Selecionar idioma: ${code}`}
                  className={`rounded-lg py-1.5 text-[10px] font-bold transition-all cursor-pointer border-none outline-none flex items-center justify-center w-full ${
                    language === code 
                      ? 'bg-slate-800/60 text-teal-400 ring-1 ring-teal-500/30' 
                      : 'text-slate-500 hover:text-slate-200 active:scale-95'
                  }`}
                >
                  {code.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Área Principal (Workspace) */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          
          {/* Header Mobile - Apenas visível em telas pequenas (celular) */}
          <header className="md:hidden sticky top-0 z-20 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/40 px-4 py-3 flex items-center justify-between">
            <h1 className="text-base font-bold text-teal-400 tracking-tight">🧠 PropedeuticaPDF</h1>
            
            {/* Seletor de Idioma Compacto Mobile */}
            <div className="flex gap-1.5 bg-slate-900/80 p-1 rounded-lg border border-slate-800/40">
              {['pt', 'es', 'en'].map((code) => (
                <button
                  key={code}
                  onClick={() => setLanguage(code as Language)}
                  className={`rounded px-2 py-1 text-[9px] font-bold transition ${language === code ? 'bg-teal-600/80 text-white' : 'text-slate-500 active:text-slate-300'}`}
                >
                  {code.toUpperCase()}
                </button>
              ))}
            </div>
          </header>

          {/* Conteúdo da Aba Ativa */}
          <section className="flex-1 overflow-y-auto p-4 md:p-6">
            
            {/* Cabeçalho Contextual (Desktop/Tablet) */}
            {activeTab !== 'about' && (
              <div className="mb-6 hidden md:block">
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
                  <span>📂</span> 
                  {tabsData.find(t => t.id === activeTab)?.label}
                </h2>
              </div>
            )}

            {/* Renderização do Conteúdo */}
            {renderContent()}
          </section>

        </main>
      </div>

      {/* Navegação Inferior Mobile - Estilo App Nativa (Só visível em telas pequenas) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-t border-teal-900/30 flex justify-around items-center py-1.5 px-2">
        {tabsData.map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-0.5 rounded-xl py-1.5 px-3 text-[9px] font-bold transition-all cursor-pointer border-none outline-none ${
              activeTab === tab.id ? 'text-teal-400 bg-slate-800/70 scale-105' : 'text-slate-500 hover:text-slate-200 active:scale-95'
            }`}
          >
            <span className="text-base">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Modais */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default App;