import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, ScrollView, Modal, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
          toValue: 1.03,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [fadeAnim, scaleAnim, pulseAnim]);
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
      <Animated.View 
        style={[
          styles.content, 
          { 
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }
        ]}
      >
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
        
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <Pressable 
            style={({ pressed }) => [
              styles.playButton,
              pressed && styles.playButtonPressed
            ]}
            onPress={handleStartGame}
          >
            <Text style={styles.playButtonText}>▶ {t('home.play')}</Text>
          </Pressable>
        </Animated.View>

        {/* Menu circulaire gaming */}
        <View style={styles.menuContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.menuIcon,
              pressed && styles.menuIconPressed,
            ]}
            onPress={handleOpenLeaderboard}
          >
            <Text style={styles.menuIconEmoji}>🏆</Text>
            <Text style={styles.menuIconLabel}>{t('home.leaderboard')}</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.menuIcon,
              pressed && styles.menuIconPressed,
            ]}
            onPress={handleOpenChallenges}
          >
            <Text style={styles.menuIconEmoji}>🎯</Text>
            <Text style={styles.menuIconLabel}>{t('home.challenges')}</Text>
          </Pressable>

          {onOpenFriends && (
            <Pressable
              style={({ pressed }) => [
                styles.menuIcon,
                pressed && styles.menuIconPressed,
              ]}
              onPress={handleOpenFriends}
            >
              <Text style={styles.menuIconEmoji}>👥</Text>
              <Text style={styles.menuIconLabel}>{t('home.friends')}</Text>
              {notificationCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.badgeText}>
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </Text>
                </View>
              )}
            </Pressable>
          )}

          <Pressable
            style={({ pressed }) => [
              styles.menuIcon,
              pressed && styles.menuIconPressed,
            ]}
            onPress={handleOpenProfile}
          >
            <Text style={styles.menuIconEmoji}>👤</Text>
            <Text style={styles.menuIconLabel}>{t('home.profile')}</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.menuIcon,
              pressed && styles.menuIconPressed,
            ]}
            onPress={handleOpenSettings}
          >
            <Text style={styles.menuIconEmoji}>⚙️</Text>
            <Text style={styles.menuIconLabel}>{t('home.settings')}</Text>
          </Pressable>
        </View>
        
        {/* Instructions Button - moved up before achievements */}
        <Pressable
          style={({ pressed }) => [
            styles.instructionsButton,
            pressed && styles.instructionsButtonPressed,
          ]}
          onPress={async () => {
            await feedback.buttonPress();
            setShowInstructions(true);
          }}
        >
          <Text style={styles.instructionsButtonText}>❓ {t('home.instructionsTitle')}</Text>
        </Pressable>
      </Animated.View>

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
  content: {
    flex: 1,
    padding: 15,
    paddingBottom: 100, // Espace pour la bannière publicitaire (50px banner + 50px marge)
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  title: {
    fontSize: FONT_SIZE.massive,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZE.xl,
    color: COLORS.warning,
    marginBottom: SPACING.xl,
    fontWeight: FONT_WEIGHT.semibold,
  },
  dailyChallengeCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
    width: '100%',
    maxWidth: 350,
    borderWidth: 2,
    borderColor: COLORS.warning,
  },
  challengeTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.warning,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  challengeTarget: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: COLORS.cellDefault,
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
    marginBottom: SPACING.md,
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
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  statCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    minWidth: 80,
    alignItems: 'center',
    ...SHADOW.small,
  },
  statValue: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  playButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 50,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.xl,
    ...SHADOW.medium,
  },
  playButtonPressed: {
    backgroundColor: COLORS.primary,
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  playButtonText: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
    letterSpacing: 1,
  },
  menuContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.sm,
  },
  menuIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW.medium,
    borderWidth: 2,
    borderColor: 'rgba(74, 144, 226, 0.3)',
  },
  menuIconPressed: {
    transform: [{ scale: 0.92 }],
    opacity: 0.8,
  },
  menuIconEmoji: {
    fontSize: 28,
    marginBottom: 2,
  },
  menuIconLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.semibold,
    textAlign: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
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
  instructionsButton: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.primary,
    ...SHADOW.small,
  },
  instructionsButtonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
  instructionsButtonText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
    textAlign: 'center',
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
