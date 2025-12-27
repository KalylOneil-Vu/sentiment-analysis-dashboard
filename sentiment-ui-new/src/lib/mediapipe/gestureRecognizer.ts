/**
 * Gesture Recognizer using MediaPipe GestureRecognizer
 * Recognizes hand gestures like thumbs up, victory, pointing, etc.
 */

import {
  FilesetResolver,
  GestureRecognizer,
  GestureRecognizerResult,
} from '@mediapipe/tasks-vision'

let gestureRecognizer: GestureRecognizer | null = null
let isInitializing = false

export async function initializeGestureRecognizer(): Promise<GestureRecognizer> {
  if (gestureRecognizer) {
    return gestureRecognizer
  }

  if (isInitializing) {
    while (isInitializing) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    if (gestureRecognizer) return gestureRecognizer
  }

  isInitializing = true

  try {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    )

    gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task',
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numHands: 2,
      minHandDetectionConfidence: 0.5,
      minHandPresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
    })

    return gestureRecognizer
  } finally {
    isInitializing = false
  }
}

export function recognizeGestures(
  video: HTMLVideoElement,
  timestamp: number
): GestureRecognizerResult | null {
  if (!gestureRecognizer) return null

  try {
    return gestureRecognizer.recognizeForVideo(video, timestamp)
  } catch {
    return null
  }
}

export function closeGestureRecognizer(): void {
  if (gestureRecognizer) {
    gestureRecognizer.close()
    gestureRecognizer = null
  }
}

// Gesture categories recognized by the default model
export const GESTURE_CATEGORIES = {
  NONE: 'None',
  CLOSED_FIST: 'Closed_Fist',
  OPEN_PALM: 'Open_Palm',
  POINTING_UP: 'Pointing_Up',
  THUMB_DOWN: 'Thumb_Down',
  THUMB_UP: 'Thumb_Up',
  VICTORY: 'Victory',
  I_LOVE_YOU: 'ILoveYou',
} as const

export type GestureCategory = (typeof GESTURE_CATEGORIES)[keyof typeof GESTURE_CATEGORIES]

// Human-readable gesture labels
export const GESTURE_LABELS: Record<GestureCategory, string> = {
  None: 'No Gesture',
  Closed_Fist: 'Fist',
  Open_Palm: 'Open Palm',
  Pointing_Up: 'Pointing Up',
  Thumb_Down: 'Thumbs Down',
  Thumb_Up: 'Thumbs Up',
  Victory: 'Victory',
  ILoveYou: 'I Love You',
}

// Gesture emoji for display
export const GESTURE_EMOJI: Record<GestureCategory, string> = {
  None: '',
  Closed_Fist: '✊',
  Open_Palm: '🖐️',
  Pointing_Up: '☝️',
  Thumb_Down: '👎',
  Thumb_Up: '👍',
  Victory: '✌️',
  ILoveYou: '🤟',
}
