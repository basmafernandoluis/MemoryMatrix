/**
 * i18n Configuration - Internationalization Service
 * 
 * Langues supportées :
 * - Français (fr)
 * - Anglais (en)
 * - Espagnol (es)
 * - Allemand (de)
 * - Japonais (ja)
 * - Arabe (ar) - RTL
 * - Chinois simplifié (zh)
 * - Portugais (pt)
 */

import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';

// Import translations
import fr from './locales/fr.json';
import en from './locales/en.json';
import es from './locales/es.json';
import de from './locales/de.json';
import ja from './locales/ja.json';
import ar from './locales/ar.json';
import zh from './locales/zh.json';
import pt from './locales/pt.json';

const STORAGE_KEY = '@memory_matrix_language';

// Initialize i18n
const i18n = new I18n({
  fr,
  en,
  es,
  de,
  ja,
  ar,
  zh,
  pt,
});

// Set default locale
i18n.defaultLocale = 'fr';
i18n.enableFallback = true;

// RTL languages
const RTL_LANGUAGES = ['ar'];

export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  isRTL: boolean;
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', isRTL: false },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', isRTL: false },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', isRTL: false },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', isRTL: false },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', isRTL: false },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', isRTL: true },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', isRTL: false },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', isRTL: false },
];

class I18nService {
  private currentLanguage: string = 'fr';
  private listeners: ((locale: string) => void)[] = [];

  /**
   * Initialize i18n service
   */
  async init(): Promise<string> {
    try {
      // Try to load saved language
      const savedLanguage = await AsyncStorage.getItem(STORAGE_KEY);
      
      if (savedLanguage) {
        await this.setLanguage(savedLanguage);
        return savedLanguage;
      }

      // Detect device language
      const locales = Localization.getLocales();
      const deviceLocale = locales[0]?.languageCode || 'fr';
      const supportedCodes = SUPPORTED_LANGUAGES.map(l => l.code);
      
      if (supportedCodes.includes(deviceLocale)) {
        await this.setLanguage(deviceLocale);
        return deviceLocale;
      }

      // Default to French
      await this.setLanguage('fr');
      return 'fr';
    } catch (error) {
      console.error('Error initializing i18n:', error);
      await this.setLanguage('fr');
      return 'fr';
    }
  }

  /**
   * Set current language
   */
  async setLanguage(languageCode: string): Promise<void> {
    try {
      const language = SUPPORTED_LANGUAGES.find(l => l.code === languageCode);
      if (!language) {
        throw new Error(`Language ${languageCode} not supported`);
      }

      this.currentLanguage = languageCode;
      i18n.locale = languageCode;

      // Handle RTL
      const isRTL = RTL_LANGUAGES.includes(languageCode);
      if (I18nManager.isRTL !== isRTL) {
        I18nManager.allowRTL(isRTL);
        I18nManager.forceRTL(isRTL);
      }

      // Save to storage
      await AsyncStorage.setItem(STORAGE_KEY, languageCode);

      // Notify listeners
      this.notifyListeners(languageCode);
    } catch (error) {
      console.error('Error setting language:', error);
      throw error;
    }
  }

  /**
   * Get current language
   */
  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  /**
   * Get current language config
   */
  getCurrentLanguageConfig(): LanguageConfig | undefined {
    return SUPPORTED_LANGUAGES.find(l => l.code === this.currentLanguage);
  }

  /**
   * Check if current language is RTL
   */
  isRTL(): boolean {
    return RTL_LANGUAGES.includes(this.currentLanguage);
  }

  /**
   * Get all supported languages
   */
  getSupportedLanguages(): LanguageConfig[] {
    return SUPPORTED_LANGUAGES;
  }

  /**
   * Translate a key
   */
  t(key: string, options?: object): string {
    return i18n.t(key, options);
  }

  /**
   * Subscribe to language changes
   */
  subscribe(listener: (locale: string) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(locale: string): void {
    this.listeners.forEach(listener => listener(locale));
  }
}

export const i18nService = new I18nService();
export { i18n };
