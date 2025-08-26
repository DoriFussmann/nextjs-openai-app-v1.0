"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Markdown({ children }: { children: string }) {
  return (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Tighten spacing a bit for chat
          p: ({node, ...props}) => <p className="my-2" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc ml-5 my-2" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal ml-5 my-2" {...props} />,
          code: ({className, children, ...props}: any) => {
            const isInline = !className?.includes('language-');
            return isInline ? (
              <code className="px-1 py-0.5 rounded bg-gray-100" {...props}>{children}</code>
            ) : (
              <pre className="bg-gray-900 text-gray-100 p-3 rounded-md overflow-x-auto">
                <code className={className} {...props}>{children}</code>
              </pre>
            );
          },
        }}
      >
        {children || ""}
      </ReactMarkdown>
    </div>
  );
}
