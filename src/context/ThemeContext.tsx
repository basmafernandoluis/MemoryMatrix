import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme, ThemeColors, UserThemePreferences } from '../types';
import { themeService } from '../services/themeService';
import { DEFAULT_THEME } from '../constants/themes';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

interface ThemeContextType {
  theme: Theme;
  colors: ThemeColors;
  setTheme: (themeId: string) => Promise<void>;
  unlockTheme: (themeId: string) => Promise<void>;
  isThemeUnlocked: (themeId: string) => boolean;
  availableThemes: Theme[];
  userPreferences: UserThemePreferences | null;
  loading: boolean;
  refreshThemes: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);
  const [userPreferences, setUserPreferences] = useState<UserThemePreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [availableThemes, setAvailableThemes] = useState<Theme[]>([]);

  // Charge les préférences au démarrage
  useEffect(() => {
    loadUserPreferences();
  }, []);

  // Écoute les changements d'authentification
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user: FirebaseAuthTypes.User | null) => {
      if (user) {
        loadUserPreferencesFromFirestore(user.uid);
      } else {
        loadUserPreferences();
      }
    });

    return () => unsubscribe();
  }, []);

  /**
   * Charge les préférences depuis le stockage local
   */
  const loadUserPreferences = async () => {
    try {
      setLoading(true);
      const preferences = await themeService.loadPreferences();
      setUserPreferences(preferences);
      
      const activeTheme = themeService.getActiveTheme();
      setThemeState(activeTheme);
      
      const themes = themeService.getAvailableThemes();
      setAvailableThemes(themes);
    } catch (error) {
      console.error('Error loading user preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Charge les préférences depuis Firestore
   */
  const loadUserPreferencesFromFirestore = async (userId: string) => {
    try {
      setLoading(true);
      const preferences = await themeService.loadPreferencesFromFirestore(userId);
      
      if (preferences) {
        setUserPreferences(preferences);
      } else {
        // Initialise pour un nouvel utilisateur
        await themeService.initializeForNewUser(userId);
        await loadUserPreferences();
      }
      
      const activeTheme = themeService.getActiveTheme();
      setThemeState(activeTheme);
      
      const themes = themeService.getAvailableThemes();
      setAvailableThemes(themes);
    } catch (error) {
      console.error('Error loading preferences from Firestore:', error);
      // Fallback sur le stockage local
      await loadUserPreferences();
    } finally {
      setLoading(false);
    }
  };

  /**
   * Applique un nouveau thème
   */
  const setTheme = async (themeId: string) => {
    try {
      const userId = auth().currentUser?.uid;
      await themeService.applyTheme(themeId, userId);
      
      const newTheme = themeService.getActiveTheme();
      setThemeState(newTheme);
      
      // Recharge les préférences pour mettre à jour l'UI
      const preferences = await themeService.loadPreferences();
      setUserPreferences(preferences);
    } catch (error) {
      console.error('Error applying theme:', error);
      throw error;
    }
  };

  /**
   * Déverrouille un thème
   */
  const unlockTheme = async (themeId: string) => {
    const userId = auth().currentUser?.uid;
    if (!userId) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      await themeService.unlockTheme(themeId, userId);
      
      // Recharge les préférences
      const preferences = await themeService.loadPreferences();
      setUserPreferences(preferences);
    } catch (error) {
      console.error('Error unlocking theme:', error);
      throw error;
    }
  };

  /**
   * Vérifie si un thème est déverrouillé
   */
  const isThemeUnlocked = (themeId: string): boolean => {
    return themeService.isThemeUnlocked(themeId);
  };

  /**
   * Rafraîchit la liste des thèmes disponibles
   */
  const refreshThemes = () => {
    const themes = themeService.getAvailableThemes();
    setAvailableThemes(themes);
  };

  const value: ThemeContextType = {
    theme,
    colors: theme.colors,
    setTheme,
    unlockTheme,
    isThemeUnlocked,
    availableThemes,
    userPreferences,
    loading,
    refreshThemes,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

/**
 * Hook pour accéder au contexte du thème
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
