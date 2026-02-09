import React, { createContext, ReactNode, useCallback, useEffect, useState } from 'react';

import SettingsService, { PublicSiteSettings } from '../services/settingsService';

interface SettingsContextType {
  settings: PublicSiteSettings;
  isLoading: boolean;
  error: string | null;
  refreshSettings: () => Promise<void>;
  /** Resolved app name from API or fallback */
  appName: string;
  /** Resolved logo URL from API or null for local fallback */
  logoUrl: string | null;
}

const defaultSettings = SettingsService.getDefaultSettings();

export const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  isLoading: true,
  error: null,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  refreshSettings: async () => {},
  appName: defaultSettings.site_name,
  logoUrl: null,
});

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<PublicSiteSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setError(null);
      const data = await SettingsService.getSettings();
      setSettings(data);
    } catch (err) {
      if (__DEV__) console.log('Failed to fetch settings:', err);
      setError('Failed to load app settings');
      // Keep default settings on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const refreshSettings = useCallback(async () => {
    await SettingsService.clearCache();
    await fetchSettings();
  }, [fetchSettings]);

  const appName = settings.site_name || defaultSettings.site_name;
  const logoUrl = settings.logo_url || null;

  return (
    <SettingsContext.Provider
      value={{
        settings,
        isLoading,
        error,
        refreshSettings,
        appName,
        logoUrl,
      }}>
      {children}
    </SettingsContext.Provider>
  );
};
