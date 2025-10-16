import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, commonStyles } from '../utils/theme';

const { width } = Dimensions.get('window');

export const SplashScreen: React.FC = () => {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    // Animation sequence
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* App Icon */}
          <View style={styles.iconContainer}>
            <Ionicons
              name="calculator-outline"
              size={80}
              color={colors.textWhite}
            />
          </View>

          {/* App Name */}
          <Text style={styles.appName}>TaxBae</Text>
          <Text style={styles.tagline}>Your AI Chartered Accountant</Text>
        </Animated.View>

        {/* Loading indicator */}
        <View style={styles.loadingContainer}>
          <View style={styles.loadingBar}>
            <Animated.View style={[styles.loadingProgress, { opacity: fadeAnim }]} />
          </View>
          <Text style={styles.loadingText}>Setting up your experience...</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
    backgroundColor: colors.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  iconContainer: {
    backgroundColor: colors.primaryLight,
    borderRadius: 60,
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  appName: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.extrabold,
    color: colors.textWhite,
    marginBottom: spacing.sm,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: typography.fontSize.lg,
    color: colors.primaryLight,
    textAlign: 'center',
    fontWeight: typography.fontWeight.medium,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: spacing['3xl'],
    alignItems: 'center',
    width: width - spacing.lg * 2,
  },
  loadingBar: {
    width: '100%',
    height: 4,
    backgroundColor: colors.primaryLight,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  loadingProgress: {
    height: '100%',
    backgroundColor: colors.textWhite,
    borderRadius: 2,
    width: '60%',
  },
  loadingText: {
    fontSize: typography.fontSize.sm,
    color: colors.primaryLight,
    textAlign: 'center',
  },
});

export default SplashScreen;
