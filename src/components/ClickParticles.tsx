import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface ParticleProps {
  x: number;
  y: number;
  color: string;
  delay: number;
}

const Particle: React.FC<ParticleProps> = ({ x, y, color, delay }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: y,
        duration: 800,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: x,
        duration: 800,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 800,
        delay,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.5,
          duration: 200,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          backgroundColor: color,
          opacity,
          transform: [
            { translateX },
            { translateY },
            { scale },
          ],
        },
      ]}
    />
  );
};

interface ClickParticlesProps {
  x: number;
  y: number;
  color?: string;
  count?: number;
}

export const ClickParticles: React.FC<ClickParticlesProps> = ({ 
  x, 
  y, 
  color = '#FFD700',
  count = 8,
}) => {
  const particles = Array.from({ length: count }, (_, i) => {
    const angle = (Math.PI * 2 * i) / count;
    const distance = 40 + Math.random() * 20;
    return {
      id: i,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      delay: i * 30,
    };
  });

  return (
    <View style={[styles.container, { left: x, top: y }]} pointerEvents="none">
      {particles.map((particle) => (
        <Particle
          key={particle.id}
          x={particle.x}
          y={particle.y}
          color={color}
          delay={particle.delay}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 0,
    height: 0,
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
