import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/gameConfig';
import { UserProgress, DailyChallenge } from '../types';
import { feedback } from '../utils/soundManager';
import { getAchievementsWithStatus } from '../utils/achievements';
import { ShineEffect } from '../components/ShineEffect';

interface HomeScreenProps {
  onStartGame: () => void;
  userProgress: UserProgress | null;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onStartGame, userProgress }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const dailyChallenge = userProgress?.dailyChallenge;
  const challengeProgress = dailyChallenge 
    ? Math.min(100, Math.round((dailyChallenge.currentScore / dailyChallenge.targetScore) * 100))
    : 0;

  const achievements = userProgress ? getAchievementsWithStatus(userProgress) : [];
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  
  // Track recently unlocked achievements (those in the last session)
  const [recentlyUnlocked, setRecentlyUnlocked] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    // Check for newly unlocked achievements only when userProgress changes
    if (!userProgress) return;
    
    const newUnlocked = new Set<string>();
    const achievementsToCheck = getAchievementsWithStatus(userProgress);
    achievementsToCheck.forEach(achievement => {
      if (achievement.unlocked && achievement.progress === achievement.target) {
        newUnlocked.add(achievement.id);
      }
    });
    
    // Only update if there are actual changes
    if (newUnlocked.size > 0) {
      setRecentlyUnlocked(newUnlocked);
    }
  }, [userProgress?.achievements?.length, userProgress?.totalGamesPlayed, userProgress?.highScore]);

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for play button
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

    return () => pulse.stop();
  }, [fadeAnim, scaleAnim, pulseAnim]);
  const handleStartGame = async () => {
    await feedback.buttonPress();
    onStartGame();
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
        
        <View style={styles.achievementsSection}>
          <Text style={styles.achievementsTitle}>
            🏅 Succès ({unlockedCount}/{achievements.length})
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.achievementsScroll}
          >
            {achievements.map(achievement => (
              <View 
                key={achievement.id} 
                style={[
                  styles.achievementCard,
                  !achievement.unlocked && styles.achievementCardLocked,
                ]}
              >
                {achievement.unlocked && recentlyUnlocked.has(achievement.id) && (
                  <ShineEffect active={true} size={80} color="#FFD700" />
                )}
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
        
        <View style={styles.instructions}>
          <Text style={styles.instructionTitle}>Comment jouer ?</Text>
          <Text style={styles.instructionText}>
            1. Mémorise la séquence qui s'illumine{'\n'}
            2. Reproduis-la en cliquant sur les cases{'\n'}
            3. La séquence s'allonge à chaque niveau{'\n'}
            4. Tu as 3 vies, ne te trompe pas !
          </Text>
        </View>
      </Animated.View>
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
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 5,
    marginTop: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    color: COLORS.warning,
    marginBottom: 20,
    fontWeight: '600',
  },
  dailyChallengeCard: {
    backgroundColor: COLORS.surface,
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    width: '100%',
    maxWidth: 350,
    borderWidth: 2,
    borderColor: COLORS.warning,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.warning,
    textAlign: 'center',
    marginBottom: 8,
  },
  challengeTarget: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 10,
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: COLORS.cellDefault,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 5,
  },
  progressBarCompleted: {
    backgroundColor: COLORS.success,
  },
  challengeProgress: {
    fontSize: 12,
    color: COLORS.text,
    textAlign: 'center',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  statCard: {
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  playButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 50,
    paddingVertical: 16,
    borderRadius: 25,
    marginBottom: 20,
    elevation: 5,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  playButtonPressed: {
    backgroundColor: COLORS.primary,
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  playButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    letterSpacing: 1,
  },
  instructions: {
    backgroundColor: COLORS.surface,
    padding: 15,
    borderRadius: 12,
    maxWidth: 350,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  achievementsSection: {
    width: '100%',
    marginBottom: 15,
  },
  achievementsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  achievementsScroll: {
    flexGrow: 0,
  },
  achievementCard: {
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 10,
    marginRight: 8,
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
    marginBottom: 6,
  },
  achievementTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 4,
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
    marginTop: 4,
    fontWeight: '600',
  },
  achievementUnlocked: {
    fontSize: 16,
    color: COLORS.success,
    position: 'absolute',
    top: 4,
    right: 4,
  },
});
