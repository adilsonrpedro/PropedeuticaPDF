import React, { useState, useEffect } from 'react';
import { Instagram } from 'lucide-react';

interface FooterProps {
  t?: Record<string, any>;
}

const fallbackDict: Record<string, { instagram: string; security: string }> = {
  pt: { instagram: 'Siga-nos no Instagram', security: 'Processamento 100% local e seguro.' },
  es: { instagram: 'Síguenos en Instagram', security: 'Procesamiento 100% local y seguro.' },
  en: { instagram: 'Follow us on Instagram', security: '100% local and secure processing.' }
};

export const Footer: React.FC<FooterProps> = ({ t }) => {
  const [lang, setLang] = useState<string>(() => localStorage.getItem('language') || 'pt');

  useEffect(() => {
    const handleSync = () => setLang(localStorage.getItem('language') || 'pt');
    window.addEventListener('storage', handleSync);
    window.addEventListener('languageChange', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('languageChange', handleSync);
    };
  }, []);

  const currentLang = fallbackDict[lang] ? lang : 'pt';
  const dict = fallbackDict[currentLang];

  const instagramText = t?.followInstagram || dict.instagram;
  const securityText = t?.localProcessing || t?.securityNotice || dict.security;

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 py-8 mt-16 bg-white dark:bg-slate-900 text-center text-xs text-slate-500 dark:text-slate-400 space-y-4 w-full">
      <div className="flex justify-center items-center gap-2">
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/50 text-slate-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 rounded-full font-medium transition-colors"
          title="Instagram Oficial"
        >
          <Instagram className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>{instagramText}</span>
        </a>
      </div>
      <p>
        PropedeuticaPDF &copy; {new Date().getFullYear()} - {securityText}
      </p>
    </footer>
  );
};

export default Footer;