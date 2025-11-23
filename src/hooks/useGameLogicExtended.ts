/**
 * Extended Game Logic Hook with Multi-Mode Support
 * Gère tous les modes de jeu: Classic, Survival, TimeAttack, Zen, Custom
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, GameStatus, UserProgress, GameMode, SurvivalStats, TimeAttackStats, ZenStats, FocusChallengeStats } from '../types';
import { GAME_CONFIG } from '../constants/gameConfig';
import { GameEngine } from '../utils/GameEngine';

// Types for Focus Challenge
export type ShapeType = 'circle' | 'square' | 'triangle' | 'diamond' | 'hexagon' | 'star';
export type ColorType = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';
export type CellData =
  | { type: 'shape'; shape: ShapeType; color: ColorType }
  | { type: 'char'; char: string; color: ColorType };
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
import { firestoreService } from '../services/firestore';
import { firebaseService } from '../services/firebase';
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
  focusChallengeStats?: FocusChallengeStats;
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
    combo: 0,
  });

  const [shouldShowContinueModal, setShouldShowContinueModal] = useState(false);

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
    focusChallengeStats: initialMode === 'focusChallenge' ? {
      distractionLevel: 1,
      complexityLevel: 1,
      dualTaskActive: false,
      perfectFocus: 0,
      totalDistractions: 0,
    } : undefined,
  });

  const [gameStatus, setGameStatus] = useState<GameStatus>('idle');
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Focus Challenge state
  const [cellData, setCellData] = useState<CellData[]>([]);
  const [movingCells, setMovingCells] = useState<number[]>([]);

  // Timer pour le mode contre-la-montre
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Helper function to generate cell data for Focus Challenge
  const generateCellData = useCallback((gridSize: number, level: number): CellData[] => {
    const shapes: ShapeType[] = ['circle', 'square', 'triangle', 'diamond', 'hexagon', 'star'];
    const colors: ColorType[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
    const totalCells = gridSize * gridSize;
    const digits = ['0','1','2','3','4','5','6','7','8','9'];
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    // Introduire progressivement chiffres/lettres à partir des niveaux avancés
    // Probabilité de contenu alphanumérique augmente avec le niveau, max 60%
    const alphaProb = Math.max(0, Math.min(0.6, (level - 7) * 0.1)); // lvl<=7: 0, lvl14+: 0.6

    return Array.from({ length: totalCells }, () => {
      const useAlpha = Math.random() < alphaProb;
      const color = colors[Math.floor(Math.random() * colors.length)];
      if (useAlpha) {
        const pool = Math.random() < 0.5 ? digits : letters;
        const char = pool[Math.floor(Math.random() * pool.length)];
        return { type: 'char', char, color } as CellData;
      }
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      return { type: 'shape', shape, color } as CellData;
    });
  }, []);

  // Helper function to generate moving cells for Focus Challenge
  const generateMovingCells = useCallback((level: number, totalCells: number): number[] => {
    const numMoving = Math.min(Math.floor(level / 2) + 1, 5); // 1-5 moving cells
    const moving: number[] = [];
    while (moving.length < numMoving) {
      const randomCell = Math.floor(Math.random() * totalCells);
      if (!moving.includes(randomCell)) {
        moving.push(randomCell);
      }
    }
    return moving;
  }, []);

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
            
            // Sauvegarder le meilleur score TimeAttack
            (async () => {
              const currentUser = firebaseService.getCurrentUser();
              if (currentUser) {
                await updateHighScore(gameState.score);
                await firestoreService.updateModeRecords(currentUser.uid, {
                  timeAttackBestScore: gameState.score,
                });
              }
            })();
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
    // Déterminer la taille de grille utilisée pour générer des indices valides
    const gridSizeForMode = mode === 'focusChallenge'
      ? Math.min(startLevel + 1, 5) // En Focus Challenge, cap à 5x5
      : GAME_CONFIG.GRID_SIZE; // Autres modes: grille fixe par défaut

    // Générer une séquence avec des indices compatibles avec la grille du mode
    const sequence = GameEngine.generateSequence(startLevel, gridSizeForMode);

    // Déterminer le nombre de vies selon le mode
    let initialLives = 5; // Par défaut : 5 vies (Classic)
    if (config.settings.hasLives === false) {
      initialLives = 999; // Vie infinie (Zen, Survival, TimeAttack)
    }

    // Generate cell data and moving cells for Focus Challenge
    if (mode === 'focusChallenge') {
      const gridSize = gridSizeForMode;
      const totalCells = gridSize * gridSize;
      setCellData(generateCellData(gridSize, startLevel));
      setMovingCells(generateMovingCells(startLevel, totalCells));
    } else {
      setCellData([]);
      setMovingCells([]);
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
      combo: 0,
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
      focusChallengeStats: mode === 'focusChallenge' ? {
        distractionLevel: 1,
        complexityLevel: 1,
        dualTaskActive: false,
        perfectFocus: 0,
        totalDistractions: 0,
      } : undefined,
    });

    setGameStatus('showing');
    
    await incrementGamesPlayed();
    const progress = await loadUserProgress();
    if (progress) {
      setUserProgress(progress);
    }
  }, [generateCellData, generateMovingCells]);

  // Passer au niveau suivant
  const nextLevel = useCallback(async () => {
    const newLevel = gameState.level + 1;
    const config = getModeConfig(gameModeState.mode);
    
    // Déterminer la taille de grille selon le mode
    let gridSize = GAME_CONFIG.GRID_SIZE; // Par défaut : grille fixe 4x4
    
    if (gameModeState.mode === 'survival') {
      // En mode survie, la taille de grille augmente
      gridSize = getSurvivalDifficultyIncrease(newLevel);
    } else if (gameModeState.mode === 'focusChallenge') {
      // En Focus Challenge, grille augmente avec le niveau (cap à 5x5)
      gridSize = Math.min(newLevel + 1, 5);
    }
    // Autres modes (classic, zen, timeAttack) : garder gridSize = 4
    
  // Générer la séquence avec le bon niveau ET la bonne taille de grille
  const sequence = GameEngine.generateSequence(newLevel, gridSize);
    
    // Generate cell data and moving cells for Focus Challenge
    if (gameModeState.mode === 'focusChallenge') {
      const totalCells = gridSize * gridSize;
      setCellData(generateCellData(gridSize, newLevel));
      setMovingCells(generateMovingCells(newLevel, totalCells));
    }
    
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
      
      // Sauvegarder le nouveau record (local + Firestore)
      if (newBest > gameModeState.survivalStats.bestStreak) {
        await updateSurvivalBestStreak(newBest);
        // Sauvegarder dans Firestore aussi
        const currentUser = firebaseService.getCurrentUser();
        if (currentUser) {
          await firestoreService.updateModeRecords(currentUser.uid, {
            survivalBestStreak: newBest,
          });
        }
      }
    }
    
    setGameState(prev => ({
      ...prev,
      level: newLevel,
      currentSequence: sequence,
      userSequence: [],
      isShowingSequence: true,
      // Keep combo when advancing to next level
    }));
    setGameStatus('showing');
    
    await updateMaxLevel(newLevel);
    const progress = await loadUserProgress();
    if (progress) {
      setUserProgress(progress);
    }
  }, [gameState.level, gameModeState.mode, gameModeState.survivalStats, gameModeState.timeAttackStats, generateCellData, generateMovingCells]);

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
          combo: prev.combo + 1,
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
          combo: prev.combo + 1,
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
            combo: 0,
          }));
          setGameStatus('showing');
        }, 1000);
      } else {
        // Mode avec vies
        const newLives = gameState.lives - 1;
        
        if (newLives <= 0) {
          // Au lieu de Game Over direct, afficher le modal de continuation
          setShouldShowContinueModal(true);
          setGameState(prev => ({
            ...prev,
            lives: 0,
            combo: 0,
            // NE PAS mettre isGameOver à true encore
          }));
          // Le game over sera déclenché si le joueur refuse la pub
        } else {
          setTimeout(() => {
            setGameState(prev => ({
              ...prev,
              lives: newLives,
              userSequence: [],
              isShowingSequence: true,
              combo: 0,
            }));
            setGameStatus('showing');
          }, 1000);
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

  // Continuer après game over (rewarded ad)
  const continueGame = useCallback(() => {
    if (gameState.isGameOver) {
      // Redonne une vie et continue la partie au même niveau avec le même score
      // IMPORTANT: On va REJOUER la séquence actuelle (pas recommencer au niveau 1)
      setGameState(prev => ({
        ...prev,
        lives: 1, // Redonne une vie
        isGameOver: false,
        userSequence: [], // Reset uniquement la séquence utilisateur
        isShowingSequence: true, // Va rejouer la séquence actuelle
        // GARDE le score, le niveau, et la currentSequence
      }));
      setGameStatus('showing');
      
      // Son de récompense (coins)
      feedback.reward();
      
      return true;
    }
    return false;
  }, [gameState.isGameOver]);

  // Ajouter une vie (bonus via rewarded ad)
  const addLife = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      lives: prev.lives + 1,
    }));
    // Son joué avec délai depuis le composant appelant
  }, []);

  // Ajouter un indice (bonus via rewarded ad)
  const addHint = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      hintsRemaining: prev.hintsRemaining + 1,
    }));
    // Son joué avec délai depuis le composant appelant
  }, []);

  // Gérer le refus de continuer (aller au game over)
  const declineContinue = useCallback(() => {
    setShouldShowContinueModal(false);
    feedback.gameOver();
    setGameState(prev => ({
      ...prev,
      isGameOver: true,
    }));
    setGameStatus('gameover');
    updateHighScore(gameState.score);
  }, [gameState.score]);

  // Gérer l'acceptation de continuer (après avoir vu la pub)
  const acceptContinue = useCallback(() => {
    setShouldShowContinueModal(false);
    // Redonne une vie et rejoue la séquence
    setGameState(prev => ({
      ...prev,
      lives: 1,
      userSequence: [],
      isShowingSequence: true,
    }));
    setGameStatus('showing');
    
    // Jouer le son après un court délai pour s'assurer que l'app est au premier plan
    setTimeout(() => {
      feedback.reward();
    }, 300);
  }, []);

  return {
    gameState,
    gameModeState,
    gameStatus,
    userProgress,
    isPaused,
    shouldShowContinueModal,
    startGame,
    nextLevel,
    handleCellClick,
    togglePause,
    finishShowingSequence,
    useHint,
    continueGame, // Nouvelle fonction pour continuer après game over
    addLife, // Ajouter une vie (bonus)
    addHint, // Ajouter un indice (bonus)
    declineContinue, // Refuser de continuer -> Game Over
    acceptContinue, // Accepter de continuer -> Regarder pub
    // Focus Challenge data
    cellData,
    movingCells,
    distractionLevel: Math.min(gameState.level, 10), // 1-10 based on level
  };
};
