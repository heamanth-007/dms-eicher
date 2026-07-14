import React, { useState } from 'react';
import { 
  ArrowLeft, 
  User, 
  MapPin, 
  Laptop, 
  Pencil, 
  Plus 
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
  const [emailAddress, setEmailAddress] = useState(
    customer.id === 'CUST-1024' ? 'rajesh.kumar_agri@example.com' : `${customer.name.toLowerCase().replace(/\s+/g, '_')}@example.com`
  );
  const [customerType, setCustomerType] = useState('Commercial Contractor');

  // Address states
  const [streetAddress, setStreetAddress] = useState(
    customer.id === 'CUST-1024' 
      ? 'Plot No. 42, Sitapura Industrial Area, Phase II' 
      : '102 Main Street, Industrial Zone'
  );
  const [district, setDistrict] = useState(customer.district || 'Jaipur');
  const [state, setState] = useState(customer.id === 'CUST-1024' ? 'Rajasthan' : 'Maharashtra');
  const [pincode, setPincode] = useState(customer.id === 'CUST-1024' ? '302022' : '411026');
  const [landmark, setLandmark] = useState('Near RIICO Office');

  // Account states
  const lifecycleState = customer.status || 'ACTIVE';
  const [creditLimit, setCreditLimit] = useState('25,00,000');
  const dealerNotes = customer.id === 'CUST-1024'
    ? 'Frequent customer in the Jaipur industrial hub. Prefers weekend deliveries. Interested in upgrading fleet to ProSeries next quarter.'
    : 'Prefers digital invoicing. Quick responder for maintenance updates.';

  // Equipment lists matching the screen
  const [equipmentList, setEquipmentList] = useState([
    { model: 'TerraX 500', category: 'Excavator', serial: 'TX500-2023-A98', lastService: 'Jan 12, 2024', status: 'IN STOCK', statusClass: 'bg-emerald-50 text-emerald-600 border border-emerald-100' },
    { model: 'ProHaul 20T', category: 'Trailer', serial: 'PH20T-99011-Z', lastService: 'Nov 05, 2023', status: 'RESERVED', statusClass: 'bg-amber-50 text-amber-600 border border-amber-100' }
  ]);

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
      district: district,
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

    fetch(`${API_URL}/api/customers/${customer.id}`, {
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

  const handleAddMachine = () => {
    const newMachine = {
      model: 'Eicher Skyline 20.15',
      category: 'Hauler',
      serial: `SKY-${Math.floor(1000 + Math.random() * 9000)}-Z`,
      lastService: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'IN STOCK',
      statusClass: 'bg-emerald-50 text-emerald-600 border border-emerald-100'
    };
    setEquipmentList([...equipmentList, newMachine]);
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

      {/* Main Two Column Form Grid */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start w-full">
        
        {/* Left Column (Forms & Equipment) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
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
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
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

              {/* District */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">District</label>
                <input 
                  type="text" 
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  required
                  placeholder="Jaipur"
                  className="border border-slate-200 rounded-md py-2 px-3 text-xs outline-none bg-slate-50 focus:border-blue-400 focus:bg-white transition-all font-medium text-slate-700"
                />
              </div>

              {/* State */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">State</label>
                <select 
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="border border-slate-200 rounded-md py-2 px-3 text-xs outline-none bg-slate-50 focus:border-blue-400 focus:bg-white transition-all font-medium text-slate-700 w-full"
                >
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="California">California</option>
                  <option value="Texas">Texas</option>
                  <option value="New York">New York</option>
                </select>
              </div>

              {/* Pincode */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Pincode</label>
                <input 
                  type="text" 
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  required
                  placeholder="302022"
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

          {/* Card 3: Registered Equipment */}
          <div className="bg-white rounded-xl border border-[#eef2f6] shadow-sm p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                  <Laptop size={18} />
                </div>
                <h3 className="text-[13.5px] font-bold text-slate-800 m-0 uppercase tracking-wider font-heading">Registered Equipment</h3>
              </div>
              <button 
                type="button"
                onClick={handleAddMachine}
                className="bg-transparent border-none text-[#184edb] hover:text-blue-800 font-bold text-xs cursor-pointer flex items-center gap-1"
              >
                <Plus size={14} /> Add Machine
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto w-full">
              <table className="w-full border-collapse text-left text-[12px]">
                <thead>
                  <tr className="bg-slate-50/30 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-4 border-b border-slate-100">Model</th>
                    <th className="py-2.5 px-4 border-b border-slate-100">Serial Number</th>
                    <th className="py-2.5 px-4 border-b border-slate-100">Last Service</th>
                    <th className="py-2.5 px-4 border-b border-slate-100">Status</th>
                    <th className="py-2.5 px-4 border-b border-slate-100 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {equipmentList.map((eq, i) => (
                    <tr key={i} className="hover:bg-slate-50/20 text-slate-700 font-medium">
                      <td className="py-3 px-4 border-b border-slate-100">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">{eq.model}</span>
                          <span className="text-[10px] text-slate-400">{eq.category}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 border-b border-slate-100 font-mono text-[11px] text-slate-500">{eq.serial}</td>
                      <td className="py-3 px-4 border-b border-slate-100 text-slate-500">{eq.lastService}</td>
                      <td className="py-3 px-4 border-b border-slate-100">
                        <span className={`inline-block px-2 py-0.5 rounded text-[9.5px] font-bold ${eq.statusClass}`}>
                          {eq.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 border-b border-slate-100 text-right">
                        <button type="button" className="bg-transparent border-none text-slate-400 hover:text-slate-600 cursor-pointer">
                          <Pencil size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

        </div>

        {/* Right Column (Side status and timeline) */}
        <div className="flex flex-col gap-6">
          
          {/* Card 1: Account Status */}
          <div className="bg-white rounded-xl border border-[#eef2f6] shadow-sm p-6 flex flex-col gap-5">
            <h3 className="text-[13.5px] font-bold text-slate-800 m-0 uppercase tracking-wider font-heading">Account Status</h3>
            
            {/* Lifecycle state indicator */}
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Lifecycle State</span>
              <span className="bg-blue-600 text-white text-[9.5px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider">
                {lifecycleState}
              </span>
            </div>

            {/* Sales Rep */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Assigned Sales Rep</label>
              <div className="flex items-center gap-3 border border-slate-200 rounded-lg p-3">
                <img 
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100" 
                  alt="Sales Rep" 
                  className="w-9 h-9 rounded-full object-cover border border-slate-100"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800">Priya Varma</span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">Key Account Executive</span>
                </div>
              </div>
            </div>

            {/* Credit Limit */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Credit Limit (INR)</label>
              <input 
                type="text" 
                value={creditLimit}
                onChange={(e) => setCreditLimit(e.target.value)}
                className="border border-slate-200 rounded-md py-2 px-3 text-xs outline-none bg-slate-50 focus:border-blue-400 focus:bg-white transition-all font-semibold text-slate-700"
              />
            </div>
          </div>

          {/* Card 2: Recent Activity */}
          <div className="bg-white rounded-xl border border-[#eef2f6] shadow-sm p-6 flex flex-col gap-5 text-left text-xs">
            <h3 className="text-[13.5px] font-bold text-slate-800 m-0 uppercase tracking-wider font-heading">Recent Activity</h3>
            
            {/* Timeline */}
            <div className="flex flex-col gap-5 relative pl-4 border-l border-slate-100 ml-1">
              
              {/* Event 1 */}
              <div className="relative">
                <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-600 border-2 border-white ring-4 ring-blue-50" />
                <div className="flex flex-col">
                  <span className="font-bold text-slate-800">Equipment Purchased</span>
                  <span className="text-[10px] text-slate-400 mt-0.5 font-medium">2 days ago • TerraX 500</span>
                </div>
              </div>

              {/* Event 2 */}
              <div className="relative">
                <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-white border-2 border-blue-600" />
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-700">Inquiry Closed</span>
                  <span className="text-[10px] text-slate-400 mt-0.5 font-medium">1 week ago • Spare parts catalog</span>
                </div>
              </div>

              {/* Event 3 */}
              <div className="relative">
                <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-white border-2 border-blue-600" />
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-700">Profile Created</span>
                  <span className="text-[10px] text-slate-400 mt-0.5 font-medium">Jan 10, 2024 • Admin Entry</span>
                </div>
              </div>

            </div>

            <button type="button" className="bg-transparent border-none text-[#184edb] hover:text-blue-800 font-bold text-xs cursor-pointer text-center mt-2">
              View All Logs
            </button>
          </div>

          {/* Card 3: Dealer Notes */}
          <div className="bg-white rounded-xl border border-[#eef2f6] shadow-sm p-6 flex flex-col gap-3">
            <h3 className="text-[13.5px] font-bold text-slate-800 m-0 uppercase tracking-wider font-heading">Dealer Notes</h3>
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 text-xs italic text-slate-500 font-medium text-center leading-relaxed">
              "{dealerNotes}"
            </div>
          </div>

        </div>

      </form>

    </div>
  );
};

export default EditCustomer;
