import { firestore } from './firebase';
import { UserProgress, DailyChallenge, ChallengeProgress, DailyChallengeExtended } from '../types';
import { checkAchievements } from '../utils/achievements';

const USERS_COLLECTION = 'users';
const DISPLAYNAMES_COLLECTION = 'displayNames';
const CHALLENGES_COLLECTION = 'challenges';

export class FirestoreService {
  // Get user progress from Firestore
  async getUserProgress(userId: string): Promise<UserProgress | null> {
    try {
      const doc = await firestore()
        .collection(USERS_COLLECTION)
        .doc(userId)
        .get();

      if (!doc.exists) {
        return null;
      }

      const data = doc.data();
      return {
        highScore: data?.highScore || 0,
        maxLevelReached: data?.maxLevelReached || 1,
        totalGamesPlayed: data?.totalGamesPlayed || 0,
        achievements: data?.achievements || [],
        dailyChallenge: data?.dailyChallenge || null,
        displayName: data?.displayName || null,
        avatarEmoji: data?.avatarEmoji || null,
        coins: data?.coins || 0,
        xp: data?.xp || 0,
        survivalBestStreak: data?.survivalBestStreak || 0,
        timeAttackBestScore: data?.timeAttackBestScore || 0,
        zenBestAccuracy: data?.zenBestAccuracy || 0,
      };
    } catch (error) {
      console.error('Error getting user progress:', error);
      return null;
    }
  }

  // Save user progress to Firestore
  async saveUserProgress(userId: string, progress: UserProgress): Promise<void> {
    try {
      const data: any = {
        highScore: progress.highScore,
        maxLevelReached: progress.maxLevelReached,
        totalGamesPlayed: progress.totalGamesPlayed,
        achievements: progress.achievements,
        dailyChallenge: progress.dailyChallenge,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      };

      // Only add optional fields if they are defined
      if (progress.displayName !== undefined && progress.displayName !== null) {
        data.displayName = progress.displayName;
      }
      if (progress.avatarEmoji !== undefined && progress.avatarEmoji !== null) {
        data.avatarEmoji = progress.avatarEmoji;
      }

      await firestore()
        .collection(USERS_COLLECTION)
        .doc(userId)
        .set(data, { merge: true });
    } catch (error) {
      console.error('Error saving user progress:', error);
      throw error;
    }
  }

  // Update high score with achievement checking
  async updateHighScore(
    userId: string,
    newScore: number,
    level: number
  ): Promise<{ progress: UserProgress; newAchievements: string[] }> {
    try {
      const currentProgress = await this.getUserProgress(userId);
      
      const updatedProgress: UserProgress = {
        highScore: Math.max(currentProgress?.highScore || 0, newScore),
        maxLevelReached: Math.max(currentProgress?.maxLevelReached || 1, level),
        totalGamesPlayed: (currentProgress?.totalGamesPlayed || 0) + 1,
        achievements: currentProgress?.achievements || [],
        dailyChallenge: currentProgress?.dailyChallenge,
        displayName: currentProgress?.displayName, // Preserve existing value
        avatarEmoji: currentProgress?.avatarEmoji, // Preserve existing value
      };

      // Check for new achievements
      const newAchievements = checkAchievements(updatedProgress);
      
      // Add new achievements
      if (updatedProgress.achievements) {
        newAchievements.forEach(achievementId => {
          if (!updatedProgress.achievements!.includes(achievementId)) {
            updatedProgress.achievements!.push(achievementId);
          }
        });
      }

      // Update daily challenge progress
      if (updatedProgress.dailyChallenge && !updatedProgress.dailyChallenge.completed) {
        updatedProgress.dailyChallenge.currentScore += newScore;
        if (updatedProgress.dailyChallenge.currentScore >= updatedProgress.dailyChallenge.targetScore) {
          updatedProgress.dailyChallenge.completed = true;
        }
      }

      await this.saveUserProgress(userId, updatedProgress);

      return { progress: updatedProgress, newAchievements };
    } catch (error) {
      console.error('Error updating high score:', error);
      throw error;
    }
  }

  // Initialize or get daily challenge
  async getDailyChallenge(userId: string): Promise<DailyChallenge> {
    try {
      const progress = await this.getUserProgress(userId);
      const today = new Date().toISOString().split('T')[0];

      // Check if daily challenge exists and is for today
      if (progress?.dailyChallenge && progress.dailyChallenge.date === today) {
        return progress.dailyChallenge;
      }

      // Create new daily challenge
      const seed = today.split('-').reduce((acc, val) => acc + parseInt(val), 0);
      const targetScore = 100 + (seed % 400);

      const newChallenge: DailyChallenge = {
        date: today,
        targetScore,
        currentScore: 0,
        completed: false,
      };

      // Save new challenge
      const updatedProgress: UserProgress = {
        ...progress,
        highScore: progress?.highScore || 0,
        maxLevelReached: progress?.maxLevelReached || 1,
        totalGamesPlayed: progress?.totalGamesPlayed || 0,
        achievements: progress?.achievements || [],
        dailyChallenge: newChallenge,
        displayName: progress?.displayName,
        avatarEmoji: progress?.avatarEmoji,
      };

      await this.saveUserProgress(userId, updatedProgress);

      return newChallenge;
    } catch (error) {
      console.error('Error getting daily challenge:', error);
      throw error;
    }
  }

  // Initialize new user
  async initializeUser(userId: string): Promise<UserProgress> {
    try {
      const existingProgress = await this.getUserProgress(userId);
      
      if (existingProgress) {
        return existingProgress;
      }

      // Create new user progress
      const today = new Date().toISOString().split('T')[0];
      const seed = today.split('-').reduce((acc, val) => acc + parseInt(val), 0);
      const targetScore = 100 + (seed % 400);

      const initialProgress: UserProgress = {
        highScore: 0,
        maxLevelReached: 1,
        totalGamesPlayed: 0,
        achievements: [],
        dailyChallenge: {
          date: today,
          targetScore,
          currentScore: 0,
          completed: false,
        },
      };

      await this.saveUserProgress(userId, initialProgress);

      return initialProgress;
    } catch (error) {
      console.error('Error initializing user:', error);
      throw error;
    }
  }

  // Update user profile (displayName and avatarEmoji)
  async updateProfile(
    userId: string,
    displayName: string,
    avatarEmoji: string
  ): Promise<void> {
    try {
      const normalizedName = displayName.trim().toLowerCase();
      
      console.log('[updateProfile] userId:', userId);
      console.log('[updateProfile] new displayName:', displayName, '→', normalizedName);
      
      // Get current user data to find old displayName
      const currentUserDoc = await firestore()
        .collection(USERS_COLLECTION)
        .doc(userId)
        .get();
      
      const oldDisplayNameLower = currentUserDoc.data()?.displayNameLowerCase;
      console.log('[updateProfile] old displayNameLower:', oldDisplayNameLower);
      
      // If the name hasn't changed, just update the avatar
      if (oldDisplayNameLower === normalizedName) {
        console.log('[updateProfile] Name unchanged, updating avatar only');
        await firestore()
          .collection(USERS_COLLECTION)
          .doc(userId)
          .set({
            displayName: displayName.trim(),
            displayNameLowerCase: normalizedName,
            avatarEmoji,
            updatedAt: firestore.FieldValue.serverTimestamp(),
          }, { merge: true });
        return;
      }
      
      const displayNameDoc = firestore()
        .collection(DISPLAYNAMES_COLLECTION)
        .doc(normalizedName);

      // Use a transaction to ensure atomicity
      await firestore().runTransaction(async (transaction) => {
        const doc = await transaction.get(displayNameDoc);
        
        const docData = doc.data();
        console.log('[updateProfile] displayName doc data:', docData);
        
        // Check if name is taken by another user
        if (docData) {
          const existingUserId = docData.userId;
          console.log('[updateProfile] existingUserId:', existingUserId);
          console.log('[updateProfile] current userId:', userId);
          
          if (existingUserId && existingUserId !== userId) {
            console.log('[updateProfile] Name taken by different user!');
            throw new Error('Ce pseudo est déjà utilisé par un autre joueur');
          }
        }

        // Delete old displayName document if it exists
        if (oldDisplayNameLower) {
          console.log('[updateProfile] Deleting old displayName:', oldDisplayNameLower);
          const oldDisplayNameDoc = firestore()
            .collection(DISPLAYNAMES_COLLECTION)
            .doc(oldDisplayNameLower);
          transaction.delete(oldDisplayNameDoc);
        }

        // Reserve the new displayName
        console.log('[updateProfile] Reserving new displayName:', normalizedName);
        transaction.set(displayNameDoc, {
          userId,
          displayName: displayName.trim(),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });

        // Update user profile
        const userDoc = firestore().collection(USERS_COLLECTION).doc(userId);
        transaction.set(userDoc, {
          displayName: displayName.trim(),
          displayNameLowerCase: normalizedName,
          displayNameLower: normalizedName, // Pour la recherche d'amis
          avatarEmoji,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
      });
      
      console.log('[updateProfile] Success!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  // Check if displayName is unique (case-insensitive)
  async isDisplayNameUnique(displayName: string, currentUserId: string): Promise<boolean> {
    try {
      const normalizedName = displayName.trim().toLowerCase();
      
      const doc = await firestore()
        .collection(DISPLAYNAMES_COLLECTION)
        .doc(normalizedName)
        .get();

      // If no document found, name is unique
      if (!doc.exists) {
        return true;
      }

      // If found, check if it's the current user's own name
      return doc.data()?.userId === currentUserId;
    } catch (error) {
      console.error('Error checking displayName uniqueness:', error);
      return false;
    }
  }

  // ============================================
  // CHALLENGE MANAGEMENT - Phase 8
  // ============================================

  /**
   * Get challenge progress for a user
   */
  async getChallengeProgress(userId: string): Promise<ChallengeProgress | null> {
    try {
      const doc = await firestore()
        .collection(CHALLENGES_COLLECTION)
        .doc(userId)
        .get();

      if (!doc.exists) {
        return null;
      }

      return doc.data() as ChallengeProgress;
    } catch (error) {
      console.error('Error getting challenge progress:', error);
      return null;
    }
  }

  /**
   * Save challenge progress
   */
  async saveChallengeProgress(progress: ChallengeProgress): Promise<void> {
    try {
      await firestore()
        .collection(CHALLENGES_COLLECTION)
        .doc(progress.userId)
        .set(progress, { merge: true });
    } catch (error) {
      console.error('Error saving challenge progress:', error);
      throw error;
    }
  }

  /**
   * Update user coins and XP after claiming challenge reward
   */
  async claimChallengeReward(
    userId: string,
    xp: number,
    coins: number
  ): Promise<UserProgress> {
    try {
      const currentProgress = await this.getUserProgress(userId);
      
      const updatedProgress: UserProgress = {
        ...currentProgress,
        highScore: currentProgress?.highScore || 0,
        maxLevelReached: currentProgress?.maxLevelReached || 1,
        totalGamesPlayed: currentProgress?.totalGamesPlayed || 0,
        achievements: currentProgress?.achievements || [],
        xp: (currentProgress?.xp || 0) + xp,
        coins: (currentProgress?.coins || 0) + coins,
      };

      await this.saveUserProgress(userId, updatedProgress);

      return updatedProgress;
    } catch (error) {
      console.error('Error claiming challenge reward:', error);
      throw error;
    }
  }

  /**
   * Update game mode specific records
   */
  async updateModeRecords(
    userId: string,
    updates: {
      survivalBestStreak?: number;
      timeAttackBestScore?: number;
      zenBestAccuracy?: number;
    }
  ): Promise<void> {
    try {
      const data: any = {
        updatedAt: firestore.FieldValue.serverTimestamp(),
      };

      if (updates.survivalBestStreak !== undefined) {
        data.survivalBestStreak = updates.survivalBestStreak;
      }
      if (updates.timeAttackBestScore !== undefined) {
        data.timeAttackBestScore = updates.timeAttackBestScore;
      }
      if (updates.zenBestAccuracy !== undefined) {
        data.zenBestAccuracy = updates.zenBestAccuracy;
      }

      await firestore()
        .collection(USERS_COLLECTION)
        .doc(userId)
        .set(data, { merge: true });
    } catch (error) {
      console.error('Error updating mode records:', error);
      throw error;
    }
  }
}

export const firestoreService = new FirestoreService();
