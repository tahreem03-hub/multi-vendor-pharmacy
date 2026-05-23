import express from "express";
const router = express.Router(); // <--- This line was missing or broken

import {
  searchPrescribers,
  sendLinkRequest,
  getActiveLinks,
  submitPrescriptionRequest,
  // Admin Controllers
  getAdminPendingLinks,
  getPrescriberDashboard,
  getAdminPrescriptionRequests,
  verifyLink,
  verifyPrescriptionRequest
} from "../controllers/prescriberController.js";

import { protect, adminOnly,prescriberOnly } from "../middleware/authMiddleware.js";
import upload from "../middleware/multer.js";

// --- USER ROUTES ---
// Regular users can search, link, and submit
// Change these 4 user routes
router.get("/search",              protect, searchPrescribers);
router.post("/link",               protect, sendLinkRequest);
router.get("/active-links",        protect, getActiveLinks);
router.post("/request-prescription", protect, upload.single("consentFile"), submitPrescriptionRequest);

// Change these 4 admin routes — remove the separate protect, spread adminOnly
router.get("/admin/pending",              ...adminOnly, getAdminPendingLinks);
router.get("/admin/requests",             ...adminOnly, getAdminPrescriptionRequests);
router.patch("/admin/verify-link/:id",    ...adminOnly, verifyLink);
router.patch("/admin/verify-request/:id", ...adminOnly, verifyPrescriptionRequest);
router.get("/dashboard", ...prescriberOnly, getPrescriberDashboard);

export default router;