/**
 * useSceneIntro Hook
 * Manages intro video state for scenes
 */

import { useState, useCallback, useEffect } from 'react'
import { getSceneVideo, SceneVideoConfig } from '../config/sceneVideos'

export type ScenePhase = 'video' | 'content'

interface UseSceneIntroOptions {
  sceneNumber: number
  skipVideo?: boolean
}

interface UseSceneIntroReturn {
  phase: ScenePhase
  videoConfig: SceneVideoConfig | null
  onVideoEnd: () => void
  skipToContent: () => void
}

export function useSceneIntro({
  sceneNumber,
  skipVideo = false,
}: UseSceneIntroOptions): UseSceneIntroReturn {
  const videoConfig = getSceneVideo(sceneNumber)

  // Start in video phase if video exists and not skipped
  const [phase, setPhase] = useState<ScenePhase>(
    videoConfig && !skipVideo ? 'video' : 'content'
  )

  // Reset phase when scene changes
  useEffect(() => {
    const config = getSceneVideo(sceneNumber)
    setPhase(config && !skipVideo ? 'video' : 'content')
  }, [sceneNumber, skipVideo])

  const onVideoEnd = useCallback(() => {
    setPhase('content')
  }, [])

  const skipToContent = useCallback(() => {
    setPhase('content')
  }, [])

  return {
    phase,
    videoConfig,
    onVideoEnd,
    skipToContent,
  }
}
