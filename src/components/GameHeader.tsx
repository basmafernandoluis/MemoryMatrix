import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/gameConfig';
import { UserProgress } from '../types';

interface GameHeaderProps {
  level: number;
  score: number;
  lives: number;
  userProgress?: UserProgress | null;
}

export const GameHeader: React.FC<GameHeaderProps> = ({ level, score, lives, userProgress }) => {
  return (
    <View style={styles.container}>
      <View style={styles.stat}>
        <Text style={styles.label}>Niveau</Text>
        <Text style={styles.value}>{level}</Text>
      </View>
      
      <View style={styles.stat}>
        <Text style={styles.label}>Score</Text>
        <Text style={styles.value}>{score}</Text>
        {userProgress && userProgress.highScore > 0 && (
          <Text style={styles.highScore}>Record: {userProgress.highScore}</Text>
        )}
      </View>
      
      <View style={styles.stat}>
        <Text style={styles.label}>Vies</Text>
        <View style={styles.livesContainer}>
          {Array.from({ length: 3 }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.heart,
                index < lives ? styles.heartActive : styles.heartInactive,
              ]}
            >
              <Text style={styles.heartText}>♥</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 10,
    backgroundColor: COLORS.surface,
    borderRadius: 15,
    marginBottom: 20,
  },
  stat: {
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 5,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  livesContainer: {
    flexDirection: 'row',
    gap: 5,
  },
  heart: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartActive: {
    opacity: 1,
  },
  heartInactive: {
    opacity: 0.3,
  },
  heartText: {
    fontSize: 20,
    color: COLORS.error,
  },
  highScore: {
    fontSize: 10,
    color: COLORS.warning,
    marginTop: 2,
    fontWeight: '600',
  },
});
