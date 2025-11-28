import React from 'react';
import { Attachment } from '../types';
import { X, Image as ImageIcon } from 'lucide-react';

interface AttachmentPreviewProps {
  attachments: Attachment[];
  onRemove: (id: string) => void;
}

export const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({ attachments, onRemove }) => {
  if (attachments.length === 0) return null;

  const formatFileSize = (base64: string) => {
    const bytes = (base64.length * 0.75); // Approximate size
    if (bytes < 1024) return `${Math.round(bytes)} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {attachments.map((att) => (
        <div key={att.id} className="relative group w-full rounded-lg border border-zinc-700 bg-zinc-800/50 overflow-hidden aspect-square">
          {att.type === 'image' && (
            <img
              src={`data:${att.mimeType};base64,${att.data}`}
              alt={att.name}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-white">
            <p className="text-xs font-medium truncate">{att.name}</p>
            <p className="text-[10px] text-zinc-400">{formatFileSize(att.data)}</p>
          </div>
          <button
            onClick={() => onRemove(att.id)}
            className="absolute top-1.5 right-1.5 bg-black/50 text-white/70 hover:text-white hover:bg-black/80 rounded-full p-1 transition-all"
            aria-label="Remove attachment"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};