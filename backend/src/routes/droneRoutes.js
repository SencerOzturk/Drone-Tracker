"use strict";

const express = require("express");
const { listDrones, upsertDrone } = require("../controllers/droneController");

const router = express.Router();

router.get("/", listDrones);
router.post("/", upsertDrone);

module.exports = router;

