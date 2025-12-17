'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  proseSize?: 'sm' | 'base' | 'lg' | 'xl';
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = '',
  proseSize = 'sm',
}) => {
  // react-markdown is safe by default and escapes HTML
  // No need for additional sanitization
  
  const proseClass = `prose prose-${proseSize} max-w-none dark:prose-invert ${className}`;

  return (
    <div className={proseClass}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Customize heading styles
          h1: ({ ...props }) => (
            <h1 className="text-2xl font-bold mb-4 mt-6 first:mt-0" {...props} />
          ),
          h2: ({ ...props }) => (
            <h2 className="text-xl font-bold mb-3 mt-5" {...props} />
          ),
          h3: ({ ...props }) => (
            <h3 className="text-lg font-semibold mb-2 mt-4" {...props} />
          ),
          // Customize paragraph styles
          p: ({ ...props }) => (
            <p className="mb-4 last:mb-0" {...props} />
          ),
          // Customize list styles
          ul: ({ ...props }) => (
            <ul className="list-disc list-inside mb-4 space-y-1" {...props} />
          ),
          ol: ({ ...props }) => (
            <ol className="list-decimal list-inside mb-4 space-y-1" {...props} />
          ),
          li: ({ ...props }) => (
            <li className="ml-4" {...props} />
          ),
          // Customize code blocks
          // In react-markdown, inline code has no className, code blocks have className with language
          code: ({ className, children, ...props }: React.ComponentPropsWithoutRef<'code'> & { className?: string }) => {
            const isInline = !className || !className.startsWith('language-');
            return isInline ? (
              <code
                className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-900 rounded text-sm font-mono text-gray-800 dark:text-gray-100"
                {...props}
              >
                {children}
              </code>
            ) : (
              <code
                className={`${className || ''} block p-4 bg-gray-900 dark:bg-gray-950 rounded-lg overflow-x-auto text-sm font-mono mb-4 text-gray-100`}
                {...props}
              >
                {children}
              </code>
            );
          },
          pre: ({ ...props }: React.ComponentPropsWithoutRef<'pre'>) => (
            <pre className="mb-4 bg-gray-900 dark:bg-gray-950 rounded-lg p-4 overflow-x-auto text-gray-100" {...props} />
          ),
          // Customize blockquote
          blockquote: ({ ...props }) => (
            <blockquote
              className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-4 text-gray-700 dark:text-gray-300"
              {...props}
            />
          ),
          // Customize links
          a: ({ ...props }) => (
            <a
              className="text-blue-600 dark:text-blue-400 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          // Customize horizontal rule
          hr: ({ ...props }) => (
            <hr className="my-6 border-gray-300 dark:border-gray-700" {...props} />
          ),
          // Customize images
          img: ({ ...props }) => (
            <img
              className="max-w-full h-auto rounded-lg my-4"
              loading="lazy"
              {...props}
            />
          ),
          // Customize table
          table: ({ ...props }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-700" {...props} />
            </div>
          ),
          th: ({ ...props }) => (
            <th
              className="border border-gray-300 dark:border-gray-700 px-4 py-2 bg-gray-100 dark:bg-gray-800 font-semibold"
              {...props}
            />
          ),
          td: ({ ...props }) => (
            <td
              className="border border-gray-300 dark:border-gray-700 px-4 py-2"
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

