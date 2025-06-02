import React from 'react'
import { 
  BarChart3, 
  Users, 
  MapPin, 
  Brain, 
  Activity, 
  Shield
} from 'lucide-react'

const AdminSidebar = ({ activeTab, onTabChange }) => {
  const menuItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: BarChart3,
      description: 'General analytics overview'
    },
    {
      id: 'users',
      label: 'User Analytics',
      icon: Users,
      description: 'User behavior and demographics'
    },
    {
      id: 'trips',
      label: 'Trip Analytics',
      icon: MapPin,
      description: 'Trip data and destinations'
    },
    {
      id: 'ai',
      label: 'AI Analytics',
      icon: Brain,
      description: 'AI recommendations and performance'
    },
    {
      id: 'system',
      label: 'System Health',
      icon: Activity,
      description: 'Backend performance and status'
    }
  ]

  const managementItems = [
    {
      id: 'user-management',
      label: 'User Management',
      icon: Users,
      description: 'Manage users and roles'
    }
  ]

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Shield size={24} />
          <span>Admin Panel</span>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <div className="nav-section">
          <h3>Analytics</h3>
          <ul className="nav-list">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.id}>
                  <button
                    className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                    onClick={() => onTabChange(item.id)}
                  >
                    <Icon size={20} />
                    <div className="nav-item-content">
                      <span className="nav-item-label">{item.label}</span>
                      <span className="nav-item-description">{item.description}</span>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
        
        <div className="nav-section">
          <h3>Management</h3>
          <ul className="nav-list">
            {managementItems.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.id}>
                  <button
                    className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                    onClick={() => onTabChange(item.id)}
                  >
                    <Icon size={20} />
                    <div className="nav-item-content">
                      <span className="nav-item-label">{item.label}</span>
                      <span className="nav-item-description">{item.description}</span>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </nav>
      
      <div className="sidebar-footer">
        <div className="system-status">
          <div className="status-indicator online"></div>
          <span>System Online</span>
        </div>
      </div>
    </aside>
  )
}

export default AdminSidebar 