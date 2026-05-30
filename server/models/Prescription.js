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
    prescriber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    prescriberId: {
      type: String,
    },

    prescriberDetails: {
      name:          { type: String },
      regNumber:     { type: String },
      type:          { type: String },
      clinicName:    { type: String },
      clinicalNotes: { type: String }, // ✅ Added — was missing, now saves from form
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
      type: String,
    },

    // ── STATUS ────────────────────────────────────────────────
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
      ref: "User",
    },
    verifiedAt: { type: Date },

    // ── LINKED ORDER ──────────────────────────────────────────
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },

    // ── EXPIRY ────────────────────────────────────────────────
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000),
    },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────
prescriptionSchema.index({ prescriberId: 1, createdAt: -1 });
prescriptionSchema.index({ status: 1 });
prescriptionSchema.index({ user: 1 });

export default mongoose.model("Prescription", prescriptionSchema);