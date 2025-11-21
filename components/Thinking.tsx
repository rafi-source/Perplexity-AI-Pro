import React from 'react';
import { Loader2, Search, BookOpen, BrainCircuit } from 'lucide-react';

interface ThinkingProps {
  text: string;
}

export const Thinking: React.FC<ThinkingProps> = ({ text }) => {
  // Determine icon based on text content to give visual feedback on the process
  let Icon = Loader2;
  if (text.toLowerCase().includes("searching") || text.toLowerCase().includes("finding")) Icon = Search;
  else if (text.toLowerCase().includes("reading") || text.toLowerCase().includes("analyzing") || text.toLowerCase().includes("browsing")) Icon = BookOpen;
  else if (text.toLowerCase().includes("synthesizing") || text.toLowerCase().includes("generating")) Icon = BrainCircuit;

  return (
    <div className="flex items-center gap-3 py-2 animate-in fade-in slide-in-from-left-2 duration-500">
      <div className="relative flex items-center justify-center w-6 h-6 bg-zinc-800/50 rounded-full border border-zinc-700/50">
        {Icon === Loader2 ? (
            <Loader2 size={14} className="animate-spin text-cyan-400" />
        ) : (
            <>
                <div className="absolute inset-0 bg-cyan-500/10 rounded-full animate-ping opacity-50"></div>
                <Icon size={14} className="relative text-cyan-400" />
            </>
        )}
      </div>
      <span className="text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r from-zinc-300 to-zinc-500 animate-pulse">
        {text}
      </span>
    </div>
  );
};