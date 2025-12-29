import { useState } from 'react';
import { sendChatMessage } from '../services/api';

function useChat() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  const sendMessage = async (content) => {
    // Clear any previous errors
    setError(null);

    // Add user message
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);

    setIsLoading(true);

    try {
      const response = await sendChatMessage(content);

      // Add assistant response
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.answer,
        sources: response.sources,
        timestamp: response.timestamp
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Failed to send message:', err);

      // Determine error message
      let errorMessage = 'Sorry, something went wrong. Please try again.';

      if (err.response) {
        // Server responded with error
        errorMessage = err.response.data?.error?.message || err.response.data?.message || errorMessage;
      } else if (err.request) {
        // No response received
        errorMessage = 'Unable to connect to the server. Please ensure the backend is running.';
      }

      // Add error message
      const errorMessageObj = {
        id: Date.now() + 1,
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessageObj]);

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, isLoading, error, sendMessage, clearChat };
}

export default useChat;
