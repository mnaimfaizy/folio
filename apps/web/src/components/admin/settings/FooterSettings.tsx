import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save, Plus, Trash2, GripVertical } from 'lucide-react';
import { SiteSettings, FooterLink, SocialLink } from '@/services/adminService';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FooterSettingsProps {
  settings: SiteSettings;
  onUpdate: (updates: Partial<SiteSettings>) => Promise<void>;
  saving: boolean;
}

const SOCIAL_PLATFORMS = [
  { value: 'twitter', label: 'Twitter / X' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'github', label: 'GitHub' },
  { value: 'youtube', label: 'YouTube' },
];

export function FooterSettings({
  settings,
  onUpdate,
  saving,
}: FooterSettingsProps) {
  const [formData, setFormData] = useState({
    footer_text: settings.footer_text || '',
    footer_links: settings.footer_links || [],
    social_links: settings.social_links || [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdate(formData);
  };

  // Footer Links management
  const addFooterLink = () => {
    setFormData({
      ...formData,
      footer_links: [...formData.footer_links, { label: '', url: '' }],
    });
  };

  const updateFooterLink = (
    index: number,
    field: keyof FooterLink,
    value: string,
  ) => {
    const updated = [...formData.footer_links];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, footer_links: updated });
  };

  const removeFooterLink = (index: number) => {
    setFormData({
      ...formData,
      footer_links: formData.footer_links.filter((_, i) => i !== index),
    });
  };

  // Social Links management
  const addSocialLink = () => {
    setFormData({
      ...formData,
      social_links: [
        ...formData.social_links,
        { platform: 'twitter', url: '' },
      ],
    });
  };

  const updateSocialLink = (
    index: number,
    field: keyof SocialLink,
    value: string,
  ) => {
    const updated = [...formData.social_links];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, social_links: updated });
  };

  const removeSocialLink = (index: number) => {
    setFormData({
      ...formData,
      social_links: formData.social_links.filter((_, i) => i !== index),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Footer Text */}
      <div className="space-y-2">
        <Label htmlFor="footer_text">Footer Copyright Text</Label>
        <Input
          id="footer_text"
          value={formData.footer_text}
          onChange={(e) =>
            setFormData({ ...formData, footer_text: e.target.value })
          }
          placeholder="© 2026 Folio. All rights reserved."
        />
        <p className="text-sm text-muted-foreground">
          Copyright or legal text displayed at the bottom of the footer
        </p>
      </div>

      {/* Footer Links */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-semibold">Footer Links</Label>
            <p className="text-sm text-muted-foreground">
              Quick navigation links in the footer
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addFooterLink}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Link
          </Button>
        </div>

        {formData.footer_links.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg">
            No footer links added yet
          </p>
        ) : (
          <div className="space-y-3">
            {formData.footer_links.map((link, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-3 border rounded-lg"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <Input
                  value={link.label}
                  onChange={(e) =>
                    updateFooterLink(index, 'label', e.target.value)
                  }
                  placeholder="Link Label"
                  className="flex-1"
                />
                <Input
                  value={link.url}
                  onChange={(e) =>
                    updateFooterLink(index, 'url', e.target.value)
                  }
                  placeholder="/page or https://..."
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFooterLink(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Social Links */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-semibold">
              Social Media Links
            </Label>
            <p className="text-sm text-muted-foreground">
              Links to your social media profiles
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSocialLink}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Social
          </Button>
        </div>

        {formData.social_links.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg">
            No social links added yet
          </p>
        ) : (
          <div className="space-y-3">
            {formData.social_links.map((link, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-3 border rounded-lg"
              >
                <Select
                  value={link.platform}
                  onValueChange={(value) =>
                    updateSocialLink(index, 'platform', value)
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SOCIAL_PLATFORMS.map((platform) => (
                      <SelectItem key={platform.value} value={platform.value}>
                        {platform.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={link.url}
                  onChange={(e) =>
                    updateSocialLink(index, 'url', e.target.value)
                  }
                  placeholder="https://..."
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSocialLink(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
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
