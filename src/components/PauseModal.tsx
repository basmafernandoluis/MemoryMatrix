import React from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { COLORS } from '../constants/gameConfig';
import { feedback } from '../utils/soundManager';

interface PauseModalProps {
  visible: boolean;
  onResume: () => void;
  onQuit: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({ visible, onResume, onQuit }) => {
  const handleResume = async () => {
    await feedback.buttonPress();
    onResume();
  };

  const handleQuit = async () => {
    await feedback.buttonPress();
    onQuit();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>⏸️ PAUSE</Text>
          
          <View style={styles.buttonContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.resumeButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleResume}
            >
              <Text style={styles.resumeButtonText}>▶️ REPRENDRE</Text>
            </Pressable>
            
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.quitButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleQuit}
            >
              <Text style={styles.quitButtonText}>🏠 QUITTER</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 30,
    width: '80%',
    maxWidth: 350,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 30,
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  resumeButton: {
    backgroundColor: COLORS.success,
  },
  quitButton: {
    backgroundColor: COLORS.error,
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  resumeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    letterSpacing: 1,
  },
  quitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    letterSpacing: 1,
  },
});
