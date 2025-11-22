export interface LyricWord {
  text: string;
  isExplicit: boolean;
  reason?: string;
}

export interface AnalysisResult {
  lyrics: LyricWord[];
  summary: string;
  rating: 'Clean' | 'Explicit' | 'Risky';
  confidence: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export enum AppState {
  IDLE,
  ANALYZING,
  RESULTS,
  ERROR
}
