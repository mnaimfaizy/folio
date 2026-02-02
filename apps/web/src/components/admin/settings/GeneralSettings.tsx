import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save } from 'lucide-react';
import { SiteSettings } from '@/services/adminService';

interface GeneralSettingsProps {
  settings: SiteSettings;
  onUpdate: (updates: Partial<SiteSettings>) => Promise<void>;
  saving: boolean;
}

export function GeneralSettings({
  settings,
  onUpdate,
  saving,
}: GeneralSettingsProps) {
  const [formData, setFormData] = useState({
    site_name: settings.site_name || '',
    site_description: settings.site_description || '',
    logo_url: settings.logo_url || '',
    favicon_url: settings.favicon_url || '',
    seo_keywords: settings.seo_keywords || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="site_name">Site Name</Label>
          <Input
            id="site_name"
            value={formData.site_name}
            onChange={(e) =>
              setFormData({ ...formData, site_name: e.target.value })
            }
            placeholder="Folio"
          />
          <p className="text-sm text-muted-foreground">
            The name of your site, displayed in the header and browser tab
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="seo_keywords">SEO Keywords</Label>
          <Input
            id="seo_keywords"
            value={formData.seo_keywords}
            onChange={(e) =>
              setFormData({ ...formData, seo_keywords: e.target.value })
            }
            placeholder="books, library, reading, collection"
          />
          <p className="text-sm text-muted-foreground">
            Comma-separated keywords for search engine optimization
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="site_description">Site Description</Label>
        <Textarea
          id="site_description"
          value={formData.site_description}
          onChange={(e) =>
            setFormData({ ...formData, site_description: e.target.value })
          }
          placeholder="Your digital library management system"
          rows={3}
        />
        <p className="text-sm text-muted-foreground">
          A brief description for search engines and social sharing
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="logo_url">Logo URL</Label>
          <Input
            id="logo_url"
            value={formData.logo_url}
            onChange={(e) =>
              setFormData({ ...formData, logo_url: e.target.value })
            }
            placeholder="https://example.com/logo.png"
          />
          <p className="text-sm text-muted-foreground">
            URL to your site's logo image
          </p>
          {formData.logo_url && (
            <div className="mt-2 p-2 border rounded">
              <img
                src={formData.logo_url}
                alt="Logo preview"
                className="max-h-12 object-contain"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="favicon_url">Favicon URL</Label>
          <Input
            id="favicon_url"
            value={formData.favicon_url}
            onChange={(e) =>
              setFormData({ ...formData, favicon_url: e.target.value })
            }
            placeholder="https://example.com/favicon.ico"
          />
          <p className="text-sm text-muted-foreground">
            URL to your site's favicon (browser tab icon)
          </p>
          {formData.favicon_url && (
            <div className="mt-2 p-2 border rounded">
              <img
                src={formData.favicon_url}
                alt="Favicon preview"
                className="max-h-8 object-contain"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            </div>
          )}
        </div>
      </div>

      <Button type="submit" disabled={saving}>
        {saving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </>
        )}
      </Button>
    </form>
  );
}
