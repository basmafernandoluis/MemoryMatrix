import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

/**
 * Envoyer une notification push quand une notification est créée dans Firestore
 */
export const sendPushNotification = functions.firestore
  .document('notifications/{notificationId}')
  .onCreate(async (snap, context) => {
    const notification = snap.data();
    
    // Vérifier si déjà envoyée
    if (notification.sent) {
      console.log('Notification already sent:', context.params.notificationId);
      return null;
    }

    try {
      // Récupérer le token FCM du destinataire
      const userDoc = await admin.firestore()
        .collection('users')
        .doc(notification.recipientId)
        .get();

      const userData = userDoc.data();
      if (!userData) {
        console.log('User not found:', notification.recipientId);
        await snap.ref.update({ sent: true, error: 'User not found' });
        return null;
      }

      if (!userData.fcmToken) {
        console.log('No FCM token for user:', notification.recipientId);
        await snap.ref.update({ sent: true, error: 'No FCM token' });
        return null;
      }

      // Préparer le message FCM
      const message: admin.messaging.Message = {
        token: userData.fcmToken,
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: {
          type: notification.type || '',
          senderId: notification.senderId || '',
          senderName: notification.senderName || '',
          challengeId: notification.challengeId || '',
          requestId: notification.requestId || '',
          score: notification.score?.toString() || '',
          isWinner: notification.isWinner?.toString() || '',
        },
        android: {
          priority: 'high',
          notification: {
            channelId: 'memory_matrix_default',
            sound: 'default',
            priority: 'high',
            clickAction: 'FLUTTER_NOTIFICATION_CLICK',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
              contentAvailable: true,
            },
          },
        },
      };

      // Envoyer la notification
      const response = await admin.messaging().send(message);
      
      // Marquer comme envoyée
      await snap.ref.update({ 
        sent: true,
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        messageId: response,
      });

      console.log('Notification sent successfully:', {
        notificationId: context.params.notificationId,
        recipientId: notification.recipientId,
        type: notification.type,
        messageId: response,
      });

      return null;
    } catch (error: any) {
      console.error('Error sending notification:', {
        notificationId: context.params.notificationId,
        error: error.message,
        code: error.code,
      });

      // Marquer l'erreur
      await snap.ref.update({ 
        sent: true,
        error: error.message,
        errorCode: error.code,
      });

      return null;
    }
  });

/**
 * Nettoyer les anciennes notifications (tous les jours à minuit)
 */
export const cleanupOldNotifications = functions.pubsub
  .schedule('every day 00:00')
  .timeZone('Europe/Paris')
  .onRun(async (context) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const snapshot = await admin.firestore()
      .collection('notifications')
      .where('createdAt', '<', admin.firestore.Timestamp.fromDate(thirtyDaysAgo))
      .limit(500) // Limiter pour éviter le timeout
      .get();

    if (snapshot.empty) {
      console.log('No old notifications to delete');
      return null;
    }

    // Supprimer par lots de 500 (limite Firestore)
    const batch = admin.firestore().batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    
    console.log(`Deleted ${snapshot.size} old notifications`);
    return null;
  });

/**
 * Nettoyer les défis expirés (tous les jours à 1h)
 */
export const cleanupExpiredChallenges = functions.pubsub
  .schedule('every day 01:00')
  .timeZone('Europe/Paris')
  .onRun(async (context) => {
    const now = new Date();

    const snapshot = await admin.firestore()
      .collection('friendChallenges')
      .where('status', 'in', ['pending', 'active'])
      .where('expiresAt', '<=', admin.firestore.Timestamp.fromDate(now))
      .limit(500)
      .get();

    if (snapshot.empty) {
      console.log('No expired challenges to clean up');
      return null;
    }

    const batch = admin.firestore().batch();
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, { status: 'expired' });
    });

    await batch.commit();
    
    console.log(`Marked ${snapshot.size} challenges as expired`);
    return null;
  });

/**
 * Mettre à jour les statistiques de défi quand un défi est terminé
 */
export const updateChallengeStats = functions.firestore
  .document('friendChallenges/{challengeId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    // Détecter si le défi vient d'être complété
    if (before.status !== 'completed' && after.status === 'completed') {
      const challengerId = after.challengerId;
      const opponentId = after.opponentId;
      const winnerId = after.winnerId;

      // Mettre à jour les stats du challenger
      await updateUserStats(challengerId, winnerId === challengerId);

      // Mettre à jour les stats de l'opponent
      await updateUserStats(opponentId, winnerId === opponentId);

      console.log('Challenge stats updated:', {
        challengeId: context.params.challengeId,
        winner: winnerId,
      });
    }

    return null;
  });

/**
 * Fonction helper pour mettre à jour les stats d'un utilisateur
 */
async function updateUserStats(userId: string, isWin: boolean): Promise<void> {
  const userRef = admin.firestore().collection('users').doc(userId);
  
  await userRef.update({
    totalChallenges: admin.firestore.FieldValue.increment(1),
    challengeWins: isWin ? admin.firestore.FieldValue.increment(1) : admin.firestore.FieldValue.increment(0),
    challengeLosses: !isWin ? admin.firestore.FieldValue.increment(1) : admin.firestore.FieldValue.increment(0),
  });
}

/**
 * Fonction de test pour envoyer une notification manuelle
 * À utiliser depuis Firebase Console ou CLI
 */
export const sendTestNotification = functions.https.onCall(async (data, context) => {
  // Vérifier l'authentification
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;
  const { title, body } = data;

  try {
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    const userData = userDoc.data();

    if (!userData?.fcmToken) {
      throw new functions.https.HttpsError('failed-precondition', 'No FCM token found');
    }

    const message: admin.messaging.Message = {
      token: userData.fcmToken,
      notification: {
        title: title || 'Test Notification',
        body: body || 'This is a test notification from Memory Matrix',
      },
      data: {
        type: 'test',
      },
    };

    const response = await admin.messaging().send(message);

    return { success: true, messageId: response };
  } catch (error: any) {
    console.error('Error sending test notification:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});
