import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Printer, 
  Download, 
  ChevronDown, 
  Eye, 
  Edit, 
  Trash2, 
  ClipboardList, 
  CreditCard, 
  Users, 
  CheckCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface ServiceHistoryProps {
  onBack: () => void;
  searchTerm: string;
  jobCards?: any[];
  onDeleteJc?: (num: string) => void;
}

interface HistoryRecord {
  jcNumber: string;
  customerName: string;
  customerPhone: string;
  customerCode: string;
  vehicleNo: string;
  vehicleModel: string;
  vehicleType: string;
  serviceDate: string;
  deliveryDate: string;
  mechanic: string;
  amount: string;
  status: 'DELIVERED' | 'CLOSED';
}

export const ServiceHistory: React.FC<ServiceHistoryProps> = ({ onBack, searchTerm, jobCards: propJobCards, onDeleteJc }) => {
  const [timeFilter, setTimeFilter] = useState('Last 30 Days');
  const [mechanicFilter, setMechanicFilter] = useState('All Mechanics');

  const staticHistory: HistoryRecord[] = [
    {
      jcNumber: '#JC-EIC-9821',
      customerName: 'Aditya Transports',
      customerPhone: '+91 98765',
      customerCode: '43210',
      vehicleNo: 'KA-01-MJ-5672',
      vehicleModel: 'Pro 2049',
      vehicleType: 'Heavy Duty',
      serviceDate: '12 Oct 2023',
      deliveryDate: '14 Oct 2023',
      mechanic: 'Suresh Raina',
      amount: '₹12,450.00',
      status: 'DELIVERED'
    },
    {
      jcNumber: '#JC-EIC-9820',
      customerName: 'Vikas Logistics',
      customerPhone: '+91 88822',
      customerCode: '11223',
      vehicleNo: 'MH-12-PQ-9901',
      vehicleModel: 'Pro 3015',
      vehicleType: 'LMD',
      serviceDate: '10 Oct 2023',
      deliveryDate: '11 Oct 2023',
      mechanic: 'Amit Mishra',
      amount: '₹8,920.00',
      status: 'CLOSED'
    },
    {
      jcNumber: '#JC-EIC-9819',
      customerName: 'Blue Dart Express',
      customerPhone: '+91 91234',
      customerCode: '56789',
      vehicleNo: 'DL-01-AA-0005',
      vehicleModel: 'Pro 8000',
      vehicleType: 'Series',
      serviceDate: '08 Oct 2023',
      deliveryDate: '10 Oct 2023',
      mechanic: 'Vikram Singh',
      amount: '₹24,180.00',
      status: 'DELIVERED'
    },
    {
      jcNumber: '#JC-EIC-9818',
      customerName: 'S.K. Enterprises',
      customerPhone: '+91 77665',
      customerCode: '44332',
      vehicleNo: 'HR-55-XY-2110',
      vehicleModel: 'Skyline',
      vehicleType: 'Pro Bus',
      serviceDate: '05 Oct 2023',
      deliveryDate: '07 Oct 2023',
      mechanic: 'Amit Mishra',
      amount: '₹15,000.00',
      status: 'DELIVERED'
    },
    {
      jcNumber: '#JC-EIC-9817',
      customerName: 'Global Freight Co.',
      customerPhone: '+91 90012',
      customerCode: '34567',
      vehicleNo: 'UP-16-AS-3456',
      vehicleModel: 'Pro 8000',
      vehicleType: 'Series',
      serviceDate: '03 Oct 2023',
      deliveryDate: '04 Oct 2023',
      mechanic: 'Suresh Raina',
      amount: '₹5,400.00',
      status: 'CLOSED'
    }
  ];

  const historyList: HistoryRecord[] = (propJobCards && propJobCards.length > 0)
    ? propJobCards.filter(jc => jc.status === 'COMPLETED').map(jc => ({
        jcNumber: jc.jcNumber,
        customerName: jc.customerName,
        customerPhone: jc.customerPhone || '+91 00000',
        customerCode: jc.customerCode || '00000',
        vehicleNo: jc.vehicleReg,
        vehicleModel: jc.vehicleModel,
        vehicleType: jc.vehicleType || 'Heavy Duty',
        serviceDate: new Date(jc.createdAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        deliveryDate: new Date(jc.updatedAt || jc.expectedDelivery || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        mechanic: jc.mechanicName || 'Unassigned',
        amount: jc.amount || '₹0.00',
        status: 'DELIVERED' as const
      }))
    : staticHistory;

  const handleDelete = (num: string) => {
    if (window.confirm(`Are you sure you want to delete history record ${num}?`)) {
      if (onDeleteJc) {
        onDeleteJc(num);
      }
    }
  };

  const filteredHistory = historyList.filter(rec => {
    if (mechanicFilter !== 'All Mechanics' && rec.mechanic !== mechanicFilter) return false;
    
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        rec.jcNumber.toLowerCase().includes(q) ||
        rec.customerName.toLowerCase().includes(q) ||
        rec.vehicleNo.toLowerCase().includes(q) ||
        rec.mechanic.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex-1 p-6 md:p-8 flex flex-col gap-6 bg-[#f6f8fc] overflow-y-auto box-border max-w-full text-slate-700 text-left font-sans min-h-[calc(100vh-70px)]">
      
      {/* Navigation Breadcrumb */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors border-none bg-transparent cursor-pointer flex items-center justify-center"
        >
          <ArrowLeft size={20} />
        </button>
        <span className="text-[13px] text-slate-400 font-semibold uppercase tracking-wider">
          Service Management &gt; Service History
        </span>
      </div>

      {/* Top Title Section */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 m-0 tracking-tight font-heading">
            Service History
          </h1>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Manage and review all archived workshop jobs and closed invoices.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-650 font-bold rounded-lg text-xs cursor-pointer bg-white transition-colors shadow-xs"
          >
            <Printer size={14} />
            <span>Print Summary</span>
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-[#184edb] hover:bg-[#143eb3] text-white font-bold rounded-lg text-xs cursor-pointer border-none shadow-md">
            <Download size={14} />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full box-border">
        {/* Closed Jobs */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-100/60 flex items-center justify-between min-h-[85px] box-border relative">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Closed Jobs</span>
            <span className="text-2xl font-extrabold text-slate-800 tracking-tight mt-1 font-heading">18</span>
          </div>
          <div className="bg-blue-50 text-[#184edb] p-2.5 rounded-xl flex items-center justify-center">
            <ClipboardList size={20} />
          </div>
        </div>

        {/* Revenue Managed */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-100/60 flex items-center justify-between min-h-[85px] box-border relative">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Revenue Managed</span>
            <span className="text-2xl font-extrabold text-slate-800 tracking-tight mt-1 font-heading">₹42.5L</span>
          </div>
          <div className="bg-blue-50 text-[#184edb] p-2.5 rounded-xl flex items-center justify-center">
            <CreditCard size={20} />
          </div>
        </div>

        {/* Unique Customers */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-100/60 flex items-center justify-between min-h-[85px] box-border relative">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unique Customers</span>
            <span className="text-2xl font-extrabold text-slate-800 tracking-tight mt-1 font-heading">856</span>
          </div>
          <div className="bg-blue-50 text-[#184edb] p-2.5 rounded-xl flex items-center justify-center">
            <Users size={20} />
          </div>
        </div>

        {/* Efficiency Rate */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-100/60 flex items-center justify-between min-h-[85px] box-border relative">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Efficiency Rate</span>
            <span className="text-2xl font-extrabold text-slate-800 tracking-tight mt-1 font-heading">94.2%</span>
          </div>
          <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-xl flex items-center justify-center">
            <CheckCircle size={20} />
          </div>
        </div>
      </div>

      {/* Filters & Search Header */}
      <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4 w-full box-border">
        <div className="flex items-center gap-3">
          {/* Timeframe Dropdown */}
          <div className="relative">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 rounded-lg py-2 pl-4 pr-10 text-xs text-slate-650 font-bold cursor-pointer outline-none focus:border-[#184edb]"
            >
              <option>Last 30 Days</option>
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 pointer-events-none">
              <ChevronDown size={12} />
            </span>
          </div>

          {/* Mechanic Filter Dropdown */}
          <div className="relative">
            <select
              value={mechanicFilter}
              onChange={(e) => setMechanicFilter(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 rounded-lg py-2 pl-4 pr-10 text-xs text-slate-650 font-bold cursor-pointer outline-none focus:border-[#184edb]"
            >
              <option>All Mechanics</option>
              <option>Suresh Raina</option>
              <option>Amit Mishra</option>
              <option>Vikram Singh</option>
            </select>
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 pointer-events-none">
              <ChevronDown size={12} />
            </span>
          </div>
        </div>

        {/* Right Info */}
        <div className="flex items-center gap-4">
          <span className="text-[12px] text-slate-400 font-semibold">
            Showing {filteredHistory.length} of 1,248 records
          </span>
        </div>
      </div>

      {/* History Ledger Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden w-full flex flex-col box-border">
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse text-left text-slate-650 text-[12.5px]">
            <thead>
              <tr className="bg-slate-50/20 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-6">JC NUMBER</th>
                <th className="py-3.5 px-5">CUSTOMER DETAILS</th>
                <th className="py-3.5 px-5">VEHICLE / MODEL</th>
                <th className="py-3.5 px-5">SERVICE DATE</th>
                <th className="py-3.5 px-5">DELIVERY DATE</th>
                <th className="py-3.5 px-5">MECHANIC</th>
                <th className="py-3.5 px-5 text-right">AMOUNT</th>
                <th className="py-3.5 px-5 text-center">STATUS</th>
                <th className="py-3.5 px-6 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredHistory.map((rec) => (
                <tr key={rec.jcNumber} className="hover:bg-slate-50/20 transition-colors">
                  {/* JC NUMBER */}
                  <td className="py-4 px-6 font-extrabold text-[#184edb] hover:underline cursor-pointer" onClick={() => alert(`View detail details of ${rec.jcNumber}`)}>
                    {rec.jcNumber}
                  </td>

                  {/* CUSTOMER DETAILS */}
                  <td className="py-4 px-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 text-[13.5px]">{rec.customerName}</span>
                      <span className="text-[11px] text-slate-400 font-semibold mt-0.5">
                        {rec.customerPhone} <span className="text-slate-300 mx-0.5">•</span> {rec.customerCode}
                      </span>
                    </div>
                  </td>

                  {/* VEHICLE / MODEL */}
                  <td className="py-4 px-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-850">{rec.vehicleNo}</span>
                      <span className="text-[11px] text-slate-400 font-semibold mt-0.5">
                        {rec.vehicleModel} <span className="text-slate-355 mx-0.5">•</span> {rec.vehicleType}
                      </span>
                    </div>
                  </td>

                  {/* SERVICE DATE */}
                  <td className="py-4 px-5 text-slate-550 whitespace-nowrap">
                    {rec.serviceDate}
                  </td>

                  {/* DELIVERY DATE */}
                  <td className="py-4 px-5 text-slate-550 whitespace-nowrap">
                    {rec.deliveryDate}
                  </td>

                  {/* MECHANIC */}
                  <td className="py-4 px-5 text-slate-750 font-bold">
                    {rec.mechanic}
                  </td>

                  {/* AMOUNT */}
                  <td className="py-4 px-5 text-right text-slate-800 font-extrabold">
                    {rec.amount}
                  </td>

                  {/* STATUS */}
                  <td className="py-4 px-5 text-center whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold border ${
                      rec.status === 'DELIVERED' 
                        ? 'bg-green-50 text-green-600 border-green-100' 
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {rec.status}
                    </span>
                  </td>

                  {/* ACTIONS COLUMN NEXT TO STATUS */}
                  <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1.5">
                      <button 
                        onClick={() => alert(`Viewing history invoice: ${rec.jcNumber}`)}
                        title="View Details"
                        className="p-1.5 bg-blue-50 border border-blue-100 rounded-md text-blue-600 hover:bg-blue-100 cursor-pointer flex items-center justify-center transition-colors shadow-xs"
                      >
                        <Eye size={13} />
                      </button>
                      <button 
                        onClick={() => alert(`Editing history record: ${rec.jcNumber}`)}
                        title="Edit Record"
                        className="p-1.5 bg-green-50 border border-green-100 rounded-md text-green-600 hover:bg-green-100 cursor-pointer flex items-center justify-center transition-colors shadow-xs"
                      >
                        <Edit size={13} />
                      </button>
                      <button 
                        onClick={() => handleDelete(rec.jcNumber)}
                        title="Delete Record"
                        className="p-1.5 bg-red-50 border border-red-100 rounded-md text-red-600 hover:bg-red-100 cursor-pointer flex items-center justify-center transition-colors shadow-xs"
                      >
                        <Trash2 size={13} />
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
            Rows per page: 50
          </span>

          <div className="flex items-center gap-1.5">
            <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 cursor-pointer transition-colors">
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs text-slate-500 font-bold px-2">1-50 of 1,248</span>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 cursor-pointer transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Performance Trend Graph - Spanning Full Width */}
      <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6 w-full box-border">
        <div className="flex flex-col">
          <h3 className="text-sm font-extrabold text-slate-800 m-0 tracking-tight font-heading">
            Service Performance Trend
          </h3>
          <span className="text-[10px] text-slate-400 font-semibold block mt-1">
            Visual overview of job completion speed and customer satisfaction over the last 6 months.
          </span>
        </div>

        <div className="flex flex-col justify-between h-48 w-full mt-4">
          <div className="flex items-end justify-between h-40 px-4 gap-6">
            {/* May */}
            <div className="flex flex-col items-center flex-1 h-full justify-end">
              <div className="w-full bg-[#f1f4fd] hover:bg-blue-100 transition-colors rounded-t-lg h-[30%]" />
              <span className="text-[10px] font-bold text-slate-400 mt-2">MAY</span>
            </div>

            {/* Jun */}
            <div className="flex flex-col items-center flex-1 h-full justify-end">
              <div className="w-full bg-[#f1f4fd] hover:bg-blue-100 transition-colors rounded-t-lg h-[60%]" />
              <span className="text-[10px] font-bold text-slate-400 mt-2">JUN</span>
            </div>

            {/* Jul */}
            <div className="flex flex-col items-center flex-1 h-full justify-end">
              <div className="w-full bg-[#f1f4fd] hover:bg-blue-100 transition-colors rounded-t-lg h-[45%]" />
              <span className="text-[10px] font-bold text-slate-400 mt-2">JUL</span>
            </div>

            {/* Aug */}
            <div className="flex flex-col items-center flex-1 h-full justify-end">
              <div className="w-full bg-[#f1f4fd] hover:bg-blue-100 transition-colors rounded-t-lg h-[75%]" />
              <span className="text-[10px] font-bold text-slate-400 mt-2">AUG</span>
            </div>

            {/* Sep */}
            <div className="flex flex-col items-center flex-1 h-full justify-end">
              <div className="w-full bg-[#f1f4fd] hover:bg-blue-100 transition-colors rounded-t-lg h-[55%]" />
              <span className="text-[10px] font-bold text-slate-400 mt-2">SEP</span>
            </div>

            {/* Oct */}
            <div className="flex flex-col items-center flex-1 h-full justify-end">
              <div className="w-full bg-[#f1f4fd] hover:bg-blue-100 transition-colors rounded-t-lg h-[90%]" />
              <span className="text-[10px] font-bold text-slate-400 mt-2">OCT</span>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default ServiceHistory;
