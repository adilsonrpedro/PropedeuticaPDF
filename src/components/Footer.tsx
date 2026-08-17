import React from 'react';
import { Instagram } from 'lucide-react';
import { getTranslation } from '../lib/i18n'; // Importa a função automática

export default function Footer() {
  return (
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 mt-16 bg-white dark:bg-slate-900 text-center text-xs text-slate-500 dark:text-slate-400 space-y-4 w-full">
            <div className="flex justify-center items-center gap-2">
                    <a
                              href="https://www.instagram.com/propedeuticaemfoco"
                                        target="_blank"
                                                  rel="noreferrer"
                                                            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-full font-medium"
                                                                    >
                                                                              <Instagram className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                                                                                        {/* USO DA FUNÇÃO AUTOMÁTICA NO BOTÃO */}
                                                                                                  <span>{getTranslation('followInsta', 'Siga-nos no Instagram')}</span>
                                                                                                          </a>
                                                                                                                </div>
                                                                                                                      {/* USO DA FUNÇÃO AUTOMÁTICA NA FRASE DE PRIVACIDADE */}
                                                                                                                            <p>PropedeuticaPDF &copy; {new Date().getFullYear()} - {getTranslation('safeText', 'Processamento 100% local e seguro.')}</p>
                                                                                                                                </footer>
                                                                                                                                  );
                                                                                                                                  }
