import express from "express";
import {
  getAllUsers,
  approveUser,
  rejectUser,
  deleteUser,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/",                getAllUsers);
router.patch("/:id/approve",   approveUser);
router.patch("/:id/reject",    rejectUser);
router.delete("/:id",          deleteUser);

export default router;