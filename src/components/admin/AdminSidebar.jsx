import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import './AdminSidebar.css';

const AdminSidebar = ({ activeSection, setActiveSection, user }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    {
      id: 'overview',
      label: 'Dashboard',
      icon: '📊',
      description: 'Overview & Statistics'
    },
    {
      id: 'users',
      label: 'User Analytics',
      icon: '👥',
      description: 'User Management & Stats'
    },
    {
      id: 'tickets',
      label: 'Ticket Analytics',
      icon: '🎫',
      description: 'Ticket Statistics'
    },
    {
      id: 'system',
      label: 'System Metrics',
      icon: '⚙️',
      description: 'Performance & Health'
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: '📈',
      description: 'Generate Reports'
    }
  ];

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/login');
    }
  };

  const handleBackToApp = () => {
    navigate('/');
  };

  return (
    <div className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">🌍</div>
          {!isCollapsed && (
            <div className="logo-text">
              <h3>Wertigo Admin</h3>
              <p>Travel Management</p>
            </div>
          )}
        </div>
        <button 
          className="collapse-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => setActiveSection(item.id)}
            title={isCollapsed ? item.label : ''}
          >
            <span className="nav-icon">{item.icon}</span>
            {!isCollapsed && (
              <div className="nav-content">
                <span className="nav-label">{item.label}</span>
                <span className="nav-description">{item.description}</span>
              </div>
            )}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">
            {(user?.firstName?.[0] || 'A').toUpperCase()}
          </div>
          {!isCollapsed && (
            <div className="user-info">
              <span className="user-name">{user?.firstName || 'Admin'}</span>
              <span className="user-role">Administrator</span>
            </div>
          )}
        </div>
        
        <div className="footer-actions">
          <button 
            className="footer-btn"
            onClick={handleBackToApp}
            title="Back to Main App"
          >
            <span className="btn-icon">🏠</span>
            {!isCollapsed && <span>Main App</span>}
          </button>
          <button 
            className="footer-btn logout-btn"
            onClick={handleLogout}
            title="Logout"
          >
            <span className="btn-icon">🚪</span>
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar; 