// utils/activityLogger.js
const ActivityLog = require("../models/activitylog-model");
const { parseDeviceInfo } = require("./deviceParser");
const {
  ACTIVITY_ACTIONS,
  ACTIVITY_RESOURCES,
  ACTIVITY_STATUS,
} = require("../constants/activityLogConstants");

/**
 * Log user activity
 * @param {Object} params - Activity log parameters
 * @param {String} params.userId - User ID
 * @param {String} params.performedByRole - User's role (Admin/Editor/User)
 * @param {String} params.action - Action type (from ACTIVITY_ACTIONS)
 * @param {String} params.resource - Resource name (from ACTIVITY_RESOURCES)
 * @param {Object} params.item - Item details { type, id, name }
 * @param {String} params.activity - Human-readable activity description
 * @param {Object} params.req - Express request object
 * @param {String} params.status - Status (SUCCESS/FAILED/PENDING)
 */
const logActivity = async (params) => {
  try {
    const {
      userId,
      performedByRole,
      action,
      resource,
      item,
      activity,
      req,
      status = ACTIVITY_STATUS.SUCCESS,
    } = params;

    // Validate required fields
    if (!action || !resource || !activity) {
      console.error("Missing required activity log fields:", { action, resource, activity });
      return;
    }

    // Parse device info using external helper
    const { ipAddress, device, os, browser } = parseDeviceInfo(req);

    // Prepare activity log data
    const activityData = {
      userId,
      performedByRole,
      action,
      resource,
      item,
      activity,
      status,
      ipAddress,
      device,
      os,
      browser,
    };

    // Create activity log
    await ActivityLog.create(activityData);
  } catch (error) {
    // Don't throw error, just log it - activity logging should not break the main flow
    console.error("Error logging activity:", error.message);
  }
};

module.exports = { logActivity };