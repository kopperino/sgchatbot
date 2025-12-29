import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { config } from '../config/config.js';
import vectorStoreService from './vectorStore.service.js';

class RAGService {
  constructor() {
    this.llm = new ChatOpenAI({
      openAIApiKey: config.openai.apiKey,
      modelName: config.openai.chatModel,
      temperature: config.openai.temperature,
      streaming: false
    });

    this.promptTemplate = PromptTemplate.fromTemplate(`You are an expert on the Steins;Gate series, knowledgeable about its characters, plot, concepts, and terminology.

Use the following context from the Steins;Gate wiki to answer the question. If the context doesn't contain enough information to fully answer the question, say so - don't make up information.

Context:
{context}

Question: {question}

Instructions:
- Write in a natural, flowing narrative style - tell a story rather than listing facts
- Avoid bullet points, numbered lists, or fragmented information
- Weave together details into cohesive paragraphs that read smoothly
- When citing sources, incorporate them naturally into sentences using the format ([1] Source Name)
- Use descriptive language and connect ideas together
- If discussing multiple aspects, transition smoothly between them
- Keep responses engaging and conversational while remaining accurate

Answer:`);
  }

  async generateResponse(query) {
    try {
      // Step 1: Search for relevant context
      console.log(`Searching for relevant context for query: "${query}"`);
      const relevantDocs = await vectorStoreService.searchSimilar(query, 5);

      if (relevantDocs.length === 0) {
        return {
          answer: "I couldn't find any relevant information in the Steins;Gate wiki to answer your question. Please try rephrasing or asking about specific characters, concepts, or events from Steins;Gate.",
          sources: []
        };
      }

      // Step 2: Build context string
      const context = relevantDocs
        .map((doc, i) => `[${i + 1}] ${doc.content}\nSource: ${doc.metadata.pageTitle} - ${doc.metadata.section}`)
        .join('\n\n');

      // Step 3: Format prompt
      const prompt = await this.promptTemplate.format({
        context,
        question: query
      });

      // Step 4: Generate response
      console.log('Generating response from LLM...');
      const response = await this.llm.invoke(prompt);

      // Step 5: Extract sources
      const sources = relevantDocs.map(doc => ({
        title: doc.metadata.pageTitle,
        url: doc.metadata.sourceUrl,
        section: doc.metadata.section,
        imageUrl: doc.metadata.imageUrl,
        relevance: doc.relevanceScore
      }));

      // Remove duplicate sources (same title + section)
      const uniqueSources = sources.filter((source, index, self) =>
        index === self.findIndex((s) => s.title === source.title && s.section === source.section)
      );

      return {
        answer: response.content,
        sources: uniqueSources
      };
    } catch (error) {
      console.error('Error generating RAG response:', error.message);
      throw new Error('Failed to generate response');
    }
  }

  async generateStreamingResponse(query, onStream) {
    try {
      // Step 1: Search for relevant context
      const relevantDocs = await vectorStoreService.searchSimilar(query, 5);

      if (relevantDocs.length === 0) {
        return {
          answer: "I couldn't find any relevant information in the Steins;Gate wiki to answer your question.",
          sources: []
        };
      }

      // Step 2: Build context string
      const context = relevantDocs
        .map((doc, i) => `[${i + 1}] ${doc.content}\nSource: ${doc.metadata.pageTitle} - ${doc.metadata.section}`)
        .join('\n\n');

      // Step 3: Format prompt
      const prompt = await this.promptTemplate.format({
        context,
        question: query
      });

      // Step 4: Stream response
      const streamingLLM = new ChatOpenAI({
        openAIApiKey: config.openai.apiKey,
        modelName: config.openai.chatModel,
        temperature: config.openai.temperature,
        streaming: true
      });

      let fullResponse = '';
      const stream = await streamingLLM.stream(prompt);

      for await (const chunk of stream) {
        fullResponse += chunk.content;
        if (onStream) {
          onStream(chunk.content);
        }
      }

      // Step 5: Extract sources
      const sources = relevantDocs.map(doc => ({
        title: doc.metadata.pageTitle,
        url: doc.metadata.sourceUrl,
        section: doc.metadata.section,
        imageUrl: doc.metadata.imageUrl,
        relevance: doc.relevanceScore
      }));

      const uniqueSources = sources.filter((source, index, self) =>
        index === self.findIndex((s) => s.title === source.title && s.section === source.section)
      );

      return {
        answer: fullResponse,
        sources: uniqueSources
      };
    } catch (error) {
      console.error('Error generating streaming response:', error.message);
      throw new Error('Failed to generate streaming response');
    }
  }
}

// Export singleton instance
export default new RAGService();
