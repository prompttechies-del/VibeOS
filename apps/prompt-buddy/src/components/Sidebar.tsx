import { useEffect, useState } from 'react';
import { Plus, MessageSquare, Trash2, Edit2, Search } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar() {
  const { chats, activeChatId, setChats, setActiveChatId, setMessages, addChat, removeChat, updateChatTitle } = useStore();
  const [search, setSearch] = useState('');

  const api = (window as any).electronAPI;

  // Load chats on mount
  useEffect(() => {
    if (api) {
      api.getChats()
        .then((data: any) => setChats(data))
        .catch(console.error);
    }
  }, []);

  const handleNewChat = () => {
    setActiveChatId(null);
    setMessages([]);
  };

  const handleSelectChat = async (id: string) => {
    setActiveChatId(id);
    if (api) {
      try {
        const data = await api.getMessages(id);
        setMessages(data);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleDeleteChat = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (api) {
      try {
        await api.deleteChat(id);
        removeChat(id);
        if (activeChatId === id) {
          setMessages([]);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleRenameChat = async (e: React.MouseEvent, id: string, oldTitle: string) => {
    e.stopPropagation();
    const newTitle = prompt('Enter new chat title:', oldTitle);
    if (newTitle && newTitle.trim() !== oldTitle && api) {
      try {
        await api.updateChatTitle(id, newTitle.trim());
        updateChatTitle(id, newTitle.trim());
      } catch (e) {
        console.error(e);
      }
    }
  };

  const filteredChats = chats.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="w-[280px] bg-[#111111] border-r border-white/5 flex flex-col h-screen p-3 z-20">
      <div className="p-2 mb-2">
        <Button 
          onClick={handleNewChat} 
          className="w-full justify-start h-10 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 border-none shadow-none font-medium" 
          variant="outline"
        >
          <Plus className="mr-2" size={18} />
          New Chat
        </Button>
      </div>

      <div className="px-2 mb-4 relative group">
        <Search className="absolute left-5 top-2.5 text-muted-foreground/50 group-focus-within:text-primary transition-colors" size={14} />
        <Input 
          placeholder="Search chats..." 
          className="pl-9 h-9 bg-white/5 border-none focus-visible:ring-1 focus-visible:ring-primary/50 rounded-lg text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-0.5 px-2">
        <AnimatePresence>
          {filteredChats.map((chat) => (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              key={chat.id}
              onClick={() => handleSelectChat(chat.id)}
              className={`group flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all ${
                activeChatId === chat.id 
                  ? 'bg-secondary text-secondary-foreground font-medium shadow-sm' 
                  : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
              }`}
            >
              <div className="flex items-center overflow-hidden">
                <MessageSquare size={14} className={`mr-2.5 shrink-0 ${activeChatId === chat.id ? 'text-primary' : 'text-muted-foreground/70'}`} />
                <span className="truncate text-sm leading-tight">{chat.title}</span>
              </div>
              
              <div className="hidden group-hover:flex items-center gap-1 bg-gradient-to-l from-[#111111] pl-2">
                <button onClick={(e) => handleRenameChat(e, chat.id, chat.title)} className="p-1 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-white/10">
                  <Edit2 size={12} />
                </button>
                <button onClick={(e) => handleDeleteChat(e, chat.id)} className="p-1 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10">
                  <Trash2 size={12} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {/* User profile footer area (optional for later) */}
      <div className="mt-auto p-2 border-t border-white/5">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors text-sm text-muted-foreground">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600" />
          <span className="font-medium text-foreground">Local User</span>
        </div>
      </div>
    </div>
  );
}
