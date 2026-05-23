import express from "express";
import multer from "multer";
import path from "path";
import Slider from '../models/Slider.js';

// Ensure this is exactly express.Router() with a capital 'R'
const router = express.Router();

// 1. Configure Disk Storage Engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// 2. Initialize Multer instance with storage configuration
const upload = multer({ storage: storage });

// ── POST: Create a new slider with an uploaded image ──
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, description, buttonText, buttonLink } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: "Please upload an image file." });
    }

    const newSlide = new Slider({
      title,
      description,
      buttonText,
      buttonLink,
      imageUrl: req.file.path 
    });

    const savedSlide = await newSlide.save();
    res.status(201).json(savedSlide);
  } catch (error) {
    res.status(500).json({ message: "Server error saving slider.", error: error.message });
  }
});

// ── GET: Fetch all active sliders ──
router.get('/', async (req, res) => {
  try {
    const sliders = await Slider.find();
    res.status(200).json(sliders);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching sliders." });
  }
});

// ── DELETE: Remove a slider track ──
router.delete('/:id', async (req, res) => {
  try {
    await Slider.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Slider entry removed successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error dropping entry tracker." });
  }
});

export default router;