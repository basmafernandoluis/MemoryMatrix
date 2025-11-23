import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export type NeuroEmotion = 'neutral' | 'happy' | 'focused' | 'excited' | 'sad' | 'combo';

interface NeuroCharacterProps {
  emotion?: NeuroEmotion;
  combo?: number;
  size?: number;
  visible?: boolean;
  message?: string;
}

export const NeuroCharacter: React.FC<NeuroCharacterProps> = ({
  emotion = 'neutral',
  combo = 0,
  size = 100,
  visible = true,
  message,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;
  const opacityAnim = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const comboScaleAnim = useRef(new Animated.Value(1)).current;
  const comboRotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: visible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  useEffect(() => {
    scaleAnim.setValue(1);
    translateYAnim.setValue(0);
    rotateAnim.setValue(0);

    console.log('🧠 NeuroCharacter - Emotion:', emotion, 'Combo:', combo);

    switch (emotion) {
      case 'happy': animateHappy(); break;
      case 'excited': animateExcited(); break;
      case 'focused': animateFocused(); break;
      case 'sad': animateSad(); break;
      case 'combo': animateCombo(); break;
      default: animateNeutral(); break;
    }
  }, [emotion]);

  useEffect(() => {
    if (emotion === 'combo' && combo > 0) {
      Animated.sequence([
        Animated.timing(comboScaleAnim, {
          toValue: 1.1,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(comboScaleAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [combo, emotion]);

  const animateNeutral = () => {
    Animated.loop(Animated.sequence([
      Animated.timing(translateYAnim, { toValue: -3, duration: 3000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(translateYAnim, { toValue: 0, duration: 3000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ])).start();

    Animated.loop(Animated.sequence([
      Animated.timing(glowAnim, { toValue: 0.4, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
      Animated.timing(glowAnim, { toValue: 0.2, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
    ])).start();
  };

  const animateHappy = () => {
    Animated.loop(Animated.sequence([
      Animated.timing(translateYAnim, { toValue: -6, duration: 800, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(translateYAnim, { toValue: 0, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ])).start();

    Animated.loop(Animated.timing(glowAnim, { toValue: 0.5, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: false })).start();
  };

  const animateExcited = () => {
    Animated.loop(Animated.parallel([
      Animated.sequence([
        Animated.timing(translateYAnim, { toValue: -8, duration: 600, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(translateYAnim, { toValue: 0, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.timing(rotateAnim, { toValue: 0.5, duration: 400, useNativeDriver: true }),
        Animated.timing(rotateAnim, { toValue: -0.5, duration: 400, useNativeDriver: true }),
        Animated.timing(rotateAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ])
    ])).start();

    Animated.loop(Animated.timing(glowAnim, { toValue: 0.6, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: false })).start();
  };

  const animateFocused = () => {
    Animated.loop(Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.03, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ])).start();

    Animated.loop(Animated.timing(glowAnim, { toValue: 0.4, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: false })).start();
  };

  const animateSad = () => {
    Animated.timing(translateYAnim, { toValue: 4, duration: 800, easing: Easing.out(Easing.ease), useNativeDriver: true }).start();
    Animated.timing(scaleAnim, { toValue: 0.96, duration: 800, easing: Easing.out(Easing.ease), useNativeDriver: true }).start();
    Animated.timing(glowAnim, { toValue: 0.15, duration: 800, easing: Easing.out(Easing.ease), useNativeDriver: false }).start();
  };

  const animateCombo = () => {
    Animated.loop(Animated.parallel([
      Animated.sequence([
        Animated.timing(translateYAnim, { toValue: -10, duration: 500, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(translateYAnim, { toValue: 0, duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.timing(comboRotateAnim, { toValue: 0.5, duration: 300, useNativeDriver: true }),
        Animated.timing(comboRotateAnim, { toValue: -0.5, duration: 300, useNativeDriver: true }),
        Animated.timing(comboRotateAnim, { toValue: 0.5, duration: 300, useNativeDriver: true }),
        Animated.timing(comboRotateAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ])
    ])).start();

    Animated.loop(Animated.sequence([
      Animated.timing(glowAnim, { toValue: 0.7, duration: 400, easing: Easing.out(Easing.ease), useNativeDriver: false }),
      Animated.timing(glowAnim, { toValue: 0.5, duration: 400, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
    ])).start();
  };

  const rotate = rotateAnim.interpolate({ inputRange: [-1, 1], outputRange: ['-8deg', '8deg'] });
  const comboRotate = comboRotateAnim.interpolate({ inputRange: [-1, 1], outputRange: ['-10deg', '10deg'] });

  const getComboColor = (): [string, string, string] => {
    if (combo >= 10) {
      console.log('🌈 Combo Color: RAINBOW (10+)');
      return ['#FF00FF', '#FFD700', '#00FFFF'];
    }
    if (combo >= 7) {
      console.log('🥇 Combo Color: GOLD (7+)');
      return ['#FFD700', '#FFA500', '#FF6B9D'];
    }
    if (combo >= 5) {
      console.log('🟠 Combo Color: ORANGE (5+)');
      return ['#FFA500', '#FF6B9D', '#A78BFA'];
    }
    if (combo >= 3) {
      console.log('🟢 Combo Color: GREEN (3+)');
      return ['#50C878', '#60A5FA', '#A78BFA'];
    }
    return ['#FF6B9D', '#A78BFA', '#60A5FA'];
  };

  const renderEyes = () => {
    switch (emotion) {
      case 'happy':
      case 'excited':
        return (
          <View style={styles.eyesContainer}>
            <Text style={[styles.eyeText, { fontSize: size * 0.2 }]}>^</Text>
            <View style={{ width: size * 0.18 }} />
            <Text style={[styles.eyeText, { fontSize: size * 0.2 }]}>^</Text>
          </View>
        );
      case 'combo':
        return (
          <View style={styles.eyesContainer}>
            <Animated.Text style={[styles.eyeText, { fontSize: size * 0.22, transform: [{ scale: comboScaleAnim }] }]}>★</Animated.Text>
            <View style={{ width: size * 0.15 }} />
            <Animated.Text style={[styles.eyeText, { fontSize: size * 0.22, transform: [{ scale: comboScaleAnim }] }]}>★</Animated.Text>
          </View>
        );
      case 'focused':
        return (
          <View style={styles.eyesContainer}>
            <View style={[styles.eyeDot, { width: size * 0.12, height: size * 0.12 }]} />
            <View style={{ width: size * 0.18 }} />
            <View style={[styles.eyeDot, { width: size * 0.12, height: size * 0.12 }]} />
          </View>
        );
      case 'sad':
        return (
          <View style={styles.eyesContainer}>
            <Text style={[styles.eyeText, { fontSize: size * 0.18 }]}>x</Text>
            <View style={{ width: size * 0.18 }} />
            <Text style={[styles.eyeText, { fontSize: size * 0.18 }]}>x</Text>
          </View>
        );
      default:
        return (
          <View style={styles.eyesContainer}>
            <View style={[styles.eyeDot, { width: size * 0.1, height: size * 0.1 }]} />
            <View style={{ width: size * 0.18 }} />
            <View style={[styles.eyeDot, { width: size * 0.1, height: size * 0.1 }]} />
          </View>
        );
    }
  };

  const renderMouth = () => {
    switch (emotion) {
      case 'happy': return <Text style={[styles.mouthText, { fontSize: size * 0.15 }]}>◡</Text>;
      case 'excited': return <Text style={[styles.mouthText, { fontSize: size * 0.18 }]}>◠</Text>;
      case 'combo': return <Animated.Text style={[styles.mouthText, { fontSize: size * 0.2, transform: [{ scale: comboScaleAnim }] }]}>😃</Animated.Text>;
      case 'sad': return <Text style={[styles.mouthText, { fontSize: size * 0.15 }]}>⌓</Text>;
      default: return <View style={[styles.mouthLine, { width: size * 0.15, height: 2 }]} />;
    }
  };

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.container, { width: size, height: size, opacity: opacityAnim, transform: [{ translateY: translateYAnim }, { scale: scaleAnim }, { rotate: emotion === 'combo' ? comboRotate : rotate }] }]}>
        <Animated.View style={[styles.glowOuter, { width: size * 1.4, height: size * 1.4, borderRadius: size * 0.7, opacity: glowAnim, backgroundColor: emotion === 'combo' ? getComboColor()[0] : '#A78BFA' }]} />
        <LinearGradient colors={emotion === 'combo' ? getComboColor() : ['#FF6B9D', '#A78BFA', '#60A5FA']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.body, { width: size, height: size, borderRadius: size / 2 }]}>
          <View style={[styles.innerGlow, { width: size * 0.85, height: size * 0.85, borderRadius: size * 0.425 }]} />
          <View style={styles.brainPattern}><Text style={[styles.brainEmoji, { fontSize: size * 0.5 }]}>🧠</Text></View>
          <View style={[styles.faceOverlay, { top: size * 0.28 }]}>
            {renderEyes()}
            <View style={{ height: size * 0.08 }} />
            {renderMouth()}
          </View>
          {emotion === 'combo' && combo >= 3 && (
            <View style={styles.comboIndicator}>
              <Animated.Text style={[styles.comboText, { fontSize: size * 0.18, transform: [{ scale: comboScaleAnim }] }]}>🔥 {combo}x</Animated.Text>
            </View>
          )}
          {emotion === 'excited' && (
            <>
              <View style={[styles.hand, styles.handLeft, { left: -size * 0.12, top: size * 0.4, width: size * 0.15, height: size * 0.15 }]} />
              <View style={[styles.hand, styles.handRight, { right: -size * 0.12, top: size * 0.4, width: size * 0.15, height: size * 0.15 }]} />
            </>
          )}
        </LinearGradient>
      </Animated.View>
      {message && (
        <View style={styles.messageBubble}>
          <Text style={styles.messageText}>{message}</Text>
          <View style={styles.bubbleTriangle} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', justifyContent: 'center' },
  container: { justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  glowOuter: { position: 'absolute', backgroundColor: 'rgba(255, 107, 157, 0.4)', zIndex: -1 },
  body: { justifyContent: 'center', alignItems: 'center', overflow: 'hidden', elevation: 8, shadowColor: '#FF6B9D', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12 },
  innerGlow: { position: 'absolute', backgroundColor: 'rgba(255, 255, 255, 0.15)' },
  brainPattern: { position: 'absolute', top: '15%', opacity: 0.4 },
  brainEmoji: { textAlign: 'center' },
  faceOverlay: { position: 'absolute', width: '100%', alignItems: 'center', zIndex: 2 },
  eyesContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  eyeText: { fontWeight: 'bold', color: '#1A1A2E' },
  eyeDot: { backgroundColor: '#1A1A2E', borderRadius: 50 },
  mouthText: { fontWeight: 'bold', color: '#1A1A2E' },
  mouthLine: { backgroundColor: '#1A1A2E', borderRadius: 1 },
  hand: { position: 'absolute', borderRadius: 50, backgroundColor: '#FF6B9D', elevation: 4, shadowColor: '#FF6B9D', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
  handLeft: { transform: [{ rotate: '-20deg' }] },
  handRight: { transform: [{ rotate: '20deg' }] },
  comboIndicator: { position: 'absolute', bottom: -8, backgroundColor: 'rgba(0, 0, 0, 0.7)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
  comboText: { color: '#FFD700', fontWeight: 'bold' },
  messageBubble: { marginTop: 12, backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, maxWidth: 250, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4 },
  messageText: { fontSize: 14, color: '#1A1A2E', textAlign: 'center', fontWeight: '600' },
  bubbleTriangle: { position: 'absolute', top: -8, left: '50%', marginLeft: -8, width: 0, height: 0, borderLeftWidth: 8, borderRightWidth: 8, borderBottomWidth: 8, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: '#FFFFFF' },
});