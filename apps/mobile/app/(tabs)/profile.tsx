import React, { useCallback, useEffect, useState } from 'react';

import { Alert, Linking, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { useFocusEffect } from 'expo-router';

import {
    Avatar,
    Button,
    Card,
    Chip,
    Divider,
    List,
    Surface,
    Text,
    useTheme,
} from 'react-native-paper';

import { useAuth } from '../../hooks/useAuth';
import { useSettings } from '../../hooks/useSettings';
import { useThemeColor } from '../../hooks/useThemeColor';
import { bookService } from '../../services/bookService';

export default function ProfileScreen() {
  const { user, logout, isLoading: authLoading, isAuthenticated } = useAuth();
  const { appName, settings } = useSettings();
  const backgroundColor = useThemeColor({}, 'background');
  const { colors } = useTheme();

  const [collectionCount, setCollectionCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCollectionCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await bookService.getUserCollection();
      setCollectionCount(res.books?.length || 0);
    } catch {
      // Silently fail
    }
  }, [isAuthenticated]);

  // Wait for auth to finish before fetching collection
  useEffect(() => {
    if (!authLoading) {
      fetchCollectionCount();
    }
  }, [fetchCollectionCount, authLoading]);

  useFocusEffect(
    useCallback(() => {
      if (!authLoading) {
        fetchCollectionCount();
      }
    }, [fetchCollectionCount, authLoading])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCollectionCount();
    setRefreshing(false);
  }, [fetchCollectionCount]);

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

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  const handleContactSupport = () => {
    if (settings.contact_email) {
      Linking.openURL(`mailto:${settings.contact_email}`).catch(() => {
        Alert.alert('Error', 'Unable to open email client');
      });
    } else {
      Alert.alert('Contact', 'No contact email configured.');
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }>
      {/* Profile Header */}
      <Surface style={styles.profileHeader} elevation={0}>
        <Avatar.Text
          size={96}
          label={userInitials}
          style={{ backgroundColor: colors.primaryContainer }}
          labelStyle={{
            color: colors.primary,
            fontWeight: '700',
            fontSize: 36,
          }}
        />

        <Text variant="headlineSmall" style={styles.profileName}>
          {user?.name || 'User'}
        </Text>
        <Text variant="bodyLarge" style={[styles.profileEmail, { color: colors.onSurfaceVariant }]}>
          {user?.email || 'email@example.com'}
        </Text>

        {user?.role && (
          <Chip icon="shield-account" style={styles.roleBadge} compact>
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </Chip>
        )}
      </Surface>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <Surface style={[styles.statCard, { backgroundColor: colors.primaryContainer }]} elevation={0}>
          <Text variant="headlineMedium" style={[styles.statNumber, { color: colors.primary }]}>
            {collectionCount}
          </Text>
          <Text variant="labelMedium" style={{ color: colors.primary }}>
            Saved Books
          </Text>
        </Surface>
        <Surface style={[styles.statCard, { backgroundColor: colors.secondaryContainer }]} elevation={0}>
          <Text variant="headlineMedium" style={[styles.statNumber, { color: colors.secondary }]}>
            {user?.email_verified ? 'Yes' : 'No'}
          </Text>
          <Text variant="labelMedium" style={{ color: colors.secondary }}>
            Verified
          </Text>
        </Surface>
      </View>

      {/* Account Section */}
      <Card style={styles.sectionCard} mode="outlined">
        <Card.Content style={styles.sectionContent}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Account
          </Text>
        </Card.Content>
        <List.Item
          title="Email Address"
          description={user?.email || 'Not set'}
          left={props => <List.Icon {...props} icon="email-outline" color={colors.primary} />}
          style={styles.listItem}
        />
        <Divider />
        <List.Item
          title="Account Status"
          description={user?.email_verified ? 'Verified' : 'Not verified'}
          left={props => (
            <List.Icon
              {...props}
              icon={user?.email_verified ? 'check-circle-outline' : 'alert-circle-outline'}
              color={user?.email_verified ? colors.primary : colors.error}
            />
          )}
          style={styles.listItem}
        />
      </Card>

      {/* Library Section */}
      <Card style={styles.sectionCard} mode="outlined">
        <Card.Content style={styles.sectionContent}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Library Activity
          </Text>
        </Card.Content>
        <List.Item
          title="My Collection"
          description={`${collectionCount} saved books`}
          left={props => <List.Icon {...props} icon="bookmark-multiple" color={colors.primary} />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          style={styles.listItem}
        />
      </Card>

      {/* Support Section */}
      <Card style={styles.sectionCard} mode="outlined">
        <Card.Content style={styles.sectionContent}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Support
          </Text>
        </Card.Content>
        <List.Item
          title="Contact Support"
          description={settings.contact_email || 'Get help with your account'}
          left={props => <List.Icon {...props} icon="help-circle-outline" color={colors.primary} />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          style={styles.listItem}
          onPress={handleContactSupport}
        />
        <Divider />
        <List.Item
          title="About"
          description={`${appName} v1.0.0`}
          left={props => <List.Icon {...props} icon="information-outline" color={colors.primary} />}
          style={styles.listItem}
        />
      </Card>

      {/* Logout */}
      <View style={styles.actionsContainer}>
        <Button
          mode="outlined"
          icon="logout"
          textColor={colors.error}
          style={[styles.logoutButton, { borderColor: colors.error }]}
          onPress={handleLogout}>
          Log Out
        </Button>

        <Text
          variant="bodySmall"
          style={[styles.versionText, { color: colors.onSurfaceVariant }]}>
          {appName} v1.0.0
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
    paddingVertical: 28,
    paddingHorizontal: 20,
  },
  profileName: {
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 4,
  },
  profileEmail: {
    marginBottom: 8,
  },
  roleBadge: {
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    alignItems: 'center',
    paddingVertical: 20,
  },
  statNumber: {
    fontWeight: '800',
    marginBottom: 2,
  },
  sectionCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionContent: {
    paddingBottom: 4,
  },
  sectionTitle: {
    fontWeight: '600',
  },
  listItem: {
    paddingVertical: 6,
  },
  actionsContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    paddingBottom: 48,
  },
  logoutButton: {
    width: '100%',
    marginBottom: 24,
    borderRadius: 12,
  },
  versionText: {
    textAlign: 'center',
  },
});
