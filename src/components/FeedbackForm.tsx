import { useState } from 'react';
import { Loader as Loader2, CircleCheck as CheckCircle2, CircleAlert as AlertCircle, MessageSquare, TriangleAlert as AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Translation } from '../lib/i18n';

interface FeedbackFormProps { t: Translation; }

export default function FeedbackForm({ t }: FeedbackFormProps) {
  const [type, setType] = useState<'suggestion' | 'problem'>('suggestion');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async () => {
    if (message.trim().length < 1) return;
    setStatus('submitting');
    const { error } = await supabase.from('feedbacks').insert({ type, message: message.trim(), email: email.trim() || null });
    if (error) { setStatus('error'); return; }
    setStatus('success'); setMessage(''); setEmail('');
  };

  if (status === 'success') return <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-sm font-medium text-emerald-700"><CheckCircle2 size={18} /> {t.feedbackThanks}</div>;

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="text-sm font-semibold text-slate-800">{t.feedbackTitle}</h3>
      <div className="flex gap-2">
        <button onClick={() => setType('suggestion')} className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${type === 'suggestion' ? 'bg-teal-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}><MessageSquare size={16} /> {t.feedbackTypeSuggestion}</button>
        <button onClick={() => setType('problem')} className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${type === 'problem' ? 'bg-red-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}><AlertTriangle size={16} /> {t.feedbackTypeProblem}</button>
      </div>
      <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t.feedbackMessagePlaceholder} rows={4} maxLength={5000} className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200" />
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={`${t.feedbackEmailPlaceholder} ${t.feedbackEmailOptional}`} maxLength={320} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200" />
      {status === 'error' && <div className="flex items-center gap-2 text-sm text-red-600"><AlertCircle size={16} /> {t.feedbackError}</div>}
      <button onClick={handleSubmit} disabled={message.trim().length < 1 || status === 'submitting'} className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:opacity-50">
        {status === 'submitting' && <Loader2 size={16} className="animate-spin" />}{t.feedbackSubmit}
      </button>
    </div>
  );
}
