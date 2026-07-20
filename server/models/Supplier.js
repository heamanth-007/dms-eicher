import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  gstNumber: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  outstanding: { type: String, required: true },
  isOutstandingPositive: { type: Boolean, required: true },
  status: { type: String, required: true, enum: ['ACTIVE', 'INACTIVE'] }
}, { timestamps: true });

export default mongoose.model('Supplier', supplierSchema);
