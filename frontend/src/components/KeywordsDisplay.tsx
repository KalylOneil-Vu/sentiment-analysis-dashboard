/**
 * KeywordsDisplay Component
 *
 * Displays extracted keywords from FastVLM analysis with visual indicators.
 */
import type { ExtractedKeywords } from '../constants/engagementPrompts';

interface KeywordsDisplayProps {
  keywords: ExtractedKeywords | null;
  score?: number | null;
  className?: string;
}

function KeywordTag({
  text,
  type,
}: {
  text: string;
  type: 'positive' | 'negative' | 'neutral' | 'emotion' | 'body';
}) {
  const colorMap = {
    positive: {
      bg: 'rgba(34, 197, 94, 0.15)',
      border: 'rgba(34, 197, 94, 0.3)',
      text: 'rgb(34, 197, 94)',
    },
    negative: {
      bg: 'rgba(239, 68, 68, 0.15)',
      border: 'rgba(239, 68, 68, 0.3)',
      text: 'rgb(239, 68, 68)',
    },
    neutral: {
      bg: 'rgba(148, 163, 184, 0.15)',
      border: 'rgba(148, 163, 184, 0.3)',
      text: 'rgb(148, 163, 184)',
    },
    emotion: {
      bg: 'rgba(168, 85, 247, 0.15)',
      border: 'rgba(168, 85, 247, 0.3)',
      text: 'rgb(168, 85, 247)',
    },
    body: {
      bg: 'rgba(59, 130, 246, 0.15)',
      border: 'rgba(59, 130, 246, 0.3)',
      text: 'rgb(59, 130, 246)',
    },
  };

  const colors = colorMap[type];

  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide"
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        color: colors.text,
      }}
    >
      {text}
    </span>
  );
}

function ScoreIndicator({ score }: { score: number }) {
  const percentage = Math.round(score * 100);
  const getColor = () => {
    if (score >= 0.7) return 'rgb(34, 197, 94)'; // green
    if (score >= 0.4) return 'rgb(234, 179, 8)'; // yellow
    return 'rgb(239, 68, 68)'; // red
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className="h-1.5 flex-1 rounded-full overflow-hidden"
        style={{ background: 'var(--glass-bg-strong)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            background: getColor(),
          }}
        />
      </div>
      <span
        className="text-xs font-medium tabular-nums"
        style={{ color: getColor() }}
      >
        {percentage}%
      </span>
    </div>
  );
}

export function KeywordsDisplay({
  keywords,
  score,
  className = '',
}: KeywordsDisplayProps) {
  const hasKeywords =
    keywords &&
    (keywords.positive.length > 0 ||
      keywords.negative.length > 0 ||
      keywords.emotions.length > 0 ||
      keywords.bodyLanguage.length > 0);

  return (
    <div
      className={`rounded-xl overflow-hidden ${className}`}
      style={{
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
      }}
    >
      {/* Header with score */}
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{ borderBottom: '1px solid var(--glass-border)' }}
      >
        <span
          className="text-xs font-medium tracking-wide uppercase"
          style={{ color: 'var(--text-secondary)' }}
        >
          Detected Keywords
        </span>
        {score !== null && score !== undefined && (
          <div className="w-24">
            <ScoreIndicator score={score} />
          </div>
        )}
      </div>

      {/* Keywords grid */}
      <div className="p-3">
        {hasKeywords ? (
          <div className="flex flex-wrap gap-1.5">
            {/* Positive keywords */}
            {keywords.positive.map((kw, i) => (
              <KeywordTag key={`pos-${i}`} text={kw} type="positive" />
            ))}

            {/* Negative keywords */}
            {keywords.negative.map((kw, i) => (
              <KeywordTag key={`neg-${i}`} text={kw} type="negative" />
            ))}

            {/* Emotions */}
            {keywords.emotions.map((kw, i) => (
              <KeywordTag key={`emo-${i}`} text={kw} type="emotion" />
            ))}

            {/* Body language */}
            {keywords.bodyLanguage.map((kw, i) => (
              <KeywordTag key={`body-${i}`} text={kw} type="body" />
            ))}

            {/* Neutral (if nothing else) */}
            {keywords.positive.length === 0 &&
              keywords.negative.length === 0 &&
              keywords.neutral.map((kw, i) => (
                <KeywordTag key={`neu-${i}`} text={kw} type="neutral" />
              ))}
          </div>
        ) : (
          <p
            className="text-xs italic text-center py-2"
            style={{ color: 'var(--text-muted)' }}
          >
            No keywords detected yet
          </p>
        )}
      </div>

      {/* Legend */}
      {hasKeywords && (
        <div
          className="flex items-center justify-center gap-4 px-3 py-2"
          style={{ borderTop: '1px solid var(--glass-border)' }}
        >
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: 'rgb(34, 197, 94)' }} />
            <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Positive</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: 'rgb(239, 68, 68)' }} />
            <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Negative</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: 'rgb(168, 85, 247)' }} />
            <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Emotion</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: 'rgb(59, 130, 246)' }} />
            <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Body</span>
          </div>
        </div>
      )}
    </div>
  );
}
