import * as SecureStore from 'expo-secure-store';
import api from './api';

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
const SETTINGS_CACHE_CHUNK_COUNT_KEY = 'cached_site_settings_chunk_count';
const SETTINGS_CACHE_CHUNK_PREFIX = 'cached_site_settings_chunk_';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const SECURE_STORE_MAX_BYTES = 2048;
const SECURE_STORE_CHUNK_BYTES = 1800;

const getByteSize = (value: string): number => {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(value).length;
  }

  return value.length;
};

const chunkStringByByteSize = (
  value: string,
  maxBytes: number,
): string[] => {
  const chunks: string[] = [];
  let currentChunk = '';
  let currentBytes = 0;

  for (const char of value) {
    const charBytes = getByteSize(char);

    if (currentBytes + charBytes > maxBytes) {
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      currentChunk = char;
      currentBytes = charBytes;
    } else {
      currentChunk += char;
      currentBytes += charBytes;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
};

const readChunkCount = async (): Promise<number> => {
  const rawChunkCount = await SecureStore.getItemAsync(
    SETTINGS_CACHE_CHUNK_COUNT_KEY,
  );

  if (!rawChunkCount) {
    return 0;
  }

  const chunkCount = Number.parseInt(rawChunkCount, 10);
  return Number.isNaN(chunkCount) ? 0 : chunkCount;
};

const clearChunkedCache = async (chunkCount?: number): Promise<void> => {
  const count = typeof chunkCount === 'number' ? chunkCount : await readChunkCount();

  await Promise.all([
    SecureStore.deleteItemAsync(SETTINGS_CACHE_CHUNK_COUNT_KEY),
    ...Array.from({ length: count }, (_, index) =>
      SecureStore.deleteItemAsync(`${SETTINGS_CACHE_CHUNK_PREFIX}${index}`),
    ),
  ]);
};

const getPersistedCache = async (): Promise<string | null> => {
  const singleEntry = await SecureStore.getItemAsync(SETTINGS_CACHE_KEY);
  if (singleEntry) {
    return singleEntry;
  }

  const chunkCount = await readChunkCount();
  if (chunkCount <= 0) {
    return null;
  }

  const chunks = await Promise.all(
    Array.from({ length: chunkCount }, (_, index) =>
      SecureStore.getItemAsync(`${SETTINGS_CACHE_CHUNK_PREFIX}${index}`),
    ),
  );

  if (chunks.some((chunk) => !chunk)) {
    if (__DEV__) {
      console.warn('Settings cache chunks are incomplete; clearing chunked cache.');
    }
    await clearChunkedCache(chunkCount);
    return null;
  }

  return chunks.join('');
};

const persistCache = async (serializedCache: string): Promise<void> => {
  const serializedCacheSize = getByteSize(serializedCache);

  if (serializedCacheSize <= SECURE_STORE_MAX_BYTES) {
    await SecureStore.setItemAsync(SETTINGS_CACHE_KEY, serializedCache);
    await clearChunkedCache();
    return;
  }

  const chunks = chunkStringByByteSize(serializedCache, SECURE_STORE_CHUNK_BYTES);

  if (__DEV__) {
    console.warn(
      `Site settings cache too large for single SecureStore entry (${serializedCacheSize} bytes > ${SECURE_STORE_MAX_BYTES} bytes). Storing in ${chunks.length} chunks.`,
    );
  }

  await SecureStore.deleteItemAsync(SETTINGS_CACHE_KEY);
  await Promise.all(
    chunks.map((chunk, index) =>
      SecureStore.setItemAsync(`${SETTINGS_CACHE_CHUNK_PREFIX}${index}`, chunk),
    ),
  );
  await SecureStore.setItemAsync(
    SETTINGS_CACHE_CHUNK_COUNT_KEY,
    String(chunks.length),
  );
};

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
      const cached = await getPersistedCache();
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
      const serializedCache = JSON.stringify(cacheData);

      try {
        await persistCache(serializedCache);
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
      await clearChunkedCache();
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
