import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, ScrollView, Modal, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/gameConfig';
import { SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, SHADOW } from '../constants/designTokens';
import { UserProgress, DailyChallenge, Achievement, GameMode } from '../types';
import { feedback } from '../utils/soundManager';
import { getAchievementsWithStatus } from '../utils/achievements';
import GameModeSelector from './GameModeSelector';
import { SettingsModal } from '../components/SettingsModal';
import UnlockModeAnimation from '../components/UnlockModeAnimation';
import { BannerAdComponent, BannerSpacer } from '../components/BannerAdComponent';
import firestore from '@react-native-firebase/firestore';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../hooks/useTranslation';
import { NeuroCharacter } from '../components/NeuroCharacter';

interface HomeScreenProps {
  onStartGame: (mode?: GameMode) => void;
  onOpenLeaderboard: () => void;
  onOpenProfile: () => void;
  onOpenChallenges: () => void;
  onOpenFriends?: () => void;
  onOpenLanguageSelection?: () => void;
  userProgress: UserProgress | null;
  currentUserId?: string | null;
  newlyUnlockedMode?: GameMode | null; // Mode qui vient d'être débloqué
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ 
  onStartGame, 
  onOpenLeaderboard, 
  onOpenProfile,
  onOpenChallenges,
  onOpenFriends,
  onOpenLanguageSelection,
  userProgress,
  currentUserId = null,
  newlyUnlockedMode = null,
}) => {
  const { colors } = useTheme(); // Get theme colors
  const { t } = useTranslation(); // Get translation function
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const [showInstructions, setShowInstructions] = useState(false);
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [unlockedMode, setUnlockedMode] = useState<GameMode | null>(null);
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  const dailyChallenge = userProgress?.dailyChallenge;
  const challengeProgress = dailyChallenge 
    ? Math.min(100, Math.round((dailyChallenge.currentScore / dailyChallenge.targetScore) * 100))
    : 0;

  const achievements = userProgress ? getAchievementsWithStatus(userProgress) : [];
  const unlockedCount = achievements.filter((a: Achievement) => a.unlocked).length;

  // Compter les notifications non lues (demandes d'amis + défis)
  useEffect(() => {
    if (!currentUserId) {
      setNotificationCount(0);
      return;
    }

    let friendRequestCount = 0;
    let challengeCount = 0;

    // Écouter les demandes d'amis en attente
    const unsubscribeFriendRequests = firestore()
      .collection('friendRequests')
      .where('toUserId', '==', currentUserId)
      .where('status', '==', 'pending')
      .onSnapshot((snapshot) => {
        if (snapshot) {
          friendRequestCount = snapshot.size;
          setNotificationCount(friendRequestCount + challengeCount);
        }
      });

    // Écouter les défis en attente (séparément)
    const unsubscribeChallenges = firestore()
      .collection('challenges')
      .where('opponentId', '==', currentUserId)
      .where('status', '==', 'pending')
      .onSnapshot((snapshot) => {
        if (snapshot) {
          challengeCount = snapshot.size;
          setNotificationCount(friendRequestCount + challengeCount);
        }
      });

    return () => {
      unsubscribeFriendRequests();
      unsubscribeChallenges();
    };
  }, [currentUserId]);

  // Afficher l'animation de déblocage si un mode a été débloqué
  useEffect(() => {
    if (newlyUnlockedMode) {
      setUnlockedMode(newlyUnlockedMode);
      setShowUnlockAnimation(true);
    }
  }, [newlyUnlockedMode]);

  useEffect(() => {
    // Entrance animation - faster for better UX
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 10,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();

    // Subtle pulse animation for play button
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    // Glow animation for play button
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: false,
        }),
      ])
    );
    glow.start();

    return () => {
      pulse.stop();
      glow.stop();
    };
  }, [fadeAnim, scaleAnim, pulseAnim, glowAnim]);
  const handleStartGame = async () => {
    await feedback.buttonPress();
    setShowModeSelector(true);
  };

  const handleModeSelected = (mode: GameMode) => {
    setShowModeSelector(false);
    onStartGame(mode);
  };

  const handleOpenLeaderboard = async () => {
    await feedback.buttonPress();
    onOpenLeaderboard();
  };

  const handleOpenProfile = async () => {
    await feedback.buttonPress();
    onOpenProfile();
  };

  const handleOpenChallenges = async () => {
    await feedback.buttonPress();
    onOpenChallenges();
  };

  const handleOpenFriends = async () => {
    await feedback.buttonPress();
    if (onOpenFriends) onOpenFriends();
  };

  const handleOpenSettings = async () => {
    await feedback.buttonPress();
    setShowSettings(true);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={[
            styles.content, 
            { 
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            }
          ]}
        >
          {/* Neuro Character */}
          <View style={styles.neuroContainer}>
            <NeuroCharacter 
              emotion="happy" 
              size={70} 
              visible={true}
              message={t('neuro.greeting')}
            />
          </View>

          <Text style={[styles.title, { color: colors.primary }]}>{t('home.title')}</Text>
          <Text style={[styles.subtitle, { color: colors.secondary }]}>{t('home.subtitle')}</Text>
        
        {dailyChallenge && (
          <View style={[styles.dailyChallengeCard, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
            <Text style={[styles.challengeTitle, { color: colors.text }]}>🎯 {t('home.dailyChallenge')}</Text>
            <Text style={[styles.challengeTarget, { color: colors.textSecondary }]}>
              {t('home.challengeTarget', { target: dailyChallenge.targetScore })}
            </Text>
            
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { width: `${challengeProgress}%`, backgroundColor: colors.primary },
                  dailyChallenge.completed && { backgroundColor: colors.success },
                ]} 
              />
            </View>
            
            <Text style={[styles.challengeProgress, { color: colors.text }]}>
              {dailyChallenge.currentScore} / {dailyChallenge.targetScore}
              {dailyChallenge.completed && ` ✓ ${t('home.completed')}`}
            </Text>
          </View>
        )}
        
        <View style={styles.statsContainer}>
          {userProgress && (
            <>
              <Animated.View style={[styles.statCard, { opacity: fadeAnim, backgroundColor: colors.surface }]}>
                <Text style={[styles.statValue, { color: colors.primary }]}>{userProgress.highScore}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('home.highScore')}</Text>
              </Animated.View>
              
              <Animated.View style={[styles.statCard, { opacity: fadeAnim, backgroundColor: colors.surface }]}>
                <Text style={[styles.statValue, { color: colors.secondary }]}>{userProgress.maxLevelReached}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('home.maxLevel')}</Text>
              </Animated.View>
              
              <Animated.View style={[styles.statCard, { opacity: fadeAnim, backgroundColor: colors.surface }]}>
                <Text style={[styles.statValue, { color: colors.accent }]}>{userProgress.totalGamesPlayed}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('home.gamesPlayed')}</Text>
              </Animated.View>
            </>
          )}
        </View>
        
        <Animated.View style={{ 
          transform: [{ scale: pulseAnim }],
        }}>
          <Pressable 
            style={({ pressed }) => [
              styles.playButtonContainer,
              pressed && styles.playButtonPressed
            ]}
            onPress={handleStartGame}
          >
            {/* Glow effect */}
            <Animated.View
              style={[
                styles.playButtonGlow,
                {
                  opacity: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 0.8],
                  }),
                },
              ]}
            />
            
            {/* Gradient button */}
            <LinearGradient
              colors={[colors.primary, colors.secondary, colors.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.playButton}
            >
              <Text style={styles.playButtonText}>▶ {t('home.play')}</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {/* Menu en grille 3x2 avec design moderne */}
        <View style={styles.menuContainer}>
          <View style={styles.menuRow}>
            <Pressable
              style={({ pressed }) => [
                styles.menuIcon,
                pressed && styles.menuIconPressed,
              ]}
              onPress={handleOpenLeaderboard}
            >
              <View style={[styles.iconCircle, { backgroundColor: colors.primary + '15' }]}>
                <Text style={styles.menuIconEmoji}>🏆</Text>
              </View>
              <Text style={[styles.menuIconLabel, { color: colors.text }]}>{t('home.leaderboard')}</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.menuIcon,
                pressed && styles.menuIconPressed,
              ]}
              onPress={handleOpenChallenges}
            >
              <View style={[styles.iconCircle, { backgroundColor: colors.warning + '15' }]}>
                <Text style={styles.menuIconEmoji}>🎯</Text>
              </View>
              <Text style={[styles.menuIconLabel, { color: colors.text }]}>{t('home.challenges')}</Text>
            </Pressable>

            {onOpenFriends && (
              <Pressable
                style={({ pressed }) => [
                  styles.menuIcon,
                  pressed && styles.menuIconPressed,
                ]}
                onPress={handleOpenFriends}
              >
                <View style={[styles.iconCircle, { backgroundColor: colors.secondary + '15' }]}>
                  <Text style={styles.menuIconEmoji}>👥</Text>
                  {notificationCount > 0 && (
                    <View style={styles.notificationBadge}>
                      <Text style={styles.badgeText}>
                        {notificationCount > 99 ? '99+' : notificationCount}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.menuIconLabel, { color: colors.text }]}>{t('home.friends')}</Text>
              </Pressable>
            )}
          </View>

          <View style={styles.menuRow}>
            <Pressable
              style={({ pressed }) => [
                styles.menuIcon,
                pressed && styles.menuIconPressed,
              ]}
              onPress={handleOpenProfile}
            >
              <View style={[styles.iconCircle, { backgroundColor: colors.accent + '15' }]}>
                <Text style={styles.menuIconEmoji}>👤</Text>
              </View>
              <Text style={[styles.menuIconLabel, { color: colors.text }]}>{t('home.profile')}</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.menuIcon,
                pressed && styles.menuIconPressed,
              ]}
              onPress={handleOpenSettings}
            >
              <View style={[styles.iconCircle, { backgroundColor: colors.primary + '15' }]}>
                <Text style={styles.menuIconEmoji}>⚙️</Text>
              </View>
              <Text style={[styles.menuIconLabel, { color: colors.text }]}>{t('home.settings')}</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.menuIcon,
                pressed && styles.menuIconPressed,
              ]}
              onPress={async () => {
                await feedback.buttonPress();
                setShowInstructions(true);
              }}
            >
              <View style={[styles.iconCircle, { backgroundColor: colors.success + '15' }]}>
                <Text style={styles.menuIconEmoji}>❓</Text>
              </View>
              <Text style={[styles.menuIconLabel, { color: colors.text }]}>{t('home.instructionsTitle')}</Text>
            </Pressable>
          </View>
        </View>
        </Animated.View>
      </ScrollView>

      {/* Instructions Modal */}
      <Modal
        visible={showInstructions}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowInstructions(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowInstructions(false)}
        >
          <Pressable 
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalInnerContainer}>
              <Text style={styles.modalTitle}>📚 {t('home.instructionsTitle')}</Text>
              
              <ScrollView 
                style={styles.instructionsScrollView}
                contentContainerStyle={styles.instructionsScrollContent}
                showsVerticalScrollIndicator={true}
              >
              <View style={styles.instructionItem}>
                <Text style={styles.instructionNumber}>🎮</Text>
                <View style={styles.instructionTextContainer}>
                  <Text style={styles.instructionTitle}>{t('home.instructionsModal.gameModes.title')}</Text>
                  <Text style={styles.instructionItemText}>
                    {t('home.instructionsModal.gameModes.description')}
                  </Text>
                </View>
              </View>
              
              <View style={styles.instructionItem}>
                <Text style={styles.instructionNumber}>1️⃣</Text>
                <View style={styles.instructionTextContainer}>
                  <Text style={styles.instructionTitle}>{t('home.instructionsModal.memorize.title')}</Text>
                  <Text style={styles.instructionItemText}>
                    {t('home.instructionsModal.memorize.description')}
                  </Text>
                </View>
              </View>
              
              <View style={styles.instructionItem}>
                <Text style={styles.instructionNumber}>2️⃣</Text>
                <View style={styles.instructionTextContainer}>
                  <Text style={styles.instructionTitle}>{t('home.instructionsModal.reproduce.title')}</Text>
                  <Text style={styles.instructionItemText}>
                    {t('home.instructionsModal.reproduce.description')}
                  </Text>
                </View>
              </View>
              
              <View style={styles.instructionItem}>
                <Text style={styles.instructionNumber}>❤️</Text>
                <View style={styles.instructionTextContainer}>
                  <Text style={styles.instructionTitle}>{t('home.instructionsModal.lives.title')}</Text>
                  <Text style={styles.instructionItemText}>
                    {t('home.instructionsModal.lives.description')}
                  </Text>
                </View>
              </View>
              
              <View style={styles.instructionItem}>
                <Text style={styles.instructionNumber}>⏱️</Text>
                <View style={styles.instructionTextContainer}>
                  <Text style={styles.instructionTitle}>{t('home.instructionsModal.timeAttack.title')}</Text>
                  <Text style={styles.instructionItemText}>
                    {t('home.instructionsModal.timeAttack.description')}
                  </Text>
                </View>
              </View>
              
              <View style={styles.instructionItem}>
                <Text style={styles.instructionNumber}>🎯</Text>
                <View style={styles.instructionTextContainer}>
                  <Text style={styles.instructionTitle}>{t('home.instructionsModal.dailyChallenges.title')}</Text>
                  <Text style={styles.instructionItemText}>
                    {t('home.instructionsModal.dailyChallenges.description')}
                  </Text>
                </View>
              </View>
              
              <View style={styles.instructionItem}>
                <Text style={styles.instructionNumber}>🏆</Text>
                <View style={styles.instructionTextContainer}>
                  <Text style={styles.instructionTitle}>{t('home.instructionsModal.leaderboards.title')}</Text>
                  <Text style={styles.instructionItemText}>
                    {t('home.instructionsModal.leaderboards.description')}
                  </Text>
                </View>
              </View>
              
              <View style={styles.instructionItem}>
                <Text style={styles.instructionNumber}>🔊</Text>
                <View style={styles.instructionTextContainer}>
                  <Text style={styles.instructionTitle}>{t('home.instructionsModal.settings.title')}</Text>
                  <Text style={styles.instructionItemText}>
                    {t('home.instructionsModal.settings.description')}
                  </Text>
                </View>
              </View>
            </ScrollView>
            
            <Pressable
              style={styles.closeButton}
              onPress={async () => {
                await feedback.buttonPress();
                setShowInstructions(false);
              }}
            >
              <Text style={styles.closeButtonText}>{t('home.instructionsModal.understood')}</Text>
            </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Mode Selector Modal */}
      {showModeSelector && (
        <Modal
          visible={showModeSelector}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setShowModeSelector(false)}
        >
          <GameModeSelector
            onSelectMode={handleModeSelected}
            onBack={() => setShowModeSelector(false)}
            maxLevelReached={userProgress?.maxLevelReached || 0}
            userXp={userProgress?.xp || 0}
            userCoins={userProgress?.coins || 0}
            friendChallengeWins={userProgress?.friendChallengeWins || 0}
          />
        </Modal>
      )}

      {/* Settings Modal */}
      <SettingsModal 
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        onOpenLanguageSelection={onOpenLanguageSelection}
        userId={currentUserId || undefined}
        userProgress={userProgress}
        onProfileUpdated={(updatedProgress) => {
          // This will be handled by parent component
          console.log('Profile updated from settings:', updatedProgress);
        }}
      />

      {/* Unlock Mode Animation */}
      <UnlockModeAnimation
        visible={showUnlockAnimation}
        mode={unlockedMode}
        onComplete={() => {
          setShowUnlockAnimation(false);
          setUnlockedMode(null);
        }}
      />

      {/* Bannière publicitaire en bas */}
      <BannerAdComponent position="bottom" />
    </SafeAreaView>
  );
};

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 80, // Espace pour la bannière publicitaire (50px banner + 30px marge)
  },
  content: {
    padding: SPACING.sm,
    paddingTop: SPACING.xs,
    justifyContent: 'flex-start',
    alignItems: 'center',
    minHeight: SCREEN_HEIGHT - 150,
  },
  neuroContainer: {
    marginTop: 2,
    marginBottom: SPACING.xs,
    alignItems: 'center',
  },
  title: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
    marginBottom: 2,
    marginTop: 2,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.warning,
    marginBottom: SPACING.sm,
    fontWeight: FONT_WEIGHT.semibold,
  },
  dailyChallengeCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    width: '100%',
    maxWidth: 350,
    borderWidth: 2,
    borderColor: COLORS.warning,
  },
  challengeTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.warning,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  challengeTarget: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: COLORS.cellDefault,
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
  },
  progressBarCompleted: {
    backgroundColor: COLORS.success,
  },
  challengeProgress: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    textAlign: 'center',
    fontWeight: FONT_WEIGHT.semibold,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  statCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    minWidth: 70,
    alignItems: 'center',
    ...SHADOW.small,
  },
  statValue: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  playButtonContainer: {
    position: 'relative',
    marginBottom: SPACING.sm,
    marginTop: SPACING.xs,
  },
  playButtonGlow: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: BORDER_RADIUS.xxl,
    backgroundColor: COLORS.primary,
    opacity: 0.3,
  },
  playButton: {
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.xxl,
    ...SHADOW.large,
  },
  playButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  playButtonText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: '#FFFFFF',
    letterSpacing: 2,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  menuContainer: {
    width: '100%',
    maxWidth: 400,
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.sm,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  menuIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 90,
    minHeight: 90,
  },
  menuIconPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.7,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    ...SHADOW.medium,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
  },
  menuIconEmoji: {
    fontSize: 30,
  },
  menuIconLabel: {
    fontSize: 11,
    fontWeight: FONT_WEIGHT.semibold,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  menuIconPlaceholder: {
    width: 90,
    height: 90,
  },
  notificationBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 3,
    borderColor: COLORS.background,
    ...SHADOW.small,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: FONT_WEIGHT.bold,
  },
  leaderboardButton: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.warning,
    ...SHADOW.small,
  },
  leaderboardButtonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
  leaderboardButtonText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.warning,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  challengesButton: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    ...SHADOW.small,
  },
  challengesButtonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
  challengesButtonText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.secondary,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  profileButton: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.primary,
    ...SHADOW.small,
  },
  profileButtonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
  profileButtonText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xxl,
    width: '100%',
    maxWidth: 400,
    height: SCREEN_HEIGHT * 0.8,
    maxHeight: SCREEN_HEIGHT * 0.85,
    ...SHADOW.large,
  },
  modalInnerContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  instructionsScrollView: {
    flex: 1,
    marginBottom: SPACING.md,
  },
  instructionsScrollContent: {
    paddingBottom: SPACING.lg,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    marginBottom: SPACING.lg,
  },
  instructionNumber: {
    fontSize: FONT_SIZE.xxl,
    minWidth: 30,
    flexShrink: 0,
    marginRight: SPACING.md,
  },
  instructionTextContainer: {
    flex: 1,
  },
  instructionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  instructionItemText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    lineHeight: 22,
  },
  closeButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    ...SHADOW.medium,
  },
  closeButtonText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
  },
  achievementsSection: {
    width: '100%',
    marginBottom: SPACING.lg,
  },
  achievementsTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  achievementsScroll: {
    flexGrow: 0,
  },
  achievementCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.sm,
    width: 100,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.success,
  },
  achievementCardLocked: {
    opacity: 0.5,
    borderColor: COLORS.textSecondary,
  },
  achievementIcon: {
    fontSize: 28,
    marginBottom: SPACING.xs,
  },
  achievementTitle: {
    fontSize: 11,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  achievementTitleLocked: {
    color: COLORS.textSecondary,
  },
  achievementDescription: {
    fontSize: 9,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 12,
  },
  achievementProgress: {
    fontSize: 9,
    color: COLORS.primary,
    marginTop: SPACING.xs,
    fontWeight: FONT_WEIGHT.semibold,
  },
  achievementUnlocked: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.success,
    position: 'absolute',
    top: 4,
    right: 4,
  },
});
