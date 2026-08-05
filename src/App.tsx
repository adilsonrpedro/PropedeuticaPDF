import { useState } from 'react';
import { FileText, Mic, AudioLines, Info, Globe } from 'lucide-react';
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

  const tabs: { id: TabId; label: string; icon: typeof FileText }[] = [
    { id: 'transcription', label: t.navTranscription, icon: AudioLines },
    { id: 'pdf', label: t.navPdf, icon: FileText },
    { id: 'speech', label: t.navSpeech, icon: Mic },
    { id: 'about', label: t.navAbout, icon: Info },
  ];

  const langOptions: { code: Lang; label: string; flag: string }[] = [
    { code: 'pt', label: 'PT', flag: '🇧🇷' },
    { code: 'es', label: 'ES', flag: '🇵🇾' },
    { code: 'en', label: 'EN', flag: '🇬🇧' },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/50 font-sans antialiased text-slate-800">
      {/* Top Utility Bar (Idioma) */}
      <div className="bg-slate-900 py-1.5 text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-end px-4 sm:px-6">
          <div className="flex items-center gap-1 rounded-lg bg-slate-800 p-0.5 border border-slate-700">
            <Globe size={13} className="ml-1.5 text-slate-400" />
            {langOptions.map((opt) => (
              <button
                key={opt.code}
                onClick={() => setLang(opt.code)}
                className={`rounded px-2 py-0.5 text-[11px] font-semibold transition ${lang === opt.code ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                <span className="mr-1">{opt.flag}</span>{opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="p-1 bg-gradient-to-tr from-teal-600 to-emerald-500 rounded-xl shadow-md shadow-teal-100">
              <img src="/file_00000000e560820eaf798f5139d704c9.png" alt="Logo" className="h-9 w-9 rounded-lg object-contain bg-white" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-slate-900 sm:text-xl">{t.appTitle}</h1>
              <p className="hidden text-xs font-medium text-slate-500 sm:block">{t.appTagline}</p>
            </div>
          </div>

          {/* Navigation Inside Header (Desktop) */}
          <nav className="hidden md:flex items-center gap-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 ${tab === id ? 'bg-teal-600 text-white shadow-md shadow-teal-100' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
              >
                <Icon size={16} />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Mobile Navigation (Bottom of header, visible text) */}
        <nav className="border-t border-slate-100 bg-white px-2 py-1.5 md:hidden">
          <div className="flex justify-around items-center gap-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex flex-col items-center gap-1 rounded-xl py-1.5 px-3 text-center transition-all ${tab === id ? 'text-teal-600 font-bold bg-teal-50/60' : 'text-slate-500 font-medium'}`}
              >
                <Icon size={18} className={tab === id ? 'text-teal-600' : 'text-slate-400'} />
                <span className="text-[10px] tracking-tight">{label}</span>
              </button>
            ))}
          </div>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 sm:px-6 sm:py-10">
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 sm:p-8 min-h-[400px]">
          {tab === 'pdf' && <PdfTab t={t} />}
          {tab === 'speech' && <SpeechTab t={t} />}
          {tab === 'transcription' && <TranscriptionTab t={t} onReviewSubmitted={handleReviewSubmitted} />}
          {tab === 'about' && <AboutTab t={t} />}
        </div>
      </main>

      {/* Footer */}
      <footer className={`border-t border-slate-200 bg-white py-5 text-center text-xs font-medium tracking-wide text-slate-400 transition-all duration-300 ${reviewPulse ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : ''}`}>
        <div className="max-w-5xl mx-auto px-4">
          {reviewPulse ? (
            <span className="flex items-center justify-center gap-1.5 font-semibold animate-pulse">✨ {t.reviewThanks}</span>
          ) : (
            t.footerText
          )}
        </div>
      </footer>
    </div>
  );
}

export type { Translation, Lang };
