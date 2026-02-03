// utils/deviceInfo.js
const UAParser = require("ua-parser-js");
const geoip = require("geoip-lite");

const getDeviceInfo = (req) => {
  // ✅ Get real IP address (handles proxies, load balancers, localhost)
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.headers["x-real-ip"] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip ||
    "Unknown";

  // Remove IPv6 prefix (::ffff:127.0.0.1 → 127.0.0.1)
  const cleanIp = ip.replace(/^::ffff:/, "");

  // ✅ Get location from IP (skip for localhost)
  let location = {
    country: null,
    city: null,
    region: null,
    timezone: null,
  };

  if (
    cleanIp !== "Unknown" &&
    cleanIp !== "::1" &&
    cleanIp !== "127.0.0.1" &&
    cleanIp !== "localhost"
  ) {
    const geo = geoip.lookup(cleanIp);
    if (geo) {
      location = {
        country: geo.country || null,
        city: geo.city || null,
        region: geo.region || null,
        timezone: geo.timezone || null,
      };
    }
  }

  
  const parser = new UAParser(req.headers["user-agent"]);
  const result = parser.getResult();

  return {
    ip: cleanIp,
    location,
    browser: result.browser.name || "Unknown",
    browserVersion: result.browser.version || "",
    os: result.os.name || "Unknown",
    osVersion: result.os.version || "",
    device: result.device.type ? result.device.type.charAt(0).toUpperCase() + result.device.type.slice(1) : "Desktop",
    deviceModel: result.device.model || "",
    userAgent: req.headers["user-agent"] || "Unknown",
  };
};

module.exports = getDeviceInfo;