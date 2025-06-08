import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import AdminSidebar from '../../components/admin/AdminSidebar';
import DashboardOverview from '../../components/admin/DashboardOverview';
import UserAnalytics from '../../components/admin/UserAnalytics';
import TicketAnalytics from '../../components/admin/TicketAnalytics';
import SystemMetrics from '../../components/admin/SystemMetrics';
import ReportsSection from '../../components/admin/ReportsSection';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const response = await authAPI.getProfile();
      if (response.success && response.user.role === 'admin') {
        setUser(response.user);
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Admin access check failed:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'overview':
        return <DashboardOverview />;
      case 'users':
        return <UserAnalytics />;
      case 'tickets':
        return <TicketAnalytics />;
      case 'system':
        return <SystemMetrics />;
      case 'reports':
        return <ReportsSection />;
      default:
        return <DashboardOverview />;
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <AdminSidebar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection}
        user={user}
      />
      <div className="admin-main-content">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <div className="admin-user-info">
            <span>Welcome, {user?.firstName || 'Admin'}</span>
            <div className="admin-avatar">
              {(user?.firstName?.[0] || 'A').toUpperCase()}
            </div>
          </div>
        </div>
        <div className="admin-content">
          {renderActiveSection()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 