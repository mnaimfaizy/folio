/* eslint-disable react-native/no-color-literals */
/* eslint-disable react-native/no-raw-text */
import React, { useState } from 'react';

import { StyleSheet, View } from 'react-native';

import { Link } from 'expo-router';

import { Button, Divider, HelperText, Surface, Text } from 'react-native-paper';

import { useAuth } from '../../hooks/useAuth';
import { validateLogin } from '../../utils/validation';
import { FormInput } from '../ui/FormInput';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const { login, error, clearError } = useAuth();

  const handleSubmit = async () => {
    clearError();
    const formErrors = validateLogin(email, password);

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const success = await login({ email, password });
      if (success) {
        // Navigation will be handled internally by the AuthContext
        // For login with verification required, we need to navigate to verify-email
        // For successful login, the isAuthenticated state change will trigger navigation
      }
      // On failure, we stay on this screen - no navigation
    } catch (error) {
      console.error('Login error:', error);
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
        placeholder="Enter your password"
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

      <Link href="/forgot-password" asChild>
        <Text variant="bodyMedium" style={styles.forgotPasswordText}>
          Forgot password?
        </Text>
      </Link>

      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={isLoading}
        disabled={isLoading}
        style={styles.button}>
        Login
      </Button>

      <Divider style={styles.divider} />

      <View style={styles.registerContainer}>
        <Text variant="bodyMedium">Don't have an account? </Text>
        <Link href="/signup" asChild>
          <Text variant="bodyMedium" style={styles.registerLink}>
            Sign Up
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
  forgotPasswordText: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    fontWeight: '500',
  },
  button: {
    marginTop: 8,
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
  },
  divider: {
    marginVertical: 24,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  registerLink: {
    fontWeight: '600',
  },
});
