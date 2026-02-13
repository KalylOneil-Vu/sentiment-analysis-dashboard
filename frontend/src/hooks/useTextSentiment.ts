/**
 * Text Sentiment Hook
 * Analyzes text sentiment using keyword matching
 * Reuses keywords from engagementPrompts for consistency
 */

import { useMemo } from 'react'
import type { SentimentType, TextSentiment } from '../types/visionHUD'

// Positive sentiment keywords
const POSITIVE_KEYWORDS = [
  'happy',
  'great',
  'excellent',
  'wonderful',
  'amazing',
  'good',
  'love',
  'like',
  'awesome',
  'fantastic',
  'brilliant',
  'perfect',
  'beautiful',
  'nice',
  'best',
  'excited',
  'glad',
  'pleased',
  'delighted',
  'thankful',
  'grateful',
  'joy',
  'fun',
  'enjoy',
  'appreciate',
  'positive',
  'success',
  'win',
  'yes',
  'agree',
  'absolutely',
  'definitely',
  'certainly',
  'sure',
  'right',
  'correct',
  'true',
  'helpful',
  'useful',
  'interesting',
  'cool',
  'impressive',
]

// Negative sentiment keywords
const NEGATIVE_KEYWORDS = [
  'bad',
  'terrible',
  'awful',
  'horrible',
  'hate',
  'dislike',
  'angry',
  'mad',
  'upset',
  'sad',
  'unhappy',
  'disappointed',
  'frustrated',
  'annoyed',
  'irritated',
  'worried',
  'anxious',
  'scared',
  'afraid',
  'fear',
  'stress',
  'stressed',
  'tired',
  'exhausted',
  'boring',
  'bored',
  'confusing',
  'confused',
  'difficult',
  'hard',
  'wrong',
  'incorrect',
  'no',
  'not',
  'never',
  'can\'t',
  'cannot',
  'won\'t',
  'wouldn\'t',
  'shouldn\'t',
  'problem',
  'issue',
  'trouble',
  'fail',
  'failed',
  'failure',
  'error',
  'mistake',
  'unfortunately',
  'sorry',
]

// Negation words that flip sentiment
const NEGATION_WORDS = [
  'not',
  'no',
  'never',
  'neither',
  'nobody',
  'nothing',
  'nowhere',
  'don\'t',
  'doesn\'t',
  'didn\'t',
  'won\'t',
  'wouldn\'t',
  'couldn\'t',
  'shouldn\'t',
  'can\'t',
  'cannot',
  'isn\'t',
  'aren\'t',
  'wasn\'t',
  'weren\'t',
  'hardly',
  'barely',
  'scarcely',
]

/**
 * Analyze text sentiment
 */
export function analyzeTextSentiment(text: string): TextSentiment {
  if (!text || text.trim().length === 0) {
    return {
      sentiment: 'neutral',
      confidence: 0,
      keywords: [],
    }
  }

  const normalizedText = text.toLowerCase()
  const words = normalizedText.split(/\s+/)

  let positiveCount = 0
  let negativeCount = 0
  const foundKeywords: string[] = []

  // Check for negation context
  const hasNegation = (index: number, wordList: string[]): boolean => {
    // Check previous 3 words for negation
    const start = Math.max(0, index - 3)
    for (let i = start; i < index; i++) {
      if (NEGATION_WORDS.includes(wordList[i])) {
        return true
      }
    }
    return false
  }

  // Analyze each word
  words.forEach((word, index) => {
    // Clean punctuation
    const cleanWord = word.replace(/[.,!?;:'"()[\]{}]/g, '')

    if (POSITIVE_KEYWORDS.includes(cleanWord)) {
      if (hasNegation(index, words)) {
        // Negated positive = negative
        negativeCount++
      } else {
        positiveCount++
      }
      foundKeywords.push(cleanWord)
    } else if (NEGATIVE_KEYWORDS.includes(cleanWord)) {
      if (hasNegation(index, words)) {
        // Negated negative = less negative (but still count as mildly positive)
        positiveCount += 0.5
      } else {
        negativeCount++
      }
      foundKeywords.push(cleanWord)
    }
  })

  // Calculate sentiment
  const total = positiveCount + negativeCount
  let sentiment: SentimentType = 'neutral'
  let confidence = 0

  if (total > 0) {
    const positiveRatio = positiveCount / total
    const negativeRatio = negativeCount / total

    if (positiveRatio > 0.6) {
      sentiment = 'positive'
      confidence = Math.min(0.95, 0.5 + positiveRatio * 0.5)
    } else if (negativeRatio > 0.6) {
      sentiment = 'negative'
      confidence = Math.min(0.95, 0.5 + negativeRatio * 0.5)
    } else {
      sentiment = 'neutral'
      confidence = 0.5 + Math.abs(positiveRatio - negativeRatio) * 0.3
    }
  } else {
    // No sentiment keywords found
    sentiment = 'neutral'
    confidence = 0.3
  }

  return {
    sentiment,
    confidence,
    keywords: [...new Set(foundKeywords)], // Remove duplicates
  }
}

/**
 * Hook to analyze text sentiment in real-time
 */
export function useTextSentiment(text: string): TextSentiment {
  return useMemo(() => analyzeTextSentiment(text), [text])
}

/**
 * Get sentiment color
 */
export function getSentimentColor(sentiment: SentimentType): string {
  switch (sentiment) {
    case 'positive':
      return '#22c55e' // Green
    case 'negative':
      return '#ef4444' // Red
    default:
      return '#6b7280' // Gray
  }
}

/**
 * Get sentiment emoji
 */
export function getSentimentEmoji(sentiment: SentimentType): string {
  switch (sentiment) {
    case 'positive':
      return '😊'
    case 'negative':
      return '😔'
    default:
      return '😐'
  }
}
