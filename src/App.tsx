import { useState } from 'react';
import { FileText, Mic, AudioLines, Info, Sparkles } from 'lucide-react';
import { getTranslation, type Lang, type Translation } from './lib/i18n';
import PdfTab from './components/PdfTab';
import SpeechTab from './components/SpeechTab';
import TranscriptionTab from './components/TranscriptionTab';
import AboutTab from './components/AboutTab';

type TabId = 'pdf' | 'speech' | 'transcription' | 'about';

export default function App() {
  const [lang, setLang] = useState<Lang>('es');
  const [tab, setTab] = useState<TabId>('transcription');
  const [reviewPulse, setReviewPulse] = useState(false);
  const t = getTranslation(lang);

  const handleReviewSubmitted = () => {
    setReviewPulse(true);
    setTimeout(() => setReviewPulse(false), 3000);
  };

  const tabs: { id: TabId; label: string; icon: typeof FileText; desc: string }[] = [
    { id: 'transcription', label: t.navTranscription, icon: AudioLines, desc: 'Audio a texto' },
    { id: 'pdf', label: t.navPdf, icon: FileText, desc: 'Extraer de documentos' },
    { id: 'speech', label: t.navSpeech, icon: Mic, desc: 'Dictado en vivo' },
    { id: 'about', label: t.navAbout, icon: Info, desc: 'Información general' },
  ];

  const langOptions: { code: Lang; label: string; flag: string }[] = [
    { code: 'pt', label: 'PT', flag: '🇧🇷' },
    { code: 'es', label: 'ES', flag: '🇵🇾' },
    { code: 'en', label: 'EN', flag: '🇬🇧' },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-900 font-sans antialiased text-slate-200">
      
      {/* 1. SIDEBAR (Solo visible en pantallas grandes - Escritorio) */}
      <aside className="hidden md:flex w-72 flex-col bg-slate-950 border-r border-slate-800/60 p-5 shrink-0 justify-between">
        <div className="flex flex-col gap-6">
          {/* Brand/Logo Area */}
          <div className="flex items-center gap-3.5 px-2 py-1">
            <div className="p-2 bg-gradient-to-tr from-teal-500 to-emerald-400 rounded-xl shadow-lg shadow-teal-500/10 shrink-0">
              <img 
                src="/file_00000000e560820eaf798f5139d704c9.png" 
                alt="Logo" 
                className="h-9 w-9 rounded-lg object-contain bg-white" 
              />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-white leading-tight flex items-center gap-1.5">
                {t.appTitle}
                <Sparkles size={14} className="text-teal-400 fill-teal-400 animate-pulse" />
              </h1>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5 max-w-[160px] truncate">{t.appTagline}</p>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex flex-col gap-1.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2">Herramientas</div>
            {tabs.map(({ id, label, icon: Icon, desc }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`group flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-semibold transition-all duration-200 ${
                  tab === id 
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-600/10' 
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={tab === id ? 'text-white' : 'text-slate-400 group-hover:text-teal-400 transition-colors'} />
                  <div className="text-left">
                    <span className="block leading-none">{label}</span>
                    <span className={`text-[10px] block mt-0.5 font-normal ${tab === id ? 'text-teal-100' : 'text-slate-500'}`}>{desc}</span>
                  </div>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Language Selector at Bottom of Sidebar */}
        <div className="border-t border-slate-800/80 pt-4 flex flex-col gap-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-1">Idioma de la interfaz</div>
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-900 p-1 border border-slate-800">
            {langOptions.map((opt) => (
              <button
                key={opt.code}
                onClick={() => setLang(opt.code)}
                className={`rounded-lg py-1.5 text-xs font-bold transition flex items-center justify-center gap-1 ${
                  lang === opt.code 
                    ? 'bg-slate-800 text-teal-400 border border-slate-700/50 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{opt.flag}</span>
                <span>{opt.code.toUpperCase()}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* 2. MAIN APP WORKSPACE */}
      <div className="flex flex-1 flex-col h-full bg-slate-900 relative">
        
        {/* Mobile Header (Solo visible en móviles) */}
        <header className="flex md:hidden items-center justify-between bg-slate-950 border-b border-slate-800/80 px-4 py-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1 bg-gradient-to-tr from-teal-500 to-emerald-400 rounded-lg shrink-0">
              <img src="/file_00000000e560820eaf798f5139d704c9.png" alt="Logo" className="h-7 w-7 rounded object-contain bg-white" />
            </div>
            <h1 className="text-sm font-extrabold text-white tracking-tight">{t.appTitle}</h1>
          </div>
          
          {/* Mobile Language Compact Dropdown */}
          <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
            {langOptions.map((opt) => (
              <button
                key={opt.code}
                onClick={() => setLang(opt.code)}
                className={`rounded px-2 py-1 text-[10px] font-bold ${lang === opt.code ? 'bg-teal-600 text-white' : 'text-slate-400'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </header>

        {/* Workspace Canvas (Donde vive la magia) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-4xl h-full flex flex-col">
            
            {/* Context Heading inside the page */}
            <div className="mb-6 hidden md:block">
              <h2 className="text-2xl font-bold tracking-tight text-white">
                {tabs.find(t => t.id === tab)?.label}
              </h2>
              <p className="text-xs text-slate-400 mt-1">Plataforma Inteligente de Procesamiento de Audio y Texto</p>
            </div>

            {/* Inner Feature Component Container */}
            <div className="flex-1 bg-slate-950/40 border border-slate-800/50 rounded-2xl p-5 sm:p-8 shadow-2xl shadow-slate-950/50 backdrop-blur-sm min-h-[450px]">
              {tab === 'pdf' && <PdfTab t={t} />}
              {tab === 'speech' && <SpeechTab t={t} />}
              {tab === 'transcription' && <TranscriptionTab t={t} onReviewSubmitted={handleReviewSubmitted} />}
              {tab === 'about' && <AboutTab t={t} />}
            </div>
          </div>
        </main>

        {/* 3. MOBILE BOTTOM NAVIGATION (Solo visible en móviles - Estilo App Nativa) */}
        <nav className="md:hidden bg-slate-950/95 border-t border-slate-800/80 px-2 py-2 backdrop-blur-md shrink-0">
          <div className="flex justify-around items-center">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex flex-col items-center gap-1.5 rounded-xl py-1.5 px-3 text-center transition-all ${
                  tab === id ? 'text-teal-400 font-bold bg-slate-900' : 'text-slate-400 font-medium'
                }`}
              >
                <Icon size={18} className={tab === id ? 'text-teal-400' : 'text-slate-500'} />
                <span className="text-[10px] tracking-tight">{label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Footer Alert integrated at the very bottom right */}
        <footer className={`absolute bottom-3 right-6 hidden lg:block text-[11px] font-medium tracking-wide transition-all duration-300 ${
          reviewPulse ? 'text-emerald-400 animate-bounce' : 'text-slate-500'
        }`}>
          {reviewPulse ? `✨ ${t.reviewThanks}` : t.footerText}
        </footer>
      </div>

    </div>
  );
}

export type { Translation, Lang };
