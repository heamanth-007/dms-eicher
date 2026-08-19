import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema({
  invoiceNo: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  vehicleModel: { type: String, required: true },
  status: { type: String, required: true, enum: ['DELIVERED', 'PENDING', 'CANCELLED'] },
  grandTotal: { type: String, required: true },
  advancePaid: { type: String, default: '₹0' },
  balanceAmount: { type: String, default: '₹0' },
  customerPhone: { type: String },
  customerDistrict: { type: String },
  customerEmail: { type: String },
  baseVehiclePrice: { type: Number, default: 0 },
  accessoriesCharge: { type: Number, default: 0 },
  insuranceAmount: { type: Number, default: 0 },
  subTotal: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  taxableValue: { type: Number, default: 0 },
  gstRate: { type: Number, default: 18 },
  gstAmount: { type: Number, default: 0 },
  insuranceProvider: { type: String },
  policyNumber: { type: String },
  seatCovers: { type: Boolean, default: false },
  gpsTracker: { type: Boolean, default: false },
  warranty: { type: Boolean, default: false },
  deliveryLocation: { type: String },
  internalNotes: { type: String },
  paymentMode: { type: String },
  financeProvider: { type: String },
  accessoriesKit: { type: Array, default: [] },
  accessoriesTotal: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Sale', saleSchema);
