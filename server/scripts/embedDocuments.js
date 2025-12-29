import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Chroma } from '@langchain/community/vectorstores/chroma';
import { Document } from '@langchain/core/documents';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROCESSED_DATA_DIR = path.join(__dirname, '../../data/processed');
const CHUNKS_FILE = path.join(PROCESSED_DATA_DIR, 'chunks.json');

const BATCH_SIZE = 100;

// Main embedding function
async function main() {
  console.log('Starting embedding process...');

  // Check for OpenAI API key
  if (!process.env.OPENAI_API_KEY) {
    console.error('Error: OPENAI_API_KEY environment variable is not set');
    console.log('Please create a .env file in the server directory with your OpenAI API key:');
    console.log('OPENAI_API_KEY=sk-your-key-here');
    process.exit(1);
  }

  // Load processed chunks
  console.log(`Loading chunks from: ${CHUNKS_FILE}`);

  let chunksData;
  try {
    const fileContent = await fs.readFile(CHUNKS_FILE, 'utf-8');
    chunksData = JSON.parse(fileContent);
  } catch (error) {
    console.error('Error loading chunks file:', error.message);
    console.log('\nPlease run "npm run process" first to process the scraped documents.');
    process.exit(1);
  }

  console.log(`Loaded ${chunksData.length} chunks`);

  // Convert to LangChain Document objects
  const documents = chunksData.map(chunk => new Document({
    pageContent: chunk.pageContent,
    metadata: chunk.metadata
  }));

  // Initialize OpenAI embeddings
  console.log('Initializing OpenAI embeddings (text-embedding-3-small)...');
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: 'text-embedding-3-small'
  });

  // Get ChromaDB URL from environment or use default
  const chromaUrl = process.env.CHROMA_URL || 'http://localhost:8000';
  const collectionName = process.env.CHROMA_COLLECTION || 'steinsgate_wiki';

  console.log(`Connecting to ChromaDB at: ${chromaUrl}`);
  console.log(`Collection name: ${collectionName}`);

  try {
    // Process in batches
    console.log(`\nEmbedding and storing documents in batches of ${BATCH_SIZE}...`);

    for (let i = 0; i < documents.length; i += BATCH_SIZE) {
      const batch = documents.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(documents.length / BATCH_SIZE);

      console.log(`Processing batch ${batchNum}/${totalBatches} (${batch.length} documents)...`);

      if (i === 0) {
        // Create new collection with first batch
        await Chroma.fromDocuments(
          batch,
          embeddings,
          {
            collectionName: collectionName,
            url: chromaUrl,
            collectionMetadata: {
              'hnsw:space': 'cosine',
              description: 'Steins;Gate Wiki RAG knowledge base'
            }
          }
        );
        console.log(`  ✓ Created collection and embedded first batch`);
      } else {
        // Add to existing collection
        const vectorStore = await Chroma.fromExistingCollection(
          embeddings,
          {
            collectionName: collectionName,
            url: chromaUrl
          }
        );

        await vectorStore.addDocuments(batch);
        console.log(`  ✓ Added batch to collection`);
      }
    }

    console.log(`\n✓ Embedding complete!`);
    console.log(`Total documents embedded: ${documents.length}`);
    console.log(`Collection: ${collectionName}`);
    console.log(`ChromaDB URL: ${chromaUrl}`);

    // Test the vector store with a sample query
    console.log('\n--- Testing vector store with sample query ---');
    const vectorStore = await Chroma.fromExistingCollection(
      embeddings,
      {
        collectionName: collectionName,
        url: chromaUrl
      }
    );

    const results = await vectorStore.similaritySearch('What is Reading Steiner?', 3);

    console.log('\nTop 3 results for query: "What is Reading Steiner?"');
    results.forEach((doc, i) => {
      console.log(`\n${i + 1}. ${doc.metadata.pageTitle} - ${doc.metadata.section}`);
      console.log(`   ${doc.pageContent.substring(0, 150)}...`);
    });

    console.log('\n✓ Vector store is working correctly!');

  } catch (error) {
    console.error('\nError during embedding process:', error.message);

    if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed')) {
      console.log('\nChromaDB connection failed. Please ensure ChromaDB is running:');
      console.log('  Option 1 (Docker): docker run -p 8000:8000 chromadb/chroma');
      console.log('  Option 2 (Python): chroma run --host localhost --port 8000');
    }

    process.exit(1);
  }
}

main().catch(console.error);
