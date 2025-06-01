import React from 'react'
import { MapPin, Calendar, Eye } from 'lucide-react'

const TicketList = ({ tickets, onTicketSelect }) => {
  if (!tickets || tickets.length === 0) {
    return (
      <div className="no-tickets">
        <i className="fas fa-ticket-alt"></i>
        <p>No tickets found for this email address.</p>
      </div>
    )
  }

  return (
    <div className="ticket-list">
      <h3>Your Travel Tickets</h3>
      <div className="tickets-grid">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="ticket-card">
            <div className="ticket-card-header">
              <div className="ticket-card-id">{ticket.id}</div>
              <span className={`ticket-status ${ticket.status.toLowerCase()}`}>
                {ticket.status}
              </span>
            </div>
            
            <div className="ticket-card-content">
              <div className="ticket-info-item">
                <MapPin size={14} />
                <span>{ticket.destination}</span>
              </div>
              
              <div className="ticket-info-item">
                <Calendar size={14} />
                <span>{ticket.dates}</span>
              </div>
              
              {ticket.budget && (
                <div className="ticket-info-item">
                  <i className="fas fa-peso-sign"></i>
                  <span>₱{ticket.budget.toLocaleString()}</span>
                </div>
              )}
              
              {ticket.createdDate && (
                <div className="created-date">
                  Created: {new Date(ticket.createdDate).toLocaleDateString()}
                </div>
              )}
            </div>
            
            <div className="ticket-card-actions">
              <button 
                className="view-details-btn"
                onClick={() => onTicketSelect(ticket)}
              >
                <Eye size={14} />
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TicketList 