import mongoose from "mongoose";

// ── Ledger Entry Sub-Schema ───────────────────────────────────
const LedgerEntrySchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      "INITIAL_FLOAT",
      "PATIENT_PAYMENT_RECEIVED",
      "CARD_FEE_DEDUCTED",
      "STOCK_PURCHASE",
      "STOCK_ALLOCATED_TO_ORDER",
      "PACKAGING_REIMBURSEMENT",
      "DELIVERY_REIMBURSEMENT",
      "VAT_INPUT_RECORDED",
      "VAT_OUTPUT_RECORDED",
      "VAT_REFUND_EXPECTED",
      "VAT_REFUND_RECEIVED",
      "VAT_PAYABLE_RESTRICTED",
      "VAT_PAYABLE_RELEASED",
      "COMMISSION_EARNED",
      "MANUAL_ADJUSTMENT",
      "REFUND_TO_PATIENT",
      "ORDER_CANCELLED",
      "STOCK_WRITE_OFF",
    ],
  },
  orderId:         { type: mongoose.Schema.Types.ObjectId, ref: "Order",  default: null },
  stockPurchaseId: { type: mongoose.Schema.Types.ObjectId, default: null },
  vatReturnId:     { type: mongoose.Schema.Types.ObjectId, default: null },

  amount:           { type: Number, default: 0 }, // gross amount of event
  vatAmount:        { type: Number, default: 0 }, // VAT portion

  // ── Deltas — how each sub-balance moves ──
  cashDelta:        { type: Number, default: 0 }, // +/- cash
  stockDelta:       { type: Number, default: 0 }, // +/- stock value
  vatPositionDelta: { type: Number, default: 0 }, // +/- VAT position
  profitDelta:      { type: Number, default: 0 }, // +/- earned profit
  restrictedDelta:  { type: Number, default: 0 }, // +/- restricted VAT

  description: { type: String },
  metadata:    { type: mongoose.Schema.Types.Mixed, default: {} },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  createdAt:   { type: Date, default: Date.now },
});

// ── Commission Payout Sub-Schema ──────────────────────────────
const CommissionPayoutSchema = new mongoose.Schema({
  month:         { type: String }, // e.g. "2026-04"
  amountExVat:   { type: Number },
  invoiceNumber: { type: String },
  paidAt:        { type: Date },
  status: {
    type: String,
    enum: ["pending", "invoice_raised", "paid"],
    default: "pending",
  },
});

// ── Alert Sub-Schema ──────────────────────────────────────────
const AlertSchema = new mongoose.Schema({
  type:      { type: String }, // "low_cash", "vat_payable", "stock_expiry" etc
  message:   { type: String },
  isRead:    { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// ── Main One-Pot Schema ───────────────────────────────────────
const OnePotSchema = new mongoose.Schema(
  {
    prescriber:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    prescriberId: { type: String, required: true, unique: true },
    currency:     { type: String, default: "GBP" },

    // ── Core Sub-Balances ─────────────────────────────────────
    cashBalance:           { type: Number, default: 0 }, // actual cash in pot
    stockValue:            { type: Number, default: 0 }, // value of medicines held
    vatPosition:           { type: Number, default: 0 }, // running VAT reclaim(+) or payable(-)
    pendingVatRefund:      { type: Number, default: 0 }, // HMRC owes but not yet paid
    restrictedVatPayable:  { type: Number, default: 0 }, // ring-fenced — cannot spend
    earnedProfit:          { type: Number, default: 0 }, // Dr G cumulative commission
    workingFloat:          { type: Number, default: 0 }, // small buffer for timing gaps
    pendingPurchaseCommitments: { type: Number, default: 0 }, // wholesaler orders placed not settled

    // ── Calculated Fields (updated on every save) ─────────────
    // availableToSpend = cashBalance - restrictedVatPayable - pendingPurchaseCommitments
    availableToSpend: { type: Number, default: 0 },
    // truePotValue = cashBalance + stockValue + pendingVatRefund - restrictedVatPayable
    truePotValue:     { type: Number, default: 0 },

    // ── Ledger ────────────────────────────────────────────────
    ledger: [LedgerEntrySchema],

    // ── VAT Period Tracking ───────────────────────────────────
    currentVatPeriod: {
      startDate:       { type: Date },
      endDate:         { type: Date },
      inputVat:        { type: Number, default: 0 }, // reclaimable from HMRC
      outputVat:       { type: Number, default: 0 }, // payable to HMRC
      netVatPosition:  { type: Number, default: 0 }, // inputVat - outputVat
      status: {
        type: String,
        enum: ["open", "frozen", "submitted", "refund_pending", "settled"],
        default: "open",
      },
    },

    // ── Alerts ────────────────────────────────────────────────
    alerts: [AlertSchema],

    // ── Commission Payout History ─────────────────────────────
    commissionPayouts: [CommissionPayoutSchema],

    // ── Equilibrium Status ────────────────────────────────────
    // green: cash >= 0 and no restrictions breached
    // amber: cash within 10% of working float
    // red:   cash negative or VAT payable restriction breached
    equilibriumStatus: {
      type: String,
      enum: ["green", "amber", "red"],
      default: "green",
    },
  },
  { timestamps: true }
);

// ── Pre-save: recalculate derived fields ──────────────────────
OnePotSchema.pre("save", function (next) {
  // Recalculate available to spend
  this.availableToSpend =
    this.cashBalance -
    this.restrictedVatPayable -
    this.pendingPurchaseCommitments;

  // Recalculate true pot value
  this.truePotValue =
    this.cashBalance +
    this.stockValue +
    this.pendingVatRefund -
    this.restrictedVatPayable;

  // Recalculate VAT net position
  this.currentVatPeriod.netVatPosition =
    this.currentVatPeriod.inputVat - this.currentVatPeriod.outputVat;

  // Equilibrium status
  if (this.cashBalance < 0) {
    this.equilibriumStatus = "red";
  } else if (this.availableToSpend < this.workingFloat * 0.1) {
    this.equilibriumStatus = "amber";
  } else {
    this.equilibriumStatus = "green";
  }

  next();
});

// ── Instance method: add a ledger entry and apply deltas ──────
OnePotSchema.methods.addLedgerEntry = function (entry) {
  this.ledger.push(entry);

  // Apply each delta to the corresponding sub-balance
  this.cashBalance          += entry.cashDelta        || 0;
  this.stockValue           += entry.stockDelta       || 0;
  this.vatPosition          += entry.vatPositionDelta || 0;
  this.earnedProfit         += entry.profitDelta      || 0;
  this.restrictedVatPayable += entry.restrictedDelta  || 0;

  // Update VAT period
  if (entry.vatPositionDelta > 0) {
    this.currentVatPeriod.inputVat += entry.vatPositionDelta;
  } else if (entry.vatPositionDelta < 0) {
    this.currentVatPeriod.outputVat += Math.abs(entry.vatPositionDelta);
  }
};

const OnePort = mongoose.model("OnePort", OnePotSchema);
export default OnePort;
