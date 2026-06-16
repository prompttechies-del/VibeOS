import { create } from 'zustand';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  displayContent?: string;
}

export interface Chat {
  id: string;
  title: string;
  updated_at: string;
}

interface AppState {
  // First-time setup state
  isSetupComplete: boolean | null;
  setSetupComplete: (complete: boolean) => void;
  
  // Chat History
  chats: Chat[];
  activeChatId: string | null;
  setChats: (chats: Chat[]) => void;
  setActiveChatId: (id: string | null) => void;
  addChat: (chat: Chat) => void;
  removeChat: (id: string) => void;
  updateChatTitle: (id: string, title: string) => void;

  // Messages
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
}

export const useStore = create<AppState>((set) => ({
  isSetupComplete: null,
  setSetupComplete: (complete) => set({ isSetupComplete: complete }),
  
  chats: [],
  activeChatId: null,
  setChats: (chats) => set({ chats }),
  setActiveChatId: (id) => set({ activeChatId: id }),
  addChat: (chat) => set((state) => ({ chats: [chat, ...state.chats], activeChatId: chat.id })),
  removeChat: (id) => set((state) => ({ 
    chats: state.chats.filter(c => c.id !== id),
    activeChatId: state.activeChatId === id ? null : state.activeChatId
  })),
  updateChatTitle: (id, title) => set((state) => ({
    chats: state.chats.map(c => c.id === id ? { ...c, title } : c)
  })),

  messages: [],
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
}));
