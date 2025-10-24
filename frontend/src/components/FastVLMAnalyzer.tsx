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
            maxWidth: '640px',
            borderRadius: '8px',
            backgroundColor: '#000',
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
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              borderRadius: '8px',
            }}
          >
            <div className="spinner" style={{ marginBottom: '16px' }}>
              Loading FastVLM...
            </div>
            {progress && <div style={{ fontSize: '12px' }}>{progress}</div>}
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
              backgroundColor: 'rgba(255, 0, 0, 0.7)',
              color: 'white',
              borderRadius: '8px',
              padding: '16px',
              textAlign: 'center',
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
              backgroundColor: '#22c55e',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
          >
            ANALYZING
          </div>
        )}
        {isLoaded && isVideoReady && !isActive && (
          <div
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              backgroundColor: '#64748b',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
          >
            READY
          </div>
        )}
      </div>

      {/* Current analysis text */}
      {currentText && (
        <div
          style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: '#f3f4f6',
            borderRadius: '8px',
            fontSize: '14px',
            fontStyle: 'italic',
            color: '#374151',
          }}
        >
          <strong>FastVLM:</strong> {currentText}
        </div>
      )}
    </div>
  );
};

// Export captureFrame utility for external use
export { };
