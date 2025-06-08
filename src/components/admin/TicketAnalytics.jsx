import React, { useState, useEffect } from 'react';
import { authAPI } from '../../services/api';
import './TicketAnalytics.css';

const TicketAnalytics = () => {
  const [tickets, setTickets] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalTickets: 0,
    activeTickets: 0,
    completedTickets: 0,
    ticketGrowthRate: 0,
    ticketsByType: {},
    recentTickets: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTicketData();
  }, []);

  const fetchTicketData = async () => {
    try {
      setLoading(true);
      
      // Try to fetch real data from the correct admin endpoint
      const response = await authAPI.admin.getTicketAnalytics();
      
      if (response.success) {
        const data = response.analytics;
        setAnalytics(prevAnalytics => ({
          ...prevAnalytics,
          totalTickets: data.totalTickets || 0,
          activeTickets: data.activeTickets || 0, // Use the correct field from backend
          completedTickets: data.completedTickets || 0, // Use the correct field from backend
          ticketGrowthRate: data.ticketGrowthRate || 0, // Use real growth rate from backend
          ticketsByType: data.ticketsByType || {}, // Use the correct field from backend
          recentTickets: []
        }));
        
        // If there are tickets in the response, use them
        if (response.tickets) {
          setTickets(response.tickets);
        }
      }
    } catch (error) {
      console.error('Error fetching ticket data:', error);
      setError(error.message);
      
      // Set mock data for demonstration
      setTickets([
        {
          id: 'TKT-001',
          tripId: 'trip-123',
          destination: 'Paris, France',
          travelerName: 'John Doe',
          email: 'john.doe@example.com',
          status: 'active',
          createdAt: '2024-01-20T10:30:00Z',
          type: 'standard'
        },
        {
          id: 'TKT-002',
          tripId: 'trip-124',
          destination: 'Tokyo, Japan',
          travelerName: 'Jane Smith',
          email: 'jane.smith@example.com',
          status: 'completed',
          createdAt: '2024-01-19T14:22:00Z',
          type: 'premium'
        },
        {
          id: 'TKT-003',
          tripId: 'trip-125',
          destination: 'New York, USA',
          travelerName: 'Bob Johnson',
          email: 'bob.johnson@example.com',
          status: 'active',
          createdAt: '2024-01-18T09:15:00Z',
          type: 'standard'
        }
      ]);

      setAnalytics({
        totalTickets: 15634,
        activeTickets: 8923,
        completedTickets: 6711,
        ticketGrowthRate: 15.2,
        ticketsByType: {
          standard: 12450,
          premium: 2184,
          vip: 1000
        },
        recentTickets: []
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'status-active';
      case 'completed':
        return 'status-inactive';
      case 'pending':
        return 'status-pending';
      default:
        return 'status-inactive';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'premium':
        return '#f093fb';
      case 'vip':
        return '#ffd700';
      default:
        return '#667eea';
    }
  };

  const TicketStatsCards = () => (
    <div className="admin-grid admin-grid-4">
      <div className="stat-card fade-in">
        <div className="stat-header">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            🎫
          </div>
          <div className="stat-info">
            <h3 className="stat-value">{(analytics.totalTickets || 0).toLocaleString()}</h3>
            <p className="stat-label">Total Tickets</p>
            <div className="stat-change positive">
              <span>↗</span>
              <span>{analytics.ticketGrowthRate || 0}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="stat-card fade-in">
        <div className="stat-header">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
            ✅
          </div>
          <div className="stat-info">
            <h3 className="stat-value">{(analytics.activeTickets || 0).toLocaleString()}</h3>
            <p className="stat-label">Active Tickets</p>
            <div className="stat-change positive">
              <span>↗</span>
              <span>12%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="stat-card fade-in">
        <div className="stat-header">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            ✔️
          </div>
          <div className="stat-info">
            <h3 className="stat-value">{(analytics.completedTickets || 0).toLocaleString()}</h3>
            <p className="stat-label">Completed</p>
            <div className="stat-change positive">
              <span>↗</span>
              <span>8%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="stat-card fade-in">
        <div className="stat-header">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            📊
          </div>
          <div className="stat-info">
            <h3 className="stat-value">{analytics.totalTickets > 0 ? Math.round((analytics.completedTickets / analytics.totalTickets) * 100) : 0}%</h3>
            <p className="stat-label">Success Rate</p>
            <div className="stat-change positive">
              <span>↗</span>
              <span>5%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const TicketTypeBreakdown = () => (
    <div className="admin-card">
      <div className="admin-card-header">
        <h3 className="admin-card-title">Ticket Types</h3>
        <p className="admin-card-subtitle">Distribution by ticket type</p>
      </div>
      <div className="ticket-types-grid">
        {Object.entries(analytics.ticketsByType || {}).map(([type, count]) => (
          <div key={type} className="ticket-type-item">
            <div className="ticket-type-header">
              <div 
                className="ticket-type-icon"
                style={{ background: getTypeColor(type) }}
              >
                {type === 'premium' ? '⭐' : type === 'vip' ? '👑' : '🎫'}
              </div>
              <div className="ticket-type-info">
                <h4 className="ticket-type-name">{type.charAt(0).toUpperCase() + type.slice(1)}</h4>
                <p className="ticket-type-count">{(count || 0).toLocaleString()} tickets</p>
              </div>
            </div>
            <div className="ticket-type-bar">
              <div 
                className="ticket-type-progress"
                style={{ 
                  width: `${analytics.totalTickets > 0 ? (count / analytics.totalTickets) * 100 : 0}%`,
                  background: getTypeColor(type)
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const RecentTicketsTable = () => (
    <div className="admin-card">
      <div className="admin-card-header">
        <h3 className="admin-card-title">Recent Tickets</h3>
        <p className="admin-card-subtitle">Latest ticket activities</p>
      </div>
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Traveler</th>
              <th>Destination</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id}>
                <td>
                  <span className="ticket-id">{ticket.id}</span>
                </td>
                <td>
                  <div className="traveler-info">
                    <div className="traveler-name">{ticket.travelerName}</div>
                    <div className="traveler-email">{ticket.email}</div>
                  </div>
                </td>
                <td>{ticket.destination}</td>
                <td>
                  <span className={`status-badge ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </td>
                <td>{formatDate(ticket.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading ticket analytics...</p>
      </div>
    );
  }

  return (
    <div className="ticket-analytics">
      <div className="dashboard-header">
        <h2>Ticket Analytics</h2>
        <p>Comprehensive ticket management and analytics dashboard</p>
      </div>

      {error && (
        <div className="error-banner">
          <span>⚠️</span>
          <span>Using demo data: {error}</span>
        </div>
      )}

      <TicketStatsCards />

      <div className="analytics-content admin-grid admin-grid-2">
        <TicketTypeBreakdown />
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Quick Actions</h3>
          </div>
          <div className="quick-actions-grid">
            <button className="quick-action-btn">
              <span className="action-icon">📊</span>
              <span>Generate Report</span>
            </button>
            <button className="quick-action-btn">
              <span className="action-icon">📥</span>
              <span>Export Data</span>
            </button>
            <button className="quick-action-btn">
              <span className="action-icon">🔍</span>
              <span>Search Tickets</span>
            </button>
            <button className="quick-action-btn">
              <span className="action-icon">⚙️</span>
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      <RecentTicketsTable />
    </div>
  );
};

export default TicketAnalytics; 