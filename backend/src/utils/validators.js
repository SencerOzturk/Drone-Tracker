"use strict";

function validateTelemetry(raw) {
  if (!raw) throw new Error("empty payload");

  const required = [
    "droneId",
    "latitude",
    "longitude",
    "speed",
    "heading",
    "battery",
    "timestamp",
  ];

  required.forEach((k) => {
    if (raw[k] === undefined || raw[k] === null) {
      throw new Error(`missing ${k}`);
    }
  });

  // altitude opsiyonel olabilir (null gelebilir, backend hesaplayacak)
  const data = {
    droneId: String(raw.droneId),
    latitude: Number(raw.latitude),
    longitude: Number(raw.longitude),
    altitude: raw.altitude !== null && raw.altitude !== undefined ? Number(raw.altitude) : null,
    speed: Number(raw.speed) || 0,
    heading: Number(raw.heading) % 360,
    battery: Math.max(0, Math.min(1, Number(raw.battery))),
    timestamp: Number(raw.timestamp) || Date.now(),
  };

  if (Number.isNaN(data.latitude) || Number.isNaN(data.longitude)) {
    throw new Error("invalid coords");
  }

  return data;
}

module.exports = { validateTelemetry };

