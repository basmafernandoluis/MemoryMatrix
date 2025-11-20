/**
 * Friend Challenges Screen - Phase 13: Social Features
 * 
 * Écran de gestion des défis entre amis :
 * - Défis en attente (reçus)
 * - Défis actifs (en cours)
 * - Historique des défis terminés
 * - Création de nouveaux défis
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Modal,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { friendChallengesService } from '../services/friendChallengesService';
import { friendsService } from '../services/friendsService';
import { firestoreService } from '../services/firestore';
import { FriendChallenge, Friend, GameMode, UserProgress } from '../types';
import { useTheme } from '../context/ThemeContext';
import { BackButton } from '../components/BackButton';
import { useTranslation } from '../hooks/useTranslation';

interface FriendChallengesScreenProps {
  userId: string;
  userProgress: UserProgress | null;
  onBack: () => void;
  onStartChallenge?: (challenge: FriendChallenge) => void;
  onProfileUpdated?: (updatedProgress: UserProgress) => void;
  initialTab?: TabType; // Onglet initial à afficher
  highlightChallengeId?: string; // ID du défi à mettre en évidence
}

type TabType = 'pending' | 'active' | 'history';

const GAME_MODES_CONFIG: { mode: GameMode; name: string; icon: string }[] = [
  { mode: 'classic', name: 'Classique', icon: '🎯' },
  { mode: 'survival', name: 'Survie', icon: '💪' },
  { mode: 'timeAttack', name: 'Temps', icon: '⚡' },
  { mode: 'zen', name: 'Zen', icon: '🧘' },
];

export const FriendChallengesScreen: React.FC<FriendChallengesScreenProps> = ({
  userId,
  userProgress,
  onBack,
  onStartChallenge,
  onProfileUpdated,
  initialTab = 'active',
  highlightChallengeId,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [pendingChallenges, setPendingChallenges] = useState<FriendChallenge[]>([]);
  const [activeChallenges, setActiveChallenges] = useState<FriendChallenge[]>([]);
  const [completedChallenges, setCompletedChallenges] = useState<FriendChallenge[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [stats, setStats] = useState({ totalChallenges: 0, wins: 0, losses: 0, winRate: 0 });
  
  // Animated CTA (encourages creation when no active/pending challenges)
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const emphasizeCTA = pendingChallenges.length === 0 && activeChallenges.length === 0; // Plus de pulsation quand aucune activité

  useEffect(() => {
    const maxScale = emphasizeCTA ? 1.1 : 1.06;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: maxScale,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        })
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [emphasizeCTA, pulseAnim]);

  // Switch to initialTab when it changes (from notification navigation)
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    loadData();
  }, [userId]);

  useEffect(() => {
    const unsubscribePending = friendChallengesService.subscribeToPendingChallenges(
      userId,
      setPendingChallenges
    );
    const unsubscribeActive = friendChallengesService.subscribeToActiveChallenges(
      userId,
      setActiveChallenges
    );

    return () => {
      unsubscribePending();
      unsubscribeActive();
    };
  }, [userId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [pending, active, completed, friendsList, challengeStats] = await Promise.all([
        friendChallengesService.getPendingChallenges(userId),
        friendChallengesService.getActiveChallenges(userId),
        friendChallengesService.getCompletedChallenges(userId),
        friendsService.getFriends(userId),
        friendChallengesService.getChallengeStats(userId),
      ]);

      setPendingChallenges(pending);
      setActiveChallenges(active);
      setCompletedChallenges(completed);
      setFriends(friendsList);
      setStats(challengeStats);
    } catch (error) {
      console.error('Error loading challenges:', error);
      Alert.alert(t('common.error'), t('friendChallenges.errors.loadFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptChallenge = async (challengeId: string) => {
    try {
      await friendChallengesService.acceptChallenge(userId, challengeId);
      Alert.alert(t('common.success'), t('friendChallenges.alerts.challengeAccepted'));
      // Recharger les données AVANT de basculer vers l'onglet Actif
      await loadData();
      // Basculer vers l'onglet Actif après que les données soient chargées
      setActiveTab('active');
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || t('friendChallenges.errors.acceptFailed'));
    }
  };

  const handleRejectChallenge = async (challengeId: string) => {
    Alert.alert(
      t('friendChallenges.alerts.rejectTitle'),
      t('friendChallenges.alerts.rejectMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('friendChallenges.alerts.rejectButton'),
          style: 'destructive',
          onPress: async () => {
            try {
              await friendChallengesService.rejectChallenge(userId, challengeId);
              loadData();
            } catch (error: any) {
              Alert.alert(t('common.error'), error.message || t('friendChallenges.errors.rejectFailed'));
            }
          },
        },
      ]
    );
  };

  const handleClaimReward = async (challengeId: string) => {
    try {
      console.log('🎁 Claiming reward for challenge:', challengeId);
      
      await friendChallengesService.claimChallengeReward(userId, challengeId);
      
      console.log('✅ Reward claimed successfully');
      
      // Recharger le profil utilisateur AVANT de recharger les défis
      if (onProfileUpdated) {
        const updatedProgress = await firestoreService.getUserProgress(userId);
        console.log('📊 Updated progress:', {
          xp: updatedProgress?.xp,
          coins: updatedProgress?.coins
        });
        if (updatedProgress) {
          onProfileUpdated(updatedProgress);
        }
      }
      
      // Recharger les données pour afficher le badge "réclamé"
      await loadData();
      
      Alert.alert(t('friendChallenges.alerts.rewardClaimedTitle'), t('friendChallenges.alerts.rewardClaimedMessage'));
    } catch (error: any) {
      console.error('❌ Error claiming reward:', error);
      Alert.alert(t('common.error'), error.message || t('friendChallenges.errors.claimFailed'));
    }
  };

  const handleCreateChallenge = async (friend: Friend, mode: GameMode) => {
    try {
      if (!userProgress) return;

      await friendChallengesService.createChallenge(
        userId,
        userProgress.displayName || 'Guest',
        userProgress.avatarEmoji || '🎮',
        friend.userId,
        friend.displayName,
        friend.avatarEmoji,
        mode
      );

      Alert.alert(t('common.success'), t('friendChallenges.alerts.challengeSent', { name: friend.displayName }));
      setShowCreateModal(false);
      setSelectedFriend(null);
      loadData();
    } catch (error: any) {
      const errorMessage = error.message || t('friendChallenges.errors.createFailed');
      
      // Message plus clair pour le cas du défi déjà en cours
      if (errorMessage.includes('déjà en cours')) {
        Alert.alert(
          t('friendChallenges.alerts.alreadyActiveTitle'),
          t('friendChallenges.alerts.alreadyActiveMessage', { name: friend.displayName }),
          [{ text: 'OK', style: 'default' }]
        );
      } else {
        Alert.alert(t('common.error'), errorMessage);
      }
    }
  };

  const renderPendingChallenge = ({ item }: { item: FriendChallenge }) => {
    const modeData = GAME_MODES_CONFIG.find(m => m.mode === item.mode);
    const timeLeft = Math.max(0, item.expiresAt.getTime() - Date.now());
    const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
    const isHighlighted = highlightChallengeId === item.id;

    return (
      <View style={[
        styles.challengeCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
        isHighlighted && { borderColor: colors.primary, borderWidth: 2 }
      ]}>
        <View style={styles.challengeHeader}>
          <View style={styles.avatarGlow}>
            <Text style={styles.challengeAvatar}>{item.challengerAvatar}</Text>
          </View>
          <View style={styles.challengeInfo}>
            <Text style={[styles.challengeName, { color: colors.text }]}>{item.challengerName}</Text>
            <Text style={[styles.challengeMode, { color: colors.textSecondary }]}>
              {modeData?.icon} {modeData?.name}
            </Text>
            <Text style={[styles.expiresText, { color: colors.warning }]}>
              {t('friendChallenges.expiresIn', { hours: hoursLeft })}
            </Text>
          </View>
          {isHighlighted && <Text style={[styles.newBadge, { backgroundColor: colors.accent }]}>
            {t('friendChallenges.new')}
          </Text>}
        </View>
        <View style={styles.challengeActions}>
          <TouchableOpacity
            style={[styles.acceptChallengeButton, { backgroundColor: colors.success }]}
            onPress={() => handleAcceptChallenge(item.id)}
          >
            <Text style={styles.acceptChallengeText}>{t('friendChallenges.accept')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.rejectChallengeButton, { backgroundColor: colors.error }]}
            onPress={() => handleRejectChallenge(item.id)}
          >
            <Text style={styles.rejectChallengeText}>✗</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderActiveChallenge = ({ item }: { item: FriendChallenge }) => {
    const modeData = GAME_MODES_CONFIG.find(m => m.mode === item.mode);
    const isChallenger = item.challengerId === userId;
    const myScore = isChallenger ? item.challengerScore : item.opponentScore;
    const opponentScore = isChallenger ? item.opponentScore : item.challengerScore;
    const opponentName = isChallenger ? item.opponentName : item.challengerName;
    const opponentAvatar = isChallenger ? item.opponentAvatar : item.challengerAvatar;
    const isHighlighted = highlightChallengeId === item.id;

    // Debug log
    console.log('Active Challenge Debug:', {
      id: item.id,
      isChallenger,
      rawChallengerScore: item.challengerScore,
      rawOpponentScore: item.opponentScore,
      myScore,
      displayOpponentScore: opponentScore,
    });

    return (
      <View style={[
        styles.challengeCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
        isHighlighted && { borderColor: colors.primary, borderWidth: 2 }
      ]}>
        <View style={styles.challengeHeader}>
          <View style={styles.avatarGlow}>
            <Text style={styles.challengeAvatar}>{opponentAvatar}</Text>
          </View>
          <View style={styles.challengeInfo}>
            <Text style={[styles.challengeName, { color: colors.text }]}>vs {opponentName}</Text>
            <Text style={[styles.challengeMode, { color: colors.textSecondary }]}>
              {modeData?.icon} {modeData?.name}
            </Text>
          </View>
          {isHighlighted && <Text style={[styles.newBadge, { backgroundColor: colors.accent }]}>🔔 Nouveau</Text>}
        </View>
        <View style={[styles.scoresContainer, { backgroundColor: colors.surfaceLight }]}>
          <View style={styles.scoreBox}>
            <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>{t('friendChallenges.you')}</Text>
            <Text style={[styles.scoreValue, { color: colors.primary }]}>
              {myScore !== undefined && myScore !== null ? myScore : '---'}
            </Text>
          </View>
          <Text style={[styles.vsText, { color: colors.text }]}>VS</Text>
          <View style={styles.scoreBox}>
            <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>{opponentName}</Text>
            <Text style={[styles.scoreValue, { color: colors.primary }]}>
              {opponentScore !== undefined && opponentScore !== null ? opponentScore : '---'}
            </Text>
          </View>
        </View>
        {/* Afficher le bouton "Jouer" seulement si :
            1. Le joueur n'a pas encore de score
            2. Le défi a été accepté (acceptedAt existe)
            3. Le callback onStartChallenge existe
        */}
        {myScore === undefined && item.acceptedAt && onStartChallenge && (
          <TouchableOpacity
            style={[styles.playButton, { backgroundColor: colors.primary }]}
            onPress={() => onStartChallenge(item)}
          >
            <Text style={styles.playButtonText}>{t('friendChallenges.playNow')}</Text>
          </TouchableOpacity>
        )}
        {/* Si le défi n'est pas encore accepté */}
        {myScore === undefined && !item.acceptedAt && (
          <View style={[styles.waitingContainer, { backgroundColor: colors.warning + '20' }]}>
            <Text style={[styles.waitingText, { color: colors.warning }]}>{t('friendChallenges.waitingAcceptance')}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderCompletedChallenge = ({ item }: { item: FriendChallenge }) => {
    const modeData = GAME_MODES_CONFIG.find(m => m.mode === item.mode);
    const isWinner = item.winnerId === userId;
    const isChallenger = item.challengerId === userId;
    const myScore = isChallenger ? item.challengerScore : item.opponentScore;
    const opponentScore = isChallenger ? item.opponentScore : item.challengerScore;
    const opponentName = isChallenger ? item.opponentName : item.challengerName;
    const opponentAvatar = isChallenger ? item.opponentAvatar : item.challengerAvatar;

    return (
      <View style={[
        styles.challengeCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
        isWinner && { borderColor: colors.success, borderWidth: 2 }
      ]}>
        <View style={styles.challengeHeader}>
          <View style={styles.avatarGlow}>
            <Text style={styles.challengeAvatar}>{opponentAvatar}</Text>
          </View>
          <View style={styles.challengeInfo}>
            <Text style={[styles.challengeName, { color: colors.text }]}>vs {opponentName}</Text>
            <Text style={[styles.challengeMode, { color: colors.textSecondary }]}>
              {modeData?.icon} {modeData?.name}
            </Text>
          </View>
          {isWinner && <Text style={[styles.winnerBadge, { backgroundColor: colors.success }]}>
            {t('friendChallenges.victory')}
          </Text>}
          {!isWinner && <Text style={[styles.loserBadge, { backgroundColor: colors.error }]}>
            {t('friendChallenges.defeat')}
          </Text>}
        </View>
        <View style={[styles.scoresContainer, { backgroundColor: colors.surfaceLight }]}>
          <View style={styles.scoreBox}>
            <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>{t('friendChallenges.you')}</Text>
            <Text style={[styles.scoreValue, { color: isWinner ? colors.success : colors.error }]}>{myScore || 0}</Text>
          </View>
          <Text style={[styles.vsText, { color: colors.text }]}>VS</Text>
          <View style={styles.scoreBox}>
            <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>{opponentName}</Text>
            <Text style={[styles.scoreValue, { color: !isWinner ? colors.success : colors.error }]}>{opponentScore || 0}</Text>
          </View>
        </View>
        {/* Bouton pour réclamer la récompense si gagnant et pas encore réclamée */}
        {isWinner && !(isChallenger ? item.challengerRewardClaimed : item.opponentRewardClaimed) && (
          <TouchableOpacity
            style={[styles.claimRewardButton, { backgroundColor: colors.accent }]}
            onPress={() => handleClaimReward(item.id)}
          >
            <Text style={styles.claimRewardText}>{t('friendChallenges.claimReward')}</Text>
          </TouchableOpacity>
        )}
        {isWinner && (isChallenger ? item.challengerRewardClaimed : item.opponentRewardClaimed) && (
          <View style={[styles.rewardClaimedBadge, { backgroundColor: colors.success + '30' }]}>
            <Text style={[styles.rewardClaimedText, { color: colors.success }]}>{t('friendChallenges.rewardClaimed')}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderCreateModal = () => (
    <Modal
      visible={showCreateModal}
      transparent
      animationType="fade"
      onRequestClose={() => {
        setShowCreateModal(false);
        setSelectedFriend(null);
      }}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{t('friendChallenges.modal.title')}</Text>

          {!selectedFriend ? (
            <>
              <Text style={styles.modalSubtitle}>{t('friendChallenges.modal.chooseFriend')}</Text>
              <FlatList
                data={friends}
                keyExtractor={item => item.userId}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.friendOption}
                    onPress={() => setSelectedFriend(item)}
                  >
                    <Text style={styles.friendOptionAvatar}>{item.avatarEmoji}</Text>
                    <Text style={styles.friendOptionName}>{item.displayName}</Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>
                    {t('friendChallenges.modal.noFriends')}
                  </Text>
                }
              />
            </>
          ) : (
            <>
              <Text style={styles.modalSubtitle}>
                {t('friendChallenges.modal.challengeFriend', { name: selectedFriend.displayName })}
              </Text>
              {GAME_MODES_CONFIG.map(mode => (
                <TouchableOpacity
                  key={mode.mode}
                  style={styles.modeOption}
                  onPress={() => handleCreateChallenge(selectedFriend, mode.mode)}
                >
                  <Text style={styles.modeIcon}>{mode.icon}</Text>
                  <Text style={styles.modeName}>{mode.name}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.backModeButton}
                onPress={() => setSelectedFriend(null)}
              >
                <Text style={styles.backModeButtonText}>{t('friendChallenges.modal.back')}</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            style={styles.closeModalButton}
            onPress={() => {
              setShowCreateModal(false);
              setSelectedFriend(null);
            }}
          >
            <Text style={styles.closeModalButtonText}>{t('common.cancel')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <BackButton onPress={onBack} color={colors.primary} backgroundColor={colors.surfaceLight} />
        <View style={styles.headerCenter}>
          <Text style={[styles.title, { color: colors.text }]}>{t('friendChallenges.title')}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('friendChallenges.subtitle')}</Text>
        </View>
        <Animated.View style={[styles.createCtaWrapper, { transform: [{ scale: pulseAnim }] }]}>
          <TouchableOpacity
            style={[styles.createCtaButton, { backgroundColor: colors.primary }]}
            onPress={() => setShowCreateModal(true)}
            accessibilityRole="button"
            accessibilityLabel="Créer un nouveau défi contre un ami"
            accessibilityHint="Ouvre une fenêtre permettant de choisir un ami puis un mode de jeu"
            activeOpacity={0.85}
          >
            <Text style={styles.createCtaIcon}>⚔️</Text>
            <Text style={styles.createCtaText}>{t('friendChallenges.newChallenge')}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={styles.statIcon}>📊</Text>
          <Text style={[styles.statValue, { color: colors.primary }]}>{stats.totalChallenges}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('friendChallenges.stats.challenges')}</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={styles.statIcon}>🏆</Text>
          <Text style={[styles.statValue, styles.winValue, { color: colors.success }]}>{stats.wins}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('friendChallenges.stats.wins')}</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={styles.statIcon}>💥</Text>
          <Text style={[styles.statValue, styles.loseValue, { color: colors.error }]}>{stats.losses}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('friendChallenges.stats.losses')}</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={styles.statIcon}>⚖️</Text>
          <Text style={[styles.statValue, { color: colors.primary }]}>{stats.winRate.toFixed(0)}%</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('friendChallenges.stats.winRate')}</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[
            styles.tab,
            { backgroundColor: colors.surface },
            activeTab === 'pending' && { backgroundColor: colors.primary }
          ]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[
            styles.tabText,
            { color: activeTab === 'pending' ? '#FFFFFF' : colors.text }
          ]}>
            {t('friendChallenges.tabs.received', { count: pendingChallenges.length })}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            { backgroundColor: colors.surface },
            activeTab === 'active' && { backgroundColor: colors.primary }
          ]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[
            styles.tabText,
            { color: activeTab === 'active' ? '#FFFFFF' : colors.text }
          ]}>
            {t('friendChallenges.tabs.active', { count: activeChallenges.length })}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            { backgroundColor: colors.surface },
            activeTab === 'history' && { backgroundColor: colors.primary }
          ]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[
            styles.tabText,
            { color: activeTab === 'history' ? '#FFFFFF' : colors.text }
          ]}>
            {t('friendChallenges.tabs.history')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      ) : (
        <View style={styles.content}>
          {activeTab === 'pending' && (
            <FlatList
              data={pendingChallenges}
              renderItem={renderPendingChallenge}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContainer}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={styles.emptyEmoji}>📭</Text>
                  <Text style={[styles.emptyText, { color: colors.text }]}>
                    {t('friendChallenges.emptyPending')}
                  </Text>
                </View>
              }
            />
          )}

          {activeTab === 'active' && (
            <FlatList
              data={activeChallenges}
              renderItem={renderActiveChallenge}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContainer}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={styles.emptyEmoji}>🎮</Text>
                  <Text style={[styles.emptyText, { color: colors.text }]}>
                    {t('friendChallenges.emptyActive')}
                  </Text>
                  <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                    {t('friendChallenges.emptyActiveDesc')}
                  </Text>
                </View>
              }
            />
          )}

          {activeTab === 'history' && (
            <FlatList
              data={completedChallenges}
              renderItem={renderCompletedChallenge}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContainer}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={styles.emptyEmoji}>📊</Text>
                  <Text style={[styles.emptyText, { color: colors.text }]}>
                    {t('friendChallenges.emptyHistory')}
                  </Text>
                </View>
              }
            />
          )}
        </View>
      )}

      {renderCreateModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#16213e',
    minHeight: 70,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    marginHorizontal: 8,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#E0E0E0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E0E0E0',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 11,
    color: '#A0A0A0',
    textAlign: 'center',
  },
  // New CTA styles (pill with icon + label)
  createCtaWrapper: {
    borderRadius: 999,
    overflow: 'visible',
    flexShrink: 0,
  },
  createCtaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 38,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  createCtaIcon: {
    fontSize: 14,
    color: '#FFF',
    marginRight: 6,
  },
  createCtaText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#16213e',
    paddingVertical: 16,
    paddingHorizontal: 8,
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E0E0E0',
  },
  winValue: {
    color: '#4CAF50',
  },
  loseValue: {
    color: '#f44336',
  },
  statLabel: {
    fontSize: 11,
    color: '#888',
    marginTop: 4,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#16213e',
    borderBottomWidth: 1,
    borderBottomColor: '#0f3460',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    fontSize: 13,
    color: '#888',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#4CAF50',
  },
  content: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  challengeCard: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  winnerCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  challengeAvatar: {
    fontSize: 32,
    marginRight: 12,
  },
  avatarGlow: {
    padding: 6,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginRight: 12,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E0E0E0',
  },
  challengeMode: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  expiresText: {
    fontSize: 11,
    color: '#FF9800',
    marginTop: 4,
  },
  winnerBadge: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  loserBadge: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#f44336',
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  newBadge: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#2196F3',
    backgroundColor: 'rgba(33, 150, 243, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  highlightedCard: {
    borderWidth: 2,
    borderColor: '#2196F3',
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
  },
  challengeActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptChallengeButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  acceptChallengeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  rejectChallengeButton: {
    backgroundColor: '#f44336',
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  rejectChallengeText: {
    fontSize: 18,
    color: '#FFF',
  },
  scoresContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  scoreBox: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  vsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  playButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  playButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  waitingContainer: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 152, 0, 0.3)',
  },
  waitingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9800',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E0E0E0',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  loader: {
    marginTop: 60,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#E0E0E0',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 16,
  },
  friendOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  friendOptionAvatar: {
    fontSize: 28,
    marginRight: 12,
  },
  friendOptionName: {
    fontSize: 16,
    color: '#E0E0E0',
    fontWeight: '600',
  },
  modeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  modeIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  modeName: {
    fontSize: 16,
    color: '#E0E0E0',
    fontWeight: '600',
  },
  backModeButton: {
    marginTop: 12,
    padding: 12,
    alignItems: 'center',
  },
  backModeButtonText: {
    fontSize: 14,
    color: '#888',
  },
  closeModalButton: {
    backgroundColor: '#f44336',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 16,
    alignItems: 'center',
  },
  closeModalButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  claimRewardButton: {
    backgroundColor: '#FFD700',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 12,
    alignItems: 'center',
  },
  claimRewardText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  rewardClaimedBadge: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  rewardClaimedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
});
