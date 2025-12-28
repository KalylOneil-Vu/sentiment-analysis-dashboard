/**
 * HUD Presets Configuration
 * Per-scene configurations for VisionCamera component
 */

import type { HUDPreset, PresetName, HUDConfig } from '../types/visionHUD'

/**
 * Preset definitions for each scene
 */
export const HUD_PRESETS: Record<PresetName, HUDPreset> = {
  // Scene 0: Attract Loop - silhouette-style pose tracking (legacy)
  attract: {
    face: false,
    pose: true,
    hand: false,
    object: false,
    bio: false,
    speech: false,
    faceMesh: 'none',
    showSkeleton: true,
    showLabels: false,
    showConfidence: false,
    showBioCard: false,
    showGestureLabel: false,
    showTranscript: false,
    showGrid: false,
    opacity: 0.8,
  },

  // Scene 0: Attract Loop - full VisionHUD with face detection
  attractFull: {
    face: true,
    pose: true,
    hand: false,
    object: false,
    bio: true,
    speech: false,
    faceMesh: 'tessellation',
    showSkeleton: true,
    showLabels: false,
    showConfidence: false,
    showBioCard: true,
    showGestureLabel: false,
    showTranscript: false,
    showGrid: false,
    opacity: 0.9,
  },

  // Scene 2: Analysis - full face mesh with tessellation grid
  analysis: {
    face: true,
    pose: true,
    hand: true,
    object: false,
    bio: true,
    speech: true,
    faceMesh: 'tessellation',
    showSkeleton: true,
    showLabels: true,
    showConfidence: true,
    showBioCard: true,
    showGestureLabel: true,
    showTranscript: true,
    showGrid: true,
    opacity: 1,
  },

  // Scene 3a: Retail - face + objects + hands for product interaction
  retail: {
    face: true,
    pose: false,
    hand: true,
    object: true,
    bio: true,
    speech: false,
    faceMesh: 'outline',
    showSkeleton: true,
    showLabels: true,
    showConfidence: true,
    showBioCard: true,
    showGestureLabel: true,
    showTranscript: false,
    showGrid: false,
    opacity: 1,
  },

  // Scene 3b: Healthcare - face + pose + bio metrics
  healthcare: {
    face: true,
    pose: true,
    hand: false,
    object: false,
    bio: true,
    speech: false,
    faceMesh: 'outline',
    showSkeleton: true,
    showLabels: true,
    showConfidence: true,
    showBioCard: true,
    showGestureLabel: false,
    showTranscript: false,
    showGrid: false,
    opacity: 1,
  },

  // Scene 3c: High Stress - compact face outline
  stress: {
    face: true,
    pose: false,
    hand: false,
    object: false,
    bio: true,
    speech: false,
    faceMesh: 'outline',
    showSkeleton: true,
    showLabels: false,
    showConfidence: false,
    showBioCard: true,
    showGestureLabel: false,
    showTranscript: false,
    showGrid: false,
    opacity: 0.9,
  },

  // Scene 4: Sensitivity - face outline with grid background
  sensitivity: {
    face: true,
    pose: false,
    hand: false,
    object: false,
    bio: true,
    speech: false,
    faceMesh: 'outline',
    showSkeleton: true,
    showLabels: true,
    showConfidence: true,
    showBioCard: true,
    showGestureLabel: false,
    showTranscript: false,
    showGrid: true,
    opacity: 1,
  },

  // Scene 5: Summary - face outline with grid
  summary: {
    face: true,
    pose: false,
    hand: false,
    object: false,
    bio: true,
    speech: false,
    faceMesh: 'outline',
    showSkeleton: true,
    showLabels: true,
    showConfidence: true,
    showBioCard: true,
    showGestureLabel: false,
    showTranscript: false,
    showGrid: true,
    opacity: 1,
  },

  // Full: All modules enabled (for Vision HUD demo)
  full: {
    face: true,
    pose: true,
    hand: true,
    object: true,
    bio: true,
    speech: true,
    faceMesh: 'tessellation',
    showSkeleton: true,
    showLabels: true,
    showConfidence: true,
    showBioCard: true,
    showGestureLabel: true,
    showTranscript: true,
    showGrid: false,
    opacity: 1,
  },

  // Minimal: Just face outline, no labels
  minimal: {
    face: true,
    pose: false,
    hand: false,
    object: false,
    bio: false,
    speech: false,
    faceMesh: 'outline',
    showSkeleton: true,
    showLabels: false,
    showConfidence: false,
    showBioCard: false,
    showGestureLabel: false,
    showTranscript: false,
    showGrid: false,
    opacity: 0.8,
  },
}

/**
 * Convert HUDPreset to HUDConfig for VisionHUDOverlay
 */
export function presetToConfig(preset: HUDPreset): HUDConfig {
  return {
    showLabels: preset.showLabels ?? true,
    showConfidence: preset.showConfidence ?? true,
    showBioCard: preset.showBioCard ?? true,
    showSkeleton: preset.showSkeleton ?? true,
    showGestureLabel: preset.showGestureLabel ?? true,
    showTranscript: preset.showTranscript ?? true,
    opacity: preset.opacity ?? 1,
    colorScheme: 'default',
    modules: {
      face: preset.face ?? true,
      pose: preset.pose ?? true,
      hand: preset.hand ?? true,
      object: preset.object ?? true,
      bio: preset.bio ?? true,
      speech: preset.speech ?? true,
    },
  }
}

/**
 * Get preset by name or return custom preset
 */
export function getPreset(preset: PresetName | HUDPreset): HUDPreset {
  if (typeof preset === 'string') {
    return HUD_PRESETS[preset] ?? HUD_PRESETS.full
  }
  return preset
}

/**
 * Merge preset with overrides
 */
export function mergePreset(
  base: PresetName | HUDPreset,
  overrides: Partial<HUDPreset>
): HUDPreset {
  const basePreset = getPreset(base)
  return { ...basePreset, ...overrides }
}
