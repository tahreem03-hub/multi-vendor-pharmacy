import express from 'express';
import { getAboutData, updateAboutData, deleteAboutRecord } from '../controllers/aboutController.js';

const router = express.Router();

router.get('/', getAboutData);
router.put('/', updateAboutData);
router.delete('/', deleteAboutRecord);

export default router;