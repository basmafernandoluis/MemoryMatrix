import { Theme, ThemeColors, ThemeEffects } from '../types';

// Effets visuels par défaut
const defaultEffects: ThemeEffects = {
  particlesEnabled: true,
  particlesIntensity: 'medium',
  confettiEnabled: true,
  animationSpeed: 'normal',
  glowEffects: true,
  shakeEffects: true,
};

// 🌟 THÈME PAR DÉFAUT (Classique)
const classicTheme: Theme = {
  id: 'classic',
  name: 'Classique',
  description: 'Le thème original de Memory Matrix',
  category: 'default',
  icon: '🎮',
  preview: '',
  isPremium: false,
  unlockRequirements: {
    type: 'free',
  },
  effects: defaultEffects,
  colors: {
    // Couleurs principales
    primary: '#4A90E2',
    primaryDark: '#2E5C8A',
    primaryLight: '#7AB8F5',
    secondary: '#50C878',
    accent: '#FFD700',
    
    // Couleurs de fond
    background: '#1a1a2e',
    surface: '#16213e',
    surfaceLight: '#1f2b4a',
    border: '#2a3a5e',
    
    // Couleurs de texte
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    textDisabled: '#606060',
    
    // Couleurs de jeu
    cellActive: '#FFD700', // Or brillant - très visible
    cellInactive: '#2a2a3e',
    cellCorrect: '#50C878',
    cellIncorrect: '#FF6B6B',
    
    // États
    success: '#50C878',
    warning: '#FFD700',
    error: '#FF6B6B',
    info: '#4A90E2',
    
    // Effets
    shadow: 'rgba(0, 0, 0, 0.5)',
    overlay: 'rgba(0, 0, 0, 0.7)',
    glow: 'rgba(74, 144, 226, 0.5)',
  },
};

// 🌙 THÈME DARK MODE
const darkTheme: Theme = {
  id: 'dark',
  name: 'Nuit Profonde',
  description: 'Parfait pour jouer dans le noir',
  category: 'default',
  icon: '🌙',
  preview: '',
  isPremium: false,
  unlockRequirements: {
    type: 'free',
  },
  effects: defaultEffects,
  colors: {
    primary: '#BB86FC',
    primaryDark: '#7F39FB',
    primaryLight: '#E1BFFF',
    secondary: '#03DAC6',
    accent: '#CF6679',
    
    background: '#000000',
    surface: '#121212',
    surfaceLight: '#1E1E1E',
    border: '#2E2E2E',
    
    text: '#E0E0E0',
    textSecondary: '#9E9E9E',
    textDisabled: '#5E5E5E',
    
    cellActive: '#BB86FC',
    cellInactive: '#1E1E1E',
    cellCorrect: '#03DAC6',
    cellIncorrect: '#CF6679',
    
    success: '#03DAC6',
    warning: '#FFC107',
    error: '#CF6679',
    info: '#BB86FC',
    
    shadow: 'rgba(0, 0, 0, 0.8)',
    overlay: 'rgba(0, 0, 0, 0.9)',
    glow: 'rgba(187, 134, 252, 0.4)',
  },
};

// 💡 THÈME NEON
const neonTheme: Theme = {
  id: 'neon',
  name: 'Neon Cyberpunk',
  description: 'Vibrations futuristes et néons éclatants',
  category: 'premium',
  icon: '💡',
  preview: '',
  isPremium: true,
  unlockRequirements: {
    type: 'coins',
    value: 0,
  },
  effects: {
    ...defaultEffects,
    particlesIntensity: 'high',
    glowEffects: true,
  },
  colors: {
    primary: '#FF006E',
    primaryDark: '#C20052',
    primaryLight: '#FF4D9A',
    secondary: '#00F5FF',
    accent: '#FFBE0B',
    
    background: '#0A0E27',
    surface: '#1A1F3A',
    surfaceLight: '#252B47',
    border: '#353B5F',
    
    text: '#FFFFFF',
    textSecondary: '#00F5FF',
    textDisabled: '#4A5175',
    
    cellActive: '#FF006E',
    cellInactive: '#1A1F3A',
    cellCorrect: '#00F5FF',
    cellIncorrect: '#FF006E',
    
    success: '#00F5FF',
    warning: '#FFBE0B',
    error: '#FF006E',
    info: '#8338EC',
    
    shadow: 'rgba(255, 0, 110, 0.3)',
    overlay: 'rgba(10, 14, 39, 0.85)',
    glow: 'rgba(255, 0, 110, 0.6)',
  },
};

// 🌿 THÈME NATURE
const natureTheme: Theme = {
  id: 'nature',
  name: 'Nature Zen',
  description: 'Tons apaisants inspirés de la nature',
  category: 'premium',
  icon: '🌿',
  preview: '',
  isPremium: true,
  unlockRequirements: {
    type: 'coins',
    value: 150,
  },
  effects: {
    ...defaultEffects,
    particlesIntensity: 'low',
    animationSpeed: 'slow',
  },
  colors: {
    primary: '#2D6A4F',
    primaryDark: '#1B4332',
    primaryLight: '#40916C',
    secondary: '#95D5B2',
    accent: '#FFB703',
    
    background: '#0F2027',
    surface: '#1A3A2E',
    surfaceLight: '#2A4A3E',
    border: '#3A5A4E',
    
    text: '#E8F5E9',
    textSecondary: '#95D5B2',
    textDisabled: '#52796F',
    
    cellActive: '#40916C',
    cellInactive: '#1A3A2E',
    cellCorrect: '#95D5B2',
    cellIncorrect: '#D62828',
    
    success: '#95D5B2',
    warning: '#FFB703',
    error: '#D62828',
    info: '#2D6A4F',
    
    shadow: 'rgba(0, 0, 0, 0.4)',
    overlay: 'rgba(15, 32, 39, 0.8)',
    glow: 'rgba(64, 145, 108, 0.3)',
  },
};

// 🌊 THÈME OCEAN
const oceanTheme: Theme = {
  id: 'ocean',
  name: 'Profondeurs Océaniques',
  description: 'Plongez dans les profondeurs marines',
  category: 'premium',
  icon: '🌊',
  preview: '',
  isPremium: true,
  unlockRequirements: {
    type: 'coins',
    value: 150,
  },
  effects: defaultEffects,
  colors: {
    primary: '#0077BE',
    primaryDark: '#005280',
    primaryLight: '#00A8E8',
    secondary: '#00D9FF',
    accent: '#FFD60A',
    
    background: '#001F3F',
    surface: '#003459',
    surfaceLight: '#004A6B',
    border: '#005A8B',
    
    text: '#E0F7FA',
    textSecondary: '#80DEEA',
    textDisabled: '#546E7A',
    
    cellActive: '#0077BE',
    cellInactive: '#003459',
    cellCorrect: '#00D9FF',
    cellIncorrect: '#FF6B9D',
    
    success: '#00D9FF',
    warning: '#FFD60A',
    error: '#FF6B9D',
    info: '#0077BE',
    
    shadow: 'rgba(0, 119, 190, 0.3)',
    overlay: 'rgba(0, 31, 63, 0.85)',
    glow: 'rgba(0, 119, 190, 0.4)',
  },
};

// 🌅 THÈME SUNSET
const sunsetTheme: Theme = {
  id: 'sunset',
  name: 'Coucher de Soleil',
  description: 'Chaleureuses couleurs du crépuscule',
  category: 'premium',
  icon: '🌅',
  preview: '',
  isPremium: true,
  unlockRequirements: {
    type: 'xp',
    value: 1000,
  },
  effects: defaultEffects,
  colors: {
    primary: '#FF6B35',
    primaryDark: '#D84315',
    primaryLight: '#FF8F6D',
    secondary: '#FFA947',
    accent: '#FFD23F',
    
    background: '#2C1B18',
    surface: '#3E2723',
    surfaceLight: '#4E342E',
    border: '#5E443E',
    
    text: '#FFF3E0',
    textSecondary: '#FFCC80',
    textDisabled: '#795548',
    
    cellActive: '#FF6B35',
    cellInactive: '#3E2723',
    cellCorrect: '#FFA947',
    cellIncorrect: '#E91E63',
    
    success: '#FFA947',
    warning: '#FFD23F',
    error: '#E91E63',
    info: '#FF6B35',
    
    shadow: 'rgba(255, 107, 53, 0.3)',
    overlay: 'rgba(44, 27, 24, 0.85)',
    glow: 'rgba(255, 107, 53, 0.4)',
  },
};

// 🎄 THÈME NOËL (Saisonnier)
const christmasTheme: Theme = {
  id: 'christmas',
  name: 'Esprit de Noël',
  description: 'Célébrez les fêtes de fin d\'année',
  category: 'seasonal',
  icon: '🎄',
  preview: '',
  isPremium: false,
  isLimited: true,
  availableFrom: new Date('2024-12-01'),
  availableTo: new Date('2025-01-07'),
  unlockRequirements: {
    type: 'free',
  },
  effects: {
    ...defaultEffects,
    particlesIntensity: 'high',
    confettiEnabled: true,
  },
  colors: {
    primary: '#C41E3A',
    primaryDark: '#8B0000',
    primaryLight: '#E74C3C',
    secondary: '#2E7D32',
    accent: '#FFD700',
    
    background: '#1A0F0F',
    surface: '#2A1515',
    surfaceLight: '#3A1F1F',
    border: '#4A2F2F',
    
    text: '#FFFFFF',
    textSecondary: '#FFD700',
    textDisabled: '#8B8B8B',
    
    cellActive: '#C41E3A',
    cellInactive: '#2A1515',
    cellCorrect: '#2E7D32',
    cellIncorrect: '#C41E3A',
    
    success: '#2E7D32',
    warning: '#FFD700',
    error: '#C41E3A',
    info: '#1976D2',
    
    shadow: 'rgba(196, 30, 58, 0.4)',
    overlay: 'rgba(26, 15, 15, 0.9)',
    glow: 'rgba(255, 215, 0, 0.5)',
  },
};

// 🧠 THÈME NEURO GAMING
const neuroGamingTheme: Theme = {
  id: 'neuroGaming',
  name: 'Neuro Gaming',
  description: 'L\'univers gaming de Neuro avec néons cyberpunk',
  category: 'premium',
  icon: '🧠',
  preview: '',
  isPremium: true,
  unlockRequirements: {
    type: 'xp',
    value: 0,
  },
  effects: {
    ...defaultEffects,
    particlesIntensity: 'high',
    glowEffects: true,
    animationSpeed: 'fast',
  },
  colors: {
    primary: '#A78BFA',
    primaryDark: '#7C3AED',
    primaryLight: '#C4B5FD',
    secondary: '#FF6B9D',
    accent: '#60A5FA',
    
    background: '#0F0F1E',
    surface: '#1A1A2E',
    surfaceLight: '#252538',
    border: '#353B5F',
    
    text: '#FFFFFF',
    textSecondary: '#C4B5FD',
    textDisabled: '#6B6B80',
    
    cellActive: '#FF6B9D',
    cellInactive: '#1A1A2E',
    cellCorrect: '#60A5FA',
    cellIncorrect: '#EF4444',
    
    success: '#60A5FA',
    warning: '#FBBF24',
    error: '#EF4444',
    info: '#A78BFA',
    
    shadow: 'rgba(255, 107, 157, 0.4)',
    overlay: 'rgba(15, 15, 30, 0.9)',
    glow: 'rgba(167, 139, 250, 0.6)',
  },
};

// 🎃 THÈME HALLOWEEN (Saisonnier)
const halloweenTheme: Theme = {
  id: 'halloween',
  name: 'Nuit d\'Halloween',
  description: 'Ambiance terrifiante pour Halloween',
  category: 'seasonal',
  icon: '🎃',
  preview: '',
  isPremium: false,
  isLimited: true,
  availableFrom: new Date('2024-10-15'),
  availableTo: new Date('2024-11-02'),
  unlockRequirements: {
    type: 'free',
  },
  effects: {
    ...defaultEffects,
    particlesIntensity: 'high',
  },
  colors: {
    primary: '#FF6F00',
    primaryDark: '#D84315',
    primaryLight: '#FF9800',
    secondary: '#7B1FA2',
    accent: '#00E676',
    
    background: '#0D0208',
    surface: '#1A1013',
    surfaceLight: '#261820',
    border: '#362830',
    
    text: '#FFFFFF',
    textSecondary: '#FF6F00',
    textDisabled: '#6B6B6B',
    
    cellActive: '#FF6F00',
    cellInactive: '#1A1013',
    cellCorrect: '#00E676',
    cellIncorrect: '#7B1FA2',
    
    success: '#00E676',
    warning: '#FF9800',
    error: '#7B1FA2',
    info: '#FF6F00',
    
    shadow: 'rgba(255, 111, 0, 0.4)',
    overlay: 'rgba(13, 2, 8, 0.95)',
    glow: 'rgba(255, 111, 0, 0.6)',
  },
};

// Export de tous les thèmes disponibles
export const AVAILABLE_THEMES: Theme[] = [
  classicTheme,
  darkTheme,
  neonTheme,
  neuroGamingTheme,
  natureTheme,
  oceanTheme,
  sunsetTheme,
  christmasTheme,
  halloweenTheme,
];

// Thème par défaut
export const DEFAULT_THEME = classicTheme;

// Helper pour vérifier si un thème saisonnier est disponible
export const isSeasonalThemeAvailable = (theme: Theme): boolean => {
  if (!theme.isLimited || !theme.availableFrom || !theme.availableTo) {
    return true;
  }
  
  const now = new Date();
  return now >= theme.availableFrom && now <= theme.availableTo;
};

// Helper pour obtenir les thèmes disponibles actuellement
export const getAvailableThemesNow = (): Theme[] => {
  return AVAILABLE_THEMES.filter(theme => isSeasonalThemeAvailable(theme));
};
