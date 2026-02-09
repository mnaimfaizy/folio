import React, { ReactNode } from 'react';

import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { Surface, Text, useTheme } from 'react-native-paper';

import { useThemeColor } from '../../hooks/useThemeColor';
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
  const backgroundColor = useThemeColor({}, 'background');
  const { colors } = useTheme();

  return (
    <>
      {/* eslint-disable-next-line react/style-prop-object */}
      <StatusBar style="auto" />
      <Stack.Screen
        options={{
          title: screenTitle,
          headerShown: false,
        }}
      />
      <SafeAreaView style={[styles.safeArea, { backgroundColor }]} edges={['top']}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
          <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles.logoSection}>
              <AppLogo size={logoSize} />
            </View>

            <View style={styles.headerSection}>
              <Text
                variant="headlineLarge"
                style={[styles.title, { color: colors.onBackground }]}>
                {title}
              </Text>
              <Text
                variant="bodyLarge"
                style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
                {subtitle}
              </Text>
            </View>

            <Surface style={styles.formSection} elevation={1}>
              {children}
            </Surface>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
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
    marginBottom: 28,
  },
  title: {
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 22,
  },
  formSection: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    padding: 24,
    borderRadius: 16,
  },
});
