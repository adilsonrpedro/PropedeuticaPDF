// src/components/Footer.tsx
import React from 'react';
import { Instagram } from 'lucide-react';
import { getTranslation } from '../lib/i18n';

export const Footer: React.FC = () => {
  const followInstagram = getTranslation('footer.followInstagram', 'Siga-nos no Instagram');
    const localProcessing = getTranslation('footer.localProcessing', 'Processamento 100% local e seguro.');

      return (
          <footer className="border-t border-slate-200 dark:border-slate-800 py-8 mt-16 bg-white dark:bg-slate-900 text-center text-xs text-slate-500 dark:text-slate-400 space-y-4 w-full">
                <div className="flex justify-center items-center gap-2">
                        <a
                                  href="https://www.instagram.com/propedeuticaemfoco"
                                            target="_blank"
                                                      rel="noreferrer"
                                                                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/50 text-slate-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 rounded-full font-medium transition-colors"
                                                                          title="Instagram Oficial"
                                                                                  >
                                                                                            <Instagram className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                                                                                                      <span>{followInstagram}</span>
                                                                                                              </a>
                                                                                                                    </div>
                                                                                                                          <p>PropedeuticaPDF &copy; {new Date().getFullYear()} - {localProcessing}</p>
                                                                                                                              </footer>
                                                                                                                                );
                                                                                                                                };
export const Footer: React.FC = () => { /* ... */ };
export default Footer;