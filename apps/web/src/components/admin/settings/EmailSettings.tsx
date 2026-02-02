import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import { SiteSettings } from '@/services/adminService';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import AdminService from '@/services/adminService';

interface EmailSettingsProps {
  settings: SiteSettings;
  onUpdate: (updates: Partial<SiteSettings>) => Promise<void>;
  saving: boolean;
}

export function EmailSettings({
  settings,
  onUpdate,
  saving,
}: EmailSettingsProps) {
  const [formData, setFormData] = useState({
    smtp_enabled: settings.smtp_enabled,
    smtp_from_name: settings.smtp_from_name || '',
    smtp_from_email: settings.smtp_from_email || '',
    email_test_rate_limit: settings.email_test_rate_limit,
  });

  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    remainingTests?: number;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdate(formData);
  };

  const handleSendTestEmail = async () => {
    try {
      setSendingTest(true);
      setTestResult(null);
      const response = await AdminService.sendTestEmail();
      setTestResult({
        success: true,
        message: response.message,
        remainingTests: response.remainingTests,
      });
      toast.success('Test email sent successfully!');
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string; resetAt?: string } };
      };
      const message =
        axiosError.response?.data?.message || 'Failed to send test email';
      const resetAt = axiosError.response?.data?.resetAt;
      setTestResult({
        success: false,
        message: resetAt
          ? `${message}. Try again after ${new Date(resetAt).toLocaleTimeString()}`
          : message,
      });
      toast.error(message);
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>SMTP Credentials</AlertTitle>
        <AlertDescription>
          SMTP credentials (host, port, username, password) are configured via
          environment variables for security. Set{' '}
          <code className="bg-muted px-1 py-0.5 rounded">SMTP_HOST</code>,{' '}
          <code className="bg-muted px-1 py-0.5 rounded">SMTP_PORT</code>,{' '}
          <code className="bg-muted px-1 py-0.5 rounded">SMTP_USER</code>, and{' '}
          <code className="bg-muted px-1 py-0.5 rounded">SMTP_PASS</code> in
          your deployment environment.
        </AlertDescription>
      </Alert>

      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div>
          <Label htmlFor="smtp_enabled" className="font-medium">
            Enable Custom SMTP
          </Label>
          <p className="text-sm text-muted-foreground">
            Use your configured SMTP settings for sending emails
          </p>
        </div>
        <Switch
          id="smtp_enabled"
          checked={formData.smtp_enabled}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, smtp_enabled: checked })
          }
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="smtp_from_name">From Name</Label>
          <Input
            id="smtp_from_name"
            value={formData.smtp_from_name}
            onChange={(e) =>
              setFormData({ ...formData, smtp_from_name: e.target.value })
            }
            placeholder="Folio"
          />
          <p className="text-sm text-muted-foreground">
            Name displayed as the sender
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="smtp_from_email">From Email</Label>
          <Input
            id="smtp_from_email"
            type="email"
            value={formData.smtp_from_email}
            onChange={(e) =>
              setFormData({ ...formData, smtp_from_email: e.target.value })
            }
            placeholder="noreply@example.com"
          />
          <p className="text-sm text-muted-foreground">
            Email address used as the sender
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email_test_rate_limit">Test Email Rate Limit</Label>
        <Input
          id="email_test_rate_limit"
          type="number"
          min={1}
          max={100}
          value={formData.email_test_rate_limit}
          onChange={(e) =>
            setFormData({
              ...formData,
              email_test_rate_limit: parseInt(e.target.value) || 5,
            })
          }
        />
        <p className="text-sm text-muted-foreground">
          Maximum number of test emails that can be sent per hour (globally)
        </p>
      </div>

      {/* Test Email Section */}
      <div className="border rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-semibold">
              Test Email Configuration
            </Label>
            <p className="text-sm text-muted-foreground">
              Send a test email to verify your SMTP settings are working
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleSendTestEmail}
            disabled={sendingTest}
          >
            {sendingTest ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Test Email
              </>
            )}
          </Button>
        </div>

        {testResult && (
          <Alert variant={testResult.success ? 'default' : 'destructive'}>
            {testResult.success ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>
              {testResult.message}
              {testResult.remainingTests !== undefined && (
                <span className="ml-2 text-muted-foreground">
                  ({testResult.remainingTests} tests remaining this hour)
                </span>
              )}
            </AlertDescription>
          </Alert>
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
