import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth headers if needed
api.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const chatAPI = {
  // Send a chat message with optional RAG
  sendMessage: async (messages, apiKey, model = 'gpt-4.1-mini', useRAG = false) => {
    const response = await api.post('/chat', {
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      api_key: apiKey,
      model: model,
      use_rag: useRAG
    });
    return response.data;
  }
};

export const documentAPI = {
  // Upload a document for RAG
  uploadDocument: async (file, apiKey) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', apiKey);
    
    const response = await api.post('/upload-document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get document information
  getDocuments: async () => {
    const response = await api.get('/documents');
    return response.data;
  },

  // Clear all documents
  clearDocuments: async () => {
    const response = await api.delete('/documents');
    return response.data;
  }
};

export const ragAPI = {
  // Direct RAG query
  query: async (query, apiKey, k = 4, responseStyle = 'detailed') => {
    const response = await api.post('/rag-query', {
      query: query,
      api_key: apiKey,
      k: k,
      response_style: responseStyle
    });
    return response.data;
  }
};

export const healthAPI = {
  // Health check
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  }
};

export default api;