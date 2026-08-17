import React from 'react';

interface AdBannerProps {
  page?: string;
  position?: string;
  type?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ page = 'home', position = 'top', type }) => {
  const displayType = type || position || 'horizontal';

  return (
    <div className="w-full my-4 flex justify-center items-center">
      <div className="w-full max-w-3xl min-h-[90px] p-4 bg-slate-100 dark:bg-slate-800/60 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center text-center text-xs text-slate-400 dark:text-slate-500">
        <span className="font-semibold uppercase tracking-wider text-[10px] text-teal-600 dark:text-teal-400">
          Espaço Publicitário ({page} - {displayType})
        </span>
        <span className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
          Anúncios serão exibidos aqui em produção.
        </span>
      </div>
    </div>
  );
};

export default AdBanner;