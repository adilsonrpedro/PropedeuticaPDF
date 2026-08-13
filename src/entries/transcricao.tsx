import React from 'react';
import { createRoot } from 'react-dom/client';
import TranscriptionTab from '../components/TranscriptionTab';
import '../index.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
      <TranscriptionTab />
        </React.StrictMode>
        );
        