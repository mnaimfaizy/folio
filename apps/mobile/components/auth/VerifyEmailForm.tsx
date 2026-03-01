 
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';

import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';

import { Button, HelperText, IconButton, Surface, Text, useTheme } from 'react-native-paper';

import { useAuth } from '../../hooks/useAuth';
import { isValidEmail } from '../../utils/validation';
import { FormInput } from '../ui/FormInput';

export const VerifyEmailForm: React.FC = () => {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const { verifyEmail, resendVerification } = useAuth();
  const { colors } = useTheme();

  const handleVerifyToken = async (verificationToken: string) => {
    setVerifying(true);
    setError(null);

    try {
      await verifyEmail(verificationToken);
      setVerificationSuccess(true);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Failed to verify email. The token may be invalid or expired.'
      );
    } finally {
      setVerifying(false);
    }
  };

  // If we have a token in the URL, try to verify it
  useEffect(() => {
    if (token) {
      handleVerifyToken(token as string);
    }
  }, [token]);

  const handleResendVerification = async () => {
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setResending(true);
    setError(null);

    try {
      await resendVerification(email);
      setResendSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend verification email');
    } finally {
      setResending(false);
    }
  };

  if (verificationSuccess) {
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
            Email Verified!
          </Text>
          <Text variant="bodyMedium" style={[styles.successMessage, { color: colors.onSurfaceVariant }]}>
            Your email has been successfully verified. You can now log in to your account.
          </Text>
        </Surface>

        <TouchableOpacity onPress={() => router.replace('/login')} activeOpacity={0.8} style={styles.buttonWrapper}>
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

  if (resendSuccess) {
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
            Verification Email Sent
          </Text>
          <Text variant="bodyMedium" style={[styles.successMessage, { color: colors.onSurfaceVariant }]}>
            We've sent a new verification email to {email}. Please check your inbox and follow the
            instructions.
          </Text>
        </Surface>

        <TouchableOpacity onPress={() => router.replace('/login')} activeOpacity={0.8} style={styles.buttonWrapper}>
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

      <Surface style={styles.messageContainer} elevation={1}>
        <Text variant="titleLarge" style={styles.messageTitle}>
          Verify Your Email
        </Text>
        <Text variant="bodyMedium" style={[styles.messageText, { color: colors.onSurfaceVariant }]}>
          Please check your email inbox for a verification link. If you haven't received the
          email, you can request a new one below.
        </Text>
      </Surface>

      <FormInput
        label="Email"
        placeholder="Enter your email address"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        icon="email"
      />

      <TouchableOpacity
        onPress={handleResendVerification}
        disabled={resending || verifying}
        activeOpacity={0.8}
        style={styles.buttonWrapper}>
        <LinearGradient
          colors={['#f093fb', '#f5576c']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientButton}>
          {resending ? (
            <View style={styles.loadingContainer}>
              <Text variant="titleMedium" style={styles.buttonText}>
                Sending...
              </Text>
            </View>
          ) : (
            <View style={styles.buttonContent}>
              <IconButton icon="email-fast" size={20} iconColor="#fff" style={styles.buttonIcon} />
              <Text variant="titleMedium" style={styles.buttonText}>
                Resend Verification Email
              </Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>

      <Button 
        mode="text" 
        onPress={() => router.replace('/login')} 
        style={styles.backToLoginButton}
        labelStyle={{ color: colors.primary, fontWeight: '600' }}>
        Back to Login
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
  messageContainer: {
    marginBottom: 24,
    borderRadius: 16,
    padding: 20,
  },
  messageTitle: {
    fontWeight: '700',
    marginBottom: 12,
  },
  messageText: {
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
  backToLoginButton: {
    marginTop: 20,
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

