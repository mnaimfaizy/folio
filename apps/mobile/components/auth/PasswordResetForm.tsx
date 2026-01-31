/* eslint-disable react-native/no-color-literals */
/* eslint-disable react-native/no-raw-text */
import React, { useState } from 'react';

import { StyleSheet, View } from 'react-native';

import { Link } from 'expo-router';

import { Button, Card, Divider, HelperText, Surface, Text } from 'react-native-paper';

import { useAuth } from '../../hooks/useAuth';
import { validatePasswordResetRequest } from '../../utils/validation';
import { FormInput } from '../ui/FormInput';

export const PasswordResetForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { requestPasswordReset, error, clearError, navigateAfterAuth } = useAuth();

  const handleSubmit = async () => {
    clearError();
    const formErrors = validatePasswordResetRequest(email);

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const success = await requestPasswordReset({ email });
      if (success) {
        // Only update UI state on success, no navigation
        setIsSubmitted(true);
      }
      // On failure, we stay on the form screen
    } catch (error) {
      console.error('Password reset request error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigateAfterAuth('/login');
  };

  if (isSubmitted) {
    return (
      <View style={styles.container}>
        <Card style={styles.successContainer}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.successTitle}>
              Check your email
            </Text>
            <Text variant="bodyMedium" style={styles.successMessage}>
              If an account exists with {email}, we've sent instructions to reset your password.
            </Text>
          </Card.Content>
        </Card>

        <Button mode="contained" onPress={handleBackToLogin} style={styles.button}>
          Back to Login
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error && (
        <Surface style={styles.errorContainer} elevation={0}>
          <HelperText type="error" visible={!!error} style={styles.errorText}>
            {error}
          </HelperText>
        </Surface>
      )}

      <Text variant="bodyLarge" style={styles.instructions}>
        Enter your email address and we'll send you instructions to reset your password.
      </Text>

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

      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={isLoading}
        disabled={isLoading}
        style={styles.button}>
        Reset Password
      </Button>

      <Divider style={styles.divider} />

      <View style={styles.loginContainer}>
        <Text variant="bodyMedium">Remember your password? </Text>
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
  instructions: {
    marginBottom: 24,
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
  successContainer: {
    marginBottom: 24,
  },
  successTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  successMessage: {
    lineHeight: 24,
  },
});
