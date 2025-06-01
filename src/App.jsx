import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { SessionProvider } from './context/SessionContext'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import TravelPlanner from './pages/TravelPlanner'
import TripViewer from './pages/TripViewer'
import TicketTracker from './pages/TicketTracker'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <SessionProvider>
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route 
                path="/planner" 
                element={
                  <ProtectedRoute>
                    <TravelPlanner />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/trip/:tripId" 
                element={<TripViewer />} 
              />
              <Route 
                path="/tracker" 
                element={
                  <ProtectedRoute>
                    <TicketTracker />
                  </ProtectedRoute>
                } 
              />
        </Routes>
      </div>
    </Router>
      </SessionProvider>
    </AuthProvider>
  )
}

export default App 