import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'motion/react';

interface MarkdownContentProps {
  content: string;
  /** Use 'light' for user bubbles on colored bg, 'auto' for theme-aware */
  variant?: 'light' | 'auto';
  className?: string;
  /** Animate content on mount */
  animate?: boolean;
}

export function MarkdownContent({
  content,
  variant = 'auto',
  className = '',
  animate = false,
}: MarkdownContentProps) {
  const proseClass = variant === 'light' ? 'prose-invert' : 'dark:prose-invert';
  const Wrapper = animate ? motion.div : 'div';
  const wrapperProps = animate
    ? { initial: { opacity: 0, y: 4 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.25, ease: 'easeOut' } }
    : {};

  return (
    <Wrapper className={`prose-sm max-w-none ${proseClass} ${className}`} {...(wrapperProps as any)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          em: ({ children }) => <em>{children}</em>,
          del: ({ children }) => <del className="opacity-60">{children}</del>,
          code: ({ children, className: cn }) => {
            const isBlock = cn?.includes('language-');
            return isBlock ? (
              <code
                className={`block bg-black/10 dark:bg-white/10 rounded-lg p-3 my-2 text-[13px] overflow-x-auto whitespace-pre ${cn || ''}`}
              >
                {children}
              </code>
            ) : (
              <code className="bg-black/10 dark:bg-white/10 rounded px-1.5 py-0.5 text-[13px]">
                {children}
              </code>
            );
          },
          pre: ({ children }) => <pre className="my-1">{children}</pre>,
          ul: ({ children }) => <ul className="list-disc pl-4 mb-1 space-y-0.5">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-4 mb-1 space-y-0.5">{children}</ol>,
          li: ({ children }) => <li>{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-current/30 pl-3 my-1 opacity-80">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:opacity-80"
            >
              {children}
            </a>
          ),
          h1: ({ children }) => <p className="font-semibold text-base mb-1">{children}</p>,
          h2: ({ children }) => <p className="font-semibold mb-1">{children}</p>,
          h3: ({ children }) => <p className="font-semibold mb-0.5">{children}</p>,
          table: ({ children }) => (
            <div className="my-2 overflow-x-auto rounded-lg border border-[#e1dfdd] dark:border-[#3d3d3d]">
              <table className="w-full border-collapse text-[13px]">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-[#f5f5f5] dark:bg-[#2a2a2a]">{children}</thead>
          ),
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => (
            <tr className="border-b border-[#e1dfdd] dark:border-[#3d3d3d] last:border-b-0">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-3 py-1.5 text-left font-semibold text-[12px] text-[#424242] dark:text-[#ccc] uppercase tracking-wider border-r border-[#e1dfdd] dark:border-[#3d3d3d] last:border-r-0">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-1.5 text-[#242424] dark:text-[#e0e0e0] border-r border-[#e1dfdd] dark:border-[#3d3d3d] last:border-r-0">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </Wrapper>
  );
}
