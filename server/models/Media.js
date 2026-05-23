import mongoose from 'mongoose';

const MediaSchema = new mongoose.Schema({
  title:     { type: String, trim: true },
  image:     { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: ['gallery', 'logo', 'post'],
    default: 'gallery'
  },
  mediaType: {
    type: String,
    required: true,
    enum: ['image', 'video'],
    default: 'image'
  },
  caption:   { type: String, trim: true },
  link:      { type: String, trim: true },
  createdAt: { type: Date, default: Date.now }
});

const Media = mongoose.model('Media', MediaSchema);
export default Media;