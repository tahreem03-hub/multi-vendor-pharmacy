import express from "express";
import {
  uploadPrescription,
  getPendingPrescriptions,
  verifyPrescription,
  checkUserPrescriptionStatus,
  submitPrescription,
  getMyPrescriptions
} from "../controllers/prescription.controller.js";
import upload from "../middleware/multer.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Any logged-in user
router.post("/upload-consent", protect, upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  res.json({
    url:  req.file.path.replace(/\\/g, "/"),
    path: req.file.path.replace(/\\/g, "/"),
  });
});

router.post("/submit",              protect,           submitPrescription);
router.post("/upload",              protect,           upload.single("image"), uploadPrescription);
router.get("/status/:medicineId",   protect,           checkUserPrescriptionStatus);
router.get('/my', protect, getMyPrescriptions);

// Admin only
router.get("/pending",              ...adminOnly,      getPendingPrescriptions);
router.patch("/verify/:id",         ...adminOnly,      verifyPrescription);

export default router;