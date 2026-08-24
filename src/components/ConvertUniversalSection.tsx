import React, { useState, useRef, useEffect, ChangeEvent, DragEvent } from 'react';
import { PDFDocument } from 'pdf-lib';
import {
  Upload,
  Image as ImageIcon,
  RotateCw,
  ArrowLeft,
  ArrowRight,
  Trash2,
  Loader2,
  Download,
  Star,
  CheckCircle2,
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

type FunnelStep = 1 | 2 | 3 | 4;

interface FileItem {
  id: string;
  file: File;
  rotation: number;
  previewUrl: string;
}

interface GeneratedPdf {
  name: string;
  bytes: Uint8Array;
}

export const ConvertUniversalSection: React.FC = () => {
  const { t } = useTranslation();
  const [step, setStep] = useState<FunnelStep>(1);
  const [items, setItems] = useState<FileItem[]>([]);
  const [outputMode, setOutputMode] = useState<'united' | 'separate'>('united');
  const [outputFileName, setOutputFileName] = useState<string>('PropedeuticaPDF-Convertido');
  
  const [generatedPdfs, setGeneratedPdfs] = useState<GeneratedPdf[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Passo 4: Avaliação
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [isSubmittingRating, setIsSubmittingRating] = useState<boolean>(false);
  const [ratingSubmitted, setRatingSubmitted] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Limpeza de URLs temporárias
  useEffect(() => {
    return () => {
      items.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, []);

  const handleAddFiles = (newFiles: FileList | File[]) => {
    setErrorMessage(null);
    const validFiles = Array.from(newFiles).filter((f) => f.type.startsWith('image/'));

    if (validFiles.length === 0) {
      setErrorMessage(t('converter.invalidFormat', 'Selecione apenas arquivos de imagem (JPG, PNG, WEBP).'));
      return;
    }

    const newItems: FileItem[] = validFiles.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      rotation: 0,
      previewUrl: URL.createObjectURL(file)
    }));

    setItems((prev) => [...prev, ...newItems]);
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleAddFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleRotate = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, rotation: (item.rotation + 90) % 360 } : item))
    );
  };

  const handleMove = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const updated = [...items];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setItems(updated);
  };

  const handleRemove = (id: string) => {
    setItems((prev) => {
      const itemToRemove = prev.find((i) => i.id === id);
      if (itemToRemove) URL.revokeObjectURL(itemToRemove.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  };

  // Processamento 100% no cliente usando Canvas e pdf-lib ($0 Custo de Servidor)
  const processImageToJpegBytes = async (file: File, rotation: number): Promise<ArrayBuffer> => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = url;
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    if (rotation % 180 !== 0) {
      canvas.width = img.height;
      canvas.height = img.width;
    } else {
      canvas.width = img.width;
      canvas.height = img.height;
    }

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    URL.revokeObjectURL(url);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    return await fetch(dataUrl).then((res) => res.arrayBuffer());
  };

  const handleConvert = async () => {
    if (items.length === 0) return;
    setStep(2);
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      if (outputMode === 'united') {
        const mergedDoc = await PDFDocument.create();
        for (const item of items) {
          const jpegBytes = await processImageToJpegBytes(item.file, item.rotation);
          const embeddedImg = await mergedDoc.embedJpg(jpegBytes);
          const page = mergedDoc.addPage([embeddedImg.width, embeddedImg.height]);
          page.drawImage(embeddedImg, { x: 0, y: 0, width: embeddedImg.width, height: embeddedImg.height });
        }
        const pdfBytes = await mergedDoc.save();
        setGeneratedPdfs([{ name: `${outputFileName}.pdf`, bytes: pdfBytes }]);
      } else {
        const pdfsList: GeneratedPdf[] = [];
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const singleDoc = await PDFDocument.create();
          const jpegBytes = await processImageToJpegBytes(item.file, item.rotation);
          const embeddedImg = await singleDoc.embedJpg(jpegBytes);
          const page = singleDoc.addPage([embeddedImg.width, embeddedImg.height]);
          page.drawImage(embeddedImg, { x: 0, y: 0, width: embeddedImg.width, height: embeddedImg.height });
          const pdfBytes = await singleDoc.save();
          const baseName = item.file.name.replace(/\.[^/.]+$/, '');
          pdfsList.push({ name: `${baseName}-Convertido.pdf`, bytes: pdfBytes });
        }
        setGeneratedPdfs(pdfsList);
      }
      setStep(3);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(t('converter.errorMsg', 'Ocorreu um erro ao converter os arquivos.'));
      setStep(1);
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerDownload = (bytes: Uint8Array, filename: string) => {
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    generatedPdfs.forEach((pdf, index) => {
      setTimeout(() => triggerDownload(pdf.bytes, pdf.name), index * 300);
    });
    setStep(4);
  };

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingRating(true);

    try {
      await supabase.from('avaliacoes').insert([
        {
          estrelas: Number(rating),
          comentario: comment.trim() || null,
          ferramenta: 'converter',
          aprovado: false
        }
      ]);
      setRatingSubmitted(true);
    } catch (err) {
      console.error('Erro Supabase:', err);
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
          <AdBanner page="converter" position="top" />
        </div>

        {/* PASSO 1: UPLOAD, ORGANIZAÇÃO & OPÇÕES */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
                {t('converter.title', 'Converter para PDF Universal')}
              </h1>
              <p className="text-slate-600 dark:text-slate-300">
                {t('converter.subtitle', 'Transforme fotos e imagens em PDFs organizados com processamento local.')}
              </p>
            </div>

            {errorMessage && (
              <div className="p-4 bg-red-50 dark:bg-red-950/50 border-l-4 border-red-500 rounded-r-xl text-red-700 dark:text-red-200 text-sm flex items-center justify-between shadow-sm">
                <span>{errorMessage}</span>
                <button onClick={() => setErrorMessage(null)}><X className="w-5 h-5" /></button>
              </div>
            )}

            <input type="file" ref={fileInputRef} onChange={handleFileInputChange} accept="image/*,.jpg,.jpeg,.png,.webp" multiple className="hidden" />

            {/* DropZone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files) handleAddFiles(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                isDragging ? 'border-teal-500 bg-teal-50/60 dark:bg-teal-950/20 scale-[1.01]' : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'
              }`}
            >
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="p-3 bg-teal-50 dark:bg-teal-950/50 rounded-full text-teal-600 dark:text-teal-400">
                  <ImageIcon className="w-8 h-8" />
                </div>
                <div className="text-slate-700 dark:text-slate-200 font-semibold">
                  {t('converter.clickSelect', 'Clique para selecionar imagens (JPG, PNG, WEBP)')}
                </div>
                <p className="text-xs text-slate-400">
                  {t('converter.hint', 'Arraste vários arquivos para ordenar e converter')}
                </p>
              </div>
            </div>

            {/* Grade de Miniaturas com Rotação e Ordenação */}
            {items.length > 0 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    {t('converter.filesCount', 'Imagens Carregadas')} ({items.length})
                  </span>
                  <button onClick={() => fileInputRef.current?.click()} className="text-xs font-semibold text-teal-600 hover:underline">
                    + {t('converter.addMore', 'Adicionar mais')}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {items.map((item, index) => (
                    <div key={item.id} className="bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between space-y-3">
                      <div className="w-full h-32 bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center relative">
                        <img
                          src={item.previewUrl}
                          alt={item.file.name}
                          style={{ transform: `rotate(${item.rotation}deg)` }}
                          className="max-h-full max-w-full object-contain transition-transform duration-200"
                        />
                        <span className="absolute top-1 left-1 bg-slate-900/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                          #{index + 1}
                        </span>
                      </div>

                      <p className="text-xs font-medium truncate text-slate-700 dark:text-slate-300">{item.file.name}</p>

                      {/* Controles do Cartão */}
                      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-2">
                        <button type="button" onClick={() => handleRotate(item.id)} className="p-1 text-teal-600 hover:bg-teal-50 rounded" title="Rotacionar 90°">
                          <RotateCw className="w-4 h-4" />
                        </button>
                        <div className="flex gap-1">
                          <button type="button" onClick={() => handleMove(index, 'left')} disabled={index === 0} className="p-1 text-slate-400 disabled:opacity-30">
                            <ArrowLeft className="w-4 h-4" />
                          </button>
                          <button type="button" onClick={() => handleMove(index, 'right')} disabled={index === items.length - 1} className="p-1 text-slate-400 disabled:opacity-30">
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                        <button type="button" onClick={() => handleRemove(item.id)} className="p-1 text-red-400 hover:text-red-600" title="Remover">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Opções de Saída */}
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-4 justify-between items-center">
                  <div className="flex gap-4">
                    <label className="inline-flex items-center gap-2 text-xs font-bold cursor-pointer">
                      <input
                        type="radio"
                        name="outputMode"
                        checked={outputMode === 'united'}
                        onChange={() => setOutputMode('united')}
                        className="text-teal-600 focus:ring-teal-500"
                      />
                      <span>{t('converter.modeUnited', 'Tudo Unido em 1 PDF')}</span>
                    </label>
                    <label className="inline-flex items-center gap-2 text-xs font-bold cursor-pointer">
                      <input
                        type="radio"
                        name="outputMode"
                        checked={outputMode === 'separate'}
                        onChange={() => setOutputMode('separate')}
                        className="text-teal-600 focus:ring-teal-500"
                      />
                      <span>{t('converter.modeSeparate', 'PDFs Separados')}</span>
                    </label>
                  </div>

                  {outputMode === 'united' && (
                    <input
                      type="text"
                      value={outputFileName}
                      onChange={(e) => setOutputFileName(e.target.value)}
                      className="px-3 py-1.5 text-xs rounded-xl border bg-slate-50 dark:bg-slate-900 w-full sm:w-auto"
                      placeholder="Nome do PDF"
                    />
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <button onClick={handleConvert} className="px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl shadow-md">
                    {t('converter.btnConvert', 'Converter para PDF')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PASSO 2: PROCESSING */}
        {step === 2 && (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm">
            <Loader2 className="w-16 h-16 text-teal-600 animate-spin" />
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">{t('converter.loadingTitle', 'Convertendo arquivos em PDF...')}</h2>
              <p className="text-sm text-slate-500">{t('converter.loadingSub', 'Processamento 100% local no seu navegador com custo $0.')}</p>
            </div>
          </div>
        )}

        {/* PASSO 3: DOWNLOAD */}
        {step === 3 && (
          <div className="py-12 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 text-center space-y-6 max-w-2xl mx-auto">
            <CheckCircle2 className="w-16 h-16 text-teal-600 mx-auto" />
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">{t('converter.readyTitle', 'Conversão Concluída!')}</h2>
              <p className="text-sm text-slate-500">{t('converter.readySub', 'Clique abaixo para baixar seu(s) arquivo(s) PDF.')}</p>
            </div>

            <button onClick={handleDownloadAll} className="px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl shadow-md inline-flex items-center gap-2 mx-auto">
              <Download className="w-5 h-5" />
              <span>{t('converter.downloadBtn', 'Baixar Arquivo(s) PDF')}</span>
            </button>
          </div>
        )}

        {/* PASSO 4: AGRADECIMENTO */}
        {step === 4 && (
          <div className="py-10 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 text-center space-y-8 max-w-2xl mx-auto">
            <div className="space-y-3">
              <Sparkles className="w-10 h-10 text-teal-600 mx-auto" />
              <h2 className="text-2xl font-bold">{t('converter.thanksTitle', 'Obrigado por utilizar o PropedeuticaPDF!')}</h2>
              <p className="text-sm text-slate-500">{t('converter.thanksSub', 'Como foi sua experiência ao converter para PDF?')}</p>
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
                  placeholder={t('unir.commentPlaceholder', 'Deixe uma sugestão...')}
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
          <AdBanner page="converter" position="bottom" />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ConvertUniversalSection;