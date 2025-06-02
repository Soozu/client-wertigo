import React from 'react'
import { 
  Users, 
  MapPin, 
  Brain, 
  TrendingUp, 
  Clock, 
  Target,
  ArrowUp,
  ArrowDown
} from 'lucide-react'

const AnalyticsOverview = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner"></div>
        <p>Loading analytics overview...</p>
      </div>
    )
  }

  const metrics = [
    {
      title: 'Total Users',
      value: data.totalUsers?.toLocaleString() || '0',
      icon: Users,
      color: '#667eea',
      change: '+12.3%',
      trend: 'up'
    },
    {
      title: 'Total Trips',
      value: data.totalTrips?.toLocaleString() || '0',
      icon: MapPin,
      color: '#27ae60',
      change: '+8.7%',
      trend: 'up'
    },
    {
      title: 'AI Recommendations',
      value: data.totalRecommendations?.toLocaleString() || '0',
      icon: Brain,
      color: '#f39c12',
      change: '+15.2%',
      trend: 'up'
    },
    {
      title: 'Active Users',
      value: data.activeUsers?.toLocaleString() || '0',
      icon: TrendingUp,
      color: '#e74c3c',
      change: '+5.4%',
      trend: 'up'
    },
    {
      title: 'Conversion Rate',
      value: `${data.conversionRate || 0}%`,
      icon: Target,
      color: '#9b59b6',
      change: '+2.1%',
      trend: 'up'
    },
    {
      title: 'Avg Trip Duration',
      value: `${data.avgTripDuration || 0} days`,
      icon: Clock,
      color: '#3498db',
      change: '-0.3%',
      trend: 'down'
    }
  ]

  return (
    <div className="analytics-overview">
      <div className="overview-header">
        <h2>Analytics Overview</h2>
        <p>Key performance indicators for your travel platform</p>
      </div>

      <div className="metrics-grid">
        {metrics.map((metric, index) => {
          const Icon = metric.icon
          const TrendIcon = metric.trend === 'up' ? ArrowUp : ArrowDown
          
          return (
            <div key={index} className="metric-card">
              <div className="metric-header">
                <div 
                  className="metric-icon"
                  style={{ backgroundColor: metric.color }}
                >
                  <Icon size={24} />
                </div>
                <div className={`metric-trend ${metric.trend}`}>
                  <TrendIcon size={16} />
                  <span>{metric.change}</span>
                </div>
              </div>
              
              <div className="metric-content">
                <h3>{metric.value}</h3>
                <p>{metric.title}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="overview-charts">
        <div className="chart-section">
          <div className="chart-card">
            <div className="chart-header">
              <h3>User Growth Trend</h3>
              <p>Monthly user registration over time</p>
            </div>
            <div className="chart-placeholder">
              <div className="chart-bars">
                {[65, 78, 82, 91, 95, 88, 92, 97, 89, 94, 98, 102].map((height, index) => (
                  <div 
                    key={index}
                    className="chart-bar"
                    style={{ 
                      height: `${height}%`,
                      backgroundColor: '#667eea',
                      opacity: 0.7 + (index * 0.025)
                    }}
                  ></div>
                ))}
              </div>
              <div className="chart-labels">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => (
                  <span key={index}>{month}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsOverview 