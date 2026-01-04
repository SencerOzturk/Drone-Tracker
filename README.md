# 🚁 Drone Tracking System

<div align="center">

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)

**A real-time drone tracking system with GPS telemetry, live map visualization, and advanced flight analytics**

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Architecture](#-architecture) • [API](#-api-documentation)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Key Algorithms](#-key-algorithms)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**Drone Tracking System** is a full-stack application that enables real-time tracking and monitoring of drones using GPS telemetry data. The system processes GPS coordinates from mobile devices or drone units, calculates speed and altitude using advanced geodetic algorithms, and provides live visualization on an interactive map.

### Key Capabilities

- 📡 **Real-time GPS Tracking** - Live position updates via HTML5 Geolocation API
- ⚡ **Speed Calculation** - Haversine formula-based velocity computation (km/h)
- ⬆️ **Altitude Management** - Absolute and relative altitude tracking with home point reference
- 🗺️ **Interactive Map** - Real-time visualization with Leaflet.js
- 📊 **Flight Analytics** - Route tracking, telemetry history, and flight sessions
- 🔋 **Battery Monitoring** - Real-time battery level tracking
- 🌐 **WebSocket Communication** - Low-latency data streaming via Socket.IO

---

## ✨ Features

### Core Features

- ✅ **Real-time Telemetry Processing**
  - GPS coordinate validation and normalization
  - Speed calculation using Haversine distance formula
  - Altitude computation with home point reference system
  - Heading and battery level tracking

- ✅ **Live Map Visualization**
  - Interactive map with OpenStreetMap tiles
  - Real-time drone markers with popup information
  - Flight path visualization (Polyline)
  - Home point marker (green) and current position (blue)
  - Auto-centering based on active drones

- ✅ **Advanced Filtering & Search**
  - Search by drone ID or name
  - Filter by status (online, idle, alert, offline)
  - Real-time list updates

- ✅ **Data Persistence**
  - MongoDB storage with throttling (2-second intervals)
  - Flight session management
  - Historical telemetry data retrieval

- ✅ **Mobile Support**
  - Responsive design for mobile devices
  - GPS tracking via phone browser
  - Battery API integration

### Technical Features

- 🔄 **WebSocket Real-time Communication**
- 📦 **Modular Architecture** - Separation of concerns
- 🛡️ **Data Validation** - Input sanitization and error handling
- ⚡ **Performance Optimization** - Throttling, memoization, and efficient state management
- 🌍 **Geodetic Calculations** - Accurate distance and bearing computations

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2.0 | UI framework |
| **Vite** | 5.4.0 | Build tool & dev server |
| **React-Leaflet** | 4.2.1 | Map component library |
| **Leaflet** | 1.9.4 | Map rendering engine |
| **Socket.IO Client** | 4.7.5 | Real-time communication |
| **React Icons** | 5.2.1 | Icon library |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | ≥18.0.0 | Runtime environment |
| **Express** | 4.19.2 | Web framework |
| **Socket.IO** | 4.7.5 | WebSocket server |
| **MongoDB** | Latest | Database |
| **Mongoose** | 7.8.0 | ODM for MongoDB |
| **CORS** | 2.8.5 | Cross-origin resource sharing |
| **Morgan** | 1.10.0 | HTTP request logger |

### External APIs

- **OpenElevation API** - GPS coordinate to elevation conversion
- **OpenStreetMap** - Map tile provider

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────┐
│  Mobile Device  │
│  (phone.html)    │
│  GPS Tracking    │
└────────┬─────────┘
         │ Socket.IO
         │ (telemetry)
         ▼
┌─────────────────┐
│  Backend Server │
│  (Node.js)      │
│                 │
│  ┌───────────┐  │
│  │ Socket.IO │  │
│  │  Server   │  │
│  └─────┬─────┘  │
│        │        │
│  ┌─────▼─────┐  │
│  │ Telemetry │  │
│  │ Calculator│  │
│  │ (Haversine)│ │
│  └─────┬─────┘  │
│        │        │
│  ┌─────▼─────┐  │
│  │  MongoDB  │  │
│  │  Storage  │  │
│  └───────────┘  │
└────────┬─────────┘
         │ Socket.IO
         │ (broadcast)
         ▼
┌─────────────────┐
│  React Frontend │
│  (Dashboard)    │
│  Map View       │
└─────────────────┘
```

### Data Flow

1. **GPS Data Collection**
   - Mobile device uses HTML5 Geolocation API
   - `watchPosition()` continuously tracks location
   - Telemetry data sent via Socket.IO

2. **Backend Processing**
   - Socket.IO receives telemetry payload
   - Validation and normalization
   - Speed calculation (Haversine formula)
   - Altitude computation (home point reference)
   - MongoDB storage (throttled)

3. **Real-time Broadcasting**
   - Processed data broadcast to all clients
   - Frontend receives updates via Socket.IO
   - React state updates trigger UI re-render
   - Map markers and paths update in real-time

---

## 📦 Installation

### Prerequisites

- **Node.js** ≥ 18.0.0
- **MongoDB** (local or cloud instance)
- **npm** or **yarn**

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/drone-tracking-full.git
cd drone-tracking-full
```

### Step 2: Install Frontend Dependencies

```bash
npm install
```

### Step 3: Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

### Step 4: Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cd backend
touch .env
```

Add the following configuration:

```env
# Server Configuration
PORT=4000

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017
MONGO_DB=drone_tracking

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### Step 5: Start MongoDB

**Local MongoDB:**
```bash
mongod
```

**Or use MongoDB Atlas (cloud):**
- Update `MONGO_URI` in `.env` with your Atlas connection string

### Step 6: Start the Application

**Option 1: Run Both Services Separately**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
npm run dev
```

**Option 2: Use Root Scripts**

```bash
# Start backend in development mode
npm run backend:dev

# In another terminal, start frontend
npm run dev
```

### Step 7: Access the Application

- **Frontend Dashboard**: http://localhost:5173
- **Backend API**: http://localhost:4000
- **Phone Tracking Page**: http://localhost:4000 (serves `phone.html`)

---

## ⚙️ Configuration

### Backend Configuration

Edit `backend/src/config/env.js` or use environment variables:

```javascript
PORT=4000                    // Server port
MONGO_URI=...               // MongoDB connection string
MONGO_DB=drone_tracking      // Database name
```

### Frontend Configuration

Create `.env` file in root directory (optional):

```env
VITE_API_BASE_URL=http://localhost:4000
```

### MongoDB Throttling

Telemetry data is saved to MongoDB every **2 seconds** per drone (configurable in `telemetryIngestService.js`):

```javascript
const BUFFER_MS = 2000; // Adjust as needed
```

---

## 🚀 Usage

### Starting a Tracking Session

1. **Open the Phone Tracking Page**
   - Navigate to `http://localhost:4000` on your mobile device
   - Grant GPS location permissions when prompted

2. **View the Dashboard**
   - Open `http://localhost:5173` in your browser
   - The map will automatically display your drone position
   - Telemetry data updates in real-time

### Using the Dashboard

- **Search**: Type drone ID or name in the search box
- **Filter**: Select status from the dropdown (all, online, idle, alert)
- **Select Drone**: Click on a drone in the list or on the map marker
- **View Details**: Selected drone details appear in the right panel
- **Track Route**: Flight path is automatically drawn on the map

### API Endpoints

See [API Documentation](#-api-documentation) section for detailed endpoint information.

---

## 📡 API Documentation

### REST Endpoints

#### Get All Drones

```http
GET /api/drones
```

**Response:**
```json
[
  {
    "_id": "phone-1234567890",
    "name": "Drone-phone-1234567890",
    "status": "in_flight",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### Get Drone Telemetry

```http
GET /api/telemetry?droneId=phone-1234567890&limit=100
```

**Query Parameters:**
- `droneId` (required): Drone identifier
- `limit` (optional): Number of records (default: 100)

**Response:**
```json
[
  {
    "droneId": "phone-1234567890",
    "latitude": 41.0082,
    "longitude": 28.9784,
    "altitude": 150.5,
    "absoluteAltitude": 150.5,
    "relativeAltitude": 30.2,
    "homeAltitude": 120.3,
    "speed": 0,
    "calculatedSpeed": 25.5,
    "heading": 90,
    "battery": 0.75,
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
]
```

#### Health Check

```http
GET /health
```

**Response:**
```json
{
  "ok": true
}
```

### WebSocket Events

#### Client → Server

**Emit Telemetry Data:**
```javascript
socket.emit("telemetry", {
  droneId: "phone-1234567890",
  latitude: 41.0082,
  longitude: 28.9784,
  altitude: 150.5,  // null if unavailable
  speed: 0,         // m/s (raw)
  heading: 90,      // degrees (0-360)
  battery: 0.75,    // 0-1
  timestamp: 1704067200000
});
```

#### Server → Client

**Receive Telemetry Update:**
```javascript
socket.on("telemetry_update", (data) => {
  // Processed telemetry with calculated values
  console.log(data.calculatedSpeed);    // km/h
  console.log(data.absoluteAltitude);   // meters
  console.log(data.relativeAltitude);  // meters (relative to home)
  console.log(data.homeAltitude);      // meters
});
```

**Receive Broadcast Update:**
```javascript
socket.on("drone:telemetry:broadcast", (data) => {
  // All clients receive this for map updates
});
```

---

## 📁 Project Structure

```
drone-tracking-full/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js              # MongoDB connection
│   │   │   └── env.js             # Environment variables
│   │   ├── controllers/
│   │   │   ├── droneController.js
│   │   │   ├── telemetryController.js
│   │   │   └── flightSessionController.js
│   │   ├── middleware/
│   │   │   ├── errorHandler.js
│   │   │   └── notFound.js
│   │   ├── models/
│   │   │   ├── Drone.js           # Drone schema
│   │   │   ├── Telemetry.js       # Telemetry schema
│   │   │   └── FlightSession.js
│   │   ├── routes/
│   │   │   ├── droneRoutes.js
│   │   │   ├── telemetryRoutes.js
│   │   │   └── flightSessionRoutes.js
│   │   ├── services/
│   │   │   ├── socket.js          # Socket.IO setup
│   │   │   ├── telemetryCalculator.js  # Speed/altitude calculations
│   │   │   └── telemetryIngestService.js  # Data processing
│   │   ├── utils/
│   │   │   ├── geodesy.js         # Haversine formula
│   │   │   ├── elevation.js       # GPS elevation API
│   │   │   └── validators.js      # Input validation
│   │   ├── public/
│   │   │   └── phone.html         # Mobile GPS tracking page
│   │   ├── app.js                 # Express app
│   │   └── server.js              # Server entry point
│   ├── package.json
│   └── .env
├── src/
│   ├── components/
│   │   ├── MapView.jsx            # Map visualization
│   │   ├── DroneList.jsx          # Drone list component
│   │   └── DetailsPanel.jsx       # Details panel
│   ├── hooks/
│   │   └── useLiveDrones.js       # Socket.IO integration hook
│   ├── App.jsx                    # Main app component
│   ├── main.jsx                   # React entry point
│   └── styles.css                 # Global styles
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

---

## 🔬 Key Algorithms

### Speed Calculation (Haversine Formula)

The system calculates speed by measuring the distance between consecutive GPS points using the Haversine formula:

```javascript
// Distance calculation
const distance = haversineDistance(prevLat, prevLon, currLat, currLon);

// Speed = distance / time
const speedMs = distance / timeDiffSeconds;
const speedKmh = speedMs * 3.6; // Convert to km/h
```

**Features:**
- Minimum time difference: 0.5 seconds (noise filtering)
- Minimum distance: 2 meters (GPS noise filtering)
- Maximum speed: 200 km/h (anomaly filtering)

### Altitude Management

The system uses a **home point reference** system:

1. **Home Altitude**: First GPS reading becomes the reference point
2. **Absolute Altitude**: Current elevation from sea level
3. **Relative Altitude**: `Absolute - Home` (shows height above takeoff point)

```javascript
// Home altitude is set on first GPS reading
if (!previous || previous.homeAltitude === undefined) {
  homeAltitude = altitude || await getElevationFromAPI(lat, lon);
}

// Relative altitude calculation
relativeAltitude = absoluteAltitude - homeAltitude;
```

### Haversine Distance Formula

```javascript
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in meters
}
```

---

## 🧪 Development

### Running in Development Mode

```bash
# Backend with auto-reload (nodemon)
npm run backend:dev

# Frontend with hot-reload (Vite)
npm run dev
```

### Building for Production

```bash
# Build frontend
npm run build

# Start production server
npm run preview
```

### Code Structure Guidelines

- **Services**: Business logic and calculations
- **Controllers**: Request/response handling
- **Models**: Database schemas
- **Utils**: Reusable utility functions
- **Routes**: API endpoint definitions

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style
- Add comments for complex logic
- Update documentation for new features
- Write tests for new functionality
- Ensure all tests pass before submitting

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Muhammed Sencer Öztürk**

- Front-End Developer & Computer Engineering Student
- Aspiring to build real-time visualization and IoT-driven web apps

---

## 🙏 Acknowledgments

- **OpenStreetMap** for map tiles
- **OpenElevation API** for elevation data
- **Leaflet.js** community for excellent mapping library
- **Socket.IO** for real-time communication capabilities

---

## 📚 Additional Resources

- [MIMARI_OZET.md](./MIMARI_OZET.md) - Detailed architecture documentation (Turkish)
- [HOME_ALTITUDE_ACIKLAMA.md](./HOME_ALTITUDE_ACIKLAMA.md) - Home altitude explanation (Turkish)
- [KRITIK_KOD_RAPORU.md](./KRITIK_KOD_RAPORU.md) - Critical code analysis (Turkish)

---

<div align="center">

**Muhammed Sencer ÖZTÜRK - Computer Engineering Student**


</div>
