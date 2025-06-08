import React, { useState } from 'react'
import Header from '../components/Header'
import TicketSearch from '../components/TicketSearch'
import TicketDetails from '../components/TicketDetails'
import TicketList from '../components/TicketList'

import TripDetails from '../components/TripDetails'
import { searchTicket } from '../services/ticketApi'
import './TicketTracker.css'

const TicketTracker = () => {
  const [searchResults, setSearchResults] = useState(null)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')


  const handleTicketSearch = async (searchData) => {
    setIsLoading(true)
    setError('')
    
    try {
      const result = await searchTicket(searchData.ticketId, searchData.email)
      
      if (result.success) {
        if (result.type === 'trip' && result.trip) {
          // Trip tracker found
          setSelectedTrip(result.trip)
          setSelectedTicket(null)
          setSearchResults(null)
        } else if (result.type === 'ticket' && result.ticket) {
          // Regular ticket found
          setSelectedTicket(result.ticket)
          setSelectedTrip(null)
        setSearchResults(null)
        } else if (result.type === 'email_search') {
          // Email search results
          setSearchResults({
            tickets: result.tickets || [],
            tripTrackers: result.trip_trackers || []
          })
          setSelectedTicket(null)
          setSelectedTrip(null)
        } else if (result.tickets) {
          // Legacy format support
          setSearchResults({ tickets: result.tickets, tripTrackers: [] })
          setSelectedTicket(null)
          setSelectedTrip(null)
        }
      } else {
        throw new Error(result.error || 'Not found')
      }
    } catch (err) {
      setError(err.message)
      setSearchResults(null)
      setSelectedTicket(null)
      setSelectedTrip(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTicketSelect = (ticket) => {
    setSelectedTicket(ticket)
    setSearchResults(null)
  }

  const handleBackToSearch = () => {
    setSelectedTicket(null)
    setSelectedTrip(null)
    setSearchResults(null)
    setError('')
  }



  return (
    <div className="ticket-tracker">
      <Header />
      
      <main className="tracker-main">
        <div className="container">
          <section className="tracker-section">
            <div className="tracker-header">
              <h1 className="tracker-title">Travel Ticket Tracker</h1>
            </div>
            
            <div className={`tracker-container ${selectedTrip ? 'trip-details-view' : ''}`}>


              {/* Search Form */}
              <div className="tracker-form-section">
                <TicketSearch 
                  onSearch={handleTicketSearch}
                  isLoading={isLoading}
                  error={error}
                />
              </div>
              
              {/* Results Section */}
              <div className={`tracker-results-section ${selectedTrip ? 'trip-details-view' : ''}`}>
                {isLoading && (
                  <div className="loading-state">
                    <i className="fas fa-spinner fa-spin"></i>
                    <p>Searching for your ticket...</p>
                  </div>
                )}

                {error && (
                  <div className="error-state">
                    <i className="fas fa-exclamation-triangle"></i>
                    <p>{error}</p>
                    <button 
                      className="btn btn-secondary"
                      onClick={handleBackToSearch}
                    >
                      Try Again
                    </button>
                  </div>
                )}

                {selectedTicket && (
                  <TicketDetails 
                    ticket={selectedTicket}
                    onBack={handleBackToSearch}
                  />
                )}

                {selectedTrip && (
                  <TripDetails 
                    trip={selectedTrip}
                    onBack={handleBackToSearch}
                    context="tracker"
                  />
                )}

                {searchResults && (
                  <TicketList 
                    tickets={searchResults.tickets || searchResults}
                    tripTrackers={searchResults.tripTrackers}
                    onTicketSelect={handleTicketSelect}
                  />
                )}

                {!isLoading && !error && !selectedTicket && !selectedTrip && !searchResults && (
                  <div className="no-results">
                    <i className="fas fa-ticket-alt"></i>
                    <p>Enter your ticket ID or email address to track your travel plans.</p>
                    <p className="hint">
                      Enter your ticket ID and email address to view your trip details.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default TicketTracker 