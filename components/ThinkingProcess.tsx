import React, { useState, useEffect, useRef } from 'react';
import { Loader2, CheckCircle2, ChevronDown, Search, BookOpen, BrainCircuit, Terminal, Code } from 'lucide-react';
import { ThinkingStep } from '../types';

interface ThinkingProcessProps {
  steps: ThinkingStep[];
  isComplete: boolean;
}

export const ThinkingProcess: React.FC<ThinkingProcessProps> = ({ steps, isComplete }) => {
  const [isOpen, setIsOpen] = useState(!isComplete);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-collapse when complete, auto-open when starting
  useEffect(() => {
    if (isComplete) {
      const timer = setTimeout(() => setIsOpen(false), 1500);
      return () => clearTimeout(timer);
    } else {
      setIsOpen(true);
    }
  }, [isComplete]);

  // Auto-scroll logs
  useEffect(() => {
    if (isOpen && logsEndRef.current) {
        logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [steps, isOpen]);

  const activeStep = steps.find(s => s.status === 'active') || steps[steps.length - 1];
  
  // Get all logs from all steps to display in the terminal
  const allLogs = steps.flatMap(s => s.logs || []);

  // Determine icon based on text
  const getIcon = (text: string) => {
    const t = text.toLowerCase();
    if (t.includes("search")) return Search;
    if (t.includes("read") || t.includes("anal")) return BookOpen;
    if (t.includes("deconstruct") || t.includes("plan")) return Code;
    return BrainCircuit;
  };

  if (steps.length === 0) return null;

  return (
    <div className="mb-6 border border-zinc-800/60 bg-zinc-900/30 rounded-lg overflow-hidden animate-in fade-in slide-in-from-left-2">
      {/* Header / Summary Line */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors w-full px-4 py-3 bg-zinc-900/50"
      >
        <div className="flex items-center gap-2 flex-1">
          {isComplete ? (
             <div className="flex items-center gap-2 text-zinc-500">
                <Terminal size={14} />
                <span>Process Log</span>
                <span className="text-xs bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-500">{steps.length} steps</span>
             </div>
          ) : (
             <div className="flex items-center gap-3">
                <Loader2 size={16} className="animate-spin text-cyan-400" />
                <span className="text-cyan-400 font-mono text-xs tracking-wide animate-pulse">
                    {activeStep?.text || "INITIALIZING_AGENT..."}
                </span>
             </div>
          )}
        </div>
        <div className="flex items-center gap-2">
            {isComplete && <span className="text-xs text-green-500 font-mono">COMPLETED</span>}
            <ChevronDown 
            size={14} 
            className={`text-zinc-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
            />
        </div>
      </button>

      {/* Accordion Content */}
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        
        {/* Terminal View */}
        <div className="bg-black/80 p-3 font-mono text-[10px] md:text-[11px] leading-relaxed text-zinc-400 border-t border-zinc-800/50 overflow-y-auto max-h-[200px] custom-scrollbar shadow-inner">
            {allLogs.length === 0 && <div className="text-zinc-600 italic">Waiting for process logs...</div>}
            {allLogs.map((log, idx) => (
                <div key={idx} className="flex gap-2 break-all hover:bg-white/5 px-1 rounded">
                    <span className="text-zinc-600 select-none">
                        {new Date().toLocaleTimeString([], {hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                    </span>
                    <span className={log.includes("ERROR") ? "text-red-400" : log.includes("GET") || log.includes("POST") ? "text-yellow-500" : log.includes("Found") ? "text-green-400" : "text-zinc-300"}>
                        <span className="mr-2 opacity-50">{">"}</span>
                        {log}
                    </span>
                </div>
            ))}
            {/* Blinking Cursor */}
            {!isComplete && (
                <div className="mt-1 animate-pulse text-cyan-500 font-bold">_</div>
            )}
            <div ref={logsEndRef} />
        </div>

        {/* Visual Steps List */}
        <div className="p-3 space-y-2 bg-zinc-900/20 border-t border-zinc-800/30">
          {steps.map((step) => {
            const StepIcon = getIcon(step.text);
            return (
              <div key={step.id} className="flex items-center gap-3 text-xs">
                <div className={`
                  w-5 h-5 rounded-md flex items-center justify-center border transition-colors duration-300
                  ${step.status === 'completed' ? 'bg-zinc-800/50 border-zinc-700 text-green-500' : 
                    step.status === 'active' ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.1)]' : 
                    'bg-transparent border-zinc-800 text-zinc-700'}
                `}>
                  {step.status === 'completed' ? (
                    <CheckCircle2 size={12} />
                  ) : step.status === 'active' ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                  )}
                </div>
                <span className={`
                  font-medium transition-colors duration-300
                  ${step.status === 'completed' ? 'text-zinc-500 line-through decoration-zinc-700' : 
                    step.status === 'active' ? 'text-cyan-100' : 
                    'text-zinc-600'}
                `}>
                  {step.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};