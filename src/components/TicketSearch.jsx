import React, { useState } from 'react'
import { Search, Mail, Ticket } from 'lucide-react'
import './TicketSearch.css'

const TicketSearch = ({ onSearch, isLoading, error }) => {
  const [ticketId, setTicketId] = useState('')
  const [email, setEmail] = useState('')
  const [emailForList, setEmailForList] = useState('')

  const handleTicketSearch = (e) => {
    e.preventDefault()
    if (!ticketId.trim()) return
    
    onSearch({ ticketId: ticketId.trim() })
  }

  const handleEmailSearch = (e) => {
    e.preventDefault()
    if (!emailForList.trim()) return
    
    onSearch({ email: emailForList.trim() })
  }

  return (
    <div className="ticket-search">
      <div className="search-form">
        <h2>Track Your Ticket</h2>
        <p>Enter your ticket ID to view your travel details and status.</p>
        
        <form onSubmit={handleTicketSearch}>
          <div className="form-group">
            <label htmlFor="ticketId">
              <Ticket size={16} />
              Ticket ID
            </label>
            <input
              id="ticketId"
              type="text"
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value)}
              placeholder="Enter your ticket ID (e.g., WTO-ABC123)"
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">
              <Mail size={16} />
              Email Address (optional)
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={isLoading}
            />
          </div>
          
          <button 
            type="submit" 
            className="search-btn"
            disabled={!ticketId.trim() || isLoading}
          >
            <Search size={16} />
            {isLoading ? 'Searching...' : 'Track Ticket'}
          </button>
        </form>
        
        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-triangle"></i>
            {error}
          </div>
        )}
      </div>

      <div className="email-search-form">
        <h3>Find All Your Tickets</h3>
        <form onSubmit={handleEmailSearch}>
          <div className="form-group">
            <label htmlFor="emailList">
              <Mail size={16} />
              Email Address
            </label>
            <input
              id="emailList"
              type="email"
              value={emailForList}
              onChange={(e) => setEmailForList(e.target.value)}
              placeholder="Enter your email address"
              disabled={isLoading}
            />
          </div>
          
          <button 
            type="submit" 
            className="search-btn secondary"
            disabled={!emailForList.trim() || isLoading}
          >
            <Search size={16} />
            {isLoading ? 'Searching...' : 'View All Tickets'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default TicketSearch 