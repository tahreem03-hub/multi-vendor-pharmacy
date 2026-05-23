import mongoose from "mongoose";

// One ThreePot document per prescriber
// Tracks the live balance of all three pots at all times

const ThreePortSchema = new mongoose.Schema(
  {
    prescriber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    prescriberId: { type: String, required: true, unique: true },

    // ── POT 1 — STOCK ─────────────────────────────────────────
    // Physical stock held in Dr G's dedicated warehouse section
    // Value = sum of (quantityAvailable × costPriceExVat) across all his Stock docs
    pot1: {
      stockValueExVat: { type: Number, default: 0 }, // live value, auto-synced from Stock
      lastSyncedAt:    { type: Date },
    },

    // ── POT 2 — DEPOSIT ───────────────────────────────────────
    // Dr G's security deposit held by pharmacy (ex VAT basis)
    // Must always >= Pot 1 stock value
    pot2: {
      depositAmount:   { type: Number, default: 0 }, // set by admin
      currency:        { type: String, default: "GBP" },
      depositPaidAt:   { type: Date },
      depositPaidBy:   { type: String }, // bank transfer ref etc.
    },

    // ── POT 3 — SALES REVENUE ────────────────────────────────
    // Split into two sub-ledgers:
    pot3: {
      // Commission sub-account: Dr G's accumulated margin
      commissionSubAccount: { type: Number, default: 0 },

      // VAT reserve sub-account: input VAT reclaimed, ring-fenced for HMRC
      vatReserveSubAccount: { type: Number, default: 0 },

      // Total running revenue (ex VAT) since last commission payout
      totalRevenueExVat: { type: Number, default: 0 },
    },

    // ── EQUILIBRIUM STATUS ────────────────────────────────────
    // Green: Pot2 >= Pot1  |  Amber: Pot2 within 10% of Pot1  |  Red: Pot2 < Pot1
    equilibriumStatus: {
      type: String,
      enum: ["green", "amber", "red"],
      default: "green",
    },

    // ── ALERTS ───────────────────────────────────────────────
    alerts: [
      {
        type:      { type: String }, // "low_stock", "deposit_breach", "expiry"
        message:   { type: String },
        isRead:    { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // ── COMMISSION HISTORY ────────────────────────────────────
    commissionPayouts: [
      {
        month:          { type: String },  // e.g. "2026-04"
        amountExVat:    { type: Number },
        invoiceNumber:  { type: String },
        paidAt:         { type: Date },
        status:         { type: String, enum: ["pending", "invoice_raised", "paid"] },
      },
    ],
  },
  { timestamps: true }
);

// ── Auto-update equilibrium status before save ────────────────
ThreePortSchema.pre("save", function (next) {
  const pot1 = this.pot1.stockValueExVat;
  const pot2 = this.pot2.depositAmount;

  if (pot2 >= pot1) {
    // Check if within 10% warning zone
    const buffer = pot1 * 0.1;
    this.equilibriumStatus = pot2 - pot1 <= buffer ? "amber" : "green";
  } else {
    this.equilibriumStatus = "red";
  }
  // next();
});

const ThreePort = mongoose.model("ThreePort", ThreePortSchema);
export default ThreePort;