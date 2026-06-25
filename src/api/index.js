import axios from 'axios';

// In dev, Vite proxy handles /api -> localhost:3001
// In production (Vercel), VITE_API_URL must be set to Render backend URL
const BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({ baseURL: BASE_URL + '/api' });

export const questionApi = {
  list: (params) => api.get('/questions', { params }),
  get: (id) => api.get(`/questions/${id}`),
  create: (data) => api.post('/questions', data),
  delete: (id) => api.delete(`/questions/${id}`),
  upload: (formData) => api.post('/questions/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export const examApi = {
  create: (data) => api.post('/exams', data),
  list: () => api.get('/exams'),
  get: (id, withAnswers) => api.get(`/exams/${id}`, { params: { withAnswers } }),
  delete: (id) => api.delete(`/exams/${id}`),
};

export const wrongApi = {
  list: (sessionId) => api.get('/wrong-questions', { params: { sessionId } }),
  check: (data) => api.post('/wrong-questions/check', data),
  remove: (questionId, sessionId) => api.delete(`/wrong-questions/${questionId}`, { params: { sessionId } }),
  clearAll: (sessionId) => api.delete('/wrong-questions/clear-all', { params: { sessionId } }),
};

export const progressApi = {
  get: (examId, sessionId) => api.get(`/progress/${examId}`, { params: { sessionId } }),
  save: (examId, data) => api.post(`/progress/${examId}`, data),
};
