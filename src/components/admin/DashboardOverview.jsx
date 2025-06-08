import React, { useState, useEffect } from 'react';
import { authAPI } from '../../services/api';
import './DashboardOverview.css';

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTrips: 0,
    totalTickets: 0,
    activeUsers: 0,
    recentSignups: 0,
    popularDestinations: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch admin overview analytics and popular destinations
      const [overviewResponse, destinationsResponse] = await Promise.allSettled([
        authAPI.admin.getAnalyticsOverview(),
        authAPI.admin.getPopularDestinations()
      ]);
      
      if (overviewResponse.status === 'fulfilled' && overviewResponse.value.success) {
        const data = overviewResponse.value.analytics;
        setStats(prevStats => ({
          ...prevStats,
          totalUsers: data.totalUsers || 0,
          totalTrips: data.totalTrips || 0,
          totalTickets: data.totalTickets || 0,
          activeUsers: data.newUsers || 0, // Using newUsers as a proxy for active users
          recentSignups: data.newUsers || 0
        }));
      }

      if (destinationsResponse.status === 'fulfilled' && destinationsResponse.value.success) {
        const destinations = destinationsResponse.value.destinations || [];
        setStats(prevStats => ({
          ...prevStats,
          popularDestinations: destinations.map(dest => ({
            name: dest.city || dest.name, // Handle both city and name fields
            count: dest.count
          }))
        }));
      }

      // If both failed, throw error to show mock data
      if (overviewResponse.status === 'rejected' && destinationsResponse.status === 'rejected') {
        throw new Error('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message);
      
      // Set mock data for demonstration
      setStats({
        totalUsers: 1247,
        totalTrips: 3892,
        totalTickets: 15634,
        activeUsers: 892,
        recentSignups: 47,
        popularDestinations: [
          { name: 'Paris', count: 234 },
          { name: 'Tokyo', count: 189 },
          { name: 'New York', count: 156 },
          { name: 'London', count: 143 },
          { name: 'Barcelona', count: 128 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, change, icon, color }) => (
    <div className="stat-card fade-in">
      <div className="stat-header">
        <div className="stat-icon" style={{ background: color }}>
          {icon}
        </div>
        <div className="stat-info">
          <h3 className="stat-value">{(value || 0).toLocaleString()}</h3>
          <p className="stat-label">{title}</p>
          {change && (
            <div className={`stat-change ${change > 0 ? 'positive' : 'negative'}`}>
              <span>{change > 0 ? '↗' : '↘'}</span>
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const QuickActions = () => (
    <div className="admin-card">
      <div className="admin-card-header">
        <h3 className="admin-card-title">Quick Actions</h3>
      </div>
      <div className="quick-actions-grid">
        <button className="quick-action-btn">
          <span className="action-icon">👥</span>
          <span>Manage Users</span>
        </button>
        <button className="quick-action-btn">
          <span className="action-icon">🎫</span>
          <span>View Tickets</span>
        </button>
        <button className="quick-action-btn">
          <span className="action-icon">📊</span>
          <span>Generate Report</span>
        </button>
        <button className="quick-action-btn">
          <span className="action-icon">⚙️</span>
          <span>System Settings</span>
        </button>
      </div>
    </div>
  );

  const PopularDestinations = () => (
    <div className="admin-card">
      <div className="admin-card-header">
        <h3 className="admin-card-title">Popular Destinations</h3>
        <p className="admin-card-subtitle">Top travel destinations this month</p>
      </div>
      <div className="destinations-list">
        {(stats.popularDestinations || []).map((destination, index) => (
          <div key={destination.name} className="destination-item">
            <div className="destination-rank">#{index + 1}</div>
            <div className="destination-info">
              <span className="destination-name">{destination.name}</span>
              <span className="destination-count">{destination.count} trips</span>
            </div>
            <div className="destination-bar">
              <div 
                className="destination-progress"
                style={{ 
                  width: `${stats.popularDestinations && stats.popularDestinations[0] 
                    ? (destination.count / stats.popularDestinations[0].count) * 100 
                    : 0}%` 
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const RecentActivity = () => (
    <div className="admin-card">
      <div className="admin-card-header">
        <h3 className="admin-card-title">Recent Activity</h3>
        <p className="admin-card-subtitle">Latest system activities</p>
      </div>
      <div className="activity-list">
        <div className="activity-item">
          <div className="activity-icon user">👤</div>
          <div className="activity-content">
            <p className="activity-text">New user registration</p>
            <span className="activity-time">2 minutes ago</span>
          </div>
        </div>
        <div className="activity-item">
          <div className="activity-icon trip">✈️</div>
          <div className="activity-content">
            <p className="activity-text">Trip created to Paris</p>
            <span className="activity-time">15 minutes ago</span>
          </div>
        </div>
        <div className="activity-item">
          <div className="activity-icon ticket">🎫</div>
          <div className="activity-content">
            <p className="activity-text">Ticket generated</p>
            <span className="activity-time">1 hour ago</span>
          </div>
        </div>
        <div className="activity-item">
          <div className="activity-icon system">⚙️</div>
          <div className="activity-content">
            <p className="activity-text">System backup completed</p>
            <span className="activity-time">3 hours ago</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-overview">
      <div className="dashboard-header">
        <h2>Dashboard Overview</h2>
        <p>Welcome to your admin dashboard. Here's what's happening today.</p>
      </div>

      {error && (
        <div className="error-banner">
          <span>⚠️</span>
          <span>Using demo data: {error}</span>
        </div>
      )}

      <div className="stats-grid admin-grid admin-grid-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          change={12}
          icon="👥"
          color="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        />
        <StatCard
          title="Total Trips"
          value={stats.totalTrips}
          change={8}
          icon="✈️"
          color="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
        />
        <StatCard
          title="Total Tickets"
          value={stats.totalTickets}
          change={15}
          icon="🎫"
          color="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          change={-3}
          icon="🟢"
          color="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
        />
      </div>

      <div className="dashboard-content admin-grid admin-grid-2">
        <div className="dashboard-left">
          <QuickActions />
          <PopularDestinations />
        </div>
        <div className="dashboard-right">
          <RecentActivity />
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview; 