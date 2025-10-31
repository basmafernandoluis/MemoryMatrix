// Sound and haptic feedback utilities
import { Audio, AVPlaybackStatus } from 'expo-av';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys for sound preferences
const STORAGE_KEYS = {
  SOUND_ENABLED: '@MemoryMatrix:soundEnabled',
  HAPTICS_ENABLED: '@MemoryMatrix:hapticsEnabled',
};

// Sound state
let audioEnabled = true;
let hapticsEnabled = true;

// Sound objects cache
interface SoundCache {
  intro?: Audio.Sound;
  click?: Audio.Sound;
  bien2?: Audio.Sound;
  alertefaill?: Audio.Sound;
  chrono?: Audio.Sound;
  passe?: Audio.Sound;
}

let soundCache: SoundCache = {};
let chronoLoopingSound: Audio.Sound | null = null;
let isChronoPlaying = false;

// Initialize audio system
export const initializeAudio = async () => {
  try {
    // Configure audio mode
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    // Load user preferences
    const soundPref = await AsyncStorage.getItem(STORAGE_KEYS.SOUND_ENABLED);
    const hapticsPref = await AsyncStorage.getItem(STORAGE_KEYS.HAPTICS_ENABLED);
    
    audioEnabled = soundPref !== null ? soundPref === 'true' : true;
    hapticsEnabled = hapticsPref !== null ? hapticsPref === 'true' : true;

    // Preload all sounds
    await preloadSounds();
  } catch (error) {
    console.error('Error initializing audio:', error);
  }
};

// Preload all sound files
const preloadSounds = async () => {
  try {
    // Load intro sound (splash screen)
    const { sound: introSound } = await Audio.Sound.createAsync(
      require('../../assets/Sound/intro.mp3'),
      { shouldPlay: false, volume: 0.5 }
    );
    soundCache.intro = introSound;

    // Load click sound
    const { sound: clickSound } = await Audio.Sound.createAsync(
      require('../../assets/Sound/click.mp3'),
      { shouldPlay: false, volume: 0.6 }
    );
    soundCache.click = clickSound;

    // Load success sound (bien2)
    const { sound: bien2Sound } = await Audio.Sound.createAsync(
      require('../../assets/Sound/bien2.mp3'),
      { shouldPlay: false, volume: 0.7 }
    );
    soundCache.bien2 = bien2Sound;

    // Load game over sound (alertefaill)
    const { sound: alertefaillSound } = await Audio.Sound.createAsync(
      require('../../assets/Sound/alertefaill.mp3'),
      { shouldPlay: false, volume: 0.8 }
    );
    soundCache.alertefaill = alertefaillSound;

    // Load chrono sound (will be used for looping)
    const { sound: chronoSound } = await Audio.Sound.createAsync(
      require('../../assets/Sound/CHRONO.mp3'),
      { shouldPlay: false, volume: 0.5, isLooping: true }
    );
    soundCache.chrono = chronoSound;

    // Load passe sound (navigation/swipe sound)
    const { sound: passeSound } = await Audio.Sound.createAsync(
      require('../../assets/Sound/passe.mp3'),
      { shouldPlay: false, volume: 0.4 }
    );
    soundCache.passe = passeSound;

    console.log('All sounds preloaded successfully');
  } catch (error) {
    console.error('Error preloading sounds:', error);
  }
};

// Set audio enabled/disabled
export const setAudioEnabled = async (enabled: boolean) => {
  audioEnabled = enabled;
  await AsyncStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, enabled.toString());
  
  // Stop chrono if disabling audio
  if (!enabled && isChronoPlaying) {
    await stopChronoSound();
  }
};

// Set haptics enabled/disabled
export const setHapticsEnabled = async (enabled: boolean) => {
  hapticsEnabled = enabled;
  await AsyncStorage.setItem(STORAGE_KEYS.HAPTICS_ENABLED, enabled.toString());
};

// Get current audio/haptics state
export const getAudioEnabled = () => audioEnabled;
export const getHapticsEnabled = () => hapticsEnabled;

// Play a sound with overlap prevention
const playSound = async (soundKey: keyof SoundCache) => {
  if (!audioEnabled || !soundCache[soundKey]) return;

  try {
    const sound = soundCache[soundKey];
    if (!sound) return;

    // Stop and rewind the sound if it's already playing
    const status = await sound.getStatusAsync();
    if (status.isLoaded && status.isPlaying) {
      await sound.stopAsync();
    }
    
    // Reset position and play
    await sound.setPositionAsync(0);
    await sound.playAsync();
  } catch (error) {
    console.error(`Error playing sound ${soundKey}:`, error);
  }
};

// Start chrono sound (looping) - ONLY for Time Attack mode
export const startChronoSound = async () => {
  if (!audioEnabled || isChronoPlaying) return;

  try {
    const chronoSound = soundCache.chrono;
    if (!chronoSound) return;

    // Make sure it's set to loop
    await chronoSound.setIsLoopingAsync(true);
    await chronoSound.setPositionAsync(0);
    await chronoSound.playAsync();
    
    isChronoPlaying = true;
    console.log('Chrono sound started');
  } catch (error) {
    console.error('Error starting chrono sound:', error);
  }
};

// Stop chrono sound
export const stopChronoSound = async () => {
  if (!isChronoPlaying) return;

  try {
    const chronoSound = soundCache.chrono;
    if (chronoSound) {
      await chronoSound.stopAsync();
      await chronoSound.setPositionAsync(0);
    }
    
    isChronoPlaying = false;
    console.log('Chrono sound stopped');
  } catch (error) {
    console.error('Error stopping chrono sound:', error);
  }
};

// Check if chrono is currently playing
export const isChronoSoundPlaying = () => isChronoPlaying;

// Cleanup sounds on app unmount
export const cleanupSounds = async () => {
  try {
    await stopChronoSound();
    
    for (const key in soundCache) {
      const sound = soundCache[key as keyof SoundCache];
      if (sound) {
        await sound.unloadAsync();
      }
    }
    
    soundCache = {};
    console.log('All sounds cleaned up');
  } catch (error) {
    console.error('Error cleaning up sounds:', error);
  }
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

// Game-specific sound functions
export const playClickSound = async () => {
  await playSound('click');
};

export const playCorrectSound = async () => {
  await playSound('bien2');
};

export const playGameOverSound = async () => {
  await playSound('alertefaill');
};

export const playPasseSound = async () => {
  await playSound('passe');
};

export const playIntroSound = async () => {
  await playSound('intro');
};

// Feedback helper combining sound and haptics
export const feedback = {
  // Cell highlight during sequence display
  cellHighlight: async () => {
    await playHapticLight();
  },
  
  // Cell click during user input
  cellClick: async () => {
    await playClickSound();
    await playHapticLight();
  },
  
  // Correct sequence completion
  correct: async () => {
    await playCorrectSound();
    await playHapticSuccess();
  },
  
  // Wrong input
  wrong: async () => {
    await playHapticError();
  },
  
  // Game over - all lives lost
  gameOver: async () => {
    await playGameOverSound();
    await playHapticHeavy();
  },
  
  // Level up
  levelUp: async () => {
    await playHapticMedium();
  },
  
  // Button press
  buttonPress: async () => {
    await playHapticLight();
  },
};
