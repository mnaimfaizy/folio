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

  -- Loan policy
  loans_enabled BOOLEAN DEFAULT TRUE,
  max_concurrent_loans INTEGER DEFAULT 3,
  default_loan_duration_days INTEGER DEFAULT 14,
  
  -- Mobile integration
  mobile_app_enabled   BOOLEAN DEFAULT FALSE,
  mobile_api_base_url  TEXT,
  mobile_app_store_url TEXT,
  mobile_play_store_url TEXT,
  
  -- Statistics (Landing Page)
  stat_total_books     TEXT DEFAULT '10,000+',
  stat_total_ebooks    TEXT DEFAULT '5,000+',
  stat_active_members  TEXT DEFAULT '2,500+',
  stat_online_access   TEXT DEFAULT '24/7',
  
  -- Trust indicators (Landing Page)
  stat_active_readers  TEXT DEFAULT '2,500+',
  stat_books_display   TEXT DEFAULT '10,000+',
  stat_rating          TEXT DEFAULT '4.9/5',
  
  -- About Page - Library Stats
  about_books_collection TEXT DEFAULT '50,000+',
  about_active_members   TEXT DEFAULT '12,000+',
  about_years_service    TEXT DEFAULT '30+',
  about_community_awards TEXT DEFAULT '15',
  
  -- About Page - Mission & Vision
  about_mission_text   TEXT DEFAULT 'To inspire, educate, and empower our community by providing equal access to knowledge, fostering a love of reading, and promoting lifelong learning through high-quality resources and innovative services.',
  about_vision_text    TEXT DEFAULT 'To be a vibrant hub where knowledge, creativity, and community thrive, offering accessible services that evolve with technological advancements while preserving the joy of reading and discovery.',
  
  -- About Page - History
  about_history_text   TEXT DEFAULT E'Founded in 1990, our library began as a small community reading room with just 500 books. Today, we\'ve grown into a comprehensive digital and physical library serving thousands of readers across the region.\n\nThrough the decades, we\'ve embraced technological change while maintaining our core mission of providing free access to information and promoting literacy. In 2010, we launched our first digital catalog, and in 2018, we completely renovated our main building to create more collaborative spaces.\n\nOur library has been recognized for excellence in community service, innovative programming, and our commitment to digital inclusion. We continue to evolve with the changing needs of our community while preserving the joy of reading and discovery that has always been at our core.',
  
  -- About Page - Team Members (JSONB array)
  about_team_members   JSONB DEFAULT '[
    {
      "name": "Sarah Johnson",
      "role": "Head Librarian",
      "initials": "SJ",
      "bgColor": "bg-blue-500",
      "description": "With over 15 years of experience in library science."
    },
    {
      "name": "David Chen",
      "role": "Digital Resources Manager",
      "initials": "DC",
      "bgColor": "bg-green-500",
      "description": "Specializing in e-books and digital archives."
    },
    {
      "name": "Maya Patel",
      "role": "Community Outreach",
      "initials": "MP",
      "bgColor": "bg-amber-500",
      "description": "Connecting the library with local schools and organizations."
    },
    {
      "name": "James Wilson",
      "role": "Technical Services",
      "initials": "JW",
      "bgColor": "bg-purple-500",
      "description": "Managing our catalog and library systems."
    }
  ]',
  
  -- About Page - Programs & Services (JSONB array)
  about_programs       JSONB DEFAULT '[
    {
      "title": "Reading Clubs",
      "icon": "BookOpen",
      "description": "Join monthly book discussions for all ages and interests."
    },
    {
      "title": "Digital Literacy",
      "icon": "Globe",
      "description": "Free workshops to improve technology skills and online research."
    },
    {
      "title": "Academic Support",
      "icon": "GraduationCap",
      "description": "Homework help and research assistance for students."
    },
    {
      "title": "Author Events",
      "icon": "Users",
      "description": "Regular visits from published authors for readings and discussions."
    },
    {
      "title": "Children''s Programming",
      "icon": "Award",
      "description": "Storytimes, craft sessions, and educational activities for kids."
    },
    {
      "title": "Community Space",
      "icon": "Users",
      "description": "Meeting rooms and collaborative spaces available for community use."
    }
  ]',
  
  -- Timestamps
  created_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure only one row exists
  CONSTRAINT single_row CHECK (id = 1)
);

-- Insert default settings row
INSERT INTO site_settings (id) VALUES (1) ON CONFLICT DO NOTHING;

-- Add new columns if they don't exist (for existing databases)
-- Statistics (Landing Page)
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS stat_total_books TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS stat_total_ebooks TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS stat_active_members TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS stat_online_access TEXT;

-- Trust indicators (Landing Page)
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS stat_active_readers TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS stat_books_display TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS stat_rating TEXT;

-- About Page - Library Stats
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS about_books_collection TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS about_active_members TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS about_years_service TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS about_community_awards TEXT;

-- About Page - Mission & Vision
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS about_mission_text TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS about_vision_text TEXT;

-- About Page - History
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS about_history_text TEXT;

-- About Page - Team Members & Programs (JSONB arrays)
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS about_team_members JSONB;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS about_programs JSONB;

-- Loan policy
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS loans_enabled BOOLEAN;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS max_concurrent_loans INTEGER;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS default_loan_duration_days INTEGER;

-- Update existing row with default values for new fields (if they are NULL)
UPDATE site_settings
SET
  stat_total_books = COALESCE(stat_total_books, '10,000+'),
  stat_total_ebooks = COALESCE(stat_total_ebooks, '5,000+'),
  stat_active_members = COALESCE(stat_active_members, '2,500+'),
  stat_online_access = COALESCE(stat_online_access, '24/7'),
  stat_active_readers = COALESCE(stat_active_readers, '2,500+'),
  stat_books_display = COALESCE(stat_books_display, '10,000+'),
  stat_rating = COALESCE(stat_rating, '4.9/5'),
  about_books_collection = COALESCE(about_books_collection, '50,000+'),
  about_active_members = COALESCE(about_active_members, '12,000+'),
  about_years_service = COALESCE(about_years_service, '30+'),
  about_community_awards = COALESCE(about_community_awards, '15'),
  loans_enabled = COALESCE(loans_enabled, TRUE),
  max_concurrent_loans = COALESCE(max_concurrent_loans, 3),
  default_loan_duration_days = COALESCE(default_loan_duration_days, 14),
  about_mission_text = COALESCE(about_mission_text, 'To inspire, educate, and empower our community by providing equal access to knowledge, fostering a love of reading, and promoting lifelong learning through high-quality resources and innovative services.'),
  about_vision_text = COALESCE(about_vision_text, 'To be a vibrant hub where knowledge, creativity, and community thrive, offering accessible services that evolve with technological advancements while preserving the joy of reading and discovery.'),
  about_history_text = COALESCE(about_history_text, E'Founded in 1990, our library began as a small community reading room with just 500 books. Today, we\'ve grown into a comprehensive digital and physical library serving thousands of readers across the region.\n\nThrough the decades, we\'ve embraced technological change while maintaining our core mission of providing free access to information and promoting literacy. In 2010, we launched our first digital catalog, and in 2018, we completely renovated our main building to create more collaborative spaces.\n\nOur library has been recognized for excellence in community service, innovative programming, and our commitment to digital inclusion. We continue to evolve with the changing needs of our community while preserving the joy of reading and discovery that has always been at our core.'),
  about_team_members = COALESCE(about_team_members, '[
    {
      "name": "Sarah Johnson",
      "role": "Head Librarian",
      "initials": "SJ",
      "bgColor": "bg-blue-500",
      "description": "With over 15 years of experience in library science."
    },
    {
      "name": "David Chen",
      "role": "Digital Resources Manager",
      "initials": "DC",
      "bgColor": "bg-green-500",
      "description": "Specializing in e-books and digital archives."
    },
    {
      "name": "Maya Patel",
      "role": "Community Outreach",
      "initials": "MP",
      "bgColor": "bg-amber-500",
      "description": "Connecting the library with local schools and organizations."
    },
    {
      "name": "James Wilson",
      "role": "Technical Services",
      "initials": "JW",
      "bgColor": "bg-purple-500",
      "description": "Managing our catalog and library systems."
    }
  ]'::jsonb),
  about_programs = COALESCE(about_programs, '[
    {
      "title": "Reading Clubs",
      "icon": "BookOpen",
      "description": "Join monthly book discussions for all ages and interests."
    },
    {
      "title": "Digital Literacy",
      "icon": "Globe",
      "description": "Free workshops to improve technology skills and online research."
    },
    {
      "title": "Academic Support",
      "icon": "GraduationCap",
      "description": "Homework help and research assistance for students."
    },
    {
      "title": "Author Events",
      "icon": "Users",
      "description": "Regular visits from published authors for readings and discussions."
    },
    {
      "title": "Children''s Programming",
      "icon": "Award",
      "description": "Storytimes, craft sessions, and educational activities for kids."
    },
    {
      "title": "Community Space",
      "icon": "Users",
      "description": "Meeting rooms and collaborative spaces available for community use."
    }
  ]'::jsonb)
WHERE id = 1;
