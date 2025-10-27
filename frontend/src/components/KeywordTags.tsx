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
  const renderTag = (keyword: string, type: 'positive' | 'negative' | 'body' | 'emotion') => {
    const colorMap = {
      positive: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      negative: 'bg-red-500/20 text-red-300 border-red-500/40',
      body: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      emotion: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    };

    return (
      <span
        key={keyword}
        className={`inline-block px-2.5 py-1 m-1 border rounded-md text-[10px] font-medium ${colorMap[type]}`}
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
      <div className="p-8 text-center">
        <div className="text-zinc-600 text-xs uppercase tracking-wider">
          No keywords detected
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Positive Indicators */}
      {keywords.positive.length > 0 && (
        <div>
          <div className="text-[10px] font-semibold text-emerald-400 mb-2 tracking-wide flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm"></div>
            Positive Signals
          </div>
          <div className="flex flex-wrap -m-1">
            {keywords.positive.map((kw) => renderTag(kw, 'positive'))}
          </div>
        </div>
      )}

      {/* Body Language */}
      {keywords.bodyLanguage.length > 0 && (
        <div>
          <div className="text-[10px] font-semibold text-blue-400 mb-2 tracking-wide flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-sm"></div>
            Body Language
          </div>
          <div className="flex flex-wrap -m-1">
            {keywords.bodyLanguage.map((kw) => renderTag(kw, 'body'))}
          </div>
        </div>
      )}

      {/* Emotions */}
      {keywords.emotions.length > 0 && (
        <div>
          <div className="text-[10px] font-semibold text-amber-400 mb-2 tracking-wide flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-sm"></div>
            Emotional State
          </div>
          <div className="flex flex-wrap -m-1">
            {keywords.emotions.map((kw) => renderTag(kw, 'emotion'))}
          </div>
        </div>
      )}

      {/* Negative Indicators */}
      {keywords.negative.length > 0 && (
        <div>
          <div className="text-[10px] font-semibold text-red-400 mb-2 tracking-wide flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-sm"></div>
            Negative Signals
          </div>
          <div className="flex flex-wrap -m-1">
            {keywords.negative.map((kw) => renderTag(kw, 'negative'))}
          </div>
        </div>
      )}
    </div>
  );
};
