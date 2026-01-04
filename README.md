# 🚁 Drone Tracker

A mini React application that allows **live tracking of drone positions on a map**, with filtering, selection, and detailed info panels.  
Real-time data is **simulated in the browser** — no backend required.

---

## 🎯 Objective

This project demonstrates **real-time data visualization** and **component-based UI design** using modern front-end tools like React, Vite, and Leaflet.

---

## ⚙️ Technologies Used

| Technology | Purpose |
|-------------|----------|
| **React 18** | Component-based user interface development |
| **Vite** | Fast development server and production build tool |
| **React-Leaflet & Leaflet** | Map rendering and marker management |
| **React Icons** | Lightweight icon set |
| **CSS (Custom Variables)** | Theming and grid-based layout |
| **Custom Hook (useLiveDrones)** | Simulates live drone movement within the browser |

---

## 🧭 How to Run

```bash
# 1. Install dependencies
npm install

# 2. Start development server (Vite)
npm run dev

# 3. Build for production
npm run build

# 4. Preview production build locally
npm run preview --host
```

---

## 🔄 Application Flow

```
index.html
 └── #root → React root container
src/main.jsx
 └── App.jsx → Main layout (filters, map, details)
      ├── DroneList.jsx → Drone list + status badges
      ├── MapView.jsx → Map + markers
      ├── DetailsPanel.jsx → Selected drone details
      └── useLiveDrones.js → Live simulation hook
```

📂 **Data Source:** `src/data/mockDrones.js`  
🎨 **Theme & Layout:** `src/styles.css`

---

## 📁 File Overview

### 🧩 `package.json`
Contains dependencies and Vite scripts for React + Leaflet setup.

- `"vite build"` → Rollup-based bundling for production  
- `"vite preview"` → Local preview of the production build

---

### ⚡ `vite.config.js`
```js
plugins: [react()],
server: { host: true }
```
Enables React plugin and allows LAN access for testing on other devices.

---

### 🏁 `index.html`
Contains a single `<div id="root">` where the React app is mounted.  
Uses modern `<script type="module">` syntax, natively supported by Vite.

---

### 🧠 `src/main.jsx`
Entry point of the application:

```jsx
const root = createRoot(document.getElementById('root'))
root.render(<App />)
```

Includes `React.StrictMode` for highlighting potential issues.  
Also imports `leaflet.css` for proper map rendering.

---

### 🗺️ `src/components/MapView.jsx`
Renders an OpenStreetMap base layer using **React-Leaflet**.

- Components: `MapContainer`, `TileLayer`, `Marker`, `Popup`
- Displays drone markers and a highlighted `CircleMarker` for the selected drone
- Uses `useMemo` to avoid unnecessary recalculations of map center

---

### 📋 `src/components/DroneList.jsx`
Displays all drones as selectable list items.

- Highlights the active drone with a blue border  
- Uses a `StatusBadge` component for colored labels  

| Status | Color | Meaning |
|---------|--------|----------|
| online | green | Active |
| idle | yellow | Standby |
| alert | red | Alert |

---

### 🧭 `src/components/DetailsPanel.jsx`
Shows details for the selected drone:

- Name, ID, coordinates, speed, altitude  
- Action buttons: **Track**, **Show Route**, **Send Command**  
(Currently visual only — not functional yet)

---

### 🪶 `src/hooks/useLiveDrones.js`
Simulates live drone data updates.

- Uses `setInterval` (1.5s) to randomly update position, speed, and status  
- Provides helper values and state handlers  

**Returned object:**
```js
{ drones, refresh, isRefreshing, selectedId, setSelectedId, selectedDrone }
```

---

### 📊 `src/data/mockDrones.js`
Contains static mock data (4 example drones):

```js
{ id: 'DR-001', name: 'Anka-1', status: 'online', lat: 41.015, lng: 28.979 }
```

---

### 🎨 `src/styles.css`
Defines the project theme and layout using CSS variables.

- `--bg`, `--accent`, `--text` for dark theme  
- **CSS Grid Layout:** 3-column structure → sidebar | map | details  
- Minimal, professional look suitable for dashboard interfaces

---

## 💡 Key Learning Points

| Concept | Description |
|----------|-------------|
| **Component architecture** | Logical separation of UI sections |
| **State management** | `useState` + `useMemo` for selection and filtering |
| **Custom Hooks** | Reusable logic via `useLiveDrones()` |
| **Map integration** | Declarative setup with React-Leaflet |
| **Theme & layout** | CSS variables + grid system for flexible design |

---

## 🧭 Summary

**Drone Tracker** is a compact yet well-structured React project featuring:

- Real-time (simulated) data streaming  
- Interactive map visualization  
- Filter and selection handling  
- Modern build system (Vite)  
- Clean and professional UI  

---

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

---

## ✨ Author

**Muhammed Sencer Öztürk**  
Front-End Developer & Computer Engineering Student  
💼 Aspiring to build real-time visualization and IoT-driven web apps.
