import React, { useEffect, useState } from 'react';
import { Instagram } from 'lucide-react';

interface FooterProps {
  t?: any;
}

export default function Footer({ t }: FooterProps) {
  const [instaText, setInstaText] = useState('Siga-nos no Instagram');
  const [safeText, setSafeText] = useState('Processamento 100% local e seguro.');

  useEffect(() => {
    // Sincronização direta com o i18n do site
    if (t?.followInstagram) setInstaText(t.followInstagram);
    if (t?.localProcessing) setSafeText(t.localProcessing);

    // Fallback de segurança síncrono via localStorage caso a página demore a repassar o 't'
    if (!t?.followInstagram || !t?.localProcessing) {
      const lang = localStorage.getItem('language') || 'PT';
      const fallback: Record<string, { i: string; s: string }> = {
        PT: { i: 'Siga-nos no Instagram', s: 'Processamento 100% local e seguro.' },
        ES: { i: 'Síguenos en Instagram', s: 'Procesamiento 100% local y seguro.' },
        EN: { i: 'Follow us on Instagram', s: '100% local and secure processing.' }
      };
      const active = fallback[lang] || fallback.PT;
      if (!t?.followInstagram) setInstaText(active.i);
      if (!t?.localProcessing) setSafeText(active.s);
    }
  }, [t]);

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 py-8 mt-16 bg-white dark:bg-slate-900 text-center text-xs text-slate-500 dark:text-slate-400 space-y-4 w-full">
      <div className="flex justify-center items-center gap-2">
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/50 text-slate-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 rounded-full font-medium transition-colors"
        >
          <Instagram className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>{instaText}</span>
        </a>
      </div>
      <p>PropedeuticaPDF &copy; {new Date().getFullYear()} - {safeText}</p>
    </footer>
  );
}
