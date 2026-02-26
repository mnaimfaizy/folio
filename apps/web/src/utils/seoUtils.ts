import { PublicSiteSettings } from '@/services/settingsService';

/**
 * SEO configuration and utilities for the web application
 */

export interface SEOConfig {
  title: string;
  description: string;
  canonical: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  keywords?: string;
  noindex?: boolean;
  structuredData?: object;
}

/**
 * Generate canonical URL for a given path
 */
const FALLBACK_BASE_URL = 'https://your-library.com';

export function getCanonicalUrl(
  settings: PublicSiteSettings,
  path = '',
): string {
  const baseUrl = (settings.site_base_url || FALLBACK_BASE_URL).replace(
    /\/$/,
    '',
  );
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

/**
 * Generate default SEO config for a page
 */
export function getDefaultSEOConfig(
  settings: PublicSiteSettings,
  overrides: Partial<SEOConfig> = {},
): SEOConfig {
  const baseConfig: SEOConfig = {
    title: settings.site_name,
    description: settings.site_description || '',
    canonical: getCanonicalUrl(settings),
    ogTitle: settings.site_name,
    ogDescription: settings.site_description || '',
    ogImage: settings.default_og_image_url || settings.logo_url || undefined,
    ogType: 'website',
    twitterCard: 'summary_large_image',
    twitterTitle: settings.site_name,
    twitterDescription: settings.site_description || '',
    twitterImage:
      settings.default_og_image_url || settings.logo_url || undefined,
    keywords: settings.seo_keywords || undefined,
    noindex: false,
  };

  return { ...baseConfig, ...overrides };
}

/**
 * Generate SEO config for book detail pages
 */
export function getBookSEOConfig(
  settings: PublicSiteSettings,
  book: {
    title: string;
    description?: string;
    cover_url?: string;
    authors?: string[];
  },
  bookId: string,
): SEOConfig {
  const title = `${book.title} - ${settings.site_name}`;
  const description =
    book.description || `Read ${book.title} in our digital library.`;
  const canonical = getCanonicalUrl(settings, `/books/${bookId}`);

  return getDefaultSEOConfig(settings, {
    title,
    description,
    canonical,
    ogTitle: title,
    ogDescription: description,
    ogImage:
      book.cover_url ||
      settings.default_og_image_url ||
      settings.logo_url ||
      undefined,
    ogType: 'book',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage:
      book.cover_url ||
      settings.default_og_image_url ||
      settings.logo_url ||
      undefined,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Book',
      name: book.title,
      description: book.description,
      image: book.cover_url,
      author: book.authors?.map((author) => ({
        '@type': 'Person',
        name: author,
      })),
      publisher: {
        '@type': 'Organization',
        name: settings.site_name,
      },
    },
  });
}

/**
 * Generate SEO config for author detail pages
 */
export function getAuthorSEOConfig(
  settings: PublicSiteSettings,
  author: {
    name: string;
    bio?: string;
    photo_url?: string;
    birth_date?: string;
    death_date?: string;
  },
  authorId: string,
): SEOConfig {
  const title = `${author.name} - ${settings.site_name}`;
  const description =
    author.bio ||
    `Learn about ${author.name}, featured in our digital library.`;
  const canonical = getCanonicalUrl(settings, `/authors/${authorId}`);

  return getDefaultSEOConfig(settings, {
    title,
    description,
    canonical,
    ogTitle: title,
    ogDescription: description,
    ogImage:
      author.photo_url ||
      settings.default_og_image_url ||
      settings.logo_url ||
      undefined,
    ogType: 'profile',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage:
      author.photo_url ||
      settings.default_og_image_url ||
      settings.logo_url ||
      undefined,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: author.name,
      description: author.bio,
      image: author.photo_url,
      birthDate: author.birth_date,
      deathDate: author.death_date,
    },
  });
}

/**
 * Generate SEO config for list pages
 */
export function getListPageSEOConfig(
  settings: PublicSiteSettings,
  pageType: 'books' | 'authors',
  currentPage?: number,
  searchQuery?: string,
): SEOConfig {
  const pageTitles = {
    books: 'Books',
    authors: 'Authors',
  };

  const pageDescriptions = {
    books: 'Browse our collection of books in our digital library.',
    authors: 'Discover authors featured in our digital library collection.',
  };

  let title = `${pageTitles[pageType]} - ${settings.site_name}`;
  let description = pageDescriptions[pageType];
  let canonical = getCanonicalUrl(settings, `/${pageType}`);

  if (searchQuery) {
    title = `Search: ${searchQuery} - ${pageTitles[pageType]} - ${settings.site_name}`;
    description = `Search results for "${searchQuery}" in our ${pageType} collection.`;
    canonical = getCanonicalUrl(
      settings,
      `/${pageType}?q=${encodeURIComponent(searchQuery)}`,
    );
  } else if (currentPage && currentPage > 1) {
    title = `${pageTitles[pageType]} - Page ${currentPage} - ${settings.site_name}`;
    canonical = getCanonicalUrl(settings, `/${pageType}?page=${currentPage}`);
  }

  return getDefaultSEOConfig(settings, {
    title,
    description,
    canonical,
    ogTitle: title,
    ogDescription: description,
  });
}

/**
 * Generate SEO config for static pages
 */
export function getStaticPageSEOConfig(
  settings: PublicSiteSettings,
  pageType: 'about' | 'contact' | 'home',
): SEOConfig {
  const pageConfigs = {
    home: {
      title: settings.site_name,
      description:
        settings.site_description || 'Welcome to our digital library.',
      canonical: getCanonicalUrl(settings, '/'),
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: settings.site_name,
        description: settings.site_description,
        url: settings.site_base_url,
        logo: settings.logo_url,
      },
    },
    about: {
      title: `About Us - ${settings.site_name}`,
      description:
        'Learn about our mission, vision, and the services we provide to our community.',
      canonical: getCanonicalUrl(settings, '/about'),
    },
    contact: {
      title: `Contact Us - ${settings.site_name}`,
      description:
        'Get in touch with us. Find our contact information and send us a message.',
      canonical: getCanonicalUrl(settings, '/contact'),
    },
  };

  const config = pageConfigs[pageType];
  return getDefaultSEOConfig(settings, config);
}

/**
 * Generate SEO config for auth/admin pages (noindex)
 */
export function getPrivatePageSEOConfig(
  settings: PublicSiteSettings,
  title: string,
): SEOConfig {
  return getDefaultSEOConfig(settings, {
    title: `${title} - ${settings.site_name}`,
    noindex: true,
  });
}
