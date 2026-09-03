import { useState } from 'react';
import { BADGE_CATEGORIES, LICENSES, ALL_BADGES } from '../data/badgeOptions';
import { THEMES } from '../data/themes';
import { TEMPLATES } from '../data/templates';
import AiPanel from './AiPanel';
import QualityScore from './QualityScore';
import { analyzeRepo } from '../lib/analyzeClient';
import { scoreCodeQuality } from '../lib/codeQualityScore';

function Field({ label, hint, children }) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      {children}
      {hint && <span className="field__hint">{hint}</span>}
    </label>
  );
}

function Section({ number, title, children, defaultOpen = true }) {
  return (
    <details className="section" open={defaultOpen}>
      <summary className="section__summary">
        <span className="section__number">{number}</span>
        {title}
      </summary>
      <div className="section__body">{children}</div>
    </details>
  );
}

export default function FormPanel({ state, update }) {
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState(null);

  const toggleBadge = (badge) => {
    const exists = state.badges.some((b) => b.id === badge.id);
    update({
      badges: exists ? state.badges.filter((b) => b.id !== badge.id) : [...state.badges, badge],
    });
  };

  const applyTemplate = (templateId) => {
    const tpl = TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;
    const badges = ALL_BADGES.filter((b) => tpl.badges.includes(b.id));
    update({
      badges,
      installSteps: tpl.install,
      usageLang: tpl.usageLang,
      usageCode: tpl.usage,
    });
  };

  const updateArch = (patch) => {
    update({ architecture: { ...state.architecture, ...patch } });
  };

  const runAnalysis = async () => {
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
  };

  const codeScore = analysis ? scoreCodeQuality(analysis) : null;

  return (
    <aside className="form-panel">
      <div className="form-panel__scroll">
        <Section number="01" title="Theme & Template">
          <Field label="Theme" hint="Controls tone and formatting — not the underlying content">
            <select value={state.themeId} onChange={(e) => update({ themeId: e.target.value })}>
              {THEMES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Quick-start template" hint="Prefills badges + install/usage commands for a common stack">
            <select defaultValue="" onChange={(e) => e.target.value && applyTemplate(e.target.value)}>
              <option value="">Choose a stack…</option>
              {TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </Field>
        </Section>

        <Section number="02" title="Project">
          <Field label="Project name">
            <input
              value={state.projectName}
              onChange={(e) => update({ projectName: e.target.value })}
              placeholder="My Awesome Project"
            />
          </Field>
          <Field label="Tagline" hint="One line, shown under the title">
            <input
              value={state.tagline}
              onChange={(e) => update({ tagline: e.target.value })}
              placeholder="A short, punchy one-liner"
            />
          </Field>
          <Field label="About / Description">
            <textarea
              rows={4}
              value={state.description}
              onChange={(e) => update({ description: e.target.value })}
              placeholder="What does this project do and why does it exist?"
            />
          </Field>
        </Section>

        <Section number="03" title="AI Assist" defaultOpen={false}>
          <AiPanel state={state} update={update} />
        </Section>

        <Section number="04" title="Repository">
          <div className="field-row">
            <Field label="GitHub username">
              <input
                value={state.githubUser}
                onChange={(e) => update({ githubUser: e.target.value })}
                placeholder="your-username"
              />
            </Field>
            <Field label="Repo name">
              <input
                value={state.repoName}
                onChange={(e) => update({ repoName: e.target.value })}
                placeholder="repo-name"
              />
            </Field>
          </div>
          <span className="field__hint">Used to auto-generate live stat badges (stars, issues, last commit).</span>
        </Section>

        <Section number="04b" title="Repo Analysis" defaultOpen={false}>
          <button
            type="button"
            className="analyze-btn"
            onClick={runAnalysis}
            disabled={analyzing}
          >
            {analyzing ? 'Analyzing…' : 'Analyze Repository'}
          </button>

          {analyzeError && (
            <p className="field__hint" style={{ color: 'crimson' }}>
              {analyzeError}
            </p>
          )}

          {analysis && (
            <div style={{ marginTop: '0.75rem' }}>
              <p>
                <strong>Type:</strong> {analysis.projectType}
              </p>
              <p>
                <strong>Files analyzed:</strong> {analysis.fileCount}
              </p>
              <p>
                <strong>Graph nodes:</strong> {analysis.graph?.length ?? 0}
              </p>

              {codeScore && (
                <div style={{ marginTop: '0.75rem' }}>
                  <p>
                    <strong>Code Quality Score:</strong> {codeScore.overall}/100
                  </p>
                  <ul style={{ fontSize: '0.85rem', paddingLeft: '1rem' }}>
                    <li>Complexity: {codeScore.breakdown.complexity}/100</li>
                    <li>Dead code: {codeScore.breakdown.deadCode}/100</li>
                    <li>Duplicates: {codeScore.breakdown.duplicates}/100</li>
                    <li>Large files: {codeScore.breakdown.largeFiles}/100</li>
                  </ul>
                </div>
              )}

              <details>
                <summary>Raw graph JSON</summary>
                <pre style={{ maxHeight: 200, overflow: 'auto', fontSize: '0.75rem' }}>
                  {JSON.stringify(analysis.graph, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </Section>

        <Section number="05" title="Tech Stack Badges" defaultOpen={false}>
          {BADGE_CATEGORIES.map((cat) => (
            <div key={cat.label} className="badge-group">
              <span className="badge-group__label">{cat.label}</span>
              <div className="badge-grid">
                {cat.items.map((b) => {
                  const active = state.badges.some((x) => x.id === b.id);
                  return (
                    <button
                      key={b.id}
                      type="button"
                      className={`chip ${active ? 'chip--active' : ''}`}
                      onClick={() => toggleBadge(b)}
                    >
                      {b.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </Section>

        <Section number="06" title="Features">
          <Field label="One feature per line">
            <textarea
              rows={4}
              value={state.features}
              onChange={(e) => update({ features: e.target.value })}
              placeholder={'Fast and lightweight\nWorks offline'}
            />
          </Field>
        </Section>

        <Section number="07" title="Installation">
          <Field label="Shell commands" hint="One command per line">
            <textarea
              rows={4}
              className="mono"
              value={state.installSteps}
              onChange={(e) => update({ installSteps: e.target.value })}
              placeholder={'git clone ...\ncd project\nnpm install'}
            />
          </Field>
        </Section>

        <Section number="08" title="Usage">
          <div className="field-row field-row--tight">
            <Field label="Language">
              <select value={state.usageLang} onChange={(e) => update({ usageLang: e.target.value })}>
                {['bash', 'javascript', 'python', 'json', 'jsx', 'typescript'].map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Example code">
            <textarea
              rows={4}
              className="mono"
              value={state.usageCode}
              onChange={(e) => update({ usageCode: e.target.value })}
              placeholder="npm run dev"
            />
          </Field>
        </Section>

        <Section number="09" title="Folder Structure" defaultOpen={false}>
          <Field label="Folder tree" hint="Auto-filled by GitHub/zip import, or write your own">
            <textarea
              rows={5}
              className="mono"
              value={state.folderTree}
              onChange={(e) => update({ folderTree: e.target.value })}
              placeholder={'src/\n  components/\n  pages/\n  hooks/'}
            />
          </Field>
        </Section>

        <Section number="10" title="Architecture Diagram" defaultOpen={false}>
          <span className="field__hint">Rendered as a Mermaid flowchart GitHub displays natively.</span>
          <div className="field-row">
            <Field label="Frontend">
              <input
                value={state.architecture.frontend}
                onChange={(e) => updateArch({ frontend: e.target.value })}
                placeholder="React"
              />
            </Field>
            <Field label="Backend">
              <input
                value={state.architecture.backend}
                onChange={(e) => updateArch({ backend: e.target.value })}
                placeholder="Node.js API"
              />
            </Field>
          </div>
          <Field label="Database">
            <input
              value={state.architecture.database}
              onChange={(e) => updateArch({ database: e.target.value })}
              placeholder="PostgreSQL"
            />
          </Field>
        </Section>

        <Section number="11" title="Roadmap" defaultOpen={false}>
          <Field label="One item per line" hint="Rendered as checkboxes">
            <textarea
              rows={3}
              value={state.roadmap}
              onChange={(e) => update({ roadmap: e.target.value })}
              placeholder={'Add dark mode\nMobile app'}
            />
          </Field>
        </Section>

        <Section number="12" title="Screenshots" defaultOpen={false}>
          <Field label="Image URLs" hint="One URL per line">
            <textarea
              rows={3}
              value={state.screenshots}
              onChange={(e) => update({ screenshots: e.target.value })}
              placeholder="https://.../screenshot.png"
            />
          </Field>
        </Section>

        <Section number="13" title="Contributing" defaultOpen={false}>
          <Field label="Contribution guidelines">
            <textarea
              rows={3}
              value={state.contributing}
              onChange={(e) => update({ contributing: e.target.value })}
            />
          </Field>
        </Section>

        <Section number="14" title="License & Author">
          <Field label="License">
            <select value={state.licenseId} onChange={(e) => update({ licenseId: e.target.value })}>
              {LICENSES.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Author name">
            <input value={state.authorName} onChange={(e) => update({ authorName: e.target.value })} />
          </Field>
          <Field label="Links" hint="One per line, markdown links work">
            <textarea
              rows={2}
              value={state.authorLinks}
              onChange={(e) => update({ authorLinks: e.target.value })}
            />
          </Field>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={state.includeToc}
              onChange={(e) => update({ includeToc: e.target.checked })}
            />
            Include table of contents
          </label>
        </Section>

        <Section number="15" title="Quality Score">
          <QualityScore state={state} />
        </Section>
      </div>
    </aside>
  );
}