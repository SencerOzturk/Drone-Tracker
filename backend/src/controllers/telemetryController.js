"use strict";

const createError = require("http-errors");
const Telemetry = require("../models/Telemetry");
const telemetryIngestService = require("../services/telemetryIngestService");

async function listTelemetry(req, res) {
  const { droneId, limit = 100 } = req.query;
  if (!droneId) {
    throw createError(400, "droneId is required");
  }
  const docs = await Telemetry.find({ droneId })
    .sort({ timestamp: -1 })
    .limit(Math.min(Number(limit) || 100, 500));
  res.json(docs);
}

async function ingestTelemetry(req, res) {
  const io = req.app.get("io");
  await telemetryIngestService.handleIncoming(req.body, io);
  res.status(201).json({ ok: true });
}

module.exports = { listTelemetry, ingestTelemetry };

