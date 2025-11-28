export interface Source {
  title: string;
  url: string;
}

export interface ThinkingStep {
  id: string;
  text: string;
  status: 'pending' | 'active' | 'completed';
  logs?: string[]; // Detailed technical logs (e.g., "Parsing JSON...", "GET request...")
}

export interface Attachment {
  id: string;
  type: 'image' | 'text';
  name: string;
  data: string; // Base64 string
  mimeType: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  attachments?: Attachment[]; // Images or files sent by user
  isThinking?: boolean;
  thinkingSteps?: ThinkingStep[];
  timestamp: number;
  isProMode?: boolean; // Visual indicator for Pro answers
  feedback?: 'like' | 'dislike' | null;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

export enum FocusMode {
  WEB = 'webSearch',
  ACADEMIC = 'academicSearch',
  WRITING = 'writing',
  YOUTUBE = 'youtubeSearch',
  REDDIT = 'redditSearch'
}

export interface FocusModeConfig {
  id: FocusMode;
  label: string;
  description: string;
  icon: string;
}