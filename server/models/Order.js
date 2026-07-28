import mongoose from "mongoose";

// ── Order Item (sub-document) ─────────────────────────────────
const OrderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Medicine",
    required: true,
  },
  productName:      { type: String, required: true },
  quantity:         { type: Number, required: true, min: 1 },
  isPOM:            { type: Boolean, default: false },
  unitCostExVat:    { type: Number, required: true },
  unitRevenueExVat: { type: Number, required: true },
  vatRate:          { type: Number, default: 0 },
});

// ── Order ─────────────────────────────────────────────────────
const OrderSchema = new mongoose.Schema(
  {
    // ── HUMAN-READABLE REFERENCE (Doc Section 5) ──────────────
    orderReference: {
      type: String,
      unique: true,
      sparse: true, // e.g. "ORD-XXXXXXX"
    },

    // ── WHO PLACED THE ORDER ──────────────────────────────────
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ── WHICH PRESCRIBER THIS ORDER BELONGS TO ────────────────
    prescriber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    prescriberId: {
      type: String,
      required: false,
    },

    // ── PRESCRIPTION REFERENCE ────────────────────────────────
    prescription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prescription",
    },

    // ── ORDER ITEMS ───────────────────────────────────────────
    items: [OrderItemSchema],

    // ── DELIVERY & PAYMENT (Doc Section 5) ────────────────────
    deliveryMethod: {
      type: String,
      enum: ["Standard", "Next Day", "Cold-Chain Express", "Click & Collect"],
      default: "Standard",
    },
    paymentMethod: {
      type: String,
      enum: ["Card", "Bank Transfer", "Credit Account"],
      default: "Card",
    },

    // ── FINANCIAL BREAKDOWN (all ex VAT) ─────────────────────
    financials: {
      revenueExVat:        { type: Number, default: 0 },
      cogsExVat:           { type: Number, default: 0 },
      packagingCostExVat:  { type: Number, default: 0 },
      deliveryCostExVat:   { type: Number, default: 0 },
      paymentFee:          { type: Number, default: 0 },
      commissionExVat:     { type: Number, default: 0 },
      outputVat:           { type: Number, default: 0 },
      inputVat:            { type: Number, default: 0 },
      vatPositionImpact:   { type: Number, default: 0 },
      immediateCashImpact: { type: Number, default: 0 },
      trueProfitImpact:    { type: Number, default: 0 },
    },

    // ── POT SNAPSHOT ──────────────────────────────────────────
    potSnapshot: {
      pot1StockBefore: { type: Number },
      pot1StockAfter:  { type: Number },
      pot2Deposit:     { type: Number },
      pot3Running:     { type: Number },
    },

    // ── ORDER STATUS ──────────────────────────────────────────
    status: {
      type: String,
      enum: [
        "pending",
        "verified",
        "dispensing",
        "dispatched",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },

    // ── COMMISSION STATUS ─────────────────────────────────────
    commissionStatus: {
      type: String,
      enum: ["pending", "invoice_raised", "paid"],
      default: "pending",
    },
    commissionPaidAt: { type: Date },

    // ── DELIVERY ──────────────────────────────────────────────
    deliveryAddress: {
      line1:    { type: String },
      city:     { type: String },
      postcode: { type: String },
    },
    trackingNumber: { type: String },
  },
  { timestamps: true }
);

// ── Auto-generate human-readable order reference ───────────────
OrderSchema.pre("save", function (next) {
  if (!this.orderReference) {
    this.orderReference = "ORD-" + Math.random().toString(36).substring(2, 9).toUpperCase();
  }
 // next();
});

// ── Indexes for fast dashboard queries ────────────────────────
OrderSchema.index({ prescriberId: 1, createdAt: -1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ commissionStatus: 1 });
OrderSchema.index({ customer: 1 });

const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);
export default Order;