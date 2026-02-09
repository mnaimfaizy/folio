import React from 'react';

import { Linking, ScrollView, StyleSheet, View } from 'react-native';

import { Card, Chip, Divider, List, Surface, Text, useTheme } from 'react-native-paper';

import { AppLogo } from '../../components/ui/AppLogo';
import { useSettings } from '../../hooks/useSettings';
import { useThemeColor } from '../../hooks/useThemeColor';

export default function AboutScreen() {
  const { settings, appName } = useSettings();
  const backgroundColor = useThemeColor({}, 'background');
  const { colors } = useTheme();

  const handleOpenLink = (url: string) => {
    if (url) {
      Linking.openURL(url).catch(() => {});
    }
  };

  const getSocialIcon = (platform: string): string => {
    const icons: Record<string, string> = {
      twitter: 'twitter',
      facebook: 'facebook',
      instagram: 'instagram',
      linkedin: 'linkedin',
      github: 'github',
      youtube: 'youtube',
    };
    return icons[platform.toLowerCase()] || 'web';
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor }]}
      showsVerticalScrollIndicator={false}>
      {/* Logo & Description */}
      <View style={styles.headerSection}>
        <AppLogo size="large" showName={true} />
        <Text
          variant="bodyLarge"
          style={[styles.description, { color: colors.onSurfaceVariant }]}>
          {settings.site_description || 'Your digital library management system'}
        </Text>
      </View>

      {/* About Card */}
      <Card style={styles.card} mode="outlined">
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>
            About {appName}
          </Text>
          <Text variant="bodyMedium" style={[styles.aboutText, { color: colors.onSurfaceVariant }]}>
            {settings.hero_subtitle ||
              'Discover, collect, and manage your favorite books in one beautiful place.'}
          </Text>
        </Card.Content>
      </Card>

      {/* Contact Information */}
      {(settings.contact_email || settings.contact_phone || settings.contact_address) && (
        <Card style={styles.card} mode="outlined">
          <Card.Content style={styles.cardHeader}>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Contact Us
            </Text>
          </Card.Content>

          {settings.contact_email && (
            <>
              <List.Item
                title="Email"
                description={settings.contact_email}
                left={props => <List.Icon {...props} icon="email-outline" color={colors.primary} />}
                right={props => <List.Icon {...props} icon="open-in-new" />}
                onPress={() => handleOpenLink(`mailto:${settings.contact_email}`)}
                style={styles.listItem}
              />
              <Divider />
            </>
          )}

          {settings.contact_phone && (
            <>
              <List.Item
                title="Phone"
                description={settings.contact_phone}
                left={props => <List.Icon {...props} icon="phone-outline" color={colors.primary} />}
                right={props => <List.Icon {...props} icon="open-in-new" />}
                onPress={() => handleOpenLink(`tel:${settings.contact_phone}`)}
                style={styles.listItem}
              />
              <Divider />
            </>
          )}

          {settings.contact_address && (
            <List.Item
              title="Address"
              description={settings.contact_address}
              left={props => (
                <List.Icon {...props} icon="map-marker-outline" color={colors.primary} />
              )}
              style={styles.listItem}
            />
          )}
        </Card>
      )}

      {/* Social Links */}
      {settings.social_links && settings.social_links.length > 0 && (
        <Card style={styles.card} mode="outlined">
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Follow Us
            </Text>
            <View style={styles.socialContainer}>
              {settings.social_links.map((link, index) => (
                <Chip
                  key={index}
                  icon={getSocialIcon(link.platform)}
                  onPress={() => handleOpenLink(link.url)}
                  style={styles.socialChip}>
                  {link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>
      )}

      {/* App Info */}
      <Card style={styles.card} mode="outlined">
        <Card.Content style={styles.cardHeader}>
          <Text variant="titleMedium" style={styles.cardTitle}>
            App Information
          </Text>
        </Card.Content>
        <List.Item
          title="Version"
          description="1.0.0"
          left={props => <List.Icon {...props} icon="tag-outline" color={colors.primary} />}
          style={styles.listItem}
        />
        <Divider />
        <List.Item
          title="Platform"
          description="React Native + Expo"
          left={props => <List.Icon {...props} icon="cellphone" color={colors.primary} />}
          style={styles.listItem}
        />
      </Card>

      {/* Footer */}
      <Surface style={styles.footer} elevation={0}>
        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant, textAlign: 'center' }}>
          {settings.footer_text || `\u00A9 ${new Date().getFullYear()} ${appName}. All rights reserved.`}
        </Text>
      </Surface>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  description: {
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 22,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardHeader: {
    paddingBottom: 4,
  },
  cardTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  aboutText: {
    lineHeight: 22,
  },
  listItem: {
    paddingVertical: 4,
  },
  socialContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  socialChip: {
    marginBottom: 4,
  },
  footer: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
});
