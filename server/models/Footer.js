import mongoose from "mongoose"; // <--- THIS LINE IS MISSING

const footerSchema = new mongoose.Schema({
  logo: String, 
  awardInfo: { logo: String, description: String },
  links: [{ label: String, url: String }],
  addresses: [String],
  regulatoryText: String,
  socialLinks: [{ platform: String, url: String }], 
  certifications: [String] 
});

export default mongoose.model('Footer', footerSchema);