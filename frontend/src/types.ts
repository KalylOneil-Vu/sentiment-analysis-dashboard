/**
 * Type definitions for the sentiment analysis application
 */

export interface PersonEngagement {
  track_id: number;
  timestamp: string;
  overall_score: number;
  component_scores: {
    emotion: number;
    body_language: number;
    gaze: number;
    micro_expression: number;
    movement: number;
    speech: number;
  };
  details: {
    dominant_emotion: string | null;
    posture: string | null;
    arms_crossed: boolean;
    arms_raised: boolean;
    is_speaking: boolean;
  };
  bbox: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    center: [number, number];
    width: number;
    height: number;
  } | null;
  confidence: number;
}

export interface RoomEngagement {
  timestamp: string;
  overall_score: number;
  total_participants: number;
  active_participants: number;
  distribution: {
    highly_engaged: number;
    neutral: number;
    disengaged: number;
    percentages: {
      highly_engaged: number;
      neutral: number;
      disengaged: number;
    };
  };
  averages: {
    emotion: number;
    body_language: number;
    speech: number;
  };
  participation: {
    speaking_count: number;
    participation_rate: number;
  };
  persons: PersonEngagement[];
}

export interface WebSocketMessage {
  type: string;
  data?: any;
}

export interface SessionInfo {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  status: 'active' | 'paused' | 'completed';
}

export interface HistoricalDataPoint {
  timestamp: string;
  overall_score: number;
  total_participants: number;
  highly_engaged: number;
  neutral: number;
  disengaged: number;
}
