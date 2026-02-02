import React, { createContext, useContext, useEffect, useState } from 'react';
import SettingsService, {
  PublicSiteSettings,
  DEFAULT_SETTINGS,
} from '@/services/settingsService';

interface SettingsContextType {
  settings: PublicSiteSettings;
  loading: boolean;
  error: boolean;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: DEFAULT_SETTINGS,
  loading: true,
  error: false,
  refreshSettings: () => Promise.resolve(),
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] =
    useState<PublicSiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(false);
      const data = await SettingsService.getPublicSettings();
      setSettings(data);

      // Update document title and favicon if available
      if (data.site_name) {
        document.title = data.site_name;
      }
      if (data.favicon_url) {
        const link: HTMLLinkElement =
          document.querySelector("link[rel*='icon']") ||
          document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        link.href = data.favicon_url;
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      // Update meta description
      if (data.site_description) {
        let metaDescription = document.querySelector(
          'meta[name="description"]',
        );
        if (!metaDescription) {
          metaDescription = document.createElement('meta');
          metaDescription.setAttribute('name', 'description');
          document.head.appendChild(metaDescription);
        }
        metaDescription.setAttribute('content', data.site_description);
      }
      // Update meta keywords
      if (data.seo_keywords) {
        let metaKeywords = document.querySelector('meta[name="keywords"]');
        if (!metaKeywords) {
          metaKeywords = document.createElement('meta');
          metaKeywords.setAttribute('name', 'keywords');
          document.head.appendChild(metaKeywords);
        }
        metaKeywords.setAttribute('content', data.seo_keywords);
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const refreshSettings = async () => {
    SettingsService.clearCache();
    await fetchSettings();
  };

  return (
    <SettingsContext.Provider
      value={{ settings, loading, error, refreshSettings }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

export default SettingsContext;
