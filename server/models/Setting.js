import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema({
  companyName: { type: String, default: 'AutoPro Elite Motors' },
  dealerName: { type: String, default: 'Alexander Sterling' },
  gstNumber: { type: String, default: '22AAAAA0000A1Z5' },
  panNumber: { type: String, default: 'ABCDE1234F' },
  streetAddress: { type: String, default: 'Industrial Park West, Sector 12, Block C' },
  city: { type: String, default: 'Automotive City' },
  stateName: { type: String, default: 'California' },
  pinCode: { type: String, default: '90210' },
  mobileNumber: { type: String, default: '+1 (555) 012-3456' },
  phoneNum: { type: String, default: '+1 (555) 987-6543' },
  emailAddress: { type: String, default: 'contact@autopro-elite.com' },
  websiteUrl: { type: String, default: 'www.autopro-elite.com' },
  logoUrl: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('Setting', settingSchema);
