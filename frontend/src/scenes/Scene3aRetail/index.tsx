import { useEffect } from 'react'
import { useIsPortrait } from '../../hooks/useIsPortrait'
import { useSharedVision } from '../../hooks/useSharedVision'
import { useUnifiedEmotion } from '../../hooks/useUnifiedEmotion'
import { useBackendAnalysis } from '../../hooks/useBackendAnalysis'
import { useFastVLM } from '../../hooks/useFastVLM'
import { useProductMatching } from '../../hooks/useProductMatching'
import { useSceneStore } from '../../stores/sceneStore'
import { mapBackendEmotion } from '../../types/backend'
import { LightSignalNodes } from '../Scene1Welcome/components/LightSignalNodes'
import { AmbientGradient } from '../../components/AmbientGradient'
import { CompactCamera } from './components/CompactCamera'
import { ProductShowcase } from './components/ProductShowcase'
import { ProductGrid } from './components/ProductGrid'

interface Scene3aRetailProps {
  onContinue: () => void
}

export function Scene3aRetail({ onContinue }: Scene3aRetailProps) {
  const isPortrait = useIsPortrait()
  const setBackendEngagement = useSceneStore(state => state.setBackendEngagement)

  // Use shared vision detection from provider
  const { videoRef, isStreaming, data } = useSharedVision({ preset: 'retail' })
  const faceLandmarks = data.faceLandmarks

  // FastVLM analysis - runs real-time inference on video frames
  const { currentAnalysis: fastvlmAnalysis } = useFastVLM({
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
  const { emotion: currentEmotion, faceDetected } = useUnifiedEmotion()

  const {
    products,
    selectedProduct,
    selectedIndex,
    matchResult,
    selectProduct,
    isAutoAdvancing,
  } = useProductMatching({
    currentEmotion: currentEmotion.type,
    faceDetected,
  })

  return (
    <div
      className="scene-container scene-scrollable relative w-full h-full flex items-center justify-center p-3 md:p-6 lg:p-10 transition-colors duration-300 overflow-y-auto"
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

      {/* Main layout - Portrait: Top-down vertical centered, Landscape: 2-column */}
      {isPortrait ? (
        /* Portrait: Top-down vertical layout, centered with space top/bottom */
        <div className="relative flex flex-col items-center justify-center w-full h-full z-10 px-4">
          {/* Title section */}
          <div className="text-center mb-4">
            <h1
              className="text-lg tracking-[0.3em] uppercase font-light"
              style={{ color: 'var(--text-primary)' }}
            >
              — Retail —
            </h1>
            <p
              className="text-xs tracking-[0.15em] uppercase mt-2"
              style={{ color: 'var(--accent-muted)' }}
            >
              AI-Powered Product Matching
            </p>
          </div>

          {/* Content container - constrained height */}
          <div className="w-full flex flex-col gap-3" style={{ maxHeight: '75vh' }}>
            {/* Product Showcase panel with Camera overlay - MAIN FOCUS */}
            <div
              className="w-full rounded-2xl flex-shrink-0 overflow-hidden relative"
              style={{
                height: '35vh',
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(20, 184, 166, 0.4)',
                boxShadow: '0 0 20px rgba(20, 184, 166, 0.15), inset 0 0 20px rgba(20, 184, 166, 0.05)',
              }}
            >
              {/* Product Showcase - spans entire block */}
              <div className="absolute inset-0">
                <ProductShowcase product={selectedProduct} />
              </div>

              {/* Camera overlay at bottom */}
              <div
                className="absolute bottom-0 left-0 right-0 p-3"
                style={{ height: '45%' }}
              >
                <div className="h-full flex items-end w-full">
                  <div className="w-full">
                    <CompactCamera
                      videoRef={videoRef}
                      landmarks={faceLandmarks}
                      matchResult={matchResult}
                      isAutoAdvancing={isAutoAdvancing}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Retail Info panel */}
            <div
              className="w-full p-3 rounded-2xl flex-shrink-0"
              style={{
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(20, 184, 166, 0.4)',
                boxShadow: '0 0 20px rgba(20, 184, 166, 0.15), inset 0 0 20px rgba(20, 184, 166, 0.05)',
              }}
            >
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'var(--text-secondary)' }}
              >
                AI interprets reactions to improve store design.
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Tap products</span>{' '}
                to reveal preferences.
              </p>
            </div>

            {/* Product Grid panel - smaller, fixed height */}
            <div
              className="w-full p-3 rounded-2xl flex-shrink-0 overflow-hidden"
              style={{
                height: '18vh',
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(20, 184, 166, 0.4)',
                boxShadow: '0 0 20px rgba(20, 184, 166, 0.15), inset 0 0 20px rgba(20, 184, 166, 0.05)',
              }}
            >
              <ProductGrid
                products={products}
                selectedIndex={selectedIndex}
                onSelectProduct={selectProduct}
              />
            </div>

            {/* Continue button */}
            <button
              onClick={onContinue}
              className="w-full py-3 rounded-full text-sm font-medium tracking-[0.15em] uppercase transition-all duration-300 hover:scale-[1.01] flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.8), rgba(20, 184, 166, 0.6))',
                border: '1px solid rgba(20, 184, 166, 0.6)',
                color: '#ffffff',
                boxShadow: '0 0 20px rgba(20, 184, 166, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
              }}
            >
              Continue
            </button>

            {/* Bottom info */}
            <div className="text-center flex-shrink-0">
              <p
                className="text-[10px] leading-relaxed"
                style={{ color: 'var(--text-muted)' }}
              >
                Sentiment is used in aggregate to understand customer preferences.{' '}
                <button
                  className="text-[10px] tracking-[0.08em] uppercase transition-colors"
                  style={{ color: 'var(--accent)' }}
                >
                  Learn More
                </button>
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Landscape: Original 2-column layout */
        <div className="panel-layout aspect-flex relative flex flex-col md:flex-row items-stretch gap-3 md:gap-6 max-w-4xl w-full z-10">
          {/* Left panel - Camera and Product */}
          <div className="w-full md:w-[40%] flex-shrink-0">
            <div
              className="h-full p-3 md:p-5 rounded-2xl flex flex-col"
              style={{
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(12px)',
                border: '1px solid var(--glass-border)',
              }}
            >
              <h2
                className="text-base md:text-lg font-semibold mb-3 md:mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                The Face of Our Emotions
              </h2>

              {/* Product Showcase */}
              <div className="flex-1 min-h-0 mb-4">
                <ProductShowcase product={selectedProduct} />
              </div>

              {/* Compact Camera with Match Score */}
              <CompactCamera
                videoRef={videoRef}
                landmarks={faceLandmarks}
                matchResult={matchResult}
                isAutoAdvancing={isAutoAdvancing}
              />

              {/* Bottom info */}
              <div
                className="mt-4 pt-3"
                style={{ borderTop: '1px solid var(--glass-border)' }}
              >
                <p
                  className="text-[10px] leading-relaxed"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Sentiment is used in aggregate to understand customer preferences, never individuality.
                </p>
                <button
                  className="mt-1.5 text-[9px] tracking-[0.12em] uppercase transition-colors"
                  style={{ color: 'var(--accent)' }}
                >
                  Learn More About Accenture's POV
                </button>
              </div>
            </div>
          </div>

          {/* Right panel - Retail info and product grid */}
          <div className="w-full md:w-[60%] flex-shrink-0">
            <div
              className="h-full p-3 md:p-5 rounded-2xl flex flex-col"
              style={{
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(12px)',
                border: '1px solid var(--glass-border)',
              }}
            >
              {/* Retail header */}
              <div className="mb-3 md:mb-4">
                <h3
                  className="text-lg md:text-xl font-semibold mb-1"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Retail
                </h3>
                <p
                  className="text-xs md:text-sm leading-relaxed"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  AI interprets reactions to improve store design.
                </p>
                <p className="text-xs md:text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                  <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Tap products</span>{' '}
                  to reveal preferences.
                </p>
              </div>

              {/* Product grid - takes remaining space */}
              <div className="flex-1 min-h-0 entrance-animate entrance-delay-3">
                <ProductGrid
                  products={products}
                  selectedIndex={selectedIndex}
                  onSelectProduct={selectProduct}
                />
              </div>

              {/* Continue button */}
              <div className="mt-4 entrance-animate entrance-delay-4">
                <button
                  onClick={onContinue}
                  className="w-full py-2.5 rounded-full text-sm font-medium tracking-[0.12em] uppercase transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                  style={{
                    background: 'var(--glass-bg-strong)',
                    backdropFilter: 'blur(10px)',
                    border: '1.5px solid var(--accent-muted)',
                    color: 'var(--text-primary)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
                  }}
                >
                  Continue to Next Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scene indicator */}
      <div className="scene-indicator absolute top-6 right-6 flex flex-col items-end gap-0.5 entrance-animate entrance-delay-5">
        <span
          className="text-[10px] tracking-[0.2em] uppercase"
          style={{ color: 'var(--text-faint)' }}
        >
          Scene 3a
        </span>
        <span
          className="text-[10px] tracking-[0.15em] uppercase"
          style={{ color: 'var(--accent-muted)' }}
        >
          Retail
        </span>
      </div>
    </div>
  )
}
