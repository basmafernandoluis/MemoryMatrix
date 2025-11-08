import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, RefreshControl, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/gameConfig';
import { SPACING, BORDER_RADIUS } from '../constants/designTokens';
import { LeaderboardEntry, LeaderboardPeriod, LeaderboardMode, leaderboardService } from '../services/leaderboard';
import { feedback } from '../utils/soundManager';
import { BannerAdComponent } from '../components/BannerAdComponent';
import { BackButton } from '../components/BackButton';
import { friendsService } from '../services/friendsService';
import { firestoreService } from '../services/firestore';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../hooks/useTranslation';

interface LeaderboardScreenProps {
  onBack: () => void;
  currentUserId: string | null;
}

// Composant TabButton réutilisable
interface TabButtonProps {
  label: string;
  active: boolean;
  onPress: () => void;
  colors: any;
}

const TabButton: React.FC<TabButtonProps> = ({ label, active, onPress, colors }) => (
  <Pressable
    style={({ pressed }) => [
      styles.tab,
      { 
        backgroundColor: active ? colors.primary : colors.surface,
        borderColor: colors.primary,
      },
      pressed && styles.tabPressed,
    ]}
    onPress={onPress}
  >
    <Text style={[
      styles.tabText, 
      { color: active ? '#FFFFFF' : colors.text }
    ]}>
      {label}
    </Text>
  </Pressable>
);

// Composant TabButton pour les modes (plus compact)
interface ModeTabButtonProps {
  label: string;
  active: boolean;
  onPress: () => void;
  colors: any;
}

const ModeTabButton: React.FC<ModeTabButtonProps> = ({ label, active, onPress, colors }) => (
  <Pressable
    style={({ pressed }) => [
      styles.modeTab,
      { 
        backgroundColor: active ? colors.secondary : colors.surface,
        borderColor: colors.secondary,
      },
      pressed && styles.tabPressed,
    ]}
    onPress={onPress}
  >
    <Text style={[
      styles.modeTabText, 
      { color: active ? '#FFFFFF' : colors.text }
    ]}>
      {label}
    </Text>
  </Pressable>
);

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ onBack, currentUserId }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState<LeaderboardPeriod>('alltime');
  const [selectedMode, setSelectedMode] = useState<LeaderboardMode>('global');
  const [topScores, setTopScores] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [userScore, setUserScore] = useState<LeaderboardEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [friendsSet, setFriendsSet] = useState<Set<string>>(new Set());
  const [sentSet, setSentSet] = useState<Set<string>>(new Set());
  const [receivedMap, setReceivedMap] = useState<Record<string, string>>({});
  const [profileName, setProfileName] = useState<string>('');
  const [profileAvatar, setProfileAvatar] = useState<string>('🎮');

  useEffect(() => {
    loadLeaderboard();
  }, [selectedPeriod, selectedMode]);

  useEffect(() => {
    // Load friend relationships and current profile for proper button states and request payload
    const loadSocialData = async () => {
      if (!currentUserId) return;
      try {
        const [friends, received, sent, profile] = await Promise.all([
          friendsService.getFriends(currentUserId),
          friendsService.getReceivedFriendRequests(currentUserId),
          friendsService.getSentFriendRequests(currentUserId),
          firestoreService.getUserProgress(currentUserId),
        ]);
        setFriendsSet(new Set(friends.map(f => f.userId)));
        setSentSet(new Set(sent.map(r => r.toUserId)));
        const map: Record<string, string> = {};
        received.forEach(r => { map[r.fromUserId] = r.id; });
        setReceivedMap(map);
        if (profile) {
          setProfileName(profile.displayName || 'Guest');
          setProfileAvatar(profile.avatarEmoji || '🎮');
        }
      } catch (e) {
        console.error('Error loading social data:', e);
      }
    };
    loadSocialData();
  }, [currentUserId]);

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

  const getFriendStatus = (targetUserId: string): 'friend' | 'pending-sent' | 'pending-received' | 'none' => {
    if (friendsSet.has(targetUserId)) return 'friend';
    if (sentSet.has(targetUserId)) return 'pending-sent';
    if (receivedMap[targetUserId]) return 'pending-received';
    return 'none';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <BackButton
          onPress={handleBack}
          color={colors.primary}
          backgroundColor={colors.surface}
          label=""
          style={{ width:40, justifyContent:'center' }}
        />
        <Text style={[styles.title, { color: colors.text }]}>{t('leaderboard.title')}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Period Tabs */}
      <View style={styles.tabsContainer}>
        <TabButton
          label={`📅 ${t('leaderboard.periods.daily')}`}
          active={selectedPeriod === 'daily'}
          onPress={() => handlePeriodChange('daily')}
          colors={colors}
        />
        <TabButton
          label={`📆 ${t('leaderboard.periods.weekly')}`}
          active={selectedPeriod === 'weekly'}
          onPress={() => handlePeriodChange('weekly')}
          colors={colors}
        />
        <TabButton
          label={`🏆 ${t('leaderboard.periods.allTime')}`}
          active={selectedPeriod === 'alltime'}
          onPress={() => handlePeriodChange('alltime')}
          colors={colors}
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
            label={`🌟 ${t('leaderboard.modes.all')}`}
            active={selectedMode === 'global'}
            onPress={() => handleModeChange('global')}
            colors={colors}
          />
          <ModeTabButton
            label={`🎮 ${t('leaderboard.modes.classic')}`}
            active={selectedMode === 'classic'}
            onPress={() => handleModeChange('classic')}
            colors={colors}
          />
          <ModeTabButton
            label={`🔥 ${t('leaderboard.modes.survival')}`}
            active={selectedMode === 'survival'}
            onPress={() => handleModeChange('survival')}
            colors={colors}
          />
          <ModeTabButton
            label={`⏱️ ${t('leaderboard.modes.timeAttack')}`}
            active={selectedMode === 'timeAttack'}
            onPress={() => handleModeChange('timeAttack')}
            colors={colors}
          />
          <ModeTabButton
            label={`🧘 ${t('leaderboard.modes.zen')}`}
            active={selectedMode === 'zen'}
            onPress={() => handleModeChange('zen')}
            colors={colors}
          />
        </ScrollView>
      </View>

      {/* User Position Card */}
      {userScore && userRank && (
        <View style={[styles.userPositionCard, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
          <Text style={[styles.userPositionTitle, { color: colors.text }]}>{t('leaderboard.yourPosition')}</Text>
          <View style={styles.userPositionContent}>
            <Text style={[styles.userRank, { color: colors.primary }]}>#{userRank}</Text>
            <View style={styles.userStats}>
              <Text style={[styles.userScore, { color: colors.text }]}>{getScoreForMode(userScore, selectedMode)} pts</Text>
              <Text style={[styles.userLevel, { color: colors.textSecondary }]}>{t('leaderboard.level', { level: userScore.level })}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Leaderboard List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>{t('leaderboard.loading')}</Text>
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
              tintColor={colors.primary}
            />
          }
        >
          {topScores.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.text }]}>
                {t('leaderboard.emptyForPeriod', { period: getPeriodLabel(selectedPeriod).toLowerCase() })}
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                {t('leaderboard.beFirst')}
              </Text>
            </View>
          ) : (
            topScores.map((entry) => {
              const isSelf = entry.userId === currentUserId;
              return (
                <View
                  key={`${entry.userId}_${entry.rank}`}
                  style={[
                    styles.leaderboardItem,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    isSelf && { backgroundColor: colors.primary + '20', borderColor: colors.primary },
                    (entry.rank ?? 0) <= 3 && styles.leaderboardItemTop,
                  ]}
                >
                  <Text style={styles.rankText}>{getMedalEmoji(entry.rank || 0)}</Text>
                  <View style={styles.playerInfo}>
                    <Text style={[styles.playerName, { color: colors.text }]} numberOfLines={1}>
                      {entry.displayName}
                      {isSelf && ` (${t('leaderboard.you')})`}
                    </Text>
                    <Text style={[styles.playerLevel, { color: colors.textSecondary }]}>{t('leaderboard.level', { level: entry.level })}</Text>
                  </View>
                  <Text style={[styles.scoreText, { color: colors.primary }]}>{getScoreForMode(entry, selectedMode)}</Text>
                  {!isSelf && <FriendStatusBadge
                    status={getFriendStatus(entry.userId)}
                    colors={colors}
                    onAdd={async () => {
                      if (!currentUserId) return;
                      try {
                        await feedback.buttonPress();
                        await friendsService.sendFriendRequest(
                          currentUserId,
                          profileName || 'Guest',
                          profileAvatar || '🎮',
                          entry.userId
                        );
                        setSentSet(new Set(Array.from(sentSet).concat(entry.userId)));
                      } catch (e) { console.error('Friend request error:', e); }
                    }}
                    onAccept={async () => {
                      const requestId = receivedMap[entry.userId];
                      if (!currentUserId || !requestId) return;
                      try {
                        await feedback.buttonPress();
                        await friendsService.acceptFriendRequest(currentUserId, requestId);
                        const [friends, received, sent] = await Promise.all([
                          friendsService.getFriends(currentUserId),
                          friendsService.getReceivedFriendRequests(currentUserId),
                          friendsService.getSentFriendRequests(currentUserId),
                        ]);
                        setFriendsSet(new Set(friends.map(f => f.userId)));
                        setSentSet(new Set(sent.map(r => r.toUserId)));
                        const map: Record<string, string> = {};
                        received.forEach(r => { map[r.fromUserId] = r.id; });
                        setReceivedMap(map);
                      } catch (e) { console.error('Accept friend error:', e); }
                    }}
                  />}
                </View>
              );
            })
          )}
        </ScrollView>
      )}
      
      {/* Bannière publicitaire */}
      <BannerAdComponent position="bottom" />
    </SafeAreaView>
  );
};

// Extracted component to keep hook order stable
interface FriendStatusBadgeProps {
  status: 'friend' | 'pending-sent' | 'pending-received' | 'none';
  colors: any;
  onAdd: () => void;
  onAccept: () => void;
}

const FriendStatusBadge: React.FC<FriendStatusBadgeProps> = ({ status, colors, onAdd, onAccept }) => {
  const { t } = useTranslation();
  const scale = React.useRef(new Animated.Value(0.9)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (status === 'friend' || status === 'pending-sent') {
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6, tension: 120 }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true })
      ]).start();
    } else {
      scale.setValue(1);
      opacity.setValue(1);
    }
  }, [status]);

  if (status === 'friend') {
    return (
      <Animated.View style={[styles.friendBadge, { backgroundColor: colors.success + '20', borderColor: colors.success, transform: [{ scale }], opacity }]}> 
        <Text style={[styles.friendBadgeText, { color: colors.success }]}>{t('leaderboard.friendStatus.friend')}</Text>
      </Animated.View>
    );
  }
  if (status === 'pending-sent') {
    return (
      <Animated.View style={[styles.pendingBadge, { backgroundColor: colors.warning + '20', borderColor: colors.warning, transform: [{ scale }], opacity }]}> 
        <Text style={[styles.pendingBadgeText, { color: colors.warning }]}>{t('leaderboard.friendStatus.pendingSent')}</Text>
      </Animated.View>
    );
  }
  if (status === 'pending-received') {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.acceptFriendButton,
          { backgroundColor: colors.success },
          pressed && { opacity: 0.85 },
        ]}
        onPress={onAccept}
      >
        <Text style={styles.acceptFriendText}>{t('leaderboard.acceptRequest')}</Text>
      </Pressable>
    );
  }
  // none
  return (
    <Pressable
      style={({ pressed }) => [
        styles.addFriendButton,
        { borderColor: colors.primary },
        pressed && { opacity: 0.7 },
      ]}
      onPress={onAdd}
    >
      <Text style={[styles.addFriendText, { color: colors.primary }]}>{t('leaderboard.friendStatus.addFriend')}</Text>
    </Pressable>
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
    paddingBottom: 100, // Espace pour la bannière publicitaire
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
  addFriendButton: {
    marginLeft: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 2,
    alignSelf: 'center',
  },
  addFriendText: {
    fontSize: 12,
    fontWeight: '700',
  },
  friendBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 2,
    alignSelf: 'center',
  },
  friendBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  pendingBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 2,
    alignSelf: 'center',
  },
  pendingBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  acceptFriendButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: 'center',
  },
  acceptFriendText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});