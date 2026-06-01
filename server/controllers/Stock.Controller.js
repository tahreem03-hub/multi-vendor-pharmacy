import Stock from "../models/Stock.js";
import OnePort from "../models/OnePort.js"
import { syncPot1 } from "./helpers/syncPot1.js";
import User from "../models/User.js";
import Medicine from "../models/medicines.js";

// ── Helper: check if adding stock would breach Pot 2 deposit ──
const checkDepositGuard = async (prescriberId, newStockCostExVat) => {
  const pot = await OnePort.findOne({ prescriberId });
  if (!pot) return { allowed: false, message: "OnePort record not found" };

  const currentPot1  = pot.pot1.stockValueExVat;
  const pot2Deposit  = pot.pot2.depositAmount;
  const projected    = currentPot1 + newStockCostExVat;

  if (projected > pot2Deposit) {
    return {
      allowed: false,
      message: `Stock addition blocked. Adding £${newStockCostExVat.toFixed(2)} would bring Pot 1 to £${projected.toFixed(2)}, exceeding Pot 2 deposit of £${pot2Deposit.toFixed(2)}.`,
      shortfall: projected - pot2Deposit,
    };
  }
  return { allowed: true };
};

// ─────────────────────────────────────────────────────────────
// ADMIN CONTROLLERS
// ─────────────────────────────────────────────────────────────

export const addStock = async (req, res) => {
  try {
    console.log("✅ addStock hit");

    const {
      prescriberId,
      productName,
      product,
      quantity,
      costPriceExVat,
      sellingPriceExVat,
      expiryDate,
      isPOM,
      batchNumber,
      storageLocation,
      requiresColdChain,
      lowStockThreshold,
    } = req.body;

    const prescriberUser = await User.findOne({ prescriberId });
    if (!prescriberUser) {
      return res.status(404).json({ message: "Prescriber not found" });
    }

    const totalCost = quantity * costPriceExVat;
    const guard = await checkDepositGuard(prescriberId, totalCost);
    if (!guard.allowed) {
      return res.status(400).json({
        message: guard.message,
        shortfall: guard.shortfall,
      });
    }

    const stock = await Stock.create({
      product,
      productName,
      prescriber:        prescriberUser._id,
      prescriberId,
      quantityAllocated: quantity,
      quantityAvailable: quantity,
      costPriceExVat,
      sellingPriceExVat,
      expiryDate,
      isPOM:             isPOM || false,
      batchNumber,
      storageLocation,
      requiresColdChain: requiresColdChain || false,
      lowStockThreshold: lowStockThreshold || 5,
    });

    console.log("✅ Stock created, now syncing Pot 1...");

    try {
      await syncPot1(prescriberId);
      console.log("✅ syncPot1 completed");
    } catch (syncErr) {
      console.error("❌ syncPot1 error:", syncErr.message);
    }

    res.status(201).json({ message: "Stock added and Pot 1 updated", stock });
  } catch (err) {
    console.error("❌ FULL ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// GET /api/stock/admin/all
export const getAllStock = async (req, res) => {
  try {
    const { prescriberId, expiryAlert, isLowStock } = req.query;

    const filter = {};
    if (prescriberId) filter.prescriberId = prescriberId;
    if (expiryAlert)  filter.expiryAlert  = expiryAlert;
    if (isLowStock)   filter.isLowStock   = isLowStock === "true";

    const stock = await Stock.find(filter)
      .populate("product", "name category")
      .populate("prescriber", "firstName lastName prescriberId")
      .sort({ expiryDate: 1 });

    res.json({ count: stock.length, stock });
  } catch (err) {
    console.error("❌ FULL ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/stock/admin/:id/adjust
export const adjustStock = async (req, res) => {
  try {
    const { quantityAvailable, reason } = req.body;
    const stock = await Stock.findById(req.params.id);
    if (!stock) return res.status(404).json({ message: "Stock not found" });

    stock.quantityAvailable = quantityAvailable;
    await stock.save();

    try {
      await syncPot1(stock.prescriberId);
    } catch (syncErr) {
      console.error("❌ syncPot1 error:", syncErr.message);
    }

    res.json({ message: `Stock adjusted. Reason: ${reason || "N/A"}`, stock });
  } catch (err) {
    console.error("❌ FULL ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/stock/admin/:id
export const deleteStock = async (req, res) => {
  try {
    const stock = await Stock.findById(req.params.id);
    if (!stock) return res.status(404).json({ message: "Stock not found" });

    const { prescriberId } = stock;
    await stock.deleteOne();

    try {
      await syncPot1(prescriberId);
    } catch (syncErr) {
      console.error("❌ syncPot1 error:", syncErr.message);
    }

    res.json({ message: "Stock removed and Pot 1 updated" });
  } catch (err) {
    console.error("❌ FULL ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// GET /api/stock/admin/expiry-alerts
export const getExpiryAlerts = async (req, res) => {
  try {
    const alerts = await Stock.find({
      expiryAlert: { $in: ["30_days", "60_days", "expired"] },
    })
      .populate("prescriber", "firstName lastName prescriberId")
      .sort({ expiryDate: 1 });

    res.json({ count: alerts.length, alerts });
  } catch (err) {
    console.error("❌ FULL ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// GET /api/stock/my
export const getMyStock = async (req, res) => {
  try {
    const { expiryAlert, isLowStock } = req.query;

    const filter = { prescriberId: req.user.prescriberId };
    if (expiryAlert) filter.expiryAlert = expiryAlert;
    if (isLowStock)  filter.isLowStock  = isLowStock === "true";

    const stock = await Stock.find(filter)
      .populate("product", "name category image")
      .sort({ expiryDate: 1 });

    res.json({ count: stock.length, stock });
  } catch (err) {
    console.error("❌ FULL ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// GET /api/stock/my/alerts
export const getMyAlerts = async (req, res) => {
  try {
    const alerts = await Stock.find({
      prescriberId: req.user.prescriberId,
      $or: [
        { expiryAlert: { $in: ["30_days", "60_days", "expired"] } },
        { isLowStock: true },
      ],
    })
      .populate("product", "name category")
      .sort({ expiryDate: 1 });

    res.json({ count: alerts.length, alerts });
  } catch (err) {
    console.error("❌ FULL ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};