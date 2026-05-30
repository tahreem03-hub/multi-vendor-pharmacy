import Prescription from "../models/Prescription.js";

export const getPatientDetailsByPrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const prescription = await Prescription.findById(id).select("patientDetails");

    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found." });
    }

    return res.status(200).json({ patientDetails: prescription.patientDetails });
  } catch (error) {
    console.error("getPatientDetailsByPrescription error:", error);
    return res.status(500).json({ message: "Failed to load patient details." });
  }
};
