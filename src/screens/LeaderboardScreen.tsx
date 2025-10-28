import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/gameConfig';
import { SPACING, BORDER_RADIUS } from '../constants/designTokens';
import { LeaderboardEntry, LeaderboardPeriod, LeaderboardMode, leaderboardService } from '../services/leaderboard';
import { feedback } from '../utils/soundManager';

interface LeaderboardScreenProps {
  onBack: () => void;
  currentUserId: string | null;
}

// Composant TabButton réutilisable
interface TabButtonProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ label, active, onPress }) => (
  <Pressable
    style={({ pressed }) => [
      styles.tab,
      active && styles.tabActive,
      pressed && styles.tabPressed,
    ]}
    onPress={onPress}
  >
    <Text style={[styles.tabText, active && styles.tabTextActive]}>
      {label}
    </Text>
  </Pressable>
);

// Composant TabButton pour les modes (plus compact)
interface ModeTabButtonProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

const ModeTabButton: React.FC<ModeTabButtonProps> = ({ label, active, onPress }) => (
  <Pressable
    style={({ pressed }) => [
      styles.modeTab,
      active && styles.modeTabActive,
      pressed && styles.tabPressed,
    ]}
    onPress={onPress}
  >
    <Text style={[styles.modeTabText, active && styles.modeTabTextActive]}>
      {label}
    </Text>
  </Pressable>
);

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ onBack, currentUserId }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<LeaderboardPeriod>('alltime');
  const [selectedMode, setSelectedMode] = useState<LeaderboardMode>('global');
  const [topScores, setTopScores] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [userScore, setUserScore] = useState<LeaderboardEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadLeaderboard();
  }, [selectedPeriod, selectedMode]);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    try {
      const [scores, rank, score] = await Promise.all([
        leaderboardService.getTopScores(selectedPeriod, selectedMode, 100),
        currentUserId ? leaderboardService.getUserRank(currentUserId, selectedPeriod, selectedMode) : null,
        currentUserId ? leaderboardService.getUserScore(currentUserId, selectedPeriod, selectedMode) : null,
      ]);

      setTopScores(scores);
      setUserRank(rank);
      setUserScore(score);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadLeaderboard();
    setIsRefreshing(false);
  };

  const handlePeriodChange = async (period: LeaderboardPeriod) => {
    await feedback.buttonPress();
    setSelectedPeriod(period);
  };

  const handleModeChange = async (mode: LeaderboardMode) => {
    await feedback.buttonPress();
    setSelectedMode(mode);
  };

  const handleBack = async () => {
    await feedback.buttonPress();
    onBack();
  };

  const getPeriodLabel = (period: LeaderboardPeriod): string => {
    switch (period) {
      case 'daily': return '📅 Aujourd\'hui';
      case 'weekly': return '📆 Cette Semaine';
      case 'alltime': return '🏆 All-Time';
    }
  };

  const getScoreForMode = (entry: LeaderboardEntry, mode: LeaderboardMode): number => {
    switch (mode) {
      case 'global': return entry.globalScore;
      case 'classic': return entry.classicBest;
      case 'survival': return entry.survivalBest;
      case 'timeAttack': return entry.timeAttackBest;
      case 'zen': return entry.zenBest;
      default: return 0;
    }
  };

  const getMedalEmoji = (rank: number): string => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `${rank}.`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}
          onPress={handleBack}
        >
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <Text style={styles.title}>Classement</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Period Tabs */}
      <View style={styles.tabsContainer}>
        <TabButton
          label="📅 Jour"
          active={selectedPeriod === 'daily'}
          onPress={() => handlePeriodChange('daily')}
        />
        <TabButton
          label="📆 Semaine"
          active={selectedPeriod === 'weekly'}
          onPress={() => handlePeriodChange('weekly')}
        />
        <TabButton
          label="🏆 Total"
          active={selectedPeriod === 'alltime'}
          onPress={() => handlePeriodChange('alltime')}
        />
      </View>

      {/* Mode Tabs */}
      <View style={styles.modeTabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.modeTabsContainer}
          contentContainerStyle={styles.modeTabsContent}
        >
          <ModeTabButton
            label="🌟 Global"
            active={selectedMode === 'global'}
            onPress={() => handleModeChange('global')}
          />
          <ModeTabButton
            label="🎮 Classique"
            active={selectedMode === 'classic'}
            onPress={() => handleModeChange('classic')}
          />
          <ModeTabButton
            label="🔥 Survie"
            active={selectedMode === 'survival'}
            onPress={() => handleModeChange('survival')}
          />
          <ModeTabButton
            label="⏱️ Chrono"
            active={selectedMode === 'timeAttack'}
            onPress={() => handleModeChange('timeAttack')}
          />
          <ModeTabButton
            label="🧘 Zen"
            active={selectedMode === 'zen'}
            onPress={() => handleModeChange('zen')}
          />
        </ScrollView>
      </View>

      {/* User Position Card */}
      {userScore && userRank && (
        <View style={styles.userPositionCard}>
          <Text style={styles.userPositionTitle}>Votre Position</Text>
          <View style={styles.userPositionContent}>
            <Text style={styles.userRank}>#{userRank}</Text>
            <View style={styles.userStats}>
              <Text style={styles.userScore}>{getScoreForMode(userScore, selectedMode)} pts</Text>
              <Text style={styles.userLevel}>Niveau {userScore.level}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Leaderboard List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            !(userScore && userRank) && styles.scrollContentWithoutUserCard
          ]}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.primary}
            />
          }
        >
          {topScores.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Aucun score pour {getPeriodLabel(selectedPeriod).toLowerCase()}
              </Text>
              <Text style={styles.emptySubtext}>
                Soyez le premier à jouer !
              </Text>
            </View>
          ) : (
            topScores.map((entry) => (
              <View
                key={`${entry.userId}_${entry.rank}`}
                style={[
                  styles.leaderboardItem,
                  entry.userId === currentUserId && styles.leaderboardItemUser,
                  (entry.rank ?? 0) <= 3 && styles.leaderboardItemTop,
                ]}
              >
                <Text style={styles.rankText}>{getMedalEmoji(entry.rank || 0)}</Text>
                <View style={styles.playerInfo}>
                  <Text style={styles.playerName} numberOfLines={1}>
                    {entry.displayName}
                    {entry.userId === currentUserId && ' (Vous)'}
                  </Text>
                  <Text style={styles.playerLevel}>Niveau {entry.level}</Text>
                </View>
                <Text style={styles.scoreText}>{getScoreForMode(entry, selectedMode)}</Text>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.background,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonPressed: {
    opacity: 0.7,
  },
  backButtonText: {
    fontSize: 24,
    color: COLORS.text,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  placeholder: {
    width: 40,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    gap: 10,
    marginBottom: 6,
  },
  modeTabsWrapper: {
    height: 36,
    marginBottom: 2,
  },
  modeTabsContainer: {
    flex: 1,
  },
  modeTabsContent: {
    paddingHorizontal: 15,
    gap: 8,
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabPressed: {
    opacity: 0.8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.text,
  },
  // Styles spécifiques pour les boutons de mode (hauteur très réduite)
  modeTab: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    height: 28,
  },
  modeTabActive: {
    backgroundColor: COLORS.primary,
  },
  modeTabText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  modeTabTextActive: {
    color: COLORS.text,
  },
  userPositionCard: {
    marginHorizontal: 15,
    marginBottom: 8,
    marginTop: 0,
    padding: 15,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
  },
  userPositionTitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  userPositionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  userRank: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  userStats: {
    flex: 1,
  },
  userScore: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  userLevel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
    paddingTop: 4,
  },
  scrollContentWithoutUserCard: {
    paddingTop: 2,
  },
  emptyContainer: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginBottom: 6,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    gap: 12,
  },
  leaderboardItemUser: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  leaderboardItemTop: {
    backgroundColor: COLORS.warning + '20',
  },
  rankText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    minWidth: 40,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  playerLevel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.success,
  },
});