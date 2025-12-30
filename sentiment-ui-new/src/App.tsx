import { useState, useEffect, useCallback } from 'react'
import { useSceneStore } from './stores/sceneStore'
import { useThemeStore } from './stores/themeStore'
import { useVLMContext } from './hooks/useVLMContext'
import { VisionDetectionProvider } from './providers/VisionDetectionProvider'
import { Scene0AttractLoop } from './scenes/Scene0AttractLoop'
import { Scene1Welcome } from './scenes/Scene1Welcome'
import { Scene2Analysis } from './scenes/Scene2Analysis'
import { Scene3aRetail } from './scenes/Scene3aRetail'
import { Scene3bHealthcare } from './scenes/Scene3bHealthcare'
import { Scene3cHighStress } from './scenes/Scene3cHighStress'
import { Scene4Sensitivity } from './scenes/Scene4Sensitivity'
import { Scene5Summary } from './scenes/Scene5Summary'
import { SceneVisionHUD } from './scenes/SceneVisionHUD'
import { SceneTransition, TransitionType, getBlurScaleClass } from './components/SceneTransition'
import { ContextSlide } from './components/ContextSlide'
import { CursorGlow } from './components/CursorGlow'
import { websocketService } from './services/websocket'

// Featured videos for Context Slides (portrait mode)
const SCENE_2_VIDEO = '/videos/a-professional-woman-uses-facial-recognition-tech-2025-12-17-21-41-17-utc.mov'
const SCENE_4_VIDEO = '/videos/hospital-ai-detection.mp4'

// Gallery videos for first context slide
const SCENE_2_GALLERY: (string | { src: string; scale?: number; position?: string })[] = [
  '/videos/LandmarkDetection.mp4',
  '/videos/a-reflective-person-in-an-urban-setting-dressed-in-2025-12-17-22-01-30-utc.mov',
  '/videos/LandmarkDetection2.mp4',
  '/videos/MultiFaceDetection.mp4',
  { src: '/videos/Quality 4.mp4', scale: 1.2, position: '30% center' },
  '/videos/MultiFaceDetection2.mp4',
]

// Gallery videos for second context slide
const SCENE_4_GALLERY: (string | { src: string; scale?: number; position?: string })[] = [
  '/videos/a-police-officer-armed-with-a-firearm.mov',
  '/videos/clients-shopping-for-trendy-merchandise-2025-12-17-13-24-48-utc.mov',
  '/videos/callcenter.mp4',
  '/videos/firefighters.mp4',
  '/videos/patient-in-room.mp4',
  '/videos/traffic-control-room.mov',
]

// Determine transition type based on scene pair
function getTransitionType(fromScene: number, toScene: number): TransitionType {
  // Portal effect only for Scene 0 → 1 (system activation)
  if (fromScene === 0 && toScene === 1) {
    return 'portal'
  }
  // Blur-scale for all other transitions
  return 'blur-scale'
}

function App() {
  const currentScene = useSceneStore(state => state.currentScene)
  const transitionToScene = useSceneStore(state => state.transitionToScene)
  const setBackendConnected = useSceneStore(state => state.setBackendConnected)
  const backendConnected = useSceneStore(state => state.backendConnected)
  const backendEngagement = useSceneStore(state => state.backendEngagement)

  // FastVLM context
  const { isLoaded: vlmLoaded, isLoading: vlmLoading, progress: vlmProgress } = useVLMContext()

  // Initialize theme (this ensures the .dark class is applied on mount)
  useThemeStore(state => state.isDarkMode)

  // Connect to backend WebSocket when app mounts
  useEffect(() => {
    websocketService.setCallbacks({
      onStatusChange: (status) => {
        setBackendConnected(status === 'connected')
      },
    })

    // Connect to backend
    websocketService.connect()

    return () => {
      websocketService.disconnect()
    }
  }, [setBackendConnected])

  const [displayedScene, setDisplayedScene] = useState(currentScene)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const [pendingScene, setPendingScene] = useState<number | null>(null)
  const [showReveal, setShowReveal] = useState(false)
  const [transitionType, setTransitionType] = useState<TransitionType>('portal')

  // Handle scene transitions with complex effect
  const handleSceneChange = useCallback((newScene: number) => {
    if (isTransitioning) return

    // Determine transition type based on current and target scene
    const type = getTransitionType(displayedScene, newScene)
    setTransitionType(type)

    setIsTransitioning(true)
    setIsExiting(true)
    setPendingScene(newScene)
  }, [isTransitioning, displayedScene])

  // Called by SceneTransition when it's time to switch the actual scene
  const handleSceneSwitch = useCallback(() => {
    if (pendingScene !== null) {
      transitionToScene(pendingScene)
      setDisplayedScene(pendingScene)
      setIsExiting(false)
      setShowReveal(true)
    }
  }, [pendingScene, transitionToScene])

  // Called when transition is complete
  const handleTransitionComplete = useCallback(() => {
    setIsTransitioning(false)
    setPendingScene(null)
    // Keep reveal animation for a moment, then clear
    setTimeout(() => {
      setShowReveal(false)
    }, 100)
  }, [])

  // Sync displayed scene with store (for non-transition changes)
  useEffect(() => {
    if (!isTransitioning && currentScene !== displayedScene) {
      setDisplayedScene(currentScene)
    }
  }, [currentScene, displayedScene, isTransitioning])

  // Get blur-scale class for scene containers
  const blurScaleClass = getBlurScaleClass(isTransitioning, transitionType, isExiting)

  // Get content reveal class (only for portal transitions)
  const getRevealClass = () => {
    if (showReveal && transitionType === 'portal') {
      return 'content-reveal'
    }
    return ''
  }

  return (
    <VisionDetectionProvider autoStart={true} defaultPreset="minimal">
    <div className="w-full h-full relative overflow-hidden">
      {/* Noise texture overlay for premium depth */}
      <div className="noise-overlay" />

      {/* Cursor glow effect */}
      <CursorGlow />

      {/* Backend status debug panel (dev only) */}
      {import.meta.env.DEV && (
        <div className="fixed bottom-4 left-4 z-50 bg-black/80 text-white text-xs font-mono p-3 rounded-lg space-y-1 max-w-xs">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${backendConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>Backend: {backendConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${vlmLoaded ? 'bg-green-500' : vlmLoading ? 'bg-yellow-500 animate-pulse' : 'bg-gray-500'}`} />
            <span>FastVLM: {vlmLoaded ? 'Ready' : vlmLoading ? 'Loading...' : 'Not loaded'}</span>
          </div>
          {vlmLoading && vlmProgress && (
            <div className="text-[10px] text-gray-400 truncate">{vlmProgress}</div>
          )}
          {backendEngagement && (
            <>
              <div>Score: {(backendEngagement.overall_score * 100).toFixed(0)}%</div>
              <div>Faces: {backendEngagement.total_participants}</div>
              {backendEngagement.persons?.[0]?.details?.dominant_emotion && (
                <div>Emotion: {backendEngagement.persons[0].details.dominant_emotion}</div>
              )}
            </>
          )}
        </div>
      )}

      {/* Scene Transition Effects */}
      <SceneTransition
        isActive={isTransitioning && pendingScene !== null}
        transitionType={transitionType}
        onSceneSwitch={handleSceneSwitch}
        onComplete={handleTransitionComplete}
      />

      {/* Scene container */}
      {/* Scene Flow:
          0: Attract Loop
          1: Welcome
          2: Context Slide - Emotion Intelligence
          3: Analysis
          4: Context Slide - Applied Sentiment
          5: Retail
          6: Healthcare
          7: High Stress
          8: Sensitivity
          9: Summary
          10: VisionHUD Demo
      */}
      <div className="w-full h-full">
        {displayedScene === 0 && (
          <Scene0AttractLoop
            onAdvance={() => handleSceneChange(1)}
            isExiting={isExiting}
          />
        )}
        {displayedScene === 1 && (
          <div className={`w-full h-full ${getRevealClass()} ${blurScaleClass}`}>
            <Scene1Welcome onBegin={() => handleSceneChange(2)} />
          </div>
        )}
        {/* Context Slide 1: Emotion Intelligence at Scale */}
        {displayedScene === 2 && (
          <div className={`w-full h-full ${getRevealClass()} ${blurScaleClass}`}>
            <ContextSlide
              title="Emotion Intelligence at Scale"
              onContinue={() => handleSceneChange(3)}
              featuredVideo={SCENE_2_VIDEO}
              placeholderCount={3}
              galleryVideos={SCENE_2_GALLERY}
            >
              <p className="mb-4">
                The human face produces over 10,000 unique expressions—many occurring
                in fractions of a second, invisible to conscious perception.
              </p>
              <p>
                Advanced computer vision captures and interprets these micro-expressions
                in real time, transforming subjective emotion into quantifiable insight.
              </p>
            </ContextSlide>
          </div>
        )}
        {displayedScene === 3 && (
          <div className={`w-full h-full ${getRevealClass()} ${blurScaleClass}`}>
            <Scene2Analysis onContinue={() => handleSceneChange(4)} />
          </div>
        )}
        {/* Context Slide 2: Applied Sentiment Analysis */}
        {displayedScene === 4 && (
          <div className={`w-full h-full ${getRevealClass()} ${blurScaleClass}`}>
            <ContextSlide
              title="Applied Sentiment Analysis"
              subtitle="Retail · Healthcare · High-Consequence Environments"
              onContinue={() => handleSceneChange(5)}
              featuredVideo={SCENE_4_VIDEO}
              placeholderCount={3}
              galleryVideos={SCENE_4_GALLERY}
            >
              <p>
                Emotion recognition is enhancing organizational
                decision-making across industries.
              </p>
            </ContextSlide>
          </div>
        )}
        {displayedScene === 5 && (
          <div className={`w-full h-full ${getRevealClass()} ${blurScaleClass}`}>
            <Scene3aRetail onContinue={() => handleSceneChange(6)} />
          </div>
        )}
        {displayedScene === 6 && (
          <div className={`w-full h-full ${getRevealClass()} ${blurScaleClass}`}>
            <Scene3bHealthcare onContinue={() => handleSceneChange(7)} />
          </div>
        )}
        {displayedScene === 7 && (
          <div className={`w-full h-full ${getRevealClass()} ${blurScaleClass}`}>
            <Scene3cHighStress onContinue={() => handleSceneChange(8)} />
          </div>
        )}
        {displayedScene === 8 && (
          <div className={`w-full h-full ${getRevealClass()} ${blurScaleClass}`}>
            <Scene4Sensitivity onContinue={() => handleSceneChange(9)} />
          </div>
        )}
        {displayedScene === 9 && (
          <div className={`w-full h-full ${getRevealClass()} ${blurScaleClass}`}>
            <Scene5Summary
              onReplay={() => handleSceneChange(0)}
              onVisionHUD={() => handleSceneChange(10)}
            />
          </div>
        )}
        {displayedScene === 10 && (
          <div className={`w-full h-full ${getRevealClass()} ${blurScaleClass}`}>
            <SceneVisionHUD onBack={() => handleSceneChange(9)} />
          </div>
        )}
        {displayedScene >= 11 && (
          <div
            className={`w-full h-full bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center ${
              getRevealClass()
            } ${blurScaleClass}`}
          >
            <p className="text-slate-400 text-sm tracking-widest uppercase">
              Scene {displayedScene} - Coming Soon
            </p>
          </div>
        )}
      </div>
    </div>
    </VisionDetectionProvider>
  )
}

export default App
