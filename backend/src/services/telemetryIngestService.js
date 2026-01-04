"use strict";

const Telemetry = require("../models/Telemetry");
const Drone = require("../models/Drone");
const { validateTelemetry } = require("../utils/validators");
const { processTelemetry } = require("./telemetryCalculator");

// Persist telemetry at most once per BUFFER_MS per drone.
const BUFFER_MS = 2000;
const lastSavedMap = new Map(); // droneId -> timestamp

async function ensureDrone(droneId) {
  const existing = await Drone.findById(droneId);
  if (existing) return existing;
  return Drone.create({
    _id: droneId,
    name: `Drone-${droneId}`,
    status: "in_flight",
  });
}

/**
 * Gelen telemetri verisini işle, hız ve irtifa hesapla
 * 
 * @param {Object} payload - Client'tan gelen telemetri verisi
 * @param {Object} io - Socket.IO server instance
 * @param {Object} socket - Socket.IO socket instance (opsiyonel, client'a özel mesaj göndermek için)
 * @returns {Object} İşlenmiş ve hesaplanmış telemetri verisi
 */
async function handleIncoming(payload, io, socket = null) {
  const data = validateTelemetry(payload);
  await ensureDrone(data.droneId);

  // Hız ve irtifa hesaplamalarını yap (async - GPS API kullanabilir)
  const processedData = await processTelemetry(data.droneId, {
    latitude: data.latitude,
    longitude: data.longitude,
    altitude: data.altitude,
    timestamp: data.timestamp,
  });

  // Normalize edilmiş veri (tüm alanlar dahil)
  const normalized = {
    droneId: data.droneId,
    latitude: data.latitude,
    longitude: data.longitude,
    altitude: data.altitude, // Raw altitude (cihazdan gelen)
    absoluteAltitude: processedData.absoluteAltitude, // Hesaplanmış absolute altitude
    relativeAltitude: processedData.relativeAltitude, // Home'a göre relative altitude
    homeAltitude: processedData.homeAltitude, // Home point altitude
    homeLatitude: processedData.homeLatitude, // Home point latitude
    homeLongitude: processedData.homeLongitude, // Home point longitude
    speed: data.speed, // Raw speed (cihazdan gelen, m/s)
    calculatedSpeed: processedData.calculatedSpeed, // Hesaplanmış hız (km/h)
    heading: data.heading,
    battery: data.battery,
    timestamp: data.timestamp,
  };

  // Client'a özel telemetry_update event'i gönder (hesaplanmış verilerle)
  if (socket) {
    socket.emit("telemetry_update", normalized);
  }

  // Tüm dinleyicilere broadcast et (harita güncellemesi için)
  io.emit("drone:telemetry:broadcast", normalized);

  // Persist with throttling (sadece anlamlı verileri kaydet)
  const now = Date.now();
  const lastSaved = lastSavedMap.get(data.droneId) || 0;
  if (now - lastSaved >= BUFFER_MS) {
    lastSavedMap.set(data.droneId, now);
    await Telemetry.create({
      droneId: data.droneId,
      latitude: data.latitude,
      longitude: data.longitude,
      altitude: data.altitude,
      absoluteAltitude: processedData.absoluteAltitude,
      relativeAltitude: processedData.relativeAltitude,
      homeAltitude: processedData.homeAltitude,
      speed: data.speed,
      calculatedSpeed: processedData.calculatedSpeed,
      heading: data.heading,
      battery: data.battery,
      timestamp: new Date(data.timestamp),
    });
  }

  return normalized;
}

module.exports = { handleIncoming, BUFFER_MS };

