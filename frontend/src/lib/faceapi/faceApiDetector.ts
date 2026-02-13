/**
 * Face API Detector using @vladmandic/face-api
 * Provides face detection with age, gender, and expression analysis
 */

import * as faceapi from '@vladmandic/face-api'
import type { FaceBio, ExpressionProbabilities } from '../../types/visionHUD'

// Model URL - can be served from public folder or CDN
const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1/model'

let isInitialized = false
let isInitializing = false

/**
 * Initialize face-api.js models
 * Loads: TinyFaceDetector, AgeGenderNet, FaceExpressionNet
 */
export async function initializeFaceApi(): Promise<void> {
  if (isInitialized) return

  if (isInitializing) {
    while (isInitializing) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    return
  }

  isInitializing = true

  try {
    // Load models in parallel for faster initialization
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
    ])

    isInitialized = true
    console.log('[FaceAPI] Models loaded successfully')
  } catch (error) {
    console.error('[FaceAPI] Failed to load models:', error)
    throw error
  } finally {
    isInitializing = false
  }
}

/**
 * Check if face-api.js models are loaded
 */
export function isFaceApiReady(): boolean {
  return isInitialized
}

/**
 * Detect face and analyze age, gender, and expressions
 */
export async function detectFaceAttributes(
  input: HTMLVideoElement | HTMLCanvasElement
): Promise<FaceBio | null> {
  if (!isInitialized) {
    console.warn('[FaceAPI] Models not initialized')
    return null
  }

  try {
    const detection = await faceapi
      .detectSingleFace(input, new faceapi.TinyFaceDetectorOptions({
        inputSize: 320,
        scoreThreshold: 0.5,
      }))
      .withAgeAndGender()
      .withFaceExpressions()

    if (!detection) return null

    // Extract expressions as typed object
    const expressionData = detection.expressions as unknown as Record<string, number>
    const expressions: ExpressionProbabilities = {
      neutral: expressionData.neutral || 0,
      happy: expressionData.happy || 0,
      sad: expressionData.sad || 0,
      angry: expressionData.angry || 0,
      fearful: expressionData.fearful || 0,
      disgusted: expressionData.disgusted || 0,
      surprised: expressionData.surprised || 0,
    }

    // Find dominant expression
    const dominantExpression = (Object.entries(expressions) as [keyof ExpressionProbabilities, number][])
      .sort(([, a], [, b]) => b - a)[0][0]

    // Calculate age range (±5 years)
    const age = Math.round(detection.age)
    const ageRange = {
      min: Math.max(0, age - 5),
      max: age + 5,
    }

    // Get bounding box (normalized)
    const box = detection.detection.box
    const inputWidth = input instanceof HTMLVideoElement ? input.videoWidth : input.width
    const inputHeight = input instanceof HTMLVideoElement ? input.videoHeight : input.height

    return {
      age,
      ageRange,
      gender: detection.gender as 'male' | 'female',
      genderConfidence: detection.genderProbability,
      expressions,
      dominantExpression,
      boundingBox: {
        x: box.x / inputWidth,
        y: box.y / inputHeight,
        width: box.width / inputWidth,
        height: box.height / inputHeight,
      },
    }
  } catch (error) {
    console.error('[FaceAPI] Detection error:', error)
    return null
  }
}

/**
 * Detect multiple faces with attributes (for future multi-person support)
 */
export async function detectAllFaceAttributes(
  input: HTMLVideoElement | HTMLCanvasElement
): Promise<FaceBio[]> {
  if (!isInitialized) return []

  try {
    const detections = await faceapi
      .detectAllFaces(input, new faceapi.TinyFaceDetectorOptions({
        inputSize: 320,
        scoreThreshold: 0.5,
      }))
      .withAgeAndGender()
      .withFaceExpressions()

    const inputWidth = input instanceof HTMLVideoElement ? input.videoWidth : input.width
    const inputHeight = input instanceof HTMLVideoElement ? input.videoHeight : input.height

    return detections.map(detection => {
      const expressionData = detection.expressions as unknown as Record<string, number>
      const expressions: ExpressionProbabilities = {
        neutral: expressionData.neutral || 0,
        happy: expressionData.happy || 0,
        sad: expressionData.sad || 0,
        angry: expressionData.angry || 0,
        fearful: expressionData.fearful || 0,
        disgusted: expressionData.disgusted || 0,
        surprised: expressionData.surprised || 0,
      }

      const dominantExpression = (Object.entries(expressions) as [keyof ExpressionProbabilities, number][])
        .sort(([, a], [, b]) => b - a)[0][0]

      const age = Math.round(detection.age)
      const box = detection.detection.box

      return {
        age,
        ageRange: { min: Math.max(0, age - 5), max: age + 5 },
        gender: detection.gender as 'male' | 'female',
        genderConfidence: detection.genderProbability,
        expressions,
        dominantExpression,
        boundingBox: {
          x: box.x / inputWidth,
          y: box.y / inputHeight,
          width: box.width / inputWidth,
          height: box.height / inputHeight,
        },
      }
    })
  } catch (error) {
    console.error('[FaceAPI] Multi-detection error:', error)
    return []
  }
}

/**
 * Get expression label with emoji
 */
export function getExpressionLabel(expression: keyof ExpressionProbabilities): string {
  const labels: Record<keyof ExpressionProbabilities, string> = {
    neutral: 'Neutral 😐',
    happy: 'Happy 😊',
    sad: 'Sad 😢',
    angry: 'Angry 😠',
    fearful: 'Fearful 😨',
    disgusted: 'Disgusted 🤢',
    surprised: 'Surprised 😮',
  }
  return labels[expression]
}

/**
 * Get expression color
 */
export function getExpressionColor(expression: keyof ExpressionProbabilities): string {
  const colors: Record<keyof ExpressionProbabilities, string> = {
    neutral: '#6b7280',
    happy: '#22c55e',
    sad: '#3b82f6',
    angry: '#ef4444',
    fearful: '#f59e0b',
    disgusted: '#84cc16',
    surprised: '#8b5cf6',
  }
  return colors[expression]
}
