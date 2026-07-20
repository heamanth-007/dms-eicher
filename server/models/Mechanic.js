import mongoose from 'mongoose';

const mechanicSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  initials: { type: String, required: true },
  avatarBg: { type: String, required: true },
  experience: { type: String, required: true },
  status: { type: String, required: true, enum: ['Available', 'Busy', 'Inactive'] },
  jobs: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model('Mechanic', mechanicSchema);
