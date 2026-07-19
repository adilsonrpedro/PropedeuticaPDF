import { useState } from 'react';
import { FileText, Mic, AudioLines, Info, Globe, ScanText } from 'lucide-react';
import { getTranslation, type Lang } from './lib/i18n';
import PdfTab from './components/PdfTab';
import SpeechTab from './components/SpeechTab';
import TranscriptionTab from './components/TranscriptionTab';
import AboutTab from './components/AboutTab';
import OcrTab from './components/OcrTab';

type TabId = 'pdf' | 'speech' | 'transcription' | 'ocr' | 'about';

export default function App() {
  const [lang, setLang] = useState<Lang>('es');
  const [tab, setTab] = useState<TabId>('pdf');
  const [reviewPulse, setReviewPulse] = useState(false);
  const t = getTranslation(lang);

  const handleReviewSubmitted = () => { setReviewPulse(true); setTimeout(() => setReviewPulse(false), 3000); };

  const tabs: { id: TabId; label: string; icon: typeof FileText }[] = [
    { id: 'pdf', label: t.navPdf, icon: FileText },
    { id: 'speech', label: t.navSpeech, icon: Mic },
    { id: 'transcription', label: t.navTranscription, icon: AudioLines },
    { id: 'ocr', label: t.navOcr, icon: ScanText },
    { id: 'about', label: t.navAbout, icon: Info },
  ];
  const langOptions: { code: Lang; label: string }[] = [{ code: 'pt', label: 'PT' }, { code: 'es', label: 'ES' }, { code: 'en', label: 'EN' }];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm"><FileText size={20} /></div>
            <div><h1 className="text-base font-bold leading-tight text-slate-900 sm:text-lg">{t.appTitle}</h1><p className="hidden text-xs text-slate-500 sm:block">{t.appTagline}</p></div>
          </div>
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
            <Globe size={15} className="ml-1 text-slate-400" />
            {langOptions.map((opt) => <button key={opt.code} onClick={() => setLang(opt.code)} className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${lang === opt.code ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{opt.label}</button>)}
          </div>
        </div>
        <nav className="mx-auto max-w-5xl px-2 sm:px-6">
          <div className="flex gap-1 overflow-x-auto pb-2">
            {tabs.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setTab(id)} className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${tab === id ? 'bg-teal-50 text-teal-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}><Icon size={17} /><span className="hidden sm:inline">{label}</span></button>)}
          </div>
        </nav>
      </header>
      <main className="flex-1 py-6 sm:py-8">
        {tab === 'pdf' && <PdfTab t={t} />}
        {tab === 'speech' && <SpeechTab t={t} />}
        {tab === 'transcription' && <TranscriptionTab t={t} onReviewSubmitted={handleReviewSubmitted} />}
        {tab === 'ocr' && <OcrTab t={t} onReviewSubmitted={handleReviewSubmitted} />}
        {tab === 'about' && <AboutTab t={t} />}
      </main>
      <footer className={`border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400 transition ${reviewPulse ? 'text-emerald-500' : ''}`}>{reviewPulse ? t.reviewThanks : t.footerText}</footer>
    </div>
  );
}
