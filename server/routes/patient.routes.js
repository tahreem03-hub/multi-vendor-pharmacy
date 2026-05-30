import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getPatientDetailsByPrescription } from "../controllers/patient.controller.js";

const router = express.Router();

router.get("/prescription/:id", protect, getPatientDetailsByPrescription);

export default router;
