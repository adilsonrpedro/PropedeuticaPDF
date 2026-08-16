import React, { useEffect, useState } from 'react';
import { Instagram } from 'lucide-react';

interface FooterProps {
  t?: any;
}

export default function Footer({ t }: FooterProps) {
  // Estados para gerenciar a tradução de todas as partes do rodapé
  const [instagramText, setInstagramText] = useState('Siga-nos no Instagram');
  const [securityText, setSecurityText] = useState('Processamento 100% local e seguro.');

  useEffect(() => {
    // 1. Tenta extrair as traduções dinâmicas do objeto 't' da página
    const trackInstagram = t?.followInstagram || t?.followUs || t?.instagram;
    const trackSecurity = t?.localProcessing || t?.securityNotice || t?.footerSecurity;

    if (trackInstagram) setInstagramText(trackInstagram);
    if (trackSecurity) setSecurityText(trackSecurity);

    // 2. Plano de contingência síncrono integrado para traduzir o restante caso 't' não possua as chaves
    if (!trackInstagram || !trackSecurity) {
      const currentLang = localStorage.getItem('language') || 'PT';
      
      const dictionary: Record<string, { instagram: string; security: string }> = {
        PT: {
          instagram: 'Siga-nos no Instagram',
          security: 'Processamento 100% local e seguro.'
        },
        ES: {
          instagram: 'Síguenos en Instagram',
          security: 'Procesamiento 100% local y seguro.'
        },
        EN: {
          instagram: 'Follow us on Instagram',
          security: '100% local and secure processing.'
        }
      };

      const currentTarget = dictionary[currentLang] || dictionary.PT;
      
      if (!trackInstagram) setInstagramText(currentTarget.instagram);
      if (!trackSecurity) setSecurityText(currentTarget.security);
    }
  }, [t]); // Dispara o re-render sempre que o idioma mudar na página

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 py-8 mt-16 bg-white dark:bg-slate-900 text-center text-xs text-slate-500 dark:text-slate-400 space-y-4 w-full">
      {/* Botão do Instagram */}
      <div className="flex justify-center items-center gap-2">
        <a
          href="https://www.instagram.com/propedeuticaemfoco"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/50 text-slate-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 rounded-full font-medium transition-colors"
          title="Instagram Oficial"
        >
          <Instagram className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>{instagramText}</span>
        </a>
      </div>
      
      {/* Texto de Direitos Autorais e Segurança 100% Traduzido */}
      <p>PropedeuticaPDF &copy; {new Date().getFullYear()} - {securityText}</p>
    </footer>
  );
}
