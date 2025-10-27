import { PersonEngagement } from '../types';

interface ParticipantsListProps {
  persons: PersonEngagement[];
}

export default function ParticipantsList({ persons }: ParticipantsListProps) {
  if (persons.length === 0) {
    return (
      <div className="bg-zinc-950 border border-zinc-800 rounded p-8 text-center">
        <div className="text-zinc-600 text-xs uppercase tracking-wider">
          No personnel detected
        </div>
      </div>
    );
  }

  // Sort by overall score (descending)
  const sortedPersons = [...persons].sort((a, b) => b.overall_score - a.overall_score);

  const getScoreColor = (score: number) => {
    if (score >= 0.7) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (score >= 0.4) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-red-400 bg-red-500/10 border-red-500/30';
  };

  const getEmotionLabel = (emotion: string | null) => {
    if (!emotion) return 'NEUTRAL';
    return emotion.toUpperCase();
  };

  const getEmotionColor = (emotion: string | null) => {
    if (!emotion) return 'text-zinc-500';
    const colorMap: Record<string, string> = {
      happy: 'text-emerald-400',
      sad: 'text-blue-400',
      angry: 'text-red-400',
      surprise: 'text-amber-400',
      fear: 'text-purple-400',
      disgust: 'text-orange-400',
      neutral: 'text-zinc-500',
    };
    return colorMap[emotion.toLowerCase()] || 'text-zinc-500';
  };

  return (
    <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-lg overflow-hidden backdrop-blur-sm">
      <div className="px-4 py-2.5 bg-zinc-900/60 border-b border-zinc-800/50 flex items-center justify-between">
        <h2 className="text-xs font-semibold tracking-wide text-zinc-300">Participants</h2>
        <span className="text-[10px] text-zinc-500 font-medium">{persons.length} Active</span>
      </div>

      <div className="p-3 space-y-2">
        {sortedPersons.map((person) => (
          <div
            key={person.track_id}
            className={`border ${getScoreColor(person.overall_score)} rounded-lg overflow-hidden`}
          >
            <div className="p-3">
              <div className="flex items-start justify-between mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-zinc-900/70 border border-zinc-700/50 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-bold text-zinc-300">{person.track_id}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-xs text-zinc-100">Participant {person.track_id}</h3>
                    <p className={`text-[10px] font-medium ${getEmotionColor(person.details.dominant_emotion)}`}>
                      {getEmotionLabel(person.details.dominant_emotion)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xl font-bold ${getScoreColor(person.overall_score).split(' ')[0]}`}>
                    {Math.round(person.overall_score * 100)}
                  </div>
                  <p className="text-[9px] text-zinc-600 font-medium">Score</p>
                </div>
              </div>

              {/* Status Indicators */}
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {person.details.is_speaking && (
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-[9px] rounded-md border border-blue-500/30 font-medium">
                    Speaking
                  </span>
                )}
                {person.details.arms_raised && (
                  <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-[9px] rounded-md border border-purple-500/30 font-medium">
                    Hand Raised
                  </span>
                )}
                {person.details.arms_crossed && (
                  <span className="px-2 py-0.5 bg-orange-500/20 text-orange-300 text-[9px] rounded-md border border-orange-500/30 font-medium">
                    Arms Crossed
                  </span>
                )}
                {person.details.posture && (
                  <span className="px-2 py-0.5 bg-zinc-700/20 text-zinc-400 text-[9px] rounded-md border border-zinc-700/30 font-medium">
                    {person.details.posture === 'forward' ? 'Leaning Forward' :
                     person.details.posture === 'backward' ? 'Leaning Back' :
                     'Neutral'}
                  </span>
                )}
              </div>

              {/* Component Scores */}
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                <div className="bg-zinc-900/50 border border-zinc-800/40 rounded-md p-1.5">
                  <p className="text-zinc-500 mb-1 text-[9px] font-medium">Emotion</p>
                  <div className="text-center font-bold text-zinc-100 text-xs">
                    {Math.round(person.component_scores.emotion * 100)}%
                  </div>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800/40 rounded-md p-1.5">
                  <p className="text-zinc-500 mb-1 text-[9px] font-medium">Body</p>
                  <div className="text-center font-bold text-zinc-100 text-xs">
                    {Math.round(person.component_scores.body_language * 100)}%
                  </div>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800/40 rounded-md p-1.5">
                  <p className="text-zinc-500 mb-1 text-[9px] font-medium">Speech</p>
                  <div className="text-center font-bold text-zinc-100 text-xs">
                    {Math.round(person.component_scores.speech * 100)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
