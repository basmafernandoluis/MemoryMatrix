import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/gameConfig';
import { SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, SHADOW } from '../constants/designTokens';
import { UserProgress, DailyChallenge, Achievement } from '../types';
import { feedback } from '../utils/soundManager';
import { getAchievementsWithStatus } from '../utils/achievements';

interface HomeScreenProps {
  onStartGame: () => void;
  onOpenLeaderboard: () => void;
  onOpenProfile: () => void;
  onOpenChallenges: () => void;
  userProgress: UserProgress | null;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ 
  onStartGame, 
  onOpenLeaderboard, 
  onOpenProfile,
  onOpenChallenges,
  userProgress 
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [showInstructions, setShowInstructions] = useState(false);

  const dailyChallenge = userProgress?.dailyChallenge;
  const challengeProgress = dailyChallenge 
    ? Math.min(100, Math.round((dailyChallenge.currentScore / dailyChallenge.targetScore) * 100))
    : 0;

  const achievements = userProgress ? getAchievementsWithStatus(userProgress) : [];
  const unlockedCount = achievements.filter((a: Achievement) => a.unlocked).length;

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
    onStartGame();
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

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View 
        style={[
          styles.content, 
          { 
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }
        ]}
      >
        <Text style={styles.title}>Memory Matrix</Text>
        <Text style={styles.subtitle}>Challenge</Text>
        
        {dailyChallenge && (
          <View style={styles.dailyChallengeCard}>
            <Text style={styles.challengeTitle}>🎯 Défi Quotidien</Text>
            <Text style={styles.challengeTarget}>
              Objectif: {dailyChallenge.targetScore} points
            </Text>
            
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { width: `${challengeProgress}%` },
                  dailyChallenge.completed && styles.progressBarCompleted,
                ]} 
              />
            </View>
            
            <Text style={styles.challengeProgress}>
              {dailyChallenge.currentScore} / {dailyChallenge.targetScore}
              {dailyChallenge.completed && ' ✓ Complété !'}
            </Text>
          </View>
        )}
        
        <View style={styles.statsContainer}>
          {userProgress && (
            <>
              <Animated.View style={[styles.statCard, { opacity: fadeAnim }]}>
                <Text style={styles.statValue}>{userProgress.highScore}</Text>
                <Text style={styles.statLabel}>Meilleur Score</Text>
              </Animated.View>
              
              <Animated.View style={[styles.statCard, { opacity: fadeAnim }]}>
                <Text style={styles.statValue}>{userProgress.maxLevelReached}</Text>
                <Text style={styles.statLabel}>Niveau Max</Text>
              </Animated.View>
              
              <Animated.View style={[styles.statCard, { opacity: fadeAnim }]}>
                <Text style={styles.statValue}>{userProgress.totalGamesPlayed}</Text>
                <Text style={styles.statLabel}>Parties Jouées</Text>
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
            <Text style={styles.playButtonText}>▶ JOUER</Text>
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
            <Text style={styles.menuIconLabel}>Classement</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.menuIcon,
              pressed && styles.menuIconPressed,
            ]}
            onPress={handleOpenChallenges}
          >
            <Text style={styles.menuIconEmoji}>🎯</Text>
            <Text style={styles.menuIconLabel}>Défis</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.menuIcon,
              pressed && styles.menuIconPressed,
            ]}
            onPress={handleOpenProfile}
          >
            <Text style={styles.menuIconEmoji}>👤</Text>
            <Text style={styles.menuIconLabel}>Profil</Text>
          </Pressable>
        </View>
        
        <View style={styles.achievementsSection}>
          <Text style={styles.achievementsTitle}>
            🏅 Succès ({unlockedCount}/{achievements.length})
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.achievementsScroll}
          >
            {achievements.map((achievement: Achievement) => (
              <View 
                key={achievement.id} 
                style={[
                  styles.achievementCard,
                  !achievement.unlocked && styles.achievementCardLocked,
                ]}
              >
                <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                <Text style={[
                  styles.achievementTitle,
                  !achievement.unlocked && styles.achievementTitleLocked,
                ]}>
                  {achievement.title}
                </Text>
                <Text style={styles.achievementDescription}>
                  {achievement.description}
                </Text>
                {achievement.target && !achievement.unlocked && (
                  <Text style={styles.achievementProgress}>
                    {achievement.progress}/{achievement.target}
                  </Text>
                )}
                {achievement.unlocked && (
                  <Text style={styles.achievementUnlocked}>✓</Text>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
        
        {/* Instructions Button instead of full instructions */}
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
          <Text style={styles.instructionsButtonText}>❓ Comment jouer ?</Text>
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
            <Text style={styles.modalTitle}>📚 Comment jouer ?</Text>
            
            <View style={styles.instructionsList}>
              <View style={styles.instructionItem}>
                <Text style={styles.instructionNumber}>1️⃣</Text>
                <Text style={styles.instructionItemText}>
                  Mémorise la séquence de cases qui s'illuminent
                </Text>
              </View>
              
              <View style={styles.instructionItem}>
                <Text style={styles.instructionNumber}>2️⃣</Text>
                <Text style={styles.instructionItemText}>
                  Reproduis la séquence en cliquant sur les cases dans le bon ordre
                </Text>
              </View>
              
              <View style={styles.instructionItem}>
                <Text style={styles.instructionNumber}>3️⃣</Text>
                <Text style={styles.instructionItemText}>
                  La séquence s'allonge à chaque niveau (jusqu'à 30 niveaux !)
                </Text>
              </View>
              
              <View style={styles.instructionItem}>
                <Text style={styles.instructionNumber}>4️⃣</Text>
                <Text style={styles.instructionItemText}>
                  Tu as 5 vies. Attention, chaque erreur te fait perdre une vie !
                </Text>
              </View>
              
              <View style={styles.instructionItem}>
                <Text style={styles.instructionNumber}>⭐</Text>
                <Text style={styles.instructionItemText}>
                  Débloque 16 achievements et grimpe dans le classement !
                </Text>
              </View>
            </View>
            
            <Pressable
              style={styles.closeButton}
              onPress={async () => {
                await feedback.buttonPress();
                setShowInstructions(false);
              }}
            >
              <Text style={styles.closeButtonText}>C'est compris !</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: 15,
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
    gap: SPACING.xl,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  menuIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
    fontSize: 32,
    marginBottom: 4,
  },
  menuIconLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.semibold,
    textAlign: 'center',
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
    ...SHADOW.large,
  },
  modalTitle: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.xxl,
  },
  instructionsList: {
    gap: SPACING.lg,
    marginBottom: SPACING.xxl,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  instructionNumber: {
    fontSize: FONT_SIZE.xxl,
    minWidth: 30,
  },
  instructionItemText: {
    flex: 1,
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
