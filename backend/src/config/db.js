"use strict";

const mongoose = require("mongoose");
const { MONGO_URI, MONGO_DB } = require("./env");

async function connectDB() {
  await mongoose.connect(MONGO_URI, { dbName: MONGO_DB });
  console.log(`[db] connected to ${MONGO_DB}`);
}

module.exports = { connectDB };

