import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Modal, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

interface Particle {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  scale: Animated.Value;
  opacity: Animated.Value;
  emoji: string;
}

interface LevelUpAnimationProps {
  visible: boolean;
  level: number;
  onAnimationComplete: () => void;
}

export const LevelUpAnimation: React.FC<LevelUpAnimationProps> = ({
  visible,
  level,
  onAnimationComplete,
}) => {
  const { colors } = useTheme();
  const [particles, setParticles] = useState<Particle[]>([]);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const textScaleAnim = useRef(new Animated.Value(0.5)).current;
  const numberScaleAnim = useRef(new Animated.Value(0)).current;

  const particleEmojis = ['⭐', '✨', '💎', '🏆'];

  useEffect(() => {
    if (visible) {
      createParticles();
      startAnimation();
    } else {
      resetAnimation();
    }
  }, [visible]);

  const createParticles = () => {
    const newParticles: Particle[] = [];
    const particleCount = 6; // Réduit de 8 à 6
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: new Animated.Value(0),
        y: new Animated.Value(0),
        scale: new Animated.Value(0),
        opacity: new Animated.Value(1),
        emoji: particleEmojis[i % particleEmojis.length],
      });
    }
    setParticles(newParticles);
  };

  const startAnimation = () => {
    // DURÉE TOTALE RÉDUITE À ~600ms (réduction de plus de 50%)
    Animated.sequence([
      // 1. Apparition ultra rapide (50ms)
      Animated.parallel([
        Animated.spring(scaleAnim, { 
          toValue: 1, 
          friction: 12, // Très élevé pour maximum de rapidité
          tension: 150, // Très élevé pour maximum de rapidité
          useNativeDriver: true 
        }),
        Animated.timing(fadeAnim, { 
          toValue: 1, 
          duration: 50, // Ultra rapide
          useNativeDriver: true 
        }),
      ]),

      // 2. Texte "LEVEL UP!" et numéro simultanés (100ms)
      Animated.parallel([
        Animated.spring(textScaleAnim, { 
          toValue: 1, 
          friction: 15,
          tension: 200,
          useNativeDriver: true 
        }),
        Animated.spring(numberScaleAnim, { 
          toValue: 1, 
          friction: 15,
          tension: 200,
          useNativeDriver: true 
        }),
      ]),

      // 3. Pause très courte (300ms)
      Animated.delay(300),

      // 4. Disparition ultra rapide (150ms)
      Animated.parallel([
        Animated.timing(fadeAnim, { 
          toValue: 0, 
          duration: 150,
          useNativeDriver: true 
        }),
        Animated.timing(scaleAnim, { 
          toValue: 1.05, // Réduit de 1.1 à 1.05
          duration: 150,
          useNativeDriver: true 
        }),
      ]),
    ]).start(() => {
      onAnimationComplete();
    });

    animateParticles();
  };

  const animateParticles = () => {
    particles.forEach((particle, index) => {
      const angle = (index / particles.length) * Math.PI * 2;
      const distance = 80 + Math.random() * 40; // Distance réduite
      const duration = 500 + Math.random() * 100; // Durée réduite à 500ms
      const delay = index * 10; // Délai très court

      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(particle.x, { 
            toValue: Math.cos(angle) * distance, 
            duration, 
            easing: Easing.out(Easing.quad), 
            useNativeDriver: true 
          }),
          Animated.timing(particle.y, { 
            toValue: Math.sin(angle) * distance, 
            duration, 
            easing: Easing.out(Easing.quad), 
            useNativeDriver: true 
          }),
          // Animation scale simplifiée
          Animated.timing(particle.scale, { 
            toValue: 1.2, 
            duration: duration * 0.5, 
            useNativeDriver: true 
          }),
          Animated.timing(particle.opacity, { 
            toValue: 0, 
            duration, 
            useNativeDriver: true 
          }),
        ]),
      ]).start();
    });
  };

  const resetAnimation = () => {
    scaleAnim.setValue(0);
    fadeAnim.setValue(0);
    textScaleAnim.setValue(0.5);
    numberScaleAnim.setValue(0);
    particles.forEach(particle => {
      particle.x.setValue(0);
      particle.y.setValue(0);
      particle.scale.setValue(0);
      particle.opacity.setValue(1);
    });
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <BlurView intensity={15} style={styles.container}>
        {/* Particules */}
        <View style={styles.particlesContainer}>
          {particles.map((particle) => (
            <Animated.Text
              key={particle.id}
              style={[
                styles.particle,
                {
                  opacity: particle.opacity,
                  transform: [
                    { translateX: particle.x },
                    { translateY: particle.y },
                    { scale: particle.scale },
                  ],
                },
              ]}
            >
              {particle.emoji}
            </Animated.Text>
          ))}
        </View>

        {/* Cercle principal */}
        <Animated.View
          style={[
            styles.centerContent,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={[
              colors.primary + 'DD', // Opacité augmentée
              colors.secondary + 'DD',
              colors.success + 'DD',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientCircle}
          >
            <View style={styles.circleContent}>
              {/* Texte "LEVEL UP!" et numéro simultanés */}
              <Animated.View
                style={[
                  styles.levelUpTextContainer,
                  { transform: [{ scale: textScaleAnim }] },
                ]}
              >
                <Text style={styles.levelUpText}>LEVEL UP!</Text>
              </Animated.View>

              <Animated.View
                style={[
                  styles.levelNumberContainer,
                  { transform: [{ scale: numberScaleAnim }] },
                ]}
              >
                <Text style={styles.levelNumber}>{level}</Text>
              </Animated.View>
            </View>
          </LinearGradient>
        </Animated.View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)', // Plus transparent
  },
  particlesContainer: {
    position: 'absolute',
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  particle: {
    position: 'absolute',
    fontSize: 24, // Réduit
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientCircle: {
    width: 180, // Réduit
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  circleContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelUpTextContainer: {
    alignItems: 'center',
    marginBottom: 4,
  },
  levelUpText: {
    fontSize: 26, // Réduit
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  levelNumberContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    marginTop: 4,
  },
  levelNumber: {
    fontSize: 32, // Réduit
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});