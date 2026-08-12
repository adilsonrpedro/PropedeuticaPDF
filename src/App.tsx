import React, { useState } from 'react';
import { DropZone } from './components/DropZone';
import { ConvertSection } from './components/ConvertSection';
import { OcrTab } from './components/OcrTab';
import { TranscriptionTab } from './components/TranscriptionTab';
import { Translation } from './lib/i18n';

interface AppProps {
  t: Translation;
}

const App: React.FC<AppProps> = ({ t }) => {
  const [navOption, setNavOption] = useState<string>('convert');
  const [files, setFiles] = useState<File[]>([]);

  const handleFileDrop = (droppedFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...droppedFiles]);
  };

  const handleNavChange = (option: string) => {
    setNavOption(option);
  };

  // Placeholder components for sections not yet implemented
  const SplitSection: React.FC<{ t: Translation }> = ({ t }) => (
    <div className="section">
      <h2>{t('splitTitle') || 'Dividir PDF'}</h2>
      <p>{t('splitDescription') || 'Funcionalidade em desenvolvimento.'}</p>
    </div>
  );

  const CompressSection: React.FC<{ t: Translation }> = ({ t }) => (
    <div className="section">
      <h2>{t('compressTitle') || 'Comprimir PDF'}</h2>
      <p>{t('compressDescription') || 'Funcionalidade em desenvolvimento.'}</p>
    </div>
  );

  return (
    <div className="App">
      <header className="App-header">
        <h1>Suite PDF</h1>
        <nav className="App-nav">
          <button
            onClick={() => handleNavChange('convert')}
            className={navOption === 'convert' ? 'active' : ''}
          >
            Unir PDF
          </button>
          <button
            onClick={() => handleNavChange('split')}
            className={navOption === 'split' ? 'active' : ''}
          >
            Dividir PDF
          </button>
          <button
            onClick={() => handleNavChange('compress')}
            className={navOption === 'compress' ? 'active' : ''}
          >
            Comprimir PDF
          </button>
          <button
            onClick={() => handleNavChange('ocr')}
            className={navOption === 'ocr' ? 'active' : ''}
          >
            OCR
          </button>
          <button
            onClick={() => handleNavChange('transcription')}
            className={navOption === 'transcription' ? 'active' : ''}
          >
            Transcrição
          </button>
        </nav>
      </header>

      <main>
        <DropZone
          onFile={handleFileDrop}
          title={t('uploadTitle')}
          subtitle={t('uploadSubtitle')}
          accept="application/pdf"
          accent="teal"
          multiple={true}
        />
        {navOption === 'convert' && <ConvertSection t={t} />}
        {navOption === 'split' && <SplitSection t={t} />}
        {navOption === 'compress' && <CompressSection t={t} />}
        {navOption === 'ocr' && <OcrTab t={t} />}
        {navOption === 'transcription' && <TranscriptionTab t={t} />}
      </main>
    </div>
  );
};

export default App;
