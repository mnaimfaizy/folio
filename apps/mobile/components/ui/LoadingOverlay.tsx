import React from 'react';

import { StyleSheet, View } from 'react-native';

import { ActivityIndicator, Text, useTheme } from 'react-native-paper';

import { useThemeColor } from '../../hooks/useThemeColor';

interface LoadingOverlayProps {
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message = 'Loading...' }) => {
  const backgroundColor = useThemeColor({}, 'background');
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ActivityIndicator size="large" color={colors.primary} animating={true} />
      <Text
        variant="bodyLarge"
        style={[styles.message, { color: colors.onSurfaceVariant }]}>
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    marginTop: 20,
    fontWeight: '500',
  },
});
