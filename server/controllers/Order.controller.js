import Order from "../models/Order.js";
import Medicine from "../models/medicines.js";
import Stock from "../models/Stock.js";
import OnePort from "../models/OnePort.js";
import User from "../models/User.js";
import { syncPot1 } from "./helpers/syncPot1.js";

const CONFIG = {
  PACKAGING_COST_EX_VAT: 2.50,
  DELIVERY_COST_EX_VAT:  5.00,
  PAYMENT_FEE_RATE:      0.015,
  VAT_RATE_STANDARD:     0.20,
  VAT_RATE_POM:          0.00,
};

const calculateCommission = (revenueExVat, cogsExVat, totalIncVat) => {
  const packaging  = CONFIG.PACKAGING_COST_EX_VAT;
  const delivery   = CONFIG.DELIVERY_COST_EX_VAT;
  const paymentFee = parseFloat((totalIncVat * CONFIG.PAYMENT_FEE_RATE).toFixed(2));
  const commission = parseFloat(
    Math.max(0, revenueExVat - cogsExVat - packaging - delivery - paymentFee).toFixed(2)
  );
  return { packaging, delivery, paymentFee, commission };
};

// ─────────────────────────────────────────────────────────────
// POST /api/orders
// No transactions — works with standalone MongoDB
// ─────────────────────────────────────────────────────────────
export const createOrder = async (req, res) => {
  try {
    const { prescriberId, prescriptionId, items, deliveryAddress } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items in order" });
    }
    if (!prescriberId) {
      return res.status(400).json({ message: "prescriberId is required" });
    }

    // Validate prescriber
    const prescriber = await User.findOne({ prescriberId, role: "prescriber" });
    if (!prescriber) {
      return res.status(404).json({ message: "Prescriber not found" });
    }

    let revenueExVat = 0;
    let cogsExVat    = 0;
    let vatCollected = 0;
    const orderItems = [];
    const stockUpdates = []; // collect stock docs to save after validation

    // ── Validate all items first before making any changes ────
    for (const item of items) {
      const medicine = await Medicine.findById(item.medicineId);
      if (!medicine) {
        return res.status(404).json({ message: `Medicine not found: ${item.medicineId}` });
      }

      const stockEntry = await Stock.findOne({
        prescriberId,
        product:           item.medicineId,
        quantityAvailable: { $gte: item.quantity },
      });

      if (!stockEntry) {
        return res.status(400).json({
          message: `Insufficient stock for: ${medicine.name}`,
        });
      }

      const isPOM       = medicine.prescriptionRequired;
      const vatRate     = isPOM ? CONFIG.VAT_RATE_POM : CONFIG.VAT_RATE_STANDARD;
      const lineRevenue = medicine.sellingPrice * item.quantity;
      const lineCogs    = medicine.buyingPrice  * item.quantity;
      const lineVat     = lineRevenue * vatRate;

      revenueExVat += lineRevenue;
      cogsExVat    += lineCogs;
      vatCollected += lineVat;

      orderItems.push({
        product:          medicine._id,
        productName:      medicine.name,
        quantity:         item.quantity,
        isPOM,
        unitCostExVat:    medicine.buyingPrice,
        unitRevenueExVat: medicine.sellingPrice,
        vatRate,
      });

      // Store stock entry + quantity to deduct for later
      stockUpdates.push({ stockEntry, quantity: item.quantity });
    }

    const totalIncVat = revenueExVat + vatCollected;
    const { packaging, delivery, paymentFee, commission } =
      calculateCommission(revenueExVat, cogsExVat, totalIncVat);

    // ── Get pot snapshot before changes ───────────────────────
    const pot        = await OnePort.findOne({ prescriberId });
    const pot1Before = pot?.pot1?.stockValueExVat || 0;

    // ── Save the order ────────────────────────────────────────
    const order = await Order.create({
      customer:     req.user._id,
      prescriber:   prescriber._id,
      prescriberId,
      prescription: prescriptionId || null,
      items:        orderItems,
      financials: {
        revenueExVat,
        cogsExVat,
        packagingCostExVat: packaging,
        deliveryCostExVat:  delivery,
        paymentFee,
        commissionExVat:    commission,
        vatCollected,
        vatOnPurchases:     cogsExVat * CONFIG.VAT_RATE_STANDARD,
      },
      deliveryAddress,
      status: prescriptionId ? "pending" : "verified",
    });

    // ── Deduct stock after order is saved ─────────────────────
    for (const { stockEntry, quantity } of stockUpdates) {
      stockEntry.quantityAvailable -= quantity;
      await stockEntry.save();
    }

    // ── Sync Pot 1 + update Pot 3 ─────────────────────────────
    await syncPot1(prescriberId);

    if (pot) {
      const freshPot  = await OnePort.findOne({ prescriberId });
      const pot1After = freshPot?.pot1?.stockValueExVat || 0;

      order.potSnapshot = {
        pot1StockBefore: pot1Before,
        pot1StockAfter:  pot1After,
        pot2Deposit:     pot.pot2?.depositAmount || 0,
        pot3Running:     (pot.pot3?.totalRevenueExVat || 0) + revenueExVat,
      };
      await order.save();

      freshPot.pot3.totalRevenueExVat    += revenueExVat;
      freshPot.pot3.commissionSubAccount += commission;
      freshPot.pot3.vatReserveSubAccount += vatCollected;
      await freshPot.save();
    }

    res.status(201).json({
      message: "Order placed successfully",
      orderId: order._id,
      financialSummary: {
        revenueExVat:  revenueExVat.toFixed(2),
        cogsExVat:     cogsExVat.toFixed(2),
        packaging:     packaging.toFixed(2),
        delivery:      delivery.toFixed(2),
        paymentFee:    paymentFee.toFixed(2),
        commission:    commission.toFixed(2),
        vatCollected:  vatCollected.toFixed(2),
        totalIncVat:   totalIncVat.toFixed(2),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// ADMIN CONTROLLERS
// ─────────────────────────────────────────────────────────────

export const getAllOrders = async (req, res) => {
  try {
    const { prescriberId, status, commissionStatus, limit = 100, page = 1 } = req.query;
    const filter = {};
    if (prescriberId)     filter.prescriberId     = prescriberId;
    if (status)           filter.status           = status;
    if (commissionStatus) filter.commissionStatus = commissionStatus;

    const [orders, count] = await Promise.all([
      Order.find(filter)
        .populate("customer",   "firstName lastName email")
        .populate("prescriber", "firstName lastName prescriberId practiceName")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Order.countDocuments(filter),
    ]);

    res.json({ count, orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    await order.save();

    res.json({ message: "Order status updated", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getCommissionSummary = async (req, res) => {
  try {
    const summary = await Order.aggregate([
      { $match: { commissionStatus: "pending" } },
      {
        $group: {
          _id:             "$prescriberId",
          totalCommission: { $sum: "$financials.commissionExVat" },
          totalRevenue:    { $sum: "$financials.revenueExVat" },
          orderCount:      { $sum: 1 },
        },
      },
      { $sort: { totalCommission: -1 } },
    ]);
    res.json({ summary });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// PRESCRIBER CONTROLLERS
// ─────────────────────────────────────────────────────────────

export const getMyOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = { prescriberId: req.user.prescriberId };
    if (status) filter.status = status;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("customer", "firstName lastName email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Order.countDocuments(filter),
    ]);

    res.json({ total, page: Number(page), orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyStats = async (req, res) => {
  try {
    const prescriberId = req.user.prescriberId;

    const [totals] = await Order.aggregate([
      { $match: { prescriberId } },
      {
        $group: {
          _id:               null,
          totalRevenue:      { $sum: "$financials.revenueExVat" },
          totalCommission:   { $sum: "$financials.commissionExVat" },
          totalVatCollected: { $sum: "$financials.vatCollected" },
          totalOrders:       { $sum: 1 },
        },
      },
    ]);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthly = await Order.aggregate([
      { $match: { prescriberId, createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id:        { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          revenue:    { $sum: "$financials.revenueExVat" },
          commission: { $sum: "$financials.commissionExVat" },
          orders:     { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.json({
      totals: totals || {
        totalRevenue: 0, totalCommission: 0,
        totalVatCollected: 0, totalOrders: 0,
      },
      monthly,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};