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
    description: 'Entraînez votre mémoire avec un jeu addictif et progressif. 30 niveaux vous attendent !',
    tip: 'Parfait pour tous les âges : de 6 à 100 ans !',
  },
  {
    id: 2,
    emoji: '🎯',
    title: 'Comment jouer ?',
    description: 'Mémorisez la séquence de cases qui s\'illuminent, puis reproduisez-la exactement dans le bon ordre.',
    tip: 'La séquence s\'allonge à chaque niveau réussi',
  },
  {
    id: 3,
    emoji: '❤️',
    title: '5 Vies généreuses',
    description: 'Vous commencez avec 5 vies. Chaque erreur coûte une vie. Prenez votre temps et concentrez-vous !',
    tip: 'Pas de limite de temps - jouez à votre rythme',
  },
  {
    id: 4,
    emoji: '💡',
    title: '3 Astuces par partie',
    description: 'Besoin d\'aide ? Utilisez une astuce pour rejouer la séquence lentement et la mémoriser à nouveau.',
    tip: 'Les astuces sont précieuses - utilisez-les intelligemment',
  },
  {
    id: 5,
    emoji: '🏆',
    title: 'Débloquez 16 Succès',
    description: 'Progressez dans les niveaux, jouez régulièrement et atteignez des scores élevés pour débloquer tous les achievements !',
    tip: 'Chaque succès est une fierté !',
  },
  {
    id: 6,
    emoji: '📊',
    title: 'Classement Mondial',
    description: 'Comparez vos scores avec des milliers de joueurs. Classements quotidien, hebdomadaire et all-time !',
    tip: 'Pouvez-vous atteindre le TOP 100 ?',
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
