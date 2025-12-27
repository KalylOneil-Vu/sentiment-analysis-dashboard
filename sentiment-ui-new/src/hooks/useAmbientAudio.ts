import { useEffect, useRef, useState, useCallback } from 'react'
import {
  initAudioContext,
  resumeAudioContext,
  startAmbientPingLoop,
} from '../lib/audio/sonarPing'
import { useSceneStore } from '../stores/sceneStore'

interface UseAmbientAudioReturn {
  isPlaying: boolean
  isReady: boolean
  startAudio: () => Promise<void>
  stopAudio: () => void
}

export function useAmbientAudio(autoStart: boolean = false): UseAmbientAudioReturn {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const stopRef = useRef<(() => void) | null>(null)

  const isAudioEnabled = useSceneStore(state => state.isAudioEnabled)
  const setAudioPlaying = useSceneStore(state => state.setAudioPlaying)

  const startAudio = useCallback(async () => {
    if (!isAudioEnabled || isPlaying) return

    try {
      initAudioContext()
      await resumeAudioContext()
      stopRef.current = startAmbientPingLoop(6000)
      setIsPlaying(true)
      setAudioPlaying(true)
      setIsReady(true)
    } catch (err) {
      console.error('Failed to start audio:', err)
    }
  }, [isAudioEnabled, isPlaying, setAudioPlaying])

  const stopAudio = useCallback(() => {
    if (stopRef.current) {
      stopRef.current()
      stopRef.current = null
    }
    setIsPlaying(false)
    setAudioPlaying(false)
  }, [setAudioPlaying])

  // Handle user interaction to enable audio
  useEffect(() => {
    if (!autoStart || !isAudioEnabled) return

    const handleInteraction = async () => {
      await startAudio()
      document.removeEventListener('click', handleInteraction)
      document.removeEventListener('touchstart', handleInteraction)
      document.removeEventListener('keydown', handleInteraction)
    }

    document.addEventListener('click', handleInteraction)
    document.addEventListener('touchstart', handleInteraction)
    document.addEventListener('keydown', handleInteraction)

    return () => {
      document.removeEventListener('click', handleInteraction)
      document.removeEventListener('touchstart', handleInteraction)
      document.removeEventListener('keydown', handleInteraction)
    }
  }, [autoStart, isAudioEnabled, startAudio])

  // Stop audio when disabled
  useEffect(() => {
    if (!isAudioEnabled && isPlaying) {
      stopAudio()
    }
  }, [isAudioEnabled, isPlaying, stopAudio])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio()
    }
  }, [stopAudio])

  return {
    isPlaying,
    isReady,
    startAudio,
    stopAudio,
  }
}
