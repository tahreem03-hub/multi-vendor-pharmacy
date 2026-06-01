import User from "../models/User.js";
import OnePort from "../models/OnePort.js"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";

// ── Register ──────────────────────────────────────────────────
export const register = async (req, res, next) => {
  console.log("Registering email:", req.body.email);
  try {
    // 1. Destructure all fields ensuring alignment with the frontend and model schema
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      accountType, 
      phoneNumber,                // Fixed: Aligned to Schema key
      dob, 
      address,                    // Fixed: Aligned to Schema key
      prescriberId,
      agreedToTerms,              // Added: Required by Schema
      isAuthorisedProfessional    // Added: Evaluated dynamically or sent directly
    } = req.body;

    // Check for existing user
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password and generate 6-digit OTP
    const hashed = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Setup standardized application rules for roles matching your pre-save hooks
    let normalizedRole = 'user';
    if (accountType === 'Prescriber' || accountType === 'Practitioner') {
      normalizedRole = 'prescriber';
    }

    // 2. Pass explicitly mapped fields matching your exact Mongoose definitions
    const user = await User.create({
      email,
      password: hashed,
      firstName,
      lastName,
      accountType,
      phoneNumber,                // Fixed field assignment
      dob,
      address,                    // Fixed field assignment
      role: normalizedRole, 
      otp,
      otpExpire: Date.now() + 10 * 60 * 1000,
      agreedToTerms: agreedToTerms === true || agreedToTerms === 'true', // Hard enforcement
      isAuthorisedProfessional: isAuthorisedProfessional === true || isAuthorisedProfessional === 'true'
    });

    // 3. Create the accompanying record if the user is a prescriber
    if (user.role === "prescriber") {
      await OnePort.create({
        prescriber: user._id,
        prescriberId: user.prescriberId || prescriberId || "", // Pulls safely from user instance or fallback payload
      });
    }

    // 4. Send Verification Email
    try {
      await sendEmail(
        email, 
        "Verify Your Email - DrGPharma", 
        `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #0d9488;">Welcome to DrGPharma</h2>
          <p>Thank you for registering. Please use the following code to verify your account:</p>
          <div style="background: #f1f5f9; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #0f172a; border-radius: 8px;">
            ${otp}
          </div>
          <p style="color: #64748b; font-size: 12px; margin-top: 20px;">This code expires in 10 minutes.</p>
        </div>
        `
      );
    } catch (mailError) {
      console.error("Mail Send Error:", mailError);
      // Clean up created entities if email dispatch fails so they can retry registering safely
      await User.findByIdAndDelete(user._id);
      if (user.role === "prescriber") {
        await OnePort.deleteOne({ prescriber: user._id });
      }
      return res.status(500).json({ message: "Failed to send verification OTP email. Registration rolled back." });
    }

    res.status(201).json({ message: "OTP sent to your email." });
  } catch (err) {
    console.error("Registration Middleware Caught Error:", err); 
    next(err); 
  }
}

// ── Verify OTP ────────────────────────────────────────────────
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user)            return res.status(404).json({ message: "User not found" });
    if (user.isVerified)  return res.status(400).json({ message: "Already verified" });
    if (user.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
    if (user.otpExpire < Date.now()) return res.status(400).json({ message: "OTP expired" });

    user.isVerified  = true;
    user.otp         = undefined;
    user.otpExpire   = undefined;
    await user.save();

    res.json({ message: "Email verified. You can now login." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Login ─────────────────────────────────────────────────────
// FIX 1: returns prescriberId so frontend can store it
// FIX 2: returns firstName + lastName instead of name (matches your User model)
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user)            return res.status(404).json({ message: "User not found" });
    if (!user.isVerified) return res.status(401).json({ message: "Please verify your email first" });
    if (!user.isApproved) return res.status(403).json({ message: "Your account is pending admin approval." });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid password" });

    console.log("DEBUG SECRET:", process.env.JWT_SECRET);

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id:           user._id,
        firstName:    user.firstName,
        lastName:     user.lastName,
        email:        user.email,
        role:         user.role,          // "admin" | "prescriber" | "user"
        prescriberId: user.prescriberId || null, // e.g. "PRE-AB12CD" for prescribers
        accountType:  user.accountType   || null,
        isApproved:   user.isApproved,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Forgot Password ───────────────────────────────────────────
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken  = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    try {
      await sendEmail(email, "Reset Your Password", `
        <h2>Password Reset</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="background:#4f46e5;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;">
          Reset Password
        </a>
        <p>Expires in 15 minutes.</p>
      `);
    } catch (err) {
      user.resetPasswordToken  = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return res.status(500).json({ message: "Failed to send reset email." });
    }

    res.json({ message: "Password reset link sent to email." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Reset Password ────────────────────────────────────────────
export const resetPassword = async (req, res) => {
  try {
    const { token }    = req.params;
    const { password } = req.body;

    const hashed = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken:  hashed,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    user.password            = await bcrypt.hash(password, 10);
    user.resetPasswordToken  = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: "Password reset successful. You can now login." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};