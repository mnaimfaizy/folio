-- Global site settings for admin configuration

CREATE TABLE IF NOT EXISTS site_settings (
  id              INTEGER PRIMARY KEY DEFAULT 1,
  
  -- Page visibility (books/authors always visible, not stored here)
  show_about_page    BOOLEAN DEFAULT TRUE,
  show_contact_page  BOOLEAN DEFAULT TRUE,
  
  -- Branding & SEO
  site_name          TEXT DEFAULT 'Folio',
  site_description   TEXT DEFAULT 'Your digital library management system',
  logo_url           TEXT,
  favicon_url        TEXT,
  seo_keywords       TEXT,
  
  -- Hero section
  hero_title         TEXT DEFAULT 'Your Digital Library Awaits',
  hero_subtitle      TEXT DEFAULT 'Discover, collect, and manage your favorite books in one beautiful place.',
  hero_cta_text      TEXT DEFAULT 'Get Started',
  hero_cta_link      TEXT DEFAULT '/signup',
  hero_image_url     TEXT,
  
  -- Footer section
  footer_text        TEXT DEFAULT '© 2026 Folio. All rights reserved.',
  footer_links       JSONB DEFAULT '[]',
  social_links       JSONB DEFAULT '[]',
  
  -- Contact information
  contact_email      TEXT,
  contact_phone      TEXT,
  contact_address    TEXT,
  contact_form_enabled BOOLEAN DEFAULT TRUE,
  
  -- SMTP metadata (credentials stay in env)
  smtp_enabled       BOOLEAN DEFAULT FALSE,
  smtp_from_name     TEXT DEFAULT 'Folio',
  smtp_from_email    TEXT,
  
  -- Email test rate limit (per hour, global)
  email_test_rate_limit INTEGER DEFAULT 5,
  email_test_count   INTEGER DEFAULT 0,
  email_test_reset_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  -- Mobile integration
  mobile_app_enabled   BOOLEAN DEFAULT FALSE,
  mobile_api_base_url  TEXT,
  mobile_app_store_url TEXT,
  mobile_play_store_url TEXT,
  
  -- Timestamps
  created_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure only one row exists
  CONSTRAINT single_row CHECK (id = 1)
);

-- Insert default settings row
INSERT INTO site_settings (id) VALUES (1) ON CONFLICT DO NOTHING;
