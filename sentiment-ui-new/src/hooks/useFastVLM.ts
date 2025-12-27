/**
 * FastVLM Hook
 *
 * Runs FastVLM inference on video frames in a continuous loop,
 * extracts keywords, and provides real-time analysis data.
 */
import { useEffect, useRef, useState, useCallback, RefObject } from 'react';
import { useVLMContext } from './useVLMContext';
import {
  ENGAGEMENT_PROMPTS,
  extractKeywords,
  calculateEngagementFromKeywords,
  type ExtractedKeywords
} from '../constants/engagementPrompts';

// Timing constants for real-time analysis
const TIMING = {
  FRAME_CAPTURE_DELAY: 100, // ms between inference attempts (allows ~10 FPS when model is fast)
  VIDEO_READY_CHECK: 200,   // ms between video ready checks
};

export interface FastVLMAnalysis {
  text: string;
  keywords: ExtractedKeywords;
  clientScore: number;
  timestamp: number;
}

interface UseFastVLMOptions {
  videoRef: RefObject<HTMLVideoElement | null>;
  enabled?: boolean;
  autoLoad?: boolean; // Auto-load model when enabled (default true)
  prompt?: string; // Custom prompt (default uses ENGAGEMENT_PROMPTS.PRIMARY)
}

interface UseFastVLMReturn {
  isLoaded: boolean;
  isLoading: boolean;
  isRunning: boolean;
  error: string | null;
  progress: string | null;
  currentAnalysis: FastVLMAnalysis | null;
  streamingText: string; // Real-time streaming text as it's generated
  loadModel: () => Promise<void>;
  toggleLoop: () => void;
}

export function useFastVLM({
  videoRef,
  enabled = true,
  autoLoad = true,
  prompt = ENGAGEMENT_PROMPTS.PRIMARY,
}: UseFastVLMOptions): UseFastVLMReturn {
  const { isLoaded, isLoading, error, progress, loadModel, runInference } = useVLMContext();
  const [currentAnalysis, setCurrentAnalysis] = useState<FastVLMAnalysis | null>(null);
  const [streamingText, setStreamingText] = useState('');
  const [isRunning, setIsRunning] = useState(true);

  // Refs to avoid stale closures
  const promptRef = useRef(prompt);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isInferenceRunning = useRef(false);

  // Update prompt ref when it changes
  useEffect(() => {
    promptRef.current = prompt;
  }, [prompt]);

  // Auto-load model when enabled
  useEffect(() => {
    if (autoLoad && enabled && !isLoaded && !isLoading) {
      loadModel((msg) => console.log('FastVLM loading:', msg));
    }
  }, [autoLoad, enabled, isLoaded, isLoading, loadModel]);

  // Toggle the analysis loop
  const toggleLoop = useCallback(() => {
    setIsRunning(prev => !prev);
  }, []);

  // Main continuous analysis loop
  useEffect(() => {
    if (!isLoaded || !enabled || !isRunning) {
      return;
    }

    const video = videoRef.current;
    if (!video) {
      return;
    }

    // Create abort controller for cleanup
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const captureLoop = async () => {
      while (!signal.aborted) {
        // Check if video is ready and playing
        if (
          video &&
          video.readyState >= 2 && // HAVE_CURRENT_DATA or higher
          !video.paused &&
          video.videoWidth > 0 &&
          !isInferenceRunning.current
        ) {
          isInferenceRunning.current = true;

          try {
            // Run FastVLM inference with streaming callback
            const vlmText = await runInference(
              video,
              promptRef.current,
              (text) => setStreamingText(text) // Real-time streaming update
            );

            if (vlmText && !signal.aborted) {
              // Extract keywords from completed text
              const keywords = extractKeywords(vlmText);
              const clientScore = calculateEngagementFromKeywords(keywords);

              const analysis: FastVLMAnalysis = {
                text: vlmText,
                keywords,
                clientScore,
                timestamp: Date.now(),
              };

              setCurrentAnalysis(analysis);
            }
          } catch (err) {
            if (!signal.aborted) {
              console.error('FastVLM inference error:', err);
            }
          } finally {
            isInferenceRunning.current = false;
          }
        }

        // Wait before next frame capture attempt
        await new Promise(resolve => setTimeout(resolve, TIMING.FRAME_CAPTURE_DELAY));
      }
    };

    // Start the loop
    captureLoop();

    return () => {
      // Cleanup: abort the loop
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [isLoaded, enabled, isRunning, videoRef, runInference]);

  return {
    isLoaded,
    isLoading,
    isRunning,
    error,
    progress,
    currentAnalysis,
    streamingText,
    loadModel,
    toggleLoop,
  };
}
