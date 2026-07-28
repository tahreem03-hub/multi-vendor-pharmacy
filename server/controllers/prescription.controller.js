import Prescription from "../models/Prescription.js";
import PrescriptionRequest from "../models/PrescriptionRequest.js";
import Medicine from "../models/medicines.js";
import User from "../models/User.js"
import fs from "fs";

import { createSignatureRxPrescription } from "../services/signatureRx.service.js";

// ── SUBMIT PRESCRIPTION (with SignatureRx sync) ──────────────
export const submitPrescription = async (req, res) => {
  try {
    let { patient, prescriber, medications, prescriberId, method, delivery } = req.body;

    // ── Parse if sent as strings ──
    if (typeof patient === "string") {
      try { patient = JSON.parse(patient); } catch { patient = {}; }
    }
    if (typeof prescriber === "string") {
      try { prescriber = JSON.parse(prescriber); } catch { prescriber = {}; }
    }
    if (typeof medications === "string") {
      try { medications = JSON.parse(medications); } catch { medications = [medications]; }
    }
    if (typeof delivery === "string") {
      try { delivery = JSON.parse(delivery); } catch { delivery = {}; }
    }

    // ── Validation ────────────────────────────────────────────
    if (!patient || Object.keys(patient).length === 0) {
      return res.status(400).json({ message: "Patient details are required." });
    }
    if (!medications || medications.length === 0) {
      return res.status(400).json({ message: "At least one medication is required." });
    }

    // ── Get prescriber details for SignatureRx ────────────────
    let prescriberUser = null;
    let securePin = null;

    if (prescriberId) {
      prescriberUser = await User.findById(prescriberId);
      if (prescriberUser) {
        securePin = Math.floor(100000 + Math.random() * 900000).toString();
      }
    }

    // ── Save to local DB ──────────────────────────────────────
    const newPrescription = new Prescription({
      user: req.user.id,
      patientDetails: patient,
      prescriberDetails: prescriber || {},
      prescriberId: prescriberId || null,
      medications: medications.map((med) =>
        typeof med === "object" && med._id ? med._id : med
      ),
      status: "pending",
      method: method || "form",
    });

    await newPrescription.save();

    // ── Sync to SignatureRx ────────────────────────────────────
    let signatureRxId = null;
    let syncError = null;

    const isConfigured = process.env.SIGNATURE_RX_EMAIL && process.env.SIGNATURE_RX_PASSWORD;

    if (isConfigured && prescriberUser && prescriberUser.signatureRxId) {
      try {
        // Determine action based on delivery method
        let action = "issueForCollection";
        if (delivery?.fulfillmentMethod) {
          if (delivery.fulfillmentMethod.includes("delivery")) {
            action = "issueForDelivery";
          } else if (delivery.fulfillmentMethod.includes("contact")) {
            action = "issueToContact";
          } else if (delivery.fulfillmentMethod.includes("draft")) {
            action = "draft";
          }
        }

        // ── Parse DOB for SignatureRx format ──────────────────
        let birthDay = "", birthMonth = "", birthYear = "";
        if (patient.dob) {
          const dob = new Date(patient.dob);
          if (!isNaN(dob)) {
            birthDay = String(dob.getDate()).padStart(2, '0');
            birthMonth = String(dob.getMonth() + 1).padStart(2, '0');
            birthYear = String(dob.getFullYear());
          }
        }

        // ── Parse address for SignatureRx format ──────────────
        let addressLn1 = patient.address || "";
        let addressLn2 = patient.address2 || "";
        let city = patient.city || "";
        let postCode = patient.postcode || patient.postalCode || "";
        let country = patient.country || "N/A"; // Default to N/A if not provided

        // If address is a single string, try to parse it
        if (addressLn1 && !addressLn2 && !city && !postCode) {
          // Try to extract components from full address
          const addressParts = addressLn1.split(',').map(s => s.trim());
          if (addressParts.length >= 2) {
            addressLn1 = addressParts[0];
            const lastPart = addressParts[addressParts.length - 1];
            // Try to extract postcode from last part
            const postcodeMatch = lastPart.match(/\b([A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2})\b/);
            if (postcodeMatch) {
              postCode = postcodeMatch[0];
              city = addressParts[addressParts.length - 2] || "";
            } else {
              city = lastPart;
            }
          }
        }

        // ── Prepare medicines array ───────────────────────────
        // ✅ Populate medicine
        const populatedMedications = await Medicine.find({
          _id: {
            $in: medications.map(med =>
              typeof med === 'object' && med._id ? med._id : med
            )
          }
        }).select('name dosage description brand');

        // ✅ map in signature rx format
        const signatureRxMedicines = populatedMedications.map((med) => ({
          object: 'medicine',
          id: 0,
          description: `${med.name}${med.brand ? ` (${med.brand})` : ''}`,
          qty: '1',
          directions: med.dosage || 'As prescribed by clinician',
        }));

        
        // ── Build complete SignatureRx payload ─────────────────
        const signatureRxPayload = {
          action: action,

          // Patient details - complete mapping
          patient: {
            first_name: patient.firstName || "",
            last_name: patient.lastName || "",
            gender: patient.gender || "Male",
            email: patient.email || "",
            phone: patient.phone || "",
            birth_day: birthDay,
            birth_month: birthMonth,
            birth_year: birthYear,
            address_ln1: addressLn1,
            address_ln2: addressLn2 || "",
            city: city,
            post_code: postCode,
            country: country || 'uk',
            client_ref_id: newPrescription._id.toString(),
            nhs_number: patient.nhsNumber || patient.nhs || "",
          },

          // Medicines
          medicines: signatureRxMedicines,

          // Prescriber
          prescriber_ip: req.ip || req.connection?.remoteAddress || '127.0.0.1',
          secure_pin: securePin,

          // Additional
          notes: prescriber?.clinicalNotes || patient?.allergies || '',
          notify: true,
          send_sms: false,
          client_ref_id: newPrescription._id.toString(),
          external_id: newPrescription._id.toString(),
        };

        // Add delivery address if action is issueForDelivery
        if (action === 'issueForDelivery' && delivery?.deliveryAddress) {
          signatureRxPayload.delivery_address = {
            address_line1: addressLn1,
            address_line2: addressLn2 || "",
            city: city,
            postcode: postCode,
            country: country
          };
        }

        const result = await createSignatureRxPrescription(signatureRxPayload);

        // Store only the SignatureRx ID
        signatureRxId = result.id || result.prescription?.id || null;
        if (signatureRxId) {
          newPrescription.signatureRxId = String(signatureRxId);
          await newPrescription.save();
        }

        console.log(`✅ Prescription ${newPrescription._id} synced to SignatureRx`);

      } catch (error) {
        syncError = error.message;
        console.error('❌ Failed to sync prescription to SignatureRx:', error.message);
      }
    }

    res.status(201).json({
      success: true,
      message: "Prescription submitted successfully for approval!",
      prescription: {
        _id: newPrescription._id,
        status: newPrescription.status,
        patientDetails: newPrescription.patientDetails,
        medications: newPrescription.medications,
        createdAt: newPrescription.createdAt,
        signatureRxId: newPrescription.signatureRxId || null
      },
      signatureRx: {
        synced: !!signatureRxId,
        error: syncError || null
      }
    });

  } catch (error) {
    console.error("Submit Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error during prescription submission."
    });
  }
};

export const uploadPrescription = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Prescription image is required." });

    const { medicineId } = req.body;
    const medicine = await Medicine.findById(medicineId);
    if (!medicine) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: "Medicine not found." });
    }

    const newPrescription = new Prescription({
      user: req.user.id,
      medicine: medicineId,
      image: req.file.filename,
      status: "pending",
      method: "upload",
    });

    await newPrescription.save();
    res.status(201).json({
      message: "Prescription uploaded successfully.",
      prescription: newPrescription,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ message: "Failed to process prescription upload." });
  }
};

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
    const { status } = req.query; // optional filter
    
    const filter = {};
    if (status) filter.status = status;
    
    const prescriptions = await Prescription.find(filter)
      .populate("user",        "firstName lastName email")
      .populate("medicine",    "name brand dosage price")
      .populate("medications", "name brand dosage price")
      .populate("prescriber",  "firstName lastName prescriberId")
      .sort({ createdAt: -1 });

    res.status(200).json({ count: prescriptions.length, prescriptions });
  } catch (error) {
    res.status(500).json({ message: "Error fetching prescriptions." });
  }
};


export const verifyPrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    if (!["approved", "rejected", "dispensed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    const updated = await Prescription.findByIdAndUpdate(
      id,
      {
        status,
        pharmacistNote: note,
        verifiedAt: Date.now(),
        verifiedBy: req.user.id,
      },
      { new: true }
    ).populate("medicine", "name");

    if (!updated) return res.status(404).json({ message: "Prescription not found." });

    res.status(200).json({
      message: `Prescription ${status} successfully.`,
      prescription: updated,
    });
  } catch (error) {
    res.status(500).json({ message: "Verification process failed." });
  }
};

export const checkUserPrescriptionStatus = async (req, res) => {
  try {
    const { medicineId } = req.params;
    const prescription = await Prescription.findOne({
      user: req.user.id,
      $or: [{ medicine: medicineId }, { medications: medicineId }],
    }).sort({ createdAt: -1 });

    res.status(200).json(prescription || { status: "none" });
  } catch (error) {
    res.status(500).json({ message: "Error checking status." });
  }
};

export const getMyPrescriptions = async (req, res) => {
  try {
    const userId = req.user._id;

    // PrescriptionRequest — jo customers ne request ki
    const PrescriptionRequest = (await import('../models/PrescriptionRequest.js')).default;
    const requests = await PrescriptionRequest.find({
      prescriberId: userId,
    }).sort({ createdAt: -1 });

    // Prescription — jo prescriber ne khud issue ki (direct)
    const directPrescriptions = await Prescription.find({
      prescriber: userId,
      method: 'direct',
    })
    .populate('medications', 'name')
    .sort({ createdAt: -1 });

    // Combine karo
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

export const deletePrescription = async (req, res) => {
  try {
    const deleted = await PrescriptionRequest.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    res.json({ success: true, message: 'Prescription deleted successfully' });
  } catch (error) {
    console.error('deletePrescription error:', error);
    res.status(500).json({ message: 'Failed to delete prescription' });
  }
};

// prescription detail
export const getPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;

    // Pehle Prescription model mein dhundo
    let prescription = await Prescription.findById(id)
      .populate('user', 'firstName lastName email')
      .populate('medications', 'name brand dosage price');

    // Agar nahi mila toh PrescriptionRequest mein dhundo
    if (!prescription) {
      const PrescriptionRequest = (await import('../models/PrescriptionRequest.js')).default;
      prescription = await PrescriptionRequest.findById(id)
        .populate('requesterId', 'firstName lastName email')
        .populate('productsRequired', 'name');

      if (!prescription) {
        return res.status(404).json({ message: 'Prescription not found' });
      }

      // Same format mein return karo
      return res.status(200).json({
        _id: prescription._id,
        patientName: prescription.patientName,
        treatment: prescription.treatment,
        status: prescription.status,
        createdAt: prescription.createdAt,
        clinicalNotes: prescription.clinicalNotes,
        medications: prescription.productsRequired || [],
        method: 'request',
      });
    }

    res.status(200).json(prescription);
  } catch (error) {
    console.error('Error fetching prescription:', error);
    res.status(500).json({ message: 'Failed to fetch prescription' });
  }
};


