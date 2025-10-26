import { Challenge, ChallengeType, DailyChallengeExtended, ChallengeProgress } from '../types';

/**
 * Challenge Service - Gestion des défis quotidiens
 * Phase 8: Défis Quotidiens
 */

class ChallengeService {
  private challengeTemplates: Omit<Challenge, 'id'>[] = [
    // Speed Challenges
    {
      type: 'speed',
      title: 'Vitesse éclair',
      description: 'Atteindre le niveau 5 en moins de 2 minutes',
      target: 5,
      reward: { xp: 100, coins: 50 },
      icon: '⚡',
      difficulty: 'easy',
    },
    {
      type: 'speed',
      title: 'Sprinter mental',
      description: 'Atteindre le niveau 8 en moins de 3 minutes',
      target: 8,
      reward: { xp: 200, coins: 100 },
      icon: '🏃',
      difficulty: 'medium',
    },
    {
      type: 'speed',
      title: 'Flash de mémoire',
      description: 'Atteindre le niveau 10 en moins de 4 minutes',
      target: 10,
      reward: { xp: 300, coins: 150 },
      icon: '💨',
      difficulty: 'hard',
    },

    // Accuracy Challenges
    {
      type: 'accuracy',
      title: 'Perfectionniste',
      description: 'Compléter 5 séquences sans erreur',
      target: 5,
      reward: { xp: 150, coins: 75 },
      icon: '🎯',
      difficulty: 'easy',
    },
    {
      type: 'accuracy',
      title: 'Précision absolue',
      description: 'Compléter 10 séquences parfaites',
      target: 10,
      reward: { xp: 250, coins: 125 },
      icon: '✨',
      difficulty: 'medium',
    },
    {
      type: 'accuracy',
      title: 'Maître de la précision',
      description: 'Compléter 15 séquences sans aucune erreur',
      target: 15,
      reward: { xp: 400, coins: 200 },
      icon: '👑',
      difficulty: 'hard',
    },

    // Endurance Challenges
    {
      type: 'endurance',
      title: 'Marathon mental',
      description: 'Jouer 5 parties complètes',
      target: 5,
      reward: { xp: 120, coins: 60 },
      icon: '🏋️',
      difficulty: 'easy',
    },
    {
      type: 'endurance',
      title: 'Endurant',
      description: 'Jouer 10 parties sans abandonner',
      target: 10,
      reward: { xp: 250, coins: 125 },
      icon: '💪',
      difficulty: 'medium',
    },
    {
      type: 'endurance',
      title: 'Indestructible',
      description: 'Compléter 15 parties aujourd\'hui',
      target: 15,
      reward: { xp: 500, coins: 250 },
      icon: '🔥',
      difficulty: 'hard',
    },

    // Score Challenges
    {
      type: 'score',
      title: 'Chasseur de points',
      description: 'Atteindre 3000 points en une partie',
      target: 3000,
      reward: { xp: 150, coins: 75 },
      icon: '🌟',
      difficulty: 'easy',
    },
    {
      type: 'score',
      title: 'Collectionneur',
      description: 'Totaliser 5000 points en une partie',
      target: 5000,
      reward: { xp: 300, coins: 150 },
      icon: '💎',
      difficulty: 'medium',
    },
    {
      type: 'score',
      title: 'Légende du score',
      description: 'Atteindre 10000 points en une seule partie',
      target: 10000,
      reward: { xp: 500, coins: 250 },
      icon: '🏆',
      difficulty: 'hard',
    },

    // Perfect Challenges
    {
      type: 'perfect',
      title: 'Sans faute',
      description: 'Terminer une partie sans perdre de vie',
      target: 1,
      reward: { xp: 200, coins: 100, badge: 'perfect_game' },
      icon: '💯',
      difficulty: 'medium',
    },
    {
      type: 'perfect',
      title: 'Perfection absolue',
      description: 'Atteindre le niveau 8 sans perdre de vie',
      target: 8,
      reward: { xp: 400, coins: 200, badge: 'flawless_master' },
      icon: '🌠',
      difficulty: 'hard',
    },
  ];

  /**
   * Génère les défis quotidiens pour une date donnée
   */
  generateDailyChallenges(date: string): DailyChallengeExtended {
    // Utiliser la date comme seed pour générer toujours les mêmes défis pour un jour donné
    const seed = this.dateSeed(date);
    
    // Sélectionner 3 défis de difficultés différentes
    const challenges: Challenge[] = [];
    
    // 1 défi facile
    const easyTemplates = this.challengeTemplates.filter(c => c.difficulty === 'easy');
    challenges.push(this.createChallenge(easyTemplates[seed % easyTemplates.length], `${date}-easy`));
    
    // 1 défi moyen
    const mediumTemplates = this.challengeTemplates.filter(c => c.difficulty === 'medium');
    challenges.push(this.createChallenge(mediumTemplates[(seed + 1) % mediumTemplates.length], `${date}-medium`));
    
    // 1 défi difficile
    const hardTemplates = this.challengeTemplates.filter(c => c.difficulty === 'hard');
    challenges.push(this.createChallenge(hardTemplates[(seed + 2) % hardTemplates.length], `${date}-hard`));

    // Expiration : fin de la journée (23:59:59)
    const expiresAt = new Date(date + 'T23:59:59').getTime();

    return {
      id: `daily-${date}`,
      date,
      challenges,
      completed: false,
      expiresAt,
    };
  }

  /**
   * Crée un défi avec un ID unique
   */
  private createChallenge(template: Omit<Challenge, 'id'>, id: string): Challenge {
    return {
      ...template,
      id,
    };
  }

  /**
   * Génère un nombre pseudo-aléatoire basé sur la date
   */
  private dateSeed(date: string): number {
    let hash = 0;
    for (let i = 0; i < date.length; i++) {
      const char = date.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Obtient la date d'aujourd'hui au format YYYY-MM-DD
   */
  getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  /**
   * Vérifie si les défis d'aujourd'hui ont expiré
   */
  areChallengesExpired(challenges: DailyChallengeExtended): boolean {
    return Date.now() > challenges.expiresAt;
  }

  /**
   * Vérifie si un défi est complété en fonction du progrès
   */
  isChallengeCompleted(challenge: Challenge, progress: number): boolean {
    return progress >= challenge.target;
  }

  /**
   * Met à jour le progrès d'un défi spécifique
   */
  updateChallengeProgress(
    challengeProgress: ChallengeProgress,
    challengeId: string,
    newProgress: number
  ): ChallengeProgress {
    const challengeIndex = challengeProgress.currentChallenges.findIndex(
      c => c.challengeId === challengeId
    );

    if (challengeIndex === -1) {
      // Ajouter un nouveau suivi de défi
      return {
        ...challengeProgress,
        currentChallenges: [
          ...challengeProgress.currentChallenges,
          {
            challengeId,
            progress: newProgress,
            completed: false,
            rewardClaimed: false,
          },
        ],
      };
    }

    // Mettre à jour le progrès existant
    const updatedChallenges = [...challengeProgress.currentChallenges];
    updatedChallenges[challengeIndex] = {
      ...updatedChallenges[challengeIndex],
      progress: Math.max(updatedChallenges[challengeIndex].progress, newProgress),
    };

    return {
      ...challengeProgress,
      currentChallenges: updatedChallenges,
    };
  }

  /**
   * Marque un défi comme complété
   */
  completeChallengeInProgress(
    challengeProgress: ChallengeProgress,
    challengeId: string
  ): ChallengeProgress {
    const updatedChallenges = challengeProgress.currentChallenges.map(c =>
      c.challengeId === challengeId
        ? { ...c, completed: true }
        : c
    );

    return {
      ...challengeProgress,
      currentChallenges: updatedChallenges,
    };
  }

  /**
   * Réclame la récompense d'un défi
   */
  claimReward(
    challengeProgress: ChallengeProgress,
    challengeId: string
  ): ChallengeProgress {
    const updatedChallenges = challengeProgress.currentChallenges.map(c =>
      c.challengeId === challengeId
        ? { ...c, rewardClaimed: true }
        : c
    );

    // Vérifier si c'est le premier défi complété aujourd'hui pour la streak
    const todayDate = this.getTodayDate();
    const shouldUpdateStreak = challengeProgress.lastCompletionDate !== todayDate;
    
    const isConsecutiveDay = this.isConsecutiveDay(
      challengeProgress.lastCompletionDate,
      todayDate
    );

    return {
      ...challengeProgress,
      currentChallenges: updatedChallenges,
      streak: shouldUpdateStreak 
        ? (isConsecutiveDay ? challengeProgress.streak + 1 : 1)
        : challengeProgress.streak,
      lastCompletionDate: shouldUpdateStreak ? todayDate : challengeProgress.lastCompletionDate,
      totalChallengesCompleted: challengeProgress.totalChallengesCompleted + 1,
    };
  }

  /**
   * Vérifie si deux dates sont consécutives
   */
  private isConsecutiveDay(lastDate: string, currentDate: string): boolean {
    if (!lastDate) return false;
    
    const last = new Date(lastDate);
    const current = new Date(currentDate);
    const diffTime = current.getTime() - last.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    
    return diffDays === 1;
  }

  /**
   * Nettoie les défis expirés du progrès
   */
  cleanupExpiredChallenges(
    challengeProgress: ChallengeProgress,
    currentChallenges: DailyChallengeExtended
  ): ChallengeProgress {
    const currentChallengeIds = new Set(currentChallenges.challenges.map(c => c.id));
    
    return {
      ...challengeProgress,
      currentChallenges: challengeProgress.currentChallenges.filter(c =>
        currentChallengeIds.has(c.challengeId)
      ),
    };
  }

  /**
   * Initialise le progrès des défis pour un nouvel utilisateur
   */
  initializeChallengeProgress(userId: string): ChallengeProgress {
    return {
      userId,
      currentChallenges: [],
      streak: 0,
      lastCompletionDate: '',
      totalChallengesCompleted: 0,
    };
  }
}

export const challengeService = new ChallengeService();
