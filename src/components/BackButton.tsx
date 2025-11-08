import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { feedback } from '../utils/soundManager';
import { useTranslation } from '../hooks/useTranslation';

interface BackButtonProps {
  onPress: () => void;
  color?: string;
  backgroundColor?: string;
  style?: ViewStyle;
  label?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({
  onPress,
  color = '#4A90E2',
  backgroundColor = 'rgba(255,255,255,0.08)',
  style,
  label,
}) => {
  const { t } = useTranslation();
  const displayLabel = label || t('common.back');
  
  const handlePress = async () => {
    await feedback.buttonPress();
    onPress();
  };

  return (
    <Pressable
      accessibilityRole="button"
      hitSlop={12}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor },
        pressed && styles.pressed,
        style,
      ]}
      onPress={handlePress}
    >
      <Text style={[styles.icon, { color }]}>←</Text>
      <Text style={[styles.label, { color }]}>{displayLabel}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  icon: {
    fontSize: 20,
    fontWeight: '700',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
});
