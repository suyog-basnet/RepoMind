import { useEffect, useRef, useState } from 'react';

let initialized = false;

export default function MermaidBlock({ code }) {
  const containerRef = useRef(null);
  const [error, setError] = useState('');
  const idRef = useRef(`mermaid-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    let cancelled = false;
    import('mermaid').then(({ default: mermaid }) => {
      if (!initialized) {
        mermaid.initialize({ startOnLoad: false, theme: 'dark' });
        initialized = true;
      }
      return mermaid.render(idRef.current, code);
    })
      .then(({ svg }) => {
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
          setError('');
        }
      })
      .catch(() => {
        if (!cancelled) setError('Could not render diagram preview.');
      });
    return () => {
      cancelled = true;
    };
  }, [code]);

  if (error) {
    return <pre className="mermaid-error">{code}</pre>;
  }
  return <div className="mermaid-container" ref={containerRef} />;
}
