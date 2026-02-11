// middleware/authenticate.js
const UserModel = require("../models/user-model");
const Role = require("../models/role-model");
const jwt = require("jsonwebtoken"); 

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      if (!process.env.JWT_SECRET_KEY) {
        throw new Error("JWT_SECRET_KEY not configured");
      }

      decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    } catch (err) {
      return res.status(401).json({
        success: false,
        message:
          err.name === "TokenExpiredError"
            ? "Session expired. Please login again."
            : "Invalid token"
      });
    }

    // ✅ Fetch user from DB
    const user = await UserModel.findById(decoded.sub)
      .select("-password")
      .lean();


      // console.log(user)

    if (!user) {

      console.log("yaha sa aya hai " ,user)
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Account inactive"
      });
    }

    // ✅ Fetch role from database - ALWAYS verify from DB
    const roleDoc = await Role.findById(user.role)  // ✅ Changed from user.roleId to user.role
      .select("name is_system")
      .lean();

    if (!roleDoc) {
      return res.status(403).json({
        success: false,
        message: "Role not found or invalid"
      });
    }

    // ✅ Attach verified data to request
    req.user = {
      userId: user._id,
      name: user.name,
      email: user.email,
      roleId: user.role,          
      roleName: roleDoc.name, 
      isSystemRole: roleDoc.is_system || false  
    };


   

    next();

  } catch (err) {
    console.error("Auth error:", err);
    return res.status(500).json({
      success: false,
      message: "Authentication failed"
    });
  }
};

module.exports = authenticate;