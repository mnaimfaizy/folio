import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Loader2,
  Settings,
  Layout,
  Mail,
  Smartphone,
  Globe,
  FileText,
  TrendingUp,
  BookOpen,
  Shield,
  Wand2,
} from 'lucide-react';
import AdminService, {
  SiteSettings,
  UsageProfile,
} from '@/services/adminService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { GeneralSettings } from './GeneralSettings';
import { PageVisibilitySettings } from './PageVisibilitySettings';
import { HeroSettings } from './HeroSettings';
import { FooterSettings } from './FooterSettings';
import { ContactSettings } from './ContactSettings';
import { EmailSettings } from './EmailSettings';
import { MobileSettings } from './MobileSettings';
import { LandingStatsSettings } from './LandingStatsSettings';
import { AboutPageSettings } from './AboutPageSettings';
import { LoanSettings } from './LoanSettings';

type PresetName = UsageProfile;

const PROFILE_PRESETS: Record<PresetName, Partial<SiteSettings>> = {
  single_user: {
    usage_profile: 'single_user',
    show_about_page: false,
    show_contact_page: false,
    loans_enabled: false,
    mobile_app_enabled: false,
    mobile_app_store_url: null,
    mobile_play_store_url: null,
  },
  library: {
    usage_profile: 'library',
    loans_enabled: true,
    contact_form_enabled: true,
  },
  showcase: {
    usage_profile: 'showcase',
    show_about_page: true,
    show_contact_page: true,
    contact_form_enabled: true,
  },
};

const PROFILE_PRESET_LABELS: Record<PresetName, string> = {
  single_user: 'Single User',
  library: 'Library',
  showcase: 'Public Showcase',
};

const PROFILE_PRESET_DESCRIPTIONS: Record<PresetName, string> = {
  single_user:
    'This will disable About, Contact, Loans, and Mobile links to keep the experience minimal.',
  library:
    'This will enable Loans and Contact Form for a multi-user library workflow.',
  showcase:
    'This will enable About and Contact pages for visitors while keeping admin management available.',
};

const PROFILE_PRESET_SHORT_HELP: Record<PresetName, string> = {
  single_user: 'Minimal local setup for one personal collection.',
  library: 'Multi-user catalog with loans and operations.',
  showcase: 'Personal collection with public-facing pages.',
};

const PROFILE_PRESET_ORDER: PresetName[] = [
  'single_user',
  'library',
  'showcase',
];

type SettingsTabKey =
  | 'general'
  | 'pages'
  | 'hero'
  | 'stats'
  | 'about'
  | 'footer'
  | 'contact'
  | 'email'
  | 'loans'
  | 'mobile';

const PROFILE_SETTINGS_TABS: Record<UsageProfile, SettingsTabKey[]> = {
  single_user: ['general', 'pages', 'hero'],
  library: [
    'general',
    'pages',
    'hero',
    'stats',
    'about',
    'footer',
    'contact',
    'email',
    'loans',
    'mobile',
  ],
  showcase: ['general', 'pages', 'hero', 'stats', 'about', 'footer', 'contact'],
};

export function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [applyingPreset, setApplyingPreset] = useState<PresetName | null>(null);
  const [presetToConfirm, setPresetToConfirm] = useState<PresetName | null>(
    null,
  );

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await AdminService.getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async (updates: Partial<SiteSettings>) => {
    if (!settings) return;

    try {
      setSaving(true);
      const updatedSettings = await AdminService.updateSettings(updates);
      setSettings(updatedSettings);
      toast.success('Settings updated successfully');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleApplyPreset = async (preset: PresetName) => {
    try {
      setApplyingPreset(preset);
      const updatedSettings = await AdminService.updateSettings(
        PROFILE_PRESETS[preset],
      );
      setSettings(updatedSettings);

      if (preset === 'single_user') {
        toast.success('Applied Single User preset');
        return;
      }

      if (preset === 'library') {
        toast.success('Applied Library preset');
        return;
      }

      toast.success('Applied Showcase preset');
    } catch (error) {
      console.error('Error applying profile preset:', error);
      toast.error('Failed to apply profile preset');
    } finally {
      setApplyingPreset(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <p className="text-muted-foreground">Failed to load settings</p>
      </div>
    );
  }

  const currentProfileLabel =
    PROFILE_PRESET_LABELS[settings.usage_profile] ||
    PROFILE_PRESET_LABELS.library;
  const profileTabs = PROFILE_SETTINGS_TABS[settings.usage_profile];
  const hasTab = (tab: SettingsTabKey) => profileTabs.includes(tab);

  return (
    <div className="container mx-auto py-6 px-4">
      <AlertDialog
        open={presetToConfirm !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPresetToConfirm(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Apply{' '}
              {presetToConfirm ? PROFILE_PRESET_LABELS[presetToConfirm] : ''}{' '}
              preset?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {presetToConfirm
                ? PROFILE_PRESET_DESCRIPTIONS[presetToConfirm]
                : 'This will apply preset settings.'}
              <span className="mt-2 block text-sm font-medium text-red-600">
                Please reload the page after applying this profile to see all
                changes.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={applyingPreset !== null}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={applyingPreset !== null || presetToConfirm === null}
              onClick={async (event) => {
                event.preventDefault();
                if (!presetToConfirm) return;
                await handleApplyPreset(presetToConfirm);
                setPresetToConfirm(null);
              }}
            >
              {applyingPreset !== null ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              Apply Preset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="mb-8 space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8" />
            Site Settings
          </h1>
          <Badge variant="secondary">Admin Configuration</Badge>
        </div>
        <p className="text-muted-foreground">
          Configure your site's appearance, content, and integrations
        </p>
      </div>

      <Card className="mb-8 border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <Wand2 className="h-5 w-5" />
              Profile Presets
            </span>
            <Badge variant="outline">Current: {currentProfileLabel}</Badge>
          </CardTitle>
          <CardDescription>
            Apply one-click defaults for common usage modes. You can still
            change any setting manually afterward.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            {PROFILE_PRESET_ORDER.map((preset) => {
              const isActive = settings.usage_profile === preset;
              const isApplying = applyingPreset === preset;

              return (
                <div
                  key={preset}
                  className={cn(
                    'flex h-full flex-col rounded-lg border p-3 transition-colors',
                    isActive ? 'border-primary/40 bg-primary/5' : 'bg-card',
                  )}
                >
                  <div className="mb-2 flex h-5 justify-end">
                    {isActive ? (
                      <Badge variant="secondary">Active</Badge>
                    ) : null}
                  </div>
                  <Button
                    type="button"
                    variant={isActive ? 'default' : 'outline'}
                    className="w-full"
                    disabled={saving || applyingPreset !== null}
                    onClick={() => setPresetToConfirm(preset)}
                  >
                    {isApplying ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : null}
                    {PROFILE_PRESET_LABELS[preset]}
                  </Button>
                  <p className="mt-auto pt-2 text-xs text-muted-foreground">
                    {PROFILE_PRESET_SHORT_HELP[preset]}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList
          className={cn(
            'grid h-auto w-full gap-2 rounded-lg bg-muted/60 p-1',
            settings.usage_profile === 'single_user'
              ? 'grid-cols-3 lg:grid-cols-3'
              : settings.usage_profile === 'showcase'
                ? 'grid-cols-3 lg:grid-cols-7'
                : 'grid-cols-3 lg:grid-cols-10',
          )}
        >
          <TabsTrigger
            value="general"
            className="flex items-center gap-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger
            value="pages"
            className="flex items-center gap-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Pages</span>
          </TabsTrigger>
          <TabsTrigger
            value="hero"
            className="flex items-center gap-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Layout className="h-4 w-4" />
            <span className="hidden sm:inline">Hero</span>
          </TabsTrigger>
          {hasTab('stats') && (
            <TabsTrigger
              value="stats"
              className="flex items-center gap-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Stats</span>
            </TabsTrigger>
          )}
          {hasTab('about') && (
            <TabsTrigger
              value="about"
              className="flex items-center gap-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">About</span>
            </TabsTrigger>
          )}
          {hasTab('footer') && (
            <TabsTrigger
              value="footer"
              className="flex items-center gap-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Layout className="h-4 w-4" />
              <span className="hidden sm:inline">Footer</span>
            </TabsTrigger>
          )}
          {hasTab('contact') && (
            <TabsTrigger
              value="contact"
              className="flex items-center gap-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Contact</span>
            </TabsTrigger>
          )}
          {hasTab('email') && (
            <TabsTrigger
              value="email"
              className="flex items-center gap-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Email</span>
            </TabsTrigger>
          )}
          {hasTab('loans') && (
            <TabsTrigger
              value="loans"
              className="flex items-center gap-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Loans</span>
            </TabsTrigger>
          )}
          {hasTab('mobile') && (
            <TabsTrigger
              value="mobile"
              className="flex items-center gap-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Smartphone className="h-4 w-4" />
              <span className="hidden sm:inline">Mobile</span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure your site name, branding, and SEO settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GeneralSettings
                settings={settings}
                onUpdate={handleUpdateSettings}
                saving={saving}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pages">
          <Card>
            <CardHeader>
              <CardTitle>Page Visibility</CardTitle>
              <CardDescription>
                Control which pages are visible to users. Books and Authors
                pages are always visible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PageVisibilitySettings
                settings={settings}
                onUpdate={handleUpdateSettings}
                saving={saving}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hero">
          <Card>
            <CardHeader>
              <CardTitle>Hero Section</CardTitle>
              <CardDescription>
                Customize the hero section on your landing page
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HeroSettings
                settings={settings}
                onUpdate={handleUpdateSettings}
                saving={saving}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {hasTab('stats') && (
          <TabsContent value="stats">
            <Card>
              <CardHeader>
                <CardTitle>Landing Page Statistics</CardTitle>
                <CardDescription>
                  Configure the statistics and trust indicators displayed on the
                  landing page
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LandingStatsSettings
                  settings={settings}
                  onUpdate={handleUpdateSettings}
                  saving={saving}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {hasTab('about') && (
          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>About Page Content</CardTitle>
                <CardDescription>
                  Manage the content displayed on your About page including
                  mission, vision, history, team, and programs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AboutPageSettings
                  settings={settings}
                  onUpdate={handleUpdateSettings}
                  saving={saving}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {hasTab('footer') && (
          <TabsContent value="footer">
            <Card>
              <CardHeader>
                <CardTitle>Footer Settings</CardTitle>
                <CardDescription>
                  Configure footer content, links, and social media
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FooterSettings
                  settings={settings}
                  onUpdate={handleUpdateSettings}
                  saving={saving}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {hasTab('contact') && (
          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  Set your contact details and form settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ContactSettings
                  settings={settings}
                  onUpdate={handleUpdateSettings}
                  saving={saving}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {hasTab('email') && (
          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle>Email Settings</CardTitle>
                <CardDescription>
                  Configure SMTP settings for email verification (credentials
                  are set via environment variables)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EmailSettings
                  settings={settings}
                  onUpdate={handleUpdateSettings}
                  saving={saving}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {hasTab('loans') && (
          <TabsContent value="loans">
            <Card>
              <CardHeader>
                <CardTitle>Loan Policy</CardTitle>
                <CardDescription>
                  Configure borrowing controls and global loan availability
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LoanSettings
                  settings={settings}
                  onUpdate={handleUpdateSettings}
                  saving={saving}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {hasTab('mobile') && (
          <TabsContent value="mobile">
            <Card>
              <CardHeader>
                <CardTitle>Mobile App Integration</CardTitle>
                <CardDescription>
                  Configure mobile app settings and API access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MobileSettings
                  settings={settings}
                  onUpdate={handleUpdateSettings}
                  saving={saving}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
