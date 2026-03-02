 
 
import React, { useState } from 'react';

import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';

import { Divider, HelperText, IconButton, Surface, Text, useTheme } from 'react-native-paper';

import { useAuth } from '../../hooks/useAuth';
import { validatePasswordResetRequest } from '../../utils/validation';
import { FormInput } from '../ui/FormInput';

export const PasswordResetForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { requestPasswordReset, error, clearError, navigateAfterAuth } = useAuth();
  const { colors } = useTheme();

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
        <Surface style={styles.successContainer} elevation={2}>
          <View style={styles.successIconContainer}>
            <LinearGradient
              colors={['#4facfe', '#00f2fe']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.successIconGradient}>
              <IconButton icon="email-check" size={40} iconColor="#fff" style={styles.successIcon} />
            </LinearGradient>
          </View>
          <Text variant="titleLarge" style={styles.successTitle}>
            Check your email
          </Text>
          <Text variant="bodyMedium" style={[styles.successMessage, { color: colors.onSurfaceVariant }]}>
            If an account exists with {email}, we've sent instructions to reset your password.
          </Text>
        </Surface>

        <TouchableOpacity onPress={handleBackToLogin} activeOpacity={0.8} style={styles.buttonWrapper}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientButton}>
            <View style={styles.buttonContent}>
              <IconButton icon="arrow-left" size={20} iconColor="#fff" style={styles.buttonIcon} />
              <Text variant="titleMedium" style={styles.buttonText}>
                Back to Login
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

      <Text variant="bodyLarge" style={[styles.instructions, { color: colors.onSurfaceVariant }]}>
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

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={isLoading}
        activeOpacity={0.8}
        style={styles.buttonWrapper}>
        <LinearGradient
          colors={['#4facfe', '#00f2fe']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientButton}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text variant="titleMedium" style={styles.buttonText}>
                Sending...
              </Text>
            </View>
          ) : (
            <View style={styles.buttonContent}>
              <IconButton icon="email-fast" size={20} iconColor="#fff" style={styles.buttonIcon} />
              <Text variant="titleMedium" style={styles.buttonText}>
                Reset Password
              </Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>

      <Divider style={styles.divider} />

      <View style={styles.loginContainer}>
        <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>Remember your password? </Text>
        <Link href="/login" asChild>
          <Text variant="bodyMedium" style={[styles.loginLink, { color: colors.primary }]}>
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
    shadowColor: '#4facfe',
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
  divider: {
    marginTop: 28,
    marginBottom: 20,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginLink: {
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
