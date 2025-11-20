/**
 * Friend Challenges Service - Phase 13: Social Features
 * 
 * Gère les défis entre amis :
 * - Création de défis
 * - Acceptation/refus de défis
 * - Soumission de scores
 * - Calcul des gagnants
 * - Historique des défis
 */

import firestore from '@react-native-firebase/firestore';
import { FriendChallenge, GameMode } from '../types';
import { notificationService } from './notificationService';
import { firestoreService } from './firestore';

class FriendChallengesService {
  private challengesCollection = firestore().collection('friendChallenges');
  private usersCollection = firestore().collection('users');

  /**
   * Créer un nouveau défi
   */
  async createChallenge(
    challengerId: string,
    challengerName: string,
    challengerAvatar: string,
    opponentId: string,
    opponentName: string,
    opponentAvatar: string,
    mode: GameMode
  ): Promise<FriendChallenge> {
    try {
      // Vérifier qu'il n'y a pas déjà un défi actif entre ces deux joueurs (dans les 2 sens)
      const existingChallengesQuery1 = await this.challengesCollection
        .where('challengerId', '==', challengerId)
        .where('opponentId', '==', opponentId)
        .where('status', 'in', ['pending', 'active'])
        .get();

      const existingChallengesQuery2 = await this.challengesCollection
        .where('challengerId', '==', opponentId)
        .where('opponentId', '==', challengerId)
        .where('status', 'in', ['pending', 'active'])
        .get();

      if (!existingChallengesQuery1.empty || !existingChallengesQuery2.empty) {
        throw new Error('Un défi est déjà en cours avec cet ami');
      }

      const now = new Date();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24h

      const challengeData: Omit<FriendChallenge, 'id'> = {
        challengerId,
        challengerName,
        challengerAvatar,
        opponentId,
        opponentName,
        opponentAvatar,
        mode,
        status: 'pending',
        createdAt: now,
        expiresAt,
      };

      const docRef = await this.challengesCollection.add(challengeData);

      // Envoyer une notification
      const modeNames: Partial<Record<GameMode, string>> = {
        classic: 'Classique',
        survival: 'Survie',
        timeAttack: 'Temps',
        zen: 'Zen',
      };
      
      await notificationService.notifyChallengeReceived(
        opponentId,
        challengerId,
        challengerName,
        docRef.id,
        modeNames[mode] || mode
      );

      return {
        id: docRef.id,
        ...challengeData,
      };
    } catch (error) {
      console.error('Error creating challenge:', error);
      throw error;
    }
  }

  /**
   * Accepter un défi
   */
  async acceptChallenge(userId: string, challengeId: string): Promise<void> {
    try {
      const challengeDoc = await this.challengesCollection.doc(challengeId).get();

      if (!challengeDoc.exists) {
        throw new Error('Défi introuvable');
      }

      const challenge = challengeDoc.data() as FriendChallenge;

      if (challenge.opponentId !== userId) {
        throw new Error('Non autorisé');
      }

      if (challenge.status !== 'pending') {
        throw new Error('Ce défi ne peut plus être accepté');
      }

      // Vérifier si le défi n'a pas expiré
      const expiresAt = challenge.expiresAt instanceof Date 
        ? challenge.expiresAt 
        : (challenge.expiresAt as any).toDate();
      
      if (new Date() > expiresAt) {
        await this.challengesCollection.doc(challengeId).update({
          status: 'expired',
        });
        throw new Error('Ce défi a expiré');
      }

      await this.challengesCollection.doc(challengeId).update({
        status: 'active',
        acceptedAt: new Date(),
      });

      // Envoyer une notification
      await notificationService.notifyChallengeAccepted(
        challenge.challengerId,
        userId,
        challenge.opponentName,
        challengeId
      );
    } catch (error) {
      console.error('Error accepting challenge:', error);
      throw error;
    }
  }

  /**
   * Refuser un défi
   */
  async rejectChallenge(userId: string, challengeId: string): Promise<void> {
    try {
      const challengeDoc = await this.challengesCollection.doc(challengeId).get();

      if (!challengeDoc.exists) {
        throw new Error('Défi introuvable');
      }

      const challenge = challengeDoc.data() as FriendChallenge;

      if (challenge.opponentId !== userId) {
        throw new Error('Non autorisé');
      }

      await this.challengesCollection.doc(challengeId).delete();
    } catch (error) {
      console.error('Error rejecting challenge:', error);
      throw error;
    }
  }

  /**
   * Soumettre un score pour un défi
   */
  async submitChallengeScore(
    userId: string,
    challengeId: string,
    score: number,
    level: number
  ): Promise<void> {
    try {
      const challengeDoc = await this.challengesCollection.doc(challengeId).get();

      if (!challengeDoc.exists) {
        throw new Error('Défi introuvable');
      }

      const challenge = challengeDoc.data() as FriendChallenge;

      if (challenge.status !== 'active') {
        throw new Error('Ce défi n\'est pas actif');
      }

      // Vérifier si le défi n'a pas expiré
      const expiresAt = challenge.expiresAt instanceof Date 
        ? challenge.expiresAt 
        : (challenge.expiresAt as any).toDate();
      
      if (new Date() > expiresAt) {
        await this.challengesCollection.doc(challengeId).update({
          status: 'expired',
        });
        throw new Error('Ce défi a expiré');
      }

      const updateData: any = {};

      if (userId === challenge.challengerId) {
        updateData.challengerScore = score;
        updateData.challengerLevel = level;
      } else if (userId === challenge.opponentId) {
        updateData.opponentScore = score;
        updateData.opponentLevel = level;
      } else {
        throw new Error('Non autorisé');
      }

      // Vérifier si les deux joueurs ont soumis leur score
      const updatedChallenge = { ...challenge, ...updateData };
      
      if (
        updatedChallenge.challengerScore !== undefined &&
        updatedChallenge.opponentScore !== undefined
      ) {
        // Déterminer le gagnant
        let winnerId: string;
        
        if (updatedChallenge.challengerScore > updatedChallenge.opponentScore) {
          winnerId = challenge.challengerId;
        } else if (updatedChallenge.opponentScore > updatedChallenge.challengerScore) {
          winnerId = challenge.opponentId;
        } else {
          // En cas d'égalité, celui qui a atteint le niveau le plus élevé gagne
          winnerId = 
            (updatedChallenge.challengerLevel || 0) > (updatedChallenge.opponentLevel || 0)
              ? challenge.challengerId
              : challenge.opponentId;
        }

        updateData.winnerId = winnerId;
        updateData.status = 'completed';
        updateData.completedAt = new Date();
      }

      await this.challengesCollection.doc(challengeId).update(updateData);

      // Notifier l'adversaire que le joueur a soumis son score
      const opponentId = userId === challenge.challengerId ? challenge.opponentId : challenge.challengerId;
      const playerName = userId === challenge.challengerId ? challenge.challengerName : challenge.opponentName;
      
      await notificationService.notifyChallengeScoreSubmitted(
        opponentId,
        userId,
        playerName,
        challengeId,
        score
      );

      // Si le défi est terminé, notifier l'adversaire du résultat
      if (updateData.status === 'completed' && updateData.winnerId) {
        const isCurrentUserWinner = updateData.winnerId === userId;
        
        console.log('[DEBUG] Challenge completed notification:', {
          challengeId,
          winnerId: updateData.winnerId,
          currentUserId: userId,
          isCurrentUserWinner,
          opponentId,
          challengerScore: updatedChallenge.challengerScore,
          opponentScore: updatedChallenge.opponentScore
        });
        
        const scoreDiff = Math.abs(
          (updatedChallenge.challengerScore || 0) - (updatedChallenge.opponentScore || 0)
        );

        // Notifier uniquement l'adversaire (pas soi-même)
        // L'utilisateur actuel est le senderId (celui qui vient de jouer)
        // isWinner pour l'adversaire = inverse de isCurrentUserWinner
        const isOpponentWinner = !isCurrentUserWinner;
        
        console.log('[DEBUG] Sending notification to opponent:', {
          recipientId: opponentId,
          senderId: userId,
          senderName: playerName,
          isOpponentWinner,
          message: isOpponentWinner ? 'VICTORY for opponent' : 'DEFEAT for opponent'
        });
        
        await notificationService.notifyChallengeCompleted(
          opponentId, // destinataire
          userId, // expéditeur (joueur actuel)
          playerName, // nom de l'expéditeur
          challengeId,
          isOpponentWinner, // l'adversaire a gagné si le joueur actuel a perdu
          scoreDiff
        );
        
        // Si l'utilisateur actuel est le gagnant, récompenser immédiatement
        // Sinon, l'adversaire sera récompensé quand il réclamera manuellement
        if (isCurrentUserWinner) {
          // Ne pas donner la récompense automatiquement
          // Le joueur devra cliquer sur "Réclamer" dans l'historique
          console.log(`🏆 User ${userId} won the challenge! Reward can be claimed from history.`);
        }
      }
    } catch (error) {
      console.error('Error submitting challenge score:', error);
      throw error;
    }
  }

  /**
   * Réclamer la récompense d'un défi gagné
   */
  async claimChallengeReward(userId: string, challengeId: string): Promise<void> {
    try {
      console.log('🔍 Fetching challenge:', challengeId);
      const challengeDoc = await this.challengesCollection.doc(challengeId).get();
      
      if (!challengeDoc.exists) {
        throw new Error('Défi introuvable');
      }

      const challenge = challengeDoc.data() as any;
      const isChallenger = challenge.challengerId === userId;
      const isOpponent = challenge.opponentId === userId;
      
      console.log('📋 Challenge data:', {
        winnerId: challenge.winnerId,
        userId,
        isChallenger,
        isOpponent,
        challengerRewardClaimed: challenge.challengerRewardClaimed,
        opponentRewardClaimed: challenge.opponentRewardClaimed
      });

      if (challenge.winnerId !== userId) {
        throw new Error('Vous n\'êtes pas le gagnant de ce défi');
      }

      // Vérifier si le joueur actuel a déjà réclamé sa récompense
      const hasClaimedReward = isChallenger 
        ? challenge.challengerRewardClaimed 
        : challenge.opponentRewardClaimed;

      if (hasClaimedReward) {
        throw new Error('Récompense déjà réclamée');
      }

      const REWARD_XP = 50;
      const REWARD_COINS = 25;

      console.log('💰 Adding reward to user:', { userId, REWARD_XP, REWARD_COINS });
      await firestoreService.claimChallengeReward(userId, REWARD_XP, REWARD_COINS);
      
      // Incrémenter le compteur de victoires contre amis
      console.log('🏆 Incrementing friend challenge wins count');
      await firestoreService.incrementFriendChallengeWins(userId);
      
      console.log('✏️ Marking reward as claimed in Firestore');
      // Marquer la récompense comme réclamée pour ce joueur spécifique
      const fieldToUpdate = isChallenger ? 'challengerRewardClaimed' : 'opponentRewardClaimed';
      await this.challengesCollection.doc(challengeId).update({
        [fieldToUpdate]: true,
      });

      console.log(`✅ User ${userId} claimed reward: ${REWARD_XP} XP and ${REWARD_COINS} coins (field: ${fieldToUpdate})`);
    } catch (error) {
      console.error('❌ Error claiming challenge reward:', error);
      throw error;
    }
  }

  /**
   * Récupérer les défis en attente (reçus)
   */
  async getPendingChallenges(userId: string): Promise<FriendChallenge[]> {
    try {
      const snapshot = await this.challengesCollection
        .where('opponentId', '==', userId)
        .where('status', '==', 'pending')
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map(doc => this.mapChallengeData(doc.id, doc.data()));
    } catch (error) {
      console.error('Error getting pending challenges:', error);
      throw error;
    }
  }

  /**
   * Récupérer les défis actifs (en cours)
   */
  async getActiveChallenges(userId: string): Promise<FriendChallenge[]> {
    try {
      // Défis où l'utilisateur est le challenger OU l'opposant
      const [asChallenger, asOpponent] = await Promise.all([
        this.challengesCollection
          .where('challengerId', '==', userId)
          .where('status', '==', 'active')
          .orderBy('createdAt', 'desc')
          .get(),
        this.challengesCollection
          .where('opponentId', '==', userId)
          .where('status', '==', 'active')
          .orderBy('createdAt', 'desc')
          .get(),
      ]);

      const challenges = [
        ...asChallenger.docs.map(doc => this.mapChallengeData(doc.id, doc.data())),
        ...asOpponent.docs.map(doc => this.mapChallengeData(doc.id, doc.data())),
      ];

      // Trier par date de création (plus récent d'abord)
      return challenges.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Error getting active challenges:', error);
      throw error;
    }
  }

  /**
   * Récupérer les défis envoyés (en attente d'acceptation)
   */
  async getSentChallenges(userId: string): Promise<FriendChallenge[]> {
    try {
      const snapshot = await this.challengesCollection
        .where('challengerId', '==', userId)
        .where('status', '==', 'pending')
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map(doc => this.mapChallengeData(doc.id, doc.data()));
    } catch (error) {
      console.error('Error getting sent challenges:', error);
      throw error;
    }
  }

  /**
   * Récupérer l'historique des défis terminés
   */
  async getCompletedChallenges(userId: string, limit: number = 20): Promise<FriendChallenge[]> {
    try {
      // Défis où l'utilisateur est le challenger OU l'opposant
      const [asChallenger, asOpponent] = await Promise.all([
        this.challengesCollection
          .where('challengerId', '==', userId)
          .where('status', '==', 'completed')
          .orderBy('completedAt', 'desc')
          .limit(limit / 2)
          .get(),
        this.challengesCollection
          .where('opponentId', '==', userId)
          .where('status', '==', 'completed')
          .orderBy('completedAt', 'desc')
          .limit(limit / 2)
          .get(),
      ]);

      const challenges = [
        ...asChallenger.docs.map(doc => this.mapChallengeData(doc.id, doc.data())),
        ...asOpponent.docs.map(doc => this.mapChallengeData(doc.id, doc.data())),
      ];

      // Trier par date de complétion (plus récent d'abord)
      return challenges
        .sort((a, b) => {
          const aTime = a.completedAt?.getTime() || 0;
          const bTime = b.completedAt?.getTime() || 0;
          return bTime - aTime;
        })
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting completed challenges:', error);
      throw error;
    }
  }

  /**
   * Récupérer les statistiques de défis d'un utilisateur
   */
  async getChallengeStats(userId: string): Promise<{
    totalChallenges: number;
    wins: number;
    losses: number;
    draws: number;
    winRate: number;
  }> {
    try {
      const [asChallenger, asOpponent] = await Promise.all([
        this.challengesCollection
          .where('challengerId', '==', userId)
          .where('status', '==', 'completed')
          .get(),
        this.challengesCollection
          .where('opponentId', '==', userId)
          .where('status', '==', 'completed')
          .get(),
      ]);

      let wins = 0;
      let losses = 0;
      let draws = 0;

      asChallenger.docs.forEach(doc => {
        const data = doc.data() as FriendChallenge;
        if (data.winnerId === userId) {
          wins++;
        } else if (data.winnerId) {
          losses++;
        } else {
          draws++;
        }
      });

      asOpponent.docs.forEach(doc => {
        const data = doc.data() as FriendChallenge;
        if (data.winnerId === userId) {
          wins++;
        } else if (data.winnerId) {
          losses++;
        } else {
          draws++;
        }
      });

      const totalChallenges = wins + losses + draws;
      const winRate = totalChallenges > 0 ? (wins / totalChallenges) * 100 : 0;

      return {
        totalChallenges,
        wins,
        losses,
        draws,
        winRate,
      };
    } catch (error) {
      console.error('Error getting challenge stats:', error);
      return {
        totalChallenges: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        winRate: 0,
      };
    }
  }

  /**
   * S'abonner aux défis en attente
   */
  subscribeToPendingChallenges(
    userId: string,
    callback: (challenges: FriendChallenge[]) => void
  ): () => void {
    return this.challengesCollection
      .where('opponentId', '==', userId)
      .where('status', '==', 'pending')
      .orderBy('createdAt', 'desc')
      .onSnapshot(snapshot => {
        const challenges = snapshot.docs.map(doc =>
          this.mapChallengeData(doc.id, doc.data())
        );
        callback(challenges);
      });
  }

  /**
   * S'abonner aux défis actifs
   */
  subscribeToActiveChallenges(
    userId: string,
    callback: (challenges: FriendChallenge[]) => void
  ): () => void {
    // Créer deux subscriptions et les combiner
    const unsubscribe1 = this.challengesCollection
      .where('challengerId', '==', userId)
      .where('status', '==', 'active')
      .orderBy('createdAt', 'desc')
      .onSnapshot(() => this.updateActiveChallenges(userId, callback));

    const unsubscribe2 = this.challengesCollection
      .where('opponentId', '==', userId)
      .where('status', '==', 'active')
      .orderBy('createdAt', 'desc')
      .onSnapshot(() => this.updateActiveChallenges(userId, callback));

    return () => {
      unsubscribe1();
      unsubscribe2();
    };
  }

  /**
   * Nettoyer les défis expirés
   */
  async cleanupExpiredChallenges(): Promise<void> {
    try {
      const now = new Date();
      const expiredChallenges = await this.challengesCollection
        .where('status', 'in', ['pending', 'active'])
        .where('expiresAt', '<=', now)
        .get();

      const batch = firestore().batch();
      expiredChallenges.docs.forEach(doc => {
        batch.update(doc.ref, { status: 'expired' });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error cleaning up expired challenges:', error);
    }
  }

  /**
   * Méthode privée pour mettre à jour les défis actifs
   */
  private async updateActiveChallenges(
    userId: string,
    callback: (challenges: FriendChallenge[]) => void
  ): Promise<void> {
    const challenges = await this.getActiveChallenges(userId);
    callback(challenges);
  }

  /**
   * Mapper les données Firestore en objet FriendChallenge
   */
  private mapChallengeData(id: string, data: any): FriendChallenge {
    return {
      id,
      challengerId: data.challengerId,
      challengerName: data.challengerName,
      challengerAvatar: data.challengerAvatar,
      opponentId: data.opponentId,
      opponentName: data.opponentName,
      opponentAvatar: data.opponentAvatar,
      mode: data.mode,
      status: data.status,
      targetScore: data.targetScore,
      targetLevel: data.targetLevel,
      challengerScore: data.challengerScore,
      challengerLevel: data.challengerLevel,
      opponentScore: data.opponentScore,
      opponentLevel: data.opponentLevel,
      winnerId: data.winnerId,
      challengerRewardClaimed: data.challengerRewardClaimed || false,
      opponentRewardClaimed: data.opponentRewardClaimed || false,
      createdAt: data.createdAt?.toDate() || new Date(),
      acceptedAt: data.acceptedAt?.toDate(),
      completedAt: data.completedAt?.toDate(),
      expiresAt: data.expiresAt?.toDate() || new Date(),
    };
  }
}

export const friendChallengesService = new FriendChallengesService();
