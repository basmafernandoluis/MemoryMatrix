// Storage utility for persisting game data locally
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProgress, DailyChallenge } from '../types';
import { checkAchievements } from './achievements';

const STORAGE_KEYS = {
  USER_PROGRESS: '@MemoryMatrix:userProgress',
  HIGH_SCORE: '@MemoryMatrix:highScore',
  ONBOARDING_COMPLETED: '@MemoryMatrix:onboardingCompleted',
};

// Helper to get today's date in YYYY-MM-DD format
const getTodayString = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Generate daily challenge target (varies by day)
const generateDailyChallengeTarget = (): number => {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  // Target between 300-800 based on day
  return 300 + ((dayOfYear * 17) % 500);
};

// Get or create daily challenge
export const getDailyChallenge = async (): Promise<DailyChallenge> => {
  const today = getTodayString();
  const progress = await loadUserProgress();
  
  const currentChallenge = progress?.dailyChallenge;
  
  // If challenge exists and is for today, return it
  if (currentChallenge && currentChallenge.date === today) {
    return currentChallenge;
  }
  
  // Create new challenge for today
  const newChallenge: DailyChallenge = {
    date: today,
    targetScore: generateDailyChallengeTarget(),
    currentScore: 0,
    completed: false,
  };
  
  return newChallenge;
};

// Update daily challenge progress
export const updateDailyChallengeProgress = async (score: number): Promise<DailyChallenge> => {
  const challenge = await getDailyChallenge();
  const progress = await loadUserProgress();
  
  // Update current score (keep the highest)
  const updatedChallenge: DailyChallenge = {
    ...challenge,
    currentScore: Math.max(challenge.currentScore, score),
    completed: Math.max(challenge.currentScore, score) >= challenge.targetScore,
  };
  
  // Save updated progress
  const updatedProgress: UserProgress = {
    ...progress,
    totalGamesPlayed: progress?.totalGamesPlayed || 0,
    highScore: progress?.highScore || 0,
    maxLevelReached: progress?.maxLevelReached || 1,
    dailyChallenge: updatedChallenge,
  };
  
  await saveUserProgress(updatedProgress);
  return updatedChallenge;
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
export const updateHighScore = async (newScore: number): Promise<string[]> => {
  try {
    const progress = await loadUserProgress();
    const currentHighScore = progress?.highScore || 0;
    
    if (newScore > currentHighScore) {
      const updatedProgress: UserProgress = {
        ...progress,
        totalGamesPlayed: (progress?.totalGamesPlayed || 0),
        highScore: newScore,
        maxLevelReached: progress?.maxLevelReached || 1,
        achievements: progress?.achievements || [],
      };
      
      // Check for new achievements
      const newAchievements = checkAchievements(updatedProgress, newScore);
      if (newAchievements.length > 0) {
        updatedProgress.achievements = [
          ...(updatedProgress.achievements || []),
          ...newAchievements,
        ];
      }
      
      await saveUserProgress(updatedProgress);
      return newAchievements;
    }
    return [];
  } catch (error) {
    console.error('Error updating high score:', error);
    return [];
  }
};

// Update max level reached
export const updateMaxLevel = async (level: number): Promise<string[]> => {
  try {
    const progress = await loadUserProgress();
    const currentMaxLevel = progress?.maxLevelReached || 0;
    
    if (level > currentMaxLevel) {
      const updatedProgress: UserProgress = {
        ...progress,
        totalGamesPlayed: progress?.totalGamesPlayed || 0,
        highScore: progress?.highScore || 0,
        maxLevelReached: level,
        achievements: progress?.achievements || [],
      };
      
      // Check for new achievements
      const newAchievements = checkAchievements(updatedProgress, undefined, level);
      if (newAchievements.length > 0) {
        updatedProgress.achievements = [
          ...(updatedProgress.achievements || []),
          ...newAchievements,
        ];
      }
      
      await saveUserProgress(updatedProgress);
      return newAchievements;
    }
    return [];
  } catch (error) {
    console.error('Error updating max level:', error);
    return [];
  }
};

// Increment total games played
export const incrementGamesPlayed = async (): Promise<string[]> => {
  try {
    const progress = await loadUserProgress();
    const updatedProgress: UserProgress = {
      totalGamesPlayed: (progress?.totalGamesPlayed || 0) + 1,
      highScore: progress?.highScore || 0,
      maxLevelReached: progress?.maxLevelReached || 1,
      achievements: progress?.achievements || [],
    };
    
    // Check for new achievements
    const newAchievements = checkAchievements(updatedProgress);
    if (newAchievements.length > 0) {
      updatedProgress.achievements = [
        ...(updatedProgress.achievements || []),
        ...newAchievements,
      ];
    }
    
    await saveUserProgress(updatedProgress);
    return newAchievements;
  } catch (error) {
    console.error('Error incrementing games played:', error);
    return [];
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

// Check if onboarding has been completed
export const hasCompletedOnboarding = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
    return value === 'true';
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
};

// Mark onboarding as completed
export const setOnboardingCompleted = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
  } catch (error) {
    console.error('Error setting onboarding completed:', error);
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
        dailyChallenge: await getDailyChallenge(),
        achievements: [],
      };
      await saveUserProgress(defaultProgress);
      return defaultProgress;
    }
    
    // Refresh daily challenge if needed
    const challenge = await getDailyChallenge();
    if (progress.dailyChallenge?.date !== challenge.date) {
      progress.dailyChallenge = challenge;
      await saveUserProgress(progress);
    }
    
    return progress;
  } catch (error) {
    console.error('Error initializing user progress:', error);
    return {
      totalGamesPlayed: 0,
      highScore: 0,
      maxLevelReached: 1,
      dailyChallenge: await getDailyChallenge(),
      achievements: [],
    };
  }
};
