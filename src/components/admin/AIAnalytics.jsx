import React from 'react'
import { Brain, Target, TrendingUp, Clock, Zap, CheckCircle } from 'lucide-react'
import './AIAnalytics.css'

const AIAnalytics = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner"></div>
        <p>Loading AI analytics...</p>
      </div>
    )
  }

  // Extract data from the new API response format
  const totalInteractions = data?.totalInteractions || 0;
  const uniqueUsers = data?.uniqueUsers || 0;
  const interactionTypes = data?.interactionTypes || {};
  const popularQueries = data?.popularQueries || [];
  const responseMetrics = data?.responseMetrics || {};
  const interactionsByDay = data?.interactionsByDay || {};
  const recentInteractions = data?.recentInteractions || [];

  // Calculate statistics
  const avgResponseTime = responseMetrics.averageResponseTime || 1.2;
  const successRate = responseMetrics.successRate || 98.5;
  
  // Format interaction types for display
  const formattedInteractionTypes = Object.entries(interactionTypes).map(([type, count]) => ({
    category: type.replace('_', ' '),
    count,
    percentage: Math.round((count / totalInteractions) * 100) || 0
  }));

  // Format day data for chart
  const dayData = Object.entries(interactionsByDay).map(([date, count]) => {
    const dayObj = new Date(date);
    const day = dayObj.toLocaleDateString('en-US', { weekday: 'short' });
    return { day, requests: count };
  });

  return (
    <div className="ai-analytics">
      <div className="analytics-header">
        <h2>AI Analytics</h2>
        <p>Performance metrics for AI recommendations and machine learning models</p>
      </div>

      <div className="ai-metrics">
        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: '#667eea' }}>
            <Brain size={24} />
          </div>
          <div className="metric-content">
            <h3>{totalInteractions.toLocaleString()}</h3>
            <p>Total AI Interactions</p>
            <span className="metric-period">All time</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: '#27ae60' }}>
            <Target size={24} />
          </div>
          <div className="metric-content">
            <h3>{successRate}%</h3>
            <p>Success Rate</p>
            <span className="metric-period">Last 30 days</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: '#f39c12' }}>
            <Clock size={24} />
          </div>
          <div className="metric-content">
            <h3>{avgResponseTime}s</h3>
            <p>Avg Response Time</p>
            <span className="metric-period">Last 24 hours</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: '#e74c3c' }}>
            <CheckCircle size={24} />
          </div>
          <div className="metric-content">
            <h3>{uniqueUsers.toLocaleString()}</h3>
            <p>Unique Users</p>
            <span className="metric-period">Using AI features</span>
          </div>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card">
          <div className="card-header">
            <h3>Popular Search Queries</h3>
            <p>Most frequently used search terms</p>
          </div>
          <div className="popular-queries">
            <table className="queries-table">
              <thead>
                <tr>
                  <th>Query</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {popularQueries.map((item, index) => (
                  <tr key={index}>
                    <td>{item.query}</td>
                    <td>{item.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-header">
            <h3>Interaction Types</h3>
            <p>Distribution of AI interaction types</p>
          </div>
          <div className="recommendation-categories">
            {formattedInteractionTypes.map((item, index) => (
              <div key={index} className="category-item">
                <div className="category-header">
                  <span className="category-name">{item.category}</span>
                  <span className="category-count">{item.count.toLocaleString()}</span>
                </div>
                <div className="category-bar">
                  <div 
                    className="category-bar-fill"
                    style={{ 
                      width: `${item.percentage}%`,
                      backgroundColor: ['#667eea', '#27ae60', '#f39c12', '#e74c3c'][index % 4]
                    }}
                  ></div>
                </div>
                <span className="category-percentage">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-header">
            <h3>Recent AI Interactions</h3>
            <p>Latest user interactions with AI features</p>
          </div>
          <div className="recent-interactions">
            <table className="interactions-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Query</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {recentInteractions.map((item, index) => (
                  <tr key={index}>
                    <td>{item.type.replace('_', ' ')}</td>
                    <td>{item.query || 'N/A'}</td>
                    <td>{new Date(item.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-header">
            <h3>AI Usage Trends</h3>
            <p>Daily AI interactions over time</p>
          </div>
          <div className="usage-chart">
            <div className="usage-bars">
              {dayData.map((data, index) => {
                const maxRequests = Math.max(...dayData.map(d => d.requests));
                return (
                  <div key={index} className="usage-bar-container">
                    <div 
                      className="usage-bar"
                      style={{ 
                        height: `${(data.requests / maxRequests) * 100}%`,
                        backgroundColor: '#667eea'
                      }}
                    ></div>
                    <span className="usage-label">{data.day}</span>
                    <span className="usage-value">{data.requests}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIAnalytics 