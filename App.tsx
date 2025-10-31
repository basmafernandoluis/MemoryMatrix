import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LoginScreen } from './src/screens/LoginScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { GameScreen } from './src/screens/GameScreen';
import { GameOverScreen } from './src/screens/GameOverScreen';
import { LeaderboardScreen } from './src/screens/LeaderboardScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { ChallengesScreen } from './src/screens/ChallengesScreen';
import { EditProfileModal } from './src/components/EditProfileModal';
import { initializeAudio, playIntroSound } from './src/utils/soundManager';
import { hasCompletedOnboarding, setOnboardingCompleted } from './src/utils/storage';
import { UserProgress, GameMode } from './src/types';
import { firebaseService, FirebaseUser } from './src/services/firebase';
import { firestoreService } from './src/services/firestore';
import { leaderboardService } from './src/services/leaderboard';

type Screen = 'onboarding' | 'login' | 'home' | 'game' | 'gameover' | 'leaderboard' | 'profile' | 'challenges';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('onboarding');
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [gameResult, setGameResult] = useState({ score: 0, level: 1 });
  const [fadeAnim] = useState(new Animated.Value(1));
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGameMode, setSelectedGameMode] = useState<GameMode>('classic');
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  // Initialize audio and check onboarding status
  useEffect(() => {
    const initialize = async () => {
      await initializeAudio();
      const onboardingCompleted = await hasCompletedOnboarding();
      setOnboardingDone(onboardingCompleted);
    };
    initialize();
  }, []);

  // Play intro sound when loading starts
  useEffect(() => {
    if (isLoading) {
      playIntroSound();
    }
  }, [isLoading]);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = firebaseService.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // User is signed in, load their progress
        const progress = await firestoreService.getUserProgress(user.uid);
        if (progress) {
          setUserProgress(progress);
        } else {
          // Initialize new user
          const newProgress = await firestoreService.initializeUser(user.uid);
          setUserProgress(newProgress);
        }
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  // Handle navigation based on user and onboarding state
  useEffect(() => {
    console.log('Navigation effect:', { isLoading, onboardingDone, currentUser: !!currentUser, currentScreen });
    
    if (isLoading) return; // Don't navigate while loading

    if (!onboardingDone) {
      // Onboarding not completed - show onboarding
      if (currentScreen !== 'onboarding') {
        console.log('Navigating to onboarding');
        setCurrentScreen('onboarding');
      }
    } else if (!currentUser) {
      // Onboarding done but no user - show login
      if (currentScreen !== 'login') {
        console.log('Navigating to login');
        setCurrentScreen('login');
      }
    } else {
      // User is authenticated and onboarding is done - show home if coming from onboarding/login
      if (currentScreen === 'onboarding' || currentScreen === 'login') {
        console.log('Navigating to home');
        setCurrentScreen('home');
      }
    }
  }, [currentUser, onboardingDone, isLoading, currentScreen]);

  const transitionToScreen = (screen: Screen) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    
    setTimeout(() => setCurrentScreen(screen), 200);
  };

  const handleStartGame = (mode: GameMode = 'classic') => {
    setSelectedGameMode(mode);
    transitionToScreen('game');
  };

  const handleGameOver = async (score: number, level: number) => {
    setGameResult({ score, level });
    
    // Update user progress in Firestore
    if (currentUser) {
      const { progress, newAchievements } = await firestoreService.updateHighScore(
        currentUser.uid,
        score,
        level
      );
      setUserProgress(progress);
      
      // Save score to leaderboard with display name and game mode
      const displayName = progress.displayName || currentUser.displayName || `Guest_${currentUser.uid.substring(0, 6)}`;
      await leaderboardService.saveScore(
        currentUser.uid,
        displayName,
        score,
        level,
        selectedGameMode // Passer le mode de jeu actuel
      );
      
      // TODO: Show achievement notifications if newAchievements.length > 0
    }
    
    transitionToScreen('gameover');
  };

  const handlePlayAgain = () => {
    transitionToScreen('game');
  };

  const handleBackToHome = async () => {
    if (currentUser) {
      const progress = await firestoreService.getUserProgress(currentUser.uid);
      setUserProgress(progress);
    }
    transitionToScreen('home');
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    try {
      await firebaseService.signInAnonymously();
      // Auth state listener will handle the rest
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
    }
  };

  const handleOpenLeaderboard = () => {
    transitionToScreen('leaderboard');
  };

  const handleCloseLeaderboard = () => {
    transitionToScreen('home');
  };

  const handleOpenProfile = () => {
    transitionToScreen('profile');
  };

  const handleCloseProfile = () => {
    transitionToScreen('home');
  };

  const handleOpenChallenges = () => {
    transitionToScreen('challenges');
  };

  const handleCloseChallenges = () => {
    transitionToScreen('home');
  };

  const handleProfileUpdated = (updatedProgress: UserProgress) => {
    setUserProgress(updatedProgress);
  };

  const handleSignOut = () => {
    // Auth listener will handle the navigation to login screen
    setCurrentScreen('login');
  };

  const handleOnboardingComplete = async () => {
    await setOnboardingCompleted();
    setOnboardingDone(true);
    // Show profile setup modal instead of going to login
    setShowProfileSetup(true);
  };

  const handleProfileSetupComplete = async (displayName: string, avatarEmoji: string) => {
    try {
      // Show loading screen while creating user
      setShowProfileSetup(false);
      setIsLoading(true);
      
      // Create anonymous user if not already logged in
      if (!currentUser) {
        await firebaseService.signInAnonymously();
        
        // Wait for auth listener to create the user and initialize userProgress
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      // Now update the profile with the chosen name and avatar
      const user = firebaseService.getCurrentUser();
      if (user) {
        await firestoreService.updateProfile(user.uid, displayName, avatarEmoji);
        const updatedProgress = await firestoreService.getUserProgress(user.uid);
        setUserProgress(updatedProgress);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error setting up profile:', error);
      setIsLoading(false);
      setShowProfileSetup(false);
    }
  };

  const handleProfileSetupSkip = () => {
    // If user skips, just go to login as before
    setShowProfileSetup(false);
  };

  return (
    <SafeAreaProvider>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Memory Matrix</Text>
            <Text style={styles.loadingText}>By AppWizards</Text>
            <Text style={styles.loadingSubtext}>Chargement...</Text>
          </View>
        ) : showProfileSetup ? (
          // Show empty screen while profile modal is displayed
          <View style={styles.loadingContainer} />
        ) : (
          <>
            {currentScreen === 'onboarding' && !onboardingDone && (
              <OnboardingScreen onComplete={handleOnboardingComplete} />
            )}
            {currentScreen === 'login' && (
              <LoginScreen 
                onGuestLogin={handleGuestLogin}
                isLoading={isLoading}
              />
            )}
        {currentScreen === 'home' && (
          <HomeScreen 
            onStartGame={handleStartGame}
            onOpenLeaderboard={handleOpenLeaderboard}
            onOpenProfile={handleOpenProfile}
            onOpenChallenges={handleOpenChallenges}
            userProgress={userProgress}
          />
        )}
        {currentScreen === 'leaderboard' && (
          <LeaderboardScreen
            onBack={handleCloseLeaderboard}
            currentUserId={currentUser?.uid || null}
          />
        )}
        {currentScreen === 'profile' && currentUser && (
          <ProfileScreen
            userProgress={userProgress}
            userId={currentUser.uid}
            isAnonymous={currentUser.isAnonymous}
            onBack={handleCloseProfile}
            onSignOut={handleSignOut}
            onProfileUpdated={handleProfileUpdated}
          />
        )}
        {currentScreen === 'challenges' && currentUser && (
          <ChallengesScreen
            userId={currentUser.uid}
            onBack={handleCloseChallenges}
            onRewardClaimed={handleProfileUpdated}
          />
        )}
                {currentScreen === 'game' && (
          <GameScreen 
            onGameOver={handleGameOver}
            userProgress={userProgress}
            userId={currentUser?.uid ?? null}
            mode={selectedGameMode}
          />
        )}
        {currentScreen === 'gameover' && (
          <GameOverScreen
            score={gameResult.score}
            level={gameResult.level}
            userProgress={userProgress}
            onPlayAgain={handlePlayAgain}
            onBackToHome={handleBackToHome}
          />
        )}
          </>
        )}
        
        {/* Profile Setup Modal after Onboarding */}
        <EditProfileModal
          visible={showProfileSetup}
          currentDisplayName=""
          currentAvatarEmoji="🎮"
          onSave={handleProfileSetupComplete}
          onCancel={handleProfileSetupSkip}
        />
      </Animated.View>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  loadingText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 16,
  },
  loadingSubtext: {
    fontSize: 16,
    color: '#E0E0E0',
  },
});
