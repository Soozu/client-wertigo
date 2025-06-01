import React, { useState, useEffect } from 'react'
import { 
  databaseTicketIdTracker,
  getTicketFormats
} from '../services/ticketApi'
import './TicketIdGenerator.css'

const TicketIdGenerator = ({ onIdGenerated, onClose }) => {
  const [selectedType, setSelectedType] = useState('FLIGHT')
  const [includeTimestamp, setIncludeTimestamp] = useState(true)
  const [generatedId, setGeneratedId] = useState('')
  const [idHistory, setIdHistory] = useState([])
  const [stats, setStats] = useState({})
  const [showHistory, setShowHistory] = useState(false)
  const [copySuccess, setCopySuccess] = useState('')
  const [ticketFormats, setTicketFormats] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Load initial data
  useEffect(() => {
    loadTicketFormats()
    updateData()
  }, [])

  const loadTicketFormats = async () => {
    try {
      const result = await getTicketFormats()
      if (result.success) {
        setTicketFormats(result.formats)
      }
    } catch (error) {
      console.error('Error loading ticket formats:', error)
      // Fallback formats
      setTicketFormats({
        FLIGHT: 'FL',
        BUS: 'BS',
        FERRY: 'FR',
        TRAIN: 'TR',
        HOTEL: 'HT',
        TOUR: 'TO'
      })
    }
  }

  const updateData = async () => {
    try {
      setLoading(true)
      const [historyData, statsData] = await Promise.all([
        databaseTicketIdTracker.getHistory(),
        databaseTicketIdTracker.getStats()
      ])
      
      setIdHistory(historyData)
      setStats(statsData)
      setError('')
    } catch (error) {
      console.error('Error updating data:', error)
      setError('Failed to load data from server')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateId = async () => {
    try {
      setLoading(true)
      setError('')
      const newId = await databaseTicketIdTracker.generateUniqueId(selectedType, includeTimestamp)
      setGeneratedId(newId)
      await updateData()
      
      if (onIdGenerated) {
        onIdGenerated(newId, selectedType)
      }
    } catch (error) {
      console.error('Error generating ticket ID:', error)
      setError('Failed to generate ticket ID')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateBookingRef = async () => {
    try {
      setLoading(true)
      setError('')
      const bookingRef = await databaseTicketIdTracker.generateUniqueId('BOOKING_REF', false)
      setGeneratedId(bookingRef)
      await updateData()
      
      if (onIdGenerated) {
        onIdGenerated(bookingRef, 'BOOKING_REF')
      }
    } catch (error) {
      console.error('Error generating booking reference:', error)
      setError('Failed to generate booking reference')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateConfirmation = async () => {
    try {
      setLoading(true)
      setError('')
      const confirmationNum = await databaseTicketIdTracker.generateUniqueId('CONFIRMATION', false)
      setGeneratedId(confirmationNum)
      await updateData()
      
      if (onIdGenerated) {
        onIdGenerated(confirmationNum, 'CONFIRMATION')
      }
    } catch (error) {
      console.error('Error generating confirmation number:', error)
      setError('Failed to generate confirmation number')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopySuccess('Copied!')
      setTimeout(() => setCopySuccess(''), 2000)
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopySuccess('Copied!')
      setTimeout(() => setCopySuccess(''), 2000)
    }
  }

  const handleMarkAsUsed = async (ticketId) => {
    try {
      setLoading(true)
      await databaseTicketIdTracker.markAsUsed(ticketId)
      await updateData()
    } catch (error) {
      console.error('Error marking ticket as used:', error)
      setError('Failed to mark ticket as used')
    } finally {
      setLoading(false)
    }
  }

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to clear all generated IDs? This cannot be undone.')) {
      try {
        setLoading(true)
        await databaseTicketIdTracker.clearTracker()
        setGeneratedId('')
        await updateData()
      } catch (error) {
        console.error('Error clearing history:', error)
        setError('Failed to clear history')
      } finally {
        setLoading(false)
      }
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  const getTicketType = (ticketId) => {
    if (!ticketId) return 'UNKNOWN'
    
    for (const [type, prefix] of Object.entries(ticketFormats)) {
      if (ticketId.startsWith(prefix)) {
        return type
      }
    }
    
    return 'UNKNOWN'
  }

  return (
    <div className="ticket-id-generator">
      <div className="generator-header">
        <h3>🎫 Ticket ID Generator</h3>
        {onClose && (
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        )}
      </div>

      <div className="generator-content">
        {/* Error Display */}
        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-triangle"></i>
            <span>{error}</span>
          </div>
        )}

        {/* Generation Controls */}
        <div className="generation-section">
          <h4>Generate New ID</h4>
          
          <div className="form-group">
            <label htmlFor="ticket-type">Ticket Type:</label>
            <select 
              id="ticket-type"
              value={selectedType} 
              onChange={(e) => setSelectedType(e.target.value)}
              className="form-control"
              disabled={loading}
            >
              {Object.entries(ticketFormats).map(([type, prefix]) => (
                <option key={type} value={type}>
                  {type} ({prefix})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={includeTimestamp}
                onChange={(e) => setIncludeTimestamp(e.target.checked)}
              />
              Include timestamp in ID
            </label>
          </div>

          <div className="generation-buttons">
            <button 
              className="btn btn-primary"
              onClick={handleGenerateId}
              disabled={loading}
            >
              <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-ticket-alt'}`}></i>
              {loading ? 'Generating...' : 'Generate Ticket ID'}
            </button>
            
            <button 
              className="btn btn-secondary"
              onClick={handleGenerateBookingRef}
              disabled={loading}
            >
              <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-bookmark'}`}></i>
              Booking Reference
            </button>
            
            <button 
              className="btn btn-secondary"
              onClick={handleGenerateConfirmation}
              disabled={loading}
            >
              <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-check-circle'}`}></i>
              Confirmation Number
            </button>
          </div>
        </div>

        {/* Generated ID Display */}
        {generatedId && (
          <div className="generated-id-section">
            <h4>Generated ID</h4>
            <div className="generated-id-display">
              <div className="id-info">
                <span className="id-value">{generatedId}</span>
                <span className="id-type">({getTicketType(generatedId)})</span>
              </div>
              <div className="id-actions">
                <button 
                  className="btn btn-copy"
                  onClick={() => handleCopyToClipboard(generatedId)}
                >
                  <i className="fas fa-copy"></i>
                  {copySuccess || 'Copy'}
                </button>
                <button 
                  className="btn btn-use"
                  onClick={() => handleMarkAsUsed(generatedId)}
                >
                  <i className="fas fa-check"></i>
                  Mark as Used
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="stats-section">
          <h4>Statistics</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Total Generated:</span>
              <span className="stat-value">{stats.totalGenerated || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Used:</span>
              <span className="stat-value">{stats.totalUsed || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Unused:</span>
              <span className="stat-value">{stats.totalUnused || 0}</span>
            </div>
          </div>
        </div>

        {/* History Toggle */}
        <div className="history-section">
          <div className="history-header">
            <button 
              className="btn btn-outline"
              onClick={() => setShowHistory(!showHistory)}
            >
              <i className={`fas fa-chevron-${showHistory ? 'up' : 'down'}`}></i>
              {showHistory ? 'Hide' : 'Show'} History ({idHistory.length})
            </button>
            
            {idHistory.length > 0 && (
              <button 
                className="btn btn-danger-outline"
                onClick={handleClearHistory}
              >
                <i className="fas fa-trash"></i>
                Clear All
              </button>
            )}
          </div>

          {/* History List */}
          {showHistory && (
            <div className="history-list">
              {idHistory.length === 0 ? (
                <p className="no-history">No IDs generated yet.</p>
              ) : (
                <div className="history-items">
                  {idHistory.slice(0, 10).map((item, index) => (
                    <div key={index} className={`history-item ${item.used ? 'used' : 'unused'}`}>
                      <div className="history-id">
                        <span className="id-text">{item.id}</span>
                        <span className="id-type-badge">{item.type}</span>
                        {item.used && <span className="used-badge">USED</span>}
                      </div>
                      <div className="history-meta">
                        <span className="generated-time">
                          Generated: {formatDate(item.generated)}
                        </span>
                        {item.usedAt && (
                          <span className="used-time">
                            Used: {formatDate(item.usedAt)}
                          </span>
                        )}
                      </div>
                      <div className="history-actions">
                        <button 
                          className="btn btn-sm"
                          onClick={() => handleCopyToClipboard(item.id)}
                        >
                          <i className="fas fa-copy"></i>
                        </button>
                        {!item.used && (
                          <button 
                            className="btn btn-sm btn-success"
                            onClick={() => handleMarkAsUsed(item.id)}
                          >
                            <i className="fas fa-check"></i>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {idHistory.length > 10 && (
                    <p className="history-more">
                      ... and {idHistory.length - 10} more
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TicketIdGenerator 