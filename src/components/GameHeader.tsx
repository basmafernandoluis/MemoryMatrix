import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { COLORS } from '../constants/gameConfig';
import { SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS } from '../constants/designTokens';
import { UserProgress, GameMode } from '../types';
import { useWorldRecords } from '../hooks/useWorldRecords';
import { formatRecord, getRecordLabel } from '../services/worldRecords';

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
  mode?: GameMode; // Mode de jeu actuel
  currentModeValue?: number; // Valeur actuelle selon le mode (streak, accuracy, etc.)
  userId?: string; // ID du joueur pour vérifier s'il détient le record
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
  mode = 'classic',
  currentModeValue = 0,
  userId,
}) => {
  const levelScale = useRef(new Animated.Value(1)).current;
  const scoreScale = useRef(new Animated.Value(1)).current;

  // Récupérer les records pour le mode actuel
  const {
    personalBest,
    worldRecord,
    isWorldRecordHolder,
    isNearWorldRecord,
  } = useWorldRecords(mode, userProgress || null, currentModeValue, userId);

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
          
          {/* Affichage Records Personnel et Mondial */}
          <View style={styles.recordsContainer}>
            {/* Record Personnel */}
            {personalBest > 0 && (
              <Text style={styles.personalRecord}>
                 🏅 Toi: {formatRecord(mode, personalBest)}
              </Text>
            )}
            
            {/* Record Mondial */}
            {worldRecord && (
              <View style={styles.worldRecordContainer}>
                <Text style={[
                  styles.worldRecord,
                  isWorldRecordHolder && styles.worldRecordHolder,
                  isNearWorldRecord && styles.nearWorldRecord,
                ]}>
                  {isWorldRecordHolder ? '👑' : '🌍'} Monde: {formatRecord(mode, worldRecord.value)}
                </Text>
                {isNearWorldRecord && !isWorldRecordHolder && (
                  <Text style={styles.nearRecordBadge}>🔥 Proche!</Text>
                )}
                {isWorldRecordHolder && (
                  <Text style={styles.recordHolderBadge}>👑 Champion!</Text>
                )}
              </View>
            )}
          </View>
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
  
  // Nouveaux styles pour les records
  recordsContainer: {
    marginTop: 4,
    gap: 2,
  },
  personalRecord: {
    fontSize: 9,
    color: COLORS.success,
    fontWeight: FONT_WEIGHT.semibold,
    textAlign: 'center',
  },
  worldRecord: {
    fontSize: 9,
    color: '#2196F3', // Bleu pour record mondial
    fontWeight: FONT_WEIGHT.semibold,
    textAlign: 'center',
  },
  worldRecordContainer: {
    alignItems: 'center',
    gap: 2,
  },
  worldRecordHolder: {
    color: COLORS.warning, // Or si le joueur détient le record
    textShadowColor: 'rgba(255, 193, 7, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  nearWorldRecord: {
    color: '#FF5722', // Rouge-orange si proche du record
  },
  nearRecordBadge: {
    fontSize: 8,
    color: '#FF5722',
    fontWeight: FONT_WEIGHT.bold,
    backgroundColor: 'rgba(255, 87, 34, 0.15)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  recordHolderBadge: {
    fontSize: 8,
    color: COLORS.warning,
    fontWeight: FONT_WEIGHT.bold,
    backgroundColor: 'rgba(255, 193, 7, 0.15)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
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
