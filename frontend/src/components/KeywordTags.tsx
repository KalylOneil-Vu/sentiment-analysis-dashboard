/**
 * KeywordTags Component
 *
 * Displays extracted keywords from FastVLM analysis with color coding
 * based on sentiment (positive, negative, neutral).
 */
import React from 'react';

interface KeywordTagsProps {
  keywords: {
    positive: string[];
    negative: string[];
    bodyLanguage: string[];
    emotions: string[];
  };
}

export const KeywordTags: React.FC<KeywordTagsProps> = ({ keywords }) => {
  const renderTag = (keyword: string, type: 'positive' | 'negative' | 'neutral' | 'body' | 'emotion') => {
    const colorMap = {
      positive: { bg: '#dcfce7', text: '#166534', border: '#86efac' },
      negative: { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
      neutral: { bg: '#e5e7eb', text: '#374151', border: '#d1d5db' },
      body: { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
      emotion: { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
    };

    const colors = colorMap[type];

    return (
      <span
        key={keyword}
        style={{
          display: 'inline-block',
          padding: '4px 12px',
          margin: '4px',
          backgroundColor: colors.bg,
          color: colors.text,
          border: `1px solid ${colors.border}`,
          borderRadius: '16px',
          fontSize: '13px',
          fontWeight: '500',
        }}
      >
        {keyword}
      </span>
    );
  };

  const hasAnyKeywords =
    keywords.positive.length > 0 ||
    keywords.negative.length > 0 ||
    keywords.bodyLanguage.length > 0 ||
    keywords.emotions.length > 0;

  if (!hasAnyKeywords) {
    return (
      <div
        style={{
          padding: '16px',
          textAlign: 'center',
          color: '#6b7280',
          fontStyle: 'italic',
        }}
      >
        No keywords detected yet...
      </div>
    );
  }

  return (
    <div className="keyword-tags" style={{ padding: '8px' }}>
      {/* Positive keywords */}
      {keywords.positive.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <div
            style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#059669',
              marginBottom: '4px',
              textTransform: 'uppercase',
            }}
          >
            Positive Indicators
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {keywords.positive.map((kw) => renderTag(kw, 'positive'))}
          </div>
        </div>
      )}

      {/* Body language */}
      {keywords.bodyLanguage.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <div
            style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#2563eb',
              marginBottom: '4px',
              textTransform: 'uppercase',
            }}
          >
            Body Language
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {keywords.bodyLanguage.map((kw) => renderTag(kw, 'body'))}
          </div>
        </div>
      )}

      {/* Emotions */}
      {keywords.emotions.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <div
            style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#d97706',
              marginBottom: '4px',
              textTransform: 'uppercase',
            }}
          >
            Emotions
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {keywords.emotions.map((kw) => renderTag(kw, 'emotion'))}
          </div>
        </div>
      )}

      {/* Negative keywords */}
      {keywords.negative.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <div
            style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#dc2626',
              marginBottom: '4px',
              textTransform: 'uppercase',
            }}
          >
            Negative Indicators
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {keywords.negative.map((kw) => renderTag(kw, 'negative'))}
          </div>
        </div>
      )}
    </div>
  );
};
