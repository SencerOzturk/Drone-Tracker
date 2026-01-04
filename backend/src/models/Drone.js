"use strict";

const mongoose = require("mongoose");

const droneSchema = new mongoose.Schema(
  {
    // String _id: telefonu/drone unit'ı kendi ID/UUID'siyle kaydedebilmek için.
    _id: { type: String, required: true },
    name: { type: String, required: true },
    status: {
      type: String,
      enum: ["idle", "in_flight", "offline", "online", "alert"],
      default: "offline",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Drone", droneSchema);

