export type Language = 'pt' | 'es' | 'en';

export interface TranslationKeys {
  suiteTag: string;
  heroSubtitleLine1: string;
  heroSubtitleLine2: string;
  availableTools: string;
  secureLocalProcessing: string;
  accessTool: string;
  userReviews: string;
  userReviewsSub: string;
  recentComments: string;
  anonymousUser: string;
  followInstagram: string;

  // Títulos e descrições das ferramentas
  mergeTitle: string;
  mergeDesc: string;
  ocrTitle: string;
  ocrDesc: string;
  transcriptionTitle: string;
  transcriptionDesc: string;
  splitTitle: string;
  splitDesc: string;
  compressTitle: string;
  compressDesc: string;

  // Aliases de compatibilidade para Home.tsx
  toolUnirTitle: string;
  toolUnirDesc: string;
  toolOcrTitle: string;
  toolOcrDesc: string;
  toolTranscriptionTitle: string;
  toolTranscriptionDesc: string;
  toolSplitTitle: string;
  toolSplitDesc: string;
  toolCompressTitle: string;
  toolCompressDesc: string;
}

const pt: TranslationKeys = {
  suiteTag: 'Suíte Completa de Ferramentas PDF & IA',
  heroSubtitleLine1: 'Processamento rápido, seguro e no seu próprio navegador.',
  heroSubtitleLine2: 'Escolha uma das ferramentas abaixo para começar.',
  availableTools: 'Ferramentas Disponíveis',
  secureLocalProcessing: 'Processamento local seguro',
  accessTool: 'Acessar ferramenta',
  userReviews: 'Avaliações dos Usuários',
  userReviewsSub: 'Feedback transparente enviado diretamente pelos nossos usuários.',
  recentComments: 'Comentários Recentes (Anônimos)',
  anonymousUser: 'Usuário Anônimo',
  followInstagram: 'Siga-nos no Instagram',
  localProcessing: 'Processamento 100% local e seguro.',

  mergeTitle: 'Unir PDF',
  mergeDesc: 'Combine múltiplos arquivos PDF em um único documento organizado.',
  ocrTitle: 'OCR (Texto de PDF)',
  ocrDesc: 'Reconheça e extraia textos legíveis de PDFs ou imagens escaneadas.',
  transcriptionTitle: 'Transcrição de Áudio',
  transcriptionDesc: 'Converta suas gravações de voz e áudios em texto rapidamente.',
  splitTitle: 'Dividir PDF',
  splitDesc: 'Separe páginas ou extraia trechos específicos do seu PDF.',
  compressTitle: 'Comprimir PDF',
  compressDesc: 'Reduza o tamanho do arquivo preservando a máxima qualidade.',

  toolUnirTitle: 'Unir PDF',
  toolUnirDesc: 'Combine múltiplos arquivos PDF em um único documento organizado.',
  toolOcrTitle: 'OCR (Texto de PDF)',
  toolOcrDesc: 'Reconheça e extraia textos legíveis de PDFs ou imagens escaneadas.',
  toolTranscriptionTitle: 'Transcrição de Áudio',
  toolTranscriptionDesc: 'Converta suas gravações de voz e áudios em texto rapidamente.',
  toolSplitTitle: 'Dividir PDF',
  toolSplitDesc: 'Separe páginas ou extraia trechos específicos do seu PDF.',
  toolCompressTitle: 'Comprimir PDF',
  toolCompressDesc: 'Reduza o tamanho do arquivo preservando a máxima qualidade.',
};

const es: TranslationKeys = {
  suiteTag: 'Suite Completa de Herramientas PDF e IA',
  heroSubtitleLine1: 'Procesamiento rápido, seguro y directamente en tu navegador.',
  heroSubtitleLine2: 'Elige una de las siguientes herramientas para comenzar.',
  availableTools: 'Herramientas Disponibles',
  secureLocalProcessing: 'Procesamiento local seguro',
  accessTool: 'Acceder a la herramienta',
  userReviews: 'Opiniones de los Usuarios',
  userReviewsSub: 'Comentarios transparentes enviados directamente por nuestros usuarios.',
  recentComments: 'Comentarios Recientes (Anónimos)',
  anonymousUser: 'Usuario Anónimo',
  followInstagram: 'Síguenos en Instagram',
  localProcessing: 'Procesamiento 100% local y seguro.',

  mergeTitle: 'Unir PDF',
  mergeDesc: 'Combina múltiples archivos PDF en un solo documento organizado.',
  ocrTitle: 'OCR (Texto de PDF)',
  ocrDesc: 'Reconoce y extrae texto legible de PDFs o imágenes escaneadas.',
  transcriptionTitle: 'Transcripción de Audio',
  transcriptionDesc: 'Convierte tus grabaciones de voz y audio en texto rápidamente.',
  splitTitle: 'Dividir PDF',
  splitDesc: 'Separa páginas o extrae fragmentos específicos de tu PDF.',
  compressTitle: 'Comprimir PDF',
  compressDesc: 'Reduce el tamaño del archivo manteniendo la máxima calidad.',

  toolUnirTitle: 'Unir PDF',
  toolUnirDesc: 'Combina múltiples archivos PDF en un solo documento organizado.',
  toolOcrTitle: 'OCR (Texto de PDF)',
  toolOcrDesc: 'Reconoce y extrae texto legible de PDFs o imágenes escaneadas.',
  toolTranscriptionTitle: 'Transcripción de Audio',
  toolTranscriptionDesc: 'Convierte tus grabaciones de voz y audio en texto rápidamente.',
  toolSplitTitle: 'Dividir PDF',
  toolSplitDesc: 'Separa páginas o extrae fragmentos específicos de tu PDF.',
  toolCompressTitle: 'Comprimir PDF',
  toolCompressDesc: 'Reduce el tamaño del archivo manteniendo la máxima calidad.',
};

const en: TranslationKeys = {
  suiteTag: 'Complete PDF & AI Tools Suite',
  heroSubtitleLine1: 'Fast, secure processing directly in your browser.',
  heroSubtitleLine2: 'Choose one of the tools below to get started.',
  availableTools: 'Available Tools',
  secureLocalProcessing: 'Secure local processing',
  accessTool: 'Access tool',
  userReviews: 'User Reviews',
  userReviewsSub: 'Transparent feedback submitted directly by our users.',
  recentComments: 'Recent Comments (Anonymous)',
  anonymousUser: 'Anonymous User',
  followInstagram: 'Follow us on Instagram',
  localProcessing: '100% local and secure processing.',

  mergeTitle: 'Merge PDF',
  mergeDesc: 'Combine multiple PDF files into a single organized document.',
  ocrTitle: 'OCR (Text from PDF)',
  ocrDesc: 'Recognize and extract readable text from PDFs or scanned images.',
  transcriptionTitle: 'Audio Transcription',
  transcriptionDesc: 'Convert your voice recordings and audio into text quickly.',
  splitTitle: 'Split PDF',
  splitDesc: 'Separate pages or extract specific sections from your PDF.',
  compressTitle: 'Compress PDF',
  compressDesc: 'Reduce file size while preserving maximum quality.',

  toolUnirTitle: 'Merge PDF',
  toolUnirDesc: 'Combine multiple PDF files into a single organized document.',
  toolOcrTitle: 'OCR (Text from PDF)',
  toolOcrDesc: 'Recognize and extract readable text from PDFs or scanned images.',
  toolTranscriptionTitle: 'Audio Transcription',
  toolTranscriptionDesc: 'Convert your voice recordings and audio into text quickly.',
  toolSplitTitle: 'Split PDF',
  toolSplitDesc: 'Separate pages or extract specific sections from your PDF.',
  toolCompressTitle: 'Compress PDF',
  toolCompressDesc: 'Reduce file size while preserving maximum quality.',
};

const translations: Record<Language, TranslationKeys> = {
  pt,
  es,
  en,
};

export const getTranslation = (lang: string): TranslationKeys => {
  const normalizedLang = (lang || '').toLowerCase().slice(0, 2) as Language;
  return translations[normalizedLang] || translations.pt;
};

export default getTranslation;