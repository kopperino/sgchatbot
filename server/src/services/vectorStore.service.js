import { Chroma } from '@langchain/community/vectorstores/chroma';
import { OpenAIEmbeddings } from '@langchain/openai';
import { config } from '../config/config.js';

class VectorStoreService {
  constructor() {
    this.vectorStore = null;
    this.embeddings = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      console.log('Initializing vector store...');

      // Initialize OpenAI embeddings
      this.embeddings = new OpenAIEmbeddings({
        openAIApiKey: config.openai.apiKey,
        modelName: config.openai.embeddingModel
      });

      // Connect to existing ChromaDB collection
      this.vectorStore = await Chroma.fromExistingCollection(
        this.embeddings,
        {
          collectionName: config.chroma.collectionName,
          url: config.chroma.url
        }
      );

      this.isInitialized = true;
      console.log('✓ Vector store initialized successfully');
    } catch (error) {
      console.error('Failed to initialize vector store:', error.message);
      throw new Error('Vector store initialization failed. Ensure ChromaDB is running and the collection exists.');
    }
  }

  async searchSimilar(query, k = 5) {
    if (!this.isInitialized) {
      throw new Error('Vector store not initialized');
    }

    try {
      const results = await this.vectorStore.similaritySearchWithScore(
        query,
        k
      );

      return results.map(([doc, score]) => ({
        content: doc.pageContent,
        metadata: doc.metadata,
        relevanceScore: score
      }));
    } catch (error) {
      console.error('Error searching vector store:', error.message);
      throw new Error('Failed to search vector store');
    }
  }

  async getCollectionInfo() {
    if (!this.isInitialized) {
      throw new Error('Vector store not initialized');
    }

    return {
      collectionName: config.chroma.collectionName,
      chromaUrl: config.chroma.url,
      status: 'connected'
    };
  }
}

// Export singleton instance
export default new VectorStoreService();
