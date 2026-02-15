import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save, TrendingUp } from 'lucide-react';
import { SiteSettings } from '@/services/adminService';
import { Separator } from '@/components/ui/separator';

interface LandingStatsSettingsProps {
  settings: SiteSettings;
  onUpdate: (updates: Partial<SiteSettings>) => Promise<void>;
  saving: boolean;
}

export function LandingStatsSettings({
  settings,
  onUpdate,
  saving,
}: LandingStatsSettingsProps) {
  const [formData, setFormData] = useState({
    // Stats Section
    stat_total_books: settings.stat_total_books || '10,000+',
    stat_total_ebooks: settings.stat_total_ebooks || '5,000+',
    stat_active_members: settings.stat_active_members || '2,500+',
    stat_online_access: settings.stat_online_access || '24/7',
    // Trust Indicators
    stat_active_readers: settings.stat_active_readers || '2,500+',
    stat_books_display: settings.stat_books_display || '10,000+',
    stat_rating: settings.stat_rating || '4.9/5',
  });

  // Update form data when settings change
  useEffect(() => {
    setFormData({
      stat_total_books: settings.stat_total_books || '10,000+',
      stat_total_ebooks: settings.stat_total_ebooks || '5,000+',
      stat_active_members: settings.stat_active_members || '2,500+',
      stat_online_access: settings.stat_online_access || '24/7',
      stat_active_readers: settings.stat_active_readers || '2,500+',
      stat_books_display: settings.stat_books_display || '10,000+',
      stat_rating: settings.stat_rating || '4.9/5',
    });
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Statistics Section</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          These statistics appear in the colored section of the landing page
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="stat_total_books">Total Books Available</Label>
            <Input
              id="stat_total_books"
              value={formData.stat_total_books}
              onChange={(e) =>
                setFormData({ ...formData, stat_total_books: e.target.value })
              }
              placeholder="10,000+"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stat_total_ebooks">Total E-Books</Label>
            <Input
              id="stat_total_ebooks"
              value={formData.stat_total_ebooks}
              onChange={(e) =>
                setFormData({ ...formData, stat_total_ebooks: e.target.value })
              }
              placeholder="5,000+"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stat_active_members">Active Members</Label>
            <Input
              id="stat_active_members"
              value={formData.stat_active_members}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  stat_active_members: e.target.value,
                })
              }
              placeholder="2,500+"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stat_online_access">Online Access</Label>
            <Input
              id="stat_online_access"
              value={formData.stat_online_access}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  stat_online_access: e.target.value,
                })
              }
              placeholder="24/7"
            />
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Trust Indicators</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          These indicators appear in the hero section below the call-to-action
          buttons
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="stat_active_readers">Active Readers</Label>
            <Input
              id="stat_active_readers"
              value={formData.stat_active_readers}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  stat_active_readers: e.target.value,
                })
              }
              placeholder="2,500+"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stat_books_display">Books (Display)</Label>
            <Input
              id="stat_books_display"
              value={formData.stat_books_display}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  stat_books_display: e.target.value,
                })
              }
              placeholder="10,000+"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stat_rating">Rating</Label>
            <Input
              id="stat_rating"
              value={formData.stat_rating}
              onChange={(e) =>
                setFormData({ ...formData, stat_rating: e.target.value })
              }
              placeholder="4.9/5"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
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
      </div>
    </form>
  );
}
