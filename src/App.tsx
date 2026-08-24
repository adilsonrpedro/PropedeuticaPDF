import React, { useState, useEffect } from 'react';
import Home from './components/Home';
import MergedSection from './components/MergedSection';
import OcrSection from './components/OcrSection';
import ConvertUniversalSection from './components/ConvertUniversalSection';

export const App: React.FC = () => {
  const [route, setRoute] = useState<string>(() => window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setRoute(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (route.includes('unir')) return <MergedSection />;
  if (route.includes('ocr')) return <OcrSection />;
  if (route.includes('converter')) return <ConvertUniversalSection />;

  return <Home />;
};

export default App;