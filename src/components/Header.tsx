import React from 'react';
import { Sparkles, Globe } from 'lucide-react';
import { useTranslation } from '../lib/i18n';

export const Header: React.FC = () => {
  const { lang: idioma, setLanguage, t } = useTranslation();

  return (
    <header className="w-full">
      <div className="flex flex-col md:grid md:grid-cols-3 md:items-start md:gap-6 w-full pt-6 md:pt-8 px-4 sm:px-8 max-w-6xl mx-auto">
        
        {/* Seletor de Idiomas */}
        <div className="order-first md:order-3 md:self-start flex justify-end items-start w-full mb-4 md:mb-0 mt-0 pt-0">
          <div className="h-8 px-3 inline-flex items-center justify-center bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700/80 shadow-sm gap-1">
            <div className="px-1 text-slate-400 flex items-center justify-center">
              <Globe className="w-3.5 h-3.5" />
            </div>
            {(['pt', 'es', 'en'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase transition-all duration-200 leading-none ${
                  idioma === lang
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Logo Clicável */}
        <div className="order-2 md:order-1 flex justify-center md:justify-start items-center mb-4 md:mb-0 w-full">
          <a href="/" className="inline-block transition-transform hover:scale-[1.01]">
            <img
              src="/logo.png"
              alt="Logo PropedeuticaPDF"
              className="h-48 lg:h-56 w-auto object-contain flex-shrink-0 pt-2 md:pt-4"
            />
          </a>
        </div>

        {/* Textos e Badge */}
        <div className="order-3 md:order-2 flex flex-col items-center text-center col-span-1 space-y-4 w-full">
          <div className="h-8 py-1.5 px-4 inline-flex items-center justify-center gap-2 rounded-full bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 text-xs font-semibold tracking-wide whitespace-nowrap">
            <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400 flex-shrink-0" />
            <span>{t('header.suiteTag', 'Suíte Completa de Ferramentas PDF & IA')}</span>
          </div>

          <a href="/" className="group">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
              Propedeutica<span className="text-teal-600 dark:text-teal-400">PDF</span>
            </h1>
          </a>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            {t('header.subtitleLine1', 'Processamento rápido, seguro e no seu próprio navegador.')}
            <br />
            {t('header.subtitleLine2', 'Escolha uma das ferramentas abaixo para começar.')}
          </p>
        </div>

      </div>
    </header>
  );
};

export default Header;