/**
 * Vision HUD Store
 * Manages state for all vision detection modules
 */

import { create } from 'zustand'
import type {
  VisionModule,
  ModuleState,
  HUDConfig,
} from '../types/visionHUD'

interface VisionHUDState {
  // Module states
  moduleStates: Record<VisionModule, ModuleState>

  // HUD configuration
  config: HUDConfig

  // Performance metrics
  overallFPS: number
  gpuUtilization: number // Estimated 0-1

  // Actions - Module control
  setModuleEnabled: (module: VisionModule, enabled: boolean) => void
  setModuleReady: (module: VisionModule, ready: boolean) => void
  setModuleLoading: (module: VisionModule, loading: boolean) => void
  setModuleError: (module: VisionModule, error: string | null) => void
  updateModuleFPS: (module: VisionModule, fps: number) => void
  resetModuleState: (module: VisionModule) => void

  // Actions - Config
  updateConfig: (updates: Partial<HUDConfig>) => void
  toggleModule: (module: VisionModule) => void
  setColorScheme: (scheme: HUDConfig['colorScheme']) => void

  // Actions - Performance
  setOverallFPS: (fps: number) => void
  setGPUUtilization: (utilization: number) => void
}

const createDefaultModuleState = (): ModuleState => ({
  enabled: true,
  ready: false,
  loading: false,
  error: null,
  lastUpdate: null,
  fps: 0,
})

const initialModuleStates: Record<VisionModule, ModuleState> = {
  face: createDefaultModuleState(),
  pose: createDefaultModuleState(),
  hand: createDefaultModuleState(),
  object: createDefaultModuleState(),
  bio: createDefaultModuleState(),
  speech: createDefaultModuleState(),
}

const defaultConfig: HUDConfig = {
  showLabels: true,
  showConfidence: true,
  showBioCard: true,
  showSkeleton: true,
  showGestureLabel: true,
  showTranscript: true,
  opacity: 1,
  colorScheme: 'default',
  modules: {
    face: true,
    pose: true,
    hand: true,
    object: true,
    bio: true,
    speech: true,
  },
}

export const useVisionHUDStore = create<VisionHUDState>((set, get) => ({
  moduleStates: { ...initialModuleStates },
  config: { ...defaultConfig },
  overallFPS: 0,
  gpuUtilization: 0,

  setModuleEnabled: (module, enabled) =>
    set((state) => ({
      moduleStates: {
        ...state.moduleStates,
        [module]: { ...state.moduleStates[module], enabled },
      },
      config: {
        ...state.config,
        modules: { ...state.config.modules, [module]: enabled },
      },
    })),

  setModuleReady: (module, ready) =>
    set((state) => ({
      moduleStates: {
        ...state.moduleStates,
        [module]: {
          ...state.moduleStates[module],
          ready,
          loading: false,
          lastUpdate: ready ? Date.now() : state.moduleStates[module].lastUpdate,
        },
      },
    })),

  setModuleLoading: (module, loading) =>
    set((state) => ({
      moduleStates: {
        ...state.moduleStates,
        [module]: { ...state.moduleStates[module], loading },
      },
    })),

  setModuleError: (module, error) =>
    set((state) => ({
      moduleStates: {
        ...state.moduleStates,
        [module]: {
          ...state.moduleStates[module],
          error,
          loading: false,
          ready: error ? false : state.moduleStates[module].ready,
        },
      },
    })),

  updateModuleFPS: (module, fps) =>
    set((state) => ({
      moduleStates: {
        ...state.moduleStates,
        [module]: {
          ...state.moduleStates[module],
          fps,
          lastUpdate: Date.now(),
        },
      },
    })),

  resetModuleState: (module) =>
    set((state) => ({
      moduleStates: {
        ...state.moduleStates,
        [module]: createDefaultModuleState(),
      },
    })),

  updateConfig: (updates) =>
    set((state) => ({
      config: { ...state.config, ...updates },
    })),

  toggleModule: (module) => {
    const current = get().config.modules[module]
    get().setModuleEnabled(module, !current)
  },

  setColorScheme: (scheme) =>
    set((state) => ({
      config: { ...state.config, colorScheme: scheme },
    })),

  setOverallFPS: (fps) => set({ overallFPS: fps }),

  setGPUUtilization: (utilization) =>
    set({ gpuUtilization: Math.min(1, Math.max(0, utilization)) }),
}))

// Selector hooks for common patterns
export const useModuleState = (module: VisionModule) =>
  useVisionHUDStore((state) => state.moduleStates[module])

export const useHUDConfig = () => useVisionHUDStore((state) => state.config)

export const useModuleEnabled = (module: VisionModule) =>
  useVisionHUDStore((state) => state.config.modules[module])
