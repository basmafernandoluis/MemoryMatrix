/**
 * RewardedAdButton - Bouton pour regarder une vidéo récompensée
 * 
 * Affiche clairement la récompense et permet à l'utilisateur
 * de regarder une vidéo pour l'obtenir
 */

import React, { useState, useEffect } from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { adManager } from '../services/adManager';
import { COLORS } from '../constants/gameConfig';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '../constants/designTokens';

interface RewardedAdButtonProps {
  /**
   * Description de la récompense (ex: "Obtenez 3 vies supplémentaires")
   */
  rewardDescription: string;
  
  /**
   * Emoji ou icône de la récompense
   */
  rewardIcon?: string;
  
  /**
   * Callback appelé quand l'utilisateur gagne la récompense
   */
  onReward: () => void;
  
  /**
   * Style personnalisé optionnel
   */
  style?: any;
}

export const RewardedAdButton: React.FC<RewardedAdButtonProps> = ({
  rewardDescription,
  rewardIcon = '🎁',
  onReward,
  style,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  // Vérifier la disponibilité de la pub
  useEffect(() => {
    const checkAvailability = () => {
      setIsAvailable(adManager.isRewardedAvailable());
    };

    // Vérifier immédiatement
    checkAvailability();

    // Vérifier toutes les 2 secondes
    const interval = setInterval(checkAvailability, 2000);

    return () => clearInterval(interval);
  }, []);

  const handlePress = async () => {
    if (!isAvailable || isLoading) return;

    setIsLoading(true);

    try {
      const success = await adManager.showRewarded(() => {
        console.log('User earned reward');
        onReward();
      });

      if (!success) {
        console.log('Failed to show rewarded ad');
      }
    } catch (error) {
      console.error('Error showing rewarded ad:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAvailable) {
    return (
      <View style={[styles.button, styles.buttonDisabled, style]}>
        <Text style={styles.iconText}>{rewardIcon}</Text>
        <View style={styles.textContainer}>
          <Text style={[styles.buttonText, styles.buttonTextDisabled]}>
            Chargement de la récompense...
          </Text>
          <Text style={[styles.rewardText, styles.rewardTextDisabled]}>
            {rewardDescription}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
        style,
      ]}
      onPress={handlePress}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <>
          <Text style={styles.iconText}>{rewardIcon}</Text>
          <View style={styles.textContainer}>
            <Text style={styles.buttonText}>Regarder pour gagner</Text>
            <Text style={styles.rewardText}>{rewardDescription}</Text>
          </View>
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0.1,
  },
  iconText: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  textContainer: {
    flex: 1,
  },
  buttonText: {
    color: '#fff',
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
  },
  buttonTextDisabled: {
    color: '#999',
  },
  rewardText: {
    color: '#fff',
    fontSize: FONT_SIZE.sm,
    opacity: 0.9,
    marginTop: 2,
  },
  rewardTextDisabled: {
    color: '#999',
  },
});
