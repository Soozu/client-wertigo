import React, { useState } from 'react'
import { Plus, MapPin, DollarSign, Calendar, Users, Route, Clock, Save } from 'lucide-react'
import { saveTripTracker } from '../services/ticketApi'
import './TripPlanner.css'

const TripPlanner = ({ 
  trip, 
  onDestinationRemove, 
  onCalculateRoute,
  loading,
  error,
  routeData,
  routeLoading,
  readOnly = false
}) => {
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
  const [saveFormData, setSaveFormData] = useState({
    email: '',
    travelerName: '',
    phone: ''
  })
  const [saveLoading, setSaveLoading] = useState(false)
  const [saveResult, setSaveResult] = useState(null)

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
    
    setSaveLoading(true)
    
    try {
      const result = await saveTripTracker(
        trip.id,
        saveFormData.email.trim(),
        saveFormData.travelerName.trim(),
        saveFormData.phone.trim()
      )
      
      if (result.success) {
        setSaveResult({
          success: true,
          trackerId: result.trackerId,
          message: result.message
        })
      } else {
        setSaveResult({
          success: false,
          error: result.error
        })
      }
    } catch (error) {
      setSaveResult({
        success: false,
        error: 'Failed to save trip. Please try again.'
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
      phone: ''
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

  // Safe reduce with fallback
  const totalBudget = destinations.reduce((sum, dest) => sum + (dest.budget || 0), 0)

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
          <button className="planner-btn secondary">Clear</button>
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
            {trip.start_date && trip.end_date && (
              <div className="trip-detail">
                <Calendar size={16} />
                <span>{trip.start_date} - {trip.end_date}</span>
              </div>
            )}
            {trip.travelers && (
              <div className="trip-detail">
                <Users size={16} />
                <span>{trip.travelers} travelers</span>
              </div>
            )}
            {trip.budget && (
              <div className="trip-detail">
                <DollarSign size={16} />
                <span>₱{trip.budget.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Route Information Section */}
      {routeData && destinations.length > 1 && (
        <div className="route-info-section">
          <h3>🗺️ Route Information</h3>
          <div className="route-details">
            <div className="route-detail">
              <Route size={16} />
              <span>{routeData.distance_km} km total distance</span>
            </div>
            <div className="route-detail">
              <Clock size={16} />
              <span>{Math.round(routeData.time_min)} min estimated time</span>
            </div>
            <div className="route-detail">
              <MapPin size={16} />
              <span>{destinations.length} stops planned</span>
            </div>
          </div>
        </div>
      )}

      <div className="destinations-section">
        <div className="destinations-header">
          <h3>My Destinations ({destinations.length})</h3>
          {destinations.length > 1 && (
            <button 
              className="calculate-route-btn"
              onClick={onCalculateRoute}
              disabled={routeLoading}
              title="Calculate route between destinations"
            >
              {routeLoading ? (
                <>
                  <div className="btn-spinner"></div>
                  Calculating...
                </>
              ) : (
                <>
              🗺️ Calculate Route
                </>
              )}
            </button>
          )}
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
              
                {destination.budget && destination.budget > 0 && (
                <p className="destination-budget">
                  <DollarSign size={14} />
                  ₱{destination.budget.toLocaleString()}
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

                {/* Show route segment info if available */}
                {routeData && index < destinations.length - 1 && (
                  <div className="route-segment">
                    <div className="route-arrow">↓</div>
                    <span className="route-segment-text">
                      Next stop: ~{Math.round(routeData.time_min / (destinations.length - 1))} min
                    </span>
                  </div>
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
            <div className="stat-value">₱{totalBudget.toLocaleString()}</div>
            <div className="stat-label">Est. Budget</div>
          </div>
          {routeData && (
            <>
              <div className="stat-item">
                <div className="stat-value">{routeData.distance_km} km</div>
                <div className="stat-label">Total Distance</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{Math.round(routeData.time_min / 60)}h {routeData.time_min % 60}m</div>
                <div className="stat-label">Travel Time</div>
              </div>
            </>
          )}
        </div>
        
        {destinations.length > 0 && !readOnly && (
          <div className="trip-actions">
            <button className="action-btn primary">
              📱 Export Itinerary
            </button>
            <button className="action-btn secondary">
              📧 Share Trip
            </button>
          </div>
        )}
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
                    disabled={saveLoading || !saveFormData.email.trim()}
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
    </div>
  )
}

export default TripPlanner 