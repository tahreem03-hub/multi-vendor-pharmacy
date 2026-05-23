import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // ── ACCOUNT STATUS ────────────────────────────────────────
    isVerified: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
    isActive:   { type: Boolean, default: true },

    // ── ROLE ──────────────────────────────────────────────────
    role: {
      type: String,
      required: true,
      enum: ['user', 'admin', 'prescriber', 'patient'],
      lowercase: true,
      default: 'user'
    },

    // accountType kept for registration form compatibility
    accountType: {
      type: String,
      enum: ["Prescriber", "Practitioner"],
    },

    // ── PRESCRIBER ID ─────────────────────────────────────────
    prescriberId: {
      type: String,
      unique: true,
      sparse: true, // allows null/absent on non-prescriber accounts
    },

    // ── PERSONAL DETAILS ──────────────────────────────────────
    firstName:   { type: String, required: true },
    lastName:    { type: String, required: true },
    email:       { type: String, required: true, unique: true },
    password:    { type: String, required: true, select: false },
    dob:         { type: String, required: true },
    phoneNumber: { type: String, required: true },
    address:     { type: String, required: true },

    // ── PRESCRIBER / PRACTITIONER CREDENTIALS ─────────────────
    professionalRole:      { type: String }, 
    registrationNumber:    { type: String }, 
    primarySpeciality:     { type: String }, 
    trainingQualification: { type: String }, 

    // ── PRACTICE / BUSINESS DETAILS ───────────────────────────
    practiceName:    { type: String },
    businessAddress: { type: String },
    vatNumber:       { type: String },
    referralSource:  { type: String },

    // ── DECLARATIONS ──────────────────────────────────────────
    agreedToTerms: { 
      type: Boolean, 
      required: true // Everyone must agree to terms
    },
    isAuthorisedProfessional: { 
      type: Boolean, 
      // 💡 FIX: Required only if the user is signing up as a prescriber
      required: function() {
        return this.role === 'prescriber';
      }
    },

    // ── AUTH TOKENS ───────────────────────────────────────────
    otp:                 { type: String },
    otpExpire:           { type: Date },
    resetPasswordToken:  { type: String },
    resetPasswordExpire: { type: Date },
  },
  { timestamps: true }
);

// ── Auto-generate prescriberId + sync role with accountType ──
userSchema.pre("save", function (next) {
  // If user registers with an accountType, promote role to prescriber
  if (this.accountType && this.role === "user") {
    this.role = "prescriber";
  }

  // Generate a unique prescriberId for all prescribers
  if (this.role === "prescriber" && !this.prescriberId) {
    this.prescriberId =
      "PRE-" + Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  // next(); // 💡 FIX: Restored this so Mongoose doesn't freeze!
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;