# Code OPTIMISÉ pour LevelUpAnimation.tsx

**✨ VERSION OPTIMISÉE** : Plus rapide, plus transparente, meilleures performances

## Instructions

1. Ouvrez VS Code
2. Cliquez sur `File` → `New File`
3. Copiez-collez le code ci-dessous
4. Sauvegardez sous : `c:\MemoryMatrix\src\components\LevelUpAnimation.tsx`

## Code complet OPTIMISÉ

```typescript
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
    const particleCount = 8; // Réduit de 12 à 8 pour performances
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
    // Animation optimisée : durée totale réduite à ~1.5s
    Animated.sequence([
      // 1. Apparition rapide (150ms)
      Animated.parallel([
        Animated.spring(scaleAnim, { 
          toValue: 1, 
          friction: 5, 
          tension: 60, 
          useNativeDriver: true 
        }),
        Animated.timing(fadeAnim, { 
          toValue: 1, 
          duration: 150, 
          useNativeDriver: true 
        }),
      ]),

      // 2. Texte "LEVEL UP!" (200ms)
      Animated.spring(textScaleAnim, { 
        toValue: 1, 
        friction: 6, 
        tension: 100, 
        useNativeDriver: true 
      }),

      // 3. Numéro de niveau (200ms)
      Animated.spring(numberScaleAnim, { 
        toValue: 1, 
        friction: 7, 
        tension: 90, 
        useNativeDriver: true 
      }),

      // 4. Pause courte (600ms au lieu de 1200ms)
      Animated.delay(600),

      // 5. Disparition rapide (300ms)
      Animated.parallel([
        Animated.timing(fadeAnim, { 
          toValue: 0, 
          duration: 300, 
          useNativeDriver: true 
        }),
        Animated.timing(scaleAnim, { 
          toValue: 1.1, 
          duration: 300, 
          useNativeDriver: true 
        }),
      ]),

      // 6. Délai de sécurité (150ms)
      Animated.delay(150),
    ]).start(() => {
      onAnimationComplete();
    });

    animateParticles();
  };

  const animateParticles = () => {
    particles.forEach((particle, index) => {
      const angle = (index / particles.length) * Math.PI * 2;
      const distance = 120 + Math.random() * 60; // Distance réduite
      const duration = 1200 + Math.random() * 300; // Durée réduite
      const delay = index * 30; // Délai réduit

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
          Animated.sequence([
            Animated.timing(particle.scale, { 
              toValue: 1.3, 
              duration: duration * 0.3, 
              useNativeDriver: true 
            }),
            Animated.timing(particle.scale, { 
              toValue: 0, 
              duration: duration * 0.7, 
              useNativeDriver: true 
            }),
          ]),
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
      <BlurView intensity={20} style={styles.container}>
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
              colors.primary + 'CC', // 80% opacité
              colors.secondary + 'CC',
              colors.success + 'CC',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientCircle}
          >
            <View style={styles.circleContent}>
              {/* Texte "LEVEL UP!" */}
              <Animated.View
                style={[
                  styles.levelUpTextContainer,
                  { transform: [{ scale: textScaleAnim }] },
                ]}
              >
                <Text style={styles.levelUpText}>LEVEL UP!</Text>
              </Animated.View>

              {/* Numéro du niveau */}
              <Animated.View
                style={[
                  styles.levelNumberContainer,
                  { transform: [{ scale: numberScaleAnim }] },
                ]}
              >
                <Text style={styles.levelNumber}>{level}</Text>
              </Animated.View>

              {/* Étoiles décoratives */}
              <Text style={[styles.decorativeStar, styles.star1]}>⭐</Text>
              <Text style={[styles.decorativeStar, styles.star2]}>✨</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.15)', // Très transparent
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
    fontSize: 28, // Réduit de 32
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientCircle: {
    width: 220, // Réduit de 260
    height: 220,
    borderRadius: 110,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  circleContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelUpTextContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  levelUpText: {
    fontSize: 32, // Réduit de 36
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  levelNumberContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    marginTop: 6,
  },
  levelNumber: {
    fontSize: 40, // Réduit de 48
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  decorativeStar: {
    position: 'absolute',
    fontSize: 20,
  },
  star1: {
    top: 10,
    left: -60,
  },
  star2: {
    bottom: 10,
    right: -60,
  },
});
```

## Optimisations appliquées

### ⚡ **Performance**
- ✅ **Particules réduites** : 8 au lieu de 12 (-33% d'animations)
- ✅ **Animations supprimées** : Rayons rotatifs, glow pulsant, rotation cercle
- ✅ **Taille réduite** : Cercle 220px au lieu de 260px (-15%)
- ✅ **Moins de calculs** : Suppression de `rotation` dans les particules

### ⏱️ **Durée totale**
- **AVANT** : ~2.6 secondes
- **APRÈS** : ~1.5 secondes ⚡ **-42% plus rapide**

Détail du timing optimisé :
- Apparition : 150ms (au lieu de 200ms + 800ms rotation)
- Texte : 200ms (au lieu de 300ms)
- Numéro : 200ms (au lieu de 300ms)
- Pause : 600ms (au lieu de 1200ms)
- Disparition : 300ms (au lieu de 400ms)
- Délai sécurité : 150ms (au lieu de 200ms)

### 🎨 **Transparence améliorée**
- ✅ **BlurView** : intensity 20 au lieu de 30 (plus transparent)
- ✅ **Fond** : rgba(0,0,0,0.15) au lieu de 0.3 (-50% d'opacité)
- ✅ **Gradient** : 'CC' (80% opacité) au lieu de 'E6' (90%)
- ✅ **Éléments visibles** : La grille reste visible en arrière-plan

### 🎯 **Fonctionnalités maintenues**
- ✅ Pause du jeu pendant l'animation (via `isAnimating`)
- ✅ Callback `onAnimationComplete()` appelé après disparition complète
- ✅ Délai de 150ms après fade-out pour garantir invisibilité totale
- ✅ Particules explosives avec émojis
- ✅ Thème dynamique (couleurs du ThemeContext)

### 📊 **Comparaison visuelle**

| Élément | Avant | Après | Amélioration |
|---------|-------|-------|--------------|
| **Durée totale** | 2.6s | 1.5s | ⚡ -42% |
| **Particules** | 12 | 8 | ⚡ -33% |
| **Animations** | 7 types | 3 types | ⚡ -57% |
| **Opacité fond** | 30% | 15% | 🎨 +50% transparent |
| **BlurView** | 30 | 20 | 🎨 +33% transparent |
| **Taille cercle** | 260px | 220px | ⚡ -15% |
| **Étoiles déco** | 4 | 2 | ⚡ -50% |

## Après création

Une fois le fichier créé, recompilez avec :
```bash
cd android
./gradlew assembleDebug
```

L'APK sera dans : `android/app/build/outputs/apk/debug/app-debug.apk`

## Test sur appareil

1. Installez l'APK
2. Jouez et réussissez une séquence
3. Observez :
   - ✅ Animation Level Up rapide (~1.5s)
   - ✅ Très transparente (grille visible)
   - ✅ Fluide et performante
   - ✅ Séquence suivante s'affiche APRÈS l'animation
