// utils/deviceParser.js
const UAParser = require("ua-parser-js");

/**
 * Parse request to extract device, OS, browser, and IP info
 * @param {Object} req - Express request object
 * @returns {Object} - { ipAddress, device, os, browser, userAgent }
 */
const parseDeviceInfo = (req) => {
  const userAgent = req.headers["user-agent"] || "";
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  console.log(result);

  // Extract IP Address
  const ipAddress =
    req.ip ||
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    "Unknown";

  
  const deviceType = result.device.type || "desktop";
  let device = "Desktop";
  if (deviceType === "mobile") {
    device = "Mobile";
  } else if (deviceType === "tablet") {
    device = "Tablet";
  } else if (deviceType === "wearable") {
    device = "Wearable";
  } else if (deviceType === "smarttv") {
    device = "Smart TV";
  }

  // Extract OS
  const os = result.os.name || "Unknown";

  // Extract Browser
  const browser = result.browser.name || "Unknown";

  return {
    ipAddress,
    device,
    os,
    browser,
    userAgent,
  };
};

module.exports = { parseDeviceInfo };