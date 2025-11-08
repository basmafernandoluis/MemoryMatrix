/**
 * Language Selection Screen
 * 
 * Écran permettant à l'utilisateur de choisir sa langue préférée
 * Supporte 8 langues avec drapeaux et noms natifs
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/gameConfig';
import { SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS } from '../constants/designTokens';
import { BackButton } from '../components/BackButton';
import { useTranslation } from '../hooks/useTranslation';
import type { LanguageConfig } from '../services/i18nService';

interface LanguageSelectionScreenProps {
  onBack: () => void;
}

export const LanguageSelectionScreen: React.FC<LanguageSelectionScreenProps> = ({
  onBack,
}) => {
  const { t, locale, setLanguage, availableLanguages } = useTranslation();
  const [changingLanguage, setChangingLanguage] = useState<string | null>(null);

  const handleLanguageSelect = async (languageCode: string) => {
    if (languageCode === locale) return;

    try {
      setChangingLanguage(languageCode);
      await setLanguage(languageCode);
      // Give a small delay for UI feedback
      setTimeout(() => {
        setChangingLanguage(null);
      }, 300);
    } catch (error) {
      console.error('Error changing language:', error);
      setChangingLanguage(null);
    }
  };

  const renderLanguageCard = (language: LanguageConfig) => {
    const isSelected = locale === language.code;
    const isChanging = changingLanguage === language.code;

    return (
      <TouchableOpacity
        key={language.code}
        style={[
          styles.languageCard,
          isSelected && styles.selectedCard,
        ]}
        onPress={() => handleLanguageSelect(language.code)}
        activeOpacity={0.7}
        disabled={isChanging}
      >
        <LinearGradient
          colors={
            isSelected
              ? [COLORS.primary + '30', COLORS.secondary + '30']
              : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']
          }
          style={styles.cardGradient}
        >
          <View style={styles.cardContent}>
            {/* Flag */}
            <Text style={styles.flag}>{language.flag}</Text>

            {/* Language Names */}
            <View style={styles.languageInfo}>
              <Text style={[styles.nativeName, isSelected && styles.selectedText]}>
                {language.nativeName}
              </Text>
              <Text style={[styles.englishName, isSelected && styles.selectedSubtext]}>
                {language.name}
              </Text>
            </View>

            {/* Selection Indicator */}
            {isChanging ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <View style={[styles.checkBox, isSelected && styles.checkedBox]}>
                {isSelected && <Text style={styles.checkMark}>✓</Text>}
              </View>
            )}
          </View>

          {/* RTL Indicator */}
          {language.isRTL && (
            <View style={styles.rtlBadge}>
              <Text style={styles.rtlText}>RTL</Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={[COLORS.background, COLORS.surface]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <BackButton onPress={onBack} color={COLORS.primary} backgroundColor={COLORS.surface} />
          <View style={styles.headerCenter}>
            <Text style={styles.title}>{t('settings.language')}</Text>
            <Text style={styles.subtitle}>{t('settings.selectLanguage')}</Text>
          </View>
          <View style={styles.headerRight} />
        </View>

        {/* Language List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Text style={styles.infoIcon}>🌍</Text>
            <Text style={styles.infoText}>
              {locale === 'fr'
                ? 'Sélectionnez votre langue préférée. L\'interface sera mise à jour instantanément.'
                : 'Select your preferred language. The interface will update instantly.'}
            </Text>
          </View>

          {/* Languages Grid */}
          <View style={styles.languagesContainer}>
            {availableLanguages.map(renderLanguageCard)}
          </View>

          {/* Footer Info */}
          <View style={styles.footerInfo}>
            <Text style={styles.footerText}>
              {locale === 'fr'
                ? '✨ Toutes les langues incluent une traduction complète de l\'interface'
                : '✨ All languages include a complete interface translation'}
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: SPACING.sm,
  },
  headerRight: {
    width: 50,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '20',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  infoIcon: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    lineHeight: 20,
  },
  languagesContainer: {
    gap: SPACING.md,
  },
  languageCard: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  selectedCard: {
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  cardGradient: {
    padding: SPACING.md,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flag: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  languageInfo: {
    flex: 1,
  },
  nativeName: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
  },
  selectedText: {
    color: COLORS.primary,
  },
  englishName: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  selectedSubtext: {
    color: COLORS.primary + 'CC',
  },
  checkBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkMark: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: FONT_WEIGHT.bold,
  },
  rtlBadge: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    backgroundColor: COLORS.warning,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
  },
  rtlText: {
    fontSize: 10,
    fontWeight: FONT_WEIGHT.bold,
    color: '#FFF',
  },
  footerInfo: {
    marginTop: SPACING.xl,
    padding: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  footerText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
