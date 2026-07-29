import express from "express";
import {
  getPendingPrescriptions,
  getAllPrescriptions,
  verifyPrescription,
  getMyPrescriptions,
  deletePrescription,
  getPrescriptionById  // ADD THIS
} from "../controllers/prescription.controller.js";

import { issuePrescription } from "../controllers/issuePrescriptionController.js";

import { protect, staffOnly, prescriberOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get('/my', protect, getMyPrescriptions);                                                // this is getting from prescription request model

// Staff only (admin or prescriber)
router.get("/pending",              ...staffOnly,      getPendingPrescriptions);
router.get("/all",              ...staffOnly,      getAllPrescriptions);
router.patch("/verify/:id",         ...staffOnly,      verifyPrescription);


router.post("/issue", ...prescriberOnly, issuePrescription);


router.delete('/:id', protect, deletePrescription);
router.get('/:id', protect, getPrescriptionById); 

export default router;