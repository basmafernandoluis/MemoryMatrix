import { Challenge, ChallengeType, DailyChallengeExtended, ChallengeProgress } from '../types';

/**
 * Challenge Service - Gestion des défis quotidiens
 * Phase 8: Défis Quotidiens
 */

class ChallengeService {
  // Templates with translation keys instead of hardcoded text
  private challengeTemplateKeys = [
    // Speed Challenges
    {
      type: 'speed' as ChallengeType,
      titleKey: 'challenges.speed.lightningSpeed.title',
      descriptionKey: 'challenges.speed.lightningSpeed.description',
      target: 5,
      reward: { xp: 100, coins: 50 },
      icon: '⚡',
      difficulty: 'easy' as const,
    },
    {
      type: 'speed' as ChallengeType,
      titleKey: 'challenges.speed.mentalSprinter.title',
      descriptionKey: 'challenges.speed.mentalSprinter.description',
      target: 8,
      reward: { xp: 200, coins: 100 },
      icon: '🏃',
      difficulty: 'medium' as const,
    },
    {
      type: 'speed' as ChallengeType,
      titleKey: 'challenges.speed.memoryFlash.title',
      descriptionKey: 'challenges.speed.memoryFlash.description',
      target: 10,
      reward: { xp: 300, coins: 150 },
      icon: '💨',
      difficulty: 'hard' as const,
    },

    // Accuracy Challenges
    {
      type: 'accuracy' as ChallengeType,
      titleKey: 'challenges.accuracy.perfectionist.title',
      descriptionKey: 'challenges.accuracy.perfectionist.description',
      target: 5,
      reward: { xp: 150, coins: 75 },
      icon: '🎯',
      difficulty: 'easy' as const,
    },
    {
      type: 'accuracy' as ChallengeType,
      titleKey: 'challenges.accuracy.absolutePrecision.title',
      descriptionKey: 'challenges.accuracy.absolutePrecision.description',
      target: 10,
      reward: { xp: 250, coins: 125 },
      icon: '✨',
      difficulty: 'medium' as const,
    },
    {
      type: 'accuracy' as ChallengeType,
      titleKey: 'challenges.accuracy.precisionMaster.title',
      descriptionKey: 'challenges.accuracy.precisionMaster.description',
      target: 15,
      reward: { xp: 400, coins: 200 },
      icon: '👑',
      difficulty: 'hard' as const,
    },

    // Endurance Challenges
    {
      type: 'endurance' as ChallengeType,
      titleKey: 'challenges.endurance.mentalMarathon.title',
      descriptionKey: 'challenges.endurance.mentalMarathon.description',
      target: 5,
      reward: { xp: 120, coins: 60 },
      icon: '🏋️',
      difficulty: 'easy' as const,
    },
    {
      type: 'endurance' as ChallengeType,
      titleKey: 'challenges.endurance.enduring.title',
      descriptionKey: 'challenges.endurance.enduring.description',
      target: 10,
      reward: { xp: 250, coins: 125 },
      icon: '💪',
      difficulty: 'medium' as const,
    },
    {
      type: 'endurance' as ChallengeType,
      titleKey: 'challenges.endurance.indestructible.title',
      descriptionKey: 'challenges.endurance.indestructible.description',
      target: 15,
      reward: { xp: 500, coins: 250 },
      icon: '🔥',
      difficulty: 'hard' as const,
    },

    // Score Challenges
    {
      type: 'score' as ChallengeType,
      titleKey: 'challenges.score.pointHunter.title',
      descriptionKey: 'challenges.score.pointHunter.description',
      target: 3000,
      reward: { xp: 150, coins: 75 },
      icon: '🌟',
      difficulty: 'easy' as const,
    },
    {
      type: 'score' as ChallengeType,
      titleKey: 'challenges.score.collector.title',
      descriptionKey: 'challenges.score.collector.description',
      target: 5000,
      reward: { xp: 300, coins: 150 },
      icon: '💎',
      difficulty: 'medium' as const,
    },
    {
      type: 'score' as ChallengeType,
      titleKey: 'challenges.score.scoreLegend.title',
      descriptionKey: 'challenges.score.scoreLegend.description',
      target: 10000,
      reward: { xp: 500, coins: 250 },
      icon: '🏆',
      difficulty: 'hard' as const,
    },

    // Perfect Challenges
    {
      type: 'perfect' as ChallengeType,
      titleKey: 'challenges.perfect.flawless.title',
      descriptionKey: 'challenges.perfect.flawless.description',
      target: 1,
      reward: { xp: 200, coins: 100, badge: 'perfect_game' },
      icon: '💯',
      difficulty: 'medium' as const,
    },
    {
      type: 'perfect' as ChallengeType,
      titleKey: 'challenges.perfect.absolutePerfection.title',
      descriptionKey: 'challenges.perfect.absolutePerfection.description',
      target: 8,
      reward: { xp: 400, coins: 200, badge: 'flawless_master' },
      icon: '🌠',
      difficulty: 'hard' as const,
    },
  ];

  /**
   * Génère les défis quotidiens pour une date donnée
   */
  generateDailyChallenges(date: string, t: (key: string, params?: any) => string): DailyChallengeExtended {
    // Utiliser la date comme seed pour générer toujours les mêmes défis pour un jour donné
    const seed = this.dateSeed(date);
    
    // Sélectionner 3 défis de difficultés différentes
    const challenges: Challenge[] = [];
    
    // 1 défi facile
    const easyTemplates = this.challengeTemplateKeys.filter(c => c.difficulty === 'easy');
    const easyTemplate = easyTemplates[seed % easyTemplates.length];
    challenges.push(this.createChallenge(easyTemplate, `${date}-easy`, t));
    
    // 1 défi moyen
    const mediumTemplates = this.challengeTemplateKeys.filter(c => c.difficulty === 'medium');
    const mediumTemplate = mediumTemplates[(seed + 1) % mediumTemplates.length];
    challenges.push(this.createChallenge(mediumTemplate, `${date}-medium`, t));
    
    // 1 défi difficile
    const hardTemplates = this.challengeTemplateKeys.filter(c => c.difficulty === 'hard');
    const hardTemplate = hardTemplates[(seed + 2) % hardTemplates.length];
    challenges.push(this.createChallenge(hardTemplate, `${date}-hard`, t));

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
  private createChallenge(
    template: typeof this.challengeTemplateKeys[0], 
    id: string, 
    t: (key: string, params?: any) => string
  ): Challenge {
    const { titleKey, descriptionKey, ...rest } = template;
    return {
      ...rest,
      id,
      title: t(titleKey),
      description: t(descriptionKey),
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
