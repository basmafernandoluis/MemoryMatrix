import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../constants/gameConfig';
import { SPACING, FONT_SIZE, FONT_WEIGHT } from '../constants/designTokens';
import { GameStatus } from '../types';

interface StatusMessageProps {
  gameStatus: GameStatus;
  isShowingSequence: boolean;
  sequenceLength: number;
  level?: number; // Add level prop for encouraging messages
}

export const StatusMessage: React.FC<StatusMessageProps> = ({
  gameStatus,
  isShowingSequence,
  sequenceLength,
  level = 1,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const previousStatus = useRef<GameStatus>(gameStatus);

  useEffect(() => {
    // Ne pas animer les transitions rapides correct <-> playing
    const isQuickTransition = 
      (previousStatus.current === 'correct' && gameStatus === 'playing') ||
      (previousStatus.current === 'playing' && gameStatus === 'correct');
    
    previousStatus.current = gameStatus;
    
    if (isQuickTransition) {
      // Transition instantanée sans animation
      fadeAnim.setValue(1);
      scaleAnim.setValue(1);
      return;
    }
    
    // Animation minimale pour les autres transitions
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [gameStatus, fadeAnim, scaleAnim]);
  const getMessage = () => {
    if (gameStatus === 'showing' && isShowingSequence) {
      return {
        text: `Mémorise la séquence (${sequenceLength} case${sequenceLength > 1 ? 's' : ''})`,
        color: COLORS.primary,
      };
    }
    if (gameStatus === 'playing') {
      return {
        text: 'À ton tour ! Reproduis la séquence',
        color: COLORS.text,
      };
    }
    if (gameStatus === 'correct') {
      // Encouraging messages based on milestones
      if (level === 5) {
        return { text: '🎯 Niveau 5 ! Tu es sur la bonne voie !', color: COLORS.success };
      }
      if (level === 10) {
        return { text: '🏆 Niveau 10 ! Tu es un Maître !', color: COLORS.warning };
      }
      if (level === 15) {
        return { text: '🏅 Niveau 15 ! Champion !', color: COLORS.warning };
      }
      if (level === 20) {
        return { text: '🏆 Niveau 20 ! Expert confirmé !', color: COLORS.warning };
      }
      if (level === 25) {
        return { text: '👑 Niveau 25 ! Tu es une Légende !', color: COLORS.warning };
      }
      if (level === 30) {
        return { text: '💎 NIVEAU 30 ! GÉNIE ABSOLU !', color: COLORS.warning };
      }
      return {
        text: '✓ Excellent ! Continue comme ça !',
        color: COLORS.success,
      };
    }
    if (gameStatus === 'wrong') {
      return {
        text: '✗ Pas grave ! Réessaye, tu vas y arriver !',
        color: COLORS.error,
      };
    }
    return {
      text: 'Prêt à jouer ?',
      color: COLORS.textSecondary,
    };
  };

  const message = getMessage();

  return (
    <View style={styles.container}>
      <Animated.Text 
        style={[
          styles.message, 
          { 
            color: message.color,
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }
        ]}
      >
        {message.text}
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    minHeight: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    textAlign: 'center',
  },
});
