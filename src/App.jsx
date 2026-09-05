import { useState, useMemo, useCallback } from 'react';
import Home from './components/Home';
import FormPanel from './components/FormPanel';
import PreviewPane from './components/PreviewPane';
import TopBar from './components/TopBar';
import RepoAnalysisView from './components/RepoAnalysisView';
import { generateMarkdown } from './utils/generateMarkdown';
import { analyzeRepo } from './lib/analyzeClient';
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
  const [activeTab, setActiveTab] = useState('readme'); // 'readme' | 'analysis'
  const [state, setState] = useState(emptyState);
  const [savedPulse, setSavedPulse] = useState(false);
  const [importNote, setImportNote] = useState(null);

  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState(null);

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
    setAnalysis(null);
    setAnalyzeError(null);
    setActiveTab('readme');
    setView('home');
  };

  const runAnalysis = useCallback(async () => {
    if (!state.githubUser || !state.repoName) {
      setAnalyzeError('Enter a GitHub username and repo name first.');
      return;
    }
    setAnalyzing(true);
    setAnalyzeError(null);
    setAnalysis(null);
    try {
      const repoUrl = `https://github.com/${state.githubUser}/${state.repoName}`;
      const result = await analyzeRepo(repoUrl);
      setAnalysis(result);
    } catch (err) {
      setAnalyzeError(err.message);
    } finally {
      setAnalyzing(false);
    }
  }, [state.githubUser, state.repoName]);

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
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      {importNote && (
        <div className="import-note">
          <span>{importNote}</span>
          <button className="import-note__dismiss" onClick={() => setImportNote(null)} aria-label="Dismiss">
            ×
          </button>
        </div>
      )}

      {activeTab === 'readme' ? (
        <main className="workspace">
          <FormPanel
            state={state}
            update={update}
            onAnalyze={() => {
              runAnalysis();
              setActiveTab('analysis');
            }}
          />
          <PreviewPane markdown={markdown} githubUser={state.githubUser} repoName={state.repoName} state={state} />
        </main>
      ) : (
        <RepoAnalysisView
          state={state}
          update={update}
          analysis={analysis}
          analyzing={analyzing}
          analyzeError={analyzeError}
          onAnalyze={runAnalysis}
        />
      )}
    </div>
  );
}