import mongoose from 'mongoose';

const partSchema = new mongoose.Schema({
  partNumber: { type: String, required: true, unique: true },
  partName: { type: String, required: true },
  category: { type: String, required: true },
  brand: { type: String, required: true },
  hsnCode: { type: String, required: true },
  gstPercent: { type: String, required: true },
  purchasePrice: { type: String, required: true },
  salePrice: { type: String, required: true },
  stock: { type: String, required: true },
  stockStatus: { type: String, required: true, enum: ['normal', 'low', 'out'] }
}, { timestamps: true });

export default mongoose.model('Part', partSchema);
