import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  setupStatus: () => ipcRenderer.invoke('setup:status'),
  setupDownload: () => ipcRenderer.invoke('setup:download'),
  onSetupProgress: (callback: (data: any) => void) => {
    ipcRenderer.on('setup:progress', (_event, data) => callback(data));
  },
  onSetupDone: (callback: () => void) => {
    ipcRenderer.on('setup:done', () => callback());
  },
  onSetupError: (callback: (error: string) => void) => {
    ipcRenderer.on('setup:error', (_event, error) => callback(error));
  },
  
  getChats: () => ipcRenderer.invoke('db:getChats'),
  createChat: (title: string, systemPrompt?: string) => ipcRenderer.invoke('db:createChat', title, systemPrompt),
  deleteChat: (id: string) => ipcRenderer.invoke('db:deleteChat', id),
  updateChatTitle: (id: string, title: string) => ipcRenderer.invoke('db:updateChatTitle', id, title),
  getMessages: (id: string) => ipcRenderer.invoke('db:getMessages', id),
  
  chatCompletion: (messages: any[], chatId: string | null) => ipcRenderer.invoke('chat:completion', messages, chatId),
  onChatStream: (callback: (chunk: string) => void) => {
    // Remove previous listeners to avoid duplicates
    ipcRenderer.removeAllListeners('chat:stream');
    ipcRenderer.on('chat:stream', (_event, chunk) => callback(chunk));
  },
  onChatDone: (callback: () => void) => {
    ipcRenderer.removeAllListeners('chat:done');
    ipcRenderer.on('chat:done', () => callback());
  },
  
  selectFile: () => ipcRenderer.invoke('file:select'),
  parseFile: (path: string) => ipcRenderer.invoke('file:parse', path)
});
