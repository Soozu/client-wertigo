import React from 'react'
import { MapPin, Calendar, Users, DollarSign, TrendingUp, Clock } from 'lucide-react'

const TripAnalytics = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner"></div>
        <p>Loading trip analytics...</p>
      </div>
    )
  }

  return (
    <div className="trip-analytics">
      <div className="analytics-header">
        <h2>Trip Analytics</h2>
        <p>Insights into trip planning patterns and popular destinations</p>
      </div>

      <div className="trip-metrics">
        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: '#667eea' }}>
            <MapPin size={24} />
          </div>
          <div className="metric-content">
            <h3>{data.totalTrips?.toLocaleString() || '0'}</h3>
            <p>Total Trips</p>
            <span className="metric-period">All time</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: '#27ae60' }}>
            <Calendar size={24} />
          </div>
          <div className="metric-content">
            <h3>{data.completedTrips?.toLocaleString() || '0'}</h3>
            <p>Completed Trips</p>
            <span className="metric-period">All time</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: '#f39c12' }}>
            <span style={{ fontSize: '24px' }}>₱</span>
          </div>
          <div className="metric-content">
            <h3>₱{data.averageBudget?.toLocaleString() || '0'}</h3>
            <p>Average Budget</p>
            <span className="metric-period">Per trip</span>
          </div>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card">
          <div className="card-header">
            <h3>Budget Distribution</h3>
            <p>How travelers allocate their budgets</p>
          </div>
          <div className="budget-chart">
            {data.budgetDistribution?.map((budget, index) => (
              <div key={index} className="budget-item">
                <div className="budget-range">{budget.range}</div>
                <div className="budget-bar">
                  <div 
                    className="budget-bar-fill"
                    style={{ 
                      width: `${(budget.count / Math.max(...(data.budgetDistribution?.map(b => b.count) || [1]))) * 100}%`,
                      backgroundColor: ['#667eea', '#27ae60', '#f39c12', '#e74c3c'][index % 4]
                    }}
                  ></div>
                </div>
                <div className="budget-count">{budget.count} trips</div>
              </div>
            )) || []}
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-header">
            <h3>Trip Duration Trends</h3>
            <p>How long travelers typically stay</p>
          </div>
          <div className="duration-stats">
            <div className="duration-item">
              <div className="duration-label">1-2 Days</div>
              <div className="duration-percentage">28%</div>
              <div className="duration-bar">
                <div className="duration-bar-fill" style={{ width: '28%', backgroundColor: '#667eea' }}></div>
              </div>
            </div>
            <div className="duration-item">
              <div className="duration-label">3-5 Days</div>
              <div className="duration-percentage">45%</div>
              <div className="duration-bar">
                <div className="duration-bar-fill" style={{ width: '45%', backgroundColor: '#27ae60' }}></div>
              </div>
            </div>
            <div className="duration-item">
              <div className="duration-label">6-10 Days</div>
              <div className="duration-percentage">22%</div>
              <div className="duration-bar">
                <div className="duration-bar-fill" style={{ width: '22%', backgroundColor: '#f39c12' }}></div>
              </div>
            </div>
            <div className="duration-item">
              <div className="duration-label">10+ Days</div>
              <div className="duration-percentage">5%</div>
              <div className="duration-bar">
                <div className="duration-bar-fill" style={{ width: '5%', backgroundColor: '#e74c3c' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-header">
            <h3>Seasonal Trends</h3>
            <p>Trip planning patterns throughout the year</p>
          </div>
          <div className="seasonal-chart">
            <div className="season-bars">
              {[
                { month: 'Jan', trips: 245 },
                { month: 'Feb', trips: 189 },
                { month: 'Mar', trips: 312 },
                { month: 'Apr', trips: 398 },
                { month: 'May', trips: 445 },
                { month: 'Jun', trips: 234 },
                { month: 'Jul', trips: 189 },
                { month: 'Aug', trips: 167 },
                { month: 'Sep', trips: 298 },
                { month: 'Oct', trips: 356 },
                { month: 'Nov', trips: 423 },
                { month: 'Dec', trips: 567 }
              ].map((data, index) => (
                <div key={index} className="season-bar-container">
                  <div 
                    className="season-bar"
                    style={{ 
                      height: `${(data.trips / 567) * 100}%`,
                      backgroundColor: '#667eea'
                    }}
                  ></div>
                  <span className="season-label">{data.month}</span>
                  <span className="season-value">{data.trips}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-header">
            <h3>Group Size Analysis</h3>
            <p>How many people typically travel together</p>
          </div>
          <div className="group-size-stats">
            <div className="group-item">
              <Users size={20} />
              <div className="group-info">
                <span className="group-size">Solo (1 person)</span>
                <span className="group-count">892 trips (23%)</span>
              </div>
            </div>
            <div className="group-item">
              <Users size={20} />
              <div className="group-info">
                <span className="group-size">Couple (2 people)</span>
                <span className="group-count">1,456 trips (37%)</span>
              </div>
            </div>
            <div className="group-item">
              <Users size={20} />
              <div className="group-info">
                <span className="group-size">Small Group (3-5 people)</span>
                <span className="group-count">1,234 trips (32%)</span>
              </div>
            </div>
            <div className="group-item">
              <Users size={20} />
              <div className="group-info">
                <span className="group-size">Large Group (6+ people)</span>
                <span className="group-count">309 trips (8%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TripAnalytics 