import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserProgress } from '../types';
import { firebaseService } from '../services/firebase';
import { firestoreService } from '../services/firestore';
import { EditProfileModal } from '../components/EditProfileModal';
import { ThemeSelector } from '../components/ThemeSelector';
import { COLORS } from '../constants/gameConfig';
import { SPACING, FONT_SIZE, FONT_WEIGHT } from '../constants/designTokens';
import { useTheme } from '../context/ThemeContext';
import { BackButton } from '../components/BackButton';
import { themeService } from '../services/themeService';
import { useTranslation } from '../hooks/useTranslation';

interface ProfileScreenProps {
  userProgress: UserProgress | null;
  userId: string;
  isAnonymous: boolean;
  onBack: () => void;
  onSignOut: () => void;
  onProfileUpdated: (progress: UserProgress) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  userProgress,
  userId,
  isAnonymous,
  onBack,
  onSignOut,
  onProfileUpdated,
}) => {
  const { theme, userPreferences, colors } = useTheme();
  const { t } = useTranslation();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isThemeSelectorVisible, setIsThemeSelectorVisible] = useState(false);

  const displayName = userProgress?.displayName || `Guest_${userId.substring(0, 6)}`;
  const avatarEmoji = userProgress?.avatarEmoji || '👤';

  const handleSaveProfile = async (newDisplayName: string, newAvatarEmoji: string) => {
    try {
      await firestoreService.updateProfile(userId, newDisplayName, newAvatarEmoji);
      
      // Update local state
      const updatedProgress: UserProgress = {
        ...userProgress!,
        displayName: newDisplayName,
        avatarEmoji: newAvatarEmoji,
      };
      onProfileUpdated(updatedProgress);
      
      setIsEditModalVisible(false);
      Alert.alert(t('common.success'), t('profile.profileUpdated'));
    } catch (error) {
      throw error;
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      t('profile.signOut'),
      t('profile.signOutConfirm'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('profile.signOut'),
          style: 'destructive',
          onPress: async () => {
            setIsSigningOut(true);
            try {
              await firebaseService.signOut();
              onSignOut();
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert(t('common.error'), t('errors.signOutFailed'));
              setIsSigningOut(false);
            }
          },
        },
      ]
    );
  };

  const formatDate = (timestamp: Date) => {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const achievementCount = userProgress?.achievements?.length || 0;
  const totalAchievements = 16; // Total achievements available (7 levels + 4 games + 5 scores)
  
  // Calculate level from XP
  const calculateLevel = (xp: number): number => {
    return Math.floor(xp / 100) + 1;
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <LinearGradient colors={[colors.background, colors.surface, colors.surfaceLight]} style={styles.container}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <BackButton onPress={onBack} color={colors.primary} backgroundColor={colors.surface} />
            <Text style={[styles.title, { color: colors.text }]}>{t('profile.title')}</Text>
          </View>

        {/* User Info Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>{avatarEmoji}</Text>
            </View>
          </View>
          <Text style={[styles.username, { color: colors.text }]}>{displayName}</Text>
          
          {/* Edit Profile Button */}
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: colors.primary }]}
            onPress={() => setIsEditModalVisible(true)}
          >
            <Text style={styles.editButtonText}>✏️ {t('profile.editProfile')}</Text>
          </TouchableOpacity>
          
          {/* Themes Button */}
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: colors.secondary }]}
            onPress={() => setIsThemeSelectorVisible(true)}
          >
            <Text style={styles.editButtonText}>🎨 {t('profile.themes')}</Text>
          </TouchableOpacity>
          
          {/* Visual Effects Settings */}
          <View style={styles.effectsSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>✨ {t('profile.visualEffects')}</Text>
            
            <View style={[styles.effectRow, { backgroundColor: colors.surfaceLight }]}>
              <Text style={[styles.effectLabel, { color: colors.text }]}>🎆 {t('profile.particles')}</Text>
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
                trackColor={{ false: '#767577', true: colors.primary }}
                thumbColor={userPreferences?.effects.particlesEnabled ? '#fff' : '#f4f3f4'}
              />
            </View>
            
            <View style={[styles.effectRow, { backgroundColor: colors.surfaceLight }]}>
              <Text style={[styles.effectLabel, { color: colors.text }]}>🎊 {t('profile.confetti')}</Text>
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
                trackColor={{ false: '#767577', true: colors.primary }}
                thumbColor={userPreferences?.effects.confettiEnabled ? '#fff' : '#f4f3f4'}
              />
            </View>
            
            <View style={[styles.effectRow, { backgroundColor: colors.surfaceLight }]}>
              <Text style={[styles.effectLabel, { color: colors.text }]}>✨ {t('profile.glowEffects')}</Text>
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
                trackColor={{ false: '#767577', true: colors.primary }}
                thumbColor={userPreferences?.effects.glowEffects ? '#fff' : '#f4f3f4'}
              />
            </View>
            
            <View style={[styles.effectRow, { backgroundColor: colors.surfaceLight }]}>
              <Text style={[styles.effectLabel, { color: colors.text }]}>📳 {t('profile.shakeEffects')}</Text>
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
                trackColor={{ false: '#767577', true: theme.colors.primary }}
                thumbColor={userPreferences?.effects.shakeEffects ? '#fff' : '#f4f3f4'}
              />
            </View>
          </View>
          
          {/* XP and Coins Display */}
          <View style={[styles.currencyContainer, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}>
            <View style={styles.currencyItem}>
              <Text style={styles.currencyIcon}>⭐</Text>
              <View style={styles.currencyInfo}>
                <Text style={[styles.currencyValue, { color: colors.primary }]}>{userProgress?.xp || 0}</Text>
                <Text style={[styles.currencyLabel, { color: colors.textSecondary }]}>XP</Text>
              </View>
            </View>
            <View style={[styles.currencyDivider, { backgroundColor: colors.border }]} />
            <View style={styles.currencyItem}>
              <Text style={styles.currencyIcon}>🪙</Text>
              <View style={styles.currencyInfo}>
                <Text style={[styles.currencyValue, { color: colors.accent }]}>{userProgress?.coins || 0}</Text>
                <Text style={[styles.currencyLabel, { color: colors.textSecondary }]}>Coins</Text>
              </View>
            </View>
          </View>
          
          <Text style={[styles.rewardsInfo, { color: colors.textSecondary }]}>
            💡 {t('profile.earnRewards')}
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{userProgress?.highScore || 0}</Text>
            <Text style={[styles.statLabel, { color: colors.text }]}>{t('profile.highScore')}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{userProgress?.maxLevelReached || 1}</Text>
            <Text style={[styles.statLabel, { color: colors.text }]}>{t('profile.maxLevel')}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{userProgress?.totalGamesPlayed || 0}</Text>
            <Text style={[styles.statLabel, { color: colors.text }]}>{t('profile.gamesPlayed')}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {achievementCount}/{totalAchievements}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text }]}>{t('profile.achievements')}</Text>
          </View>
        </View>

        {/* Achievements Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>🏆 {t('profile.unlockedAchievements')}</Text>
          <View style={styles.achievementsContainer}>
            {userProgress?.achievements && userProgress.achievements.length > 0 ? (
              userProgress.achievements.map((achievement, index) => (
                <View key={index} style={[styles.achievementBadge, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
                  <Text style={styles.achievementIcon}>
                    {achievement.includes('first_game') && '🎮'}
                    {achievement.includes('score_100') && '💯'}
                    {achievement.includes('score_500') && '🔥'}
                    {achievement.includes('score_1000') && '⭐'}
                    {achievement.includes('level_5') && '🚀'}
                    {achievement.includes('games_10') && '🎯'}
                  </Text>
                  <Text style={[styles.achievementName, { color: colors.text }]}>
                    {achievement.replace(/_/g, ' ').toUpperCase()}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={[styles.noAchievements, { color: colors.textSecondary }]}>
                {t('profile.noAchievements')}
              </Text>
            )}
          </View>
        </View>

        {/* Sign Out Button - Only for non-anonymous users */}
        {!isAnonymous && (
          <TouchableOpacity
            style={[styles.signOutButton, { backgroundColor: colors.error }, isSigningOut && styles.signOutButtonDisabled]}
            onPress={handleSignOut}
            disabled={isSigningOut}
          >
            <Text style={styles.signOutButtonText}>
              {isSigningOut ? t('profile.signingOut') : `🚪 ${t('profile.signOut')}`}
            </Text>
          </TouchableOpacity>
        )}

        {/* Info for anonymous users */}
        {isAnonymous && (
          <View style={styles.anonymousInfo}>
            <Text style={styles.anonymousIcon}>💡</Text>
            <Text style={styles.anonymousText}>
              {t('profile.anonymousInfo')}
            </Text>
            <Text style={styles.anonymousTextSmall}>
              {t('profile.anonymousTip')}
            </Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Memory Matrix v1.0</Text>
          <Text style={styles.footerText}>© 2025 AppWizards</Text>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={isEditModalVisible}
        currentDisplayName={displayName}
        currentAvatarEmoji={avatarEmoji}
        onSave={handleSaveProfile}
        onCancel={() => setIsEditModalVisible(false)}
      />
      
      {/* Theme Selector Modal */}
      <ThemeSelector
        visible={isThemeSelectorVisible}
        onClose={() => setIsThemeSelectorVisible(false)}
        userCoins={userProgress?.coins || 0}
        userXP={userProgress?.xp || 0}
        userLevel={calculateLevel(userProgress?.xp || 0)}
        onCoinsChanged={async () => {
          // Reload user progress after purchasing a theme
          const updatedProgress = await firestoreService.getUserProgress(userId);
          if (updatedProgress) {
            onProfileUpdated(updatedProgress);
          }
        }}
      />
    </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.xl,
    paddingBottom: 40,
  },
  header: {
    marginBottom: SPACING.xxl,
  },
  backButton: {
    marginBottom: SPACING.lg,
    paddingLeft: SPACING.xs,
  },
  backButtonText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#4ecdc4',
  },
  avatarText: {
    fontSize: 40,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  editButton: {
    marginTop: 15,
    backgroundColor: '#4ecdc4',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  editButtonText: {
    color: '#1a1a2e',
    fontSize: 14,
    fontWeight: 'bold',
  },
  currencyContainer: {
    flexDirection: 'row',
    marginTop: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  currencyIcon: {
    fontSize: 28,
    marginRight: 10,
  },
  currencyInfo: {
    alignItems: 'flex-start',
  },
  currencyValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  currencyLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  currencyDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 10,
  },
  rewardsInfo: {
    marginTop: 15,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  memberSince: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    fontStyle: 'italic',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4ecdc4',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  effectsSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  effectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  effectLabel: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  achievementsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  achievementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#4ecdc4',
  },
  achievementIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  achievementName: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    flex: 1,
  },
  noAchievements: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  signOutButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 15,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 2,
    borderColor: '#c0392b',
  },
  signOutButtonDisabled: {
    backgroundColor: 'rgba(231, 76, 60, 0.5)',
    borderColor: 'rgba(192, 57, 43, 0.5)',
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  anonymousInfo: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginTop: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 193, 7, 0.3)',
    alignItems: 'center',
  },
  anonymousIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  anonymousText: {
    color: '#FFC107',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
  anonymousTextSmall: {
    color: '#FFC107',
    fontSize: 13,
    textAlign: 'center',
    opacity: 0.8,
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 5,
  },
});
