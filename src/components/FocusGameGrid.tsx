/**
 * Focus Challenge Game Grid Component
 * Grille spéciale avec formes géométriques complexes, couleurs+formes, animations
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Pressable, Animated, Dimensions, Text } from 'react-native';
import { SPACING } from '../constants/designTokens';
import { useTheme } from '../context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Définition des formes géométriques
export type ShapeType = 'circle' | 'square' | 'triangle' | 'diamond' | 'hexagon' | 'star';
export type ColorType = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';

type CellData =
  | { type: 'shape'; shape: ShapeType; color: ColorType }
  | { type: 'char'; char: string; color: ColorType };

interface FocusGameGridProps {
  gridSize: number;
  onCellPress: (index: number) => void;
  highlightedCell: number | null;
  correctCells: number[];
  wrongCell: number | null;
  isDisabled?: boolean;
  cellData: CellData[]; // Combinaison forme + couleur
  movingCells?: number[]; // Cellules qui bougent (distraction)
  distractionLevel?: number; // Niveau de distraction (0-10)
  isShowingSequence?: boolean; // Phase "montrer séquence"
  currentSequence?: number[]; // La séquence à mémoriser
}

const SHAPE_COLORS: Record<ColorType, string> = {
  red: '#FF6B6B',
  blue: '#4ECDC4',
  green: '#95E1D3',
  yellow: '#FFE66D',
  purple: '#A29BFE',
  orange: '#FFB84D',
};

export const FocusGameGrid: React.FC<FocusGameGridProps> = ({
  gridSize,
  onCellPress,
  highlightedCell,
  correctCells,
  wrongCell,
  isDisabled = false,
  cellData,
  movingCells = [],
  distractionLevel = 0,
  isShowingSequence = false,
  currentSequence = [],
}) => {
  const { colors } = useTheme();
  const containerWidth = SCREEN_WIDTH - SPACING.lg * 4;
  const cellSize = (containerWidth - (gridSize - 1) * SPACING.xs) / gridSize;
  
  // Animations pour les cellules qui bougent - recréer quand gridSize change
  const cellAnimations = useRef<Array<{
    position: Animated.ValueXY;
    rotation: Animated.Value;
    scale: Animated.Value;
  }>>([]).current;
  
  // Initialize or resize animations array when gridSize changes
  useEffect(() => {
    const targetSize = gridSize * gridSize;
    if (cellAnimations.length !== targetSize) {
      cellAnimations.length = 0; // Clear array
      for (let i = 0; i < targetSize; i++) {
        cellAnimations.push({
          position: new Animated.ValueXY({ x: 0, y: 0 }),
          rotation: new Animated.Value(0),
          scale: new Animated.Value(1),
        });
      }
    }
  }, [gridSize]);

  // Animation des cellules mouvantes (distraction)
  useEffect(() => {
    if (movingCells.length === 0 || distractionLevel === 0) return;

    const animations = movingCells.map(index => {
      const moveDistance = 5 + distractionLevel * 2;
      
      return Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(cellAnimations[index].position.x, {
              toValue: Math.random() > 0.5 ? moveDistance : -moveDistance,
              duration: 500 + Math.random() * 500,
              useNativeDriver: true,
            }),
            Animated.timing(cellAnimations[index].position.y, {
              toValue: Math.random() > 0.5 ? moveDistance : -moveDistance,
              duration: 500 + Math.random() * 500,
              useNativeDriver: true,
            }),
            Animated.timing(cellAnimations[index].rotation, {
              toValue: (Math.random() - 0.5) * 0.2,
              duration: 800,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(cellAnimations[index].position.x, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(cellAnimations[index].position.y, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(cellAnimations[index].rotation, {
              toValue: 0,
              duration: 800,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
    });

    animations.forEach(anim => anim.start());

    return () => {
      animations.forEach(anim => anim.stop());
    };
  }, [movingCells, distractionLevel]);

  // Animation de surbrillance
  useEffect(() => {
    if (highlightedCell !== null && cellAnimations[highlightedCell]) {
      Animated.sequence([
        Animated.timing(cellAnimations[highlightedCell].scale, {
          toValue: 1.1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(cellAnimations[highlightedCell].scale, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [highlightedCell]);

  const renderShape = (shape: ShapeType, color: ColorType, size: number) => {
    const shapeColor = SHAPE_COLORS[color];
    const shapeSize = size * 0.6;

    switch (shape) {
      case 'circle':
        return (
          <View
            style={[
              styles.shape,
              {
                width: shapeSize,
                height: shapeSize,
                borderRadius: shapeSize / 2,
                backgroundColor: shapeColor,
              },
            ]}
          />
        );
      
      case 'square':
        return (
          <View
            style={[
              styles.shape,
              {
                width: shapeSize,
                height: shapeSize,
                backgroundColor: shapeColor,
              },
            ]}
          />
        );
      
      case 'triangle':
        return (
          <View style={styles.triangleContainer}>
            <View
              style={[
                styles.triangle,
                {
                  borderBottomWidth: shapeSize,
                  borderLeftWidth: shapeSize / 2,
                  borderRightWidth: shapeSize / 2,
                  borderBottomColor: shapeColor,
                },
              ]}
            />
          </View>
        );
      
      case 'diamond':
        return (
          <View
            style={[
              styles.shape,
              {
                width: shapeSize,
                height: shapeSize,
                backgroundColor: shapeColor,
                transform: [{ rotate: '45deg' }],
              },
            ]}
          />
        );
      
      case 'hexagon':
        return (
          <View style={[styles.hexagon, { width: shapeSize, height: shapeSize }]}>
            <View style={[styles.hexagonInner, { backgroundColor: shapeColor }]} />
            <View style={[styles.hexagonBefore, { borderBottomColor: shapeColor }]} />
            <View style={[styles.hexagonAfter, { borderTopColor: shapeColor }]} />
          </View>
        );
      
      case 'star':
        // Simplifié: étoile à 5 branches en SVG-like
        return (
          <View
            style={[
              styles.star,
              {
                width: shapeSize,
                height: shapeSize,
                backgroundColor: shapeColor,
              },
            ]}
          />
        );
      
      default:
        return null;
    }
  };

  const renderContent = (data: CellData, size: number) => {
    if (data.type === 'char') {
      const charColor = SHAPE_COLORS[data.color];
      return (
        <Text style={{ color: charColor, fontSize: size * 0.5, fontWeight: '800' }}>
          {data.char}
        </Text>
      );
    }
    return renderShape(data.shape, data.color, size);
  };

  const renderCell = (index: number) => {
    const isCorrect = correctCells.includes(index);
    const isWrong = wrongCell === index;
    const isHighlighted = highlightedCell === index;
  const data: CellData = cellData[index] || { type: 'shape', shape: 'circle', color: 'blue' };
    
    // Pendant la phase "montrer séquence" : montrer toutes les formes de la séquence
    // Pendant la phase "ton tour" : toutes les cellules montrent leur forme
    const isInSequence = currentSequence.includes(index);
    const shouldShowShape = !isShowingSequence || isInSequence;

    // Ensure cellAnimations[index] exists before accessing
    const animation = cellAnimations[index] || {
      position: new Animated.ValueXY({ x: 0, y: 0 }),
      rotation: new Animated.Value(0),
      scale: new Animated.Value(1),
    };

    const animatedStyle = {
      transform: [
        { translateX: animation.position.x },
        { translateY: animation.position.y },
        { rotate: animation.rotation.interpolate({
          inputRange: [-1, 1],
          outputRange: ['-10deg', '10deg'],
        })},
        { scale: animation.scale },
      ],
    };

    return (
      <Animated.View key={index} style={animatedStyle}>
        <Pressable
          style={[
            styles.cell,
            {
              width: cellSize,
              height: cellSize,
              backgroundColor: shouldShowShape ? colors.surface : colors.background,
              borderColor: colors.border,
              opacity: shouldShowShape ? 1 : 0.3,
            },
            isHighlighted && { 
              borderColor: colors.primary,
              borderWidth: 4,
              backgroundColor: colors.primary + '20',
              elevation: 8,
              shadowOpacity: 0.3,
            },
            isCorrect && { backgroundColor: colors.success + '20', borderColor: colors.success },
            isWrong && { backgroundColor: colors.error + '20', borderColor: colors.error },
          ]}
          onPress={() => !isDisabled && onCellPress(index)}
          disabled={isDisabled}
        >
          {shouldShowShape && renderContent(data, cellSize)}
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <View style={styles.gridContainer}>
      <View
        style={[
          styles.grid,
          {
            width: containerWidth,
            gap: SPACING.xs,
          },
        ]}
      >
        {Array.from({ length: gridSize * gridSize }, (_, i) => renderCell(i))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  cell: {
    borderWidth: 2,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  highlightedCell: {
    elevation: 8,
    shadowOpacity: 0.3,
  },
  shape: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  triangleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  hexagon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  hexagonInner: {
    width: '100%',
    height: '70%',
  },
  hexagonBefore: {
    position: 'absolute',
    top: 0,
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderLeftWidth: 30,
    borderLeftColor: 'transparent',
    borderRightWidth: 30,
    borderRightColor: 'transparent',
    borderBottomWidth: 15,
  },
  hexagonAfter: {
    position: 'absolute',
    bottom: 0,
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderLeftWidth: 30,
    borderLeftColor: 'transparent',
    borderRightWidth: 30,
    borderRightColor: 'transparent',
    borderTopWidth: 15,
  },
  star: {
    // Simplifié comme losange pour l'instant
    transform: [{ rotate: '45deg' }],
  },
});
