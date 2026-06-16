import { useState, useEffect } from 'react';
import { Download, Check, HardDrive, Cpu, AlertCircle } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const AVAILABLE_MODELS = [
  {
    id: 'llama3',
    name: 'Llama 3 (8B)',
    description: 'Fast, capable open-source model perfect for general tutoring.',
    size: '4.7 GB',
    ram: '8 GB RAM',
    provider: 'Ollama'
  },
  {
    id: 'qwen2.5-coder',
    name: 'Qwen 2.5 Coder',
    description: 'Specialized model for programming and development tasks.',
    size: '4.5 GB',
    ram: '8 GB RAM',
    provider: 'Ollama'
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1 Distill',
    description: 'Exceptional reasoning and mathematics capability.',
    size: '8.0 GB',
    ram: '16 GB RAM',
    provider: 'Ollama'
  }
];

export default function ModelStore() {
  const [installedModels, setInstalledModels] = useState<any[]>([]);
  const [downloading, setDownloading] = useState<string | null>(null);
  const { setActiveModel, activeModel } = useStore();

  useEffect(() => {
    fetchInstalled();
  }, []);

  const fetchInstalled = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/models');
      const data = await res.json();
      if (data.models) {
        setInstalledModels(data.models);
      }
    } catch (e) {
      console.error('Failed to fetch installed models', e);
    }
  };

  const handleDownload = async (modelId: string) => {
    setDownloading(modelId);
    try {
      // Simulate download sequence or proxy to Ollama
      await fetch('http://localhost:11434/api/pull', {
        method: 'POST',
        body: JSON.stringify({ name: modelId })
      });
      await fetchInstalled();
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(null);
    }
  };

  const isInstalled = (id: string) => {
    return installedModels.some(m => m.name.includes(id));
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-background">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Model Download Center</h1>
        <p className="text-muted-foreground mb-8">
          Download AI models to run entirely on your local machine. No internet connection required after download.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {AVAILABLE_MODELS.map((model) => {
            const installed = isInstalled(model.id);
            const isDownloading = downloading === model.id;
            const isActive = activeModel === model.id;

            return (
              <Card key={model.id} className={isActive ? 'border-primary shadow-md' : ''}>
                <CardHeader>
                  <CardTitle>{model.name}</CardTitle>
                  <CardDescription>{model.provider}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4 h-10">{model.description}</p>
                  <div className="flex flex-col space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center">
                      <HardDrive size={14} className="mr-2" />
                      Storage required: {model.size}
                    </div>
                    <div className="flex items-center">
                      <Cpu size={14} className="mr-2" />
                      Recommended: {model.ram}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  {!installed ? (
                    <Button 
                      className="w-full" 
                      onClick={() => handleDownload(model.id)}
                      disabled={isDownloading || downloading !== null}
                    >
                      {isDownloading ? (
                        <span className="animate-pulse">Downloading...</span>
                      ) : (
                        <><Download size={16} className="mr-2" /> Download</>
                      )}
                    </Button>
                  ) : (
                    <div className="flex w-full gap-2">
                      <Button variant="outline" className="w-full pointer-events-none text-green-500 border-green-500">
                        <Check size={16} className="mr-2" /> Installed
                      </Button>
                      <Button 
                        variant={isActive ? 'default' : 'secondary'}
                        onClick={() => setActiveModel(model.id)}
                        className="w-full"
                      >
                        {isActive ? 'Active' : 'Use Model'}
                      </Button>
                    </div>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
