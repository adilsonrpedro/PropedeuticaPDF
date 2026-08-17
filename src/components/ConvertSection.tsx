// src/components/ConvertSection.tsx
import React, { useState, useEffect, useRef, ChangeEvent, DragEvent } from 'react';
import { PDFDocument } from 'pdf-lib';
import {
  Upload,
  FileText,
  ArrowUp,
  ArrowDown,
  Trash2,
  Loader2,
  Download,
  Star,
  CheckCircle2,
  X,
  Plus,
  Home as HomeIcon,
  Sparkles
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getTranslation } from '../lib/i18n';
import AdBanner from './AdBanner';
import Header from './Header';
import Footer from './Footer';

type FunnelStep = 'upload' | 'loading' | 'download' | 'thanks';

export const ConvertSection: React.FC = () => {
  const [funnelStep, setFunnelStep] = useState<FunnelStep>('upload');
  const [files, setFiles] = useState<File[]>([]);
  const [mergedBytes, setMergedBytes] = useState<Uint8Array | null>(null);
  const [outputFileName, setOutputFileName] = useState<string>('PropedeuticaPDF-Unir');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [isSubmittingRating, setIsSubmittingRating] = useState<boolean>(false);
  const [ratingSubmitted, setRatingSubmitted] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddFiles = (newFiles: FileList | File[]) => {
    setErrorMessage(null);
    const pdfFiles = Array.from(newFiles).filter(
      (file) => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    );
    if (pdfFiles.length === 0) {
      setErrorMessage(getTranslation('unir.onlyPdfError', 'Por favor, selecione apenas arquivos em formato PDF.'));
      return;
    }
    setFiles((prev) => [...prev, ...pdfFiles]);
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleAddFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleAddFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setErrorMessage(null);
  };

  const handleMoveFile = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= files.length) return;
    const updated = [...files];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setFiles(updated);
  };

  const handleClearAll = () => { setFiles([]); setErrorMessage(null); };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleMergePDFs = async () => {
    if (files.length < 2) {
      setErrorMessage(getTranslation('unir.minFilesError', 'Adicione pelo menos 2 arquivos PDF para realizar a união.'));
      return;
    }
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const mergedPdf = await PDFDocument.create();
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }
      const pdfBytes = await mergedPdf.save();
      setMergedBytes(pdfBytes);
      setFunnelStep('loading');
    } catch (error) {
      console.error('Erro ao unir PDFs:', error);
      setErrorMessage(getTranslation('unir.processError', 'Ocorreu um erro ao processar os PDFs. Certifique-se de que nenhum arquivo esteja protegido por senha ou corrompido.'));
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (funnelStep === 'loading') {
      const timer = setTimeout(() => setFunnelStep('download'), 3000);
      return () => clearTimeout(timer);
    }
  }, [funnelStep]);

  const handleDownload = () => {
    if (!mergedBytes) return;
    const cleanFileName = outputFileName.trim() || 'PropedeuticaPDF-Unir';
    const finalName = cleanFileName.toLowerCase().endsWith('.pdf') ? cleanFileName : `${cleanFileName}.pdf`;

    const blob = new Blob([mergedBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = finalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setFunnelStep('thanks');
  };

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingRating(true);

    try {
      const ratingNumber = Number(rating);
      const commentText = comment.trim() || null;

      const { error } = await supabase.from('avaliacoes').insert([
        { estrelas: ratingNumber, comentario: commentText, ferramenta: 'unir' }
      ]);

      if (error) {
        console.error('Erro no Supabase:', error);
        alert('ERRO SUPABASE DETECTADO: ' + error.message + ' - Código: ' + error.code + ' - Detalhes: ' + (error.details || 'Nenhum detalhe extra'));
      } else {
        alert('SUCESSO: Avaliação gravada no Supabase! Vá para a Home.');
        setRatingSubmitted(true);
      }
    } catch (err: any) {
      console.error('Exceção ao enviar avaliação:', err);
      alert('EXCEÇÃO DE CONEXÃO: ' + (err?.message || JSON.stringify(err)));
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
          <AdBanner page="unir" position="top" />
        </div>

        {/* PASSO 1: UPLOAD DE ARQUIVOS */}
        {funnelStep === 'upload' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
                {getTranslation('unir.title', 'Unir PDFs')}
              </h1>
              <p className="text-slate-600 dark:text-slate-300">
                {getTranslation('unir.subtitle', 'Combine vários arquivos PDF em um único documento em segundos.')}
              </p>
            </div>

            {errorMessage && (
              <div className="p-4 bg-red-50 dark:bg-red-950/50 border-l-4 border-red-500 rounded-r-xl text-red-700 dark:text-red-200 text-sm flex items-center justify-between shadow-sm">
                <span>{errorMessage}</span>
                <button onClick={() => setErrorMessage(null)} className="text-red-500 hover:text-red-700 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            <input type="file" ref={fileInputRef} onChange={handleFileInputChange} multiple accept=".pdf,application/pdf" className="hidden" />

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
                isDragging ? 'border-teal-500 bg-teal-50/60 dark:bg-teal-950/20 scale-[1.01]' : 'border-slate-300 dark:border-slate-700 hover:border-teal-400 bg-white dark:bg-slate-800'
              }`}
            >
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="p-3 bg-teal-50 dark:bg-teal-950/50 rounded-full text-teal-600 dark:text-teal-400">
                  <Upload className="w-8 h-8" />
                </div>
                <div className="text-slate-700 dark:text-slate-200">
                  <span className="font-semibold text-teal-600 dark:text-teal-400 hover:underline">
                    {getTranslation('unir.clickSelect', 'Clique para selecionar')}
                  </span>{' '}
                  {getTranslation('unir.orDrag', 'ou arraste seus PDFs aqui')}
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {getTranslation('unir.selectHint', 'Selecione dois ou mais arquivos para juntar')}
                </p>
              </div>
            </div>

            {files.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/80 dark:bg-slate-800/80">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {getTranslation('unir.selectedFiles', 'Arquivos Selecionados')} ({files.length})
                  </span>
                  <button onClick={handleClearAll} className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors">
                    {getTranslation('unir.removeAll', 'Remover todos')}
                  </button>
                </div>

                <ul className="divide-y divide-slate-100 dark:divide-slate-700 max-h-80 overflow-y-auto">
                  {files.map((file, index) => (
                    <li key={`${file.name}-${index}`} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors">
                      <div className="flex items-center space-x-3 min-w-0 pr-4">
                        <div className="p-2 bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 rounded-lg flex-shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{file.name}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <button type="button" onClick={() => handleMoveFile(index, 'up')} disabled={index === 0} title="Mover para cima" className="p-1.5 text-slate-400 hover:text-teal-600 disabled:opacity-30">
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button type="button" onClick={() => handleMoveFile(index, 'down')} disabled={index === files.length - 1} title="Mover para baixo" className="p-1.5 text-slate-400 hover:text-teal-600 disabled:opacity-30">
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button type="button" onClick={() => handleRemoveFile(index)} title="Remover arquivo" className="p-1.5 text-red-400 hover:text-red-600 ml-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4">
              {files.length > 0 && (
                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full sm:w-auto px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>{getTranslation('unir.addMore', 'Adicionar mais PDFs')}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleMergePDFs}
                disabled={files.length < 2 || isProcessing}
                className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-white shadow-md transition-all duration-200 flex items-center justify-center gap-2 ${
                  files.length < 2 || isProcessing ? 'bg-slate-400 dark:bg-slate-600 cursor-not-allowed opacity-70' : 'bg-teal-600 hover:bg-teal-700 active:scale-[0.98]'
                }`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{getTranslation('unir.processing', 'Processando...')}</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5" />
                    <span>{getTranslation('unir.btnMerge', 'Unir PDFs')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* PASSO 2: CARREGANDO (3 SEGUNDOS) */}
        {funnelStep === 'loading' && (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm">
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-4 border-teal-100 dark:border-teal-950 animate-pulse" />
              <div className="absolute w-16 h-16 rounded-full border-4 border-teal-600 border-t-transparent animate-spin" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {getTranslation('unir.loadingTitle', 'Processando e preparando seus documentos...')}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {getTranslation('unir.loadingSubtitle', 'Isso levará apenas alguns segundos.')}
              </p>
            </div>
          </div>
        )}

        {/* PASSO 3: DOWNLOAD */}
        {funnelStep === 'download' && (
          <div className="py-12 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm text-center space-y-6 max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {getTranslation('unir.readyTitle', 'Seu PDF Unificado está Pronto!')}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {getTranslation('unir.readySubtitle', 'Escolha o nome do seu arquivo e faça o download gratuito.')}
              </p>
            </div>

            <div className="space-y-2 text-left max-w-md mx-auto">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {getTranslation('unir.fileNameLabel', 'Nome do arquivo de saída:')}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={outputFileName}
                  onChange={(e) => setOutputFileName(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="PropedeuticaPDF-Unir"
                />
                <span className="text-sm font-semibold text-slate-400">.pdf</span>
              </div>
            </div>

            <button
              onClick={handleDownload}
              className="w-full sm:w-auto px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl shadow-md transition-all active:scale-[0.98] inline-flex items-center justify-center gap-2 mx-auto"
            >
              <Download className="w-5 h-5" />
              <span>{getTranslation('unir.downloadBtn', 'Baixar Arquivo PDF')}</span>
            </button>
          </div>
        )}

        {/* PASSO 4: AGRADECIMENTO E AVALIAÇÃO */}
        {funnelStep === 'thanks' && (
          <div className="py-10 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm text-center space-y-8 max-w-2xl mx-auto">
            <div className="space-y-3">
              <div className="w-14 h-14 bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {getTranslation('unir.thanksTitle', 'Obrigado por usar o PropedeuticaPDF!')}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                {getTranslation('unir.thanksSubtitle', 'Seu download foi iniciado. Como foi sua experiência ao usar nossa ferramenta?')}
              </p>
            </div>

            {!ratingSubmitted ? (
              <form onSubmit={handleSubmitRating} className="bg-slate-50 dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 text-left">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  {getTranslation('unir.rateLabel', 'Sua Nota (1 a 5 Estrelas):')}
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1 text-amber-400 hover:scale-110 transition-transform"
                    >
                      <Star className={`w-7 h-7 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
                    </button>
                  ))}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {getTranslation('unir.commentLabel', 'Comentário Anônimo (Opcional):')}
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    placeholder={getTranslation('unir.commentPlaceholder', 'Deixe uma sugestão ou feedback...')}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingRating}
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmittingRating ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>{getTranslation('unir.submitRatingBtn', 'Enviar Avaliação Anônima')}</span>}
                </button>
              </form>
            ) : (
              <div className="p-4 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-2xl text-teal-800 dark:text-teal-200 text-sm font-medium">
                {getTranslation('unir.ratingSuccess', 'Sua avaliação foi registrada com sucesso! Muito obrigado.')}
              </div>
            )}

            <div className="pt-2">
              <a href="/" className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-slate-300 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors">
                <HomeIcon className="w-4 h-4" />
                <span>{getTranslation('unir.backHome', 'Voltar para a Página Inicial')}</span>
              </a>
            </div>
          </div>
        )}

        <div className="w-full flex justify-center my-4">
          <AdBanner page="unir" position="bottom" />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ConvertSection;