"use strict";

const createError = require("http-errors");
const FlightSession = require("../models/FlightSession");

async function startSession(req, res) {
  const { droneId, startTime } = req.body;
  if (!droneId) throw createError(400, "droneId is required");
  const session = await FlightSession.create({
    droneId,
    startTime: startTime ? new Date(startTime) : new Date(),
  });
  res.status(201).json(session);
}

async function endSession(req, res) {
  const { id } = req.params;
  const session = await FlightSession.findById(id);
  if (!session) throw createError(404, "session not found");
  if (session.endTime) return res.json(session);
  session.endTime = new Date();
  await session.save();
  res.json(session);
}

async function listSessions(req, res) {
  const { droneId, limit = 50 } = req.query;
  const query = droneId ? { droneId } : {};
  const sessions = await FlightSession.find(query)
    .sort({ startTime: -1 })
    .limit(Math.min(Number(limit) || 50, 200));
  res.json(sessions);
}

module.exports = { startSession, endSession, listSessions };

