import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import {
  Upload,
  ScanText,
  Loader2,
  CheckCircle2,
  Copy,
  Download,
  Star,
  Sparkles,
  Home as HomeIcon,
  X,
  FileText
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useTranslation } from '../lib/i18n';
import AdBanner from './AdBanner';
import Header from './Header';
import Footer from './Footer';

type FunnelStep = 'upload' | 'loading' | 'result' | 'thanks';

interface PageSummary {
  page: number;
  engine: string;
}

export const OcrSection: React.FC = () => {
  const { t } = useTranslation();
  const [step, setStep] = useState<FunnelStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [ocrResultText, setOcrResultText] = useState<string>('');
  const [pageSummary, setPageSummary] = useState<PageSummary[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Avaliação (Passo 4)
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [isSubmittingRating, setIsSubmittingRating] = useState<boolean>(false);
  const [ratingSubmitted, setRatingSubmitted] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gera e limpa ObjectURL para pré-visualização da 1ª página / imagem
  useEffect(() => {
    if (!file) {
      setPreviewUrl('');
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const handleFileSelect = (selectedFile: File) => {
    setErrorMessage(null);
    if (!selectedFile.type.includes('pdf') && !selectedFile.type.includes('image')) {
      setErrorMessage(t('ocr.invalidFormat', 'Selecione um arquivo PDF ou imagem válida.'));
      return;
    }
    setFile(selectedFile);
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleProcessOcr = async () => {
    if (!file) return;
    setStep('loading');
    setErrorMessage(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64String = (reader.result as string).split(',')[1];
        
        const response = await fetch('/api/ocr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pdfBase64: base64String })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Falha ao processar OCR');

        setOcrResultText(data.text);
        setPageSummary(data.summary || []);
        setStep('result');
      };
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || t('ocr.errorMsg', 'Erro ao realizar OCR no arquivo.'));
      setStep('upload');
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(ocrResultText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([ocrResultText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OCR-PropedeuticaPDF-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setStep('thanks');
  };

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingRating(true);

    try {
      await supabase.from('avaliacoes').insert([
        {
          estrelas: Number(rating),
          comentario: comment.trim() || null,
          ferramenta: 'ocr',
          aprovado: false
        }
      ]);
      setRatingSubmitted(true);
    } catch (err) {
      console.error('Erro no Supabase:', err);
      setRatingSubmitted(true);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col justify-between font-sans">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 w-full space-y-8">
        <Header />

        <div className="w-full flex justify-center my-4">
          <AdBanner page="ocr" position="top" />
        </div>

        {/* PASSO 1: UPLOAD */}
        {step === 'upload' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
                {t('ocr.title', 'OCR Inteligente de PDF & Imagem')}
              </h1>
              <p className="text-slate-600 dark:text-slate-300">
                {t('ocr.subtitle', 'Reconheça e extraia texto legível com orquestração de IA resiliente.')}
              </p>
            </div>

            {errorMessage && (
              <div className="p-4 bg-red-50 dark:bg-red-950/50 border-l-4 border-red-500 rounded-r-xl text-red-700 dark:text-red-200 text-sm flex items-center justify-between">
                <span>{errorMessage}</span>
                <button onClick={() => setErrorMessage(null)}><X className="w-5 h-5" /></button>
              </div>
            )}

            <input type="file" ref={fileInputRef} onChange={handleFileInputChange} accept=".pdf,image/*" className="hidden" />

            {/* Exibição do Card com Miniatura da Pág 1 e Nome Completo */}
            {file ? (
              <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between gap-4 max-w-xl mx-auto">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-20 h-24 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex-shrink-0 flex items-center justify-center relative shadow-inner">
                    {file.type.startsWith('image/') ? (
                      <img src={previewUrl} alt="Miniatura" className="w-full h-full object-cover" />
                    ) : (
                      <embed src={`${previewUrl}#page=1&view=Fit`} type="application/pdf" className="w-full h-full object-cover pointer-events-none" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <span className="px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 text-[10px] font-bold uppercase tracking-wide">
                      {file.type.includes('pdf') ? 'Documento PDF' : 'Imagem'}
                    </span>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 break-all leading-snug mt-1.5">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setFile(null)}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                  title="Remover arquivo"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  isDragging ? 'border-teal-500 bg-teal-50/60 dark:bg-teal-950/20 scale-[1.01]' : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'
                }`}
              >
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="p-3 bg-teal-50 dark:bg-teal-950/50 rounded-full text-teal-600 dark:text-teal-400">
                    <ScanText className="w-8 h-8" />
                  </div>
                  <div className="text-slate-700 dark:text-slate-200 font-semibold">
                    {t('ocr.clickSelect', 'Clique para selecionar PDF ou Imagem')}
                  </div>
                  <p className="text-xs text-slate-400">
                    {t('ocr.hint', 'Suporta PDFs escaneados, documentos e fotos em geral')}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <button
                onClick={handleProcessOcr}
                disabled={!file}
                className={`px-8 py-3.5 rounded-xl font-semibold text-white shadow-md transition-all ${
                  !file ? 'bg-slate-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700'
                }`}
              >
                {t('ocr.btnStart', 'Iniciar OCR Inteligente')}
              </button>
            </div>
          </div>
        )}

        {/* PASSO 2: LOADING */}
        {step === 'loading' && (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm">
            <Loader2 className="w-16 h-16 text-teal-600 animate-spin" />
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">{t('ocr.loadingTitle', 'Processando com Orquestrador Inteligente...')}</h2>
              <p className="text-sm text-slate-500">{t('ocr.loadingSub', 'Processando páginas e aplicando inteligência artificial e failover.')}</p>
            </div>
          </div>
        )}

        {/* PASSO 3: RESULTADO */}
        {step === 'result' && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4 border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-teal-600" />
                {t('ocr.resultTitle', 'Texto Extraído com Sucesso')}
              </h2>
              <div className="flex gap-2">
                <button onClick={handleCopyText} className="px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1">
                  <Copy className="w-4 h-4" />
                  {copied ? t('ocr.copied', 'Copiado!') : t('ocr.copyBtn', 'Copiar Texto')}
                </button>
                <button onClick={handleDownloadTxt} className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1">
                  <Download className="w-4 h-4" />
                  {t('ocr.downloadTxt', 'Baixar TXT')}
                </button>
              </div>
            </div>

            {pageSummary.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {pageSummary.map((ps) => (
                  <span key={ps.page} className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 text-xs font-medium border border-teal-200 dark:border-teal-800">
                    Pág {ps.page}: {ps.engine}
                  </span>
                ))}
              </div>
            )}

            <textarea
              readOnly
              value={ocrResultText}
              rows={14}
              className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 font-mono text-sm leading-relaxed focus:outline-none"
            />
          </div>
        )}

        {/* PASSO 4: AGRADECIMENTO */}
        {step === 'thanks' && (
          <div className="py-10 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 text-center space-y-8 max-w-2xl mx-auto">
            <div className="space-y-3">
              <Sparkles className="w-10 h-10 text-teal-600 mx-auto" />
              <h2 className="text-2xl font-bold">{t('ocr.thanksTitle', 'Obrigado por utilizar o PropedeuticaPDF!')}</h2>
              <p className="text-sm text-slate-500">{t('ocr.thanksSub', 'Como foi a precisão da extração do seu documento?')}</p>
            </div>

            {!ratingSubmitted ? (
              <form onSubmit={handleSubmitRating} className="bg-slate-50 dark:bg-slate-900/60 p-6 rounded-2xl border text-left space-y-4">
                <label className="block text-xs font-bold uppercase">{t('unir.rateLabel', 'Sua Nota (1 a 5 Estrelas):')}</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button type="button" key={star} onClick={() => setRating(star)}>
                      <Star className={`w-7 h-7 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  placeholder={t('unir.commentPlaceholder', 'Deixe uma sugestão ou feedback...')}
                  className="w-full p-3 text-sm rounded-xl border bg-white dark:bg-slate-800"
                />
                <button type="submit" disabled={isSubmittingRating} className="w-full py-2.5 bg-teal-600 text-white rounded-xl font-semibold">
                  {isSubmittingRating ? t('unir.submitting', 'Enviando...') : t('unir.submitRatingBtn', 'Enviar Avaliação Anônima')}
                </button>
              </form>
            ) : (
              <div className="p-4 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 rounded-2xl text-teal-800 text-sm font-medium">
                {t('unir.ratingSuccess', 'Sua avaliação foi registrada com sucesso! Muito obrigado.')}
              </div>
            )}

            <a href="/" className="inline-flex items-center gap-2 px-6 py-3 border rounded-xl text-sm font-semibold">
              <HomeIcon className="w-4 h-4" />
              <span>{t('unir.backHome', 'Voltar para a Página Inicial')}</span>
            </a>
          </div>
        )}

        <div className="w-full flex justify-center my-4">
          <AdBanner page="ocr" position="bottom" />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OcrSection;