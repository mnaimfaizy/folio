import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save, Smartphone, Apple, PlayIcon } from 'lucide-react';
import { SiteSettings } from '@/services/adminService';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface MobileSettingsProps {
  settings: SiteSettings;
  onUpdate: (updates: Partial<SiteSettings>) => Promise<void>;
  saving: boolean;
}

export function MobileSettings({
  settings,
  onUpdate,
  saving,
}: MobileSettingsProps) {
  const [formData, setFormData] = useState({
    mobile_app_enabled: settings.mobile_app_enabled,
    mobile_api_base_url: settings.mobile_api_base_url || '',
    mobile_app_store_url: settings.mobile_app_store_url || '',
    mobile_play_store_url: settings.mobile_play_store_url || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="flex items-center gap-3">
          <Smartphone className="h-5 w-5 text-primary" />
          <div>
            <Label htmlFor="mobile_app_enabled" className="font-medium">
              Enable Mobile App Integration
            </Label>
            <p className="text-sm text-muted-foreground">
              Show mobile app download links and enable mobile API access
            </p>
          </div>
        </div>
        <Switch
          id="mobile_app_enabled"
          checked={formData.mobile_app_enabled}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, mobile_app_enabled: checked })
          }
        />
      </div>

      {formData.mobile_app_enabled && (
        <>
          <Alert>
            <Smartphone className="h-4 w-4" />
            <AlertDescription>
              Configure the API base URL that the mobile app will use to connect
              to your server. This should be the publicly accessible URL of your
              API.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="mobile_api_base_url">Mobile API Base URL</Label>
            <Input
              id="mobile_api_base_url"
              value={formData.mobile_api_base_url}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  mobile_api_base_url: e.target.value,
                })
              }
              placeholder="https://api.yoursite.com"
            />
            <p className="text-sm text-muted-foreground">
              The base URL for API requests from the mobile app (e.g.,
              https://api.yoursite.com)
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label
                htmlFor="mobile_app_store_url"
                className="flex items-center gap-2"
              >
                <Apple className="h-4 w-4" />
                App Store URL
              </Label>
              <Input
                id="mobile_app_store_url"
                value={formData.mobile_app_store_url}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    mobile_app_store_url: e.target.value,
                  })
                }
                placeholder="https://apps.apple.com/app/..."
              />
              <p className="text-sm text-muted-foreground">
                Link to your iOS app on the App Store
              </p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="mobile_play_store_url"
                className="flex items-center gap-2"
              >
                <PlayIcon className="h-4 w-4" />
                Play Store URL
              </Label>
              <Input
                id="mobile_play_store_url"
                value={formData.mobile_play_store_url}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    mobile_play_store_url: e.target.value,
                  })
                }
                placeholder="https://play.google.com/store/apps/..."
              />
              <p className="text-sm text-muted-foreground">
                Link to your Android app on Google Play
              </p>
            </div>
          </div>
        </>
      )}

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
