import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export type NeuroEmotion = 'neutral' | 'happy' | 'focused' | 'excited' | 'sad';

interface NeuroCharacterProps {
  emotion?: NeuroEmotion;
  size?: number;
  visible?: boolean;
  message?: string;
}

export const NeuroCharacter: React.FC<NeuroCharacterProps> = ({ 
  emotion = 'neutral', 
  size = 100,
  visible = true,
  message
}) => {
  return (
    <View style={styles.wrapper}>
      <Text>Neuro Character</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', justifyContent: 'center' },
});
