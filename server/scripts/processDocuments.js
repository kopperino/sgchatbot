import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Document } from '@langchain/core/documents';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RAW_DATA_DIR = path.join(__dirname, '../../data/raw');
const PROCESSED_DATA_DIR = path.join(__dirname, '../../data/processed');

// Ensure directory exists
async function ensureDir(dir) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

// Extract clean text from HTML
function extractTextFromHTML(html) {
  const $ = cheerio.load(html);

  // Remove unwanted elements
  $('script, style, .toc, .navbox, .noprint, .mw-editsection, .reference').remove();

  // Extract main content
  const mainContent = $('.mw-parser-output');

  if (mainContent.length === 0) {
    return '';
  }

  const sections = [];

  // Extract sections by headers
  mainContent.find('h2, h3').each((_, element) => {
    const heading = $(element).text().replace(/\[edit\]/g, '').trim();

    // Get content until next heading
    let content = '';
    $(element).nextUntil('h2, h3').each((_, el) => {
      const tagName = el.tagName.toLowerCase();

      // Include paragraphs, lists, and tables
      if (['p', 'ul', 'ol', 'dl', 'table'].includes(tagName)) {
        content += $(el).text().trim() + '\n\n';
      }
    });

    if (content.trim()) {
      sections.push({
        heading: heading,
        content: content.trim()
      });
    }
  });

  // Also include content before first heading
  let introContent = '';
  mainContent.children().each((_, element) => {
    const tagName = element.tagName.toLowerCase();

    if (tagName === 'h2' || tagName === 'h3') {
      return false; // Stop at first heading
    }

    if (['p', 'ul', 'ol', 'dl'].includes(tagName)) {
      introContent += $(element).text().trim() + '\n\n';
    }
  });

  if (introContent.trim()) {
    sections.unshift({
      heading: 'Introduction',
      content: introContent.trim()
    });
  }

  return sections;
}

// Process a single page
async function processPage(filePath, category) {
  try {
    const rawData = JSON.parse(await fs.readFile(filePath, 'utf-8'));

    // Extract sections from HTML
    const sections = extractTextFromHTML(rawData.html);

    if (!sections || sections.length === 0) {
      console.log(`No content extracted from: ${rawData.title}`);
      return [];
    }

    // Create text splitter
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 800,
      chunkOverlap: 100,
    });

    const chunks = [];

    // Process each section
    for (const section of sections) {
      if (!section.content || section.content.length < 50) {
        continue; // Skip very short sections
      }

      // Create documents for this section
      const sectionChunks = await splitter.createDocuments(
        [section.content],
        [{
          sourceUrl: rawData.url,
          pageTitle: rawData.title,
          category: category,
          section: section.heading,
          imageUrl: rawData.metadata?.imageUrl || null
        }]
      );

      chunks.push(...sectionChunks);
    }

    return chunks;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return [];
  }
}

// Process all pages in a category
async function processCategory(categoryName) {
  const categoryDir = path.join(RAW_DATA_DIR, categoryName);

  try {
    const files = await fs.readdir(categoryDir);
    const jsonFiles = files.filter(f => f.endsWith('.json'));

    console.log(`Processing ${jsonFiles.length} files in ${categoryName}...`);

    const allChunks = [];

    for (const file of jsonFiles) {
      const filePath = path.join(categoryDir, file);
      const chunks = await processPage(filePath, categoryName);

      allChunks.push(...chunks);
      console.log(`  Processed: ${file} (${chunks.length} chunks)`);
    }

    return allChunks;
  } catch (error) {
    console.error(`Error processing category ${categoryName}:`, error.message);
    return [];
  }
}

// Main processing function
async function main() {
  console.log('Starting document processing...');

  // Ensure processed data directory exists
  await ensureDir(PROCESSED_DATA_DIR);

  // Get all categories
  const categories = await fs.readdir(RAW_DATA_DIR);
  const categoryDirs = [];

  for (const item of categories) {
    const itemPath = path.join(RAW_DATA_DIR, item);
    const stats = await fs.stat(itemPath);

    if (stats.isDirectory()) {
      categoryDirs.push(item);
    }
  }

  console.log(`Found ${categoryDirs.length} categories: ${categoryDirs.join(', ')}`);

  const allChunks = [];

  // Process each category
  for (const category of categoryDirs) {
    console.log(`\n--- Processing category: ${category} ---`);
    const chunks = await processCategory(category);
    allChunks.push(...chunks);
  }

  // Convert chunks to serializable format
  const serializedChunks = allChunks.map((doc, index) => ({
    pageContent: doc.pageContent,
    metadata: {
      ...doc.metadata,
      chunkIndex: index
    }
  }));

  // Save all processed chunks
  const outputPath = path.join(PROCESSED_DATA_DIR, 'chunks.json');
  await fs.writeFile(outputPath, JSON.stringify(serializedChunks, null, 2));

  console.log(`\n✓ Processing complete!`);
  console.log(`Total chunks created: ${serializedChunks.length}`);
  console.log(`Data saved to: ${outputPath}`);

  // Save summary statistics
  const summaryPath = path.join(PROCESSED_DATA_DIR, 'summary.json');
  const categoryCounts = {};

  for (const chunk of serializedChunks) {
    const category = chunk.metadata.category;
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  }

  await fs.writeFile(summaryPath, JSON.stringify({
    processedAt: new Date().toISOString(),
    totalChunks: serializedChunks.length,
    chunksByCategory: categoryCounts,
    avgChunkLength: Math.round(
      serializedChunks.reduce((sum, chunk) => sum + chunk.pageContent.length, 0) /
      serializedChunks.length
    )
  }, null, 2));

  console.log('\nSummary by category:');
  for (const [category, count] of Object.entries(categoryCounts)) {
    console.log(`  ${category}: ${count} chunks`);
  }
}

main().catch(console.error);
