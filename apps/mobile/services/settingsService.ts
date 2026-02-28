import api from './api';
import * as SecureStore from 'expo-secure-store';

// Public settings interface (matches web)
export interface PublicSiteSettings {
  show_about_page: boolean;
  show_contact_page: boolean;
  site_name: string;
  site_description: string;
  logo_url: string | null;
  favicon_url: string | null;
  seo_keywords: string | null;
  hero_title: string;
  hero_subtitle: string;
  hero_cta_text: string;
  hero_cta_link: string;
  hero_image_url: string | null;
  footer_text: string;
  footer_links: FooterLink[];
  social_links: SocialLink[];
  contact_email: string | null;
  contact_phone: string | null;
  contact_address: string | null;
  contact_form_enabled: boolean;
  loans_enabled: boolean;
  minimum_credit_balance: number;
  credit_currency: string;
  manual_cash_payment_enabled: boolean;
  online_payment_enabled: boolean;
  stripe_enabled: boolean;
  stripe_public_key: string | null;
  stripe_mode: 'sandbox' | 'production';
  paypal_enabled: boolean;
  paypal_client_id: string | null;
  paypal_mode: 'sandbox' | 'production';
  mobile_app_enabled: boolean;
  mobile_app_store_url: string | null;
  mobile_play_store_url: string | null;
}

export interface FooterLink {
  label: string;
  url: string;
}

export interface SocialLink {
  platform: string;
  url: string;
}

// Default settings for fallback
const DEFAULT_SETTINGS: PublicSiteSettings = {
  show_about_page: true,
  show_contact_page: true,
  site_name: 'Folio',
  site_description: 'Your digital library management system',
  logo_url: null,
  favicon_url: null,
  seo_keywords: null,
  hero_title: 'Your Digital Library Awaits',
  hero_subtitle:
    'Discover, collect, and manage your favorite books in one beautiful place.',
  hero_cta_text: 'Get Started',
  hero_cta_link: '/signup',
  hero_image_url: null,
  footer_text: '© 2026 Folio. All rights reserved.',
  footer_links: [],
  social_links: [],
  contact_email: null,
  contact_phone: null,
  contact_address: null,
  contact_form_enabled: true,
  loans_enabled: true,
  minimum_credit_balance: 50,
  credit_currency: 'USD',
  manual_cash_payment_enabled: true,
  online_payment_enabled: false,
  stripe_enabled: false,
  stripe_public_key: null,
  stripe_mode: 'sandbox',
  paypal_enabled: false,
  paypal_client_id: null,
  paypal_mode: 'sandbox',
  mobile_app_enabled: false,
  mobile_app_store_url: null,
  mobile_play_store_url: null,
};

const SETTINGS_CACHE_KEY = 'cached_site_settings';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CachedSettings {
  settings: PublicSiteSettings;
  timestamp: number;
}

let memoryCache: CachedSettings | null = null;

const SettingsService = {
  /**
   * Get public site settings with caching
   */
  getSettings: async (): Promise<PublicSiteSettings> => {
    const now = Date.now();

    // Check memory cache first
    if (memoryCache && now - memoryCache.timestamp < CACHE_TTL) {
      return memoryCache.settings;
    }

    // Check persistent cache
    try {
      const cached = await SecureStore.getItemAsync(SETTINGS_CACHE_KEY);
      if (cached) {
        const parsed: CachedSettings = JSON.parse(cached);
        if (now - parsed.timestamp < CACHE_TTL) {
          memoryCache = parsed;
          return parsed.settings;
        }
      }
    } catch (error) {
      console.warn('Error reading cached settings:', error);
    }

    // Fetch from API
    try {
      const response = await api.get<{ settings: PublicSiteSettings }>(
        '/settings',
      );
      const settings = response.data.settings;

      // Cache the settings
      const cacheData: CachedSettings = { settings, timestamp: now };
      memoryCache = cacheData;

      try {
        await SecureStore.setItemAsync(
          SETTINGS_CACHE_KEY,
          JSON.stringify(cacheData),
        );
      } catch (error) {
        console.warn('Error caching settings:', error);
      }

      return settings;
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      // Return cached or default settings
      return memoryCache?.settings || DEFAULT_SETTINGS;
    }
  },

  /**
   * Clear the settings cache
   */
  clearCache: async () => {
    memoryCache = null;
    try {
      await SecureStore.deleteItemAsync(SETTINGS_CACHE_KEY);
    } catch (error) {
      console.warn('Error clearing settings cache:', error);
    }
  },

  /**
   * Get default settings (for initial render)
   */
  getDefaultSettings: (): PublicSiteSettings => {
    return DEFAULT_SETTINGS;
  },
};

export default SettingsService;
