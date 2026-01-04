"use strict";

/**
 * Geodesy Utilities - GPS hesaplamaları için yardımcı fonksiyonlar
 * 
 * Haversine formülü kullanarak iki GPS koordinatı arasındaki mesafeyi hesaplar.
 * Bu formül, küresel yüzey üzerindeki mesafeyi yüksek doğrulukla hesaplar.
 */

// Dünya'nın ortalama yarıçapı (metre cinsinden)
const EARTH_RADIUS_M = 6371000;

/**
 * Haversine formülü ile iki GPS koordinatı arasındaki mesafeyi hesaplar
 * 
 * @param {number} lat1 - İlk noktanın enlemi (derece)
 * @param {number} lon1 - İlk noktanın boylamı (derece)
 * @param {number} lat2 - İkinci noktanın enlemi (derece)
 * @param {number} lon2 - İkinci noktanın boylamı (derece)
 * @returns {number} Mesafe (metre cinsinden)
 */
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
  const distance = EARTH_RADIUS_M * c;

  return distance;
}

/**
 * Dereceyi radyana çevirir
 * 
 * @param {number} degrees - Derece cinsinden açı
 * @returns {number} Radyan cinsinden açı
 */
function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

/**
 * Metre cinsinden mesafeyi kilometreye çevirir
 * 
 * @param {number} meters - Metre cinsinden mesafe
 * @returns {number} Kilometre cinsinden mesafe
 */
function metersToKilometers(meters) {
  return meters / 1000;
}

/**
 * İki GPS noktası arasındaki bearing (yön açısı) hesaplar
 * 
 * @param {number} lat1 - İlk noktanın enlemi
 * @param {number} lon1 - İlk noktanın boylamı
 * @param {number} lat2 - İkinci noktanın enlemi
 * @param {number} lon2 - İkinci noktanın boylamı
 * @returns {number} Bearing açısı (0-360 derece)
 */
function calculateBearing(lat1, lon1, lat2, lon2) {
  const dLon = toRadians(lon2 - lon1);
  const lat1Rad = toRadians(lat1);
  const lat2Rad = toRadians(lat2);

  const y = Math.sin(dLon) * Math.cos(lat2Rad);
  const x =
    Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);

  let bearing = Math.atan2(y, x);
  bearing = (bearing * 180) / Math.PI;
  bearing = (bearing + 360) % 360; // 0-360 aralığına normalize et

  return bearing;
}

module.exports = {
  haversineDistance,
  toRadians,
  metersToKilometers,
  calculateBearing,
};

