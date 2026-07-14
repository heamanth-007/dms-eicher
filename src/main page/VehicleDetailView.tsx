import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Edit3, 
  Plus, 
  Calendar, 
  ShieldCheck, 
  Clock, 
  Eye, 
  FileText 
} from 'lucide-react';

interface VehicleDetailProps {
  vehicle: {
    model: string;
    registration: string;
    chassis: string;
    purchaseDate: string;
    status: string;
    statusClass: string;
    image: string;
  };
  onBack: () => void;
}

export const VehicleDetailView: React.FC<VehicleDetailProps> = ({ vehicle, onBack }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'specs' | 'docs'>('services');

  // Specific service records mock for the vehicle
  const serviceRecords = [
    {
      jobCard: 'JC-10294',
      date: 'Jan 12, 2024',
      type: 'Routine Engine Oil & Filter Change',
      cost: '$320.00',
      status: 'Active',
      statusClass: 'bg-emerald-50 text-emerald-600 border border-emerald-100'
    },
    {
      jobCard: 'JC-09281',
      date: 'Nov 05, 2023',
      type: 'Hydraulic Cylinder Seal Repair',
      cost: '$1,450.00',
      status: 'Completed',
      statusClass: 'bg-blue-50 text-blue-600 border border-blue-100'
    },
    {
      jobCard: 'JC-08102',
      date: 'Aug 14, 2022',
      type: 'Brake Shoe Replacement & System Bleed',
      cost: '$620.00',
      status: 'Completed',
      statusClass: 'bg-blue-50 text-blue-600 border border-blue-100'
    }
  ];

  // Specific specifications
  const specs = [
    { label: 'Manufacturer / Brand', value: vehicle.model.split(' ')[0] },
    { label: 'Model Series', value: vehicle.model.split(' ').slice(1).join(' ') },
    { label: 'Transmission', value: 'Synchromesh 9 Forward + 3 Reverse' },
    { label: 'Engine Capacity', value: '2900 CC, 3 Cylinder' },
    { label: 'Fuel Tank Capacity', value: '60 Liters' },
    { label: 'Brakes', value: 'Oil Immersed Disc Brakes' }
  ];

  return (
    <div className="p-8 bg-[#f6f8fc] min-h-[calc(100vh-70px)] flex flex-col gap-6 box-border font-sans text-slate-700 text-left">
      
      {/* Back navigation link */}
      <div>
        <span 
          className="flex items-center gap-1.5 text-[12px] font-semibold text-blue-600 hover:text-blue-800 cursor-pointer mb-1 transition-colors"
          onClick={onBack}
        >
          <ArrowLeft size={13} /> Back to Customer Details
        </span>
      </div>

      {/* Main Banner Header matching mock */}
      <div className="bg-[#184edb] rounded-2xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md relative overflow-hidden">
        
        {/* Banner details */}
        <div className="flex items-center gap-5 z-10">
          <img 
            src={vehicle.image} 
            alt={vehicle.model} 
            className="w-20 h-20 rounded-xl object-cover border-[3px] border-white/20 shadow-lg flex-shrink-0"
          />
          <div className="flex flex-col gap-1.5">
            <h1 className="text-2xl font-extrabold m-0 tracking-tight font-heading">{vehicle.model}</h1>
            <div className="flex flex-wrap items-center gap-2 text-xs text-white/80 font-medium">
              <span>Registration: <span className="font-bold text-white">{vehicle.registration}</span></span>
              <span className="hidden md:inline">•</span>
              <span>Chassis ID: <span className="font-mono text-white font-bold">{vehicle.chassis}</span></span>
              <span className="hidden md:inline">•</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${vehicle.statusClass}`}>
                {vehicle.status}
              </span>
            </div>
          </div>
        </div>

        {/* Banner buttons */}
        <div className="flex items-center gap-3 z-10">
          <button className="bg-transparent border border-white/30 hover:bg-white/10 text-white font-semibold text-xs py-2.5 px-4 rounded-md cursor-pointer transition-colors">
            <Edit3 size={13} className="inline mr-1" /> Edit Asset
          </button>
          
          <button className="bg-white hover:bg-slate-50 text-[#184edb] border-none font-bold text-xs py-2.5 px-5 rounded-md cursor-pointer transition-colors shadow-md flex items-center gap-1">
            <Plus size={14} /> New Service Ticket
          </button>
        </div>

        {/* Abstract design background overlays */}
        <div className="absolute right-0 top-0 w-80 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none skew-x-12 transform origin-top-right" />
      </div>

      {/* Tabs list matching mockup style */}
      <div className="bg-white rounded-xl border border-[#eef2f6] shadow-sm overflow-hidden w-full">
        
        {/* Tab Headers */}
        <div className="flex border-b border-slate-100 bg-slate-50/40">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`py-3.5 px-6 font-bold text-[12.5px] cursor-pointer bg-transparent border-none outline-none transition-colors border-b-[2.5px] ${
              activeTab === 'overview' 
                ? 'border-[#184edb] text-[#184edb]' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Overview
          </button>

          <button 
            onClick={() => setActiveTab('services')}
            className={`py-3.5 px-6 font-bold text-[12.5px] cursor-pointer bg-transparent border-none outline-none transition-colors border-b-[2.5px] ${
              activeTab === 'services' 
                ? 'border-[#184edb] text-[#184edb]' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Service History
          </button>

          <button 
            onClick={() => setActiveTab('specs')}
            className={`py-3.5 px-6 font-bold text-[12.5px] cursor-pointer bg-transparent border-none outline-none transition-colors border-b-[2.5px] ${
              activeTab === 'specs' 
                ? 'border-[#184edb] text-[#184edb]' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Specifications
          </button>

          <button 
            onClick={() => setActiveTab('docs')}
            className={`py-3.5 px-6 font-bold text-[12.5px] cursor-pointer bg-transparent border-none outline-none transition-colors border-b-[2.5px] ${
              activeTab === 'docs' 
                ? 'border-[#184edb] text-[#184edb]' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Documents
          </button>
        </div>

        {/* Tab Panels */}
        <div className="w-full">
          
          {/* OVERVIEW PANEL */}
          {activeTab === 'overview' && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-4 text-sm">
                <h4 className="text-base font-extrabold text-slate-800 m-0 tracking-tight font-heading">Asset Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-500">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Purchase Date</span>
                    <span className="text-slate-800 font-bold">{vehicle.purchaseDate}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lifetime Cost</span>
                    <span className="text-slate-800 font-bold">$2,390.00</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Operational Status</span>
                    <span className="text-slate-800 font-bold">{vehicle.status}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Warranty</span>
                    <span className="text-slate-800 font-bold">Yes (Till Dec 2028)</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3 justify-center items-center bg-slate-50/50 rounded-xl p-4 border border-slate-100">
                <ShieldCheck size={40} className="text-emerald-500" />
                <span className="text-xs font-bold text-slate-700">Extended Warranty Valid</span>
                <span className="text-[11px] text-slate-400">Covers engine and electrical component diagnostics.</span>
              </div>
            </div>
          )}

          {/* SERVICE HISTORY PANEL */}
          {activeTab === 'services' && (
            <div className="flex flex-col w-full">
              <div className="p-4 px-6 border-b border-slate-100 bg-slate-50/10 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 m-0 font-heading">Service Records</h3>
                  <p className="text-[11px] text-slate-400 m-0">Manage and track service history for this vehicle.</p>
                </div>
              </div>

              <div className="overflow-x-auto w-full">
                <table className="w-full border-collapse text-left text-[12px]">
                  <thead>
                    <tr className="bg-slate-50/20 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                      <th className="py-3 px-6 border-b border-slate-100">Job Card No.</th>
                      <th className="py-3 px-6 border-b border-slate-100">Date</th>
                      <th className="py-3 px-6 border-b border-slate-100">Service Type</th>
                      <th className="py-3 px-6 border-b border-slate-100">Cost</th>
                      <th className="py-3 px-6 border-b border-slate-100">Status</th>
                      <th className="py-3 px-6 border-b border-slate-100 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceRecords.map((rec, i) => (
                      <tr key={i} className="hover:bg-slate-50/30 transition-colors text-slate-700 font-medium">
                        <td className="py-3.5 px-6 border-b border-slate-100 font-bold text-[#184edb]">{rec.jobCard}</td>
                        <td className="py-3.5 px-6 border-b border-slate-100 text-slate-500">{rec.date}</td>
                        <td className="py-3.5 px-6 border-b border-slate-100 text-slate-800 font-bold">{rec.type}</td>
                        <td className="py-3.5 px-6 border-b border-slate-100 text-slate-800 font-extrabold">{rec.cost}</td>
                        <td className="py-3.5 px-6 border-b border-slate-100">
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold inline-block ${rec.statusClass}`}>
                            {rec.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 border-b border-slate-100 text-center">
                          <button className="bg-transparent border-none text-[#184edb] hover:text-blue-800 cursor-pointer">
                            <Eye size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SPECIFICATIONS PANEL */}
          {activeTab === 'specs' && (
            <div className="p-6 flex flex-col gap-4">
              <h4 className="text-base font-extrabold text-slate-800 m-0 tracking-tight font-heading">Specifications</h4>
              <div className="border border-slate-100 rounded-xl overflow-hidden">
                <div className="grid grid-cols-1 divide-y divide-slate-100 text-xs">
                  {specs.map((spec, i) => (
                    <div key={i} className="grid grid-cols-2 p-3 font-medium hover:bg-slate-55/20 transition-colors">
                      <span className="text-slate-400 font-bold">{spec.label}</span>
                      <span className="text-slate-700 font-semibold">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* DOCUMENTS PANEL */}
          {activeTab === 'docs' && (
            <div className="p-6 flex flex-col gap-4">
              <h4 className="text-base font-extrabold text-slate-800 m-0 tracking-tight font-heading">Documents</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-xl p-4 flex items-center justify-between bg-slate-50/50 hover:border-blue-400 transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="text-slate-400" size={24} />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-800">Owner Manual.pdf</span>
                      <span className="text-[10px] text-slate-400">12.4 MB • PDF Document</span>
                    </div>
                  </div>
                  <button className="bg-transparent border-none text-[#184edb] hover:text-blue-800 font-bold text-xs cursor-pointer">
                    Download
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 flex items-center justify-between bg-slate-50/50 hover:border-blue-400 transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="text-slate-400" size={24} />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-800">Insurance Policy.pdf</span>
                      <span className="text-[10px] text-slate-400">1.8 MB • PDF Document</span>
                    </div>
                  </div>
                  <button className="bg-transparent border-none text-[#184edb] hover:text-blue-800 font-bold text-xs cursor-pointer">
                    Download
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Footer KPI Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Warranty Health */}
        <div className="bg-white rounded-xl p-5 border border-[#eef2f6] shadow-sm flex items-center gap-4">
          <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center">
            {/* SVG circular progress */}
            <svg width="48" height="48" className="transform -rotate-90">
              <circle cx="24" cy="24" r="20" stroke="#f1f4fd" strokeWidth="4" fill="transparent" />
              <circle cx="24" cy="24" r="20" stroke="#184edb" strokeWidth="4" fill="transparent" strokeDasharray="125.6" strokeDashoffset="50.2" />
            </svg>
            <span className="absolute text-[10px] font-extrabold text-[#184edb]">60%</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider">WARRANTY HEALTH</span>
            <h3 className="text-2xl font-extrabold text-slate-800 m-0">60% Active</h3>
            <span className="text-[10px] text-slate-400 mt-0.5">Valid through Dec 12, 2028</span>
          </div>
        </div>

        {/* Avg Asset Age */}
        <div className="bg-white rounded-xl p-5 border border-[#eef2f6] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50">
            <Calendar className="text-blue-600" size={24} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider">AVG. ASSET AGE</span>
            <h3 className="text-2xl font-extrabold text-slate-800 m-0">2.4 Years</h3>
            <span className="text-[10px] text-slate-400 mt-0.5">First registered in 2021</span>
          </div>
        </div>

        {/* Next Service */}
        <div className="bg-white rounded-xl p-5 border border-[#eef2f6] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-50">
            <Clock className="text-emerald-600" size={24} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider">NEXT SERVICE</span>
            <h3 className="text-2xl font-extrabold text-slate-800 m-0">12 Days</h3>
            <span className="text-[10px] text-slate-400 mt-0.5">Due date: Jul 26, 2026</span>
          </div>
        </div>

      </div>

    </div>
  );
};

export default VehicleDetailView;
