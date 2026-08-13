import React from 'react';
import Home from './components/Home';

export const App: React.FC = () => {
  // Objeto de tradução para compatibilidade i18n
  const t: Record<string, string> = {
    mergeTitle: 'Unir PDFs',
    mergeSubtitle: 'Combine vários arquivos PDF em um único documento em segundos.',
  };

  return <Home t={t} />;
};

export default App;