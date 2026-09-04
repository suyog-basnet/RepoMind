import { useEffect, useRef, useState } from 'react';

let initialized = false;

export default function MermaidBlock({ code, onNodeClick }) {
  const containerRef = useRef(null);
  const [error, setError] = useState('');
  const idRef = useRef(`mermaid-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    let cancelled = false;

    if (onNodeClick) {
      window.repomindNodeClick = (name) => onNodeClick(name);
    }

    import('mermaid').then(({ default: mermaid }) => {
      if (!initialized) {
        mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'loose' });
        initialized = true;
      }
      return mermaid.render(idRef.current, code);
    })
      .then(({ svg, bindFunctions }) => {
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
          if (bindFunctions) bindFunctions(containerRef.current);
          setError('');
        }
      })
      .catch(() => {
        if (!cancelled) setError('Could not render diagram preview.');
      });

    return () => {
      cancelled = true;
      if (onNodeClick) delete window.repomindNodeClick;
    };
  }, [code, onNodeClick]);

  if (error) {
    return <pre className="mermaid-error">{code}</pre>;
  }
  return (
    <div
      className="mermaid-container"
      ref={containerRef}
      style={{ cursor: onNodeClick ? 'pointer' : 'default' }}
    />
  );
}