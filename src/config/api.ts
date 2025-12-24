// Base URL'i doğrudan backend'e yönlendir
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8081',
  TIMEOUT: 10000,
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  TICKETS: {
    BASE: '/api/tickets',
    BY_ID: (id: string) => `/api/tickets/${id}`,
    COMMENTS: (id: string) => `/api/tickets/${id}/comments`,
    STATUS: (id: string) => `/api/tickets/${id}/status`,
    ASSIGN: (id: string) => `/api/tickets/${id}/assign`,
  },
} as const;

export default API_CONFIG;