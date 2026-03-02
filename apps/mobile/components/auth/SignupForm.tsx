 
 
import React, { useState } from 'react';

import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';

import { Divider, HelperText, IconButton, Surface, Text, useTheme } from 'react-native-paper';

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
  const { colors } = useTheme();

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
                Creating account...
              </Text>
            </View>
          ) : (
            <View style={styles.buttonContent}>
              <IconButton icon="account-plus" size={20} iconColor="#fff" style={styles.buttonIcon} />
              <Text variant="titleMedium" style={styles.buttonText}>
                Sign Up
              </Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>

      <Divider style={styles.divider} />

      <View style={styles.loginContainer}>
        <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>Already have an account? </Text>
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
});
