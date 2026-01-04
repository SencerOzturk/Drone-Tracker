"use strict";

const express = require("express");
const { listTelemetry, ingestTelemetry } = require("../controllers/telemetryController");

const router = express.Router();

router.get("/", listTelemetry);
router.post("/", ingestTelemetry);

module.exports = router;

