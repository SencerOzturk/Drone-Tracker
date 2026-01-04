"use strict";

const path = require("path");
const dotenv = require("dotenv");

// Load environment variables from backend/.env if present, otherwise root .env
const envPath = process.env.BACKEND_ENV_PATH
  ? path.resolve(process.env.BACKEND_ENV_PATH)
  : path.resolve(__dirname, "../../.env");

dotenv.config({ path: envPath });

module.exports = {
  PORT: process.env.PORT || 4000,
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017",
  MONGO_DB: process.env.MONGO_DB || "drone-tracking",
  NODE_ENV: process.env.NODE_ENV || "development",
};

