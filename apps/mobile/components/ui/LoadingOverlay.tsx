import React from 'react';

import { StyleSheet, View } from 'react-native';

import { ActivityIndicator, Surface, Text, useTheme } from 'react-native-paper';

import { useThemeColor } from '../../hooks/useThemeColor';

interface LoadingOverlayProps {
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message = 'Loading...' }) => {
  const backgroundColor = useThemeColor({}, 'background');
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: backgroundColor + 'dd' }]}>
      <Surface style={styles.loadingContainer} elevation={4}>
        <ActivityIndicator size="large" color={colors.primary} animating={true} />
        <Text variant="bodyLarge" style={styles.message}>
          {message}
        </Text>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContainer: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
  },
  message: {
    marginTop: 16,
    fontWeight: '500',
  },
});
