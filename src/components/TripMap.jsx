import React, { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-arrowheads'
import { getDestinationImage, handleImageError } from '../utils/destinationImages'
import { routeAPI } from '../services/api'
import './TripMap.css'

// Fix for default markers in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Route Component that handles rendering the route line
const RouteLayer = ({ routeData }) => {
  const map = useMap();
  const polylineRef = useRef(null);
  
  if (!routeData || !routeData.points || routeData.points.length < 2) return null;
  
  // Transform route points for Polyline (convert from [lng, lat] to [lat, lng])
  const routePoints = routeData.points.map(point => [point[1], point[0]]);
  
  // Get the route type for styling
  const routeType = routeData.source || 'direct';
  const isRoadRoute = routeType === 'graphhopper' || routeType === 'openrouteservice';
  
  // Center the map on the route when it's loaded
  useEffect(() => {
    if (map && routePoints.length > 0) {
      try {
        const bounds = L.latLngBounds(routePoints);
        map.fitBounds(bounds, { 
          padding: [50, 50],
          maxZoom: 12
        });
      } catch (e) {
        console.error('Error fitting bounds to route:', e);
      }
    }
    
    // Add arrowheads to polyline after it's rendered
    if (polylineRef.current && isRoadRoute) {
      const polyline = polylineRef.current.getElement();
      if (polyline && polyline.arrowheads) {
        // Remove any existing arrowheads first
        polyline.arrowheads(false);
      }
      
      // Add new arrowheads
      if (polyline) {
        try {
          polyline.arrowheads({
            frequency: '100px',
            size: '10px',
            fill: true,
            yawn: 40
          });
        } catch (e) {
          console.error('Error adding arrowheads:', e);
        }
      }
    }
  }, [map, routePoints, isRoadRoute]);
  
  // Apply different styling for road vs direct routes
  const polylineOptions = {
    color: isRoadRoute ? '#2980b9' : '#3498db',
    weight: isRoadRoute ? 5 : 4,
    opacity: 0.85,
    lineJoin: 'round',
    dashArray: isRoadRoute ? null : '5, 10',
  };
  
  return (
    <>
      {/* Shadow line for better visibility */}
      {isRoadRoute && (
        <Polyline 
          positions={routePoints}
          pathOptions={{ 
            color: '#fff',
            weight: 8,
            opacity: 0.3,
            lineJoin: 'round',
            dashArray: null
          }}
        />
      )}
      
      {/* Main route line with arrowheads */}
      <Polyline 
        ref={polylineRef}
        positions={routePoints}
        pathOptions={polylineOptions}
        eventHandlers={{
          add: (e) => {
            if (isRoadRoute) {
              const polyline = e.target;
              polyline.arrowheads({
                frequency: '200px', 
                size: '12px',
                fill: true,
                yawn: 40
              });
            }
          }
        }}
      />
    </>
  );
};

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

const TripMap = ({ destinations = [], trackerId = null }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [mapDestinations, setMapDestinations] = useState([])
  const [mapCenter, setMapCenter] = useState([14.5995, 120.9842]) // Manila, Philippines
  const [mapZoom, setMapZoom] = useState(6)
  const [routeData, setRouteData] = useState(null)
  const [routeLoading, setRouteLoading] = useState(false)
  const [routeError, setRouteError] = useState(null)
  const mapRef = useRef(null)

  // Process destinations and geocode if needed
  useEffect(() => {
    async function geocodeDestinations() {
      setIsLoading(true)
      
      // Filter destinations with valid coordinates
      const validDestinations = destinations.filter(dest => {
        return dest.latitude && dest.longitude && 
               !isNaN(parseFloat(dest.latitude)) && 
               !isNaN(parseFloat(dest.longitude))
      }).map(dest => ({
        ...dest,
        lat: parseFloat(dest.latitude),
        lng: parseFloat(dest.longitude),
        name: dest.name || '',
        category: dest.category || 'Other',
        city: dest.city || '',
        province: dest.province || '',
        description: dest.description || '',
        budget: dest.budget || 0,
        rating: dest.rating || 0
      }))
      
      setMapDestinations(validDestinations)
      
      // Center map on destinations
      if (validDestinations.length > 0) {
        if (validDestinations.length === 1) {
          setMapCenter([validDestinations[0].lat, validDestinations[0].lng])
          setMapZoom(14)
        } else {
          // Calculate center of all destinations
          const avgLat = validDestinations.reduce((sum, dest) => sum + dest.lat, 0) / validDestinations.length
          const avgLng = validDestinations.reduce((sum, dest) => sum + dest.lng, 0) / validDestinations.length
          setMapCenter([avgLat, avgLng])
          setMapZoom(10)
        }
        
        // Auto-calculate route if there are at least 2 destinations
        if (validDestinations.length >= 2) {
          calculateRoute(validDestinations);
        }
      }

      setIsLoading(false)
    }

    geocodeDestinations()
  }, [destinations])
  
  // Calculate route between destinations
  const calculateRoute = async (dests) => {
    if (!dests || dests.length < 2) {
      setRouteError('At least 2 destinations with coordinates are required');
      return;
    }
    
    setRouteLoading(true);
    setRouteError(null);
    
    try {
      // Prepare points for route calculation
      const points = dests.map(dest => ({
        lat: dest.lat,
        lng: dest.lng,
        name: dest.name
      }));
      
      // Call the route API
      const route = await routeAPI.calculateRoute(points);
      setRouteData(route);
      
      return route;
    } catch (error) {
      console.error('Failed to calculate route:', error);
      setRouteError(error.message || 'Failed to calculate route');
    } finally {
      setRouteLoading(false);
    }
  };
  
  // Retry route calculation
  const handleRetryRoute = () => {
    calculateRoute(mapDestinations);
  };

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
        <p>Loading map...</p>
      </div>
    )
  }

  return (
    <div className="trip-map-container">
      {/* Route controls */}
      {mapDestinations.length >= 2 && (
        <div className="route-controls">
          <button 
            className="route-btn" 
            onClick={handleRetryRoute}
            disabled={routeLoading}
          >
            {routeLoading ? 'Calculating Route...' : routeData ? 'Recalculate Route' : 'Calculate Route'}
          </button>
          
          {routeError && (
            <div className="route-error">
              {routeError}
              <button className="retry-btn" onClick={handleRetryRoute}>Retry</button>
            </div>
          )}
          
          {routeData && (
            <div className="route-info">
              <span className="route-distance">Distance: {routeData.distance_km.toFixed(1)} km</span>
              <span className="route-time">Time: {Math.round(routeData.time_min)} min</span>
              <span className="route-type">
                {routeData.source === 'graphhopper' ? 'Road Route (GraphHopper)' : 
                 routeData.source === 'openrouteservice' ? 'Road Route (ORS)' : 'Direct Route'}
              </span>
            </div>
          )}
        </div>
      )}

      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '400px', width: '100%', borderRadius: '12px' }}
        scrollWheelZoom={true}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Route layer if route data exists */}
        {routeData && <RouteLayer routeData={routeData} />}
        
        {/* Destination markers */}
        {mapDestinations.map((destination, index) => (
          <Marker
            key={destination.id || index}
            position={[destination.lat, destination.lng]}
            icon={createCustomIcon(getCategoryColor(destination.category), index + 1)}
          >
            <Popup>
              <div className="marker-popup">
                <h4>{destination.name}</h4>
                <p><strong>Category:</strong> {destination.category}</p>
                {destination.city && destination.province && (
                  <p><strong>Location:</strong> {destination.city}, {destination.province}</p>
                )}
                {destination.description && (
                  <p><strong>Description:</strong> {destination.description.substring(0, 100)}{destination.description.length > 100 ? '...' : ''}</p>
                )}
                {destination.budget && parseFloat(destination.budget) > 0 && (
                  <p><strong>Budget:</strong> ₱{parseFloat(destination.budget).toLocaleString()}</p>
                )}
                {destination.operating_hours && (
                  <p><strong>Hours:</strong> {destination.operating_hours}</p>
                )}
                {destination.rating && (
                  <p><strong>Rating:</strong> ⭐ {destination.rating}/5</p>
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
        </div>
      )}
    </div>
  )
}

export default TripMap 