import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { HomeScreen } from './src/screens/HomeScreen';
import { GameScreen } from './src/screens/GameScreen';
import { GameOverScreen } from './src/screens/GameOverScreen';
import { initializeUserProgress } from './src/utils/storage';
import { initializeAudio } from './src/utils/soundManager';
import { UserProgress } from './src/types';

type Screen = 'home' | 'game' | 'gameover';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [gameResult, setGameResult] = useState({ score: 0, level: 1 });
  const [fadeAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    const initialize = async () => {
      await initializeAudio();
      const progress = await initializeUserProgress();
      setUserProgress(progress);
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

  const handleGameOver = (score: number, level: number, progress: UserProgress | null) => {
    setGameResult({ score, level });
    setUserProgress(progress);
    transitionToScreen('gameover');
  };

  const handlePlayAgain = () => {
    transitionToScreen('game');
  };

  const handleBackToHome = async () => {
    const progress = await initializeUserProgress();
    setUserProgress(progress);
    transitionToScreen('home');
  };

  return (
    <SafeAreaProvider>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {currentScreen === 'home' && (
          <HomeScreen 
            onStartGame={handleStartGame}
            userProgress={userProgress}
          />
        )}
        {currentScreen === 'game' && (
          <GameScreen 
            onGameOver={handleGameOver}
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
