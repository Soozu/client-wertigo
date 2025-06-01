/**
 * Ticket ID Generator Utility
 * Generates unique ticket IDs for different travel services
 */

// Ticket ID formats for different services
const TICKET_FORMATS = {
  FLIGHT: 'FL',
  BUS: 'BS', 
  FERRY: 'FR',
  TRAIN: 'TR',
  HOTEL: 'HT',
  TOUR: 'TO'
}

// Generate random alphanumeric string
const generateRandomString = (length) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Generate timestamp-based ID component
const generateTimestamp = () => {
  const now = new Date()
  const year = now.getFullYear().toString().slice(-2)
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  return `${year}${month}${day}`
}

// Generate ticket ID with specific format
export const generateTicketId = (type = 'FLIGHT', includeTimestamp = true) => {
  const prefix = TICKET_FORMATS[type] || 'TK'
  const timestamp = includeTimestamp ? generateTimestamp() : ''
  const randomPart = generateRandomString(6)
  
  return `${prefix}${timestamp}${randomPart}`
}

// Generate booking reference (shorter format)
export const generateBookingReference = () => {
  return generateRandomString(6)
}

// Generate confirmation number
export const generateConfirmationNumber = () => {
  const letters = generateRandomString(2)
  const numbers = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `${letters}${numbers}`
}

// Validate ticket ID format
export const validateTicketId = (ticketId) => {
  if (!ticketId || typeof ticketId !== 'string') {
    return false
  }
  
  // Check if it matches any known format
  const validPrefixes = Object.values(TICKET_FORMATS)
  const hasValidPrefix = validPrefixes.some(prefix => ticketId.startsWith(prefix))
  
  // Basic length check (should be at least 8 characters)
  const hasValidLength = ticketId.length >= 8
  
  return hasValidPrefix && hasValidLength
}

// Get ticket type from ID
export const getTicketType = (ticketId) => {
  if (!ticketId) return 'UNKNOWN'
  
  for (const [type, prefix] of Object.entries(TICKET_FORMATS)) {
    if (ticketId.startsWith(prefix)) {
      return type
    }
  }
  
  return 'UNKNOWN'
}

// Ticket ID tracker class for managing generated IDs
export class TicketIdTracker {
  constructor() {
    this.generatedIds = new Set()
    this.idHistory = []
    this.loadFromStorage()
  }

  // Generate unique ticket ID (ensures no duplicates)
  generateUniqueId(type = 'FLIGHT', includeTimestamp = true) {
    let ticketId
    let attempts = 0
    const maxAttempts = 100

    do {
      ticketId = generateTicketId(type, includeTimestamp)
      attempts++
    } while (this.generatedIds.has(ticketId) && attempts < maxAttempts)

    if (attempts >= maxAttempts) {
      // Fallback: add random suffix
      ticketId = `${ticketId}${Math.floor(Math.random() * 100)}`
    }

    this.addToTracker(ticketId, type)
    return ticketId
  }

  // Add ID to tracker
  addToTracker(ticketId, type = 'UNKNOWN') {
    this.generatedIds.add(ticketId)
    this.idHistory.push({
      id: ticketId,
      type,
      generated: new Date().toISOString(),
      used: false
    })
    this.saveToStorage()
  }

  // Mark ID as used
  markAsUsed(ticketId) {
    const entry = this.idHistory.find(item => item.id === ticketId)
    if (entry) {
      entry.used = true
      entry.usedAt = new Date().toISOString()
      this.saveToStorage()
    }
  }

  // Check if ID exists in tracker
  hasId(ticketId) {
    return this.generatedIds.has(ticketId)
  }

  // Get ID history
  getHistory() {
    return [...this.idHistory].reverse() // Most recent first
  }

  // Get unused IDs
  getUnusedIds() {
    return this.idHistory.filter(item => !item.used)
  }

  // Clear all tracked IDs
  clearTracker() {
    this.generatedIds.clear()
    this.idHistory = []
    this.saveToStorage()
  }

  // Save to localStorage
  saveToStorage() {
    try {
      localStorage.setItem('ticketIdTracker', JSON.stringify({
        generatedIds: Array.from(this.generatedIds),
        idHistory: this.idHistory
      }))
    } catch (error) {
      console.warn('Failed to save ticket ID tracker to localStorage:', error)
    }
  }

  // Load from localStorage
  loadFromStorage() {
    try {
      const stored = localStorage.getItem('ticketIdTracker')
      if (stored) {
        const data = JSON.parse(stored)
        this.generatedIds = new Set(data.generatedIds || [])
        this.idHistory = data.idHistory || []
      }
    } catch (error) {
      console.warn('Failed to load ticket ID tracker from localStorage:', error)
    }
  }

  // Get statistics
  getStats() {
    const totalGenerated = this.idHistory.length
    const totalUsed = this.idHistory.filter(item => item.used).length
    const typeStats = {}

    this.idHistory.forEach(item => {
      typeStats[item.type] = (typeStats[item.type] || 0) + 1
    })

    return {
      totalGenerated,
      totalUsed,
      totalUnused: totalGenerated - totalUsed,
      typeStats
    }
  }
}

// Create singleton instance
export const ticketIdTracker = new TicketIdTracker()

// Export ticket formats for reference
export { TICKET_FORMATS } 