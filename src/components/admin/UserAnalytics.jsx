import React, { useState, useEffect } from 'react';
import { authAPI } from '../../services/api';
import './UserAnalytics.css';

const UserAnalytics = () => {
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsersThisMonth: 0,
    userGrowthRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Try to fetch real data from the correct admin endpoint
      const [analyticsResponse, usersResponse] = await Promise.allSettled([
        authAPI.admin.getUserAnalytics(),
        authAPI.admin.getUsers({ limit: 10 })
      ]);
      
      if (analyticsResponse.status === 'fulfilled' && analyticsResponse.value.success) {
        const data = analyticsResponse.value.analytics;
        setAnalytics({
          totalUsers: data.totalUsers || 0,
          activeUsers: data.activeUsers || 0,
          newUsersThisMonth: data.newUsers || 0,
          userGrowthRate: data.userGrowthRate || 0
        });
      }

      if (usersResponse.status === 'fulfilled' && usersResponse.value.success) {
        setUsers(usersResponse.value.users || []);
      }

      // If both failed, set error but don't throw to show mock data
      if (analyticsResponse.status === 'rejected' && usersResponse.status === 'rejected') {
        throw new Error('Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError(error.message);
      
      // Set mock data for demonstration
      setUsers([
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          role: 'user',
          createdAt: '2024-01-15T10:30:00Z'
        },
        {
          id: 2,
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          role: 'user',
          createdAt: '2024-01-10T09:15:00Z'
        }
      ]);

      setAnalytics({
        totalUsers: 1247,
        activeUsers: 892,
        newUsersThisMonth: 47,
        userGrowthRate: 12.5
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading user analytics...</p>
      </div>
    );
  }

  return (
    <div className="user-analytics">
      <div className="dashboard-header">
        <h2>User Analytics</h2>
        <p>User management and analytics dashboard</p>
      </div>

      {error && (
        <div className="error-banner">
          <span>⚠️</span>
          <span>Using demo data: {error}</span>
        </div>
      )}

      <div className="admin-grid admin-grid-4">
        <div className="stat-card">
          <h3 className="stat-value">{(analytics.totalUsers || 0).toLocaleString()}</h3>
          <p className="stat-label">Total Users</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-value">{(analytics.activeUsers || 0).toLocaleString()}</h3>
          <p className="stat-label">Active Users</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-value">{analytics.newUsersThisMonth || 0}</h3>
          <p className="stat-label">New This Month</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-value">{analytics.userGrowthRate || 0}%</h3>
          <p className="stat-label">Growth Rate</p>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">Recent Users</h3>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.firstName} {user.lastName}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <span className="status-badge status-active">
                    Active
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserAnalytics; 