import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import { Theme, UserThemePreferences } from '../types';
import { AVAILABLE_THEMES, DEFAULT_THEME, isSeasonalThemeAvailable } from '../constants/themes';
import { firestoreService } from './firestore';

const THEME_STORAGE_KEY = '@MemoryMatrix:theme_preferences';

class ThemeService {
  private static instance: ThemeService;
  private activeTheme: Theme = DEFAULT_THEME;
  private userPreferences: UserThemePreferences | null = null;

  private constructor() {
    // Singleton pattern
  }

  static getInstance(): ThemeService {
    if (!ThemeService.instance) {
      ThemeService.instance = new ThemeService();
    }
    return ThemeService.instance;
  }

  /**
   * Récupère tous les thèmes disponibles
   */
  getAvailableThemes(): Theme[] {
    return AVAILABLE_THEMES.filter(theme => isSeasonalThemeAvailable(theme));
  }

  /**
   * Récupère le thème actif
   */
  getActiveTheme(): Theme {
    return this.activeTheme;
  }

  /**
   * Charge les préférences de thème depuis le stockage local
   */
  async loadPreferences(): Promise<UserThemePreferences | null> {
    try {
      const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (stored) {
        this.userPreferences = JSON.parse(stored);
        
        // Charge le thème actif
        if (this.userPreferences?.activeThemeId) {
          const theme = this.getThemeById(this.userPreferences.activeThemeId);
          if (theme) {
            this.activeTheme = theme;
          }
        }
        
        return this.userPreferences;
      }
      return null;
    } catch (error) {
      console.error('Error loading theme preferences:', error);
      return null;
    }
  }

  /**
   * Charge les préférences depuis Firestore
   */
  async loadPreferencesFromFirestore(userId: string): Promise<UserThemePreferences | null> {
    try {
      const userDoc = await firestore()
        .collection('users')
        .doc(userId)
        .get();
      
  if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData?.themePreferences) {
          this.userPreferences = userData.themePreferences;
          
          // Charge le thème actif
          if (this.userPreferences?.activeThemeId) {
            const theme = this.getThemeById(this.userPreferences.activeThemeId);
            if (theme) {
              this.activeTheme = theme;
            }
          }
          
          // Sauvegarde en local pour le cache
          if (this.userPreferences) {
            await this.savePreferencesToStorage(this.userPreferences);
          }
          
          return this.userPreferences;
        }
      }
      return null;
    } catch (error) {
      console.error('Error loading theme preferences from Firestore:', error);
      return null;
    }
  }

  /**
   * Sauvegarde les préférences localement
   */
  private async savePreferencesToStorage(preferences: UserThemePreferences): Promise<void> {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(preferences));
      this.userPreferences = preferences;
    } catch (error) {
      console.error('Error saving theme preferences to storage:', error);
    }
  }

  /**
   * Sauvegarde les préférences dans Firestore
   */
  async savePreferencesToFirestore(userId: string, preferences: UserThemePreferences): Promise<void> {
    try {
      await firestore()
        .collection('users')
        .doc(userId)
        .set(
          { themePreferences: preferences },
          { merge: true }
        );
    } catch (error) {
      console.error('Error saving theme preferences to Firestore:', error);
      throw error;
    }
  }

  /**
   * Applique un thème
   */
  async applyTheme(themeId: string, userId?: string): Promise<void> {
    const theme = this.getThemeById(themeId);
    
    if (!theme) {
      throw new Error('Thème non trouvé');
    }

    // Vérifie si le thème est déverrouillé
    if (!this.isThemeUnlocked(themeId)) {
      throw new Error('Ce thème n\'est pas déverrouillé');
    }

    // Vérifie si le thème saisonnier est disponible
    if (!isSeasonalThemeAvailable(theme)) {
      throw new Error('Ce thème n\'est plus disponible');
    }

    this.activeTheme = theme;

    // Met à jour les préférences
    const newPreferences: UserThemePreferences = {
      ...this.userPreferences,
      activeThemeId: themeId,
      unlockedThemes: this.userPreferences?.unlockedThemes || ['classic', 'dark'],
      customThemes: this.userPreferences?.customThemes || [],
      effects: this.userPreferences?.effects || theme.effects,
    };

    // Sauvegarde locale
    await this.savePreferencesToStorage(newPreferences);

    // Sauvegarde Firestore si userId fourni
    if (userId) {
      await this.savePreferencesToFirestore(userId, newPreferences);
    }
  }

  /**
   * Déverrouille un thème
   */
  async unlockTheme(themeId: string, userId: string): Promise<void> {
    const theme = this.getThemeById(themeId);
    
    if (!theme) {
      throw new Error('Thème non trouvé');
    }

    // Vérifie si déjà déverrouillé
    if (this.isThemeUnlocked(themeId)) {
      return; // Déjà déverrouillé
    }

    // Vérifie les conditions de déverrouillage
    const canUnlock = await this.checkUnlockRequirements(theme, userId);
    if (!canUnlock) {
      throw new Error('Conditions de déverrouillage non remplies');
    }

    // Déduit le coût si nécessaire
    await this.deductUnlockCost(theme, userId);

    // Ajoute aux thèmes déverrouillés
    const unlockedThemes = this.userPreferences?.unlockedThemes || ['classic', 'dark'];
    if (!unlockedThemes.includes(themeId)) {
      unlockedThemes.push(themeId);
    }

    const newPreferences: UserThemePreferences = {
      ...this.userPreferences,
      activeThemeId: this.userPreferences?.activeThemeId || 'classic',
      unlockedThemes: unlockedThemes,
      customThemes: this.userPreferences?.customThemes || [],
      effects: this.userPreferences?.effects || theme.effects,
    };

    // Sauvegarde
    await this.savePreferencesToStorage(newPreferences);
    await this.savePreferencesToFirestore(userId, newPreferences);
  }

  /**
   * Vérifie si un thème est déverrouillé
   */
  isThemeUnlocked(themeId: string): boolean {
    // Les thèmes gratuits et saisonniers sont toujours déverrouillés
    const theme = this.getThemeById(themeId);
    if (!theme) return false;
    
    if (theme.unlockRequirements.type === 'free') {
      return true;
    }

    const unlockedThemes = this.userPreferences?.unlockedThemes || ['classic', 'dark'];
    return unlockedThemes.includes(themeId);
  }

  /**
   * Vérifie les conditions de déverrouillage
   */
  private async checkUnlockRequirements(theme: Theme, userId: string): Promise<boolean> {
    const { unlockRequirements } = theme;

    switch (unlockRequirements.type) {
      case 'free':
        return true;

      case 'coins':
        const userProgress = await firestoreService.getUserProgress(userId);
        return userProgress ? (userProgress.coins || 0) >= (unlockRequirements.value || 0) : false;

      case 'xp':
        const statsXP = await firestoreService.getUserProgress(userId);
        return statsXP ? (statsXP.xp || 0) >= (unlockRequirements.value || 0) : false;

      case 'level':
        const statsLevel = await firestoreService.getUserProgress(userId);
        const calculatedLevel = Math.floor((statsLevel?.xp || 0) / 100) + 1;
        return calculatedLevel >= (unlockRequirements.value || 0);

      case 'achievement':
        // Vérifier si l'achievement est débloqué
        const achievementId = unlockRequirements.achievementId;
        if (!achievementId) return false;
        
        const userDoc = await firestore()
          .collection('users')
          .doc(userId)
          .get();
          
  if (userDoc.exists()) {
          const userData = userDoc.data();
          const achievements = userData?.achievements || {};
          return achievements[achievementId]?.unlocked || false;
        }
        return false;

      default:
        return false;
    }
  }

  /**
   * Déduit le coût de déverrouillage
   */
  private async deductUnlockCost(theme: Theme, userId: string): Promise<void> {
    const { unlockRequirements } = theme;

    if (unlockRequirements.type === 'coins' && unlockRequirements.value) {
      // Utilise claimChallengeReward avec montant négatif
      await firestoreService.claimChallengeReward(userId, 0, -unlockRequirements.value);
    }
    // XP, level et achievements ne nécessitent pas de déduction
  }

  /**
   * Récupère un thème par son ID
   */
  getThemeById(themeId: string): Theme | undefined {
    return AVAILABLE_THEMES.find(theme => theme.id === themeId);
  }

  /**
   * Met à jour les préférences d'effets visuels
   */
  async updateEffectsPreferences(
    userId: string,
    updates: Partial<UserThemePreferences>
  ): Promise<void> {
    const currentTheme = this.getActiveTheme();
    
    const newPreferences: UserThemePreferences = {
      ...this.userPreferences,
      activeThemeId: this.userPreferences?.activeThemeId || 'classic',
      unlockedThemes: this.userPreferences?.unlockedThemes || ['classic', 'dark'],
      customThemes: this.userPreferences?.customThemes || [],
      effects: updates.effects ?? this.userPreferences?.effects ?? currentTheme.effects,
    };

    await this.savePreferencesToStorage(newPreferences);
    await this.savePreferencesToFirestore(userId, newPreferences);
  }

  /**
   * Initialise les préférences pour un nouvel utilisateur
   */
  async initializeForNewUser(userId: string): Promise<void> {
    const defaultPreferences: UserThemePreferences = {
      activeThemeId: 'classic',
      unlockedThemes: ['classic', 'dark'], // Thèmes gratuits par défaut
      customThemes: [],
      effects: DEFAULT_THEME.effects,
    };

    await this.savePreferencesToStorage(defaultPreferences);
    await this.savePreferencesToFirestore(userId, defaultPreferences);
  }

  /**
   * Réinitialise au thème par défaut
   */
  async resetToDefault(userId?: string): Promise<void> {
    this.activeTheme = DEFAULT_THEME;

    const newPreferences: UserThemePreferences = {
      activeThemeId: 'classic',
      unlockedThemes: ['classic', 'dark'],
      customThemes: [],
      effects: DEFAULT_THEME.effects,
    };

    await this.savePreferencesToStorage(newPreferences);
    
    if (userId) {
      await this.savePreferencesToFirestore(userId, newPreferences);
    }
  }
}

export const themeService = ThemeService.getInstance();
