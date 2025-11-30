import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../constants/gameConfig';

interface CircularTimerProps {
  size: number;
  progress: number;
  color?: string;
}

export const CircularTimer: React.FC<CircularTimerProps> = ({ 
  size, 
  progress,
  color = COLORS.primary 
}) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  
  const firstHalfRotation = clampedProgress >= 0.5 ? '180deg' : `deg`;
  const secondHalfRotation = clampedProgress <= 0.5 ? '0deg' : `deg`;
  
  const getProgressColor = () => {
    if (color !== COLORS.primary) return color;
    if (clampedProgress < 0.3) return COLORS.error;
    if (clampedProgress < 0.6) return COLORS.warning;
    return COLORS.success;
  };

  const activeColor = getProgressColor();

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={[styles.circle, { 
        width: size, 
        height: size, 
        borderRadius: size / 2,
        backgroundColor: 'rgba(255,255,255,0.1)' 
      }]} />
      
      <View style={[styles.halfContainer, { width: size, height: size }]}>
        <View style={[styles.halfCircle, {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderRightColor: 'transparent',
          borderBottomColor: 'transparent',
          transform: [{ rotate: firstHalfRotation }],
          borderColor: activeColor,
        }]} />
      </View>
      
      {clampedProgress > 0.5 && (
        <View style={[styles.halfContainer, { width: size, height: size, transform: [{ rotate: '180deg' }] }]}>
          <View style={[styles.halfCircle, {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderRightColor: 'transparent',
            borderBottomColor: 'transparent',
            transform: [{ rotate: secondHalfRotation }],
            borderColor: activeColor,
          }]} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '-90deg' }],
  },
  circle: {
    position: 'absolute',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  halfContainer: {
    position: 'absolute',
    overflow: 'hidden',
  },
  halfCircle: {
    position: 'absolute',
    borderWidth: 4,
    borderLeftColor: 'transparent',
    borderTopColor: 'transparent',
  },
});
