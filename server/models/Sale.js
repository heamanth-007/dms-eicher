import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema({
  invoiceNo: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  vehicleModel: { type: String, required: true },
  status: { type: String, required: true, enum: ['DELIVERED', 'PENDING', 'CANCELLED'] },
  grandTotal: { type: String, required: true },
  district: { type: String, required: true },
  deliveryDate: { type: String, required: true },
  salesExecutive: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('Sale', saleSchema);
