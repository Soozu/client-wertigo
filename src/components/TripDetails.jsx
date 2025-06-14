import React, { useState, useEffect } from 'react'
import { MapPin, Calendar, Users, Clock, Route, ArrowLeft, Star } from 'lucide-react'
import TripMap from './TripMap'
import { getDestinationImage, handleImageError, preloadDestinationImages } from '../utils/destinationImages'
import './TripDetails.css'
import './TripMap.css'

const TripDetails = ({ trip, onBack }) => {
  const [reviews, setReviews] = useState([])
  const [newReview, setNewReview] = useState({ rating: 0, text: '', reviewerName: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!trip) return null

  const { tracker_info } = trip
  const destinations = trip.destinations || []
  const routeData = trip.route_data

  const formatDate = (dateString) => {
    if (!dateString) return 'Today'
    
    const date = new Date(dateString)
    const today = new Date()
    
    // Check if the date is today
    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    }
    
    // Check if date is in the future
    const isFuture = date > today
    
    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    
    return isFuture ? `${formattedDate} (Upcoming)` : formattedDate
  }

  // Use current date as default for calculations when no start date is available
  const getEffectiveStartDate = () => {
    if (tracker_info?.save_date) return new Date(tracker_info.save_date)
    if (trip.start_date) return new Date(trip.start_date)
    return new Date() // Default to today
  }

  // Calculate trip duration in days
  const calculateTripDuration = () => {
    const startDate = getEffectiveStartDate()
    
    if (trip.end_date) {
      // If both dates are available, calculate actual duration
      const endDate = new Date(trip.end_date)
      
      // Calculate the time difference in milliseconds
      const diffTime = Math.abs(endDate - startDate)
      
      // Convert to days and add 1 to include both the start and end dates
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
      
      return diffDays
    } else {
      // Always return 1 day if no end date is specified
      return 1
    }
  }

  const tripDuration = calculateTripDuration();

  // Calculate total budget from destinations
  const destinationsBudget = destinations.reduce((sum, dest) => {
    const budget = parseFloat(dest.budget) || 0
    return sum + budget
  }, 0)

  // Calculate total budget from destinations and create budget ranges
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

  const { totalMinBudget, totalMaxBudget, hasValidBudgets } = calculateBudgetRanges();

  // Helper function to format budget range for individual destinations
  const formatDestinationBudget = (budget) => {
    const budgetAmount = parseFloat(budget)
    if (!budgetAmount || budgetAmount <= 0) return null
    
    const minBudget = Math.floor(budgetAmount * 0.8)
    const maxBudget = Math.ceil(budgetAmount * 1.2)
    
    return `₱${minBudget.toLocaleString()} - ₱${maxBudget.toLocaleString()}`
  }

  // Use destinations budget if available, otherwise fall back to trip budget
  const totalBudget = destinationsBudget > 0 ? destinationsBudget : (parseFloat(trip.budget) || 0)
  
  // Calculate trip budget range if not calculated from destinations
  const tripBudgetRange = () => {
    if (hasValidBudgets) {
      return `₱${totalMinBudget.toLocaleString()} - ₱${totalMaxBudget.toLocaleString()}`
    } else if (totalBudget > 0) {
      const minBudget = Math.floor(totalBudget * 0.8)
      const maxBudget = Math.ceil(totalBudget * 1.2)
      return `₱${minBudget.toLocaleString()} - ₱${maxBudget.toLocaleString()}`
    }
    return '₱0'
  }

  // Load reviews from localStorage
  useEffect(() => {
    const savedReviews = localStorage.getItem(`reviews_${trip.id}`)
    if (savedReviews) {
      setReviews(JSON.parse(savedReviews))
    }
  }, [trip.id])

  // Preload destination images for better performance
  useEffect(() => {
    if (destinations && destinations.length > 0) {
      preloadDestinationImages(destinations)
    }
  }, [destinations])

  // Save reviews to localStorage
  const saveReviews = (updatedReviews) => {
    localStorage.setItem(`reviews_${trip.id}`, JSON.stringify(updatedReviews))
    setReviews(updatedReviews)
  }

  const handleStarClick = (rating) => {
    setNewReview(prev => ({ ...prev, rating }))
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!newReview.rating || !newReview.text.trim() || !newReview.reviewerName.trim()) {
      alert('Please fill in all fields and select a rating.')
      return
    }

    setIsSubmitting(true)
    
    const review = {
      id: Date.now(),
      rating: newReview.rating,
      text: newReview.text.trim(),
      reviewerName: newReview.reviewerName.trim(),
      date: new Date().toISOString(),
      tripId: trip.id
    }

    const updatedReviews = [review, ...reviews]
    saveReviews(updatedReviews)
    
    setNewReview({ rating: 0, text: '', reviewerName: '' })
    setIsSubmitting(false)
  }

  const renderStars = (rating, interactive = false, onStarClick = null) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`star ${index < rating ? 'active' : ''}`}
        onClick={interactive ? () => onStarClick(index + 1) : undefined}
        style={{ cursor: interactive ? 'pointer' : 'default' }}
      >
        ★
      </span>
    ))
  }

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 0

  return (
    <div className="trip-details">
      <div className="trip-details-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={20} />
          Back to Search
        </button>
        <div className="tracker-info">
          <span className="tracker-id">Tracker ID: {tracker_info?.tracker_id}</span>
          <span className="access-count">Viewed {tracker_info?.access_count || 0} times</span>
        </div>
      </div>

      <div className="trip-header">
        <h1 className="trip-title">{trip.trip_name || 'My Trip'}</h1>
        {tracker_info?.traveler_name && (
          <p className="traveler-name">Planned by: {tracker_info.traveler_name}</p>
        )}
      </div>

      <div className="trip-info-grid">
        <div className="trip-info-card">
          <div className="info-icon">
            <MapPin size={24} />
          </div>
          <div className="info-content">
            <h3>Destination</h3>
            <p>{trip.destination || 'Philippines'}</p>
          </div>
        </div>

        <div className="trip-info-card">
          <div className="info-icon">
            <Calendar size={24} />
          </div>
          <div className="info-content">
            <h3>Trip Start Date</h3>
            <p>{tracker_info?.save_date ? formatDate(tracker_info.save_date) : (trip.start_date ? formatDate(trip.start_date) : 'Today')}</p>
            {trip.tracker_info?.start_date_formatted && trip.tracker_info?.start_date_formatted !== formatDate(tracker_info?.save_date || trip.start_date) && (
              <small className="meta-note">Saved as: {trip.tracker_info.start_date_formatted}</small>
            )}
          </div>
        </div>

        <div className="trip-info-card">
          <div className="info-icon">
            <Users size={24} />
          </div>
          <div className="info-content">
            <h3>Travelers</h3>
            <p>{trip.travelers || 1} {trip.travelers === 1 ? 'person' : 'people'}</p>
          </div>
        </div>

        <div className="trip-info-card">
          <div className="info-icon">
            <span style={{ fontSize: '24px' }}>₱</span>
          </div>
          <div className="info-content">
            <h3>Budget</h3>
            <p>{tripBudgetRange()} <span className="budget-label">(estimated)</span></p>
          </div>
        </div>
      </div>

      {/* Route Information */}
      {routeData && destinations.length > 1 && (
        <div className="route-info-section">
          <h2>🗺️ Route Information</h2>
          <div className="route-stats">
            <div className="route-stat">
              <Route size={20} />
              <span>{routeData.distanceKm || 0} km total distance</span>
            </div>
            <div className="route-stat">
              <Clock size={20} />
              <span>{Math.round(routeData.timeMin || 0)} min estimated time</span>
            </div>
            <div className="route-stat">
              <MapPin size={20} />
              <span>{destinations.length} stops planned</span>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Map */}
      {destinations.length > 0 && (
        <div className="map-section">
          <h2>🗺️ Trip Map</h2>
          <TripMap 
            destinations={destinations}
            trackerId={tracker_info?.tracker_id}
          />
        </div>
      )}

      {/* Destinations */}
      <div className="destinations-section">
        <h2>📍 Itinerary ({destinations.length} destinations)</h2>
        
        {destinations.length === 0 ? (
          <div className="no-destinations">
            <p>No destinations added to this trip yet.</p>
          </div>
        ) : (
          <div className="destinations-list">
            {destinations.map((destination, index) => (
              <div key={destination.id} className="destination-card">
                <div className="destination-number-container">
                  <div className="destination-number">
                    {index + 1}
                  </div>
                  {index === 0 && destinations.length > 1 && (
                    <span className="destination-badge start">START</span>
                  )}
                  {index === destinations.length - 1 && destinations.length > 1 && index > 0 && (
                    <span className="destination-badge end">END</span>
                  )}
                </div>
                
                <div className="destination-content-wrapper">
                  <div className="destination-header">
                    <h3>{destination.name}</h3>
                    <span className="destination-category">{destination.category}</span>
                  </div>
                  
                  <div className="destination-details-grid">
                    <div className="destination-image">
                      <img 
                        src={getDestinationImage(destination.name)}
                        alt={destination.name}
                        onError={(e) => handleImageError(e, destination.name)}
                      />
                    </div>
                    
                    <div className="destination-info">
                      {destination.city && destination.province && (
                        <p className="destination-location">
                          <MapPin size={16} />
                          {destination.city}, {destination.province}
                        </p>
                      )}
                      
                      {destination.description && (
                        <p className="destination-description">
                          {destination.description}
                        </p>
                      )}
                      
                      <div className="destination-details">
                        {destination.budget && parseFloat(destination.budget) > 0 && (
                          <div className="detail-item">
                            <span style={{ fontSize: '16px', color: '#27ae60' }}>💰</span>
                            <span>{formatDestinationBudget(destination.budget)} <span className="budget-label">(estimated)</span></span>
                          </div>
                        )}
                        
                        {destination.operating_hours && (
                          <div className="detail-item">
                            <Clock size={16} />
                            <span>{destination.operating_hours}</span>
                          </div>
                        )}
                        
                        {destination.rating && (
                          <div className="detail-item">
                            <Star size={16} />
                            <span>{destination.rating}/5</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Route segment info */}
                {routeData && index < destinations.length - 1 && (
                  <div className="route-segment">
                    <div className="route-arrow">↓</div>
                    <span className="route-segment-text">
                      Next stop: ~{Math.round((routeData.timeMin || 0) / (destinations.length - 1))} min
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trip Summary */}
      <div className="trip-summary">
        <h2>📊 Trip Summary</h2>
        <div className="summary-grid">
          <div className="summary-item">
            <div className="summary-value">{destinations.length}</div>
            <div className="summary-label">Destinations</div>
          </div>
          <div className="summary-item">
            <div className="summary-value">{tripBudgetRange()}</div>
            <div className="summary-label">Estimated Budget</div>
          </div>
          {tripDuration && (
            <div className="summary-item">
              <div className="summary-value">1</div>
              <div className="summary-label">Day</div>
              <div className="start-date-info">
                Starting: {tracker_info?.save_date ? formatDate(tracker_info.save_date) : (trip.start_date ? formatDate(trip.start_date) : 'Today')}
              </div>
            </div>
          )}
          {routeData && (
            <>
              <div className="summary-item">
                <div className="summary-value">{routeData.distanceKm || 0} km</div>
                <div className="summary-label">Total Distance</div>
              </div>
              <div className="summary-item">
                <div className="summary-value">
                  {Math.round((routeData.timeMin || 0) / 60)}h {(routeData.timeMin || 0) % 60}m
                </div>
                <div className="summary-label">Travel Time</div>
              </div>
            </>
          )}
        </div>
        <div className="budget-note">
          <small>All budget figures are estimates and may vary based on actual costs.</small>
        </div>
        <div className="trip-date-note">
          <div className="date-note-content">
            <Calendar size={16} />
            <small>
              {tracker_info?.save_date ? 
                `Trip ${new Date(tracker_info.save_date) > new Date() ? 'starts' : 'started'} on ${formatDate(tracker_info.save_date)}` : 
                (trip.start_date ? 
                  `Trip ${new Date(trip.start_date) > new Date() ? 'starts' : 'started'} on ${formatDate(trip.start_date)}` : 
                  'Trip starts today')}
              {trip.end_date ? ` and ${new Date(trip.end_date) > new Date() ? 'ends' : 'ended'} on ${formatDate(trip.end_date)}` : ''}
            </small>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="reviews-section">
        <h2>⭐ Trip Reviews {reviews.length > 0 && `(${averageRating}/5 from ${reviews.length} reviews)`}</h2>
        
        {/* Review Form */}
        <form className="review-form" onSubmit={handleSubmitReview}>
          <div className="rating-input">
            <label>Your Rating:</label>
            <div className="star-rating">
              {renderStars(newReview.rating, true, handleStarClick)}
            </div>
          </div>
          
          <input
            type="text"
            placeholder="Your name"
            value={newReview.reviewerName}
            onChange={(e) => setNewReview(prev => ({ ...prev, reviewerName: e.target.value }))}
            className="review-textarea"
            style={{ minHeight: 'auto', height: '40px', marginBottom: '1rem' }}
            required
          />
          
          <textarea
            className="review-textarea"
            placeholder="Share your experience with this trip..."
            value={newReview.text}
            onChange={(e) => setNewReview(prev => ({ ...prev, text: e.target.value }))}
            required
          />
          
          <button 
            type="submit" 
            className="submit-review-btn"
            disabled={isSubmitting || !newReview.rating || !newReview.text.trim() || !newReview.reviewerName.trim()}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>

        {/* Reviews List */}
        <div className="reviews-list">
          {reviews.length === 0 ? (
            <div className="no-reviews">
              No reviews yet. Be the first to share your experience!
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="review-item">
                <div className="review-header">
                  <span className="reviewer-name">{review.reviewerName}</span>
                  <span className="review-date">
                    {new Date(review.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="review-rating">
                  {renderStars(review.rating)}
                </div>
                <p className="review-text">{review.text}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Contact Information */}
      {tracker_info && (
        <div className="contact-info">
          <h2>📞 Contact Information</h2>
          <div className="contact-details">
            <div className="contact-item">
              <strong>Email:</strong> {tracker_info.email}
            </div>
            {tracker_info.phone && (
              <div className="contact-item">
                <strong>Phone:</strong> {tracker_info.phone}
              </div>
            )}
            <div className="contact-item">
              <strong>Created:</strong> {formatDate(tracker_info.created_at)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TripDetails 