import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../constants/gameConfig';
import { SPACING, FONT_SIZE, FONT_WEIGHT } from '../constants/designTokens';
import { GameStatus, GameMode } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface StatusMessageProps {
  gameStatus: GameStatus;
  isShowingSequence: boolean;
  sequenceLength: number;
  level?: number; // Add level prop for encouraging messages
  mode?: GameMode; // Add mode to customize messages
}

export const StatusMessage: React.FC<StatusMessageProps> = ({
  gameStatus,
  isShowingSequence,
  sequenceLength,
  level = 1,
  mode = 'classic',
}) => {
  const { t } = useTranslation();
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
      if (mode === 'focusChallenge') {
        return {
          text: t('game.memorizeFocusShapes', { count: sequenceLength }),
          color: COLORS.primary,
        };
      }
      return {
        text: t('game.memorizeSequence', { count: sequenceLength }),
        color: COLORS.primary,
      };
    }
    if (gameStatus === 'playing') {
      if (mode === 'focusChallenge') {
        return {
          text: t('game.clickShapesInOrder'),
          color: COLORS.text,
        };
      }
      return {
        text: t('game.yourTurn'),
        color: COLORS.text,
      };
    }
    if (gameStatus === 'correct') {
      // Encouraging messages based on milestones
      if (level === 5) {
        return { text: t('game.level5'), color: COLORS.success };
      }
      if (level === 10) {
        return { text: t('game.level10'), color: COLORS.warning };
      }
      if (level === 15) {
        return { text: t('game.level15'), color: COLORS.warning };
      }
      if (level === 20) {
        return { text: t('game.level20'), color: COLORS.warning };
      }
      if (level === 25) {
        return { text: t('game.level25'), color: COLORS.warning };
      }
      if (level === 30) {
        return { text: t('game.level30'), color: COLORS.warning };
      }
      return {
        text: t('game.excellent'),
        color: COLORS.success,
      };
    }
    if (gameStatus === 'wrong') {
      return {
        text: t('game.tryAgain'),
        color: COLORS.error,
      };
    }
    return {
      text: t('game.ready'),
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
