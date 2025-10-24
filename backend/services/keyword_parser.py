"""
Keyword Parser Service

Parses FastVLM text outputs and extracts engagement keywords,
mapping them to numeric scores for the engagement algorithm.
"""
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)


class KeywordParser:
    """Parses FastVLM outputs and extracts engagement indicators."""

    # Positive engagement keywords
    POSITIVE_KEYWORDS = [
        'engaged', 'attentive', 'focused', 'interested', 'participative',
        'active', 'alert', 'concentrated', 'involved', 'enthusiastic',
        'smiling', 'happy', 'excited', 'nodding', 'leaning forward',
        'eye contact', 'looking at', 'watching', 'listening', 'paying attention',
        'energetic', 'animated', 'vibrant', 'lively', 'eager',
        'curious', 'responsive', 'expressive', 'bright', 'cheerful',
        'positive', 'upbeat', 'motivated', 'open', 'receptive'
    ]

    # Neutral keywords
    NEUTRAL_KEYWORDS = [
        'neutral', 'calm', 'relaxed', 'composed', 'steady',
        'sitting', 'present', 'quiet', 'still', 'stable'
    ]

    # Negative engagement keywords
    NEGATIVE_KEYWORDS = [
        'distracted', 'bored', 'disengaged', 'uninterested', 'withdrawn',
        'passive', 'tired', 'fatigued', 'sleepy', 'drowsy',
        'looking away', 'looking down', 'checking phone', 'yawning',
        'slouching', 'leaning back', 'arms crossed', 'frowning', 'confused',
        'unhappy', 'sad', 'frustrated', 'worried'
    ]

    # Negation words that flip meaning
    NEGATION_WORDS = ['not', 'no', 'never', 'neither', 'none', 'nobody', 'nothing',
                      'nowhere', 'hardly', 'barely', 'scarcely', "doesn't", "don't",
                      "isn't", "aren't", "wasn't", "weren't", "won't", "wouldn't", "without"]

    # Body language indicators
    OPEN_POSTURE = ['leaning forward', 'open posture', 'relaxed shoulders', 'uncrossed arms', 'upright']
    CLOSED_POSTURE = ['arms crossed', 'leaning back', 'slouching', 'turned away', 'hunched']
    ACTIVE_GESTURES = ['gesturing', 'hand raised', 'nodding', 'moving', 'pointing']

    # Emotional indicators
    POSITIVE_EMOTIONS = [
        'happy', 'smiling', 'pleased', 'content', 'excited', 'surprised', 'delighted',
        'joyful', 'enthusiastic', 'cheerful', 'bright', 'positive', 'upbeat',
        'animated', 'expressive', 'energetic', 'lively'
    ]
    NEGATIVE_EMOTIONS = ['sad', 'frustrated', 'angry', 'confused', 'worried', 'concerned', 'upset']
    NEUTRAL_EMOTIONS = ['neutral', 'calm', 'composed', 'expressionless', 'blank']

    def __init__(self):
        """Initialize the keyword parser."""
        pass

    def parse(self, vlm_text: str) -> Dict:
        """Parse FastVLM output text and extract keywords.

        Args:
            vlm_text: Text output from FastVLM analysis

        Returns:
            Dictionary with extracted keywords and scores
        """
        if not vlm_text:
            return self._empty_result()

        lower_text = vlm_text.lower()

        # Extract all keyword types (check negation for positive keywords)
        positive = self._extract_matching(lower_text, self.POSITIVE_KEYWORDS, check_negation=True)
        neutral = self._extract_matching(lower_text, self.NEUTRAL_KEYWORDS)
        negative = self._extract_matching(lower_text, self.NEGATIVE_KEYWORDS)

        # Extract body language
        open_posture = self._extract_matching(lower_text, self.OPEN_POSTURE)
        closed_posture = self._extract_matching(lower_text, self.CLOSED_POSTURE)
        active_gestures = self._extract_matching(lower_text, self.ACTIVE_GESTURES)

        # Extract emotions
        positive_emotions = self._extract_matching(lower_text, self.POSITIVE_EMOTIONS)
        negative_emotions = self._extract_matching(lower_text, self.NEGATIVE_EMOTIONS)
        neutral_emotions = self._extract_matching(lower_text, self.NEUTRAL_EMOTIONS)

        # Calculate contextual engagement score
        contextual_score = self._calculate_contextual_score(
            positive, neutral, negative,
            open_posture, closed_posture, active_gestures,
            positive_emotions, negative_emotions
        )

        result = {
            'vlm_text': vlm_text,
            'keywords': {
                'positive': positive,
                'neutral': neutral,
                'negative': negative
            },
            'body_language': {
                'open_posture': open_posture,
                'closed_posture': closed_posture,
                'active_gestures': active_gestures
            },
            'emotions': {
                'positive': positive_emotions,
                'negative': negative_emotions,
                'neutral': neutral_emotions
            },
            'contextual_score': contextual_score,
            'dominant_sentiment': self._determine_dominant_sentiment(positive, neutral, negative)
        }

        logger.debug(f"Parsed FastVLM: score={contextual_score:.2f}, keywords={len(positive)} pos, {len(negative)} neg")

        return result

    def _extract_matching(self, text: str, keywords: List[str], check_negation: bool = False) -> List[str]:
        """Extract keywords that appear in the text.

        Args:
            text: Input text (lowercased)
            keywords: List of keywords to search for
            check_negation: If True, skip keywords that are negated

        Returns:
            List of found keywords
        """
        found = []
        for kw in keywords:
            if kw in text:
                if check_negation and self._is_negated(kw, text):
                    # Skip negated positive keywords
                    continue
                found.append(kw)
        return found

    def _is_negated(self, keyword: str, text: str) -> bool:
        """Check if keyword appears in a negated context.

        Args:
            keyword: The keyword to check
            text: The full text

        Returns:
            True if keyword is negated
        """
        keyword_index = text.find(keyword)
        if keyword_index == -1:
            return False

        # Look for negation in 30 characters before the keyword
        start = max(0, keyword_index - 30)
        before_text = text[start:keyword_index]

        return any(neg in before_text for neg in self.NEGATION_WORDS)

    def _calculate_contextual_score(
        self,
        positive: List[str],
        neutral: List[str],
        negative: List[str],
        open_posture: List[str],
        closed_posture: List[str],
        active_gestures: List[str],
        positive_emotions: List[str],
        negative_emotions: List[str]
    ) -> float:
        """Calculate engagement score from extracted keywords.

        Returns:
            Score between 0 and 1
        """
        score = 0.5  # Start neutral

        # Positive keywords boost score MORE (+0.08 each, max +0.4)
        score += min(0.4, len(positive) * 0.08)

        # Negative keywords reduce score (-0.08 each, max -0.4)
        score -= min(0.4, len(negative) * 0.08)

        # Body language adjustments (stronger impact)
        if open_posture:
            score += 0.15  # Increased from 0.1
        if closed_posture:
            score -= 0.15
        if active_gestures:
            score += 0.15  # Increased from 0.1

        # Emotion adjustments (stronger impact)
        if positive_emotions:
            # More positive emotions = higher boost
            emotion_boost = min(0.25, len(positive_emotions) * 0.08)
            score += emotion_boost
        if negative_emotions:
            score -= 0.15

        # Neutral keywords have small positive effect (shows presence/attention)
        score += min(0.05, len(neutral) * 0.02)

        # Clamp to [0, 1]
        return max(0.0, min(1.0, score))

    @staticmethod
    def _determine_dominant_sentiment(
        positive: List[str],
        neutral: List[str],
        negative: List[str]
    ) -> str:
        """Determine dominant sentiment from keyword counts.

        Returns:
            'positive', 'neutral', or 'negative'
        """
        pos_count = len(positive)
        neu_count = len(neutral)
        neg_count = len(negative)

        if pos_count > neg_count and pos_count > neu_count:
            return 'positive'
        elif neg_count > pos_count and neg_count > neu_count:
            return 'negative'
        else:
            return 'neutral'

    @staticmethod
    def _empty_result() -> Dict:
        """Return empty result when no text provided."""
        return {
            'vlm_text': '',
            'keywords': {
                'positive': [],
                'neutral': [],
                'negative': []
            },
            'body_language': {
                'open_posture': [],
                'closed_posture': [],
                'active_gestures': []
            },
            'emotions': {
                'positive': [],
                'negative': [],
                'neutral': []
            },
            'contextual_score': 0.5,
            'dominant_sentiment': 'neutral'
        }


# Global instance
_parser_instance = None


def get_keyword_parser() -> KeywordParser:
    """Get or create the global keyword parser instance."""
    global _parser_instance
    if _parser_instance is None:
        _parser_instance = KeywordParser()
    return _parser_instance
