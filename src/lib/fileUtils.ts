export type FileKind = 'image' | 'pdf' | 'audio' | 'video' | 'docx' | 'pptx' | 'potx' | 'markdown' | 'text' | 'unknown';

export function detectKind(file: File): FileKind {
  const name = file.name.toLowerCase();
  const type = file.type;
  if (type.startsWith('image/') || /\.(jpe?g|png|gif|bmp|webp)$/.test(name)) return 'image';
  if (type === 'application/pdf' || name.endsWith('.pdf')) return 'pdf';
  if (type.startsWith('audio/')) return 'audio';
  if (type.startsWith('video/')) return 'video';
  if (name.endsWith('.docx') || type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'docx';
  if (name.endsWith('.pptx') || type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') return 'pptx';
  if (name.endsWith('.potx') || type === 'application/vnd.openxmlformats-officedocument.presentationml.template') return 'potx';
  if (name.endsWith('.md')) return 'markdown';
  if (type.startsWith('text/') || name.endsWith('.txt')) return 'text';
  return 'unknown';
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function fileExtension(name: string): string {
  const idx = name.lastIndexOf('.');
  return idx >= 0 ? name.slice(idx + 1).toUpperCase() : '';
}

export function baseName(name: string): string {
  const idx = name.lastIndexOf('.');
  return idx >= 0 ? name.slice(0, idx) : name;
}

export const ACCEPTED_CONVERT = [
  '.pdf', '.docx', '.pptx', '.potx', '.md', '.txt', '.jpg', '.jpeg', '.png',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.presentationml.template',
  'text/plain', 'text/markdown', 'image/jpeg', 'image/png',
].join(',');
