import mongoose from "mongoose";

const PrescriberLinkSchema = new mongoose.Schema({
  requesterId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  prescriberId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  requesterRole: { 
    type: String, 
    required: true,
    enum: [
      "Aesthetic nurse non-prescriber", 
      "Aesthetic therapist", 
      "Doctor (non-prescriber)", 
      "Dentist (non-prescriber)", 
      "Paramedic", 
      "Other healthcare professions"
    ]
  },
  registrationNumber: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'active', 'rejected'], 
    default: 'pending' 
  },
  message: { 
    type: String 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const PrescriberLink = mongoose.model("PrescriberLink", PrescriberLinkSchema);

export default PrescriberLink;