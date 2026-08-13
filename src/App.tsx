import React, { useState, Suspense, lazy } from 'react';
import Home from './components/Home';
import { ArrowLeft } from 'lucide-react';

// Importações estáticas levíssimas para a Home carregar instantaneamente
export type ScreenType = 'home' | 'unir' | 'split' | 'compress' | 'ocr' | 'transcription';

// Lazy loading das ferramentas secundárias pesadas
const ConvertSection = lazy(() => import('./components/ConvertSection'));
const OcrTab = lazy(() => import('./components/OcrTab'));
const TranscriptionTab = lazy(() => import('./components/TranscriptionTab'));

// Componente visual do Spinner de Carregamento
const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 px-4">
    <div className="relative flex items-center justify-center">
      <div className="w-12 h-12 rounded-full border-4 border-teal-100 dark:border-teal-950 animate-pulse" />
      <div className="absolute w-12 h-12 rounded-full border-4 border-teal-600 border-t-transparent animate-spin" />
    </div>
    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 animate-pulse">
      Carregando ferramenta...
    </p>
  </div>
);

export const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');

  const t: Record<string, string> = {
    mergeTitle: 'Unir PDFs',
    mergeSubtitle: 'Combine vários arquivos PDF em um único documento em segundos.',
  };

  const handleNavigate = (screen: string) => {
    setCurrentScreen(screen as ScreenType);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'unir':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <ConvertSection t={t} />
          </Suspense>
        );
      case 'ocr':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <OcrTab t={t} />
          </Suspense>
        );
      case 'transcription':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <TranscriptionTab t={t} />
          </Suspense>
        );
      case 'split':
        return (
          <div className="text-center py-20 max-w-2xl mx-auto px-4">
            <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Dividir PDF</h2>
            <p className="text-slate-600 dark:text-slate-400">Ferramenta em desenvolvimento...</p>
          </div>
        );
      case 'compress':
        return (
          <div className="text-center py-20 max-w-2xl mx-auto px-4">
            <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Comprimir PDF</h2>
            <p className="text-slate-600 dark:text-slate-400">Ferramenta em desenvolvimento...</p>
          </div>
        );
      case 'home':
      default:
        return <Home t={t} onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans flex flex-col justify-between">
      <div>
        {currentScreen !== 'home' && (
          <header className="border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-800/90 sticky top-0 z-50 backdrop-blur-md">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
              <button
                onClick={() => handleNavigate('home')}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700/60 hover:bg-teal-50 dark:hover:bg-teal-950/50 hover:text-teal-600 dark:hover:text-teal-400 transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar para a Home</span>
              </button>
              <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                Propedeutica<span className="text-teal-600 dark:text-teal-400">PDF</span>
              </div>
            </div>
          </header>
        )}

        <main className={currentScreen !== 'home' ? 'py-6' : ''}>
          {renderScreen()}
        </main>
      </div>
    </div>
  );
};

export default App;