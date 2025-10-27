/**
 * Engagement analysis prompts and keyword extraction utilities for FastVLM
 */

export interface EngagementKeyword {
  keyword: string;
  score: number;
  category: 'high' | 'medium' | 'low';
}

/**
 * Custom prompt for FastVLM to analyze engagement indicators
 */
export const ENGAGEMENT_ANALYSIS_PROMPT = `Describe the person's engagement level and body language. Focus on:
- Eye contact and gaze direction
- Facial expressions and emotions
- Body posture (leaning forward/back, slouching, upright)
- Hand gestures and movements
- Overall attentiveness and focus
- Any signs of distraction (phone, looking away, yawning)
Keep your response concise and specific.`;

/**
 * Engagement keywords with their associated scores
 */
export const ENGAGEMENT_KEYWORDS: Record<string, number> = {
  // High engagement - Positive indicators (0.8-1.0)
  'engaged': 0.95,
  'attentive': 0.90,
  'focused': 0.90,
  'interested': 0.88,
  'enthusiastic': 0.92,
  'excited': 0.90,
  'animated': 0.88,
  'active': 0.85,
  'participating': 0.90,
  'contributing': 0.88,

  // Positive body language (0.7-0.9)
  'leaning forward': 0.85,
  'forward lean': 0.85,
  'eye contact': 0.88,
  'making eye contact': 0.88,
  'direct eye contact': 0.90,
  'nodding': 0.82,
  'smiling': 0.85,
  'gesturing': 0.80,
  'hand raised': 0.90,
  'hands up': 0.85,

  // Positive emotions (0.7-0.9)
  'happy': 0.85,
  'joyful': 0.88,
  'pleased': 0.82,
  'content': 0.75,
  'satisfied': 0.80,
  'delighted': 0.88,
  'cheerful': 0.85,

  // Medium engagement (0.4-0.7)
  'listening': 0.65,
  'watching': 0.60,
  'observing': 0.62,
  'calm': 0.55,
  'relaxed': 0.58,
  'seated': 0.50,
  'sitting': 0.50,
  'present': 0.60,
  'neutral': 0.50,

  // Low engagement - Negative indicators (0.1-0.4)
  'distracted': 0.25,
  'disengaged': 0.15,
  'bored': 0.20,
  'tired': 0.30,
  'yawning': 0.15,
  'slouching': 0.35,
  'looking away': 0.30,
  'avoiding eye contact': 0.25,
  'phone': 0.20,
  'checking phone': 0.15,
  'texting': 0.15,
  'sleeping': 0.10,
  'drowsy': 0.20,
  'uninterested': 0.20,
  'withdrawn': 0.25,
  'leaning back': 0.40,
  'arms crossed': 0.35,
  'frowning': 0.30,
  'confused': 0.40,
  'frustrated': 0.35,
};

/**
 * Extract engagement keywords from FastVLM text output
 */
export function extractKeywords(text: string): EngagementKeyword[] {
  if (!text) return [];

  const textLower = text.toLowerCase();
  const found: EngagementKeyword[] = [];
  const usedPositions = new Set<number>();

  // Sort keywords by length (longest first) to match multi-word phrases first
  const sortedKeywords = Object.entries(ENGAGEMENT_KEYWORDS).sort(
    ([a], [b]) => b.length - a.length
  );

  for (const [keyword, score] of sortedKeywords) {
    const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    let match;

    while ((match = regex.exec(text)) !== null) {
      const start = match.index;
      const end = start + match[0].length;

      // Check if this position overlaps with an already matched keyword
      let overlaps = false;
      for (let i = start; i < end; i++) {
        if (usedPositions.has(i)) {
          overlaps = true;
          break;
        }
      }

      if (!overlaps) {
        const category: 'high' | 'medium' | 'low' =
          score >= 0.75 ? 'high' : score >= 0.4 ? 'medium' : 'low';

        found.push({
          keyword,
          score,
          category,
        });

        // Mark positions as used
        for (let i = start; i < end; i++) {
          usedPositions.add(i);
        }
      }
    }
  }

  return found;
}

/**
 * Compute overall engagement score from extracted keywords
 */
export function computeKeywordScore(keywords: EngagementKeyword[]): number {
  if (keywords.length === 0) return 0.5; // Neutral score if no keywords

  // Calculate weighted average of keyword scores
  const totalScore = keywords.reduce((sum, k) => sum + k.score, 0);
  const avgScore = totalScore / keywords.length;

  // Apply diminishing returns for too many keywords
  const keywordCountFactor = Math.min(1.0, keywords.length / 5);

  // Combine average score with count factor
  const finalScore = avgScore * (0.7 + 0.3 * keywordCountFactor);

  return Math.max(0.0, Math.min(1.0, finalScore));
}

/**
 * Categorize overall score into engagement level
 */
export function categorizeEngagement(score: number): 'high' | 'medium' | 'low' {
  if (score >= 0.75) return 'high';
  if (score >= 0.5) return 'medium';
  return 'low';
}

/**
 * Get color for engagement level
 */
export function getEngagementColor(level: 'high' | 'medium' | 'low'): string {
  switch (level) {
    case 'high':
      return '#22c55e'; // green-500
    case 'medium':
      return '#eab308'; // yellow-500
    case 'low':
      return '#ef4444'; // red-500
  }
}

/**
 * Get color for keyword category
 */
export function getKeywordColor(category: 'high' | 'medium' | 'low'): string {
  return getEngagementColor(category);
}
