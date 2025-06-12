import React, { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './MapComponent.css'
import 'leaflet-arrowheads'

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

// Route Component
const RouteLayer = ({ routeData }) => {
  const map = useMap();
  const polylineRef = useRef(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [showSteps, setShowSteps] = useState(false);
  
  if (!routeData || !routeData.points || routeData.points.length < 2) return null
  
  // Transform route points for Polyline (convert from [lng, lat] to [lat, lng])
  const routePoints = routeData.points.map(point => [point[1], point[0]])
  
  // Get the route type for styling
  const routeType = routeData.source || 'direct'
  const isRoadRoute = routeType === 'graphhopper' || routeType === 'openrouteservice'
  const hasSteps = isRoadRoute && routeData.steps && routeData.steps.length > 0
  
  // Store route data on first render
  useEffect(() => {
    setRouteInfo({
      distance: routeData.distance_km,
      time: routeData.time_min,
      source: routeType,
      hasSteps: hasSteps
    });
    
    // Center the map on the route when it's loaded
    if (map && routePoints.length > 0) {
      try {
        const bounds = L.latLngBounds(routePoints);
        map.fitBounds(bounds, { 
          padding: [50, 50],
          maxZoom: 13
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
  }, [map, routeData, routePoints, routeType, hasSteps, isRoadRoute]);
  
  // Toggle steps visibility
  const toggleSteps = () => {
    setShowSteps(!showSteps);
  };
  
  // Function to decode path for Google Maps encoded polyline
  const decodePolyline = (encoded) => {
    if (!encoded) return [];
    
    const poly = [];
    let index = 0, lat = 0, lng = 0;
    
    while (index < encoded.length) {
      let b, shift = 0, result = 0;
      
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      
      const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;
      
      shift = 0;
      result = 0;
      
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      
      const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;
      
      poly.push([lat / 1e5, lng / 1e5]);
    }
    
    return poly;
  };
  
  // Apply different styling for road vs direct routes
  const polylineOptions = {
    color: isRoadRoute ? '#2980b9' : '#3498db',
    weight: isRoadRoute ? 5 : 4,
    opacity: 0.85,
    lineJoin: 'round',
    dashArray: isRoadRoute ? null : '5, 10',
  };
  
  // Calculate how many direction indicators to show based on route length
  // For road routes, use fewer indicators since the route has many points
  const directionIndicatorStep = isRoadRoute ? Math.ceil(routePoints.length / 10) : 3;
  
  return (
    <>
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
      
      {/* Direction indicators - draw small arrows along the route */}
      {routePoints.length > 2 && routePoints.map((point, index) => {
        // Skip first and last point, and only add indicators at intervals
        if (index === 0 || 
            index === routePoints.length - 1 || 
            index % directionIndicatorStep !== 0) return null;
        
        // Get direction from previous to next point
        // For better direction calculation, look 2 points ahead and behind for road routes
        const lookDistance = isRoadRoute ? 2 : 1;
        const prevIndex = Math.max(0, index - lookDistance);
        const nextIndex = Math.min(routePoints.length - 1, index + lookDistance);
        
        const prevPoint = routePoints[prevIndex];
        const nextPoint = routePoints[nextIndex];
        
        // Only add direction indicators if we have both points
        if (!prevPoint || !nextPoint) return null;
        
        // Calculate direction angle in radians
        const angle = Math.atan2(
          nextPoint[0] - prevPoint[0],
          nextPoint[1] - prevPoint[1]
        );
        
        // Create a custom arrow marker at this point
        return (
          <Marker
            key={`dir-${index}`}
            position={point}
            icon={L.divIcon({
              html: `<div class="route-arrow${isRoadRoute ? ' road-route' : ''}" style="transform: rotate(${angle}rad)">→</div>`,
              className: 'route-arrow-container',
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            })}
          />
        );
      })}
      
      {/* Road instruction markers for turns/maneuvers */}
      {isRoadRoute && hasSteps && routeData.steps.map((step, index) => {
        // Skip steps without instructions or with generic "continue" instructions
        if (!step.instruction || 
            step.instruction.toLowerCase().includes('continue') ||
            step.distance < 50) {
          return null;
        }
        
        // Get coordinates for this step (if available)
        // For simplicity, we'll place markers at specific intervals along the route
        const stepIndex = Math.floor((index + 1) * routePoints.length / (routeData.steps.length + 1));
        if (stepIndex >= routePoints.length) return null;
        
        const position = routePoints[stepIndex];
        
        return (
          <Marker
            key={`step-${index}`}
            position={position}
            icon={L.divIcon({
              html: `<div class="route-step-marker">${index + 1}</div>`,
              className: 'route-step-container',
              iconSize: [22, 22],
              iconAnchor: [11, 11]
            })}
          >
            <Popup>
              <div className="route-step-popup">
                <div className="route-step-number">{index + 1}</div>
                <div className="route-step-instruction">{step.instruction}</div>
                {step.street_name && (
                  <div className="route-step-street">{step.street_name}</div>
                )}
                <div className="route-step-distance">{(step.distance/1000).toFixed(1)} km</div>
              </div>
            </Popup>
          </Marker>
        );
      })}
      
      {/* Start marker with special styling */}
      {routePoints.length > 0 && (
        <Marker
          position={routePoints[0]}
          icon={L.divIcon({
            html: `<div class="route-terminal route-start">A</div>`,
            className: 'route-terminal-container',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          })}
        />
      )}
      
      {/* End marker with special styling */}
      {routePoints.length > 1 && (
        <Marker
          position={routePoints[routePoints.length - 1]}
          icon={L.divIcon({
            html: `<div class="route-terminal route-end">B</div>`,
            className: 'route-terminal-container',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          })}
        />
      )}
      
      {/* Route information popup at the center of the route */}
      {routeInfo && routePoints.length > 0 && (
        <Popup
          position={routePoints[Math.floor(routePoints.length / 2)]}
          className="route-info-popup"
          closeButton={false}
        >
          <div className="route-popup-content">
            <div className="route-popup-header">
              <h4>Route Information</h4>
              <span className="route-source">{isRoadRoute ? 'Road Route' : 'Direct'}</span>
            </div>
            <div className="route-popup-details">
              <p><strong>🚗 Distance:</strong> {routeInfo.distance.toFixed(1)} km</p>
              <p><strong>⏱️ Est. Time:</strong> {Math.round(routeInfo.time)} min</p>
              {isRoadRoute && (
                <p className="route-quality-note">Following actual roads via {routeType === 'graphhopper' ? 'GraphHopper' : 'OpenRouteService'}</p>
              )}
              {hasSteps && (
                <button 
                  className="route-steps-toggle" 
                  onClick={toggleSteps}
                >
                  {showSteps ? 'Hide Directions' : 'Show Directions'}
                </button>
              )}
            </div>
            
            {showSteps && hasSteps && (
              <div className="route-steps-container">
                <h5>Directions</h5>
                <div className="route-steps-list">
                  {routeData.steps.map((step, index) => (
                    <div key={`step-list-${index}`} className="route-step-item">
                      <span className="step-number">{index + 1}</span>
                      <span className="step-instruction">
                        {step.instruction}
                        {step.street_name && (
                          <span className="step-street-name"> ({step.street_name})</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Popup>
      )}
    </>
  )
}

// Component to handle map instance
const MapController = ({ onMapReady, destinations = [] }) => {
  const map = useMap()
  const mapRef = useRef(map)

  useEffect(() => {
    if (onMapReady && map) {
      onMapReady(map)
    }
  }, [map, onMapReady])

  // Handle destinations markers
  useEffect(() => {
    if (!map || !destinations || destinations.length === 0) return

    // Fit bounds to show all destinations
    if (destinations.length > 0) {
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
  }, [map, destinations])

  return null
}

const MapComponent = ({ 
  destinations = [], 
  onMapReady, 
  routeData = null,
  onCalculateRoute = null 
}) => {
  const defaultCenter = [14.5995, 120.9842] // Manila, Philippines
  const defaultZoom = 6
  const [showRouteDetails, setShowRouteDetails] = useState(false)
  const [showDirections, setShowDirections] = useState(false)

  // Filter destinations with valid coordinates
  const validDestinations = destinations.filter(dest => 
    dest.latitude && dest.longitude && 
    !isNaN(dest.latitude) && !isNaN(dest.longitude)
  )

  const handleCalculateRouteClick = () => {
    if (onCalculateRoute) {
      onCalculateRoute()
    }
  }
  
  const isRoadRoute = routeData && (routeData.source === 'graphhopper' || routeData.source === 'openrouteservice')
  const hasDirections = isRoadRoute && routeData.steps && routeData.steps.length > 0
  
  // Toggle the directions panel
  const toggleDirections = () => {
    setShowDirections(!showDirections)
    // If opening directions, also open details
    if (!showDirections && !showRouteDetails) {
      setShowRouteDetails(true)
    }
  }

  return (
    <div className="map-component">
      {/* Route Stats Panel (if route exists) */}
      {routeData && (
        <div className="route-stats-panel">
          <div className="route-stats-header">
            <span className="route-type-indicator">
              {isRoadRoute ? '🛣️ Road Route' : '📏 Direct Route'}
              {isRoadRoute && (
                <span className="route-engine">
                  {routeData.source === 'graphhopper' ? ' (GraphHopper)' : ' (OpenRouteService)'}
                </span>
              )}
            </span>
            <div className="route-header-actions">
              {hasDirections && (
                <button 
                  className="route-directions-toggle"
                  onClick={toggleDirections}
                >
                  {showDirections ? 'Hide Directions' : 'Directions'}
                </button>
              )}
              <button 
                className="route-details-toggle"
                onClick={() => setShowRouteDetails(!showRouteDetails)}
              >
                {showRouteDetails ? 'Hide Details' : 'Show Details'}
              </button>
            </div>
          </div>
          
          <div className="route-stats-content">
            <div className="route-stat-item">
              <span className="route-stat-label">Distance:</span>
              <span className="route-stat-value">{routeData.distance_km.toFixed(1)} km</span>
            </div>
            <div className="route-stat-item">
              <span className="route-stat-label">Est. Time:</span>
              <span className="route-stat-value">{Math.round(routeData.time_min)} min</span>
            </div>
          </div>
          
          {showRouteDetails && (
            <div className="route-details">
              <p className="route-details-note">
                {isRoadRoute 
                  ? 'This route follows actual roads for accurate navigation.' 
                  : 'This is a direct route and may not follow actual roads.'}
              </p>
              {isRoadRoute && (
                <div className="route-quality-indicator">
                  <div className="quality-dot high"></div>
                  <span>High Quality Road Routing</span>
                </div>
              )}
              <div className="route-point-details">
                <div className="route-point">
                  <div className="point-marker start">A</div>
                  <div className="point-name">{validDestinations[0]?.name || 'Start'}</div>
                </div>
                <div className="route-separator">→</div>
                <div className="route-point">
                  <div className="point-marker end">B</div>
                  <div className="point-name">{validDestinations[validDestinations.length-1]?.name || 'End'}</div>
                </div>
              </div>
            </div>
          )}
          
          {/* Directions panel */}
          {showDirections && hasDirections && (
            <div className="route-directions-panel">
              <h5 className="directions-title">Turn-by-turn Directions</h5>
              <div className="directions-list">
                {routeData.steps.map((step, index) => {
                  // Skip very short segments or those with generic "continue" instructions
                  if (step.distance < 50 || (
                    step.instruction && 
                    step.instruction.toLowerCase().includes('continue') && 
                    step.distance < 300)) {
                    return null;
                  }
                  
                  return (
                    <div key={`dir-${index}`} className="direction-item">
                      <div className="direction-number">{index + 1}</div>
                      <div className="direction-content">
                        <div className="direction-text">{step.instruction}</div>
                        {step.street_name && (
                          <div className="direction-street">{step.street_name}</div>
                        )}
                        <div className="direction-distance">
                          {step.distance < 1000 
                            ? `${Math.round(step.distance)} m` 
                            : `${(step.distance/1000).toFixed(1)} km`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

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
        
        {/* Route Layer - Display route between destinations */}
        {routeData && <RouteLayer routeData={routeData} />}
        
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
                  <p><strong>💰 Budget:</strong> ₱{parseFloat(destination.budget).toLocaleString()}</p>
                )}
                {destination.operating_hours && (
                    <p><strong>🕒 Hours:</strong> {destination.operating_hours}</p>
                  )}
                  {destination.description && (
                  <p><strong>📝 Description:</strong> {destination.description.slice(0, 150)}{destination.description.length > 150 ? '...' : ''}</p>
                )}
              </div>
            </Popup>
          </Marker>
          )
        })}

        {/* Map controller for handling map callbacks */}
        <MapController 
          onMapReady={onMapReady} 
          destinations={validDestinations}
        />
      </MapContainer>

      {/* No destinations message */}
      {validDestinations.length === 0 && (
        <div className="map-overlay">
          <div className="map-message">
            <h3>🗺️ Your Journey Starts Here</h3>
            <p>Add destinations from the AI chat to see them on the map!</p>
          </div>
        </div>
      )}
      
      {/* Route calculation button */}
      {validDestinations.length >= 2 && !routeData && onCalculateRoute && (
        <div className="route-info-overlay">
          <div className="route-info">
            <button 
              className="calculate-route-btn" 
              onClick={handleCalculateRouteClick}
            >
              🧭 Calculate Route
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MapComponent 