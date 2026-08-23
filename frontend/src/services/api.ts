import axios from 'axios';

export const getApiBaseUrl = (): string => {
  const saved = localStorage.getItem('peachy_api_url');
  if (saved) return saved;
  return import.meta.env.VITE_API_BASE_URL || 'https://peachy-backend-api.onrender.com';
};

export const api = axios.create({
  baseURL: `${getApiBaseUrl()}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Update baseURL dynamically before each request
api.interceptors.request.use(
  (config) => {
    config.baseURL = `${getApiBaseUrl()}/api`;
    const token = localStorage.getItem('peachy_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401s gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token on 401 Unauthorized
      localStorage.removeItem('peachy_token');
    }
    return Promise.reject(error);
  }
);
