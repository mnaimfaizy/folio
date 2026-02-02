import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, Eye } from 'lucide-react';
import { SiteSettings } from '@/services/adminService';

interface HeroSettingsProps {
  settings: SiteSettings;
  onUpdate: (updates: Partial<SiteSettings>) => Promise<void>;
  saving: boolean;
}

export function HeroSettings({
  settings,
  onUpdate,
  saving,
}: HeroSettingsProps) {
  const [formData, setFormData] = useState({
    hero_title: settings.hero_title || '',
    hero_subtitle: settings.hero_subtitle || '',
    hero_cta_text: settings.hero_cta_text || '',
    hero_cta_link: settings.hero_cta_link || '',
    hero_image_url: settings.hero_image_url || '',
  });

  const [showPreview, setShowPreview] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="hero_title">Hero Title</Label>
        <Input
          id="hero_title"
          value={formData.hero_title}
          onChange={(e) =>
            setFormData({ ...formData, hero_title: e.target.value })
          }
          placeholder="Your Digital Library Awaits"
        />
        <p className="text-sm text-muted-foreground">
          The main headline displayed on your landing page
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="hero_subtitle">Hero Subtitle</Label>
        <Textarea
          id="hero_subtitle"
          value={formData.hero_subtitle}
          onChange={(e) =>
            setFormData({ ...formData, hero_subtitle: e.target.value })
          }
          placeholder="Discover, collect, and manage your favorite books in one beautiful place."
          rows={3}
        />
        <p className="text-sm text-muted-foreground">
          Supporting text below the main headline
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="hero_cta_text">Call-to-Action Text</Label>
          <Input
            id="hero_cta_text"
            value={formData.hero_cta_text}
            onChange={(e) =>
              setFormData({ ...formData, hero_cta_text: e.target.value })
            }
            placeholder="Get Started"
          />
          <p className="text-sm text-muted-foreground">
            Text displayed on the main button
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="hero_cta_link">Call-to-Action Link</Label>
          <Input
            id="hero_cta_link"
            value={formData.hero_cta_link}
            onChange={(e) =>
              setFormData({ ...formData, hero_cta_link: e.target.value })
            }
            placeholder="/signup"
          />
          <p className="text-sm text-muted-foreground">
            Where the button links to (e.g., /signup, /books)
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="hero_image_url">Hero Background Image URL</Label>
        <Input
          id="hero_image_url"
          value={formData.hero_image_url}
          onChange={(e) =>
            setFormData({ ...formData, hero_image_url: e.target.value })
          }
          placeholder="https://example.com/hero-image.jpg"
        />
        <p className="text-sm text-muted-foreground">
          Optional background image for the hero section
        </p>
      </div>

      {/* Preview Section */}
      <div className="border rounded-lg overflow-hidden">
        <Button
          type="button"
          variant="ghost"
          className="w-full flex items-center justify-between p-4"
          onClick={() => setShowPreview(!showPreview)}
        >
          <span className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Preview Hero Section
          </span>
          <span className="text-muted-foreground text-sm">
            {showPreview ? 'Hide' : 'Show'}
          </span>
        </Button>

        {showPreview && (
          <div
            className="relative min-h-[300px] flex items-center justify-center p-8 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900"
            style={
              formData.hero_image_url
                ? {
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${formData.hero_image_url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }
                : undefined
            }
          >
            <div className="text-center text-white max-w-2xl">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {formData.hero_title || 'Your Title Here'}
              </h1>
              <p className="text-lg text-gray-300 mb-6">
                {formData.hero_subtitle || 'Your subtitle here'}
              </p>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                {formData.hero_cta_text || 'Button Text'}
              </Button>
            </div>
          </div>
        )}
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
