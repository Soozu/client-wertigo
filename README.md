# WerTigo - Travel Planning React App

A modern React frontend application for travel planning with AI-powered chat interface, interactive maps, and ticket tracking functionality.

## 🚀 Features

- **Modern React Architecture**: Built with React 18 and JavaScript + SWC for fast compilation
- **Interactive Travel Planning**: AI-powered chat interface for trip planning
- **Interactive Maps**: Leaflet-based maps with custom markers and route planning
- **Ticket Tracking**: Search and manage travel tickets
- **Responsive Design**: Mobile-first design that works on all devices
- **Modern UI/UX**: Clean, modern interface with smooth animations

## 🛠️ Tech Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite with SWC plugin
- **Routing**: React Router DOM
- **Maps**: React Leaflet + Leaflet
- **Icons**: Lucide React + Font Awesome
- **Styling**: CSS3 with CSS Variables
- **Date Picker**: React Flatpickr
- **HTTP Client**: Axios

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd wertigo-react
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🏗️ Project Structure

```
src/
├── components/          # Reusable React components
│   ├── Header.jsx      # Navigation header
│   ├── ChatInterface.jsx # AI chat interface
│   ├── MapComponent.jsx # Interactive map
│   ├── TripPlanner.jsx # Trip planning interface
│   ├── TicketSearch.jsx # Ticket search form
│   ├── TicketDetails.jsx # Ticket details view
│   ├── TicketList.jsx  # Ticket list view
│   └── *.css          # Component styles
├── pages/              # Page components
│   ├── Home.jsx       # Landing page
│   ├── TravelPlanner.jsx # Travel planning page
│   ├── TicketTracker.jsx # Ticket tracking page
│   └── *.css          # Page styles
├── App.jsx            # Main app component
├── main.jsx           # App entry point
├── index.css          # Global styles
└── App.css            # App-specific styles
```

## 🎯 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌟 Key Features

### Home Page
- Hero section with image slideshow
- Typing animation for destinations
- Team member profiles
- Responsive design

### Travel Planner
- AI-powered chat interface for trip planning
- Interactive map with custom markers
- Destination management
- Trip summary and budget tracking

### Ticket Tracker
- Search tickets by ID or email
- View ticket details and itineraries
- Responsive ticket cards
- Error handling and loading states

## 🎨 Styling

The application uses a modern CSS approach with:
- CSS Custom Properties (variables) for theming
- Responsive design with mobile-first approach
- Smooth animations and transitions
- Modern card-based layouts
- Consistent spacing and typography

### Color Scheme
- Primary: `#abf600` (Lime Green)
- Secondary: `#191f36` (Dark Blue)
- Accent: `#3498db` (Blue)
- Background: Gradient from `#0b1426` to `#1e3c72`

## 🗺️ Map Integration

The application uses Leaflet for interactive maps with:
- Custom markers for different destination categories
- Popup information for destinations
- Automatic map bounds adjustment
- Responsive map container

## 💬 Chat Interface

Features include:
- Real-time messaging interface
- Typing indicators
- Message history
- Minimizable chat window
- Mobile-responsive design

## 📱 Responsive Design

The application is fully responsive with breakpoints at:
- Mobile: `480px` and below
- Tablet: `768px` and below
- Desktop: `1200px` and above

## 🔧 Configuration

### Vite Configuration
The app uses Vite with SWC for fast compilation:
- Hot Module Replacement (HMR)
- Fast refresh for React components
- Optimized build output
- Source maps for debugging

### Environment Setup
Make sure you have:
- Node.js 16+ installed
- npm or yarn package manager
- Modern browser with ES6+ support

## 🚀 Deployment

To deploy the application:

1. **Build for production**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your hosting service

3. **Configure routing** for single-page application (SPA)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

- **Christian Gabrielle B. Dalida** - Lead Developer
- **Eduard Florence G. Domingo** - Developer
- **Matthew Daniel A. Sadaba** - Developer

## 🆘 Support

For support and questions, please contact the development team or create an issue in the repository.

---

Built with ❤️ using React + Vite + SWC 