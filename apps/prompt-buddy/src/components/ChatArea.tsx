import { useState, useRef, useEffect } from 'react';
import { Send, Copy, Check, Sparkles, BrainCircuit, Paperclip, X, Code, Library, FileText, Calendar, GraduationCap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';

const ASSISTANT_TOOLS = [
  {
    title: 'Explain Code',
    icon: Code,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    prompt: 'Paste the code you want me to explain, or attach the file.',
    systemPrompt: "You are an expert Code Explainer. Your goal is to break down complex code blocks line by line in plain English. Teach the underlying concepts, point out potential bugs, and provide examples of how it could be improved."
  },
  {
    title: 'Generate Flashcards',
    icon: Library,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    prompt: 'Paste your notes or attach a PDF, and I will extract key terms and definitions into a study guide format.',
    systemPrompt: "You are an expert Flashcard Generator. The user will provide notes or a document. Extract the most important concepts and format them as clear, concise Question & Answer pairs suitable for Anki or Quizlet."
  },
  {
    title: 'Resume Assistant',
    icon: FileText,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    prompt: 'Paste your resume points, or attach your resume, and tell me the job you are applying for.',
    systemPrompt: "You are an expert Resume Assistant and Career Coach for students. Help the user optimize their resume for internships and entry-level jobs. Focus on action verbs, quantifiable achievements, and ATS optimization."
  },
  {
    title: 'Study Planner',
    icon: Calendar,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    prompt: 'Tell me your upcoming exams and current topics, and I will generate a study schedule.',
    systemPrompt: "You are a Study Planner. Create realistic, highly structured study schedules based on the user's exam dates and topics. Use techniques like Pomodoro, Active Recall, and Spaced Repetition in your advice."
  },
  {
    title: 'MCQ Generator',
    icon: GraduationCap,
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
    prompt: 'Tell me the topic or paste your notes, and I will generate a 5-question multiple choice quiz to test you.',
    systemPrompt: "You are a strict but helpful Professor. Your job is to test the user. Generate multiple choice questions one by one, wait for the user to answer, and then provide the correct answer and a detailed explanation before moving to the next question."
  }
];

export default function ChatArea() {
  const { messages, addMessage, activeChatId, setActiveChatId, addChat } = useStore();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{name: string, path: string} | null>(null);
  const [activeSystemPrompt, setActiveSystemPrompt] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(index);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAttachFile = async () => {
    const api = (window as any).electronAPI;
    if (!api) return;
    try {
      const file = await api.selectFile();
      if (file) {
        setAttachedFile({ name: file.name, path: file.path });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !attachedFile) return;

    const api = (window as any).electronAPI;
    if (!api) return;

    setIsLoading(true);
    let currentChatId = activeChatId;
    
    if (!currentChatId) {
      try {
        const titleText = attachedFile ? `Chat about ${attachedFile.name}` : input.slice(0, 30);
        const data = await api.createChat(titleText + (titleText.length > 30 ? '...' : ''), activeSystemPrompt || undefined);
        currentChatId = data.id;
        setActiveChatId(currentChatId);
        addChat({ id: data.id, title: data.title, updated_at: new Date().toISOString() });
      } catch (e) {
        console.error('Failed to create chat', e);
        setIsLoading(false);
        return;
      }
    }

    let finalMessageContent = input;
    const currentAttachedFile = attachedFile;
    setAttachedFile(null); // Clear early for UI
    setActiveSystemPrompt(null); // Clear the system prompt override so it only applies on chat creation

    if (currentAttachedFile) {
      try {
        const fileContent = await api.parseFile(currentAttachedFile.path);
        finalMessageContent = `[User attached file: ${currentAttachedFile.name}]\n\nFile Content:\n${fileContent}\n\n${input}`;
      } catch (e) {
        console.error('File parsing failed', e);
        addMessage({ role: 'system', content: `Failed to read file ${currentAttachedFile.name}.` });
        setIsLoading(false);
        return;
      }
    }

    // Only show user the text they typed, not the massive file content dump
    const displayMessage = input || `(Attached ${currentAttachedFile?.name})`;
    const userMessage = { role: 'user' as const, content: finalMessageContent, displayContent: displayMessage };
    
    // Add message but only display the concise version if we have displayContent
    addMessage({ role: 'user', content: displayMessage });
    setInput('');

    try {
      let assistantResponse = '';
      addMessage({ role: 'assistant', content: '' });

      api.onChatStream((chunk: string) => {
        assistantResponse += chunk;
        useStore.setState(state => {
          const newMessages = [...state.messages];
          newMessages[newMessages.length - 1] = { role: 'assistant', content: assistantResponse };
          return { messages: newMessages };
        });
      });

      api.onChatDone(() => {
        setIsLoading(false);
      });

      // Send actual full content to the LLM
      const messagesForLLM = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content
      }));
      
      await api.chatCompletion(messagesForLLM, currentChatId);
    } catch (e) {
      console.error(e);
      addMessage({ role: 'system', content: 'Failed to connect to local AI.' });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-background relative">
      {/* Header */}
      <div className="absolute top-0 w-full h-16 bg-background/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-center z-10">
        <h2 className="font-semibold text-sm flex items-center gap-2 text-muted-foreground">
          <Sparkles className="w-4 h-4 text-primary" />
          PromptBuddy
        </h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto pt-24 pb-48 px-4 lg:px-48 space-y-8">
        <AnimatePresence>
          {messages.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="h-full flex flex-col items-center justify-center text-muted-foreground max-w-2xl mx-auto mt-8"
            >
              <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-8 shadow-inner border border-white/5 mx-auto">
                <BrainCircuit className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-3xl font-bold mb-3 text-foreground tracking-tight text-center">How can I help you today?</h1>
              <p className="opacity-70 text-sm text-center mb-10">Your private, offline AI student assistant. Ask me anything about coding, algorithms, or your studies.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 w-full">
                {ASSISTANT_TOOLS.map((tool, i) => {
                  const Icon = tool.icon;
                  return (
                    <button 
                      key={i}
                      onClick={() => {
                        setInput(tool.prompt);
                        setActiveSystemPrompt(tool.systemPrompt);
                      }}
                      className="flex flex-col items-start p-4 bg-secondary/30 hover:bg-secondary/80 border border-white/5 hover:border-white/10 rounded-2xl transition-all text-left group"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${tool.bgColor}`}>
                        <Icon size={16} className={tool.color} />
                      </div>
                      <h3 className="font-semibold text-sm text-foreground mb-1 group-hover:text-primary transition-colors">{tool.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{tool.prompt}</p>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {messages.map((m, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={i} 
            className={`flex gap-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role !== 'user' && (
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-1">
                <BrainCircuit size={16} className="text-primary" />
              </div>
            )}
            
            <div className={`relative group max-w-[85%] ${m.role === 'user' ? 'bg-secondary text-secondary-foreground rounded-3xl rounded-tr-sm px-5 py-3' : 'bg-transparent py-1'}`}>
              <div className={`prose prose-sm dark:prose-invert max-w-none break-words ${m.role === 'user' ? 'prose-p:leading-relaxed' : 'prose-p:leading-loose'}`}>
                <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                  {(m.displayContent || m.content) || (isLoading && i === messages.length - 1 ? '...' : '')}
                </ReactMarkdown>
              </div>
              
              {m.role === 'assistant' && m.content && (
                <button 
                  onClick={() => handleCopy(m.content, i)}
                  className="absolute -left-12 top-2 p-2 rounded-md opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                  title="Copy message"
                >
                  {copiedId === i ? <Check size={14} className="text-primary" /> : <Copy size={14} />}
                </button>
              )}
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 w-full p-4 lg:px-48 bg-gradient-to-t from-background via-background to-transparent pb-8 pt-20">
        
        {attachedFile && (
          <div className="mb-2">
            <div className="inline-flex items-center gap-2 bg-secondary/80 backdrop-blur-md px-3 py-1.5 rounded-full text-xs text-foreground border border-white/10 shadow-sm">
              <Paperclip size={12} className="text-muted-foreground" />
              <span className="max-w-[200px] truncate">{attachedFile.name}</span>
              <button 
                onClick={() => setAttachedFile(null)}
                className="hover:bg-white/10 rounded-full p-0.5 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          </div>
        )}

        <div className="relative flex items-end gap-2 bg-secondary/80 backdrop-blur-md border border-white/10 rounded-3xl p-2 pl-2 shadow-2xl focus-within:ring-1 focus-within:ring-primary/50 transition-all">
          
          <Button 
            size="icon" 
            variant="ghost"
            className="shrink-0 rounded-full w-10 h-10 mb-1 hover:bg-white/5 text-muted-foreground"
            onClick={handleAttachFile}
            disabled={isLoading}
          >
            <Paperclip size={18} />
          </Button>

          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message PromptBuddy..."
            className="min-h-[44px] max-h-[200px] border-0 focus-visible:ring-0 resize-none shadow-none bg-transparent py-3 text-base pl-2"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          
          <Button 
            size="icon" 
            className={`shrink-0 rounded-full w-10 h-10 mb-1 mr-1 transition-all ${(input.trim() || attachedFile) ? 'bg-primary text-primary-foreground hover:scale-105' : 'bg-muted text-muted-foreground'}`}
            disabled={(!input.trim() && !attachedFile) || isLoading}
            onClick={handleSend}
          >
            <Send size={18} className={(input.trim() || attachedFile) ? 'ml-1' : ''} />
          </Button>
        </div>
        <div className="text-center mt-3 text-xs text-muted-foreground font-medium">
          PromptBuddy can make mistakes. Consider verifying important information.
        </div>
      </div>
    </div>
  );
}
