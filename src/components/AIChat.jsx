import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Minimize2, MapPin, Star, Clock, Phone } from 'lucide-react';
import { useRecommendations } from '../hooks/useRecommendations';
import { useSession } from '../context/SessionContext';
import { getDestinationImage, handleImageError, preloadDestinationImages } from '../utils/destinationImages';
import './ChatInterface.css';
import './AIChat.css';

const AIChat = ({ isOpen, onToggle, onDestinationAdd, mapInstance }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: `🌟 Hello! I'm WerTigo, your AI travel assistant for Cavite!

I can help you discover amazing destinations within Cavite. 

Try asking me:
• "Show me beautiful beaches in Naic"
• "Things to do in Tagaytay"
• "Historical Sites in Kawit"
• "Budget-friendly resorts in Ternate"

Where would you like to explore today?`,
      timestamp: new Date(),
      isWelcome: true
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const { isConnected, connectionError, retryConnection } = useSession();
  const {
    recommendations,
    loading,
    error,
    conversationResponse,
    getRecommendations,
    clearRecommendations
  } = useRecommendations();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  // Handle recommendations response
  useEffect(() => {
    if (recommendations.length > 0) {
      const botMessage = {
        id: Date.now(),
        type: 'bot',
        content: '✨ Here are some amazing places I found for you:',
        timestamp: new Date(),
        recommendations: recommendations
      };
      setMessages(prev => [...prev, botMessage]);
      
      // Preload destination images for better performance
      preloadDestinationImages(recommendations);
    }
  }, [recommendations]);

  // Handle conversational responses
  useEffect(() => {
    if (conversationResponse) {
      const botMessage = {
        id: Date.now(),
        type: 'bot',
        content: conversationResponse.message,
        timestamp: new Date(),
        conversationData: conversationResponse
      };
      setMessages(prev => [...prev, botMessage]);
    }
  }, [conversationResponse]);

  // Handle errors
  useEffect(() => {
    if (error) {
      const errorMessage = {
        id: Date.now(),
        type: 'bot',
        content: `😔 ${error}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  }, [error]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || loading || !isConnected) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Add thinking indicator
    const thinkingMessage = {
      id: Date.now() + 1,
      type: 'bot',
      content: '🤔 Let me search for the perfect places for you...',
      timestamp: new Date(),
      isThinking: true
    };
    setMessages(prev => [...prev, thinkingMessage]);

    try {
      await getRecommendations({ query: userMessage.content });
      
      // Remove thinking message
      setMessages(prev => prev.filter(msg => !msg.isThinking));
    } catch (err) {
      // Remove thinking message and show error
      setMessages(prev => prev.filter(msg => !msg.isThinking));
      console.error('Failed to get recommendations:', err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAddToTrip = (destination) => {
    if (onDestinationAdd) {
      onDestinationAdd(destination);
    }
    
    // Add confirmation message
    const confirmMessage = {
      id: Date.now(),
      type: 'bot',
      content: `✅ Great! I've added "${destination.name}" to your trip planner. You can view and organize your destinations in the planner tab.`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, confirmMessage]);
  };

  const handleShowOnMap = (destination) => {
    if (destination.latitude && destination.longitude && mapInstance) {
      mapInstance.setView([destination.latitude, destination.longitude], 15);
      // You can add a marker here if needed
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    inputRef.current?.focus();
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} size={12} className="star filled" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" size={12} className="star half" />);
    }

    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} size={12} className="star empty" />);
    }

    return stars;
  };

  const renderRecommendationCard = (destination) => (
    <div key={destination.id} className="recommendation-card">
      <div className="recommendation-header">
        <h4>{destination.name}</h4>
        <div className="recommendation-rating">
          {renderStars(destination.rating)}
          <span className="rating-value">({destination.rating})</span>
        </div>
      </div>
      
      <div className="recommendation-location">
        <MapPin size={14} />
        <span>{destination.city}, {destination.province}</span>
      </div>
      
      <div className="recommendation-category">{destination.category}</div>
      
      <div className="recommendation-image">
        <img 
          src={getDestinationImage(destination.name)}
          alt={destination.name}
          onError={(e) => handleImageError(e, destination.name)}
        />
      </div>
      
      <p className="recommendation-description">
        {destination.description.length > 120 
          ? `${destination.description.substring(0, 120)}...` 
          : destination.description}
      </p>
      
      {destination.budget && (
        <div className="recommendation-budget">
          💰 Budget: ₱{destination.budget.toLocaleString()}
        </div>
      )}
      
      {destination.operating_hours && (
        <div className="recommendation-hours">
          <Clock size={14} />
          <span>{destination.operating_hours}</span>
        </div>
      )}
      
      {destination.contact_information && (
        <div className="recommendation-contact">
          <Phone size={14} />
          <span>{destination.contact_information}</span>
        </div>
      )}
      
      <div className="recommendation-actions">
        {destination.latitude && destination.longitude && (
          <button 
            className="action-btn map-btn"
            onClick={() => handleShowOnMap(destination)}
            title="Show on Map"
          >
            <MapPin size={14} />
            Show on Map
          </button>
        )}
        <button 
          className="action-btn add-btn"
          onClick={() => handleAddToTrip(destination)}
          title="Add to Trip"
        >
          ➕ Add to Trip
        </button>
      </div>
    </div>
  );

  const renderConversationalResponse = (data) => {
    if (!data) return null;

    return (
      <div className="conversational-response">
        {data.international_query_detected && (
          <div className="international-notice">
            <div className="notice-content">
              <h4>🌍 International Travel Notice</h4>
              <p>I specialize exclusively in Philippine destinations with detailed information about beautiful places across Luzon, Visayas, and Mindanao.</p>
            </div>
          </div>
        )}

        {data.available_cities && data.available_cities.length > 0 && (
          <div className="suggestions-section">
            <h4>📍 Available Cities:</h4>
            <div className="suggestion-tags">
              {data.available_cities.slice(0, 8).map(city => (
                <button
                  key={city}
                  className="suggestion-tag"
                  onClick={() => handleSuggestionClick(`places to visit in ${city}`)}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        )}

        {data.available_categories && data.available_categories.length > 0 && (
          <div className="suggestions-section">
            <h4>🎯 Available Categories:</h4>
            <div className="suggestion-tags">
              {data.available_categories.slice(0, 8).map(category => (
                <button
                  key={category}
                  className="suggestion-tag"
                  onClick={() => handleSuggestionClick(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}

        {data.suggestions && data.suggestions.length > 0 && (
          <div className="suggestions-section">
            <h4>💡 Try asking about:</h4>
            <div className="suggestion-tags">
              {data.suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="suggestion-tag"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className={`chat-interface ${isMinimized ? 'minimized' : ''}`}>
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-header-info">
          <div className="chat-logo">🤖 WerTigo AI</div>
          <div className="chat-tagline">
            {isConnected ? '🟢 Connected' : '🔴 Offline'}
          </div>
        </div>
        <div className="chat-header-actions">
          <button 
            onClick={() => setIsMinimized(!isMinimized)}
            className="chat-header-btn"
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            <Minimize2 size={16} />
          </button>
          <button 
            onClick={onToggle}
            className="chat-header-btn"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Connection Error */}
          {!isConnected && (
            <div className="connection-error">
              <div className="error-message">
                ⚠️ {connectionError || 'Not connected to backend'}
              </div>
              <button onClick={retryConnection} className="retry-btn">
                🔄 Retry Connection
              </button>
            </div>
          )}

          {/* Messages */}
          <div className="chat-messages">
            {messages.map(message => (
              <div key={message.id} className={`message ${message.type}`}>
                <div className={`message-content ${message.isWelcome ? 'welcome-message' : ''}`}>
                  <div className="message-text">{message.content}</div>
                  
                  {/* Render recommendations */}
                  {message.recommendations && (
                    <div className="recommendations-container">
                      {message.recommendations.map(renderRecommendationCard)}
                    </div>
                  )}
                  
                  {/* Render conversational response */}
                  {message.conversationData && renderConversationalResponse(message.conversationData)}
                </div>
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chat-input-container">
            <div className="chat-input">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isConnected ? "Ask me about places in the Philippines..." : "Connect to backend first..."}
                disabled={loading || !isConnected}
              />
              <button 
                onClick={handleSendMessage}
                disabled={loading || !isConnected || !inputValue.trim()}
                className="send-button"
              >
                {loading ? '⏳' : <Send size={16} />}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AIChat; 