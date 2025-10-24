import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GameHeader } from '../components/GameHeader';
import { GameGrid } from '../components/GameGrid';
import { useGameLogic } from '../hooks/useGameLogic';
import { GAME_CONFIG, COLORS } from '../constants/gameConfig';

export const GameScreen: React.FC = () => {
  const {
    gameState,
    gameStatus,
    userProgress,
    startGame,
    handleCellClick,
    finishShowingSequence,
  } = useGameLogic();

  const [highlightedCell, setHighlightedCell] = useState<number | null>(null);

  // Start game on mount
  useEffect(() => {
    startGame();
  }, []);

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
        <GameHeader
          level={gameState.level}
          score={gameState.score}
          lives={gameState.lives}
          userProgress={userProgress}
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
    padding: 20,
    justifyContent: 'center',
  },
});
