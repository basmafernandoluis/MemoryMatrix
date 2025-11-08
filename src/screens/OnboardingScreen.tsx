import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GAME_CONFIG } from '../constants/gameConfig';
import { SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, SHADOW } from '../constants/designTokens';
import { useTranslation } from '../hooks/useTranslation';

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

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  console.log('OnboardingScreen - Rendering with currentSlide:', currentSlide);

  const slides: OnboardingSlide[] = [
    {
      id: 1,
      emoji: '🧠',
      title: t('onboarding.slides.welcome.title'),
      description: t('onboarding.slides.welcome.description'),
      tip: t('onboarding.slides.welcome.tip'),
    },
    {
      id: 2,
      emoji: '🎮',
      title: t('onboarding.slides.modes.title'),
      description: t('onboarding.slides.modes.description'),
      tip: t('onboarding.slides.modes.tip'),
    },
    {
      id: 3,
      emoji: '🎯',
      title: t('onboarding.slides.howToPlay.title'),
      description: t('onboarding.slides.howToPlay.description'),
      tip: t('onboarding.slides.howToPlay.tip'),
    },
    {
      id: 4,
      emoji: '❤️',
      title: t('onboarding.slides.lives.title'),
      description: t('onboarding.slides.lives.description'),
      tip: t('onboarding.slides.lives.tip'),
    },
    {
      id: 5,
      emoji: '⏱️',
      title: t('onboarding.slides.timeAttack.title'),
      description: t('onboarding.slides.timeAttack.description'),
      tip: t('onboarding.slides.timeAttack.tip'),
    },
    {
      id: 6,
      emoji: '🏅',
      title: t('onboarding.slides.challenges.title'),
      description: t('onboarding.slides.challenges.description'),
      tip: t('onboarding.slides.challenges.tip'),
    },
    {
      id: 7,
      emoji: '⚔️',
      title: t('onboarding.slides.friendChallenges.title'),
      description: t('onboarding.slides.friendChallenges.description'),
      tip: t('onboarding.slides.friendChallenges.tip'),
    },
    {
      id: 8,
      emoji: '🏆',
      title: t('onboarding.slides.achievements.title'),
      description: t('onboarding.slides.achievements.description'),
      tip: t('onboarding.slides.achievements.tip'),
    },
    {
      id: 9,
      emoji: '🔊',
      title: t('onboarding.slides.customization.title'),
      description: t('onboarding.slides.customization.description'),
      tip: t('onboarding.slides.customization.tip'),
    },
  ];

  const handleNext = () => {
    console.log('OnboardingScreen - handleNext called, currentSlide:', currentSlide, 'total:', slides.length);
    if (currentSlide < slides.length - 1) {
      const nextSlide = currentSlide + 1;
      setCurrentSlide(nextSlide);
      scrollViewRef.current?.scrollTo({ x: nextSlide * width, animated: true });
    } else {
      console.log('OnboardingScreen - Last slide reached, calling onComplete');
      onComplete();
    }
  };

  const handleSkip = () => {
    console.log('OnboardingScreen - handleSkip called');
    onComplete();
  };

  const handleDotPress = (index: number) => {
    setCurrentSlide(index);
    scrollViewRef.current?.scrollTo({ x: index * width, animated: true });
  };

  const isLastSlide = currentSlide === slides.length - 1;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
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
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.skipButtonText}>{t('onboarding.skip')}</Text>
          </Pressable>
        )}

        {/* Slides */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
          scrollEventThrottle={16}
          onMomentumScrollEnd={(event) => {
            const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
            setCurrentSlide(slideIndex);
          }}
          style={styles.scrollView}
        >
          {slides.map((slide) => (
            <View key={slide.id} style={styles.slide}>
              <ScrollView
                style={styles.contentScrollView}
                contentContainerStyle={styles.contentScrollContainer}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
              >
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
              </ScrollView>
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
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.nextButtonGradient}
          >
            <Text style={styles.nextButtonText}>
              {isLastSlide ? t('onboarding.start') : t('onboarding.next')}
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
  contentScrollView: {
    flex: 1,
    width: '100%',
  },
  contentScrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl,
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
