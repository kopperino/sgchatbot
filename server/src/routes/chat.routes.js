import express from 'express';
import chatController from '../controllers/chat.controller.js';

const router = express.Router();

// POST /api/chat - Send a message and get RAG response
router.post('/', chatController.sendMessage);

// POST /api/chat/stream - Streaming chat response (SSE)
router.post('/stream', chatController.streamMessage);

export default router;
