// API Configuration
export const API_CONFIG = {
  // Python Backend - AI, Recommendations, Geocoding, Routes
  PYTHON_BASE_URL: import.meta.env.VITE_PYTHON_API_URL || 'http://localhost:5000',
  
  // Express Backend - Authentication, Tickets, Reviews, Trip Sharing
  EXPRESS_BASE_URL: import.meta.env.VITE_EXPRESS_API_URL || 'http://localhost:3001',
  
  ENDPOINTS: {
    // Express Backend Endpoints
    AUTH: {
      REGISTER: '/api/auth/register',
      LOGIN: '/api/auth/login',
      LOGOUT: '/api/auth/logout',
      VALIDATE: '/api/auth/verify',
      PROFILE: '/api/auth/profile'
    },
    TRIPS: {
      BASE: '/api/trips',
      BY_ID: (tripId) => `/api/trips/${tripId}`,
      DESTINATIONS: (tripId) => `/api/trips/${tripId}/destinations`,
      DESTINATION_BY_ID: (tripId, destId) => `/api/trips/${tripId}/destinations/${destId}`,
      ROUTE: (tripId) => `/api/trips/${tripId}/route`
    },
    TICKETS: {
      GENERATE: '/api/tickets/generate',
      MY_TICKETS: '/api/tickets/my-tickets',
      TYPES: '/api/tickets/types/list'
    },
    REVIEWS: {
      BASE: '/api/reviews',
      BY_TRIP: (tripId) => `/api/reviews/trip/${tripId}`,
      STATS: (tripId) => `/api/reviews/trip/${tripId}/stats`
    },
    TRACKERS: {
      BASE: '/api/trackers',
      BY_ID: (trackerId) => `/api/trackers/${trackerId}`,
      BY_EMAIL: (email) => `/api/trackers/email/${email}`
    },
    
    // Python Backend Endpoints
    PYTHON: {
      HEALTH: '/api/health',
      CITIES: '/api/cities',
      CATEGORIES: '/api/categories',
      RECOMMEND: '/api/recommend',
      GEOCODE: '/api/geocode',
      ROUTE: '/api/route',
      MODEL_CHAT: '/api/model/chat',
      MODEL_STATUS: '/api/model/status',
      SAMPLE_MESSAGES: '/api/model/sample-messages'
    }
  },
  TIMEOUT: 20000,
  RETRY_ATTEMPTS: 2
};

// Session storage keys
export const STORAGE_KEYS = {
  SESSION_ID: 'wertigo_session_id',
  USER_DATA: 'wertigo_user_data',
  AUTH_TOKEN: 'wertigo_auth_token'
};

// Default headers
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json'
};

export default API_CONFIG; 