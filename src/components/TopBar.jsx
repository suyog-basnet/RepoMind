import { useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function TopBar({ markdown, projectName, onAction, savedPulse, onStartOver }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    onAction();
    setTimeout(() => setCopied(false), 1600);
  };

  const downloadBlob = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    onAction();
  };

  const handleDownloadMd = () => downloadBlob(markdown, 'README.md', 'text/markdown');

  const handleDownloadHtml = () => {
    const bodyHtml = renderToStaticMarkup(
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
    );
    const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>${projectName || 'README'}</title>
<style>
body{max-width:860px;margin:40px auto;font-family:-apple-system,BlinkMacSystemFont,sans-serif;padding:0 20px;line-height:1.6;color:#1f2328;}
pre{background:#f6f8fa;padding:14px;border-radius:6px;overflow-x:auto}
code{background:#f6f8fa;padding:2px 6px;border-radius:4px;font-family:ui-monospace,monospace}
pre code{background:none;padding:0}
img{max-width:100%;border-radius:6px}
h1,h2{border-bottom:1px solid #d0d7de;padding-bottom:8px}
table{border-collapse:collapse;width:100%}
th,td{border:1px solid #d0d7de;padding:6px 13px}
blockquote{border-left:3px solid #d0d7de;margin:0;padding:0 16px;color:#57606a}
a{color:#0969da}
</style></head>
<body>${bodyHtml}</body>
</html>`;
    downloadBlob(html, 'README.html', 'text/html');
  };

  return (
    <header className="topbar">
      <div className="topbar__left">
        <div className="traffic-lights" aria-hidden="true">
          <span className="dot dot--red" />
          <span className="dot dot--yellow" />
          <span className="dot dot--green" />
        </div>
        <div className="tab">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" className="tab__icon">
            <path d="M2 2.5A1.5 1.5 0 0 1 3.5 1h5.086a1.5 1.5 0 0 1 1.06.44l2.914 2.914A1.5 1.5 0 0 1 13 5.414V13.5A1.5 1.5 0 0 1 11.5 15h-8A1.5 1.5 0 0 1 2 13.5v-11Z" />
          </svg>
          <span>README.md</span>
          <span className={`unsaved-dot ${savedPulse ? 'unsaved-dot--pulse' : ''}`} />
        </div>
      </div>
      <div className="topbar__right">
        <span className="topbar__label">{projectName || 'untitled-project'}</span>
        <button className="btn btn--ghost" onClick={onStartOver}>
          Start Over
        </button>
        <button className="btn btn--ghost" onClick={handleCopy}>
          {copied ? '✓ Copied' : 'Copy'}
        </button>
        <div className="export-group">
          <button className="btn btn--primary" onClick={handleDownloadMd}>
            Download .md
          </button>
          <button className="btn btn--primary-ghost" onClick={handleDownloadHtml} title="Export as standalone HTML">
            .html
          </button>
        </div>
      </div>
    </header>
  );
}
