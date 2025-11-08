/**
 * Settings Screen with Language Selection
 * 
 * Exemple d'intégration du système i18n dans un écran existant
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/gameConfig';
import { SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS } from '../constants/designTokens';
import { useTranslation } from '../hooks/useTranslation';

interface SettingsScreenExampleProps {
  onBack: () => void;
  onLanguagePress: () => void;
}

export const SettingsScreenExample: React.FC<SettingsScreenExampleProps> = ({
  onBack,
  onLanguagePress,
}) => {
  const { t, currentLanguage, isRTL } = useTranslation();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const SettingItem = ({
    icon,
    label,
    value,
    onPress,
    showArrow = false,
    showSwitch = false,
    switchValue,
    onSwitchChange,
  }: {
    icon: string;
    label: string;
    value?: string;
    onPress?: () => void;
    showArrow?: boolean;
    showSwitch?: boolean;
    switchValue?: boolean;
    onSwitchChange?: (value: boolean) => void;
  }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress && !showSwitch}
      activeOpacity={0.7}
    >
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon as any} size={20} color={COLORS.primary} />
        </View>
        <View style={styles.settingTexts}>
          <Text style={styles.settingLabel}>{label}</Text>
          {value && <Text style={styles.settingValue}>{value}</Text>}
        </View>
      </View>

      {showSwitch && (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: '#767577', true: COLORS.primary + '80' }}
          thumbColor={switchValue ? COLORS.primary : '#f4f3f4'}
        />
      )}

      {showArrow && (
        <Ionicons
          name={isRTL ? 'chevron-back' : 'chevron-forward'}
          size={20}
          color={COLORS.textSecondary}
        />
      )}
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={[COLORS.background, COLORS.surface]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isRTL ? 'arrow-forward' : 'arrow-back'}
              size={24}
              color={COLORS.primary}
            />
          </TouchableOpacity>
          <Text style={styles.title}>{t('settings.title')}</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* General Section */}
          <SectionHeader title={t('settings.general')} />
          
          <View style={styles.section}>
            <SettingItem
              icon="language-outline"
              label={t('settings.language')}
              value={currentLanguage?.nativeName}
              onPress={onLanguagePress}
              showArrow
            />
          </View>

          {/* Audio Section */}
          <SectionHeader title={t('settings.audio')} />
          
          <View style={styles.section}>
            <SettingItem
              icon="volume-high-outline"
              label={t('settings.sound')}
              showSwitch
              switchValue={soundEnabled}
              onSwitchChange={setSoundEnabled}
            />
            <SettingItem
              icon="musical-notes-outline"
              label={t('settings.music')}
              showSwitch
              switchValue={musicEnabled}
              onSwitchChange={setMusicEnabled}
            />
            <SettingItem
              icon="phone-portrait-outline"
              label={t('settings.vibration')}
              showSwitch
              switchValue={vibrationEnabled}
              onSwitchChange={setVibrationEnabled}
            />
          </View>

          {/* Notifications Section */}
          <SectionHeader title={t('settings.notifications')} />
          
          <View style={styles.section}>
            <SettingItem
              icon="notifications-outline"
              label={t('settings.dailyReminder')}
              showSwitch
              switchValue={notificationsEnabled}
              onSwitchChange={setNotificationsEnabled}
            />
          </View>

          {/* About Section */}
          <SectionHeader title={t('settings.about')} />
          
          <View style={styles.section}>
            <SettingItem
              icon="information-circle-outline"
              label={t('settings.version', { version: '1.0.0' })}
            />
          </View>

          {/* Language Info Banner */}
          {currentLanguage && (
            <View style={styles.infoBanner}>
              <Text style={styles.infoIcon}>🌐</Text>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoText}>
                  {currentLanguage.name} ({currentLanguage.code.toUpperCase()})
                </Text>
                {isRTL && (
                  <Text style={styles.rtlIndicator}>RTL Layout Active</Text>
                )}
              </View>
            </View>
          )}
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
  backButton: {
    width: 50,
    height: 50,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRight: {
    width: 50,
  },
  title: {
    flex: 1,
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  sectionHeader: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.primary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  settingTexts: {
    flex: 1,
  },
  settingLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text,
  },
  settingValue: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '15',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  infoIcon: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    fontWeight: FONT_WEIGHT.medium,
  },
  rtlIndicator: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.warning,
    marginTop: 2,
    fontWeight: FONT_WEIGHT.semibold,
  },
});
