import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  modelName: { type: String, required: true },
  type: { type: String, required: true },
  condition: { type: String, required: true },
  engineNo: { type: String, required: true },
  chassisNo: { type: String, required: true },
  colorName: { type: String, required: true },
  colorHex: { type: String, required: true },
  price: { type: Number, required: true },
  sellPrice: { type: Number, required: true },
  status: { type: String, required: true },
  stock: { type: Number, default: 0 },
  imageUrl: { type: String, required: true },
  accessoriesKit: { type: Array, default: [] },
  accessoriesTotal: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Vehicle', vehicleSchema);
