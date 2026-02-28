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

export interface TeamMember {
  name: string;
  role: string;
  initials: string;
  bgColor: string;
  description: string;
}

export interface Program {
  title: string;
  icon: string;
  description: string;
}

export type UsageProfile = 'single_user' | 'library' | 'showcase';

export interface SiteSettings {
  id: number;

  // Usage mode/profile
  usage_profile: UsageProfile;

  // Page visibility (books/authors always visible - not configurable)
  show_about_page: boolean;
  show_contact_page: boolean;

  // Branding & SEO
  site_name: string;
  site_description: string;
  logo_url: string | null;
  favicon_url: string | null;
  seo_keywords: string | null;
  site_base_url: string;
  default_og_image_url: string | null;
  robots_policy: string;

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

  // Loan policy
  loans_enabled: boolean;
  max_concurrent_loans: number;
  default_loan_duration_days: number;
  minimum_credit_balance: number;
  credit_currency: string;
  manual_cash_payment_enabled: boolean;
  online_payment_enabled: boolean;
  stripe_enabled: boolean;
  stripe_public_key: string | null;
  stripe_secret_key: string | null;
  stripe_webhook_secret: string | null;
  stripe_mode: 'sandbox' | 'production';
  paypal_enabled: boolean;
  paypal_client_id: string | null;
  paypal_client_secret: string | null;
  paypal_mode: 'sandbox' | 'production';

  // Mobile integration
  mobile_app_enabled: boolean;
  mobile_api_base_url: string | null;
  mobile_app_store_url: string | null;
  mobile_play_store_url: string | null;

  // Statistics (Landing Page)
  stat_total_books: string;
  stat_total_ebooks: string;
  stat_active_members: string;
  stat_online_access: string;

  // Trust indicators (Landing Page)
  stat_active_readers: string;
  stat_books_display: string;
  stat_rating: string;

  // About Page - Library Stats
  about_books_collection: string;
  about_active_members: string;
  about_years_service: string;
  about_community_awards: string;

  // About Page - Mission & Vision
  about_mission_text: string;
  about_vision_text: string;

  // About Page - History
  about_history_text: string;

  // About Page - Team Members
  about_team_members: TeamMember[];

  // About Page - Programs & Services
  about_programs: Program[];

  // Timestamps
  created_at: Date;
  updated_at: Date;
}

/**
 * Public settings - safe to expose without authentication
 */
export interface PublicSiteSettings {
  // Usage mode/profile
  usage_profile: UsageProfile;

  // Page visibility
  show_about_page: boolean;
  show_contact_page: boolean;

  // Branding & SEO
  site_name: string;
  site_description: string;
  logo_url: string | null;
  favicon_url: string | null;
  seo_keywords: string | null;
  site_base_url: string;
  default_og_image_url: string | null;
  robots_policy: string;

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

  // Loan policy
  loans_enabled: boolean;
  max_concurrent_loans: number;
  default_loan_duration_days: number;
  minimum_credit_balance: number;
  credit_currency: string;
  manual_cash_payment_enabled: boolean;
  online_payment_enabled: boolean;
  stripe_enabled: boolean;
  stripe_public_key: string | null;
  stripe_mode: 'sandbox' | 'production';
  paypal_enabled: boolean;
  paypal_client_id: string | null;
  paypal_mode: 'sandbox' | 'production';

  // Mobile app links (public)
  mobile_app_enabled: boolean;
  mobile_app_store_url: string | null;
  mobile_play_store_url: string | null;

  // Statistics (Landing Page)
  stat_total_books: string;
  stat_total_ebooks: string;
  stat_active_members: string;
  stat_online_access: string;

  // Trust indicators (Landing Page)
  stat_active_readers: string;
  stat_books_display: string;
  stat_rating: string;

  // About Page - Library Stats
  about_books_collection: string;
  about_active_members: string;
  about_years_service: string;
  about_community_awards: string;

  // About Page - Mission & Vision
  about_mission_text: string;
  about_vision_text: string;

  // About Page - History
  about_history_text: string;

  // About Page - Team Members
  about_team_members: TeamMember[];

  // About Page - Programs & Services
  about_programs: Program[];
}

/**
 * Admin settings update payload
 */
export interface UpdateSiteSettingsPayload {
  // Usage mode/profile
  usage_profile?: UsageProfile;

  // Page visibility
  show_about_page?: boolean;
  show_contact_page?: boolean;

  // Branding & SEO
  site_name?: string;
  site_description?: string;
  logo_url?: string | null;
  favicon_url?: string | null;
  seo_keywords?: string | null;
  site_base_url?: string;
  default_og_image_url?: string | null;
  robots_policy?: string;

  // Hero section

  // Statistics (Landing Page)
  stat_total_books?: string;
  stat_total_ebooks?: string;
  stat_active_members?: string;
  stat_online_access?: string;

  // Trust indicators (Landing Page)
  stat_active_readers?: string;
  stat_books_display?: string;
  stat_rating?: string;

  // About Page - Library Stats
  about_books_collection?: string;
  about_active_members?: string;
  about_years_service?: string;
  about_community_awards?: string;

  // About Page - Mission & Vision
  about_mission_text?: string;
  about_vision_text?: string;

  // About Page - History
  about_history_text?: string;

  // About Page - Team Members
  about_team_members?: TeamMember[];

  // About Page - Programs & Services
  about_programs?: Program[];
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

  // Loan policy
  loans_enabled?: boolean;
  max_concurrent_loans?: number;
  default_loan_duration_days?: number;
  minimum_credit_balance?: number;
  credit_currency?: string;
  manual_cash_payment_enabled?: boolean;
  online_payment_enabled?: boolean;
  stripe_enabled?: boolean;
  stripe_public_key?: string | null;
  stripe_secret_key?: string | null;
  stripe_webhook_secret?: string | null;
  stripe_mode?: 'sandbox' | 'production';
  paypal_enabled?: boolean;
  paypal_client_id?: string | null;
  paypal_client_secret?: string | null;
  paypal_mode?: 'sandbox' | 'production';

  // Mobile integration
  mobile_app_enabled?: boolean;
  mobile_api_base_url?: string | null;
  mobile_app_store_url?: string | null;
  mobile_play_store_url?: string | null;
}
