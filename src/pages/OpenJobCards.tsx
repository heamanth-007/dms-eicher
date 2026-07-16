import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Filter, 
  Download, 
  Plus, 
  Eye, 
  Edit, 
  UserPlus, 
  MoreVertical, 
  ClipboardList, 
  UserCheck, 
  Wrench, 
  AlertTriangle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface OpenJobCardsProps {
  onBack: () => void;
  onNewJobCard: () => void;
  onViewJcDetails: (jc: any) => void;
  onEditJc: (jc: any) => void;
  searchTerm: string;
}

interface JobCardRecord {
  jcNumber: string;
  customerName: string;
  vehicleModel: string;
  vehicleReg: string;
  engineNo: string;
  chassisNo: string;
  complaint: string;
  mechanicName: string;
  mechanicInitials: string;
  mechanicStatus: 'assigned' | 'unassigned';
  dateIn: string;
  status: 'Working' | 'Assigned' | 'Waiting Parts' | 'Completed';
  statusColor: string;
}

export const OpenJobCards: React.FC<OpenJobCardsProps> = ({ 
  onBack, 
  onNewJobCard,
  onViewJcDetails,
  onEditJc,
  searchTerm
}) => {
  const [showTable, setShowTable] = useState(true);
  const [jobCards] = useState<JobCardRecord[]>([
    {
      jcNumber: 'JC-2023-8841',
      customerName: 'Reliance Logistics',
      vehicleModel: 'EICHER PRO 3015',
      vehicleReg: 'DL-1GA-9233',
      engineNo: 'E494TCIC',
      chassisNo: '881294',
      complaint: 'Brake pedal soft feel & low fluid level',
      mechanicName: 'Ram Singh',
      mechanicInitials: 'RS',
      mechanicStatus: 'assigned',
      dateIn: '24 Oct, 09:30 AM',
      status: 'Working',
      statusColor: 'bg-green-50 text-green-600 border-green-100'
    },
    {
      jcNumber: 'JC-2023-8842',
      customerName: 'Blue Star Travels',
      vehicleModel: 'EICHER SKYLINE PRO',
      vehicleReg: 'UP-14BT-0021',
      engineNo: 'E483TCIC',
      chassisNo: '772155',
      complaint: 'AC compressor noise & cooling issue',
      mechanicName: 'Unassigned',
      mechanicInitials: 'UN',
      mechanicStatus: 'unassigned',
      dateIn: '24 Oct, 11:15 AM',
      status: 'Assigned',
      statusColor: 'bg-blue-50 text-[#184edb] border-blue-100'
    },
    {
      jcNumber: 'JC-2023-8845',
      customerName: 'Kailash Trans',
      vehicleModel: 'EICHER PRO 2049',
      vehicleReg: 'HR-55CD-3100',
      engineNo: 'E366T',
      chassisNo: '990123',
      complaint: 'Fuel injector malfunction & high exhaust smoke',
      mechanicName: 'Amir Khan',
      mechanicInitials: 'AK',
      mechanicStatus: 'assigned',
      dateIn: '23 Oct, 04:00 PM',
      status: 'Waiting Parts',
      statusColor: 'bg-red-50 text-red-500 border-red-100'
    },
    {
      jcNumber: 'JC-2023-8848',
      customerName: 'Om Logistics Ltd.',
      vehicleModel: 'EICHER PRO 6028',
      vehicleReg: 'MH-04JK-5561',
      engineNo: 'VEDX5',
      chassisNo: '442311',
      complaint: 'Suspension squeaking & steering vibration',
      mechanicName: 'Vijay M.',
      mechanicInitials: 'VM',
      mechanicStatus: 'assigned',
      dateIn: '24 Oct, 08:00 AM',
      status: 'Working',
      statusColor: 'bg-green-50 text-green-600 border-green-100'
    }
  ]);

  const filteredCards = jobCards.filter(jc => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      jc.jcNumber.toLowerCase().includes(q) ||
      jc.vehicleReg.toLowerCase().includes(q) ||
      jc.vehicleModel.toLowerCase().includes(q) ||
      jc.complaint.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex-1 p-6 md:p-8 flex flex-col gap-6 bg-[#f6f8fc] overflow-y-auto box-border max-w-full text-slate-700 text-left font-sans relative min-h-[calc(100vh-70px)]">
      
      {/* Back navigation & Mini-KPIs row */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors border-none bg-transparent cursor-pointer flex items-center justify-center"
        >
          <ArrowLeft size={20} />
        </button>
        <span className="text-[13px] text-slate-400 font-semibold uppercase tracking-wider">
          Service Management &gt; Open Job Cards
        </span>
      </div>

      {/* Mini KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full box-border">
        {/* Total Open */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-100/60 flex items-center justify-between min-h-[85px] box-border relative">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Open</span>
            <span className="text-2xl font-extrabold text-slate-800 tracking-tight mt-1 font-heading">42</span>
            <span className="text-[9px] font-bold text-red-500 mt-1 flex items-center gap-0.5">
              ↑ 4 <span className="text-slate-400 font-medium lowercase">since yesterday</span>
            </span>
          </div>
          <div className="bg-blue-50 text-[#184edb] p-2.5 rounded-xl flex items-center justify-center">
            <ClipboardList size={20} />
          </div>
        </div>

        {/* Assigned */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-100/60 flex items-center justify-between min-h-[85px] box-border relative">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned</span>
            <span className="text-2xl font-extrabold text-slate-800 tracking-tight mt-1 font-heading">28</span>
            <span className="text-[9.5px] font-semibold text-slate-400 mt-1">Mechanics on floor</span>
          </div>
          <div className="bg-blue-50 text-[#184edb] p-2.5 rounded-xl flex items-center justify-center">
            <UserCheck size={20} />
          </div>
        </div>

        {/* Working */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-100/60 flex items-center justify-between min-h-[85px] box-border relative">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Working</span>
            <span className="text-2xl font-extrabold text-slate-800 tracking-tight mt-1 font-heading">10</span>
            <span className="text-[9.5px] font-semibold text-slate-400 mt-1">Active progress</span>
          </div>
          <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-xl flex items-center justify-center">
            <Wrench size={20} />
          </div>
        </div>

        {/* Waiting Parts */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-100/60 flex items-center justify-between min-h-[85px] box-border relative">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Waiting Parts</span>
            <span className="text-2xl font-extrabold text-red-500 tracking-tight mt-1 font-heading">04</span>
            <span className="text-[9.5px] font-semibold text-red-500 mt-1">Critical hold</span>
          </div>
          <div className="bg-red-50 text-red-600 p-2.5 rounded-xl flex items-center justify-center">
            <AlertTriangle size={20} />
          </div>
        </div>
      </div>

      {/* Title & Actions Row */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 m-0 tracking-tight font-heading">
            Open Job Cards
          </h1>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Manage and track all ongoing vehicle services and repairs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => setShowTable(!showTable)}
            className={`flex items-center gap-1.5 px-3 py-2 border font-bold rounded-lg text-xs cursor-pointer transition-colors shadow-xs ${
              showTable 
                ? 'bg-[#184edb] text-white border-[#184edb] hover:bg-[#143eb3]' 
                : 'bg-white text-slate-650 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>{showTable ? 'Hide Table' : 'Show Table'}</span>
          </button>

          <button className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-650 font-bold rounded-lg text-xs cursor-pointer bg-white transition-colors">
            <Filter size={14} />
            <span>Filters</span>
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-650 font-bold rounded-lg text-xs cursor-pointer bg-white transition-colors">
            <Download size={14} />
            <span>Export</span>
          </button>
          <button 
            onClick={onNewJobCard}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#184edb] hover:bg-[#143eb3] text-white font-bold rounded-lg text-xs cursor-pointer transition-colors border-none shadow-md"
          >
            <Plus size={14} />
            <span>New Job Card</span>
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      {showTable && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden w-full flex flex-col box-border">
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse text-left text-slate-650 text-[12.5px]">
            <thead>
              <tr className="bg-slate-50/20 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-6">JC NUMBER</th>
                <th className="py-3.5 px-5">CUSTOMER / VEHICLE</th>
                <th className="py-3.5 px-5">ENGINE / CHASSIS</th>
                <th className="py-3.5 px-5">PRIMARY COMPLAINT</th>
                <th className="py-3.5 px-5">MECHANIC</th>
                <th className="py-3.5 px-5">DATE IN</th>
                <th className="py-3.5 px-5">STATUS</th>
                <th className="py-3.5 px-6 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredCards.map((jc) => (
                <tr key={jc.jcNumber} className="hover:bg-slate-50/20 transition-colors">
                  {/* JC Number */}
                  <td className="py-4 px-6 font-extrabold text-[#184edb]">
                    <div className="flex flex-col">
                      <span 
                        onClick={() => onViewJcDetails(jc)}
                        className="hover:underline cursor-pointer"
                      >
                        {jc.jcNumber}
                      </span>
                      <span className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                        {jc.vehicleModel.split(' ')[1] || 'PRO'} {jc.vehicleModel.split(' ')[2] || '3015'}
                      </span>
                    </div>
                  </td>

                  {/* Customer / Vehicle */}
                  <td className="py-4 px-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800">{jc.customerName}</span>
                      <span className="text-[11px] text-slate-400 font-semibold mt-0.5">{jc.vehicleReg}</span>
                    </div>
                  </td>

                  {/* Engine / Chassis */}
                  <td className="py-4 px-5 whitespace-nowrap text-[12px] font-mono">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-slate-700 font-semibold">{jc.engineNo}</span>
                      <span className="text-slate-400">/ {jc.chassisNo}</span>
                    </div>
                  </td>

                  {/* Primary Complaint */}
                  <td className="py-4 px-5 max-w-[180px] truncate text-slate-600 font-semibold">
                    {jc.complaint}
                  </td>

                  {/* Mechanic */}
                  <td className="py-4 px-5">
                    {jc.mechanicStatus === 'unassigned' ? (
                      <span className="text-red-500 font-bold italic text-[13px]">{jc.mechanicName}</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[9px] bg-blue-50 text-[#184edb] border border-blue-100">
                          {jc.mechanicInitials}
                        </div>
                        <span className="text-slate-750 font-bold text-[13px]">{jc.mechanicName}</span>
                      </div>
                    )}
                  </td>

                  {/* Date In */}
                  <td className="py-4 px-5 text-slate-550 leading-relaxed">
                    {jc.dateIn}
                  </td>

                  {/* Status */}
                  <td className="py-4 px-5 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border inline-block ${
                      jc.status === 'Working' 
                        ? 'bg-green-50 text-green-600 border-green-100' 
                        : jc.status === 'Assigned' 
                          ? 'bg-blue-50 text-[#184edb] border-blue-100' 
                          : 'bg-red-50 text-red-500 border-red-100'
                    }`}>
                      {jc.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1.5">
                      <button 
                        onClick={() => onViewJcDetails(jc)}
                        title="View Details"
                        className="p-1.5 bg-blue-50 border border-blue-100 rounded-md text-blue-600 hover:bg-blue-100 cursor-pointer flex items-center justify-center transition-colors shadow-xs"
                      >
                        <Eye size={13} />
                      </button>
                      <button 
                        onClick={() => onEditJc(jc)}
                        title="Edit Job Card"
                        className="p-1.5 bg-green-50 border border-green-100 rounded-md text-green-600 hover:bg-green-100 cursor-pointer flex items-center justify-center transition-colors shadow-xs"
                      >
                        <Edit size={13} />
                      </button>
                      <button 
                        onClick={() => alert(`Assign Mechanic for ${jc.jcNumber}`)}
                        title="Assign Mechanic"
                        className="p-1.5 bg-cyan-50 border border-cyan-100 rounded-md text-cyan-600 hover:bg-cyan-100 cursor-pointer flex items-center justify-center transition-colors shadow-xs"
                      >
                        <UserPlus size={13} />
                      </button>
                      <button 
                        title="More Actions"
                        className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer flex items-center justify-center transition-colors"
                      >
                        <MoreVertical size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer controls */}
        <div className="bg-[#f8fafc] border-t border-slate-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 w-full box-border">
          <span className="text-[12.5px] text-slate-500 font-medium">
            Showing 1-4 of 42 job cards
          </span>

          <div className="flex items-center gap-1.5">
            <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-50 text-slate-400 cursor-pointer transition-colors">
              <ChevronLeft size={14} />
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#184edb] text-white font-bold text-xs border-none shadow-xs cursor-pointer">
              1
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 text-xs font-bold cursor-pointer transition-colors">
              2
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 text-xs font-bold cursor-pointer transition-colors">
              3
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-50 text-slate-450 cursor-pointer transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
      )}{/* Floating Action Button (FAB) at Bottom-Right */}
      <button 
        onClick={onNewJobCard}
        title="Add New Job Card"
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-[#184edb] hover:bg-[#143eb3] text-white flex items-center justify-center shadow-lg hover:shadow-xl cursor-pointer border-none transition-all duration-200 z-50 hover:scale-105 active:scale-95"
      >
        <Plus size={24} />
      </button>
    </div>
  );
};

export default OpenJobCards;
