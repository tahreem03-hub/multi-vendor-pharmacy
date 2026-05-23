import Media from '../models/Media.js';
import fs from 'fs';

// ── Upload ────────────────────────────────────────────────────────────────────
const uploadMedia = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Please select a file.' });

    const { title, type, link, caption } = req.body;

    if (!type || !['gallery', 'logo', 'post'].includes(type)) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Invalid media type.' });
    }

    const mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';

    const newMedia = new Media({
      title,
      type,
      link,
      caption,
      mediaType,
      image: req.file.path.replace(/\\/g, '/')
    });

    await newMedia.save();
    res.status(201).json({ message: 'Media uploaded successfully!', media: newMedia });

  } catch (error) {
    console.error('Upload Error:', error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: 'Server error during upload.' });
  }
};

// ── Get All / Filter by type ──────────────────────────────────────────────────
const getMedia = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = type ? { type } : {};
    const items = await Media.find(filter).sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve media.' });
  }
};

// ── Delete ────────────────────────────────────────────────────────────────────
const deleteMedia = async (req, res) => {
  try {
    const item = await Media.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Media not found.' });

    if (fs.existsSync(item.image)) fs.unlinkSync(item.image);
    await Media.findByIdAndDelete(item._id);
    res.status(200).json({ message: 'Media deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete media.' });
  }
};

export { uploadMedia, getMedia, deleteMedia };