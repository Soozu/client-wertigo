import React, { useState, useEffect } from 'react'
import { 
  BarChart3, 
  Users, 
  MapPin, 
  TrendingUp, 
  Activity, 
  Calendar,
  Search,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react'
import Header from '../components/Header'
import AdminSidebar from '../components/admin/AdminSidebar'
import AnalyticsOverview from '../components/admin/AnalyticsOverview'
import UserAnalytics from '../components/admin/UserAnalytics'
import TripAnalytics from '../components/admin/TripAnalytics'
import AIAnalytics from '../components/admin/AIAnalytics'
import SystemHealth from '../components/admin/SystemHealth'
import UserManagement from '../components/admin/UserManagement'
import { getAIAnalytics } from '../services/ticketApi'
import { healthAPI, authAPI } from '../services/api'
import './AdminDashboard.css'

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate: new Date().toISOString().split('T')[0] // today
  })
  const [analyticsData, setAnalyticsData] = useState({
    overview: {},
    users: {},
    trips: {},
    ai: {},
    system: {}
  })

  useEffect(() => {
    loadAnalyticsData()
  }, [dateRange])

  const loadAnalyticsData = async () => {
    setIsLoading(true)
    try {
      // Load analytics data from backend
      let aiAnalyticsData = { success: false, analytics: {} };
      
      // Load all other data in parallel
      const [
        overviewData,
        userData,
        tripData,
        systemHealth,
        popularDestinations,
        ticketData
      ] = await Promise.all([
        authAPI.admin.getAnalyticsOverview(dateRange.startDate, dateRange.endDate),
        authAPI.admin.getUserAnalytics(dateRange.startDate, dateRange.endDate),
        authAPI.admin.getTripAnalytics(dateRange.startDate, dateRange.endDate),
        authAPI.admin.getSystemMetrics(),
        authAPI.admin.getPopularDestinations(),
        authAPI.admin.getTicketAnalytics(dateRange.startDate, dateRange.endDate)
      ]);
      
      // Try to load AI analytics separately to handle potential errors
      try {
        aiAnalyticsData = await getAIAnalytics(dateRange.startDate, dateRange.endDate);
      } catch (aiError) {
        console.error('Error loading AI analytics:', aiError);
        // Continue with empty AI analytics data
      }

      // Merge the analytics data together
      setAnalyticsData({
        overview: overviewData.success ? overviewData.analytics : {},
        users: userData.success ? userData.analytics : {},
        trips: {
          ...tripData.success ? tripData.analytics : {},
          popularDestinations: popularDestinations.success ? popularDestinations.destinations : [],
          ticketData: ticketData.success ? ticketData.analytics : {}
        },
        ai: aiAnalyticsData.success ? aiAnalyticsData.analytics : {},
        system: systemHealth.success ? systemHealth.metrics : {}
      });
    } catch (error) {
      console.error('Error loading analytics data:', error);
      // If API fails, keep current data or set placeholder data
    } finally {
      setIsLoading(false);
    }
  }

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const exportData = () => {
    // Export analytics data as CSV/JSON
    const dataStr = JSON.stringify(analyticsData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `wertigo-analytics-${dateRange.startDate}-to-${dateRange.endDate}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return <AnalyticsOverview data={analyticsData.overview} isLoading={isLoading} />
      case 'users':
        return <UserAnalytics data={analyticsData.users} isLoading={isLoading} />
      case 'trips':
        return <TripAnalytics data={analyticsData.trips} isLoading={isLoading} />
      case 'ai':
        return <AIAnalytics data={analyticsData.ai} isLoading={isLoading} />
      case 'system':
        return <SystemHealth data={analyticsData.system} isLoading={isLoading} />
      case 'user-management':
        return <UserManagement isLoading={isLoading} />
      default:
        return <AnalyticsOverview data={analyticsData.overview} isLoading={isLoading} />
    }
  }

  return (
    <div className="admin-dashboard">
      <Header />
      
      <div className="admin-layout">
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <main className="admin-main">
          <div className="admin-header">
            <div className="admin-title">
              <h1>WerTigo Analytics Dashboard</h1>
              <p>Monitor and analyze your travel platform performance</p>
            </div>
            
            <div className="admin-controls">
              <div className="date-range-picker">
                <label>From:</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                  className="date-input"
                />
                <label>To:</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                  className="date-input"
                />
              </div>
              
              <div className="admin-actions">
                <button 
                  className="admin-btn secondary"
                  onClick={loadAnalyticsData}
                  disabled={isLoading}
                >
                  <RefreshCw size={16} />
                  {isLoading ? 'Loading...' : 'Refresh'}
                </button>
                
                <button 
                  className="admin-btn primary"
                  onClick={exportData}
                >
                  <Download size={16} />
                  Export Data
                </button>
              </div>
            </div>
          </div>

          <div className="admin-content">
            {renderActiveTab()}
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminDashboard 