import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 60000 // 60 second timeout for LLM responses
});

export async function sendChatMessage(message) {
  const response = await apiClient.post('/chat', { message });
  return response.data;
}

export async function checkHealth() {
  const response = await apiClient.get('/health');
  return response.data;
}

export default apiClient;
