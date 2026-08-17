import express from "express";
const router = express.Router();

import {
  searchPrescribers,
  sendLinkRequest,
  getActiveLinks,
  getMyPatients,
  deleteMyPatient,
  submitPrescriptionRequest,
  getIncomingLinkRequests,   // ✅ ADD
  verifyMyLink,              // ✅ ADD
  // Admin Controllers
  getAdminPendingLinks,
  getPrescriberDashboard,
  getAdminPrescriptionRequests,
  verifyPrescriptionRequest
} from "../controllers/prescriberController.js";

import { protect, adminOnly, prescriberOnly } from "../middleware/authMiddleware.js";

// --- USER ROUTES ---
router.get("/search",                 protect, searchPrescribers);
router.post("/link",                  protect, sendLinkRequest);

router.get("/patients",               ...prescriberOnly, getMyPatients);
router.delete("/patients/:patientId", ...prescriberOnly, deleteMyPatient);

router.get("/active-links",           protect, getActiveLinks);
router.post("/request-prescription",  protect, submitPrescriptionRequest);

// --- PRESCRIBER ROUTES ---
router.patch("/verify-request/:id",   ...prescriberOnly, verifyPrescriptionRequest);
router.get("/my-link-requests",       ...prescriberOnly, getIncomingLinkRequests);  // ✅ ADD — own links only
router.patch("/verify-link/:id",      ...prescriberOnly, verifyMyLink);             // ✅ ADD — ownership-checked

// --- ADMIN ROUTES (read-only) ---
router.get("/admin/pending",              ...adminOnly, getAdminPendingLinks);
router.get("/admin/requests",             ...adminOnly, getAdminPrescriptionRequests);
router.get("/dashboard",                  ...prescriberOnly, getPrescriberDashboard);

export default router;