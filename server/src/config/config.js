import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || "development",

  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    embeddingModel: "text-embedding-3-small",
    chatModel: "gpt-5-nano",
    temperature: 1,
  },

  chroma: {
    url: process.env.CHROMA_URL || "http://localhost:8000",
    collectionName: process.env.CHROMA_COLLECTION || "steinsgate_wiki",
  },

  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  },

  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },

  logging: {
    level: process.env.LOG_LEVEL || "info",
  },
};
