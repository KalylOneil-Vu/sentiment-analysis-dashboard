import { PersonEngagement } from '../types';

interface ParticipantsListProps {
  persons: PersonEngagement[];
}

export default function ParticipantsList({ persons }: ParticipantsListProps) {
  if (persons.length === 0) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 text-center text-slate-400">
        No participants detected
      </div>
    );
  }

  // Sort by overall score (descending)
  const sortedPersons = [...persons].sort((a, b) => b.overall_score - a.overall_score);

  const getScoreColor = (score: number) => {
    if (score >= 0.7) return 'text-green-500 bg-green-500/10 border-green-500/30';
    if (score >= 0.4) return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
    return 'text-red-500 bg-red-500/10 border-red-500/30';
  };

  const getEmotionEmoji = (emotion: string | null) => {
    if (!emotion) return '😐';
    const emojiMap: Record<string, string> = {
      happy: '😊',
      sad: '😢',
      angry: '😠',
      surprise: '😮',
      fear: '😨',
      disgust: '🤢',
      neutral: '😐',
    };
    return emojiMap[emotion.toLowerCase()] || '😐';
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <h2 className="text-lg font-semibold mb-4">Individual Participants ({persons.length})</h2>

      <div className="space-y-3">
        {sortedPersons.map((person) => (
          <div
            key={person.track_id}
            className={`p-4 rounded-lg border ${getScoreColor(person.overall_score)}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{getEmotionEmoji(person.details.dominant_emotion)}</div>
                <div>
                  <h3 className="font-semibold">Person {person.track_id}</h3>
                  <p className="text-sm text-slate-400">
                    {person.details.dominant_emotion || 'Unknown emotion'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${getScoreColor(person.overall_score).split(' ')[0]}`}>
                  {Math.round(person.overall_score * 100)}%
                </div>
                <p className="text-xs text-slate-400">Engagement</p>
              </div>
            </div>

            {/* Status Indicators */}
            <div className="flex flex-wrap gap-2 mb-3">
              {person.details.is_speaking && (
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-500/30">
                  🎤 Speaking
                </span>
              )}
              {person.details.arms_raised && (
                <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full border border-purple-500/30">
                  ✋ Hand Raised
                </span>
              )}
              {person.details.arms_crossed && (
                <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full border border-orange-500/30">
                  ❌ Arms Crossed
                </span>
              )}
              {person.details.posture && (
                <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-full border border-gray-500/30">
                  {person.details.posture === 'forward' ? '⬆️ Leaning Forward' :
                   person.details.posture === 'backward' ? '⬇️ Leaning Back' :
                   '➡️ Neutral Posture'}
                </span>
              )}
            </div>

            {/* Component Scores */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <p className="text-slate-400 mb-1">Emotion</p>
                <div className="bg-slate-900/50 rounded p-1 text-center font-semibold">
                  {Math.round(person.component_scores.emotion * 100)}%
                </div>
              </div>
              <div>
                <p className="text-slate-400 mb-1">Body</p>
                <div className="bg-slate-900/50 rounded p-1 text-center font-semibold">
                  {Math.round(person.component_scores.body_language * 100)}%
                </div>
              </div>
              <div>
                <p className="text-slate-400 mb-1">Speech</p>
                <div className="bg-slate-900/50 rounded p-1 text-center font-semibold">
                  {Math.round(person.component_scores.speech * 100)}%
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
