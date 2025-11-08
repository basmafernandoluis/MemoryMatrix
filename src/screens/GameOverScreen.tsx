import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/gameConfig';
import { UserProgress, GameMode } from '../types';
import { feedback } from '../utils/soundManager';
import { ConfettiEffect } from '../components/ConfettiEffect';
import { ShineEffect } from '../components/ShineEffect';
import { shareService } from '../services/shareService';
import { friendChallengesService } from '../services/friendChallengesService';
import { adManager } from '../services/adManager';
import { useTranslation } from '../hooks/useTranslation';

interface GameOverScreenProps {
  score: number;
  level: number;
  userProgress: UserProgress | null;
  onPlayAgain: () => void;
  onBackToHome: () => void;
  onContinue?: () => void; // Nouveau: callback pour continuer avec une vie
  mode?: GameMode;
  rank?: number;
  challengeId?: string;
  userId?: string;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  score,
  level,
  userProgress,
  onPlayAgain,
  onBackToHome,
  onContinue,
  mode = 'classic',
  rank,
  challengeId,
  userId,
}) => {
  const { t } = useTranslation();
  const isNewHighScore = userProgress && score >= userProgress.highScore;
  const [showConfetti, setShowConfetti] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [canContinue, setCanContinue] = useState(false);
  const [rewardedAdAvailable, setRewardedAdAvailable] = useState(false);

  // Vérifier si le mode permet de continuer (Classique, Chrono, Personnalisé)
  const modesWithContinue: GameMode[] = ['classic', 'timeAttack', 'custom'];
  const canOfferContinue = onContinue && modesWithContinue.includes(mode);

  // En mode challenge, pas de rejouer (une seule partie par défi)
  const isChallenge = !!challengeId;
  const canPlayAgain = !isChallenge;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const bannerAnim = useRef(new Animated.Value(0)).current;
  const scoreScale = useRef(new Animated.Value(0)).current;

  // Vérifier la disponibilité de la rewarded ad pour continuer
  useEffect(() => {
    if (canOfferContinue) {
      const checkAdAvailability = () => {
        setRewardedAdAvailable(adManager.isRewardedAvailable());
      };
      
      checkAdAvailability();
      // Vérifier toutes les 2 secondes si l'ad est prête
      const interval = setInterval(checkAdAvailability, 2000);
      
      return () => clearInterval(interval);
    }
  }, [canOfferContinue]);

  // Soumettre automatiquement le score si c'est un défi
  useEffect(() => {
    const submitChallengeScore = async () => {
      if (challengeId && userId && !scoreSubmitted) {
        try {
          await friendChallengesService.submitChallengeScore(
            userId,
            challengeId,
            score,
            level
          );
          setScoreSubmitted(true);
          console.log('Challenge score submitted:', { challengeId, score, level });
        } catch (error) {
          console.error('Error submitting challenge score:', error);
        }
      }
    };

    submitChallengeScore();
  }, [challengeId, userId, score, level, scoreSubmitted]);

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Score pop animation
    Animated.spring(scoreScale, {
      toValue: 1,
      delay: 200,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // New record effects
    if (isNewHighScore && score > 0) {
      // Trigger confetti
      setTimeout(() => setShowConfetti(true), 300);
      
      // Banner animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(bannerAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(bannerAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [fadeAnim, slideAnim, scoreScale, bannerAnim, isNewHighScore, score]);

  const handlePlayAgain = async () => {
    await feedback.buttonPress();
    onPlayAgain();
  };

  const handleBackToHome = async () => {
    await feedback.buttonPress();
    onBackToHome();
  };

  const handleShare = async () => {
    try {
      await feedback.buttonPress();
      
      const result = await shareService.shareScore({
        score,
        level,
        mode,
        rank,
        isNewRecord: isNewHighScore || false,
      });

      if (result.success) {
        Alert.alert(t('common.success'), t('game.successShared'));
      }
    } catch (error) {
      console.error('Error sharing score:', error);
    }
  };

  const handleContinue = async () => {
    await feedback.buttonPress();
    
    if (!onContinue || !rewardedAdAvailable) {
      Alert.alert(
        t('errors.notFound'),
        "La publicité récompensée n'est pas encore chargée. Veuillez réessayer dans quelques secondes.",
        [{ text: t('common.ok') }]
      );
      return;
    }

    const success = await adManager.showRewarded(() => {
      // Récompense gagnée: donner une vie supplémentaire
      console.log('Rewarded ad watched, continuing game with extra life');
      if (onContinue) {
        onContinue();
      }
    });

    if (!success) {
      Alert.alert(
        t('common.error'),
        "Impossible d'afficher la publicité. Veuillez réessayer.",
        [{ text: t('common.ok') }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ConfettiEffect active={showConfetti} particleCount={50} />
      
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
          {/* Titre personnalisé pour les défis */}
          {isChallenge ? (
            <Text style={styles.gameOverText}>🎯 {t('game.challengeCompleted')}</Text>
          ) : (
            <Text style={styles.gameOverText}>{t('game.gameOver')}</Text>
          )}
          
          {/* Bannière spéciale pour les défis */}
          {isChallenge && scoreSubmitted && (
            <Animated.View 
              style={[
                styles.challengeCompletedBanner,
                {
                  opacity: bannerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.7, 1],
                  }),
                },
              ]}
            >
              <Text style={styles.challengeBannerText}>✅ {t('game.scoreSubmitted')}</Text>
              <Text style={styles.challengeRewardText}>
                {t('game.challengeReward')}
              </Text>
              <Text style={styles.challengeNavigationText}>
                {t('game.challengeCheckHistory')}
              </Text>
            </Animated.View>
          )}
          
          {isNewHighScore && score > 0 && !isChallenge && (
            <Animated.View 
              style={[
                styles.newRecordBanner,
                {
                  opacity: bannerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.7, 1],
                  }),
                  transform: [
                    {
                      scale: bannerAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.05],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.newRecordText}>🏆 {t('game.newRecord')} 🏆</Text>
            </Animated.View>
          )}
          
          <Animated.View 
            style={[
              styles.scoreContainer,
              { transform: [{ scale: scoreScale }] },
            ]}
          >
            {isNewHighScore && score > 0 && (
              <ShineEffect active={true} size={150} color="#FFD700" />
            )}
            <Text style={styles.scoreLabel}>{t('game.finalScore')}</Text>
            <Text style={styles.scoreValue}>{score}</Text>
            <Text style={styles.levelText}>{t('game.levelReached', { level })}</Text>
          </Animated.View>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userProgress?.highScore || 0}</Text>
              <Text style={styles.statLabel}>{t('game.bestScore')}</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userProgress?.maxLevelReached || 1}</Text>
              <Text style={styles.statLabel}>{t('profile.maxLevel')}</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userProgress?.totalGamesPlayed || 0}</Text>
              <Text style={styles.statLabel}>{t('profile.gamesPlayed')}</Text>
            </View>
          </View>
          
          <View style={styles.buttonContainer}>
            {canPlayAgain ? (
              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  styles.primaryButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handlePlayAgain}
              >
                <Text style={styles.primaryButtonText}>🔄 {t('game.replayButton')}</Text>
              </Pressable>
            ) : (
              <View style={styles.challengeInfoBox}>
                <Text style={styles.challengeInfoIcon}>🎯</Text>
                <Text style={styles.challengeInfoText}>
                  {t('game.challengeOneTry')}
                </Text>
              </View>
            )}

            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.shareButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleShare}
            >
              <Text style={styles.shareButtonText}>📤 {t('game.shareScore')}</Text>
            </Pressable>
            
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.secondaryButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleBackToHome}
            >
              <Text style={styles.secondaryButtonText}>🏠 {t('game.homeButton')}</Text>
            </Pressable>
          </View>
        </Animated.View>
      </SafeAreaView>
    );
  };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameOverText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.error,
    marginBottom: 8,
  },
  newRecordBanner: {
    backgroundColor: COLORS.warning,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  newRecordText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.background,
    letterSpacing: 1,
  },
  challengeCompletedBanner: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  challengeBannerText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  challengeRewardText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFD700',
    marginBottom: 2,
  },
  challengeNavigationText: {
    fontSize: 10,
    color: '#FFF',
    opacity: 0.9,
    fontStyle: 'italic',
  },
  scoreContainer: {
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    minWidth: 180,
  },
  scoreLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 42,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  levelText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  statItem: {
    backgroundColor: COLORS.surface,
    padding: 8,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 9,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 8,
    paddingHorizontal: 16,
  },
  button: {
    paddingVertical: 11,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  challengeInfoBox: {
    backgroundColor: 'rgba(255, 193, 7, 0.15)',
    borderWidth: 2,
    borderColor: COLORS.warning,
    borderRadius: 15,
    padding: 16,
    alignItems: 'center',
    marginVertical: 8,
  },
  challengeInfoIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  challengeInfoText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: '#FF6B6B',
    borderWidth: 2,
    borderColor: '#FF4757',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  primaryButton: {
    backgroundColor: COLORS.success,
  },
  shareButton: {
    backgroundColor: '#2196F3',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
});
