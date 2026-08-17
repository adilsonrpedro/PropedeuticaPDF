// 1. Tabela centralizada de termos (Adicione novas ferramentas apenas criando a linha aqui)
export const translations: Record<string, Record<string, string>> = {
  // --- TÍTULOS E DESCRIÇÕES DE PÁGINAS ---
  unirTitle:   { PT: 'Unir Arquivos PDF', ES: 'Unir Archivos PDF', EN: 'Merge PDF Files' },
  unirDesc:    { PT: 'Combine vários PDFs em um.', ES: 'Combine varios PDF en uno.', EN: 'Combine multiple PDFs into one.' },
  ocrTitle:    { PT: 'Reconhecimento de Texto (OCR)', ES: 'Reconocimiento de Texto (OCR)', EN: 'Text Recognition (OCR)' },
  
  // --- ACESSÓRIOS GLOBAIS (FOOTER / INTERFACES) ---
  followInsta: { PT: 'Siga-nos no Instagram', ES: 'Síguenos en Instagram', EN: 'Follow us on Instagram' },
  safeText:    { PT: 'Processamento 100% local e seguro.', ES: 'Procesamiento 100% local y seguro.', EN: '100% local and secure processing.' },
  dropzone:    { PT: 'Arraste e solte seus arquivos aqui', ES: 'Arrastre y suelte sus archivos aquí', EN: 'Drag and drop your files here' },
  btnProcess:  { PT: 'Processar Agora', ES: 'Procesar Ahora', EN: 'Process Now' },
  loading:     { PT: 'Processando...', ES: 'Procesando...', EN: 'Processing...' }
};

// 2. Função Mestre Automatizada
export function getTranslation(key: string, fallbackText: string = ''): string {
  const currentLang = (localStorage.getItem('language') || 'PT').toUpperCase();
  // Busca a chave na tabela, se não achar, usa o texto padrão (fallback) escrito no HTML
  return translations[key]?.[currentLang] || fallbackText;
}
