import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BackButton } from '../components/BackButton';
import { ChallengeCard } from '../components/ChallengeCard';
import { challengeService } from '../services/challengeService';
import { firestoreService } from '../services/firestore';
import { DailyChallengeExtended, ChallengeProgress, UserProgress } from '../types';
import { COLORS } from '../constants/gameConfig';
import { SPACING, BORDER_RADIUS, FONT_SIZE } from '../constants/designTokens';
import { BannerAdComponent } from '../components/BannerAdComponent';

interface ChallengesScreenProps {
  userId: string;
  onBack: () => void;
  onRewardClaimed?: (updatedProgress: UserProgress) => void;
}

export const ChallengesScreen: React.FC<ChallengesScreenProps> = ({
  userId,
  onBack,
  onRewardClaimed,
}) => {
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallengeExtended | null>(null);
  const [challengeProgress, setChallengeProgress] = useState<ChallengeProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [claimingReward, setClaimingReward] = useState<string | null>(null);

  useEffect(() => {
    loadChallenges();
  }, [userId]);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      
      // Générer les défis du jour
      const todayDate = challengeService.getTodayDate();
      const challenges = challengeService.generateDailyChallenges(todayDate);
      
      // Charger le progrès de l'utilisateur
      let progress = await firestoreService.getChallengeProgress(userId);
      
      if (!progress) {
        // Initialiser le progrès si c'est la première fois
        progress = challengeService.initializeChallengeProgress(userId);
        await firestoreService.saveChallengeProgress(progress);
      } else {
        // Nettoyer les défis expirés
        progress = challengeService.cleanupExpiredChallenges(progress, challenges);
        await firestoreService.saveChallengeProgress(progress);
      }
      
      setDailyChallenges(challenges);
      setChallengeProgress(progress);
    } catch (error) {
      console.error('Error loading challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimReward = async (challengeId: string) => {
    if (!dailyChallenges || !challengeProgress) return;

    try {
      setClaimingReward(challengeId);

      // Trouver le défi
      const challenge = dailyChallenges.challenges.find(c => c.id === challengeId);
      if (!challenge) return;

      // Mettre à jour le progrès
      let updatedProgress = challengeService.claimReward(challengeProgress, challengeId);
      await firestoreService.saveChallengeProgress(updatedProgress);

      // Réclamer les récompenses dans le profil utilisateur
      const updatedUserProgress = await firestoreService.claimChallengeReward(
        userId,
        challenge.reward.xp,
        challenge.reward.coins
      );

      // Mettre à jour l'état local
      setChallengeProgress(updatedProgress);

      // Notifier le parent
      if (onRewardClaimed) {
        onRewardClaimed(updatedUserProgress);
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
    } finally {
      setClaimingReward(null);
    }
  };

  const getChallengeProgressValue = (challengeId: string): number => {
    if (!challengeProgress) return 0;
    const progress = challengeProgress.currentChallenges.find(c => c.challengeId === challengeId);
    return progress?.progress || 0;
  };

  const isChallengeCompleted = (challengeId: string): boolean => {
    if (!challengeProgress) return false;
    const progress = challengeProgress.currentChallenges.find(c => c.challengeId === challengeId);
    return progress?.completed || false;
  };

  const isRewardClaimed = (challengeId: string): boolean => {
    if (!challengeProgress) return false;
    const progress = challengeProgress.currentChallenges.find(c => c.challengeId === challengeId);
    return progress?.rewardClaimed || false;
  };

  const getTimeRemaining = (): string => {
    if (!dailyChallenges) return '';
    
    const now = Date.now();
    const remaining = dailyChallenges.expiresAt - now;
    
    if (remaining <= 0) return 'Expiré';
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m restantes`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LinearGradient colors={[COLORS.background, COLORS.surface]} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Chargement des défis...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={[COLORS.background, COLORS.surface]} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <BackButton onPress={onBack} color={COLORS.primary} backgroundColor={COLORS.surface} />
          <Text style={styles.headerTitle}>Défis Quotidiens</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Stats Header */}
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statIcon}>🔥</Text>
              <Text style={styles.statValue}>{challengeProgress?.streak || 0}</Text>
              <Text style={styles.statLabel}>Série</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statIcon}>🏆</Text>
              <Text style={styles.statValue}>{challengeProgress?.totalChallengesCompleted || 0}</Text>
              <Text style={styles.statLabel}>Complétés</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statIcon}>⏰</Text>
              <Text style={styles.statValue}>{getTimeRemaining()}</Text>
              <Text style={styles.statLabel}>Temps restant</Text>
            </View>
          </View>

          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Text style={styles.infoText}>
              💡 Complétez les défis en jouant des parties normales. Les défis se renouvellent chaque jour !
            </Text>
          </View>

          {/* Challenges List */}
          <View style={styles.challengesList}>
            {dailyChallenges?.challenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                progress={getChallengeProgressValue(challenge.id)}
                completed={isChallengeCompleted(challenge.id)}
                rewardClaimed={isRewardClaimed(challenge.id)}
                onClaim={
                  isChallengeCompleted(challenge.id) && !isRewardClaimed(challenge.id)
                    ? () => handleClaimReward(challenge.id)
                    : undefined
                }
              />
            ))}
          </View>
        </ScrollView>
        
        {/* Bannière publicitaire */}
        <BannerAdComponent position="bottom" />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
  },
  loadingText: {
    fontSize: FONT_SIZE.md,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: {
    paddingVertical: SPACING.sm,
    paddingRight: SPACING.md,
  },
  backButtonPressed: {
    opacity: 0.6,
  },
  backButtonText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: '#fff',
  },
  headerRight: {
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100, // Espace pour la bannière publicitaire
  },
  statsContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: FONT_SIZE.xs,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  infoBanner: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  infoText: {
    fontSize: FONT_SIZE.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  challengesList: {
    gap: SPACING.md,
  },
});
