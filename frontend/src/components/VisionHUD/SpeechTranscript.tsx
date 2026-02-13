/**
 * Speech Transcript Component
 * Displays real-time speech transcription with sentiment highlighting
 */

import { getSentimentColor, getSentimentEmoji } from '../../hooks/useTextSentiment'
import type { SentimentType } from '../../types/visionHUD'

interface SpeechTranscriptProps {
  transcript: string
  interimTranscript: string
  sentiment?: { sentiment: string; confidence: number } | null
}

export function SpeechTranscript({
  transcript,
  interimTranscript,
  sentiment,
}: SpeechTranscriptProps) {
  const sentimentType = (sentiment?.sentiment || 'neutral') as SentimentType
  const sentimentColor = getSentimentColor(sentimentType)
  const sentimentEmoji = getSentimentEmoji(sentimentType)

  // Get last 200 characters of transcript for display
  const displayText = transcript.slice(-200)
  const fullText = displayText + interimTranscript

  if (!fullText.trim()) return null

  return (
    <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
      <div
        className="p-4 rounded-xl backdrop-blur-md max-w-2xl mx-auto"
        style={{
          background: 'rgba(0, 0, 0, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* Header with sentiment indicator */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">
              Live Transcript
            </span>
          </div>

          {sentiment && (
            <div
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs"
              style={{
                background: `${sentimentColor}20`,
                color: sentimentColor,
              }}
            >
              <span>{sentimentEmoji}</span>
              <span className="capitalize">{sentimentType}</span>
              <span className="text-[10px] opacity-70">
                {Math.round(sentiment.confidence * 100)}%
              </span>
            </div>
          )}
        </div>

        {/* Transcript text */}
        <div className="text-sm text-white leading-relaxed">
          {displayText && <span>{displayText}</span>}
          {interimTranscript && (
            <span className="text-gray-400 italic">{interimTranscript}</span>
          )}
          <span className="inline-block w-0.5 h-4 bg-white/60 ml-0.5 animate-pulse" />
        </div>

        {/* Sentiment bar */}
        {sentiment && (
          <div className="mt-3 pt-2 border-t border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                Sentiment
              </span>
              <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${sentiment.confidence * 100}%`,
                    background: sentimentColor,
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
