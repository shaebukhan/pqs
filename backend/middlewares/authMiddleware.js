const JWT = require("jsonwebtoken");
const UserModel = require("../models/UserModel");
const adminModel = require("../models/adminModel");

// Protected route Token base

const requireSignIn = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization token missing or malformed",
      });
    }

    // Extract and verify token
    const token = authHeader.split(" ")[1];
    const decoded = JWT.verify(token, process.env.JWT_SECRET_KEY);

    if (!decoded.userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. No userId found.",
      });
    }

    req.user = { id: decoded.userId }; // Attach userId to req.user

    next();
  } catch (error) {
    console.log("❌ Token verification error:", error);
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ success: false, message: "Token expired." });
    } else if (error.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({ success: false, message: "Invalid token." });
    } else {
      return res
        .status(500)
        .json({ success: false, message: "Internal server error." });
    }
  }
};

// Admin middleware
const isAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. User ID missing.",
      });
    }

    // Fetch admin data from DB
    const admin = await adminModel.findById(req.user.id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found.",
      });
    }

    // ✅ Allow only "super-admin" and "sub-admin"
    const allowedRoles = ["super-admin", "sub-admin"];
    if (!allowedRoles.includes(admin.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    next();
  } catch (error) {
    console.error("Admin check error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while checking admin status.",
    });
  }
};

const checkPermission = (module, action) => {
  return async (req, res, next) => {
    try {
      const admin = await adminModel.findById(req.user.id);

      // Super-admin has unrestricted access
      if (admin.role === "super-admin") {
        return next();
      }

      // Sub-admin: Check if they have the required permission
      if (admin.access[module]?.includes(action)) {
        next(); // Allow access
      } else {
        res.status(403).json({
          success: false,
          message: `Unauthorized: You do not have permission to ${action} ${module}.`,
        });
      }
    } catch (error) {
      console.error("Permission check error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while checking permissions.",
      });
    }
  };
};
module.exports = { requireSignIn, isAdmin, checkPermission };
