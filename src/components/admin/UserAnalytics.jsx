import React from 'react'
import { Users, UserPlus, UserCheck, MapPin, TrendingUp } from 'lucide-react'

const UserAnalytics = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner"></div>
        <p>Loading user analytics...</p>
      </div>
    )
  }

  return (
    <div className="user-analytics">
      <div className="analytics-header">
        <h2>User Analytics</h2>
        <p>Detailed insights into user behavior and demographics</p>
      </div>

      <div className="user-metrics">
        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: '#667eea' }}>
            <UserPlus size={24} />
          </div>
          <div className="metric-content">
            <h3>{data.newUsers?.toLocaleString() || '0'}</h3>
            <p>New Users</p>
            <span className="metric-period">This month</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: '#27ae60' }}>
            <UserCheck size={24} />
          </div>
          <div className="metric-content">
            <h3>{data.returningUsers?.toLocaleString() || '0'}</h3>
            <p>Returning Users</p>
            <span className="metric-period">This month</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: '#f39c12' }}>
            <TrendingUp size={24} />
          </div>
          <div className="metric-content">
            <h3>{data.userGrowth || '0'}%</h3>
            <p>Growth Rate</p>
            <span className="metric-period">Month over month</span>
          </div>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card">
          <div className="card-header">
            <h3>User Distribution by City</h3>
            <p>Top cities where users are located</p>
          </div>
          <div className="city-list">
            {data.topCities?.map((city, index) => (
              <div key={index} className="city-item">
                <div className="city-info">
                  <MapPin size={16} />
                  <span className="city-name">{city.city}</span>
                </div>
                <div className="city-stats">
                  <span className="city-users">{city.users} users</span>
                  <div className="city-bar">
                    <div 
                      className="city-bar-fill"
                      style={{ 
                        width: `${(city.users / (data.topCities[0]?.users || 1)) * 100}%`,
                        backgroundColor: '#667eea'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            )) || []}
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-header">
            <h3>User Engagement</h3>
            <p>How users interact with the platform</p>
          </div>
          <div className="engagement-metrics">
            <div className="engagement-item">
              <div className="engagement-label">Average Session Duration</div>
              <div className="engagement-value">8m 32s</div>
            </div>
            <div className="engagement-item">
              <div className="engagement-label">Pages per Session</div>
              <div className="engagement-value">4.7</div>
            </div>
            <div className="engagement-item">
              <div className="engagement-label">Bounce Rate</div>
              <div className="engagement-value">23.4%</div>
            </div>
            <div className="engagement-item">
              <div className="engagement-label">Return Visitor Rate</div>
              <div className="engagement-value">67.8%</div>
            </div>
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-header">
            <h3>User Journey</h3>
            <p>Common paths users take through the app</p>
          </div>
          <div className="journey-flow">
            <div className="journey-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Landing Page</h4>
                <p>1,247 users</p>
              </div>
            </div>
            <div className="journey-arrow">→</div>
            <div className="journey-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Search/Browse</h4>
                <p>1,089 users (87%)</p>
              </div>
            </div>
            <div className="journey-arrow">→</div>
            <div className="journey-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Trip Planning</h4>
                <p>756 users (61%)</p>
              </div>
            </div>
            <div className="journey-arrow">→</div>
            <div className="journey-step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h4>Trip Creation</h4>
                <p>423 users (34%)</p>
              </div>
            </div>
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-header">
            <h3>Device & Browser Analytics</h3>
            <p>How users access the platform</p>
          </div>
          <div className="device-stats">
            <div className="device-category">
              <h4>Device Type</h4>
              <div className="device-list">
                <div className="device-item">
                  <span>Mobile</span>
                  <span>68%</span>
                </div>
                <div className="device-item">
                  <span>Desktop</span>
                  <span>28%</span>
                </div>
                <div className="device-item">
                  <span>Tablet</span>
                  <span>4%</span>
                </div>
              </div>
            </div>
            <div className="device-category">
              <h4>Top Browsers</h4>
              <div className="device-list">
                <div className="device-item">
                  <span>Chrome</span>
                  <span>72%</span>
                </div>
                <div className="device-item">
                  <span>Safari</span>
                  <span>18%</span>
                </div>
                <div className="device-item">
                  <span>Firefox</span>
                  <span>7%</span>
                </div>
                <div className="device-item">
                  <span>Edge</span>
                  <span>3%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserAnalytics 