/**
 * ContinueModal - Modal proposant de continuer avec rewarded ad
 * S'affiche quand le joueur perd toutes ses vies
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants/gameConfig';
import { adManager } from '../services/adManager';

interface ContinueModalProps {
  visible: boolean;
  onContinue: () => void;  // Appelé après avoir regardé la pub
  onDecline: () => void;   // Appelé si refuse (va au game over)
}

export const ContinueModal: React.FC<ContinueModalProps> = ({
  visible,
  onContinue,
  onDecline,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  // Reset loading state when modal closes
  useEffect(() => {
    if (!visible) {
      setIsLoading(false);
      setIsAvailable(false);
    }
  }, [visible]);

  // Vérifier la disponibilité de la pub rewarded
  useEffect(() => {
    if (!visible) return;

    const checkAvailability = () => {
      setIsAvailable(adManager.isRewardedAvailable());
    };

    checkAvailability();
    const interval = setInterval(checkAvailability, 1000);

    return () => clearInterval(interval);
  }, [visible]);

  const handleContinue = async () => {
    if (!isAvailable || isLoading) return;

    setIsLoading(true);

    try {
      const success = await adManager.showRewarded(() => {
        console.log('Reward earned - Continue game');
        setIsLoading(false); // Reset loading avant de continuer
        onContinue();
      });

      if (!success) {
        console.log('Failed to show rewarded ad');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error showing rewarded ad:', error);
      setIsLoading(false);
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.icon}>💔</Text>
          <Text style={styles.title}>PLUS DE VIES !</Text>
          <Text style={styles.message}>
            Regardez une publicité pour continuer votre partie
          </Text>

          <View style={styles.buttonContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.continueButton,
                (!isAvailable || isLoading) && styles.buttonDisabled,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleContinue}
              disabled={!isAvailable || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.buttonIcon}>▶️</Text>
                  <Text style={styles.continueButtonText}>
                    {isAvailable ? 'CONTINUER' : 'Chargement...'}
                  </Text>
                </>
              )}
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.declineButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={onDecline}
              disabled={isLoading}
            >
              <Text style={styles.declineButtonText}>ABANDONNER</Text>
            </Pressable>
          </View>

          <Text style={styles.hint}>
            ❤️ +1 VIE pour continuer
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 30,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.error,
  },
  icon: {
    fontSize: 64,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.error,
    marginBottom: 15,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  continueButton: {
    backgroundColor: COLORS.success,
  },
  declineButton: {
    backgroundColor: COLORS.error,
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    backgroundColor: '#999',
    opacity: 0.5,
  },
  buttonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  declineButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  hint: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 15,
    textAlign: 'center',
  },
});
