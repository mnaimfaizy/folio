/* eslint-disable @typescript-eslint/no-require-imports */
import React from 'react';

import { Image, ScrollView, StyleSheet, View } from 'react-native';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { ResetPasswordForm } from '../../components/auth/ResetPasswordForm';
import { ThemedText } from '../../components/ThemedText';
import { useThemeColor } from '../../hooks/useThemeColor';

export default function ResetPasswordScreen() {
  const backgroundColor = useThemeColor({}, 'background');

  return (
    <>
      <StatusBar style="auto" />
      <Stack.Screen
        options={{
          title: 'Reset Password',
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
          <ThemedText style={styles.welcomeText}>Reset Password</ThemedText>
          <ThemedText style={styles.subtitleText}>
            Create a new secure password for your account
          </ThemedText>
        </View>

        <View style={styles.formContainer}>
          <ResetPasswordForm />
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
