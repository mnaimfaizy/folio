#!/usr/bin/env node

/**
 * Generate sitemap.xml for the Folio web application
 * This script fetches public content from the API and generates a sitemap
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3001';
const SITE_BASE_URL = process.env.SITE_BASE_URL || 'https://your-library.com';

// Priority and change frequency mappings
const PRIORITY = {
  home: '1.0',
  static: '0.8',
  books: '0.9',
  authors: '0.9',
  book: '0.7',
  author: '0.7',
};

const CHANGE_FREQ = {
  home: 'weekly',
  static: 'monthly',
  books: 'daily',
  authors: 'daily',
  book: 'monthly',
  author: 'monthly',
};

/**
 * Fetch data from API
 */
async function fetchFromAPI(endpoint) {
  return new Promise((resolve, reject) => {
    const url = `${API_BASE_URL}${endpoint}`;
    https
      .get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on('error', reject);
  });
}

/**
 * Generate sitemap XML
 */
function generateSitemapXML(urls) {
  const urlEntries = urls
    .map(
      (url) => `
  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`,
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_BASE_URL}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_BASE_URL}/books</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${SITE_BASE_URL}/authors</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${SITE_BASE_URL}/about</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${SITE_BASE_URL}/contact</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>${urlEntries}
</urlset>`;
}

/**
 * Main function
 */
async function generateSitemap() {
  try {
    console.log('Generating sitemap...');

    // Fetch books
    console.log('Fetching books...');
    const booksResponse = await fetchFromAPI('/api/books?limit=1000');
    const books = booksResponse.books || [];

    // Fetch authors
    console.log('Fetching authors...');
    const authorsResponse = await fetchFromAPI('/api/authors?limit=1000');
    const authors = authorsResponse.authors || [];

    // Generate URLs
    const urls = [];

    // Add book URLs
    books.forEach((book) => {
      urls.push({
        loc: `${SITE_BASE_URL}/books/${book.id}`,
        lastmod: book.updated_at || book.created_at || new Date().toISOString(),
        changefreq: 'monthly',
        priority: '0.7',
      });
    });

    // Add author URLs
    authors.forEach((author) => {
      urls.push({
        loc: `${SITE_BASE_URL}/authors/${author.id}`,
        lastmod:
          author.updated_at || author.created_at || new Date().toISOString(),
        changefreq: 'monthly',
        priority: '0.7',
      });
    });

    // Generate XML
    const sitemapXML = generateSitemapXML(urls);

    // Write to public directory
    const outputPath = path.join(
      __dirname,
      '../../apps/web/public/sitemap.xml',
    );
    fs.writeFileSync(outputPath, sitemapXML);

    console.log(
      `Sitemap generated with ${urls.length} dynamic URLs at ${outputPath}`,
    );
  } catch (error) {
    console.error('Error generating sitemap:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  generateSitemap();
}

module.exports = { generateSitemap };
