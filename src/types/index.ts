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
  // Stats par mode
  survivalBestStreak?: number; // Meilleur streak en mode survie
  timeAttackBestTime?: number; // Meilleur temps en contre-la-montre
  zenBestAccuracy?: number; // Meilleure précision en mode zen
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

// Game Modes - Phase 10
export type GameMode = 'classic' | 'survival' | 'timeAttack' | 'zen' | 'custom';

export interface GameModeConfig {
  mode: GameMode;
  name: string;
  description: string;
  icon: string;
  color: string;
  unlocked: boolean;
  settings: {
    hasLives?: boolean; // False pour mode survie (vie infinie)
    hasTimer?: boolean; // True pour contre-la-montre
    timerDuration?: number; // Durée du timer en secondes
    hasTimeLimit?: boolean; // False pour mode zen
    difficultyProgression?: 'normal' | 'fast' | 'slow' | 'none';
    startingLevel?: number;
    customGridSize?: number; // Pour mode custom
    customSequenceLength?: number;
  };
}

export interface SurvivalStats {
  currentStreak: number; // Nombre de niveaux réussis d'affilée
  bestStreak: number;
  totalLevelsCompleted: number;
  difficultyMultiplier: number; // Augmente avec la progression
}

export interface TimeAttackStats {
  timeRemaining: number; // Temps restant en secondes
  timeBonus: number; // Bonus de temps gagné
  fastestCompletion: number; // Meilleur temps
}

export interface ZenStats {
  totalTimePlayed: number; // Temps total en mode zen
  perfectMoves: number; // Coups parfaits
  totalMoves: number; // Nombre total de coups
  averageAccuracy: number; // Précision moyenne
}

// Leaderboard Multi-Mode System
export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  
  // Score global (tous modes confondus)
  globalScore: number;
  
  // Meilleurs scores par mode
  classicBest: number;
  survivalBest: number;
  timeAttackBest: number;
  zenBest: number;
  
  // Métadonnées
  gamesPlayed: number;
  lastPlayed: Date;
  timestamp: Date;
  
  // Informations de classement (calculées à la volée)
  rank?: number;
  level?: number; // Niveau atteint dans la partie
}

export type LeaderboardMode = 'global' | 'classic' | 'survival' | 'timeAttack' | 'zen';
export type LeaderboardPeriod = 'daily' | 'weekly' | 'alltime';
