"use strict";

const mongoose = require("mongoose");

const flightSessionSchema = new mongoose.Schema(
  {
    droneId: {
      // Drone _id string tutulur; telefon/uuid destekler.
      type: String,
      ref: "Drone",
      required: true,
      index: true,
    },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FlightSession", flightSessionSchema);

