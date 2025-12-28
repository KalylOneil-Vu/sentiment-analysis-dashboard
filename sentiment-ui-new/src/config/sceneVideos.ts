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
export const SCENE_VIDEOS: Record<number, SceneVideoConfig> = {
  // Scene 1: Welcome
  1: {
    sceneNumber: 1,
    videoUrl: '/videos/scene1-intro.mp4',
    title: 'Welcome',
  },

  // Scene 2: Analysis
  2: {
    sceneNumber: 2,
    videoUrl: '/videos/scene2-intro.mp4',
    title: 'Analysis',
  },

  // Scene 3a: Retail
  3: {
    sceneNumber: 3,
    videoUrl: '/videos/scene3a-intro.mp4',
    title: 'Retail',
  },

  // Scene 3b: Healthcare
  4: {
    sceneNumber: 4,
    videoUrl: '/videos/scene3b-intro.mp4',
    title: 'Healthcare',
  },

  // Scene 3c: High Stress
  5: {
    sceneNumber: 5,
    videoUrl: '/videos/scene3c-intro.mp4',
    title: 'High Stress',
  },

  // Scene 4: Sensitivity
  6: {
    sceneNumber: 6,
    videoUrl: '/videos/scene4-intro.mp4',
    title: 'Sensitivity',
  },

  // Scene 5: Summary
  7: {
    sceneNumber: 7,
    videoUrl: '/videos/scene5-intro.mp4',
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
