import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ConfettiEffect } from './ConfettiEffect';
import { ChallengeReward } from '../types/challenges';
import { COLORS } from '../constants/gameConfig';
import { SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SHADOW } from '../constants/designTokens';
import { feedback } from '../utils/soundManager';

interface ChallengeRewardModalProps {
  visible: boolean;
  reward: ChallengeReward;
  challengeTitle: string;
  onClose: () => void;
}

export const ChallengeRewardModal: React.FC<ChallengeRewardModalProps> = ({
  visible,
  reward,
  challengeTitle,
  onClose
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [scaleAnimation] = useState(new Animated.Value(0));
  const [slideAnimation] = useState(new Animated.Value(50));
  const [fadeAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      setShowConfetti(true);
      
      // Play success sound
      feedback.levelUp();

      // Start animations
      Animated.parallel([
        Animated.spring(scaleAnimation, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnimation, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnimation, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        })
      ]).start();

      // Hide confetti after animation
      const confettiTimer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);

      return () => clearTimeout(confettiTimer);
    } else {
      // Reset animations
      scaleAnimation.setValue(0);
      slideAnimation.setValue(50);
      fadeAnimation.setValue(0);
      setShowConfetti(false);
    }
  }, [visible]);

  const handleClose = async () => {
    await feedback.buttonPress();
    onClose();
  };

  const hasMultipleRewards = [
    reward.xp > 0,
    reward.coins > 0,
    reward.lives && reward.lives > 0,
    reward.badge
  ].filter(Boolean).length > 1;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        {showConfetti && (
          <ConfettiEffect
            active={showConfetti}
            particleCount={50}
          />
        )}
        
        <Animated.View
          style={[
            styles.container,
            {
              transform: [
                { scale: scaleAnimation },
                { translateY: slideAnimation }
              ],
              opacity: fadeAnimation,
            }
          ]}
        >
          <LinearGradient
            colors={[COLORS.success + '20', COLORS.primary + '20']}
            style={styles.gradient}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.icon}>🎉</Text>
              <Text style={styles.title}>Défi Terminé!</Text>
              <Text style={styles.challengeTitle}>{challengeTitle}</Text>
            </View>

            {/* Rewards */}
            <View style={styles.rewardsSection}>
              <Text style={styles.rewardsTitle}>
                Récompenses obtenues:
              </Text>
              
              <View style={styles.rewardsContainer}>
                {reward.xp > 0 && (
                  <Animated.View 
                    style={[
                      styles.rewardItem,
                      {
                        transform: [{
                          scale: scaleAnimation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.8, 1],
                          })
                        }]
                      }
                    ]}
                  >
                    <LinearGradient
                      colors={['#FFD700', '#FFA500']}
                      style={styles.rewardBackground}
                    >
                      <Text style={styles.rewardIcon}>⭐</Text>
                      <Text style={styles.rewardValue}>+{reward.xp}</Text>
                      <Text style={styles.rewardLabel}>XP</Text>
                    </LinearGradient>
                  </Animated.View>
                )}

                {reward.coins > 0 && (
                  <Animated.View 
                    style={[
                      styles.rewardItem,
                      {
                        transform: [{
                          scale: scaleAnimation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.8, 1],
                          })
                        }]
                      }
                    ]}
                  >
                    <LinearGradient
                      colors={['#FFD700', '#DAA520']}
                      style={styles.rewardBackground}
                    >
                      <Text style={styles.rewardIcon}>🪙</Text>
                      <Text style={styles.rewardValue}>+{reward.coins}</Text>
                      <Text style={styles.rewardLabel}>Pièces</Text>
                    </LinearGradient>
                  </Animated.View>
                )}

                {reward.lives && reward.lives > 0 && (
                  <Animated.View 
                    style={[
                      styles.rewardItem,
                      {
                        transform: [{
                          scale: scaleAnimation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.8, 1],
                          })
                        }]
                      }
                    ]}
                  >
                    <LinearGradient
                      colors={['#FF6B6B', '#FF5252']}
                      style={styles.rewardBackground}
                    >
                      <Text style={styles.rewardIcon}>❤️</Text>
                      <Text style={styles.rewardValue}>+{reward.lives}</Text>
                      <Text style={styles.rewardLabel}>Vie{reward.lives > 1 ? 's' : ''}</Text>
                    </LinearGradient>
                  </Animated.View>
                )}

                {reward.badge && (
                  <Animated.View 
                    style={[
                      styles.rewardItem,
                      styles.badgeReward,
                      {
                        transform: [{
                          scale: scaleAnimation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.8, 1],
                          })
                        }]
                      }
                    ]}
                  >
                    <LinearGradient
                      colors={['#9C27B0', '#673AB7']}
                      style={styles.rewardBackground}
                    >
                      <Text style={styles.rewardIcon}>🏆</Text>
                      <Text style={styles.badgeText}>{reward.badge}</Text>
                    </LinearGradient>
                  </Animated.View>
                )}
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.motivationText}>
                {hasMultipleRewards 
                  ? "Fantastique! Continuez comme ça!" 
                  : "Bien joué! Encore un défi de terminé!"
                }
              </Text>
              
              <Pressable
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed && styles.closeButtonPressed
                ]}
                onPress={handleClose}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.secondary]}
                  style={styles.closeButtonGradient}
                >
                  <Text style={styles.closeButtonText}>Super!</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  container: {
    width: width * 0.9,
    maxWidth: 400,
    maxHeight: height * 0.8,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOW.large,
  },
  gradient: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  icon: {
    fontSize: 60,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.massive,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  challengeTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  rewardsSection: {
    width: '100%',
    marginBottom: SPACING.xl,
  },
  rewardsTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  rewardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  rewardItem: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOW.medium,
  },
  rewardBackground: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    minWidth: 100,
  },
  rewardIcon: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  rewardValue: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: 'white',
    marginBottom: SPACING.xs,
  },
  rewardLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: 'white',
    opacity: 0.9,
  },
  badgeReward: {
    flex: 1,
    minWidth: 200,
  },
  badgeText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: 'white',
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  footer: {
    alignItems: 'center',
    width: '100%',
  },
  motivationText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 24,
  },
  closeButton: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOW.medium,
  },
  closeButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  closeButtonGradient: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xxxl,
  },
  closeButtonText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: 'white',
    textAlign: 'center',
  },
});