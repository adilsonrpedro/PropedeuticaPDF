export type Lang = 'pt' | 'es' | 'en';

export interface Translation {
  appTitle: string;
  appTagline: string;
  navPdf: string;
  navSpeech: string;
  navTranscription: string;
  navAbout: string;
  navOcr: string;

  pdfTitle: string;
  pdfSubtitle: string;
  pdfSelectMode: string;
  pdfError: string;
  pdfProcessing: string;
  pdfAddFile: string;
  pdfFilesAdded: string;
  pdfNoFile: string;
  pdfRemoveFile: string;

  pdfConvert: string;
  pdfConvertHint: string;
  pdfConvertDropTitle: string;
  pdfConvertDropSubtitle: string;
  pdfConvertTarget: string;
  pdfConvertToPdf: string;
  pdfConvertToDocx: string;
  pdfConvertToMd: string;
  pdfConvertDownloadMode: string;
  pdfConvertUnified: string;
  pdfConvertUnifiedHint: string;
  pdfConvertSeparate: string;
  pdfConvertSeparateHint: string;
  pdfConvertCta: string;
  pdfConvertConverting: string;
  pdfConvertDone: string;
  pdfConvertFileDone: string;
  pdfConvertFileError: string;
  pdfConvertDownload: string;
  pdfConvertPreview: string;
  pdfConvertPreviewPlaceholder: string;
  pdfConvertResults: string;
  pdfConvertDownloadingZip: string;
  pdfConvertUnifiedName: string;
  pdfConvertProgress: string;
  pdfConvertSomeFailed: string;
  pdfConvertAllFailed: string;
  pdfConvertVisualProgress: string;

  pdfMerge: string;
  pdfMergeHint: string;
  pdfMergeDropTitle: string;
  pdfMergeDropSubtitle: string;
  pdfMergeCta: string;
  pdfMergeDone: string;
  pdfMergeConverting: string;

  pdfSplit: string;
  pdfSplitHint: string;
  pdfSplitDropTitle: string;
  pdfSplitDropSubtitle: string;
  pdfSplitPages: string;
  pdfSplitClickHint: string;
  pdfSplitCutHere: string;
  pdfSplitStartDoc: string;
  pdfSplitCta: string;
  pdfSplitDownloadZip: string;
  pdfSplitDownloadParts: string;
  pdfSplitGenerating: string;
  pdfSplitNoCuts: string;
  pdfSplitPart: string;
  pdfSplitRenderError: string;

  pdfExtract: string;
  pdfExtractHint: string;
  pdfExtractCta: string;
  pdfResult: string;
  pdfResultPlaceholder: string;
  pdfCopied: string;
  pdfCopy: string;
  pdfDownloadTxt: string;

  speechTitle: string;
  speechSubtitle: string;
  speechPlaceholder: string;
  speechRate: string;
  speechPitch: string;
  speechVoice: string;
  speechPlay: string;
  speechStop: string;
  speechPause: string;
  speechResume: string;
  speechNoVoice: string;
  speechUnsupported: string;
  speechPlaying: string;
  speechPaused: string;
  speechDefault: string;

  trTitle: string;
  trSubtitle: string;
  trDropTitle: string;
  trDropSubtitle: string;
  trWarning: string;
  trResult: string;
  trResultPlaceholder: string;
  trCopy: string;
  trCopied: string;
  trVoiceError: string;
  trProcessing: string;
  trTranscribe: string;
  trTranscribing: string;
  trExtractingAudio: string;
  trChunksDone: string;
  trPhaseProcessing: string;
  trPhaseAnalyzing: string;
  trPhaseStructuring: string;
  trGroqError: string;
  trKeyMissing: string;
  trUnsupported: string;
  trDownloadTxt: string;

  ocrTitle: string;
  ocrSubtitle: string;
  ocrDropTitle: string;
  ocrDropSubtitle: string;
  ocrLanguage: string;
  ocrRecognizing: string;
  ocrProcessing: string;
  ocrProcess: string;
  ocrSearchableGen: string;
  ocrSearchableBtn: string;
  ocrSearchableDesc: string;
  ocrProgress: string;
  ocrSearchable: string;
  ocrDownloadPdf: string;
  ocrResult: string;
  ocrCopied: string;
  ocrCopy: string;
  ocrResultPlaceholder: string;
  convError: string;

  reviewTitle: string;
  reviewSubtitle: string;
  reviewRate: string;
  reviewComment: string;
  reviewCommentPlaceholder: string;
  reviewSubmit: string;
  reviewSubmitting: string;
  reviewError: string;
  reviewThanks: string;

  feedbackTitle: string;
  feedbackTypeSuggestion: string;
  feedbackTypeProblem: string;
  feedbackMessage: string;
  feedbackMessagePlaceholder: string;
  feedbackEmail: string;
  feedbackEmailPlaceholder: string;
  feedbackEmailOptional: string;
  feedbackSubmit: string;
  feedbackSubmitting: string;
  feedbackError: string;
  feedbackThanks: string;

  aboutTitle: string;
  aboutSubtitle: string;
  aboutDescription: string;
  aboutFeature1: string;
  aboutFeature2: string;
  aboutFeature3: string;
  aboutFeature4: string;
  aboutFeature5: string;
  aboutFeature6: string;
  aboutTech: string;
  aboutDisclaimer: string;

  footerText: string;
}

const pt: Translation = {
  appTitle: 'PropedeuticaPDF', appTagline: 'Suite de ferramentas propedêuticas',
  navPdf: 'Ferramentas PDF', navSpeech: 'Voz e Dictado', navTranscription: 'Transcrição de Áudio e Vídeo', navAbout: 'Sobre e Contato', navOcr: 'OCR de PDF',
  pdfTitle: 'Ferramentas PDF', pdfSubtitle: 'Converta, junte, divida visualmente e extraia texto de arquivos — tudo no navegador.', pdfSelectMode: 'Escolha uma operação:', pdfError: 'Erro ao processar o arquivo.', pdfProcessing: 'Processando…', pdfAddFile: 'Adicionar arquivo', pdfFilesAdded: 'arquivos adicionados', pdfNoFile: 'Nenhum arquivo selecionado.', pdfRemoveFile: 'Remover',
  pdfConvert: 'Converter Formato', pdfConvertHint: 'Conversão visual e estrutural 100% automática e local. Carregue DOCX, PPTX, PDF, imagens e converta para PDF, DOCX ou Markdown preservando a formatação original.', pdfConvertDropTitle: 'Solte seus arquivos aqui', pdfConvertDropSubtitle: 'ou clique para selecionar vários (PDF, DOCX, PPTX, POTX, MD, TXT, JPEG, PNG)', pdfConvertTarget: 'Formato de saída:', pdfConvertToPdf: 'PDF', pdfConvertToDocx: 'DOCX', pdfConvertToMd: 'Markdown', pdfConvertDownloadMode: 'Modo de download:', pdfConvertUnified: 'Unificado', pdfConvertUnifiedHint: 'Todos os arquivos em um único PDF/DOCX/MD', pdfConvertSeparate: 'Separado', pdfConvertSeparateHint: 'Cada arquivo convertido individualmente (ZIP)', pdfConvertCta: 'Converter e Baixar', pdfConvertConverting: 'Convertendo arquivos…', pdfConvertDone: 'Todos os arquivos convertidos com sucesso!', pdfConvertFileDone: 'Convertido', pdfConvertFileError: 'Erro', pdfConvertDownload: 'Baixar arquivo convertido', pdfConvertPreview: 'Pré-visualização', pdfConvertPreviewPlaceholder: 'O conteúdo extraído aparecerá aqui para revisão antes de baixar…', pdfConvertResults: 'Arquivos convertidos', pdfConvertDownloadingZip: 'Compactando arquivos em ZIP…', pdfConvertUnifiedName: 'convertido', pdfConvertProgress: 'Convertendo arquivo {n} de {total}…', pdfConvertSomeFailed: '{ok} de {total} arquivos convertidos. {fail} falharam.', pdfConvertAllFailed: 'Nenhum arquivo pôde ser convertido.', pdfConvertVisualProgress: 'Renderização visual',
  pdfMerge: 'Unir em PDF', pdfMergeHint: 'Adicione imagens (JPEG, PNG), documentos (DOCX, PPTX, MD) ou PDFs e junte tudo em um único arquivo PDF.', pdfMergeDropTitle: 'Solte seus arquivos aqui', pdfMergeDropSubtitle: 'ou clique para selecionar (PDF, JPEG, PNG, DOCX, PPTX, MD)', pdfMergeCta: 'Unir em um único PDF', pdfMergeDone: 'PDF gerado com sucesso!', pdfMergeConverting: 'Convertendo arquivos para PDF…',
  pdfSplit: 'Dividir PDF Visual', pdfSplitHint: 'Carregue um PDF, veja todas as páginas em miniatura e clique para definir os pontos de corte.', pdfSplitDropTitle: 'Solte seu PDF aqui', pdfSplitDropSubtitle: 'ou clique para selecionar um arquivo (.pdf)', pdfSplitPages: 'páginas', pdfSplitClickHint: 'Clique numa página para marcá-la como início de um novo arquivo. A linha vermelha indica onde o corte será feito.', pdfSplitCutHere: 'Corte aqui', pdfSplitStartDoc: 'Início do documento', pdfSplitCta: 'Dividir e Baixar', pdfSplitDownloadZip: 'Baixar ZIP com todos os PDFs', pdfSplitDownloadParts: 'Baixar PDFs separados', pdfSplitGenerating: 'Gerando arquivos PDF…', pdfSplitNoCuts: 'Nenhum corte definido. Clique nas páginas para definir onde dividir.', pdfSplitPart: 'Parte', pdfSplitRenderError: 'Erro ao renderizar as páginas do PDF.',
  pdfExtract: 'Extrair Texto', pdfExtractHint: 'Extraia todo o texto do PDF para copiar ou baixar.', pdfExtractCta: 'Extrair texto', pdfResult: 'Texto extraído', pdfResultPlaceholder: 'O texto extraído aparecerá aqui…', pdfCopied: 'Copiado!', pdfCopy: 'Copiar', pdfDownloadTxt: 'Baixar .txt',
  speechTitle: 'Voz e Dictado', speechSubtitle: 'Converta texto em fala com vozes do navegador e ajuste velocidade e tom.', speechPlaceholder: 'Digite ou cole o texto que deseja ouvir…', speechRate: 'Velocidade', speechPitch: 'Tom', speechVoice: 'Voz', speechPlay: 'Reproduzir', speechStop: 'Parar', speechPause: 'Pausar', speechResume: 'Continuar', speechNoVoice: 'Nenhuma voz disponível neste navegador.', speechUnsupported: 'Seu navegador não suporta síntese de voz. Tente Chrome, Edge ou Firefox.', speechPlaying: 'Reproduzindo…', speechPaused: 'Pausado', speechDefault: 'Padrão',
  trTitle: 'Transcrição de Áudio e Vídeo', trSubtitle: 'Transcreva áudio e vídeo com IA Groq Whisper — rápido e otimizado para espanhol paraguaio.', trDropTitle: 'Solte seu áudio ou vídeo aqui', trDropSubtitle: 'ou clique para selecionar (.mp3, .wav, .m4a, .mp4, .webm)', trWarning: 'A transcrição usa a API Groq (whisper-large-v3-turbo) com idioma fixado em espanhol e otimização para jopará/guarani. Arquivos longos são fatiados automaticamente.', trResult: 'Transcrição', trResultPlaceholder: 'A transcrição aparecerá aqui em parágrafos lógicos. Você pode editar o texto livremente.', trCopy: 'Copiar', trCopied: 'Copiado!', trVoiceError: 'Erro ao processar a transcrição.', trProcessing: 'Processando…', trTranscribe: 'Transcrever Áudio/Vídeo', trTranscribing: 'Transcrevendo…', trExtractingAudio: 'Extraindo áudio do arquivo…', trChunksDone: 'Trechos processados', trPhaseProcessing: 'Processando áudio…', trPhaseAnalyzing: 'Analisando idioma e contexto…', trPhaseStructuring: 'Estruturando texto final…', trGroqError: 'Erro na API do Groq.', trKeyMissing: 'Chave da API do Groq não configurada. Contate o administrador.', trUnsupported: 'Seu navegador não suporta os recursos de áudio necessários.', trDownloadTxt: 'Baixar .txt', ocrTitle: 'OCR de PDF e Imagens', ocrSubtitle: 'Extraia texto de PDFs e imagens com OCR. Gere PDFs pesquisáveis com texto oculto sobreposto.', ocrDropTitle: 'Solte sua imagem ou PDF aqui', ocrDropSubtitle: 'ou clique para selecionar (.jpeg, .jpg, .png, .pdf)', ocrLanguage: 'Idioma do OCR', ocrRecognizing: 'Reconhecendo texto', ocrProcessing: 'Processando OCR…', ocrProcess: 'Extrair Texto (OCR)', ocrSearchableGen: 'Gerando PDF pesquisável…', ocrSearchableBtn: 'Gerar PDF Pesquisável', ocrSearchableDesc: 'Gera um PDF com texto oculto sobreposto à imagem, permitindo busca e cópia.', ocrProgress: 'Processando…', ocrSearchable: 'PDF pesquisável gerado com sucesso!', ocrDownloadPdf: 'Baixar PDF', ocrResult: 'Texto extraído', ocrCopied: 'Copiado!', ocrCopy: 'Copiar', ocrResultPlaceholder: 'O texto extraído aparecerá aqui…', convError: 'Erro ao processar o arquivo.',
  reviewTitle: 'Avalie a ferramenta', reviewSubtitle: 'Sua opinião nos ajuda a melhorar.', reviewRate: 'Toque em uma estrela para avaliar', reviewComment: 'Comentário (opcional)', reviewCommentPlaceholder: 'Conte-nos sua experiência…', reviewSubmit: 'Enviar avaliação', reviewSubmitting: 'Enviando…', reviewError: 'Erro ao enviar avaliação. Tente novamente.', reviewThanks: 'Obrigado pelo seu feedback!',
  feedbackTitle: 'Envie sua sugestão ou reporte um problema', feedbackTypeSuggestion: 'Sugestão', feedbackTypeProblem: 'Problema', feedbackMessage: 'Mensagem', feedbackMessagePlaceholder: 'Descreva sua sugestão ou problema…', feedbackEmail: 'E-mail', feedbackEmailPlaceholder: 'seu@email.com', feedbackEmailOptional: '(opcional)', feedbackSubmit: 'Enviar', feedbackSubmitting: 'Enviando…', feedbackError: 'Erro ao enviar mensagem. Tente novamente.', feedbackThanks: 'Mensagem enviada com sucesso!',
  aboutTitle: 'Sobre o PropedeuticaPDF', aboutSubtitle: 'Uma suite de ferramentas propedêuticas gratuita e de código aberto.', aboutDescription: 'O PropedeuticaPDF reúne ferramentas essenciais para estudantes e profissionais: conversão visual de formatos, manipulação de PDFs, síntese de voz, transcrição de áudio/vídeo com IA e mais. Tudo roda no seu navegador, com privacidade e sem necessidade de instalação.', aboutFeature1: 'Conversão visual e estrutural automática de DOCX e PPTX para PDF', aboutFeature2: 'Unir imagens, documentos e PDFs em um único PDF', aboutFeature3: 'Dividir PDF visualmente com corte por clique', aboutFeature4: 'Voz e dictado com vozes naturais do navegador', aboutFeature5: 'Transcrição de áudio e vídeo com IA Groq Whisper', aboutFeature6: 'Suporte multilíngue: Português, Espanhol e Inglês', aboutTech: 'Construído com React, Vite, Tailwind CSS, jsPDF e Supabase.', aboutDisclaimer: 'Todas as ferramentas processam seus arquivos localmente no navegador. A transcrição envia áudio fatiado para a API da Groq.',
  footerText: 'PropedeuticaPDF — ferramentas propedêuticas gratuitas',
};

const es: Translation = {
  appTitle: 'PropedeuticaPDF', appTagline: 'Suite de herramientas propedéuticas',
  navPdf: 'Herramientas PDF', navSpeech: 'Voz y Dictado', navTranscription: 'Transcripción de Audio y Video', navAbout: 'Acerca de y Contacto', navOcr: 'OCR de PDF',
  pdfTitle: 'Herramientas PDF', pdfSubtitle: 'Convierte, une, divide visualmente y extrae texto de archivos — todo en el navegador.', pdfSelectMode: 'Elige una operación:', pdfError: 'Error al procesar el archivo.', pdfProcessing: 'Procesando…', pdfAddFile: 'Añadir archivo', pdfFilesAdded: 'archivos añadidos', pdfNoFile: 'Ningún archivo seleccionado.', pdfRemoveFile: 'Quitar',
  pdfConvert: 'Convertir Formato', pdfConvertHint: 'Conversión visual y estructural 100% automática y local. Carga DOCX, PPTX, PDF, imágenes y conviértelos a PDF, DOCX o Markdown preservando el formato original.', pdfConvertDropTitle: 'Suelta tus archivos aquí', pdfConvertDropSubtitle: 'o haz clic para seleccionar varios (PDF, DOCX, PPTX, POTX, MD, TXT, JPEG, PNG)', pdfConvertTarget: 'Formato de salida:', pdfConvertToPdf: 'PDF', pdfConvertToDocx: 'DOCX', pdfConvertToMd: 'Markdown', pdfConvertDownloadMode: 'Modo de descarga:', pdfConvertUnified: 'Unificado', pdfConvertUnifiedHint: 'Todos los archivos en un único PDF/DOCX/MD', pdfConvertSeparate: 'Separado', pdfConvertSeparateHint: 'Cada archivo convertido individualmente (ZIP)', pdfConvertCta: 'Convertir y Descargar', pdfConvertConverting: 'Convirtiendo archivos…', pdfConvertDone: '¡Todos los archivos convertidos con éxito!', pdfConvertFileDone: 'Convertido', pdfConvertFileError: 'Error', pdfConvertDownload: 'Descargar archivo convertido', pdfConvertPreview: 'Vista previa', pdfConvertPreviewPlaceholder: 'El contenido extraído aparecerá aquí para revisión antes de descargar…', pdfConvertResults: 'Archivos convertidos', pdfConvertDownloadingZip: 'Comprimiendo archivos en ZIP…', pdfConvertUnifiedName: 'convertido', pdfConvertProgress: 'Convirtiendo archivo {n} de {total}…', pdfConvertSomeFailed: '{ok} de {total} archivos convertidos. {fail} fallaron.', pdfConvertAllFailed: 'Ningún archivo pudo ser convertido.', pdfConvertVisualProgress: 'Renderizado visual',
  pdfMerge: 'Unir en PDF', pdfMergeHint: 'Añade imágenes (JPEG, PNG), documentos (DOCX, PPTX, MD) o PDFs y únelos todos en un único archivo PDF.', pdfMergeDropTitle: 'Suelta tus archivos aquí', pdfMergeDropSubtitle: 'o haz clic para seleccionar (PDF, JPEG, PNG, DOCX, PPTX, MD)', pdfMergeCta: 'Unir en un único PDF', pdfMergeDone: '¡PDF generado con éxito!', pdfMergeConverting: 'Convirtiendo archivos a PDF…',
  pdfSplit: 'Dividir PDF Visual', pdfSplitHint: 'Carga un PDF, ve todas las páginas en miniatura y haz clic para definir los puntos de corte.', pdfSplitDropTitle: 'Suelta tu PDF aquí', pdfSplitDropSubtitle: 'o haz clic para seleccionar un archivo (.pdf)', pdfSplitPages: 'páginas', pdfSplitClickHint: 'Haz clic en una página para marcarla como inicio de un nuevo archivo. La línea roja indica dónde se cortará.', pdfSplitCutHere: 'Cortar aquí', pdfSplitStartDoc: 'Inicio del documento', pdfSplitCta: 'Dividir y Descargar', pdfSplitDownloadZip: 'Descargar ZIP con todos los PDFs', pdfSplitDownloadParts: 'Descargar PDFs por separado', pdfSplitGenerating: 'Generando archivos PDF…', pdfSplitNoCuts: 'Ningún corte definido. Haz clic en las páginas para definir dónde dividir.', pdfSplitPart: 'Parte', pdfSplitRenderError: 'Error al renderizar las páginas del PDF.',
  pdfExtract: 'Extraer Texto', pdfExtractHint: 'Extrae todo el texto del PDF para copiar o descargar.', pdfExtractCta: 'Extraer texto', pdfResult: 'Texto extraído', pdfResultPlaceholder: 'El texto extraído aparecerá aquí…', pdfCopied: '¡Copiado!', pdfCopy: 'Copiar', pdfDownloadTxt: 'Descargar .txt',
  speechTitle: 'Voz y Dictado', speechSubtitle: 'Convierte texto a voz con voces del navegador y ajusta velocidad y tono.', speechPlaceholder: 'Escribe o pega el texto que quieres escuchar…', speechRate: 'Velocidad', speechPitch: 'Tono', speechVoice: 'Voz', speechPlay: 'Reproducir', speechStop: 'Detener', speechPause: 'Pausar', speechResume: 'Continuar', speechNoVoice: 'Ninguna voz disponible en este navegador.', speechUnsupported: 'Tu navegador no soporta síntesis de voz. Prueba Chrome, Edge o Firefox.', speechPlaying: 'Reproduciendo…', speechPaused: 'Pausado', speechDefault: 'Predeterminada',
  trTitle: 'Transcripción de Audio y Video', trSubtitle: 'Transcribe audio y video con IA Groq Whisper — rápido y optimizado para español paraguayo.', trDropTitle: 'Suelta tu audio o video aquí', trDropSubtitle: 'o haz clic para seleccionar (.mp3, .wav, .m4a, .mp4, .webm)', trWarning: 'La transcripción usa la API Groq (whisper-large-v3-turbo) con idioma fijado en español y optimización para jopará/guaraní. Los archivos largos se trocean automáticamente.', trResult: 'Transcripción', trResultPlaceholder: 'La transcripción aparecerá aquí en párrafos lógicos. Puedes editar el texto libremente.', trCopy: 'Copiar', trCopied: '¡Copiado!', trVoiceError: 'Error al procesar la transcripción.', trProcessing: 'Procesando…', trTranscribe: 'Transcribir Audio/Video', trTranscribing: 'Transcribiendo…', trExtractingAudio: 'Extrayendo audio del archivo…', trChunksDone: 'Fragmentos procesados', trPhaseProcessing: 'Procesando audio…', trPhaseAnalyzing: 'Analizando idioma y contexto…', trPhaseStructuring: 'Estructurando texto final…', trGroqError: 'Error en la API de Groq.', trKeyMissing: 'Clave de la API de Groq no configurada. Contacta al administrador.', trUnsupported: 'Tu navegador no soporta las funciones de audio necesarias.', trDownloadTxt: 'Descargar .txt', ocrTitle: 'OCR de PDF e Imágenes', ocrSubtitle: 'Extrae texto de PDFs e imágenes con OCR. Genera PDFs buscables con texto oculto superpuesto.', ocrDropTitle: 'Suelta tu imagen o PDF aquí', ocrDropSubtitle: 'o haz clic para seleccionar (.jpeg, .jpg, .png, .pdf)', ocrLanguage: 'Idioma del OCR', ocrRecognizing: 'Reconociendo texto', ocrProcessing: 'Procesando OCR…', ocrProcess: 'Extraer Texto (OCR)', ocrSearchableGen: 'Generando PDF buscable…', ocrSearchableBtn: 'Generar PDF Buscable', ocrSearchableDesc: 'Genera un PDF con texto oculto superpuesto a la imagen, permitiendo búsqueda y copia.', ocrProgress: 'Procesando…', ocrSearchable: '¡PDF buscable generado con éxito!', ocrDownloadPdf: 'Descargar PDF', ocrResult: 'Texto extraído', ocrCopied: '¡Copiado!', ocrCopy: 'Copiar', ocrResultPlaceholder: 'El texto extraído aparecerá aquí…', convError: 'Error al procesar el archivo.',
  reviewTitle: 'Valora la herramienta', reviewSubtitle: 'Tu opinión nos ayuda a mejorar.', reviewRate: 'Toca una estrella para valorar', reviewComment: 'Comentario (opcional)', reviewCommentPlaceholder: 'Cuéntanos tu experiencia…', reviewSubmit: 'Enviar valoración', reviewSubmitting: 'Enviando…', reviewError: 'Error al enviar valoración. Inténtalo de nuevo.', reviewThanks: '¡Gracias por tu feedback!',
  feedbackTitle: 'Envía tu sugerencia o reporta un problema', feedbackTypeSuggestion: 'Sugerencia', feedbackTypeProblem: 'Problema', feedbackMessage: 'Mensaje', feedbackMessagePlaceholder: 'Describe tu sugerencia o problema…', feedbackEmail: 'Correo', feedbackEmailPlaceholder: 'tu@email.com', feedbackEmailOptional: '(opcional)', feedbackSubmit: 'Enviar', feedbackSubmitting: 'Enviando…', feedbackError: 'Error al enviar mensaje. Inténtalo de nuevo.', feedbackThanks: '¡Mensaje enviado con éxito!',
  aboutTitle: 'Acerca de PropedeuticaPDF', aboutSubtitle: 'Una suite de herramientas propedéuticas gratuita y de código abierto.', aboutDescription: 'PropedeuticaPDF reúne herramientas esenciales para estudiantes y profesionales: conversión visual de formatos, manipulación de PDFs, síntesis de voz, transcripción de audio/video con IA y más. Todo funciona en tu navegador, con privacidad y sin necesidad de instalación.', aboutFeature1: 'Conversión visual y estructural automática de DOCX y PPTX a PDF', aboutFeature2: 'Unir imágenes, documentos y PDFs en un único PDF', aboutFeature3: 'Dividir PDF visualmente con corte por clic', aboutFeature4: 'Voz y dictado con voces naturales del navegador', aboutFeature5: 'Transcripción de audio y video con IA Groq Whisper', aboutFeature6: 'Soporte multilingüe: Portugués, Español e Inglés', aboutTech: 'Construido con React, Vite, Tailwind CSS, jsPDF y Supabase.', aboutDisclaimer: 'Todas las herramientas procesan tus archivos localmente en el navegador. La transcripción envía audio troceado a la API de Groq.',
  footerText: 'PropedeuticaPDF — herramientas propedéuticas gratuitas',
};

const en: Translation = {
  appTitle: 'PropedeuticaPDF', appTagline: 'Propedeutic tools suite',
  navPdf: 'PDF Tools', navSpeech: 'Speech & Dictation', navTranscription: 'Audio & Video Transcription', navAbout: 'About & Contact', navOcr: 'PDF OCR',
  pdfTitle: 'PDF Tools', pdfSubtitle: 'Convert, merge, visually split, and extract text from files — all in your browser.', pdfSelectMode: 'Choose an operation:', pdfError: 'Error processing file.', pdfProcessing: 'Processing…', pdfAddFile: 'Add file', pdfFilesAdded: 'files added', pdfNoFile: 'No file selected.', pdfRemoveFile: 'Remove',
  pdfConvert: 'Convert Format', pdfConvertHint: '100% automatic and local visual & structural conversion. Upload DOCX, PPTX, PDF, images and convert to PDF, DOCX, or Markdown preserving original formatting.', pdfConvertDropTitle: 'Drop your files here', pdfConvertDropSubtitle: 'or click to select multiple (PDF, DOCX, PPTX, POTX, MD, TXT, JPEG, PNG)', pdfConvertTarget: 'Output format:', pdfConvertToPdf: 'PDF', pdfConvertToDocx: 'DOCX', pdfConvertToMd: 'Markdown', pdfConvertDownloadMode: 'Download mode:', pdfConvertUnified: 'Unified', pdfConvertUnifiedHint: 'All files combined into a single PDF/DOCX/MD', pdfConvertSeparate: 'Separate', pdfConvertSeparateHint: 'Each file converted individually (ZIP)', pdfConvertCta: 'Convert and Download', pdfConvertConverting: 'Converting files…', pdfConvertDone: 'All files converted successfully!', pdfConvertFileDone: 'Converted', pdfConvertFileError: 'Error', pdfConvertDownload: 'Download converted file', pdfConvertPreview: 'Preview', pdfConvertPreviewPlaceholder: 'Extracted content will appear here for review before downloading…', pdfConvertResults: 'Converted files', pdfConvertDownloadingZip: 'Compressing files into ZIP…', pdfConvertUnifiedName: 'converted', pdfConvertProgress: 'Converting file {n} of {total}…', pdfConvertSomeFailed: '{ok} of {total} files converted. {fail} failed.', pdfConvertAllFailed: 'No files could be converted.', pdfConvertVisualProgress: 'Visual rendering',
  pdfMerge: 'Merge to PDF', pdfMergeHint: 'Add images (JPEG, PNG), documents (DOCX, PPTX, MD) or PDFs and combine them all into a single PDF file.', pdfMergeDropTitle: 'Drop your files here', pdfMergeDropSubtitle: 'or click to select (PDF, JPEG, PNG, DOCX, PPTX, MD)', pdfMergeCta: 'Merge into a single PDF', pdfMergeDone: 'PDF generated successfully!', pdfMergeConverting: 'Converting files to PDF…',
  pdfSplit: 'Visual PDF Split', pdfSplitHint: 'Load a PDF, see all pages as thumbnails, and click to define split points.', pdfSplitDropTitle: 'Drop your PDF here', pdfSplitDropSubtitle: 'or click to select a file (.pdf)', pdfSplitPages: 'pages', pdfSplitClickHint: 'Click a page to mark it as the start of a new file. The red line shows where the cut will happen.', pdfSplitCutHere: 'Cut here', pdfSplitStartDoc: 'Document start', pdfSplitCta: 'Split and Download', pdfSplitDownloadZip: 'Download ZIP with all PDFs', pdfSplitDownloadParts: 'Download PDFs separately', pdfSplitGenerating: 'Generating PDF files…', pdfSplitNoCuts: 'No split points defined. Click pages to define where to split.', pdfSplitPart: 'Part', pdfSplitRenderError: 'Error rendering PDF pages.',
  pdfExtract: 'Extract Text', pdfExtractHint: 'Extract all text from the PDF to copy or download.', pdfExtractCta: 'Extract text', pdfResult: 'Extracted text', pdfResultPlaceholder: 'Extracted text will appear here…', pdfCopied: 'Copied!', pdfCopy: 'Copy', pdfDownloadTxt: 'Download .txt',
  speechTitle: 'Speech & Dictation', speechSubtitle: 'Convert text to speech with browser voices and adjust rate and pitch.', speechPlaceholder: 'Type or paste the text you want to hear…', speechRate: 'Rate', speechPitch: 'Pitch', speechVoice: 'Voice', speechPlay: 'Play', speechStop: 'Stop', speechPause: 'Pause', speechResume: 'Resume', speechNoVoice: 'No voices available in this browser.', speechUnsupported: 'Your browser does not support speech synthesis. Try Chrome, Edge, or Firefox.', speechPlaying: 'Playing…', speechPaused: 'Paused', speechDefault: 'Default',
  trTitle: 'Audio & Video Transcription', trSubtitle: 'Transcribe audio and video with Groq Whisper AI — fast and optimized for Paraguayan Spanish.', trDropTitle: 'Drop your audio or video here', trDropSubtitle: 'or click to select (.mp3, .wav, .m4a, .mp4, .webm)', trWarning: 'Transcription uses the Groq API (whisper-large-v3-turbo) with language fixed to Spanish and jopará/guaraní optimization. Long files are automatically chunked.', trResult: 'Transcription', trResultPlaceholder: 'The transcription will appear here in logical paragraphs. You can edit the text freely.', trCopy: 'Copy', trCopied: 'Copied!', trVoiceError: 'Error processing transcription.', trProcessing: 'Processing…', trTranscribe: 'Transcribe Audio/Video', trTranscribing: 'Transcribing…', trExtractingAudio: 'Extracting audio from file…', trChunksDone: 'Chunks processed', trPhaseProcessing: 'Processing audio…', trPhaseAnalyzing: 'Analyzing language and context…', trPhaseStructuring: 'Structuring final text…', trGroqError: 'Groq API error.', trKeyMissing: 'Groq API key not configured. Contact the administrator.', trUnsupported: 'Your browser does not support the required audio features.', trDownloadTxt: 'Download .txt', ocrTitle: 'PDF & Image OCR', ocrSubtitle: 'Extract text from PDFs and images with OCR. Generate searchable PDFs with hidden text overlay.', ocrDropTitle: 'Drop your image or PDF here', ocrDropSubtitle: 'or click to select (.jpeg, .jpg, .png, .pdf)', ocrLanguage: 'OCR Language', ocrRecognizing: 'Recognizing text', ocrProcessing: 'Processing OCR…', ocrProcess: 'Extract Text (OCR)', ocrSearchableGen: 'Generating searchable PDF…', ocrSearchableBtn: 'Generate Searchable PDF', ocrSearchableDesc: 'Generates a PDF with hidden text overlaid on the image, enabling search and copy.', ocrProgress: 'Processing…', ocrSearchable: 'Searchable PDF generated successfully!', ocrDownloadPdf: 'Download PDF', ocrResult: 'Extracted text', ocrCopied: 'Copied!', ocrCopy: 'Copy', ocrResultPlaceholder: 'Extracted text will appear here…', convError: 'Error processing file.',
  reviewTitle: 'Rate this tool', reviewSubtitle: 'Your feedback helps us improve.', reviewRate: 'Tap a star to rate', reviewComment: 'Comment (optional)', reviewCommentPlaceholder: 'Tell us about your experience…', reviewSubmit: 'Submit rating', reviewSubmitting: 'Submitting…', reviewError: 'Error submitting rating. Please try again.', reviewThanks: 'Thank you for your feedback!',
  feedbackTitle: 'Send a suggestion or report a problem', feedbackTypeSuggestion: 'Suggestion', feedbackTypeProblem: 'Problem', feedbackMessage: 'Message', feedbackMessagePlaceholder: 'Describe your suggestion or problem…', feedbackEmail: 'Email', feedbackEmailPlaceholder: 'your@email.com', feedbackEmailOptional: '(optional)', feedbackSubmit: 'Submit', feedbackSubmitting: 'Submitting…', feedbackError: 'Error sending message. Please try again.', feedbackThanks: 'Message sent successfully!',
  aboutTitle: 'About PropedeuticaPDF', aboutSubtitle: 'A free and open-source propedeutic tools suite.', aboutDescription: 'PropedeuticaPDF brings together essential tools for students and professionals: visual format conversion, PDF manipulation, speech synthesis, AI audio/video transcription, and more. Everything runs in your browser, with privacy and no installation required.', aboutFeature1: 'Automatic visual & structural conversion of DOCX and PPTX to PDF', aboutFeature2: 'Merge images, documents, and PDFs into a single PDF', aboutFeature3: 'Visually split PDF with click-to-cut page grid', aboutFeature4: 'Speech and dictation with natural browser voices', aboutFeature5: 'Audio and video transcription with Groq Whisper AI', aboutFeature6: 'Multilingual support: Portuguese, Spanish, and English', aboutTech: 'Built with React, Vite, Tailwind CSS, jsPDF, and Supabase.', aboutDisclaimer: 'All tools process your files locally in the browser. Transcription sends chunked audio to the Groq API.',
  footerText: 'PropedeuticaPDF — free propedeutic tools',
};

export const translations: Record<Lang, Translation> = { pt, es, en };

export function getTranslation(lang: Lang): Translation {
  return translations[lang] || es;
}
