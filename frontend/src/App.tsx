import { useState, useEffect } from 'react';
import { useWebSocket } from './hooks/useWebSocket';
import { VLMProvider } from './context/VLMContext';
import Dashboard from './components/Dashboard';
import AudioCapture from './components/AudioCapture';
import { FastVLMAnalyzer } from './components/FastVLMAnalyzer';
import { KeywordTags } from './components/KeywordTags';
import { Activity, Wifi, WifiOff, Play, Square } from 'lucide-react';
import { motion } from 'framer-motion';

function AppContent() {
  const [clientId] = useState(() => `client-${Date.now()}`);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasPermissions, setHasPermissions] = useState(false);
  const [currentKeywords, setCurrentKeywords] = useState<{
    positive: string[];
    negative: string[];
    bodyLanguage: string[];
    emotions: string[];
  }>({ positive: [], negative: [], bodyLanguage: [], emotions: [] });
  const [fastvlmText, setFastvlmText] = useState<string>('');

  const {
    isConnected,
    latestEngagement,
    sendFrame,
    sendAudio,
    connect,
    disconnect
  } = useWebSocket(clientId);

  // Log connection state changes
  useEffect(() => {
    console.log('🔌 WebSocket connection state changed:', isConnected);
  }, [isConnected]);

  // Auto-set permissions to true (FastVLMAnalyzer handles webcam access)
  useEffect(() => {
    setHasPermissions(true);
  }, []);

  const startAnalysis = () => {
    if (!hasPermissions) {
      alert('Please grant camera and microphone permissions first.');
      return;
    }

    connect();
    setIsAnalyzing(true);
  };

  const stopAnalysis = () => {
    setIsAnalyzing(false);
    disconnect();
  };

  // Handle FastVLM analysis updates
  const handleFastVLMUpdate = (data: {
    fastvlmText: string;
    keywords: {
      positive: string[];
      negative: string[];
      bodyLanguage: string[];
      emotions: string[];
    };
    clientScore: number;
  }) => {
    console.log('FastVLM analysis update:', data);
    setFastvlmText(data.fastvlmText);
    setCurrentKeywords(data.keywords);
  };

  // Handle frame capture from FastVLM analyzer
  const handleFrameCapture = (frameData: string) => {
    if (isConnected && isAnalyzing && fastvlmText) {
      console.log('Sending frame to backend with FastVLM data');
      sendFrame(frameData, fastvlmText, currentKeywords);
    } else {
      console.log('Skipping frame send - waiting for FastVLM analysis or connection', {
        isConnected,
        isAnalyzing,
        hasFastvlmText: !!fastvlmText
      });
    }
  };

  return (
    <div className="dashboard-container">
      {/* Modern Header */}
      <header className="glass px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Activity className="w-6 h-6 text-emerald-500" />
          <div>
            <h1 className="text-lg font-semibold">Engagement Analytics</h1>
            <p className="text-xs text-neutral-400">Real-time monitoring dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Connection Status */}
          <motion.div
            className="flex items-center gap-2 px-4 py-2 rounded-lg glass-light"
            animate={{ scale: isConnected ? 1 : 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {isConnected ? (
              <Wifi className="w-4 h-4 text-emerald-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
            <span className="text-sm font-medium">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </motion.div>

          {/* Control Button */}
          {!isAnalyzing ? (
            <button
              onClick={startAnalysis}
              disabled={!hasPermissions}
              className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-700 disabled:opacity-50 text-white rounded-lg transition-all font-medium text-sm"
            >
              <Play className="w-4 h-4" />
              Start Analysis
            </button>
          ) : (
            <button
              onClick={stopAnalysis}
              className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all font-medium text-sm"
            >
              <Square className="w-4 h-4" />
              Stop Analysis
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {!hasPermissions ? (
          <motion.div
            className="h-full flex items-center justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center max-w-md">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl glass flex items-center justify-center">
                <Activity className="w-10 h-10 text-neutral-600" />
              </div>
              <h2 className="text-xl font-semibold mb-3">Permissions Required</h2>
              <p className="text-neutral-400 text-sm">
                Please grant camera and microphone permissions to enable real-time engagement monitoring.
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="dashboard-grid">
            {/* Left Column - Video Feed & Audio */}
            <motion.div
              className="col-span-3 flex flex-col gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Video Feed Card */}
              <div className="card flex-1">
                <div className="card-header">
                  <h2 className="text-sm font-semibold">Live Video Feed</h2>
                </div>
                <div className="card-body">
                  <FastVLMAnalyzer
                    onAnalysisUpdate={handleFastVLMUpdate}
                    onFrameCapture={handleFrameCapture}
                    analysisInterval={5000}
                    isActive={isAnalyzing}
                  />
                </div>
              </div>

              {/* Audio Monitor Card */}
              <div className="card">
                <div className="card-header">
                  <h2 className="text-sm font-semibold">Audio Levels</h2>
                </div>
                <div className="card-body">
                  <AudioCapture
                    isActive={isAnalyzing}
                    onAudioData={sendAudio}
                  />
                </div>
              </div>
            </motion.div>

            {/* Center Column - Main Dashboard */}
            <motion.div
              className="col-span-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Dashboard engagement={latestEngagement} fastvlmText={fastvlmText} />
            </motion.div>

            {/* Right Column - Keywords & Insights */}
            <motion.div
              className="col-span-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="card h-full">
                <div className="card-header">
                  <h2 className="text-sm font-semibold">Detected Keywords</h2>
                </div>
                <div className="card-body overflow-y-auto scrollbar-hidden">
                  <KeywordTags keywords={currentKeywords} />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}

// Wrap App with VLMProvider
function App() {
  return (
    <VLMProvider>
      <AppContent />
    </VLMProvider>
  );
}

export default App;
