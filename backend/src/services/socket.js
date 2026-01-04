"use strict";

const telemetryIngestService = require("./telemetryIngestService");

function initSocket(server) {
  const { Server } = require("socket.io");

  const io = new Server(server, {
    cors: { origin: "*" },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
    console.log("[socket] connected", socket.id);

    // Client'tan gelen telemetri verisi
    socket.on("telemetry", async (payload) => {
      try {
        await telemetryIngestService.handleIncoming(payload, io, socket);
      } catch (err) {
        console.error("[socket] telemetry error", err.message);
        socket.emit("error", { message: "invalid telemetry" });
      }
    });

    // Geriye uyumluluk için eski event'i de destekle
    socket.on("drone:telemetry", async (payload) => {
      try {
        await telemetryIngestService.handleIncoming(payload, io, socket);
      } catch (err) {
        console.error("[socket] telemetry error", err.message);
        socket.emit("error", { message: "invalid telemetry" });
      }
    });

    socket.on("disconnect", () => {
      console.log("[socket] disconnected", socket.id);
    });
  });

  return io;
}

module.exports = initSocket;

