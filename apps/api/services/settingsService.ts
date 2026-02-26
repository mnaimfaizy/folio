import {
  PublicSiteSettings,
  SiteSettings,
  UpdateSiteSettingsPayload,
  UsageProfile,
} from '../models/SiteSettings';
import {
  ensureSettingsRow,
  updateSettingsRow,
} from '../repositories/settingsRepository';

const VALID_USAGE_PROFILES: UsageProfile[] = [
  'single_user',
  'library',
  'showcase',
];

const JSON_FIELDS = new Set([
  'footer_links',
  'social_links',
  'about_team_members',
  'about_programs',
]);

const ALLOWED_UPDATE_FIELDS = [
  'usage_profile',
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
  'loans_enabled',
  'max_concurrent_loans',
  'default_loan_duration_days',
  'mobile_app_enabled',
  'mobile_api_base_url',
  'mobile_app_store_url',
  'mobile_play_store_url',
  'stat_total_books',
  'stat_total_ebooks',
  'stat_active_members',
  'stat_online_access',
  'stat_active_readers',
  'stat_books_display',
  'stat_rating',
  'about_books_collection',
  'about_active_members',
  'about_years_service',
  'about_community_awards',
  'about_mission_text',
  'about_vision_text',
  'about_history_text',
  'about_team_members',
  'about_programs',
] as const;

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

function toDate(value: unknown): Date {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return new Date(value);
  }

  return new Date();
}

function mapSettingsRow(row: SiteSettings): SiteSettings {
  return {
    ...row,
    usage_profile: VALID_USAGE_PROFILES.includes(row.usage_profile)
      ? row.usage_profile
      : 'library',
    footer_links: parseJsonField(row.footer_links as unknown, []),
    social_links: parseJsonField(row.social_links as unknown, []),
    about_team_members: parseJsonField(row.about_team_members as unknown, []),
    about_programs: parseJsonField(row.about_programs as unknown, []),
    email_test_reset_at: toDate(row.email_test_reset_at),
    created_at: toDate(row.created_at),
    updated_at: toDate(row.updated_at),
  };
}

function toPublicSettings(settings: SiteSettings): PublicSiteSettings {
  return {
    usage_profile: settings.usage_profile,
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
    loans_enabled: settings.loans_enabled,
    max_concurrent_loans: settings.max_concurrent_loans,
    default_loan_duration_days: settings.default_loan_duration_days,
    mobile_app_enabled: settings.mobile_app_enabled,
    mobile_app_store_url: settings.mobile_app_store_url,
    mobile_play_store_url: settings.mobile_play_store_url,
    stat_total_books: settings.stat_total_books,
    stat_total_ebooks: settings.stat_total_ebooks,
    stat_active_members: settings.stat_active_members,
    stat_online_access: settings.stat_online_access,
    stat_active_readers: settings.stat_active_readers,
    stat_books_display: settings.stat_books_display,
    stat_rating: settings.stat_rating,
    about_books_collection: settings.about_books_collection,
    about_active_members: settings.about_active_members,
    about_years_service: settings.about_years_service,
    about_community_awards: settings.about_community_awards,
    about_mission_text: settings.about_mission_text,
    about_vision_text: settings.about_vision_text,
    about_history_text: settings.about_history_text,
    about_team_members: settings.about_team_members,
    about_programs: settings.about_programs,
  };
}

export const getSettingsService = async (): Promise<SiteSettings> => {
  const row = await ensureSettingsRow();

  if (!row) {
    throw new Error('Failed to load settings');
  }

  return mapSettingsRow(row);
};

export const getPublicSettingsService =
  async (): Promise<PublicSiteSettings> => {
    const settings = await getSettingsService();
    return toPublicSettings(settings);
  };

export const updateSettingsService = async (
  updates: UpdateSiteSettingsPayload,
): Promise<SiteSettings> => {
  if ('usage_profile' in updates) {
    const usageProfile = updates.usage_profile;
    if (!usageProfile || !VALID_USAGE_PROFILES.includes(usageProfile)) {
      throw new Error(
        "Invalid usage_profile. Must be one of: 'single_user', 'library', 'showcase'",
      );
    }
  }

  const setClauses: string[] = [];
  const values: unknown[] = [];

  for (const field of ALLOWED_UPDATE_FIELDS) {
    if (field in updates) {
      const rawValue = updates[field];
      const value = JSON_FIELDS.has(field)
        ? JSON.stringify(rawValue)
        : rawValue;

      setClauses.push(`${field} = ?`);
      values.push(value);
    }
  }

  if (setClauses.length === 0) {
    throw new Error('No valid fields to update');
  }

  setClauses.push('updated_at = CURRENT_TIMESTAMP');
  await updateSettingsRow(setClauses, values);

  const row = await ensureSettingsRow();
  if (!row) {
    throw new Error('Failed to load settings');
  }

  return mapSettingsRow(row);
};
