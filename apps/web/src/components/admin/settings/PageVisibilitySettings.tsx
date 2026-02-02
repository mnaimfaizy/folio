import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save, BookOpen, Users, Info, Phone } from 'lucide-react';
import { SiteSettings } from '@/services/adminService';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PageVisibilitySettingsProps {
  settings: SiteSettings;
  onUpdate: (updates: Partial<SiteSettings>) => Promise<void>;
  saving: boolean;
}

export function PageVisibilitySettings({
  settings,
  onUpdate,
  saving,
}: PageVisibilitySettingsProps) {
  const [formData, setFormData] = useState({
    show_about_page: settings.show_about_page,
    show_contact_page: settings.show_contact_page,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Books and Authors pages are always visible and cannot be hidden. These
          are core features of the application.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        {/* Always visible pages */}
        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-primary" />
            <div>
              <Label className="font-medium">Books Page</Label>
              <p className="text-sm text-muted-foreground">
                Browse and manage books
              </p>
            </div>
          </div>
          <Switch checked disabled />
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <Label className="font-medium">Authors Page</Label>
              <p className="text-sm text-muted-foreground">
                Browse and manage authors
              </p>
            </div>
          </div>
          <Switch checked disabled />
        </div>

        {/* Configurable pages */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <Info className="h-5 w-5 text-blue-500" />
            <div>
              <Label htmlFor="show_about_page" className="font-medium">
                About Page
              </Label>
              <p className="text-sm text-muted-foreground">
                Information about your library
              </p>
            </div>
          </div>
          <Switch
            id="show_about_page"
            checked={formData.show_about_page}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, show_about_page: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-green-500" />
            <div>
              <Label htmlFor="show_contact_page" className="font-medium">
                Contact Page
              </Label>
              <p className="text-sm text-muted-foreground">
                Contact form and information
              </p>
            </div>
          </div>
          <Switch
            id="show_contact_page"
            checked={formData.show_contact_page}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, show_contact_page: checked })
            }
          />
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
