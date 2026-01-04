"use strict";

const express = require("express");
const { startSession, endSession, listSessions } = require("../controllers/flightSessionController");

const router = express.Router();

router.get("/", listSessions);
router.post("/start", startSession);
router.post("/:id/end", endSession);

module.exports = router;

