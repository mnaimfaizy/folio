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
} from 'lucide-react';
import AdminService, { SiteSettings } from '@/services/adminService';
import { GeneralSettings } from './GeneralSettings';
import { PageVisibilitySettings } from './PageVisibilitySettings';
import { HeroSettings } from './HeroSettings';
import { FooterSettings } from './FooterSettings';
import { ContactSettings } from './ContactSettings';
import { EmailSettings } from './EmailSettings';
import { MobileSettings } from './MobileSettings';
import { LandingStatsSettings } from './LandingStatsSettings';
import { AboutPageSettings } from './AboutPageSettings';

export function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Failed to load settings</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="h-8 w-8" />
          Site Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Configure your site's appearance, content, and integrations
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-9 gap-2">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="pages" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Pages</span>
          </TabsTrigger>
          <TabsTrigger value="hero" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            <span className="hidden sm:inline">Hero</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Stats</span>
          </TabsTrigger>
          <TabsTrigger value="about" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">About</span>
          </TabsTrigger>
          <TabsTrigger value="footer" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            <span className="hidden sm:inline">Footer</span>
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Contact</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Email</span>
          </TabsTrigger>
          <TabsTrigger value="mobile" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            <span className="hidden sm:inline">Mobile</span>
          </TabsTrigger>
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

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
              <CardDescription>
                Configure SMTP settings for email verification (credentials are
                set via environment variables)
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
      </Tabs>
    </div>
  );
}
