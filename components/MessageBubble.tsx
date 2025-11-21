import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types';
import { User, Sparkles, Layers, Zap } from 'lucide-react';
import { SourceCard } from './SourceCard';
import { ThinkingProcess } from './ThinkingProcess';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isPro = message.isProMode;

  return (
    <div className={`flex w-full gap-4 py-6 ${isUser ? '' : 'bg-transparent'}`}>
      <div className="flex-shrink-0 mt-1">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-zinc-700' : isPro ? 'bg-gradient-to-br from-cyan-500 to-blue-600' : 'bg-cyan-600/20'}`}>
          {isUser ? <User size={16} className="text-zinc-300" /> : <Sparkles size={16} className={isPro ? "text-white" : "text-cyan-400"} />}
        </div>
      </div>
      
      <div className="flex-grow min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <div className="font-medium text-zinc-300">
            {isUser ? 'You' : 'Perplexica'}
          </div>
          {!isUser && isPro && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-[10px] font-bold text-blue-400 uppercase tracking-wide">
              <Zap size={10} className="fill-current" />
              Pro
            </div>
          )}
        </div>

        {/* Attachments Display (Images sent by user) */}
        {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
                {message.attachments.map(att => (
                    <div key={att.id} className="relative rounded-lg overflow-hidden border border-zinc-700 max-w-[200px]">
                        <img 
                            src={`data:${att.mimeType};base64,${att.data}`} 
                            alt="User attachment" 
                            className="w-full h-auto block"
                        />
                    </div>
                ))}
            </div>
        )}

        {/* Thinking Process (Visible during generation OR if steps exist in history) */}
        {!isUser && message.thinkingSteps && message.thinkingSteps.length > 0 && (
          <ThinkingProcess 
            steps={message.thinkingSteps} 
            isComplete={!message.isThinking} 
          />
        )}

        {/* Sources Section (Only for Assistant) */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mb-4 mt-2 animate-fade-in">
            <div className="flex items-center gap-2 text-zinc-400 text-xs mb-2 uppercase tracking-wider font-bold">
              <Layers size={12} />
              Sources
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
              {message.sources.map((source, idx) => (
                <SourceCard key={idx} source={source} index={idx} />
              ))}
            </div>
          </div>
        )}

        {/* Text Content */}
        {(!message.isThinking || (message.content && message.content.length > 0)) && (
          <div className="prose prose-invert prose-zinc max-w-none prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline leading-relaxed text-zinc-300">
             <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};