import React, { useState } from 'react';
import { Clipboard, Check } from 'lucide-react';

interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ children, className }) => {
  const [hasCopied, setHasCopied] = useState(false);

  const handleCopy = () => {
    const code = String(children).replace(/\n$/, '');
    navigator.clipboard.writeText(code).then(() => {
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    });
  };

  const language = className?.replace(/language-/, '') || 'text';

  return (
    <div className="relative group my-4">
      <div className="absolute top-2 right-2">
        <button
          onClick={handleCopy}
          className="p-2 bg-zinc-800 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all opacity-0 group-hover:opacity-100"
          aria-label="Copy code to clipboard"
        >
          {hasCopied ? <Check size={16} /> : <Clipboard size={16} />}
        </button>
      </div>
      <pre className="bg-zinc-900/70 p-4 rounded-md overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
        <code className={className}>{children}</code>
      </pre>
      <span className="absolute bottom-2 right-2 text-xs text-zinc-500 font-sans">{language}</span>
    </div>
  );
};
