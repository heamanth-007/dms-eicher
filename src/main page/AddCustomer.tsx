import React, { useState, useEffect } from 'react';
import { INDIAN_STATES_DISTRICTS, getDistrictsForState, formatPhone10Digits } from '../utils/indianStatesDistricts';
import { 
  User, 
  MapPin, 
  Lock, 
  Save 
} from 'lucide-react';

interface AddCustomerProps {
  customers: any[];
  onBack: () => void;
  onSave: () => void;
  onSaveAndAddVehicle?: () => void;
}

export const AddCustomer: React.FC<AddCustomerProps> = ({ customers = [], onBack, onSave }) => {
  const [customerId, setCustomerId] = useState('');
  
  useEffect(() => {
    let maxIdNum = 3010;
    if (customers && customers.length > 0) {
      customers.forEach(c => {
        if (c.id) {
          const match = c.id.match(/#?CUST-(3\d{3})/i);
          if (match) {
            const num = parseInt(match[1], 10);
            if (!isNaN(num) && num >= 3011 && num < 4000) {
              if (num > maxIdNum) maxIdNum = num;
            }
          }
        }
      });
    }
    setCustomerId(`#CUST-${maxIdNum + 1}`);
  }, [customers]);

  // Section 1: Customer Identity
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');

  // Section 2: Address Information
  const [streetAddress, setStreetAddress] = useState('');
  const [state, setState] = useState('Tamil Nadu');
  const [district, setDistrict] = useState(INDIAN_STATES_DISTRICTS[0].districts[0]);
  const [pincode, setPincode] = useState('');


  const [saving, setSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phoneNumber) {
      alert('Please fill out the required fields (Full Name and Phone Number).');
      return;
    }

    setSaving(true);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const newCustomer = {
      id: customerId,
      name: fullName,
      avatar: fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      avatarBg: 'bg-blue-100 text-blue-600',
      phone: phoneNumber,
      district: district || 'Main District',
      vehicles: 0,
      lastService: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      outstanding: '₹0.00',
      status: 'ACTIVE'
    };

    // Update local storage first to guarantee instant visibility
    const local = localStorage.getItem('dms_customers');
    let localList = [];
    if (local) {
      try {
        localList = JSON.parse(local);
      } catch (err) {
        console.error('Error parsing local list:', err);
      }
    }
    localList.push(newCustomer);
    localStorage.setItem('dms_customers', JSON.stringify(localList));

    fetch(`${API_URL}/api/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCustomer)
    })
      .then(() => {
        setSaving(false);
        onSave();
      })
      .catch((err) => {
        setSaving(false);
        console.error('Error saving new customer:', err);
        // Offline resilience fallback
        onSave();
      });
  };

  return (
    <div className="p-8 bg-[#f6f8fc] min-h-[calc(100vh-70px)] flex flex-col gap-6 box-border font-sans text-slate-700 text-left">
      
      {/* Header and Breadcrumbs */}
      <div>
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          <span className="cursor-pointer hover:text-slate-600" onClick={onBack}>Management</span>
          <span>&gt;</span>
          <span className="cursor-pointer hover:text-slate-600" onClick={onBack}>Customers</span>
          <span>&gt;</span>
          <span className="text-slate-600 font-bold">Add Customer</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 m-0 mt-1.5 tracking-tight font-heading">
          Add New Customer
        </h1>
      </div>

      {/* Main Single Form Container Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[#eef2f6] shadow-sm overflow-hidden flex flex-col w-full">
        
        <div className="p-8 flex flex-col gap-8">
          
          {/* SECTION 1: Customer Identity */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <User size={16} className="text-blue-600" />
              <h3 className="text-[12px] font-extrabold text-slate-800 m-0 uppercase tracking-wider font-heading">Customer Identity</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-semibold text-slate-500">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Full Name / Business Name*</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Enter full name"
                  className="border border-slate-200 rounded-md py-2 px-3 text-xs outline-none bg-slate-50 focus:border-blue-400 focus:bg-white transition-all font-medium text-slate-700 placeholder-slate-400"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Customer ID</label>
                <div className="relative flex items-center">
                  <input 
                    type="text" 
                    value={customerId}
                    disabled
                    className="border border-slate-200 rounded-md py-2 pl-3 pr-10 text-xs outline-none bg-slate-100 font-mono font-medium text-slate-500 w-full"
                  />
                  <Lock size={12} className="absolute right-3 text-slate-450" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Phone Number*</label>
                <input 
                  type="text" 
                  maxLength={10}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(formatPhone10Digits(e.target.value))}
                  required
                  placeholder="10-digit mobile number"
                  className="border border-slate-200 rounded-md py-2 px-3 text-xs outline-none bg-slate-50 focus:border-blue-400 focus:bg-white transition-all font-medium text-slate-700 placeholder-slate-400"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Alternate Phone Number</label>
                <input 
                  type="text" 
                  maxLength={10}
                  value={alternatePhone}
                  onChange={(e) => setAlternatePhone(formatPhone10Digits(e.target.value))}
                  placeholder="10-digit mobile number"
                  className="border border-slate-200 rounded-md py-2 px-3 text-xs outline-none bg-slate-50 focus:border-blue-400 focus:bg-white transition-all font-medium text-slate-700 placeholder-slate-400"
                />
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Email Address</label>
                <input 
                  type="email" 
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  placeholder="customer@example.com"
                  className="border border-slate-200 rounded-md py-2 px-3 text-xs outline-none bg-slate-50 focus:border-blue-400 focus:bg-white transition-all font-medium text-slate-700 placeholder-slate-400"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">GST Number</label>
                <input 
                  type="text" 
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  placeholder="22AAAAA0000A1Z5"
                  className="border border-slate-200 rounded-md py-2 px-3 text-xs outline-none bg-slate-50 focus:border-blue-400 focus:bg-white transition-all font-medium text-slate-700 placeholder-slate-400 font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Aadhaar Number (Optional)</label>
                <input 
                  type="text" 
                  maxLength={12}
                  value={aadhaarNumber}
                  onChange={(e) => setAadhaarNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 12))}
                  placeholder="12-digit Aadhaar number"
                  className="border border-slate-200 rounded-md py-2 px-3 text-xs outline-none bg-slate-50 focus:border-blue-400 focus:bg-white transition-all font-medium text-slate-700 placeholder-slate-400 font-mono"
                />
              </div>

            </div>
          </div>

          {/* SECTION 2: Address Information */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <MapPin size={16} className="text-blue-600" />
              <h3 className="text-[12px] font-extrabold text-slate-800 m-0 uppercase tracking-wider font-heading">Address Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs font-semibold text-slate-500">
              
              <div className="flex flex-col gap-1.5 md:col-span-3">
                <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Full Street Address</label>
                <textarea 
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="Flat/House No., Building Name, Street"
                  rows={3}
                  className="border border-slate-200 rounded-md py-2 px-3 text-xs outline-none bg-slate-50 focus:border-blue-400 focus:bg-white transition-all font-medium text-slate-700 placeholder-slate-400 resize-none"
                />
              </div>

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

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Pincode</label>
                <input 
                  type="text" 
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  placeholder="6-digit Pincode"
                  className="border border-slate-200 rounded-md py-2 px-3 text-xs outline-none bg-slate-50 focus:border-blue-400 focus:bg-white transition-all font-medium text-slate-700 placeholder-slate-400"
                />
              </div>

            </div>
          </div>



        </div>

        {/* Bottom Action bar with light grey background bar matching mockup */}
        <div className="bg-slate-50 border-t border-slate-100 p-4 px-8 flex items-center justify-end gap-3.5">
          <button 
            type="button"
            onClick={onBack}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs py-2 px-5 rounded-md cursor-pointer transition-colors shadow-xs"
          >
            Cancel
          </button>
          
          <button 
            type="submit"
            disabled={saving}
            className="bg-[#184edb] hover:bg-blue-800 text-white font-bold text-xs py-2 px-5 border-none rounded-md cursor-pointer transition-colors shadow-md flex items-center gap-1.5 disabled:opacity-50"
          >
            <Save size={13} /> {saving ? 'Saving...' : 'Save Customer'}
          </button>
        </div>

      </form>

    </div>
  );
};

export default AddCustomer;
