import React from 'react';

interface AdBannerProps {
  page: 'home' | 'unir' | 'ocr' | 'transcricao' | 'dividir' | 'comprimir';
  position: 'top' | 'bottom';
}

export default function AdBanner({ page, position }: AdBannerProps) {
  // Mapeamento organizado dos IDs exclusivos do seu painel de anúncios
  const adSlots: Record<string, { top: string; bottom: string }> = {
    home: { top: '1001', bottom: '1002' },
    unir: { top: '2001', bottom: '2002' },
    ocr: { top: '3001', bottom: '3002' },
    transcricao: { top: '4001', bottom: '4002' }
  };

  // Resgata o ID exato com base na página e posição, usando a Home como fallback
  const currentSlot = adSlots[page]?.[position] || adSlots.home[position];

  return (
    <div className="w-full max-w-4xl mx-auto my-4 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center min-h-[90px]">
      <span className="text-[9px] uppercase tracking-widest text-slate-400 mb-1 block font-bold">
        Anúncio - {page.toUpperCase()} ({position.toUpperCase()})
      </span>
      
      {/* Elemento oficial de injeção da sua rede de monetização */}
      {/* <ins className="adsbygoogle" data-ad-slot={currentSlot} ... /> */}
      
      <div className="text-xs text-slate-400/80 italic text-center">
        Espaço de Monetização [Slot ID: {currentSlot}]
      </div>
    </div>
  );
}