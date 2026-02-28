import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
    minimum_credit_balance: settings.minimum_credit_balance,
    credit_currency: settings.credit_currency,
    manual_cash_payment_enabled: settings.manual_cash_payment_enabled,
    online_payment_enabled: settings.online_payment_enabled,
    stripe_enabled: settings.stripe_enabled,
    stripe_public_key: settings.stripe_public_key || '',
    stripe_secret_key: settings.stripe_secret_key || '',
    stripe_webhook_secret: settings.stripe_webhook_secret || '',
    stripe_mode: settings.stripe_mode,
    paypal_enabled: settings.paypal_enabled,
    paypal_client_id: settings.paypal_client_id || '',
    paypal_client_secret: settings.paypal_client_secret || '',
    paypal_mode: settings.paypal_mode,
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
      minimum_credit_balance: Math.max(
        0,
        Number(formData.minimum_credit_balance) || 0,
      ),
      credit_currency: formData.credit_currency.trim().toUpperCase() || 'USD',
      manual_cash_payment_enabled: formData.manual_cash_payment_enabled,
      online_payment_enabled: formData.online_payment_enabled,
      stripe_enabled: formData.online_payment_enabled
        ? formData.stripe_enabled
        : false,
      stripe_public_key: formData.stripe_public_key.trim() || null,
      stripe_secret_key: formData.stripe_secret_key.trim() || null,
      stripe_webhook_secret: formData.stripe_webhook_secret.trim() || null,
      stripe_mode: formData.stripe_mode,
      paypal_enabled: formData.online_payment_enabled
        ? formData.paypal_enabled
        : false,
      paypal_client_id: formData.paypal_client_id.trim() || null,
      paypal_client_secret: formData.paypal_client_secret.trim() || null,
      paypal_mode: formData.paypal_mode,
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

        <div className="space-y-2">
          <Label htmlFor="minimum_credit_balance">
            Minimum Credit to Enable Borrowing
          </Label>
          <Input
            id="minimum_credit_balance"
            type="number"
            min={0}
            step="0.01"
            value={formData.minimum_credit_balance}
            onChange={(event) =>
              setFormData((prev) => ({
                ...prev,
                minimum_credit_balance: Number(event.target.value),
              }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="credit_currency">Credit Currency</Label>
          <Input
            id="credit_currency"
            value={formData.credit_currency}
            onChange={(event) =>
              setFormData((prev) => ({
                ...prev,
                credit_currency: event.target.value.toUpperCase(),
              }))
            }
            placeholder="USD"
            maxLength={3}
          />
        </div>
      </div>

      <div className="space-y-4 rounded-lg border p-4">
        <div className="flex items-start justify-between">
          <div>
            <Label className="text-base">Manual Cash Payment</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Enabled by default. Admin can collect cash and update user credit
              in Edit User.
            </p>
          </div>
          <Switch
            checked={formData.manual_cash_payment_enabled}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({
                ...prev,
                manual_cash_payment_enabled: checked,
              }))
            }
          />
        </div>

        <div className="flex items-start justify-between">
          <div>
            <Label className="text-base">Online Payments (Future)</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Configure Stripe/PayPal credentials now; checkout activation is
              deferred.
            </p>
          </div>
          <Switch
            checked={formData.online_payment_enabled}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({
                ...prev,
                online_payment_enabled: checked,
              }))
            }
          />
        </div>

        {formData.online_payment_enabled && (
          <div className="space-y-6">
            <div className="space-y-3 rounded-md border p-3">
              <div className="flex items-center justify-between">
                <Label className="text-base">Stripe</Label>
                <Switch
                  checked={formData.stripe_enabled}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      stripe_enabled: checked,
                    }))
                  }
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Use test keys from Stripe Dashboard → Developers → API Keys.
                Switch to production mode only with live keys and webhook.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  placeholder="Publishable key (pk_test_... / pk_live_...)"
                  value={formData.stripe_public_key}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      stripe_public_key: event.target.value,
                    }))
                  }
                />
                <Input
                  placeholder="Secret key (sk_test_... / sk_live_...)"
                  value={formData.stripe_secret_key}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      stripe_secret_key: event.target.value,
                    }))
                  }
                />
                <Input
                  className="sm:col-span-2"
                  placeholder="Webhook signing secret (whsec_...)"
                  value={formData.stripe_webhook_secret}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      stripe_webhook_secret: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Stripe Mode</Label>
                <Select
                  value={formData.stripe_mode}
                  onValueChange={(value: 'sandbox' | 'production') =>
                    setFormData((prev) => ({ ...prev, stripe_mode: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sandbox">Sandbox/Test</SelectItem>
                    <SelectItem value="production">Production/Live</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3 rounded-md border p-3">
              <div className="flex items-center justify-between">
                <Label className="text-base">PayPal</Label>
                <Switch
                  checked={formData.paypal_enabled}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      paypal_enabled: checked,
                    }))
                  }
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Use PayPal Developer app credentials (Client ID/Secret). Keep
                sandbox for testing; switch to production for live payments.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  placeholder="Client ID"
                  value={formData.paypal_client_id}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      paypal_client_id: event.target.value,
                    }))
                  }
                />
                <Input
                  placeholder="Client Secret"
                  value={formData.paypal_client_secret}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      paypal_client_secret: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>PayPal Mode</Label>
                <Select
                  value={formData.paypal_mode}
                  onValueChange={(value: 'sandbox' | 'production') =>
                    setFormData((prev) => ({ ...prev, paypal_mode: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sandbox">Sandbox</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
            Save Loan Policy
          </>
        )}
      </Button>
    </form>
  );
}
