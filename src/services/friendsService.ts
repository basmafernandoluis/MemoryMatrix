/**
 * Friends Service - Phase 13: Social Features
 * 
 * Gère le système d'amis :
 * - Recherche d'utilisateurs
 * - Envoi/acceptation/refus de demandes d'amis
 * - Liste des amis
 * - Synchronisation temps réel
 */

import firestore from '@react-native-firebase/firestore';
import { Friend, FriendRequest, UserSearchResult, UserProgress } from '../types';
import { notificationService } from './notificationService';

class FriendsService {
  private friendsCollection = firestore().collection('friends');
  private friendRequestsCollection = firestore().collection('friendRequests');
  private usersCollection = firestore().collection('users');

  /**
   * Rechercher des utilisateurs par nom
   */
  async searchUsers(
    currentUserId: string,
    searchQuery: string
  ): Promise<UserSearchResult[]> {
    try {
      if (!searchQuery || searchQuery.length < 2) {
        return [];
      }

      // Firestore ne supporte pas la recherche "contains", on utilise donc une recherche par préfixe
      const normalizedQuery = searchQuery.toLowerCase();
      
      // Recherche par displayName (case-insensitive via index)
      const usersSnapshot = await this.usersCollection
        .where('displayNameLower', '>=', normalizedQuery)
        .where('displayNameLower', '<=', normalizedQuery + '\uf8ff')
        .limit(20)
        .get();

      // Récupérer les statuts d'amitié
      const friendsSnapshot = await this.friendsCollection
        .doc(currentUserId)
        .collection('userFriends')
        .get();

      const friendIds = new Set(friendsSnapshot.docs.map(doc => doc.id));

      // Récupérer les demandes envoyées
      const sentRequestsSnapshot = await this.friendRequestsCollection
        .where('fromUserId', '==', currentUserId)
        .where('status', '==', 'pending')
        .get();

      const sentRequestIds = new Set(
        sentRequestsSnapshot.docs.map(doc => doc.data().toUserId)
      );

      // Récupérer les demandes reçues
      const receivedRequestsSnapshot = await this.friendRequestsCollection
        .where('toUserId', '==', currentUserId)
        .where('status', '==', 'pending')
        .get();

      const receivedRequestIds = new Set(
        receivedRequestsSnapshot.docs.map(doc => doc.data().fromUserId)
      );

      // Construire les résultats
      const results: UserSearchResult[] = usersSnapshot.docs
        .filter(doc => doc.id !== currentUserId) // Exclure l'utilisateur courant
        .map(doc => {
          const data = doc.data() as UserProgress;
          const userId = doc.id;

          let friendStatus: UserSearchResult['friendStatus'] = 'none';
          if (friendIds.has(userId)) {
            friendStatus = 'friend';
          } else if (sentRequestIds.has(userId)) {
            friendStatus = 'pending-sent';
          } else if (receivedRequestIds.has(userId)) {
            friendStatus = 'pending-received';
          }

          return {
            userId,
            displayName: data.displayName || `Guest_${userId.substring(0, 6)}`,
            avatarEmoji: data.avatarEmoji || '🎮',
            level: data.maxLevelReached || 1,
            friendStatus,
          };
        });

      return results;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  /**
   * Envoyer une demande d'ami
   */
  async sendFriendRequest(
    fromUserId: string,
    fromDisplayName: string,
    fromAvatarEmoji: string,
    toUserId: string
  ): Promise<FriendRequest> {
    try {
      // Vérifier si une demande existe déjà
      const existingRequest = await this.friendRequestsCollection
        .where('fromUserId', '==', fromUserId)
        .where('toUserId', '==', toUserId)
        .where('status', '==', 'pending')
        .get();

      if (!existingRequest.empty) {
        throw new Error('Une demande est déjà en attente');
      }

      // Vérifier si une demande inverse existe
      const reverseRequest = await this.friendRequestsCollection
        .where('fromUserId', '==', toUserId)
        .where('toUserId', '==', fromUserId)
        .where('status', '==', 'pending')
        .get();

      if (!reverseRequest.empty) {
        // Si une demande inverse existe, l'accepter automatiquement
        const requestId = reverseRequest.docs[0].id;
        await this.acceptFriendRequest(fromUserId, requestId);
        return reverseRequest.docs[0].data() as FriendRequest;
      }

      // Créer la nouvelle demande
      const requestData: Omit<FriendRequest, 'id'> = {
        fromUserId,
        fromDisplayName,
        fromAvatarEmoji,
        toUserId,
        status: 'pending',
        createdAt: new Date(),
      };

      const docRef = await this.friendRequestsCollection.add(requestData);
      
      // Envoyer une notification
      await notificationService.notifyFriendRequest(
        toUserId,
        fromUserId,
        fromDisplayName,
        docRef.id
      );
      
      return {
        id: docRef.id,
        ...requestData,
      };
    } catch (error) {
      console.error('Error sending friend request:', error);
      throw error;
    }
  }

  /**
   * Accepter une demande d'ami
   */
  async acceptFriendRequest(userId: string, requestId: string): Promise<void> {
    try {
      const requestDoc = await this.friendRequestsCollection.doc(requestId).get();
      
      if (!requestDoc.exists) {
        throw new Error('Demande introuvable');
      }

      const requestData = requestDoc.data() as FriendRequest;

      if (requestData.toUserId !== userId) {
        throw new Error('Non autorisé');
      }

      // Récupérer les infos des deux utilisateurs
      const [fromUserDoc, toUserDoc] = await Promise.all([
        this.usersCollection.doc(requestData.fromUserId).get(),
        this.usersCollection.doc(requestData.toUserId).get(),
      ]);

      const fromUserData = fromUserDoc.data() as UserProgress;
      const toUserData = toUserDoc.data() as UserProgress;

      // Créer l'amitié bidirectionnelle
      const batch = firestore().batch();

      // Ajouter l'ami pour l'utilisateur 1
      const friend1Ref = this.friendsCollection
        .doc(requestData.fromUserId)
        .collection('userFriends')
        .doc(requestData.toUserId);

      batch.set(friend1Ref, {
        userId: requestData.toUserId,
        displayName: toUserData.displayName || `Guest_${requestData.toUserId.substring(0, 6)}`,
        avatarEmoji: toUserData.avatarEmoji || '🎮',
        level: toUserData.maxLevelReached || 1,
        addedAt: new Date(),
      });

      // Ajouter l'ami pour l'utilisateur 2
      const friend2Ref = this.friendsCollection
        .doc(requestData.toUserId)
        .collection('userFriends')
        .doc(requestData.fromUserId);

      batch.set(friend2Ref, {
        userId: requestData.fromUserId,
        displayName: fromUserData.displayName || `Guest_${requestData.fromUserId.substring(0, 6)}`,
        avatarEmoji: fromUserData.avatarEmoji || '🎮',
        level: fromUserData.maxLevelReached || 1,
        addedAt: new Date(),
      });

      // Mettre à jour le statut de la demande
      const requestRef = this.friendRequestsCollection.doc(requestId);
      batch.update(requestRef, {
        status: 'accepted',
        respondedAt: new Date(),
      });

      await batch.commit();
      
      // Envoyer une notification
      await notificationService.notifyFriendAccepted(
        requestData.fromUserId,
        requestData.toUserId,
        toUserData.displayName || `Guest_${requestData.toUserId.substring(0, 6)}`
      );
    } catch (error) {
      console.error('Error accepting friend request:', error);
      throw error;
    }
  }

  /**
   * Refuser une demande d'ami
   */
  async rejectFriendRequest(userId: string, requestId: string): Promise<void> {
    try {
      const requestDoc = await this.friendRequestsCollection.doc(requestId).get();
      
      if (!requestDoc.exists) {
        throw new Error('Demande introuvable');
      }

      const requestData = requestDoc.data() as FriendRequest;

      if (requestData.toUserId !== userId) {
        throw new Error('Non autorisé');
      }

      await this.friendRequestsCollection.doc(requestId).update({
        status: 'rejected',
        respondedAt: new Date(),
      });
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      throw error;
    }
  }

  /**
   * Annuler une demande d'ami envoyée
   */
  async cancelFriendRequest(userId: string, requestId: string): Promise<void> {
    try {
      const requestDoc = await this.friendRequestsCollection.doc(requestId).get();
      
      if (!requestDoc.exists) {
        throw new Error('Demande introuvable');
      }

      const requestData = requestDoc.data() as FriendRequest;

      if (requestData.fromUserId !== userId) {
        throw new Error('Non autorisé');
      }

      await this.friendRequestsCollection.doc(requestId).delete();
    } catch (error) {
      console.error('Error canceling friend request:', error);
      throw error;
    }
  }

  /**
   * Supprimer un ami
   */
  async removeFriend(userId: string, friendId: string): Promise<void> {
    try {
      const batch = firestore().batch();

      // Supprimer l'ami pour l'utilisateur 1
      const friend1Ref = this.friendsCollection
        .doc(userId)
        .collection('userFriends')
        .doc(friendId);

      batch.delete(friend1Ref);

      // Supprimer l'ami pour l'utilisateur 2
      const friend2Ref = this.friendsCollection
        .doc(friendId)
        .collection('userFriends')
        .doc(userId);

      batch.delete(friend2Ref);

      await batch.commit();
    } catch (error) {
      console.error('Error removing friend:', error);
      throw error;
    }
  }

  /**
   * Récupérer la liste des amis
   */
  async getFriends(userId: string): Promise<Friend[]> {
    try {
      const snapshot = await this.friendsCollection
        .doc(userId)
        .collection('userFriends')
        .orderBy('addedAt', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        ...(doc.data() as Friend),
        addedAt: doc.data().addedAt?.toDate() || new Date(),
        lastPlayed: doc.data().lastPlayed?.toDate(),
      }));
    } catch (error) {
      console.error('Error getting friends:', error);
      throw error;
    }
  }

  /**
   * Récupérer les demandes d'amis reçues
   */
  async getReceivedFriendRequests(userId: string): Promise<FriendRequest[]> {
    try {
      const snapshot = await this.friendRequestsCollection
        .where('toUserId', '==', userId)
        .where('status', '==', 'pending')
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<FriendRequest, 'id'>),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        respondedAt: doc.data().respondedAt?.toDate(),
      }));
    } catch (error) {
      console.error('Error getting received friend requests:', error);
      throw error;
    }
  }

  /**
   * Récupérer les demandes d'amis envoyées
   */
  async getSentFriendRequests(userId: string): Promise<FriendRequest[]> {
    try {
      const snapshot = await this.friendRequestsCollection
        .where('fromUserId', '==', userId)
        .where('status', '==', 'pending')
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<FriendRequest, 'id'>),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        respondedAt: doc.data().respondedAt?.toDate(),
      }));
    } catch (error) {
      console.error('Error getting sent friend requests:', error);
      throw error;
    }
  }

  /**
   * S'abonner aux changements de la liste d'amis
   */
  subscribeToFriends(
    userId: string,
    callback: (friends: Friend[]) => void
  ): () => void {
    return this.friendsCollection
      .doc(userId)
      .collection('userFriends')
      .orderBy('addedAt', 'desc')
      .onSnapshot(snapshot => {
        const friends = snapshot.docs.map(doc => ({
          ...(doc.data() as Friend),
          addedAt: doc.data().addedAt?.toDate() || new Date(),
          lastPlayed: doc.data().lastPlayed?.toDate(),
        }));
        callback(friends);
      });
  }

  /**
   * S'abonner aux demandes d'amis reçues
   */
  subscribeToFriendRequests(
    userId: string,
    callback: (requests: FriendRequest[]) => void
  ): () => void {
    return this.friendRequestsCollection
      .where('toUserId', '==', userId)
      .where('status', '==', 'pending')
      .orderBy('createdAt', 'desc')
      .onSnapshot(snapshot => {
        const requests = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<FriendRequest, 'id'>),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          respondedAt: doc.data().respondedAt?.toDate(),
        }));
        callback(requests);
      });
  }

  /**
   * Compter le nombre de demandes d'amis en attente
   */
  async getPendingRequestsCount(userId: string): Promise<number> {
    try {
      const snapshot = await this.friendRequestsCollection
        .where('toUserId', '==', userId)
        .where('status', '==', 'pending')
        .get();

      return snapshot.size;
    } catch (error) {
      console.error('Error getting pending requests count:', error);
      return 0;
    }
  }
}

export const friendsService = new FriendsService();
