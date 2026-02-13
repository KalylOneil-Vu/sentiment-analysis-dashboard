import { create } from 'zustand'
import type { BackendEngagement } from '../types/backend'
import type { EmotionType } from '../types/emotion'

interface SceneState {
  // User detection
  isUserPresent: boolean
  proximityLevel: number // 0-1

  // Emotional analysis (simulated for Scene 0)
  emotionalShift: number // 0-1, intensity of detected emotional change

  // Scene control
  currentScene: number
  isTransitioning: boolean

  // Audio
  isAudioEnabled: boolean
  isAudioPlaying: boolean

  // Detection state
  isPoseReady: boolean
  isFaceReady: boolean

  // Backend integration
  backendConnected: boolean
  backendEngagement: BackendEngagement | null
  backendEmotion: EmotionType | null
  lastBackendUpdate: number | null

  // Actions
  setUserPresence: (present: boolean, proximity: number) => void
  setEmotionalShift: (level: number) => void
  transitionToScene: (sceneNumber: number) => void
  toggleAudio: () => void
  setAudioPlaying: (playing: boolean) => void
  setPoseReady: (ready: boolean) => void
  setFaceReady: (ready: boolean) => void
  setBackendConnected: (connected: boolean) => void
  setBackendEngagement: (engagement: BackendEngagement | null, emotion: EmotionType | null) => void
}

export const useSceneStore = create<SceneState>((set) => ({
  isUserPresent: false,
  proximityLevel: 0,
  emotionalShift: 0,
  currentScene: 0,
  isTransitioning: false,
  isAudioEnabled: true,
  isAudioPlaying: false,
  isPoseReady: false,
  isFaceReady: false,
  backendConnected: false,
  backendEngagement: null,
  backendEmotion: null,
  lastBackendUpdate: null,

  setUserPresence: (present, proximity) => set({
    isUserPresent: present,
    proximityLevel: proximity
  }),

  setEmotionalShift: (level) => set({ emotionalShift: Math.min(1, Math.max(0, level)) }),

  transitionToScene: (sceneNumber) => {
    set({ isTransitioning: true })
    setTimeout(() => {
      set({ currentScene: sceneNumber, isTransitioning: false })
    }, 500)
  },

  toggleAudio: () => set((state) => ({ isAudioEnabled: !state.isAudioEnabled })),

  setAudioPlaying: (playing) => set({ isAudioPlaying: playing }),

  setPoseReady: (ready) => set({ isPoseReady: ready }),

  setFaceReady: (ready) => set({ isFaceReady: ready }),

  setBackendConnected: (connected) => set({ backendConnected: connected }),

  setBackendEngagement: (engagement, emotion) => set({
    backendEngagement: engagement,
    backendEmotion: emotion,
    lastBackendUpdate: engagement ? Date.now() : null,
  }),
}))
