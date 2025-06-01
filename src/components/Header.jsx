import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { User, LogOut, Settings, ChevronDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import './Header.css'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-menu')) {
        setIsUserMenuOpen(false)
      }
      if (!event.target.closest('.navbar') && !event.target.closest('.menu-toggle')) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen)
  }

  const handleLogout = () => {
    logout()
    setIsUserMenuOpen(false)
    navigate('/')
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <header className={`header ${isScrolled ? 'header-scrolled' : ''}`}>
      <Link to={isAuthenticated ? "/planner" : "/"} className="logo" onClick={closeMenu}>
        <img src="/images/LOGO.png" alt="WerTigo Logo" className="logo-img" />
        <span>WerTigo</span>
      </Link>

      <button 
        className={`menu-toggle ${isMenuOpen ? 'active' : ''}`}
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        <i className="fa-solid fa-bars"></i>
      </button>

      <nav className={`navbar ${isMenuOpen ? 'active' : ''}`}>
        <Link 
          to="/" 
          className={isActive('/') || isActive('/home') ? 'active' : ''}
          onClick={closeMenu}
        >
          <span>Home</span>
        </Link>
        <Link 
          to="/#about" 
          onClick={closeMenu}
        >
          <span>About</span>
        </Link>
        
        {isAuthenticated ? (
          <>
            <Link 
              to="/planner" 
              className={isActive('/planner') ? 'active' : ''}
              onClick={closeMenu}
            >
              <span>Trip Planner</span>
        </Link>
        <Link 
          to="/tracker" 
          className={isActive('/tracker') ? 'active' : ''}
          onClick={closeMenu}
        >
          <span>Ticket Tracker</span>
        </Link>
          </>
        ) : (
        <Link 
            to="/login" 
            className={`cta-link ${isActive('/login') ? 'active' : ''}`}
          onClick={closeMenu}
        >
            <span>Get Started</span>
        </Link>
        )}
      </nav>

      {/* User Menu for Authenticated Users */}
      {isAuthenticated && user && (
        <div className="user-menu">
          <button 
            className="user-menu-trigger"
            onClick={toggleUserMenu}
            aria-label="User menu"
          >
            <img 
              src={user.avatar} 
              alt={user.name}
              className="user-avatar"
            />
            <span className="user-name">{user.name}</span>
            <ChevronDown 
              size={16} 
              className={`dropdown-icon ${isUserMenuOpen ? 'open' : ''}`}
            />
          </button>

          {isUserMenuOpen && (
            <div className="user-dropdown">
              <div className="user-info">
                <img 
                  src={user.avatar} 
                  alt={user.name}
                  className="dropdown-avatar"
                />
                <div className="user-details">
                  <p className="user-display-name">{user.name}</p>
                  <p className="user-email">{user.email}</p>
                </div>
              </div>
              
              <div className="dropdown-divider" />
              
              <div className="dropdown-menu">
                <button className="dropdown-item" onClick={() => setIsUserMenuOpen(false)}>
                  <User size={16} />
                  <span>Profile</span>
                </button>
                <button className="dropdown-item" onClick={() => setIsUserMenuOpen(false)}>
                  <Settings size={16} />
                  <span>Settings</span>
                </button>
                
                <div className="dropdown-divider" />
                
                <button className="dropdown-item logout-item" onClick={handleLogout}>
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Login/Signup for Unauthenticated Users */}
      {!isAuthenticated && (
        <div className="auth-buttons">
          <Link 
            to="/login" 
            className="auth-btn login-btn"
            onClick={closeMenu}
          >
            Sign In
          </Link>
          <Link 
            to="/login" 
            className="auth-btn signup-btn"
            onClick={closeMenu}
          >
            Sign Up
          </Link>
        </div>
      )}
    </header>
  )
}

export default Header 