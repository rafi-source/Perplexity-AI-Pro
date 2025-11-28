import React, { useState, useRef, useEffect } from 'react';
import { FocusMode } from '../types';
import { FOCUS_MODES } from '../constants';
import { ChevronDown, Globe, GraduationCap, PenTool, Youtube, MessageCircle } from 'lucide-react';

interface FocusSelectorProps {
  currentMode: FocusMode;
  onSelect: (mode: FocusMode) => void;
  isProMode: boolean;
  proModel: string;
  onProModelChange: (model: string) => void;
}

export const FocusSelector: React.FC<FocusSelectorProps> = ({ currentMode, onSelect, isProMode, proModel, onProModelChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Icon mapping
  const getIcon = (iconName: string, className?: string) => {
    switch (iconName) {
      case 'Globe': return <Globe size={16} className={className} />;
      case 'GraduationCap': return <GraduationCap size={16} className={className} />;
      case 'PenTool': return <PenTool size={16} className={className} />;
      case 'Youtube': return <Youtube size={16} className={className} />;
      case 'MessageCircle': return <MessageCircle size={16} className={className} />;
      default: return <Globe size={16} className={className} />;
    }
  };

  const activeConfig = FOCUS_MODES.find(m => m.id === currentMode) || FOCUS_MODES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 rounded-md transition-colors"
      >
        <span className="flex items-center gap-2">
           {getIcon(activeConfig.icon, "text-cyan-400")}
           <span>{activeConfig.label}</span>
        </span>
        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-64 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2">
          <div className="p-1">
            <div className="px-3 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Focus Mode
            </div>
            {FOCUS_MODES.map((mode) => (
              <button
                key={mode.id}
                onClick={() => {
                  onSelect(mode.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-start gap-3 px-3 py-2.5 text-left rounded-md transition-colors ${
                  currentMode === mode.id ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                }`}
              >
                <div className="mt-0.5">
                    {getIcon(mode.icon, currentMode === mode.id ? "text-cyan-400" : "text-zinc-500")}
                </div>
                <div>
                  <div className="text-sm font-medium">{mode.label}</div>
                  <div className="text-xs text-zinc-500 mt-0.5 leading-tight">
                    {mode.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
          {isProMode && (
            <div className="p-1 border-t border-zinc-800">
                <div className="px-3 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Pro Model
                </div>
                <div className="space-y-1">
                    {['gemini-3-pro-preview', 'gemini-2.5-pro-preview', 'gemini-2.0-pro'].map(model => (
                        <button
                            key={model}
                            onClick={() => {
                                onProModelChange(model);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-sm rounded-md ${proModel === model ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800/50'}`}
                        >
                            {model.replace('-preview', '')}
                        </button>
                    ))}
                </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};