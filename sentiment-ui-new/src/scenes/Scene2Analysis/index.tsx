import { useState, useEffect } from 'react'
import { useSharedVision } from '../../hooks/useSharedVision'
import { useEmotionSimulation } from '../../hooks/useEmotionSimulation'
import { useBackendAnalysis } from '../../hooks/useBackendAnalysis'
import { useFastVLM } from '../../hooks/useFastVLM'
import { useSceneStore } from '../../stores/sceneStore'
import { LandmarkVisibility } from '../../types/emotion'
import { CameraPanel } from './components/CameraPanel'
import { AnalysisPanel } from './components/AnalysisPanel'
import { LightSignalNodes } from '../Scene1Welcome/components/LightSignalNodes'
import { AmbientGradient } from '../../components/AmbientGradient'
import { LiveCaption } from '../../components/LiveCaption'
import { KeywordsDisplay } from '../../components/KeywordsDisplay'
import { mapBackendEmotion } from '../../types/backend'

interface Scene2AnalysisProps {
  onContinue: () => void
}

export function Scene2Analysis({ onContinue }: Scene2AnalysisProps) {
  const setBackendEngagement = useSceneStore(state => state.setBackendEngagement)

  // Use shared vision detection from provider
  const {
    videoRef,
    isStreaming,
    data,
  } = useSharedVision({ preset: 'analysis' })

  const faceLandmarks = data.faceLandmarks

  // FastVLM analysis - runs real-time inference on video frames
  const {
    currentAnalysis: fastvlmAnalysis,
    streamingText,
    isLoading: vlmLoading,
    isRunning: vlmRunning,
    progress: vlmProgress,
  } = useFastVLM({
    videoRef,
    enabled: isStreaming,
  })

  // Backend analysis - captures frames and sends to backend with FastVLM data
  const { engagement } = useBackendAnalysis({
    videoRef,
    enabled: isStreaming,
    captureInterval: 5000,
    fastvlmAnalysis,
  })

  // Sync backend engagement to store when it updates
  useEffect(() => {
    if (engagement) {
      const emotion = engagement.persons?.[0]?.details?.dominant_emotion
        ? mapBackendEmotion(engagement.persons[0].details.dominant_emotion)
        : null
      setBackendEngagement(engagement, emotion)
    }
  }, [engagement, setBackendEngagement])

  const faceDetected = faceLandmarks !== null && faceLandmarks.length > 0
  const { currentEmotion, focusScore } = useEmotionSimulation({ faceDetected })

  const [landmarkVisibility, setLandmarkVisibility] = useState<LandmarkVisibility>({
    eyes: true,
    nose: true,
    mouth: true,
    ears: false,
  })

  const handleLandmarkToggle = (key: keyof LandmarkVisibility) => {
    setLandmarkVisibility(prev => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  return (
    <div
      className="relative w-full h-full flex items-center justify-center p-6 md:p-12 transition-colors duration-300 gradient-shift"
      style={{
        background: `linear-gradient(to bottom, var(--bg-from), var(--bg-to))`,
      }}
    >
      {/* Video is managed by VisionDetectionProvider */}

      {/* Floating signal nodes - light theme */}
      <LightSignalNodes />

      {/* Ambient gradient based on emotion */}
      <AmbientGradient emotion={currentEmotion.type} />

      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(var(--grid-line) 1px, transparent 1px),
            linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Main three-panel layout - constrained height */}
      <div
        className="relative flex flex-col md:flex-row items-stretch gap-4 max-w-6xl w-full z-10"
        style={{ maxHeight: '85vh' }}
      >
        {/* Left panel - Camera feed */}
        <div className="w-full md:w-[35%]">
          <div
            className="h-full p-4 rounded-2xl flex flex-col"
            style={{
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(12px)',
              border: '1px solid var(--glass-border)',
            }}
          >
            <CameraPanel
              videoRef={videoRef}
              landmarks={faceLandmarks}
              landmarkVisibility={landmarkVisibility}
            />
          </div>
        </div>

        {/* Center panel - FastVLM Real-time Analysis */}
        <div className="w-full md:w-[35%]">
          <div
            className="h-full p-4 rounded-2xl flex flex-col gap-3"
            style={{
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(12px)',
              border: '1px solid var(--glass-border)',
            }}
          >
            <h2
              className="text-lg font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              Real-time Vision Analysis
            </h2>

            {/* Live Caption - streaming text */}
            <LiveCaption
              text={streamingText}
              isRunning={vlmRunning}
              isLoading={vlmLoading}
              loadingProgress={vlmProgress}
            />

            {/* Keywords Display */}
            <KeywordsDisplay
              keywords={fastvlmAnalysis?.keywords ?? null}
              score={fastvlmAnalysis?.clientScore ?? null}
            />

            {/* VLM Status info */}
            <div
              className="mt-auto pt-3 text-center"
              style={{ borderTop: '1px solid var(--glass-border)' }}
            >
              <p
                className="text-[10px] leading-relaxed"
                style={{ color: 'var(--text-muted)' }}
              >
                FastVLM analyzes your expressions in real-time, extracting emotional cues and body language indicators.
              </p>
            </div>
          </div>
        </div>

        {/* Right panel - Emotion Analysis */}
        <div className="w-full md:w-[30%]">
          <div
            className="h-full p-4 rounded-2xl flex flex-col"
            style={{
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(12px)',
              border: '1px solid var(--glass-border)',
            }}
          >
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: 'var(--text-primary)' }}
            >
              Emotion Analysis
            </h2>
            <AnalysisPanel
              emotion={currentEmotion}
              focusScore={focusScore}
              landmarkVisibility={landmarkVisibility}
              onLandmarkToggle={handleLandmarkToggle}
              onContinue={onContinue}
            />
          </div>
        </div>
      </div>

      {/* Scene indicator */}
      <div className="absolute top-6 right-6 flex flex-col items-end gap-0.5 entrance-animate entrance-delay-6">
        <span
          className="text-[10px] tracking-[0.2em] uppercase"
          style={{ color: 'var(--text-faint)' }}
        >
          Scene 02
        </span>
        <span
          className="text-[10px] tracking-[0.15em] uppercase"
          style={{ color: 'var(--accent-muted)' }}
        >
          Analysis
        </span>
      </div>
    </div>
  )
}
