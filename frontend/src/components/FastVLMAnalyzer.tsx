/**
 * FastVLM Analyzer Component
 *
 * Captures video frames, runs FastVLM inference, extracts keywords,
 * and sends data to backend via WebSocket.
 */
import React, { useEffect, useRef, useState } from 'react';
import { useVLMContext } from '../hooks/useVLMContext';
import { ENGAGEMENT_PROMPTS, extractKeywords, calculateEngagementFromKeywords } from '../constants/engagementPrompts';

interface FastVLMAnalyzerProps {
  onAnalysisUpdate?: (data: {
    fastvlmText: string;
    keywords: {
      positive: string[];
      negative: string[];
      bodyLanguage: string[];
      emotions: string[];
    };
    clientScore: number;
  }) => void;
  onFrameCapture?: (frameData: string) => void; // Callback to provide captured frame
  analysisInterval?: number; // milliseconds between analyses
  isActive?: boolean; // Control whether analysis is running
}

export const FastVLMAnalyzer: React.FC<FastVLMAnalyzerProps> = ({
  onAnalysisUpdate,
  onFrameCapture,
  analysisInterval = 5000, // 5 seconds default
  isActive = true, // Default to true for backward compatibility
}) => {
  const { isLoaded, isLoading, loadModel, runInference, progress } = useVLMContext();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize webcam
  useEffect(() => {
    const initWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setIsVideoReady(true);
          };
        }
      } catch (err) {
        console.error('Error accessing webcam:', err);
        setError('Failed to access webcam. Please grant camera permissions.');
      }
    };

    initWebcam();

    return () => {
      // Cleanup
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
      }
    };
  }, []);

  // Load FastVLM model
  useEffect(() => {
    if (!isLoaded && !isLoading) {
      loadModel((msg) => console.log('FastVLM loading:', msg));
    }
  }, [isLoaded, isLoading, loadModel]);

  // Start analysis loop when ready AND active
  useEffect(() => {
    if (!isLoaded || !isVideoReady || !videoRef.current || !isActive) {
      return;
    }

    const runAnalysis = async () => {
      if (!videoRef.current || !canvasRef.current) return;

      try {
        // Capture frame as base64 for backend
        const canvas = canvasRef.current;
        const video = videoRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const frameData = canvas.toDataURL('image/jpeg', 0.8);

          // Send frame to parent component
          if (onFrameCapture) {
            onFrameCapture(frameData);
          }
        }

        // Run FastVLM inference with engagement prompt
        const vlmText = await runInference(
          videoRef.current,
          ENGAGEMENT_PROMPTS.PRIMARY,
          (text) => setCurrentText(text)
        );

        // Extract keywords from VLM output
        const keywords = extractKeywords(vlmText);

        // Calculate client-side engagement score
        const clientScore = calculateEngagementFromKeywords(keywords);

        // Notify parent component
        if (onAnalysisUpdate) {
          onAnalysisUpdate({
            fastvlmText: vlmText,
            keywords,
            clientScore,
          });
        }

        console.log('FastVLM analysis complete:', {
          text: vlmText,
          keywords,
          score: clientScore,
        });
      } catch (err) {
        console.error('Error during FastVLM analysis:', err);
        setError('FastVLM analysis failed');
      }
    };

    // Run initial analysis
    runAnalysis();

    // Set up interval for continuous analysis
    analysisIntervalRef.current = setInterval(runAnalysis, analysisInterval);

    return () => {
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
      }
    };
  }, [isLoaded, isVideoReady, runInference, analysisInterval, onAnalysisUpdate, isActive, onFrameCapture]);

  // Capture frame as base64 for backend
  const captureFrame = (): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;

    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.8);
  };

  return (
    <div className="fastvlm-analyzer">
      <div className="video-container" style={{ position: 'relative' }}>
        <video
          ref={videoRef}
          style={{
            width: '100%',
            borderRadius: '4px',
            backgroundColor: '#000',
            border: '1px solid #27272a',
          }}
          playsInline
          muted
        />
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Loading overlay */}
        {isLoading && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              color: '#a1a1aa',
              borderRadius: '4px',
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 border-2 border-t-emerald-500 border-zinc-700 rounded-full animate-spin"></div>
              <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                INITIALIZING VISUAL SYSTEM
              </span>
            </div>
            {progress && (
              <div style={{
                fontSize: '10px',
                fontFamily: 'monospace',
                color: '#52525b',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                {progress}
              </div>
            )}
          </div>
        )}

        {/* Error overlay */}
        {error && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(127, 29, 29, 0.9)',
              color: '#fca5a5',
              borderRadius: '4px',
              padding: '16px',
              textAlign: 'center',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {error}
          </div>
        )}

        {/* Status indicator */}
        {isLoaded && isVideoReady && isActive && (
          <div
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              color: '#6ee7b7',
              padding: '4px 10px',
              borderRadius: '2px',
              fontSize: '10px',
              fontWeight: 'bold',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <div style={{ width: '6px', height: '6px', backgroundColor: '#10b981', borderRadius: '50%', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
            ANALYZING
          </div>
        )}
        {isLoaded && isVideoReady && !isActive && (
          <div
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              backgroundColor: 'rgba(63, 63, 70, 0.8)',
              color: '#a1a1aa',
              padding: '4px 10px',
              borderRadius: '2px',
              fontSize: '10px',
              fontWeight: 'bold',
              border: '1px solid rgba(82, 82, 91, 0.5)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            STANDBY
          </div>
        )}
      </div>
    </div>
  );
};

// Export captureFrame utility for external use
export { };
