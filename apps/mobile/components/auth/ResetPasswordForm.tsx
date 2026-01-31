/* eslint-disable react-native/no-color-literals */
/* eslint-disable react-native/no-raw-text */
import React, { useState } from 'react';

import { StyleSheet, View } from 'react-native';

import { useLocalSearchParams } from 'expo-router';

import { Button, Card, HelperText, Surface, Text } from 'react-native-paper';

import { useAuth } from '../../hooks/useAuth';
import { validatePasswordReset } from '../../utils/validation';
import { FormInput } from '../ui/FormInput';

export const ResetPasswordForm: React.FC = () => {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { resetPassword, error, clearError, navigateAfterAuth } = useAuth();

  const handleSubmit = async () => {
    clearError();
    const formErrors = validatePasswordReset(password, confirmPassword);

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    if (!token) {
      setErrors({
        general: 'Reset token is missing. Please request a new password reset link.',
      });
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const success = await resetPassword({ token: token as string, newPassword: password });
      if (success) {
        setIsSuccess(true);
      }
      // On failure, we stay on this screen - no navigation
    } catch (error) {
      console.error('Password reset error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToLogin = () => {
    navigateAfterAuth('/login');
  };

  if (isSuccess) {
    return (
      <View style={styles.container}>
        <Card style={styles.successContainer}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.successTitle}>
              Password Reset Complete
            </Text>
            <Text variant="bodyMedium" style={styles.successMessage}>
              Your password has been reset successfully. You can now log in with your new password.
            </Text>
          </Card.Content>
        </Card>

        <Button mode="contained" onPress={handleGoToLogin} style={styles.button}>
          Go to Login
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

      {errors.general && (
        <Surface style={styles.errorContainer} elevation={0}>
          <HelperText type="error" visible={!!errors.general} style={styles.errorText}>
            {errors.general}
          </HelperText>
        </Surface>
      )}

      <Text variant="bodyLarge" style={styles.instructions}>
        Please enter your new password.
      </Text>

      <FormInput
        label="New Password"
        placeholder="Enter your new password"
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
        label="Confirm New Password"
        placeholder="Re-enter your new password"
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
        Reset Password
      </Button>
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
