import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { geocodeWithTracking } from '../services/api'

// Fix for default markers in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom marker icons
const createCustomIcon = (color, number) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: white;
        font-size: 14px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        ${number}
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  })
}

const TripMap = ({ destinations = [], routeData = null, trackerId = null }) => {
  const [mapDestinations, setMapDestinations] = useState([])
  const [routePoints, setRoutePoints] = useState([])
  const [mapCenter, setMapCenter] = useState([14.5995, 120.9842]) // Default to Manila
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const geocodeDestinations = async () => {
      if (!destinations || destinations.length === 0) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      const geocodedDestinations = []

      for (const destination of destinations) {
        try {
          // Check if destination already has coordinates
          if (destination.latitude && destination.longitude) {
            geocodedDestinations.push({
              ...destination,
              lat: parseFloat(destination.latitude),
              lng: parseFloat(destination.longitude)
            })
          } else {
            // Geocode the destination
            const query = destination.city && destination.province 
              ? `${destination.name}, ${destination.city}, ${destination.province}, Philippines`
              : `${destination.name}, Philippines`
            
            const result = await geocodeWithTracking(query, trackerId)
            
            if (result.success && result.results && result.results.length > 0) {
              const coords = result.results[0].point
              geocodedDestinations.push({
                ...destination,
                lat: coords.lat,
                lng: coords.lng
              })
            } else {
              // Fallback to approximate coordinates around Philippines
              geocodedDestinations.push({
                ...destination,
                lat: 14.5995 + (Math.random() - 0.5) * 2,
                lng: 120.9842 + (Math.random() - 0.5) * 2
              })
            }
          }
        } catch (error) {
          console.error('Error geocoding destination:', destination.name, error)
          // Fallback coordinates
          geocodedDestinations.push({
            ...destination,
            lat: 14.5995 + (Math.random() - 0.5) * 2,
            lng: 120.9842 + (Math.random() - 0.5) * 2
          })
        }
      }

      setMapDestinations(geocodedDestinations)

      // Set map center to first destination or center of all destinations
      if (geocodedDestinations.length > 0) {
        if (geocodedDestinations.length === 1) {
          setMapCenter([geocodedDestinations[0].lat, geocodedDestinations[0].lng])
        } else {
          // Calculate center of all destinations
          const avgLat = geocodedDestinations.reduce((sum, dest) => sum + dest.lat, 0) / geocodedDestinations.length
          const avgLng = geocodedDestinations.reduce((sum, dest) => sum + dest.lng, 0) / geocodedDestinations.length
          setMapCenter([avgLat, avgLng])
        }
      }

      // Process route data if available
      if (routeData && routeData.points && routeData.points.length > 0) {
        // Convert route points to lat/lng format
        const points = routeData.points.map(point => {
          if (Array.isArray(point)) {
            return [point[1], point[0]] // [lng, lat] to [lat, lng]
          }
          return [point.lat || point.latitude, point.lng || point.longitude]
        }).filter(point => point[0] && point[1])
        
        setRoutePoints(points)
      } else if (geocodedDestinations.length > 1) {
        // Create simple route between destinations
        const simpleRoute = geocodedDestinations.map(dest => [dest.lat, dest.lng])
        setRoutePoints(simpleRoute)
      }

      setIsLoading(false)
    }

    geocodeDestinations()
  }, [destinations, routeData, trackerId])

  const getCategoryColor = (category) => {
    const colors = {
      'Restaurant': '#e74c3c',
      'Cafe': '#f39c12',
      'Accommodation': '#9b59b6',
      'Entertainment': '#3498db',
      'Shopping': '#e67e22',
      'Historical': '#8b4513',
      'Natural': '#27ae60',
      'Beach': '#3498db',
      'Other': '#95a5a6'
    }
    return colors[category] || '#667eea'
  }

  if (isLoading) {
    return (
      <div className="trip-map-loading">
        <div className="loading-spinner"></div>
        <p>Loading map...</p>
      </div>
    )
  }

  return (
    <div className="trip-map-container">
      <MapContainer
        center={mapCenter}
        zoom={mapDestinations.length === 1 ? 15 : 11}
        style={{ height: '400px', width: '100%', borderRadius: '12px' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Route polyline */}
        {routePoints.length > 1 && (
          <Polyline
            positions={routePoints}
            color="#667eea"
            weight={4}
            opacity={0.8}
            dashArray="5, 10"
          />
        )}
        
        {/* Destination markers */}
        {mapDestinations.map((destination, index) => (
          <Marker
            key={destination.id || index}
            position={[destination.lat, destination.lng]}
            icon={createCustomIcon(getCategoryColor(destination.category), index + 1)}
          >
            <Popup>
              <div className="map-popup">
                <h4>{destination.name}</h4>
                {destination.category && (
                  <p className="popup-category">
                    <strong>Category:</strong> {destination.category}
                  </p>
                )}
                {destination.city && destination.province && (
                  <p className="popup-location">
                    <strong>Location:</strong> {destination.city}, {destination.province}
                  </p>
                )}
                {destination.description && (
                  <p className="popup-description">
                    {destination.description.length > 100 
                      ? `${destination.description.substring(0, 100)}...`
                      : destination.description
                    }
                  </p>
                )}
                {destination.budget && parseFloat(destination.budget) > 0 && (
                  <p className="popup-budget">
                    <strong>Budget:</strong> ₱{parseFloat(destination.budget).toLocaleString()}
                  </p>
                )}
                {destination.rating && (
                  <p className="popup-rating">
                    <strong>Rating:</strong> ⭐ {destination.rating}/5
                  </p>
                )}
                {destination.operating_hours && (
                  <p className="popup-hours">
                    <strong>Hours:</strong> {destination.operating_hours}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Map legend */}
      {mapDestinations.length > 0 && (
        <div className="map-legend">
          <h4>🗺️ Map Legend</h4>
          <div className="legend-items">
            {mapDestinations.map((destination, index) => (
              <div key={destination.id || index} className="legend-item">
                <div 
                  className="legend-marker"
                  style={{ 
                    backgroundColor: getCategoryColor(destination.category),
                    color: 'white',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                >
                  {index + 1}
                </div>
                <span className="legend-text">{destination.name}</span>
              </div>
            ))}
          </div>
          {routeData && (
            <div className="route-info">
              <p><strong>Total Distance:</strong> {routeData.distanceKm || 0} km</p>
              <p><strong>Estimated Time:</strong> {Math.round((routeData.timeMin || 0) / 60)}h {(routeData.timeMin || 0) % 60}m</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TripMap 