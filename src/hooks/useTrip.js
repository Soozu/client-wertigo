import { useState, useCallback } from 'react';
import { tripAPI, routeAPI, geocodingAPI } from '../services/api';

export const useTrip = () => {
  const [currentTrip, setCurrentTrip] = useState(null);
  const [tripLoading, setTripLoading] = useState(false);
  const [tripError, setTripError] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);

  // Create a new trip
  const createTrip = useCallback(async (tripData) => {
    setTripLoading(true);
    setTripError(null);
    
    try {
      const response = await tripAPI.createTrip(tripData);
      
      if (response.success && response.trip) {
        setCurrentTrip(response.trip);
      
      // Store trip ID in session storage for persistence
      sessionStorage.setItem('current_trip_id', response.trip_id);
        
        // Set route data if available
        if (response.trip.route_data) {
          setRouteData(response.trip.route_data);
        }
      
      return response;
      } else {
        throw new Error(response.message || 'Failed to create trip');
      }
    } catch (err) {
      console.error('Failed to create trip:', err);
      setTripError(err.response?.data?.message || err.message || 'Failed to create trip');
      throw err;
    } finally {
      setTripLoading(false);
    }
  }, []);

  // Load an existing trip
  const loadTrip = useCallback(async (tripId) => {
    setTripLoading(true);
    setTripError(null);
    
    try {
      const response = await tripAPI.getTrip(tripId);
      
      if (response.success && response.trip) {
        setCurrentTrip(response.trip);
      sessionStorage.setItem('current_trip_id', tripId);
        
        // Set route data if available
        if (response.trip.route_data) {
          setRouteData(response.trip.route_data);
        }
        
        return response.trip;
      } else {
        throw new Error(response.message || 'Trip not found');
      }
    } catch (err) {
      console.error('Failed to load trip:', err);
      setTripError(err.response?.data?.message || err.message || 'Failed to load trip');
      throw err;
    } finally {
      setTripLoading(false);
    }
  }, []);

  // Update trip data
  const updateTrip = useCallback(async (updateData) => {
    if (!currentTrip?.id) {
      throw new Error('No current trip to update');
    }
    
    setTripLoading(true);
    setTripError(null);
    
    try {
      const response = await tripAPI.updateTrip(currentTrip.id, updateData);
      
      if (response.success && response.trip) {
        setCurrentTrip(response.trip);
        
        // Update route data if available
        if (response.trip.route_data) {
          setRouteData(response.trip.route_data);
        }
        
      return response;
      } else {
        throw new Error(response.message || 'Failed to update trip');
      }
    } catch (err) {
      console.error('Failed to update trip:', err);
      setTripError(err.response?.data?.message || err.message || 'Failed to update trip');
      throw err;
    } finally {
      setTripLoading(false);
    }
  }, [currentTrip?.id]);

  // Add destination to trip
  const addDestination = useCallback(async (destination) => {
    if (!currentTrip) {
      throw new Error('No current trip');
    }

    try {
      const response = await tripAPI.addDestinationToTrip(currentTrip.id, destination);
      
      if (response.success && response.trip) {
        setCurrentTrip(response.trip);
        
        // Update route data if available
        if (response.trip.route_data) {
          setRouteData(response.trip.route_data);
        }
        
        return response.destination_id;
      } else {
        throw new Error(response.message || 'Failed to add destination');
      }
    } catch (err) {
      console.error('Failed to add destination:', err);
      throw err;
    }
  }, [currentTrip]);

  // Remove destination from trip
  const removeDestination = useCallback(async (destinationId) => {
    if (!currentTrip?.id) {
      throw new Error('No current trip');
    }

    try {
      const response = await tripAPI.removeDestinationFromTrip(currentTrip.id, destinationId);
      
      if (response.success && response.trip) {
        setCurrentTrip(response.trip);
        
        // Update route data if available
        if (response.trip.route_data) {
          setRouteData(response.trip.route_data);
        } else {
          // Clear route data if no destinations left or less than 2
          if (!response.trip.destinations || response.trip.destinations.length < 2) {
            setRouteData(null);
          }
        }
        
      return destinationId;
      } else {
        throw new Error(response.message || 'Failed to remove destination');
      }
    } catch (err) {
      console.error('Failed to remove destination:', err);
      throw err;
    }
  }, [currentTrip]);

  // Calculate route between destinations
  const calculateRoute = useCallback(async (destinations = null) => {
    const routeDestinations = destinations || currentTrip?.destinations;
    
    if (!routeDestinations || routeDestinations.length < 2) {
      throw new Error('At least 2 destinations required for route calculation');
    }

    setRouteLoading(true);
    
    try {
      // Prepare points for route calculation
      const points = routeDestinations
        .filter(dest => dest.latitude && dest.longitude)
        .map(dest => ({
          lat: dest.latitude,
          lng: dest.longitude,
          name: dest.name
        }));

      if (points.length < 2) {
        throw new Error('Not enough destinations with coordinates');
      }

      // Include trip_id in route calculation to save to database
      const routeData = {
        points: points,
        trip_id: currentTrip?.id
      };

      const route = await routeAPI.calculateRoute(routeData);
      setRouteData(route);
      return route;
    } catch (err) {
      console.error('Failed to calculate route:', err);
      setTripError(err.response?.data?.message || err.message || 'Failed to calculate route');
      throw err;
    } finally {
      setRouteLoading(false);
    }
  }, [currentTrip?.destinations, currentTrip?.id]);

  // Geocode a location and add coordinates to destination
  const geocodeDestination = useCallback(async (destination) => {
    try {
      const locationQuery = `${destination.name}, ${destination.city || ''}`;
      const results = await geocodingAPI.geocodeLocation(locationQuery);
      
      if (results && results.length > 0) {
        const { lat, lng } = results[0].point;
        return {
          ...destination,
          latitude: lat,
          longitude: lng
        };
      }
      
      return destination;
    } catch (err) {
      console.error('Failed to geocode destination:', err);
      return destination; // Return original destination if geocoding fails
    }
  }, []);

  // Clear current trip
  const clearTrip = useCallback(() => {
    setCurrentTrip(null);
    setRouteData(null);
    setTripError(null);
    sessionStorage.removeItem('current_trip_id');
  }, []);

  // Load trip from session storage on page refresh
  const loadSavedTrip = useCallback(async () => {
    const savedTripId = sessionStorage.getItem('current_trip_id');
    if (savedTripId) {
      try {
        await loadTrip(savedTripId);
      } catch (err) {
        console.log('Failed to load saved trip, clearing session');
        sessionStorage.removeItem('current_trip_id');
      }
    }
  }, [loadTrip]);

  // Get all user trips
  const getUserTrips = useCallback(async () => {
    try {
      const response = await tripAPI.getUserTrips();
      
      if (response.success) {
        return response.trips;
      } else {
        throw new Error(response.message || 'Failed to get trips');
      }
    } catch (err) {
      console.error('Failed to get user trips:', err);
      throw err;
    }
  }, []);

  return {
    // State
    currentTrip,
    tripLoading,
    tripError,
    routeData,
    routeLoading,
    
    // Actions
    createTrip,
    loadTrip,
    updateTrip,
    addDestination,
    removeDestination,
    calculateRoute,
    geocodeDestination,
    clearTrip,
    loadSavedTrip,
    getUserTrips
  };
}; 