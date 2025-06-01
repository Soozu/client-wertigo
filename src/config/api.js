// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  ENDPOINTS: {
    AUTH: {
      REGISTER: '/api/auth/register',
      LOGIN: '/api/auth/login',
      LOGOUT: '/api/auth/logout',
      VALIDATE: '/api/auth/validate',
      PROFILE: '/api/auth/profile'
    },
    MODEL: {
      CHAT: '/api/model/chat',
      STATUS: '/api/model/status',
      SAMPLE_MESSAGES: '/api/model/sample-messages'
    },
    TRIPS: {
      BASE: '/api/trips',
      BY_ID: (id) => `/api/trips/${id}`
    },
    GENERAL: {
      HEALTH: '/api/health',
      CITIES: '/api/cities',
      CATEGORIES: '/api/categories',
      RECOMMEND: '/api/recommend'
    }
  },
  TIMEOUT: 20000,
  RETRY_ATTEMPTS: 2
};

// Session storage keys
export const STORAGE_KEYS = {
  SESSION_ID: 'wertigo_session_id',
  USER_DATA: 'wertigo_user_data'
};

// Default headers
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json'
};

export default API_CONFIG; 