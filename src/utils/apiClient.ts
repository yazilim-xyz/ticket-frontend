import axios, { AxiosError, AxiosResponse } from 'axios';
import { API_CONFIG } from '../config/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token to every request
apiClient.interceptors.request.use(
  (config) => {
    // FIX: localStorage yerine sessionStorage kullan (authService ile uyumlu)
    const token = sessionStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401) {
      // FIX: localStorage yerine sessionStorage kullan
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('userId');
      window.location.href = '/login';
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('Access forbidden');
    }

    // Handle 500 Server Error
    if (error.response?.status === 500) {
      console.error('Server error occurred');
    }

    return Promise.reject(error);
  }
);

export default apiClient;

// Helper function to handle API errors
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    // Server responded with error
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    
    // Network error
    if (error.message === 'Network Error') {
      return 'Network error. Please check your connection.';
    }
    
    // Timeout error
    if (error.code === 'ECONNABORTED') {
      return 'Request timeout. Please try again.';
    }
    
    return error.message;
  }
  
  return 'An unexpected error occurred';
};