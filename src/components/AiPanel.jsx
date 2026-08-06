import { useState } from 'react';
import { PROVIDERS, generateDescription, generateFeatures, generateFullReadme } from '../lib/aiClient';

export default function AiPanel({ state, update }) {
  const [providerId, setProviderId] = useState('anthropic');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState(PROVIDERS.anthropic.defaultModel);
  const [rememberKey, setRememberKey] = useState(false);
  const [loading, setLoading] = useState(null); // 'description' | 'features' | 'full' | null
  const [error, setError] = useState('');

  const provider = PROVIDERS[providerId];
  const techStackNames = state.badges.map((b) => b.name);

  const handleProviderChange = (id) => {
    setProviderId(id);
    setModel(PROVIDERS[id].defaultModel);
    setError('');
  };

  const handleKeyChange = (value) => {
    setApiKey(value);
    if (rememberKey) localStorage.setItem(`readme-studio-key-${providerId}`, value);
  };

  const handleRememberToggle = (checked) => {
    setRememberKey(checked);
    if (checked) localStorage.setItem(`readme-studio-key-${providerId}`, apiKey);
    else localStorage.removeItem(`readme-studio-key-${providerId}`);
  };

  const requireKey = () => {
    if (!apiKey.trim()) {
      setError('Add an API key first.');
      return false;
    }
    return true;
  };

  const handleGenerateFull = async () => {
    if (!requireKey()) return;
    if (!state.projectName.trim()) {
      setError('Add a project name first — the AI needs something to work with.');
      return;
    }
    setLoading('full');
    setError('');
    try {
      const result = await generateFullReadme(providerId, apiKey, model, {
        projectName: state.projectName,
        tagline: state.tagline,
        existingDescription: state.description,
        techStack: techStackNames,
        folderTree: state.folderTree,
      });
      update({
        tagline: result.tagline || state.tagline,
        description: result.description || state.description,
        features: result.features.length ? result.features.join('\n') : state.features,
        roadmap: result.roadmap.length ? result.roadmap.join('\n') : state.roadmap,
        contributing: result.contributing || state.contributing,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  const handleGenerateDescription = async () => {
    if (!requireKey()) return;
    setLoading('description');
    setError('');
    try {
      const text = await generateDescription(providerId, apiKey, model, {
        projectName: state.projectName,
        tagline: state.tagline,
        techStack: techStackNames,
      });
      update({ description: text });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  const handleGenerateFeatures = async () => {
    if (!requireKey()) return;
    setLoading('features');
    setError('');
    try {
      const items = await generateFeatures(providerId, apiKey, model, {
        projectName: state.projectName,
        description: state.description,
        techStack: techStackNames,
      });
      update({ features: items.join('\n') });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="ai-panel">
      <Field label="Provider">
        <select value={providerId} onChange={(e) => handleProviderChange(e.target.value)}>
          {Object.values(PROVIDERS).map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </Field>

      <label className="field">
        <span className="field__label">{provider.name} API key</span>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => handleKeyChange(e.target.value)}
          placeholder={provider.keyPlaceholder}
        />
      </label>

      <label className="field">
        <span className="field__label">Model</span>
        <input
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="mono"
          placeholder={provider.defaultModel}
        />
        {providerId === 'openrouter' && (
          <span className="field__hint">
            Free models end in <code>:free</code>. The free lineup rotates often — check{' '}
            <a href={provider.keyHelpUrl} target="_blank" rel="noreferrer">
              current free models
            </a>{' '}
            before relying on one.
          </span>
        )}
      </label>

      <label className="checkbox-row">
        <input type="checkbox" checked={rememberKey} onChange={(e) => handleRememberToggle(e.target.checked)} />
        Remember this key on this device
      </label>

      <span className="field__hint">
        {provider.notes} Sent directly from your browser to {provider.name} — never stored by this app. Get a
        key at{' '}
        <a href={providerId === 'openrouter' ? 'https://openrouter.ai/keys' : provider.keyHelpUrl} target="_blank" rel="noreferrer">
          {providerId === 'openrouter' ? 'openrouter.ai/keys' : 'console.anthropic.com'}
        </a>
        .
      </span>

      <button className="btn btn--primary ai-panel__full-btn" onClick={handleGenerateFull} disabled={loading !== null}>
        {loading === 'full' ? 'Writing your README…' : '✨ Generate Full README with AI'}
      </button>
      <span className="field__hint">
        Fills tagline, description, features, roadmap, and contributing text in one call.
        Badges and install commands stay based on your actual dependencies, not AI guesses.
      </span>

      <div className="ai-panel__actions">
        <button className="btn btn--ghost" onClick={handleGenerateDescription} disabled={loading !== null}>
          {loading === 'description' ? 'Writing…' : 'Rewrite Description Only'}
        </button>
        <button className="btn btn--ghost" onClick={handleGenerateFeatures} disabled={loading !== null}>
          {loading === 'features' ? 'Thinking…' : 'Suggest Features Only'}
        </button>
      </div>
      {error && <p className="ai-panel__error">{error}</p>}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      {children}
    </label>
  );
}