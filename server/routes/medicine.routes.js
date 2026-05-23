import express from "express";
import {
  createMedicine,
  getAllMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
  getMedicinesByCategory,
  getPrescriptionMedicines,
} from "../controllers/medicine.controller.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";
import upload from "../middleware/multer.js";

const router = express.Router();

// ─────────────────────────────────────────────────────────────
// PUBLIC ROUTES
// ─────────────────────────────────────────────────────────────
router.get("/prescription", getPrescriptionMedicines);
router.get("/category/:category", getMedicinesByCategory);
router.get("/", getAllMedicines);
router.get("/:id", getMedicineById);

// ─────────────────────────────────────────────────────────────
// ADMIN ROUTES
// ─────────────────────────────────────────────────────────────

// Create Medicine
router.post(
  "/",
  protect,
  adminOnly,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "additionalImages", maxCount: 3 },
  ]),
  createMedicine
);

// Update Medicine
router.put(
  "/:id",
  protect,
  adminOnly,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "additionalImages", maxCount: 3 },
  ]),
  updateMedicine
);

// Delete Medicine
router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteMedicine
);

export default router;