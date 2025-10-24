import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Pressable } from 'react-native';
import { GAME_CONFIG, COLORS } from '../constants/gameConfig';
import { GameStatus } from '../types';

interface GridCellProps {
  index: number;
  isHighlighted: boolean;
  isInUserSequence: boolean;
  onPress: (index: number) => void;
  gameStatus: GameStatus;
}

const GridCell: React.FC<GridCellProps> = ({ 
  index, 
  isHighlighted, 
  isInUserSequence, 
  onPress,
  gameStatus 
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isHighlighted) {
      // Import feedback at top of file will be added
      const playFeedback = async () => {
        const { feedback } = await import('../utils/soundManager');
        await feedback.cellHighlight();
      };
      playFeedback();
      
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isHighlighted, scaleAnim]);

  const handlePress = async () => {
    const { feedback } = await import('../utils/soundManager');
    await feedback.cellClick();
    onPress(index);
  };

  const getCellStyle = () => {
    if (isHighlighted) {
      return { backgroundColor: COLORS.cellActive };
    }
    if (gameStatus === 'correct' && isInUserSequence) {
      return { backgroundColor: COLORS.cellCorrect };
    }
    if (gameStatus === 'wrong' && isInUserSequence) {
      return { backgroundColor: COLORS.cellWrong };
    }
    return { backgroundColor: COLORS.cellDefault };
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={gameStatus === 'showing' || gameStatus === 'gameover'}
    >
      <Animated.View
        style={[
          styles.cell,
          { transform: [{ scale: scaleAnim }] },
          getCellStyle(),
        ]}
      />
    </Pressable>
  );
};

interface GameGridProps {
  currentSequence: number[];
  userSequence: number[];
  onCellPress: (index: number) => void;
  isShowingSequence: boolean;
  gameStatus: GameStatus;
  highlightedCell: number | null;
}

export const GameGrid: React.FC<GameGridProps> = ({
  currentSequence,
  userSequence,
  onCellPress,
  gameStatus,
  highlightedCell,
}) => {
  const gridSize = GAME_CONFIG.GRID_SIZE;
  const cells = Array.from({ length: gridSize * gridSize }, (_, i) => i);

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {cells.map((cellIndex) => (
          <GridCell
            key={cellIndex}
            index={cellIndex}
            isHighlighted={highlightedCell === cellIndex}
            isInUserSequence={userSequence.includes(cellIndex)}
            onPress={onCellPress}
            gameStatus={gameStatus}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: GAME_CONFIG.GRID_SIZE * (GAME_CONFIG.CELL_SIZE + GAME_CONFIG.CELL_GAP),
    gap: GAME_CONFIG.CELL_GAP,
  },
  cell: {
    width: GAME_CONFIG.CELL_SIZE,
    height: GAME_CONFIG.CELL_SIZE,
    borderRadius: 10,
    backgroundColor: COLORS.cellDefault,
  },
});
