import { Request, Response } from 'express';
import { connectDatabase } from '../../db/database';
import {
  SiteSettings,
  PublicSiteSettings,
  UpdateSiteSettingsPayload,
} from '../../models/SiteSettings';
import { emailService } from '../../utils/emailService';

/**
 * Helper to parse JSONB fields from database
 */
function parseJsonField<T>(value: unknown, defaultValue: T): T {
  if (!value) return defaultValue;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return defaultValue;
    }
  }
  return value as T;
}

/**
 * Helper to convert settings row to proper types
 */
function mapSettingsRow(row: any): SiteSettings {
  return {
    ...row,
    footer_links: parseJsonField(row.footer_links, []),
    social_links: parseJsonField(row.social_links, []),
    email_test_reset_at: row.email_test_reset_at
      ? new Date(row.email_test_reset_at)
      : new Date(),
    created_at: row.created_at ? new Date(row.created_at) : new Date(),
    updated_at: row.updated_at ? new Date(row.updated_at) : new Date(),
  };
}

/**
 * Get all settings (admin only)
 */
export const getSettings = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const db = await connectDatabase();

    let settings = await db.get<SiteSettings>(
      'SELECT * FROM site_settings WHERE id = 1',
    );

    // If no settings exist, create default row
    if (!settings) {
      await db.run('INSERT INTO site_settings (id) VALUES (1)');
      settings = await db.get<SiteSettings>(
        'SELECT * FROM site_settings WHERE id = 1',
      );
    }

    if (!settings) {
      res.status(500).json({ message: 'Failed to load settings' });
      return;
    }

    res.status(200).json({ settings: mapSettingsRow(settings) });
  } catch (error: Error | unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching settings:', errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
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
    const db = await connectDatabase();

    // Build dynamic UPDATE query
    const allowedFields = [
      'show_about_page',
      'show_contact_page',
      'site_name',
      'site_description',
      'logo_url',
      'favicon_url',
      'seo_keywords',
      'hero_title',
      'hero_subtitle',
      'hero_cta_text',
      'hero_cta_link',
      'hero_image_url',
      'footer_text',
      'footer_links',
      'social_links',
      'contact_email',
      'contact_phone',
      'contact_address',
      'contact_form_enabled',
      'smtp_enabled',
      'smtp_from_name',
      'smtp_from_email',
      'email_test_rate_limit',
      'mobile_app_enabled',
      'mobile_api_base_url',
      'mobile_app_store_url',
      'mobile_play_store_url',
    ];

    const setClauses: string[] = [];
    const values: unknown[] = [];

    for (const field of allowedFields) {
      if (field in updates) {
        let value = (updates as any)[field];
        // Stringify JSON fields
        if (field === 'footer_links' || field === 'social_links') {
          value = JSON.stringify(value);
        }
        setClauses.push(`${field} = ?`);
        values.push(value);
      }
    }

    if (setClauses.length === 0) {
      res.status(400).json({ message: 'No valid fields to update' });
      return;
    }

    // Add updated_at
    setClauses.push('updated_at = CURRENT_TIMESTAMP');
    values.push(1); // id = 1

    const sql = `UPDATE site_settings SET ${setClauses.join(', ')} WHERE id = ?`;
    await db.run(sql, values);

    // Fetch updated settings
    const settings = await db.get<SiteSettings>(
      'SELECT * FROM site_settings WHERE id = 1',
    );

    res.status(200).json({
      message: 'Settings updated successfully',
      settings: settings ? mapSettingsRow(settings) : null,
    });
  } catch (error: Error | unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error updating settings:', errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
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
    const db = await connectDatabase();

    let row = await db.get<SiteSettings>(
      'SELECT * FROM site_settings WHERE id = 1',
    );

    // If no settings exist, create default row
    if (!row) {
      await db.run('INSERT INTO site_settings (id) VALUES (1)');
      row = await db.get<SiteSettings>(
        'SELECT * FROM site_settings WHERE id = 1',
      );
    }

    if (!row) {
      res.status(500).json({ message: 'Failed to load settings' });
      return;
    }

    const settings = mapSettingsRow(row);

    // Return only public fields
    const publicSettings: PublicSiteSettings = {
      show_about_page: settings.show_about_page,
      show_contact_page: settings.show_contact_page,
      site_name: settings.site_name,
      site_description: settings.site_description,
      logo_url: settings.logo_url,
      favicon_url: settings.favicon_url,
      seo_keywords: settings.seo_keywords,
      hero_title: settings.hero_title,
      hero_subtitle: settings.hero_subtitle,
      hero_cta_text: settings.hero_cta_text,
      hero_cta_link: settings.hero_cta_link,
      hero_image_url: settings.hero_image_url,
      footer_text: settings.footer_text,
      footer_links: settings.footer_links,
      social_links: settings.social_links,
      contact_email: settings.contact_email,
      contact_phone: settings.contact_phone,
      contact_address: settings.contact_address,
      contact_form_enabled: settings.contact_form_enabled,
      mobile_app_enabled: settings.mobile_app_enabled,
      mobile_app_store_url: settings.mobile_app_store_url,
      mobile_play_store_url: settings.mobile_play_store_url,
    };

    res.status(200).json({ settings: publicSettings });
  } catch (error: Error | unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching public settings:', errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
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
