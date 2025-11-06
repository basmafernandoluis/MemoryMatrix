/**
 * Distraction Effect Component
 * Crée des distractions visuelles pour le mode Focus Challenge
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface DistractionEffectProps {
  active: boolean;
  level: number; // 0-10, intensité des distractions
}

export const DistractionEffect: React.FC<DistractionEffectProps> = ({ active, level }) => {
  const particles = useRef(
    Array(Math.min(level * 2, 20)).fill(0).map(() => ({
      position: new Animated.ValueXY({
        x: Math.random() * SCREEN_WIDTH,
        y: Math.random() * SCREEN_HEIGHT,
      }),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    if (!active || level === 0) {
      particles.forEach(particle => {
        particle.opacity.setValue(0);
        particle.scale.setValue(0);
      });
      return;
    }

    const animations = particles.map((particle, index) => {
      const delay = index * 200;
      const duration = 2000 + Math.random() * 1000;

      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(particle.opacity, {
              toValue: 0.3 + (level / 20),
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(particle.scale, {
              toValue: 0.5 + (level / 10),
              duration: 500,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(particle.position, {
              toValue: {
                x: Math.random() * SCREEN_WIDTH,
                y: Math.random() * SCREEN_HEIGHT,
              },
              duration,
              useNativeDriver: true,
            }),
            Animated.timing(particle.opacity, {
              toValue: 0,
              duration: duration / 2,
              delay: duration / 2,
              useNativeDriver: true,
            }),
            Animated.timing(particle.scale, {
              toValue: 0,
              duration: duration / 2,
              delay: duration / 2,
              useNativeDriver: true,
            }),
          ]),
          Animated.delay(500),
        ])
      );
    });

    animations.forEach(anim => anim.start());

    return () => {
      animations.forEach(anim => anim.stop());
    };
  }, [active, level]);

  if (!active || level === 0) return null;

  const colors = ['#FF6B6B', '#4ECDC4', '#95E1D3', '#FFE66D', '#A29BFE', '#FFB84D'];

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((particle, index) => (
        <Animated.View
          key={index}
          style={[
            styles.particle,
            {
              backgroundColor: colors[index % colors.length],
              opacity: particle.opacity,
              transform: [
                { translateX: particle.position.x },
                { translateY: particle.position.y },
                { scale: particle.scale },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  particle: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
  },
});
