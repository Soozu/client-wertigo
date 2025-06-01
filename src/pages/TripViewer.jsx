import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import MapComponent from '../components/MapComponent'
import TripPlanner from '../components/TripPlanner'
import { useTrip } from '../hooks/useTrip'
import { useSession } from '../context/SessionContext'
import './TravelPlanner.css'

const TripViewer = () => {
  const { tripId } = useParams()
  const navigate = useNavigate()
  const mapRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const { isConnected, isLoading: sessionLoading } = useSession()
  const {
    currentTrip,
    tripLoading,
    tripError,
    routeData,
    routeLoading,
    loadTrip,
    removeDestination,
    calculateRoute,
    clearTrip
  } = useTrip()

  // Load trip when component mounts or tripId changes
  useEffect(() => {
    const loadTripData = async () => {
      if (!tripId) {
        setError('No trip ID provided')
        setLoading(false)
        return
      }

      if (!isConnected && !sessionLoading) {
        setError('Backend not connected')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        await loadTrip(tripId)
      } catch (err) {
        console.error('Failed to load trip:', err)
        setError(err.message || 'Failed to load trip')
      } finally {
        setLoading(false)
      }
    }

    if (isConnected && !sessionLoading) {
      loadTripData()
    }
  }, [tripId, isConnected, sessionLoading, loadTrip])

  // Auto-calculate route when destinations change
  useEffect(() => {
    const autoCalculateRoute = async () => {
      if (currentTrip?.destinations && currentTrip.destinations.length >= 2) {
        try {
          await calculateRoute()
        } catch (error) {
          console.log('Auto-route calculation skipped:', error.message)
        }
      }
    }

    // Debounce route calculation to avoid too many API calls
    const timeoutId = setTimeout(autoCalculateRoute, 1000)
    return () => clearTimeout(timeoutId)
  }, [currentTrip?.destinations, calculateRoute])

  const handleDestinationRemoved = async (destinationId) => {
    try {
      await removeDestination(destinationId)
    } catch (error) {
      console.error('Failed to remove destination:', error)
    }
  }

  const handleCalculateRoute = async () => {
    try {
      const route = await calculateRoute()
      
      // Display route on map
      if (route && mapRef.current) {
        console.log('Route calculated:', route)
        // The MapComponent will automatically display the route via routeData prop
      }
    } catch (error) {
      console.error('Failed to calculate route:', error)
    }
  }

  const handleMapReady = (mapInstance) => {
    mapRef.current = mapInstance
  }

  const handleBackToPlanner = () => {
    clearTrip()
    navigate('/planner')
  }

  const handleCopyLink = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url).then(() => {
      alert('Trip link copied to clipboard!')
    }).catch(() => {
      alert('Failed to copy link')
    })
  }

  if (sessionLoading || loading) {
    return (
      <div className="travel-planner">
        <Header />
        <main className="planner-main">
          <div className="loading-banner">
            🔄 Loading trip...
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="travel-planner">
        <Header />
        <main className="planner-main">
          <div className="error-banner">
            ❌ {error}
            <button 
              className="btn-link"
              onClick={handleBackToPlanner}
              style={{ marginLeft: '10px' }}
            >
              Go to Trip Planner
            </button>
          </div>
        </main>
      </div>
    )
  }

  if (!currentTrip) {
    return (
      <div className="travel-planner">
        <Header />
        <main className="planner-main">
          <div className="error-banner">
            ❌ Trip not found
            <button 
              className="btn-link"
              onClick={handleBackToPlanner}
              style={{ marginLeft: '10px' }}
            >
              Go to Trip Planner
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="travel-planner">
      <Header />
      
      <main className="planner-main">
        {/* Connection Status */}
        {!isConnected && !sessionLoading && (
          <div className="connection-banner">
            ⚠️ Backend not connected. Please ensure the Flask server is running on localhost:5000
          </div>
        )}

        {/* Trip Header */}
        <div className="trip-viewer-header">
          <div className="trip-viewer-info">
            <h1>🗺️ {currentTrip.trip_name || 'Trip Planner'}</h1>
            <p className="trip-id">Trip ID: {tripId}</p>
            {currentTrip.destination && (
              <p className="trip-destination">📍 {currentTrip.destination}</p>
            )}
          </div>
          <div className="trip-viewer-actions">
            <button 
              className="btn-secondary"
              onClick={handleCopyLink}
              title="Copy trip link to share"
            >
              🔗 Share Trip
            </button>
            <button 
              className="btn-primary"
              onClick={handleBackToPlanner}
              title="Go back to trip planner"
            >
              ✏️ Edit Trip
            </button>
          </div>
        </div>

        {/* Route Loading Indicator */}
        {routeLoading && (
          <div className="loading-banner">
            🗺️ Calculating route between destinations...
          </div>
        )}

        {/* Main 2-Column Grid Layout (no chat for viewer) */}
        <div className="trip-viewer-grid">
          {/* Left Column - Trip Details */}
          <div className="trip-section">
            <TripPlanner
              trip={currentTrip}
              onDestinationRemove={handleDestinationRemoved}
              onCalculateRoute={handleCalculateRoute}
              loading={tripLoading}
              error={tripError}
              routeData={routeData}
              routeLoading={routeLoading}
              readOnly={true} // Make it read-only for viewer
            />
          </div>

          {/* Right Column - Map */}
          <div className="map-section">
            <MapComponent 
              onMapReady={handleMapReady}
              destinations={currentTrip?.destinations || []}
              routeData={routeData}
              routeLoading={routeLoading}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

export default TripViewer 