import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

interface Particle {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  rotation: Animated.Value;
  scale: Animated.Value;
  color: string;
}

interface ConfettiEffectProps {
  active: boolean;
  particleCount?: number;
}

const COLORS = ['#FF6B6B', '#4ECDC4', '#FFD93D', '#6BCF7F', '#A78BFA', '#F97316'];

export const ConfettiEffect: React.FC<ConfettiEffectProps> = ({ 
  active, 
  particleCount = 40 
}) => {
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    // Initialize particles
    particlesRef.current = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: new Animated.Value(width / 2),
      y: new Animated.Value(height / 3),
      rotation: new Animated.Value(0),
      scale: new Animated.Value(1),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));
  }, [particleCount]);

  useEffect(() => {
    if (active && particlesRef.current.length > 0) {
      // Animate particles
      const animations = particlesRef.current.map((particle) => {
        const angle = Math.random() * Math.PI * 2;
        const velocity = 100 + Math.random() * 150;
        const targetX = width / 2 + Math.cos(angle) * velocity;
        const targetY = height / 3 + Math.sin(angle) * velocity;

        return Animated.parallel([
          Animated.timing(particle.x, {
            toValue: targetX,
            duration: 1000 + Math.random() * 500,
            useNativeDriver: true,
          }),
          Animated.timing(particle.y, {
            toValue: targetY,
            duration: 1000 + Math.random() * 500,
            useNativeDriver: true,
          }),
          Animated.timing(particle.rotation, {
            toValue: Math.random() * 720 - 360,
            duration: 1000 + Math.random() * 500,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(particle.scale, {
              toValue: 1.2,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(particle.scale, {
              toValue: 0,
              duration: 800 + Math.random() * 500,
              useNativeDriver: true,
            }),
          ]),
        ]);
      });

      Animated.parallel(animations).start(() => {
        // Reset particles after animation
        particlesRef.current.forEach((particle) => {
          particle.x.setValue(width / 2);
          particle.y.setValue(height / 3);
          particle.rotation.setValue(0);
          particle.scale.setValue(0);
        });
      });
    }
  }, [active]);

  if (!active) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {particlesRef.current.map((particle) => (
        <Animated.View
          key={particle.id}
          style={[
            styles.particle,
            {
              backgroundColor: particle.color,
              transform: [
                {
                  translateX: particle.x.interpolate({
                    inputRange: [0, width],
                    outputRange: [-width / 2, width / 2],
                  }),
                },
                {
                  translateY: particle.y.interpolate({
                    inputRange: [0, height],
                    outputRange: [-height / 2, height / 2],
                  }),
                },
                {
                  rotate: particle.rotation.interpolate({
                    inputRange: [-360, 360],
                    outputRange: ['-360deg', '360deg'],
                  }),
                },
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
