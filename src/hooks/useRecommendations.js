import { useState, useEffect, useCallback } from 'react';
import { recommendationsAPI } from '../services/api';

export const useRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conversationResponse, setConversationResponse] = useState(null);

  // Load cities and categories on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [citiesData, categoriesData] = await Promise.all([
          recommendationsAPI.getCities(),
          recommendationsAPI.getCategories()
        ]);
        setCities(citiesData);
        setCategories(categoriesData);
      } catch (err) {
        console.error('Failed to load initial data:', err);
        setError('Failed to load cities and categories');
      }
    };

    loadInitialData();
  }, []);

  // Get recommendations based on query
  const getRecommendations = useCallback(async (queryParams) => {
    setLoading(true);
    setError(null);
    setConversationResponse(null);
    
    try {
      const response = await recommendationsAPI.getRecommendations(queryParams);
      
      if (response.is_conversation) {
        // Handle conversational responses (no results, suggestions, etc.)
        setConversationResponse(response);
        setRecommendations([]);
      } else {
        // Handle normal recommendations
        setRecommendations(response.recommendations || []);
        setConversationResponse(null);
      }
      
      return response;
    } catch (err) {
      console.error('Failed to get recommendations:', err);
      setError(err.response?.data?.message || 'Failed to get recommendations');
      setRecommendations([]);
      setConversationResponse(null);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear recommendations
  const clearRecommendations = useCallback(() => {
    setRecommendations([]);
    setConversationResponse(null);
    setError(null);
  }, []);

  return {
    recommendations,
    cities,
    categories,
    loading,
    error,
    conversationResponse,
    getRecommendations,
    clearRecommendations
  };
}; 