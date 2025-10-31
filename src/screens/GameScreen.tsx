import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GameHeader } from '../components/GameHeader';
import { GameGrid } from '../components/GameGrid';
import { StatusMessage } from '../components/StatusMessage';
import { PauseModal } from '../components/PauseModal';
import { useGameLogicExtended } from '../hooks/useGameLogicExtended';
import { useChallengeTracking } from '../hooks/useChallengeTracking';
import { GAME_CONFIG, COLORS } from '../constants/gameConfig';
import { SPACING, BORDER_RADIUS } from '../constants/designTokens';
import { UserProgress, GameMode } from '../types';
import { feedback } from '../utils/soundManager';

interface GameScreenProps {
  onGameOver: (score: number, level: number) => void;
  userId: string | null;
  userProgress?: UserProgress | null;
  mode?: GameMode;
}

export const GameScreen: React.FC<GameScreenProps> = ({ 
  onGameOver, 
  userId, 
  userProgress: externalUserProgress,
  mode = 'classic'
}) => {
  const {
    gameState,
    gameModeState,
    gameStatus,
    userProgress,
    isPaused,
    startGame,
    handleCellClick,
    togglePause,
    finishShowingSequence,
    useHint,
  } = useGameLogicExtended(mode);

  // Challenge tracking hook
  const challengeTracking = useChallengeTracking(userId);

  const [highlightedCell, setHighlightedCell] = useState<number | null>(null);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [previousLevel, setPreviousLevel] = useState(1);
  const [previousScore, setPreviousScore] = useState(0);

  // Start game on mount
  useEffect(() => {
    startGame(mode);
    challengeTracking.resetGameStats();
  }, [mode]);

  // Track level changes
  useEffect(() => {
    if (gameState.level !== previousLevel) {
      challengeTracking.updateLevel(gameState.level);
      setPreviousLevel(gameState.level);
    }
  }, [gameState.level]);

  // Track score changes
  useEffect(() => {
    if (gameState.score !== previousScore) {
      challengeTracking.updateScore(gameState.score);
      setPreviousScore(gameState.score);
    }
  }, [gameState.score]);

  // Track lives changes
  useEffect(() => {
    challengeTracking.updateLives(gameState.lives);
  }, [gameState.lives]);

  // Handle game over
  useEffect(() => {
    if (gameState.isGameOver && gameStatus === 'gameover') {
      challengeTracking.finalizeGame();
      setTimeout(() => {
        onGameOver(gameState.score, gameState.level);
      }, 1500);
    }
  }, [gameState.isGameOver, gameStatus, gameState.score, gameState.level, onGameOver]);

  const handlePausePress = async () => {
    await feedback.buttonPress();
    togglePause();
    setShowPauseModal(true);
  };

  const handleResume = () => {
    setShowPauseModal(false);
    togglePause();
  };

  const handleQuit = () => {
    setShowPauseModal(false);
    onGameOver(gameState.score, gameState.level);
  };

  const handleHintPress = async () => {
    await feedback.buttonPress();
    const hintUsed = useHint();
    if (!hintUsed) {
      // Optionnel: feedback si l'indice ne peut pas être utilisé
      await feedback.wrong();
    }
  };

  // Show sequence animation
  useEffect(() => {
    if (gameState.isShowingSequence && gameStatus === 'showing') {
      let currentIndex = 0;
      const sequence = gameState.currentSequence;
      
      // Slower timing for hint replays
      const highlightDuration = gameState.isHintReplay 
        ? GAME_CONFIG.CELL_HIGHLIGHT_DURATION * 1.5 
        : GAME_CONFIG.CELL_HIGHLIGHT_DURATION;
      const delayBetweenCells = gameState.isHintReplay 
        ? GAME_CONFIG.DELAY_BETWEEN_CELLS * 1.5 
        : GAME_CONFIG.DELAY_BETWEEN_CELLS;

      const showNextCell = () => {
        if (currentIndex >= sequence.length) {
          setHighlightedCell(null);
          finishShowingSequence();
          
          // En mode TimeAttack, si c'était un hint replay, on relance le timer
          if (gameState.isHintReplay && mode === 'timeAttack') {
            togglePause(); // Unpause pour relancer le timer
          }
          
          return;
        }

        setHighlightedCell(sequence[currentIndex]);
        
        setTimeout(() => {
          setHighlightedCell(null);
          currentIndex++;
          setTimeout(showNextCell, delayBetweenCells);
        }, highlightDuration);
      };

      // Start showing sequence after a brief delay
      const timer = setTimeout(showNextCell, 500);
      return () => clearTimeout(timer);
    }
  }, [gameState.isShowingSequence, gameState.currentSequence, gameStatus, finishShowingSequence]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <GameHeader
          level={gameState.level}
          score={gameState.score}
          lives={gameState.lives}
          userProgress={userProgress}
          onPausePress={handlePausePress}
          isPauseDisabled={gameState.isShowingSequence || gameState.isGameOver}
          onHintPress={handleHintPress}
          hintsRemaining={gameState.hintsRemaining}
          isHintDisabled={gameState.isShowingSequence || gameState.isGameOver || gameState.hintsRemaining === 0}
          hideHearts={mode === 'zen' || mode === 'survival' || mode === 'timeAttack'}
        />

        {/* Mode-specific stats */}
        {mode === 'timeAttack' && gameModeState.timeAttackStats && (
          <View style={styles.modeStats}>
            <Text style={styles.modeStatsText}>
              ⏱️ Temps: {Math.floor(gameModeState.timeAttackStats.timeRemaining)}s
            </Text>
          </View>
        )}
        {mode === 'survival' && gameModeState.survivalStats && (
          <View style={styles.modeStats}>
            <Text style={styles.modeStatsText}>
              🔥 Série: {gameModeState.survivalStats.currentStreak} (Record: {gameModeState.survivalStats.bestStreak})
            </Text>
          </View>
        )}
        {mode === 'zen' && gameModeState.zenStats && (
          <View style={styles.modeStats}>
            <Text style={styles.modeStatsText}>
              ✨ Précision: {Math.round(gameModeState.zenStats.averageAccuracy)}%
            </Text>
          </View>
        )}
        
        <StatusMessage
          gameStatus={gameStatus}
          isShowingSequence={gameState.isShowingSequence}
          sequenceLength={gameState.currentSequence.length}
          level={gameState.level}
        />
        
        <GameGrid
          currentSequence={gameState.currentSequence}
          userSequence={gameState.userSequence}
          onCellPress={handleCellClick}
          isShowingSequence={gameState.isShowingSequence}
          gameStatus={gameStatus}
          highlightedCell={highlightedCell}
        />
      </View>
      
      <PauseModal
        visible={showPauseModal}
        onResume={handleResume}
        onQuit={handleQuit}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
    justifyContent: 'center',
  },
  modeStats: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  modeStatsText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
