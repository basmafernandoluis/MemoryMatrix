// Achievement system for Memory Matrix
import { Achievement, UserProgress } from '../types';

// Define all available achievements
export const ACHIEVEMENTS: Record<string, Omit<Achievement, 'unlocked' | 'progress'>> = {
  first_game: {
    id: 'first_game',
    title: 'Premier Pas',
    description: 'Joue ta première partie',
    icon: '🎮',
  },
  level_5: {
    id: 'level_5',
    title: 'En Progression',
    description: 'Atteins le niveau 5',
    icon: '⭐',
  },
  level_10: {
    id: 'level_10',
    title: 'Expert',
    description: 'Atteins le niveau 10',
    icon: '🏆',
  },
  games_10: {
    id: 'games_10',
    title: 'Joueur Régulier',
    description: 'Joue 10 parties',
    icon: '🎯',
    target: 10,
  },
  games_50: {
    id: 'games_50',
    title: 'Accro',
    description: 'Joue 50 parties',
    icon: '🔥',
    target: 50,
  },
  score_500: {
    id: 'score_500',
    title: 'Grand Score',
    description: 'Atteins 500 points en une partie',
    icon: '💎',
    target: 500,
  },
  perfect_level: {
    id: 'perfect_level',
    title: 'Sans Faute',
    description: 'Complète un niveau sans erreur',
    icon: '✨',
  },
};

// Check which achievements should be unlocked
export const checkAchievements = (
  progress: UserProgress,
  currentGameScore?: number,
  currentLevel?: number,
  perfectLevel?: boolean
): string[] => {
  const newUnlocks: string[] = [];
  const unlockedIds = progress.achievements || [];

  // First game
  if (!unlockedIds.includes('first_game') && progress.totalGamesPlayed >= 1) {
    newUnlocks.push('first_game');
  }

  // Level achievements
  if (!unlockedIds.includes('level_5') && progress.maxLevelReached >= 5) {
    newUnlocks.push('level_5');
  }
  if (!unlockedIds.includes('level_10') && progress.maxLevelReached >= 10) {
    newUnlocks.push('level_10');
  }

  // Games played achievements
  if (!unlockedIds.includes('games_10') && progress.totalGamesPlayed >= 10) {
    newUnlocks.push('games_10');
  }
  if (!unlockedIds.includes('games_50') && progress.totalGamesPlayed >= 50) {
    newUnlocks.push('games_50');
  }

  // Score achievement
  if (!unlockedIds.includes('score_500') && (currentGameScore || progress.highScore) >= 500) {
    newUnlocks.push('score_500');
  }

  // Perfect level
  if (!unlockedIds.includes('perfect_level') && perfectLevel) {
    newUnlocks.push('perfect_level');
  }

  return newUnlocks;
};

// Get all achievements with unlock status
export const getAchievementsWithStatus = (progress: UserProgress): Achievement[] => {
  const unlockedIds = progress.achievements || [];
  
  return Object.values(ACHIEVEMENTS).map(achievement => {
    const isUnlocked = unlockedIds.includes(achievement.id);
    let progressValue = 0;

    // Calculate progress for achievements with targets
    if (achievement.target) {
      if (achievement.id === 'games_10' || achievement.id === 'games_50') {
        progressValue = progress.totalGamesPlayed;
      } else if (achievement.id === 'score_500') {
        progressValue = progress.highScore;
      }
    }

    return {
      ...achievement,
      unlocked: isUnlocked,
      progress: achievement.target ? progressValue : undefined,
    };
  });
};

// Get achievement by ID
export const getAchievement = (id: string): Achievement | undefined => {
  const base = ACHIEVEMENTS[id];
  if (!base) return undefined;
  
  return {
    ...base,
    unlocked: false,
  };
};
