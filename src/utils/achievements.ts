// Achievement system for Memory Matrix
import { Achievement, UserProgress } from '../types';

// Define all available achievements (16 total)
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
    title: 'Maître',
    description: 'Atteins le niveau 10',
    icon: '🎯',
  },
  level_15: {
    id: 'level_15',
    title: 'Champion',
    description: 'Atteins le niveau 15',
    icon: '🏅',
  },
  level_20: {
    id: 'level_20',
    title: 'Expert',
    description: 'Atteins le niveau 20',
    icon: '🏆',
  },
  level_25: {
    id: 'level_25',
    title: 'Légende',
    description: 'Atteins le niveau 25',
    icon: '👑',
  },
  level_30: {
    id: 'level_30',
    title: 'Génie Absolu',
    description: 'Atteins le niveau 30 (maximum)',
    icon: '💎',
  },
  games_10: {
    id: 'games_10',
    title: 'Joueur Régulier',
    description: 'Joue 10 parties',
    icon: '🎲',
    target: 10,
  },
  games_25: {
    id: 'games_25',
    title: 'Passionné',
    description: 'Joue 25 parties',
    icon: '🎮',
    target: 25,
  },
  games_50: {
    id: 'games_50',
    title: 'Accro',
    description: 'Joue 50 parties',
    icon: '🔥',
    target: 50,
  },
  games_100: {
    id: 'games_100',
    title: 'Vétéran',
    description: 'Joue 100 parties',
    icon: '💪',
    target: 100,
  },
  score_1000: {
    id: 'score_1000',
    title: 'Bon Début',
    description: 'Atteins 1000 points en une partie',
    icon: '⭐',
    target: 1000,
  },
  score_3000: {
    id: 'score_3000',
    title: 'Beau Score',
    description: 'Atteins 3000 points en une partie',
    icon: '💯',
    target: 3000,
  },
  score_5000: {
    id: 'score_5000',
    title: 'Grand Score',
    description: 'Atteins 5000 points en une partie',
    icon: '🌟',
    target: 5000,
  },
  score_10000: {
    id: 'score_10000',
    title: 'Score Légendaire',
    description: 'Atteins 10000 points en une partie',
    icon: '💎',
    target: 10000,
  },
  score_15000: {
    id: 'score_15000',
    title: 'Score Ultime',
    description: 'Atteins 15000 points en une partie',
    icon: '🏆',
    target: 15000,
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
  if (!unlockedIds.includes('level_15') && progress.maxLevelReached >= 15) {
    newUnlocks.push('level_15');
  }
  if (!unlockedIds.includes('level_20') && progress.maxLevelReached >= 20) {
    newUnlocks.push('level_20');
  }
  if (!unlockedIds.includes('level_25') && progress.maxLevelReached >= 25) {
    newUnlocks.push('level_25');
  }
  if (!unlockedIds.includes('level_30') && progress.maxLevelReached >= 30) {
    newUnlocks.push('level_30');
  }

  // Games played achievements
  if (!unlockedIds.includes('games_10') && progress.totalGamesPlayed >= 10) {
    newUnlocks.push('games_10');
  }
  if (!unlockedIds.includes('games_25') && progress.totalGamesPlayed >= 25) {
    newUnlocks.push('games_25');
  }
  if (!unlockedIds.includes('games_50') && progress.totalGamesPlayed >= 50) {
    newUnlocks.push('games_50');
  }
  if (!unlockedIds.includes('games_100') && progress.totalGamesPlayed >= 100) {
    newUnlocks.push('games_100');
  }

  // Score achievements
  if (!unlockedIds.includes('score_1000') && (currentGameScore || progress.highScore) >= 1000) {
    newUnlocks.push('score_1000');
  }
  if (!unlockedIds.includes('score_3000') && (currentGameScore || progress.highScore) >= 3000) {
    newUnlocks.push('score_3000');
  }
  if (!unlockedIds.includes('score_5000') && (currentGameScore || progress.highScore) >= 5000) {
    newUnlocks.push('score_5000');
  }
  if (!unlockedIds.includes('score_10000') && (currentGameScore || progress.highScore) >= 10000) {
    newUnlocks.push('score_10000');
  }
  if (!unlockedIds.includes('score_15000') && (currentGameScore || progress.highScore) >= 15000) {
    newUnlocks.push('score_15000');
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
      if (achievement.id.startsWith('games_')) {
        progressValue = progress.totalGamesPlayed;
      } else if (achievement.id.startsWith('score_')) {
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
