import { useEffect } from 'react';
import { useStore } from './store/useStore';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import SetupScreen from './components/SetupScreen';

function App() {
  const { setupComplete, setSetupComplete } = useStore();

  useEffect(() => {
    // Check if the model is installed via IPC
    if ((window as any).electronAPI) {
      (window as any).electronAPI.setupStatus().then((installed: boolean) => {
        setSetupComplete(installed);
      });
    }
  }, []);

  if (!setupComplete) {
    return <SetupScreen />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <ChatArea />
    </div>
  );
}

export default App;
