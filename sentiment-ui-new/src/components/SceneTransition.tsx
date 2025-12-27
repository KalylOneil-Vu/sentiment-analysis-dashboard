import { useEffect, useState, useCallback } from 'react'

export type TransitionType = 'portal' | 'blur-scale'

type TransitionPhase = 'idle' | 'converging' | 'bursting' | 'washing' | 'revealing' | 'exiting' | 'entering'

interface SceneTransitionProps {
  isActive: boolean
  transitionType: TransitionType
  onSceneSwitch: () => void
  onComplete: () => void
}

// Timing constants for PORTAL transition (Scene 0 → 1)
const PORTAL_TIMING = {
  RING_START: 400,
  SCENE_SWITCH: 1000,
  RING_CLEANUP: 1500,
  WASH_FADE_START: 1800,
  TOTAL: 3000,
}

// Timing constants for BLUR-SCALE transition (Scene 1→2, 2→3)
const BLUR_SCALE_TIMING = {
  EXIT_DURATION: 400,
  SCENE_SWITCH: 400,
  ENTER_DURATION: 500,
  TOTAL: 900,
}

export function SceneTransition({
  isActive,
  transitionType,
  onSceneSwitch,
  onComplete,
}: SceneTransitionProps) {
  const [phase, setPhase] = useState<TransitionPhase>('idle')
  const [showRing, setShowRing] = useState(false)
  const [showWash, setShowWash] = useState(false)
  const [washFading, setWashFading] = useState(false)

  // Portal transition (for Scene 0 → 1)
  const runPortalTransition = useCallback(() => {
    setPhase('converging')

    setTimeout(() => {
      setPhase('bursting')
      setShowRing(true)
      setShowWash(true)
    }, PORTAL_TIMING.RING_START)

    setTimeout(() => {
      setPhase('washing')
      onSceneSwitch()
    }, PORTAL_TIMING.SCENE_SWITCH)

    setTimeout(() => {
      setShowRing(false)
    }, PORTAL_TIMING.RING_CLEANUP)

    setTimeout(() => {
      setPhase('revealing')
      setWashFading(true)
    }, PORTAL_TIMING.WASH_FADE_START)

    setTimeout(() => {
      setPhase('idle')
      setShowWash(false)
      setWashFading(false)
      onComplete()
    }, PORTAL_TIMING.TOTAL)
  }, [onSceneSwitch, onComplete])

  // Blur-scale transition (for Scene 1→2, 2→3)
  const runBlurScaleTransition = useCallback(() => {
    setPhase('exiting')

    // Scene switches after exit animation
    setTimeout(() => {
      setPhase('entering')
      onSceneSwitch()
    }, BLUR_SCALE_TIMING.SCENE_SWITCH)

    // Complete after enter animation
    setTimeout(() => {
      setPhase('idle')
      onComplete()
    }, BLUR_SCALE_TIMING.TOTAL)
  }, [onSceneSwitch, onComplete])

  useEffect(() => {
    if (isActive && phase === 'idle') {
      if (transitionType === 'portal') {
        runPortalTransition()
      } else {
        runBlurScaleTransition()
      }
    }
  }, [isActive, phase, transitionType, runPortalTransition, runBlurScaleTransition])

  // Dispatch phase events for Scene0 to listen to (portal only)
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('transition-phase', { detail: { phase, transitionType } })
    )
  }, [phase, transitionType])

  // Only render overlays for portal transition
  if (transitionType === 'blur-scale') {
    return null
  }

  return (
    <>
      {/* Expanding ring (portal only) */}
      {showRing && (
        <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center overflow-hidden">
          <div className="transition-ring" />
        </div>
      )}

      {/* White wash overlay (portal only) */}
      {showWash && (
        <div
          className={`fixed inset-0 z-[99] transition-wash ${
            washFading ? 'transition-wash-out' : 'transition-wash-in'
          }`}
        />
      )}
    </>
  )
}

// Hook to get current transition phase and type
export function useTransitionPhase() {
  const [phase, setPhase] = useState<TransitionPhase>('idle')
  const [transitionType, setTransitionType] = useState<TransitionType>('portal')

  useEffect(() => {
    const handler = (e: CustomEvent<{ phase: TransitionPhase; transitionType: TransitionType }>) => {
      setPhase(e.detail.phase)
      setTransitionType(e.detail.transitionType)
    }

    window.addEventListener(
      'transition-phase',
      handler as EventListener
    )

    return () => {
      window.removeEventListener(
        'transition-phase',
        handler as EventListener
      )
    }
  }, [])

  return { phase, transitionType }
}

// Helper to get blur-scale class based on phase
export function getBlurScaleClass(
  isTransitioning: boolean,
  transitionType: TransitionType,
  isExiting: boolean
): string {
  if (!isTransitioning || transitionType !== 'blur-scale') {
    return ''
  }
  return isExiting ? 'scene-blur-exit' : 'scene-blur-enter'
}
