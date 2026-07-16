import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  refId: { type: String, required: true, unique: true },
  payeeName: { type: String, required: true },
  method: { type: String, required: true },
  vehicleJob: { type: String, required: true },
  date: { type: String, required: true },
  amount: { type: String, required: true },
  status: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('Transaction', transactionSchema);
