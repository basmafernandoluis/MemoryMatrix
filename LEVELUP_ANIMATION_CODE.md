# Code OPTIMISÉ pour LevelUpAnimation.tsx

**✨ VERSION OPTIMISÉE** : Plus rapide, plus transparente, meilleures performances  
**🌍 MULTILINGUE** : Le texte "LEVEL UP!" s'adapte à la langue sélectionnée

## Instructions

1. Ouvrez VS Code
2. Cliquez sur `File` → `New File`
3. Copiez-collez le code ci-dessous
4. Sauvegardez sous : `c:\MemoryMatrix\src\components\LevelUpAnimation.tsx`

**Note** : Le texte est maintenant traduit dans 8 langues (EN, FR, ES, DE, PT, AR, JA, ZH)

## Code complet OPTIMISÉ

```typescript
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Modal, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../hooks/useTranslation';

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
  const { t } = useTranslation();
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
    // Animation ÉCLAIR : durée totale ~0.5s
    Animated.sequence([
      // 1. Apparition instantanée (40ms)
      Animated.parallel([
        Animated.timing(scaleAnim, { 
          toValue: 1, 
          duration: 40,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true 
        }),
        Animated.timing(fadeAnim, { 
          toValue: 1, 
          duration: 40, 
          useNativeDriver: true 
        }),
      ]),

      // 2. Texte "LEVEL UP!" apparaît immédiatement (50ms)
      Animated.timing(textScaleAnim, { 
        toValue: 1, 
        duration: 50,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true 
      }),

      // 3. Numéro de niveau apparaît en même temps (50ms)
      Animated.timing(numberScaleAnim, { 
        toValue: 1, 
        duration: 50,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true 
      }),

      // 4. Pause minimale (200ms seulement)
      Animated.delay(200),

      // 5. Disparition ultra-rapide (100ms)
      Animated.parallel([
        Animated.timing(fadeAnim, { 
          toValue: 0, 
          duration: 100, 
          useNativeDriver: true 
        }),
        Animated.timing(scaleAnim, { 
          toValue: 1.05, 
          duration: 100, 
          useNativeDriver: true 
        }),
      ]),

      // 6. Délai minimal (60ms)
      Animated.delay(60),
    ]).start(() => {
      onAnimationComplete();
    });

    animateParticles();
  };

  const animateParticles = () => {
    particles.forEach((particle, index) => {
      const angle = (index / particles.length) * Math.PI * 2;
      const distance = 80 + Math.random() * 30; // Distance minimale
      const duration = 400 + Math.random() * 100; // Durée ÉCLAIR
      const delay = index * 8; // Délai minimal

      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(particle.x, { 
            toValue: Math.cos(angle) * distance, 
            duration, 
            easing: Easing.out(Easing.ease), 
            useNativeDriver: true 
          }),
          Animated.timing(particle.y, { 
            toValue: Math.sin(angle) * distance, 
            duration, 
            easing: Easing.out(Easing.ease), 
            useNativeDriver: true 
          }),
          Animated.sequence([
            Animated.timing(particle.scale, { 
              toValue: 1.2, 
              duration: duration * 0.2, 
              useNativeDriver: true 
            }),
            Animated.timing(particle.scale, { 
              toValue: 0, 
              duration: duration * 0.8, 
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
              {/* Texte "LEVEL UP!" traduit */}
              <Animated.View
                style={[
                  styles.levelUpTextContainer,
                  { transform: [{ scale: textScaleAnim }] },
                ]}
              >
                <Text style={styles.levelUpText}>{t('levelUp.title')}</Text>
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
- **VERSION 1** : ~2.6 secondes
- **VERSION 2** : ~1.5 secondes (-42%)
- **VERSION 3** : ~0.75 secondes (-50%)
- **VERSION 4 ACTUELLE** : ~0.5 secondes ⚡⚡⚡ **-81% plus rapide que v1, -67% plus rapide que v2, -33% plus rapide que v3**

Détail du timing ÉCLAIR :
- Apparition : **40ms** (instantanée)
- Texte : **50ms** (apparaît immédiatement)
- Numéro : **50ms** (en même temps)
- Pause : **200ms** (minimale pour voir)
- Disparition : **100ms** (ultra-rapide)
- Délai sécurité : **60ms**
- **TOTAL : ~500ms (0.5s)** ⚡⚡⚡

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

| Élément | V1 | V2 | V3 | V4 ACTUELLE | Amélioration |
|---------|----|----|----|--------------|--------------| 
| **Durée totale** | 2.6s | 1.5s | 0.75s | **0.5s** | ⚡⚡⚡ -81% vs v1 |
| **Apparition** | 200ms | 150ms | 75ms | **40ms** | ⚡⚡⚡ -80% |
| **Texte** | 300ms | 200ms | 100ms | **50ms** | ⚡⚡⚡ -83% |
| **Pause** | 1200ms | 600ms | 300ms | **200ms** | ⚡⚡⚡ -83% |
| **Disparition** | 400ms | 300ms | 150ms | **100ms** | ⚡⚡ -75% |
| **Particules durée** | 2000ms | 1500ms | 750ms | **400-500ms** | ⚡⚡⚡ -75% |
| **Particules délai** | 50ms | 30ms | 15ms | **8ms** | ⚡⚡⚡ -84% |
| **Distance particules** | 180px | 140px | 110px | **80-110px** | ⚡⚡ -39% |ansparent |
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
