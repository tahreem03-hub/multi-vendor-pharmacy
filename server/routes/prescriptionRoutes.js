import express from "express";
import {
  uploadPrescription,
  getPendingPrescriptions,
  getAllPrescriptions,
  verifyPrescription,
  checkUserPrescriptionStatus,
  submitPrescription,
  getMyPrescriptions,
  deletePrescription,
  getPrescriptionById  // ADD THIS
} from "../controllers/prescription.controller.js";

import { issuePrescription } from "../controllers/issuePrescriptionController.js";

import upload from "../middleware/multer.js";
import { protect, staffOnly, prescriberOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Any logged-in user

router.post("/submit",              protect,           submitPrescription);
router.post("/upload",              protect,           upload.single("image"), uploadPrescription);    //  not found in frontend
router.get("/status/:medicineId",   protect,           checkUserPrescriptionStatus);                   //  not found in frontend
router.get('/my', protect, getMyPrescriptions);                                                // this is getting from prescription request model

// Staff only (admin or prescriber)
router.get("/pending",              ...staffOnly,      getPendingPrescriptions);
router.get("/all",              ...staffOnly,      getAllPrescriptions);
router.patch("/verify/:id",         ...staffOnly,      verifyPrescription);


router.post("/issue", ...prescriberOnly, issuePrescription);


router.delete('/:id', protect, deletePrescription);
router.get('/:id', protect, getPrescriptionById); 

export default router;