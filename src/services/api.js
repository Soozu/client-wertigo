import axios from 'axios';
import { API_CONFIG, STORAGE_KEYS } from '../config/api';

// Create axios instances for both backends
const pythonClient = axios.create({
  baseURL: API_CONFIG.PYTHON_BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

const expressClient = axios.create({
  baseURL: API_CONFIG.EXPRESS_BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor for Python backend (session-based)
pythonClient.interceptors.request.use(
  (config) => {
    const sessionId = sessionStorage.getItem(STORAGE_KEYS.SESSION_ID);
    if (sessionId) {
      config.headers['X-Session-ID'] = sessionId;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Request interceptor for Express backend (JWT-based)
expressClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for Express backend
expressClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear auth data
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    }
    return Promise.reject(error);
  }
);

// Authentication API (Express Backend)
export const authAPI = {
  register: async (userData) => {
    try {
      // Generate a valid username from the name
      // Remove spaces, special characters, and convert to lowercase
      const baseUsername = userData.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '') // Remove all non-alphanumeric characters
        .substring(0, 20); // Limit length
      
      // Add a random suffix to make it more unique
      const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const username = `${baseUsername}${randomSuffix}`;

      const response = await expressClient.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, {
        username: username,
        email: userData.email,
        password: userData.password,
        firstName: userData.name.split(' ')[0] || userData.name,
        lastName: userData.name.split(' ').slice(1).join(' ') || ''
      });
      
      if (response.data.success) {
        // Store JWT token
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.data.token);
        
        return {
          success: true,
          user: response.data.user,
          token: response.data.token
        };
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      
      // Handle validation errors specifically
      if (error.response?.status === 400 && error.response?.data?.details) {
        const validationErrors = error.response.data.details.map(err => err.msg).join(', ');
        throw new Error(`Validation failed: ${validationErrors}`);
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Registration failed');
    }
  },

  login: async (email, password) => {
    try {
      const response = await expressClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
        email: email,
        password: password
      });
      
      if (response.data.success) {
        // Store JWT token
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.data.token);
        
        return {
          success: true,
          user: response.data.user,
          token: response.data.token
        };
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error(error.response?.data?.message || error.message || 'Login failed');
    }
  },

  logout: async () => {
    try {
      await expressClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear auth data regardless of API call result
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    }
    
    return { success: true };
  },

  validateSession: async () => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      
      if (!token) {
        throw new Error('No token found');
      }

      const response = await expressClient.get(API_CONFIG.ENDPOINTS.AUTH.VALIDATE);
      
      if (response.data.success) {
        return {
          success: true,
          user: response.data.user
        };
      } else {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
        throw new Error(response.data.message || 'Session invalid');
      }
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error('Session validation failed:', error);
      }
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      throw error;
    }
  },

  getProfile: async () => {
    try {
      const response = await expressClient.get(API_CONFIG.ENDPOINTS.AUTH.PROFILE);
      
      if (response.data.success) {
        return {
          success: true,
          user: response.data.user
        };
      } else {
        throw new Error(response.data.message || 'Failed to get profile');
      }
    } catch (error) {
      console.error('Failed to get profile:', error);
      throw error;
    }
  },

  updateProfile: async (updates) => {
    try {
      const response = await expressClient.put(API_CONFIG.ENDPOINTS.AUTH.PROFILE, updates);
      
      if (response.data.success) {
        return {
          success: true,
          user: response.data.user,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await expressClient.put('/api/auth/change-password', {
        currentPassword,
        newPassword
      });
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Failed to change password:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to change password');
    }
  },

  deleteAccount: async (password) => {
    try {
      const response = await expressClient.delete('/api/auth/account', {
        data: { password }
      });
      
      if (response.data.success) {
        // Clear auth data
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
        
        return {
          success: true,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Failed to delete account:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to delete account');
    }
  },

  // Admin functions
  admin: {
    getUsers: async (params = {}) => {
      try {
        const response = await expressClient.get('/api/auth/admin/users', { params });
        return response.data;
      } catch (error) {
        console.error('Failed to get users:', error);
        throw error;
      }
    },

    updateUserRole: async (userId, role) => {
      try {
        const response = await expressClient.put(`/api/auth/admin/users/${userId}/role`, { role });
        return response.data;
      } catch (error) {
        console.error('Failed to update user role:', error);
        throw error;
      }
    },

    getStats: async () => {
      try {
        const response = await expressClient.get('/api/auth/admin/stats');
        return response.data;
      } catch (error) {
        console.error('Failed to get admin stats:', error);
        throw error;
      }
    },

    // Analytics endpoints
    getAnalyticsOverview: async (startDate, endDate) => {
      try {
        const response = await expressClient.get('/api/admin/analytics/overview', { 
          params: { startDate, endDate } 
        });
        return response.data;
      } catch (error) {
        console.error('Failed to get analytics overview:', error);
        throw error;
      }
    },

    getUserAnalytics: async (startDate, endDate) => {
      try {
        const response = await expressClient.get('/api/admin/analytics/users', { 
          params: { startDate, endDate } 
        });
        return response.data;
      } catch (error) {
        console.error('Failed to get user analytics:', error);
        throw error;
      }
    },

    getTripAnalytics: async (startDate, endDate) => {
      try {
        const response = await expressClient.get('/api/admin/analytics/trips', { 
          params: { startDate, endDate } 
        });
        return response.data;
      } catch (error) {
        console.error('Failed to get trip analytics:', error);
        throw error;
      }
    },

    getPopularDestinations: async () => {
      try {
        const response = await expressClient.get('/api/admin/analytics/destinations');
        return response.data;
      } catch (error) {
        console.error('Failed to get popular destinations:', error);
        throw error;
      }
    },

    getTicketAnalytics: async (startDate, endDate) => {
      try {
        const response = await expressClient.get('/api/admin/analytics/tickets', { 
          params: { startDate, endDate } 
        });
        return response.data;
      } catch (error) {
        console.error('Failed to get ticket analytics:', error);
        throw error;
      }
    },

    getSystemMetrics: async () => {
      try {
        const response = await expressClient.get('/api/admin/system/metrics');
        return response.data;
      } catch (error) {
        console.error('Failed to get system metrics:', error);
        throw error;
      }
    }
  }
};

// Session Management API (Python Backend)
export const sessionAPI = {
  createSession: async () => {
    try {
      const response = await pythonClient.post('/api/create-session');
      const { session_id } = response.data;
      
      // Store session ID for Python backend
      sessionStorage.setItem(STORAGE_KEYS.SESSION_ID, session_id);
      
      return response.data;
    } catch (error) {
      console.error('Failed to create session:', error);
      throw error;
    }
  },

  validateSession: async (sessionId) => {
    try {
      const response = await pythonClient.get(`/api/validate-session/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to validate session:', error);
      throw error;
    }
  }
};

// Recommendations API (Python Backend)
export const recommendationsAPI = {
  getRecommendations: async ({ query, limit = 5, city = null, category = null, rating = null }) => {
    try {
      const response = await pythonClient.post(API_CONFIG.ENDPOINTS.PYTHON.RECOMMEND, {
        query,
        limit,
        city,
        category,
        rating
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      throw error;
    }
  },

  getCities: async () => {
    try {
      const response = await pythonClient.get(API_CONFIG.ENDPOINTS.PYTHON.CITIES);
      return response.data.cities;
    } catch (error) {
      console.error('Failed to get cities:', error);
      throw error;
    }
  },

  getCategories: async () => {
    try {
      const response = await pythonClient.get(API_CONFIG.ENDPOINTS.PYTHON.CATEGORIES);
      return response.data.categories;
    } catch (error) {
      console.error('Failed to get categories:', error);
      throw error;
    }
  }
};

// Geocoding API (Python Backend)
export const geocodingAPI = {
  geocodeLocation: async (locationQuery) => {
    try {
      const response = await pythonClient.get(API_CONFIG.ENDPOINTS.PYTHON.GEOCODE, {
        params: { q: locationQuery }
      });
      return response.data.results;
    } catch (error) {
      console.error('Failed to geocode location:', error);
      throw error;
    }
  }
};

// Route Calculation API (Python Backend)
export const routeAPI = {
  calculateRoute: async (routeData) => {
    try {
      const requestData = Array.isArray(routeData) 
        ? { points: routeData }
        : routeData;
      
      const response = await pythonClient.post(API_CONFIG.ENDPOINTS.PYTHON.ROUTE, requestData);
      return response.data;
    } catch (error) {
      console.error('Failed to calculate route:', error);
      throw error;
    }
  }
};

// Tickets API (Express Backend)
export const ticketsAPI = {
  generateTicket: async (ticketData) => {
    try {
      const response = await expressClient.post(API_CONFIG.ENDPOINTS.TICKETS.GENERATE, ticketData);
      return response.data;
    } catch (error) {
      console.error('Failed to generate ticket:', error);
      throw error;
    }
  },

  getMyTickets: async (params = {}) => {
    try {
      const response = await expressClient.get(API_CONFIG.ENDPOINTS.TICKETS.MY_TICKETS, { params });
      return response.data;
    } catch (error) {
      console.error('Failed to get tickets:', error);
      throw error;
    }
  },

  getTicketTypes: async () => {
    try {
      const response = await expressClient.get(API_CONFIG.ENDPOINTS.TICKETS.TYPES);
      return response.data;
    } catch (error) {
      console.error('Failed to get ticket types:', error);
      throw error;
    }
  }
};

// Reviews API (Express Backend)
export const reviewsAPI = {
  createReview: async (reviewData) => {
    try {
      // Determine if this is a trip review or platform review
      const isTripReview = reviewData.tripId && !reviewData.tripId.startsWith('review-');
      
      let endpoint, data;
      if (isTripReview) {
        endpoint = API_CONFIG.ENDPOINTS.REVIEWS.BASE;
        data = reviewData;
      } else {
        endpoint = API_CONFIG.ENDPOINTS.REVIEWS.PLATFORM;
        data = {
          reviewerName: reviewData.reviewerName,
          rating: reviewData.rating,
          reviewText: reviewData.reviewText,
          destination: reviewData.destination || null,
          email: reviewData.email || null
        };
      }

      const response = await expressClient.post(endpoint, data);
      return response.data;
    } catch (error) {
      console.error('Failed to create review:', error);
      throw error;
    }
  },

  createPlatformReview: async (reviewData) => {
    try {
      const response = await expressClient.post(API_CONFIG.ENDPOINTS.REVIEWS.PLATFORM, reviewData);
      return response.data;
    } catch (error) {
      console.error('Failed to create platform review:', error);
      throw error;
    }
  },

  getTripReviews: async (tripId, params = {}) => {
    try {
      const response = await expressClient.get(API_CONFIG.ENDPOINTS.REVIEWS.BY_TRIP(tripId), { params });
      return response.data;
    } catch (error) {
      console.error('Failed to get trip reviews:', error);
      throw error;
    }
  },

  getTripReviewStats: async (tripId) => {
    try {
      const response = await expressClient.get(API_CONFIG.ENDPOINTS.REVIEWS.STATS(tripId));
      return response.data;
    } catch (error) {
      console.error('Failed to get review stats:', error);
      throw error;
    }
  },

  getPlatformStats: async (limit = 5) => {
    try {
      const response = await expressClient.get(API_CONFIG.ENDPOINTS.REVIEWS.PLATFORM_STATS, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get platform review stats:', error);
      throw error;
    }
  },

  getRecentReviews: async (limit = 10) => {
    try {
      const response = await expressClient.get(API_CONFIG.ENDPOINTS.REVIEWS.RECENT, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get recent reviews:', error);
      throw error;
    }
  }
};

// Trackers API (Express Backend)
export const trackersAPI = {
  createTracker: async (trackerData) => {
    try {
      const response = await expressClient.post(API_CONFIG.ENDPOINTS.TRACKERS.BASE, trackerData);
      return response.data;
    } catch (error) {
      console.error('Failed to create tracker:', error);
      throw error;
    }
  },

  getTrackerById: async (trackerId, email = null) => {
    try {
      const params = email ? { email } : {};
      const response = await expressClient.get(API_CONFIG.ENDPOINTS.TRACKERS.BY_ID(trackerId), { params });
      return response.data;
    } catch (error) {
      console.error('Failed to get tracker:', error);
      throw error;
    }
  },

  getTrackersByEmail: async (email) => {
    try {
      const response = await expressClient.get(API_CONFIG.ENDPOINTS.TRACKERS.BY_EMAIL(email));
      return response.data;
    } catch (error) {
      console.error('Failed to get trackers by email:', error);
      throw error;
    }
  }
};

// Trip Management API (Express Backend)
export const tripAPI = {
  createTrip: async (tripData) => {
    try {
      const response = await expressClient.post(API_CONFIG.ENDPOINTS.TRIPS.BASE, tripData);
      return response.data;
    } catch (error) {
      console.error('Failed to create trip:', error);
      throw error;
    }
  },

  getTrip: async (tripId) => {
    try {
      const response = await expressClient.get(API_CONFIG.ENDPOINTS.TRIPS.BY_ID(tripId));
      return response.data;
    } catch (error) {
      console.error('Failed to get trip:', error);
      throw error;
    }
  },

  updateTrip: async (tripId, updateData) => {
    try {
      const response = await expressClient.put(API_CONFIG.ENDPOINTS.TRIPS.BY_ID(tripId), updateData);
      return response.data;
    } catch (error) {
      console.error('Failed to update trip:', error);
      throw error;
    }
  },

  deleteTrip: async (tripId) => {
    try {
      const response = await expressClient.delete(API_CONFIG.ENDPOINTS.TRIPS.BY_ID(tripId));
      return response.data;
    } catch (error) {
      console.error('Failed to delete trip:', error);
      throw error;
    }
  },

  addDestinationToTrip: async (tripId, destinationData) => {
    try {
      const response = await expressClient.post(API_CONFIG.ENDPOINTS.TRIPS.DESTINATIONS(tripId), destinationData);
      return response.data;
    } catch (error) {
      console.error('Failed to add destination to trip:', error);
      throw error;
    }
  },

  removeDestinationFromTrip: async (tripId, destinationId) => {
    try {
      const response = await expressClient.delete(API_CONFIG.ENDPOINTS.TRIPS.DESTINATION_BY_ID(tripId, destinationId));
      return response.data;
    } catch (error) {
      console.error('Failed to remove destination from trip:', error);
      throw error;
    }
  },

  saveRouteToTrip: async (tripId, routeData) => {
    try {
      const response = await expressClient.post(API_CONFIG.ENDPOINTS.TRIPS.ROUTE(tripId), routeData);
      return response.data;
    } catch (error) {
      console.error('Failed to save route to trip:', error);
      throw error;
    }
  },

  getUserTrips: async (params = {}) => {
    try {
      const response = await expressClient.get(API_CONFIG.ENDPOINTS.TRIPS.BASE, { params });
      return response.data;
    } catch (error) {
      console.error('Failed to get user trips:', error);
      throw error;
    }
  }
};

// Health Check APIs
export const healthAPI = {
  checkPythonHealth: async () => {
    try {
      const response = await pythonClient.get(API_CONFIG.ENDPOINTS.PYTHON.HEALTH);
      return response.data;
    } catch (error) {
      console.error('Python health check failed:', error);
      throw error;
    }
  },

  checkExpressHealth: async () => {
    try {
      const response = await expressClient.get('/health');
      return response.data;
    } catch (error) {
      console.error('Express health check failed:', error);
      throw error;
    }
  },

  checkHealth: async () => {
    try {
      const [pythonHealth, expressHealth] = await Promise.allSettled([
        healthAPI.checkPythonHealth(),
        healthAPI.checkExpressHealth()
      ]);

      return {
        python: pythonHealth.status === 'fulfilled' ? pythonHealth.value : null,
        express: expressHealth.status === 'fulfilled' ? expressHealth.value : null,
        pythonConnected: pythonHealth.status === 'fulfilled',
        expressConnected: expressHealth.status === 'fulfilled'
      };
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  },

  getSystemMetrics: async () => {
    try {
      const response = await expressClient.get('/metrics')
      return {
        success: true,
        metrics: response.data
      }
    } catch (error) {
      console.error('Failed to get system metrics:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }
};

// Utility function to initialize session for Python backend
export const initializePythonSession = async () => {
  try {
    const existingSessionId = sessionStorage.getItem(STORAGE_KEYS.SESSION_ID);
    
    if (existingSessionId) {
      try {
        await sessionAPI.validateSession(existingSessionId);
        return existingSessionId;
      } catch (error) {
        console.log('Existing Python session invalid, creating new session');
      }
    }
    
    const sessionData = await sessionAPI.createSession();
    return sessionData.session_id;
  } catch (error) {
    console.error('Failed to initialize Python session:', error);
    throw error;
  }
};

// Export the configured axios instances for custom requests
export { pythonClient, expressClient };
export default expressClient;

// Enhanced recommendation service with tracking
export const getRecommendationsWithTracking = async (query, options = {}) => {
  try {
    const { trackRecommendationUsage } = await import('./ticketApi.js');
    
    // Make request to Python backend
    const response = await pythonClient.post('/recommend', {
      query,
      limit: options.limit || 5,
      city: options.city,
      category: options.category,
      rating: options.rating
    });

    const data = response.data;

    // Track the recommendation usage
    if (data.recommendations && data.recommendations.length > 0) {
      try {
        await trackRecommendationUsage(
          query, 
          data.recommendations, 
          data.detected_city, 
          data.detected_category
        );
      } catch (trackingError) {
        console.warn('Failed to track recommendation usage:', trackingError);
      }
    }

    return {
      success: true,
      ...data
    };
  } catch (error) {
    console.error('Error getting recommendations with tracking:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      is_conversation: true,
      message: 'Failed to get recommendations. Please try again.'
    };
  }
};

// Enhanced geocoding service with tracking
export const geocodeWithTracking = async (query, trackerId = null) => {
  try {
    const { trackGeocodingUsage, trackPythonInteraction } = await import('./ticketApi.js');
    
    const requestData = { query };
    
    // Track Python backend interaction if trackerId is provided
    if (trackerId) {
      try {
        await trackPythonInteraction(trackerId, 'geocoding', requestData);
      } catch (trackingError) {
        console.warn('Failed to track Python interaction:', trackingError);
      }
    }

    // Make request to Python backend
    const response = await pythonClient.get('/geocode', {
      params: { q: query }
    });

    const data = response.data;

    // Track geocoding usage
    try {
      await trackGeocodingUsage(query, data.results || [], trackerId);
    } catch (trackingError) {
      console.warn('Failed to track geocoding usage:', trackingError);
    }

    // Track Python backend response if trackerId is provided
    if (trackerId && data.results) {
      try {
        await trackPythonInteraction(trackerId, 'geocoding', requestData, {
          resultsCount: data.results.length,
          success: true
        });
      } catch (trackingError) {
        console.warn('Failed to track Python response:', trackingError);
      }
    }

    return {
      success: true,
      results: data.results || []
    };
  } catch (error) {
    console.error('Error geocoding with tracking:', error);
    
    // Track failed interaction
    if (trackerId) {
      try {
        const { trackPythonInteraction } = await import('./ticketApi.js');
        await trackPythonInteraction(trackerId, 'geocoding', { query }, {
          error: error.message,
          success: false
        });
      } catch (trackingError) {
        console.warn('Failed to track failed interaction:', trackingError);
      }
    }

    return {
      success: false,
      error: error.response?.data?.message || error.message,
      results: []
    };
  }
};

// Enhanced route calculation with tracking
export const calculateRouteWithTracking = async (points, trackerId = null) => {
  try {
    // Make request to Python backend
    const response = await pythonClient.post('/api/route', { points });
    const data = response.data;

    return {
      success: true,
      ...data
    };
  } catch (error) {
    console.error('Error calculating route:', error);
    
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
};

// Enhanced model chat with tracking
export const getModelChatWithTracking = async (query, options = {}, trackerId = null) => {
  try {
    const { trackAIInteraction, trackPythonInteraction } = await import('./ticketApi.js');
    
    const requestData = {
      query,
      city: options.city,
      category: options.category,
      budget: options.budget,
      budget_amount: options.budget_amount,
      limit: options.limit || 5
    };
    
    // Track Python backend interaction if trackerId is provided
    if (trackerId) {
      try {
        await trackPythonInteraction(trackerId, 'model_chat', requestData);
      } catch (trackingError) {
        console.warn('Failed to track Python interaction:', trackingError);
      }
    }

    // Make request to Python backend
    const response = await pythonClient.post('/api/model/chat', requestData);
    const data = response.data;

    // Track AI interaction
    if (data.success && data.recommendations) {
      try {
        const trackingData = {
          query,
          recommendationsCount: data.recommendations.length,
          detectedCity: data.detected_city,
          detectedCategory: data.detected_category,
          detectedBudget: data.detected_budget,
          modelUsed: 'neural_model',
          recommendations: data.recommendations.slice(0, 3).map(rec => ({
            id: rec.id,
            name: rec.name,
            city: rec.city,
            category: rec.category,
            score: rec.score
          }))
        };
        
        await trackAIInteraction('recommendation_request', trackingData, query);
      } catch (trackingError) {
        console.warn('Failed to track AI interaction:', trackingError);
      }
    }

    // Track Python backend response if trackerId is provided
    if (trackerId) {
      try {
        await trackPythonInteraction(trackerId, 'model_chat', requestData, {
          success: data.success,
          recommendationsCount: data.recommendations?.length || 0,
          detectedCity: data.detected_city,
          detectedCategory: data.detected_category
        });
      } catch (trackingError) {
        console.warn('Failed to track Python response:', trackingError);
      }
    }

    return data;
  } catch (error) {
    console.error('Error getting model chat with tracking:', error);
    
    // Track failed interaction
    if (trackerId) {
      try {
        const { trackPythonInteraction } = await import('./ticketApi.js');
        await trackPythonInteraction(trackerId, 'model_chat', { query }, {
          error: error.message,
          success: false
        });
      } catch (trackingError) {
        console.warn('Failed to track failed interaction:', trackingError);
      }
    }

    return {
      success: false,
      message: error.response?.data?.message || error.message,
      recommendations: []
    };
  }
};

// Enhanced trip creation with AI recommendation tracking
export const createTripWithTracking = async (tripData, aiRecommendationData = null) => {
  try {
    // Create the trip first
    const trip = await tripAPI.createTrip(tripData);
    
    if (trip.success && aiRecommendationData) {
      // Track AI recommendation usage for trip creation
      try {
        const { trackAIInteraction } = await import('./ticketApi.js');
        
        const trackingData = {
          tripId: trip.trip.id,
          tripName: trip.trip.tripName,
          destination: trip.trip.destination,
          aiRecommendationData,
          creationTimestamp: new Date().toISOString()
        };
        
        await trackAIInteraction('destination_selected', trackingData);
      } catch (trackingError) {
        console.warn('Failed to track AI recommendation for trip creation:', trackingError);
      }
    }
    
    return trip;
  } catch (error) {
    console.error('Error creating trip with tracking:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Enhanced tracker creation with AI data
export const createTrackerWithAIData = async (tripId, email, travelerName = '', phone = '', saveDate = '', aiRecommendationData = null) => {
  try {
    const response = await expressClient.post(API_CONFIG.ENDPOINTS.TRACKERS.BASE, {
      tripId,
      email,
      travelerName,
      phone,
      saveDate,
      aiRecommendationData
    });

    if (response.data.success) {
      return {
        success: true,
        tracker: response.data.tracker,
        message: response.data.message
      };
    } else {
      throw new Error(response.data.message || 'Failed to create tracker');
    }
  } catch (error) {
    console.error('Error creating tracker with AI data:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
};

// Update the main API exports
export const api = {
  // Authentication
  auth: authAPI,
  
  // Trip management
  trips: tripAPI,
  createTripWithTracking,
  
  // Trackers
  trackers: trackersAPI,
  createTrackerWithAIData,
  
  // Python backend services with tracking
  getRecommendations: getRecommendationsWithTracking,
  geocode: geocodeWithTracking,
  calculateRoute: calculateRouteWithTracking,
  getModelChat: getModelChatWithTracking,
  
  // Original Python backend services (without tracking)
  pythonBackend: {
    getRecommendations: (query, options) => pythonClient.post('/api/recommend', { query, ...options }),
    geocode: (query) => pythonClient.get('/api/geocode', { params: { q: query } }),
    calculateRoute: (points) => pythonClient.post('/api/route', { points }),
    getModelChat: (query, options) => pythonClient.post('/api/model/chat', { query, ...options }),
    getHealth: () => pythonClient.get('/api/health'),
    getCities: () => pythonClient.get('/api/cities'),
    getCategories: () => pythonClient.get('/api/categories')
  },
  
  // Express backend services
  expressBackend: {
    getHealth: () => expressClient.get('/health'),
    auth: authAPI,
    trips: tripAPI,
    trackers: trackersAPI
  }
}; 