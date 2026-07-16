import React from 'react';
import {
  Calendar,
  SlidersHorizontal,
  TrendingUp,
  AlertCircle,
  Download,
  Printer,
  Eye,
  FileText,
  ChevronLeft,
  ChevronRight,
  Star,
  Award,
  Timer
} from 'lucide-react';

interface HistoryJobType {
  id: string;
  mechanicName: string;
  mechanicInitials: string;
  mechanicBg: string;
  customerName: string;
  vehicle: string;
  serviceType: string;
  serviceBg: string;
  serviceColor: string;
  inDate: string;
  outDate: string;
  hours: string;
  rating: number;
}

export const Reports: React.FC = () => {
  const historyJobs: HistoryJobType[] = [
    {
      id: '#JOB-22481',
      mechanicName: 'Mark Benson',
      mechanicInitials: 'MB',
      mechanicBg: 'bg-blue-100 text-blue-650',
      customerName: 'Elena Rodriguez',
      vehicle: 'Tesla Model 3 • ABC-1234',
      serviceType: 'WARRANTY REPAIR',
      serviceBg: 'bg-blue-50 text-blue-600 border border-blue-100',
      serviceColor: 'text-blue-600',
      inDate: '12 Oct',
      outDate: '14 Oct',
      hours: '14.5 hrs',
      rating: 5
    },
    {
      id: '#JOB-22479',
      mechanicName: 'John Harrison',
      mechanicInitials: 'JH',
      mechanicBg: 'bg-indigo-50 text-indigo-600',
      customerName: 'Sam Wilson',
      vehicle: 'Ford F-150 • XYZ-9876',
      serviceType: 'ROUTINE SERVICE',
      serviceBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
      serviceColor: 'text-emerald-600',
      inDate: '14 Oct',
      outDate: '14 Oct',
      hours: '2.0 hrs',
      rating: 4
    },
    {
      id: '#JOB-22475',
      mechanicName: 'Andre Lopez',
      mechanicInitials: 'AL',
      mechanicBg: 'bg-[#e0e7ff] text-[#4f46e5]',
      customerName: 'Sarah Connor',
      vehicle: 'Toyota Camry • T800-444',
      serviceType: 'ENGINE REBUILD',
      serviceBg: 'bg-orange-50 text-orange-655 border border-orange-100',
      serviceColor: 'text-orange-655',
      inDate: '05 Oct',
      outDate: '13 Oct',
      hours: '48.0 hrs',
      rating: 5
    }
  ];

  return (
    <div className="flex-1 p-6 md:p-8 flex flex-col gap-6 bg-[#f6f8fc] overflow-y-auto box-border max-w-full font-sans relative">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-[13px] text-slate-500 font-semibold mb-1">
        <span className="cursor-pointer hover:text-[#184edb] transition-colors">Dashboard</span>
        <span>&gt;</span>
        <span className="cursor-pointer hover:text-[#184edb] transition-colors">Reports</span>
        <span>&gt;</span>
        <span className="text-[#184edb] font-bold">Completed Jobs</span>
      </div>

      {/* Title & Description Block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-slate-900 m-0 font-heading tracking-tight">
            Completed Jobs Analysis
          </h1>
          <span className="text-slate-500 text-[14px] font-medium">
            Review final performance metrics and historical service records.
          </span>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-lg text-[13.5px] cursor-pointer transition-colors shadow-sm">
            <Calendar size={15} className="text-slate-500" />
            <span>Date Range</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-lg text-[13.5px] cursor-pointer transition-colors shadow-sm">
            <SlidersHorizontal size={15} className="text-slate-500" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {/* Completed Today */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex items-center justify-between min-h-[105px] box-border relative overflow-hidden">
          <div className="flex flex-col gap-1 z-10">
            <span className="text-slate-450 text-[11px] font-bold uppercase tracking-wider">COMPLETED TODAY</span>
            <span className="text-3xl font-extrabold text-[#184edb] tracking-tight">12</span>
            <span className="text-[11.5px] font-bold text-emerald-600 flex items-center gap-0.5 mt-1">
              <TrendingUp size={13} />
              +8% from yesterday
            </span>
          </div>
          {/* Background Decorative SVG */}
          <div className="absolute right-0 bottom-0 opacity-15 translate-x-2 translate-y-2 pointer-events-none">
            <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="40" stroke="#184edb" strokeWidth="6" />
              <path d="M35 50 L45 60 L65 40" stroke="#184edb" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          {/* Circular Icon in Top Right */}
          <div className="bg-blue-50 text-[#184edb] p-2 rounded-lg flex items-center justify-center border border-blue-100 absolute top-4 right-4 z-10">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="m9 12 2 2 4-4" /></svg>
          </div>
        </div>

        {/* This Week */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex items-center justify-between min-h-[105px] box-border relative overflow-hidden">
          <div className="flex flex-col gap-1 z-10">
            <span className="text-slate-450 text-[11px] font-bold uppercase tracking-wider">THIS WEEK</span>
            <span className="text-3xl font-extrabold text-slate-800 tracking-tight">84</span>
            <span className="text-[11.5px] font-bold text-emerald-600 flex items-center gap-0.5 mt-1">
              <TrendingUp size={13} />
              +12% from last week
            </span>
          </div>
          {/* Background Decorative SVG */}
          <div className="absolute right-0 bottom-0 opacity-15 translate-x-2 translate-y-2 pointer-events-none">
            <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
              <rect x="25" y="25" width="50" height="50" rx="6" stroke="#4f46e5" strokeWidth="6" />
              <line x1="25" y1="40" x2="75" y2="40" stroke="#4f46e5" strokeWidth="5" />
            </svg>
          </div>
          {/* Circular Icon in Top Right */}
          <div className="bg-purple-50 text-[#4f46e5] p-2 rounded-lg flex items-center justify-center border border-purple-100 absolute top-4 right-4 z-10">
            <Calendar size={18} />
          </div>
        </div>

        {/* This Month */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex items-center justify-between min-h-[105px] box-border relative overflow-hidden">
          <div className="flex flex-col gap-1 z-10">
            <span className="text-slate-450 text-[11px] font-bold uppercase tracking-wider">THIS MONTH</span>
            <span className="text-3xl font-extrabold text-slate-800 tracking-tight">342</span>
            <span className="text-[12px] font-semibold text-[#184edb] flex items-center gap-1.5 mt-1">
              <AlertCircle size={14} />
              Target: 400 jobs
            </span>
          </div>
          {/* Background Decorative SVG */}
          <div className="absolute right-0 bottom-0 opacity-15 translate-x-2 translate-y-2 pointer-events-none">
            <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
              <rect x="25" y="60" width="12" height="20" fill="#184edb" />
              <rect x="44" y="40" width="12" height="40" fill="#184edb" />
              <rect x="63" y="25" width="12" height="55" fill="#184edb" />
            </svg>
          </div>
          {/* Circular Icon in Top Right */}
          <div className="bg-blue-50 text-[#184edb] p-2 rounded-lg flex items-center justify-center border border-blue-100 absolute top-4 right-4 z-10">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
          </div>
        </div>
      </div>

      {/* Service History Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden w-full flex flex-col box-border">
        {/* Card Header */}
        <div className="px-6 py-4.5 border-b border-slate-150 flex items-center justify-between gap-4">
          <span className="font-bold text-slate-800 text-[15.5px]">Service History</span>
          <div className="flex items-center gap-3.5">
            <button className="text-slate-400 hover:text-slate-655 p-1.5 rounded-lg border border-transparent hover:border-slate-150 bg-transparent cursor-pointer transition-all">
              <Download size={18} />
            </button>
            <button className="text-slate-400 hover:text-slate-655 p-1.5 rounded-lg border border-transparent hover:border-slate-150 bg-transparent cursor-pointer transition-all">
              <Printer size={18} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse text-left text-slate-650">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-slate-200 text-[11.5px] font-bold text-slate-800 uppercase tracking-wider">
                <th className="py-4.5 px-6 select-none font-bold">JOB ID</th>
                <th className="py-4.5 px-5 select-none font-bold">MECHANIC</th>
                <th className="py-4.5 px-5 select-none font-bold">CUSTOMER & VEHICLE</th>
                <th className="py-4.5 px-5 select-none font-bold">SERVICE TYPE</th>
                <th className="py-4.5 px-5 select-none font-bold">DATES</th>
                <th className="py-4.5 px-5 select-none font-bold">TOTAL HOURS</th>
                <th className="py-4.5 px-5 select-none font-bold">RATING</th>
                <th className="py-4.5 px-6 select-none text-right font-bold">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[14px]">
              {historyJobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50/50 transition-colors">
                  {/* Job ID */}
                  <td className="py-4.5 px-6 font-bold text-[#184edb] whitespace-nowrap">
                    {job.id}
                  </td>

                  {/* Mechanic */}
                  <td className="py-4.5 px-5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${job.mechanicBg} font-bold text-[12px] flex items-center justify-center`}>
                        {job.mechanicInitials}
                      </div>
                      <span className="font-bold text-slate-850">{job.mechanicName}</span>
                    </div>
                  </td>

                  {/* Customer & Vehicle */}
                  <td className="py-4.5 px-5 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">{job.customerName}</span>
                      <span className="text-[12px] text-slate-450 font-semibold">{job.vehicle}</span>
                    </div>
                  </td>

                  {/* Service Type */}
                  <td className="py-4.5 px-5 whitespace-nowrap">
                    <span className={`inline-block px-2.5 py-1 rounded text-[11px] font-extrabold uppercase tracking-wide ${job.serviceBg}`}>
                      {job.serviceType}
                    </span>
                  </td>

                  {/* Dates */}
                  <td className="py-4.5 px-5 whitespace-nowrap">
                    <div className="flex flex-col text-[12.5px] text-slate-550 font-medium">
                      <span>In: {job.inDate}</span>
                      <span className="text-[#184edb] font-bold">
                        Out: {job.outDate}
                      </span>
                    </div>
                  </td>

                  {/* Total Hours */}
                  <td className="py-4.5 px-5 text-slate-700 font-bold whitespace-nowrap">
                    {job.hours}
                  </td>

                  {/* Rating */}
                  <td className="py-4.5 px-5 whitespace-nowrap">
                    <div className="flex gap-0.5 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={15}
                          fill={i < job.rating ? 'currentColor' : 'none'}
                          className={i < job.rating ? 'text-amber-550' : 'text-slate-300'}
                        />
                      ))}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-4.5 px-6 whitespace-nowrap">
                    <div className="flex items-center justify-end gap-3.5">
                      <button className="text-slate-400 hover:text-slate-655 p-0 border-none bg-transparent cursor-pointer">
                        <Eye size={16} />
                      </button>
                      <button className="text-slate-400 hover:text-slate-655 p-0 border-none bg-transparent cursor-pointer">
                        <Printer size={16} />
                      </button>
                      <button className="text-slate-400 hover:text-slate-655 p-0 border-none bg-transparent cursor-pointer">
                        <FileText size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="bg-[#f8fafc] border-t border-slate-150 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 w-full box-border">
          <span className="text-[13px] text-slate-500 font-semibold">
            Showing 1 to 10 of 342 jobs
          </span>

          <div className="flex items-center gap-1.5">
            <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-50 text-slate-400 cursor-pointer">
              <ChevronLeft size={16} />
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#184edb] text-white font-bold text-[13.5px] border-none shadow-sm cursor-pointer">
              1
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-50 text-slate-650 text-[13.5px] font-medium cursor-pointer">
              2
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-50 text-slate-655 text-[13.5px] font-medium cursor-pointer">
              3
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-50 text-slate-400 cursor-pointer">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Highlights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-2">
        {/* Customer Satisfaction Peak */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 flex items-start gap-4 shadow-sm">
          <div className="bg-[#e8eeff] text-[#184edb] p-3 rounded-lg flex items-center justify-center border border-[#184edb]/10">
            <Award size={22} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[15.5px] font-extrabold text-slate-800">Customer Satisfaction Peak</span>
            <p className="text-slate-500 text-[13.5px] font-medium leading-relaxed m-0">
              Average rating for completed jobs this week is 4.85 stars. Warranty repairs show highest satisfaction rate at 98%.
            </p>
          </div>
        </div>

        {/* Efficiency Milestone */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 flex items-start gap-4 shadow-sm">
          <div className="bg-[#e8eeff] text-[#184edb] p-3 rounded-lg flex items-center justify-center border border-[#184edb]/10">
            <Timer size={22} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[15.5px] font-extrabold text-slate-800">Efficiency Milestone</span>
            <p className="text-slate-500 text-[13.5px] font-medium leading-relaxed m-0">
              Turnaround time decreased by 12 minutes on average for standard 5k services compared to last month.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
