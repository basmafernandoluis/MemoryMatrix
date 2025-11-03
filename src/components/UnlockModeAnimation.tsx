/**
 * Unlock Mode Animation Component
 * Animation affichée quand un mode est débloqué
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/gameConfig';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '../constants/designTokens';
import { GameMode } from '../types';
import { GAME_MODES } from '../constants/gameModes';
import { ConfettiEffect } from './ConfettiEffect';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface UnlockModeAnimationProps {
  visible: boolean;
  mode: GameMode | null;
  onComplete: () => void;
}

export default function UnlockModeAnimation({
  visible,
  mode,
  onComplete,
}: UnlockModeAnimationProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && mode) {
      // Séquence d'animation
      Animated.sequence([
        // Apparition avec scale
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        // Rotation légère
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();

      // Animation de glow en boucle
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Auto-fermeture après 3 secondes
      const timer = setTimeout(() => {
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          onComplete();
        });
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      // Reset animations
      scaleAnim.setValue(0);
      rotateAnim.setValue(0);
      glowAnim.setValue(0);
    }
  }, [visible, mode]);

  if (!mode) return null;

  const config = GAME_MODES[mode];
  
  const scale = scaleAnim;
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* Confetti effect */}
        <ConfettiEffect active={visible} />

        {/* Animation principale */}
        <Animated.View
          style={[
            styles.content,
            {
              transform: [{ scale }, { rotate }],
            },
          ]}
        >
          {/* Glow effect */}
          <Animated.View
            style={[
              styles.glow,
              {
                opacity: glowOpacity,
                backgroundColor: config.color,
              },
            ]}
          />

          {/* Card du mode */}
          <LinearGradient
            colors={[config.color, config.color + 'CC']}
            style={styles.card}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.unlockText}>🎉 MODE DÉBLOQUÉ ! 🎉</Text>
            
            <View style={styles.modeInfo}>
              <Text style={styles.modeIcon}>{config.icon}</Text>
              <Text style={styles.modeName}>{config.name}</Text>
            </View>
            
            <Text style={styles.modeDescription}>{config.description}</Text>
            
            <View style={styles.badge}>
              <Text style={styles.badgeText}>✨ Nouveau ✨</Text>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_WIDTH * 0.9,
    borderRadius: (SCREEN_WIDTH * 0.9) / 2,
    opacity: 0.3,
  },
  card: {
    width: SCREEN_WIDTH * 0.85,
    padding: SPACING.xxl,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  unlockText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: SPACING.xl,
    letterSpacing: 1,
  },
  modeInfo: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modeIcon: {
    fontSize: 80,
    marginBottom: SPACING.md,
  },
  modeName: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  modeDescription: {
    fontSize: FONT_SIZE.lg,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: SPACING.xl,
    lineHeight: 24,
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
});
