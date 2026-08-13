import React, { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { PDFDocument } from 'pdf-lib';
import { ArrowUp, ArrowDown, Trash2, FileText, Plus, Upload, Loader2, X, Merge } from 'lucide-react';

interface ConvertSectionProps {
  t?: Record<string, any>;
  initialFiles?: File[];
}

export const ConvertSection: React.FC<ConvertSectionProps> = ({ t, initialFiles = [] }) => {
  const [files, setFiles] = useState<File[]>(initialFiles);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddFiles = (newFiles: FileList | File[]) => {
    setErrorMessage(null);
    const pdfFiles = Array.from(newFiles).filter(
      (file) => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    );
    if (pdfFiles.length === 0) {
      setErrorMessage('Por favor, selecione apenas arquivos em formato PDF.');
      return;
    }
    setFiles((prevFiles) => [...prevFiles, ...pdfFiles]);
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleAddFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleAddFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    setErrorMessage(null);
  };

  const handleMoveFile = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= files.length) return;
    const updatedFiles = [...files];
    const [movedFile] = updatedFiles.splice(index, 1);
    updatedFiles.splice(targetIndex, 0, movedFile);
    setFiles(updatedFiles);
  };

  const handleClearAll = () => {
    setFiles([]);
    setErrorMessage(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleMergePDFs = async () => {
    if (files.length < 2) {
      setErrorMessage('Adicione pelo menos 2 arquivos PDF para realizar a união.');
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
      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'unido_propedeutica.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao unir os arquivos PDF:', error);
      setErrorMessage(
        'Ocorreu um erro ao processar os PDFs. Certifique-se de que nenhum arquivo esteja protegido por senha ou corrompido.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Cabeçalho */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
          {t?.mergeTitle || 'Unir PDFs'}
        </h2>
        <p className="mt-2 text-base text-gray-600 dark:text-gray-300">
          {t?.mergeSubtitle || 'Combine vários arquivos PDF em um único documento em segundos.'}
        </p>
      </div>

      {/* Mensagem de erro */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/50 border-l-4 border-red-500 rounded-r-xl text-red-700 dark:text-red-200 text-sm flex items-center justify-between shadow-sm">
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-500 hover:text-red-700 dark:hover:text-red-300 p-1 transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Input de arquivo invisível */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        multiple
        accept=".pdf,application/pdf"
        className="hidden"
      />

      {/* Área de Drag & Drop */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ease-in-out ${
          isDragging
            ? 'border-teal-500 bg-teal-50/60 dark:bg-teal-950/20 scale-[1.01]'
            : 'border-gray-300 dark:border-gray-700 hover:border-teal-400 dark:hover:border-teal-500 bg-white dark:bg-gray-800'
        }`}
      >
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="p-3 bg-teal-50 dark:bg-teal-950/50 rounded-full text-teal-600 dark:text-teal-400">
            <Upload className="w-8 h-8" />
          </div>
          <div className="text-gray-700 dark:text-gray-200">
            <span className="font-semibold text-teal-600 dark:text-teal-400 hover:underline">
              Clique para selecionar
            </span>{' '}
            ou arraste e solte seus PDFs aqui
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Selecione dois ou mais arquivos PDF para juntar
          </p>
        </div>
      </div>

      {/* Lista de Arquivos Selecionados */}
      {files.length > 0 && (
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/80 dark:bg-gray-800/80">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Arquivos selecionados ({files.length})
            </span>
            <button
              onClick={handleClearAll}
              className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 font-medium transition-colors"
            >
              Remover todos
            </button>
          </div>

          <ul className="divide-y divide-gray-100 dark:divide-gray-700 max-h-80 overflow-y-auto">
            {files.map((file, index) => (
              <li
                key={`${file.name}-${index}`}
                className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-center space-x-3 min-w-0 pr-4">
                  <div className="p-2 bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 rounded-lg flex-shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMoveFile(index, 'up')}
                    disabled={index === 0}
                    title="Mover para cima"
                    className="p-1.5 text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveFile(index, 'down')}
                    disabled={index === files.length - 1}
                    title="Mover para baixo"
                    className="p-1.5 text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    title="Remover arquivo"
                    className="p-1.5 text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors ml-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Botões de Ação */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-end gap-4">
        {files.length > 0 && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full sm:w-auto px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Adicionar mais PDFs</span>
          </button>
        )}

        <button
          type="button"
          onClick={handleMergePDFs}
          disabled={files.length < 2 || isProcessing}
          className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-white shadow-md transition-all duration-200 flex items-center justify-center gap-2 ${
            files.length < 2 || isProcessing
              ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed opacity-70'
              : 'bg-teal-600 hover:bg-teal-700 active:scale-[0.98] shadow-teal-600/20'
          }`}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processando...</span>
            </>
          ) : (
            <>
              <Merge className="w-5 h-5" />
              <span>Unir PDFs</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ConvertSection;