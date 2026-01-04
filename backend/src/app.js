"use strict";

const express = require("express");
const path = require("path");
const cors = require("cors");
const morgan = require("morgan");

const droneRoutes = require("./routes/droneRoutes");
const telemetryRoutes = require("./routes/telemetryRoutes");
const flightSessionRoutes = require("./routes/flightSessionRoutes");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express(); // ✅ ÖNCE app OLUŞTURULUR

// 🔥 public klasörünü dış dünyaya aç
app.use(express.static(path.join(__dirname, "public")));

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Root endpoint: serve the demo page to avoid 404 on "/"
app.get("/", (_req, res) =>
  res.sendFile(path.join(__dirname, "public", "phone.html"))
);

// Basic favicon handler to silence 404 noise
app.get("/favicon.ico", (_req, res) => res.status(204).end());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/drones", droneRoutes);
app.use("/api/telemetry", telemetryRoutes);
app.use("/api/sessions", flightSessionRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
