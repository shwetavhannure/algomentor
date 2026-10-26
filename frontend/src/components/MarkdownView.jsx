import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '../context/ThemeContext';

export default function MarkdownView({ content, className = '' }) {
  const { theme } = useTheme();

  return (
    <div className={`prose prose-sm max-w-none break-words dark:prose-invert prose-pre:p-0 prose-pre:bg-transparent prose-code:before:content-none prose-code:after:content-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className: codeClass, children, ...props }) {
            const match = /language-(\w+)/.exec(codeClass || '');
            const text = String(children);
            // fenced blocks have a language class or contain a new line
            if (match || text.includes('\n')) {
              return (
                <SyntaxHighlighter
                  style={theme === 'dark' ? oneDark : oneLight}
                  language={match ? match[1] : 'text'}
                  PreTag="div"
                  customStyle={{ margin: 0, borderRadius: '0.75rem', fontSize: '0.8rem' }}
                >
                  {text.replace(/\n$/, '')}
                </SyntaxHighlighter>
              );
            }
            return (
              <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-sm dark:bg-slate-800" {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}