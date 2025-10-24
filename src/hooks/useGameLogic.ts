import { useState, useCallback, useEffect } from 'react';
import { GameState, GameStatus, UserProgress } from '../types';
import { GAME_CONFIG } from '../constants/gameConfig';
import { GameEngine } from '../utils/GameEngine';
import { 
  loadUserProgress, 
  updateHighScore, 
  updateMaxLevel, 
  incrementGamesPlayed,
  initializeUserProgress 
} from '../utils/storage';

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
  });

  const [gameStatus, setGameStatus] = useState<GameStatus>('idle');
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);

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
    if (gameState.isShowingSequence || gameState.isGameOver || gameStatus !== 'playing') {
      return;
    }

    const newUserSequence = [...gameState.userSequence, cellIndex];
    
    // Check if this click is correct so far
    if (!GameEngine.isPartialSequenceCorrect(newUserSequence, gameState.currentSequence)) {
      // Wrong! Lose a life
      const newLives = gameState.lives - 1;
      
      if (newLives <= 0) {
        setGameState(prev => ({ ...prev, lives: 0, isGameOver: true, userSequence: newUserSequence }));
        setGameStatus('gameover');
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
      
      // Update high score if needed
      updateHighScore(newTotalScore).then(async () => {
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
        } else {
          nextLevel();
        }
      }, GAME_CONFIG.FEEDBACK_DURATION);
    } else {
      // Correct so far, continue
      setGameState(prev => ({ ...prev, userSequence: newUserSequence }));
    }
  }, [gameState, gameStatus, nextLevel]);

  // Finish showing sequence
  const finishShowingSequence = useCallback(() => {
    setGameState(prev => ({ ...prev, isShowingSequence: false }));
    setGameStatus('playing');
  }, []);

  // Reset game
  const resetGame = useCallback(() => {
    startGame();
  }, [startGame]);

  return {
    gameState,
    gameStatus,
    userProgress,
    startGame,
    handleCellClick,
    finishShowingSequence,
    resetGame,
  };
};
