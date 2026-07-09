import User from "../models/User.js";
// ── Get all users ─────────────────────────────────────────────────────────────
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Approve user ──────────────────────────────────────────────────────────────
export const approveUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User approved", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Reject/Revoke user ────────────────────────────────────────────────────────
export const rejectUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved: false },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User access revoked", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Delete user ───────────────────────────────────────────────────────────────
export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// controller to get all approved prescribers to show in prescription form
export const getApprovdPrescribers = async (req, res) => {
  try {
    const prescribers = await User.find({ 
      role: 'prescriber',
      isActive: true 
    }).select('firstName lastName registrationNumber professionalRole prescriberId');
    
    const formatted = prescribers.map(p => ({
      _id:                p._id,
      name:               `${p.firstName} ${p.lastName}`.trim(),
      registrationNumber: p.registrationNumber || 'N/A',
      professionalRole:   p.professionalRole   || 'Prescriber',
      prescriberId:       p.prescriberId       || '',
    }));

    res.json({ prescribers: formatted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}