import express from 'express';
import {
  createContact,
  getAllContact,
  deleteContact,
  getClinicInfo,
  updateClinicInfo,
} from '../controllers/contactController.js';

// Import staffOnly instead of just adminOnly
import { protect, staffOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// ── Public ────────────────────────────────────────────────────
router.get('/clinic',   getClinicInfo);
router.post('/',        createContact);

// ── Protected ─────────────────────────────────────────────────
// Update these to use staffOnly so both admin and prescriber can access them
router.put('/clinic',    ...staffOnly, updateClinicInfo);
router.get('/messages',  ...staffOnly, getAllContact);
router.delete('/:id',    ...staffOnly, deleteContact);

export default router;