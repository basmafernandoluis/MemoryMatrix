import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/gameConfig';
import { UserProgress } from '../types';
import { feedback } from '../utils/soundManager';
import { ConfettiEffect } from '../components/ConfettiEffect';
import { ShineEffect } from '../components/ShineEffect';

interface GameOverScreenProps {
  score: number;
  level: number;
  userProgress: UserProgress | null;
  onPlayAgain: () => void;
  onBackToHome: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  score,
  level,
  userProgress,
  onPlayAgain,
  onBackToHome,
}) => {
  const isNewHighScore = userProgress && score >= userProgress.highScore;
  const [showConfetti, setShowConfetti] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const bannerAnim = useRef(new Animated.Value(0)).current;
  const scoreScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Score pop animation
    Animated.spring(scoreScale, {
      toValue: 1,
      delay: 200,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // New record effects
    if (isNewHighScore && score > 0) {
      // Trigger confetti
      setTimeout(() => setShowConfetti(true), 300);
      
      // Banner animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(bannerAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(bannerAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [fadeAnim, slideAnim, scoreScale, bannerAnim, isNewHighScore, score]);

  const handlePlayAgain = async () => {
    await feedback.buttonPress();
    onPlayAgain();
  };

  const handleBackToHome = async () => {
    await feedback.buttonPress();
    onBackToHome();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ConfettiEffect active={showConfetti} particleCount={50} />
      
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.gameOverText}>Game Over</Text>
        
        {isNewHighScore && score > 0 && (
          <Animated.View 
            style={[
              styles.newRecordBanner,
              {
                opacity: bannerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.7, 1],
                }),
                transform: [
                  {
                    scale: bannerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.05],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.newRecordText}>🏆 NOUVEAU RECORD ! 🏆</Text>
          </Animated.View>
        )}
        
        <Animated.View 
          style={[
            styles.scoreContainer,
            { transform: [{ scale: scoreScale }] },
          ]}
        >
          {isNewHighScore && score > 0 && (
            <ShineEffect active={true} size={150} color="#FFD700" />
          )}
          <Text style={styles.scoreLabel}>Score Final</Text>
          <Text style={styles.scoreValue}>{score}</Text>
          <Text style={styles.levelText}>Niveau atteint: {level}</Text>
        </Animated.View>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userProgress?.highScore || 0}</Text>
            <Text style={styles.statLabel}>Meilleur Score</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userProgress?.maxLevelReached || 1}</Text>
            <Text style={styles.statLabel}>Niveau Max</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userProgress?.totalGamesPlayed || 0}</Text>
            <Text style={styles.statLabel}>Parties Jouées</Text>
          </View>
        </View>
        
        <View style={styles.buttonContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handlePlayAgain}
          >
            <Text style={styles.primaryButtonText}>🔄 REJOUER</Text>
          </Pressable>
          
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleBackToHome}
          >
            <Text style={styles.secondaryButtonText}>🏠 ACCUEIL</Text>
          </Pressable>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameOverText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.error,
    marginBottom: 15,
  },
  newRecordBanner: {
    backgroundColor: COLORS.warning,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 15,
  },
  newRecordText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.background,
    letterSpacing: 1,
  },
  scoreContainer: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 20,
    minWidth: 200,
  },
  scoreLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  levelText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 25,
  },
  statItem: {
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
    paddingHorizontal: 20,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  primaryButton: {
    backgroundColor: COLORS.success,
  },
  secondaryButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
});
