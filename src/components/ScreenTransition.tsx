import React from 'react';
import { Animated, StyleSheet, ViewStyle } from 'react-native';
import { useScreenTransition, TransitionType } from '../hooks/useScreenTransition';

interface ScreenTransitionProps {
  visible: boolean;
  type?: TransitionType;
  duration?: number;
  onTransitionEnd?: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
}

export const ScreenTransition: React.FC<ScreenTransitionProps> = ({
  visible,
  type = 'fade',
  duration = 300,
  onTransitionEnd,
  children,
  style,
}) => {
  const { animatedStyle } = useScreenTransition({
    visible,
    type,
    duration,
    onTransitionEnd,
  });

  return (
    <Animated.View style={[styles.container, animatedStyle, style]}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
