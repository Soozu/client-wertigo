# Admin Panel

This directory contains the admin panel pages and components for the Wertigo travel management system.

## Structure

```
admin/
├── AdminDashboard.jsx          # Main admin dashboard page
├── AdminDashboard.css          # Dashboard styles
└── README.md                   # This file

components/admin/
├── AdminSidebar.jsx            # Navigation sidebar
├── AdminSidebar.css            # Sidebar styles
├── DashboardOverview.jsx       # Overview dashboard component
├── DashboardOverview.css       # Overview styles
├── UserAnalytics.jsx           # User analytics and management
├── UserAnalytics.css           # User analytics styles
├── TicketAnalytics.jsx         # Ticket analytics and management
├── TicketAnalytics.css         # Ticket analytics styles
├── SystemMetrics.jsx           # System health and performance
├── SystemMetrics.css           # System metrics styles
├── ReportsSection.jsx          # Reports generation and management
└── ReportsSection.css          # Reports styles
```

## Features

### Dashboard Overview
- Key statistics and metrics
- Quick actions for common tasks
- Popular destinations tracking
- Recent activity feed

### User Analytics
- User registration and activity statistics
- User management and role assignment
- Growth rate tracking
- User behavior analytics

### Ticket Analytics
- Ticket generation and completion statistics
- Ticket type breakdown (standard, premium, VIP)
- Performance metrics and success rates
- Recent ticket activities

### System Metrics
- Real-time system health monitoring
- Python and Express backend status
- Performance metrics (CPU, memory, response time)
- API statistics and success rates

### Reports Section
- Generate comprehensive analytics reports
- Download and manage reports
- Date range selection for custom reports
- Quick statistics overview

## Access Control

The admin panel is protected by role-based access control:
- Only users with `role: 'admin'` can access the admin panel
- Authentication is handled by the `ProtectedAdminRoute` component
- Session validation ensures secure access

## Navigation

The admin panel uses a collapsible sidebar navigation with the following sections:
- 📊 Dashboard (Overview)
- 👥 User Analytics
- 🎫 Ticket Analytics
- ⚙️ System Metrics
- 📈 Reports

## Styling

The admin panel uses a modern, professional design with:
- Gradient backgrounds and smooth animations
- Responsive design for mobile and desktop
- Consistent color scheme and typography
- Interactive hover effects and transitions
- Card-based layout for better organization

## API Integration

The admin panel integrates with the following API endpoints:
- `authAPI.admin.*` - Admin-specific endpoints
- `healthAPI.*` - System health and metrics
- Mock data is used when real endpoints are unavailable

## Usage

To access the admin panel:
1. Log in with an admin account
2. Navigate to `/admin`
3. Use the sidebar to switch between different sections
4. Generate reports and monitor system performance

## Development

When adding new admin features:
1. Create components in `components/admin/`
2. Add corresponding CSS files
3. Update the sidebar navigation in `AdminSidebar.jsx`
4. Add new routes if needed in the main dashboard
5. Ensure proper error handling and loading states 