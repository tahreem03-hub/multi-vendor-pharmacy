import OnePort from "../models/OnePort.js";
import Stock from "../models/Stock.js";
import Order from "../models/Order.js";
import { syncPot1 } from "./helpers/syncPot1.js";

// ═══════════════════════════════════════════════════════════════
// PORT CONTROLLER — Unified prescriber financial management
// Handles: pot balances, alerts, commission payouts, VAT tracking
// ═══════════════════════════════════════════════════════════════

// ───────────────────────────────────────────────────────────────
// ADMIN ENDPOINTS
// ───────────────────────────────────────────────────────────────

/**
 * GET /api/port/admin/all
 * Fetch all prescribers' port summaries (admin only)
 */
export const getAllPorts = async (req, res) => {
  try {
    const ports = await OnePort.find()
      .populate("prescriber", "firstName lastName email prescriberId practiceName")
      .sort({ createdAt: -1 });

    res.json({ count: ports.length, ports });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET /api/port/admin/:prescriberId
 * Fetch one prescriber's full port detail with ledger (admin only)
 */
export const getPortByPrescriber = async (req, res) => {
  try {
    const port = await OnePort.findOne({
      prescriberId: req.params.prescriberId,
    }).populate("prescriber", "firstName lastName email practiceName registrationNumber");

    if (!port) return res.status(404).json({ message: "Port record not found" });

    res.json(port);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * PATCH /api/port/admin/:prescriberId/set-deposit
 * Admin sets or updates deposit amount for a prescriber
 * Body: { depositAmount, depositPaidBy }
 */
export const setDeposit = async (req, res) => {
  try {
    const { depositAmount, depositPaidBy } = req.body;

    if (!depositAmount || depositAmount <= 0) {
      return res.status(400).json({ message: "Valid deposit amount required" });
    }

    const port = await OnePort.findOne({
      prescriberId: req.params.prescriberId,
    });
    if (!port) return res.status(404).json({ message: "Port record not found" });

    // Record ledger entry for deposit
    port.ledger.push({
      type: "INITIAL_FLOAT",
      amount: depositAmount,
      cashDelta: depositAmount,
      description: `Deposit: ${depositPaidBy || "admin"}`,
      createdBy: req.user._id,
    });

    port.cashBalance += depositAmount;
    await port.save();

    res.json({ message: "Deposit recorded", port });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * PATCH /api/port/admin/:prescriberId/sync
 * Admin manually triggers port sync from live stock (Pot 1)
 */
export const syncPort = async (req, res) => {
  try {
    const port = await syncPot1(req.params.prescriberId);
    if (!port) return res.status(404).json({ message: "Port record not found" });

    res.json({ message: "Port synced successfully", port });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * POST /api/port/admin/:prescriberId/add-alert
 * Admin manually adds an alert to prescriber's dashboard
 * Body: { type, message }
 */
export const addAlert = async (req, res) => {
  try {
    const { type, message } = req.body;

    if (!type || !message) {
      return res.status(400).json({ message: "Alert type and message required" });
    }

    const port = await OnePort.findOne({
      prescriberId: req.params.prescriberId,
    });
    if (!port) return res.status(404).json({ message: "Port record not found" });

    port.alerts.push({ type, message });
    await port.save();

    res.json({ message: "Alert added", alerts: port.alerts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * POST /api/port/admin/:prescriberId/record-payout
 * Admin records a commission payout for a given month
 * Body: { month, amountExVat, invoiceNumber }
 */
export const recordPayout = async (req, res) => {
  try {
    const { month, amountExVat, invoiceNumber } = req.body;

    if (!month || !amountExVat) {
      return res.status(400).json({ message: "Month and amount required" });
    }

    const port = await OnePort.findOne({
      prescriberId: req.params.prescriberId,
    });
    if (!port) return res.status(404).json({ message: "Port record not found" });

    // Record payout in history
    port.commissionPayouts.push({
      month,
      amountExVat,
      invoiceNumber,
      status: "invoice_raised",
      paidAt: new Date(),
    });

    // Deduct from earned profit
    port.earnedProfit = Math.max(0, port.earnedProfit - amountExVat);

    // Record ledger entry
    port.ledger.push({
      type: "COMMISSION_EARNED",
      amount: -amountExVat,
      profitDelta: -amountExVat,
      description: `Commission payout: ${month}`,
      createdBy: req.user._id,
    });

    await port.save();

    res.json({ message: "Payout recorded", port });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * PATCH /api/port/admin/:prescriberId/update-vat
 * Admin updates VAT period tracking
 * Body: { inputVat, outputVat, status }
 */
export const updateVatPeriod = async (req, res) => {
  try {
    const { inputVat, outputVat, status } = req.body;

    const port = await OnePort.findOne({
      prescriberId: req.params.prescriberId,
    });
    if (!port) return res.status(404).json({ message: "Port record not found" });

    if (inputVat !== undefined) port.currentVatPeriod.inputVat = inputVat;
    if (outputVat !== undefined) port.currentVatPeriod.outputVat = outputVat;
    if (status) port.currentVatPeriod.status = status;

    await port.save();

    res.json({ message: "VAT period updated", port });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ───────────────────────────────────────────────────────────────
// PRESCRIBER ENDPOINTS
// ───────────────────────────────────────────────────────────────

/**
 * GET /api/port/my
 * Prescriber views their own port balances and alerts
 */
export const getMyPort = async (req, res) => {
  try {
    let port = await OnePort.findOne({
      prescriberId: req.user.prescriberId,
    });

    // Auto-create for prescribers registered before OnePort migration
    if (!port) {
      port = await OnePort.create({
        prescriber: req.user._id,
        prescriberId: req.user.prescriberId,
      });
    }

    res.json(port);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET /api/port/my/summary
 * Prescriber views quick port summary (balances only, no ledger)
 */
export const getPortSummary = async (req, res) => {
  try {
    let port = await OnePort.findOne({
      prescriberId: req.user.prescriberId,
    }).select(
      "cashBalance stockValue vatPosition earnedProfit availableToSpend truePotValue equilibriumStatus alerts"
    );

    // Auto-create for prescribers registered before OnePort migration
    if (!port) {
      port = await OnePort.create({
        prescriber: req.user._id,
        prescriberId: req.user.prescriberId,
      });
    }

    res.json(port);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * PATCH /api/port/my/mark-alert/:alertId
 * Prescriber marks an alert as read
 */
export const markAlertRead = async (req, res) => {
  try {
    const port = await OnePort.findOne({
      prescriberId: req.user.prescriberId,
    });
    if (!port) return res.status(404).json({ message: "Port record not found" });

    const alert = port.alerts.id(req.params.alertId);
    if (!alert) return res.status(404).json({ message: "Alert not found" });

    alert.isRead = true;
    await port.save();

    res.json({ message: "Alert marked as read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET /api/port/my/commission-history
 * Prescriber views their commission payout history
 */
export const getCommissionHistory = async (req, res) => {
  try {
    const port = await OnePort.findOne({
      prescriberId: req.user.prescriberId,
    }).select("commissionPayouts");

    if (!port) return res.status(404).json({ message: "Port record not found" });

    res.json({ payouts: port.commissionPayouts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET /api/port/my/ledger
 * Prescriber views their full ledger history
 */
export const getLedger = async (req, res) => {
  try {
    const { limit = 50, skip = 0 } = req.query;

    const port = await OnePort.findOne({
      prescriberId: req.user.prescriberId,
    }).select("ledger");

    if (!port) return res.status(404).json({ message: "Port record not found" });

    const ledgerEntries = port.ledger
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(skip, skip + limit);

    res.json({
      total: port.ledger.length,
      count: ledgerEntries.length,
      entries: ledgerEntries,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET /api/port/my/vat-status
 * Prescriber views current VAT period status
 */
export const getVatStatus = async (req, res) => {
  try {
    const port = await OnePort.findOne({
      prescriberId: req.user.prescriberId,
    }).select("currentVatPeriod");

    if (!port) return res.status(404).json({ message: "Port record not found" });

    res.json(port.currentVatPeriod);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
