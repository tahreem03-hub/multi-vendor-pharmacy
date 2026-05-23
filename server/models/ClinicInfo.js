// models/ClinicInfo.js
import mongoose from 'mongoose';

const clinicInfoSchema = new mongoose.Schema({
  number:      { type: String, default: '+44 20 7946 0958' },
  timings:     { type: String, default: 'Monday - Friday: 9:00 AM - 6:00 PM, Saturday: 10:00 AM - 4:00 PM, Sunday: Closed' },
  address:     { type: String, default: '123 Harley Street, London, W1G 6AX, United Kingdom' },
  clinicEmail: { type: String, default: 'clinic@doctorg.com' },
}, { timestamps: true });

export default mongoose.model('ClinicInfo', clinicInfoSchema);