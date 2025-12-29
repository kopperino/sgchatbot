import ragService from '../services/rag.service.js';

class ChatController {
  async sendMessage(req, res, next) {
    try {
      const { message } = req.body;

      // Validate request
      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return res.status(400).json({
          error: 'Invalid request',
          message: 'Please provide a valid message'
        });
      }

      if (message.length > 1000) {
        return res.status(400).json({
          error: 'Message too long',
          message: 'Please keep your message under 1000 characters'
        });
      }

      // Generate response using RAG
      const response = await ragService.generateResponse(message);

      // Return response with metadata
      res.json({
        id: Date.now().toString(),
        answer: response.answer,
        sources: response.sources,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  async streamMessage(req, res, next) {
    try {
      const { message } = req.body;

      // Validate request
      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return res.status(400).json({
          error: 'Invalid request',
          message: 'Please provide a valid message'
        });
      }

      // Set up SSE headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Generate streaming response
      const result = await ragService.generateStreamingResponse(
        message,
        (chunk) => {
          res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`);
        }
      );

      // Send sources
      res.write(`data: ${JSON.stringify({ type: 'sources', sources: result.sources })}\n\n`);

      // End stream
      res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
      res.end();
    } catch (error) {
      next(error);
    }
  }
}

export default new ChatController();
