import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/gameConfig';
import { feedback } from '../utils/soundManager';
import { useTranslation } from '../hooks/useTranslation';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LoginScreenProps {
  onGuestLogin: () => void;
  isLoading?: boolean;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onGuestLogin, isLoading }) => {
  const { t } = useTranslation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [debugPressCount, setDebugPressCount] = useState(0);

  const handleDebugPress = () => {
    const newCount = debugPressCount + 1;
    setDebugPressCount(newCount);
    
    if (newCount >= 5) {
      Alert.alert(
        '🔧 Debug Mode',
        'Clear onboarding flag and restart?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Clear',
            style: 'destructive',
            onPress: async () => {
              await AsyncStorage.removeItem('@MemoryMatrix:onboardingCompleted');
              Alert.alert('✅ Done', 'Please restart the app');
            },
          },
        ]
      );
      setDebugPressCount(0);
    }
  };

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for buttons
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [fadeAnim, scaleAnim, pulseAnim]);

  const handleGuestLogin = async () => {
    await feedback.buttonPress();
    onGuestLogin();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>{t('login.connecting')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.header}>
          <Pressable onPress={handleDebugPress}>
            <Text style={styles.title}>{t('login.title')}</Text>
          </Pressable>
          <Text style={styles.subtitle}>{t('login.subtitle')}</Text>
          <Text style={styles.tagline}>
            {t('login.tagline')}
          </Text>
        </View>

        <View style={styles.features}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🎮</Text>
            <Text style={styles.featureText}>{t('login.features.gameplay')}</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🏆</Text>
            <Text style={styles.featureText}>{t('login.features.dailyChallenges')}</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>⭐</Text>
            <Text style={styles.featureText}>{t('login.features.achievements')}</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>☁️</Text>
            <Text style={styles.featureText}>{t('login.features.savedProgress')}</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.guestButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleGuestLogin}
            >
              <Text style={styles.guestButtonText}>{t('login.guestButton')}</Text>
              <Text style={styles.buttonSubtext}>{t('login.guestSubtext')}</Text>
            </Pressable>
          </Animated.View>
        </View>

        <Text style={styles.disclaimer}>
          {t('login.disclaimer')}
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: COLORS.text,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 28,
    fontWeight: '600',
    color: COLORS.success,
    marginBottom: 15,
  },
  tagline: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 15,
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  featureItem: {
    backgroundColor: COLORS.surface,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    width: '45%',
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 13,
    color: COLORS.text,
    textAlign: 'center',
    fontWeight: '500',
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  button: {
    paddingVertical: 18,
    borderRadius: 25,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  guestButton: {
    backgroundColor: COLORS.primary,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  guestButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    letterSpacing: 1,
  },
  buttonSubtext: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  disclaimer: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 30,
  },
});
