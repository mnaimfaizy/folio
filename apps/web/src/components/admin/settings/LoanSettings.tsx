import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save } from 'lucide-react';
import { SiteSettings } from '@/services/adminService';

interface LoanSettingsProps {
  settings: SiteSettings;
  onUpdate: (updates: Partial<SiteSettings>) => Promise<void>;
  saving: boolean;
}

export function LoanSettings({
  settings,
  onUpdate,
  saving,
}: LoanSettingsProps) {
  const [formData, setFormData] = useState({
    loans_enabled: settings.loans_enabled,
    max_concurrent_loans: settings.max_concurrent_loans,
    default_loan_duration_days: settings.default_loan_duration_days,
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onUpdate({
      loans_enabled: formData.loans_enabled,
      max_concurrent_loans: Math.max(
        1,
        Number(formData.max_concurrent_loans) || 1,
      ),
      default_loan_duration_days: Math.max(
        1,
        Number(formData.default_loan_duration_days) || 1,
      ),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-start justify-between rounded-lg border p-4">
        <div>
          <Label className="text-base">Enable Loan System</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Disable this to temporarily stop new borrowing while keeping
            return/lost admin workflows active.
          </p>
        </div>
        <Switch
          checked={formData.loans_enabled}
          onCheckedChange={(checked) =>
            setFormData((prev) => ({ ...prev, loans_enabled: checked }))
          }
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="max_concurrent_loans">
            Max Concurrent Loans per User
          </Label>
          <Input
            id="max_concurrent_loans"
            type="number"
            min={1}
            value={formData.max_concurrent_loans}
            onChange={(event) =>
              setFormData((prev) => ({
                ...prev,
                max_concurrent_loans: Number(event.target.value),
              }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="default_loan_duration_days">
            Default Loan Duration (Days)
          </Label>
          <Input
            id="default_loan_duration_days"
            type="number"
            min={1}
            value={formData.default_loan_duration_days}
            onChange={(event) =>
              setFormData((prev) => ({
                ...prev,
                default_loan_duration_days: Number(event.target.value),
              }))
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
            Save Loan Policy
          </>
        )}
      </Button>
    </form>
  );
}
