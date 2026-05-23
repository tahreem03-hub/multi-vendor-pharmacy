import Contact   from '../models/contact.js';
import ClinicInfo from '../models/ClinicInfo.js';

// ── User sends a message ──────────────────────────────────────
export const createContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message)
      return res.status(400).json({ message: 'Name, email and message are required.' });

    const newContact = await Contact.create({ name, email, message });
    res.status(201).json({ message: 'Message sent successfully', contact: newContact });
  } catch (err) {
    console.error('Create contact error:', err);
    res.status(500).json({ message: 'Failed to submit message' });
  }
};

// ── Get all user messages (admin) ─────────────────────────────
export const getAllContact = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json(contacts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve messages' });
  }
};

// ── Delete a user message ─────────────────────────────────────
export const deleteContact = async (req, res) => {
  try {
    const deleted = await Contact.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Message not found' });
    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete message' });
  }
};

// ── Get clinic info ───────────────────────────────────────────
export const getClinicInfo = async (req, res) => {
  try {
    // Always returns one document — creates default if none exists
    let info = await ClinicInfo.findOne();
    if (!info) info = await ClinicInfo.create({});
    res.status(200).json(info);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get clinic info' });
  }
};

// ── Update clinic info ────────────────────────────────────────
export const updateClinicInfo = async (req, res) => {
  try {
    const { number, timings, address, clinicEmail } = req.body;

    let info = await ClinicInfo.findOne();
    if (!info) {
      info = await ClinicInfo.create({ number, timings, address, clinicEmail });
    } else {
      info = await ClinicInfo.findByIdAndUpdate(
        info._id,
        { number, timings, address, clinicEmail },
        { new: true }
      );
    }
    res.status(200).json({ message: 'Clinic info updated!', info });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update clinic info' });
  }
};