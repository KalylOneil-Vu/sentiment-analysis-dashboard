interface EngagementScoreProps {
  score: number;
}

export default function EngagementScore({ score }: EngagementScoreProps) {
  const percentage = Math.round(score * 100);

  const getScoreColor = (score: number) => {
    if (score >= 0.7) return 'text-green-500';
    if (score >= 0.4) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 0.7) return 'Highly Engaged';
    if (score >= 0.4) return 'Moderately Engaged';
    return 'Low Engagement';
  };

  const getBackgroundColor = (score: number) => {
    if (score >= 0.7) return 'from-green-900/50 to-green-800/30';
    if (score >= 0.4) return 'from-yellow-900/50 to-yellow-800/30';
    return 'from-red-900/50 to-red-800/30';
  };

  return (
    <div className={`bg-gradient-to-br ${getBackgroundColor(score)} rounded-lg p-6 border border-slate-700`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-slate-400 uppercase mb-2">Overall Engagement</h2>
          <div className="flex items-baseline gap-3">
            <span className={`text-5xl font-bold ${getScoreColor(score)}`}>
              {percentage}%
            </span>
            <span className="text-lg text-slate-400">{getScoreLabel(score)}</span>
          </div>
        </div>

        {/* Circular Progress Indicator */}
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-slate-700"
            />
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 40}`}
              strokeDashoffset={`${2 * Math.PI * 40 * (1 - score)}`}
              className={getScoreColor(score)}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-xl font-bold ${getScoreColor(score)}`}>{percentage}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
