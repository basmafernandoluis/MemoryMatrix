/**
 * Mode Unlock Service
 * Gère le système de déblocage des modes de jeu
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameMode } from '../types';
import { GAME_MODES } from '../constants/gameModes';
import { firestoreService } from './firestore';

const UNLOCKED_MODES_KEY = '@unlocked_modes';

interface UnlockedModes {
  [key: string]: {
    mode: GameMode;
    unlockedAt: number;
    method: 'level' | 'xp' | 'coins';
  };
}

/**
 * Récupérer les modes débloqués localement
 */
export const getUnlockedModes = async (): Promise<UnlockedModes> => {
  try {
    const data = await AsyncStorage.getItem(UNLOCKED_MODES_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error loading unlocked modes:', error);
    return {};
  }
};

/**
 * Sauvegarder un mode débloqué
 */
export const unlockMode = async (
  mode: GameMode,
  method: 'level' | 'xp' | 'coins',
  userId?: string
): Promise<void> => {
  try {
    const unlocked = await getUnlockedModes();
    
    unlocked[mode] = {
      mode,
      unlockedAt: Date.now(),
      method,
    };
    
    await AsyncStorage.setItem(UNLOCKED_MODES_KEY, JSON.stringify(unlocked));
    
    // Sync avec Firestore si connecté
    // Note: La mise à jour Firestore se fait via saveUserProgress dans le composant
  } catch (error) {
    console.error('Error unlocking mode:', error);
  }
};

/**
 * Vérifier si un mode vient d'être débloqué
 */
export const checkModeUnlock = async (
  mode: GameMode,
  oldLevel: number,
  newLevel: number,
  oldXp: number,
  newXp: number,
  oldCoins: number,
  newCoins: number
): Promise<{ unlocked: boolean; method?: 'level' | 'xp' | 'coins' }> => {
  const config = GAME_MODES[mode];
  
  if (!config.unlockRequirements) {
    return { unlocked: false };
  }
  
  const req = config.unlockRequirements;
  
  // Vérifier déblocage par niveau
  if (req.levelRequired) {
    if (oldLevel < req.levelRequired && newLevel >= req.levelRequired) {
      return { unlocked: true, method: 'level' };
    }
  }
  
  // Vérifier déblocage par XP
  if (req.xpCost) {
    if (oldXp < req.xpCost && newXp >= req.xpCost) {
      return { unlocked: true, method: 'xp' };
    }
  }
  
  // Vérifier déblocage par Coins
  if (req.coinsCost) {
    if (oldCoins < req.coinsCost && newCoins >= req.coinsCost) {
      return { unlocked: true, method: 'coins' };
    }
  }
  
  return { unlocked: false };
};

/**
 * Obtenir la liste des modes récemment débloqués
 */
export const getRecentlyUnlockedModes = async (
  sinceTimestamp: number
): Promise<GameMode[]> => {
  try {
    const unlocked = await getUnlockedModes();
    return Object.values(unlocked)
      .filter(u => u.unlockedAt > sinceTimestamp)
      .map(u => u.mode);
  } catch (error) {
    console.error('Error getting recently unlocked modes:', error);
    return [];
  }
};
