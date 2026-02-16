/* eslint-disable react-native/no-color-literals */
/* eslint-disable react-native/no-raw-text */
import React, { useState } from 'react';

import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';

import { Divider, HelperText, IconButton, Surface, Text, useTheme } from 'react-native-paper';

import { useAuth } from '../../hooks/useAuth';
import { validateLogin } from '../../utils/validation';
import { FormInput } from '../ui/FormInput';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const { login, error, clearError } = useAuth();
  const { colors } = useTheme();

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
        <Text variant="bodyMedium" style={[styles.forgotPasswordText, { color: colors.primary }]}>
          Forgot password?
        </Text>
      </Link>

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={isLoading}
        activeOpacity={0.8}
        style={styles.buttonWrapper}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientButton}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text variant="titleMedium" style={styles.buttonText}>
                Logging in...
              </Text>
            </View>
          ) : (
            <View style={styles.buttonContent}>
              <IconButton icon="login" size={20} iconColor="#fff" style={styles.buttonIcon} />
              <Text variant="titleMedium" style={styles.buttonText}>
                Login
              </Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>

      <Divider style={styles.divider} />

      <View style={styles.registerContainer}>
        <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>Don't have an account? </Text>
        <Link href="/signup" asChild>
          <Text variant="bodyMedium" style={[styles.registerLink, { color: colors.primary }]}>
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
  forgotPasswordText: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    fontWeight: '600',
  },
  buttonWrapper: {
    width: '100%',
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#667eea',
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
    marginVertical: 28,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerLink: {
    fontWeight: '700',
  },
});
