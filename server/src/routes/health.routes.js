import express from 'express';
import vectorStoreService from '../services/vectorStore.service.js';

const router = express.Router();

// GET /api/health - Health check
router.get('/', async (req, res) => {
  try {
    const vectorStoreInfo = await vectorStoreService.getCollectionInfo();

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        server: 'running',
        vectorStore: vectorStoreInfo.status,
        openai: 'available'
      },
      collection: vectorStoreInfo.collectionName
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

export default router;
