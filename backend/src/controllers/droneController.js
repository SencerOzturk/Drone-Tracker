"use strict";

const Drone = require("../models/Drone");

async function listDrones(_req, res) {
  const drones = await Drone.find().sort({ createdAt: -1 });
  res.json(drones);
}

async function upsertDrone(req, res) {
  const { id, name, status } = req.body;
  if (!id || !name) {
    res.status(400);
    throw new Error("id and name are required");
  }
  const drone = await Drone.findByIdAndUpdate(
    id,
    { name, status: status || "idle" },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  res.status(201).json(drone);
}

module.exports = { listDrones, upsertDrone };

