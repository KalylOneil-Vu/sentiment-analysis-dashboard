import { useState, useEffect, useRef } from 'react';
import { useWebSocket } from './hooks/useWebSocket';
import { VLMProvider } from './context/VLMContext';
import Dashboard from './components/Dashboard';
import VideoCapture from './components/VideoCapture';
import AudioCapture from './components/AudioCapture';
import { FastVLMAnalyzer } from './components/FastVLMAnalyzer';
import { KeywordTags } from './components/KeywordTags';

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
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">Meeting Engagement Monitor</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
            {!isAnalyzing ? (
              <button
                onClick={startAnalysis}
                disabled={!hasPermissions}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Start Analysis
              </button>
            ) : (
              <button
                onClick={stopAnalysis}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
              >
                Stop Analysis
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {!hasPermissions ? (
          <div className="bg-slate-800 rounded-lg p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">Permissions Required</h2>
            <p className="text-slate-400 mb-4">
              This application requires access to your camera and microphone to analyze engagement.
            </p>
            <p className="text-slate-400">
              Please allow permissions when prompted by your browser.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Video Feed & FastVLM */}
            <div className="lg:col-span-1 space-y-6">
              {/* FastVLM Analyzer */}
              <div className="bg-slate-800 rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-4">FastVLM Analysis</h2>
                <FastVLMAnalyzer
                  onAnalysisUpdate={handleFastVLMUpdate}
                  onFrameCapture={handleFrameCapture}
                  analysisInterval={5000}
                  isActive={isAnalyzing}
                />
              </div>

              {/* Keywords Display */}
              <div className="bg-slate-800 rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-4">Detected Keywords</h2>
                <KeywordTags keywords={currentKeywords} />
              </div>


              {/* Audio Capture */}
              <div className="bg-slate-800 rounded-lg p-4">
                <AudioCapture
                  isActive={isAnalyzing}
                  onAudioData={sendAudio}
                />
              </div>
            </div>

            {/* Right Column - Dashboard */}
            <div className="lg:col-span-2">
              <Dashboard engagement={latestEngagement} fastvlmText={fastvlmText} />
            </div>
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
