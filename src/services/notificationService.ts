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
import { i18n } from './i18nService';

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
  private unsubscribeOnMessage: (() => void) | null = null;
  private unsubscribeOnNotificationOpenedApp: (() => void) | null = null;
  private navigationCallback: ((screen: string, params?: any) => void) | null = null;
  private handlersSetup: boolean = false;
  private clickHandlersSetup: boolean = false;
  private pendingNotification: FirebaseMessagingTypes.RemoteMessage | null = null;
  private isGameActive: boolean = false; // Flag pour suivre si une partie est en cours

  constructor() {
    // Configurer les handlers de clic IMMÉDIATEMENT, même sans callback
    // Si une notification est cliquée, on la garde en attente
    this.setupClickHandlers();
  }

  /**
   * Définir si une partie est active (empêche les alertes)
   */
  setGameActive(active: boolean): void {
    console.log(`[NotificationService] Game active state changed: ${active}`);
    this.isGameActive = active;
  }

  /**
   * Configurer les handlers de clic (background et quit state)
   * Ces handlers doivent être configurés IMMÉDIATEMENT au démarrage
   * pour capturer les clics de notification avant que le callback soit enregistré
   */
  private setupClickHandlers(): void {
    if (this.clickHandlersSetup) {
      console.log('Click handlers already setup, skipping');
      return;
    }

    console.log('Setting up notification click handlers (early init)');
    this.clickHandlersSetup = true;

    // Notification cliquée (app en background)
    this.unsubscribeOnNotificationOpenedApp = messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('========================================');
      console.log('Notification opened app from BACKGROUND');
      console.log('Full message:', JSON.stringify(remoteMessage, null, 2));
      console.log('Data:', remoteMessage.data);
      console.log('Notification:', remoteMessage.notification);
      console.log('Has callback:', !!this.navigationCallback);
      console.log('========================================');
      
      // Attendre un délai plus long pour s'assurer que l'app est complètement prête
      setTimeout(() => {
        console.log('After delay - Has callback:', !!this.navigationCallback);
        // Si le callback n'est pas encore prêt, garder la notification en attente
        if (!this.navigationCallback) {
          console.log('Navigation callback not ready yet, storing notification for later');
          this.pendingNotification = remoteMessage;
        } else {
          console.log('Processing notification immediately');
          this.handleNotificationNavigation(remoteMessage);
        }
      }, 1000); // Délai de 1000ms (1 seconde) pour s'assurer que l'app est montée
    });

    // Vérifier si l'app a été ouverte via une notification (app fermée)
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log('========================================');
          console.log('App opened from QUIT STATE by notification');
          console.log('Full message:', JSON.stringify(remoteMessage, null, 2));
          console.log('Data:', remoteMessage.data);
          console.log('Notification:', remoteMessage.notification);
          console.log('Has callback:', !!this.navigationCallback);
          console.log('========================================');
          
          // Attendre un délai plus long pour s'assurer que l'app est complètement prête
          setTimeout(() => {
            console.log('After delay - Has callback:', !!this.navigationCallback);
            // Si le callback n'est pas encore prêt, garder la notification en attente
            if (!this.navigationCallback) {
              console.log('Navigation callback not ready yet, storing notification for later');
              this.pendingNotification = remoteMessage;
            } else {
              console.log('Processing notification immediately');
              this.handleNotificationNavigation(remoteMessage);
            }
          }, 1000); // Délai de 1000ms (1 seconde) pour s'assurer que l'app est montée
        }
      });
  }

  /**
   * Définir le callback de navigation
   */
  setNavigationCallback(callback: (screen: string, params?: any) => void): void {
    console.log('Navigation callback registered, setting up notification handlers');
    this.navigationCallback = callback;
    
    // Si une notification était en attente, la traiter maintenant
    if (this.pendingNotification) {
      console.log('Processing pending notification:', this.pendingNotification.data?.type);
      this.handleNotificationNavigation(this.pendingNotification);
      this.pendingNotification = null;
    }
    
    // Maintenant que le callback est enregistré, configurer le handler foreground
    this.setupForegroundHandler();
  }

  /**
   * Configurer le handler pour les notifications en foreground
   */
  private setupForegroundHandler(): void {
    if (this.handlersSetup) {
      console.log('Foreground handler already setup, skipping');
      return;
    }

    console.log('Setting up foreground notification handler');
    this.handlersSetup = true;

    // Notification reçue en foreground
    this.unsubscribeOnMessage = messaging().onMessage(async (remoteMessage) => {
      console.log('Notification received (foreground):', remoteMessage);
      console.log('Notification data:', remoteMessage.data);
      console.log('Notification data.type:', remoteMessage.data?.type);
      console.log('Current i18n locale:', i18n.locale);
      
      if (remoteMessage.notification || remoteMessage.data) {
        // Construire le message localisé basé sur les données
        const data = remoteMessage.data || {};
        const notifType = data.type as string;
        let title = i18n.t('notifications.title');
        let body = '';
        
        console.log('Processing notification type:', notifType);
        
        // Déterminer le titre et le body basés sur le type de notification
        switch (notifType) {
          case 'challenge_received':
            console.log('Case: challenge_received');
            title = i18n.t('notifications.challengeReceived');
            body = i18n.t('notifications.challengeReceivedBody', { 
              name: data.fromName || data.senderName || 'Un joueur', 
              mode: data.mode || 'Classique' 
            });
            break;
          case 'challenge_accepted':
            console.log('Case: challenge_accepted');
            title = i18n.t('notifications.challengeAccepted');
            body = i18n.t('notifications.challengeAcceptedBody', { 
              name: data.fromName || data.senderName || 'Un joueur' 
            });
            break;
          case 'opponent_played':
          case 'challenge_score_submitted':
            console.log('Case: opponent_played / challenge_score_submitted');
            title = i18n.t('notifications.opponentPlayed');
            body = i18n.t('notifications.opponentPlayedBody', { 
              name: data.fromName || data.senderName || 'Un joueur',
              score: data.score || '0'
            });
            break;
          case 'challenge_completed':
            console.log('Case: challenge_completed');
            // Vérifier isWinner (envoyé par notifyChallengeCompleted)
            const isWinnerValue = data.isWinner !== undefined ? String(data.isWinner) : String(data.won);
            const isWinner = isWinnerValue === 'true' || isWinnerValue === 'True';
            
            if (isWinner) {
              title = i18n.t('notifications.victory');
              body = i18n.t('notifications.victoryBody', { 
                name: data.opponentName || data.senderName || 'votre adversaire' 
              });
            } else {
              title = i18n.t('notifications.defeat');
              body = i18n.t('notifications.defeatBody', { 
                name: data.opponentName || data.senderName || 'votre adversaire',
                points: data.scoreDifference || data.points || data.score || '0'
              });
            }
            break;
          case 'friend_request':
            console.log('Case: friend_request');
            title = i18n.t('notifications.friendRequest');
            body = i18n.t('notifications.friendRequestBody', { 
              name: data.fromName || data.senderName || 'Un joueur' 
            });
            break;
          case 'friend_accepted':
            console.log('Case: friend_accepted');
            title = i18n.t('notifications.friendAccepted');
            body = i18n.t('notifications.friendAcceptedBody', { 
              name: data.fromName || data.senderName || 'Un joueur' 
            });
            break;
          default:
            // Utiliser le titre/body de la notification si présents, sinon message générique
            console.log('Case: default - Unknown notification type');
            console.log('Using fallback - notification.title:', remoteMessage.notification?.title);
            console.log('Using fallback - notification.body:', remoteMessage.notification?.body);
            
            // Si on a un titre/body du serveur, construire un message localisé générique
            if (remoteMessage.notification?.title || remoteMessage.notification?.body) {
              title = i18n.t('notifications.title');
              body = remoteMessage.notification?.body || i18n.t('notifications.newNotification');
            }
        }
        
        console.log('Final alert - title:', title);
        console.log('Final alert - body:', body);
        console.log('Game active:', this.isGameActive);
        
        // Ne pas afficher d'alerte pendant une partie en cours
        if (this.isGameActive) {
          console.log('[NotificationService] Game is active - notification suppressed, will show in notification tray');
          return; // La notification reste visible dans la barre de notification
        }
        
        Alert.alert(
          title,
          body,
          [
            { text: i18n.t('notifications.dismiss'), style: 'cancel' },
            { 
              text: i18n.t('notifications.view'), 
              onPress: () => {
                console.log('User tapped "View" in foreground alert');
                this.handleNotificationNavigation(remoteMessage);
              }
            }
          ],
          { cancelable: true }
        );
      }
    });
  }

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

      // Écouter les changements de token
      this.unsubscribeTokenRefresh = messaging().onTokenRefresh(async (newToken) => {
        this.fcmToken = newToken;
        await this.saveTokenToFirestore(userId, newToken);
        console.log('FCM Token refreshed:', newToken);
      });

      // Ne PAS configurer les handlers ici - ils seront configurés quand le callback sera enregistré
      console.log('Notification service initialized, waiting for navigation callback setup');

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
        .set({
          fcmToken: token,
          fcmTokenUpdatedAt: firestore.FieldValue.serverTimestamp(),
          platform: Platform.OS,
        }, { merge: true }); // merge: true pour créer ou mettre à jour
      
      console.log('FCM token saved to Firestore successfully');
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
   * Gérer la navigation basée sur le type de notification
   */
  private handleNotificationNavigation(
    remoteMessage: FirebaseMessagingTypes.RemoteMessage,
    retryCount: number = 0
  ): void {
    const data = remoteMessage.data;
    
    console.log('=== handleNotificationNavigation ===');
    console.log('Has data:', !!data);
    console.log('Data keys:', data ? Object.keys(data) : 'none');
    console.log('Full data:', data);
    
    if (!data) {
      console.log('No data in notification, cannot navigate');
      return;
    }

    const type = data.type as NotificationType;
    const challengeId = data.challengeId;
    const requestId = data.requestId;

    console.log('Handling notification navigation:', { 
      type, 
      challengeId, 
      requestId, 
      hasCallback: !!this.navigationCallback,
      retryCount 
    });

    // Si le callback n'est pas encore défini, attendre un peu (max 5 tentatives)
    if (!this.navigationCallback) {
      if (retryCount < 5) {
        console.log(`Navigation callback not ready, retrying in 1 second... (attempt ${retryCount + 1}/5)`);
        setTimeout(() => this.handleNotificationNavigation(remoteMessage, retryCount + 1), 1000);
      } else {
        console.error('Navigation callback never became ready after 5 attempts');
      }
      return;
    }

    console.log('Calling navigation callback with:', type);

    switch (type) {
      case 'friend_request':
        // Naviguer vers l'écran des amis pour voir la demande
        console.log('Navigating to friends/requests');
        this.navigationCallback('friends', { tab: 'requests' });
        break;
      
      case 'friend_accepted':
        // Naviguer vers l'écran des amis
        console.log('Navigating to friends/friends');
        this.navigationCallback('friends', { tab: 'friends' });
        break;
      
      case 'challenge_received':
        // Naviguer vers l'écran des défis, onglet "En attente"
        console.log('Navigating to friendChallenges/pending');
        this.navigationCallback('friendChallenges', { tab: 'pending', challengeId });
        break;
      
      case 'challenge_accepted':
        // Naviguer vers l'écran des défis, onglet "Actifs"
        console.log('Navigating to friendChallenges/active');
        this.navigationCallback('friendChallenges', { tab: 'active', challengeId });
        break;
      
      case 'challenge_score_submitted':
      case 'challenge_completed':
        // Naviguer vers l'écran des défis, onglet approprié
        const tab = type === 'challenge_completed' ? 'completed' : 'active';
        console.log(`Navigating to friendChallenges/${tab}`);
        this.navigationCallback('friendChallenges', { 
          tab: type === 'challenge_completed' ? 'completed' : 'active', 
          challengeId 
        });
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
      
      const notificationDoc = {
        recipientId,
        senderId, // Must be at root level for security rules validation
        ...restData,
        createdAt: firestore.FieldValue.serverTimestamp(),
        read: false,
        sent: false,
      };
      
      console.log('Creating notification:', { recipientId, senderId, type: data.type });
      
      await firestore()
        .collection('notifications')
        .add(notificationDoc);
        
      console.log('Notification created successfully');
    } catch (error) {
      console.error('Error creating notification:', error);
      console.error('Notification data:', { recipientId, senderId: data.senderId, type: data.type });
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
      title: i18n.t('notifications.challengeReceived'),
      body: i18n.t('notifications.challengeReceivedBody', { name: challengerName, mode }),
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
      title: i18n.t('notifications.challengeAccepted'),
      body: i18n.t('notifications.challengeAcceptedBody', { name: opponentName }),
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
      title: i18n.t('notifications.opponentPlayed'),
      body: i18n.t('notifications.opponentPlayedBody', { name: playerName, score }),
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
    console.log('[DEBUG] notifyChallengeCompleted called:', {
      recipientId,
      opponentId,
      opponentName,
      challengeId,
      isWinner,
      scoreDifference
    });
    
    const title = isWinner 
      ? i18n.t('notifications.victory') 
      : i18n.t('notifications.defeat');
    const body = isWinner
      ? i18n.t('notifications.victoryBody', { name: opponentName })
      : i18n.t('notifications.defeatBody', { 
          name: opponentName, 
          points: scoreDifference || 0 
        });

    console.log('[DEBUG] Notification content:', {
      title,
      body,
      isWinner,
      message: isWinner ? 'VICTORY message' : 'DEFEAT message'
    });

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
      title: i18n.t('notifications.friendRequest'),
      body: i18n.t('notifications.friendRequestBody', { name: fromUserName }),
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
      title: i18n.t('notifications.friendAccepted'),
      body: i18n.t('notifications.friendAcceptedBody', { name: fromUserName }),
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
