/**
 * Game Mode Selector Screen
 * Permet de choisir le mode de jeu avant de commencer
 * Carrousel horizontal avec défilement et animations
 */

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/gameConfig';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '../constants/designTokens';
import { GameMode } from '../types';
import { GAME_MODES, isModeUnlocked } from '../constants/gameModes';
import { playPasseSound } from '../utils/soundManager';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.85;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.65; // Hauteur augmentée
const CARD_SPACING = 20;

interface GameModeSelectorProps {
  onSelectMode: (mode: GameMode) => void;
  onBack: () => void;
  maxLevelReached: number;
}

export default function GameModeSelector({
  onSelectMode,
  onBack,
  maxLevelReached,
}: GameModeSelectorProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const lastScrollX = useRef(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  
  const modes = Object.keys(GAME_MODES) as GameMode[];

  // Gérer le défilement et jouer le son
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / (CARD_WIDTH + CARD_SPACING));
    
    // Animer la valeur de scroll
    scrollX.setValue(offsetX);
    
    // Jouer le son seulement si l'index a changé
    if (newIndex !== currentIndex && offsetX !== lastScrollX.current) {
      playPasseSound();
      setCurrentIndex(newIndex);
    }
    
    lastScrollX.current = offsetX;
  };

  const renderModeCard = (mode: GameMode, index: number) => {
    const config = GAME_MODES[mode];
    const unlocked = isModeUnlocked(mode, maxLevelReached);

    // Calculer la position de la carte pour l'animation
    const inputRange = [
      (index - 1) * (CARD_WIDTH + CARD_SPACING),
      index * (CARD_WIDTH + CARD_SPACING),
      (index + 1) * (CARD_WIDTH + CARD_SPACING),
    ];

    // Animation de scale (zoom au centre)
    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.9, 1, 0.9],
      extrapolate: 'clamp',
    });

    // Animation d'opacité
    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.6, 1, 0.6],
      extrapolate: 'clamp',
    });

    // Animation de rotation légère
    const rotateY = scrollX.interpolate({
      inputRange,
      outputRange: ['-15deg', '0deg', '15deg'],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        key={mode}
        style={[
          styles.cardWrapper,
          {
            transform: [{ scale }, { perspective: 1000 }, { rotateY }],
            opacity,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.modeCard, !unlocked && styles.lockedCard]}
          onPress={() => unlocked && onSelectMode(mode)}
          activeOpacity={unlocked ? 0.7 : 1}
          disabled={!unlocked}
        >
        <LinearGradient
          colors={
            unlocked
              ? [config.color, config.color + 'CC']
              : ['#999', '#666']
          }
          style={styles.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Icône et titre */}
          <View style={styles.cardHeader}>
            <Text style={styles.modeIcon}>{config.icon}</Text>
            <View style={styles.cardTitleContainer}>
              <Text style={styles.modeTitle}>{config.name}</Text>
              {!unlocked && (
                <View style={styles.lockBadge}>
                  <Text style={styles.lockIcon}>🔒</Text>
                  <Text style={styles.lockText}>Niveau {5} requis</Text>
                </View>
              )}
            </View>
          </View>

          {/* Description */}
          <Text style={styles.modeDescription}>{config.description}</Text>

          {/* Caractéristiques du mode */}
          <View style={styles.features}>
            {config.settings.hasLives !== false && (
              <View style={styles.feature}>
                <Text style={styles.featureIcon}>❤️</Text>
                <Text style={styles.featureText}>3 vies</Text>
              </View>
            )}
            {config.settings.hasLives === false && (
              <View style={styles.feature}>
                <Text style={styles.featureIcon}>♾️</Text>
                <Text style={styles.featureText}>Vie infinie</Text>
              </View>
            )}
            {config.settings.hasTimer && (
              <View style={styles.feature}>
                <Text style={styles.featureIcon}>⏱️</Text>
                <Text style={styles.featureText}>
                  {config.settings.timerDuration}s
                </Text>
              </View>
            )}
            {config.settings.difficultyProgression === 'fast' && (
              <View style={styles.feature}>
                <Text style={styles.featureIcon}>📈</Text>
                <Text style={styles.featureText}>Difficulté +</Text>
              </View>
            )}
            {config.settings.difficultyProgression === 'slow' && (
              <View style={styles.feature}>
                <Text style={styles.featureIcon}>🌊</Text>
                <Text style={styles.featureText}>Relaxant</Text>
              </View>
            )}
          </View>

          {/* Bouton de sélection */}
          {unlocked && (
            <View style={styles.playButton}>
              <Text style={styles.playButtonText}>JOUER</Text>
            </View>
          )}
        </LinearGradient>
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
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Choisir un Mode</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Carrousel des modes */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled={false}
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={CARD_WIDTH + CARD_SPACING}
          snapToAlignment="center"
          contentContainerStyle={styles.carouselContent}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {modes.map((mode, index) => renderModeCard(mode, index))}
        </ScrollView>

        {/* Indicateurs de pagination */}
        <View style={styles.pagination}>
          {modes.map((mode, index) => (
            <View
              key={mode}
              style={[
                styles.paginationDot,
                index === currentIndex && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>

        {/* Info déblocage */}
        <View style={styles.unlockInfo}>
          <Text style={styles.unlockInfoIcon}>💡</Text>
          <Text style={styles.unlockInfoText}>
            Glissez pour découvrir tous les modes de jeu !
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
  carouselContent: {
    paddingHorizontal: (SCREEN_WIDTH - CARD_WIDTH) / 2,
    paddingVertical: SPACING.lg,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginHorizontal: CARD_SPACING / 2,
  },
  modeCard: {
    flex: 1,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  lockedCard: {
    opacity: 0.8,
  },
  cardGradient: {
    flex: 1,
    padding: SPACING.xl,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modeIcon: {
    fontSize: 70,
    marginRight: SPACING.lg,
  },
  cardTitleContainer: {
    flex: 1,
  },
  modeTitle: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: SPACING.xs,
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    alignSelf: 'flex-start',
  },
  lockIcon: {
    fontSize: 12,
    marginRight: SPACING.xs,
  },
  lockText: {
    fontSize: FONT_SIZE.sm,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modeDescription: {
    fontSize: FONT_SIZE.lg,
    color: '#FFFFFF',
    opacity: 0.95,
    marginBottom: SPACING.lg,
    lineHeight: 24,
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  featureIcon: {
    fontSize: 18,
    marginRight: SPACING.sm,
  },
  featureText: {
    fontSize: FONT_SIZE.md,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  playButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    marginTop: SPACING.md,
  },
  playButtonText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  paginationDotActive: {
    width: 24,
    backgroundColor: '#FFFFFF',
  },
  unlockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  unlockInfoIcon: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  unlockInfoText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: '#FFFFFF',
    opacity: 0.9,
    lineHeight: 20,
  },
});
