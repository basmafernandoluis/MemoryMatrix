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
  coins?: Audio.Sound;
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
    // Configure audio mode with more permissive settings
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
      allowsRecordingIOS: false,
      interruptionModeIOS: 1, // Do not mix with other audio
      interruptionModeAndroid: 1, // Do not duck other audio
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

    // Load coins sound (rewards)
    const { sound: coinsSound } = await Audio.Sound.createAsync(
      require('../../assets/Sound/coins.mp3'),
      { shouldPlay: false, volume: 0.7 }
    );
    soundCache.coins = coinsSound;

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
const playSound = async (soundKey: keyof SoundCache, options?: { rate?: number }) => {
  if (!audioEnabled) return;

  try {
    let sound = soundCache[soundKey];
    
    // Recreate sound if it doesn't exist or is unloaded
    if (!sound) {
      console.log(`Recreating sound: ${soundKey}`);
      const soundFiles: Record<keyof SoundCache, any> = {
        intro: require('../../assets/Sound/intro.mp3'),
        click: require('../../assets/Sound/click.mp3'),
        bien2: require('../../assets/Sound/bien2.mp3'),
        coins: require('../../assets/Sound/coins.mp3'),
        alertefaill: require('../../assets/Sound/alertefaill.mp3'),
        chrono: require('../../assets/Sound/CHRONO.mp3'),
        passe: require('../../assets/Sound/passe.mp3'),
      };
      
      if (soundFiles[soundKey]) {
        const { sound: newSound } = await Audio.Sound.createAsync(
          soundFiles[soundKey],
          { shouldPlay: false, volume: soundKey === 'intro' ? 0.5 : soundKey === 'passe' ? 0.4 : soundKey === 'click' ? 0.6 : soundKey === 'alertefaill' ? 0.8 : 0.7 }
        );
        soundCache[soundKey] = newSound;
        sound = newSound;
      }
    }
    
    if (!sound) return;

    // Check if sound is loaded
    const status = await sound.getStatusAsync();
    if (!status.isLoaded) {
      console.log(`Sound ${soundKey} not loaded, recreating...`);
      // Recreate the sound
      const soundFiles: Record<keyof SoundCache, any> = {
        intro: require('../../assets/Sound/intro.mp3'),
        click: require('../../assets/Sound/click.mp3'),
        bien2: require('../../assets/Sound/bien2.mp3'),
        coins: require('../../assets/Sound/coins.mp3'),
        alertefaill: require('../../assets/Sound/alertefaill.mp3'),
        chrono: require('../../assets/Sound/CHRONO.mp3'),
        passe: require('../../assets/Sound/passe.mp3'),
      };
      
      const { sound: newSound } = await Audio.Sound.createAsync(
        soundFiles[soundKey],
        { shouldPlay: false, volume: soundKey === 'intro' ? 0.5 : soundKey === 'passe' ? 0.4 : soundKey === 'click' ? 0.6 : soundKey === 'alertefaill' ? 0.8 : 0.7 }
      );
      soundCache[soundKey] = newSound;
      sound = newSound;
    }

    // Stop and rewind the sound if it's already playing
    if (status.isLoaded && status.isPlaying) {
      await sound.stopAsync();
    }
    
    // Reset position and play
    await sound.setPositionAsync(0);
    
    if (options?.rate) {
      await sound.setRateAsync(options.rate, true);
    } else {
      // Reset rate to normal if not specified
      await sound.setRateAsync(1.0, true);
    }

    await sound.playAsync();
  } catch (error: any) {
    // Handle "Player does not exist" error by recreating the sound
    if (error?.message?.includes('Player does not exist')) {
      console.log(`Player destroyed for ${soundKey}, recreating and retrying...`);
      try {
        const soundFiles: Record<keyof SoundCache, any> = {
          intro: require('../../assets/Sound/intro.mp3'),
          click: require('../../assets/Sound/click.mp3'),
          bien2: require('../../assets/Sound/bien2.mp3'),
          coins: require('../../assets/Sound/coins.mp3'),
          alertefaill: require('../../assets/Sound/alertefaill.mp3'),
          chrono: require('../../assets/Sound/CHRONO.mp3'),
          passe: require('../../assets/Sound/passe.mp3'),
        };
        
        if (soundFiles[soundKey]) {
          const { sound: newSound } = await Audio.Sound.createAsync(
            soundFiles[soundKey],
            { 
              shouldPlay: true, // Play immediately
              volume: soundKey === 'intro' ? 0.5 : soundKey === 'passe' ? 0.4 : soundKey === 'click' ? 0.6 : soundKey === 'alertefaill' ? 0.8 : 0.7 
            }
          );
          soundCache[soundKey] = newSound;
          console.log(`✅ ${soundKey} recreated and playing`);
        }
      } catch (retryError) {
        console.log(`Could not recreate sound ${soundKey}:`, retryError);
      }
      return;
    }
    
    // Handle audio focus error gracefully
    if (error?.message?.includes('AudioFocusNotAcquiredException')) {
      console.log(`Audio focus not available for ${soundKey}, skipping...`);
      // Try to reconfigure audio mode and retry once
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
          allowsRecordingIOS: false,
          interruptionModeAndroid: 1,
        });
      } catch (reconfigError) {
        console.log('Could not reconfigure audio mode');
      }
    } else {
      console.error(`Error playing sound ${soundKey}:`, error);
    }
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

// Play click sound with pitch based on sequence progress
export const playSequenceStepSound = async (stepIndex: number) => {
  // Pitch increases by 0.1 for each step, capped at 2.0
  const pitch = Math.min(1.0 + (stepIndex * 0.1), 2.0);
  await playSound('click', { rate: pitch });
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

export const playCoinsSound = async () => {
  await playSound('coins');
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
  
  // Reward earned (coins sound for rewarded ads)
  reward: async () => {
    await playCoinsSound();
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
