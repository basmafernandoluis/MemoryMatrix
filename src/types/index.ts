// Core game types for Memory Matrix - Phase 1 MVP

export interface GameState {
  level: number;
  score: number;
  lives: number;
  currentSequence: number[];
  userSequence: number[];
  isShowingSequence: boolean;
  isGameOver: boolean;
  isPaused: boolean;
}

export interface UserProgress {
  totalGamesPlayed: number;
  highScore: number;
  maxLevelReached: number;
  dailyChallenge?: DailyChallenge;
  achievements?: string[]; // IDs of unlocked achievements
}

export interface DailyChallenge {
  date: string; // Format YYYY-MM-DD
  targetScore: number;
  currentScore: number;
  completed: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  target?: number;
}

export type GameStatus = 'idle' | 'showing' | 'playing' | 'correct' | 'wrong' | 'gameover';

export interface CellPosition {
  row: number;
  col: number;
}
