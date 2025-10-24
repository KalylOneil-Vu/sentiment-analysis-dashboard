"""
Enhanced Speech Analysis Service using Whisper and VADER

Transcribes speech and analyzes sentiment for engagement tracking.
"""
import numpy as np
from typing import Dict, Optional
import logging
import whisper
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

logger = logging.getLogger(__name__)


class SpeechAnalyzer:
    """Analyzes speech using Whisper for transcription and VADER for sentiment."""

    def __init__(self, model_size: str = "base"):
        """Initialize the speech analyzer.

        Args:
            model_size: Whisper model size ('tiny', 'base', 'small', 'medium', 'large')
        """
        self.model_size = model_size
        self.whisper_model = None
        self.sentiment_analyzer = SentimentIntensityAnalyzer()
        self._is_loaded = False

        # Track recent transcriptions
        self.recent_transcriptions = []
        self.max_recent = 50

    def load(self):
        """Load the Whisper model."""
        if self._is_loaded:
            logger.info("Speech analyzer already loaded")
            return

        try:
            logger.info(f"Loading Whisper model ({self.model_size})...")
            self.whisper_model = whisper.load_model(self.model_size)
            self._is_loaded = True
            logger.info("Speech analyzer loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load Whisper model: {str(e)}")
            raise

    def transcribe_audio(
        self,
        audio_data: np.ndarray,
        sample_rate: int = 16000
    ) -> Optional[Dict]:
        """Transcribe audio to text with sentiment analysis.

        Args:
            audio_data: Audio samples as numpy array (float32, mono, 16kHz)
            sample_rate: Audio sample rate

        Returns:
            Dictionary with transcription, sentiment, and engagement score
        """
        if not self._is_loaded:
            raise RuntimeError("Model not loaded. Call load() first.")

        try:
            # Ensure correct format
            if audio_data.dtype != np.float32:
                audio_data = audio_data.astype(np.float32)

            # Normalize if needed
            if np.abs(audio_data).max() > 1.0:
                audio_data = audio_data / np.abs(audio_data).max()

            # Transcribe with Whisper
            result = self.whisper_model.transcribe(
                audio_data,
                language='en',
                task='transcribe',
                fp16=False
            )

            text = result.get('text', '').strip()

            if not text:
                return None

            # Analyze sentiment with VADER
            sentiment_scores = self.sentiment_analyzer.polarity_scores(text)

            # Calculate engagement from speech
            speech_engagement = self._calculate_speech_engagement(
                text, sentiment_scores
            )

            transcription_result = {
                'text': text,
                'language': result.get('language', 'en'),
                'sentiment_scores': sentiment_scores,
                'sentiment': self._categorize_sentiment(sentiment_scores),
                'sentiment_score': sentiment_scores['compound'],  # -1 to 1
                'engagement_score': speech_engagement,  # 0 to 1
                'word_count': len(text.split()),
                'segments': result.get('segments', [])
            }

            # Store recent transcription
            self.recent_transcriptions.append(transcription_result)
            if len(self.recent_transcriptions) > self.max_recent:
                self.recent_transcriptions.pop(0)

            logger.debug(f"Transcribed: '{text}' (sentiment: {transcription_result['sentiment']})")

            return transcription_result

        except Exception as e:
            logger.error(f"Error transcribing audio: {str(e)}")
            return None

    @staticmethod
    def _calculate_speech_engagement(text: str, sentiment_scores: Dict) -> float:
        """Calculate engagement score from speech content.

        Args:
            text: Transcribed text
            sentiment_scores: VADER sentiment scores

        Returns:
            Engagement score between 0 and 1
        """
        score = 0.5  # Start neutral

        # Speaking itself is engagement (+0.2)
        score += 0.2

        # Positive sentiment increases engagement
        compound = sentiment_scores['compound']
        if compound > 0.05:
            score += compound * 0.2  # Max +0.2 for very positive
        elif compound < -0.05:
            score += abs(compound) * 0.1  # Even negative shows engagement (reaction)

        # Longer responses show more engagement
        word_count = len(text.split())
        if word_count > 10:
            score += 0.1
        elif word_count > 20:
            score += 0.15

        # Keywords indicating engagement
        engagement_keywords = ['agree', 'yes', 'understand', 'great', 'excellent',
                              'interesting', 'question', 'think', 'believe']
        for keyword in engagement_keywords:
            if keyword in text.lower():
                score += 0.05

        return min(1.0, max(0.0, score))

    @staticmethod
    def _categorize_sentiment(sentiment_scores: Dict) -> str:
        """Categorize sentiment as positive, neutral, or negative.

        Args:
            sentiment_scores: VADER sentiment scores

        Returns:
            'positive', 'neutral', or 'negative'
        """
        compound = sentiment_scores.get('compound', 0)

        if compound >= 0.05:
            return 'positive'
        elif compound <= -0.05:
            return 'negative'
        else:
            return 'neutral'

    def get_participation_rate(self, total_participants: int) -> float:
        """Calculate participation rate from recent transcriptions.

        Args:
            total_participants: Total number of people in meeting

        Returns:
            Participation rate between 0 and 1
        """
        if not self.recent_transcriptions or total_participants == 0:
            return 0.0

        # Estimate unique speakers (simple heuristic)
        # In production, would use speaker diarization
        speaking_instances = len(self.recent_transcriptions)
        estimated_speakers = min(speaking_instances, total_participants)

        return estimated_speakers / total_participants

    def reset(self):
        """Clear recent transcriptions."""
        self.recent_transcriptions.clear()
        logger.info("Speech analyzer reset")

    @property
    def is_loaded(self) -> bool:
        """Check if model is loaded."""
        return self._is_loaded


# Global instance
_speech_analyzer_instance = None


def get_speech_analyzer() -> SpeechAnalyzer:
    """Get or create the global speech analyzer instance."""
    global _speech_analyzer_instance
    if _speech_analyzer_instance is None:
        _speech_analyzer_instance = SpeechAnalyzer()
    return _speech_analyzer_instance
