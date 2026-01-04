# 🚁 Drone Telemetry System - Mimari Özet

## 📋 Proje Genel Bakış

Bu proje, telefon tarayıcısından gelen GPS verilerini kullanarak gerçek zamanlı drone telemetri sistemi oluşturur. Sistem, GPS koordinatlarından hız ve irtifa hesaplamaları yapar ve Socket.IO üzerinden canlı veri aktarımı sağlar.

## 🏗️ Sistem Mimarisi

### 1. **Frontend (Client) - Telefon Tarayıcısı**

**Dosya:** `backend/src/public/phone.html`

**Teknolojiler:**
- HTML5 Geolocation API (`navigator.geolocation.watchPosition`)
- Socket.IO Client (WebSocket)
- Battery API (destekleniyorsa)

**Özellikler:**
- Gerçek zamanlı GPS konum takibi
- Cihaz yönü (heading) okuma
- Batarya seviyesi okuma
- Modern, responsive UI
- Canlı telemetri verilerini görüntüleme

**Socket.IO Events:**
- **Gönderilen:** `telemetry` - GPS verilerini backend'e gönderir
- **Alınan:** `telemetry_update` - Backend'den hesaplanmış telemetri verilerini alır

---

### 2. **Backend (Server) - Node.js + Express**

**Ana Dosyalar:**
- `backend/src/server.js` - HTTP server ve Socket.IO başlatma
- `backend/src/app.js` - Express uygulaması
- `backend/src/services/socket.js` - Socket.IO event handler'ları
- `backend/src/services/telemetryIngestService.js` - Telemetri veri işleme
- `backend/src/services/telemetryCalculator.js` - Hız ve irtifa hesaplamaları

**Teknolojiler:**
- Node.js + Express
- Socket.IO (WebSocket)
- MongoDB + Mongoose
- Haversine formülü (GPS mesafe hesaplama)

---

### 3. **Telemetri Hesaplama Sistemi**

#### 3.1. **Hız Hesaplama (km/h)**

**Dosya:** `backend/src/services/telemetryCalculator.js`

**Algoritma:**
1. Önceki GPS noktası ve zamanı sakla (her drone için)
2. Yeni GPS noktası geldiğinde:
   - Haversine formülü ile iki nokta arası mesafeyi hesapla (metre)
   - Zaman farkını hesapla (saniye)
   - Hız = Mesafe / Zaman (m/s)
   - m/s'yi km/h'ye çevir (× 3.6)
3. Anormal hızları filtrele (>200 km/h)

**Formül:**
```
Hız (km/h) = (Haversine Mesafesi (m) / Zaman Farkı (s)) × 3.6
```

#### 3.2. **İrtifa Hesaplama (m)**

**Algoritma:**
1. **Home Altitude Belirleme:**
   - İlk GPS verisi geldiğinde, o noktanın altitude'ını "home altitude" olarak kaydet
   - Eğer cihazdan altitude gelmiyorsa, home altitude = 0 m

2. **Absolute Altitude:**
   - Cihazdan gelen altitude varsa kullan
   - Yoksa önceki absolute altitude'ı koru

3. **Relative Altitude:**
   - Relative = Absolute - Home Altitude
   - Bu değer, home point'e göre yüksekliği gösterir

**Örnek:**
```
Home Altitude: 100 m (ilk nokta)
Absolute Altitude: 150 m (şu anki nokta)
Relative Altitude: 50 m (home'a göre 50 m yukarıda)
```

---

### 4. **Geodesy Utilities (GPS Hesaplamaları)**

**Dosya:** `backend/src/utils/geodesy.js`

**Fonksiyonlar:**
- `haversineDistance(lat1, lon1, lat2, lon2)` - İki GPS noktası arası mesafe (m)
- `calculateBearing(lat1, lon1, lat2, lon2)` - İki nokta arası yön açısı (0-360°)
- `toRadians(degrees)` - Derece → Radyan dönüşümü
- `metersToKilometers(meters)` - Metre → Kilometre dönüşümü

**Haversine Formülü:**
Küresel yüzey üzerindeki iki nokta arası mesafeyi yüksek doğrulukla hesaplar. Dünya'nın eğriliğini dikkate alır.

---

### 5. **Veritabanı Modeli**

**Dosya:** `backend/src/models/Telemetry.js`

**Schema Alanları:**
- `droneId` - Drone/cihaz ID
- `latitude`, `longitude` - GPS koordinatları
- `altitude` - Cihazdan gelen raw altitude
- `absoluteAltitude` - Hesaplanmış mutlak irtifa
- `relativeAltitude` - Home'a göre bağıl irtifa
- `homeAltitude` - Home point irtifa
- `speed` - Cihazdan gelen raw speed (m/s)
- `calculatedSpeed` - Haversine ile hesaplanmış hız (km/h)
- `heading` - Cihaz yönü (0-360°)
- `battery` - Batarya seviyesi (0-1)
- `timestamp` - Veri zamanı

**Throttling:**
- Her drone için maksimum 2 saniyede bir veri kaydedilir (MongoDB yükünü azaltmak için)
- Ancak tüm veriler Socket.IO ile canlı olarak broadcast edilir

---

### 6. **Socket.IO Event Yapısı**

#### Client → Server:
```javascript
socket.emit("telemetry", {
  droneId: "phone-123",
  latitude: 41.0082,
  longitude: 28.9784,
  altitude: null, // veya sayı
  speed: 0, // m/s (raw)
  heading: 90, // derece
  battery: 0.75, // 0-1 arası
  timestamp: Date.now()
});
```

#### Server → Client:
```javascript
socket.emit("telemetry_update", {
  droneId: "phone-123",
  latitude: 41.0082,
  longitude: 28.9784,
  altitude: 100, // raw
  absoluteAltitude: 150, // hesaplanmış
  relativeAltitude: 50, // home'a göre
  homeAltitude: 100,
  speed: 0, // raw (m/s)
  calculatedSpeed: 25.5, // hesaplanmış (km/h)
  heading: 90,
  battery: 0.75,
  timestamp: 1234567890
});
```

#### Broadcast (Tüm Client'lara):
```javascript
io.emit("drone:telemetry:broadcast", { ... });
// Harita güncellemesi için kullanılır
```

---

### 7. **Veri Akışı**

```
[Telefon Tarayıcısı]
    ↓ GPS API (watchPosition)
    ↓ Socket.IO emit("telemetry")
[Backend Server]
    ↓ telemetryIngestService.handleIncoming()
    ↓ telemetryCalculator.processTelemetry()
    ↓ Hız ve İrtifa Hesaplama
    ↓ Socket.IO emit("telemetry_update") → Client'a geri gönder
    ↓ Socket.IO emit("drone:telemetry:broadcast") → Tüm client'lara
    ↓ MongoDB'ye kaydet (throttled)
```

---

### 8. **Özellikler**

✅ **Gerçek Zamanlı GPS Takibi**
- HTML5 Geolocation API ile sürekli konum güncellemesi
- Yüksek doğruluk modu

✅ **Hız Hesaplama**
- Haversine formülü ile mesafe hesaplama
- Zaman bazlı hız hesaplama
- Anormal değer filtreleme

✅ **İrtifa Hesaplama**
- Absolute ve relative altitude desteği
- Home point mantığı
- Cihazdan gelen altitude veya hesaplanmış altitude

✅ **Heading (Yön)**
- Cihaz yönü okuma (0-360°)
- GPS heading bilgisi

✅ **Batarya Takibi**
- Battery API desteği
- Fallback mekanizması
- Görsel batarya göstergesi

✅ **Modüler Mimari**
- Ayrılmış servisler (calculator, ingest, socket)
- Utility fonksiyonları (geodesy)
- Temiz kod yapısı

---

### 9. **Kullanım Senaryosu**

1. **Başlangıç:**
   - Kullanıcı telefon tarayıcısında `phone.html` sayfasını açar
   - GPS izni verilir
   - Socket.IO bağlantısı kurulur

2. **Veri Gönderimi:**
   - GPS her güncellemede `telemetry` event'i ile backend'e gönderilir
   - Backend hız ve irtifa hesaplar
   - `telemetry_update` event'i ile client'a geri gönderilir

3. **Görüntüleme:**
   - Client, gelen telemetri verilerini ekranda gösterir
   - Hız, irtifa, heading, batarya bilgileri canlı güncellenir

4. **Veri Saklama:**
   - Anlamlı telemetri verileri MongoDB'ye kaydedilir (throttled)
   - Geçmiş veriler sorgulanabilir

---

### 10. **Teknik Detaylar**

**Haversine Formülü:**
- Dünya yarıçapı: 6,371,000 m
- Küresel trigonometri kullanır
- Yüksek doğruluk (genellikle ±0.5% hata)

**Hız Hesaplama:**
- Minimum zaman farkı: 0.5 saniye (gürültü önleme)
- Maksimum hız: 200 km/h (anormal değer filtreleme)
- Çıktı: km/h (1 ondalık basamak)

**İrtifa Hesaplama:**
- Home altitude: İlk GPS verisi
- Relative altitude: Absolute - Home
- Çıktı: metre (1 ondalık basamak)

**Throttling:**
- MongoDB kayıt: 2 saniyede bir (drone başına)
- Socket.IO broadcast: Her veri (throttle yok)

---

### 11. **Geliştirme Notları**

**Modüler Yapı:**
- Her servis kendi sorumluluğuna odaklanır
- Utility fonksiyonları ayrı dosyalarda
- Kolay test edilebilir kod

**Hata Yönetimi:**
- GPS hataları yakalanır ve loglanır
- Socket.IO bağlantı hataları yönetilir
- Validasyon katmanı (validators.js)

**Performans:**
- Throttling ile MongoDB yükü azaltılır
- Socket.IO ile gerçek zamanlı veri akışı
- Efficient GPS tracking (watchPosition)

---

### 12. **Gelecek Geliştirmeler**

🔮 **Öneriler:**
- Uçuş rotası kaydetme ve görselleştirme
- Telemetri verilerini grafik olarak gösterme
- Çoklu drone desteği (harita üzerinde)
- Uçuş istatistikleri (toplam mesafe, max hız, vb.)
- Alert sistemi (hız limiti, irtifa limiti)
- Export özelliği (CSV, JSON)

---

## 📚 Kullanılan Teknolojiler

- **Frontend:** HTML5, JavaScript (ES6+), Socket.IO Client
- **Backend:** Node.js, Express, Socket.IO Server
- **Database:** MongoDB, Mongoose
- **GPS:** HTML5 Geolocation API
- **Matematik:** Haversine formülü, Trigonometri

---

## 🎯 Sonuç

Bu sistem, telefon tarayıcısından gelen GPS verilerini kullanarak gerçek zamanlı drone telemetri sistemi oluşturur. Haversine formülü ile hız hesaplama ve home altitude mantığı ile irtifa hesaplama yaparak, gerçek drone telemetri sistemlerine benzer bir yapı sunar. Modüler mimari sayesinde kolay genişletilebilir ve bakımı yapılabilir bir kod yapısına sahiptir.

