import { useState, useEffect } from 'react';

export const STORAGE_KEY = 'language';

const dictionary: Record<string, Record<string, string>> = {
  pt: {
    // Cabeçalho e Rodapé
    'header.suiteTag': 'Suíte Completa de Ferramentas PDF & IA',
    'header.subtitleLine1': 'Processamento rápido, seguro e no seu próprio navegador.',
    'header.subtitleLine2': 'Escolha uma das ferramentas abaixo para começar.',
    'footer.followInstagram': 'Siga-nos no Instagram',
    'footer.localProcessing': 'Processamento 100% local e seguro.',

    // Página Inicial (Home)
    'home.availableTools': 'Ferramentas Disponíveis',
    'home.secureLocalProcessing': 'Processamento local seguro',
    'home.accessTool': 'Acessar ferramenta',
    'home.userReviews': 'Avaliações dos Usuários',
    'home.userReviewsSub': 'Feedback transparente enviado diretamente pelos nossos usuários.',
    'home.recentComments': 'Comentários Recentes (Anônimos)',
    'home.anonymousUser': 'Usuário Anônimo',
    'home.vote': 'voto no total',
    'home.votes': 'votos no total',
    'home.noComments': 'Nenhum comentário em texto registrado ainda.',
    'home.loadingReviews': 'Carregando avaliações...',

    // Títulos e Descrições dos Cards de Ferramentas
    'tools.unirTitle': 'Unir PDF',
    'tools.unirDesc': 'Combine múltiplos arquivos PDF em um único documento organizado.',
    'tools.ocrTitle': 'OCR (Texto de PDF)',
    'tools.ocrDesc': 'Reconheça e extraia textos legíveis de PDFs ou imagens escaneadas.',
    'tools.transcriptionTitle': 'Transcrição de Áudio',
    'tools.transcriptionDesc': 'Converta suas gravações de voz e áudios em texto rapidamente.',
    'tools.splitTitle': 'Dividir PDF',
    'tools.splitDesc': 'Separe páginas ou extraia trechos específicos do seu PDF.',
    'tools.compressTitle': 'Comprimir PDF',
    'tools.compressDesc': 'Reduza o tamanho do arquivo preservando a máxima qualidade.',

    // Ferramenta: Unir PDF (ConvertSection)
    'unir.title': 'Unir PDFs',
    'unir.subtitle': 'Combine vários arquivos PDF em um único documento em segundos.',
    'unir.onlyPdfError': 'Por favor, selecione apenas arquivos em formato PDF.',
    'unir.minFilesError': 'Adicione pelo menos 2 arquivos PDF para realizar a união.',
    'unir.processError': 'Ocorreu um erro ao processar os PDFs. Certifique-se de que nenhum arquivo esteja protegido por senha ou corrompido.',
    'unir.clickSelect': 'Clique para selecionar',
    'unir.orDrag': 'ou arraste seus PDFs aqui',
    'unir.selectHint': 'Selecione dois ou mais arquivos para juntar',
    'unir.selectedFiles': 'Arquivos Selecionados',
    'unir.removeAll': 'Remover todos',
    'unir.addMore': 'Adicionar mais PDFs',
    'unir.btnMerge': 'Unir PDFs',
    'unir.processing': 'Processando...',
    'unir.loadingTitle': 'Processando e preparando seus documentos...',
    'unir.loadingSubtitle': 'Isso levará apenas alguns segundos.',
    'unir.readyTitle': 'Seu PDF Unificado está Pronto!',
    'unir.readySubtitle': 'Escolha o nome do seu arquivo e faça o download gratuito.',
    'unir.fileNameLabel': 'Nome do arquivo de saída:',
    'unir.downloadBtn': 'Baixar Arquivo PDF',
    'unir.thanksTitle': 'Obrigado por usar o PropedeuticaPDF!',
    'unir.thanksSubtitle': 'Seu download foi iniciado. Como foi sua experiência ao usar nossa ferramenta?',
    'unir.rateLabel': 'Sua Nota (1 a 5 Estrelas):',
    'unir.commentLabel': 'Comentário Anônimo (Opcional):',
    'unir.commentPlaceholder': 'Deixe uma sugestão ou feedback...',
    'unir.submitRatingBtn': 'Enviar Avaliação Anônima',
    'unir.submitting': 'Enviando...',
    'unir.ratingSuccess': 'Sua avaliação foi registrada com sucesso! Muito obrigado.',
    'unir.backHome': 'Voltar para a Página Inicial',

    // Ferramenta: OCR Inteligente (OcrSection)
    'ocr.title': 'OCR Inteligente de PDF & Imagem',
    'ocr.subtitle': 'Reconheça e extraia texto legível com orquestração de IA resiliente.',
    'ocr.invalidFormat': 'Selecione um arquivo PDF ou imagem válida.',
    'ocr.errorMsg': 'Erro ao realizar OCR no arquivo.',
    'ocr.clickSelect': 'Clique para selecionar PDF ou Imagem',
    'ocr.hint': 'Suporta PDFs escaneados, documentos e fotos em geral',
    'ocr.btnStart': 'Iniciar OCR Inteligente',
    'ocr.loadingTitle': 'Processando com Orquestrador Inteligente...',
    'ocr.loadingSub': 'Processando páginas e aplicando inteligência artificial e failover.',
    'ocr.resultTitle': 'Texto Extraído com Sucesso',
    'ocr.copied': 'Copiado!',
    'ocr.copyBtn': 'Copiar Texto',
    'ocr.downloadTxt': 'Baixar TXT',
    'ocr.thanksTitle': 'Obrigado por utilizar o PropedeuticaPDF!',
    'ocr.thanksSub': 'Como foi a precisão da extração do seu documento?'
  },
  es: {
    // Cabeçalho e Rodapé
    'header.suiteTag': 'Suite Completa de Herramientas PDF e IA',
    'header.subtitleLine1': 'Procesamiento rápido, seguro y directamente en tu navegador.',
    'header.subtitleLine2': 'Elige una de las siguientes herramientas para comenzar.',
    'footer.followInstagram': 'Síguenos en Instagram',
    'footer.localProcessing': 'Procesamiento 100% local y seguro.',

    // Página Inicial (Home)
    'home.availableTools': 'Herramientas Disponibles',
    'home.secureLocalProcessing': 'Procesamiento local seguro',
    'home.accessTool': 'Acceder a la herramienta',
    'home.userReviews': 'Opiniones de los Usuarios',
    'home.userReviewsSub': 'Comentarios transparentes enviados directamente por nuestros usuarios.',
    'home.recentComments': 'Comentarios Recientes (Anónimos)',
    'home.anonymousUser': 'Usuario Anónimo',
    'home.vote': 'voto en total',
    'home.votes': 'votos en total',
    'home.noComments': 'Aún no hay comentarios de texto registrados.',
    'home.loadingReviews': 'Cargando opiniones...',

    // Títulos e Descrições dos Cards de Ferramentas
    'tools.unirTitle': 'Unir PDF',
    'tools.unirDesc': 'Combina múltiples archivos PDF en un solo documento organizado.',
    'tools.ocrTitle': 'OCR (Texto de PDF)',
    'tools.ocrDesc': 'Reconoce y extrae texto legible de PDFs o imágenes escaneadas.',
    'tools.transcriptionTitle': 'Transcripción de Audio',
    'tools.transcriptionDesc': 'Convierte tus grabaciones de voz y audio en texto rápidamente.',
    'tools.splitTitle': 'Dividir PDF',
    'tools.splitDesc': 'Separa páginas o extrae fragmentos específicos de tu PDF.',
    'tools.compressTitle': 'Comprimir PDF',
    'tools.compressDesc': 'Reduce el tamaño del archivo manteniendo la máxima calidad.',

    // Ferramenta: Unir PDF (ConvertSection)
    'unir.title': 'Unir PDFs',
    'unir.subtitle': 'Combina varios archivos PDF en un solo documento en segundos.',
    'unir.onlyPdfError': 'Por favor, selecciona solo archivos en formato PDF.',
    'unir.minFilesError': 'Añade al menos 2 archivos PDF para realizar la unión.',
    'unir.processError': 'Ocurrió un error al procesar los PDFs. Asegúrate de que ningún archivo esté protegido por contraseña o dañado.',
    'unir.clickSelect': 'Haz clic para seleccionar',
    'unir.orDrag': 'o arrastra tus PDFs aquí',
    'unir.selectHint': 'Selecciona dos o más archivos para unir',
    'unir.selectedFiles': 'Archivos Seleccionados',
    'unir.removeAll': 'Eliminar todos',
    'unir.addMore': 'Añadir más PDFs',
    'unir.btnMerge': 'Unir PDFs',
    'unir.processing': 'Procesando...',
    'unir.loadingTitle': 'Procesando y preparando tus documentos...',
    'unir.loadingSubtitle': 'Esto tomará solo unos segundos.',
    'unir.readyTitle': '¡Tu PDF Unificado está Listo!',
    'unir.readySubtitle': 'Elige el nombre de tu archivo y descárgalo gratis.',
    'unir.fileNameLabel': 'Nombre del archivo de salida:',
    'unir.downloadBtn': 'Descargar Archivo PDF',
    'unir.thanksTitle': '¡Gracias por usar PropedeuticaPDF!',
    'unir.thanksSubtitle': 'Tu descarga ha comenzado. ¿Cómo fue tu experiencia usando nuestra herramienta?',
    'unir.rateLabel': 'Tu Calificación (1 a 5 Estrellas):',
    'unir.commentLabel': 'Comentario Anónimo (Opcional):',
    'unir.commentPlaceholder': 'Deja una sugerencia o comentario...',
    'unir.submitRatingBtn': 'Enviar Calificación Anónima',
    'unir.submitting': 'Enviando...',
    'unir.ratingSuccess': '¡Tu calificación fue registrada con éxito! Muchas gracias.',
    'unir.backHome': 'Volver a la Página Principal',

    // Ferramenta: OCR Inteligente (OcrSection)
    'ocr.title': 'OCR Inteligente de PDF e Imagen',
    'ocr.subtitle': 'Reconoce y extrae texto legible con orquestación de IA resiliente.',
    'ocr.invalidFormat': 'Selecciona un archivo PDF o imagen válida.',
    'ocr.errorMsg': 'Error al realizar OCR en el archivo.',
    'ocr.clickSelect': 'Haz clic para seleccionar PDF o Imagen',
    'ocr.hint': 'Soporta PDFs escaneados, documentos y fotos en general',
    'ocr.btnStart': 'Iniciar OCR Inteligente',
    'ocr.loadingTitle': 'Procesando con Orquestador Inteligente...',
    'ocr.loadingSub': 'Procesando páginas y aplicando inteligencia artificial y failover.',
    'ocr.resultTitle': 'Texto Extraído con Éxito',
    'ocr.copied': '¡Copiado!',
    'ocr.copyBtn': 'Copiar Texto',
    'ocr.downloadTxt': 'Descargar TXT',
    'ocr.thanksTitle': '¡Gracias por utilizar PropedeuticaPDF!',
    'ocr.thanksSub': '¿Cómo fue la precisión de la extracción de tu documento?'
  },
  en: {
    // Cabeçalho e Rodapé
    'header.suiteTag': 'Complete PDF & AI Tools Suite',
    'header.subtitleLine1': 'Fast, secure processing directly in your browser.',
    'header.subtitleLine2': 'Choose one of the tools below to get started.',
    'footer.followInstagram': 'Follow us on Instagram',
    'footer.localProcessing': '100% local and secure processing.',

    // Página Inicial (Home)
    'home.availableTools': 'Available Tools',
    'home.secureLocalProcessing': 'Secure local processing',
    'home.accessTool': 'Access tool',
    'home.userReviews': 'User Reviews',
    'home.userReviewsSub': 'Transparent feedback submitted directly by our users.',
    'home.recentComments': 'Recent Comments (Anonymous)',
    'home.anonymousUser': 'Anonymous User',
    'home.vote': 'total vote',
    'home.votes': 'total votes',
    'home.noComments': 'No text comments registered yet.',
    'home.loadingReviews': 'Loading reviews...',

    // Títulos e Descrições dos Cards de Ferramentas
    'tools.unirTitle': 'Merge PDF',
    'tools.unirDesc': 'Combine multiple PDF files into a single organized document.',
    'tools.ocrTitle': 'OCR (Text from PDF)',
    'tools.ocrDesc': 'Recognize and extract readable text from PDFs or scanned images.',
    'tools.transcriptionTitle': 'Audio Transcription',
    'tools.transcriptionDesc': 'Convert your voice recordings and audio into text quickly.',
    'tools.splitTitle': 'Split PDF',
    'tools.splitDesc': 'Separate pages or extract specific sections from your PDF.',
    'tools.compressTitle': 'Compress PDF',
    'tools.compressDesc': 'Reduce file size while preserving maximum quality.',

    // Ferramenta: Unir PDF (ConvertSection)
    'unir.title': 'Merge PDFs',
    'unir.subtitle': 'Combine multiple PDF files into one document in seconds.',
    'unir.onlyPdfError': 'Please select PDF format files only.',
    'unir.minFilesError': 'Add at least 2 PDF files to perform the merge.',
    'unir.processError': 'An error occurred while processing the PDFs. Make sure no files are password-protected or corrupted.',
    'unir.clickSelect': 'Click to select',
    'unir.orDrag': 'or drag your PDFs here',
    'unir.selectHint': 'Select two or more files to merge',
    'unir.selectedFiles': 'Selected Files',
    'unir.removeAll': 'Remove all',
    'unir.addMore': 'Add more PDFs',
    'unir.btnMerge': 'Merge PDFs',
    'unir.processing': 'Processing...',
    'unir.loadingTitle': 'Processing and preparing your documents...',
    'unir.loadingSubtitle': 'This will take just a few seconds.',
    'unir.readyTitle': 'Your Merged PDF is Ready!',
    'unir.readySubtitle': 'Choose your file name and download for free.',
    'unir.fileNameLabel': 'Output file name:',
    'unir.downloadBtn': 'Download PDF File',
    'unir.thanksTitle': 'Thank you for using PropedeuticaPDF!',
    'unir.thanksSubtitle': 'Your download has started. How was your experience using our tool?',
    'unir.rateLabel': 'Your Rating (1 to 5 Stars):',
    'unir.commentLabel': 'Anonymous Comment (Optional):',
    'unir.commentPlaceholder': 'Leave a suggestion or feedback...',
    'unir.submitRatingBtn': 'Submit Anonymous Review',
    'unir.submitting': 'Submitting...',
    'unir.ratingSuccess': 'Your review was registered successfully! Thank you very much.',
    'unir.backHome': 'Back to Home Page',

    // Ferramenta: OCR Inteligente (OcrSection)
    'ocr.title': 'Smart OCR for PDF & Image',
    'ocr.subtitle': 'Recognize and extract readable text with resilient AI orchestration.',
    'ocr.invalidFormat': 'Please select a valid PDF or image file.',
    'ocr.errorMsg': 'Error performing OCR on the file.',
    'ocr.clickSelect': 'Click to select PDF or Image',
    'ocr.hint': 'Supports scanned PDFs, documents, and photos in general',
    'ocr.btnStart': 'Start Smart OCR',
    'ocr.loadingTitle': 'Processing with Smart Orchestrator...',
    'ocr.loadingSub': 'Processing pages and applying AI and failover.',
    'ocr.resultTitle': 'Text Successfully Extracted',
    'ocr.copied': 'Copied!',
    'ocr.copyBtn': 'Copy Text',
    'ocr.downloadTxt': 'Download TXT',
    'ocr.thanksTitle': 'Thank you for using PropedeuticaPDF!',
    'ocr.thanksSub': 'How accurate was the text extraction from your document?'
  }
};

export function getTranslation(key: string, fallbackText: string = ''): string {
  const lang = localStorage.getItem(STORAGE_KEY) || 'pt';
  const activeDict = dictionary[lang] || dictionary.pt;
  return activeDict[key] || fallbackText;
}

export function setLanguage(lang: string): void {
  localStorage.setItem(STORAGE_KEY, lang);
  window.dispatchEvent(new Event('languageChange'));
}

export function useTranslation() {
  const [lang, setLangState] = useState<string>(() => localStorage.getItem(STORAGE_KEY) || 'pt');

  useEffect(() => {
    const handleSync = () => setLangState(localStorage.getItem(STORAGE_KEY) || 'pt');
    window.addEventListener('languageChange', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('languageChange', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  return {
    lang,
    t: (key: string, fallbackText: string = '') => getTranslation(key, fallbackText),
    setLanguage
  };
}

export default useTranslation;