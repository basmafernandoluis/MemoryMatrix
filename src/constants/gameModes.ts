/**
 * Game Mode Configurations
 * Définit tous les modes de jeu disponibles dans Memory Matrix
 */

import { GameMode, GameModeConfig } from '../types';

export const GAME_MODES: Record<GameMode, GameModeConfig> = {
  classic: {
    mode: 'classic',
    name: 'Classique',
    description: '10 niveaux, 5 vies. Le mode original !',
    icon: '🎮',
    color: '#4A90E2',
    unlocked: true,
    settings: {
      hasLives: true,
      hasTimer: false,
      hasTimeLimit: false,
      difficultyProgression: 'normal',
      startingLevel: 1,
    },
  },

  survival: {
    mode: 'survival',
    name: 'Survie',
    description: 'Vie infinie, difficulté croissante. Jusqu\'où irez-vous ?',
    icon: '🔥',
    color: '#FF6B6B',
    unlocked: true,
    settings: {
      hasLives: false, // Pas de game over sur erreur
      hasTimer: false,
      hasTimeLimit: false,
      difficultyProgression: 'fast', // Difficulté augmente plus vite
      startingLevel: 1,
    },
  },

  timeAttack: {
    mode: 'timeAttack',
    name: 'Contre-la-Montre',
    description: '120 secondes pour scorer un maximum !',
    icon: '⏱️',
    color: '#FFB84D',
    unlocked: true,
    settings: {
      hasLives: false, // ✅ Pas de vies - le jeu continue pendant 120s
      hasTimer: true,
      timerDuration: 120, // 2 minutes fixes, pas de bonus
      hasTimeLimit: true,
      difficultyProgression: 'normal',
      startingLevel: 1,
    },
  },

  zen: {
    mode: 'zen',
    name: 'Zen',
    description: 'Sans pression. Prenez votre temps, relaxez-vous.',
    icon: '🧘',
    color: '#95E1D3',
    unlocked: true,
    settings: {
      hasLives: false, // Pas de game over
      hasTimer: false,
      hasTimeLimit: false,
      difficultyProgression: 'slow', // Progression très douce
      startingLevel: 1,
    },
  },

  custom: {
    mode: 'custom',
    name: 'Personnalisé',
    description: 'Créez votre propre défi !',
    icon: '⚙️',
    color: '#A29BFE',
    unlocked: false, // Débloqué après niveau 5 en classique
    settings: {
      hasLives: true,
      hasTimer: false,
      hasTimeLimit: false,
      difficultyProgression: 'none',
      startingLevel: 1,
      customGridSize: 3,
      customSequenceLength: 5,
    },
  },
};

/**
 * Calculer le multiplicateur de score selon le mode
 */
export const getScoreMultiplier = (mode: GameMode, level: number): number => {
  switch (mode) {
    case 'survival':
      // En survie, le multiplicateur augmente avec le niveau
      return 1 + Math.floor(level / 5) * 0.5;
    
    case 'timeAttack':
      // Bonus de score pour le mode contre-la-montre
      return 1.5;
    
    case 'zen':
      // Moins de points en mode zen (pas de pression)
      return 0.8;
    
    case 'custom':
      return 1.2;
    
    case 'classic':
    default:
      return 1;
  }
};

/**
 * Calculer le bonus de temps pour le mode contre-la-montre
 */
export const getTimeBonusForLevel = (level: number): number => {
  // Donne plus de temps pour les niveaux difficiles
  return 15 + Math.floor(level / 3) * 5; // 15s base, +5s tous les 3 niveaux
};

/**
 * Calculer la vitesse de progression de la difficulté en mode survie
 */
export const getSurvivalDifficultyIncrease = (currentLevel: number): number => {
  // La grille grandit plus vite en mode survie
  const baseGridSize = 2;
  const increaseRate = Math.floor(currentLevel / 3); // Augmente tous les 3 niveaux
  return Math.min(baseGridSize + increaseRate, 8); // Max 8x8
};

/**
 * Vérifier si un mode est débloqué
 */
export const isModeUnlocked = (mode: GameMode, maxLevelReached: number): boolean => {
  if (mode === 'custom') {
    return maxLevelReached >= 5; // Débloqué après niveau 5
  }
  return GAME_MODES[mode].unlocked;
};

/**
 * Obtenir la configuration d'un mode
 */
export const getModeConfig = (mode: GameMode): GameModeConfig => {
  return GAME_MODES[mode];
};
