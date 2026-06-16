'use client';

import { useState } from 'react';
import { Download, BrainCircuit, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import { motion } from 'framer-motion';

export default function SetupScreen() {
  const { setSetupComplete } = useStore();
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const startDownload = async () => {
    setDownloading(true);
    setError(null);

    const api = (window as any).electronAPI;
    if (!api) {
      setError("Electron API not found. Please run within the Electron App.");
      setDownloading(false);
      return;
    }

    try {
      api.onSetupProgress((data: any) => {
        setProgress(parseFloat(data.progress));
      });

      api.onSetupDone(() => {
        setTimeout(() => setSetupComplete(true), 1000);
      });

      api.onSetupError((errMsg: string) => {
        setError(errMsg);
        setDownloading(false);
      });

      await api.setupDownload();
    } catch (e: any) {
      setError(e.message);
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full glass-panel p-8 rounded-3xl shadow-2xl relative z-10"
      >
        <motion.div 
          animate={downloading ? { scale: [1, 1.05, 1] } : {}}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-primary/30 shadow-[0_0_30px_rgba(var(--primary),0.2)]"
        >
          <BrainCircuit className="text-primary w-10 h-10" />
        </motion.div>
        
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl font-bold tracking-tight">PromptBuddy</h1>
          <p className="text-muted-foreground text-sm">
            To get started, we need to download the PromptBuddy AI model locally.
          </p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-sm mb-6">
            {error}
          </motion.div>
        )}

        <div className="pt-2">
          {!downloading ? (
            <Button 
              onClick={startDownload} 
              className="w-full text-md h-14 rounded-xl font-medium shadow-lg hover:shadow-primary/25 transition-all"
            >
              <Download className="mr-2 w-5 h-5" />
              Download PromptBuddy AI Model
            </Button>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-primary">Downloading Engine...</span>
                <span className="font-mono text-muted-foreground">{progress.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-3 overflow-hidden shadow-inner border border-white/5">
                <motion.div 
                  className="bg-primary h-full relative"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "linear" }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }} />
                </motion.div>
              </div>
              <div className="flex items-center justify-center text-xs text-muted-foreground pt-2">
                <Loader2 className="w-3 h-3 animate-spin mr-2" />
                Keep this window open
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
