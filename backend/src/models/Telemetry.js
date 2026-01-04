"use strict";

const mongoose = require("mongoose");

const telemetrySchema = new mongoose.Schema(
  {
    droneId: {
      // Drone _id string tutulur; telefon/uuid destekler.
      type: String,
      ref: "Drone",
      required: true,
      index: true,
    },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    altitude: { type: Number, required: true }, // Cihazdan gelen raw altitude
    absoluteAltitude: { type: Number }, // Hesaplanmış absolute altitude (m)
    relativeAltitude: { type: Number }, // Home point'e göre relative altitude (m)
    homeAltitude: { type: Number }, // Home point altitude (m)
    speed: { type: Number, required: true }, // Cihazdan gelen raw speed (m/s)
    calculatedSpeed: { type: Number }, // Haversine ile hesaplanmış hız (km/h)
    heading: { type: Number, required: true },
    battery: { type: Number, required: true },
    timestamp: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

telemetrySchema.index({ droneId: 1, timestamp: -1 });

module.exports = mongoose.model("Telemetry", telemetrySchema);

