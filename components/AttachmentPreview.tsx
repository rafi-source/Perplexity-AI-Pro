import React from 'react';
import { Attachment } from '../types';
import { X, Image as ImageIcon } from 'lucide-react';

interface AttachmentPreviewProps {
  attachments: Attachment[];
  onRemove: (id: string) => void;
}

export const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({ attachments, onRemove }) => {
  if (attachments.length === 0) return null;

  return (
    <div className="flex gap-3 overflow-x-auto py-2 px-1">
      {attachments.map((att) => (
        <div key={att.id} className="relative group flex-shrink-0">
          <div className="w-16 h-16 rounded-lg border border-zinc-700 overflow-hidden bg-zinc-900 flex items-center justify-center">
            {att.type === 'image' ? (
              <img 
                src={`data:${att.mimeType};base64,${att.data}`} 
                alt="preview" 
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
              />
            ) : (
              <ImageIcon size={20} className="text-zinc-500" />
            )}
          </div>
          <button
            onClick={() => onRemove(att.id)}
            className="absolute -top-1.5 -right-1.5 bg-zinc-800 text-zinc-400 hover:text-red-400 border border-zinc-700 rounded-full p-0.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  );
};