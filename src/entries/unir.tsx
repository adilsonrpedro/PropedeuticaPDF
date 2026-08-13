import React from 'react';
import { createRoot } from 'react-dom/client';
import { ConvertSection } from '../components/ConvertSection';
import '../index.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConvertSection />
  </React.StrictMode>
);
