import { useState } from 'react';
import { analyzeGithubRepo } from '../lib/githubImport';
import { analyzeZipFile } from '../lib/zipImport';

const OPTIONS = [
  {
    id: 'github',
    title: 'Import GitHub Repository',
    desc: 'Paste a repo URL. We read package.json, license, and folder structure to prefill everything.',
  },
  {
    id: 'upload',
    title: 'Upload Project',
    desc: 'Drop a .zip of your project. Same analysis, done entirely in your browser.',
  },
  {
    id: 'scratch',
    title: 'Start from Scratch',
    desc: 'Pick a stack template and fill in the form manually.',
  },
];

export default function Home({ onReady }) {
  const [mode, setMode] = useState(null);
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGithubAnalyze = async () => {
    if (!repoUrl.trim()) return;
    setLoading(true);
    setError('');
    try {
      const data = await analyzeGithubRepo(repoUrl);
      onReady(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleZipUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const data = await analyzeZipFile(file);
      onReady(data);
    } catch (err) {
      setError('Could not read that zip file. ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      <div className="home__intro">
        <h1>README AI Studio</h1>
        <p>Generate a polished README from an existing repo, a project zip, or a blank form.</p>
      </div>

      <div className="home__cards">
        {OPTIONS.map((opt) => (
          <button
            key={opt.id}
            className={`home-card ${mode === opt.id ? 'home-card--active' : ''}`}
            onClick={() => {
              setMode(opt.id);
              setError('');
              if (opt.id === 'scratch') onReady({});
            }}
          >
            <span className="home-card__dot" />
            <span className="home-card__title">{opt.title}</span>
            <span className="home-card__desc">{opt.desc}</span>
          </button>
        ))}
      </div>

      {mode === 'github' && (
        <div className="home__panel">
          <label className="field">
            <span className="field__label">GitHub repository URL</span>
            <input
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/owner/repo"
              onKeyDown={(e) => e.key === 'Enter' && handleGithubAnalyze()}
            />
          </label>
          <button className="btn btn--primary" onClick={handleGithubAnalyze} disabled={loading}>
            {loading ? 'Analyzing…' : 'Analyze Repository'}
          </button>
          <span className="field__hint">Public repositories only. Nothing is stored on any server.</span>
          {error && <p className="home__error">{error}</p>}
        </div>
      )}

      {mode === 'upload' && (
        <div className="home__panel">
          <label className="field">
            <span className="field__label">Project .zip file</span>
            <input type="file" accept=".zip" onChange={handleZipUpload} />
          </label>
          {loading && <p className="field__hint">Reading archive…</p>}
          <span className="field__hint">Parsed entirely in your browser — the file is never uploaded anywhere.</span>
          {error && <p className="home__error">{error}</p>}
        </div>
      )}
    </div>
  );
}
