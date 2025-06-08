import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from '../services/api';
import { STORAGE_KEYS } from '../config/api';

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
        // Check if there's a JWT token in storage
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        
        if (token) {
          // Validate token with Express backend
          const result = await authAPI.validateSession();
        
          if (result.success) {
            const userData = {
              id: result.user.id,
              email: result.user.email,
              name: result.user.username || result.user.firstName + ' ' + result.user.lastName,
              username: result.user.username,
              firstName: result.user.firstName,
              lastName: result.user.lastName,
              role: result.user.role || 'user',
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(result.user.username || result.user.firstName)}&background=1da1f2&color=fff&size=150`,
              joinDate: result.user.createdAt || new Date().toISOString(),
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
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingAuth();
  }, []);

  // Login function with Express backend API
  const login = async (email, password) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const result = await authAPI.login(email, password);
      
      if (result.success) {
        const userData = {
          id: result.user.id,
          email: result.user.email,
          name: result.user.username || result.user.firstName + ' ' + result.user.lastName,
          username: result.user.username,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          role: result.user.role || 'user',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(result.user.username || result.user.firstName)}&background=1da1f2&color=fff&size=150`,
          joinDate: result.user.createdAt || new Date().toISOString(),
          preferences: {
            currency: 'PHP',
            language: 'en',
            notifications: true
          }
        };

        setUser(userData);
        setIsAuthenticated(true);
        
        // Store user data for persistence
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
        
        console.log('User logged in:', userData.email);
        return { success: true, user: userData };
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      let errorMessage = 'Login failed. Please try again.';
      
      // Handle specific error cases
      if (error.message.toLowerCase().includes('invalid') || 
          error.message.toLowerCase().includes('incorrect') ||
          error.message.toLowerCase().includes('wrong') ||
          error.response?.data?.message?.toLowerCase().includes('invalid') ||
          error.response?.status === 401) {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (error.response?.status === 404) {
        errorMessage = 'No account found with this email address.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.message === 'Network Error') {
        errorMessage = 'Unable to connect to server. Please check your internet connection.';
      } else if (error.message && !error.message.includes('Login failed')) {
        errorMessage = error.message;
      }
      
      setAuthError(errorMessage);
      console.error('Login error:', error);
      throw new Error(errorMessage); // Throw the error so Login component can handle it
    } finally {
      setIsLoading(false);
    }
  };

  // Registration function with Express backend API
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

      // Register with Express backend
      const result = await authAPI.register(userData);
      
      if (result.success) {
        const newUser = {
          id: result.user.id,
          email: result.user.email,
          name: result.user.username || result.user.firstName + ' ' + result.user.lastName,
          username: result.user.username,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          role: result.user.role || 'user',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(result.user.username || result.user.firstName)}&background=1da1f2&color=fff&size=150`,
          joinDate: result.user.createdAt || new Date().toISOString(),
          preferences: {
            currency: 'PHP',
            language: 'en',
            notifications: true
          }
        };

        setUser(newUser);
        setIsAuthenticated(true);
        
        // Store user data for persistence
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(newUser));
        
        console.log('User registered and logged in:', newUser.email);
        return { success: true, user: newUser };
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      let errorMessage = 'Registration failed. Please try again.';
      
      // Handle specific error cases
      if (error.message.toLowerCase().includes('email') && 
          (error.message.toLowerCase().includes('exists') || 
           error.message.toLowerCase().includes('already') ||
           error.response?.data?.message?.toLowerCase().includes('exists'))) {
        errorMessage = 'An account with this email already exists. Please try logging in instead.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || 'Invalid registration data. Please check your information.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.message === 'Network Error') {
        errorMessage = 'Unable to connect to server. Please check your internet connection.';
      } else if (error.message && !error.message.includes('Registration failed')) {
        errorMessage = error.message;
      }
      
      setAuthError(errorMessage);
      console.error('Registration error:', error);
      throw new Error(errorMessage); // Throw the error so Login component can handle it
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function with Express backend API
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

  // Update user profile with Express backend API
  const updateProfile = async (updates) => {
    if (!user) return { success: false, error: 'No user logged in' };

    try {
      const result = await authAPI.updateProfile(updates);
      
      if (result.success) {
        const updatedUser = { ...user, ...result.user };
        setUser(updatedUser);
        
        // Update stored user data
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
        
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

  // Change user password
  const changePassword = async (currentPassword, newPassword) => {
    if (!user) return { success: false, error: 'No user logged in' };

    try {
      const result = await authAPI.changePassword(currentPassword, newPassword);
      
      if (result.success) {
        console.log('Password changed successfully');
        return { success: true, message: result.message };
      } else {
        throw new Error('Failed to change password');
      }
    } catch (error) {
      console.error('Password change error:', error);
      return { success: false, error: error.message || 'Failed to change password' };
    }
  };

  // Delete user account
  const deleteAccount = async (password) => {
    if (!user) return { success: false, error: 'No user logged in' };

    try {
      const result = await authAPI.deleteAccount(password);
      
      if (result.success) {
        // Reset auth state
        setUser(null);
        setIsAuthenticated(false);
        setAuthError(null);
        
        console.log('Account deleted successfully');
        return { success: true, message: result.message };
      } else {
        throw new Error('Failed to delete account');
      }
    } catch (error) {
      console.error('Account deletion error:', error);
      return { success: false, error: error.message || 'Failed to delete account' };
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
    changePassword,
    deleteAccount,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 