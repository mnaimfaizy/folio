/* eslint-disable react-native/no-raw-text */
import React from 'react';

import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import { Avatar, Button, Divider, IconButton, List, Surface, Text } from 'react-native-paper';

import { useAuth } from '../../hooks/useAuth';
import { useThemeColor } from '../../hooks/useThemeColor';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const backgroundColor = useThemeColor({}, 'background');

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  const handleChangePassword = () => {
    // In a real app, navigate to change password screen
    Alert.alert('Change Password', 'This feature will be implemented soon!');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <Surface style={styles.profileHeader} elevation={0}>
        <View style={styles.avatarContainer}>
          <Avatar.Text size={100} label={(user?.name?.charAt(0) || 'U').toUpperCase()} />
          <IconButton icon="camera" mode="contained" size={20} style={styles.editAvatarButton} />
        </View>

        <Text variant="headlineSmall" style={styles.profileName}>
          {user?.name || 'User'}
        </Text>
        <Text variant="bodyLarge" style={styles.profileEmail}>
          {user?.email || 'email@example.com'}
        </Text>
      </Surface>

      <Surface style={styles.sectionContainer} elevation={0}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Account
        </Text>

        <List.Item
          title="Edit Profile"
          left={props => <List.Icon {...props} icon="account-edit" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          style={styles.listItem}
          onPress={() => {}}
        />

        <List.Item
          title="Change Password"
          left={props => <List.Icon {...props} icon="lock" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          style={styles.listItem}
          onPress={handleChangePassword}
        />
      </Surface>

      <Divider />

      <Surface style={styles.sectionContainer} elevation={0}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Library Activity
        </Text>

        <List.Item
          title="Borrowed Books"
          description="0 books"
          left={props => <List.Icon {...props} icon="book" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          style={styles.listItem}
          onPress={() => {}}
        />

        <List.Item
          title="Reading History"
          left={props => <List.Icon {...props} icon="history" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          style={styles.listItem}
          onPress={() => {}}
        />

        <List.Item
          title="Wishlist"
          left={props => <List.Icon {...props} icon="bookmark" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          style={styles.listItem}
          onPress={() => {}}
        />
      </Surface>

      <Divider />

      <Surface style={styles.sectionContainer} elevation={0}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Preferences
        </Text>

        <List.Item
          title="Notifications"
          left={props => <List.Icon {...props} icon="bell" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          style={styles.listItem}
          onPress={() => {}}
        />

        <List.Item
          title="App Appearance"
          left={props => <List.Icon {...props} icon="theme-light-dark" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          style={styles.listItem}
          onPress={() => {}}
        />
      </Surface>

      <View style={styles.actionsContainer}>
        <Button
          mode="contained-tonal"
          icon="logout"
          buttonColor="rgba(255, 59, 48, 0.1)"
          textColor="#ff3b30"
          style={styles.logoutButton}
          onPress={handleLogout}>
          Logout
        </Button>

        <Text variant="bodySmall" style={styles.versionText}>
          Version 1.0.0
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    margin: 0,
  },
  profileName: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  profileEmail: {
    opacity: 0.7,
  },
  sectionContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    marginLeft: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  listItem: {
    paddingVertical: 8,
  },
  actionsContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  logoutButton: {
    width: '100%',
    marginBottom: 32,
  },
  versionText: {
    opacity: 0.5,
  },
});
