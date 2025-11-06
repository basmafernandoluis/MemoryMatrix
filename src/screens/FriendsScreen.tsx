/**
 * Friends Screen - Phase 13: Social Features
 * 
 * Écran de gestion des amis avec :
 * - Liste des amis
 * - Demandes d'amis reçues et envoyées
 * - Recherche d'utilisateurs
 * - Envoi/acceptation/refus de demandes
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { friendsService } from '../services/friendsService';
import { Friend, FriendRequest, UserSearchResult, UserProgress } from '../types';
import { BannerAdComponent } from '../components/BannerAdComponent';
import { useTheme } from '../context/ThemeContext';
import { BackButton } from '../components/BackButton';

interface FriendsScreenProps {
  userId: string;
  userProgress: UserProgress | null;
  onBack: () => void;
  onChallengeFriend?: (friendId: string) => void;
}

type TabType = 'friends' | 'requests' | 'search';

export const FriendsScreen: React.FC<FriendsScreenProps> = ({
  userId,
  userProgress,
  onBack,
  onChallengeFriend,
}) => {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('friends');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Charger les amis et demandes au montage
  useEffect(() => {
    loadFriends();
    loadFriendRequests();
  }, [userId]);

  // S'abonner aux changements en temps réel
  useEffect(() => {
    const unsubscribeFriends = friendsService.subscribeToFriends(userId, setFriends);
    const unsubscribeRequests = friendsService.subscribeToFriendRequests(
      userId,
      setReceivedRequests
    );

    return () => {
      unsubscribeFriends();
      unsubscribeRequests();
    };
  }, [userId]);

  // Recherche automatique
  useEffect(() => {
    if (searchQuery.length >= 2) {
      performSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const loadFriends = async () => {
    try {
      setIsLoading(true);
      const friendsList = await friendsService.getFriends(userId);
      setFriends(friendsList);
    } catch (error) {
      console.error('Error loading friends:', error);
      Alert.alert('Erreur', 'Impossible de charger la liste d\'amis');
    } finally {
      setIsLoading(false);
    }
  };

  const loadFriendRequests = async () => {
    try {
      const [received, sent] = await Promise.all([
        friendsService.getReceivedFriendRequests(userId),
        friendsService.getSentFriendRequests(userId),
      ]);
      setReceivedRequests(received);
      setSentRequests(sent);
    } catch (error) {
      console.error('Error loading friend requests:', error);
    }
  };

  const performSearch = async () => {
    try {
      setIsSearching(true);
      const results = await friendsService.searchUsers(userId, searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
      Alert.alert('Erreur', 'Erreur lors de la recherche');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendFriendRequest = async (targetUserId: string) => {
    try {
      if (!userProgress) return;

      await friendsService.sendFriendRequest(
        userId,
        userProgress.displayName || 'Guest',
        userProgress.avatarEmoji || '🎮',
        targetUserId
      );

      Alert.alert('Succès', 'Demande d\'ami envoyée !');
      
      // Rafraîchir la recherche
      performSearch();
      loadFriendRequests();
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible d\'envoyer la demande');
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await friendsService.acceptFriendRequest(userId, requestId);
      Alert.alert('Succès', 'Demande acceptée !');
      loadFriends();
      loadFriendRequests();
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible d\'accepter la demande');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await friendsService.rejectFriendRequest(userId, requestId);
      loadFriendRequests();
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de refuser la demande');
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      await friendsService.cancelFriendRequest(userId, requestId);
      loadFriendRequests();
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible d\'annuler la demande');
    }
  };

  const handleRemoveFriend = async (friendId: string, friendName: string) => {
    Alert.alert(
      'Supprimer ami',
      `Voulez-vous vraiment supprimer ${friendName} de vos amis ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await friendsService.removeFriend(userId, friendId);
              loadFriends();
            } catch (error: any) {
              Alert.alert('Erreur', error.message || 'Impossible de supprimer l\'ami');
            }
          },
        },
      ]
    );
  };

  const renderFriend = ({ item }: { item: Friend }) => (
    <View style={[styles.friendCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.friendInfo}>
        <Text style={styles.friendAvatar}>{item.avatarEmoji}</Text>
        <View style={styles.friendDetails}>
          <Text style={[styles.friendName, { color: colors.text }]}>{item.displayName}</Text>
          <Text style={[styles.friendLevel, { color: colors.textSecondary }]}>Niveau {item.level}</Text>
        </View>
      </View>
      <View style={styles.friendActions}>
        {onChallengeFriend && (
          <TouchableOpacity
            style={[styles.challengeButton, { backgroundColor: colors.primary }]}
            onPress={() => onChallengeFriend(item.userId)}
          >
            <Text style={styles.challengeButtonText}>⚔️</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.removeButton, { backgroundColor: colors.error }]}
          onPress={() => handleRemoveFriend(item.userId, item.displayName)}
        >
          <Text style={styles.removeButtonText}>❌</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFriendRequest = ({ item }: { item: FriendRequest }) => (
    <View style={[styles.requestCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.friendInfo}>
        <Text style={styles.friendAvatar}>{item.fromAvatarEmoji}</Text>
        <View style={styles.friendDetails}>
          <Text style={[styles.friendName, { color: colors.text }]}>{item.fromDisplayName}</Text>
          <Text style={[styles.requestDate, { color: colors.textSecondary }]}>
            {new Date(item.createdAt).toLocaleDateString('fr-FR')}
          </Text>
        </View>
      </View>
      <View style={styles.requestActions}>
        <TouchableOpacity
          style={[styles.acceptButton, { backgroundColor: colors.success }]}
          onPress={() => handleAcceptRequest(item.id)}
        >
          <Text style={styles.acceptButtonText}>✓</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.rejectButton, { backgroundColor: colors.error }]}
          onPress={() => handleRejectRequest(item.id)}
        >
          <Text style={styles.rejectButtonText}>✗</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSentRequest = ({ item }: { item: FriendRequest }) => (
    <View style={[styles.sentRequestCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.friendInfo}>
        <Text style={styles.friendAvatar}>⏳</Text>
        <View style={styles.friendDetails}>
          <Text style={[styles.friendName, { color: colors.text }]}>Envoyée</Text>
          <Text style={[styles.requestDate, { color: colors.textSecondary }]}>
            {new Date(item.createdAt).toLocaleDateString('fr-FR')}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={[styles.cancelButton, { backgroundColor: colors.error }]}
        onPress={() => handleCancelRequest(item.id)}
      >
        <Text style={styles.cancelButtonText}>Annuler</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSearchResult = ({ item }: { item: UserSearchResult }) => (
    <View style={[styles.searchCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.friendInfo}>
        <Text style={styles.friendAvatar}>{item.avatarEmoji}</Text>
        <View style={styles.friendDetails}>
          <Text style={[styles.friendName, { color: colors.text }]}>{item.displayName}</Text>
          <Text style={[styles.friendLevel, { color: colors.textSecondary }]}>Niveau {item.level}</Text>
        </View>
      </View>
      {item.friendStatus === 'none' && (
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => handleSendFriendRequest(item.userId)}
        >
          <Text style={styles.addButtonText}>+ Ajouter</Text>
        </TouchableOpacity>
      )}
      {item.friendStatus === 'friend' && (
        <View style={[styles.friendBadge, { backgroundColor: colors.success }]}>
          <Text style={styles.friendBadgeText}>✓ Ami</Text>
        </View>
      )}
      {item.friendStatus === 'pending-sent' && (
        <View style={[styles.pendingBadge, { backgroundColor: colors.warning }]}>
          <Text style={styles.pendingBadgeText}>⏳ En attente</Text>
        </View>
      )}
      {item.friendStatus === 'pending-received' && (
        <TouchableOpacity
          style={[styles.acceptButton, { backgroundColor: colors.success }]}
          onPress={() => {
            // Trouver la demande correspondante
            const request = receivedRequests.find(r => r.fromUserId === item.userId);
            if (request) handleAcceptRequest(request.id);
          }}
        >
          <Text style={styles.acceptButtonText}>✓ Accepter</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton onPress={onBack} color={colors.primary} backgroundColor={colors.surface} />
        <Text style={[styles.title, { color: colors.text }]}>Amis</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[
            styles.tab,
            { backgroundColor: colors.surface },
            activeTab === 'friends' && { backgroundColor: colors.primary }
          ]}
          onPress={() => setActiveTab('friends')}
        >
          <Text style={[
            styles.tabText,
            { color: activeTab === 'friends' ? '#FFFFFF' : colors.text }
          ]}>
            Amis ({friends.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            { backgroundColor: colors.surface },
            activeTab === 'requests' && { backgroundColor: colors.primary }
          ]}
          onPress={() => setActiveTab('requests')}
        >
          <Text style={[
            styles.tabText,
            { color: activeTab === 'requests' ? '#FFFFFF' : colors.text }
          ]}>
            Demandes ({receivedRequests.length})
          </Text>
          {receivedRequests.length > 0 && (
            <View style={[styles.notificationBadge, { backgroundColor: colors.accent }]}>
              <Text style={styles.notificationText}>{receivedRequests.length}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            { backgroundColor: colors.surface },
            activeTab === 'search' && { backgroundColor: colors.primary }
          ]}
          onPress={() => setActiveTab('search')}
        >
          <Text style={[
            styles.tabText,
            { color: activeTab === 'search' ? '#FFFFFF' : colors.text }
          ]}>
            Rechercher
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'friends' && (
        <View style={styles.content}>
          {isLoading ? (
            <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
          ) : friends.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>👥</Text>
              <Text style={[styles.emptyText, { color: colors.text }]}>Aucun ami pour le moment</Text>
              <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                Recherchez des joueurs et ajoutez-les en amis !
              </Text>
            </View>
          ) : (
            <FlatList
              data={friends}
              renderItem={renderFriend}
              keyExtractor={item => item.userId}
              contentContainerStyle={styles.listContainer}
            />
          )}
        </View>
      )}

      {activeTab === 'requests' && (
        <ScrollView style={styles.content} contentContainerStyle={styles.listContainer}>
          {receivedRequests.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Demandes reçues</Text>
              {receivedRequests.map(request => (
                <View key={request.id}>{renderFriendRequest({ item: request })}</View>
              ))}
            </View>
          )}
          {sentRequests.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Demandes envoyées</Text>
              {sentRequests.map(request => (
                <View key={request.id}>{renderSentRequest({ item: request })}</View>
              ))}
            </View>
          )}
          {receivedRequests.length === 0 && sentRequests.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📭</Text>
              <Text style={[styles.emptyText, { color: colors.text }]}>Aucune demande en attente</Text>
            </View>
          )}
        </ScrollView>
      )}

      {activeTab === 'search' && (
        <View style={styles.content}>
          <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Rechercher un joueur..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
            />
          </View>
          {isSearching ? (
            <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
          ) : searchResults.length === 0 && searchQuery.length >= 2 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={[styles.emptyText, { color: colors.text }]}>Aucun résultat</Text>
            </View>
          ) : (
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={item => item.userId}
              contentContainerStyle={styles.listContainer}
            />
          )}
        </View>
      )}
      
      {/* Bannière publicitaire */}
      <BannerAdComponent position="bottom" />
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E0E0E0',
  },
  placeholder: {
    width: 40,
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
    fontSize: 14,
    color: '#888',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#4CAF50',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#f44336',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  notificationText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100, // Espace pour la bannière publicitaire
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  friendAvatar: {
    fontSize: 32,
    marginRight: 12,
  },
  friendDetails: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E0E0E0',
  },
  friendLevel: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  friendActions: {
    flexDirection: 'row',
    gap: 8,
  },
  challengeButton: {
    backgroundColor: '#FF9800',
    borderRadius: 8,
    padding: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  challengeButtonText: {
    fontSize: 18,
  },
  removeButton: {
    backgroundColor: '#f44336',
    borderRadius: 8,
    padding: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 18,
  },
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  requestDate: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  acceptButtonText: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: 'bold',
  },
  rejectButton: {
    backgroundColor: '#f44336',
    borderRadius: 8,
    padding: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  rejectButtonText: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: 'bold',
  },
  sentRequestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    opacity: 0.7,
  },
  cancelButton: {
    backgroundColor: '#666',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  cancelButtonText: {
    fontSize: 12,
    color: '#E0E0E0',
  },
  searchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  addButtonText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: 'bold',
  },
  friendBadge: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  friendBadgeText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: 'bold',
  },
  pendingBadge: {
    backgroundColor: '#FF9800',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  pendingBadgeText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: 'bold',
  },
  searchContainer: {
    padding: 16,
  },
  searchInput: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#E0E0E0',
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 12,
  },
});
