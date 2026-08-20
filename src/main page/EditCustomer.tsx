import React, { useState } from 'react';
import { INDIAN_STATES_DISTRICTS, getDistrictsForState, formatPhone10Digits } from '../utils/indianStatesDistricts';
import { 
  ArrowLeft, 
  User, 
  MapPin
} from 'lucide-react';

interface CustomerType {
  id: string;
  name: string;
  avatar: string;
  avatarBg: string;
  phone: string;
  district: string;
  vehicles: number;
  lastService: string;
  outstanding: string;
  status: string;
}

interface EditCustomerProps {
  customer: CustomerType;
  onBack: () => void;
  onSave: (updatedCustomer: CustomerType) => void;
}

export const EditCustomer: React.FC<EditCustomerProps> = ({ customer, onBack, onSave }) => {
  // Input fields mapping customer details
  const [fullName, setFullName] = useState(customer.name);
  const [phoneCode, setPhoneCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState(
    customer.phone.replace(/^\+91\s*|^\+1\s*|^\+\d+\s*/g, '').replace(/[^\d]/g, '') || '9876543210'
  );
  const [emailAddress, setEmailAddress] = useState('');
  const [customerType, setCustomerType] = useState('Commercial Contractor');

  // Address states
  const [streetAddress, setStreetAddress] = useState('');
  const [state, setState] = useState('Tamil Nadu');
  const [district, setDistrict] = useState(customer.district || INDIAN_STATES_DISTRICTS[0].districts[0]);
  const [pincode, setPincode] = useState('');
  const [landmark, setLandmark] = useState('');

  const lifecycleState = customer.status || 'ACTIVE';

  const [saving, setSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const updatedPhone = `${phoneCode} ${phoneNumber}`;

    const updatedCustomer = {
      ...customer,
      name: fullName,
      phone: updatedPhone,
      email: emailAddress,
      emailAddress: emailAddress,
      streetAddress: streetAddress,
      address: streetAddress,
      state: state,
      district: district,
      pincode: pincode,
      status: lifecycleState
    };

    // Update local storage
    const local = localStorage.getItem('dms_customers');
    if (local) {
      try {
        const localList = JSON.parse(local);
        const index = localList.findIndex((c: any) => c.id === customer.id);
        if (index !== -1) {
          localList[index] = updatedCustomer;
          localStorage.setItem('dms_customers', JSON.stringify(localList));
        }
      } catch (err) {
        console.error('Error updating local customer:', err);
      }
    }

    fetch(`${API_URL}/api/customers/${encodeURIComponent(customer.id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedCustomer)
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to update customer');
        return res.json();
      })
      .then((data) => {
        setSaving(false);
        onSave(data);
      })
      .catch((err) => {
        setSaving(false);
        console.error('Error saving customer details:', err);
        // Fallback save in state for offline resilience
        onSave(updatedCustomer);
      });
  };


  return (
    <div className="p-8 bg-[#f6f8fc] min-h-[calc(100vh-70px)] flex flex-col gap-6 box-border font-sans text-slate-700 text-left">
      
      {/* Back Button and Subtitle Row */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <span 
            className="flex items-center gap-1.5 text-[12px] font-semibold text-blue-600 hover:text-blue-800 cursor-pointer mb-2 transition-colors"
            onClick={onBack}
          >
            <ArrowLeft size={13} /> Back to Customers
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 m-0 tracking-tight font-heading">
            Edit Customer
          </h1>
          <p className="text-[12.5px] text-slate-500 m-0 mt-1 font-medium">
            Modify details for {customer.name} • Customer ID: {customer.id}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={onBack}
            className="bg-white border border-slate-200 hover:bg-slate-50 font-bold text-xs py-2.5 px-5 rounded-md cursor-pointer text-slate-600 transition-colors shadow-xs"
          >
            Discard Changes
          </button>
          
          <button 
            onClick={handleSubmit}
            disabled={saving}
            className="bg-[#184edb] hover:bg-blue-800 text-white font-bold text-xs py-2.5 px-6 border-none rounded-md cursor-pointer transition-colors shadow-md disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Customer'}
          </button>
        </div>
      </div>

      {/* Main Single Column Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-4xl w-full">
        
        <div className="flex flex-col gap-6">
          
          {/* Card 1: General Info */}
          <div className="bg-white rounded-xl border border-[#eef2f6] shadow-sm p-6 flex flex-col gap-5">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                <User size={18} />
              </div>
              <h3 className="text-[13.5px] font-bold text-slate-800 m-0 uppercase tracking-wider font-heading">General Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-500">
              
              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Full Name</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Rajesh Kumar"
                  className="border border-slate-200 rounded-md py-2 px-3 text-xs outline-none bg-slate-50 focus:border-blue-400 focus:bg-white transition-all font-medium text-slate-700"
                />
              </div>

              {/* Phone Number */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Phone Number</label>
                <div className="flex gap-2">
                  <select 
                    value={phoneCode}
                    onChange={(e) => setPhoneCode(e.target.value)}
                    className="border border-slate-200 rounded-md py-2 px-2 text-xs outline-none bg-slate-50 focus:border-blue-400 focus:bg-white transition-all font-medium text-slate-700 w-16"
                  >
                    <option value="+91">+91</option>
                    <option value="+1">+1</option>
                    <option value="+44">+44</option>
                  </select>
                  <input 
                    type="text" 
                    maxLength={10}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(formatPhone10Digits(e.target.value))}
                    required
                    placeholder="9876543210"
                    className="flex-1 border border-slate-200 rounded-md py-2 px-3 text-xs outline-none bg-slate-50 focus:border-blue-400 focus:bg-white transition-all font-medium text-slate-700"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Email Address</label>
                <input 
                  type="email" 
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  required
                  placeholder="rajesh.kumar_agri@example.com"
                  className="border border-slate-200 rounded-md py-2 px-3 text-xs outline-none bg-slate-50 focus:border-blue-400 focus:bg-white transition-all font-medium text-slate-700"
                />
              </div>

              {/* Customer Type */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Customer Type</label>
                <select 
                  value={customerType}
                  onChange={(e) => setCustomerType(e.target.value)}
                  className="border border-slate-200 rounded-md py-2 px-3 text-xs outline-none bg-slate-50 focus:border-blue-400 focus:bg-white transition-all font-medium text-slate-700 w-full"
                >
                  <option value="Commercial Contractor">Commercial Contractor</option>
                  <option value="Owner-Operator">Owner-Operator</option>
                  <option value="Fleet Manager">Fleet Manager</option>
                  <option value="Agricultural Enterprise">Agricultural Enterprise</option>
                </select>
              </div>

            </div>
          </div>

          {/* Card 2: Location & Address */}
          <div className="bg-white rounded-xl border border-[#eef2f6] shadow-sm p-6 flex flex-col gap-5">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                <MapPin size={18} />
              </div>
              <h3 className="text-[13.5px] font-bold text-slate-800 m-0 uppercase tracking-wider font-heading">Location & Address</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-500">
              
              {/* Street Address */}
              <div className="flex flex-col gap-1.5 col-span-1 md:col-span-2">
                <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Street Address</label>
                <input 
                  type="text" 
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  required
                  placeholder="Plot No. 42, Sitapura Industrial Area, Phase II"
                  className="border border-slate-200 rounded-md py-2 px-3 text-xs outline-none bg-slate-50 focus:border-blue-400 focus:bg-white transition-all font-medium text-slate-700"
                />
              </div>

              {/* State */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">State</label>
                <select 
                  value={state}
                  onChange={(e) => {
                    const selState = e.target.value;
                    setState(selState);
                    const dists = getDistrictsForState(selState);
                    setDistrict(dists[0] || '');
                  }}
                  className="border border-slate-200 rounded-md py-2 px-3 text-xs outline-none bg-slate-50 focus:border-blue-400 focus:bg-white transition-all font-semibold text-slate-700 w-full cursor-pointer"
                >
                  {INDIAN_STATES_DISTRICTS.map(st => (
                    <option key={st.state} value={st.state}>{st.state}</option>
                  ))}
                </select>
              </div>

              {/* District */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">District</label>
                <select 
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="border border-slate-200 rounded-md py-2 px-3 text-xs outline-none bg-slate-50 focus:border-blue-400 focus:bg-white transition-all font-semibold text-slate-700 w-full cursor-pointer"
                >
                  {getDistrictsForState(state).map(dist => (
                    <option key={dist} value={dist}>{dist}</option>
                  ))}
                </select>
              </div>

              {/* Pincode */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Pincode</label>
                <input 
                  type="text" 
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  required
                  placeholder="6-digit Pincode"
                  className="border border-slate-200 rounded-md py-2 px-3 text-xs outline-none bg-slate-50 focus:border-blue-400 focus:bg-white transition-all font-medium text-slate-700"
                />
              </div>

              {/* Landmark */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Landmark (Optional)</label>
                <input 
                  type="text" 
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="Near RIICO Office"
                  className="border border-slate-200 rounded-md py-2 px-3 text-xs outline-none bg-slate-50 focus:border-blue-400 focus:bg-white transition-all font-medium text-slate-700"
                />
              </div>

            </div>
          </div>

        </div>
      </form>

    </div>
  );
};

export default EditCustomer;
