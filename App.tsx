import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LoginScreen } from './src/screens/LoginScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { GameScreen } from './src/screens/GameScreen';
import { GameOverScreen } from './src/screens/GameOverScreen';
import { LeaderboardScreen } from './src/screens/LeaderboardScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { ChallengesScreen } from './src/screens/ChallengesScreen';
import { initializeAudio } from './src/utils/soundManager';
import { hasCompletedOnboarding, setOnboardingCompleted } from './src/utils/storage';
import { UserProgress } from './src/types';
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

  useEffect(() => {
    const initialize = async () => {
      await initializeAudio();
      
      // Check if onboarding has been completed
      const onboardingCompleted = await hasCompletedOnboarding();
      
      // Listen to auth state changes
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
          setCurrentScreen(onboardingCompleted ? 'home' : 'onboarding');
        } else {
          // No user signed in, show login or onboarding
          setCurrentScreen(onboardingCompleted ? 'login' : 'onboarding');
        }
        setIsLoading(false);
      });

      return unsubscribe;
    };
    
    initialize();
  }, []);

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

  const handleStartGame = () => {
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
      
      // Save score to leaderboard with display name from progress
      const displayName = progress.displayName || currentUser.displayName || `Guest_${currentUser.uid.substring(0, 6)}`;
      await leaderboardService.saveScore(
        currentUser.uid,
        displayName,
        score,
        level
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
    // If user is logged in, go to home, otherwise go to login
    transitionToScreen(currentUser ? 'home' : 'login');
  };

  return (
    <SafeAreaProvider>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {currentScreen === 'onboarding' && (
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
            userId={currentUser?.uid || null}
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
      </Animated.View>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
