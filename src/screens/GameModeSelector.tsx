/**
 * Game Mode Selector Screen
 * Permet de choisir le mode de jeu avant de commencer
 * Grid layout avec tous les modes visibles
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/gameConfig';
import { SPACING, FONT_SIZE, BORDER_RADIUS, SHADOW, FONT_WEIGHT } from '../constants/designTokens';
import { GameMode } from '../types';
import { GAME_MODES, isModeUnlocked } from '../constants/gameModes';
import { BackButton } from '../components/BackButton';
import { playPasseSound } from '../utils/soundManager';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface GameModeSelectorProps {
  onSelectMode: (mode: GameMode) => void;
  onBack: () => void;
  maxLevelReached: number;
  userXp?: number;
  userCoins?: number;
  friendChallengeWins?: number;
}

export default function GameModeSelector({
  onSelectMode,
  onBack,
  maxLevelReached,
  userXp = 0,
  userCoins = 0,
  friendChallengeWins = 0,
}: GameModeSelectorProps) {
  // Order modes from easiest to hardest for better retention
  const modeOrder: GameMode[] = ['classic', 'zen', 'custom', 'survival', 'timeAttack', 'focusChallenge'];
  const modes = modeOrder.filter((m) => GAME_MODES[m]);
  const [unlockAnimation] = useState(new Animated.Value(0));

  const getUnlockText = (mode: GameMode): string => {
    const config = GAME_MODES[mode];
    
    // Cas spécial pour Focus Challenge
    if (mode === 'focusChallenge') {
      return `2 victoires contre amis (${friendChallengeWins}/2)`;
    }
    
    if (!config.unlockRequirements) return '';
    
    const req = config.unlockRequirements;
    const parts: string[] = [];
    
    if (req.levelRequired) {
      parts.push(`Niveau ${req.levelRequired}`);
    }
    if (req.xpCost) {
      parts.push(`${req.xpCost} XP`);
    }
    if (req.coinsCost) {
      parts.push(`${req.coinsCost} 🪙`);
    }
    
    return parts.join(' • ');
  };

  const renderModeCard = (mode: GameMode, index: number) => {
    const config = GAME_MODES[mode];
    const unlocked = isModeUnlocked(mode, maxLevelReached, userXp, userCoins, friendChallengeWins);
    const cardScale = useRef(new Animated.Value(0.9)).current;
    const cardOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const delay = 60 * index; // cascade entrée
      Animated.parallel([
        Animated.timing(cardOpacity, { toValue: 1, duration: 220, delay, useNativeDriver: true }),
        Animated.spring(cardScale, { toValue: 1, delay, useNativeDriver: true, friction: 7, tension: 120 }),
      ]).start();
    }, []);

    return (
      <Animated.View
        key={mode}
        style={[styles.animatedCard, { opacity: cardOpacity, transform: [{ scale: cardScale }] }]}
      >
        <TouchableOpacity
          style={[styles.modeCard, !unlocked && styles.modeCardLocked]}
          onPress={() => {
            if (unlocked) {
              playPasseSound();
              onSelectMode(mode);
            }
          }}
          activeOpacity={unlocked ? 0.7 : 1}
          disabled={!unlocked}
        >
          {/* Icône */}
          <Text style={styles.modeIcon}>{config.icon}</Text>
          
          {/* Nom du mode */}
          <Text style={[
            styles.modeTitle,
            !unlocked && styles.modeTitleLocked,
          ]}>
            {config.name}
          </Text>
          
          {/* Badge recommandé pour Classic et Zen */}
          {(mode === 'classic' || mode === 'zen') && (
            <View style={styles.recommendedBadge}>
              <Text style={styles.recommendedText}>Recommandé</Text>
            </View>
          )}
          
          {/* Description */}
          <Text style={styles.modeDescription}>{config.description}</Text>
          
          {/* Features compactes */}
          <View style={styles.featuresCompact}>
            {config.settings.hasLives !== false ? (
              <Text style={styles.featureCompact}>❤️ 5</Text>
            ) : (
              <Text style={styles.featureCompact}>♾️</Text>
            )}
            {config.settings.hasTimer && (
              <Text style={styles.featureCompact}>⏱️ {config.settings.timerDuration}s</Text>
            )}
          </View>
          
          {/* Badge de déblocage */}
          {!unlocked && (
            <View style={styles.lockBadge}>
              <Text style={styles.lockIcon}>🔒</Text>
              <Text style={styles.lockText}>{getUnlockText(mode)}</Text>
            </View>
          )}
          
          {/* Checkmark si débloqué */}
          {unlocked && (
            <View style={styles.unlockedBadge}>
              <Text style={styles.unlockedIcon}>✓</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.background}>
        {/* Header */}
        <View style={styles.header}>
          <BackButton onPress={onBack} color="#FFFFFF" backgroundColor="rgba(255,255,255,0.12)" />
          <Text style={styles.title}>Choisir un Mode</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Grid des modes */}
        <ScrollView
          contentContainerStyle={styles.modesGrid}
          showsVerticalScrollIndicator={false}
        >
          {modes.map((mode, i) => renderModeCard(mode, i))}
        </ScrollView>

        {/* Info */}
        <View style={styles.infoFooter}>
          <Text style={styles.infoIcon}>💡</Text>
          <Text style={styles.infoText}>
            Complétez les niveaux pour débloquer les modes !
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl + 20,
    paddingBottom: SPACING.lg,
  },
  backButton: {
    padding: SPACING.sm,
  },
  backButtonText: {
    fontSize: FONT_SIZE.md,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  placeholder: {
    width: 80,
  },
  
  // Grid layout
  modesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  
  // Cards compactes style succès
  modeCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    width: (SCREEN_WIDTH - SPACING.md * 3) / 2, // 2 colonnes
    minHeight: 160,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: COLORS.success,
    ...SHADOW.medium,
  },
  animatedCard: {
    width: (SCREEN_WIDTH - SPACING.md * 3) / 2,
  },
  modeCardLocked: {
    opacity: 0.6,
    borderColor: COLORS.textSecondary,
  },
  modeIcon: {
    fontSize: 40,
    marginBottom: SPACING.xs,
  },
  modeTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  modeTitleLocked: {
    color: COLORS.textSecondary,
  },
  modeDescription: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 14,
    marginBottom: SPACING.sm,
  },
  
  // Features compactes
  featuresCompact: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  featureCompact: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.semibold,
  },
  
  // Badge lock
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: SPACING.xs,
  },
  lockIcon: {
    fontSize: 10,
    marginRight: SPACING.xs / 2,
  },
  lockText: {
    fontSize: 9,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.semibold,
  },
  
  // Badge unlocked
  unlockedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.success,
    borderRadius: 12,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unlockedIcon: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  recommendedBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#ffbf47',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  recommendedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#3a2600',
    letterSpacing: 0.5,
  },
  
  // Footer info
  infoFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    marginTop: SPACING.md,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: '#FFFFFF',
    opacity: 0.9,
    lineHeight: 18,
  },
});
