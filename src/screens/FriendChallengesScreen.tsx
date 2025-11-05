/**
 * Friend Challenges Screen - Phase 13: Social Features
 * 
 * Écran de gestion des défis entre amis :
 * - Défis en attente (reçus)
 * - Défis actifs (en cours)
 * - Historique des défis terminés
 * - Création de nouveaux défis
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { friendChallengesService } from '../services/friendChallengesService';
import { friendsService } from '../services/friendsService';
import { FriendChallenge, Friend, GameMode, UserProgress } from '../types';

interface FriendChallengesScreenProps {
  userId: string;
  userProgress: UserProgress | null;
  onBack: () => void;
  onStartChallenge?: (challenge: FriendChallenge) => void;
  initialTab?: TabType; // Onglet initial à afficher
  highlightChallengeId?: string; // ID du défi à mettre en évidence
}

type TabType = 'pending' | 'active' | 'history';

const GAME_MODES: { mode: GameMode; name: string; icon: string }[] = [
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
  initialTab = 'active',
  highlightChallengeId,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [pendingChallenges, setPendingChallenges] = useState<FriendChallenge[]>([]);
  const [activeChallenges, setActiveChallenges] = useState<FriendChallenge[]>([]);
  const [completedChallenges, setCompletedChallenges] = useState<FriendChallenge[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [stats, setStats] = useState({ totalChallenges: 0, wins: 0, losses: 0, winRate: 0 });

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
      Alert.alert('Erreur', 'Impossible de charger les défis');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptChallenge = async (challengeId: string) => {
    try {
      await friendChallengesService.acceptChallenge(userId, challengeId);
      Alert.alert('Succès', 'Défi accepté ! Lancez une partie pour soumettre votre score.');
      loadData();
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible d\'accepter le défi');
    }
  };

  const handleRejectChallenge = async (challengeId: string) => {
    Alert.alert(
      'Refuser le défi',
      'Voulez-vous vraiment refuser ce défi ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Refuser',
          style: 'destructive',
          onPress: async () => {
            try {
              await friendChallengesService.rejectChallenge(userId, challengeId);
              loadData();
            } catch (error: any) {
              Alert.alert('Erreur', error.message || 'Impossible de refuser le défi');
            }
          },
        },
      ]
    );
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

      Alert.alert('Succès', `Défi envoyé à ${friend.displayName} !`);
      setShowCreateModal(false);
      setSelectedFriend(null);
      loadData();
    } catch (error: any) {
      const errorMessage = error.message || 'Impossible de créer le défi';
      
      // Message plus clair pour le cas du défi déjà en cours
      if (errorMessage.includes('déjà en cours')) {
        Alert.alert(
          'Défi en cours',
          `Vous avez déjà un défi actif avec ${friend.displayName}. Terminez-le avant d\'en créer un nouveau.`,
          [{ text: 'OK', style: 'default' }]
        );
      } else {
        Alert.alert('Erreur', errorMessage);
      }
    }
  };

  const renderPendingChallenge = ({ item }: { item: FriendChallenge }) => {
    const modeData = GAME_MODES.find(m => m.mode === item.mode);
    const timeLeft = Math.max(0, item.expiresAt.getTime() - Date.now());
    const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
    const isHighlighted = highlightChallengeId === item.id;

    return (
      <View style={[styles.challengeCard, isHighlighted && styles.highlightedCard]}>
        <View style={styles.challengeHeader}>
          <Text style={styles.challengeAvatar}>{item.challengerAvatar}</Text>
          <View style={styles.challengeInfo}>
            <Text style={styles.challengeName}>{item.challengerName}</Text>
            <Text style={styles.challengeMode}>
              {modeData?.icon} {modeData?.name}
            </Text>
            <Text style={styles.expiresText}>Expire dans {hoursLeft}h</Text>
          </View>
          {isHighlighted && <Text style={styles.newBadge}>🔔 Nouveau</Text>}
        </View>
        <View style={styles.challengeActions}>
          <TouchableOpacity
            style={styles.acceptChallengeButton}
            onPress={() => handleAcceptChallenge(item.id)}
          >
            <Text style={styles.acceptChallengeText}>✓ Accepter</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.rejectChallengeButton}
            onPress={() => handleRejectChallenge(item.id)}
          >
            <Text style={styles.rejectChallengeText}>✗</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderActiveChallenge = ({ item }: { item: FriendChallenge }) => {
    const modeData = GAME_MODES.find(m => m.mode === item.mode);
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
      <View style={[styles.challengeCard, isHighlighted && styles.highlightedCard]}>
        <View style={styles.challengeHeader}>
          <Text style={styles.challengeAvatar}>{opponentAvatar}</Text>
          <View style={styles.challengeInfo}>
            <Text style={styles.challengeName}>vs {opponentName}</Text>
            <Text style={styles.challengeMode}>
              {modeData?.icon} {modeData?.name}
            </Text>
          </View>
          {isHighlighted && <Text style={styles.newBadge}>🔔 Nouveau</Text>}
        </View>
        <View style={styles.scoresContainer}>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>Toi</Text>
            <Text style={styles.scoreValue}>
              {myScore !== undefined && myScore !== null ? myScore : '---'}
            </Text>
          </View>
          <Text style={styles.vsText}>VS</Text>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>{opponentName}</Text>
            <Text style={styles.scoreValue}>
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
            style={styles.playButton}
            onPress={() => onStartChallenge(item)}
          >
            <Text style={styles.playButtonText}>🎮 Jouer maintenant</Text>
          </TouchableOpacity>
        )}
        {/* Si le défi n'est pas encore accepté */}
        {myScore === undefined && !item.acceptedAt && (
          <View style={styles.waitingContainer}>
            <Text style={styles.waitingText}>⏳ En attente d'acceptation</Text>
          </View>
        )}
      </View>
    );
  };

  const renderCompletedChallenge = ({ item }: { item: FriendChallenge }) => {
    const modeData = GAME_MODES.find(m => m.mode === item.mode);
    const isWinner = item.winnerId === userId;
    const isChallenger = item.challengerId === userId;
    const myScore = isChallenger ? item.challengerScore : item.opponentScore;
    const opponentScore = isChallenger ? item.opponentScore : item.challengerScore;
    const opponentName = isChallenger ? item.opponentName : item.challengerName;
    const opponentAvatar = isChallenger ? item.opponentAvatar : item.challengerAvatar;

    return (
      <View style={[styles.challengeCard, isWinner && styles.winnerCard]}>
        <View style={styles.challengeHeader}>
          <Text style={styles.challengeAvatar}>{opponentAvatar}</Text>
          <View style={styles.challengeInfo}>
            <Text style={styles.challengeName}>vs {opponentName}</Text>
            <Text style={styles.challengeMode}>
              {modeData?.icon} {modeData?.name}
            </Text>
          </View>
          {isWinner && <Text style={styles.winnerBadge}>🏆 Victoire</Text>}
          {!isWinner && <Text style={styles.loserBadge}>❌ Défaite</Text>}
        </View>
        <View style={styles.scoresContainer}>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>Toi</Text>
            <Text style={styles.scoreValue}>{myScore || 0}</Text>
          </View>
          <Text style={styles.vsText}>VS</Text>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>{opponentName}</Text>
            <Text style={styles.scoreValue}>{opponentScore || 0}</Text>
          </View>
        </View>
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
          <Text style={styles.modalTitle}>Créer un défi</Text>

          {!selectedFriend ? (
            <>
              <Text style={styles.modalSubtitle}>Choisir un ami :</Text>
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
                    Aucun ami disponible. Ajoutez des amis d'abord !
                  </Text>
                }
              />
            </>
          ) : (
            <>
              <Text style={styles.modalSubtitle}>
                Défier {selectedFriend.displayName} en :
              </Text>
              {GAME_MODES.map(mode => (
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
                <Text style={styles.backModeButtonText}>← Retour</Text>
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
            <Text style={styles.closeModalButtonText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Défis entre amis</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Text style={styles.createButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.totalChallenges}</Text>
          <Text style={styles.statLabel}>Défis</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, styles.winValue]}>{stats.wins}</Text>
          <Text style={styles.statLabel}>Victoires</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, styles.loseValue]}>{stats.losses}</Text>
          <Text style={styles.statLabel}>Défaites</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.winRate.toFixed(0)}%</Text>
          <Text style={styles.statLabel}>Victoires</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
            Reçus ({pendingChallenges.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
            Actifs ({activeChallenges.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
            Historique
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isLoading ? (
        <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
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
                  <Text style={styles.emptyText}>Aucun défi en attente</Text>
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
                  <Text style={styles.emptyText}>Aucun défi actif</Text>
                  <Text style={styles.emptySubtext}>
                    Créez un défi ou acceptez-en un !
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
                  <Text style={styles.emptyText}>Aucun défi terminé</Text>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#16213e',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#E0E0E0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E0E0E0',
  },
  createButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 24,
    color: '#FFF',
    fontWeight: 'bold',
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
});
