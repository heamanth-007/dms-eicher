import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  avatar: { type: String, required: true },
  avatarBg: { type: String, required: true },
  phone: { type: String, required: true },
  district: { type: String, required: true },
  vehicles: { type: Number, required: true },
  lastService: { type: String, required: true },
  outstanding: { type: String, required: true },
  status: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('Customer', customerSchema);
