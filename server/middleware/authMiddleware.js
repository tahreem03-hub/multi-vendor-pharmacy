import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Log the incoming header to see if Bearer is present
    console.log("--- Auth Debug ---");
    console.log("Auth Header:", authHeader ? "Received" : "MISSING");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Fail: Missing or malformed Bearer header");
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const token = authHeader.split(" ")[1];

    console.log("DEBUG SECRET:", process.env.JWT_SECRET);
    
    // Verify token and catch specific JWT errors
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token Verified. User ID from token:", decoded.id);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      console.log("Fail: User ID in token does not exist in Database");
      return res.status(404).json({ message: "User not found" });
    }
    
    if (!user.isActive) {
      console.log("Fail: User account is inactive");
      return res.status(403).json({ message: "Account is deactivated" });
    }

    console.log("User Role:", user.role);
    console.log("Success: User attached to request");
    
    req.user = user;
    next();
  } catch (error) {
    // This will tell you if the secret is wrong or if the token is expired
    console.error("JWT Error Type:", error.name); 
    console.error("Auth Error Message:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    console.log(`Checking Role: ${req.user?.role} against allowed: ${roles}`);
    if (!req.user || !roles.includes(req.user.role)) {
      console.log("Fail: Role mismatch");
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
  console.log(`PrescriberSelf Check: requestedId=${requestedId}, userPrescriberId=${req.user.prescriberId}`);

  if (req.user.role === "admin") return next();

  if (requestedId && requestedId !== req.user.prescriberId) {
    return res.status(403).json({
      message: "Access denied. You can only view your own data.",
    });
  }
  next();
};