// utils/loginHistoryLogger.js
const LoginHistory = require("../models/loginhistroy-model");
const { parseDeviceInfo } = require("./deviceParser");

/**
 * Log login/auth activity
 * @param {Object} params - Login history parameters
 * @param {String} params.userId - User ID (can be null for failed attempts)
 * @param {String} params.userName - User's name
 * @param {String} params.userEmail - User's email
 * @param {String} params.userRole - User's role
 * @param {Boolean} params.loginSuccess - Login success status
 * @param {String} params.loginMethod - Login method (PASSWORD/GOOGLE/OAUTH)
 * @param {String} params.otpMethod - OTP method (EMAIL_OTP/TOTP/NONE)
 * @param {String} params.loginFlow - Full login flow description
 * @param {String} params.failureReason - Failure reason if failed
 * @param {String} params.activity - Human-readable activity description
 * @param {Object} params.req - Express request object
 * @param {String} params.status - Status (SUCCESS/FAILED) - optional, auto-set from loginSuccess
 */
const logLoginHistory = async (params) => {
  try {
    const {
      userId = null,
      userName = "Unknown",
      userEmail,
      userRole = "Unknown",
      loginSuccess,
      loginMethod,
      otpMethod = "NONE",
      loginFlow,
      failureReason = null,
      activity,
      req,
      status,
    } = params;

    // Parse device info from request
    const deviceInfo = parseDeviceInfo(req);

    // Auto-set status from loginSuccess if not provided
    const finalStatus = status || (loginSuccess ? "SUCCESS" : "FAILED");

    // Prepare login history data
    const loginHistoryData = {
      userId,
      userName,
      userEmail,
      userRole,
      loginSuccess,
      loginMethod,
      otpMethod,
      loginFlow,
      failureReason,
      activity,
      status: finalStatus,
      ...deviceInfo, // Spread ipAddress, device, os, browser, userAgent
    };

    // Create login history
    await LoginHistory.create(loginHistoryData);
  } catch (error) {
    // Don't throw error, just log it - login history logging should not break the main flow
    console.error("Error logging login history:", error);
  }
};

module.exports = { logLoginHistory };