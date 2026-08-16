import React from 'react';
import { Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-slate-900 border-t border-slate-800 mt-12 py-8 px-4">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        {/* Direitos Autorais */}
        <p className="text-sm text-slate-400">
          &copy; {new Date().getFullYear()}{' '}
          <span className="font-semibold text-slate-200">PropedeuticaPDF</span>. 
          Todos os direitos reservados.
        </p>

        {/* Link Oficial do Instagram */}
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-emerald-400 transition-colors group"
        >
          <Instagram size={18} className="text-slate-400 group-hover:text-emerald-400 transition-colors" />
          <span>@propedeuticaemfoco</span>
        </a>
      </div>
    </footer>
  );
}
