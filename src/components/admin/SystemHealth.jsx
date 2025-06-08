import React from 'react'
import { Activity, Server, Database, Cpu, HardDrive, Wifi, AlertTriangle, CheckCircle } from 'lucide-react'

const SystemHealth = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner"></div>
        <p>Loading system health...</p>
      </div>
    )
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return '#27ae60'
      case 'warning':
        return '#f39c12'
      case 'error':
      case 'offline':
        return '#e74c3c'
      default:
        return '#6c757d'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return <CheckCircle size={20} />
      case 'warning':
      case 'error':
      case 'offline':
        return <AlertTriangle size={20} />
      default:
        return <Activity size={20} />
    }
  }

  return (
    <div className="system-health">
      <div className="analytics-header">
        <h2>System Health</h2>
        <p>Monitor backend performance, server status, and system metrics</p>
      </div>

      <div className="health-overview">
        <div className="health-card">
          <div className="health-icon" style={{ backgroundColor: '#667eea' }}>
            <Server size={24} />
          </div>
          <div className="health-content">
            <h3>Express Server</h3>
            <div className="health-status online">
              <CheckCircle size={16} />
              <span>Online</span>
            </div>
            <p>Port 3001 • Uptime: 99.8%</p>
          </div>
        </div>

        <div className="health-card">
          <div className="health-icon" style={{ backgroundColor: '#27ae60' }}>
            <Server size={24} />
          </div>
          <div className="health-content">
            <h3>Python AI Server</h3>
            <div className="health-status online">
              <CheckCircle size={16} />
              <span>Online</span>
            </div>
            <p>Port 5000 • Uptime: 99.5%</p>
          </div>
        </div>

        <div className="health-card">
          <div className="health-icon" style={{ backgroundColor: '#f39c12' }}>
            <Database size={24} />
          </div>
          <div className="health-content">
            <h3>MySQL Database</h3>
            <div className="health-status online">
              <CheckCircle size={16} />
              <span>Connected</span>
            </div>
            <p>Response: 12ms • Uptime: 99.9%</p>
          </div>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card">
          <div className="card-header">
            <h3>Server Performance</h3>
            <p>Real-time server metrics and performance indicators</p>
          </div>
          <div className="performance-metrics">
            <div className="metric-item">
              <div className="metric-icon">
                <Cpu size={20} />
              </div>
              <div className="metric-info">
                <h4>CPU Usage</h4>
                <div className="metric-bar">
                  <div className="metric-bar-fill" style={{ width: '34%', backgroundColor: '#27ae60' }}></div>
                </div>
                <span>34% (Normal)</span>
              </div>
            </div>

            <div className="metric-item">
              <div className="metric-icon">
                <HardDrive size={20} />
              </div>
              <div className="metric-info">
                <h4>Memory Usage</h4>
                <div className="metric-bar">
                  <div className="metric-bar-fill" style={{ width: '67%', backgroundColor: '#f39c12' }}></div>
                </div>
                <span>67% (Warning)</span>
              </div>
            </div>

            <div className="metric-item">
              <div className="metric-icon">
                <Database size={20} />
              </div>
              <div className="metric-info">
                <h4>Disk Usage</h4>
                <div className="metric-bar">
                  <div className="metric-bar-fill" style={{ width: '45%', backgroundColor: '#27ae60' }}></div>
                </div>
                <span>45% (Normal)</span>
              </div>
            </div>

            <div className="metric-item">
              <div className="metric-icon">
                <Wifi size={20} />
              </div>
              <div className="metric-info">
                <h4>Network I/O</h4>
                <div className="metric-bar">
                  <div className="metric-bar-fill" style={{ width: '23%', backgroundColor: '#27ae60' }}></div>
                </div>
                <span>23% (Low)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-header">
            <h3>API Response Times</h3>
            <p>Average response times for different endpoints</p>
          </div>
          <div className="response-times">
            <div className="endpoint-item">
              <div className="endpoint-name">/api/auth/*</div>
              <div className="endpoint-time">145ms</div>
              <div className="endpoint-status healthy">Healthy</div>
            </div>
            <div className="endpoint-item">
              <div className="endpoint-name">/api/tickets/*</div>
              <div className="endpoint-time">89ms</div>
              <div className="endpoint-status healthy">Healthy</div>
            </div>
            <div className="endpoint-item">
              <div className="endpoint-name">/api/trackers/*</div>
              <div className="endpoint-time">234ms</div>
              <div className="endpoint-status warning">Slow</div>
            </div>
            <div className="endpoint-item">
              <div className="endpoint-name">/recommend</div>
              <div className="endpoint-time">1.2s</div>
              <div className="endpoint-status healthy">Normal</div>
            </div>
            <div className="endpoint-item">
              <div className="endpoint-name">/geocode</div>
              <div className="endpoint-time">567ms</div>
              <div className="endpoint-status healthy">Healthy</div>
            </div>
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-header">
            <h3>Database Performance</h3>
            <p>Database connection and query performance metrics</p>
          </div>
          <div className="database-metrics">
            <div className="db-metric">
              <h4>Active Connections</h4>
              <div className="db-value">23/100</div>
              <div className="db-status healthy">Normal</div>
            </div>
            <div className="db-metric">
              <h4>Query Response Time</h4>
              <div className="db-value">12ms</div>
              <div className="db-status healthy">Fast</div>
            </div>
            <div className="db-metric">
              <h4>Slow Queries</h4>
              <div className="db-value">2</div>
              <div className="db-status warning">Monitor</div>
            </div>
            <div className="db-metric">
              <h4>Database Size</h4>
              <div className="db-value">2.3GB</div>
              <div className="db-status healthy">Normal</div>
            </div>
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-header">
            <h3>Error Logs</h3>
            <p>Recent system errors and warnings</p>
          </div>
          <div className="error-logs">
            <div className="log-item warning">
              <div className="log-time">2 hours ago</div>
              <div className="log-message">High memory usage detected on Express server</div>
              <div className="log-source">Express Server</div>
            </div>
            <div className="log-item error">
              <div className="log-time">4 hours ago</div>
              <div className="log-message">Database connection timeout (resolved)</div>
              <div className="log-source">MySQL</div>
            </div>
            <div className="log-item info">
              <div className="log-time">6 hours ago</div>
              <div className="log-message">AI model retrained successfully</div>
              <div className="log-source">Python AI</div>
            </div>
            <div className="log-item warning">
              <div className="log-time">8 hours ago</div>
              <div className="log-message">Slow query detected: /api/trackers/search</div>
              <div className="log-source">Express Server</div>
            </div>
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-header">
            <h3>Traffic Monitoring</h3>
            <p>Real-time traffic and request patterns</p>
          </div>
          <div className="traffic-chart">
            <div className="traffic-bars">
              {[
                { hour: '00', requests: 45 },
                { hour: '04', requests: 23 },
                { hour: '08', requests: 156 },
                { hour: '12', requests: 234 },
                { hour: '16', requests: 189 },
                { hour: '20', requests: 167 },
                { hour: '24', requests: 89 }
              ].map((data, index) => (
                <div key={index} className="traffic-bar-container">
                  <div 
                    className="traffic-bar"
                    style={{ 
                      height: `${(data.requests / 234) * 100}%`,
                      backgroundColor: '#667eea'
                    }}
                  ></div>
                  <span className="traffic-label">{data.hour}:00</span>
                  <span className="traffic-value">{data.requests}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-header">
            <h3>System Alerts</h3>
            <p>Active alerts and notifications</p>
          </div>
          <div className="system-alerts">
            <div className="alert-item warning">
              <AlertTriangle size={20} />
              <div className="alert-content">
                <h4>Memory Usage High</h4>
                <p>Express server memory usage at 67%</p>
                <span className="alert-time">2 hours ago</span>
              </div>
            </div>
            <div className="alert-item info">
              <CheckCircle size={20} />
              <div className="alert-content">
                <h4>Backup Completed</h4>
                <p>Daily database backup completed successfully</p>
                <span className="alert-time">6 hours ago</span>
              </div>
            </div>
            <div className="alert-item warning">
              <AlertTriangle size={20} />
              <div className="alert-content">
                <h4>Slow Query Detected</h4>
                <p>Query taking longer than 500ms threshold</p>
                <span className="alert-time">8 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SystemHealth 