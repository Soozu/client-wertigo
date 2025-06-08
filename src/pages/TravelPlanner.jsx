import React, { useState, useEffect, useRef } from 'react'
import Header from '../components/Header'
import AIChat from '../components/AIChat'
import MapComponent from '../components/MapComponent'
import TripPlanner from '../components/TripPlanner'
import { useTrip } from '../hooks/useTrip'
import { useSession } from '../context/SessionContext'
import './TravelPlanner.css'

const TravelPlanner = () => {
  const mapRef = useRef(null)

  const { isConnected, isLoading: sessionLoading } = useSession()
  const {
    currentTrip,
    tripLoading,
    tripError,
    routeData,
    routeLoading,
    createTrip,
    addDestination,
    removeDestination,
    calculateRoute,
    loadTripFromSession,
    geocodeLocation
  } = useTrip()

  // Load saved trip on component mount
  useEffect(() => {
    if (isConnected && !sessionLoading) {
      loadTripFromSession()
    }
  }, [isConnected, sessionLoading, loadTripFromSession])

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

  const handleDestinationAdded = async (destination) => {
    try {
      // If no current trip, create one
      if (!currentTrip) {
        await createTrip({
          destination: destination.city || destination.name,
          start_date: '',
          end_date: '',
          budget: 0,
          travelers: 1,
          destinations: []
        })
      }

      // Geocode destination if it doesn't have coordinates
      let destinationWithCoords = destination;
      if (!destination.latitude || !destination.longitude) {
        try {
          const locationQuery = destination.city || destination.name || destination.location;
          const geocodeResults = await geocodeLocation(locationQuery);
          
          if (geocodeResults && geocodeResults.length > 0) {
            const firstResult = geocodeResults[0];
            destinationWithCoords = {
              ...destination,
              latitude: firstResult.lat,
              longitude: firstResult.lon,
              display_name: firstResult.display_name
            };
          }
        } catch (geocodeError) {
          console.warn('Failed to geocode destination:', geocodeError);
          // Continue with original destination even if geocoding fails
        }
      }
      
      // Add to trip
      await addDestination(destinationWithCoords)
      
      // Show on map if coordinates are available
      if (destinationWithCoords.latitude && destinationWithCoords.longitude && mapRef.current) {
        mapRef.current.setView([destinationWithCoords.latitude, destinationWithCoords.longitude], 13)
      }
    } catch (error) {
      console.error('Failed to add destination:', error)
    }
  }

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

  const handleCreateNewTrip = async () => {
    try {
      await createTrip({
        destination: 'Philippines',
        start_date: '',
        end_date: '',
        budget: 0,
        travelers: 1,
        destinations: []
      })
    } catch (error) {
      console.error('Failed to create trip:', error)
    }
  }

  const handleShareTrip = () => {
    if (currentTrip?.id) {
      const tripUrl = `${window.location.origin}/trip/${currentTrip.id}`
      navigator.clipboard.writeText(tripUrl).then(() => {
        alert('Trip link copied to clipboard! Share it with friends to let them view your itinerary.')
      }).catch(() => {
        // Fallback for browsers that don't support clipboard API
        const textArea = document.createElement('textarea')
        textArea.value = tripUrl
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        alert('Trip link copied to clipboard! Share it with friends to let them view your itinerary.')
      })
    }
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

        {sessionLoading && (
          <div className="loading-banner">
            🔄 Connecting to backend...
          </div>
        )}

        {/* Route Loading Indicator */}
        {routeLoading && (
          <div className="loading-banner">
            🗺️ Calculating route between destinations...
          </div>
        )}

        {/* Main 3-Column Grid Layout */}
        <div className="planner-grid">
          {/* Left Column - Trip Planner/Itinerary */}
          <div className="trip-section">
            <div className="trip-section-header">
              <h2>🗺️ Trip Planner</h2>
              {!currentTrip ? (
                <button 
                  className="create-trip-btn"
                  onClick={handleCreateNewTrip}
                  disabled={tripLoading || !isConnected}
                >
                  ➕ Create New Trip
                </button>
              ) : null}
            </div>
            
            {currentTrip ? (
              <TripPlanner
                trip={currentTrip}
                onDestinationRemove={handleDestinationRemoved}
                onCalculateRoute={handleCalculateRoute}
                loading={tripLoading}
                error={tripError}
                routeData={routeData}
                routeLoading={routeLoading}
              />
            ) : (
              <div className="no-trip-message">
                <div className="no-trip-content">
                  <h3>🌟 Start Your Philippine Adventure!</h3>
                  <p>Create a new trip to begin planning your journey through the beautiful islands of the Philippines.</p>
                  <p>Ask the AI assistant about destinations, and I'll help you build the perfect itinerary!</p>
                </div>
              </div>
            )}
          </div>

          {/* Center Column - Map */}
          <div className="map-section">
            <MapComponent 
              onMapReady={handleMapReady}
              destinations={currentTrip?.destinations || []}
              routeData={routeData}
              routeLoading={routeLoading}
            />
          </div>

          {/* Right Column - AI Chat */}
          <div className="chat-section">
            <AIChat
              isOpen={true}
              onToggle={() => {}} // No toggle needed in grid layout
              onDestinationAdd={handleDestinationAdded}
              mapInstance={mapRef.current}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

export default TravelPlanner 