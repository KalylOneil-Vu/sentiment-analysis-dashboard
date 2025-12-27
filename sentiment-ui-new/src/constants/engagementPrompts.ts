/**
 * Custom FastVLM prompts optimized for engagement and sentiment analysis
 */

export const ENGAGEMENT_PROMPTS = {
  // Primary engagement detection prompt - OPTIMIZED for keyword extraction
  PRIMARY: "Describe in 25 words: Is person EXCITED/ENGAGED/HAPPY/SMILING OR bored/distracted/neutral? Specific emotion? Open or closed body language? Leaning forward or back? Eye contact?",

  // Alternative prompts for different aspects
  ATTENTION: "In 15 words: Attention level? Focused or distracted?",
  EMOTION: "In 20 words: Specific emotion visible? Excited, happy, engaged, enthusiastic OR bored, neutral, confused?",
  POSTURE: "In 15 words: Posture open/closed? Leaning forward/back? Arms crossed?",
  INTERACTION: "In 15 words: How many people? Interacting or passive?",
  PARTICIPATION: "In 15 words: Active participant or passive listener?",
  DISTRACTIONS: "In 15 words: Signs of distraction? Looking away, phone, bored?",

  // Suggested prompts for rotation
  SUGGESTIONS: [
    "In 25 words: Is person excited, happy, engaged, smiling OR bored, neutral, disengaged? Body language open or closed?",
    "In 25 words: Specific emotion? Enthusiastic, animated, expressive OR calm, neutral, passive? Posture?",
    "In 25 words: Engagement level? Attentive, focused, interested OR distracted, bored, withdrawn? Facial expression?",
  ],
} as const;

/**
 * Keywords to extract from FastVLM responses for engagement scoring
 */
export const ENGAGEMENT_KEYWORDS = {
  // Positive engagement indicators - EXPANDED
  POSITIVE: [
    'engaged', 'attentive', 'focused', 'interested', 'participative',
    'active', 'alert', 'concentrated', 'involved', 'enthusiastic',
    'smiling', 'happy', 'excited', 'nodding', 'leaning forward',
    'eye contact', 'looking at', 'watching', 'listening',
    'energetic', 'animated', 'vibrant', 'lively', 'eager',
    'curious', 'responsive', 'expressive', 'bright', 'cheerful',
    'positive', 'upbeat', 'motivated', 'open', 'receptive'
  ],

  // Neutral indicators
  NEUTRAL: [
    'neutral', 'calm', 'relaxed', 'composed', 'steady',
    'sitting', 'present', 'quiet', 'still'
  ],

  // Negative engagement indicators
  NEGATIVE: [
    'distracted', 'bored', 'disengaged', 'uninterested', 'withdrawn',
    'passive', 'tired', 'fatigued', 'sleepy', 'drowsy',
    'looking away', 'looking down', 'checking phone', 'yawning',
    'slouching', 'leaning back', 'arms crossed', 'frowning',
    'unhappy', 'sad', 'frustrated', 'confused', 'worried'
  ],

  // Body language cues
  BODY_LANGUAGE: {
    OPEN: ['leaning forward', 'open posture', 'relaxed shoulders', 'uncrossed arms', 'upright'],
    CLOSED: ['arms crossed', 'leaning back', 'slouching', 'turned away', 'hunched'],
    ACTIVE: ['gesturing', 'hand raised', 'nodding', 'moving', 'pointing'],
  },

  // Emotional states - EXPANDED
  EMOTIONS: {
    POSITIVE: [
      'happy', 'smiling', 'pleased', 'content', 'excited', 'surprised', 'delighted',
      'joyful', 'enthusiastic', 'cheerful', 'bright', 'positive', 'upbeat',
      'animated', 'expressive', 'energetic', 'lively'
    ],
    NEGATIVE: ['sad', 'frustrated', 'angry', 'confused', 'worried', 'concerned', 'upset'],
    NEUTRAL: ['neutral', 'calm', 'composed', 'expressionless', 'blank'],
  },
} as const;

export interface ExtractedKeywords {
  positive: string[];
  neutral: string[];
  negative: string[];
  bodyLanguage: string[];
  emotions: string[];
}

/**
 * Parse FastVLM response and extract engagement keywords
 * Handles negations like "not happy", "doesn't show excitement"
 */
export function extractKeywords(vlmResponse: string): ExtractedKeywords {
  const lowerResponse = vlmResponse.toLowerCase();

  // Negation words that flip meaning
  const negationWords = ['not', 'no', 'never', 'neither', 'none', 'nobody', 'nothing',
                         'nowhere', 'hardly', 'barely', 'scarcely', "doesn't", "don't",
                         "isn't", "aren't", "wasn't", "weren't", "won't", "wouldn't"];

  const positive: string[] = [];
  const neutral: string[] = [];
  const negative: string[] = [];
  const bodyLanguage: string[] = [];
  const emotions: string[] = [];

  // Helper to check if keyword is negated
  const isNegated = (keyword: string, text: string): boolean => {
    const keywordIndex = text.indexOf(keyword);
    if (keywordIndex === -1) return false;

    // Look for negation in 30 characters before the keyword
    const beforeText = text.substring(Math.max(0, keywordIndex - 30), keywordIndex);
    return negationWords.some(neg => beforeText.includes(neg));
  };

  // Extract positive keywords (if negated, move to negative)
  ENGAGEMENT_KEYWORDS.POSITIVE.forEach(keyword => {
    if (lowerResponse.includes(keyword)) {
      if (isNegated(keyword, lowerResponse)) {
        negative.push(`not ${keyword}`);
      } else {
        positive.push(keyword);
      }
    }
  });

  // Extract neutral keywords
  ENGAGEMENT_KEYWORDS.NEUTRAL.forEach(keyword => {
    if (lowerResponse.includes(keyword)) {
      neutral.push(keyword);
    }
  });

  // Extract negative keywords
  ENGAGEMENT_KEYWORDS.NEGATIVE.forEach(keyword => {
    if (lowerResponse.includes(keyword)) {
      negative.push(keyword);
    }
  });

  // Extract body language
  [
    ...ENGAGEMENT_KEYWORDS.BODY_LANGUAGE.OPEN,
    ...ENGAGEMENT_KEYWORDS.BODY_LANGUAGE.CLOSED,
    ...ENGAGEMENT_KEYWORDS.BODY_LANGUAGE.ACTIVE,
  ].forEach(keyword => {
    if (lowerResponse.includes(keyword)) {
      bodyLanguage.push(keyword);
    }
  });

  // Extract emotions
  [
    ...ENGAGEMENT_KEYWORDS.EMOTIONS.POSITIVE,
    ...ENGAGEMENT_KEYWORDS.EMOTIONS.NEGATIVE,
    ...ENGAGEMENT_KEYWORDS.EMOTIONS.NEUTRAL,
  ].forEach(keyword => {
    if (lowerResponse.includes(keyword)) {
      emotions.push(keyword);
    }
  });

  return {
    positive,
    neutral,
    negative,
    bodyLanguage,
    emotions,
  };
}

/**
 * Calculate engagement score from extracted keywords
 * Returns a score between 0 and 1
 */
export function calculateEngagementFromKeywords(keywords: ExtractedKeywords): number {
  let score = 0.5; // Start neutral

  // Positive keywords boost score MORE (match backend)
  score += Math.min(0.4, keywords.positive.length * 0.08);

  // Negative keywords reduce score
  score -= Math.min(0.4, keywords.negative.length * 0.08);

  // Body language adjustments (stronger impact)
  const openBodyLang = ENGAGEMENT_KEYWORDS.BODY_LANGUAGE.OPEN as readonly string[];
  const closedBodyLang = ENGAGEMENT_KEYWORDS.BODY_LANGUAGE.CLOSED as readonly string[];
  const activeBodyLang = ENGAGEMENT_KEYWORDS.BODY_LANGUAGE.ACTIVE as readonly string[];

  if (keywords.bodyLanguage.some(kw => openBodyLang.includes(kw))) {
    score += 0.15;
  }
  if (keywords.bodyLanguage.some(kw => closedBodyLang.includes(kw))) {
    score -= 0.15;
  }
  if (keywords.bodyLanguage.some(kw => activeBodyLang.includes(kw))) {
    score += 0.15;
  }

  // Emotion adjustments (stronger impact + count multiple emotions)
  const positiveEmotions = ENGAGEMENT_KEYWORDS.EMOTIONS.POSITIVE as readonly string[];
  const negativeEmotions = ENGAGEMENT_KEYWORDS.EMOTIONS.NEGATIVE as readonly string[];

  const positiveEmotionCount = keywords.emotions.filter(em =>
    positiveEmotions.includes(em)
  ).length;
  const negativeEmotionCount = keywords.emotions.filter(em =>
    negativeEmotions.includes(em)
  ).length;

  if (positiveEmotionCount > 0) {
    score += Math.min(0.25, positiveEmotionCount * 0.08);
  }
  if (negativeEmotionCount > 0) {
    score -= 0.15;
  }

  // Neutral keywords small positive effect
  score += Math.min(0.05, keywords.neutral.length * 0.02);

  // Clamp to [0, 1]
  return Math.max(0, Math.min(1, score));
}
