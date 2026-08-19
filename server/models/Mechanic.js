import mongoose from 'mongoose';

const mechanicSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  initials: { type: String, required: true },
  avatarBg: { type: String, required: true },
  experience: { type: String, required: true },
  email: { type: String, required: false },
  specialization: { type: String, required: false },
  annualSalary: { type: String, required: false },
  joiningDate: { type: String, required: false },
  photo: { type: String, required: false },
  status: { type: String, required: true, enum: ['Available', 'Busy', 'Inactive'] },
  jobs: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model('Mechanic', mechanicSchema);
