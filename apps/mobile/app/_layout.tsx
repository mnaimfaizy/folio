import { useEffect, useState } from 'react';

import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { MD3DarkTheme, MD3LightTheme, Provider as PaperProvider } from 'react-native-paper';

import { SplashScreen as CustomSplashScreen } from '../components/SplashScreen';
import Colors from '../constants/Colors';
import { AuthProvider } from '../context/AuthContext';
import { SettingsProvider } from '../context/SettingsContext';
import { useColorScheme } from '../hooks/useColorScheme';
import { useThemeColor } from '../hooks/useThemeColor';

export {
    // Catch any errors thrown by the Layout component.
    ErrorBoundary
} from 'expo-router';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [showCustomSplash, setShowCustomSplash] = useState(true);
  const [loaded, error] = useFonts({
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    PlayfairDisplay: require('../assets/fonts/PlayfairDisplay-Bold.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  if (showCustomSplash) {
    return <CustomSplashScreen onFinish={() => setShowCustomSplash(false)} />;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const backgroundColor = useThemeColor({}, 'background');
  const colorScheme = useColorScheme();

  const { palette } = Colors;

  // Create Paper theme based on device color scheme
  const paperTheme =
    colorScheme === 'dark'
      ? {
          ...MD3DarkTheme,
          roundness: 12,
          colors: {
            ...MD3DarkTheme.colors,
            primary: palette.primaryLight,
            secondary: palette.secondaryDark,
            background: Colors.dark.background,
            surface: Colors.dark.surface,
            surfaceVariant: Colors.dark.surfaceVariant,
            error: palette.errorDark,
          },
        }
      : {
          ...MD3LightTheme,
          roundness: 12,
          colors: {
            ...MD3LightTheme.colors,
            primary: palette.primary,
            secondary: palette.secondary,
            background: Colors.light.background,
            surface: Colors.light.surface,
            surfaceVariant: Colors.light.surfaceVariant,
            error: palette.error,
          },
        };

  return (
    <PaperProvider theme={paperTheme}>
      <SettingsProvider>
        <AuthProvider>
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor },
              headerTitleStyle: { fontFamily: 'SpaceMono' },
              headerTintColor: useThemeColor({}, 'text'),
              animation: 'slide_from_right',
            }}>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </AuthProvider>
      </SettingsProvider>
    </PaperProvider>
  );
}
