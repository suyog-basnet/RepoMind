import { useState, useMemo, useCallback } from 'react';
import Home from './components/Home';
import FormPanel from './components/FormPanel';
import PreviewPane from './components/PreviewPane';
import TopBar from './components/TopBar';
import { generateMarkdown } from './utils/generateMarkdown';
import './styles/app.css';

const emptyState = {
  projectName: '',
  tagline: '',
  description: '',
  githubUser: '',
  repoName: '',
  badges: [],
  features: '',
  installSteps: '',
  usageLang: 'bash',
  usageCode: '',
  screenshots: '',
  folderTree: '',
  architecture: { frontend: '', backend: '', database: '' },
  roadmap: '',
  contributing: '',
  licenseId: 'mit',
  authorName: '',
  authorLinks: '',
  includeToc: true,
  themeId: 'modern',
};

export default function App() {
  const [view, setView] = useState('home'); // 'home' | 'studio'
  const [state, setState] = useState(emptyState);
  const [savedPulse, setSavedPulse] = useState(false);
  const [importNote, setImportNote] = useState(null);

  const update = useCallback((patch) => {
    setState((s) => ({ ...s, ...patch }));
  }, []);

  const handleReady = useCallback((importedData) => {
    const hasData = importedData && Object.keys(importedData).length > 0;
    setState((s) => ({
      ...s,
      ...importedData,
      architecture: { ...s.architecture, ...(importedData?.architecture || {}) },
    }));
    if (hasData) {
      const source = importedData.stars !== undefined ? 'GitHub repository' : 'uploaded project';
      setImportNote(
        `Imported from ${source}${importedData.hasPackageJson ? ' — package.json detected, tech stack and install steps were auto-filled.' : '. No package.json found, so tech stack and install steps are left for you to fill in.'}`
      );
    } else {
      setImportNote(null);
    }
    setView('studio');
  }, []);

  const markdown = useMemo(() => generateMarkdown(state), [state]);

  const triggerPulse = () => {
    setSavedPulse(true);
    setTimeout(() => setSavedPulse(false), 1400);
  };

  const startOver = () => {
    setState(emptyState);
    setImportNote(null);
    setView('home');
  };

  if (view === 'home') {
    return (
      <div className="app-shell app-shell--home">
        <Home onReady={handleReady} />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <TopBar
        markdown={markdown}
        projectName={state.projectName}
        onAction={triggerPulse}
        savedPulse={savedPulse}
        onStartOver={startOver}
      />
      {importNote && (
        <div className="import-note">
          <span>{importNote}</span>
          <button className="import-note__dismiss" onClick={() => setImportNote(null)} aria-label="Dismiss">
            ×
          </button>
        </div>
      )}
      <main className="workspace">
        <FormPanel state={state} update={update} />
        <PreviewPane markdown={markdown} githubUser={state.githubUser} repoName={state.repoName} state={state} />
      </main>
    </div>
  );
}
