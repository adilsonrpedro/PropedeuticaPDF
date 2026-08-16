import React from 'react';
import { Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 mt-12 py-8 px-4">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        {/* Direitos Autorais */}
        <p className="text-sm text-slate-500 dark:text-slate-400">
          &copy; {new Date().getFullYear()} PropedeuticaPDF. Todos os direitos reservados.
        </p>

        {/* Link Oficial do Instagram */}
        <a
          href="https://www.instagram.com/propedeuticaemfoco"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors group"
        >
          <Instagram size={18} className="text-slate-400 group-hover:text-teal-600 transition-colors" />
          <span>@propedeuticaemfoco</span>
        </a>
      </div>
    </footer>
  );
}
