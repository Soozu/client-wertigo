import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Create axios instance with default config
const ticketApi = axios.create({
  baseURL: `${API_BASE_URL}/api/tickets`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add session info
ticketApi.interceptors.request.use(
  (config) => {
    // Session is handled by cookies, no need to add headers
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
    return Promise.reject(error)
  }
)

// Generate a new ticket ID
export const generateTicketId = async (ticketType, includeTimestamp = true, metadata = {}) => {
  try {
    const response = await ticketApi.post('/generate', {
      type: ticketType,
      include_timestamp: includeTimestamp,
      metadata
    })
    
    if (response.data.success) {
      return {
        success: true,
        ticketId: response.data.ticket_id,
        type: response.data.type,
        includeTimestamp: response.data.include_timestamp,
        createdAt: response.data.created_at
      }
    } else {
      throw new Error(response.data.error || 'Failed to generate ticket')
    }
  } catch (error) {
    console.error('Error generating ticket:', error)
    return {
      success: false,
      error: error.response?.data?.error || error.message
    }
  }
}

// Get ticket generation history
export const getTicketHistory = async (limit = 50) => {
  try {
    const response = await ticketApi.get('/history', {
      params: { limit }
    })
    
    if (response.data.success) {
      return {
        success: true,
        tickets: response.data.tickets,
        count: response.data.count
      }
    } else {
      throw new Error(response.data.error || 'Failed to get ticket history')
    }
  } catch (error) {
    console.error('Error getting ticket history:', error)
    return {
      success: false,
      error: error.response?.data?.error || error.message,
      tickets: []
    }
  }
}

// Mark a ticket as used
export const markTicketAsUsed = async (ticketId) => {
  try {
    const response = await ticketApi.post('/mark-used', {
      ticket_id: ticketId
    })
    
    if (response.data.success) {
      return {
        success: true,
        message: response.data.message,
        ticketId: response.data.ticket_id,
        usedAt: response.data.used_at
      }
    } else {
      throw new Error(response.data.error || 'Failed to mark ticket as used')
    }
  } catch (error) {
    console.error('Error marking ticket as used:', error)
    return {
      success: false,
      error: error.response?.data?.error || error.message
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
      throw new Error(response.data.error || 'Failed to get ticket stats')
    }
  } catch (error) {
    console.error('Error getting ticket stats:', error)
    return {
      success: false,
      error: error.response?.data?.error || error.message,
      stats: {
        total_generated: 0,
        total_used: 0,
        total_unused: 0,
        type_stats: {}
      }
    }
  }
}

// Clear all generated tickets
export const clearAllTickets = async () => {
  try {
    const response = await ticketApi.delete('/clear')
    
    if (response.data.success) {
      return {
        success: true,
        message: response.data.message
      }
    } else {
      throw new Error(response.data.error || 'Failed to clear tickets')
    }
  } catch (error) {
    console.error('Error clearing tickets:', error)
    return {
      success: false,
      error: error.response?.data?.error || error.message
    }
  }
}

// Validate a ticket ID
export const validateTicketId = async (ticketId) => {
  try {
    const response = await ticketApi.post('/validate', {
      ticket_id: ticketId
    })
    
    if (response.data.success) {
      return {
        success: true,
        valid: response.data.valid,
        ticketType: response.data.ticket_type,
        existsInDatabase: response.data.exists_in_database,
        ticketId: response.data.ticket_id
      }
    } else {
      throw new Error(response.data.error || 'Failed to validate ticket')
    }
  } catch (error) {
    console.error('Error validating ticket:', error)
    return {
      success: false,
      error: error.response?.data?.error || error.message,
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
        trip_trackers: response.data.trip_trackers
      }
    } else {
      throw new Error(response.data.error || 'Ticket not found')
    }
  } catch (error) {
    console.error('Error searching ticket:', error)
    return {
      success: false,
      error: error.response?.data?.error || error.message
    }
  }
}

// Get available ticket formats
export const getTicketFormats = async () => {
  try {
    const response = await ticketApi.get('/formats')
    
    if (response.data.success) {
      return {
        success: true,
        formats: response.data.formats
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
        BUS: 'BS',
        FERRY: 'FR',
        TRAIN: 'TR',
        HOTEL: 'HT',
        TOUR: 'TO'
      }
    }
  }
}

// Trip Tracker API Functions

// Save a trip with tracker ID
export const saveTripTracker = async (tripId, email, travelerName = '', phone = '') => {
  try {
    const response = await ticketApi.post('/save-trip', {
      trip_id: tripId,
      email,
      traveler_name: travelerName,
      phone
    })
    
    if (response.data.success) {
      return {
        success: true,
        trackerId: response.data.tracker_id,
        message: response.data.message,
        email: response.data.email,
        createdAt: response.data.created_at
      }
    } else {
      throw new Error(response.data.error || 'Failed to save trip tracker')
    }
  } catch (error) {
    console.error('Error saving trip tracker:', error)
    return {
      success: false,
      error: error.response?.data?.error || error.message
    }
  }
}

// Track a trip using tracker ID
export const trackTrip = async (trackerId, email = '') => {
  try {
    const response = await ticketApi.post('/track-trip', {
      tracker_id: trackerId,
      email
    })
    
    if (response.data.success) {
      return {
        success: true,
        trip: response.data.trip,
        trackerId: response.data.tracker_id
      }
    } else {
      throw new Error(response.data.error || 'Trip not found')
    }
  } catch (error) {
    console.error('Error tracking trip:', error)
    return {
      success: false,
      error: error.response?.data?.error || error.message
    }
  }
}

// Get all trip trackers for an email
export const getMyTripTrackers = async (email) => {
  try {
    const response = await ticketApi.post('/my-trackers', {
      email
    })
    
    if (response.data.success) {
      return {
        success: true,
        trackers: response.data.trackers,
        count: response.data.count
      }
    } else {
      throw new Error(response.data.error || 'Failed to get trip trackers')
    }
  } catch (error) {
    console.error('Error getting trip trackers:', error)
    return {
      success: false,
      error: error.response?.data?.error || error.message,
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
    // For manual additions, we could create a separate endpoint
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
    return result.success && result.existsInDatabase
  }

  // Get ticket history
  async getHistory() {
    const result = await getTicketHistory()
    
    if (result.success) {
      // Transform to match frontend format
      return result.tickets.map(ticket => ({
        id: ticket.ticket_id,
        type: ticket.ticket_type,
        generated: ticket.created_at,
        used: ticket.is_used,
        usedAt: ticket.used_at
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

  // Clear all tickets
  async clearTracker() {
    const result = await clearAllTickets()
    
    if (result.success) {
      // Clear cache
      this.cache = {
        tickets: [],
        stats: null,
        lastFetch: null
      }
      return true
    } else {
      throw new Error(result.error)
    }
  }

  // Get statistics
  async getStats() {
    const result = await getTicketStats()
    
    if (result.success) {
      // Transform to match frontend format
      return {
        totalGenerated: result.stats.total_generated,
        totalUsed: result.stats.total_used,
        totalUnused: result.stats.total_unused,
        typeStats: result.stats.type_stats
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

export default {
  generateTicketId,
  getTicketHistory,
  markTicketAsUsed,
  getTicketStats,
  clearAllTickets,
  validateTicketId,
  searchTicket,
  getTicketFormats,
  saveTripTracker,
  trackTrip,
  getMyTripTrackers,
  DatabaseTicketIdTracker,
  databaseTicketIdTracker
} 