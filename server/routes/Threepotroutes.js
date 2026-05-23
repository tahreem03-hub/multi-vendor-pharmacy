import express from "express";
import {
  getAllPots,
  getPotByPrescriber,
  setDeposit,
  syncPot,
  addAlert,
  recordPayout,
  getMyPot,
  markAlertRead,
  getCommissionHistory,
} from "../controllers/threePot.controller.js";
import { adminOnly, prescriberOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// ── ADMIN ROUTES ──────────────────────────────────────────────
router.get("/admin/all",                              ...adminOnly, getAllPots);
router.get("/admin/:prescriberId",                    ...adminOnly, getPotByPrescriber);
router.patch("/admin/:prescriberId/set-deposit",      ...adminOnly, setDeposit);
router.patch("/admin/:prescriberId/sync",             ...adminOnly, syncPot);
router.post("/admin/:prescriberId/add-alert",         ...adminOnly, addAlert);
router.post("/admin/:prescriberId/record-payout",     ...adminOnly, recordPayout);

// ── PRESCRIBER ROUTES ─────────────────────────────────────────
router.get("/my",                                     ...prescriberOnly, getMyPot);
router.patch("/my/read-alert/:alertId",               ...prescriberOnly, markAlertRead);
router.get("/my/commission-history",                  ...prescriberOnly, getCommissionHistory);

export default router;