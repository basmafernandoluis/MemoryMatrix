/**
 * Storage utilities for game mode specific stats
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProgress } from '../types';
import { loadUserProgress, saveUserProgress } from './storage';

const STORAGE_KEYS = {
  SURVIVAL_BEST_STREAK: 'survival_best_streak',
  TIME_ATTACK_BEST_TIME: 'time_attack_best_time',
  ZEN_BEST_ACCURACY: 'zen_best_accuracy',
};

/**
 * Update survival mode best streak
 */
export const updateSurvivalBestStreak = async (newStreak: number): Promise<void> => {
  try {
    const progress = await loadUserProgress();
    if (!progress) return;

    const currentBest = progress.survivalBestStreak || 0;
    if (newStreak > currentBest) {
      progress.survivalBestStreak = newStreak;
      await saveUserProgress(progress);
    }
  } catch (error) {
    console.error('Error updating survival best streak:', error);
  }
};

/**
 * Update time attack best time (in seconds)
 */
export const updateTimeAttackBestTime = async (timeRemaining: number): Promise<void> => {
  try {
    const progress = await loadUserProgress();
    if (!progress) return;

    const currentBest = progress.timeAttackBestScore || 0;
    // Plus de temps restant = meilleur score
    if (timeRemaining > currentBest) {
      progress.timeAttackBestScore = timeRemaining;
      await saveUserProgress(progress);
    }
  } catch (error) {
    console.error('Error updating time attack best time:', error);
  }
};

/**
 * Update zen mode best accuracy
 */
export const updateZenBestAccuracy = async (accuracy: number): Promise<void> => {
  try {
    const progress = await loadUserProgress();
    if (!progress) return;

    const currentBest = progress.zenBestAccuracy || 0;
    if (accuracy > currentBest) {
      progress.zenBestAccuracy = accuracy;
      await saveUserProgress(progress);
    }
  } catch (error) {
    console.error('Error updating zen best accuracy:', error);
  }
};

/**
 * Get survival best streak
 */
export const getSurvivalBestStreak = async (): Promise<number> => {
  try {
    const progress = await loadUserProgress();
    return progress?.survivalBestStreak || 0;
  } catch (error) {
    console.error('Error getting survival best streak:', error);
    return 0;
  }
};

/**
 * Get time attack best time
 */
export const getTimeAttackBestTime = async (): Promise<number> => {
  try {
    const progress = await loadUserProgress();
    return progress?.timeAttackBestScore || 0;
  } catch (error) {
    console.error('Error getting time attack best time:', error);
    return 0;
  }
};

/**
 * Get zen best accuracy
 */
export const getZenBestAccuracy = async (): Promise<number> => {
  try {
    const progress = await loadUserProgress();
    return progress?.zenBestAccuracy || 0;
  } catch (error) {
    console.error('Error getting zen best accuracy:', error);
    return 0;
  }
};
