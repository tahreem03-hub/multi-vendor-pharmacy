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
      firstName:  { type: String },
      lastName:   { type: String },
      gender:     { type: String },
      dob:        { type: Date },
      email:      { type: String },
      phone:      { type: String },
      address:    { type: String },
      allergies:  { type: String },
      country:    { type: String },
    },

    // ── PRESCRIBER ────────────────────────────────────────────
    prescriber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    prescriberId: {
      type: String,
    },

    // ── MEDICATIONS ───────────────────────────────────────────
    medications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Medicine",
      },
    ],

    // ── STATUS ────────────────────────────────────────────────
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "dispensed", "issued", "draft"],
      default: "pending",
    },

    method: {
      type: String,
      enum: ["direct"],
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

    // ── DISPENSING & DELIVERY ─────────────────────────────────
    fulfillmentMethod: {
      type: String,
      enum: [
        "Ship to patient",
        "Ship to clinic",
        "Patient collects from Time Pharmacy",
      ],
    },
    prescriptionValidity: {
      type: String,
      enum: ["28 days", "14 days", "7 days", "Immediate (same-day dispatch)"],
      default: "28 days",
    },

    // ── EXPIRY ────────────────────────────────────────────────
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000),
    },

    // ── SIGNATURERX ───────────────────────────────────────────
    signatureRxId: {
      type: String,
      sparse: true,
    },
  },
  { timestamps: true }
);

prescriptionSchema.index({ prescriberId: 1, createdAt: -1 });
prescriptionSchema.index({ status: 1 });
prescriptionSchema.index({ user: 1 });

export default mongoose.models.Prescription ||
  mongoose.model("Prescription", prescriptionSchema);