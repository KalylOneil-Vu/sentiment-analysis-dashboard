import { useState, useEffect, useCallback, useRef } from 'react'
import { Product, PRODUCTS, getMatchLabel, MatchResult } from '../types/product'
import { EmotionType } from '../types/emotion'

interface UseProductMatchingOptions {
  currentEmotion: EmotionType
  faceDetected: boolean
  autoAdvanceOnLowScore?: boolean
  lowScoreThreshold?: number
  autoAdvanceDelay?: number
}

interface UseProductMatchingReturn {
  products: Product[]
  selectedProduct: Product
  selectedIndex: number
  matchResult: MatchResult
  selectProduct: (index: number) => void
  nextProduct: () => void
  previousProduct: () => void
  isAutoAdvancing: boolean
}

// Emotion modifiers for match score calculation
const EMOTION_MODIFIERS: Record<EmotionType, number> = {
  JOY: 25, // Positive reaction boosts score
  NEUTRAL: 0,
  CONFUSION: -10,
  STRESS: -15,
  ANGER: -20,
}

export function useProductMatching({
  currentEmotion,
  faceDetected,
  autoAdvanceOnLowScore = true,
  lowScoreThreshold = 50,
  autoAdvanceDelay = 2000,
}: UseProductMatchingOptions): UseProductMatchingReturn {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [matchScore, setMatchScore] = useState(0)
  const [isAutoAdvancing, setIsAutoAdvancing] = useState(false)
  const autoAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const selectedProduct = PRODUCTS[selectedIndex]

  // Calculate match score based on product base score and emotion
  useEffect(() => {
    if (!faceDetected) {
      setMatchScore(0)
      return
    }

    const baseScore = selectedProduct.baseMatchScore
    const emotionModifier = EMOTION_MODIFIERS[currentEmotion]
    const randomVariance = (Math.random() - 0.5) * 10 // +/- 5%

    let finalScore = baseScore + emotionModifier + randomVariance
    finalScore = Math.max(0, Math.min(100, finalScore))
    setMatchScore(Math.round(finalScore))
  }, [selectedProduct, currentEmotion, faceDetected])

  const matchResult = getMatchLabel(matchScore)

  // Select specific product
  const selectProduct = useCallback((index: number) => {
    if (index >= 0 && index < PRODUCTS.length) {
      setSelectedIndex(index)
      setIsAutoAdvancing(false)
      // Clear any pending auto-advance
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current)
        autoAdvanceTimerRef.current = null
      }
    }
  }, [])

  // Navigate to next product
  const nextProduct = useCallback(() => {
    setSelectedIndex(prev => (prev + 1) % PRODUCTS.length)
    setIsAutoAdvancing(false)
  }, [])

  // Navigate to previous product
  const previousProduct = useCallback(() => {
    setSelectedIndex(prev => (prev - 1 + PRODUCTS.length) % PRODUCTS.length)
    setIsAutoAdvancing(false)
  }, [])

  // Auto-advance when score is low
  useEffect(() => {
    if (!autoAdvanceOnLowScore || !faceDetected) {
      return
    }

    // Clear existing timer
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current)
      autoAdvanceTimerRef.current = null
    }

    // If score is below threshold, start auto-advance timer
    if (matchScore > 0 && matchScore < lowScoreThreshold) {
      setIsAutoAdvancing(true)
      autoAdvanceTimerRef.current = setTimeout(() => {
        setSelectedIndex(prev => (prev + 1) % PRODUCTS.length)
        setIsAutoAdvancing(false)
      }, autoAdvanceDelay)
    } else {
      setIsAutoAdvancing(false)
    }

    return () => {
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current)
      }
    }
  }, [matchScore, autoAdvanceOnLowScore, lowScoreThreshold, autoAdvanceDelay, faceDetected])

  return {
    products: PRODUCTS,
    selectedProduct,
    selectedIndex,
    matchResult,
    selectProduct,
    nextProduct,
    previousProduct,
    isAutoAdvancing,
  }
}
