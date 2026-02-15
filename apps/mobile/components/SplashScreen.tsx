import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

interface SplashScreenProps {
  onFinish: () => void;
  appName?: string;
}

export function SplashScreen({ onFinish, appName = 'Folio' }: SplashScreenProps) {
  const { colors } = useTheme();
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(30)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleTranslateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Sequence of animations
    Animated.sequence([
      // Logo fade in and scale up
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      // Title slide up and fade in
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(titleTranslateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      // Subtitle slide up and fade in
      Animated.parallel([
        Animated.timing(subtitleOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(subtitleTranslateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      // Hold for a moment
      Animated.delay(800),
    ]).start(() => {
      // Fade out and call onFinish
      Animated.timing(logoOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
    }).start(onFinish);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primaryContainer, colors.surface, colors.secondaryContainer]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      
      <View style={styles.content}>
        {/* Logo */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}>
          <Image
            source={require('../assets/images/logo.png')}
            style={styles.logo}
            contentFit="contain"
          />
        </Animated.View>

        {/* Title */}
        <Animated.View
          style={{
            opacity: titleOpacity,
            transform: [{ translateY: titleTranslateY }],
          }}>
          <Text variant="displayMedium" style={[styles.title, { color: colors.primary }]}>
            {appName}
          </Text>
        </Animated.View>

        {/* Subtitle */}
        <Animated.View
          style={{
            opacity: subtitleOpacity,
            transform: [{ translateY: subtitleTranslateY }],
          }}>
          <Text
            variant="titleMedium"
            style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
            Discover, collect, and manage{'\n'}your favorite books
          </Text>
        </Animated.View>
      </View>

      {/* Version or branding at bottom */}
      <Animated.View style={[styles.footer, { opacity: subtitleOpacity }]}>
        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant, opacity: 0.6 }}>
          © 2026 Folio. All rights reserved.
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  logo: {
    width: 140,
    height: 140,
  },
  title: {
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 16,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.85,
  },
  footer: {
    position: 'absolute',
    bottom: 48,
  },
});
