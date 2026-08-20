import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  avatar: { type: String },
  avatarBg: { type: String },
  phone: { type: String, required: true },
  alternatePhone: { type: String, default: '' },
  email: { type: String, default: '' },
  emailAddress: { type: String, default: '' },
  aadhaarNumber: { type: String, default: '' },
  streetAddress: { type: String, default: '' },
  address: { type: String, default: '' },
  state: { type: String, default: '' },
  district: { type: String, default: '' },
  pincode: { type: String, default: '' },
  vehicles: { type: Number, default: 0 },
  lastService: { type: String, default: '' },
  outstanding: { type: String, default: '₹0.00' },
  status: { type: String, default: 'ACTIVE' }
}, { timestamps: true, strict: false });

export default mongoose.model('Customer', customerSchema);
