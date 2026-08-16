import React, { useEffect, useState } from 'react';
import { Instagram } from 'lucide-react';

interface FooterProps {
  t?: any;
}

export default function Footer({ t }: FooterProps) {
  // Estado local para garantir o re-render forçado quando o idioma mudar
  const [currentText, setCurrentText] = useState('Siga-nos no Instagram');

  useEffect(() => {
    // 1. Tenta extrair a string traduzida baseada nas chaves prováveis do seu dicionário
    const dynamicText = t?.followInstagram || t?.followUs || t?.instagram;
    
    if (dynamicText) {
      setCurrentText(dynamicText);
    } else {
      // 2. Se 't' falhar ou não vir atualizado, lê e traduz direto do localStorage de forma síncrona
      const currentLang = localStorage.getItem('language') || 'PT';
      const fallbackDictionary: Record<string, string> = {
        PT: 'Siga-nos no Instagram',
        ES: 'Síguenos en Instagram',
        EN: 'Follow us on Instagram'
      };
      setCurrentText(fallbackDictionary[currentLang] || fallbackDictionary.PT);
    }
  }, [t]); // Dispara o efeito toda vez que o objeto 't' da página sofrer mutação

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
          <span>{currentText}</span>
        </a>
      </div>
      <p>PropedeuticaPDF &copy; {new Date().getFullYear()} - Processamento 100% local e seguro.</p>
    </footer>
  );
}