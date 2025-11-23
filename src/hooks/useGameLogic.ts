import { useState, useCallback, useEffect } from 'react';
import { GameState, GameStatus, UserProgress } from '../types';
import { GAME_CONFIG } from '../constants/gameConfig';
import { GameEngine } from '../utils/GameEngine';
import { 
  loadUserProgress, 
  updateHighScore, 
  updateMaxLevel, 
  incrementGamesPlayed,
  initializeUserProgress,
  updateDailyChallengeProgress
} from '../utils/storage';
import { feedback } from '../utils/soundManager';

export const useGameLogic = () => {
  const [gameState, setGameState] = useState<GameState>({
    level: GAME_CONFIG.INITIAL_LEVEL,
    score: 0,
    lives: GAME_CONFIG.INITIAL_LIVES,
    currentSequence: [],
    userSequence: [],
    isShowingSequence: false,
    isGameOver: false,
    isPaused: false,
    hintsRemaining: 3, // 3 astuces par partie
    isHintReplay: false, // Pas de replay hint au départ
    combo: 0,
  });

  const [gameStatus, setGameStatus] = useState<GameStatus>('idle');
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Load user progress on mount
  useEffect(() => {
    const loadProgress = async () => {
      const progress = await initializeUserProgress();
      setUserProgress(progress);
    };
    loadProgress();
  }, []);

  // Start a new game
  const startGame = useCallback(async () => {
    const sequence = GameEngine.generateSequence(GAME_CONFIG.INITIAL_LEVEL);
    setGameState({
      level: GAME_CONFIG.INITIAL_LEVEL,
      score: 0,
      lives: GAME_CONFIG.INITIAL_LIVES,
      currentSequence: sequence,
      userSequence: [],
      isShowingSequence: true,
      isGameOver: false,
      isPaused: false,
      hintsRemaining: 3, // Reset hints at start
      isHintReplay: false,
      combo: 0,
    });
    setGameStatus('showing');
    
    // Increment games played
    await incrementGamesPlayed();
    
    // Reload progress to show updated count
    const progress = await loadUserProgress();
    if (progress) {
      setUserProgress(progress);
    }
  }, []);

  // Start next level
  const nextLevel = useCallback(async () => {
    const newLevel = gameState.level + 1;
    const sequence = GameEngine.generateSequence(newLevel);
    
    setGameState(prev => ({
      ...prev,
      level: newLevel,
      currentSequence: sequence,
      userSequence: [],
      isShowingSequence: true,
    }));
    setGameStatus('showing');
    
    // Update max level reached
    await updateMaxLevel(newLevel);
    
    // Reload progress
    const progress = await loadUserProgress();
    if (progress) {
      setUserProgress(progress);
    }
  }, [gameState.level]);

  // Handle user cell click
  const handleCellClick = useCallback((cellIndex: number) => {
    if (gameState.isShowingSequence || gameState.isGameOver || gameStatus !== 'playing' || isPaused) {
      return;
    }

    const newUserSequence = [...gameState.userSequence, cellIndex];
    
    // Check if this click is correct so far
    if (!GameEngine.isPartialSequenceCorrect(newUserSequence, gameState.currentSequence)) {
      // Wrong! Lose a life
      const newLives = gameState.lives - 1;
      feedback.wrong();
      
      if (newLives <= 0) {
        setGameState(prev => ({ ...prev, lives: 0, isGameOver: true, userSequence: newUserSequence }));
        setGameStatus('gameover');
        setTimeout(() => feedback.gameOver(), 500);
      } else {
        setGameState(prev => ({ ...prev, lives: newLives, userSequence: [] }));
        setGameStatus('wrong');
        
        // Reset after feedback
        setTimeout(() => {
          setGameState(prev => ({ ...prev, isShowingSequence: true }));
          setGameStatus('showing');
        }, GAME_CONFIG.FEEDBACK_DURATION);
      }
      return;
    }

    // Check if sequence is complete
    if (newUserSequence.length === gameState.currentSequence.length) {
      // Correct! Level complete
      const levelScore = GameEngine.calculateLevelScore(gameState.level);
      const newTotalScore = gameState.score + levelScore;
      
      setGameState(prev => ({
        ...prev,
        score: newTotalScore,
        userSequence: newUserSequence,
      }));
      setGameStatus('correct');
      feedback.correct();
      
      // Update high score and daily challenge
      updateHighScore(newTotalScore).then(async () => {
        await updateDailyChallengeProgress(newTotalScore);
        const progress = await loadUserProgress();
        if (progress) {
          setUserProgress(progress);
        }
      });
      
      // Move to next level after feedback
      setTimeout(() => {
        if (gameState.level >= GAME_CONFIG.MAX_LEVEL) {
          setGameState(prev => ({ ...prev, isGameOver: true }));
          setGameStatus('gameover');
          feedback.gameOver();
        } else {
          feedback.levelUp();
          nextLevel();
        }
      }, GAME_CONFIG.FEEDBACK_DURATION);
    } else {
      // Correct so far, continue
      setGameState(prev => ({ ...prev, userSequence: newUserSequence }));
    }
  }, [gameState, gameStatus, nextLevel, isPaused]);

  // Pause/Resume functions
  const pauseGame = useCallback(() => {
    if (!gameState.isGameOver && !gameState.isShowingSequence) {
      setIsPaused(true);
      setGameState(prev => ({ ...prev, isPaused: true }));
    }
  }, [gameState.isGameOver, gameState.isShowingSequence]);

  const resumeGame = useCallback(() => {
    setIsPaused(false);
    setGameState(prev => ({ ...prev, isPaused: false }));
  }, []);

  // Finish showing sequence
  const finishShowingSequence = useCallback(() => {
    setGameState(prev => ({ 
      ...prev, 
      isShowingSequence: false,
      isHintReplay: false, // Reset hint replay flag
    }));
    setGameStatus('playing');
  }, []);

  // Use a hint - replays the sequence slowly
  const useHint = useCallback(() => {
    if (gameState.hintsRemaining > 0 && gameStatus === 'playing') {
      // Decrement hint counter and reset user sequence to replay
      setGameState(prev => ({
        ...prev,
        hintsRemaining: prev.hintsRemaining - 1,
        userSequence: [], // Reset so player can try again
        isShowingSequence: true, // Show sequence again
        isHintReplay: true, // Mark as hint replay for slower speed
      }));
      
      setGameStatus('showing');
      
      // Play feedback
      feedback.cellClick();
      
      return true; // Hint used successfully
    }
    return false; // Cannot use hint
  }, [gameState, gameStatus]);

  // Reset game
  const resetGame = useCallback(() => {
    startGame();
  }, [startGame]);

  return {
    gameState,
    gameStatus,
    userProgress,
    isPaused,
    startGame,
    handleCellClick,
    finishShowingSequence,
    resetGame,
    pauseGame,
    resumeGame,
    useHint,
  };
};
