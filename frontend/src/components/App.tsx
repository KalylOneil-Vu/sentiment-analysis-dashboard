import React, { useState, useEffect, useRef } from 'react';
import { VLMProvider } from '../context/VLMContext';
import { useVLMContext } from '../context/useVLMContext';
import { VideoCapture } from './VideoCapture';
import { KeywordTags } from './KeywordTags';
import EngagementScore from './EngagementScore';
import {
  ENGAGEMENT_ANALYSIS_PROMPT,
  extractKeywords,
  computeKeywordScore,
  categorizeEngagement,
  EngagementKeyword,
} from '../utils/engagementPrompts';

interface EngagementData {
  overall_score: number;
  group_analytics?: any;
  vlm_analysis?: any;
  persons: any[];
}

const SentimentApp: React.FC = () => {
  const vlmContext = useVLMContext();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);
  const [engagementData, setEngagementData] = useState<EngagementData | null>(null);
  const [vlmText, setVlmText] = useState('');
  const [keywords, setKeywords] = useState<EngagementKeyword[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-load VLM model on mount
  useEffect(() => {
    if (vlmContext && !vlmContext.isLoaded && !vlmContext.isLoading) {
      vlmContext.loadModel((msg) => console.log('VLM Loading:', msg));
    }
  }, [vlmContext]);

  useEffect(() => {
    // Initialize WebSocket connection with retry logic
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      try {
        ws = new WebSocket('ws://localhost:8000/ws/client-1');

        ws.onopen = () => {
          console.log('✅ WebSocket connected');
        };

        ws.onmessage = (event) => {
          const message = JSON.parse(event.data);
          if (message.type === 'engagement_update') {
            setEngagementData(message.data);
          }
        };

        ws.onerror = (error) => {
          console.warn('WebSocket error (this is normal if backend is still starting):', error);
        };

        ws.onclose = () => {
          console.log('WebSocket disconnected - will retry in 3 seconds...');
          // Retry connection after 3 seconds
          reconnectTimeout = setTimeout(() => {
            console.log('Attempting to reconnect...');
            connect();
          }, 3000);
        };

        setWebsocket(ws);
      } catch (error) {
        console.error('Failed to create WebSocket:', error);
        // Retry after 3 seconds
        reconnectTimeout = setTimeout(connect, 3000);
      }
    };

    connect();

    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const startAnalysis = async () => {
    if (!vlmContext?.isLoaded || !websocket || !videoRef.current) {
      console.error('VLM not loaded or WebSocket not connected');
      return;
    }

    setIsAnalyzing(true);

    // Run analysis every 10 seconds
    const interval = setInterval(async () => {
      await analyzeFrame();
    }, 10000);

    analysisIntervalRef.current = interval;

    // Run first analysis immediately
    await analyzeFrame();
  };

  const stopAnalysis = () => {
    setIsAnalyzing(false);
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }
  };

  const analyzeFrame = async () => {
    if (!vlmContext || !videoRef.current || !websocket || websocket.readyState !== WebSocket.OPEN) {
      return;
    }

    // Check if video is ready
    if (!videoRef.current.videoWidth || !videoRef.current.videoHeight) {
      console.log('Video not ready yet, skipping frame');
      return;
    }

    try {
      // Run VLM inference
      const text = await vlmContext.runInference(
        videoRef.current,
        ENGAGEMENT_ANALYSIS_PROMPT,
        (partialText) => {
          setVlmText(partialText);
        }
      );

      if (text) {
        setVlmText(text);

        // Extract keywords
        const extractedKeywords = extractKeywords(text);
        setKeywords(extractedKeywords);

        // Capture frame and send to backend
        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0);
          const frameData = canvas.toDataURL('image/jpeg', 0.8);

          // Send to backend
          websocket.send(JSON.stringify({
            type: 'video_frame',
            frame: frameData,
            vlm_text: text,
            vlm_keywords: extractedKeywords.map(k => k.keyword),
          }));
        }
      }
    } catch (error) {
      console.error('Error analyzing frame:', error);
    }
  };

  const handleVideoReady = (video: HTMLVideoElement) => {
    videoRef.current = video;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">
          Sentiment Analysis Dashboard
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Video Feed */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Live Video</h2>
            <VideoCapture onVideoReady={handleVideoReady} />
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            <div className="mt-4 flex gap-4">
              <button
                onClick={startAnalysis}
                disabled={!vlmContext?.isLoaded || isAnalyzing}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
              </button>

              <button
                onClick={stopAnalysis}
                disabled={!isAnalyzing}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Stop Analysis
              </button>
            </div>

            {!vlmContext?.isLoaded && (
              <div className="mt-4 text-yellow-600">
                Loading FastVLM model... This may take a minute.
              </div>
            )}
          </div>

          {/* Engagement Metrics */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Engagement Metrics</h2>

            {engagementData && (
              <div className="space-y-6">
                <EngagementScore
                  score={engagementData.overall_score}
                  label="Overall Engagement"
                />

                {engagementData.group_analytics && (
                  <div className="text-sm text-gray-600">
                    <p>Participants: {engagementData.group_analytics.participant_count}</p>
                    <p>High: {engagementData.group_analytics.engagement_percentages?.high}%</p>
                    <p>Medium: {engagementData.group_analytics.engagement_percentages?.medium}%</p>
                    <p>Low: {engagementData.group_analytics.engagement_percentages?.low}%</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* FastVLM Analysis */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">FastVLM Analysis</h2>

          {vlmText && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Description:</h3>
                <p className="text-gray-700">{vlmText}</p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Extracted Keywords:</h3>
                <KeywordTags keywords={keywords} />
              </div>
            </div>
          )}

          {!vlmText && isAnalyzing && (
            <p className="text-gray-500 italic">Running analysis...</p>
          )}

          {!vlmText && !isAnalyzing && (
            <p className="text-gray-500 italic">Start analysis to see results</p>
          )}
        </div>

        {/* Individual Participants */}
        {engagementData && engagementData.persons && engagementData.persons.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Individual Participants</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {engagementData.persons.map((person, index) => (
                <div key={person.person_id || index} className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Person {person.person_id}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Emotion: {person.dominant_emotion}
                  </p>
                  {person.engagement && (
                    <EngagementScore
                      score={person.engagement.overall_score}
                      label="Engagement"
                      size="small"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <VLMProvider>
      <SentimentApp />
    </VLMProvider>
  );
};
