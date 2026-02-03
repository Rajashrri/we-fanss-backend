// middleware/trackActivity.js
const LoginHistory = require("../models/loginhistroy-model");

const trackActivity = async (req, res, next) => {
  try {
    // Get refresh token from cookies or headers
    const refreshToken = 
      req.cookies?.refreshToken || 
      req.headers["x-refresh-token"];
    
    // Only track if user is authenticated
    if (refreshToken && req.user) {
      // Find active session
      const session = await LoginHistory.findOne({
        sessionId: refreshToken,
        user: req.user.userId,
        status: "active",
      });

      if (session) {
        // Update last activity time
        session.lastActivity = new Date();
        
        // Update current page
        session.currentPage = req.originalUrl;
        
        // Add to pages visited (only if not already added)
        if (!session.pagesVisited.includes(req.originalUrl)) {
          session.pagesVisited.push(req.originalUrl);
        }

        await session.save();
      }
    }
  } catch (error) {
    // Don't break the request if tracking fails
    console.error("Activity tracking error:", error.message);
  }
  
  next();
};

module.exports = trackActivity;