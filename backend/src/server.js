"use strict";

const http = require("http");
const app = require("./app");
const { PORT } = require("./config/env");
const { connectDB } = require("./config/db");
const initSocket = require("./services/socket");

async function bootstrap() {
  await connectDB();

  const server = http.createServer(app);
  const io = initSocket(server);
  app.set("io", io);

  server.listen(PORT, () => {
    console.log(`[server] listening on ${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("[server] failed to start", err);
  process.exit(1);
});
