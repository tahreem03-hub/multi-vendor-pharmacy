import express from "express";
import {
  createOrder,
  getAllOrders,
  updateOrderStatus,
  getCommissionSummary,
  getMyOrders,
  getMyStats,
} from "../controllers/Order.controller.js";
import { protect, adminOnly, prescriberOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// ── CUSTOMER ROUTES ───────────────────────────────────────────
// Matches: POST /api/orders
router.post("/", protect, createOrder);

// ── ADMIN ROUTES ──────────────────────────────────────────────
router.get("/admin/all",                ...adminOnly,       getAllOrders);
router.get("/admin/commission-summary", ...adminOnly,       getCommissionSummary);
router.patch("/admin/:id/status",       ...adminOnly,       updateOrderStatus);

// ── PRESCRIBER ROUTES ─────────────────────────────────────────
router.get("/my",                       ...prescriberOnly,  getMyOrders);
router.get("/my/stats",                 ...prescriberOnly,  getMyStats);

export default router;