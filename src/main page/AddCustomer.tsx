import React, { useState, useEffect } from 'react';
import { 
  User, 
  MapPin, 
  Truck, 
  Clock, 
  Wallet, 
  Lock, 
  Calendar,
  Save 
} from 'lucide-react';

interface AddCustomerProps {
  onBack: () => void;
  onSave: () => void;
  onSaveAndAddVehicle?: () => void;
}

export const AddCustomer: React.FC<AddCustomerProps> = ({ onBack, onSave }) => {
  // Generate a random Customer ID on mount
  const [customerId, setCustomerId] = useState('');
  useEffect(() => {
    setCustomerId(`#CUST-${Math.floor(1000 + Math.random() * 9000)}`);
  }, []);

  // Section 1: Customer Identity
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');

  // Section 2: Address Information
  const [streetAddress, setStreetAddress] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  // Section 3: Vehicle Details
  const [vehicleDistrict, setVehicleDistrict] = useState('');
  const [vehicleState, setVehicleState] = useState('');
  const [numVehicles, setNumVehicles] = useState('0');

  // Section 4: Service History
  const [lastServiceDate, setLastServiceDate] = useState('');
  const [serviceFrequency, setServiceFrequency] = useState('Weekly');

  // Section 5: Financial Summary
  const [outstandingAmount, setOutstandingAmount] = useState('0.00');
  const [accountStatus, setAccountStatus] = useState(true);

  const [saving, setSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phoneNumber) {
      alert('Please fill out the required fields (Full Name and Phone Number).');
      return;
    }

    setSaving(true);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const formattedOutstanding = `₹${parseFloat(outstandingAmount || '0').toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;

    const formattedDate = lastServiceDate
      ? new Date(lastServiceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const newCustomer = {
      id: customerId,
      name: fullName,
      avatar: fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      avatarBg: 'bg-blue-100 text-blue-600',
      phone: phoneNumber,
      district: district || 'Main District',
      vehicles: parseInt(numVehicles) || 0,
      lastService: formattedDate,
      outstanding: formattedOutstanding,
      status: accountStatus ? 'ACTIVE' : 'INACTIVE'
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
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  placeholder="+91 XXXXX XXXXX"
                  className="border border-slate-200 rounded-md py-2 px-3 text-xs outline-none bg-slate-50 focus:border-blue-400 focus:bg-white transition-all font-medium text-slate-700 placeholder-slate-400"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Alternate Phone Number</label>
                <input 
                  type="text" 
                  value={alternatePhone}
                  onChange={(e) => setAlternatePhone(e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
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
                  value={aadhaarNumber}
                  onChange={(e) => setAadhaarNumber(e.target.value)}
                  placeholder="0000 0000 0000"
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
                <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">District</label>
                <input 
                  type="text" 
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="District"
                  className="border border-slate-200 rounded-md py-2 px-3 text-xs outline-none bg-slate-50 focus:border-blue-400 focus:bg-white transition-all font-medium text-slate-700 placeholder-slate-400"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">State</label>
                <select 
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="border border-slate-200 rounded-md py-2 px-3 text-xs outline-none bg-slate-50 focus:border-blue-400 focus:bg-white transition-all font-semibold text-slate-700 w-full"
                >
                  <option value="">Select State</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Pincode</label>
                <input 
                  type="text" 
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="400001"
                  className="border border-slate-200 rounded-md py-2 px-3 text-xs outline-none bg-slate-50 focus:border-blue-400 focus:bg-white transition-all font-medium text-slate-700 placeholder-slate-400"
                />
              </div>

            </div>
          </div>

          {/* SECTION 3: Vehicle Details */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <Truck size={16} className="text-blue-600" />
              <h3 className="text-[12px] font-extrabold text-slate-800 m-0 uppercase tracking-wider font-heading">Vehicle Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs font-semibold text-slate-500">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">District/Region</label>
                <select 
                  value={vehicleDistrict}
                  onChange={(e) => setVehicleDistrict(e.target.value)}
                  className="border border-slate-200 rounded-md py-2 px-3 text-xs outline-none bg-slate-50 focus:border-blue-400 focus:bg-white transition-all font-semibold text-slate-700 w-full"
                >
                  <option value="">Select District</option>
                  <option value="Central Valley">Central Valley</option>
                  <option value="Northern Hills">Northern Hills</option>
                  <option value="Coastal Plains">Coastal Plains</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">State</label>
                <select 
                  value={vehicleState}
                  onChange={(e) => setVehicleState(e.target.value)}
                  className="border border-slate-200 rounded-md py-2 px-3 text-xs outline-none bg-slate-50 focus:border-blue-400 focus:bg-white transition-all font-semibold text-slate-700 w-full"
                >
                  <option value="">Select State</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Number of Vehicles</label>
                <input 
                  type="number" 
                  value={numVehicles}
                  onChange={(e) => setNumVehicles(e.target.value)}
                  placeholder="0"
                  min="0"
                  className="border border-slate-200 rounded-md py-2 px-3 text-xs outline-none bg-slate-50 focus:border-blue-400 focus:bg-white transition-all font-medium text-slate-700 placeholder-slate-400"
                />
              </div>

            </div>
          </div>

          {/* SECTION 4: Service History */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <Clock size={16} className="text-blue-600" />
              <h3 className="text-[12px] font-extrabold text-slate-800 m-0 uppercase tracking-wider font-heading">Service History</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-semibold text-slate-500">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Last Service Date</label>
                <div className="relative flex items-center">
                  <input 
                    type="date" 
                    value={lastServiceDate}
                    onChange={(e) => setLastServiceDate(e.target.value)}
                    className="border border-slate-200 rounded-md py-2 pl-10 pr-3 text-xs outline-none bg-slate-50 focus:border-blue-400 focus:bg-white transition-all font-medium text-slate-700 w-full"
                  />
                  <Calendar size={13} className="absolute left-3.5 text-slate-450" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Service Frequency</label>
                <select 
                  value={serviceFrequency}
                  onChange={(e) => setServiceFrequency(e.target.value)}
                  className="border border-slate-200 rounded-md py-2 px-3 text-xs outline-none bg-slate-50 focus:border-blue-400 focus:bg-white transition-all font-semibold text-slate-700 w-full"
                >
                  <option value="Weekly">Weekly</option>
                  <option value="Bi-Weekly">Bi-Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                </select>
              </div>

            </div>
          </div>

          {/* SECTION 5: Financial Summary */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <Wallet size={16} className="text-blue-600" />
              <h3 className="text-[12px] font-extrabold text-slate-800 m-0 uppercase tracking-wider font-heading">Financial Summary</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-semibold text-slate-500">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Outstanding Amount</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-xs text-slate-400 font-bold">₹</span>
                  <input 
                    type="text" 
                    value={outstandingAmount}
                    onChange={(e) => setOutstandingAmount(e.target.value)}
                    placeholder="0.00"
                    className="border border-slate-200 rounded-md py-2 pl-8 pr-3 text-xs outline-none bg-slate-50 focus:border-blue-400 focus:bg-white transition-all font-medium text-slate-700 w-full"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 justify-center">
                <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1">Account Status</label>
                <div className="flex items-center mt-1">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={accountStatus} 
                      onChange={(e) => setAccountStatus(e.target.checked)} 
                      className="sr-only peer" 
                    />
                    <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
                    <span className="ml-3 text-[11px] font-bold text-slate-650">Active Account</span>
                  </label>
                </div>
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
