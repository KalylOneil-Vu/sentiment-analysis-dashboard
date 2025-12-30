import { useState, useEffect } from 'react'
import { useIsPortrait } from '../../hooks/useIsPortrait'
import { useSharedVision } from '../../hooks/useSharedVision'
import { useUnifiedEmotion } from '../../hooks/useUnifiedEmotion'
import { useBackendAnalysis } from '../../hooks/useBackendAnalysis'
import { useFastVLM } from '../../hooks/useFastVLM'
import { useSceneStore } from '../../stores/sceneStore'
import { LandmarkVisibility } from '../../types/emotion'
import { CameraPanel } from './components/CameraPanel'
import { AnalysisPanel } from './components/AnalysisPanel'
import { BottomInfo } from './components/BottomInfo'
import { LightSignalNodes } from '../Scene1Welcome/components/LightSignalNodes'
import { AmbientGradient } from '../../components/AmbientGradient'
import { LiveCaption } from '../../components/LiveCaption'
import { KeywordsDisplay } from '../../components/KeywordsDisplay'
import { mapBackendEmotion } from '../../types/backend'

interface Scene2AnalysisProps {
  onContinue: () => void
}

export function Scene2Analysis({ onContinue }: Scene2AnalysisProps) {
  const isPortrait = useIsPortrait()
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

  // Use unified emotion (prioritizes face-api, then backend, then simulated)
  const { emotion: currentEmotion, focusScore } = useUnifiedEmotion()

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
      className="scene-container scene-scrollable relative w-full h-full flex items-center justify-center p-3 md:p-6 lg:p-12 transition-colors duration-300 gradient-shift overflow-y-auto"
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

      {/* Main layout - Portrait: 2-column (camera left, stacked right), Landscape: 3-column */}
      {isPortrait ? (
        /* Portrait: Centered container with title above panels */
        <div className="relative flex flex-col items-center justify-center w-full h-full z-10 px-3">
          {/* Title section */}
          <div className="text-center mb-4">
            <h1
              className="text-lg tracking-[0.3em] uppercase font-light"
              style={{ color: 'var(--text-primary)' }}
            >
              — The Face of Our Emotions —
            </h1>
            <p
              className="text-xs tracking-[0.15em] uppercase mt-2"
              style={{ color: 'var(--accent-muted)' }}
            >
              Real-time Emotion Detection
            </p>
          </div>

          {/* Panels container - wide with minimal margins */}
          <div className="flex flex-row items-stretch gap-3 w-full" style={{ height: '70vh' }}>
            {/* Left column - Camera feed (50%) */}
            <div className="w-1/2 flex-shrink-0">
              <div
                className="h-full p-3 rounded-2xl flex flex-col"
                style={{
                  background: 'var(--glass-bg)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(20, 184, 166, 0.4)',
                  boxShadow: '0 0 20px rgba(20, 184, 166, 0.15), inset 0 0 20px rgba(20, 184, 166, 0.05)',
                }}
              >
                <CameraPanel
                  videoRef={videoRef}
                  landmarks={faceLandmarks}
                  landmarkVisibility={landmarkVisibility}
                />
              </div>
            </div>

            {/* Right column - Stacked panels (50%) */}
            <div className="w-1/2 flex flex-col gap-3">
              {/* Top panel - FastVLM Real-time Analysis */}
              <div
                className="flex-1 min-h-0 p-4 rounded-2xl flex flex-col overflow-hidden"
                style={{
                  background: 'var(--glass-bg)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(20, 184, 166, 0.4)',
                  boxShadow: '0 0 20px rgba(20, 184, 166, 0.15), inset 0 0 20px rgba(20, 184, 166, 0.05)',
                }}
              >
                <h2
                  className="text-lg font-semibold mb-3"
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
                  className="flex-1"
                />

                {/* Keywords Display */}
                <div className="mt-3">
                  <KeywordsDisplay
                    keywords={fastvlmAnalysis?.keywords ?? null}
                    score={fastvlmAnalysis?.clientScore ?? null}
                  />
                </div>
              </div>

              {/* Bottom panel - Emotion Analysis */}
              <div
                className="flex-1 min-h-0 p-4 rounded-2xl flex flex-col overflow-hidden"
                style={{
                  background: 'var(--glass-bg)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(20, 184, 166, 0.4)',
                  boxShadow: '0 0 20px rgba(20, 184, 166, 0.15), inset 0 0 20px rgba(20, 184, 166, 0.05)',
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
                  hideContinueButton={true}
                  hideBottomInfo={true}
                />
              </div>

              {/* Continue button - below Emotion Analysis panel */}
              <button
                onClick={onContinue}
                className="w-full py-3 rounded-full text-sm font-medium tracking-[0.15em] uppercase transition-all duration-300 hover:scale-[1.01]"
                style={{
                  background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.8), rgba(20, 184, 166, 0.6))',
                  border: '1px solid rgba(20, 184, 166, 0.6)',
                  color: '#ffffff',
                  boxShadow: '0 0 20px rgba(20, 184, 166, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
                }}
              >
                Continue
              </button>

              {/* Bottom info - below Continue button */}
              <div className="text-center mt-2">
                <BottomInfo />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Landscape: Original 3-column layout */
        <div className="panel-layout aspect-flex relative flex flex-col md:flex-row items-stretch gap-3 md:gap-4 max-w-5xl w-full z-10">
          {/* Left panel - Camera feed */}
          <div className="w-full md:w-[35%] flex-shrink-0">
            <div
              className="h-full p-3 md:p-4 rounded-2xl flex flex-col"
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
          <div className="w-full md:w-[35%] flex-shrink-0">
            <div
              className="h-full p-3 md:p-4 rounded-2xl flex flex-col gap-2 md:gap-3"
              style={{
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(12px)',
                border: '1px solid var(--glass-border)',
              }}
            >
              <h2
                className="text-base md:text-lg font-semibold"
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
                className="mt-auto pt-2 md:pt-3 text-center"
                style={{ borderTop: '1px solid var(--glass-border)' }}
              >
                <p
                  className="text-[9px] md:text-[10px] leading-relaxed"
                  style={{ color: 'var(--text-muted)' }}
                >
                  FastVLM analyzes expressions in real-time.
                </p>
              </div>
            </div>
          </div>

          {/* Right panel - Emotion Analysis */}
          <div className="w-full md:w-[30%] flex-shrink-0">
            <div
              className="h-full p-3 md:p-4 rounded-2xl flex flex-col"
              style={{
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(12px)',
                border: '1px solid var(--glass-border)',
              }}
            >
              <h2
                className="text-base md:text-lg font-semibold mb-2 md:mb-3"
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
      )}

      {/* Scene indicator */}
      <div className="scene-indicator absolute top-6 right-6 flex flex-col items-end gap-0.5 entrance-animate entrance-delay-6">
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
