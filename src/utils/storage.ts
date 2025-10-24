// Storage utility for persisting game data locally
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProgress } from '../types';

const STORAGE_KEYS = {
  USER_PROGRESS: '@MemoryMatrix:userProgress',
  HIGH_SCORE: '@MemoryMatrix:highScore',
};

// Save user progress
export const saveUserProgress = async (progress: UserProgress): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(progress);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROGRESS, jsonValue);
  } catch (error) {
    console.error('Error saving user progress:', error);
  }
};

// Load user progress
export const loadUserProgress = async (): Promise<UserProgress | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROGRESS);
    if (jsonValue !== null) {
      return JSON.parse(jsonValue);
    }
    return null;
  } catch (error) {
    console.error('Error loading user progress:', error);
    return null;
  }
};

// Update high score if new score is higher
export const updateHighScore = async (newScore: number): Promise<void> => {
  try {
    const progress = await loadUserProgress();
    const currentHighScore = progress?.highScore || 0;
    
    if (newScore > currentHighScore) {
      const updatedProgress: UserProgress = {
        ...progress,
        totalGamesPlayed: (progress?.totalGamesPlayed || 0),
        highScore: newScore,
        maxLevelReached: progress?.maxLevelReached || 1,
      };
      await saveUserProgress(updatedProgress);
    }
  } catch (error) {
    console.error('Error updating high score:', error);
  }
};

// Update max level reached
export const updateMaxLevel = async (level: number): Promise<void> => {
  try {
    const progress = await loadUserProgress();
    const currentMaxLevel = progress?.maxLevelReached || 0;
    
    if (level > currentMaxLevel) {
      const updatedProgress: UserProgress = {
        ...progress,
        totalGamesPlayed: progress?.totalGamesPlayed || 0,
        highScore: progress?.highScore || 0,
        maxLevelReached: level,
      };
      await saveUserProgress(updatedProgress);
    }
  } catch (error) {
    console.error('Error updating max level:', error);
  }
};

// Increment total games played
export const incrementGamesPlayed = async (): Promise<void> => {
  try {
    const progress = await loadUserProgress();
    const updatedProgress: UserProgress = {
      totalGamesPlayed: (progress?.totalGamesPlayed || 0) + 1,
      highScore: progress?.highScore || 0,
      maxLevelReached: progress?.maxLevelReached || 1,
    };
    await saveUserProgress(updatedProgress);
  } catch (error) {
    console.error('Error incrementing games played:', error);
  }
};

// Clear all stored data (for testing/reset)
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_PROGRESS);
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};

// Initialize default progress if none exists
export const initializeUserProgress = async (): Promise<UserProgress> => {
  try {
    const progress = await loadUserProgress();
    if (progress === null) {
      const defaultProgress: UserProgress = {
        totalGamesPlayed: 0,
        highScore: 0,
        maxLevelReached: 1,
      };
      await saveUserProgress(defaultProgress);
      return defaultProgress;
    }
    return progress;
  } catch (error) {
    console.error('Error initializing user progress:', error);
    return {
      totalGamesPlayed: 0,
      highScore: 0,
      maxLevelReached: 1,
    };
  }
};
