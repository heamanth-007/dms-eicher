import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Filter, 
  FileText, 
  Printer, 
  Plus, 
  CheckCircle, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp
} from 'lucide-react';

interface CompletedJobsProps {
  onBack: () => void;
  onNewJobCard: () => void;
  searchTerm: string;
}

interface CompletedJobRecord {
  jcNumber: string;
  customerName: string;
  vehicleModel: string;
  vehicleReg: string;
  leadMechanic: string;
  mechanicInitials: string;
  completionTime: string;
  amount: string;
  status: 'COMPLETED';
}

export const CompletedJobs: React.FC<CompletedJobsProps> = ({ onBack, onNewJobCard, searchTerm }) => {
  
  const [completedList] = useState<CompletedJobRecord[]>([
    {
      jcNumber: '#JC-2024-001',
      customerName: 'Amit Sharma',
      vehicleModel: 'Eicher Pro 2049',
      vehicleReg: 'MH-12-PQ-9876',
      leadMechanic: 'Mukesh K.',
      mechanicInitials: 'MK',
      completionTime: 'Oct 24, 2023 14:20 PM',
      amount: '₹12,450',
      status: 'COMPLETED'
    },
    {
      jcNumber: '#JC-2024-005',
      customerName: 'Logistics Corp',
      vehicleModel: 'Eicher Pro 6028',
      vehicleReg: 'KA-01-LM-4321',
      leadMechanic: 'Suresh S.',
      mechanicInitials: 'SS',
      completionTime: 'Oct 24, 2023 11:05 AM',
      amount: '₹45,800',
      status: 'COMPLETED'
    },
    {
      jcNumber: '#JC-2024-009',
      customerName: 'Prakash V.',
      vehicleModel: 'Eicher Skyline Pro',
      vehicleReg: 'DL-02-XY-1234',
      leadMechanic: 'Abdul J.',
      mechanicInitials: 'AJ',
      completionTime: 'Oct 23, 2023 17:45 PM',
      amount: '₹8,900',
      status: 'COMPLETED'
    }
  ]);

  const filteredJobs = completedList.filter(job => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      job.jcNumber.toLowerCase().includes(q) ||
      job.customerName.toLowerCase().includes(q) ||
      job.vehicleReg.toLowerCase().includes(q) ||
      job.vehicleModel.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex-1 p-6 md:p-8 flex flex-col gap-6 bg-[#f6f8fc] overflow-y-auto box-border max-w-full text-slate-700 text-left font-sans relative min-h-[calc(100vh-70px)]">
      
      {/* Back button link */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors border-none bg-transparent cursor-pointer flex items-center justify-center"
        >
          <ArrowLeft size={20} />
        </button>
        <span className="text-[13px] text-slate-400 font-semibold uppercase tracking-wider">
          Service Management &gt; Completed Jobs
        </span>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full box-border">
        {/* Today's Done */}
        <div className="bg-[#fcfdfd] rounded-xl p-5 shadow-xs border border-slate-100 flex items-center justify-between min-h-[90px] box-border relative">
          <div className="flex flex-col">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Today's Done</span>
            <span className="text-3xl font-extrabold text-slate-800 tracking-tight mt-1 font-heading">14</span>
          </div>
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl flex items-center justify-center">
            <CheckCircle size={22} />
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-[#fcfdfd] rounded-xl p-5 shadow-xs border border-slate-100 flex items-center justify-between min-h-[90px] box-border relative">
          <div className="flex flex-col">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Revenue</span>
            <span className="text-3xl font-extrabold text-slate-800 tracking-tight mt-1 font-heading">₹1.2L</span>
          </div>
          <div className="bg-blue-50 text-[#184edb] p-3 rounded-xl flex items-center justify-center">
            <TrendingUp size={22} />
          </div>
        </div>

        {/* Average Repair Time */}
        <div className="bg-[#fcfdfd] rounded-xl p-5 shadow-xs border border-slate-100 flex items-center justify-between min-h-[90px] box-border relative">
          <div className="flex flex-col">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Avg Repair Time</span>
            <span className="text-3xl font-extrabold text-slate-800 tracking-tight mt-1 font-heading">4.2h</span>
          </div>
          <div className="bg-amber-50 text-amber-600 p-3 rounded-xl flex items-center justify-center">
            <Clock size={22} />
          </div>
        </div>
      </div>

      {/* Header Info area */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 m-0 tracking-tight font-heading">
            Completed Service Jobs
          </h1>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Review and finalize billing for vehicles ready for handover.
          </p>
        </div>

        <div className="flex items-center gap-2.5">

          <button className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-650 font-bold rounded-lg text-xs cursor-pointer bg-white transition-colors">
            <Filter size={14} />
            <span>Filter</span>
          </button>
          <button 
            onClick={() => alert('Starting Bulk Billing calculation')}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#184edb] hover:bg-[#143eb3] text-white font-bold rounded-lg text-xs cursor-pointer border-none shadow-md"
          >
            <FileText size={14} />
            <span>Bulk Billing</span>
          </button>
        </div>
      </div>

      {/* Complete Jobs Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden w-full flex flex-col box-border">
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse text-left text-slate-650 text-[12.5px]">
            <thead>
              <tr className="bg-slate-50/20 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-6">JC NUMBER</th>
                <th className="py-3.5 px-5">CUSTOMER & VEHICLE</th>
                <th className="py-3.5 px-5">LEAD MECHANIC</th>
                <th className="py-3.5 px-5">COMPLETION</th>
                <th className="py-3.5 px-5 text-right">AMOUNT</th>
                <th className="py-3.5 px-5 text-center">STATUS</th>
                <th className="py-3.5 px-6 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredJobs.map((job) => (
                <tr key={job.jcNumber} className="hover:bg-slate-50/20 transition-colors">
                  {/* JC NUMBER */}
                  <td className="py-4 px-6 font-extrabold text-[#184edb] hover:underline cursor-pointer" onClick={() => alert(`View details of ${job.jcNumber}`)}>
                    {job.jcNumber}
                  </td>

                  {/* CUSTOMER & VEHICLE */}
                  <td className="py-4 px-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 text-[13.5px]">{job.customerName}</span>
                      <span className="text-[11px] text-slate-400 font-semibold mt-0.5">
                        {job.vehicleModel} <span className="text-slate-300 mx-0.5">•</span> {job.vehicleReg}
                      </span>
                    </div>
                  </td>

                  {/* LEAD MECHANIC */}
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[9px] bg-blue-50 text-[#184edb] border border-blue-100">
                        {job.mechanicInitials}
                      </div>
                      <span className="text-slate-700 font-semibold text-[13px]">{job.leadMechanic}</span>
                    </div>
                  </td>

                  {/* COMPLETION */}
                  <td className="py-4 px-5 text-slate-500 whitespace-nowrap">
                    {job.completionTime}
                  </td>

                  {/* AMOUNT */}
                  <td className="py-4 px-5 text-right text-slate-800 font-extrabold">
                    {job.amount}
                  </td>

                  {/* STATUS */}
                  <td className="py-4 px-5 text-center whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-green-50 text-green-600 border border-green-100">
                      {job.status}
                    </span>
                  </td>

                  {/* ACTIONS */}
                  <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => alert(`Reviewing invoice details for ${job.jcNumber}`)}
                        title="View Invoice"
                        className="p-1.5 bg-blue-50 border border-blue-100 rounded-md text-blue-600 hover:bg-blue-100 cursor-pointer flex items-center justify-center transition-colors shadow-xs"
                      >
                        <FileText size={13} />
                      </button>
                      <button 
                        onClick={() => alert(`Printing invoice for ${job.jcNumber}`)}
                        title="Print Invoice"
                        className="p-1.5 bg-amber-50 border border-amber-100 rounded-md text-amber-600 hover:bg-amber-100 cursor-pointer flex items-center justify-center transition-colors shadow-xs"
                      >
                        <Printer size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="bg-[#f8fafc] border-t border-slate-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 w-full box-border">
          <span className="text-[12.5px] text-slate-500 font-medium">
            Showing 1-3 of 42 results
          </span>

          <div className="flex items-center gap-1.5">
            <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 cursor-pointer transition-colors">
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

      {/* Floating Action Button (FAB) at Bottom-Right */}
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

export default CompletedJobs;
