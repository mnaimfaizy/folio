/* eslint-disable react-native/no-color-literals */
/* eslint-disable react-native/no-raw-text */
import React, { useState } from 'react';

import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';

import { HelperText, IconButton, Surface, Text, useTheme } from 'react-native-paper';

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
  const { colors } = useTheme();

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
        <Surface style={styles.successContainer} elevation={2}>
          <View style={styles.successIconContainer}>
            <LinearGradient
              colors={['#4facfe', '#00f2fe']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.successIconGradient}>
              <IconButton icon="check-circle" size={40} iconColor="#fff" style={styles.successIcon} />
            </LinearGradient>
          </View>
          <Text variant="titleLarge" style={styles.successTitle}>
            Password Reset Complete
          </Text>
          <Text variant="bodyMedium" style={[styles.successMessage, { color: colors.onSurfaceVariant }]}>
            Your password has been reset successfully. You can now log in with your new password.
          </Text>
        </Surface>

        <TouchableOpacity onPress={handleGoToLogin} activeOpacity={0.8} style={styles.buttonWrapper}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientButton}>
            <View style={styles.buttonContent}>
              <IconButton icon="login" size={20} iconColor="#fff" style={styles.buttonIcon} />
              <Text variant="titleMedium" style={styles.buttonText}>
                Go to Login
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
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

      <Text variant="bodyLarge" style={[styles.instructions, { color: colors.onSurfaceVariant }]}>
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

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={isLoading}
        activeOpacity={0.8}
        style={styles.buttonWrapper}>
        <LinearGradient
          colors={['#f093fb', '#f5576c']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientButton}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text variant="titleMedium" style={styles.buttonText}>
                Resetting...
              </Text>
            </View>
          ) : (
            <View style={styles.buttonContent}>
              <IconButton icon="lock-reset" size={20} iconColor="#fff" style={styles.buttonIcon} />
              <Text variant="titleMedium" style={styles.buttonText}>
                Reset Password
              </Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.1)',
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  instructions: {
    marginBottom: 24,
    lineHeight: 24,
  },
  buttonWrapper: {
    width: '100%',
    marginTop: 24,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#f093fb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gradientButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    margin: 0,
    marginRight: -4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
  successContainer: {
    marginBottom: 32,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  successIconContainer: {
    marginBottom: 20,
  },
  successIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIcon: {
    margin: 0,
  },
  successTitle: {
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    lineHeight: 24,
    textAlign: 'center',
  },
});
