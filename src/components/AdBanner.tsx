import React from 'react';

interface AdBannerProps {
  slot?: string;
  type?: 'horizontal' | 'vertical' | 'square';
}

export default function AdBanner({ slot, type = 'horizontal' }: AdBannerProps) {
  // Define os tamanhos padrões de mercado com base no tipo
  const sizeClasses = {
    horizontal: 'w-full h-24 max-w-4xl',
    vertical: 'w-40 h-[600px] hidden lg:flex',
    square: 'w-300 h-250 mx-auto'
  };

  return (
    <div className="my-6 px-4 flex items-center justify-center">
      <div className={`${sizeClasses[type]} bg-slate-100 border border-slate-200 rounded-xl flex flex-col items-center justify-center text-center p-2 shadow-inner animate-pulse`}>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Espaço Publicitário</span>
        <p className="text-xs text-slate-500 font-medium mt-1">PropedeuticaPDF Ads</p>
      </div>
    </div>
  );
}
