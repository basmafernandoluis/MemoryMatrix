/**
 * Notification Permission Screen
 * Explique l'importance des notifications et demande la permission
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../hooks/useTranslation';
import { SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS } from '../constants/designTokens';

interface NotificationPermissionScreenProps {
  onAllow: () => void;
  onSkip: () => void;
}

export const NotificationPermissionScreen: React.FC<NotificationPermissionScreenProps> = ({
  onAllow,
  onSkip,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAllow = async () => {
    setIsProcessing(true);
    try {
      await onAllow();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right', 'bottom']}>
      <LinearGradient
        colors={[colors.background, colors.surface, colors.surfaceLight]}
        style={styles.container}
      >
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.bellIcon}>🔔</Text>
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]}>
          {t('notifications.permission.title')}
        </Text>

        {/* Description */}
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {t('notifications.permission.description')}
        </Text>

        {/* Benefits */}
        <View style={styles.benefitsContainer}>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>🏆</Text>
            <View style={styles.benefitTextContainer}>
              <Text style={[styles.benefitTitle, { color: colors.text }]}>
                {t('notifications.permission.benefit1Title')}
              </Text>
              <Text style={[styles.benefitDescription, { color: colors.textSecondary }]}>
                {t('notifications.permission.benefit1Description')}
              </Text>
            </View>
          </View>

          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>👥</Text>
            <View style={styles.benefitTextContainer}>
              <Text style={[styles.benefitTitle, { color: colors.text }]}>
                {t('notifications.permission.benefit2Title')}
              </Text>
              <Text style={[styles.benefitDescription, { color: colors.textSecondary }]}>
                {t('notifications.permission.benefit2Description')}
              </Text>
            </View>
          </View>

          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>🎯</Text>
            <View style={styles.benefitTextContainer}>
              <Text style={[styles.benefitTitle, { color: colors.text }]}>
                {t('notifications.permission.benefit3Title')}
              </Text>
              <Text style={[styles.benefitDescription, { color: colors.textSecondary }]}>
                {t('notifications.permission.benefit3Description')}
              </Text>
            </View>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.allowButton, { backgroundColor: colors.primary }]}
            onPress={handleAllow}
            disabled={isProcessing}
          >
            <Text style={[styles.allowButtonText, { color: colors.background }]}>
              {isProcessing ? t('common.loading') : t('notifications.permission.allow')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.skipButton, { borderColor: colors.border }]}
            onPress={onSkip}
            disabled={isProcessing}
          >
            <Text style={[styles.skipButtonText, { color: colors.textSecondary }]}>
              {t('notifications.permission.skip')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info */}
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          {t('notifications.permission.info')}
        </Text>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.xxxl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: SPACING.xxl,
  },
  bellIcon: {
    fontSize: 80,
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: FONT_WEIGHT.bold,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  description: {
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    marginBottom: SPACING.xxxl,
    lineHeight: 24,
    paddingHorizontal: SPACING.md,
  },
  benefitsContainer: {
    width: '100%',
    marginBottom: SPACING.xxxl,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  benefitIcon: {
    fontSize: 32,
    marginRight: SPACING.lg,
  },
  benefitTextContainer: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    marginBottom: SPACING.xs,
  },
  benefitDescription: {
    fontSize: FONT_SIZE.sm,
    lineHeight: 20,
  },
  buttonsContainer: {
    width: '100%',
    marginBottom: SPACING.xl,
  },
  allowButton: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xxl,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  allowButtonText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
  },
  skipButton: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xxl,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    borderWidth: 2,
  },
  skipButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
  },
  infoText: {
    fontSize: FONT_SIZE.xs,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
