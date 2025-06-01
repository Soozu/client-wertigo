import axios from 'axios';

// API Configuration
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  TIMEOUT: 20000,
  RETRY_ATTEMPTS: 2
};

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  withCredentials: true, // Important for session management
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor for adding common headers
apiClient.interceptors.request.use(
  (config) => {
    // Add session ID if available
    const sessionId = sessionStorage.getItem('wertigo_session_id');
    if (sessionId) {
      config.headers['X-Session-ID'] = sessionId;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Session expired, clear session data
      sessionStorage.removeItem('wertigo_session_id');
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  register: async (userData) => {
    try {
      const response = await apiClient.post('/api/auth/register', {
        username: userData.name,
        email: userData.email,
        password: userData.password,
        first_name: userData.name.split(' ')[0] || userData.name,
        last_name: userData.name.split(' ').slice(1).join(' ') || ''
      });
      
      if (response.data.success) {
        return {
          success: true,
          user: {
            id: response.data.user_id,
            email: userData.email,
            name: userData.name,
            username: userData.name
          }
        };
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      throw new Error(error.response?.data?.message || error.message || 'Registration failed');
    }
  },

  login: async (email, password) => {
    try {
      const response = await apiClient.post('/api/auth/login', {
        username: email,
        password: password
      });
      
      if (response.data.success) {
        // Store session ID
        sessionStorage.setItem('wertigo_session_id', response.data.session_id);
        
        return {
          success: true,
          user: response.data.user,
          sessionId: response.data.session_id
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
      const sessionId = sessionStorage.getItem('wertigo_session_id');
      
      if (sessionId) {
        await apiClient.post('/api/auth/logout', {
          session_id: sessionId
        });
      }
      
      // Clear session data
      sessionStorage.removeItem('wertigo_session_id');
      
      return { success: true };
    } catch (error) {
      console.error('Logout failed:', error);
      // Clear session data even if API call fails
      sessionStorage.removeItem('wertigo_session_id');
      return { success: true };
    }
  },

  validateSession: async () => {
    try {
      const sessionId = sessionStorage.getItem('wertigo_session_id');
      
      if (!sessionId) {
        throw new Error('No session found');
      }

      const response = await apiClient.get('/api/auth/validate');
      
      if (response.data.success) {
        return {
          success: true,
          user: response.data.user
        };
      } else {
        sessionStorage.removeItem('wertigo_session_id');
        throw new Error(response.data.message || 'Session invalid');
      }
    } catch (error) {
      // Don't log 401 errors as they're expected when there's no valid session
      if (error.response?.status !== 401) {
        console.error('Session validation failed:', error);
      }
      sessionStorage.removeItem('wertigo_session_id');
      throw error;
    }
  },

  getProfile: async () => {
    try {
      const response = await apiClient.get('/api/auth/profile');
      
      if (response.data.success) {
        return {
          success: true,
          profile: response.data.profile
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
      const response = await apiClient.put('/api/auth/profile', updates);
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  }
};

// Session Management API
export const sessionAPI = {
  createSession: async () => {
    try {
      const response = await apiClient.post('/api/create-session');
      const { session_id } = response.data;
      
      // Store session ID
      sessionStorage.setItem('wertigo_session_id', session_id);
      
      return response.data;
    } catch (error) {
      console.error('Failed to create session:', error);
      throw error;
    }
  },

  validateSession: async (sessionId) => {
    try {
      const response = await apiClient.get(`/api/validate-session/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to validate session:', error);
      throw error;
    }
  }
};

// Recommendations API
export const recommendationsAPI = {
  getRecommendations: async ({ query, limit = 5, city = null, category = null, rating = null }) => {
    try {
      const response = await apiClient.post('/api/recommend', {
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
      const response = await apiClient.get('/api/cities');
      return response.data.cities;
    } catch (error) {
      console.error('Failed to get cities:', error);
      throw error;
    }
  },

  getCategories: async () => {
    try {
      const response = await apiClient.get('/api/categories');
      return response.data.categories;
    } catch (error) {
      console.error('Failed to get categories:', error);
      throw error;
    }
  }
};

// Geocoding API
export const geocodingAPI = {
  geocodeLocation: async (locationQuery) => {
    try {
      const response = await apiClient.get('/api/geocode', {
        params: { q: locationQuery }
      });
      return response.data.results;
    } catch (error) {
      console.error('Failed to geocode location:', error);
      throw error;
    }
  }
};

// Trip Management API
export const tripAPI = {
  createTrip: async (tripData) => {
    try {
      const response = await apiClient.post('/api/trips', tripData);
      return response.data;
    } catch (error) {
      console.error('Failed to create trip:', error);
      throw error;
    }
  },

  getTrip: async (tripId) => {
    try {
      const response = await apiClient.get(`/api/trips/${tripId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get trip:', error);
      throw error;
    }
  },

  updateTrip: async (tripId, updateData) => {
    try {
      const response = await apiClient.put(`/api/trips/${tripId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Failed to update trip:', error);
      throw error;
    }
  },

  addDestinationToTrip: async (tripId, destinationData) => {
    try {
      const response = await apiClient.post(`/api/trips/${tripId}/destinations`, destinationData);
      return response.data;
    } catch (error) {
      console.error('Failed to add destination to trip:', error);
      throw error;
    }
  },

  removeDestinationFromTrip: async (tripId, destinationId) => {
    try {
      const response = await apiClient.delete(`/api/trips/${tripId}/destinations/${destinationId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to remove destination from trip:', error);
      throw error;
    }
  },

  saveRouteToTrip: async (tripId, routeData) => {
    try {
      const response = await apiClient.post(`/api/trips/${tripId}/route`, routeData);
      return response.data;
    } catch (error) {
      console.error('Failed to save route to trip:', error);
      throw error;
    }
  },

  getUserTrips: async () => {
    try {
      const response = await apiClient.get('/api/my-trips');
      return response.data;
    } catch (error) {
      console.error('Failed to get user trips:', error);
      throw error;
    }
  }
};

// Route Calculation API
export const routeAPI = {
  calculateRoute: async (routeData) => {
    try {
      // routeData can be either points array (legacy) or object with points and trip_id
      const requestData = Array.isArray(routeData) 
        ? { points: routeData }
        : routeData;
      
      const response = await apiClient.post('/api/route', requestData);
      return response.data;
    } catch (error) {
      console.error('Failed to calculate route:', error);
      throw error;
    }
  }
};

// Health Check API
export const healthAPI = {
  checkHealth: async () => {
    try {
      const response = await apiClient.get('/api/health');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }
};

// Utility function to initialize session
export const initializeSession = async () => {
  try {
    const existingSessionId = sessionStorage.getItem('wertigo_session_id');
    
    if (existingSessionId) {
      // Try to validate existing session
      try {
        await sessionAPI.validateSession(existingSessionId);
        return existingSessionId;
      } catch (error) {
        // Session invalid, create new one
        console.log('Existing session invalid, creating new session');
      }
    }
    
    // Create new session
    const sessionData = await sessionAPI.createSession();
    return sessionData.session_id;
  } catch (error) {
    console.error('Failed to initialize session:', error);
    throw error;
  }
};

// Export the configured axios instance for custom requests
export default apiClient; 