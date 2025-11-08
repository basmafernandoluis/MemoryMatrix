import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Challenge } from '../types';
import { COLORS } from '../constants/gameConfig';
import { SPACING, BORDER_RADIUS, FONT_SIZE } from '../constants/designTokens';
import { useTranslation } from '../hooks/useTranslation';

interface ChallengeCardProps {
  challenge: Challenge;
  progress: number;
  completed: boolean;
  rewardClaimed: boolean;
  onClaim?: () => void;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  progress,
  completed,
  rewardClaimed,
  onClaim,
}) => {
  const { t } = useTranslation();
  const progressPercent = Math.min((progress / challenge.target) * 100, 100);

  const getDifficultyColor = (): [string, string] => {
    switch (challenge.difficulty) {
      case 'easy':
        return ['#4ade80', '#22c55e'];
      case 'medium':
        return ['#fbbf24', '#f59e0b'];
      case 'hard':
        return ['#f87171', '#ef4444'];
      default:
        return [COLORS.primary, COLORS.secondary];
    }
  };

  const getDifficultyLabel = () => {
    switch (challenge.difficulty) {
      case 'easy':
        return t('common.easy');
      case 'medium':
        return t('common.medium');
      case 'hard':
        return t('common.hard');
      default:
        return '';
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={completed ? ['#2a2a3e', '#1a1a2e'] : ['#2a2a3e', '#252538']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{challenge.icon}</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>{challenge.title}</Text>
            <Text style={styles.description}>{challenge.description}</Text>
          </View>
          <View style={styles.difficultyBadge}>
            <LinearGradient
              colors={getDifficultyColor()}
              style={styles.difficultyGradient}
            >
              <Text style={styles.difficultyText}>{getDifficultyLabel()}</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${progressPercent}%` }
              ]}
            >
              <LinearGradient
                colors={completed ? ['#4ade80', '#22c55e'] : [COLORS.primary, COLORS.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.progressGradient}
              />
            </View>
          </View>
          <Text style={styles.progressText}>
            {progress} / {challenge.target}
          </Text>
        </View>

        {/* Rewards */}
        <View style={styles.rewardsSection}>
          <View style={styles.rewards}>
            <View style={styles.rewardItem}>
              <Text style={styles.rewardIcon}>⭐</Text>
              <Text style={styles.rewardValue}>{challenge.reward.xp} XP</Text>
            </View>
            <View style={styles.rewardItem}>
              <Text style={styles.rewardIcon}>🪙</Text>
              <Text style={styles.rewardValue}>{challenge.reward.coins} Coins</Text>
            </View>
            {challenge.reward.badge && (
              <View style={styles.rewardItem}>
                <Text style={styles.rewardIcon}>🏅</Text>
                <Text style={styles.rewardValue}>Badge</Text>
              </View>
            )}
          </View>

          {/* Claim Button */}
          {completed && !rewardClaimed && onClaim && (
            <Pressable 
              style={({ pressed }) => [
                styles.claimButton,
                pressed && styles.claimButtonPressed
              ]}
              onPress={onClaim}
            >
              <LinearGradient
                colors={['#4ade80', '#22c55e']}
                style={styles.claimGradient}
              >
                <Text style={styles.claimText}>{t('challenges.claimReward', { xp: challenge.reward.xp, coins: challenge.reward.coins })}</Text>
              </LinearGradient>
            </Pressable>
          )}

          {rewardClaimed && (
            <View style={styles.claimedBadge}>
              <Text style={styles.claimedText}>✓ {t('challenges.rewarded')}</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  gradient: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  icon: {
    fontSize: 28,
  },
  headerText: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  description: {
    fontSize: FONT_SIZE.sm,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 18,
  },
  difficultyBadge: {
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
  },
  difficultyGradient: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  difficultyText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
  },
  progressSection: {
    marginBottom: SPACING.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  progressFill: {
    height: '100%',
  },
  progressGradient: {
    flex: 1,
  },
  progressText: {
    fontSize: FONT_SIZE.sm,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'right',
  },
  rewardsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewards: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rewardIcon: {
    fontSize: 16,
  },
  rewardValue: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: '#fff',
  },
  claimButton: {
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  claimButtonPressed: {
    opacity: 0.8,
  },
  claimGradient: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  claimText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: '#fff',
  },
  claimedBadge: {
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
  },
  claimedText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: '#4ade80',
  },
});
