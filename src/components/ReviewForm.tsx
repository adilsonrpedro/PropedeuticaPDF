import { useState } from 'react';
import { Star, Loader as Loader2, CircleCheck as CheckCircle2, CircleAlert as AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Translation } from '../lib/i18n';

interface ReviewFormProps { t: Translation; onSubmitted?: () => void; }

export default function ReviewForm({ t, onSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async () => {
    if (rating < 1) return;
    setStatus('submitting');
    const { error } = await supabase.from('reviews').insert({ rating, comment: comment.trim() || null });
    if (error) { setStatus('error'); return; }
    setStatus('success'); setRating(0); setComment(''); onSubmitted?.();
  };

  if (status === 'success') return <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-sm font-medium text-emerald-700"><CheckCircle2 size={18} /> {t.reviewThanks}</div>;

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div><h3 className="text-sm font-semibold text-slate-800">{t.reviewTitle}</h3><p className="mt-0.5 text-xs text-slate-500">{t.reviewSubtitle}</p></div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button key={star} onMouseEnter={() => setHover(star)} onMouseLeave={() => setHover(0)} onClick={() => setRating(star)} className="transition hover:scale-110" aria-label={`${star} stars`}>
            <Star size={28} className={(hover >= star || rating >= star) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} />
          </button>
        ))}
      </div>
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder={t.reviewCommentPlaceholder} rows={3} maxLength={2000} className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200" />
      {status === 'error' && <div className="flex items-center gap-2 text-sm text-red-600"><AlertCircle size={16} /> {t.reviewError}</div>}
      <button onClick={handleSubmit} disabled={rating < 1 || status === 'submitting'} className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-50">
        {status === 'submitting' && <Loader2 size={16} className="animate-spin" />}{t.reviewSubmit}
      </button>
    </div>
  );
}
