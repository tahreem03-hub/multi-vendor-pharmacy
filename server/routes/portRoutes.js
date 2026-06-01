import express from "express";
import {
  getAllPorts,
  getPortByPrescriber,
  setDeposit,
  syncPort,
  addAlert,
  recordPayout,
  updateVatPeriod,
  getMyPort,
  getPortSummary,
  markAlertRead,
  getCommissionHistory,
  getLedger,
  getVatStatus,
} from "../controllers/port.controller.js";
import { adminOnly, prescriberOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// ───────────────────────────────────────────────────────────────
// ADMIN ROUTES — Port management
// ───────────────────────────────────────────────────────────────
router.get("/admin/all", adminOnly, getAllPorts);
router.get("/admin/:prescriberId", adminOnly, getPortByPrescriber);
router.patch("/admin/:prescriberId/set-deposit", adminOnly, setDeposit);
router.patch("/admin/:prescriberId/sync", adminOnly, syncPort);
router.post("/admin/:prescriberId/add-alert", adminOnly, addAlert);
router.post("/admin/:prescriberId/record-payout", adminOnly, recordPayout);
router.patch("/admin/:prescriberId/update-vat", adminOnly, updateVatPeriod);

// ───────────────────────────────────────────────────────────────
// PRESCRIBER ROUTES — Port viewing & management
// ───────────────────────────────────────────────────────────────
router.get("/my", prescriberOnly, getMyPort);
router.get("/my/summary", prescriberOnly, getPortSummary);
router.get("/my/ledger", prescriberOnly, getLedger);
router.get("/my/vat-status", prescriberOnly, getVatStatus);
router.get("/my/commission-history", prescriberOnly, getCommissionHistory);
router.patch("/my/mark-alert/:alertId", prescriberOnly, markAlertRead);

export default router;
