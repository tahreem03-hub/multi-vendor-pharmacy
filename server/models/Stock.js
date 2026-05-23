import mongoose from "mongoose";

const StockSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medicine",
      required: true,
    },
    productName: { type: String, required: true },

    // ── PRESCRIBER ALLOCATION ─────────────────────────────────
    prescriber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    prescriberId: { type: String, required: true },

    // ── QUANTITIES ────────────────────────────────────────────
    quantityAllocated: { type: Number, required: true, min: 0 },
    quantityAvailable: { type: Number, required: true, min: 0 },
    quantityReserved:  { type: Number, default: 0 },

    // ── PRICING (ex VAT) ──────────────────────────────────────
    costPriceExVat:    { type: Number, required: true },
    sellingPriceExVat: { type: Number, required: true },

    isPOM: { type: Boolean, default: false },

    // ── POT 1 VALUE ───────────────────────────────────────────
    pot1Value: { type: Number, default: 0 },

    // ── EXPIRY TRACKING ───────────────────────────────────────
    batchNumber:       { type: String },
    expiryDate:        { type: Date, required: true },
    expiryAlert: {
      type: String,
      enum: ["none", "60_days", "30_days", "expired"],
      default: "none",
    },
    expiryAlertSentAt: { type: Date },

    // ── LOW STOCK ─────────────────────────────────────────────
    lowStockThreshold: { type: Number, default: 5 },
    isLowStock:        { type: Boolean, default: false },

    // ── STORAGE ───────────────────────────────────────────────
    storageLocation:   { type: String },
    requiresColdChain: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ── Auto-calculate before save ────────────────────────────────
// Using async style — no next() needed, no next is not a function error
StockSchema.pre("save", async function () {
  this.pot1Value  = this.quantityAvailable * this.costPriceExVat;
  this.isLowStock = this.quantityAvailable <= this.lowStockThreshold;

  const daysLeft = Math.ceil(
    (this.expiryDate - Date.now()) / (1000 * 60 * 60 * 24)
  );

  if (daysLeft <= 0)       this.expiryAlert = "expired";
  else if (daysLeft <= 30) this.expiryAlert = "30_days";
  else if (daysLeft <= 60) this.expiryAlert = "60_days";
  else                     this.expiryAlert = "none";
});

StockSchema.index({ prescriberId: 1 });
StockSchema.index({ expiryDate: 1 });
StockSchema.index({ expiryAlert: 1 });

const Stock = mongoose.model("Stock", StockSchema);
export default Stock;