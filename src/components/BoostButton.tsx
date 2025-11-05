/**
 * BoostButton - Bouton pour obtenir des bonus (vies, indices) via rewarded ads
 */

import React, { useState, useEffect } from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import { adManager } from '../services/adManager';
import { COLORS } from '../constants/gameConfig';

interface BoostButtonProps {
  type: 'life' | 'hint';
  onBoostGranted: () => void;
  disabled?: boolean;
  style?: any;
}

export const BoostButton: React.FC<BoostButtonProps> = ({
  type,
  onBoostGranted,
  disabled = false,
  style,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  // Vérifier la disponibilité de la rewarded ad
  useEffect(() => {
    const checkAvailability = () => {
      setIsAvailable(adManager.isRewardedAvailable());
    };

    checkAvailability();
    const interval = setInterval(checkAvailability, 2000);

    return () => clearInterval(interval);
  }, []);

  const handlePress = async () => {
    if (!isAvailable || disabled || isLoading) return;

    setIsLoading(true);

    const success = await adManager.showRewarded(() => {
      // Récompense gagnée
      console.log(`Boost ${type} granted`);
      onBoostGranted();
    });

    setIsLoading(false);

    if (!success) {
      console.log('Failed to show rewarded ad for boost');
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'life':
        return '❤️';
      case 'hint':
        return '💡';
      default:
        return '🎁';
    }
  };

  const getLabel = () => {
    switch (type) {
      case 'life':
        return '+1 Vie';
      case 'hint':
        return '+1 Indice';
      default:
        return 'Bonus';
    }
  };

  const isButtonDisabled = disabled || !isAvailable || isLoading;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        type === 'life' && styles.lifeButton,
        type === 'hint' && styles.hintButton,
        isButtonDisabled && styles.buttonDisabled,
        pressed && !isButtonDisabled && styles.buttonPressed,
        style,
      ]}
      onPress={handlePress}
      disabled={isButtonDisabled}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>{getIcon()}</Text>
        <View style={styles.textContainer}>
          <Text style={[styles.label, isButtonDisabled && styles.labelDisabled]}>
            {isLoading ? 'Chargement...' : isAvailable ? getLabel() : 'Pas dispo'}
          </Text>
          {!isButtonDisabled && (
            <Text style={styles.subLabel}>Regarder une pub</Text>
          )}
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    minWidth: 140,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  lifeButton: {
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  hintButton: {
    borderWidth: 2,
    borderColor: '#FFD93D',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  labelDisabled: {
    color: COLORS.textSecondary,
  },
  subLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
