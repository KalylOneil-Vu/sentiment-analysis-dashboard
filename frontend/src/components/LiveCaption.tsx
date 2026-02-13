/**
 * LiveCaption Component
 *
 * Displays real-time streaming text from FastVLM with a typing effect.
 */
import { useEffect, useRef } from 'react';

interface LiveCaptionProps {
  text: string;
  isRunning: boolean;
  isLoading?: boolean;
  loadingProgress?: string | null;
  className?: string;
}

export function LiveCaption({
  text,
  isRunning,
  isLoading = false,
  loadingProgress = null,
  className = '',
}: LiveCaptionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when text updates
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [text]);

  return (
    <div
      className={`relative rounded-xl overflow-hidden flex flex-col flex-1 ${className}`}
      style={{
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{ borderBottom: '1px solid var(--glass-border)' }}
      >
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isLoading
                ? 'bg-yellow-500 animate-pulse'
                : isRunning
                ? 'bg-green-500 animate-pulse'
                : 'bg-gray-400'
            }`}
          />
          <span
            className="text-xs font-medium tracking-wide uppercase"
            style={{ color: 'var(--text-secondary)' }}
          >
            {isLoading ? 'Loading Model' : isRunning ? 'Live Analysis' : 'Paused'}
          </span>
        </div>
        <span
          className="text-[10px] tracking-widest uppercase"
          style={{ color: 'var(--text-faint)' }}
        >
          FastVLM
        </span>
      </div>

      {/* Content */}
      <div
        ref={containerRef}
        className="p-4 flex-1 min-h-[100px] overflow-y-auto"
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
              {loadingProgress || 'Loading FastVLM model...'}
            </p>
          </div>
        ) : text ? (
          <p
            className="text-lg leading-relaxed"
            style={{ color: 'var(--text-primary)' }}
          >
            {text}
            {isRunning && (
              <span
                className="inline-block w-2 h-5 ml-1 animate-pulse"
                style={{ background: 'var(--accent)', verticalAlign: 'text-bottom' }}
              />
            )}
          </p>
        ) : (
          <p
            className="text-base italic text-center"
            style={{ color: 'var(--text-muted)' }}
          >
            {isRunning ? 'Analyzing...' : 'Analysis paused'}
          </p>
        )}
      </div>
    </div>
  );
}
