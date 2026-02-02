import api from './api';

// Public settings interface (safe to expose without auth)
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
export const DEFAULT_SETTINGS: PublicSiteSettings = {
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
  mobile_app_enabled: false,
  mobile_app_store_url: null,
  mobile_play_store_url: null,
};

let cachedSettings: PublicSiteSettings | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const SettingsService = {
  /**
   * Get public site settings
   * Results are cached for 5 minutes
   */
  getPublicSettings: async (): Promise<PublicSiteSettings> => {
    const now = Date.now();

    // Return cached settings if still valid
    if (cachedSettings && now - cacheTimestamp < CACHE_TTL) {
      return cachedSettings;
    }

    try {
      const response = await api.get<{ settings: PublicSiteSettings }>(
        '/api/settings',
      );
      cachedSettings = response.data.settings;
      cacheTimestamp = now;
      return cachedSettings;
    } catch (error) {
      console.error('Failed to fetch public settings:', error);
      // Return cached settings if available, otherwise defaults
      return cachedSettings || DEFAULT_SETTINGS;
    }
  },

  /**
   * Clear the settings cache (useful after admin updates)
   */
  clearCache: () => {
    cachedSettings = null;
    cacheTimestamp = 0;
  },

  /**
   * Get default settings (for SSR or initial render)
   */
  getDefaultSettings: (): PublicSiteSettings => {
    return DEFAULT_SETTINGS;
  },
};

export default SettingsService;
