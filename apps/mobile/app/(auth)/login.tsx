/* eslint-disable react-native/no-color-literals */
/* eslint-disable @typescript-eslint/no-require-imports */
import React from 'react';

import { Image, ScrollView, StyleSheet } from 'react-native';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { Surface, Text } from 'react-native-paper';

import { LoginForm } from '../../components/auth/LoginForm';
import { useThemeColor } from '../../hooks/useThemeColor';

export default function LoginScreen() {
  const backgroundColor = useThemeColor({}, 'background');

  return (
    <>
      <StatusBar style="auto" />
      <Stack.Screen
        options={{
          title: 'Login',
          headerShown: false,
        }}
      />
      <ScrollView
        style={[styles.container, { backgroundColor }]}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled">
        <Surface style={styles.logoContainer} elevation={0}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text variant="headlineMedium" style={styles.appName}>
            MNF Library App
          </Text>
        </Surface>

        <Surface style={styles.welcomeContainer} elevation={0}>
          <Text variant="headlineLarge" style={styles.welcomeText}>
            Welcome back!
          </Text>
          <Text variant="bodyLarge" style={styles.subtitleText}>
            Sign in to continue to your account
          </Text>
        </Surface>

        <Surface style={styles.formContainer} elevation={1}>
          <LoginForm />
        </Surface>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
    backgroundColor: 'transparent',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  appName: {
    fontWeight: 'bold',
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: 'transparent',
  },
  welcomeText: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitleText: {
    textAlign: 'center',
    opacity: 0.7,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 12,
  },
});
