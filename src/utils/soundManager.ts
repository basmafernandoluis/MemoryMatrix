// Sound and haptic feedback utilities
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

// Simple sound generation using Web Audio API for Expo
// For production, you'd replace these with actual audio files

let audioEnabled = true;
let hapticsEnabled = true;

export const initializeAudio = async () => {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });
  } catch (error) {
    console.error('Error initializing audio:', error);
  }
};

export const setAudioEnabled = (enabled: boolean) => {
  audioEnabled = enabled;
};

export const setHapticsEnabled = (enabled: boolean) => {
  hapticsEnabled = enabled;
};

// Haptic feedback functions
export const playHapticLight = async () => {
  if (!hapticsEnabled) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (error) {
    console.error('Haptic error:', error);
  }
};

export const playHapticMedium = async () => {
  if (!hapticsEnabled) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch (error) {
    console.error('Haptic error:', error);
  }
};

export const playHapticHeavy = async () => {
  if (!hapticsEnabled) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } catch (error) {
    console.error('Haptic error:', error);
  }
};

export const playHapticSuccess = async () => {
  if (!hapticsEnabled) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (error) {
    console.error('Haptic error:', error);
  }
};

export const playHapticError = async () => {
  if (!hapticsEnabled) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch (error) {
    console.error('Haptic error:', error);
  }
};

export const playHapticWarning = async () => {
  if (!hapticsEnabled) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch (error) {
    console.error('Haptic error:', error);
  }
};

// Simple tone generation for game sounds
// In production, replace with actual audio files
class SoundManager {
  private audioContext: any = null;

  async playTone(frequency: number, duration: number, volume: number = 0.3) {
    if (!audioEnabled) return;
    
    // Note: Web Audio API is available in Expo web but not native
    // For native, you'd use actual audio files with expo-av
    // This is a simplified implementation for demonstration
  }

  async playHighlightSound() {
    await playHapticLight();
  }

  async playCorrectSound() {
    await playHapticSuccess();
  }

  async playWrongSound() {
    await playHapticError();
  }

  async playGameOverSound() {
    await playHapticHeavy();
  }

  async playLevelUpSound() {
    await playHapticMedium();
  }

  async playClickSound() {
    await playHapticLight();
  }
}

export const soundManager = new SoundManager();

// Feedback helper that combines sound and haptics
export const feedback = {
  cellHighlight: async () => {
    await playHapticLight();
  },
  
  cellClick: async () => {
    await playHapticLight();
  },
  
  correct: async () => {
    await playHapticSuccess();
  },
  
  wrong: async () => {
    await playHapticError();
  },
  
  gameOver: async () => {
    await playHapticHeavy();
  },
  
  levelUp: async () => {
    await playHapticMedium();
  },
  
  buttonPress: async () => {
    await playHapticLight();
  },
};
