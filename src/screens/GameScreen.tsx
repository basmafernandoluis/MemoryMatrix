import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GameHeader } from '../components/GameHeader';
import { GameGrid } from '../components/GameGrid';
import { StatusMessage } from '../components/StatusMessage';
import { PauseModal } from '../components/PauseModal';
import { useGameLogic } from '../hooks/useGameLogic';
import { GAME_CONFIG, COLORS } from '../constants/gameConfig';
import { UserProgress } from '../types';
import { feedback } from '../utils/soundManager';

interface GameScreenProps {
  onGameOver: (score: number, level: number, progress: UserProgress | null) => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({ onGameOver }) => {
  const {
    gameState,
    gameStatus,
    userProgress,
    isPaused,
    startGame,
    handleCellClick,
    finishShowingSequence,
    pauseGame,
    resumeGame,
  } = useGameLogic();

  const [highlightedCell, setHighlightedCell] = useState<number | null>(null);
  const [showPauseModal, setShowPauseModal] = useState(false);

  // Start game on mount
  useEffect(() => {
    startGame();
  }, []);

  // Handle game over
  useEffect(() => {
    if (gameState.isGameOver && gameStatus === 'gameover') {
      setTimeout(() => {
        onGameOver(gameState.score, gameState.level, userProgress);
      }, 1500);
    }
  }, [gameState.isGameOver, gameStatus, gameState.score, gameState.level, userProgress, onGameOver]);

  const handlePausePress = async () => {
    await feedback.buttonPress();
    pauseGame();
    setShowPauseModal(true);
  };

  const handleResume = () => {
    setShowPauseModal(false);
    resumeGame();
  };

  const handleQuit = () => {
    setShowPauseModal(false);
    onGameOver(gameState.score, gameState.level, userProgress);
  };

  // Show sequence animation
  useEffect(() => {
    if (gameState.isShowingSequence && gameStatus === 'showing') {
      let currentIndex = 0;
      const sequence = gameState.currentSequence;

      const showNextCell = () => {
        if (currentIndex >= sequence.length) {
          setHighlightedCell(null);
          finishShowingSequence();
          return;
        }

        setHighlightedCell(sequence[currentIndex]);
        
        setTimeout(() => {
          setHighlightedCell(null);
          currentIndex++;
          setTimeout(showNextCell, GAME_CONFIG.DELAY_BETWEEN_CELLS);
        }, GAME_CONFIG.CELL_HIGHLIGHT_DURATION);
      };

      // Start showing sequence after a brief delay
      const timer = setTimeout(showNextCell, 500);
      return () => clearTimeout(timer);
    }
  }, [gameState.isShowingSequence, gameState.currentSequence, gameStatus, finishShowingSequence]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <GameHeader
            level={gameState.level}
            score={gameState.score}
            lives={gameState.lives}
            userProgress={userProgress}
          />
          
          <Pressable
            style={({ pressed }) => [
              styles.pauseButton,
              (gameState.isShowingSequence || gameState.isGameOver) && styles.pauseButtonDisabled,
              pressed && !gameState.isShowingSequence && !gameState.isGameOver && styles.pauseButtonPressed,
            ]}
            onPress={handlePausePress}
            disabled={gameState.isShowingSequence || gameState.isGameOver}
          >
            <Text style={styles.pauseButtonText}>⏸️</Text>
          </Pressable>
        </View>
        
        <StatusMessage
          gameStatus={gameStatus}
          isShowingSequence={gameState.isShowingSequence}
          sequenceLength={gameState.currentSequence.length}
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
    padding: 15,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  pauseButton: {
    backgroundColor: COLORS.surface,
    width: 45,
    height: 45,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  pauseButtonDisabled: {
    opacity: 0.3,
    borderColor: COLORS.textSecondary,
  },
  pauseButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  pauseButtonText: {
    fontSize: 20,
  },
});
