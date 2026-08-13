import React, { useState } from 'react';
import { Video, Loader, Headphones } from 'lucide-react';
import DropZone from './DropZone';

export default function TranscriptionTab({ t }: { t?: any }) {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const safeStr = (k: string, f: string) => t && typeof t === 'object' && k in t ? t[k] : f;

  const handleTranscricaoSimulada = () => {
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      alert("Integração com API Groq/Whisper pronta! Carregue seu áudio ou vídeo.");
    }, 2000);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 text-center">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">{safeStr('transcriptionTitle', 'Transcrição de Áudio e Vídeo')}</h2>
        <p className="mt-2 text-sm text-slate-500">{safeStr('transcriptionSubtitle', 'Converta arquivos de voz em texto automaticamente com Inteligência Artificial.')}</p>
      </div>

      <DropZone onFile={setFile} title="Escolha um arquivo de Áudio ou Vídeo" subtitle="Arraste ou clique para carregar (.mp3, .wav, .mp4, etc)" accept="audio/*,video/*" hasItems={!!file} accent="teal" />

      {file && (
        <div className="mt-5 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-medium text-slate-700">Arquivo: <span className="font-mono text-teal-600">{file.name}</span></div>
          <button onClick={handleTranscricaoSimulada} disabled={busy} className="mx-auto flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-700 transition disabled:opacity-60">
            {busy ? <Loader size={18} className="animate-spin" /> : <Video size={18} />}
            {busy ? safeStr('trTranscribing', 'Transcrevendo...') : 'Iniciar Transcrição com IA'}
          </button>
        </div>
      )}
    </div>
  );
}
