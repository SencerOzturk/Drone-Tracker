"use strict";

const { haversineDistance, metersToKilometers } = require("../utils/geodesy");
const { getElevation } = require("../utils/elevation");

/**
 * Telemetry Calculator Service
 * 
 * GPS verilerinden hız ve irtifa hesaplamaları yapar.
 * Her drone için önceki konum ve zaman bilgisini saklar.
 */

// Her drone için önceki telemetri verisini sakla
// Format: { droneId: { latitude, longitude, altitude, timestamp, homeAltitude, homeLatitude, homeLongitude } }
const previousTelemetryMap = new Map();

/**
 * Hız hesaplama (km/h)
 * 
 * Önceki GPS noktası ile şu anki nokta arasındaki mesafeyi
 * zaman farkına bölerek hızı hesaplar.
 * 
 * @param {string} droneId - Drone ID
 * @param {number} latitude - Şu anki enlem
 * @param {number} longitude - Şu anki boylam
 * @param {number} timestamp - Şu anki zaman (ms)
 * @returns {number} Hız (km/h)
 */
function calculateSpeed(droneId, latitude, longitude, timestamp) {
  const previous = previousTelemetryMap.get(droneId);

  // İlk veri geldiğinde veya önceki veri yoksa hız 0
  if (!previous || !previous.timestamp) {
    console.log(`[telemetryCalculator] İlk veri - hız hesaplanamıyor (droneId: ${droneId})`);
    return 0;
  }

  // Zaman farkını hesapla (saniye cinsinden)
  const timeDiffSeconds = (timestamp - previous.timestamp) / 1000;

  // Çok kısa zaman aralığında hız hesaplama (gürültüyü önlemek için)
  if (timeDiffSeconds < 0.5) {
    console.log(`[telemetryCalculator] Zaman farkı çok kısa (${timeDiffSeconds.toFixed(2)}s) - önceki hız kullanılıyor`);
    return previous.calculatedSpeed || 0;
  }

  // Haversine formülü ile mesafe hesapla (metre)
  const distanceMeters = haversineDistance(
    previous.latitude,
    previous.longitude,
    latitude,
    longitude
  );

  console.log(`[telemetryCalculator] Mesafe: ${distanceMeters.toFixed(2)} m, Zaman: ${timeDiffSeconds.toFixed(2)} s`);

  // Çok küçük mesafelerde hız hesaplama (GPS gürültüsü nedeniyle)
  if (distanceMeters < 2) {
    console.log(`[telemetryCalculator] Mesafe çok küçük (${distanceMeters.toFixed(2)} m) - hız 0 olarak ayarlandı`);
    return 0;
  }

  // Hız = mesafe / zaman (m/s)
  const speedMs = distanceMeters / timeDiffSeconds;

  // m/s'yi km/h'ye çevir
  const speedKmh = speedMs * 3.6;

  console.log(`[telemetryCalculator] Hız hesaplandı: ${speedKmh.toFixed(2)} km/h`);

  // Anormal hızları filtrele (örneğin GPS hatası nedeniyle çok yüksek hızlar)
  // Gerçekçi drone hızı genellikle 0-150 km/h arasındadır
  if (speedKmh > 200) {
    console.log(`[telemetryCalculator] Anormal hız (${speedKmh.toFixed(2)} km/h) - filtrelendi`);
    return previous.calculatedSpeed || 0;
  }

  return Math.round(speedKmh * 10) / 10; // 1 ondalık basamak
}

/**
 * İrtifa hesaplama (metre)
 * 
 * Eğer cihazdan altitude bilgisi geliyorsa onu kullanır.
 * Yoksa, GPS koordinatlarından yükseklik hesaplar (OpenElevation API).
 * İlk nokta "home altitude" olarak belirlenir.
 * 
 * @param {string} droneId - Drone ID
 * @param {number} altitude - Cihazdan gelen irtifa (metre, null olabilir)
 * @param {number} latitude - GPS enlemi (elevation API için)
 * @param {number} longitude - GPS boylamı (elevation API için)
 * @returns {Promise<Object>} { absoluteAltitude, relativeAltitude, homeAltitude }
 */
async function calculateAltitude(droneId, altitude, latitude, longitude) {
  const previous = previousTelemetryMap.get(droneId);

  // Home altitude'ı belirle (ilk veri geldiğinde)
  if (!previous || previous.homeAltitude === undefined) {
    let homeAlt;
    
    if (altitude !== null && altitude !== undefined && !isNaN(altitude)) {
      // Cihazdan altitude geliyorsa onu kullan
      homeAlt = altitude;
      console.log(`[telemetryCalculator] Home altitude (cihazdan): ${homeAlt.toFixed(1)} m`);
    } else {
      // Cihazdan altitude gelmiyorsa, GPS koordinatlarından yükseklik hesapla
      console.log(`[telemetryCalculator] Cihazdan altitude gelmedi, GPS'ten yükseklik hesaplanıyor...`);
      const elevation = await getElevation(latitude, longitude);
      
      if (elevation !== null && !isNaN(elevation)) {
        homeAlt = elevation;
        console.log(`[telemetryCalculator] Home altitude (GPS API): ${homeAlt.toFixed(1)} m`);
      } else {
        // API'den yükseklik alınamazsa 0 kabul et
        homeAlt = 0;
        console.log(`[telemetryCalculator] Home altitude (varsayılan): ${homeAlt.toFixed(1)} m`);
      }
    }
    
    // Home point koordinatlarını da sakla
    previousTelemetryMap.set(droneId, {
      latitude,
      longitude,
      altitude: homeAlt,
      absoluteAltitude: homeAlt,
      timestamp: Date.now(), // Geçici timestamp
      homeAltitude: homeAlt,
      homeLatitude: latitude, // Home point koordinatı
      homeLongitude: longitude, // Home point koordinatı
      calculatedSpeed: 0,
    });

    return {
      absoluteAltitude: homeAlt,
      relativeAltitude: 0, // İlk nokta home point
      homeAltitude: homeAlt,
      homeLatitude: latitude,
      homeLongitude: longitude,
    };
  }

  // Home altitude zaten belirlenmiş
  const homeAltitude = previous.homeAltitude;

  // Absolute altitude: cihazdan gelen değer, GPS API'den hesaplanan veya önceki değer
  let absoluteAltitude;
  
  if (altitude !== null && altitude !== undefined && !isNaN(altitude)) {
    // Cihazdan altitude geliyorsa onu kullan
    absoluteAltitude = altitude;
    console.log(`[telemetryCalculator] Cihazdan altitude alındı: ${altitude.toFixed(1)} m`);
  } else {
    // Cihazdan altitude gelmiyorsa, GPS koordinatlarından yükseklik hesapla
    console.log(`[telemetryCalculator] Cihazdan altitude gelmedi, GPS'ten yükseklik hesaplanıyor...`);
    const elevation = await getElevation(latitude, longitude);
    
    if (elevation !== null && !isNaN(elevation)) {
      absoluteAltitude = elevation;
      console.log(`[telemetryCalculator] GPS API'den altitude alındı: ${elevation.toFixed(1)} m`);
    } else {
      // API'den yükseklik alınamazsa, önceki absolute altitude'ı kullan
      absoluteAltitude = previous.absoluteAltitude !== undefined 
        ? previous.absoluteAltitude 
        : (previous.altitude !== undefined ? previous.altitude : homeAltitude);
      console.log(`[telemetryCalculator] GPS API başarısız, önceki absolute altitude kullanılıyor: ${absoluteAltitude.toFixed(1)} m`);
    }
  }

  // Relative altitude: absolute - home
  const relativeAltitude = absoluteAltitude - homeAltitude;
  console.log(`[telemetryCalculator] İrtifa - Absolute: ${absoluteAltitude.toFixed(1)} m, Relative: ${relativeAltitude.toFixed(1)} m, Home: ${homeAltitude.toFixed(1)} m`);

  // Home point koordinatlarını al
  const homeLatitude = previous.homeLatitude || latitude
  const homeLongitude = previous.homeLongitude || longitude

  return {
    absoluteAltitude: Math.round(absoluteAltitude * 10) / 10, // 1 ondalık basamak
    relativeAltitude: Math.round(relativeAltitude * 10) / 10,
    homeAltitude: homeAltitude,
    homeLatitude: homeLatitude,
    homeLongitude: homeLongitude,
  };
}

/**
 * Telemetri verisini güncelle ve önceki veriyi sakla
 * 
 * @param {string} droneId - Drone ID
 * @param {Object} telemetryData - Telemetri verisi
 * @returns {Promise<Object>} Hesaplanmış hız ve irtifa bilgileri ile güncellenmiş veri
 */
async function processTelemetry(droneId, telemetryData) {
  const { latitude, longitude, altitude, timestamp } = telemetryData;

  // Hız hesapla
  const calculatedSpeed = calculateSpeed(droneId, latitude, longitude, timestamp);

  // İrtifa hesapla (async - GPS API kullanabilir)
  const altitudeData = await calculateAltitude(droneId, altitude, latitude, longitude);

  // Önceki veriyi güncelle
  previousTelemetryMap.set(droneId, {
    latitude,
    longitude,
    altitude: altitudeData.absoluteAltitude, // Önceki absolute altitude
    absoluteAltitude: altitudeData.absoluteAltitude, // absoluteAltitude'ı da sakla
    timestamp,
    homeAltitude: altitudeData.homeAltitude,
    homeLatitude: altitudeData.homeLatitude || latitude,
    homeLongitude: altitudeData.homeLongitude || longitude,
    calculatedSpeed,
  });

  return {
    ...telemetryData,
    calculatedSpeed,
    absoluteAltitude: altitudeData.absoluteAltitude,
    relativeAltitude: altitudeData.relativeAltitude,
    homeAltitude: altitudeData.homeAltitude,
    homeLatitude: altitudeData.homeLatitude,
    homeLongitude: altitudeData.homeLongitude,
  };
}

/**
 * Bir drone'un telemetri geçmişini temizle
 * (Örneğin yeni uçuş başladığında)
 * 
 * @param {string} droneId - Drone ID
 */
function resetDroneTelemetry(droneId) {
  previousTelemetryMap.delete(droneId);
}

/**
 * Tüm drone telemetri geçmişini temizle
 */
function resetAllTelemetry() {
  previousTelemetryMap.clear();
}

module.exports = {
  processTelemetry,
  calculateSpeed,
  calculateAltitude,
  resetDroneTelemetry,
  resetAllTelemetry,
};

