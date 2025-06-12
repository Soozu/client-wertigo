import React, { useState, useEffect } from 'react'
import { Plus, MapPin, Calendar, Users, Save, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { trackersAPI } from '../services/api'
import { getDestinationImage, handleImageError } from '../utils/destinationImages'
import { formatCurrency, formatDate } from '../utils/formatters'
import './TripPlanner.css'

const TripPlanner = ({ 
  trip, 
  onDestinationRemove, 
  loading,
  error,
  readOnly = false
}) => {
  const navigate = useNavigate()
  const [isAddingDestination, setIsAddingDestination] = useState(false)
  const [newDestination, setNewDestination] = useState({
    name: '',
    category: 'Restaurant',
    location: '',
    budget: '',
    day: '',
    notes: ''
  })
  
  // Save trip modal state
  const [showSaveModal, setShowSaveModal] = useState(false)
  const today = new Date().toISOString().split('T')[0] // Today's date in YYYY-MM-DD format
  const [saveFormData, setSaveFormData] = useState({
    email: '',
    travelerName: '',
    phone: '',
    startDate: today // Default to today's date
  })
  const [saveLoading, setSaveLoading] = useState(false)
  const [saveResult, setSaveResult] = useState(null)
  // Confirmation modal for clear trip
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  // Get destinations from trip object, with fallback to empty array
  const destinations = trip?.destinations || []

  const categories = [
    'Restaurant', 'Cafe', 'Accommodation', 'Entertainment', 
    'Shopping', 'Historical', 'Natural', 'Other'
  ]

  const handleAddDestination = () => {
    if (!newDestination.name.trim()) return

    const destination = {
      id: Date.now(),
      ...newDestination,
      budget: parseFloat(newDestination.budget) || 0,
      day: parseInt(newDestination.day) || 1,
      lat: 14.5995 + (Math.random() - 0.5) * 0.1, // Random coordinates for demo
      lng: 120.9842 + (Math.random() - 0.5) * 0.1,
      color: getCategoryColor(newDestination.category)
    }

    // This would need to be implemented to add to the trip
    console.log('Adding destination:', destination)
    setNewDestination({
      name: '',
      category: 'Restaurant',
      location: '',
      budget: '',
      day: '',
      notes: ''
    })
    setIsAddingDestination(false)
  }

  const getCategoryColor = (category) => {
    const colors = {
      'Restaurant': '#e74c3c',
      'Cafe': '#f39c12',
      'Accommodation': '#9b59b6',
      'Entertainment': '#3498db',
      'Shopping': '#e67e22',
      'Historical': '#8b4513',
      'Natural': '#27ae60',
      'Other': '#95a5a6'
    }
    return colors[category] || '#3498db'
  }

  // Handle clear all destinations
  const handleClearTrip = () => {
    setShowClearConfirm(true)
  }

  const confirmClearTrip = () => {
    // Remove all destinations one by one
    if (destinations && destinations.length > 0) {
      // Create a copy to avoid modification during iteration
      const destinationsCopy = [...destinations]
      destinationsCopy.forEach(destination => {
        onDestinationRemove(destination.id)
      })
    }
    setShowClearConfirm(false)
  }

  // Handle save trip
  const handleSaveTrip = async () => {
    if (!trip?.id) {
      alert('No trip to save!')
      return
    }
    
    if (!saveFormData.email.trim()) {
      alert('Email is required!')
      return
    }
    
    if (!saveFormData.startDate) {
      alert('Trip start date is required!')
      return
    }
    
    setSaveLoading(true)
    
    try {
      const result = await trackersAPI.createTracker({
        tripId: trip.id,
        email: saveFormData.email.trim(),
        travelerName: saveFormData.travelerName.trim(),
        phone: saveFormData.phone.trim(),
        startDate: saveFormData.startDate,
        saveDate: new Date().toISOString()
      })
      
      if (result && result.success) {
        setSaveResult({
          success: true,
          trackerId: result.tracker.trackerId,
          message: result.message,
          email: saveFormData.email,
          startDate: saveFormData.startDate
        })
        
        // Tracker data is now saved to database via API
        console.log('Tracker saved successfully:', result.tracker.trackerId)
      } else {
        setSaveResult({
          success: false,
          error: result?.message || 'Failed to save trip'
        })
      }
    } catch (error) {
      setSaveResult({
        success: false,
        error: error.message || 'Failed to save trip'
      })
    } finally {
      setSaveLoading(false)
    }
  }

  const handleCloseSaveModal = () => {
    setShowSaveModal(false)
    setSaveResult(null)
    setSaveFormData({
      email: '',
      travelerName: '',
      phone: '',
      startDate: today // Reset to today's date
    })
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Tracker ID copied to clipboard!')
    }).catch(() => {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      alert('Tracker ID copied to clipboard!')
    })
  }

  // Calculate budget ranges for destinations and total
  const calculateBudgetRanges = () => {
    let totalMinBudget = 0
    let totalMaxBudget = 0
    
    destinations.forEach(dest => {
      const budget = parseFloat(dest.budget) || 0
      if (budget > 0) {
        // Create a range: budget ± 20% for estimation
        const minBudget = Math.floor(budget * 0.8)
        const maxBudget = Math.ceil(budget * 1.2)
        totalMinBudget += minBudget
        totalMaxBudget += maxBudget
      }
    })
    
    return {
      totalMinBudget,
      totalMaxBudget,
      hasValidBudgets: totalMinBudget > 0
    }
  }

  const { totalMinBudget, totalMaxBudget, hasValidBudgets } = calculateBudgetRanges()

  // Helper function to format budget range for individual destinations
  const formatDestinationBudget = (budget) => {
    const budgetAmount = parseFloat(budget)
    if (!budgetAmount || budgetAmount <= 0) return null
    
    const minBudget = Math.floor(budgetAmount * 0.8)
    const maxBudget = Math.ceil(budgetAmount * 1.2)
    
    return `₱${minBudget.toLocaleString()} - ₱${maxBudget.toLocaleString()}`
  }

  // formatDate is now imported from utils/formatters

  const handleViewTrip = () => {
    if (saveResult && saveResult.success && saveResult.trackerId) {
      navigate(`/trip/${saveResult.trackerId}`)
    }
  }

  if (loading) {
    return (
      <div className="trip-planner">
        <div className="loading-message">
          <div className="loader"></div>
          <p>Loading trip...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="trip-planner">
        <div className="error-message">
          <p>❌ {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="trip-planner">
      <div className="planner-header">
        <div className="planner-title">Trip Planner</div>
        <div className="planner-actions">
          <button 
            className="planner-btn"
            onClick={() => setShowSaveModal(true)}
            disabled={!trip?.id || destinations.length === 0}
            title="Save trip and get tracker ID"
          >
            <Save size={16} />
            Save Plan
          </button>
          <button 
            className="planner-btn secondary"
            onClick={handleClearTrip}
            disabled={!trip?.id || destinations.length === 0 || readOnly}
            title="Clear all destinations"
          >
            Clear
          </button>
        </div>
      </div>

      {trip && (
        <div className="trip-info">
          <h3>Trip Details</h3>
          <div className="trip-details">
            {trip.destination && (
              <div className="trip-detail">
                <MapPin size={16} />
                <span>{trip.destination}</span>
              </div>
            )}
            {trip.start_date ? (
              <div className="trip-detail">
                <Calendar size={16} />
                <span>Starts: {formatDate(trip.start_date)}</span>
              </div>
            ) : (
              <div className="trip-detail">
                <Calendar size={16} />
                <span>Starts: Today</span>
              </div>
            )}
            {trip.end_date && (
              <div className="trip-detail">
                <Calendar size={16} />
                <span>Ends: {formatDate(trip.end_date)}</span>
              </div>
            )}
            {trip.budget && (
              <div className="trip-detail">
                <span style={{ fontSize: '16px' }}>₱</span>
                <span>₱{parseFloat(trip.budget).toLocaleString()} <span className="budget-label">(estimated)</span></span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="destinations-section">
        <div className="destinations-header">
          <h3>My Destinations ({destinations.length})</h3>
        </div>
        
        <div className="destinations-list">
          {destinations.length === 0 ? (
            <div className="empty-destinations">
              <p>No destinations added yet.</p>
              <p>Use the AI assistant to discover amazing places!</p>
            </div>
          ) : (
            destinations.map((destination, index) => (
            <div key={destination.id} className="destination-item">
              <div className="destination-header">
                  <div className="destination-number">
                    {index + 1}
                    {index === 0 && destinations.length > 1 && (
                      <span className="destination-badge start">START</span>
                    )}
                    {index === destinations.length - 1 && destinations.length > 1 && index > 0 && (
                      <span className="destination-badge end">END</span>
                    )}
                  </div>
                  
                  <div className="destination-image-small">
                    <img 
                      src={getDestinationImage(destination.name)}
                      alt={destination.name}
                      onError={(e) => handleImageError(e, destination.name)}
                    />
                  </div>
                  
                <div className="destination-info">
                  <h4>{destination.name}</h4>
                  <span className="destination-category">{destination.category}</span>
                    {destination.city && destination.province && (
                      <span className="destination-location">
                        <MapPin size={12} />
                        {destination.city}, {destination.province}
                      </span>
                    )}
                </div>
                  {!readOnly && (
                <button 
                  className="remove-btn"
                    onClick={() => onDestinationRemove(destination.id)}
                  aria-label="Remove destination"
                >
                  ×
                </button>
                  )}
              </div>
              
                {destination.description && (
                  <p className="destination-description">
                    {destination.description.length > 100 
                      ? `${destination.description.substring(0, 100)}...` 
                      : destination.description}
                </p>
              )}
              
                {destination.budget && parseFloat(destination.budget) > 0 && (
                <p className="destination-budget">
                  <span style={{ fontSize: '14px', color: '#27ae60' }}>💰</span>
                  <span className="budget-range">
                    {formatDestinationBudget(destination.budget)} <span className="budget-label">(estimated)</span>
                  </span>
                </p>
              )}
              
                {destination.operating_hours && (
                  <p className="destination-hours">
                    🕒 {destination.operating_hours}
                  </p>
                )}

                {destination.rating && (
                  <p className="destination-rating">
                    ⭐ {destination.rating}/5
                  </p>
              )}
            </div>
            ))
          )}
        </div>
      </div>

      <div className="trip-summary">
        <h3>Trip Summary</h3>
        <div className="summary-stats">
          <div className="stat-item">
            <div className="stat-value">{destinations.length}</div>
            <div className="stat-label">Destinations</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">
              {hasValidBudgets ? (
                <span className="budget-range-total">
                  ₱{totalMinBudget.toLocaleString()} - ₱{totalMaxBudget.toLocaleString()}
                </span>
              ) : (
                <span className="no-budget">No budget set</span>
              )}
            </div>
            <div className="stat-label">
              Estimated Budget
            </div>
          </div>
        </div>
        <div className="budget-note">
          <small>All budget figures are estimates and may vary based on actual costs.</small>
        </div>
      </div>

      {/* Save Trip Modal */}
      {showSaveModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>💾 Save Trip & Get Tracker ID</h3>
              <button 
                className="modal-close"
                onClick={handleCloseSaveModal}
              >
                ×
              </button>
            </div>
            
            {!saveResult ? (
              <div className="modal-body">
                <p>Save your trip and get a unique Tracker ID that you can use to view your itinerary later!</p>
                
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    value={saveFormData.email}
                    onChange={(e) => setSaveFormData({...saveFormData, email: e.target.value})}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="travelerName">Traveler Name (Optional)</label>
                  <input
                    type="text"
                    id="travelerName"
                    value={saveFormData.travelerName}
                    onChange={(e) => setSaveFormData({...saveFormData, travelerName: e.target.value})}
                    placeholder="Your name"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="phone">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    id="phone"
                    value={saveFormData.phone}
                    onChange={(e) => setSaveFormData({...saveFormData, phone: e.target.value})}
                    placeholder="+63 XXX XXX XXXX"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="startDate">Trip Start Date *</label>
                  <input
                    type="date"
                    id="startDate"
                    value={saveFormData.startDate}
                    onChange={(e) => setSaveFormData({...saveFormData, startDate: e.target.value})}
                    required
                  />
                  <small className="form-help-text">When do you plan to start your trip? (required)</small>
                </div>
                
                <div className="modal-actions">
                  <button 
                    className="btn btn-secondary"
                    onClick={handleCloseSaveModal}
                    disabled={saveLoading}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={handleSaveTrip}
                    disabled={saveLoading || !saveFormData.email.trim() || !saveFormData.startDate}
                  >
                    {saveLoading ? (
                      <>
                        <div className="btn-spinner"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save Trip
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="modal-body">
                {saveResult.success ? (
                  <div className="success-result">
                    <div className="success-icon">✅</div>
                    <h4>Trip Saved Successfully!</h4>
                    <p>{saveResult.message}</p>
                    
                    <div className="tracker-id-display">
                      <label>Your Tracker ID:</label>
                      <div className="tracker-id-value">
                        <code>{saveResult.trackerId}</code>
                        <button 
                          className="copy-btn"
                          onClick={() => copyToClipboard(saveResult.trackerId)}
                          title="Copy Tracker ID"
                        >
                          📋
                        </button>
                      </div>
                    </div>
                    
                    <div className="tracker-instructions">
                      <h5>How to use your Tracker ID:</h5>
                      <ol>
                        <li>Go to the <strong>Ticket Tracker</strong> page</li>
                        <li>Enter your Tracker ID: <code>{saveResult.trackerId}</code></li>
                        <li>Enter your email: <code>{saveFormData.email}</code></li>
                        <li>View your complete trip itinerary!</li>
                      </ol>
                      <p>Your trip is scheduled to start on: <strong>{saveFormData.startDate === today ? 'Today' : new Date(saveFormData.startDate).toLocaleDateString()}</strong></p>
                    </div>
                  </div>
                ) : (
                  <div className="error-result">
                    <div className="error-icon">❌</div>
                    <h4>Save Failed</h4>
                    <p>{saveResult.error}</p>
                  </div>
                )}
                
                <div className="modal-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={handleViewTrip}
                  >
                    View Trip
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={handleCloseSaveModal}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Clear Trip Confirmation Modal */}
      {showClearConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>⚠️ Clear All Destinations</h3>
              <button 
                className="modal-close"
                onClick={() => setShowClearConfirm(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to remove all destinations from your trip? This action cannot be undone.</p>
              
              <div className="modal-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowClearConfirm(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary"
                  style={{ backgroundColor: '#e74c3c' }}
                  onClick={confirmClearTrip}
                >
                  Clear All Destinations
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TripPlanner 