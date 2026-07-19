import { useCallback, useState } from 'react';
import { Loader as Loader2, AudioLines, Copy, Check, CircleAlert as AlertCircle, Info, Download, Cloud } from 'lucide-react';
import DropZone from './DropZone';
import FilePreview from './FilePreview';
import ReviewForm from './ReviewForm';
import type { Translation } from '../lib/i18n';

interface TranscriptionTabProps { t: Translation; onReviewSubmitted?: () => void; }

const TRANSCRIBE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/transcribe`;
const GROQ_MODEL = 'whisper-large-v3-turbo';
const PARAGUAYAN_SPANISH_PROMPT = 'Esta es una grabación de clase o conferencia en español de Paraguay. Puede contener expresiones locales, modismos y palabras ocasionales en guaraní o jopará. Transcribe con alta fidelidad manteniendo el contexto en español, aplicando puntuación correcta (puntos, comas) y organizando el texto en párrafos linhos y coherentes.';
const CHUNK_SECONDS = 25;
const CHUNK_SAMPLE_RATE = 16000;
const CHUNK_SAMPLES = CHUNK_SECONDS * CHUNK_SAMPLE_RATE;

type Phase = 'idle' | 'extracting' | 'processing' | 'analyzing' | 'structuring' | 'done';

async function decodeAudio(file: File): Promise<AudioBuffer> {
  const arrayBuffer = await file.arrayBuffer();
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AudioCtx({ sampleRate: CHUNK_SAMPLE_RATE });
  const decoded = await ctx.decodeAudioData(arrayBuffer);
  ctx.close();
  return decoded;
}
function getMonoChannel(buffer: AudioBuffer): Float32Array {
  if (buffer.numberOfChannels > 1) {
    const channel = new Float32Array(buffer.length);
    for (let i = 0; i < buffer.length; i++) { let sum = 0; for (let c = 0; c < buffer.numberOfChannels; c++) sum += buffer.getChannelData(c)[i]; channel[i] = sum / buffer.numberOfChannels; }
    return channel;
  }
  return buffer.getChannelData(0);
}
function float32ToInt16(float32: Float32Array): Int16Array {
  const int16 = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) { const s = Math.max(-1, Math.min(1, float32[i])); int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff; }
  return int16;
}
function int16ToWavBlob(int16: Int16Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + int16.length * 2);
  const view = new DataView(buffer);
  const writeString = (offset: number, str: string) => { for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i)); };
  writeString(0, 'RIFF'); view.setUint32(4, 36 + int16.length * 2, true); writeString(8, 'WAVE'); writeString(12, 'fmt ');
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true); view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true); writeString(36, 'data');
  view.setUint32(40, int16.length * 2, true);
  let offset = 44; for (let i = 0; i < int16.length; i++) { view.setInt16(offset, int16[i], true); offset += 2; }
  return new Blob([buffer], { type: 'audio/wav' });
}
async function transcribeChunk(wavBlob: Blob, chunkIndex: number): Promise<string> {
  const formData = new FormData();
  formData.append('file', wavBlob, `chunk-${chunkIndex}.wav`);
  formData.append('model', GROQ_MODEL);
  formData.append('language', 'es');
  formData.append('response_format', 'json');
  formData.append('prompt', PARAGUAYAN_SPANISH_PROMPT);
  const response = await fetch(TRANSCRIBE_URL, { method: 'POST', headers: { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` }, body: formData });
  if (!response.ok) {
    let errText = await response.text().catch(() => '');
    let detail = errText;
    try { const j = JSON.parse(errText); detail = j.error || errText; } catch { /* keep raw */ }
    throw new Error(`Transcripción ${response.status}: ${detail || response.statusText}`);
  }
  const data = await response.json() as { text?: string };
  return (data.text || '').trim();
}
function structureIntoParagraphs(text: string): string {
  const sentences = text.replace(/\s+/g, ' ').trim().split(/(?<=[.!?])\s+/);
  const paragraphs: string[] = []; let current: string[] = [];
  for (const sentence of sentences) { current.push(sentence); if (current.length >= 3) { paragraphs.push(current.join(' ')); current = []; } }
  if (current.length > 0) paragraphs.push(current.join(' '));
  return paragraphs.join('\n\n');
}

export default function TranscriptionTab({ t, onReviewSubmitted }: TranscriptionTabProps) {
  const [file, setFile] = useState<File | null>(null);
  const [transcript, setTranscript] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [showReview, setShowReview] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [chunksDone, setChunksDone] = useState(0);
  const [totalChunks, setTotalChunks] = useState(0);

  const handleTranscribe = useCallback(async () => {
    if (!file) return;
    setError(''); setShowReview(false); setTranscript(''); setProgress(0); setChunksDone(0);
    try {
      setPhase('extracting');
      const audioBuffer = await decodeAudio(file);
      const mono = getMonoChannel(audioBuffer);
      const numChunks = Math.ceil(mono.length / CHUNK_SAMPLES);
      setTotalChunks(numChunks);
      setPhase('processing');
      let rawText = '';
      for (let i = 0; i < numChunks; i++) {
        const start = i * CHUNK_SAMPLES; const end = Math.min(start + CHUNK_SAMPLES, mono.length);
        const chunkFloat = mono.slice(start, end);
        const chunkInt16 = float32ToInt16(chunkFloat);
        const wavBlob = int16ToWavBlob(chunkInt16, CHUNK_SAMPLE_RATE);
        if (i === 0) setPhase('analyzing');
        const chunkText = await transcribeChunk(wavBlob, i);
        if (chunkText) { rawText += (rawText ? ' ' : '') + chunkText; setTranscript(rawText); }
        setChunksDone(i + 1); setProgress(Math.round(((i + 1) / numChunks) * 80));
      }
      setPhase('structuring'); setProgress(90);
      const structured = structureIntoParagraphs(rawText);
      setTranscript(structured); setProgress(100); setPhase('done');
      if (structured.trim()) setShowReview(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : t.trVoiceError;
      setError(msg);
      setPhase('idle');
    }
  }, [file, t]);

  const handleCopy = async () => { await navigator.clipboard.writeText(transcript); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const handleDownloadTxt = () => { const blob = new Blob([transcript], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${file?.name.replace(/\.[^/.]+$/, '') || 'transcripcion'}.txt`; a.click(); URL.revokeObjectURL(url); };
  const handleFileChange = (f: File) => { setFile(f); setTranscript(''); setShowReview(false); setError(''); setPhase('idle'); setProgress(0); setChunksDone(0); setTotalChunks(0); };
  const busy = phase === 'extracting' || phase === 'processing' || phase === 'analyzing' || phase === 'structuring';
  const phaseLabel = (() => { switch (phase) { case 'extracting': return t.trExtractingAudio; case 'processing': return t.trPhaseProcessing; case 'analyzing': return t.trPhaseAnalyzing; case 'structuring': return t.trPhaseStructuring; default: return t.trTranscribing; } })();

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6">
      <div className="mb-6 text-center"><h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">{t.trTitle}</h2><p className="mt-2 text-sm text-slate-500">{t.trSubtitle}</p></div>
      <DropZone onFile={handleFileChange} title={t.trDropTitle} subtitle={t.trDropSubtitle} accept="audio/*,video/*,.mp3,.wav,.m4a,.mp4,.webm,.ogg" hasItems={!!file} accent="amber" />
      {file && (
        <div className="mt-5 space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800"><Info size={15} className="mt-0.5 shrink-0 text-amber-600" /><span>{t.trWarning}</span></div>
          <FilePreview file={file} t={t} />
          <button onClick={handleTranscribe} disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700 disabled:opacity-60 sm:text-base">
            {busy ? <Loader2 size={18} className="animate-spin" /> : <AudioLines size={18} />}{busy ? t.trTranscribing : t.trTranscribe}
          </button>
          {busy && (
            <div className="space-y-3 rounded-xl bg-amber-50 p-4">
              <div className="flex items-center justify-between text-sm font-medium text-amber-800">
                <span className="flex items-center gap-2"><Cloud size={16} className="text-amber-600" />{phaseLabel}</span>
                {totalChunks > 0 && <span className="text-xs">{t.trChunksDone}: {chunksDone}/{totalChunks}</span>}
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-amber-200"><div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300" style={{ width: `${progress}%` }} /></div>
              <div className="flex justify-between text-xs text-amber-600"><span>{t.trProcessing}</span><span>{progress}%</span></div>
            </div>
          )}
          {(transcript || phase === 'done') && (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label className="text-sm font-medium text-slate-700">{t.trResult}</label>
                <div className="flex gap-2">
                  {transcript && <button onClick={handleDownloadTxt} className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-200"><Download size={15} /> {t.trDownloadTxt}</button>}
                  {transcript && <button onClick={handleCopy} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${copied ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? t.trCopied : t.trCopy}</button>}
                </div>
              </div>
              <textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} placeholder={t.trResultPlaceholder} rows={12} className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200" />
            </div>
          )}
          {error && <div className="flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-700"><AlertCircle size={18} className="mt-0.5 shrink-0" /><span>{error}</span></div>}
          {showReview && <ReviewForm t={t} onSubmitted={onReviewSubmitted} />}
        </div>
      )}
    </div>
  );
}
