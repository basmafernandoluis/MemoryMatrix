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
  hintsRemaining: number; // Nombre d'astuces restantes
  isHintReplay: boolean; // Indique si c'est un replay via hint (pour vitesse lente)
}

export interface UserProgress {
  totalGamesPlayed: number;
  highScore: number;
  maxLevelReached: number;
  dailyChallenge?: DailyChallenge;
  achievements?: string[]; // IDs of unlocked achievements
  displayName?: string; // Pseudo du joueur (éditable)
  avatarEmoji?: string; // Emoji choisi comme avatar
  coins?: number; // Monnaie virtuelle pour récompenses
  xp?: number; // Points d'expérience
}

export interface DailyChallenge {
  date: string; // Format YYYY-MM-DD
  targetScore: number;
  currentScore: number;
  completed: boolean;
}

// Extended Daily Challenge System - Phase 8
export type ChallengeType = 'speed' | 'accuracy' | 'endurance' | 'perfect' | 'score';

export interface Challenge {
  id: string;
  type: ChallengeType;
  title: string;
  description: string;
  target: number;
  reward: {
    xp: number;
    coins: number;
    badge?: string;
  };
  icon: string; // Emoji or icon identifier
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface DailyChallengeExtended {
  id: string;
  date: string; // YYYY-MM-DD
  challenges: Challenge[];
  completed: boolean;
  expiresAt: number; // Timestamp
}

export interface ChallengeProgress {
  userId: string;
  currentChallenges: {
    challengeId: string;
    progress: number;
    completed: boolean;
    rewardClaimed: boolean;
  }[];
  streak: number; // Consecutive days completing at least one challenge
  lastCompletionDate: string; // YYYY-MM-DD
  totalChallengesCompleted: number;
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
