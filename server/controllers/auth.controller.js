import User from "../models/User.js";
import OnePort from "../models/OnePort.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";
import { createPrescriber } from "../services/signatureRx.service.js";

// ── Register ──────────────────────────────────────────────────
export const register = async (req, res, next) => {
  console.log("Registering email:", req.body.email);
  console.log("Registration data:", req.body);

  try {
    const {
      // Personal details
      email,
      password,
      firstName,
      lastName,
      accountType,
      phoneNumber,
      dob,
      address,
      agreedToTerms,
      isAuthorisedProfessional,

      // Professional details
      professionalRole,      // Maps to professional_registration_body
      registrationNumber,    // Maps to registration_number
      primarySpeciality,
      trainingQualification,

      // Practice / business details
      practiceName,
      businessAddress,
      vatNumber,
      referralSource,
    } = req.body;

    // Check for existing user
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Validate SignatureRx required fields for prescribers
    if (accountType === 'Prescriber' || accountType === 'Practitioner') {
      if (!professionalRole) {
        return res.status(400).json({
          message: "Professional registration body is required for prescribers"
        });
      }
      if (!registrationNumber) {
        return res.status(400).json({
          message: "Registration number is required for prescribers"
        });
      }
    }

    // Hash password and generate 6-digit OTP
    const hashed = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Setup standardized application rules for roles
    let normalizedRole = 'user';
    if (accountType === 'Prescriber' || accountType === 'Practitioner') {
      normalizedRole = 'prescriber';
    }

    // Create user in your DB with all fields
    const userData = {
      email,
      password: hashed,
      firstName,
      lastName,
      accountType,
      phoneNumber,
      dob,
      address,
      role: normalizedRole,
      otp,
      otpExpire: Date.now() + 10 * 60 * 1000,
      agreedToTerms: agreedToTerms === true || agreedToTerms === 'true',
      isAuthorisedProfessional: isAuthorisedProfessional === true || isAuthorisedProfessional === 'true',

      // Professional details
      professionalRole: professionalRole || null,
      registrationNumber: registrationNumber || null,
      primarySpeciality: primarySpeciality || null,
      trainingQualification: trainingQualification || null,

      // Practice / business details
      practiceName: practiceName || null,
      businessAddress: businessAddress || null,
      vatNumber: vatNumber || null,
      referralSource: referralSource || null,
    };

    const user = await User.create(userData);

    // Create OnePort record if prescriber
    if (user.role === "prescriber") {
      await OnePort.create({
        prescriber: user._id,
        prescriberId: user.prescriberId,
      });
    }

    // ── Sync to SignatureRx if prescriber ──
    let signatureRxResult = null;
    let signatureRxError = null;

    const isSignatureRxConfigured = process.env.SIGNATURE_RX_EMAIL && process.env.SIGNATURE_RX_PASSWORD;

    if (user.role === "prescriber" && isSignatureRxConfigured) {
      try {
        // Generate a secure PIN for SignatureRx (6 digits)
        const securePin = Math.floor(100000 + Math.random() * 900000).toString();

        // Prepare data for SignatureRx - Only what they need
        const prescriberData = {
          object: 'prescriberReqeust',        //  SignatureRx identifier
          name: user.firstName,
          last_name: user.lastName,
          email: user.email,
          phone_number: parseInt(user.phoneNumber?.replace(/\D/g, '')) || 0, //  number
          prescriber_status: 'active',         // hardcoded
          registration_number: user.registrationNumber || '',
          professional_registration_body: user.professionalRole || 'GMC',
          secure_pin: parseInt(securePin),
        };

        // Call SignatureRx API
        signatureRxResult = await createPrescriber(prescriberData);

        // Store SignatureRx ID in user
        user.signatureRxId = String(signatureRxResult.prescriber_id);
        user.signatureRxStatus = 'synced';
        user.signatureRxLastSync = new Date();

        await user.save();

        console.log(`Prescriber ${user.email} synced to SignatureRx with ID: ${user.signatureRxId}`);
      } catch (error) {
        signatureRxError = error;
        user.signatureRxStatus = 'pending_sync';
        await user.save();
        console.error(' Failed to sync prescriber to SignatureRx:', error.message);
      }
    }

    // Send Verification Email
    try {
      const emailHtml = `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #0d9488;">Welcome to DrGPharma</h2>
          <p>Thank you for registering${user.role === 'prescriber' ? ' as a prescriber' : ''}.</p>
          <p>Please use the following code to verify your account:</p>
          <div style="background: #f1f5f9; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #0f172a; border-radius: 8px;">
            ${otp}
          </div>
          <p style="color: #64748b; font-size: 12px; margin-top: 20px;">This code expires in 10 minutes.</p>
          ${signatureRxResult ? '<p style="color: #0d9488; font-size: 14px; margin-top: 10px;">Prescriber account synced with SignatureRx</p>' : ''}
          ${signatureRxError ? '<p style="color: #dc2626; font-size: 14px; margin-top: 10px;"> Prescriber created locally but failed to sync with SignatureRx. Admin will sync later.</p>' : ''}
        </div>
      `;

      await sendEmail(email, "Verify Your Email - DrGPharma", emailHtml);
    } catch (mailError) {
      console.error("Mail Send Error:", mailError);
      // Clean up created entities if email dispatch fails so they can retry registering safely
      await User.findByIdAndDelete(user._id);
      if (user.role === "prescriber") {
        await OnePort.deleteOne({ prescriber: user._id });
      }
      return res.status(500).json({ message: "Failed to send verification OTP email. Registration rolled back." });
    }

    res.status(201).json({
      message: "OTP sent to your email.",
      signatureRx: {
        synced: !!signatureRxResult,
        error: signatureRxError?.message || null
      }
    });
  } catch (err) {
    console.error("Registration Error:", err);
    next(err);
  }
};

// ── Verify OTP ────────────────────────────────────────────────
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified) return res.status(400).json({ message: "Already verified" });
    if (user.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
    if (user.otpExpire < Date.now()) return res.status(400).json({ message: "OTP expired" });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    res.json({ message: "Email verified. You can now login." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Login ─────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.isVerified) return res.status(401).json({ message: "Please verify your email first" });
    if (!user.isApproved) return res.status(403).json({ message: "Your account is pending admin approval." });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        prescriberId: user.prescriberId || null,
        accountType: user.accountType || null,
        isApproved: user.isApproved,
        signatureRxId: user.signatureRxId || null,
        signatureRxStatus: user.signatureRxStatus || null,
        // Include prescriber details
        professionalRole: user.professionalRole || null,
        registrationNumber: user.registrationNumber || null,
        registrationBody: user.registrationBody || null,
        primarySpeciality: user.primarySpeciality || null,
        practiceName: user.practiceName || null,
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
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
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
      user.resetPasswordToken = undefined;
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
    const { token } = req.params;
    const { password } = req.body;

    const hashed = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: "Password reset successful. You can now login." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};