import express from "express";
import {
  getAllUsers,
  approveUser,
  rejectUser,
  deleteUser,
} from "../controllers/user.controller.js";
import { adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/",                ...adminOnly, getAllUsers);
router.patch("/:id/approve",   ...adminOnly, approveUser);
router.patch("/:id/reject",    ...adminOnly, rejectUser);
router.delete("/:id",          ...adminOnly, deleteUser);

export default router;