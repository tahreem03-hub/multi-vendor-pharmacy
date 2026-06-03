import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    if (!user.isActive) {
      return res.status(403).json({ message: "Account is deactivated" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("JWT Error:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required role: ${roles.join(" or ")}`,
      });
    }
    next();
  };
};

export const adminOnly      = [protect, requireRole("admin")];
export const prescriberOnly = [protect, requireRole("prescriber")];
export const staffOnly      = [protect, requireRole("admin", "prescriber")];

export const prescriberSelf = (req, res, next) => {
  const requestedId = req.params.prescriberId || req.body.prescriberId;

  if (req.user.role === "admin") return next();

  if (requestedId && requestedId !== req.user.prescriberId) {
    return res.status(403).json({
      message: "Access denied. You can only view your own data.",
    });
  }
  next();
};