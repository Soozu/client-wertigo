import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeSession, healthAPI } from '../services/api';

const SessionContext = createContext();

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

export const SessionProvider = ({ children }) => {
  const [sessionId, setSessionId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(null);

  // Initialize session and check backend connection
  useEffect(() => {
    const initializeApp = async () => {
      setIsLoading(true);
      setConnectionError(null);

      try {
        // First check if backend is available
        await healthAPI.checkHealth();
        setIsConnected(true);

        // Then initialize session
        const sessionId = await initializeSession();
        setSessionId(sessionId);
        
        console.log('App initialized successfully with session:', sessionId);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setIsConnected(false);
        setConnectionError(error.message || 'Failed to connect to backend');
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Periodic health check
  useEffect(() => {
    if (!isConnected) return;

    const healthCheckInterval = setInterval(async () => {
      try {
        await healthAPI.checkHealth();
        if (!isConnected) {
          setIsConnected(true);
          setConnectionError(null);
        }
      } catch (error) {
        console.warn('Health check failed:', error);
        setIsConnected(false);
        setConnectionError('Connection to backend lost');
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(healthCheckInterval);
  }, [isConnected]);

  // Retry connection
  const retryConnection = async () => {
    setIsLoading(true);
    setConnectionError(null);

    try {
      await healthAPI.checkHealth();
      setIsConnected(true);
      
      if (!sessionId) {
        const newSessionId = await initializeSession();
        setSessionId(newSessionId);
      }
    } catch (error) {
      console.error('Retry connection failed:', error);
      setConnectionError(error.message || 'Failed to reconnect');
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    sessionId,
    isConnected,
    isLoading,
    connectionError,
    retryConnection
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}; 