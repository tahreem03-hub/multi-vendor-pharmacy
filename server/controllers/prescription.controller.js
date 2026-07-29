import Prescription from "../models/Prescription.js";
import Medicine from "../models/medicines.js";
import User from "../models/User.js";
import { createSignatureRxPrescription } from "../services/signatureRx.service.js";

// ─────────────────────────────────────────────────────────────
// GET /api/prescriptions/all  (Admin)
// ─────────────────────────────────────────────────────────────
export const getPendingPrescriptions = async (req, res) => {
  try {
    const pending = await Prescription.find({ status: "pending" })
      .populate("user", "firstName lastName email")
      .populate("medicine", "name brand dosage price")
      .populate("medications", "name brand dosage price")
      .sort({ createdAt: -1 });

    res.status(200).json({ count: pending.length, prescriptions: pending });
  } catch (error) {
    res.status(500).json({ message: "Error fetching the verification queue." });
  }
};

export const getAllPrescriptions = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const prescriptions = await Prescription.find(filter)
      .populate("user",        "firstName lastName email")
      .populate("medications", "name brand dosage price")
      .populate("prescriber",  "firstName lastName prescriberId")
      .sort({ createdAt: -1 });

    res.status(200).json({ count: prescriptions.length, prescriptions });
  } catch (error) {
    res.status(500).json({ message: "Error fetching prescriptions." });
  }
};

// ─────────────────────────────────────────────────────────────
// PATCH /api/prescriptions/verify/:id  (Admin/Staff)
// Only for: pending → approved/rejected, issued → dispensed
// ─────────────────────────────────────────────────────────────
export const verifyPrescription = async (req, res) => {
  try {
    const { status, note } = req.body;

    if (!["approved", "rejected", "dispensed"].includes(status))
      return res.status(400).json({ message: "Invalid status." });

    const updated = await Prescription.findByIdAndUpdate(
      req.params.id,
      { status, pharmacistNote: note, verifiedAt: Date.now(), verifiedBy: req.user.id },
      { new: true }
    ).populate("medications", "name");

    if (!updated) return res.status(404).json({ message: "Prescription not found." });

    res.status(200).json({ message: `Prescription ${status} successfully.`, prescription: updated });
  } catch (error) {
    res.status(500).json({ message: "Verification process failed." });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/prescriptions/my  (Prescriber)
// Returns PrescriptionRequests + direct issued prescriptions
// ─────────────────────────────────────────────────────────────
export const getMyPrescriptions = async (req, res) => {
  try {
    const userId = req.user._id;

    const PrescriptionRequest = (await import('../models/PrescriptionRequest.js')).default;

    const [requests, directPrescriptions] = await Promise.all([
      PrescriptionRequest.find({ prescriberId: userId }).sort({ createdAt: -1 }),
      Prescription.find({ prescriber: userId, method: 'direct' })
        .populate('medications', 'name')
        .sort({ createdAt: -1 }),
    ]);

    const combined = [
      ...requests.map(r => ({
        _id:         r._id,
        patientName: r.patientName,
        treatment:   r.treatment,
        status:      r.status,
        createdAt:   r.createdAt,
        method:      'request',
        type:        'request',
      })),
      ...directPrescriptions.map(p => ({
        _id:            p._id,
        patientDetails: p.patientDetails,
        treatment:      p.fulfillmentMethod || 'Direct',
        status:         p.status,
        createdAt:      p.createdAt,
        method:         'direct',
        type:           'direct',
      })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ prescriptions: combined });
  } catch (error) {
    console.error('getMyPrescriptions error:', error);
    res.status(500).json({ message: 'Failed to fetch prescriptions' });
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE /api/prescriptions/:id  (Prescriber)
// ─────────────────────────────────────────────────────────────
export const deletePrescription = async (req, res) => {
  try {
    // Try Prescription model first
    let deleted = await Prescription.findByIdAndDelete(req.params.id);

    // Then try PrescriptionRequest
    if (!deleted) {
      const PrescriptionRequest = (await import('../models/PrescriptionRequest.js')).default;
      deleted = await PrescriptionRequest.findByIdAndDelete(req.params.id);
    }

    if (!deleted)
      return res.status(404).json({ message: 'Prescription not found' });

    res.json({ success: true, message: 'Prescription deleted successfully' });
  } catch (error) {
    console.error('deletePrescription error:', error);
    res.status(500).json({ message: 'Failed to delete prescription' });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/prescriptions/:id
// ─────────────────────────────────────────────────────────────
export const getPrescriptionById = async (req, res) => {
  try {
    let prescription = await Prescription.findById(req.params.id)
      .populate('user',        'firstName lastName email')
      .populate('medications', 'name brand dosage price')
      .populate('prescriber',  'firstName lastName prescriberId');

    if (!prescription) {
      const PrescriptionRequest = (await import('../models/PrescriptionRequest.js')).default;
      const req2 = await PrescriptionRequest.findById(req.params.id)
        .populate('requesterId',    'firstName lastName email')
        .populate('productsRequired', 'name');

      if (!req2) return res.status(404).json({ message: 'Prescription not found' });

      return res.status(200).json({
        _id:           req2._id,
        patientName:   req2.patientName,
        treatment:     req2.treatment,
        status:        req2.status,
        createdAt:     req2.createdAt,
        clinicalNotes: req2.clinicalNotes,
        medications:   req2.productsRequired || [],
        method:        'request',
      });
    }

    res.status(200).json(prescription);
  } catch (error) {
    console.error('getPrescriptionById error:', error);
    res.status(500).json({ message: 'Failed to fetch prescription' });
  }
};
