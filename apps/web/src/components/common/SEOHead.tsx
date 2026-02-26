import { useEffect } from 'react';
import { SEOConfig } from '@/utils/seoUtils';

/**
 * Component to manage document head metadata for SEO
 */
export function SEOHead({ config }: { config: SEOConfig }) {
  useEffect(() => {
    // Update document title
    document.title = config.title;

    // Update or create meta tags
    updateMetaTag('name', 'description', config.description);
    updateMetaTag('name', 'keywords', config.keywords || '');

    // Canonical URL
    updateLinkTag('canonical', config.canonical);

    // Open Graph tags
    updateMetaTag('property', 'og:title', config.ogTitle || config.title);
    updateMetaTag(
      'property',
      'og:description',
      config.ogDescription || config.description,
    );
    updateMetaTag('property', 'og:image', config.ogImage || '');
    updateMetaTag('property', 'og:type', config.ogType || 'website');
    updateMetaTag('property', 'og:url', config.canonical);

    // Twitter Card tags
    updateMetaTag(
      'name',
      'twitter:card',
      config.twitterCard || 'summary_large_image',
    );
    updateMetaTag('name', 'twitter:title', config.twitterTitle || config.title);
    updateMetaTag(
      'name',
      'twitter:description',
      config.twitterDescription || config.description,
    );
    updateMetaTag('name', 'twitter:image', config.twitterImage || '');

    // Robots directive
    if (config.noindex) {
      updateMetaTag('name', 'robots', 'noindex,nofollow');
    } else {
      // Remove robots tag if it exists and noindex is false
      const robotsTag = document.querySelector('meta[name="robots"]');
      if (robotsTag) {
        robotsTag.remove();
      }
    }

    // Structured data (JSON-LD)
    if (config.structuredData) {
      updateStructuredData(config.structuredData);
    } else {
      // Remove existing structured data if none provided
      const existingScript = document.querySelector(
        'script[type="application/ld+json"]',
      );
      if (existingScript) {
        existingScript.remove();
      }
    }
  }, [config]);

  return null; // This component doesn't render anything
}

/**
 * Update or create a meta tag
 */
function updateMetaTag(attrName: string, attrValue: string, content: string) {
  if (!content) {
    // Remove the tag if content is empty
    const existingTag = document.querySelector(
      `meta[${attrName}="${attrValue}"]`,
    );
    if (existingTag) {
      existingTag.remove();
    }
    return;
  }

  let tag = document.querySelector(
    `meta[${attrName}="${attrValue}"]`,
  ) as HTMLMetaElement;
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attrName, attrValue);
    document.head.appendChild(tag);
  }
  tag.content = content;
}

/**
 * Update or create a link tag
 */
function updateLinkTag(rel: string, href: string) {
  let tag = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
  if (!tag) {
    tag = document.createElement('link');
    tag.rel = rel;
    document.head.appendChild(tag);
  }
  tag.href = href;
}

/**
 * Update structured data JSON-LD script
 */
function updateStructuredData(data: object) {
  let script = document.querySelector(
    'script[type="application/ld+json"]',
  ) as HTMLScriptElement;
  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
}
