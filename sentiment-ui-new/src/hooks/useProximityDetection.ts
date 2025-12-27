import { useMemo } from 'react'
import { NormalizedLandmark } from '@mediapipe/tasks-vision'
import { LANDMARK_INDICES } from '../lib/mediapipe/poseDetector'

interface ProximityResult {
  level: number        // 0-1, 0 = far, 1 = very close
  isPresent: boolean   // Is user detected at all
  bodyArea: number     // Normalized body bounding box area
  centerX: number      // Normalized center X position
  centerY: number      // Normalized center Y position
}

export function useProximityDetection(
  poseLandmarks: NormalizedLandmark[] | null,
  faceLandmarks: NormalizedLandmark[] | null
): ProximityResult {
  return useMemo(() => {
    // Default values when no detection
    const defaultResult: ProximityResult = {
      level: 0,
      isPresent: false,
      bodyArea: 0,
      centerX: 0.5,
      centerY: 0.5,
    }

    // Check if we have any landmarks at all
    const hasPose = poseLandmarks && poseLandmarks.length > 0
    const hasFace = faceLandmarks && faceLandmarks.length > 0

    if (!hasPose && !hasFace) {
      return defaultResult
    }

    let level = 0
    let centerX = 0.5
    let centerY = 0.5
    let bodyArea = 0

    // Calculate from pose landmarks (more reliable for proximity)
    if (hasPose) {
      const keyPoints = [
        LANDMARK_INDICES.LEFT_SHOULDER,
        LANDMARK_INDICES.RIGHT_SHOULDER,
        LANDMARK_INDICES.LEFT_HIP,
        LANDMARK_INDICES.RIGHT_HIP,
      ]

      const relevantLandmarks = keyPoints
        .map(i => poseLandmarks[i])
        .filter(lm => lm && (lm.visibility ?? 1) > 0.5)

      if (relevantLandmarks.length >= 2) {
        const xs = relevantLandmarks.map(lm => lm.x)
        const ys = relevantLandmarks.map(lm => lm.y)

        const minX = Math.min(...xs)
        const maxX = Math.max(...xs)
        const minY = Math.min(...ys)
        const maxY = Math.max(...ys)

        const width = maxX - minX
        const height = maxY - minY
        bodyArea = width * height

        // Calculate center
        centerX = (minX + maxX) / 2
        centerY = (minY + maxY) / 2

        // Normalize area to 0-1 proximity level
        // Typical ranges: far (~0.01-0.03), medium (~0.05-0.1), close (~0.15+)
        level = Math.min(bodyArea / 0.2, 1)
      }
    }

    // Supplement with face data if available
    if (hasFace && faceLandmarks.length > 10) {
      const faceXs = faceLandmarks.slice(0, 50).map(lm => lm.x)
      const faceYs = faceLandmarks.slice(0, 50).map(lm => lm.y)

      const faceMinX = Math.min(...faceXs)
      const faceMaxX = Math.max(...faceXs)
      const faceMinY = Math.min(...faceYs)
      const faceMaxY = Math.max(...faceYs)

      const faceWidth = faceMaxX - faceMinX
      const faceHeight = faceMaxY - faceMinY
      const faceArea = faceWidth * faceHeight

      // Face area can indicate closeness too
      const faceProximity = Math.min(faceArea / 0.08, 1)

      // Blend with pose proximity if available
      if (level > 0) {
        level = level * 0.7 + faceProximity * 0.3
      } else {
        level = faceProximity
        centerX = (faceMinX + faceMaxX) / 2
        centerY = (faceMinY + faceMaxY) / 2
      }
    }

    return {
      level: Math.min(1, Math.max(0, level)),
      isPresent: true,
      bodyArea,
      centerX,
      centerY,
    }
  }, [poseLandmarks, faceLandmarks])
}
