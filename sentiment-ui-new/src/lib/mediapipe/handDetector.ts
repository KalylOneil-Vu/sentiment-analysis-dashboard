/**
 * Hand Detector using MediaPipe HandLandmarker
 * Detects hand landmarks (21 points per hand) for up to 2 hands
 */

import {
  FilesetResolver,
  HandLandmarker,
  HandLandmarkerResult,
} from '@mediapipe/tasks-vision'

let handLandmarker: HandLandmarker | null = null
let isInitializing = false

export async function initializeHandDetector(): Promise<HandLandmarker> {
  if (handLandmarker) {
    return handLandmarker
  }

  if (isInitializing) {
    while (isInitializing) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    if (handLandmarker) return handLandmarker
  }

  isInitializing = true

  try {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    )

    handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numHands: 2,
      minHandDetectionConfidence: 0.5,
      minHandPresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
    })

    return handLandmarker
  } finally {
    isInitializing = false
  }
}

export function detectHands(
  video: HTMLVideoElement,
  timestamp: number
): HandLandmarkerResult | null {
  if (!handLandmarker) return null

  try {
    return handLandmarker.detectForVideo(video, timestamp)
  } catch {
    return null
  }
}

export function closeHandDetector(): void {
  if (handLandmarker) {
    handLandmarker.close()
    handLandmarker = null
  }
}

// Hand landmark indices (21 points per hand)
export const HAND_LANDMARKS = {
  WRIST: 0,
  THUMB_CMC: 1,
  THUMB_MCP: 2,
  THUMB_IP: 3,
  THUMB_TIP: 4,
  INDEX_FINGER_MCP: 5,
  INDEX_FINGER_PIP: 6,
  INDEX_FINGER_DIP: 7,
  INDEX_FINGER_TIP: 8,
  MIDDLE_FINGER_MCP: 9,
  MIDDLE_FINGER_PIP: 10,
  MIDDLE_FINGER_DIP: 11,
  MIDDLE_FINGER_TIP: 12,
  RING_FINGER_MCP: 13,
  RING_FINGER_PIP: 14,
  RING_FINGER_DIP: 15,
  RING_FINGER_TIP: 16,
  PINKY_MCP: 17,
  PINKY_PIP: 18,
  PINKY_DIP: 19,
  PINKY_TIP: 20,
}

// Hand connections for skeleton drawing
export const HAND_CONNECTIONS: [number, number][] = [
  // Thumb
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  // Index finger
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  // Middle finger
  [0, 9],
  [9, 10],
  [10, 11],
  [11, 12],
  // Ring finger
  [0, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  // Pinky
  [0, 17],
  [17, 18],
  [18, 19],
  [19, 20],
  // Palm connections
  [5, 9],
  [9, 13],
  [13, 17],
]

// Fingertip indices for gesture detection
export const FINGERTIP_INDICES = [4, 8, 12, 16, 20]

// Finger MCP (base) indices
export const FINGER_MCP_INDICES = [1, 5, 9, 13, 17]
