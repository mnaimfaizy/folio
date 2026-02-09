import React from 'react';

import { Image, StyleSheet, View } from 'react-native';

import { Text, useTheme } from 'react-native-paper';

import { useSettings } from '../../hooks/useSettings';

interface AppLogoProps {
  size?: 'small' | 'medium' | 'large';
  showName?: boolean;
}

const SIZES = {
  small: 60,
  medium: 90,
  large: 120,
};

export const AppLogo: React.FC<AppLogoProps> = ({ size = 'medium', showName = true }) => {
  const { appName, logoUrl } = useSettings();
  const { colors } = useTheme();
  const imageSize = SIZES[size];

  const imageSource = logoUrl
    ? { uri: logoUrl }
    : require('../../assets/images/logo.png');

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.logoWrapper,
          {
            width: imageSize + 20,
            height: imageSize + 20,
            borderRadius: (imageSize + 20) / 2,
            backgroundColor: colors.surfaceVariant,
          },
        ]}>
        <Image
          source={imageSource}
          style={[styles.logo, { width: imageSize, height: imageSize }]}
          resizeMode="contain"
        />
      </View>
      {showName && (
        <Text
          variant={size === 'large' ? 'headlineMedium' : 'titleLarge'}
          style={[styles.appName, { color: colors.onBackground }]}>
          {appName}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logo: {
    borderRadius: 16,
  },
  appName: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
