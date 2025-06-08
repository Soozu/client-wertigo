import React, { useState } from 'react'
import { User, Mail, Calendar, MapPin, Edit3, Save, X, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import './Profile.css'

const Profile = () => {
  const { user, updateProfile, changePassword, deleteAccount } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    location: user?.location || '',
    bio: user?.bio || ''
  })
  const [loading, setLoading] = useState(false)
  
  // Password change state
  const [showPasswordSection, setShowPasswordSection] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  const handleEdit = () => {
    setIsEditing(true)
    setEditData({
      name: user?.name || '',
      email: user?.email || '',
      location: user?.location || '',
      bio: user?.bio || ''
    })
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditData({
      name: user?.name || '',
      email: user?.email || '',
      location: user?.location || '',
      bio: user?.bio || ''
    })
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const result = await updateProfile(editData)
      if (result.success) {
        setIsEditing(false)
        alert('Profile updated successfully!')
      } else {
        alert(result.error || 'Failed to update profile. Please try again.')
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
      alert('Failed to update profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      alert('Please fill in all password fields.')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match.')
      return
    }

    if (passwordData.newPassword.length < 6) {
      alert('New password must be at least 6 characters long.')
      return
    }

    setPasswordLoading(true)
    try {
      const result = await changePassword(passwordData.currentPassword, passwordData.newPassword)
      if (result.success) {
        alert('Password changed successfully!')
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        setShowPasswordSection(false)
      } else {
        alert(result.error || 'Failed to change password. Please try again.')
      }
    } catch (error) {
      console.error('Failed to change password:', error)
      alert('Failed to change password. Please try again.')
    } finally {
      setPasswordLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="profile-page">
        <Header />
        <main className="profile-main">
          <div className="profile-error">
            <p>Please log in to view your profile.</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <Header />
      <main className="profile-main">
        <div className="profile-container">
          <div className="profile-header">
            <div className="profile-avatar-section">
              <img 
                src={user.avatar} 
                alt={user.name}
                className="profile-avatar"
              />
              <div className="profile-basic-info">
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="profile-name-input"
                    placeholder="Your name"
                  />
                ) : (
                  <h1 className="profile-name">{user.name}</h1>
                )}
                <p className="profile-role">{user.role || 'Traveler'}</p>
                <div className="profile-meta">
                  <span className="profile-meta-item">
                    <Calendar size={16} />
                    Joined {new Date(user.created_at || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="profile-actions">
              {!isEditing ? (
                <button 
                  className="btn btn-primary"
                  onClick={handleEdit}
                >
                  <Edit3 size={16} />
                  Edit Profile
                </button>
              ) : (
                <div className="edit-actions">
                  <button 
                    className="btn btn-secondary"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    <X size={16} />
                    Cancel
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="btn-spinner"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="profile-content">
            <div className="profile-section">
              <h3>Personal Information</h3>
              <div className="profile-fields">
                <div className="profile-field">
                  <label>
                    <Mail size={16} />
                    Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="profile-input"
                      placeholder="your.email@example.com"
                    />
                  ) : (
                    <span>{user.email}</span>
                  )}
                </div>

                <div className="profile-field">
                  <label>
                    <MapPin size={16} />
                    Location
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="profile-input"
                      placeholder="Your location"
                    />
                  ) : (
                    <span>{user.location || 'Not specified'}</span>
                  )}
                </div>

                <div className="profile-field">
                  <label>
                    <User size={16} />
                    Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      className="profile-textarea"
                      placeholder="Tell us about yourself..."
                      rows={4}
                    />
                  ) : (
                    <span>{user.bio || 'No bio added yet.'}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="profile-section">
              <div className="section-header">
                <h3>Security</h3>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowPasswordSection(!showPasswordSection)}
                >
                  <Lock size={16} />
                  Change Password
                </button>
              </div>
              
              {showPasswordSection && (
                <form onSubmit={handlePasswordSubmit} className="password-form">
                  <div className="password-field">
                    <label>
                      <Lock size={16} />
                      Current Password
                    </label>
                    <div className="password-input-wrapper">
                      <input
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                        className="profile-input"
                        placeholder="Enter your current password"
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => togglePasswordVisibility('current')}
                      >
                        {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="password-field">
                    <label>
                      <Lock size={16} />
                      New Password
                    </label>
                    <div className="password-input-wrapper">
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                        className="profile-input"
                        placeholder="Enter your new password"
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => togglePasswordVisibility('new')}
                      >
                        {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="password-field">
                    <label>
                      <Lock size={16} />
                      Confirm New Password
                    </label>
                    <div className="password-input-wrapper">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                        className="profile-input"
                        placeholder="Confirm your new password"
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => togglePasswordVisibility('confirm')}
                      >
                        {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="password-actions">
                    <button 
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowPasswordSection(false)
                        setPasswordData({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: ''
                        })
                      }}
                      disabled={passwordLoading}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="btn btn-primary"
                      disabled={passwordLoading}
                    >
                      {passwordLoading ? (
                        <>
                          <div className="btn-spinner"></div>
                          Changing...
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          Change Password
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="profile-section danger-zone">
              <h3>Danger Zone</h3>
              <div className="danger-content">
                <div className="danger-action">
                  <div className="danger-info">
                    <h4>Delete Account</h4>
                    <p>This action cannot be undone. All your data will be permanently deleted.</p>
                  </div>
                  <button 
                    className="btn btn-danger"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
                        const password = prompt("Please enter your password to confirm:");
                        if (password) {
                          // Call deleteAccount function from auth context
                          deleteAccount(password)
                            .then(result => {
                              if (result.success) {
                                alert("Account deleted successfully.");
                                // Redirect to home page
                                window.location.href = "/";
                              } else {
                                alert(result.error || "Failed to delete account. Please try again.");
                              }
                            });
                        }
                      }
                    }}
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Profile 