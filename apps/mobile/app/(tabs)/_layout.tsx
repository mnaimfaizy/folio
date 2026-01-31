/* eslint-disable react-native/no-inline-styles */
import { Redirect, Tabs } from 'expo-router';

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Appbar, useTheme } from 'react-native-paper';

import { LoadingOverlay } from '../../components/ui/LoadingOverlay';
import { useAuth } from '../../hooks/useAuth';
import { useThemeColor } from '../../hooks/useThemeColor';

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const { colors } = useTheme();

  const tabBackgroundColor = useThemeColor({}, 'tabBackground');
  const tabIconDefault = useThemeColor({}, 'tabIconDefault');

  // Show loading screen while checking authentication status
  if (isLoading) {
    return <LoadingOverlay message="Loading..." />;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  // Custom header using Appbar.Header component
  const HomeHeader = () => (
    <Appbar.Header>
      <Appbar.Content title="MNF Library" />
    </Appbar.Header>
  );

  const BooksHeader = () => (
    <Appbar.Header>
      <Appbar.Content title="Books" />
      <Appbar.Action icon="magnify" onPress={() => {}} />
      <Appbar.Action icon="filter-variant" onPress={() => {}} />
    </Appbar.Header>
  );

  const ProfileHeader = () => (
    <Appbar.Header>
      <Appbar.Content title="Profile" />
      <Appbar.Action icon="cog" onPress={() => {}} />
    </Appbar.Header>
  );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: tabIconDefault,
        tabBarStyle: {
          backgroundColor: tabBackgroundColor,
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
        // We need to show headers with custom components
        headerShown: true,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          header: () => <HomeHeader />,
        }}
      />
      <Tabs.Screen
        name="books"
        options={{
          title: 'Books',
          tabBarIcon: ({ color }) => <TabBarIcon name="book" color={color} />,
          header: () => <BooksHeader />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
          header: () => <ProfileHeader />,
        }}
      />
    </Tabs>
  );
}
