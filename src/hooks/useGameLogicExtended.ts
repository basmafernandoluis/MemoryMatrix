/**
 * Extended Game Logic Hook with Multi-Mode Support
 * Gère tous les modes de jeu: Classic, Survival, TimeAttack, Zen, Custom
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, GameStatus, UserProgress, GameMode, SurvivalStats, TimeAttackStats, ZenStats } from '../types';
import { GAME_CONFIG } from '../constants/gameConfig';
import { GameEngine } from '../utils/GameEngine';
import { 
  loadUserProgress, 
  updateHighScore, 
  updateMaxLevel, 
  incrementGamesPlayed,
  initializeUserProgress,
} from '../utils/storage';
import {
  updateSurvivalBestStreak,
  updateTimeAttackBestTime,
  updateZenBestAccuracy,
  getSurvivalBestStreak,
} from '../utils/gameModeStorage';
import { feedback, startChronoSound, stopChronoSound } from '../utils/soundManager';
import { 
  getScoreMultiplier, 
  getTimeBonusForLevel,
  getSurvivalDifficultyIncrease,
  getModeConfig 
} from '../constants/gameModes';

interface GameModeState {
  mode: GameMode;
  survivalStats?: SurvivalStats;
  timeAttackStats?: TimeAttackStats;
  zenStats?: ZenStats;
}

export const useGameLogicExtended = (initialMode: GameMode = 'classic') => {
  const [gameState, setGameState] = useState<GameState>({
    level: GAME_CONFIG.INITIAL_LEVEL,
    score: 0,
    lives: GAME_CONFIG.INITIAL_LIVES,
    currentSequence: [],
    userSequence: [],
    isShowingSequence: false,
    isGameOver: false,
    isPaused: false,
    hintsRemaining: 3,
    isHintReplay: false,
  });

  const [gameModeState, setGameModeState] = useState<GameModeState>({
    mode: initialMode,
    survivalStats: initialMode === 'survival' ? {
      currentStreak: 0,
      bestStreak: 0,
      totalLevelsCompleted: 0,
      difficultyMultiplier: 1,
    } : undefined,
    timeAttackStats: initialMode === 'timeAttack' ? {
      timeRemaining: 120,
      timeBonus: 0,
      fastestCompletion: 0,
    } : undefined,
    zenStats: initialMode === 'zen' ? {
      totalTimePlayed: 0,
      perfectMoves: 0,
      totalMoves: 0,
      averageAccuracy: 100,
    } : undefined,
  });

  const [gameStatus, setGameStatus] = useState<GameStatus>('idle');
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Timer pour le mode contre-la-montre
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Charger la progression utilisateur
  useEffect(() => {
    const loadProgress = async () => {
      const progress = await initializeUserProgress();
      setUserProgress(progress);
    };
    loadProgress();
  }, []);

  // Gérer le timer pour TimeAttack
  useEffect(() => {
    const config = getModeConfig(gameModeState.mode);
    
    if (config.settings.hasTimer && gameStatus === 'playing' && !isPaused) {
      // Start chrono sound ONLY for Time Attack mode
      if (gameModeState.mode === 'timeAttack') {
        startChronoSound();
      }
      
      timerRef.current = setInterval(() => {
        setGameModeState(prev => {
          if (!prev.timeAttackStats) return prev;
          
          const newTimeRemaining = prev.timeAttackStats.timeRemaining - 1;
          
          if (newTimeRemaining <= 0) {
            // Temps écoulé = game over
            feedback.gameOver(); // Son alertefaill
            setGameState(prevState => ({ ...prevState, isGameOver: true }));
            setGameStatus('gameover');
            if (timerRef.current) clearInterval(timerRef.current);
            // Stop chrono sound when time is up
            stopChronoSound();
          }
          
          return {
            ...prev,
            timeAttackStats: {
              ...prev.timeAttackStats,
              timeRemaining: Math.max(0, newTimeRemaining),
            },
          };
        });
      }, 1000);
    } else {
      // Stop chrono sound when not playing or paused
      if (gameModeState.mode === 'timeAttack') {
        stopChronoSound();
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      // Cleanup chrono sound on unmount or when stopping
      if (gameModeState.mode === 'timeAttack') {
        stopChronoSound();
      }
    };
  }, [gameStatus, isPaused, gameModeState.mode]);

  // Démarrer une nouvelle partie
  const startGame = useCallback(async (mode: GameMode = 'classic') => {
    const config = getModeConfig(mode);
    const startLevel = config.settings.startingLevel || 1;
    const sequence = GameEngine.generateSequence(startLevel);

    // Déterminer le nombre de vies selon le mode
    let initialLives = 3; // Par défaut : 3 vies (Classic, TimeAttack)
    if (config.settings.hasLives === false) {
      initialLives = 999; // Vie infinie (Zen, Survival)
    }

    setGameState({
      level: startLevel,
      score: 0,
      lives: initialLives,
      currentSequence: sequence,
      userSequence: [],
      isShowingSequence: true,
      isGameOver: false,
      isPaused: false,
      hintsRemaining: 3,
      isHintReplay: false,
    });

    setGameModeState({
      mode,
      survivalStats: mode === 'survival' ? {
        currentStreak: 0,
        bestStreak: (await getSurvivalBestStreak()) || 0,
        totalLevelsCompleted: 0,
        difficultyMultiplier: 1,
      } : undefined,
      timeAttackStats: mode === 'timeAttack' ? {
        timeRemaining: config.settings.timerDuration || 120,
        timeBonus: 0,
        fastestCompletion: 0,
      } : undefined,
      zenStats: mode === 'zen' ? {
        totalTimePlayed: 0,
        perfectMoves: 0,
        totalMoves: 0,
        averageAccuracy: 100,
      } : undefined,
    });

    setGameStatus('showing');
    
    await incrementGamesPlayed();
    const progress = await loadUserProgress();
    if (progress) {
      setUserProgress(progress);
    }
  }, []);

  // Passer au niveau suivant
  const nextLevel = useCallback(async () => {
    const newLevel = gameState.level + 1;
    const config = getModeConfig(gameModeState.mode);
    
    // En mode survie, la taille de grille augmente plus vite
    let gridSize = newLevel + 1;
    if (gameModeState.mode === 'survival') {
      gridSize = getSurvivalDifficultyIncrease(newLevel);
    }
    
    const sequence = GameEngine.generateSequence(gridSize);
    
    // Stats de survie
    if (gameModeState.mode === 'survival' && gameModeState.survivalStats) {
      const newStreak = gameModeState.survivalStats.currentStreak + 1;
      const newBest = Math.max(gameModeState.survivalStats.bestStreak, newStreak);
      
      setGameModeState(prev => ({
        ...prev,
        survivalStats: prev.survivalStats ? {
          ...prev.survivalStats,
          currentStreak: newStreak,
          totalLevelsCompleted: prev.survivalStats.totalLevelsCompleted + 1,
          bestStreak: newBest,
          difficultyMultiplier: 1 + Math.floor(newLevel / 5) * 0.2,
        } : undefined,
      }));
      
      // Sauvegarder le nouveau record
      if (newBest > gameModeState.survivalStats.bestStreak) {
        await updateSurvivalBestStreak(newBest);
      }
    }
    
    setGameState(prev => ({
      ...prev,
      level: newLevel,
      currentSequence: sequence,
      userSequence: [],
      isShowingSequence: true,
    }));
    setGameStatus('showing');
    
    await updateMaxLevel(newLevel);
    const progress = await loadUserProgress();
    if (progress) {
      setUserProgress(progress);
    }
  }, [gameState.level, gameModeState.mode, gameModeState.survivalStats, gameModeState.timeAttackStats]);

  // Gérer le clic sur une cellule
  const handleCellClick = useCallback((cellIndex: number) => {
    if (gameState.isShowingSequence || gameState.isGameOver || gameStatus !== 'playing' || isPaused) {
      return;
    }

    const newUserSequence = [...gameState.userSequence, cellIndex];
    const currentIndex = gameState.userSequence.length;
    const isCorrect = cellIndex === gameState.currentSequence[currentIndex];

    if (isCorrect) {
      // Son de clic (pas le son de succès)
      feedback.cellClick();
      
      // Mise à jour stats zen (coup correct)
      if (gameModeState.mode === 'zen' && gameModeState.zenStats) {
        const newTotalMoves = gameModeState.zenStats.totalMoves + 1;
        const newPerfectMoves = gameModeState.zenStats.perfectMoves + 1;
        setGameModeState(prev => ({
          ...prev,
          zenStats: prev.zenStats ? {
            ...prev.zenStats,
            perfectMoves: newPerfectMoves,
            totalMoves: newTotalMoves,
            averageAccuracy: Math.round((newPerfectMoves / newTotalMoves) * 100),
          } : undefined,
        }));
      }

      // Séquence complète
      if (newUserSequence.length === gameState.currentSequence.length) {
        // Son de succès UNIQUEMENT quand la séquence complète est réussie
        feedback.correct();
        setGameStatus('correct'); // Seulement à la fin de la séquence
        const basePoints = GAME_CONFIG.POINTS_PER_CORRECT_CELL * gameState.currentSequence.length;
        const levelBonus = GAME_CONFIG.POINTS_PER_LEVEL;
        const modeMultiplier = getScoreMultiplier(gameModeState.mode, gameState.level);
        const totalPoints = Math.floor((basePoints + levelBonus) * modeMultiplier);

        setGameState(prev => ({
          ...prev,
          score: prev.score + totalPoints,
          userSequence: newUserSequence,
        }));

        setTimeout(async () => {
          if (gameState.level < GAME_CONFIG.MAX_LEVEL || gameModeState.mode === 'survival') {
            await nextLevel();
          } else {
            // Victoire (sauf en survival où ça continue indéfiniment)
            setGameState(prev => ({ ...prev, isGameOver: true }));
            setGameStatus('gameover');
            await updateHighScore(gameState.score + totalPoints);
          }
        }, 500);
      } else {
        // Coup correct mais séquence pas terminée - on continue sans changer le statut
        setGameState(prev => ({
          ...prev,
          userSequence: newUserSequence,
        }));
      }
    } else {
      // Mauvaise réponse
      feedback.wrong();
      setGameStatus('wrong');
      
      // Mise à jour stats zen (coup incorrect)
      if (gameModeState.mode === 'zen' && gameModeState.zenStats) {
        const newTotalMoves = gameModeState.zenStats.totalMoves + 1;
        const perfectMoves = gameModeState.zenStats.perfectMoves;
        setGameModeState(prev => ({
          ...prev,
          zenStats: prev.zenStats ? {
            ...prev.zenStats,
            totalMoves: newTotalMoves,
            averageAccuracy: Math.round((perfectMoves / newTotalMoves) * 100),
          } : undefined,
        }));
      }
      
      // En mode Survival, reset le streak mais pas le bestStreak
      if (gameModeState.mode === 'survival' && gameModeState.survivalStats) {
        setGameModeState(prev => ({
          ...prev,
          survivalStats: prev.survivalStats ? {
            ...prev.survivalStats,
            currentStreak: 0, // Reset le streak actuel
          } : undefined,
        }));
      }
      
      const config = getModeConfig(gameModeState.mode);
      
      // En mode zen/survival, pas de perte de vie = on continue
      if (config.settings.hasLives === false) {
        // Reset la séquence actuelle
        setTimeout(() => {
          setGameState(prev => ({
            ...prev,
            userSequence: [],
            isShowingSequence: true,
          }));
          setGameStatus('showing');
        }, 1000);
      } else {
        // Mode avec vies
        const newLives = gameState.lives - 1;
        
        if (newLives <= 0) {
          // Game Over - Jouer le son alertefaill
          feedback.gameOver();
          setGameState(prev => ({
            ...prev,
            lives: 0,
            isGameOver: true,
          }));
          setGameStatus('gameover');
          updateHighScore(gameState.score);
        } else {
          setGameState(prev => ({
            ...prev,
            lives: newLives,
            userSequence: [],
            isShowingSequence: true,
          }));
          setTimeout(() => setGameStatus('showing'), 1000);
        }
      }
    }
  }, [gameState, gameStatus, isPaused, gameModeState, nextLevel]);

  // Pause / Resume
  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  // Terminer l'affichage de la séquence
  const finishShowingSequence = useCallback(() => {
    setGameState(prev => ({ 
      ...prev, 
      isShowingSequence: false,
      isHintReplay: false, // Reset hint replay flag
    }));
    setGameStatus('playing');
  }, []);

  // Utiliser un indice - rejoue la séquence lentement
  const useHint = useCallback(() => {
    if (gameState.hintsRemaining > 0 && gameStatus === 'playing') {
      // En mode TimeAttack, on met en pause le timer pendant l'indice
      const wasTimeAttack = gameModeState.mode === 'timeAttack';
      
      // Décrémente le compteur d'indices et reset la séquence utilisateur
      setGameState(prev => ({
        ...prev,
        hintsRemaining: prev.hintsRemaining - 1,
        userSequence: [], // Reset pour que le joueur puisse réessayer
        isShowingSequence: true, // Rejoue la séquence
        isHintReplay: true, // Marque comme replay d'indice (vitesse lente)
        isPaused: wasTimeAttack, // Pause le jeu en TimeAttack
      }));
      
      if (wasTimeAttack) {
        setIsPaused(true); // Pause explicite pour arrêter le timer
      }
      
      setGameStatus('showing');
      
      // Son de feedback
      feedback.cellClick();
      
      return true; // Indice utilisé avec succès
    }
    return false; // Impossible d'utiliser un indice
  }, [gameState, gameStatus, gameModeState.mode]);

  return {
    gameState,
    gameModeState,
    gameStatus,
    userProgress,
    isPaused,
    startGame,
    nextLevel,
    handleCellClick,
    togglePause,
    finishShowingSequence,
    useHint,
  };
};
