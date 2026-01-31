/* eslint-disable react-native/no-color-literals */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';

import { StyleSheet, View } from 'react-native';

import { router, useLocalSearchParams } from 'expo-router';

import { Button, Card, HelperText, Surface, Text } from 'react-native-paper';

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
        <Card style={styles.successContainer}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.successTitle}>
              Email Verified!
            </Text>
            <Text variant="bodyMedium" style={styles.successMessage}>
              Your email has been successfully verified. You can now log in to your account.
            </Text>
          </Card.Content>
        </Card>

        <Button mode="contained" onPress={() => router.replace('/login')} style={styles.button}>
          <Text>Go to Login</Text>
        </Button>
      </View>
    );
  }

  if (resendSuccess) {
    return (
      <View style={styles.container}>
        <Card style={styles.successContainer}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.successTitle}>
              Verification Email Sent
            </Text>
            <Text variant="bodyMedium" style={styles.successMessage}>
              We've sent a new verification email to {email}. Please check your inbox and follow the
              instructions.
            </Text>
          </Card.Content>
        </Card>

        <Button mode="contained" onPress={() => router.replace('/login')} style={styles.button}>
          <Text>Back to Login</Text>
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

      <Card style={styles.messageContainer}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.messageTitle}>
            Verify Your Email
          </Text>
          <Text variant="bodyMedium" style={styles.messageText}>
            Please check your email inbox for a verification link. If you haven't received the
            email, you can request a new one below.
          </Text>
        </Card.Content>
      </Card>

      <FormInput
        label="Email"
        placeholder="Enter your email address"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        icon="email"
      />

      <Button
        mode="contained"
        onPress={handleResendVerification}
        loading={resending}
        disabled={resending || verifying}
        style={styles.button}>
        <Text>Resend Verification Email</Text>
      </Button>

      <Button mode="text" onPress={() => router.replace('/login')} style={styles.backToLoginButton}>
        <Text>Back to Login</Text>
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
  messageContainer: {
    marginBottom: 24,
  },
  messageTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  messageText: {
    lineHeight: 24,
  },
  button: {
    marginTop: 16,
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
  },
  backToLoginButton: {
    marginTop: 16,
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
