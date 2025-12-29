import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/config.js';
import chatRoutes from './routes/chat.routes.js';
import healthRoutes from './routes/health.routes.js';
import errorHandler from './middleware/errorHandler.js';
import vectorStoreService from './services/vectorStore.service.js';

const app = express();
const PORT = config.port;

// Security middleware
app.use(helmet());

// CORS configuration - allow all localhost origins
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    // Allow any localhost origin
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Request logging (simple)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/chat', chatRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Steins;Gate RAG Chatbot API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      chat: '/api/chat',
      chatStream: '/api/chat/stream'
    }
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Initialize services and start server
async function startServer() {
  try {
    console.log('Starting Steins;Gate RAG Chatbot Server...');
    console.log('Environment:', config.nodeEnv);

    // Check for OpenAI API key
    if (!config.openai.apiKey) {
      console.error('\n❌ Error: OPENAI_API_KEY environment variable is not set');
      console.log('Please create a .env file in the server directory with your OpenAI API key:');
      console.log('OPENAI_API_KEY=sk-your-key-here\n');
      process.exit(1);
    }

    // Initialize vector store
    console.log('\nInitializing vector store...');
    await vectorStoreService.initialize();

    // Start server
    app.listen(PORT, () => {
      console.log('\n✓ Server is running successfully!');
      console.log(`  Port: ${PORT}`);
      console.log(`  API URL: http://localhost:${PORT}/api`);
      console.log(`  Health Check: http://localhost:${PORT}/api/health`);
      console.log(`  CORS Origin: ${config.cors.origin}`);
      console.log(`  ChromaDB: ${config.chroma.url}`);
      console.log(`  Collection: ${config.chroma.collectionName}\n`);
    });
  } catch (error) {
    console.error('\n❌ Failed to start server:', error.message);

    if (error.message.includes('Vector store initialization failed')) {
      console.log('\nPlease ensure:');
      console.log('1. ChromaDB is running (docker run -p 8000:8000 chromadb/chroma)');
      console.log('2. You have run the data preparation scripts:');
      console.log('   npm run scrape');
      console.log('   npm run process');
      console.log('   npm run embed\n');
    }

    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start the server
startServer();
