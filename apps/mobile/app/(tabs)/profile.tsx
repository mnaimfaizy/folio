import React, { useCallback, useEffect, useState } from 'react';

import { Alert, Linking, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';

import {
    Avatar,
    Button,
    Chip,
    IconButton,
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
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }>
      {/* Profile Header with Gradient */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.profileHeader}>
        <Avatar.Text
          size={100}
          label={userInitials}
          style={styles.avatar}
          labelStyle={styles.avatarLabel}
        />

        <Text variant="headlineMedium" style={styles.profileName}>
          {user?.name || 'User'}
        </Text>
        <Text variant="bodyLarge" style={styles.profileEmail}>
          {user?.email || 'email@example.com'}
        </Text>

        {user?.role && (
          <Chip icon="shield-account" style={styles.roleBadge} textStyle={styles.roleText}>
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </Chip>
        )}
      </LinearGradient>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <Surface style={styles.statCard} elevation={2}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statGradient}>
            <IconButton icon="bookmark" size={32} iconColor="#fff" style={styles.statIcon} />
            <Text variant="headlineMedium" style={styles.statNumber}>
              {collectionCount}
            </Text>
            <Text variant="labelMedium" style={styles.statLabel}>
              Saved Books
            </Text>
          </LinearGradient>
        </Surface>
        
        <Surface style={styles.statCard} elevation={2}>
          <LinearGradient
            colors={['#f093fb', '#f5576c']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statGradient}>
            <IconButton 
              icon={user?.email_verified ? 'check-circle' : 'close-circle'} 
              size={32} 
              iconColor="#fff" 
              style={styles.statIcon} 
            />
            <Text variant="headlineMedium" style={styles.statNumber}>
              {user?.email_verified ? 'Yes' : 'No'}
            </Text>
            <Text variant="labelMedium" style={styles.statLabel}>
              Verified
            </Text>
          </LinearGradient>
        </Surface>
      </View>

      {/* Account Section */}
      <Surface style={styles.sectionCard} elevation={2}>
        <View style={styles.sectionHeader}>
          <IconButton icon="account" size={28} iconColor={colors.primary} style={styles.sectionIcon} />
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Account
          </Text>
        </View>

        <View style={styles.sectionContent}>
          <View style={styles.infoItem}>
            <View style={styles.infoIconContainer}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.infoIconGradient}>
                <IconButton icon="email" size={18} iconColor="#fff" style={styles.infoIcon} />
              </LinearGradient>
            </View>
            <View style={styles.infoContent}>
              <Text variant="labelSmall" style={[styles.infoLabel, { color: colors.onSurfaceVariant }]}>
                Email Address
              </Text>
              <Text variant="bodyLarge" style={styles.infoValue}>
                {user?.email || 'Not set'}
              </Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoIconContainer}>
              <LinearGradient
                colors={user?.email_verified ? ['#4facfe', '#00f2fe'] : ['#ff6b6b', '#ee5a6f']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.infoIconGradient}>
                <IconButton 
                  icon={user?.email_verified ? 'check-circle' : 'alert-circle'} 
                  size={18} 
                  iconColor="#fff" 
                  style={styles.infoIcon} 
                />
              </LinearGradient>
            </View>
            <View style={styles.infoContent}>
              <Text variant="labelSmall" style={[styles.infoLabel, { color: colors.onSurfaceVariant }]}>
                Account Status
              </Text>
              <Text variant="bodyLarge" style={styles.infoValue}>
                {user?.email_verified ? 'Verified' : 'Not verified'}
              </Text>
            </View>
          </View>
        </View>
      </Surface>

      {/* Library Section */}
      <Surface style={styles.sectionCard} elevation={2}>
        <View style={styles.sectionHeader}>
          <IconButton icon="book-open-variant" size={28} iconColor={colors.primary} style={styles.sectionIcon} />
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Library Activity
          </Text>
        </View>

        <View style={styles.sectionContent}>
          <View style={styles.infoItem}>
            <View style={styles.infoIconContainer}>
              <LinearGradient
                colors={['#f093fb', '#f5576c']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.infoIconGradient}>
                <IconButton icon="bookmark-multiple" size={18} iconColor="#fff" style={styles.infoIcon} />
              </LinearGradient>
            </View>
            <View style={styles.infoContent}>
              <Text variant="labelSmall" style={[styles.infoLabel, { color: colors.onSurfaceVariant }]}>
                My Collection
              </Text>
              <Text variant="bodyLarge" style={styles.infoValue}>
                {collectionCount} saved books
              </Text>
            </View>
          </View>
        </View>
      </Surface>

      {/* Support Section */}
      <Surface style={styles.sectionCard} elevation={2}>
        <View style={styles.sectionHeader}>
          <IconButton icon="help-circle" size={28} iconColor={colors.primary} style={styles.sectionIcon} />
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Support
          </Text>
        </View>

        <View style={styles.sectionContent}>
          <View style={[styles.infoItem, styles.clickableItem]} onTouchEnd={handleContactSupport}>
            <View style={styles.infoIconContainer}>
              <LinearGradient
                colors={['#4facfe', '#00f2fe']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.infoIconGradient}>
                <IconButton icon="email-fast" size={18} iconColor="#fff" style={styles.infoIcon} />
              </LinearGradient>
            </View>
            <View style={styles.infoContent}>
              <Text variant="labelSmall" style={[styles.infoLabel, { color: colors.onSurfaceVariant }]}>
                Contact Support
              </Text>
              <Text variant="bodyLarge" style={[styles.infoValue, { color: colors.primary }]}>
                {settings.contact_email || 'Get help with your account'}
              </Text>
            </View>
            <IconButton icon="chevron-right" size={20} iconColor={colors.onSurfaceVariant} style={styles.chevron} />
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoIconContainer}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.infoIconGradient}>
                <IconButton icon="information" size={18} iconColor="#fff" style={styles.infoIcon} />
              </LinearGradient>
            </View>
            <View style={styles.infoContent}>
              <Text variant="labelSmall" style={[styles.infoLabel, { color: colors.onSurfaceVariant }]}>
                About
              </Text>
              <Text variant="bodyLarge" style={styles.infoValue}>
                {appName} v1.0.0
              </Text>
            </View>
          </View>
        </View>
      </Surface>

      {/* Logout */}
      <View style={styles.actionsContainer}>
        <Button
          mode="contained"
          icon="logout"
          buttonColor={colors.error}
          style={styles.logoutButton}
          contentStyle={styles.logoutButtonContent}
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
  scrollContent: {
    paddingBottom: 100,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  avatar: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarLabel: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 40,
  },
  profileName: {
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 4,
    color: '#fff',
  },
  profileEmail: {
    marginBottom: 12,
    color: 'rgba(255,255,255,0.9)',
  },
  roleBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  roleText: {
    color: '#fff',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: -30,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statGradient: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  statIcon: {
    margin: 0,
    marginBottom: 4,
  },
  statNumber: {
    fontWeight: '800',
    marginBottom: 4,
    color: '#fff',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.9)',
  },
  sectionCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIcon: {
    margin: 0,
    marginRight: 8,
  },
  sectionTitle: {
    fontWeight: '700',
  },
  sectionContent: {
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clickableItem: {
    paddingVertical: 4,
  },
  infoIconContainer: {
    marginRight: 12,
  },
  infoIconGradient: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoIcon: {
    margin: 0,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    marginBottom: 2,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontWeight: '600',
  },
  chevron: {
    margin: 0,
  },
  actionsContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  logoutButton: {
    width: '100%',
    marginBottom: 24,
    borderRadius: 24,
  },
  logoutButtonContent: {
    paddingVertical: 6,
  },
  versionText: {
    textAlign: 'center',
  },
});
