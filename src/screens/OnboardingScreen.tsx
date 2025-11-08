import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GAME_CONFIG } from '../constants/gameConfig';
import { SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, SHADOW } from '../constants/designTokens';

const { width } = Dimensions.get('window');

interface OnboardingScreenProps {
  onComplete: () => void;
}

interface OnboardingSlide {
  id: number;
  emoji: string;
  title: string;
  description: string;
  tip?: string;
}

const slides: OnboardingSlide[] = [
  {
    id: 1,
    emoji: '🧠',
    title: 'Bienvenue dans Memory Matrix !',
    description: 'Entraînez votre mémoire avec un jeu addictif et progressif. 5 modes de jeu différents vous attendent !',
    tip: 'Parfait pour tous les âges : de 6 à 100 ans !',
  },
  {
    id: 2,
    emoji: '🎮',
    title: '5 Modes de Jeu Uniques',
    description: 'Classique, Survie, Contre-la-Montre, Zen et Focus Challenge. Chaque mode offre une expérience différente !',
    tip: 'Débloquez le mode Focus après 2 victoires entre amis',
  },
  {
    id: 3,
    emoji: '�',
    title: 'Comment jouer ?',
    description: 'Mémorisez la séquence de cases qui s\'illuminent, puis reproduisez-la exactement dans le bon ordre.',
    tip: 'La séquence s\'allonge à chaque niveau réussi',
  },
  {
    id: 4,
    emoji: '❤️',
    title: 'Vies et Difficulté',
    description: 'Mode Classique et Contre-la-Montre : 5 vies. Modes Survie et Zen : vie infinie pour une expérience relaxante.',
    tip: 'Choisissez le mode adapté à votre style de jeu',
  },
  {
    id: 5,
    emoji: '⏱️',
    title: 'Mode Contre-la-Montre',
    description: 'Battez le chrono ! 120 secondes pour marquer un maximum de points. Le temps ne s\'arrête pas !',
    tip: 'Le son du chrono vous accompagne pendant la partie',
  },
  {
    id: 6,
    emoji: '🏅',
    title: 'Défis Quotidiens',
    description: 'Relevez un nouveau défi chaque jour et gagnez des récompenses. Maintenez votre streak pour plus de points !',
    tip: 'Revenez chaque jour pour de nouveaux défis',
  },
  {
    id: 7,
    emoji: '⚔️',
    title: 'Défis Entre Amis',
    description: 'Ajoutez des amis et lancez des duels ! Comparez vos scores en mode Classique, Survie, Temps ou Zen.',
    tip: 'Gagnez 2 défis pour débloquer le mode Focus Challenge',
  },
  {
    id: 8,
    emoji: '🏆',
    title: 'Succès et Classements',
    description: 'Débloquez 16 succès, comparez vos scores dans les classements quotidiens, hebdomadaires et all-time !',
    tip: 'Classements par mode de jeu pour plus de compétition',
  },
  {
    id: 9,
    emoji: '🔊',
    title: 'Sons et Personnalisation',
    description: 'Effets sonores immersifs et retour haptique. Personnalisez votre expérience dans les paramètres !',
    tip: 'Activez/désactivez les sons et vibrations à tout moment',
  },
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      const nextSlide = currentSlide + 1;
      setCurrentSlide(nextSlide);
      scrollViewRef.current?.scrollTo({ x: nextSlide * width, animated: true });
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const handleDotPress = (index: number) => {
    setCurrentSlide(index);
    scrollViewRef.current?.scrollTo({ x: index * width, animated: true });
  };

  const isLastSlide = currentSlide === slides.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[COLORS.background, COLORS.surface]}
        style={styles.gradient}
      >
        {/* Skip button */}
        {!isLastSlide && (
          <Pressable 
            style={({ pressed }) => [
              styles.skipButton,
              pressed && styles.skipButtonPressed,
            ]}
            onPress={handleSkip}
          >
            <Text style={styles.skipButtonText}>Passer →</Text>
          </Pressable>
        )}

        {/* Slides */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
          style={styles.scrollView}
        >
          {slides.map((slide) => (
            <View key={slide.id} style={styles.slide}>
              <View style={styles.content}>
                <Text style={styles.emoji}>{slide.emoji}</Text>
                <Text style={styles.title}>{slide.title}</Text>
                <Text style={styles.description}>{slide.description}</Text>
                {slide.tip && (
                  <View style={styles.tipContainer}>
                    <Text style={styles.tipIcon}>💡</Text>
                    <Text style={styles.tip}>{slide.tip}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Dots indicator */}
        <View style={styles.dotsContainer}>
          {slides.map((_, index) => (
            <Pressable
              key={index}
              onPress={() => handleDotPress(index)}
              style={[
                styles.dot,
                currentSlide === index && styles.dotActive,
              ]}
            />
          ))}
        </View>

        {/* Next/Start button */}
        <Pressable
          style={({ pressed }) => [
            styles.nextButton,
            pressed && styles.nextButtonPressed,
          ]}
          onPress={handleNext}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.nextButtonGradient}
          >
            <Text style={styles.nextButtonText}>
              {isLastSlide ? 'Commencer ! 🚀' : 'Suivant'}
            </Text>
          </LinearGradient>
        </Pressable>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  gradient: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: SPACING.xl,
    right: SPACING.xl,
    zIndex: 10,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
  },
  skipButtonPressed: {
    opacity: 0.7,
  },
  skipButtonText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.semibold,
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width: width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xxl,
  },
  content: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  emoji: {
    fontSize: 80,
    marginBottom: SPACING.xxl,
  },
  title: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  description: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.md,
    gap: SPACING.sm,
    ...SHADOW.sm,
  },
  tipIcon: {
    fontSize: FONT_SIZE.xl,
  },
  tip: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.warning,
    fontWeight: FONT_WEIGHT.semibold,
    flex: 1,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.textSecondary,
    opacity: 0.3,
  },
  dotActive: {
    width: 24,
    backgroundColor: COLORS.primary,
    opacity: 1,
  },
  nextButton: {
    marginHorizontal: SPACING.xxl,
    marginBottom: SPACING.xxl,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
    ...SHADOW.lg,
  },
  nextButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  nextButtonGradient: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
  },
});
