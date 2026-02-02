import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save } from 'lucide-react';
import { SiteSettings } from '@/services/adminService';

interface ContactSettingsProps {
  settings: SiteSettings;
  onUpdate: (updates: Partial<SiteSettings>) => Promise<void>;
  saving: boolean;
}

export function ContactSettings({
  settings,
  onUpdate,
  saving,
}: ContactSettingsProps) {
  const [formData, setFormData] = useState({
    contact_email: settings.contact_email || '',
    contact_phone: settings.contact_phone || '',
    contact_address: settings.contact_address || '',
    contact_form_enabled: settings.contact_form_enabled,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div>
          <Label htmlFor="contact_form_enabled" className="font-medium">
            Enable Contact Form
          </Label>
          <p className="text-sm text-muted-foreground">
            Allow visitors to send messages through the contact page
          </p>
        </div>
        <Switch
          id="contact_form_enabled"
          checked={formData.contact_form_enabled}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, contact_form_enabled: checked })
          }
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact_email">Contact Email</Label>
          <Input
            id="contact_email"
            type="email"
            value={formData.contact_email}
            onChange={(e) =>
              setFormData({ ...formData, contact_email: e.target.value })
            }
            placeholder="contact@example.com"
          />
          <p className="text-sm text-muted-foreground">
            Public email address for inquiries
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact_phone">Contact Phone</Label>
          <Input
            id="contact_phone"
            value={formData.contact_phone}
            onChange={(e) =>
              setFormData({ ...formData, contact_phone: e.target.value })
            }
            placeholder="+1 (555) 123-4567"
          />
          <p className="text-sm text-muted-foreground">
            Public phone number (optional)
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact_address">Address</Label>
        <Textarea
          id="contact_address"
          value={formData.contact_address}
          onChange={(e) =>
            setFormData({ ...formData, contact_address: e.target.value })
          }
          placeholder="123 Library Street&#10;City, State 12345"
          rows={3}
        />
        <p className="text-sm text-muted-foreground">
          Physical address displayed on the contact page (optional)
        </p>
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
