import express from "express";
import {
  getAllUsers,
  approveUser,
  rejectUser,
  deleteUser,
  getApprovdPrescribers,
} from "../controllers/user.controller.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();



router.get("/",                ...adminOnly, getAllUsers);
router.get('/prescribers', protect, getApprovdPrescribers);

router.patch("/:id/approve",   ...adminOnly, approveUser);
router.patch("/:id/reject",    ...adminOnly, rejectUser);
router.delete("/:id",          ...adminOnly, deleteUser);



export default router;