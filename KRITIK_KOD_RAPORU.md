# 🚁 Drone Tracking Projesi - Kritik Kod Satırları Raporu

Bu rapor, projedeki en önemli ve kritik kod satırlarını dosya bazında listeler.

---

## 📁 Backend - Kritik Dosyalar

### 1. `backend/src/server.js` - Server Başlatma
**Kritik Satırlar:**
```javascript
// Satır 9-19: Server başlatma ve Socket.IO entegrasyonu
async function bootstrap() {
  await connectDB();  // MongoDB bağlantısı

  const server = http.createServer(app);
  const io = initSocket(server);  // Socket.IO başlatma
  app.set("io", io);  // Express'e Socket.IO instance'ını ekleme

  server.listen(PORT, () => {
    console.log(`[server] listening on ${PORT}`);
  });
}
```
**Önemi:** Uygulamanın başlatılması, veritabanı bağlantısı ve Socket.IO entegrasyonu burada yapılır.

---

### 2. `backend/src/app.js` - Express Uygulaması
**Kritik Satırlar:**
```javascript
// Satır 14-17: Express app oluşturma ve static dosya servisi
const app = express();
app.use(express.static(path.join(__dirname, "public")));  // phone.html için

// Satır 19-21: Middleware'ler
app.use(cors());  // CORS desteği
app.use(express.json());  // JSON body parser

// Satır 33-35: API route'ları
app.use("/api/drones", droneRoutes);
app.use("/api/telemetry", telemetryRoutes);
app.use("/api/sessions", flightSessionRoutes);
```
**Önemi:** Tüm HTTP istekleri ve route yapılandırması burada tanımlanır.

---

### 3. `backend/src/config/db.js` - MongoDB Bağlantısı
**Kritik Satırlar:**
```javascript
// Satır 6-9: MongoDB bağlantı fonksiyonu
async function connectDB() {
  await mongoose.connect(MONGO_URI, { dbName: MONGO_DB });
  console.log(`[db] connected to ${MONGO_DB}`);
}
```
**Önemi:** Veritabanı bağlantısı tüm veri saklama işlemleri için kritiktir.

---

### 4. `backend/src/services/socket.js` - Socket.IO Event Handling
**Kritik Satırlar:**
```javascript
// Satır 8-11: Socket.IO server yapılandırması
const io = new Server(server, {
  cors: { origin: "*" },
  transports: ["websocket", "polling"],
});

// Satır 17-24: Telemetri verisi alma ve işleme
socket.on("telemetry", async (payload) => {
  try {
    await telemetryIngestService.handleIncoming(payload, io, socket);
  } catch (err) {
    console.error("[socket] telemetry error", err.message);
    socket.emit("error", { message: "invalid telemetry" });
  }
});
```
**Önemi:** Gerçek zamanlı veri akışı burada yönetilir. Client'tan gelen telemetri verileri burada alınır.

---

### 5. `backend/src/services/telemetryCalculator.js` - Hız ve İrtifa Hesaplamaları ⭐ EN ÖNEMLİ
**Kritik Satırlar:**

#### Hız Hesaplama (Satır 29-79):
```javascript
// Satır 47-53: Haversine formülü ile mesafe hesaplama
const distanceMeters = haversineDistance(
  previous.latitude,
  previous.longitude,
  latitude,
  longitude
);

// Satır 63-67: Hız hesaplama (m/s → km/h)
const speedMs = distanceMeters / timeDiffSeconds;
const speedKmh = speedMs * 3.6;

// Satır 72-76: Anormal hız filtreleme
if (speedKmh > 200) {
  console.log(`[telemetryCalculator] Anormal hız (${speedKmh.toFixed(2)} km/h) - filtrelendi`);
  return previous.calculatedSpeed || 0;
}
```

#### İrtifa Hesaplama (Satır 94-184):
```javascript
// Satır 98-140: Home altitude belirleme (ilk veri)
if (!previous || previous.homeAltitude === undefined) {
  let homeAlt;
  
  if (altitude !== null && altitude !== undefined && !isNaN(altitude)) {
    homeAlt = altitude;  // Cihazdan gelen altitude
  } else {
    const elevation = await getElevation(latitude, longitude);  // GPS API'den
    homeAlt = elevation !== null ? elevation : 0;
  }
  
  // Home point koordinatlarını sakla
  previousTelemetryMap.set(droneId, {
    latitude, longitude,
    homeAltitude: homeAlt,
    homeLatitude: latitude,
    homeLongitude: longitude,
  });
}

// Satır 169-170: Relative altitude hesaplama
const relativeAltitude = absoluteAltitude - homeAltitude;
```

#### Telemetri İşleme (Satır 193-224):
```javascript
// Satır 196-200: Hız ve irtifa hesaplamalarını yap
const calculatedSpeed = calculateSpeed(droneId, latitude, longitude, timestamp);
const altitudeData = await calculateAltitude(droneId, altitude, latitude, longitude);

// Satır 203-213: Önceki veriyi güncelle (bir sonraki hesaplama için)
previousTelemetryMap.set(droneId, {
  latitude, longitude,
  absoluteAltitude: altitudeData.absoluteAltitude,
  homeAltitude: altitudeData.homeAltitude,
  calculatedSpeed,
});
```
**Önemi:** Bu dosya, GPS verilerinden hız ve irtifa hesaplamalarını yapan en kritik servistir. Haversine formülü ve home altitude mantığı burada uygulanır.

---

### 6. `backend/src/services/telemetryIngestService.js` - Telemetri Veri İşleme
**Kritik Satırlar:**
```javascript
// Satır 9-10: Throttling mekanizması (MongoDB yükünü azaltmak için)
const BUFFER_MS = 2000;  // 2 saniyede bir kayıt
const lastSavedMap = new Map();

// Satır 30-40: Gelen telemetri verisini işle
async function handleIncoming(payload, io, socket = null) {
  const data = validateTelemetry(payload);
  await ensureDrone(data.droneId);  // Drone'u oluştur/yükle

  // Hız ve irtifa hesaplamalarını yap
  const processedData = await processTelemetry(data.droneId, {
    latitude: data.latitude,
    longitude: data.longitude,
    altitude: data.altitude,
    timestamp: data.timestamp,
  });

// Satır 60-66: Client'a ve tüm dinleyicilere broadcast
if (socket) {
  socket.emit("telemetry_update", normalized);  // Client'a özel
}
io.emit("drone:telemetry:broadcast", normalized);  // Tüm client'lara

// Satır 68-87: MongoDB'ye kaydet (throttled)
const now = Date.now();
const lastSaved = lastSavedMap.get(data.droneId) || 0;
if (now - lastSaved >= BUFFER_MS) {
  lastSavedMap.set(data.droneId, now);
  await Telemetry.create({ ... });  // Veritabanına kaydet
}
```
**Önemi:** Gelen telemetri verilerini işler, hesaplamaları yapar ve Socket.IO ile broadcast eder. Throttling ile veritabanı yükünü kontrol eder.

---

### 7. `backend/src/utils/geodesy.js` - Haversine Formülü ⭐ EN ÖNEMLİ
**Kritik Satırlar:**
```javascript
// Satır 11: Dünya yarıçapı (metre)
const EARTH_RADIUS_M = 6371000;

// Satır 22-38: Haversine formülü ile mesafe hesaplama
function haversineDistance(lat1, lon1, lat2, lon2) {
  // Dereceyi radyana çevir
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  // Haversine formülü
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_M * c;  // Metre cinsinden mesafe

  return distance;
}

// Satır 47-49: Derece → Radyan dönüşümü
function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}
```
**Önemi:** İki GPS koordinatı arasındaki mesafeyi hesaplayan temel formül. Hız hesaplaması için kritiktir.

---

### 8. `backend/src/utils/elevation.js` - GPS API Yükseklik Hesaplama
**Kritik Satırlar:**
```javascript
// Satır 19-72: OpenElevation API ile yükseklik hesaplama
async function getElevationFromAPI(latitude, longitude) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      locations: [{ latitude, longitude }],
    });

    const options = {
      hostname: "api.open-elevation.com",
      path: "/api/v1/lookup",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
      },
      timeout: 5000,  // 5 saniye timeout
    };

    const req = https.request(options, (res) => {
      // ... response işleme
      const elevation = json.results[0].elevation;
      resolve(elevation);
    });
  });
}
```
**Önemi:** Cihazdan altitude gelmediğinde GPS koordinatlarından yükseklik hesaplar. Home altitude belirleme için kritiktir.

---

### 9. `backend/src/utils/validators.js` - Veri Validasyonu
**Kritik Satırlar:**
```javascript
// Satır 3-20: Telemetri verisi validasyonu
function validateTelemetry(raw) {
  if (!raw) throw new Error("empty payload");

  const required = ["droneId", "latitude", "longitude", "speed", "heading", "battery", "timestamp"];
  
  required.forEach((k) => {
    if (raw[k] === undefined || raw[k] === null) {
      throw new Error(`missing ${k}`);
    }
  });

  // Satır 23-32: Veri normalizasyonu
  const data = {
    droneId: String(raw.droneId),
    latitude: Number(raw.latitude),
    longitude: Number(raw.longitude),
    altitude: raw.altitude !== null ? Number(raw.altitude) : null,
    speed: Number(raw.speed) || 0,
    heading: Number(raw.heading) % 360,  // 0-360 aralığına normalize
    battery: Math.max(0, Math.min(1, Number(raw.battery))),  // 0-1 aralığına sınırla
    timestamp: Number(raw.timestamp) || Date.now(),
  };
}
```
**Önemi:** Gelen verilerin doğruluğunu ve güvenliğini sağlar. Hatalı verilerin sisteme girmesini engeller.

---

### 10. `backend/src/models/Telemetry.js` - Veritabanı Şeması
**Kritik Satırlar:**
```javascript
// Satır 5-27: Telemetri şeması
const telemetrySchema = new mongoose.Schema({
  droneId: { type: String, required: true, index: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  altitude: { type: Number, required: true },  // Raw altitude
  absoluteAltitude: { type: Number },  // Hesaplanmış absolute altitude
  relativeAltitude: { type: Number },  // Home'a göre relative altitude
  homeAltitude: { type: Number },  // Home point altitude
  speed: { type: Number, required: true },  // Raw speed (m/s)
  calculatedSpeed: { type: Number },  // Haversine ile hesaplanmış hız (km/h)
  heading: { type: Number, required: true },
  battery: { type: Number, required: true },
  timestamp: { type: Date, required: true, index: true },
}, { timestamps: true });

// Satır 29: Composite index (performans için)
telemetrySchema.index({ droneId: 1, timestamp: -1 });
```
**Önemi:** Tüm telemetri verilerinin yapısını tanımlar. Veritabanı sorgularının performansı için index'ler kritiktir.

---

### 11. `backend/src/models/Drone.js` - Drone Modeli
**Kritik Satırlar:**
```javascript
// Satır 5-17: Drone şeması
const droneSchema = new mongoose.Schema({
  _id: { type: String, required: true },  // String ID (telefon UUID'si için)
  name: { type: String, required: true },
  status: {
    type: String,
    enum: ["idle", "in_flight", "offline", "online", "alert"],
    default: "offline",
  },
}, { timestamps: true });
```
**Önemi:** Drone bilgilerinin veritabanında saklanması için şema tanımı.

---

## 📁 Frontend - Kritik Dosyalar

### 12. `src/App.jsx` - Ana React Component
**Kritik Satırlar:**
```javascript
// Satır 14: useLiveDrones hook'u ile canlı veri yönetimi
const { drones, paths, refresh, isRefreshing, setSelectedId, selectedId, selectedDrone } = useLiveDrones()

// Satır 16-18: State yönetimi
const [query, setQuery] = useState('')  // Arama sorgusu
const [status, setStatus] = useState('all')  // Durum filtresi

// Satır 22-35: Filtreleme mantığı (useMemo ile performans optimizasyonu)
const filtered = useMemo(() => {
  const q = query.trim().toLowerCase()
  return drones.filter(d => {
    const matchQ = !q || d.name.toLowerCase().includes(q) || d.id.toLowerCase().includes(q)
    const matchS = status === 'all' || d.status === status
    return matchQ && matchS
  })
}, [drones, query, status])

// Satır 78-82: Component'lerin render edilmesi
<DroneList drones={filtered} selectedId={selectedId} onSelect={setSelectedId} />
<MapView drones={filtered} paths={paths} selectedId={selectedId} onSelect={setSelectedId} />
<DetailsPanel drone={selectedDrone} />
```
**Önemi:** Ana uygulama mantığı, filtreleme ve state yönetimi burada yapılır.

---

### 13. `src/components/MapView.jsx` - Harita Görünümü
**Kritik Satırlar:**
```javascript
// Satır 16-23: Harita merkezini hesaplama (useMemo ile optimizasyon)
const center = useMemo(() => {
  if (drones.length === 0) return [39.9208, 32.8541]  // Ankara fallback
  const valid = drones.filter(d => Number.isFinite(d.lat) && Number.isFinite(d.lng))
  if (valid.length === 0) return [39.9208, 32.8541]
  const avgLat = valid.reduce((s, d) => s + d.lat, 0) / valid.length
  const avgLng = valid.reduce((s, d) => s + d.lng, 0) / valid.length
  return [avgLat, avgLng]
}, [drones])

// Satır 34-36: Uçuş rotası çizgisi
{paths?.[d.id]?.length > 1 && (
  <Polyline positions={paths[d.id]} pathOptions={{ color: '#47b2ff', weight: 3, opacity: 0.7 }} />
)}

// Satır 37-61: Drone marker'ları
<Marker position={[d.lat, d.lng]} icon={defaultIcon} eventHandlers={{ click: () => onSelect(d.id) }}>
  <Popup>
    {/* Telemetri bilgileri: hız, irtifa, batarya */}
  </Popup>
</Marker>

// Satır 74-106: Home Point marker'ı
{d.homeLat && d.homeLng && (
  <Marker position={[d.homeLat, d.homeLng]} icon={greenIcon}>
    <Popup>
      <strong>🏠 Home Point</strong>
      {/* Home point bilgileri */}
    </Popup>
  </Marker>
)}
```
**Önemi:** Harita üzerinde drone'ların görselleştirilmesi, rota çizimi ve home point gösterimi burada yapılır.

---

### 14. `src/hooks/useLiveDrones.js` - Socket.IO Entegrasyonu ⭐ EN ÖNEMLİ
**Kritik Satırlar:**
```javascript
// Satır 5: API base URL
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

// Satır 7-46: Telemetri verisi normalizasyonu
const normalizeTelemetry = (payload) => {
  const lat = Number(payload.latitude ?? payload.lat)
  const lng = Number(payload.longitude ?? payload.lng)
  
  // Hız: calculatedSpeed varsa onu kullan, yoksa raw speed'i km/h'ye çevir
  const speed = payload.calculatedSpeed !== undefined
    ? Number(payload.calculatedSpeed)  // km/h (zaten hesaplanmış)
    : (payload.speed ? Number(payload.speed) * 3.6 : 0)  // m/s → km/h
  
  // İrtifa: absoluteAltitude varsa onu kullan
  const altitude = payload.absoluteAltitude !== undefined
    ? Number(payload.absoluteAltitude)
    : (payload.altitude !== undefined ? Number(payload.altitude) : 0)
  
  return {
    id: String(droneId),
    lat: Number.isFinite(lat) ? lat : 0,
    lng: Number.isFinite(lng) ? lng : 0,
    speed, altitude,
    absoluteAltitude: payload.absoluteAltitude !== undefined ? Number(payload.absoluteAltitude) : altitude,
    relativeAltitude: payload.relativeAltitude !== undefined ? Number(payload.relativeAltitude) : 0,
    homeAltitude: payload.homeAltitude !== undefined ? Number(payload.homeAltitude) : 0,
    homeLat: payload.homeLatitude !== undefined ? Number(payload.homeLatitude) : null,
    homeLng: payload.homeLongitude !== undefined ? Number(payload.homeLongitude) : null,
  }
}

// Satır 55-74: Drone verisini güncelleme
const upsertDrone = useCallback((incoming) => {
  const data = normalizeTelemetry(incoming)
  if (!data) return

  setDrones(prev => {
    const exists = prev.find(d => d.id === data.id)
    if (exists) {
      return prev.map(d => d.id === data.id ? { ...exists, ...data } : d)  // Güncelle
    }
    return [...prev, data]  // Yeni ekle
  })

  // Uçuş rotası güncelleme (son 500 nokta)
  setPaths(prev => {
    const prevPath = prev[data.id] || []
    const nextPath = [...prevPath, [data.lat, data.lng]].slice(-500)
    return { ...prev, [data.id]: nextPath }
  })
}, [])

// Satır 99-110: Socket.IO bağlantısı ve event dinleme
useEffect(() => {
  const socket = io(API_BASE, { transports: ['websocket'] })
  socketRef.current = socket

  socket.on('connect', () => console.log('socket connected'))
  socket.on('drone:telemetry:broadcast', upsertDrone)  // ⭐ Kritik: Canlı veri alımı
  socket.on('error', (err) => console.error('socket error', err))

  return () => {
    socket.disconnect()
  }
}, [upsertDrone])
```
**Önemi:** Backend'den gelen canlı telemetri verilerini alır, normalize eder ve React state'ine ekler. Gerçek zamanlı güncellemeler burada yönetilir.

---

### 15. `backend/src/public/phone.html` - GPS Tracking Sayfası ⭐ EN ÖNEMLİ
**Kritik Satırlar:**
```javascript
// Satır 167-168: Socket.IO bağlantısı
const socket = io("/", { transports: ["websocket"] });
const droneId = "phone-" + Date.now();  // Unique drone ID

// Satır 203-283: Backend'den gelen telemetri güncellemelerini dinle
socket.on("telemetry_update", (data) => {
  // Hız (hesaplanmış)
  const calculatedSpeed = data.calculatedSpeed || 0;
  speedEl.textContent = `${calculatedSpeed} km/h`;
  
  // İrtifa (mutlak ve bağıl)
  const absoluteAlt = data.absoluteAltitude !== undefined ? data.absoluteAltitude : (data.altitude || 0);
  absoluteAltitudeEl.textContent = `${absoluteAlt.toFixed(1)} m`;
  const relativeAlt = data.relativeAltitude !== undefined ? data.relativeAltitude : 0;
  relativeAltitudeEl.textContent = `${relativeAlt.toFixed(1)} m`;
  
  // Home altitude bilgisi
  if (data.homeAltitude !== undefined) {
    homeAltitudeEl.textContent = `${data.homeAltitude.toFixed(1)} m`;
  }
});

// Satır 310-338: GPS konum takibi ve telemetri gönderimi
watchId = navigator.geolocation.watchPosition(
  async (position) => {
    const { latitude, longitude, altitude, speed, heading } = position.coords;
    const timestamp = position.timestamp || Date.now();
    
    const battery = await getBatteryLevel();

    // Telemetri verisini backend'e gönder
    socket.emit("telemetry", {
      droneId,
      latitude,
      longitude,
      altitude: altitude !== null ? altitude : null,  // null gönder, backend hesaplasın
      speed: speed !== null ? speed : 0,  // m/s (raw)
      heading: heading !== null ? heading : 0,
      battery: battery,
      timestamp: timestamp
    });
  },
  (error) => {
    console.error("❌ GPS hata:", error);
  },
  {
    enableHighAccuracy: true,  // Yüksek doğruluk
    maximumAge: 1000,  // 1 saniye önceki veriyi kabul et
    timeout: 10000  // 10 saniye timeout
  }
);
```
**Önemi:** Telefondan GPS verilerini alır ve backend'e gönderir. Sistemin veri kaynağıdır.

---

## 🎯 En Kritik Kod Bölümleri Özeti

### 1. **Haversine Formülü** (`backend/src/utils/geodesy.js`)
- İki GPS koordinatı arası mesafe hesaplama
- Hız hesaplaması için temel

### 2. **Hız Hesaplama** (`backend/src/services/telemetryCalculator.js` - `calculateSpeed`)
- Önceki ve şu anki GPS noktaları arası mesafe
- Zaman farkı ile hız hesaplama (km/h)
- Anormal hız filtreleme (>200 km/h)

### 3. **İrtifa Hesaplama** (`backend/src/services/telemetryCalculator.js` - `calculateAltitude`)
- Home altitude belirleme (ilk GPS verisi)
- Absolute altitude hesaplama (cihaz veya GPS API)
- Relative altitude hesaplama (absolute - home)

### 4. **Socket.IO Event Handling** (`backend/src/services/socket.js` + `telemetryIngestService.js`)
- Client'tan gelen telemetri verilerini alma
- Hesaplamaları yapma
- Tüm client'lara broadcast etme

### 5. **GPS Tracking** (`backend/src/public/phone.html`)
- HTML5 Geolocation API ile konum takibi
- Telemetri verilerini backend'e gönderme
- Backend'den gelen hesaplanmış verileri gösterme

### 6. **Frontend Socket Entegrasyonu** (`src/hooks/useLiveDrones.js`)
- Socket.IO ile canlı veri alımı
- Drone listesi ve rota güncelleme
- State yönetimi

---

## 📊 Veri Akışı

```
[Telefon GPS] 
  → phone.html (watchPosition)
  → Socket.IO emit("telemetry")
  → backend/services/socket.js
  → backend/services/telemetryIngestService.js
  → backend/services/telemetryCalculator.js
    → calculateSpeed() (Haversine)
    → calculateAltitude() (Home altitude mantığı)
  → Socket.IO emit("telemetry_update") → phone.html
  → Socket.IO emit("drone:telemetry:broadcast") → Frontend
  → src/hooks/useLiveDrones.js
  → React state güncelleme
  → MapView.jsx (harita güncellemesi)
```

---

## 🔑 Anahtar Teknolojiler ve Kullanımları

1. **Haversine Formülü**: GPS mesafe hesaplama
2. **Socket.IO**: Gerçek zamanlı veri akışı
3. **HTML5 Geolocation API**: Telefondan GPS verisi alma
4. **OpenElevation API**: GPS koordinatlarından yükseklik hesaplama
5. **MongoDB + Mongoose**: Veri saklama
6. **React + Leaflet**: Harita görselleştirme
7. **Throttling**: Veritabanı yükünü azaltma (2 saniye)

---

## ⚠️ Kritik Notlar

1. **Home Altitude**: İlk GPS verisi geldiğinde belirlenir ve değişmez
2. **Hız Hesaplama**: En az 0.5 saniye zaman farkı ve 2 metre mesafe gerekir
3. **Throttling**: MongoDB'ye 2 saniyede bir kayıt (Socket.IO her veriyi broadcast eder)
4. **Anormal Hız Filtreleme**: 200 km/h üzeri hızlar filtrelenir
5. **GPS API Fallback**: Cihazdan altitude gelmezse OpenElevation API kullanılır

---

**Rapor Tarihi:** 2024  
**Proje:** Drone Tracking System  
**Versiyon:** Full Stack (Backend + Frontend)

