import React, { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { PDFDocument } from 'pdf-lib';

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

  // Manipulação de arquivos
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
      // Limpa o input para permitir re-selecionar o mesmo arquivo se necessário
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

  // Formatação do tamanho do arquivo
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Lógica principal de união com pdf-lib
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

      // Forçar o download automático do arquivo gerado
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

      {/* Mensagem de Erro */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/50 border-l-4 border-red-500 rounded-r-md text-red-700 dark:text-red-200 text-sm flex items-center justify-between">
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-500 hover:text-red-700 font-bold text-lg leading-none"
          >
            &times;
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
            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 scale-[1.01]'
            : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 bg-white dark:bg-gray-800'
        }`}
      >
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="p-3 bg-blue-50 dark:bg-gray-700 rounded-full text-blue-600 dark:text-blue-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div className="text-gray-700 dark:text-gray-200">
            <span className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              Clique para selecionar
            </span>{' '}
            ou arraste e solte seus PDFs aqui
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">Selecione dois ou mais arquivos PDF</p>
        </div>
      </div>

      {/* Lista de Arquivos Carregados */}
      {files.length > 0 && (
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Arquivos selecionados ({files.length})
            </span>
            <button
              onClick={handleClearAll}
              className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
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
                  {/* Ícone PDF */}
                  <div className="p-2 bg-red-100 text-red-600 rounded-lg flex-shrink-0">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{file.name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>

                {/* Ações por arquivo (Reordenar e Remover) */}
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <button
                    onClick={() => handleMoveFile(index, 'up')}
                    disabled={index === 0}
                    title="Mover para cima"
                    className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-30 disabled:hover:text-gray-400"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleMoveFile(index, 'down')}
                    disabled={index === files.length - 1}
                    title="Mover para baixo"
                    className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-30 disabled:hover:text-gray-400"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleRemoveFile(index)}
                    title="Remover arquivo"
                    className="p-1.5 text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors ml-1"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Botão de Ação Principal */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-end gap-4">
        {files.length > 0 && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full sm:w-auto px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
          >
            Adicionar mais PDFs
          </button>
        )}

        <button
          onClick={handleMergePDFs}
          disabled={files.length < 2 || isProcessing}
          className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-white shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
            files.length < 2 || isProcessing
              ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed opacity-70'
              : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98] shadow-blue-500/25'
          }`}
        >
          {isProcessing ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Processando...</span>
            </>
          ) : (
            <>
              <span>Unir PDFs</span>
              <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ConvertSection;