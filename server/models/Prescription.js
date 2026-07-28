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
      lastName: { type: String },
      gender: { type: String },
      dob: { type: Date },
      email: { type: String },
      phone: { type: String },
      address: { type: String },
      allergies: { type: String },
      country: { type: String },
    },

    // ── PRESCRIBER LINK ───────────────────────────────────────
    prescriber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    prescriberId: {
      type: String,
    },

    // ⚠️ LEGACY — used only by the old free-text "Issue Prescription"
    // form that has been removed. Kept for backward compatibility
    // with existing records. New "direct" issued prescriptions pull
    // prescriber info live from the `prescriber` ref (req.user) —
    // they should NOT populate this field.
    prescriberDetails: {
      name: { type: String },
      regNumber: { type: String },
      type: { type: String },
      clinicName: { type: String },
      clinicalNotes: { type: String },
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
      // "issued": self-issued by prescriber via the direct flow —
      // set immediately on creation, never passes through "pending"
      enum: ["pending", "approved", "rejected", "dispensed", "issued"],
      default: "pending",
    },

    method: {
      type: String,
      // "upload"/"form": non-prescriber submitted a request, needs
      //                  prescriber approval (existing flow, unchanged)
      // "direct":        prescriber self-issued, no approval step
      enum: ["upload", "form", "direct"],
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

    // ── DISPENSING & DELIVERY (Doc Section 4/5 — set at issue time) ──
    fulfillmentMethod: {
      type: String,
      enum: ["Ship to patient", "Ship to clinic", "Patient collects from Time Pharmacy"],
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

    // ── SIGNATURERX INTEGRATION ──────────────────────────────
    signatureRxId: {
      type: String,
      sparse: true,
    },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────
prescriptionSchema.index({ prescriberId: 1, createdAt: -1 });
prescriptionSchema.index({ status: 1 });
prescriptionSchema.index({ user: 1 });

export default mongoose.models.Prescription || mongoose.model("Prescription", prescriptionSchema);