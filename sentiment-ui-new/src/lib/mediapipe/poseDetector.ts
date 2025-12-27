import {
  FilesetResolver,
  PoseLandmarker,
  PoseLandmarkerResult,
} from '@mediapipe/tasks-vision'

let poseLandmarker: PoseLandmarker | null = null
let isInitializing = false

export async function initializePoseDetector(): Promise<PoseLandmarker> {
  if (poseLandmarker) {
    return poseLandmarker
  }

  if (isInitializing) {
    // Wait for existing initialization
    while (isInitializing) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    if (poseLandmarker) return poseLandmarker
  }

  isInitializing = true

  try {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    )

    poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numPoses: 1,
      minPoseDetectionConfidence: 0.5,
      minPosePresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
      outputSegmentationMasks: false,
    })

    return poseLandmarker
  } finally {
    isInitializing = false
  }
}

export function detectPose(
  video: HTMLVideoElement,
  timestamp: number
): PoseLandmarkerResult | null {
  if (!poseLandmarker) return null

  try {
    return poseLandmarker.detectForVideo(video, timestamp)
  } catch {
    return null
  }
}

export function closePoseDetector(): void {
  if (poseLandmarker) {
    poseLandmarker.close()
    poseLandmarker = null
  }
}

// Body connection pairs for drawing the skeleton
export const POSE_CONNECTIONS = [
  // Torso
  [11, 12], // shoulders
  [11, 23], // left shoulder to left hip
  [12, 24], // right shoulder to right hip
  [23, 24], // hips
  // Left arm
  [11, 13], // left shoulder to left elbow
  [13, 15], // left elbow to left wrist
  // Right arm
  [12, 14], // right shoulder to right elbow
  [14, 16], // right elbow to right wrist
  // Left leg
  [23, 25], // left hip to left knee
  [25, 27], // left knee to left ankle
  // Right leg
  [24, 26], // right hip to right knee
  [26, 28], // right knee to right ankle
] as const

// Key landmark indices
export const LANDMARK_INDICES = {
  NOSE: 0,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
} as const
