import express from "express";
import {
  addStock,
  getAllStock,
  adjustStock,
  deleteStock,
  getExpiryAlerts,
  getMyStock,
  getMyAlerts,
} from "../controllers/Stock.Controller.js";
import {protect, requireRole, adminOnly, prescriberOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// ── ADMIN ROUTES ──────────────────────────────────────────────
router.post("/admin/add", protect, requireRole("admin"), addStock);
router.get("/admin/all", protect, requireRole("admin"), getAllStock);
router.get("/admin/expiry-alerts", protect, requireRole("admin"), getExpiryAlerts);
router.patch("/admin/:id/adjust",      ...adminOnly,      adjustStock);
router.delete("/admin/:id",            ...adminOnly,      deleteStock);

// ── PRESCRIBER ROUTES ─────────────────────────────────────────
router.get("/my",                      ...prescriberOnly, getMyStock);
router.get("/my/alerts",               ...prescriberOnly, getMyAlerts);

export default router;