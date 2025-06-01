import React, { useState, useRef, useEffect } from 'react'
import { Send, X, Minimize2 } from 'lucide-react'
import './ChatInterface.css'

const ChatInterface = ({ isOpen, onToggle, onTripCreated, mapInstance }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: `Awesome! Let's get this travel party started! 

To whip up your perfect trip, I just need a few details:
1. **Destination**: Where are we heading?
2. **Travel Dates**: When are you planning to go?
3. **Number of Travelers**: How many people are joining the fun?
4. **Budget**: Got a budget in mind?
5. **Interests**: Any specific activities or experiences you want to include? (e.g., adventure, relaxation, culture, food, etc.)`,
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus()
    }
  }, [isOpen, isMinimized])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      // Simulate AI response - replace with actual API call
      const response = await simulateAIResponse(userMessage.content)
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.content,
        timestamp: new Date(),
        data: response.data
      }

      setMessages(prev => [...prev, botMessage])

      // If the response contains trip data, notify parent
      if (response.data?.tripCreated) {
        onTripCreated(response.data.trip)
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const simulateAIResponse = async (userInput) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Simple keyword-based responses (replace with actual AI integration)
    const input = userInput.toLowerCase()
    
    if (input.includes('destination') || input.includes('place') || input.includes('where')) {
      return {
        content: "Great! I'd love to help you explore that destination. Could you tell me more about your travel dates and budget preferences?",
        data: null
      }
    }
    
    if (input.includes('budget') || input.includes('cost') || input.includes('price')) {
      return {
        content: "Perfect! With your budget in mind, I can suggest some amazing options. What type of activities interest you most?",
        data: null
      }
    }

    // Default response
    return {
      content: "That sounds exciting! Let me help you plan the perfect trip. Can you provide more details about your destination, dates, and preferences?",
      data: null
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleCreateNewTrip = () => {
    setMessages([
      {
        id: Date.now(),
        type: 'bot',
        content: `Let's create a new adventure! 

Please tell me:
1. **Where** would you like to go?
2. **When** are you planning to travel?
3. **How many** people will be traveling?
4. **What's your budget** range?
5. **What activities** interest you most?`,
        timestamp: new Date()
      }
    ])
  }

  if (!isOpen) return null

  return (
    <div className={`chat-interface ${isMinimized ? 'minimized' : ''}`}>
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-header-info">
          <div className="chat-logo">WerTigo</div>
          <div className="chat-tagline">Now what is your plan?</div>
        </div>
        <div className="chat-header-actions">
          <button 
            className="header-btn"
            onClick={() => setIsMinimized(!isMinimized)}
            aria-label={isMinimized ? 'Expand chat' : 'Minimize chat'}
          >
            <Minimize2 size={16} />
          </button>
          <button 
            className="header-btn"
            onClick={onToggle}
            aria-label="Close chat"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="chat-messages">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.type}`}>
                <div className="message-avatar">
                  {message.type === 'bot' && (
                    <i className="fas fa-robot"></i>
                  )}
                  {message.type === 'user' && (
                    <i className="fas fa-user"></i>
                  )}
                </div>
                <div className="message-content">
                  {message.content.split('\n').map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="message bot">
                <div className="message-avatar">
                  <i className="fas fa-robot"></i>
                </div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Create New Trip Button */}
          <button 
            className="create-trip-btn"
            onClick={handleCreateNewTrip}
          >
            Create a new trip
          </button>

          {/* Input */}
          <div className="chat-input-container">
            <div className="chat-input">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask anything, the more you share the better I can help..."
                disabled={isLoading}
              />
              <button 
                className="send-btn"
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default ChatInterface 