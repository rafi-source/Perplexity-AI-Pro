import React from 'react';
import { ChatSession } from '../types';
import { Plus, MessageSquare, Trash2, Menu, X } from 'lucide-react';

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  isOpen,
  toggleSidebar
}) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <div className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-zinc-950 border-r border-zinc-800 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex flex-col h-full p-4">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
                    <span className="text-white font-bold text-lg">P</span>
                </div>
                <span className="text-lg font-semibold text-zinc-100 tracking-tight">Perplexica</span>
            </div>
            <button onClick={toggleSidebar} className="md:hidden text-zinc-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          {/* New Chat Button */}
          <button
            onClick={() => {
                onNewChat();
                if (window.innerWidth < 768) toggleSidebar();
            }}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-white text-black hover:bg-zinc-200 rounded-full font-medium transition-all shadow-sm hover:shadow-md mb-6"
          >
            <Plus size={18} />
            <span>New Thread</span>
          </button>

          {/* Recent Label */}
          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 px-2">
            Library
          </div>

          {/* Session List */}
          <div className="flex-1 overflow-y-auto space-y-1 -mx-2 px-2 custom-scrollbar">
            {sessions.length === 0 ? (
                <div className="text-zinc-600 text-sm text-center py-8 italic">
                    No history yet.
                </div>
            ) : (
                sessions.slice().reverse().map((session) => (
                <div
                    key={session.id}
                    onClick={() => {
                        onSelectSession(session.id);
                        if (window.innerWidth < 768) toggleSidebar();
                    }}
                    className={`group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-sm ${
                    activeSessionId === session.id
                        ? 'bg-zinc-800/80 text-zinc-100'
                        : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                    }`}
                >
                    <div className="flex items-center gap-3 overflow-hidden">
                        <MessageSquare size={16} className={activeSessionId === session.id ? "text-cyan-400" : "text-zinc-600"} />
                        <span className="truncate">{session.title || 'Untitled Thread'}</span>
                    </div>
                    <button
                        onClick={(e) => onDeleteSession(session.id, e)}
                        className={`opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-700 rounded text-zinc-500 hover:text-red-400 transition-all ${activeSessionId === session.id ? 'opacity-100' : ''}`}
                        title="Delete thread"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
                ))
            )}
          </div>
          
          {/* Footer */}
          <div className="mt-auto pt-4 border-t border-zinc-800">
             <div className="flex items-center gap-2 text-xs text-zinc-500 px-2">
                <span>Powered by Gemini 3 Pro</span>
             </div>
          </div>
        </div>
      </div>
    </>
  );
};