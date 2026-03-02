import React, { ReactNode } from 'react';

import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { Surface, Text } from 'react-native-paper';

import { AppLogo } from '../ui/AppLogo';

interface AuthScreenWrapperProps {
  title: string;
  subtitle: string;
  screenTitle: string;
  children: ReactNode;
  /** Size of the logo */
  logoSize?: 'small' | 'medium' | 'large';
}

export const AuthScreenWrapper: React.FC<AuthScreenWrapperProps> = ({
  title,
  subtitle,
  screenTitle,
  children,
  logoSize = 'medium',
}) => {
  return (
    <>
      {/* eslint-disable-next-line react/style-prop-object */}
      <StatusBar style="light" />
      <Stack.Screen
        options={{
          title: screenTitle,
          headerShown: false,
        }}
      />
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <KeyboardAvoidingView
            style={styles.keyboardAvoid}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            <ScrollView
              style={styles.container}
              contentContainerStyle={styles.contentContainer}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.logoSection}>
                <AppLogo size={logoSize} />
              </View>

              <View style={styles.headerSection}>
                <Text variant="headlineLarge" style={styles.title}>
                  {title}
                </Text>
                <Text variant="bodyLarge" style={styles.subtitle}>
                  {subtitle}
                </Text>
              </View>

              <Surface style={styles.formSection} elevation={4}>
                {children}
              </Surface>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
    color: '#fff',
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 22,
    color: 'rgba(255,255,255,0.9)',
  },
  formSection: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    padding: 28,
    borderRadius: 24,
  },
});
