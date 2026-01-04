"use strict";

/**
 * Elevation Service - GPS koordinatlarından yükseklik (elevation) hesaplama
 * 
 * Cihazdan altitude bilgisi gelmediğinde, GPS koordinatlarından
 * yükseklik hesaplamak için OpenElevation API kullanır.
 */

const https = require("https");

/**
 * OpenElevation API ile GPS koordinatlarından yükseklik hesapla
 * 
 * @param {number} latitude - Enlem
 * @param {number} longitude - Boylam
 * @returns {Promise<number>} Yükseklik (metre)
 */
async function getElevationFromAPI(latitude, longitude) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      locations: [{ latitude, longitude }],
    });

    const options = {
      hostname: "api.open-elevation.com",
      path: "/api/v1/lookup",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
      },
      timeout: 5000, // 5 saniye timeout
    };

    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          if (json.results && json.results.length > 0) {
            const elevation = json.results[0].elevation;
            console.log(`[elevation] API'den yükseklik alındı: ${elevation.toFixed(1)} m`);
            resolve(elevation);
          } else {
            reject(new Error("API'den yükseklik verisi alınamadı"));
          }
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on("error", (err) => {
      console.error(`[elevation] API hatası: ${err.message}`);
      reject(err);
    });

    req.on("timeout", () => {
      req.destroy();
      reject(new Error("API timeout"));
    });

    req.write(postData);
    req.end();
  });
}

/**
 * GPS koordinatlarından yükseklik hesapla
 * 
 * @param {number} latitude - Enlem
 * @param {number} longitude - Boylam
 * @returns {Promise<number|null>} Yükseklik (metre) veya null (hata durumunda)
 */
async function getElevation(latitude, longitude) {
  try {
    const elevation = await getElevationFromAPI(latitude, longitude);
    return elevation;
  } catch (err) {
    console.warn(`[elevation] Yükseklik hesaplanamadı: ${err.message}`);
    return null;
  }
}

module.exports = {
  getElevation,
  getElevationFromAPI,
};

