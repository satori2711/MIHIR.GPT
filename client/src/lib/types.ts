// Message types
export interface Message {
  id: number;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  personaId?: number;
  timestamp: Date;
}

// Persona types
export interface Persona {
  id: number;
  name: string;
  lifespan: string;
  category: string;
  description: string;
  imageUrl: string;
  context: string;
}

// Chat session types
export interface ChatSession {
  id: number;
  sessionId: string;
  currentPersonaId?: number;
  createdAt: Date;
}

// API response types
export interface MessageResponse {
  userMessage: Message;
  assistantMessage: Message;
}

// Category types
export type CategoryType = 'All' | 'Leaders' | 'Scientists' | 'Artists' | 'Philosophers';
