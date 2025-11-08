/**
 * useTranslation Hook
 * 
 * Hook personnalisé pour accéder aux traductions et gérer la langue
 * dans les composants React
 */

import { useState, useEffect } from 'react';
import { i18nService, LanguageConfig } from '../services/i18nService';

export interface UseTranslationReturn {
  t: (key: string, options?: object) => string;
  locale: string;
  isRTL: boolean;
  currentLanguage: LanguageConfig | undefined;
  setLanguage: (languageCode: string) => Promise<void>;
  availableLanguages: LanguageConfig[];
}

export const useTranslation = (): UseTranslationReturn => {
  const [locale, setLocale] = useState(i18nService.getCurrentLanguage());

  useEffect(() => {
    // Subscribe to language changes
    const unsubscribe = i18nService.subscribe((newLocale) => {
      setLocale(newLocale);
    });

    return unsubscribe;
  }, []);

  const t = (key: string, options?: object): string => {
    return i18nService.t(key, options);
  };

  const setLanguage = async (languageCode: string): Promise<void> => {
    await i18nService.setLanguage(languageCode);
  };

  return {
    t,
    locale,
    isRTL: i18nService.isRTL(),
    currentLanguage: i18nService.getCurrentLanguageConfig(),
    setLanguage,
    availableLanguages: i18nService.getSupportedLanguages(),
  };
};
