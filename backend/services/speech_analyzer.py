"""Speech analysis service using Whisper for transcription and sentiment analysis."""
import numpy as np
from typing import Dict, List, Optional
import logging
import whisper
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

from config import settings

logger = logging.getLogger(__name__)


class SpeechAnalyzer:
    """Analyzes speech using Whisper for transcription and VADER for sentiment."""

    def __init__(self, model_size: str = None):
        """Initialize the speech analyzer.

        Args:
            model_size: Whisper model size ('tiny', 'base', 'small', 'medium', 'large')
        """
        self.model_size = model_size or settings.whisper_model_size
        self.whisper_model = None
        self.sentiment_analyzer = SentimentIntensityAnalyzer()
        self._is_loaded = False

        # Track recent transcriptions for context
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
        """Transcribe audio to text.

        Args:
            audio_data: Audio samples as numpy array (float32, mono, 16kHz)
            sample_rate: Audio sample rate

        Returns:
            Dictionary with transcription and metadata, or None if failed
        """
        if not self._is_loaded:
            raise RuntimeError("Model not loaded. Call load() first.")

        try:
            # Whisper expects float32 audio normalized to [-1, 1]
            if audio_data.dtype != np.float32:
                audio_data = audio_data.astype(np.float32)

            # Normalize if needed
            if np.abs(audio_data).max() > 1.0:
                audio_data = audio_data / np.abs(audio_data).max()

            # Transcribe
            result = self.whisper_model.transcribe(
                audio_data,
                language='en',
                task='transcribe',
                fp16=False
            )

            text = result.get('text', '').strip()

            if not text:
                return None

            # Analyze sentiment
            sentiment_scores = self.sentiment_analyzer.polarity_scores(text)

            transcription_result = {
                'text': text,
                'language': result.get('language', 'en'),
                'sentiment_scores': sentiment_scores,
                'sentiment': self._categorize_sentiment(sentiment_scores),
                'sentiment_score': sentiment_scores['compound'],  # Normalized -1 to 1
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

    def analyze_text_sentiment(self, text: str) -> Dict:
        """Analyze sentiment of text.

        Args:
            text: Input text to analyze

        Returns:
            Dictionary with sentiment analysis results
        """
        try:
            scores = self.sentiment_analyzer.polarity_scores(text)
            return {
                'text': text,
                'sentiment_scores': scores,
                'sentiment': self._categorize_sentiment(scores),
                'sentiment_score': scores['compound']
            }
        except Exception as e:
            logger.error(f"Error analyzing text sentiment: {str(e)}")
            return {
                'text': text,
                'sentiment_scores': {'neg': 0, 'neu': 1, 'pos': 0, 'compound': 0},
                'sentiment': 'neutral',
                'sentiment_score': 0.0
            }

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

    def get_aggregated_sentiment(self, recent_n: int = 10) -> Dict:
        """Get aggregated sentiment from recent transcriptions.

        Args:
            recent_n: Number of recent transcriptions to analyze

        Returns:
            Aggregated sentiment analysis
        """
        if not self.recent_transcriptions:
            return {
                'avg_sentiment_score': 0.0,
                'predominant_sentiment': 'neutral',
                'positive_ratio': 0.0,
                'negative_ratio': 0.0,
                'neutral_ratio': 0.0
            }

        recent = self.recent_transcriptions[-recent_n:]

        # Calculate averages
        scores = [t['sentiment_score'] for t in recent]
        avg_score = sum(scores) / len(scores)

        # Count sentiment categories
        sentiments = [t['sentiment'] for t in recent]
        positive_count = sentiments.count('positive')
        negative_count = sentiments.count('negative')
        neutral_count = sentiments.count('neutral')
        total = len(sentiments)

        # Determine predominant sentiment
        if positive_count > negative_count and positive_count > neutral_count:
            predominant = 'positive'
        elif negative_count > positive_count and negative_count > neutral_count:
            predominant = 'negative'
        else:
            predominant = 'neutral'

        return {
            'avg_sentiment_score': avg_score,
            'predominant_sentiment': predominant,
            'positive_ratio': positive_count / total,
            'negative_ratio': negative_count / total,
            'neutral_ratio': neutral_count / total,
            'sample_size': total
        }

    def extract_keywords(self, min_length: int = 4) -> List[str]:
        """Extract keywords from recent transcriptions.

        Args:
            min_length: Minimum word length to consider

        Returns:
            List of significant keywords
        """
        # Simple keyword extraction by word frequency
        word_freq = {}

        for transcription in self.recent_transcriptions:
            text = transcription['text'].lower()
            words = text.split()

            for word in words:
                # Remove punctuation
                word = ''.join(c for c in word if c.isalnum())

                if len(word) >= min_length:
                    word_freq[word] = word_freq.get(word, 0) + 1

        # Sort by frequency
        sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)

        # Return top keywords
        return [word for word, freq in sorted_words[:20]]

    def reset(self):
        """Clear recent transcriptions."""
        self.recent_transcriptions.clear()
        logger.info("Speech analyzer reset")

    @property
    def is_loaded(self) -> bool:
        """Check if model is loaded."""
        return self._is_loaded


# Global instance
_analyzer_instance = None


def get_speech_analyzer() -> SpeechAnalyzer:
    """Get or create the global speech analyzer instance."""
    global _analyzer_instance
    if _analyzer_instance is None:
        _analyzer_instance = SpeechAnalyzer()
    return _analyzer_instance
