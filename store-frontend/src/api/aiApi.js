import axiosClient from './axiosClient';

export const aiApi = {
  chat: (message, conversationId) => axiosClient.post('/api/ai/chat', { message, conversationId }),
};