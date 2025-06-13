import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal, ActivityIndicator, Animated, Easing } from 'react-native';
import { BarChart2 } from 'lucide-react-native';
import { useTheme } from '@/components/ThemeProvider';

interface LoadingAnimationModalProps {
  visible: boolean;
  message: string;
}

export const LoadingAnimationModal: React.FC<LoadingAnimationModalProps> = ({ 
  visible, 
  message 
}) => {
  const spinValue = new Animated.Value(0);
  const scaleValue = new Animated.Value(0.8);
  const { colors } = useTheme();

  useEffect(() => {
    if (visible) {
      // Start rotation animation
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
      
      // Start pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleValue, {
            toValue: 1.1,
            duration: 800,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scaleValue, {
            toValue: 0.8,
            duration: 800,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          })
        ])
      ).start();
    } else {
      // Stop animations when modal is hidden
      spinValue.stopAnimation();
      scaleValue.stopAnimation();
    }
  }, [visible]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
    >
      <View style={styles.container}>
        <View style={[styles.content, { backgroundColor: colors.card }]}>
          <Animated.View 
            style={[
              styles.iconContainer,
              { 
                backgroundColor: 'rgba(108, 92, 231, 0.1)',
                transform: [
                  { rotate: spin },
                  { scale: scaleValue }
                ] 
              }
            ]}
          >
            <BarChart2 size={32} color={colors.primary} />
          </Animated.View>
          <Text style={[styles.title, { color: colors.text }]}>Finding Best Strategy</Text>
          <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
          <View style={styles.loadingIndicator}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '80%',
    maxWidth: 320,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  message: {
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  loadingIndicator: {
    marginTop: 8,
  }
});