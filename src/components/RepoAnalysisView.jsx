import { useState } from 'react';
import MermaidBlock from './MermaidBlock';
import Modal from './Modal';
import { scoreCodeQuality } from '../lib/codeQualityScore';
import { getFolderStats } from '../lib/folderScope';

export default function RepoAnalysisView({ state, update, analysis, analyzing, analyzeError, onAnalyze }) {
  const [diagramModalOpen, setDiagramModalOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const codeScore = analysis ? scoreCodeQuality(analysis) : null;
  const folderStats = selectedFolder && analysis ? getFolderStats(analysis, selectedFolder) : null;

  return (
    <main className="analysis-view">
      <div className="analysis-view__intro">
        <h2>Repo Analysis</h2>
        <p className="field__hint">
          Analyze a GitHub repository for architecture, code quality, API endpoints, database schema, and security findings.
        </p>
      </div>
      <div className="analysis-view__input-row">
        <input
          value={state.githubUser}
          onChange={(e) => update({ githubUser: e.target.value })}
          placeholder="GitHub username"
        />
        <input
          value={state.repoName}
          onChange={(e) => update({ repoName: e.target.value })}
          placeholder="Repo name"
        />
        <button type="button" className="analyze-btn" onClick={onAnalyze} disabled={analyzing}>
          {analyzing ? 'Analyzing…' : 'Analyze Repository'}
        </button>
      </div>
      {analyzeError && (
        <p className="field__hint" style={{ color: 'crimson' }}>
          {analyzeError}
        </p>
      )}
      {analysis && (
        <div className="analysis-view__results">
          <div className="analysis-summary-row">
            <div className="analysis-summary-card">
              <span className="analysis-summary-card__label">Type</span>
              <span className="analysis-summary-card__value">{analysis.projectType}</span>
            </div>
            <div className="analysis-summary-card">
              <span className="analysis-summary-card__label">Files analyzed</span>
              <span className="analysis-summary-card__value">{analysis.fileCount}</span>
            </div>
            <div className="analysis-summary-card">
              <span className="analysis-summary-card__label">Graph nodes</span>
              <span className="analysis-summary-card__value">{analysis.graph?.length ?? 0}</span>
            </div>
          </div>

          {codeScore && (
            <section className="analysis-section">
              <h3>Code Quality Score: {codeScore.overall}/100</h3>
              <ul className="analysis-breakdown-list">
                <li>Complexity: {codeScore.breakdown.complexity}/100</li>
                <li>Dead code: {codeScore.breakdown.deadCode}/100</li>
                <li>Duplicates: {codeScore.breakdown.duplicates}/100</li>
                <li>Large files: {codeScore.breakdown.largeFiles}/100</li>
              </ul>
            </section>
          )}

          {analysis.secretFindings && analysis.secretFindings.length > 0 && (
            <section className="analysis-section">
              <h3>Security Findings ({analysis.secretFindings.length})</h3>
              <div className="endpoint-list">
                {analysis.secretFindings.map((f, i) => (
                  <div key={i} className="secret-finding-row">
                    <span className="secret-finding-type">{f.type}</span>
                    <span className="secret-finding-file">{f.file}:{f.line}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {analysis.dependencyAudit && analysis.dependencyAudit.scanned && analysis.dependencyAudit.vulnerabilities.length > 0 && (
            <section className="analysis-section">
              <h3>Dependency Vulnerabilities ({analysis.dependencyAudit.vulnerabilities.length})</h3>
              <div className="endpoint-list">
                {analysis.dependencyAudit.vulnerabilities.map((v, i) => (
                  <div key={i} className="vuln-row">
                    <div className="vuln-row__header">
                      <span className={`vuln-severity vuln-severity--${v.severity}`}>{v.severity}</span>
                      <span className="vuln-name">{v.name}</span>
                      {v.fixAvailable && <span className="vuln-fix-available">fix available</span>}
                    </div>
                    {v.via.length > 0 && (
                      <ul className="vuln-via-list">
                        {v.via.slice(0, 2).map((desc, j) => (
                          <li key={j}>{desc}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {analysis.apiEndpoints && analysis.apiEndpoints.length > 0 && (
            <section className="analysis-section">
              <h3>API Endpoints ({analysis.apiEndpoints.length} routes found)</h3>
              <div className="endpoint-list">
                {analysis.apiEndpoints.map((ep, i) => (
                  <div key={i} className="endpoint-row">
                    <span className={`endpoint-method endpoint-method--${ep.method.toLowerCase()}`}>
                      {ep.method}
                    </span>
                    <span className="endpoint-path">{ep.path}</span>
                    <span className="endpoint-handler">{ep.handler}()</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {analysis.architecture && (
            <section className="analysis-section">
              <h3>
                Architecture Diagram
                {analysis.architecture.truncated && (
                  <span className="field__hint" style={{ marginLeft: '0.5rem', fontWeight: 400 }}>
                    (showing {analysis.architecture.renderedCount} of {analysis.architecture.totalCount} files)
                  </span>
                )}
              </h3>
              <MermaidBlock code={analysis.architecture.diagram} />
              {analysis.architecture.truncated && (
                <button
                  type="button"
                  className="btn btn--ghost"
                  style={{ marginTop: '0.5rem' }}
                  onClick={() => setDiagramModalOpen(true)}
                >
                  View Full Diagram
                </button>
              )}
            </section>
          )}

          <Modal
            open={diagramModalOpen}
            onClose={() => {
              setDiagramModalOpen(false);
              setSelectedFolder(null);
            }}
            title={`Folder-Level Architecture (${analysis?.architectureFull?.folderCount ?? 0} folders)`}
          >
            {analysis?.architectureFull && (
              <MermaidBlock
                code={analysis.architectureFull.diagram}
                onNodeClick={(folder) => setSelectedFolder(folder)}
              />
            )}
            {folderStats && (
              <div className="folder-stats">
                <p className="folder-stats__title">{folderStats.folderName}/</p>
                <ul>
                  <li>Files: {folderStats.fileCount}</li>
                  <li>Dead code candidates: {folderStats.deadCodeCount}</li>
                  <li>Large files: {folderStats.largeFileCount}</li>
                  <li>Duplicate function groups: {folderStats.duplicateCount}</li>
                  <li>Avg. complexity: {folderStats.avgComplexity}</li>
                </ul>
              </div>
            )}
          </Modal>

          {analysis.schema && analysis.schema.entityCount > 0 && (
            <section className="analysis-section">
              <h3>Database Schema ({analysis.schema.entityCount} entities)</h3>
              <MermaidBlock code={analysis.schema.diagram} />
            </section>
          )}

          <details className="analysis-section">
            <summary>Raw graph JSON</summary>
            <pre style={{ maxHeight: 240, overflow: 'auto', fontSize: '0.75rem' }}>
              {JSON.stringify(analysis.graph, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </main>
  );
}