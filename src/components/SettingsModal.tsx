/**
 * Settings Modal Component
 * Allows users to configure sound, haptics, themes and visual effects
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ScrollView,
} from 'react-native';
import { SPACING, BORDER_RADIUS, SHADOW } from '../constants/designTokens';
import { 
  getAudioEnabled, 
  getHapticsEnabled, 
  setAudioEnabled, 
  setHapticsEnabled 
} from '../utils/soundManager';
import { useTranslation } from '../hooks/useTranslation';
import { useTheme } from '../context/ThemeContext';
import { themeService } from '../services/themeService';
import { ThemeSelector } from './ThemeSelector';
import { UserProgress } from '../types';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenLanguageSelection?: () => void;
  userId?: string;
  userProgress?: UserProgress | null;
  onProfileUpdated?: (progress: UserProgress) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  visible, 
  onClose,
  onOpenLanguageSelection,
  userId,
  userProgress,
  onProfileUpdated,
}) => {
  const { t, currentLanguage } = useTranslation();
  const { theme, userPreferences, colors } = useTheme();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabledState] = useState(true);
  const [isThemeSelectorVisible, setIsThemeSelectorVisible] = useState(false);

  useEffect(() => {
    // Load current settings when modal opens
    if (visible) {
      setSoundEnabled(getAudioEnabled());
      setHapticsEnabledState(getHapticsEnabled());
    }
  }, [visible]);

  const handleSoundToggle = async (value: boolean) => {
    setSoundEnabled(value);
    await setAudioEnabled(value);
  };

  const handleHapticsToggle = async (value: boolean) => {
    setHapticsEnabledState(value);
    await setHapticsEnabled(value);
  };

  const calculateLevel = (xp: number): number => {
    return Math.floor(xp / 100) + 1;
  };

  return (
    <>
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <Text style={styles.title}>{t('settings.title')}</Text>

            {/* Language Selection */}
            {onOpenLanguageSelection && (
              <TouchableOpacity 
                style={styles.languageRow}
                onPress={() => {
                  onClose();
                  onOpenLanguageSelection();
                }}
              >
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>🌐 {t('settings.language')}</Text>
                  <Text style={styles.settingDescription}>
                    {currentLanguage?.nativeName || 'Français'}
                  </Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            )}

            {/* Themes Button */}
            <TouchableOpacity 
              style={styles.languageRow}
              onPress={() => setIsThemeSelectorVisible(true)}
            >
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>🎨 {t('profile.themes')}</Text>
                <Text style={styles.settingDescription}>
                  {t('settings.chooseTheme')}
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            {/* Sound Setting */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>🔊 {t('settings.sound')}</Text>
                <Text style={styles.settingDescription}>
                  {t('settings.soundDescription')}
                </Text>
              </View>
              <Switch
                value={soundEnabled}
                onValueChange={handleSoundToggle}
                trackColor={{ 
                  false: '#666666', 
                  true: '#4CAF50' 
                }}
                thumbColor={soundEnabled ? '#fff' : '#f4f3f4'}
                ios_backgroundColor="#666666"
              />
            </View>

            {/* Haptics Setting */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>📳 {t('settings.haptics')}</Text>
                <Text style={styles.settingDescription}>
                  {t('settings.hapticsDescription')}
                </Text>
              </View>
              <Switch
                value={hapticsEnabled}
                onValueChange={handleHapticsToggle}
                trackColor={{ 
                  false: '#666666', 
                  true: '#4CAF50' 
                }}
                thumbColor={hapticsEnabled ? '#fff' : '#f4f3f4'}
                ios_backgroundColor="#666666"
              />
            </View>

            {/* Visual Effects Section - Hidden as requested */}
            {false && userId && (
              <View style={styles.effectsSection}>
                <Text style={styles.sectionTitle}>✨ {t('profile.visualEffects')}</Text>
                
                <View style={styles.effectRow}>
                  <Text style={styles.effectLabel}>🎆 {t('profile.particles')}</Text>
                  <Switch
                    value={userPreferences?.effects.particlesEnabled ?? true}
                    onValueChange={async (value) => {
                      const newEffects = {
                        ...userPreferences?.effects,
                        ...theme.effects,
                        particlesEnabled: value,
                      };
                      await themeService.updateEffectsPreferences(userId, { effects: newEffects });
                    }}
                    trackColor={{ false: '#666666', true: '#4CAF50' }}
                    thumbColor={userPreferences?.effects.particlesEnabled ? '#fff' : '#f4f3f4'}
                    ios_backgroundColor="#666666"
                  />
                </View>
                
                <View style={styles.effectRow}>
                  <Text style={styles.effectLabel}>🎊 {t('profile.confetti')}</Text>
                  <Switch
                    value={userPreferences?.effects.confettiEnabled ?? true}
                    onValueChange={async (value) => {
                      const newEffects = {
                        ...userPreferences?.effects,
                        ...theme.effects,
                        confettiEnabled: value,
                      };
                      await themeService.updateEffectsPreferences(userId, { effects: newEffects });
                    }}
                    trackColor={{ false: '#666666', true: '#4CAF50' }}
                    thumbColor={userPreferences?.effects.confettiEnabled ? '#fff' : '#f4f3f4'}
                    ios_backgroundColor="#666666"
                  />
                </View>
                
                <View style={styles.effectRow}>
                  <Text style={styles.effectLabel}>✨ {t('profile.glowEffects')}</Text>
                  <Switch
                    value={userPreferences?.effects.glowEffects ?? true}
                    onValueChange={async (value) => {
                      const newEffects = {
                        ...userPreferences?.effects,
                        ...theme.effects,
                        glowEffects: value,
                      };
                      await themeService.updateEffectsPreferences(userId, { effects: newEffects });
                    }}
                    trackColor={{ false: '#666666', true: '#4CAF50' }}
                    thumbColor={userPreferences?.effects.glowEffects ? '#fff' : '#f4f3f4'}
                    ios_backgroundColor="#666666"
                  />
                </View>
                
                <View style={[styles.effectRow, styles.lastEffectRow]}>
                  <Text style={styles.effectLabel}>📳 {t('profile.shakeEffects')}</Text>
                  <Switch
                    value={userPreferences?.effects.shakeEffects ?? true}
                    onValueChange={async (value) => {
                      const newEffects = {
                        ...userPreferences?.effects,
                        ...theme.effects,
                        shakeEffects: value,
                      };
                      await themeService.updateEffectsPreferences(userId, { effects: newEffects });
                    }}
                    trackColor={{ false: '#666666', true: '#4CAF50' }}
                    thumbColor={userPreferences?.effects.shakeEffects ? '#fff' : '#f4f3f4'}
                    ios_backgroundColor="#666666"
                  />
                </View>
              </View>
            )}

            {/* Close Button */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>{t('common.close')}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>

    {/* Theme Selector Modal */}
    {userId && userProgress && (
      <ThemeSelector
        visible={isThemeSelectorVisible}
        onClose={() => setIsThemeSelectorVisible(false)}
        userCoins={userProgress.coins || 0}
        userXP={userProgress.xp || 0}
        userLevel={calculateLevel(userProgress.xp || 0)}
        onCoinsChanged={async () => {
          // Reload user progress after purchasing a theme
          if (onProfileUpdated) {
            const { firestoreService } = await import('../services/firestore');
            const updatedProgress = await firestoreService.getUserProgress(userId);
            if (updatedProgress) {
              onProfileUpdated(updatedProgress);
            }
          }
        }}
      />
    )}
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a2e',
    borderRadius: BORDER_RADIUS.xl,
    width: '90%',
    maxWidth: 450,
    maxHeight: '85%',
    ...SHADOW.large,
  },
  scrollContent: {
    padding: SPACING.xxl,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  languageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: SPACING.md,
    marginHorizontal: -SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  chevron: {
    fontSize: 28,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingInfo: {
    flex: 1,
    marginRight: SPACING.lg,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#a0a0a0',
  },
  effectsSection: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.lg,
    borderTopWidth: 2,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: SPACING.md,
  },
  effectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  lastEffectRow: {
    borderBottomWidth: 0,
  },
  effectLabel: {
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '500',
  },
  closeButton: {
    marginTop: SPACING.xxl,
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
