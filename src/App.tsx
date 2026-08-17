import React, { useState, useEffect } from 'react';
import Home from './components/Home';
import ConvertSection from './components/ConvertSection';

export const App: React.FC = () => {
  const [route, setRoute] = useState<string>(() => window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setRoute(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (route === '/unir') {
    return <ConvertSection />;
  }

  return <Home />;
};

export default App;