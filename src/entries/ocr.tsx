import React from 'react';
import { createRoot } from 'react-dom/client';
import OcrTab from '../components/OcrTab';
import '../index.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <OcrTab />
  </React.StrictMode>
);
