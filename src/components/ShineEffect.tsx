import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

interface ShineEffectProps {
  active: boolean;
  size?: number;
  color?: string;
}

export const ShineEffect: React.FC<ShineEffectProps> = ({ 
  active, 
  size = 100,
  color = '#FFD700'
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const rotationAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (active) {
      // Reset animations
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      rotationAnim.setValue(0);

      // Start shine animation (single play, no loop)
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.5,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 0.6,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(rotationAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      rotationAnim.setValue(0);
    }
  }, [active]);

  if (!active) return null;

  const rotation = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View
        style={[
          styles.shine,
          {
            width: size,
            height: size,
            opacity: opacityAnim,
            transform: [
              { scale: scaleAnim },
              { rotate: rotation },
            ],
          },
        ]}
      >
        <View style={[styles.ray, { backgroundColor: color }]} />
        <View style={[styles.ray, styles.ray2, { backgroundColor: color }]} />
        <View style={[styles.ray, styles.ray3, { backgroundColor: color }]} />
        <View style={[styles.ray, styles.ray4, { backgroundColor: color }]} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shine: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ray: {
    position: 'absolute',
    width: '100%',
    height: 4,
    borderRadius: 2,
  },
  ray2: {
    transform: [{ rotate: '45deg' }],
  },
  ray3: {
    transform: [{ rotate: '90deg' }],
  },
  ray4: {
    transform: [{ rotate: '135deg' }],
  },
});
