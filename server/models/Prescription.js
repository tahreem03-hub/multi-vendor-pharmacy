import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema(
  {
    // ── PATIENT ───────────────────────────────────────────────
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    patientDetails: {
      firstName: { type: String },
      lastName:  { type: String },
      gender:    { type: String },
      dob:       { type: Date },
      email:     { type: String },
      phone:     { type: String },
      address:   { type: String },
      allergies: { type: String },
    },

    // ── PRESCRIBER LINK ───────────────────────────────────────
    // Links this prescription to a User with role:"prescriber"
    // Both fields stored: ObjectId for population, string for fast filtering
    prescriber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    prescriberId: {
      type: String, // e.g. "PRE-AB12CD" — copied from User.prescriberId
    },

    // Kept for upload-method prescriptions where the prescriber
    // is not yet a registered User in the system
    prescriberDetails: {
      name:       { type: String },
      regNumber:  { type: String },
      type:       { type: String },
      clinicName: { type: String },
    },

    // ── MEDICATIONS ───────────────────────────────────────────
    medications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Medicine",
      },
    ],

    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medicine",
    },

    // ── UPLOAD ────────────────────────────────────────────────
    image: {
      type: String, // URL of uploaded prescription scan
    },

    // ── STATUS ────────────────────────────────────────────────
    // Added "dispensed" to track the full lifecycle
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "dispensed"],
      default: "pending",
    },

    method: {
      type: String,
      enum: ["upload", "form"],
      default: "form",
    },

    // ── PHARMACIST ────────────────────────────────────────────
    pharmacistNote: { type: String },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // the admin/pharmacist who approved it
    },
    verifiedAt: { type: Date },

    // ── LINKED ORDER ──────────────────────────────────────────
    // Set once pharmacy dispatches — connects prescription to sale
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },

    // ── EXPIRY ────────────────────────────────────────────────
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000), // 6 months
    },
  },
  { timestamps: true }
);

// ── Indexes for fast prescriber dashboard queries ─────────────
prescriptionSchema.index({ prescriberId: 1, createdAt: -1 });
prescriptionSchema.index({ status: 1 });
prescriptionSchema.index({ user: 1 });

export default mongoose.model("Prescription", prescriptionSchema);