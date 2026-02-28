import api from './api';

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

// Public settings interface (safe to expose without auth)
export interface PublicSiteSettings {
  usage_profile: UsageProfile;
  show_about_page: boolean;
  show_contact_page: boolean;
  site_name: string;
  site_description: string;
  logo_url: string | null;
  favicon_url: string | null;
  seo_keywords: string | null;
  site_base_url: string;
  default_og_image_url: string | null;
  robots_policy: string;
  hero_title: string;
  hero_subtitle: string;
  hero_cta_text: string;
  hero_cta_link: string;
  hero_image_url: string | null;
  footer_text: string;
  footer_links: FooterLink[];
  social_links: SocialLink[];
  contact_email: string | null;
  contact_phone: string | null;
  contact_address: string | null;
  contact_form_enabled: boolean;
  loans_enabled: boolean;
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

export interface FooterLink {
  label: string;
  url: string;
}

export interface SocialLink {
  platform: string;
  url: string;
}

// Default settings for fallback
export const DEFAULT_SETTINGS: PublicSiteSettings = {
  usage_profile: 'library',
  show_about_page: true,
  show_contact_page: true,
  site_name: 'Folio',
  site_description: 'Your digital library management system',
  logo_url: null,
  favicon_url: null,
  seo_keywords: null,
  site_base_url: 'https://your-library.com',
  default_og_image_url: null,
  robots_policy: 'index,follow',
  hero_title: 'Your Digital Library Awaits',
  hero_subtitle:
    'Discover, collect, and manage your favorite books in one beautiful place.',
  hero_cta_text: 'Get Started',
  hero_cta_link: '/signup',
  hero_image_url: null,
  footer_text: '© 2026 Folio. All rights reserved.',
  footer_links: [],
  social_links: [],
  contact_email: null,
  contact_phone: null,
  contact_address: null,
  contact_form_enabled: true,
  loans_enabled: true,
  minimum_credit_balance: 50,
  credit_currency: 'USD',
  manual_cash_payment_enabled: true,
  online_payment_enabled: false,
  stripe_enabled: false,
  stripe_public_key: null,
  stripe_mode: 'sandbox',
  paypal_enabled: false,
  paypal_client_id: null,
  paypal_mode: 'sandbox',
  mobile_app_enabled: false,
  mobile_app_store_url: null,
  mobile_play_store_url: null,

  // Statistics (Landing Page)
  stat_total_books: '10,000+',
  stat_total_ebooks: '5,000+',
  stat_active_members: '2,500+',
  stat_online_access: '24/7',

  // Trust indicators (Landing Page)
  stat_active_readers: '2,500+',
  stat_books_display: '10,000+',
  stat_rating: '4.9/5',

  // About Page - Library Stats
  about_books_collection: '50,000+',
  about_active_members: '12,000+',
  about_years_service: '30+',
  about_community_awards: '15',

  // About Page - Mission & Vision
  about_mission_text:
    'To inspire, educate, and empower our community by providing equal access to knowledge, fostering a love of reading, and promoting lifelong learning through high-quality resources and innovative services.',
  about_vision_text:
    'To be a vibrant hub where knowledge, creativity, and community thrive, offering accessible services that evolve with technological advancements while preserving the joy of reading and discovery.',

  // About Page - History
  about_history_text:
    "Founded in 1990, our library began as a small community reading room with just 500 books. Today, we've grown into a comprehensive digital and physical library serving thousands of readers across the region.\n\nThrough the decades, we've embraced technological change while maintaining our core mission of providing free access to information and promoting literacy. In 2010, we launched our first digital catalog, and in 2018, we completely renovated our main building to create more collaborative spaces.\n\nOur library has been recognized for excellence in community service, innovative programming, and our commitment to digital inclusion. We continue to evolve with the changing needs of our community while preserving the joy of reading and discovery that has always been at our core.",

  // About Page - Team Members
  about_team_members: [
    {
      name: 'Sarah Johnson',
      role: 'Head Librarian',
      initials: 'SJ',
      bgColor: 'bg-blue-500',
      description: 'With over 15 years of experience in library science.',
    },
    {
      name: 'David Chen',
      role: 'Digital Resources Manager',
      initials: 'DC',
      bgColor: 'bg-green-500',
      description: 'Specializing in e-books and digital archives.',
    },
    {
      name: 'Maya Patel',
      role: 'Community Outreach',
      initials: 'MP',
      bgColor: 'bg-amber-500',
      description:
        'Connecting the library with local schools and organizations.',
    },
    {
      name: 'James Wilson',
      role: 'Technical Services',
      initials: 'JW',
      bgColor: 'bg-purple-500',
      description: 'Managing our catalog and library systems.',
    },
  ],

  // About Page - Programs & Services
  about_programs: [
    {
      title: 'Reading Clubs',
      icon: 'BookOpen',
      description: 'Join monthly book discussions for all ages and interests.',
    },
    {
      title: 'Digital Literacy',
      icon: 'Globe',
      description:
        'Free workshops to improve technology skills and online research.',
    },
    {
      title: 'Academic Support',
      icon: 'GraduationCap',
      description: 'Homework help and research assistance for students.',
    },
    {
      title: 'Author Events',
      icon: 'Users',
      description:
        'Regular visits from published authors for readings and discussions.',
    },
    {
      title: "Children's Programming",
      icon: 'Award',
      description:
        'Storytimes, craft sessions, and educational activities for kids.',
    },
    {
      title: 'Community Space',
      icon: 'Users',
      description:
        'Meeting rooms and collaborative spaces available for community use.',
    },
  ],
};

let cachedSettings: PublicSiteSettings | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const SettingsService = {
  /**
   * Get public site settings
   * Results are cached for 5 minutes
   */
  getPublicSettings: async (): Promise<PublicSiteSettings> => {
    const now = Date.now();

    // Return cached settings if still valid
    if (cachedSettings && now - cacheTimestamp < CACHE_TTL) {
      return cachedSettings;
    }

    try {
      const response = await api.get<{ settings: PublicSiteSettings }>(
        '/api/settings',
      );
      cachedSettings = response.data.settings;
      cacheTimestamp = now;
      return cachedSettings;
    } catch (error) {
      console.error('Failed to fetch public settings:', error);
      // Return cached settings if available, otherwise defaults
      return cachedSettings || DEFAULT_SETTINGS;
    }
  },

  /**
   * Clear the settings cache (useful after admin updates)
   */
  clearCache: () => {
    cachedSettings = null;
    cacheTimestamp = 0;
  },

  /**
   * Get default settings (for SSR or initial render)
   */
  getDefaultSettings: (): PublicSiteSettings => {
    return DEFAULT_SETTINGS;
  },
};

export default SettingsService;
