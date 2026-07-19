import { FileText, Mic, AudioLines, Languages, Scissors, Repeat, Cpu, ShieldCheck } from 'lucide-react';
import FeedbackForm from './FeedbackForm';
import ReviewForm from './ReviewForm';
import type { Translation } from '../lib/i18n';

interface AboutTabProps { t: Translation; }

export default function AboutTab({ t }: AboutTabProps) {
  const features = [
    { icon: Repeat, text: t.aboutFeature1 },
    { icon: FileText, text: t.aboutFeature2 },
    { icon: Scissors, text: t.aboutFeature3 },
    { icon: Mic, text: t.aboutFeature4 },
    { icon: AudioLines, text: t.aboutFeature5 },
    { icon: Languages, text: t.aboutFeature6 },
  ];
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6">
      <div className="mb-6 text-center"><h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">{t.aboutTitle}</h2><p className="mt-2 text-sm text-slate-500">{t.aboutSubtitle}</p></div>
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm leading-relaxed text-slate-700">{t.aboutDescription}</p>
          <div className="mt-4 space-y-2.5">
            {features.map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-slate-700">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600"><Icon size={17} /></div>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-start gap-2 rounded-xl bg-slate-50 p-4"><Cpu size={18} className="mt-0.5 shrink-0 text-slate-500" /><p className="text-xs leading-relaxed text-slate-600">{t.aboutTech}</p></div>
          <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-4"><ShieldCheck size={18} className="mt-0.5 shrink-0 text-amber-600" /><p className="text-xs leading-relaxed text-amber-800">{t.aboutDisclaimer}</p></div>
        </div>
        <div className="space-y-3"><ReviewForm t={t} /><FeedbackForm t={t} /></div>
      </div>
    </div>
  );
}
