import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../constants/gameConfig';
import { GameStatus } from '../types';

interface StatusMessageProps {
  gameStatus: GameStatus;
  isShowingSequence: boolean;
  sequenceLength: number;
}

export const StatusMessage: React.FC<StatusMessageProps> = ({
  gameStatus,
  isShowingSequence,
  sequenceLength,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Animate message changes
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [gameStatus, fadeAnim, scaleAnim]);
  const getMessage = () => {
    if (gameStatus === 'showing' && isShowingSequence) {
      return {
        text: `Mémorise la séquence (${sequenceLength} cases)`,
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
      return {
        text: '✓ Excellent ! Niveau suivant...',
        color: COLORS.success,
      };
    }
    if (gameStatus === 'wrong') {
      return {
        text: '✗ Erreur ! Réessaye...',
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
    paddingVertical: 20,
    paddingHorizontal: 15,
    minHeight: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
