import Post from '../models/Post.js';
import fs from 'fs';

// ── Create Post ───────────────────────────────────────────────
export const createPost = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please select an image.' });
    }

    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required.' });
    }

    // 👇 use req.file.path and normalize slashes — matches how media controller works
    const imagePath = req.file.path.replace(/\\/g, '/');

    const post = await Post.create({
      title,
      image: imagePath,
    });

    res.status(201).json({ message: 'Post created!', post });

  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Create Post Error:', error.message);
    res.status(500).json({ message: 'Failed to create post.' });
  }
};

// ── Get All Posts ─────────────────────────────────────────────
export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find({}).sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch posts.' });
  }
};

// ── Update Post ───────────────────────────────────────────────
export const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    const { title } = req.body;
    if (title) post.title = title;

    if (req.file) {
      // delete old image from disk
      if (post.image && fs.existsSync(post.image)) {
        fs.unlinkSync(post.image);
      }
      // 👇 same fix — normalize path
      post.image = req.file.path.replace(/\\/g, '/');
    }

    await post.save();
    res.status(200).json({ message: 'Post updated!', post });

  } catch (error) {
    res.status(500).json({ message: 'Failed to update post.' });
  }
};

// ── Delete Post ───────────────────────────────────────────────
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    if (post.image && fs.existsSync(post.image)) {
      fs.unlinkSync(post.image);
    }

    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Post deleted.' });

  } catch (error) {
    res.status(500).json({ message: 'Failed to delete post.' });
  }
};