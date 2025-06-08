// API Configuration for WerTigo Trip Planner
const API_CONFIG = {
  BASE_URL: import.meta?.env?.VITE_PYTHON_API_URL || 'https://server-python-x2au.onrender.com'
  ENDPOINTS: {
    HEALTH: '/api/health',
    CREATE_SESSION: '/api/create-session',
    VALIDATE_SESSION: '/api/validate-session',
    RECOMMEND: '/api/recommend',
    CITIES: '/api/cities',
    CATEGORIES: '/api/categories',
    GEOCODE: '/api/geocode',
    TRIPS: '/api/trips',
    ROUTE: '/api/route'
  },
  TIMEOUT: 20000,
  RETRY_ATTEMPTS: 2
};

// Helper function to get full API URL
function getApiUrl(endpoint) {
  return API_CONFIG.BASE_URL + endpoint;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { API_CONFIG, getApiUrl };
}

// Make available globally
window.API_CONFIG = API_CONFIG;
window.getApiUrl = getApiUrl; 
