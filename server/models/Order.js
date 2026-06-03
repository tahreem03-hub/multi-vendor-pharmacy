import mongoose from "mongoose";

// ── Order Item (sub-document) ─────────────────────────────────
// Snapshots pricing at time of order so historical records
// never change if medicine prices are updated later
const OrderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Medicine",            // matches your Medicine model
    required: true,
  },
  productName:      { type: String, required: true }, // snapshot
  quantity:         { type: Number, required: true, min: 1 },
  isPOM:            { type: Boolean, default: false }, // Prescription-Only Medicine

  // Pricing snapshot (ex VAT) at time of order
  unitCostExVat:    { type: Number, required: true }, // medicine.buyingPrice
  unitRevenueExVat: { type: Number, required: true }, // medicine.sellingPrice
  vatRate:          { type: Number, default: 0 },     // 0 for POM, 0.20 for non-POM
});

// ── Order ─────────────────────────────────────────────────────
const OrderSchema = new mongoose.Schema(
  {
    // ── WHO PLACED THE ORDER ──────────────────────────────────
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ── WHICH PRESCRIBER THIS ORDER BELONGS TO ────────────────
    // Both fields stored: ObjectId for .populate(), string for fast filtering
    prescriber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    prescriberId: {
      type: String,
      required: false, // e.g. "PRE-AB12CD"
    },

    // ── PRESCRIPTION REFERENCE ────────────────────────────────
    prescription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prescription",
    },

    // ── ORDER ITEMS ───────────────────────────────────────────
    items: [OrderItemSchema],

    // ── FINANCIAL BREAKDOWN (all ex VAT) ─────────────────────
    // Populated by order.controller.js commission calculator
    financials: {
      revenueExVat:        { type: Number, default: 0 }, // total selling price ex VAT
      cogsExVat:           { type: Number, default: 0 }, // total buying price ex VAT
      packagingCostExVat:  { type: Number, default: 0 }, // flat packaging cost
      deliveryCostExVat:   { type: Number, default: 0 }, // flat delivery cost
      paymentFee:          { type: Number, default: 0 }, // card/payment processing fee
      commissionExVat:     { type: Number, default: 0 }, // Dr G's earned margin
      outputVat:           { type: Number, default: 0 }, // VAT charged to patient (owed to HMRC)
      inputVat:            { type: Number, default: 0 }, // VAT paid on purchases (reclaimable)
      vatPositionImpact:   { type: Number, default: 0 }, // inputVat - outputVat (+ve = HMRC owes pot)
      immediateCashImpact: { type: Number, default: 0 }, // cash pot sees before any VAT refund
      trueProfitImpact:    { type: Number, default: 0 }, // immediateCashImpact + vatPositionImpact
    },

    // ── POT SNAPSHOT ──────────────────────────────────────────
    // Records pot values at the moment this order was placed
    // Used for monthly reconciliation reports
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
        "pending",     // placed, awaiting prescription verification
        "verified",    // prescription verified by pharmacist
        "dispensing",  // pharmacy is packing
        "dispatched",  // shipped to client
        "delivered",   // confirmed delivered
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

// ── Indexes for fast dashboard queries ────────────────────────
OrderSchema.index({ prescriberId: 1, createdAt: -1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ commissionStatus: 1 });
OrderSchema.index({ customer: 1 });

const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);
export default Order;