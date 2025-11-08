import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Pressable } from 'react-native';
import { GAME_CONFIG, COLORS } from '../constants/gameConfig';
import { BORDER_RADIUS } from '../constants/designTokens';
import { GameStatus } from '../types';
import { useTheme } from '../context/ThemeContext';

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
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isHighlighted) {
      // Import feedback at top of file will be added
      const playFeedback = async () => {
        const { feedback } = await import('../utils/soundManager');
        await feedback.cellHighlight();
      };
      playFeedback();
      
      // Faster, subtler scale animation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.08,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 80,
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
      return { 
        backgroundColor: colors.cellActive,
        shadowColor: colors.cellActive,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 20,
        elevation: 10,
        borderWidth: 3,
        borderColor: '#ffffff',
      };
    }
    if (gameStatus === 'correct' && isInUserSequence) {
      return { backgroundColor: colors.cellCorrect };
    }
    if (gameStatus === 'wrong' && isInUserSequence) {
      return { backgroundColor: colors.cellIncorrect };
    }
    return { backgroundColor: colors.cellInactive };
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
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.cellDefault,
  },
});
