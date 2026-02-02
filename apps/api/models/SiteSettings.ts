/**
 * Site Settings model - Global configuration for the application
 * Managed by Admin via the Settings UI
 */

export interface FooterLink {
  label: string;
  url: string;
}

export interface SocialLink {
  platform: string; // 'twitter', 'facebook', 'instagram', 'linkedin', 'github'
  url: string;
}

export interface SiteSettings {
  id: number;

  // Page visibility (books/authors always visible - not configurable)
  show_about_page: boolean;
  show_contact_page: boolean;

  // Branding & SEO
  site_name: string;
  site_description: string;
  logo_url: string | null;
  favicon_url: string | null;
  seo_keywords: string | null;

  // Hero section
  hero_title: string;
  hero_subtitle: string;
  hero_cta_text: string;
  hero_cta_link: string;
  hero_image_url: string | null;

  // Footer section
  footer_text: string;
  footer_links: FooterLink[];
  social_links: SocialLink[];

  // Contact information
  contact_email: string | null;
  contact_phone: string | null;
  contact_address: string | null;
  contact_form_enabled: boolean;

  // SMTP metadata (credentials stay in env)
  smtp_enabled: boolean;
  smtp_from_name: string;
  smtp_from_email: string | null;

  // Email test rate limit
  email_test_rate_limit: number;
  email_test_count: number;
  email_test_reset_at: Date;

  // Mobile integration
  mobile_app_enabled: boolean;
  mobile_api_base_url: string | null;
  mobile_app_store_url: string | null;
  mobile_play_store_url: string | null;

  // Timestamps
  created_at: Date;
  updated_at: Date;
}

/**
 * Public settings - safe to expose without authentication
 */
export interface PublicSiteSettings {
  // Page visibility
  show_about_page: boolean;
  show_contact_page: boolean;

  // Branding & SEO
  site_name: string;
  site_description: string;
  logo_url: string | null;
  favicon_url: string | null;
  seo_keywords: string | null;

  // Hero section
  hero_title: string;
  hero_subtitle: string;
  hero_cta_text: string;
  hero_cta_link: string;
  hero_image_url: string | null;

  // Footer section
  footer_text: string;
  footer_links: FooterLink[];
  social_links: SocialLink[];

  // Contact information (public parts only)
  contact_email: string | null;
  contact_phone: string | null;
  contact_address: string | null;
  contact_form_enabled: boolean;

  // Mobile app links (public)
  mobile_app_enabled: boolean;
  mobile_app_store_url: string | null;
  mobile_play_store_url: string | null;
}

/**
 * Admin settings update payload
 */
export interface UpdateSiteSettingsPayload {
  // Page visibility
  show_about_page?: boolean;
  show_contact_page?: boolean;

  // Branding & SEO
  site_name?: string;
  site_description?: string;
  logo_url?: string | null;
  favicon_url?: string | null;
  seo_keywords?: string | null;

  // Hero section
  hero_title?: string;
  hero_subtitle?: string;
  hero_cta_text?: string;
  hero_cta_link?: string;
  hero_image_url?: string | null;

  // Footer section
  footer_text?: string;
  footer_links?: FooterLink[];
  social_links?: SocialLink[];

  // Contact information
  contact_email?: string | null;
  contact_phone?: string | null;
  contact_address?: string | null;
  contact_form_enabled?: boolean;

  // SMTP metadata
  smtp_enabled?: boolean;
  smtp_from_name?: string;
  smtp_from_email?: string | null;

  // Email test rate limit
  email_test_rate_limit?: number;

  // Mobile integration
  mobile_app_enabled?: boolean;
  mobile_api_base_url?: string | null;
  mobile_app_store_url?: string | null;
  mobile_play_store_url?: string | null;
}
