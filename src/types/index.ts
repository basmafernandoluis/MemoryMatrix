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
  timeAttackBestScore?: number; // Meilleur score en contre-la-montre (changé de time à score)
  zenBestAccuracy?: number; // Meilleure précision en mode zen
  focusChallengeBest?: number; // Meilleur score en Focus Challenge
  friendChallengeWins?: number; // Nombre de victoires en défis amis (pour débloquer Focus Challenge)
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
export type GameMode = 'classic' | 'survival' | 'timeAttack' | 'zen' | 'custom' | 'focusChallenge';

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

export interface FocusChallengeStats {
  distractionLevel: number; // Niveau de distraction actuel (0-10)
  complexityLevel: number; // Niveau de complexité des formes
  dualTaskActive: boolean; // Double tâche activée
  perfectFocus: number; // Nombre de niveaux réussis sans erreur malgré distractions
  totalDistractions: number; // Nombre total de distractions subies
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
  focusChallengeBest: number;
  
  // Métadonnées
  gamesPlayed: number;
  lastPlayed: Date;
  timestamp: Date;
  
  // Informations de classement (calculées à la volée)
  rank?: number;
  level?: number; // Niveau atteint dans la partie
}

export type LeaderboardMode = 'global' | 'classic' | 'survival' | 'timeAttack' | 'zen' | 'focusChallenge';
export type LeaderboardPeriod = 'daily' | 'weekly' | 'alltime';

// Social Features - Phase 13

// Friend System
export interface Friend {
  userId: string;
  displayName: string;
  avatarEmoji: string;
  level: number;
  lastPlayed?: Date;
  addedAt: Date;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromDisplayName: string;
  fromAvatarEmoji: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  respondedAt?: Date;
}

export interface UserSearchResult {
  userId: string;
  displayName: string;
  avatarEmoji: string;
  level: number;
  friendStatus: 'none' | 'friend' | 'pending-sent' | 'pending-received';
}

// Friend Challenges
export interface FriendChallenge {
  id: string;
  challengerId: string;
  challengerName: string;
  challengerAvatar: string;
  opponentId: string;
  opponentName: string;
  opponentAvatar: string;
  mode: GameMode;
  status: 'pending' | 'active' | 'completed' | 'expired';
  
  // Challenge details
  targetScore?: number; // Score à battre
  targetLevel?: number; // Niveau à atteindre
  
  // Results
  challengerScore?: number;
  challengerLevel?: number;
  opponentScore?: number;
  opponentLevel?: number;
  winnerId?: string;
  challengerRewardClaimed?: boolean; // Si le challenger a réclamé sa récompense
  opponentRewardClaimed?: boolean; // Si l'opponent a réclamé sa récompense
  
  // Timestamps
  createdAt: Date;
  acceptedAt?: Date;
  completedAt?: Date;
  expiresAt: Date; // 24h après création
}

export type ChallengeStatus = 'pending' | 'active' | 'completed' | 'expired';

// Share Options
export interface ShareOptions {
  score: number;
  level: number;
  mode: GameMode;
  rank?: number;
  isNewRecord?: boolean;
}

export interface ShareResult {
  success: boolean;
  platform?: 'facebook' | 'twitter' | 'instagram' | 'whatsapp' | 'other';
  error?: string;
}

// Theme System - Phase 11

export interface ThemeColors {
  // Couleurs principales
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  accent: string;
  
  // Couleurs de fond
  background: string;
  surface: string;
  surfaceLight: string;
  border: string;
  
  // Couleurs de texte
  text: string;
  textSecondary: string;
  textDisabled: string;
  
  // Couleurs de jeu
  cellActive: string;
  cellInactive: string;
  cellCorrect: string;
  cellIncorrect: string;
  
  // États
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Effets
  shadow: string;
  overlay: string;
  glow: string;
}

export interface ThemeEffects {
  particlesEnabled: boolean;
  particlesIntensity: 'low' | 'medium' | 'high';
  confettiEnabled: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast';
  glowEffects: boolean;
  shakeEffects: boolean;
}

export type ThemeCategory = 'default' | 'premium' | 'seasonal' | 'custom';
export type ThemeUnlockType = 'free' | 'coins' | 'xp' | 'level' | 'achievement';

export interface ThemeUnlockRequirements {
  type: ThemeUnlockType;
  value?: number; // Coût en coins/xp ou niveau requis
  achievementId?: string; // ID de l'achievement requis
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  category: ThemeCategory;
  colors: ThemeColors;
  effects: ThemeEffects;
  icon: string; // Emoji représentant le thème
  preview: string; // Image preview (base64 ou URL)
  unlockRequirements: ThemeUnlockRequirements;
  isPremium: boolean;
  isLimited?: boolean; // Pour thèmes saisonniers
  availableFrom?: Date; // Date de début disponibilité
  availableTo?: Date; // Date de fin disponibilité
}

export interface UserThemePreferences {
  activeThemeId: string;
  unlockedThemes: string[]; // IDs des thèmes débloqués
  customThemes?: Theme[]; // Thèmes créés par l'utilisateur
  effects: ThemeEffects; // Préférences d'effets visuels globales
}
