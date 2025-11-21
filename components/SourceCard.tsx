import React from 'react';
import { Source } from '../types';
import { Globe } from 'lucide-react';

interface SourceCardProps {
  source: Source;
  index: number;
}

export const SourceCard: React.FC<SourceCardProps> = ({ source, index }) => {
  // Extract domain for cleaner display
  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  return (
    <a 
      href={source.url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="flex flex-col p-3 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-zinc-600 rounded-lg transition-all duration-200 group min-w-[160px] max-w-[200px] h-full"
    >
      <div className="flex items-center gap-2 mb-2 text-zinc-400 group-hover:text-zinc-300">
        <Globe size={12} />
        <span className="text-xs truncate font-medium">{getDomain(source.url)}</span>
      </div>
      <div className="text-sm text-zinc-200 font-medium line-clamp-2 leading-snug group-hover:text-cyan-300 transition-colors">
        {source.title}
      </div>
      <div className="mt-auto pt-2 flex items-center gap-1">
        <div className="text-[10px] text-zinc-500 bg-zinc-900/50 px-1.5 py-0.5 rounded-full">
            {index + 1}
        </div>
      </div>
    </a>
  );
};