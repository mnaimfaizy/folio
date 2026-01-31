/* eslint-disable react-native/no-color-literals */
/* eslint-disable react-native/no-raw-text */
import React, { useState } from 'react';

import { StyleSheet, View } from 'react-native';

import { Link } from 'expo-router';

import { Button, Divider, HelperText, Surface, Text } from 'react-native-paper';

import { useAuth } from '../../hooks/useAuth';
import { validateSignup } from '../../utils/validation';
import { FormInput } from '../ui/FormInput';

export const SignupForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const { signup, error, clearError, navigateAfterAuth } = useAuth();

  const handleSubmit = async () => {
    clearError();
    const formErrors = validateSignup(name, email, password, confirmPassword);

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const success = await signup({ name, email, password });
      if (success) {
        // Only navigate to verification screen on success
        navigateAfterAuth('/verify-email');
      }
      // On failure, we stay on this screen - no navigation
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {error && (
        <Surface style={styles.errorContainer} elevation={0}>
          <HelperText type="error" visible={!!error} style={styles.errorText}>
            {error}
          </HelperText>
        </Surface>
      )}

      <FormInput
        label="Full Name"
        placeholder="Enter your name"
        value={name}
        onChangeText={text => {
          setName(text);
          if (errors.name) {
            setErrors({ ...errors, name: '' });
          }
        }}
        icon="account"
        error={!!errors.name}
      />

      <FormInput
        label="Email"
        placeholder="Enter your email"
        value={email}
        onChangeText={text => {
          setEmail(text);
          if (errors.email) {
            setErrors({ ...errors, email: '' });
          }
        }}
        autoCapitalize="none"
        keyboardType="email-address"
        icon="email"
        error={!!errors.email}
      />

      <FormInput
        label="Password"
        placeholder="Create a password"
        value={password}
        onChangeText={text => {
          setPassword(text);
          if (errors.password) {
            setErrors({ ...errors, password: '' });
          }
        }}
        secureTextEntry
        icon="lock"
        error={!!errors.password}
      />

      <FormInput
        label="Confirm Password"
        placeholder="Re-enter your password"
        value={confirmPassword}
        onChangeText={text => {
          setConfirmPassword(text);
          if (errors.confirmPassword) {
            setErrors({ ...errors, confirmPassword: '' });
          }
        }}
        secureTextEntry
        icon="shield-check"
        error={!!errors.confirmPassword}
      />

      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={isLoading}
        disabled={isLoading}
        style={styles.button}>
        Sign Up
      </Button>

      <Divider style={styles.divider} />

      <View style={styles.loginContainer}>
        <Text variant="bodyMedium">Already have an account? </Text>
        <Link href="/login" asChild>
          <Text variant="bodyMedium" style={styles.loginLink}>
            Log In
          </Text>
        </Link>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    marginTop: 16,
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
  },
  divider: {
    marginTop: 24,
    marginBottom: 16,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginLink: {
    fontWeight: '600',
  },
});
