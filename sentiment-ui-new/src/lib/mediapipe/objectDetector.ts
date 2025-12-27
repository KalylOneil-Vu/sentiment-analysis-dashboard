/**
 * Object Detector using MediaPipe ObjectDetector
 * Detects common objects (COCO dataset classes) with bounding boxes
 */

import {
  FilesetResolver,
  ObjectDetector,
  ObjectDetectorResult,
} from '@mediapipe/tasks-vision'

let objectDetector: ObjectDetector | null = null
let isInitializing = false

export async function initializeObjectDetector(): Promise<ObjectDetector> {
  if (objectDetector) {
    return objectDetector
  }

  if (isInitializing) {
    while (isInitializing) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    if (objectDetector) return objectDetector
  }

  isInitializing = true

  try {
    console.log('[ObjectDetector] Initializing...')
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    )

    // Using SSD MobileNetV2 - faster and better real-time performance than EfficientDet
    objectDetector = await ObjectDetector.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/object_detector/ssd_mobilenet_v2/float16/latest/ssd_mobilenet_v2.tflite',
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      maxResults: 10,
      scoreThreshold: 0.4,
    })

    console.log('[ObjectDetector] Ready')
    return objectDetector
  } catch (err) {
    console.error('[ObjectDetector] Initialization failed:', err)
    throw err
  } finally {
    isInitializing = false
  }
}

export function detectObjects(
  video: HTMLVideoElement,
  timestamp: number
): ObjectDetectorResult | null {
  if (!objectDetector) return null

  try {
    return objectDetector.detectForVideo(video, timestamp)
  } catch {
    return null
  }
}

export function closeObjectDetector(): void {
  if (objectDetector) {
    objectDetector.close()
    objectDetector = null
  }
}

// COCO dataset class labels (80 classes)
// The EfficientDet-Lite0 model is trained on COCO
export const COCO_CLASSES = [
  'person',
  'bicycle',
  'car',
  'motorcycle',
  'airplane',
  'bus',
  'train',
  'truck',
  'boat',
  'traffic light',
  'fire hydrant',
  'stop sign',
  'parking meter',
  'bench',
  'bird',
  'cat',
  'dog',
  'horse',
  'sheep',
  'cow',
  'elephant',
  'bear',
  'zebra',
  'giraffe',
  'backpack',
  'umbrella',
  'handbag',
  'tie',
  'suitcase',
  'frisbee',
  'skis',
  'snowboard',
  'sports ball',
  'kite',
  'baseball bat',
  'baseball glove',
  'skateboard',
  'surfboard',
  'tennis racket',
  'bottle',
  'wine glass',
  'cup',
  'fork',
  'knife',
  'spoon',
  'bowl',
  'banana',
  'apple',
  'sandwich',
  'orange',
  'broccoli',
  'carrot',
  'hot dog',
  'pizza',
  'donut',
  'cake',
  'chair',
  'couch',
  'potted plant',
  'bed',
  'dining table',
  'toilet',
  'tv',
  'laptop',
  'mouse',
  'remote',
  'keyboard',
  'cell phone',
  'microwave',
  'oven',
  'toaster',
  'sink',
  'refrigerator',
  'book',
  'clock',
  'vase',
  'scissors',
  'teddy bear',
  'hair drier',
  'toothbrush',
] as const

export type COCOClass = (typeof COCO_CLASSES)[number]

// Colors for common objects (hex values)
export const OBJECT_COLORS: Record<string, string> = {
  person: '#22c55e', // Green
  bicycle: '#f59e0b', // Amber
  car: '#3b82f6', // Blue
  motorcycle: '#8b5cf6', // Purple
  cell_phone: '#ec4899', // Pink
  laptop: '#a855f7', // Purple
  keyboard: '#6366f1', // Indigo
  mouse: '#14b8a6', // Teal
  cup: '#06b6d4', // Cyan
  bottle: '#0ea5e9', // Sky
  chair: '#64748b', // Slate
  book: '#f97316', // Orange
  clock: '#eab308', // Yellow
  tv: '#84cc16', // Lime
  remote: '#10b981', // Emerald
  default: '#6b7280', // Gray
}

export function getObjectColor(className: string): string {
  // Normalize class name (replace spaces with underscores)
  const normalized = className.toLowerCase().replace(/\s+/g, '_')
  return OBJECT_COLORS[normalized] || OBJECT_COLORS.default
}
