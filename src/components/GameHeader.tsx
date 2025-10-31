import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { COLORS } from '../constants/gameConfig';
import { SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS } from '../constants/designTokens';
import { UserProgress } from '../types';

interface GameHeaderProps {
  level: number;
  score: number;
  lives: number;
  userProgress?: UserProgress | null;
  onPausePress?: () => void;
  isPauseDisabled?: boolean;
  hintsRemaining?: number;
  onHintPress?: () => void;
  isHintDisabled?: boolean;
  hideHearts?: boolean; // Cacher les cœurs pour modes infinis
}

export const GameHeader: React.FC<GameHeaderProps> = ({ 
  level, 
  score, 
  lives, 
  userProgress,
  onPausePress,
  isPauseDisabled = false,
  hintsRemaining = 0,
  onHintPress,
  isHintDisabled = false,
  hideHearts = false,
}) => {
  const levelScale = useRef(new Animated.Value(1)).current;
  const scoreScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Subtle level change animation - reduced from 1.3 to 1.15
    Animated.sequence([
      Animated.spring(levelScale, {
        toValue: 1.15,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.spring(levelScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, [level, levelScale]);

  useEffect(() => {
    // Subtle score change animation - reduced from 1.2 to 1.1
    Animated.sequence([
      Animated.spring(scoreScale, {
        toValue: 1.1,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.spring(scoreScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, [score, scoreScale]);
  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <View style={styles.stat}>
          <Text style={styles.label}>Niveau</Text>
          <Animated.Text style={[styles.value, { transform: [{ scale: levelScale }] }]}>
            {level}
          </Animated.Text>
        </View>
        
        <View style={styles.stat}>
          <Text style={styles.label}>Score</Text>
          <Animated.Text style={[styles.value, { transform: [{ scale: scoreScale }] }]}>
            {score}
          </Animated.Text>
          {userProgress && userProgress.highScore > 0 && (
            <Text style={styles.highScore}>Record: {userProgress.highScore}</Text>
          )}
        </View>
      </View>

      <View style={styles.centerSection}>
        {!hideHearts && (
          <View style={styles.stat}>
            <Text style={styles.label}>Vies</Text>
            <View style={styles.livesContainer}>
              {Array.from({ length: 5 }).map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.heart,
                    index < lives ? styles.heartActive : styles.heartInactive,
                  ]}
                >
                  <Text style={styles.heartText}>♥</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      <View style={styles.rightSection}>
        {/* Hint Button */}
        {onHintPress && (
          <Pressable
            style={({ pressed }) => [
              styles.hintButton,
              (isHintDisabled || hintsRemaining === 0) && styles.hintButtonDisabled,
              pressed && !isHintDisabled && hintsRemaining > 0 && styles.hintButtonPressed,
            ]}
            onPress={onHintPress}
            disabled={isHintDisabled || hintsRemaining === 0}
          >
            <Text style={styles.hintButtonText}>💡</Text>
            {hintsRemaining > 0 && (
              <View style={styles.hintBadge}>
                <Text style={styles.hintBadgeText}>{hintsRemaining}</Text>
              </View>
            )}
          </Pressable>
        )}

        {/* Pause Button */}
        {onPausePress && (
          <Pressable
            style={({ pressed }) => [
              styles.pauseButton,
              isPauseDisabled && styles.pauseButtonDisabled,
              pressed && !isPauseDisabled && styles.pauseButtonPressed,
            ]}
            onPress={onPausePress}
            disabled={isPauseDisabled}
          >
            <Text style={styles.pauseButtonText}>⏸️</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.xl,
  },
  leftSection: {
    flexDirection: 'row',
    gap: SPACING.lg,
    flex: 2,
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
  },
  rightSection: {
    flexDirection: 'row',
    gap: SPACING.xs,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  stat: {
    alignItems: 'center',
  },
  label: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    fontWeight: FONT_WEIGHT.semibold,
  },
  value: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
  },
  livesContainer: {
    flexDirection: 'row',
    gap: 3,
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: 80,
  },
  heart: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartActive: {
    opacity: 1,
  },
  heartInactive: {
    opacity: 0.3,
  },
  heartText: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.error,
  },
  highScore: {
    fontSize: 9,
    color: COLORS.warning,
    marginTop: 2,
    fontWeight: FONT_WEIGHT.semibold,
  },
  pauseButton: {
    backgroundColor: COLORS.background,
    width: 38,
    height: 38,
    borderRadius: BORDER_RADIUS.round,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  pauseButtonDisabled: {
    opacity: 0.3,
    borderColor: COLORS.textSecondary,
  },
  pauseButtonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.95 }],
  },
  pauseButtonText: {
    fontSize: FONT_SIZE.md,
  },
  hintButton: {
    backgroundColor: COLORS.background,
    width: 38,
    height: 38,
    borderRadius: BORDER_RADIUS.round,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.warning,
  },
  hintButtonDisabled: {
    opacity: 0.3,
    borderColor: COLORS.textSecondary,
  },
  hintButtonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.95 }],
  },
  hintButtonText: {
    fontSize: FONT_SIZE.md,
  },
  hintBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.error,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintBadgeText: {
    fontSize: 10,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
  },
});
