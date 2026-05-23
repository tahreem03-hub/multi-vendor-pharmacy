import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  createPost,
  getPosts,

  updatePost,
  deletePost,
 
} from '../controllers/postController.js';

const router = express.Router();

// ── Multer Setup ──────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/posts';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// ── Routes ────────────────────────────────────────────────────
router.get('/',          getPosts);          // Public

router.post('/upload', upload.single('image'), createPost);
router.put('/:id',       upload.single('image'), updatePost);   // Admin
router.delete('/:id',    deletePost);        // Admin


export default router;