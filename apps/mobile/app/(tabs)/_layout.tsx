/* eslint-disable react-native/no-inline-styles */
import { Platform } from 'react-native';

import { Redirect, Tabs } from 'expo-router';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Appbar, useTheme } from 'react-native-paper';

import { LoadingOverlay } from '../../components/ui/LoadingOverlay';
import { useAuth } from '../../hooks/useAuth';
import { useSettings } from '../../hooks/useSettings';
import { useThemeColor } from '../../hooks/useThemeColor';

function TabIcon(props: {
  name: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  color: string;
  size: number;
}) {
  return <MaterialCommunityIcons {...props} />;
}

export default function TabLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const { appName } = useSettings();
  const { colors } = useTheme();

  const tabBackgroundColor = useThemeColor({}, 'tabBackground');
  const tabIconDefault = useThemeColor({}, 'tabIconDefault');
  const borderColor = useThemeColor({}, 'border');

  if (isLoading) {
    return <LoadingOverlay message="Loading..." />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: tabIconDefault,
        tabBarStyle: {
          backgroundColor: tabBackgroundColor,
          borderTopColor: borderColor,
          borderTopWidth: 0.5,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.2,
        },
        headerShown: true,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="home" color={color} size={size} />
          ),
          header: () => (
            <Appbar.Header elevated>
              <Appbar.Content title={appName} titleStyle={{ fontWeight: '700' }} />
            </Appbar.Header>
          ),
        }}
      />
      <Tabs.Screen
        name="books"
        options={{
          title: 'Books',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="book-open-page-variant" color={color} size={size} />
          ),
          header: () => (
            <Appbar.Header elevated>
              <Appbar.Content title="Books" titleStyle={{ fontWeight: '700' }} />
            </Appbar.Header>
          ),
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: 'About',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="information" color={color} size={size} />
          ),
          header: () => (
            <Appbar.Header elevated>
              <Appbar.Content title="About" titleStyle={{ fontWeight: '700' }} />
            </Appbar.Header>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="account-circle" color={color} size={size} />
          ),
          header: () => (
            <Appbar.Header elevated>
              <Appbar.Content title="Profile" titleStyle={{ fontWeight: '700' }} />
            </Appbar.Header>
          ),
        }}
      />
    </Tabs>
  );
}
