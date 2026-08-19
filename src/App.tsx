import React, { useState, useEffect } from 'react';
import Home from './components/Home';
import ConvertSection from './components/ConvertSection';
import OcrSection from './components/OcrSection';

export const App: React.FC = () => {
  const [route, setRoute] = useState<string>(() => window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setRoute(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Rota Unir PDF (/unir ou /unir.html)
  if (route.includes('unir')) {
    return <ConvertSection />;
  }

  // Rota OCR Inteligente (/ocr ou /ocr.html)
  if (route.includes('ocr')) {
    return <OcrSection />;
  }

  // Padrão: Página Inicial (Home)
  return <Home />;
};

export default App;