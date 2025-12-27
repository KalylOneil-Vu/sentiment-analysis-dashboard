import {
  FilesetResolver,
  FaceLandmarker,
  FaceLandmarkerResult,
} from '@mediapipe/tasks-vision'

let faceLandmarker: FaceLandmarker | null = null
let isInitializing = false

export async function initializeFaceDetector(): Promise<FaceLandmarker> {
  if (faceLandmarker) {
    return faceLandmarker
  }

  if (isInitializing) {
    while (isInitializing) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    if (faceLandmarker) return faceLandmarker
  }

  isInitializing = true

  try {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    )

    faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numFaces: 1,
      minFaceDetectionConfidence: 0.5,
      minFacePresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
      outputFaceBlendshapes: false,
      outputFacialTransformationMatrixes: false,
    })

    return faceLandmarker
  } finally {
    isInitializing = false
  }
}

export function detectFace(
  video: HTMLVideoElement,
  timestamp: number
): FaceLandmarkerResult | null {
  if (!faceLandmarker) return null

  try {
    return faceLandmarker.detectForVideo(video, timestamp)
  } catch {
    return null
  }
}

export function closeFaceDetector(): void {
  if (faceLandmarker) {
    faceLandmarker.close()
    faceLandmarker = null
  }
}

// Face contour indices for outline (subset of 468 landmarks)
// These indices trace the face silhouette
export const FACE_OVAL_INDICES = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
  397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136,
  172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109
]

// Eyebrow indices
export const LEFT_EYEBROW_INDICES = [276, 283, 282, 295, 285]
export const RIGHT_EYEBROW_INDICES = [46, 53, 52, 65, 55]

// Eye outline indices
export const LEFT_EYE_INDICES = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398]
export const RIGHT_EYE_INDICES = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246]

// Lips outline indices
export const LIPS_OUTER_INDICES = [
  61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95
]

// Nose outline
export const NOSE_INDICES = [1, 2, 98, 327, 4, 5, 195, 197]

// Ear indices (approximate positions on face mesh)
export const LEFT_EAR_INDEX = 234
export const RIGHT_EAR_INDEX = 454
