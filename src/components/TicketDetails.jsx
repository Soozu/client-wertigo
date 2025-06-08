import React from 'react'
import { ArrowLeft, MapPin, Calendar, Users } from 'lucide-react'

const TicketDetails = ({ ticket, onBack }) => {
  if (!ticket) return null

  return (
    <div className="ticket-details">
      <div className="ticket-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={16} />
          Back to Search
        </button>
        <div className="ticket-id">
          <h2>{ticket.id}</h2>
          <span className={`status ${ticket.status.toLowerCase()}`}>
            {ticket.status}
          </span>
        </div>
      </div>

      <div className="ticket-info">
        <div className="info-grid">
          <div className="info-item">
            <MapPin size={16} />
            <div>
              <label>Destination</label>
              <span>{ticket.destination}</span>
            </div>
          </div>
          
          <div className="info-item">
            <Calendar size={16} />
            <div>
              <label>Travel Dates</label>
              <span>{ticket.dates}</span>
            </div>
          </div>
          
          <div className="info-item">
            <Users size={16} />
            <div>
              <label>Travelers</label>
              <span>{ticket.travelers}</span>
            </div>
          </div>
          
          <div className="info-item">
            <span style={{ fontSize: '16px' }}>₱</span>
            <div>
              <label>Budget</label>
              <span>₱{ticket.budget?.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {ticket.itinerary && (
        <div className="itinerary-section">
          <h3>Itinerary</h3>
          <div className="itinerary-list">
            {ticket.itinerary.map((day, index) => (
              <div key={index} className="day-item">
                <h4>Day {day.day}</h4>
                <div className="day-places">
                  {day.places.map((place, placeIndex) => (
                    <div key={placeIndex} className="place-item">
                      <span className="place-name">{place.name}</span>
                      <span className="place-category">{place.category}</span>
                      {place.budget && (
                        <span className="place-budget">₱{place.budget}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default TicketDetails 