import { useEffect, useState } from 'react';
import { Play, Square, Pause, Volume2, CircleAlert as AlertCircle, Gauge, Music } from 'lucide-react';
import type { Translation } from '../lib/i18n';

interface SpeechTabProps { t: Translation; }

export default function SpeechTab({ t }: SpeechTabProps) {
  const [text, setText] = useState('');
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [state, setState] = useState<'idle' | 'playing' | 'paused'>('idle');
  const [error, setError] = useState('');
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  useEffect(() => {
    if (!supported) return;
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      setVoices(v);
      if (v.length > 0 && !selectedVoice) { const langPref = v.find((voice) => voice.lang.startsWith('es')) || v[0]; setSelectedVoice(langPref.name); }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => { window.speechSynthesis.cancel(); };
  }, [supported, selectedVoice]);

  const handlePlay = () => {
    if (!supported || !text.trim()) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = rate; utter.pitch = pitch;
    const voice = voices.find((v) => v.name === selectedVoice);
    if (voice) utter.voice = voice;
    utter.onend = () => setState('idle');
    utter.onerror = () => { setState('idle'); setError(t.speechUnsupported); };
    setState('playing'); window.speechSynthesis.speak(utter);
  };
  const handlePause = () => { window.speechSynthesis.pause(); setState('paused'); };
  const handleResume = () => { window.speechSynthesis.resume(); setState('playing'); };
  const handleStop = () => { window.speechSynthesis.cancel(); setState('idle'); };

  if (!supported) return <div className="mx-auto max-w-2xl px-4 sm:px-6"><div className="flex items-start gap-2 rounded-xl bg-amber-50 p-4 text-sm text-amber-800"><AlertCircle size={18} className="mt-0.5 shrink-0" /><span>{t.speechUnsupported}</span></div></div>;

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6">
      <div className="mb-6 text-center"><h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">{t.speechTitle}</h2><p className="mt-2 text-sm text-slate-500">{t.speechSubtitle}</p></div>
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={t.speechPlaceholder} rows={6} className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-600"><Gauge size={14} /> {t.speechRate}: {rate.toFixed(1)}x</label><input type="range" min={0.5} max={2} step={0.1} value={rate} onChange={(e) => setRate(parseFloat(e.target.value))} className="w-full accent-blue-600" /></div>
          <div><label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-600"><Music size={14} /> {t.speechPitch}: {pitch.toFixed(1)}</label><input type="range" min={0} max={2} step={0.1} value={pitch} onChange={(e) => setPitch(parseFloat(e.target.value))} className="w-full accent-blue-600" /></div>
        </div>
        <div><label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-600"><Volume2 size={14} /> {t.speechVoice}</label><select value={selectedVoice} onChange={(e) => setSelectedVoice(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200">{voices.length === 0 && <option>{t.speechDefault}</option>}{voices.map((v) => <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>)}</select></div>
        {error && <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700"><AlertCircle size={16} className="mt-0.5 shrink-0" /><span>{error}</span></div>}
        <div className="flex gap-2">
          {state === 'idle' && <button onClick={handlePlay} disabled={!text.trim()} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"><Play size={18} /> {t.speechPlay}</button>}
          {state === 'playing' && (<><button onClick={handlePause} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-600"><Pause size={18} /> {t.speechPause}</button><button onClick={handleStop} className="flex items-center justify-center gap-2 rounded-xl bg-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-300"><Square size={18} /> {t.speechStop}</button></>)}
          {state === 'paused' && (<><button onClick={handleResume} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"><Play size={18} /> {t.speechResume}</button><button onClick={handleStop} className="flex items-center justify-center gap-2 rounded-xl bg-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-300"><Square size={18} /> {t.speechStop}</button></>)}
        </div>
        {state === 'playing' && <p className="text-center text-xs text-blue-600">{t.speechPlaying}</p>}
        {state === 'paused' && <p className="text-center text-xs text-amber-600">{t.speechPaused}</p>}
      </div>
    </div>
  );
}
