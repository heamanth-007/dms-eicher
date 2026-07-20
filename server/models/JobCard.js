import mongoose from 'mongoose';

const jobCardSchema = new mongoose.Schema({
  jcNumber: { type: String, required: true, unique: true },
  inTime: { type: String, required: true },
  customerName: { type: String, required: true },
  vehicleModel: { type: String, required: true },
  vehicleReg: { type: String, required: true },
  complaintSummary: { type: String, required: true },
  mechanicName: { type: String, required: true },
  mechanicInitials: { type: String, required: true },
  status: { type: String, required: true, enum: ['WORKING', 'WAITING PARTS', 'ASSIGNED', 'COMPLETED'] },
  expectedDelivery: { type: String, required: true },
  isDelayed: { type: Boolean, default: false },
  readyForPickup: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('JobCard', jobCardSchema);
