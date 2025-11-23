import { useRef, useEffect } from 'react';
import { Animated, Easing } from 'react-native';

export type TransitionType = 'fade' | 'slide-left' | 'slide-right' | 'slide-up' | 'slide-down' | 'blur-fade';

interface UseScreenTransitionProps {
  visible: boolean;
  type?: TransitionType;
  duration?: number;
  onTransitionEnd?: () => void;
}

export const useScreenTransition = ({
  visible,
  type = 'fade',
  duration = 300,
  onTransitionEnd,
}: UseScreenTransitionProps) => {
  const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const blur = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const getInitialValues = () => {
      switch (type) {
        case 'slide-left':
          return { translateX: visible ? -50 : 0, opacity: visible ? 0 : 1 };
        case 'slide-right':
          return { translateX: visible ? 50 : 0, opacity: visible ? 0 : 1 };
        case 'slide-up':
          return { translateY: visible ? -50 : 0, opacity: visible ? 0 : 1 };
        case 'slide-down':
          return { translateY: visible ? 50 : 0, opacity: visible ? 0 : 1 };
        case 'blur-fade':
          return { opacity: visible ? 0 : 1, scale: visible ? 0.95 : 1, blur: visible ? 10 : 0 };
        default:
          return { opacity: visible ? 0 : 1 };
      }
    };

    const getTargetValues = () => {
      switch (type) {
        case 'slide-left':
        case 'slide-right':
          return { translateX: visible ? 0 : (type === 'slide-left' ? 50 : -50), opacity: visible ? 1 : 0 };
        case 'slide-up':
        case 'slide-down':
          return { translateY: visible ? 0 : (type === 'slide-up' ? 50 : -50), opacity: visible ? 1 : 0 };
        case 'blur-fade':
          return { opacity: visible ? 1 : 0, scale: visible ? 1 : 0.95, blur: visible ? 0 : 10 };
        default:
          return { opacity: visible ? 1 : 0 };
      }
    };

    // Set initial values for entering animations
    if (visible) {
      const initial = getInitialValues();
      if (initial.translateX !== undefined) translateX.setValue(initial.translateX);
      if (initial.translateY !== undefined) translateY.setValue(initial.translateY);
      if (initial.opacity !== undefined) opacity.setValue(initial.opacity);
      if (initial.scale !== undefined) scale.setValue(initial.scale);
      if (initial.blur !== undefined) blur.setValue(initial.blur);
    }

    const target = getTargetValues();
    const animations: Animated.CompositeAnimation[] = [];

    if (target.translateX !== undefined) {
      animations.push(
        Animated.timing(translateX, {
          toValue: target.translateX,
          duration,
          easing: visible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
          useNativeDriver: true,
        })
      );
    }

    if (target.translateY !== undefined) {
      animations.push(
        Animated.timing(translateY, {
          toValue: target.translateY,
          duration,
          easing: visible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
          useNativeDriver: true,
        })
      );
    }

    if (target.scale !== undefined) {
      animations.push(
        Animated.timing(scale, {
          toValue: target.scale,
          duration,
          easing: visible ? Easing.out(Easing.back(1.2)) : Easing.in(Easing.cubic),
          useNativeDriver: true,
        })
      );
    }

    if (target.blur !== undefined) {
      animations.push(
        Animated.timing(blur, {
          toValue: target.blur,
          duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false, // blur doesn't support native driver
        })
      );
    }

    if (target.opacity !== undefined) {
      animations.push(
        Animated.timing(opacity, {
          toValue: target.opacity,
          duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      );
    }

    Animated.parallel(animations).start(() => {
      if (onTransitionEnd) {
        onTransitionEnd();
      }
    });
  }, [visible, type, duration, opacity, translateX, translateY, scale, blur, onTransitionEnd]);

  return {
    animatedStyle: {
      opacity,
      transform: [
        { translateX },
        { translateY },
        { scale },
      ],
    },
    blur,
  };
};
