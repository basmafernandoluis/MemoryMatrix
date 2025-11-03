/**
 * Notification Service - Phase 13: Social Features
 * 
 * Gère les notifications push avec Firebase Cloud Messaging :
 * - Demande de permissions
 * - Enregistrement du token FCM
 * - Notifications de défis
 * - Notifications d'amis
 */

import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';
import { Platform, Alert } from 'react-native';

export type NotificationType = 
  | 'friend_request'
  | 'friend_accepted'
  | 'challenge_received'
  | 'challenge_accepted'
  | 'challenge_score_submitted'
  | 'challenge_completed';

interface NotificationData {
  type: NotificationType;
  title: string;
  body: string;
  senderId: string;
  senderName: string;
  challengeId?: string;
  requestId?: string;
  score?: number;
  isWinner?: boolean;
}

class NotificationService {
  private fcmToken: string | null = null;
  private unsubscribeTokenRefresh: (() => void) | null = null;

  /**
   * Initialiser les notifications et demander les permissions
   */
  async initialize(userId: string): Promise<boolean> {
    try {
      // Vérifier si les notifications sont supportées
      if (!messaging().isDeviceRegisteredForRemoteMessages) {
        await messaging().registerDeviceForRemoteMessages();
      }

      // Demander la permission
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.log('Notification permission denied');
        return false;
      }

      // Obtenir le token FCM
      const token = await messaging().getToken();
      if (token) {
        this.fcmToken = token;
        await this.saveTokenToFirestore(userId, token);
        console.log('FCM Token registered:', token);
      }

      // Écouter les rafraîchissements de token
      this.unsubscribeTokenRefresh = messaging().onTokenRefresh(async (newToken) => {
        this.fcmToken = newToken;
        await this.saveTokenToFirestore(userId, newToken);
        console.log('FCM Token refreshed:', newToken);
      });

      // Configurer les handlers de notifications
      this.setupNotificationHandlers();

      return true;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return false;
    }
  }

  /**
   * Sauvegarder le token FCM dans Firestore
   */
  private async saveTokenToFirestore(userId: string, token: string): Promise<void> {
    try {
      await firestore()
        .collection('users')
        .doc(userId)
        .update({
          fcmToken: token,
          fcmTokenUpdatedAt: firestore.FieldValue.serverTimestamp(),
          platform: Platform.OS,
        });
    } catch (error) {
      console.error('Error saving FCM token:', error);
    }
  }

  /**
   * Supprimer le token FCM de Firestore (déconnexion)
   */
  async removeToken(userId: string): Promise<void> {
    try {
      await firestore()
        .collection('users')
        .doc(userId)
        .update({
          fcmToken: firestore.FieldValue.delete(),
        });

      if (this.unsubscribeTokenRefresh) {
        this.unsubscribeTokenRefresh();
      }

      await messaging().deleteToken();
      this.fcmToken = null;
    } catch (error) {
      console.error('Error removing FCM token:', error);
    }
  }

  /**
   * Configurer les handlers de notifications
   */
  private setupNotificationHandlers(): void {
    // Notification reçue en foreground
    messaging().onMessage(async (remoteMessage) => {
      console.log('Notification received (foreground):', remoteMessage);
      
      if (remoteMessage.notification) {
        Alert.alert(
          remoteMessage.notification.title || 'Notification',
          remoteMessage.notification.body || '',
          [{ text: 'OK' }]
        );
      }
    });

    // Notification cliquée (app fermée/background)
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('Notification opened app from background:', remoteMessage);
      this.handleNotificationNavigation(remoteMessage);
    });

    // Vérifier si l'app a été ouverte via une notification (app fermée)
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log('App opened from quit state by notification:', remoteMessage);
          this.handleNotificationNavigation(remoteMessage);
        }
      });
  }

  /**
   * Gérer la navigation basée sur le type de notification
   */
  private handleNotificationNavigation(
    remoteMessage: FirebaseMessagingTypes.RemoteMessage
  ): void {
    const data = remoteMessage.data;
    if (!data) return;

    const type = data.type as NotificationType;

    switch (type) {
      case 'friend_request':
      case 'friend_accepted':
        // TODO: Naviguer vers l'écran des amis
        console.log('Navigate to friends screen');
        break;
      
      case 'challenge_received':
      case 'challenge_accepted':
      case 'challenge_score_submitted':
      case 'challenge_completed':
        // TODO: Naviguer vers l'écran des défis
        console.log('Navigate to challenges screen');
        break;
    }
  }

  /**
   * Créer une notification dans Firestore (pour déclencher Cloud Function)
   */
  async sendNotification(
    recipientId: string,
    data: NotificationData
  ): Promise<void> {
    try {
      // Extract senderId from data to ensure it's at root level for Firestore rules
      const { senderId, ...restData } = data;
      
      await firestore()
        .collection('notifications')
        .add({
          recipientId,
          senderId, // Must be at root level for security rules validation
          ...restData,
          createdAt: firestore.FieldValue.serverTimestamp(),
          read: false,
          sent: false,
        });
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }

  /**
   * Notifications spécifiques pour les défis
   */
  async notifyChallengeReceived(
    opponentId: string,
    challengerId: string,
    challengerName: string,
    challengeId: string,
    mode: string
  ): Promise<void> {
    await this.sendNotification(opponentId, {
      type: 'challenge_received',
      title: 'Nouveau défi ! 🎮',
      body: `${challengerName} vous défie en mode ${mode}`,
      senderId: challengerId,
      senderName: challengerName,
      challengeId,
    });
  }

  async notifyChallengeAccepted(
    challengerId: string,
    opponentId: string,
    opponentName: string,
    challengeId: string
  ): Promise<void> {
    await this.sendNotification(challengerId, {
      type: 'challenge_accepted',
      title: 'Défi accepté ! ✅',
      body: `${opponentName} a accepté votre défi`,
      senderId: opponentId,
      senderName: opponentName,
      challengeId,
    });
  }

  async notifyChallengeScoreSubmitted(
    recipientId: string,
    playerId: string,
    playerName: string,
    challengeId: string,
    score: number
  ): Promise<void> {
    await this.sendNotification(recipientId, {
      type: 'challenge_score_submitted',
      title: 'Adversaire a joué ! ⚡',
      body: `${playerName} a terminé avec ${score} points`,
      senderId: playerId,
      senderName: playerName,
      challengeId,
      score,
    });
  }

  async notifyChallengeCompleted(
    recipientId: string,
    opponentId: string,
    opponentName: string,
    challengeId: string,
    isWinner: boolean,
    scoreDifference?: number
  ): Promise<void> {
    const title = isWinner ? 'Victoire ! 🏆' : 'Défaite 😔';
    const body = isWinner
      ? `Vous avez battu ${opponentName} !`
      : `${opponentName} vous a battu${scoreDifference ? ` de ${scoreDifference} points` : ''}`;

    await this.sendNotification(recipientId, {
      type: 'challenge_completed',
      title,
      body,
      senderId: opponentId,
      senderName: opponentName,
      challengeId,
      isWinner,
    });
  }

  /**
   * Notifications pour les demandes d'amis
   */
  async notifyFriendRequest(
    toUserId: string,
    fromUserId: string,
    fromUserName: string,
    requestId: string
  ): Promise<void> {
    await this.sendNotification(toUserId, {
      type: 'friend_request',
      title: 'Nouvelle demande d\'ami 👥',
      body: `${fromUserName} souhaite devenir votre ami`,
      senderId: fromUserId,
      senderName: fromUserName,
      requestId,
    });
  }

  async notifyFriendAccepted(
    toUserId: string,
    fromUserId: string,
    fromUserName: string
  ): Promise<void> {
    await this.sendNotification(toUserId, {
      type: 'friend_accepted',
      title: 'Demande acceptée ! ✅',
      body: `${fromUserName} a accepté votre demande d'ami`,
      senderId: fromUserId,
      senderName: fromUserName,
    });
  }

  /**
   * Obtenir le nombre de notifications non lues
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const snapshot = await firestore()
        .collection('notifications')
        .where('recipientId', '==', userId)
        .where('read', '==', false)
        .get();

      return snapshot.size;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Marquer une notification comme lue
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await firestore()
        .collection('notifications')
        .doc(notificationId)
        .update({ read: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  async markAllAsRead(userId: string): Promise<void> {
    try {
      const snapshot = await firestore()
        .collection('notifications')
        .where('recipientId', '==', userId)
        .where('read', '==', false)
        .get();

      const batch = firestore().batch();
      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, { read: true });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }

  /**
   * Vérifier le statut des permissions
   */
  async checkPermission(): Promise<boolean> {
    const authStatus = await messaging().hasPermission();
    return (
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL
    );
  }

  /**
   * Obtenir le token FCM actuel
   */
  getToken(): string | null {
    return this.fcmToken;
  }
}

export const notificationService = new NotificationService();
