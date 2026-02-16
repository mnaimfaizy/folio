import React from 'react';

import { Linking, ScrollView, StyleSheet, View } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

import {
  Chip,
  IconButton,
  Surface,
  Text,
  useTheme,
} from 'react-native-paper';

import { AppLogo } from '../../components/ui/AppLogo';
import { useSettings } from '../../hooks/useSettings';
import { useThemeColor } from '../../hooks/useThemeColor';

export default function AboutScreen() {
  const { settings, appName } = useSettings();
  const backgroundColor = useThemeColor({}, 'background');
  const { colors } = useTheme();

  const handleOpenLink = (url: string) => {
    if (url) {
      Linking.openURL(url).catch(() => undefined);
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
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Hero Section with Gradient */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroSection}>
        <View style={styles.logoContainer}>
          <AppLogo size="large" showName={false} />
        </View>
        <Text variant="headlineLarge" style={styles.heroTitle}>
          {appName}
        </Text>
        <Text variant="bodyLarge" style={styles.heroSubtitle}>
          {settings.site_description || 'Your digital library management system'}
        </Text>
      </LinearGradient>

      {/* About Card */}
      <Surface style={styles.card} elevation={2}>
        <View style={styles.cardHeader}>
          <IconButton icon="information" size={28} iconColor={colors.primary} style={styles.cardIcon} />
          <Text variant="titleLarge" style={styles.cardTitle}>
            About {appName}
          </Text>
        </View>
        <Text variant="bodyMedium" style={[styles.cardText, { color: colors.onSurfaceVariant }]}>
          {settings.hero_subtitle || 'Discover, collect, and manage your favorite books in one beautiful place.'}
        </Text>
      </Surface>

      {/* Contact Information */}
      {(settings.contact_email || settings.contact_phone || settings.contact_address) && (
        <Surface style={styles.card} elevation={2}>
          <View style={styles.cardHeader}>
            <IconButton icon="phone" size={28} iconColor={colors.primary} style={styles.cardIcon} />
            <Text variant="titleLarge" style={styles.cardTitle}>
              Contact Us
            </Text>
          </View>

          <View style={styles.contactList}>
            {settings.contact_email && (
              <View style={styles.contactItem}>
                <View style={styles.contactIconContainer}>
                  <IconButton icon="email" size={20} iconColor="#fff" style={styles.contactIcon} />
                </View>
                <View style={styles.contactContent}>
                  <Text variant="labelSmall" style={[styles.contactLabel, { color: colors.onSurfaceVariant }]}>
                    Email
                  </Text>
                  <Text
                    variant="bodyLarge"
                    style={[styles.contactValue, { color: colors.primary }]}
                    onPress={() => handleOpenLink(`mailto:${settings.contact_email}`)}>
                    {settings.contact_email}
                  </Text>
                </View>
              </View>
            )}

            {settings.contact_phone && (
              <View style={styles.contactItem}>
                <View style={styles.contactIconContainer}>
                  <IconButton icon="phone" size={20} iconColor="#fff" style={styles.contactIcon} />
                </View>
                <View style={styles.contactContent}>
                  <Text variant="labelSmall" style={[styles.contactLabel, { color: colors.onSurfaceVariant }]}>
                    Phone
                  </Text>
                  <Text
                    variant="bodyLarge"
                    style={[styles.contactValue, { color: colors.primary }]}
                    onPress={() => handleOpenLink(`tel:${settings.contact_phone}`)}>
                    {settings.contact_phone}
                  </Text>
                </View>
              </View>
            )}

            {settings.contact_address && (
              <View style={styles.contactItem}>
                <View style={styles.contactIconContainer}>
                  <IconButton icon="map-marker" size={20} iconColor="#fff" style={styles.contactIcon} />
                </View>
                <View style={styles.contactContent}>
                  <Text variant="labelSmall" style={[styles.contactLabel, { color: colors.onSurfaceVariant }]}>
                    Address
                  </Text>
                  <Text variant="bodyMedium" style={styles.contactValue}>
                    {settings.contact_address}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </Surface>
      )}

      {/* Social Links */}
      {settings.social_links && settings.social_links.length > 0 && (
        <Surface style={styles.card} elevation={2}>
          <View style={styles.cardHeader}>
            <IconButton icon="share-variant" size={28} iconColor={colors.primary} style={styles.cardIcon} />
            <Text variant="titleLarge" style={styles.cardTitle}>
              Follow Us
            </Text>
          </View>
          <View style={styles.socialContainer}>
            {settings.social_links.map((link, index) => (
              <Chip
                key={index}
                icon={getSocialIcon(link.platform)}
                onPress={() => handleOpenLink(link.url)}
                mode="flat"
                style={[styles.socialChip, { backgroundColor: `${colors.primary}15` }]}
                textStyle={{ color: colors.primary, fontWeight: '600' }}>
                {link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
              </Chip>
            ))}
          </View>
        </Surface>
      )}

      {/* App Info */}
      <Surface style={styles.card} elevation={2}>
        <View style={styles.cardHeader}>
          <IconButton icon="cellphone-information" size={28} iconColor={colors.primary} style={styles.cardIcon} />
          <Text variant="titleLarge" style={styles.cardTitle}>
            App Information
          </Text>
        </View>

        <View style={styles.infoList}>
          <View style={styles.infoItem}>
            <View style={styles.infoIconContainer}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.infoIconGradient}>
                <IconButton icon="tag" size={18} iconColor="#fff" style={styles.infoIcon} />
              </LinearGradient>
            </View>
            <View style={styles.infoContent}>
              <Text variant="labelSmall" style={[styles.infoLabel, { color: colors.onSurfaceVariant }]}>
                Version
              </Text>
              <Text variant="bodyLarge" style={styles.infoValue}>
                1.0.0
              </Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoIconContainer}>
              <LinearGradient
                colors={['#f093fb', '#f5576c']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.infoIconGradient}>
                <IconButton icon="react" size={18} iconColor="#fff" style={styles.infoIcon} />
              </LinearGradient>
            </View>
            <View style={styles.infoContent}>
              <Text variant="labelSmall" style={[styles.infoLabel, { color: colors.onSurfaceVariant }]}>
                Platform
              </Text>
              <Text variant="bodyLarge" style={styles.infoValue}>
                React Native + Expo
              </Text>
            </View>
          </View>
        </View>
      </Surface>

      {/* Footer */}
      <View style={styles.footer}>
        <Text variant="bodySmall" style={[styles.footerText, { color: colors.onSurfaceVariant }]}>
          {settings.footer_text || `\u00A9 ${new Date().getFullYear()} ${appName}. All rights reserved.`}
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
  heroSection: {
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 16,
  },
  heroTitle: {
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardIcon: {
    margin: 0,
    marginRight: 8,
  },
  cardTitle: {
    fontWeight: '700',
  },
  cardText: {
    lineHeight: 24,
    fontSize: 15,
  },
  contactList: {
    gap: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  contactIconContainer: {
    marginRight: 12,
  },
  contactIcon: {
    margin: 0,
    backgroundColor: '#667eea',
    borderRadius: 12,
  },
  contactContent: {
    flex: 1,
    justifyContent: 'center',
  },
  contactLabel: {
    marginBottom: 2,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contactValue: {
    fontWeight: '600',
  },
  socialContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  socialChip: {
    marginBottom: 4,
  },
  infoList: {
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
  footer: {
    paddingVertical: 24,
    paddingHorizontal: 24,
    marginTop: 8,
  },
  footerText: {
    textAlign: 'center',
    lineHeight: 20,
  },
});
