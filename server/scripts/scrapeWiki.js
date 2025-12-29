import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://steins-gate.fandom.com';
const DELAY_MS = 1000; // 1 second delay between requests
const DATA_DIR = path.join(__dirname, '../../data/raw');

// Categories to scrape
const CATEGORIES = [
  { name: 'Characters', url: '/wiki/Category:Characters' },
  { name: 'Terminology', url: '/wiki/Category:Terminology' },
  { name: 'Episodes', url: '/wiki/Category:Episodes' },
];

// Sleep helper
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Create directory if it doesn't exist
async function ensureDir(dir) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

// Fetch page with retry logic
async function fetchPage(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Fetching: ${url}`);
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        timeout: 30000,
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${url} (attempt ${i + 1}/${retries}):`, error.message);
      if (i < retries - 1) {
        await sleep(2000 * (i + 1)); // Exponential backoff
      }
    }
  }
  return null;
}

// Extract links from category page
async function extractCategoryLinks(categoryUrl) {
  const html = await fetchPage(`${BASE_URL}${categoryUrl}`);
  if (!html) return [];

  const $ = cheerio.load(html);
  const links = [];

  // Extract article links from category page
  $('.category-page__member-link').each((_, element) => {
    const href = $(element).attr('href');
    const title = $(element).text().trim();

    // Filter out special pages, talk pages, etc.
    if (href && !href.includes(':') && !href.includes('Category:')) {
      links.push({
        url: href,
        title: title
      });
    }
  });

  console.log(`Found ${links.length} articles in category ${categoryUrl}`);
  return links;
}

// Scrape individual article page
async function scrapePage(pageUrl, category) {
  const html = await fetchPage(`${BASE_URL}${pageUrl}`);
  if (!html) return null;

  const $ = cheerio.load(html);

  // Extract page title
  const title = $('#firstHeading').text().trim() || $('h1').first().text().trim();

  // Extract main content (remove navigation, ads, etc.)
  $('.mw-parser-output').find('.toc, .navbox, .noprint, script, style').remove();

  // Extract infobox data if exists
  const infobox = {};
  $('.portable-infobox').each((_, element) => {
    $(element).find('.pi-data').each((_, dataElement) => {
      const label = $(dataElement).find('.pi-data-label').text().trim();
      const value = $(dataElement).find('.pi-data-value').text().trim();
      if (label && value) {
        infobox[label] = value;
      }
    });
  });

  // Extract main image (prioritize infobox image, then first content image)
  let imageUrl = null;

  // Try infobox image first
  const infoboxImage = $('.portable-infobox .pi-image img').first().attr('src');
  if (infoboxImage) {
    // Get full resolution image (remove size parameters)
    imageUrl = infoboxImage.split('/revision/')[0];
  }

  // Fallback to first article image if no infobox image
  if (!imageUrl) {
    const firstImage = $('.mw-parser-output img').first().attr('src');
    if (firstImage && !firstImage.includes('icon') && !firstImage.includes('logo')) {
      imageUrl = firstImage.split('/revision/')[0];
    }
  }

  // Ensure URL is absolute
  if (imageUrl && imageUrl.startsWith('//')) {
    imageUrl = 'https:' + imageUrl;
  } else if (imageUrl && imageUrl.startsWith('/')) {
    imageUrl = BASE_URL + imageUrl;
  }

  const data = {
    url: `${BASE_URL}${pageUrl}`,
    title: title,
    category: category,
    scrapedAt: new Date().toISOString(),
    html: html,
    metadata: {
      infobox: infobox,
      imageUrl: imageUrl
    }
  };

  return data;
}

// Main scraping function
async function main() {
  console.log('Starting Steins;Gate Wiki scraper...');

  // Ensure data directory exists
  await ensureDir(DATA_DIR);

  let totalScraped = 0;
  const allPages = [];

  // Scrape each category
  for (const category of CATEGORIES) {
    console.log(`\n--- Scraping category: ${category.name} ---`);

    // Create category directory
    const categoryDir = path.join(DATA_DIR, category.name.toLowerCase());
    await ensureDir(categoryDir);

    // Get all article links from category
    const links = await extractCategoryLinks(category.url);
    await sleep(DELAY_MS);

    // Scrape each article
    for (const link of links) {
      try {
        console.log(`Scraping: ${link.title}`);

        const pageData = await scrapePage(link.url, category.name.toLowerCase());

        if (pageData) {
          // Create safe filename from title
          const filename = link.title
            .replace(/[^a-z0-9]/gi, '_')
            .toLowerCase()
            .substring(0, 100) + '.json';

          const filepath = path.join(categoryDir, filename);
          await fs.writeFile(filepath, JSON.stringify(pageData, null, 2));

          allPages.push({
            title: link.title,
            category: category.name.toLowerCase(),
            file: filename
          });

          totalScraped++;
          console.log(`Saved: ${filename} (${totalScraped} total)`);
        }

        // Rate limiting
        await sleep(DELAY_MS);
      } catch (error) {
        console.error(`Error scraping ${link.title}:`, error.message);
      }
    }
  }

  // Save index of all scraped pages
  const indexPath = path.join(DATA_DIR, 'index.json');
  await fs.writeFile(indexPath, JSON.stringify({
    scrapedAt: new Date().toISOString(),
    totalPages: totalScraped,
    pages: allPages
  }, null, 2));

  console.log(`\n✓ Scraping complete! Total pages scraped: ${totalScraped}`);
  console.log(`Data saved to: ${DATA_DIR}`);
}

main().catch(console.error);
