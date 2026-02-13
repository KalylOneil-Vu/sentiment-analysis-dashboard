/**
 * Scene Intro Video Configuration
 * Portrait mode videos (9:16 aspect ratio) for each scene
 */

export interface SceneVideoConfig {
  sceneNumber: number
  videoUrl: string
  title: string
}

/**
 * Video configuration for interactive scenes
 *
 * Scene Flow:
 *   0: Attract Loop (no video)
 *   1: Welcome
 *   2: Context Slide - Emotion Intelligence (no video)
 *   3: Analysis
 *   4: Context Slide - Applied Sentiment (no video)
 *   5: Retail
 *   6: Healthcare
 *   7: High Stress
 *   8: Sensitivity
 *   9: Summary
 *   10: VisionHUD Demo (no video)
 */
// Sample video for testing (used for all scenes until real videos are added)
const SAMPLE_VIDEO = '/videos/Rudimentary Multi-Object Tracking Test 1A.mp4'

export const SCENE_VIDEOS: Record<number, SceneVideoConfig> = {
  // Scene 1: Welcome
  1: {
    sceneNumber: 1,
    videoUrl: SAMPLE_VIDEO,
    title: 'Welcome',
  },

  // Scene 3: Analysis
  3: {
    sceneNumber: 3,
    videoUrl: SAMPLE_VIDEO,
    title: 'Analysis',
  },

  // Scene 5: Retail
  5: {
    sceneNumber: 5,
    videoUrl: SAMPLE_VIDEO,
    title: 'Retail',
  },

  // Scene 6: Healthcare
  6: {
    sceneNumber: 6,
    videoUrl: SAMPLE_VIDEO,
    title: 'Healthcare',
  },

  // Scene 7: High Stress
  7: {
    sceneNumber: 7,
    videoUrl: SAMPLE_VIDEO,
    title: 'High Stress',
  },

  // Scene 8: Sensitivity
  8: {
    sceneNumber: 8,
    videoUrl: SAMPLE_VIDEO,
    title: 'Sensitivity',
  },

  // Scene 9: Summary
  9: {
    sceneNumber: 9,
    videoUrl: SAMPLE_VIDEO,
    title: 'Summary',
  },
}

/**
 * Get video configuration for a scene
 * @param sceneNumber The scene number (1-7 have videos)
 * @returns SceneVideoConfig or null if no video for this scene
 */
export function getSceneVideo(sceneNumber: number): SceneVideoConfig | null {
  return SCENE_VIDEOS[sceneNumber] || null
}

/**
 * Check if a scene has an intro video
 * @param sceneNumber The scene number to check
 */
export function hasIntroVideo(sceneNumber: number): boolean {
  return sceneNumber in SCENE_VIDEOS
}
