import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Check for existing session on mount
  useEffect(() => {
    const checkExistingAuth = async () => {
      setIsLoading(true);
      try {
        // Check if there's a session ID in storage
        const sessionId = sessionStorage.getItem('wertigo_session_id');
        
        if (sessionId) {
          // Validate session with backend
          const result = await authAPI.validateSession();
        
          if (result.success) {
            const userData = {
              id: result.user.user_id || result.user.id,
              email: result.user.email,
              name: result.user.username,
              username: result.user.username,
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(result.user.username)}&background=1da1f2&color=fff&size=150`,
              joinDate: new Date().toISOString(),
              preferences: {
                currency: 'PHP',
                language: 'en',
                notifications: true
              }
            };
            
          setUser(userData);
          setIsAuthenticated(true);
          console.log('Restored user session:', userData.email);
          }
        }
      } catch (error) {
        // 401 errors are expected when there's no valid session
        if (error.response?.status !== 401) {
        console.error('Failed to restore session:', error);
        }
        // Clear invalid session data
        sessionStorage.removeItem('wertigo_session_id');
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingAuth();
  }, []);

  // Login function with backend API
  const login = async (email, password) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const result = await authAPI.login(email, password);
      
      if (result.success) {
        const userData = {
          id: result.user.id,
          email: result.user.email,
          name: result.user.username,
          username: result.user.username,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(result.user.username)}&background=1da1f2&color=fff&size=150`,
          joinDate: new Date().toISOString(),
          preferences: {
            currency: 'PHP',
            language: 'en',
            notifications: true
          }
        };

        setUser(userData);
        setIsAuthenticated(true);
        
        console.log('User logged in:', userData.email);
        return { success: true, user: userData };
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      let errorMessage = 'Login failed. Please try again.';
      
      // Handle specific error cases
      if (error.message === 'Invalid username or password') {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.message === 'Network Error') {
        errorMessage = 'Unable to connect to server. Please check your internet connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setAuthError(errorMessage);
      console.error('Login error:', error);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Registration function with backend API
  const register = async (userData) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      // Client-side validation
      if (!userData.email || !userData.password || !userData.name) {
        throw new Error('All fields are required.');
      }

      if (userData.password !== userData.confirmPassword) {
        throw new Error('Passwords do not match.');
      }

      if (userData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long.');
      }

      // Register with backend
      const result = await authAPI.register(userData);
      
      if (result.success) {
        // After successful registration, log the user in
        const loginResult = await authAPI.login(userData.email, userData.password);
        
        if (loginResult.success) {
      const newUser = {
            id: loginResult.user.id,
            email: loginResult.user.email,
            name: loginResult.user.username,
            username: loginResult.user.username,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(loginResult.user.username)}&background=1da1f2&color=fff&size=150`,
        joinDate: new Date().toISOString(),
        preferences: {
          currency: 'PHP',
          language: 'en',
          notifications: true
        }
      };

      setUser(newUser);
      setIsAuthenticated(true);
      
          console.log('User registered and logged in:', newUser.email);
      return { success: true, user: newUser };
        } else {
          throw new Error('Registration successful but login failed. Please try logging in manually.');
        }
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      let errorMessage = 'Registration failed. Please try again.';
      
      // Handle specific error cases
      if (error.message === 'Username or email already exists') {
        errorMessage = 'An account with this email already exists. Please try logging in instead.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || 'Invalid registration data. Please check your information.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.message === 'Network Error') {
        errorMessage = 'Unable to connect to server. Please check your internet connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setAuthError(errorMessage);
      console.error('Registration error:', error);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function with backend API
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    }
    
    setUser(null);
    setIsAuthenticated(false);
    setAuthError(null);
    
    console.log('User logged out');
  };

  // Update user profile with backend API
  const updateProfile = async (updates) => {
    if (!user) return { success: false, error: 'No user logged in' };

    try {
      const result = await authAPI.updateProfile(updates);
      
      if (result.success) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      
      console.log('Profile updated:', updatedUser.email);
      return { success: true, user: updatedUser };
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: error.message || 'Failed to update profile' };
    }
  };

  // Clear auth error
  const clearError = () => {
    setAuthError(null);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    authError,
    login,
    register,
    logout,
    updateProfile,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 