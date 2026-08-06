import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import MermaidBlock from './MermaidBlock';

export default function PreviewPane({ markdown, githubUser, repoName }) {
  const url = `github.com/${githubUser || 'you'}/${repoName || 'repo'}`;

  return (
    <section className="preview-pane">
      <div className="browser-chrome">
        <div className="browser-chrome__dots" aria-hidden="true">
          <span className="dot dot--red" />
          <span className="dot dot--yellow" />
          <span className="dot dot--green" />
        </div>
        <div className="browser-chrome__url">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0a5 5 0 0 0-5 5v2H2a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-1V5a5 5 0 0 0-5-5Zm3 7V5a3 3 0 1 0-6 0v2h6Z" />
          </svg>
          {url}
        </div>
      </div>
      <div className="markdown-body">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            code({ className, children, ...props }) {
              const match = /language-mermaid/.test(className || '');
              if (match) {
                return <MermaidBlock code={String(children).trim()} />;
              }
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {markdown}
        </ReactMarkdown>
      </div>
    </section>
  );
}
