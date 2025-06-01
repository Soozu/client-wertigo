import React, { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './MapComponent.css'

// Fix for default markers in React Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom numbered marker icons
const createNumberedIcon = (number, isStart = false, isEnd = false) => {
  let backgroundColor = '#1da1f2'
  let textColor = 'white'
  
  if (isStart) {
    backgroundColor = '#27ae60'
  } else if (isEnd) {
    backgroundColor = '#e74c3c'
  }
  
  return L.divIcon({
    className: 'custom-numbered-marker',
    html: `
      <div style="
        background-color: ${backgroundColor}; 
        width: 32px; 
        height: 32px; 
        border-radius: 50%; 
        border: 3px solid white; 
        box-shadow: 0 3px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 14px;
        color: ${textColor};
        font-family: Arial, sans-serif;
      ">${number}</div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  })
}

// Component to handle map instance and route display
const MapController = ({ onMapReady, destinations = [], routeData = null, routeLoading = false }) => {
  const map = useMap()
  const mapRef = useRef(map)
  const routeLayerRef = useRef(null)
  const routeMarkersRef = useRef([])

  useEffect(() => {
    if (onMapReady && map) {
      onMapReady(map)
    }
  }, [map, onMapReady])

  // Handle route display
  useEffect(() => {
    if (!map) return

    // Remove existing route layer and markers
    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current)
      routeLayerRef.current = null
    }

    // Remove existing route markers
    routeMarkersRef.current.forEach(marker => {
      map.removeLayer(marker)
    })
    routeMarkersRef.current = []

    // Add new route layer if route data exists
    if (routeData && routeData.points && routeData.points.length > 0) {
      const routeCoords = routeData.points.map(point => [point[1], point[0]]) // Convert lng,lat to lat,lng
      
      // Different styling based on route source
      const isRoadBased = routeData.source === 'openrouteservice' || routeData.source === 'osrm'
      const isFallback = routeData.fallback
      
      // Create main route line with appropriate styling
      const routeStyle = {
        color: isRoadBased ? '#1da1f2' : (isFallback ? '#ff9800' : '#1da1f2'),
        weight: isRoadBased ? 6 : 4,
        opacity: isRoadBased ? 0.9 : 0.7,
        smoothFactor: 1,
        lineCap: 'round',
        lineJoin: 'round',
        dashArray: isFallback ? '10, 5' : null
      }
      
      // Add a subtle shadow/outline effect
      const shadowRoute = L.polyline(routeCoords, {
        color: '#ffffff',
        weight: routeStyle.weight + 3,
        opacity: 0.6,
        smoothFactor: 1,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map)

      routeLayerRef.current = L.polyline(routeCoords, routeStyle).addTo(map)

      // Bring main route to front
      routeLayerRef.current.bringToFront()

      // Fit map to route bounds with padding
      const bounds = L.latLngBounds(routeCoords)
      map.fitBounds(bounds, { 
        padding: [30, 30],
        maxZoom: 12
      })
    }

    // Cleanup function
    return () => {
      if (routeLayerRef.current && map) {
        map.removeLayer(routeLayerRef.current)
      }
      routeMarkersRef.current.forEach(marker => {
        if (map) map.removeLayer(marker)
      })
    }
  }, [map, routeData])

  // Handle destinations markers
  useEffect(() => {
    if (!map || !destinations || destinations.length === 0) return

    // Fit bounds to show all destinations if no route is displayed
    if (!routeData && destinations.length > 0) {
      const validDestinations = destinations.filter(dest => dest.latitude && dest.longitude)
      if (validDestinations.length > 0) {
        const bounds = L.latLngBounds(
          validDestinations.map(dest => [dest.latitude, dest.longitude])
      )
        map.fitBounds(bounds, { 
          padding: [30, 30],
          maxZoom: 12
        })
      }
    }
  }, [map, destinations, routeData])

  return null
}

const MapComponent = ({ destinations = [], onMapReady, routeData = null, routeLoading = false }) => {
  const defaultCenter = [14.5995, 120.9842] // Manila, Philippines
  const defaultZoom = 6

  // Filter destinations with valid coordinates
  const validDestinations = destinations.filter(dest => 
    dest.latitude && dest.longitude && 
    !isNaN(dest.latitude) && !isNaN(dest.longitude)
  )

  return (
    <div className="map-component">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%', minHeight: '400px' }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Render destination markers with numbers */}
        {validDestinations.map((destination, index) => {
          const isStart = index === 0
          const isEnd = index === validDestinations.length - 1 && validDestinations.length > 1
          
          return (
          <Marker
            key={destination.id || index}
            position={[destination.latitude, destination.longitude]}
              icon={createNumberedIcon(index + 1, isStart, isEnd)}
          >
            <Popup>
              <div className="map-popup">
                  <div className="popup-header">
                <h3>{destination.name}</h3>
                    <span className="popup-number">#{index + 1}</span>
                  </div>
                  <p><strong>📍 Location:</strong> {destination.city}, {destination.province}</p>
                {destination.category && (
                    <p><strong>🏷️ Category:</strong> {destination.category}</p>
                )}
                {destination.rating && (
                    <p><strong>⭐ Rating:</strong> {destination.rating}/5</p>
                )}
                {destination.budget && (
                    <p><strong>💰 Budget:</strong> ₱{destination.budget.toLocaleString()}</p>
                )}
                {destination.operating_hours && (
                    <p><strong>🕒 Hours:</strong> {destination.operating_hours}</p>
                  )}
                  {destination.description && (
                    <p><strong>📝 Description:</strong> {destination.description}</p>
                )}
              </div>
            </Popup>
          </Marker>
          )
        })}

        {/* Map controller for handling route and callbacks */}
        <MapController 
          onMapReady={onMapReady} 
          destinations={validDestinations}
          routeData={routeData}
          routeLoading={routeLoading}
        />
      </MapContainer>
      
      {/* Route info display */}
      {routeData && (
        <div className="route-info">
          <div className="route-stats">
            <div className="route-stat">
              <span className="route-icon">📍</span>
              <span className="route-label">Distance:</span>
              <span className="route-value">{routeData.distance_km} km</span>
            </div>
            <div className="route-stat">
              <span className="route-icon">⏱️</span>
              <span className="route-label">Est. Time:</span>
              <span className="route-value">{Math.round(routeData.time_min)} min</span>
            </div>
            <div className="route-stat">
              <span className="route-icon">🚗</span>
              <span className="route-label">Stops:</span>
              <span className="route-value">{validDestinations.length}</span>
            </div>
            {routeData.source && (
              <div className="route-stat">
                <span className="route-icon">🛣️</span>
                <span className="route-label">Route:</span>
                <span className="route-value">
                  {routeData.source === 'openrouteservice' && 'Road-based'}
                  {routeData.source === 'osrm' && 'Road-based'}
                  {routeData.fallback && 'Estimated'}
            </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Route loading indicator */}
      {routeLoading && (
        <div className="route-loading">
          <div className="loading-spinner"></div>
          <span>Calculating route...</span>
        </div>
      )}

      {/* No destinations message */}
      {validDestinations.length === 0 && (
        <div className="map-overlay">
          <div className="map-message">
            <h3>🗺️ Your Journey Starts Here</h3>
            <p>Add destinations from the AI chat to see them on the map!</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default MapComponent 