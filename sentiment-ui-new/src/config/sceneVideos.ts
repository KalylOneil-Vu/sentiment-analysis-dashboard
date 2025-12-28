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
 * Video configuration for scenes 1-7
 * Scene 0 has no intro video (shows live VisionHUD to attract users)
 * Scene 8 has no intro video (optional Vision HUD demo)
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

  // Scene 2: Analysis
  2: {
    sceneNumber: 2,
    videoUrl: SAMPLE_VIDEO,
    title: 'Analysis',
  },

  // Scene 3a: Retail
  3: {
    sceneNumber: 3,
    videoUrl: SAMPLE_VIDEO,
    title: 'Retail',
  },

  // Scene 3b: Healthcare
  4: {
    sceneNumber: 4,
    videoUrl: SAMPLE_VIDEO,
    title: 'Healthcare',
  },

  // Scene 3c: High Stress
  5: {
    sceneNumber: 5,
    videoUrl: SAMPLE_VIDEO,
    title: 'High Stress',
  },

  // Scene 4: Sensitivity
  6: {
    sceneNumber: 6,
    videoUrl: SAMPLE_VIDEO,
    title: 'Sensitivity',
  },

  // Scene 5: Summary
  7: {
    sceneNumber: 7,
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
