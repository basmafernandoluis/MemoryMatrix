import React, { useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { View, StyleSheet, Animated, Easing, Text } from 'react-native';

type ParticleType = 'circle' | 'star' | 'heart' | 'sparkle' | 'plus';
type ParticleIntensity = 'small' | 'medium' | 'large' | 'mega';

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  speed: number;
  color: string;
  type: ParticleType;
  size: number;
  rotation: number;
  anim: Animated.Value;
}

export interface ClickParticlesRef {
  trigger: (x: number, y: number, color?: string, intensity?: ParticleIntensity, type?: ParticleType) => void;
}

const PARTICLE_COUNTS = {
  small: 6,
  medium: 8,
  large: 12,
  mega: 16,
};

const PARTICLE_TYPES: ParticleType[] = ['circle', 'star', 'heart', 'sparkle', 'plus'];

const PARTICLE_EMOJIS = {
  star: '⭐',
  heart: '❤️',
  sparkle: '✨',
  plus: '➕',
};

export const ClickParticles = forwardRef<ClickParticlesRef, {}>((props, ref) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  const trigger = useCallback((
    x: number, 
    y: number, 
    color: string = '#FFD700',
    intensity: ParticleIntensity = 'medium',
    type?: ParticleType
  ) => {
    const particleCount = PARTICLE_COUNTS[intensity];
    const newParticles: Particle[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (i * 360) / particleCount;
      const speed = intensity === 'mega' ? Math.random() * 80 + 60 :
                    intensity === 'large' ? Math.random() * 60 + 50 :
                    intensity === 'medium' ? Math.random() * 40 + 40 :
                    Math.random() * 30 + 30;
      
      const particleType = type || PARTICLE_TYPES[Math.floor(Math.random() * PARTICLE_TYPES.length)];
      const size = intensity === 'mega' ? 16 :
                   intensity === 'large' ? 12 :
                   intensity === 'medium' ? 10 :
                   8;
      
      newParticles.push({
        id: Date.now() + i + Math.random(),
        x,
        y,
        angle: (angle * Math.PI) / 180,
        speed,
        color,
        type: particleType,
        size,
        rotation: Math.random() * 360,
        anim: new Animated.Value(0),
      });
    }

    setParticles(prev => [...prev, ...newParticles]);

    // Animate all new particles
    const animations = newParticles.map(p => 
      Animated.timing(p.anim, {
        toValue: 1,
        duration: intensity === 'mega' ? 800 : 
                  intensity === 'large' ? 600 : 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    );

    Animated.parallel(animations).start(() => {
      // Cleanup particles after animation
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    });
  }, []);

  useImperativeHandle(ref, () => ({
    trigger
  }));

  const renderParticle = (p: Particle) => {
    if (p.type === 'circle') {
      return (
        <Animated.View
          style={[
            styles.particleCircle,
            {
              width: p.size,
              height: p.size,
              borderRadius: p.size / 2,
              backgroundColor: p.color,
            }
          ]}
        />
      );
    }

    // For emoji particles
    return (
      <Text style={[styles.particleEmoji, { fontSize: p.size }]}>
        {PARTICLE_EMOJIS[p.type as keyof typeof PARTICLE_EMOJIS]}
      </Text>
    );
  };

  return (
    <View 
      style={[
        StyleSheet.absoluteFill, 
        { 
          zIndex: 9999 
        }
      ]} 
      pointerEvents="none"
    >
      {particles.map(p => {
        const translateX = p.anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, Math.cos(p.angle) * p.speed]
        });
        
        const translateY = p.anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, Math.sin(p.angle) * p.speed]
        });

        const opacity = p.anim.interpolate({
          inputRange: [0, 0.7, 1],
          outputRange: [1, 1, 0]
        });

        const scale = p.anim.interpolate({
          inputRange: [0, 0.3, 1],
          outputRange: [0, 1.2, 0.2]
        });

        const rotate = p.anim.interpolate({
          inputRange: [0, 1],
          outputRange: [`${p.rotation}deg`, `${p.rotation + 360}deg`]
        });

        return (
          <Animated.View
            key={p.id}
            style={[
              styles.particle,
              {
                left: p.x,
                top: p.y,
                opacity,
                transform: [
                  { translateX },
                  { translateY },
                  { scale },
                  { rotate }
                ]
              }
            ]}
          >
            {renderParticle(p)}
          </Animated.View>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  particleCircle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  particleEmoji: {
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
