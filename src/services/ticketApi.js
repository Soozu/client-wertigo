import axios from 'axios'
import { API_CONFIG, STORAGE_KEYS } from '../config/api'

const API_BASE_URL = API_CONFIG.EXPRESS_BASE_URL

// Create axios instance with default config
const ticketApi = axios.create({
  baseURL: `${API_BASE_URL}/api/tickets`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add JWT token
ticketApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
ticketApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Ticket API Error:', error.response?.data || error.message)
    if (error.response?.status === 401) {
      // Token expired or invalid, clear auth data
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    }
    return Promise.reject(error)
  }
)

// Generate a new ticket ID
export const generateTicketId = async (ticketType, includeTimestamp = true, metadata = {}) => {
  try {
    const response = await ticketApi.post('/generate', {
      ticketType: ticketType,
      includeTimestamp: includeTimestamp,
      metadata
    })
    
    if (response.data.success) {
      return {
        success: true,
        ticketId: response.data.ticket.ticketId,
        type: response.data.ticket.ticketType,
        includeTimestamp: response.data.ticket.includeTimestamp,
        createdAt: response.data.ticket.createdAt
      }
    } else {
      throw new Error(response.data.message || 'Failed to generate ticket')
    }
  } catch (error) {
    console.error('Error generating ticket:', error)
    return {
      success: false,
      error: error.response?.data?.message || error.message
    }
  }
}

// Get ticket generation history
export const getTicketHistory = async (limit = 50, page = 1) => {
  try {
    const response = await ticketApi.get('/my-tickets', {
      params: { limit, page }
    })
    
    if (response.data.success) {
      return {
        success: true,
        tickets: response.data.tickets,
        pagination: response.data.pagination
      }
    } else {
      throw new Error(response.data.message || 'Failed to get ticket history')
    }
  } catch (error) {
    console.error('Error getting ticket history:', error)
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      tickets: []
    }
  }
}

// Mark a ticket as used
export const markTicketAsUsed = async (ticketId) => {
  try {
    const response = await ticketApi.put(`/${ticketId}/use`)
    
    if (response.data.success) {
      return {
        success: true,
        message: response.data.message,
        ticket: response.data.ticket
      }
    } else {
      throw new Error(response.data.message || 'Failed to mark ticket as used')
    }
  } catch (error) {
    console.error('Error marking ticket as used:', error)
    return {
      success: false,
      error: error.response?.data?.message || error.message
    }
  }
}

// Get ticket statistics
export const getTicketStats = async () => {
  try {
    const response = await ticketApi.get('/stats')
    
    if (response.data.success) {
      return {
        success: true,
        stats: response.data.stats
      }
    } else {
      throw new Error(response.data.message || 'Failed to get ticket stats')
    }
  } catch (error) {
    console.error('Error getting ticket stats:', error)
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      stats: {
        total: 0,
        used: 0,
        unused: 0,
        byType: {}
      }
    }
  }
}

// Get available ticket types
export const getTicketTypes = async () => {
  try {
    const response = await ticketApi.get('/types/list')
    
    if (response.data.success) {
      return {
        success: true,
        types: response.data.ticketTypes
      }
    } else {
      throw new Error(response.data.message || 'Failed to get ticket types')
    }
  } catch (error) {
    console.error('Error getting ticket types:', error)
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      types: ['FLIGHT', 'BUS', 'FERRY', 'TRAIN', 'HOTEL', 'TOUR', 'BOOKING_REF', 'CONFIRMATION']
    }
  }
}

// Validate a ticket ID
export const validateTicketId = async (ticketId) => {
  try {
    const response = await ticketApi.get(`/${ticketId}/validate`)
    
    if (response.data.success) {
      return {
        success: true,
        valid: response.data.valid,
        ticket: response.data.ticket
      }
    } else {
      throw new Error(response.data.message || 'Failed to validate ticket')
    }
  } catch (error) {
    console.error('Error validating ticket:', error)
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      valid: false
    }
  }
}

// Search for a ticket (for TicketTracker functionality)
export const searchTicket = async (ticketId, email) => {
  try {
    const response = await ticketApi.post('/search', {
      ticketId,
      email
    })
    
    if (response.data.success) {
      return {
        success: true,
        type: response.data.type,
        ticket: response.data.ticket,
        trip: response.data.trip,
        tickets: response.data.tickets,
        trip_trackers: response.data.trip_trackers,
        tracker: response.data.tracker
      }
    } else {
      throw new Error(response.data.error || 'Ticket not found')
    }
  } catch (error) {
    console.error('Error searching ticket:', error)
    return {
      success: false,
      error: error.response?.data?.error || error.response?.data?.message || error.message
    }
  }
}

// Get available ticket formats
export const getTicketFormats = async () => {
  try {
    const response = await ticketApi.get('/types/list')
    
    if (response.data.success) {
      const formats = {};
      response.data.ticketTypes.forEach(type => {
        formats[type.type] = type.prefix;
      });
      
      return {
        success: true,
        formats: formats
      }
    } else {
      throw new Error(response.data.error || 'Failed to get ticket formats')
    }
  } catch (error) {
    console.error('Error getting ticket formats:', error)
    return {
      success: false,
      error: error.response?.data?.error || error.message,
      formats: {
        FLIGHT: 'FL',
        BUS: 'BUS',
        FERRY: 'FRY',
        TRAIN: 'TRN',
        HOTEL: 'HTL',
        TOUR: 'TUR',
        BOOKING_REF: 'BKG',
        CONFIRMATION: 'CNF'
      }
    }
  }
}

// Trip Tracker API Functions

// Save a trip with tracker ID
export const saveTripTracker = async (tripId, email, travelerName = '', phone = '') => {
  try {
    const { trackersAPI } = await import('./api.js');
    
    const response = await trackersAPI.createTracker({
      tripId: tripId,
      email: email,
      travelerName: travelerName,
      phone: phone
    });
    
    if (response.success) {
      return {
        success: true,
        trackerId: response.tracker.trackerId,
        message: response.message,
        email: response.tracker.email,
        createdAt: response.tracker.createdAt
      }
    } else {
      throw new Error(response.message || 'Failed to save trip tracker')
    }
  } catch (error) {
    console.error('Error saving trip tracker:', error)
    return {
      success: false,
      error: error.response?.data?.message || error.message
    }
  }
}

// Track a trip using tracker ID
export const trackTrip = async (trackerId, email = '') => {
  try {
    const { trackersAPI } = await import('./api.js');
    
    const response = await trackersAPI.getTrackerById(trackerId, email);
    
    if (response.success) {
      return {
        success: true,
        trip: response.trip,
        trackerId: response.tracker.trackerId
      }
    } else {
      throw new Error(response.message || 'Trip not found')
    }
  } catch (error) {
    console.error('Error tracking trip:', error)
    return {
      success: false,
      error: error.response?.data?.message || error.message
    }
  }
}

// Get all trip trackers for an email
export const getMyTripTrackers = async (email) => {
  try {
    const { trackersAPI } = await import('./api.js');
    
    const response = await trackersAPI.getTrackersByEmail(email);
    
    if (response.success) {
      return {
        success: true,
        trackers: response.trackers,
        count: response.trackers.length
      }
    } else {
      throw new Error(response.message || 'Failed to get trip trackers')
    }
  } catch (error) {
    console.error('Error getting trip trackers:', error)
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      trackers: []
    }
  }
}

// Database-backed ticket ID tracker class
export class DatabaseTicketIdTracker {
  constructor() {
    this.cache = {
      tickets: [],
      stats: null,
      lastFetch: null
    }
  }

  // Generate unique ticket ID using database
  async generateUniqueId(type = 'FLIGHT', includeTimestamp = true, metadata = {}) {
    const result = await generateTicketId(type, includeTimestamp, metadata)
    
    if (result.success) {
      // Clear cache to force refresh
      this.cache.lastFetch = null
      return result.ticketId
    } else {
      throw new Error(result.error)
    }
  }

  // Add ticket to tracker (handled by database)
  async addToTracker(ticketId, type = 'UNKNOWN', metadata = {}) {
    // This is handled automatically by the database when generating
    console.log(`Ticket ${ticketId} of type ${type} added to database`)
  }

  // Mark ticket as used
  async markAsUsed(ticketId) {
    const result = await markTicketAsUsed(ticketId)
    
    if (result.success) {
      // Clear cache to force refresh
      this.cache.lastFetch = null
      return true
    } else {
      throw new Error(result.error)
    }
  }

  // Check if ticket exists
  async hasId(ticketId) {
    const result = await validateTicketId(ticketId)
    return result.success && result.valid
  }

  // Get ticket history
  async getHistory() {
    const result = await getTicketHistory()
    
    if (result.success) {
      // Transform to match frontend format
      return result.tickets.map(ticket => ({
        id: ticket.ticketId,
        type: ticket.ticketType,
        generated: ticket.createdAt,
        used: ticket.isUsed,
        usedAt: ticket.usedAt
      }))
    } else {
      console.error('Error getting history:', result.error)
      return []
    }
  }

  // Get unused tickets
  async getUnusedIds() {
    const history = await this.getHistory()
    return history.filter(item => !item.used)
  }

  // Get statistics
  async getStats() {
    const result = await getTicketStats()
    
    if (result.success) {
      return {
        totalGenerated: result.stats.total,
        totalUsed: result.stats.used,
        totalUnused: result.stats.unused,
        typeStats: result.stats.byType
      }
    } else {
      console.error('Error getting stats:', result.error)
      return {
        totalGenerated: 0,
        totalUsed: 0,
        totalUnused: 0,
        typeStats: {}
      }
    }
  }

  // Save/load methods (no-op for database version)
  saveToStorage() {
    // Database handles persistence
  }

  loadFromStorage() {
    // Database handles persistence
  }
}

// Create singleton instance
export const databaseTicketIdTracker = new DatabaseTicketIdTracker()

// Track AI recommendation interactions
export const trackAIInteraction = async (interactionType, data, query = '') => {
  try {
    const response = await ticketApi.post('/track-ai-interaction', {
      interactionType,
      data,
      query
    })
    
    if (response.data.success) {
      return {
        success: true,
        trackingId: response.data.trackingId,
        message: response.data.message
      }
    } else {
      throw new Error(response.data.message || 'Failed to track AI interaction')
    }
  } catch (error) {
    console.error('Error tracking AI interaction:', error)
    return {
      success: false,
      error: error.response?.data?.message || error.message
    }
  }
}

// Get AI interaction analytics
export const getAIAnalytics = async (startDate, endDate, interactionType) => {
  try {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (interactionType) params.interactionType = interactionType;

    const response = await ticketApi.get('/ai-analytics', { params })
    
    if (response.data.success) {
      return {
        success: true,
        analytics: response.data.analytics
      }
    } else {
      throw new Error(response.data.message || 'Failed to get AI analytics')
    }
  } catch (error) {
    console.error('Error getting AI analytics:', error)
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      analytics: {
        totalInteractions: 0,
        interactionTypes: {},
        popularQueries: {},
        timeDistribution: {},
        recentInteractions: []
      }
    }
  }
}

// Enhanced search with AI recommendation tracking
export const searchTicketWithTracking = async (ticketId, email, query = '', recommendationData = null) => {
  try {
    const response = await ticketApi.post('/search', {
      ticketId,
      email,
      query,
      recommendationData
    })
    
    if (response.data.success) {
      return {
        success: true,
        type: response.data.type,
        ticket: response.data.ticket,
        trip: response.data.trip,
        tickets: response.data.tickets,
        trip_trackers: response.data.trip_trackers,
        tracker: response.data.tracker
      }
    } else {
      throw new Error(response.data.error || 'Ticket not found')
    }
  } catch (error) {
    console.error('Error searching ticket with tracking:', error)
    return {
      success: false,
      error: error.response?.data?.error || error.response?.data?.message || error.message
    }
  }
}

// Track Python backend interactions for a tracker
export const trackPythonInteraction = async (trackerId, serviceType, requestData, responseData = null) => {
  try {
    const { trackersAPI } = await import('./api.js');
    
    // Use the main API to make the request to the trackers endpoint
    const response = await fetch(`${API_BASE_URL}/api/trackers/${trackerId}/track-python-interaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
      },
      credentials: 'include',
      body: JSON.stringify({
        serviceType,
        requestData,
        responseData
      })
    });

    const data = await response.json();
    
    if (data.success) {
      return {
        success: true,
        trackingId: data.trackingId,
        message: data.message
      }
    } else {
      throw new Error(data.message || 'Failed to track Python interaction')
    }
  } catch (error) {
    console.error('Error tracking Python interaction:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Get tracker analytics including Python backend usage
export const getTrackerAnalytics = async (trackerId, email = '') => {
  try {
    const params = email ? { email } : {};
    const response = await fetch(`${API_BASE_URL}/api/trackers/${trackerId}/analytics?${new URLSearchParams(params)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
      },
      credentials: 'include'
    });

    const data = await response.json();
    
    if (data.success) {
      return {
        success: true,
        analytics: data.analytics
      }
    } else {
      throw new Error(data.message || 'Failed to get tracker analytics')
    }
  } catch (error) {
    console.error('Error getting tracker analytics:', error)
    return {
      success: false,
      error: error.message,
      analytics: {
        tracker: {},
        interactions: {
          total: 0,
          byType: {},
          pythonBackendUsage: {},
          recentActivity: []
        }
      }
    }
  }
}

// Helper function to track recommendation usage
export const trackRecommendationUsage = async (query, recommendations, detectedCity = null, detectedCategory = null) => {
  try {
    const trackingData = {
      query,
      recommendationsCount: recommendations.length,
      detectedCity,
      detectedCategory,
      recommendations: recommendations.slice(0, 5).map(rec => ({
        id: rec.id,
        name: rec.name,
        city: rec.city,
        category: rec.category,
        rating: rec.rating,
        similarity_score: rec.similarity_score
      }))
    };

    return await trackAIInteraction('recommendation_request', trackingData, query);
  } catch (error) {
    console.error('Error tracking recommendation usage:', error);
    return { success: false, error: error.message };
  }
}

// Helper function to track destination selection
export const trackDestinationSelection = async (destination, query = '', trackerId = null) => {
  try {
    const trackingData = {
      destination: {
        id: destination.id,
        name: destination.name,
        city: destination.city,
        category: destination.category,
        rating: destination.rating
      },
      query,
      trackerId,
      selectionTimestamp: new Date().toISOString()
    };

    return await trackAIInteraction('destination_selected', trackingData, query);
  } catch (error) {
    console.error('Error tracking destination selection:', error);
    return { success: false, error: error.message };
  }
}

// Helper function to track route calculation
export const trackRouteCalculation = async (routeData, destinations = [], trackerId = null) => {
  try {
    const trackingData = {
      routeData: {
        distance_km: routeData.distance_km,
        time_min: routeData.time_min,
        source: routeData.source,
        pointsCount: routeData.points?.length || 0
      },
      destinationsCount: destinations.length,
      trackerId,
      calculationTimestamp: new Date().toISOString()
    };

    return await trackAIInteraction('route_calculated', trackingData);
  } catch (error) {
    console.error('Error tracking route calculation:', error);
    return { success: false, error: error.message };
  }
}

// Helper function to track geocoding usage
export const trackGeocodingUsage = async (query, results = [], trackerId = null) => {
  try {
    const trackingData = {
      query,
      resultsCount: results.length,
      results: results.slice(0, 3).map(result => ({
        lat: result.point?.lat,
        lng: result.point?.lng,
        display_name: result.display_name
      })),
      trackerId,
      geocodingTimestamp: new Date().toISOString()
    };

    return await trackAIInteraction('geocoding_used', trackingData, query);
  } catch (error) {
    console.error('Error tracking geocoding usage:', error);
    return { success: false, error: error.message };
  }
}

export default {
  generateTicketId,
  getTicketHistory,
  markTicketAsUsed,
  getTicketStats,
  getTicketTypes,
  validateTicketId,
  searchTicket,
  searchTicketWithTracking,
  getTicketFormats,
  saveTripTracker,
  trackTrip,
  getMyTripTrackers,
  trackAIInteraction,
  getAIAnalytics,
  trackPythonInteraction,
  getTrackerAnalytics,
  trackRecommendationUsage,
  trackDestinationSelection,
  trackRouteCalculation,
  trackGeocodingUsage,
  DatabaseTicketIdTracker,
  databaseTicketIdTracker
} 