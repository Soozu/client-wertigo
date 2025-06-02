import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializePythonSession, healthAPI } from '../services/api';

const SessionContext = createContext();

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

export const SessionProvider = ({ children }) => {
  const [pythonSessionId, setPythonSessionId] = useState(null);
  const [isPythonConnected, setIsPythonConnected] = useState(false);
  const [isExpressConnected, setIsExpressConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(null);

  // Initialize sessions and check backend connections
  useEffect(() => {
    const initializeApp = async () => {
      setIsLoading(true);
      setConnectionError(null);

      try {
        // Check both backend health
        const healthStatus = await healthAPI.checkHealth();
        
        setIsPythonConnected(healthStatus.pythonConnected);
        setIsExpressConnected(healthStatus.expressConnected);

        // Initialize Python session if Python backend is available
        if (healthStatus.pythonConnected) {
          try {
            const sessionId = await initializePythonSession();
            setPythonSessionId(sessionId);
            console.log('Python session initialized:', sessionId);
          } catch (error) {
            console.error('Failed to initialize Python session:', error);
            setIsPythonConnected(false);
          }
        }

        // Check if at least one backend is connected
        if (!healthStatus.pythonConnected && !healthStatus.expressConnected) {
          throw new Error('Both backends are unavailable');
        } else if (!healthStatus.expressConnected) {
          setConnectionError('Authentication service unavailable - some features may not work');
        } else if (!healthStatus.pythonConnected) {
          setConnectionError('AI recommendation service unavailable - some features may not work');
        }
        
        console.log('App initialized - Python:', healthStatus.pythonConnected, 'Express:', healthStatus.expressConnected);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setConnectionError(error.message || 'Failed to connect to backend services');
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Periodic health check
  useEffect(() => {
    const healthCheckInterval = setInterval(async () => {
      try {
        const healthStatus = await healthAPI.checkHealth();
        
        // Update connection status
        const pythonStatusChanged = isPythonConnected !== healthStatus.pythonConnected;
        const expressStatusChanged = isExpressConnected !== healthStatus.expressConnected;
        
        if (pythonStatusChanged || expressStatusChanged) {
          setIsPythonConnected(healthStatus.pythonConnected);
          setIsExpressConnected(healthStatus.expressConnected);
          
          // Update connection error message
          if (!healthStatus.pythonConnected && !healthStatus.expressConnected) {
            setConnectionError('Both backends are unavailable');
          } else if (!healthStatus.expressConnected) {
            setConnectionError('Authentication service unavailable - some features may not work');
          } else if (!healthStatus.pythonConnected) {
            setConnectionError('AI recommendation service unavailable - some features may not work');
          } else {
            setConnectionError(null);
          }
          
          console.log('Connection status updated - Python:', healthStatus.pythonConnected, 'Express:', healthStatus.expressConnected);
        }
        
        // Reinitialize Python session if it was disconnected and now reconnected
        if (!isPythonConnected && healthStatus.pythonConnected && !pythonSessionId) {
          try {
            const sessionId = await initializePythonSession();
            setPythonSessionId(sessionId);
            console.log('Python session reinitialized:', sessionId);
          } catch (error) {
            console.error('Failed to reinitialize Python session:', error);
          }
        }
      } catch (error) {
        console.warn('Health check failed:', error);
        setIsPythonConnected(false);
        setIsExpressConnected(false);
        setConnectionError('Connection to backend services lost');
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(healthCheckInterval);
  }, [isPythonConnected, isExpressConnected, pythonSessionId]);

  // Retry connection
  const retryConnection = async () => {
    setIsLoading(true);
    setConnectionError(null);

    try {
      const healthStatus = await healthAPI.checkHealth();
      
      setIsPythonConnected(healthStatus.pythonConnected);
      setIsExpressConnected(healthStatus.expressConnected);
      
      // Initialize Python session if available and not already initialized
      if (healthStatus.pythonConnected && !pythonSessionId) {
        const sessionId = await initializePythonSession();
        setPythonSessionId(sessionId);
      }
      
      // Update error message based on what's available
      if (!healthStatus.pythonConnected && !healthStatus.expressConnected) {
        setConnectionError('Both backends are still unavailable');
      } else if (!healthStatus.expressConnected) {
        setConnectionError('Authentication service unavailable - some features may not work');
      } else if (!healthStatus.pythonConnected) {
        setConnectionError('AI recommendation service unavailable - some features may not work');
      }
      
    } catch (error) {
      console.error('Retry connection failed:', error);
      setConnectionError(error.message || 'Failed to reconnect to backend services');
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    // Python backend session
    pythonSessionId,
    isPythonConnected,
    
    // Express backend connection
    isExpressConnected,
    
    // Overall status
    isConnected: isPythonConnected || isExpressConnected,
    isFullyConnected: isPythonConnected && isExpressConnected,
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