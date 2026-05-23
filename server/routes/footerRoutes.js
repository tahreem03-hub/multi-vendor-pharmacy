import express from 'express';
import { getFooter, updateFooter, deleteFooter } from '../controllers/footerController.js';
import upload from '../middleware/multer.js'; 

const router = express.Router();

router.get('/', getFooter);
router.put('/', upload.single('logo'), updateFooter);
router.delete('/', deleteFooter); // New route to clear footer data

export default router;