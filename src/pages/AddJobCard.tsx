import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  User, 
  Truck, 
  FileText, 
  Clock, 
  Wrench, 
  Info, 
  Printer, 
  Save, 
  XCircle,
  ChevronDown
} from 'lucide-react';

interface AddJobCardProps {
  onBack: () => void;
  onSave: (newJobCard: any) => void;
}

export const AddJobCard: React.FC<AddJobCardProps> = ({ onBack, onSave }) => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  // Data lists from backend
  const [customers, setCustomers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/api/customers`)
      .then(res => res.json())
      .then(data => setCustomers(data))
      .catch(err => console.error('Error fetching customers:', err));

    fetch(`${API_URL}/api/vehicles`)
      .then(res => res.json())
      .then(data => setVehicles(data))
      .catch(err => console.error('Error fetching vehicles:', err));


  }, [API_URL]);
  // Generated Job Card Number & Current Date
  const [jcNumber] = useState(`JC-2023-${Math.floor(1000 + Math.random() * 9000)}`);
  const [serviceDate] = useState(() => {
    return new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  });
  
  const [intakeStatus, setIntakeStatus] = useState('WORKING');

  // Customer State
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');

  // Vehicle State
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleModel, setVehicleModel] = useState('Eicher Pro 2049');
  const [engineNumber, setEngineNumber] = useState('');
  const [chassisNumber, setChassisNumber] = useState('');

  // Complaint State
  const [primaryDescription, setPrimaryDescription] = useState('');
  const [detailedNotes, setDetailedNotes] = useState('');

  // Vehicle Condition State
  const [hourMeter, setHourMeter] = useState('');
  const [fuelLevel, setFuelLevel] = useState(50);

  // Workshop Ops State
  const [expectedDelivery, setExpectedDelivery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !vehicleNumber) {
      alert('Please enter at least the Customer Name and Vehicle Number.');
      return;
    }

    const newJc = {
      jcNumber,
      inTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      customerName: fullName,
      vehicleModel,
      vehicleReg: vehicleNumber,
      complaintSummary: primaryDescription || 'General Service',
      mechanicName: '',
      mechanicInitials: '',
      status: intakeStatus,
      expectedDelivery: expectedDelivery ? new Date(expectedDelivery).toLocaleDateString() : 'Today, 05:00 PM'
    };

    onSave(newJc);
  };

  return (
    <div className="flex-1 p-6 md:p-8 flex flex-col gap-6 bg-[#f6f8fc] overflow-y-auto box-border max-w-full text-slate-700 text-left font-sans">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs flex flex-col sm:flex-row justify-between sm:items-center gap-4 w-full box-border">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors border-none bg-transparent cursor-pointer flex items-center justify-center"
            title="Go Back"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="bg-blue-50 text-[#184edb] text-[9.5px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                New Intake
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 m-0 tracking-tight leading-none">
                {jcNumber}
              </h2>
            </div>
            <span className="text-[12px] text-slate-500 font-semibold">
              Service Date: <span className="text-slate-800 font-bold">{serviceDate}</span>
            </span>
          </div>
        </div>

        {/* Intake Status Dropdown */}
        <div className="flex flex-col sm:items-end gap-1">
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
            Intake Status
          </span>
          <div className="relative">
            <select 
              value={intakeStatus}
              onChange={(e) => setIntakeStatus(e.target.value)}
              className="appearance-none bg-[#f1f4fd] border-none text-[#184edb] font-bold text-xs rounded-lg py-2 pl-4 pr-10 cursor-pointer focus:outline-none"
            >
              <option value="WORKING">IN-PROGRESS</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="WAITING PARTS">WAITING PARTS</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#184edb] pointer-events-none">
              <ChevronDown size={14} />
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full box-border">
        
        {/* Left Column (Wider) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Customer Information Card */}
          <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-2 text-[#184edb] font-bold text-[13px] uppercase tracking-wider border-b border-slate-100/60 pb-3">
              <User size={16} />
              <span>Customer Information</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <select 
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      const selectedCust = customers.find(c => c.name === e.target.value);
                      if (selectedCust) setMobileNumber(selectedCust.phone.replace(/[^0-9]/g, ''));
                    }}
                    className="w-full appearance-none border border-slate-200 rounded-md py-2 pl-3 pr-10 text-xs outline-none focus:border-[#184edb] text-slate-700 bg-slate-50/50 font-medium cursor-pointer"
                  >
                    <option value="">Select Customer...</option>
                    {customers.map(c => (
                      <option key={c.id || c._id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#184edb] pointer-events-none">
                    <ChevronDown size={14} />
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mobile Number</label>
                <input 
                  type="text" 
                  placeholder="+91 98765 43210"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/[^0-9]/g, ''))}
                  className="border border-slate-200 rounded-md py-2 px-3 text-xs outline-none focus:border-[#184edb] text-slate-700 bg-slate-50/50 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Vehicle Information Card */}
          <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-2 text-[#184edb] font-bold text-[13px] uppercase tracking-wider border-b border-slate-100/60 pb-3">
              <Truck size={16} />
              <span>Vehicle Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vehicle Number</label>
                <input 
                  type="text" 
                  placeholder="KA-01-EF-5566"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  className="border border-slate-200 rounded-md py-2 px-3 text-xs outline-none focus:border-[#184edb] text-slate-700 bg-slate-50/50 font-medium"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Model</label>
                <div className="relative">
                  <select 
                    value={vehicleModel}
                    onChange={(e) => {
                      setVehicleModel(e.target.value);
                      const v = vehicles.find(veh => veh.modelName === e.target.value);
                      if(v) {
                        setEngineNumber(v.engineNo || '');
                        setChassisNumber(v.chassisNo || '');
                      }
                    }}
                    className="w-full appearance-none border border-slate-200 rounded-md py-2 pl-3 pr-10 text-xs outline-none focus:border-[#184edb] text-slate-700 bg-slate-50/50 font-medium cursor-pointer"
                  >
                    <option value="">Select Vehicle Model...</option>
                    {vehicles.map(v => (
                      <option key={v.id || v._id} value={v.modelName}>{v.modelName}</option>
                    ))}
                    {/* Fallbacks if DB is empty */}
                    <option value="Eicher Pro 2049">Eicher Pro 2049</option>
                    <option value="Eicher Pro 3015">Eicher Pro 3015</option>
                    <option value="Eicher Skyline Pro">Eicher Skyline Pro</option>
                    <option value="Eicher Pro 6028">Eicher Pro 6028</option>
                  </select>
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#184edb] pointer-events-none">
                    <ChevronDown size={14} />
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Engine Number</label>
                <input 
                  type="text" 
                  placeholder="ENG123456789"
                  value={engineNumber}
                  onChange={(e) => setEngineNumber(e.target.value)}
                  className="border border-slate-200 rounded-md py-2 px-3 text-xs outline-none focus:border-[#184edb] text-slate-700 bg-slate-50/50 font-medium"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chassis Number</label>
                <input 
                  type="text" 
                  placeholder="CHS987654321"
                  value={chassisNumber}
                  onChange={(e) => setChassisNumber(e.target.value)}
                  className="border border-slate-200 rounded-md py-2 px-3 text-xs outline-none focus:border-[#184edb] text-slate-700 bg-slate-50/50 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Complaint Details Card */}
          <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-2 text-[#184edb] font-bold text-[13px] uppercase tracking-wider border-b border-slate-100/60 pb-3">
              <FileText size={16} />
              <span>Complaint Details</span>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Primary Description</label>
                <input 
                  type="text" 
                  placeholder="Short summary of the issue..."
                  value={primaryDescription}
                  onChange={(e) => setPrimaryDescription(e.target.value)}
                  className="border border-slate-200 rounded-md py-2 px-3 text-xs outline-none focus:border-[#184edb] text-slate-700 bg-slate-50/50 font-medium"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Detailed Notes / Symptoms</label>
                <textarea 
                  placeholder="Mention specific observations like noise levels, leakages, or warning lights..."
                  value={detailedNotes}
                  onChange={(e) => setDetailedNotes(e.target.value)}
                  rows={4}
                  className="border border-slate-200 rounded-md py-2.5 px-3 text-xs outline-none focus:border-[#184edb] text-slate-700 bg-slate-50/50 font-medium resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Narrower) */}
        <div className="flex flex-col gap-6">
          
          {/* Vehicle Condition Card */}
          <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-2 text-[#184edb] font-bold text-[13px] uppercase tracking-wider border-b border-slate-100/60 pb-3">
              <Wrench size={16} />
              <span>Vehicle Condition</span>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hour Meter Reading</label>
                <div className="relative flex items-center">
                  <input 
                    type="text" 
                    placeholder="0.00"
                    value={hourMeter}
                    onChange={(e) => setHourMeter(e.target.value)}
                    className="w-full border border-slate-200 rounded-md py-2 pl-3 pr-12 text-xs outline-none focus:border-[#184edb] text-slate-700 bg-slate-50/50 font-semibold"
                  />
                  <span className="absolute right-3 text-[10px] font-extrabold text-slate-400">HRS</span>
                </div>
              </div>

              {/* Fuel Level */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fuel Level</label>
                  <span className="text-xs font-bold text-[#184edb]">{fuelLevel}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100"
                  value={fuelLevel}
                  onChange={(e) => setFuelLevel(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#184edb]"
                />
                <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-wider px-0.5 mt-0.5">
                  <span>Empty</span>
                  <span>Half</span>
                  <span>Full</span>
                </div>
              </div>
            </div>
          </div>

          {/* Workshop Ops Card */}
          <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-2 text-[#184edb] font-bold text-[13px] uppercase tracking-wider border-b border-slate-100/60 pb-3">
              <Clock size={16} />
              <span>Workshop Ops</span>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expected Delivery</label>
                <input 
                  type="date"
                  value={expectedDelivery}
                  onChange={(e) => setExpectedDelivery(e.target.value)}
                  className="border border-slate-200 rounded-md py-2 px-3 text-xs outline-none focus:border-[#184edb] text-slate-750 bg-slate-50/50 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Intake Checklist */}
          <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-100/50 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-[#184edb] font-bold text-xs">
              <Info size={16} />
              <span>Intake Checklist</span>
            </div>
            <ul className="m-0 p-0 pl-4 text-[11px] font-bold text-slate-550 flex flex-col gap-2 list-disc leading-normal">
              <li>Check for body scratches/dents</li>
              <li>Verify toolkit & spare tire availability</li>
              <li>Record audio system/accessories presence</li>
              <li>Capture photos for insurance if required</li>
            </ul>
          </div>
        </div>
      </form>

      {/* Bottom Actions Row */}
      <div className="border-t border-slate-200 pt-5 mt-2 flex flex-col sm:flex-row justify-between items-center gap-4 w-full box-border">
        {/* Cancel Button */}
        <button 
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 bg-transparent border-none text-red-600 hover:text-red-700 font-bold text-xs cursor-pointer transition-colors"
        >
          <XCircle size={15} />
          <span>Cancel Job</span>
        </button>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button 
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-650 font-bold rounded-lg text-xs cursor-pointer transition-colors bg-white shadow-xs"
          >
            <Printer size={14} />
            <span>Print Card</span>
          </button>
          <button 
            type="submit"
            onClick={handleSubmit}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#184edb] hover:bg-[#143eb3] text-white font-bold rounded-lg text-xs cursor-pointer transition-colors border-none shadow-md"
          >
            <Save size={14} />
            <span>Save Job Card</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddJobCard;
