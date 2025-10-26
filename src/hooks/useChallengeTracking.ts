import { useEffect, useRef } from 'react';
import { challengeService } from '../services/challengeService';
import { firestoreService } from '../services/firestore';
import { ChallengeProgress, DailyChallengeExtended, Challenge } from '../types';

/**
 * Hook for tracking challenge progress during gameplay
 * Phase 8: Défis Quotidiens
 */

interface GameStats {
  level: number;
  score: number;
  lives: number;
  perfectSequences: number;
  totalGames: number;
  startTime: number;
}

export const useChallengeTracking = (userId: string | null) => {
  const gameStatsRef = useRef<GameStats>({
    level: 1,
    score: 0,
    lives: 5,
    perfectSequences: 0,
    totalGames: 0,
    startTime: Date.now(),
  });

  const challengesRef = useRef<DailyChallengeExtended | null>(null);
  const progressRef = useRef<ChallengeProgress | null>(null);

  // Charger les défis au démarrage
  useEffect(() => {
    if (!userId) return;

    const loadChallenges = async () => {
      try {
        const todayDate = challengeService.getTodayDate();
        const challenges = challengeService.generateDailyChallenges(todayDate);
        challengesRef.current = challenges;

        let progress = await firestoreService.getChallengeProgress(userId);
        if (!progress) {
          progress = challengeService.initializeChallengeProgress(userId);
          await firestoreService.saveChallengeProgress(progress);
        }
        progressRef.current = progress;
      } catch (error) {
        console.error('Error loading challenges for tracking:', error);
      }
    };

    loadChallenges();
  }, [userId]);

  // Réinitialiser les stats de jeu
  const resetGameStats = () => {
    gameStatsRef.current = {
      level: 1,
      score: 0,
      lives: 5,
      perfectSequences: 0,
      totalGames: gameStatsRef.current.totalGames + 1,
      startTime: Date.now(),
    };
  };

  // Mettre à jour le niveau
  const updateLevel = (level: number) => {
    gameStatsRef.current.level = level;
    checkChallenges();
  };

  // Mettre à jour le score
  const updateScore = (score: number) => {
    gameStatsRef.current.score = score;
    checkChallenges();
  };

  // Mettre à jour les vies
  const updateLives = (lives: number) => {
    gameStatsRef.current.lives = lives;
  };

  // Incrémenter les séquences parfaites
  const incrementPerfectSequences = () => {
    gameStatsRef.current.perfectSequences += 1;
    checkChallenges();
  };

  // Vérifier et mettre à jour les défis
  const checkChallenges = async () => {
    if (!userId || !challengesRef.current || !progressRef.current) return;

    try {
      let updated = false;
      let newProgress = { ...progressRef.current };

      for (const challenge of challengesRef.current.challenges) {
        const currentProgress = getChallengeProgress(challenge, gameStatsRef.current);
        
        // Mettre à jour le progrès si nécessaire
        const existingProgress = newProgress.currentChallenges.find(
          c => c.challengeId === challenge.id
        );

        if (!existingProgress || existingProgress.progress < currentProgress) {
          newProgress = challengeService.updateChallengeProgress(
            newProgress,
            challenge.id,
            currentProgress
          );
          updated = true;

          // Marquer comme complété si l'objectif est atteint
          if (currentProgress >= challenge.target && !existingProgress?.completed) {
            newProgress = challengeService.completeChallengeInProgress(
              newProgress,
              challenge.id
            );
          }
        }
      }

      // Sauvegarder si des changements ont été effectués
      if (updated) {
        await firestoreService.saveChallengeProgress(newProgress);
        progressRef.current = newProgress;
      }
    } catch (error) {
      console.error('Error checking challenges:', error);
    }
  };

  // Obtenir le progrès actuel pour un défi spécifique
  const getChallengeProgress = (challenge: Challenge, stats: GameStats): number => {
    switch (challenge.type) {
      case 'speed':
        // Défi de vitesse : atteindre un niveau en un temps limité
        const elapsedMinutes = (Date.now() - stats.startTime) / 1000 / 60;
        const targetMinutes = getTargetMinutes(challenge.target);
        
        if (stats.level >= challenge.target && elapsedMinutes <= targetMinutes) {
          return challenge.target;
        }
        return Math.min(stats.level, challenge.target - 1);

      case 'accuracy':
        // Défi de précision : nombre de séquences parfaites
        return stats.perfectSequences;

      case 'endurance':
        // Défi d'endurance : nombre de parties jouées
        return stats.totalGames;

      case 'score':
        // Défi de score : atteindre un score en une partie
        return stats.score;

      case 'perfect':
        // Défi parfait : atteindre un niveau sans perdre de vie
        if (stats.lives === 5 && stats.level >= challenge.target) {
          return challenge.target;
        }
        return 0;

      default:
        return 0;
    }
  };

  // Obtenir le temps cible pour les défis de vitesse
  const getTargetMinutes = (level: number): number => {
    if (level <= 5) return 2;
    if (level <= 8) return 3;
    return 4;
  };

  // Finaliser le jeu et vérifier les défis une dernière fois
  const finalizeGame = async () => {
    await checkChallenges();
  };

  return {
    resetGameStats,
    updateLevel,
    updateScore,
    updateLives,
    incrementPerfectSequences,
    finalizeGame,
  };
};
