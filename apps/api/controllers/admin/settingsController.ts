import { Request, Response } from 'express';
import { connectDatabase } from '../../db/database';
import {
  SiteSettings,
  UpdateSiteSettingsPayload,
} from '../../models/SiteSettings';
import {
  getPublicSettingsService,
  getSettingsService,
  updateSettingsService,
} from '../../services/settingsService';
import { emailService } from '../../utils/emailService';

/**
 * Get all settings (admin only)
 */
export const getSettings = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const settings = await getSettingsService();
    res.status(200).json({ settings });
  } catch (error: Error | unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching settings:', errorMessage);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update settings (admin only)
 */
export const updateSettings = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const updates: UpdateSiteSettingsPayload = req.body;
    const settings = await updateSettingsService(updates);

    res.status(200).json({
      message: 'Settings updated successfully',
      settings,
    });
  } catch (error: Error | unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    if (
      errorMessage.startsWith('Invalid usage_profile') ||
      errorMessage === 'No valid fields to update'
    ) {
      res.status(400).json({ message: errorMessage });
      return;
    }

    console.error('Error updating settings:', errorMessage);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get public settings (no auth required)
 */
export const getPublicSettings = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const settings = await getPublicSettingsService();
    res.status(200).json({ settings });
  } catch (error: Error | unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching public settings:', errorMessage);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Send test email to current admin (rate-limited)
 */
export const sendTestEmail = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const db = await connectDatabase();
    const adminEmail = req.user?.email;

    if (!adminEmail) {
      res.status(400).json({ message: 'Admin email not found' });
      return;
    }

    // Get current rate limit settings
    const settings = await db.get<SiteSettings>(
      'SELECT email_test_rate_limit, email_test_count, email_test_reset_at FROM site_settings WHERE id = 1',
    );

    if (!settings) {
      res.status(500).json({ message: 'Settings not found' });
      return;
    }

    const now = new Date();
    const resetAt = new Date(settings.email_test_reset_at);
    const hourInMs = 60 * 60 * 1000;

    // Check if we need to reset the counter (1 hour window)
    let currentCount = settings.email_test_count;
    if (now.getTime() - resetAt.getTime() > hourInMs) {
      // Reset counter
      await db.run(
        'UPDATE site_settings SET email_test_count = 0, email_test_reset_at = CURRENT_TIMESTAMP WHERE id = 1',
      );
      currentCount = 0;
    }

    // Check rate limit
    if (currentCount >= settings.email_test_rate_limit) {
      const resetTime = new Date(resetAt.getTime() + hourInMs);
      res.status(429).json({
        message: 'Rate limit exceeded for test emails',
        resetAt: resetTime.toISOString(),
        limit: settings.email_test_rate_limit,
      });
      return;
    }

    // Increment counter
    await db.run(
      'UPDATE site_settings SET email_test_count = email_test_count + 1 WHERE id = 1',
    );

    // Send test email
    const success = await emailService.sendEmail({
      to: adminEmail,
      subject: 'Folio - Test Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e4; border-radius: 5px;">
          <h2 style="color: #333; text-align: center;">Test Email Successful! 🎉</h2>
          <p>This is a test email from your Folio installation.</p>
          <p>If you received this email, your SMTP configuration is working correctly.</p>
          <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 4px;">
            <p style="margin: 0; font-size: 14px; color: #666;">
              <strong>Sent to:</strong> ${adminEmail}<br>
              <strong>Sent at:</strong> ${now.toISOString()}
            </p>
          </div>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e4e4e4; font-size: 12px; color: #777; text-align: center;">
            <p>© ${now.getFullYear()} Folio. All rights reserved.</p>
          </div>
        </div>
      `,
    });

    if (success) {
      res.status(200).json({
        message: 'Test email sent successfully',
        sentTo: adminEmail,
        remainingTests: settings.email_test_rate_limit - currentCount - 1,
      });
    } else {
      res.status(500).json({
        message:
          'Failed to send test email. Please check your SMTP configuration.',
      });
    }
  } catch (error: Error | unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error sending test email:', errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};
