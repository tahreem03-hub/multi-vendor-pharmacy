import ThreePot from "../models/ThreePort.js"
import Stock from "../models/Stock.js";
import Order from "../models/Order.js"
import { syncPot1 } from "./helpers/syncPot1.js";

// ── Helper: sync Pot 1 from live Stock documents ──────────────
// Called after any stock change to keep Pot 1 accurate


// ─────────────────────────────────────────────────────────────
// ADMIN CONTROLLERS
// ─────────────────────────────────────────────────────────────

// GET /api/three-pot/admin/all
// Admin sees all prescribers' pot summaries
export const getAllPots = async (req, res) => {
  try {
    const pots = await ThreePot.find()
      .populate("prescriber", "firstName lastName email prescriberId practiceName")
      .sort({ createdAt: -1 });

    res.json({ count: pots.length, pots });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/three-pot/admin/:prescriberId
// Admin views one prescriber's full pot detail
export const getPotByPrescriber = async (req, res) => {
  try {
    const pot = await ThreePot.findOne({
      prescriberId: req.params.prescriberId,
    }).populate("prescriber", "firstName lastName email practiceName registrationNumber");

    if (!pot) return res.status(404).json({ message: "ThreePot record not found" });

    res.json(pot);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/three-pot/admin/:prescriberId/set-deposit
// Admin sets or updates Dr G's Pot 2 deposit amount
// Body: { depositAmount, depositPaidBy }
export const setDeposit = async (req, res) => {
  try {
    const { depositAmount, depositPaidBy } = req.body;

    if (!depositAmount || depositAmount <= 0) {
      return res.status(400).json({ message: "Valid deposit amount required" });
    }

    const pot = await ThreePot.findOne({
      prescriberId: req.params.prescriberId,
    });
    if (!pot) return res.status(404).json({ message: "ThreePot record not found" });

    pot.pot2.depositAmount  = depositAmount;
    pot.pot2.depositPaidAt  = new Date();
    pot.pot2.depositPaidBy  = depositPaidBy || "";
    await pot.save();

    res.json({ message: "Deposit updated", pot });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/three-pot/admin/:prescriberId/sync
// Admin manually triggers a Pot 1 sync from live stock
export const syncPot = async (req, res) => {
  try {
    const pot = await syncPot1(req.params.prescriberId);
    if (!pot) return res.status(404).json({ message: "ThreePot record not found" });

    res.json({ message: "Pot 1 synced", pot });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/three-pot/admin/:prescriberId/add-alert
// Admin manually pushes an alert to a prescriber's dashboard
// Body: { type, message }
export const addAlert = async (req, res) => {
  try {
    const { type, message } = req.body;

    const pot = await ThreePot.findOne({
      prescriberId: req.params.prescriberId,
    });
    if (!pot) return res.status(404).json({ message: "ThreePot record not found" });

    pot.alerts.push({ type, message });
    await pot.save();

    res.json({ message: "Alert added", alerts: pot.alerts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/three-pot/admin/:prescriberId/record-payout
// Admin records a commission payout for a given month
// Body: { month, amountExVat, invoiceNumber }
export const recordPayout = async (req, res) => {
  try {
    const { month, amountExVat, invoiceNumber } = req.body;

    const pot = await ThreePot.findOne({
      prescriberId: req.params.prescriberId,
    });
    if (!pot) return res.status(404).json({ message: "ThreePot record not found" });

    pot.commissionPayouts.push({
      month,
      amountExVat,
      invoiceNumber,
      status:  "invoice_raised",
      paidAt:  new Date(),
    });

    // Deduct from commission sub-account
    pot.pot3.commissionSubAccount = Math.max(
      0,
      pot.pot3.commissionSubAccount - amountExVat
    );

    await pot.save();

    res.json({ message: "Payout recorded", pot });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// PRESCRIBER CONTROLLERS
// ─────────────────────────────────────────────────────────────

// GET /api/three-pot/my
// Dr G views his own pot balances and alerts
export const getMyPot = async (req, res) => {
  try {
    const pot = await ThreePot.findOne({
      prescriberId: req.user.prescriberId,
    });
    if (!pot) return res.status(404).json({ message: "ThreePot record not found" });

    res.json(pot);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/three-pot/my/read-alert/:alertId
// Dr G marks an alert as read
export const markAlertRead = async (req, res) => {
  try {
    const pot = await ThreePot.findOne({
      prescriberId: req.user.prescriberId,
    });
    if (!pot) return res.status(404).json({ message: "ThreePot record not found" });

    const alert = pot.alerts.id(req.params.alertId);
    if (!alert) return res.status(404).json({ message: "Alert not found" });

    alert.isRead = true;
    await pot.save();

    res.json({ message: "Alert marked as read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/three-pot/my/commission-history
// Dr G views his payout history
export const getCommissionHistory = async (req, res) => {
  try {
    const pot = await ThreePot.findOne({
      prescriberId: req.user.prescriberId,
    });
    if (!pot) return res.status(404).json({ message: "ThreePot record not found" });

    res.json({ payouts: pot.commissionPayouts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

 // exported for use in stock/order controllers