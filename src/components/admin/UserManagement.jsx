import React, { useState, useEffect } from 'react'
import { Users, Search, Shield, User, Edit, Check, X, AlertTriangle } from 'lucide-react'
import { authAPI } from '../../services/api'

const UserManagement = ({ isLoading: parentLoading }) => {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({})
  const [editingUser, setEditingUser] = useState(null)
  const [stats, setStats] = useState({})
  const [error, setError] = useState(null)

  useEffect(() => {
    loadUsers()
    loadStats()
  }, [currentPage, searchTerm, roleFilter])

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        role: roleFilter
      }
      
      const response = await authAPI.admin.getUsers(params)
      setUsers(response.users)
      setPagination(response.pagination)
      setError(null)
    } catch (error) {
      console.error('Failed to load users:', error)
      setError('Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await authAPI.admin.getStats()
      setStats(response.stats)
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const handleRoleUpdate = async (userId, newRole) => {
    try {
      await authAPI.admin.updateUserRole(userId, newRole)
      
      // Update the user in the local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ))
      
      setEditingUser(null)
      loadStats() // Refresh stats
    } catch (error) {
      console.error('Failed to update user role:', error)
      setError('Failed to update user role')
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getRoleIcon = (role) => {
    return role === 'admin' ? <Shield size={16} /> : <User size={16} />
  }

  const getRoleBadgeClass = (role) => {
    return role === 'admin' ? 'role-badge admin' : 'role-badge user'
  }

  if (parentLoading || isLoading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner"></div>
        <p>Loading user management...</p>
      </div>
    )
  }

  return (
    <div className="user-management">
      <div className="analytics-header">
        <h2>User Management</h2>
        <p>Manage users, roles, and permissions</p>
      </div>

      {/* Stats Overview */}
      <div className="user-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#667eea' }}>
            <Users size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.totalUsers || 0}</h3>
            <p>Total Users</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#27ae60' }}>
            <Shield size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.adminUsers || 0}</h3>
            <p>Admin Users</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#f39c12' }}>
            <User size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.regularUsers || 0}</h3>
            <p>Regular Users</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#e74c3c' }}>
            <Users size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.recentUsers || 0}</h3>
            <p>New This Month</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="user-filters">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="role-filter"
        >
          <option value="">All Roles</option>
          <option value="user">Users</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {error && (
        <div className="error-message">
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Trips</th>
              <th>Tickets</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="user-info">
                    <div className="user-avatar">
                      {(user.firstName || user.username || user.email).charAt(0).toUpperCase()}
                    </div>
                    <div className="user-details">
                      <div className="user-name">
                        {user.firstName && user.lastName 
                          ? `${user.firstName} ${user.lastName}`
                          : user.username || 'Unknown'
                        }
                      </div>
                      <div className="user-username">@{user.username}</div>
                    </div>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  {editingUser === user.id ? (
                    <div className="role-edit">
                      <select
                        defaultValue={user.role}
                        onChange={(e) => handleRoleUpdate(user.id, e.target.value)}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button
                        className="cancel-edit"
                        onClick={() => setEditingUser(null)}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="role-display">
                      <span className={getRoleBadgeClass(user.role)}>
                        {getRoleIcon(user.role)}
                        {user.role}
                      </span>
                      <button
                        className="edit-role"
                        onClick={() => setEditingUser(user.id)}
                      >
                        <Edit size={14} />
                      </button>
                    </div>
                  )}
                </td>
                <td>{formatDate(user.createdAt)}</td>
                <td>{user._count?.trips || 0}</td>
                <td>{user._count?.generatedTickets || 0}</td>
                <td>
                  <div className="user-actions">
                    <button className="action-btn view">View</button>
                    <button className="action-btn edit">Edit</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </button>
          
          <span className="page-info">
            Page {currentPage} of {pagination.pages}
          </span>
          
          <button
            disabled={currentPage === pagination.pages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default UserManagement 