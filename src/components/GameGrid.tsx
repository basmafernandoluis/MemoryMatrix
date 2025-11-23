import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Pressable, Easing } from 'react-native';
import { GAME_CONFIG, COLORS } from '../constants/gameConfig';
import { BORDER_RADIUS } from '../constants/designTokens';
import { GameStatus } from '../types';
import { useTheme } from '../context/ThemeContext';
import { ClickParticles, ClickParticlesRef } from './ClickParticles';

interface GridCellProps {
  index: number;
  isHighlighted: boolean;
  isInUserSequence: boolean;
  onPress: (index: number) => void;
  gameStatus: GameStatus;
  currentStep: number;
}

const GridCell: React.FC<GridCellProps> = ({ 
  index, 
  isHighlighted, 
  isInUserSequence, 
  onPress,
  gameStatus,
  currentStep
}) => {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const breathAnim = useRef(new Animated.Value(1)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const juiceAnim = useRef(new Animated.Value(1)).current;
  const particleRef = useRef<ClickParticlesRef>(null);

  // Breathing animation for inactive cells
  useEffect(() => {
    if (!isHighlighted && gameStatus === 'playing') {
      const randomDelay = Math.random() * 1000;
      
      const breathe = Animated.loop(
        Animated.sequence([
          Animated.delay(randomDelay),
          Animated.timing(breathAnim, {
            toValue: 1.02,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(breathAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      breathe.start();
      return () => breathe.stop();
    } else {
      breathAnim.setValue(1);
    }
  }, [gameStatus, isHighlighted]);

  const handlePressIn = () => {
    Animated.spring(pressAnim, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    if (isHighlighted) {
      // Import feedback at top of file will be added
      const playFeedback = async () => {
        const { feedback } = await import('../utils/soundManager');
        await feedback.cellHighlight();
      };
      playFeedback();
      
      // Glow animation
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: false, // color interpolation doesn't support native driver
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();

      // Faster, subtler scale animation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.15,
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

  // Shake animation on wrong answer
  useEffect(() => {
    if (gameStatus === 'wrong' && isInUserSequence) {
      // Reset shake first
      shakeAnim.setValue(0);
      
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    } else {
      shakeAnim.setValue(0);
    }
  }, [gameStatus, isInUserSequence, shakeAnim]);

  // Juice animation on correct answer
  useEffect(() => {
    if (gameStatus === 'correct' && isInUserSequence) {
      // Reset juice first
      juiceAnim.setValue(1);
      
      // Trigger particles with intensity
      particleRef.current?.trigger(
        GAME_CONFIG.CELL_SIZE / 2, 
        GAME_CONFIG.CELL_SIZE / 2, 
        colors.cellCorrect,
        'large',
        'star'
      );

      // Bounce juice effect
      Animated.sequence([
        Animated.spring(juiceAnim, { 
          toValue: 1.15, 
          friction: 3,
          tension: 200,
          useNativeDriver: true 
        }),
        Animated.spring(juiceAnim, { 
          toValue: 1, 
          friction: 4,
          tension: 100,
          useNativeDriver: true 
        }),
      ]).start();
    } else {
      juiceAnim.setValue(1);
    }
  }, [gameStatus, isInUserSequence, juiceAnim, colors.cellCorrect]);

  const handlePress = async () => {
    // Always trigger particles on click (regardless of correctness)
    particleRef.current?.trigger(
      GAME_CONFIG.CELL_SIZE / 2, 
      GAME_CONFIG.CELL_SIZE / 2, 
      colors.primary,
      'medium'
    );
    
    onPress(index);
  };

  const getCellStyle = () => {
    const baseStyle: any = {
      backgroundColor: colors.cellInactive,
      borderColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1,
      borderBottomWidth: 4, // 3D effect
      borderRightWidth: 1,
      borderBottomColor: 'rgba(0,0,0,0.3)',
    };

    if (isHighlighted) {
      return { 
        ...baseStyle,
        backgroundColor: colors.cellActive,
        borderColor: '#fff',
        borderWidth: 2,
        borderBottomWidth: 4,
        borderBottomColor: 'rgba(0,0,0,0.2)',
        shadowColor: colors.cellActive,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 15,
        elevation: 10,
        zIndex: 10,
      };
    }
    if (gameStatus === 'correct' && isInUserSequence) {
      return { 
        ...baseStyle,
        backgroundColor: colors.cellCorrect,
        borderBottomColor: 'rgba(0,0,0,0.2)',
      };
    }
    if (gameStatus === 'wrong' && isInUserSequence) {
      return { 
        ...baseStyle,
        backgroundColor: colors.cellIncorrect,
        borderBottomColor: 'rgba(0,0,0,0.2)',
      };
    }
    return { 
      ...baseStyle,
      backgroundColor: colors.cellInactive 
    };
  };

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={gameStatus === 'showing' || gameStatus === 'gameover'}
    >
      <Animated.View
        style={[
          styles.cellContainer,
          { 
            transform: [
              { translateX: shakeAnim },
              { scale: isHighlighted ? scaleAnim : Animated.multiply(Animated.multiply(breathAnim, pressAnim), juiceAnim) }
            ] 
          }
        ]}
      >
        <View style={[styles.cellContent, getCellStyle()]}>
          {/* Inner highlight for 3D effect */}
          <View style={styles.innerHighlight} />
        </View>
        <ClickParticles ref={particleRef} />
      </Animated.View>
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
            currentStep={userSequence.length}
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
  cellContainer: {
    width: GAME_CONFIG.CELL_SIZE,
    height: GAME_CONFIG.CELL_SIZE,
    // No overflow hidden here to allow particles to fly out
    zIndex: 1,
  },
  cellContent: {
    width: '100%',
    height: '100%',
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden', // Ensure inner highlight stays inside
  },
  innerHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderTopLeftRadius: BORDER_RADIUS.md,
    borderTopRightRadius: BORDER_RADIUS.md,
  },
});
