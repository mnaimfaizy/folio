/* eslint-disable @typescript-eslint/no-require-imports */
import React from 'react';

import { Image, ScrollView, StyleSheet, View } from 'react-native';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { SignupForm } from '../../components/auth/SignupForm';
import { ThemedText } from '../../components/ThemedText';
import { useThemeColor } from '../../hooks/useThemeColor';

export default function SignupScreen() {
  const backgroundColor = useThemeColor({}, 'background');

  return (
    <>
      <StatusBar style="auto" />
      <Stack.Screen
        options={{
          title: 'Sign Up',
          headerShown: false,
        }}
      />
      <ScrollView
        style={[styles.container, { backgroundColor }]}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled">
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <ThemedText style={styles.appName}>Library App</ThemedText>
        </View>

        <View style={styles.welcomeContainer}>
          <ThemedText style={styles.welcomeText}>Create Account</ThemedText>
          <ThemedText style={styles.subtitleText}>
            Sign up to get started with our library services
          </ThemedText>
        </View>

        <View style={styles.formContainer}>
          <SignupForm />
        </View>
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
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  appName: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
  },
});
