import React, { useState } from 'react';
import {
  LayoutGrid,
  ChevronDown,
  Info,
  Calendar,
  Clock,
  ThumbsUp,
  X,
  Star,
  Download,
  RotateCw,
  Hourglass,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText
} from 'lucide-react';

interface ServiceManagementProps {
  onBack?: () => void;
  jobCards?: any[];
  onNavigateToMechanics?: () => void;
  onNavigateToService?: (subTab: string) => void;
}

export const ServiceManagement: React.FC<ServiceManagementProps> = ({ onBack, jobCards, onNavigateToMechanics, onNavigateToService }) => {
  const [view, setView] = useState<'queue' | 'assign'>('queue');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Low');
  const [showToast, setShowToast] = useState(false);
  const [mechanics, setMechanics] = useState<any[]>([]);
  const [selectedMechanic, setSelectedMechanic] = useState('');
  const [selectedJob, setSelectedJob] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  React.useEffect(() => {
    fetch(`${API_URL}/api/mechanics`)
      .then(res => res.json())
      .then(data => setMechanics(data))
      .catch(err => console.error(err));
  }, [API_URL]);

  // Static tech data for Live Availability in Assign Job form
  // Map API jobCards to queue format, falling back to static data if empty
  const activeJobs = jobCards?.filter(jc => jc.status !== 'COMPLETED') || [];
  const unassignedJobs = activeJobs.filter(jc => jc.status === 'PENDING' || !jc.mechanicName || jc.mechanicName === 'Unassigned');
  
  const mappedQueueJobs = activeJobs.map(jc => ({
    id: jc.jcNumber,
    mechanic: jc.mechanicName || 'Unassigned',
    mechanicInitials: jc.mechanicInitials || 'UN',
    mechanicBg: jc.mechanicName ? 'bg-blue-100 text-blue-650' : 'bg-slate-100 text-slate-450',
    customer: jc.customerName,
    vehicle: `${jc.vehicleModel} • ${jc.vehicleReg}`,
    serviceType: jc.complaintSummary,
    assigned: jc.inTime,
    expected: jc.expectedDelivery || 'TBD',
    expectedBold: !!jc.isDelayed,
    expectedRed: !!jc.isDelayed,
    status: jc.status === 'WORKING' ? 'In Progress' : jc.status === 'WAITING PARTS' ? 'Waiting for Parts' : 'Pending',
    priority: jc.isDelayed ? 'High' : 'Medium',
    priorityBg: jc.isDelayed ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-amber-50 text-amber-600 border border-amber-100',
    faded: false,
    doneTime: jc.doneTime as string | undefined
  }));

  const queueJobs = mappedQueueJobs;

  const todayJobsCount = activeJobs.length;
  const inProgressCount = activeJobs.filter(jc => jc.status === 'WORKING').length;
  const pendingCount = activeJobs.filter(jc => jc.status === 'WAITING PARTS' || jc.status === 'ASSIGNED' || jc.status === 'PENDING').length;
  const completedTodayCount = (jobCards || []).filter(jc => jc.status === 'COMPLETED').length;

  if (view === 'assign') {
    return (
      <div className="flex-1 p-6 md:p-8 flex flex-col gap-6 bg-[#f6f8fc] overflow-y-auto box-border max-w-full font-sans relative">
        {/* Toast Notification (Success!) */}
        {showToast && (
          <div className="absolute top-[80px] right-6 md:right-8 bg-white border border-slate-100 shadow-xl rounded-xl overflow-hidden flex items-stretch max-w-sm z-50 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="w-1.5 bg-[#184edb]" />
            <div className="p-4 flex items-center gap-3.5 flex-1">
              <div className="text-[#184edb] bg-blue-50 p-2 rounded-lg flex items-center justify-center border border-blue-100">
                <Info size={20} />
              </div>
              <div className="flex flex-col gap-0.5 pr-2.5">
                <span className="text-[13.5px] font-bold text-slate-800">Success!</span>
                <span className="text-[12px] text-slate-400 font-medium">Job successfully assigned.</span>
              </div>
              <button
                onClick={() => setShowToast(false)}
                className="text-slate-450 hover:text-slate-650 cursor-pointer border-none bg-transparent p-0.5 ml-auto flex items-center justify-center"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-[13px] text-slate-500 font-semibold mb-1">
          <LayoutGrid size={16} className="text-slate-500" />
          <span className="cursor-pointer hover:text-[#184edb] transition-colors" onClick={() => { if(onBack) onBack(); else setView('queue'); }}>Dashboard</span>
          <span>&gt;</span>
          <span className="cursor-pointer hover:text-[#184edb] transition-colors" onClick={() => setView('queue')}>Jobs</span>
          <span>&gt;</span>
          <span className="text-[#184edb] font-bold">Assign Job</span>
        </div>

        {/* Header block */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-slate-900 m-0 font-heading tracking-tight">
            Assign Service Job
          </h1>
          <span className="text-slate-555 text-[14px] font-medium">
            Configure job details and allocate an available technician to ensure optimal workflow.
          </span>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start w-full box-border">
          {/* Left Form Column */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden w-full flex flex-col box-border">
            {/* Card Header */}
            <div className="bg-[#f0f4ff]/80 border-b border-slate-150 px-6 py-4.5 flex items-center gap-2.5">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#184edb]"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
              <span className="font-bold text-slate-800 text-[14.5px]">Job Details & Assignment</span>
            </div>

            {/* Form Content */}
            <div className="p-6 flex flex-col gap-5.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5.5">
                {/* Select Mechanic */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[11.5px] font-bold text-slate-800 uppercase tracking-wider">SELECT MECHANIC</label>
                    <span 
                      onClick={onNavigateToMechanics} 
                      className="text-[#184edb] text-[11.5px] font-bold uppercase tracking-wider cursor-pointer hover:underline"
                    >
                      Manage Mechanics &gt;
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="m21 21-4.3-4.3" /><circle cx="15" cy="11" r="4" /></svg>
                    </span>
                    <select
                      value={selectedMechanic}
                      onChange={(e) => setSelectedMechanic(e.target.value)}
                      className="w-full appearance-none bg-white border border-slate-250 rounded-lg py-2.5 pl-10.5 pr-10 text-[14px] text-slate-700 font-medium cursor-pointer focus:outline-none focus:border-[#184edb] transition-colors"
                    >
                      <option value="">Select an available mechanic...</option>
                      {mechanics.map(m => (
                        <option key={m.id || m._id} value={m.name}>{m.name} ({m.status})</option>
                      ))}
                    </select>
                    <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 pointer-events-none">
                      <ChevronDown size={18} />
                    </span>
                  </div>
                </div>

                {/* Select Job Card */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11.5px] font-bold text-slate-800 uppercase tracking-wider">SELECT JOB CARD</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                      <FileText size={18} />
                    </span>
                    <select
                      value={selectedJob}
                      onChange={(e) => setSelectedJob(e.target.value)}
                      className="w-full appearance-none bg-white border border-slate-250 rounded-lg py-2.5 pl-10.5 pr-10 text-[14px] text-slate-700 font-medium cursor-pointer focus:outline-none focus:border-[#184edb] transition-colors"
                    >
                      <option value="">Select unassigned Job Card...</option>
                      {unassignedJobs.map(jc => (
                        <option key={jc.jcNumber} value={jc.jcNumber}>{jc.jcNumber} - {jc.vehicleReg}</option>
                      ))}
                      {unassignedJobs.length === 0 && <option disabled>No unassigned jobs</option>}
                    </select>
                    <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 pointer-events-none">
                      <ChevronDown size={18} />
                    </span>
                  </div>
                </div>
              </div>

              {/* Service Type / Selected Job Preview */}
              <div className="bg-slate-50/50 p-4 rounded-lg border border-slate-100 flex flex-col gap-2 text-[13px] text-slate-600">
                {selectedJob ? (() => {
                  const job = activeJobs.find(j => j.jcNumber === selectedJob);
                  if (!job) return <span>Job not found</span>;
                  return (
                    <>
                      <div className="flex justify-between items-center"><span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Customer</span><span className="font-semibold text-slate-800">{job.customerName}</span></div>
                      <div className="flex justify-between items-center"><span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Vehicle</span><span className="font-semibold text-slate-800">{job.vehicleModel} • {job.vehicleReg}</span></div>
                      <div className="flex justify-between items-center"><span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Complaint</span><span className="font-semibold text-slate-800">{job.complaintSummary}</span></div>
                    </>
                  )
                })() : <span>Select a Job Card to view details...</span>}
              </div>

              {/* Priority Level */}
              <div className="flex flex-col gap-2.5">
                <span className="text-[11.5px] font-bold text-slate-800 uppercase tracking-wider">PRIORITY LEVEL</span>
                <div className="bg-[#e8eeff] p-1 rounded-xl flex gap-1 self-start w-72">
                  {(['Low', 'Medium', 'High'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setPriority(lvl)}
                      className={`flex-1 text-[13.5px] font-bold py-1.5 rounded-lg border-none cursor-pointer transition-all ${
                        priority === lvl
                          ? 'bg-white text-[#184edb] shadow-sm border border-slate-200'
                          : 'bg-transparent text-slate-600 hover:text-slate-800'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5.5">
                {/* Estimated Completion Date */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11.5px] font-bold text-slate-800 uppercase tracking-wider">ESTIMATED COMPLETION DATE</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                      <Calendar size={18} />
                    </span>
                    <input
                      type="text"
                      placeholder="mm/dd/yyyy"
                      className="w-full pl-10.5 pr-4 py-2.5 text-[14px] bg-[#fff] border border-slate-250 rounded-lg text-slate-800 focus:outline-none focus:border-[#184edb] transition-colors"
                    />
                  </div>
                </div>

                {/* Internal Notes */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11.5px] font-bold text-slate-800 uppercase tracking-wider">INTERNAL NOTES</label>
                  <textarea
                    placeholder="Add specific technical notes for the mechanic..."
                    rows={2}
                    className="w-full px-4 py-2.5 text-[14px] bg-[#fff] border border-slate-250 rounded-lg text-slate-800 focus:outline-none focus:border-[#184edb] transition-colors resize-none font-sans"
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-slate-200 my-2" />

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-4">
                <button
                  onClick={() => setView('queue')}
                  className="px-5 py-2 border-none hover:bg-slate-100 text-slate-700 font-bold rounded-lg text-[14.5px] cursor-pointer bg-transparent transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if(!selectedMechanic || !selectedJob) return alert('Please select a mechanic and a job card.');
                    
                    fetch(`${API_URL}/api/jobcards/${selectedJob}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        mechanicName: selectedMechanic,
                        mechanicInitials: selectedMechanic.split(' ').map(n=>n[0]).join('').toUpperCase(),
                        status: 'ASSIGNED'
                      })
                    })
                    .then(() => {
                      setShowToast(true);
                      setTimeout(() => setView('queue'), 1500);
                    })
                    .catch(err => console.error(err));
                  }}
                  className="px-7 py-2.5 bg-[#184edb] hover:bg-[#143eb3] text-white font-bold rounded-lg text-[14.5px] cursor-pointer border-none shadow-sm transition-colors"
                >
                  Assign Job
                </button>
              </div>
            </div>
          </div>

          {/* Right Columns (Tech List & Customer Profile) */}
          <div className="flex flex-col gap-6 w-full">
            {/* Live Availability Panel */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-4 box-border">
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] font-bold text-slate-800 uppercase tracking-wider">LIVE AVAILABILITY</span>
                <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-wide">
                  REALTIME
                </span>
              </div>

              <div className="flex flex-col gap-3.5">
                {mechanics.map((m, idx) => (
                  <div key={m.id || idx} className="flex items-center justify-between bg-white p-2 rounded-lg hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg text-white ${m.avatarBg || 'bg-slate-300'}`}>
                          {m.initials}
                        </div>
                        <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${m.status === 'Available' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-850 text-[14px]">{m.name}</span>
                        <span className="text-slate-400 text-[12px] font-semibold">{m.experience || 'Technician'}</span>
                      </div>
                    </div>
                    <span className={`text-[12.5px] font-bold ${m.status === 'Available' ? 'text-emerald-600' : 'text-rose-500'}`}>{m.status}</span>
                  </div>
                ))}
              </div>

              <div className="h-px bg-slate-100 my-1" />

              <button className="w-full text-center text-[#184edb] hover:text-[#143eb3] font-bold text-[13.5px] border-none bg-transparent cursor-pointer">
                View Tech Schedule
              </button>
            </div>

            {/* Customer Profile Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-4.5 box-border">
              <span className="text-[12.5px] font-bold text-slate-800 uppercase tracking-wider">CUSTOMER PROFILE</span>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-[#184edb] text-[15px]">{selectedJob ? (activeJobs.find(j => j.jcNumber === selectedJob)?.customerName || 'N/A') : 'Select a Job'}</span>
                  <span className="text-slate-450 text-[12.5px] font-semibold">Customer</span>
                </div>
              </div>
              
              {selectedJob && (() => {
                const job = activeJobs.find(j => j.jcNumber === selectedJob);
                return job ? (
                  <div className="flex flex-col gap-2 text-[13px] border-t border-slate-100 pt-3 mt-1">
                    <div className="flex justify-between items-center text-slate-500">
                      <span>Vehicle Reg:</span>
                      <span className="font-bold text-slate-850">{job.vehicleReg}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500">
                      <span>Service Amount:</span>
                      <span className="font-bold text-emerald-600 bg-emerald-50 px-2 rounded">
                        {job.amount ? `₹${Number(job.amount).toLocaleString('en-IN')}` : 'Est. pending'}
                      </span>
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          </div>
        </div>


      </div>
    );
  }

  // Mechanic Jobs Queue List View (default)
  return (
    <div className="flex-1 p-6 md:p-8 flex flex-col gap-6 bg-[#f6f8fc] overflow-y-auto box-border max-w-full font-sans relative">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-[13px] text-slate-500 font-semibold mb-1">
        <span className="cursor-pointer hover:text-[#184edb]" onClick={onBack}>Dashboard</span>
        <span>/</span>
        <span className="text-[#184edb] font-bold">Active Jobs</span>
      </div>

      {/* Header block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-slate-900 m-0 font-heading tracking-tight">
            Mechanic Jobs
          </h1>
          <span className="text-slate-550 text-[14px] font-medium">
            Real-time operational overview of current service bay activity.
          </span>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView('assign')}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-250 text-slate-700 font-bold rounded-lg text-[13.5px] cursor-pointer transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="14" y2="12" /><line x1="4" y1="18" x2="9" y2="18" /></svg>
            <span>Filter View</span>
          </button>
          <button
            onClick={() => setView('assign')}
            className="flex items-center gap-2 px-5 py-2 bg-[#184edb] hover:bg-[#143eb3] text-white font-bold rounded-lg text-[13.5px] border-none shadow-sm cursor-pointer transition-colors"
          >
            <Download size={14} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {/* Today's Jobs */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex items-center justify-between min-h-[90px] box-border relative">
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 text-[#184edb] p-3 rounded-lg flex items-center justify-center">
              <Calendar size={20} />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-slate-500 text-[12px] font-bold uppercase tracking-wider">TODAY'S JOBS</span>
              <span className="text-2xl font-bold text-slate-800 tracking-tight">{todayJobsCount.toString().padStart(2, '0')}</span>
            </div>
          </div>

        </div>

        {/* In Progress */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex items-center justify-between min-h-[90px] box-border relative">
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 text-[#184edb] p-3 rounded-lg flex items-center justify-center">
              <RotateCw size={20} />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-slate-500 text-[12px] font-bold uppercase tracking-wider">IN PROGRESS</span>
              <span className="text-2xl font-bold text-slate-800 tracking-tight">{inProgressCount.toString().padStart(2, '0')}</span>
            </div>
          </div>

        </div>

        {/* Pending */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex items-center justify-between min-h-[90px] box-border relative">
          <div className="flex items-center gap-4">
            <div className="bg-amber-50 text-amber-600 p-3 rounded-lg flex items-center justify-center">
              <Hourglass size={20} />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-slate-500 text-[12px] font-bold uppercase tracking-wider">PENDING</span>
              <span className="text-2xl font-bold text-slate-800 tracking-tight">{pendingCount.toString().padStart(2, '0')}</span>
            </div>
          </div>

        </div>

        {/* Completed Today */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex items-center justify-between min-h-[90px] box-border relative">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-50 text-emerald-650 p-3 rounded-lg flex items-center justify-center">
              <CheckCircle size={20} />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-slate-500 text-[12px] font-bold uppercase tracking-wider">COMPLETED TODAY</span>
              <span className="text-2xl font-bold text-slate-800 tracking-tight">{completedTodayCount.toString().padStart(2, '0')}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Queue Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden w-full flex flex-col box-border">
        {/* Table Header Filter controls */}
        <div className="px-6 py-4.5 border-b border-slate-150 flex items-center justify-between gap-4">
          <span className="font-bold text-slate-800 text-[14.5px]">Current Service Queue</span>
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-slate-500 font-semibold">Sort by:</span>
            <div className="relative">
              <select className="appearance-none bg-white border border-slate-200 rounded-lg py-1.5 pl-3 pr-8 text-[13px] text-slate-700 font-bold cursor-pointer focus:outline-none focus:border-[#184edb]">
                <option>Priority (Highest)</option>
              </select>
              <span className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-500 pointer-events-none">
                <ChevronDown size={14} />
              </span>
            </div>
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
                <th className="py-4.5 px-5 select-none font-bold">TIMELINE</th>
                <th className="py-4.5 px-5 select-none font-bold">STATUS</th>
                <th className="py-4.5 px-6 select-none font-bold">PRIORITY</th>
                <th className="py-4.5 px-6 select-none font-bold text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[14px]">
              {queueJobs.map((job) => (
                <tr key={job.id} className={`hover:bg-slate-50/50 transition-colors ${job.faded ? 'opacity-55' : ''}`}>
                  {/* Job ID */}
                  <td className={`py-4.5 px-6 font-bold whitespace-nowrap ${job.faded ? 'text-slate-400 line-through' : 'text-[#184edb]'}`}>
                    {job.id}
                  </td>

                  {/* Mechanic */}
                  <td className="py-4.5 px-5 whitespace-nowrap">
                    <div 
                      className={`flex items-center gap-3 ${job.mechanic !== 'Unassigned' ? 'cursor-pointer hover:text-[#184edb] transition-colors' : ''}`}
                      onClick={() => {
                        if (job.mechanic !== 'Unassigned' && onNavigateToMechanics) {
                          onNavigateToMechanics();
                        }
                      }}
                    >
                      <div className={`w-8 h-8 rounded-full ${job.mechanicBg} font-bold text-[12px] flex items-center justify-center`}>
                        {job.mechanicInitials}
                      </div>
                      <span className="font-bold text-slate-800 hover:inherit">{job.mechanic}</span>
                    </div>
                  </td>

                  {/* Customer & Vehicle */}
                  <td className="py-4.5 px-5 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">{job.customer}</span>
                      <span className="text-[12px] text-slate-450 font-semibold">{job.vehicle}</span>
                    </div>
                  </td>

                  {/* Service Type */}
                  <td className="py-4.5 px-5 whitespace-nowrap">
                    <span className={`inline-block px-2.5 py-1 rounded text-[12px] font-semibold ${job.faded ? 'bg-slate-100 text-slate-600' : 'bg-blue-50 text-blue-800'}`}>
                      {job.serviceType}
                    </span>
                  </td>

                  {/* Timeline */}
                  <td className="py-4.5 px-5 whitespace-nowrap">
                    {job.doneTime ? (
                      <span className="text-slate-500 font-semibold text-[13px]">{job.doneTime}</span>
                    ) : (
                      <div className="flex flex-col text-[12.5px] text-slate-550 font-medium">
                        <span>Asgn: {job.assigned}</span>
                        <span className={`${job.expectedRed ? 'text-rose-600 font-bold' : job.expectedBold ? 'font-bold text-slate-800' : ''}`}>
                          Exp: {job.expected}
                        </span>
                      </div>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-4.5 px-5 whitespace-nowrap">
                    {job.status === 'In Progress' && (
                      <span className="inline-flex items-center gap-1.5 text-blue-600 font-semibold text-[13.5px]">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        In Progress
                      </span>
                    )}
                    {job.status === 'Waiting for Parts' && (
                      <span className="inline-flex items-center gap-1.5 text-slate-650 font-semibold text-[13.5px]">
                        <span className="w-2 h-2 rounded-full bg-slate-400" />
                        Waiting for Parts
                      </span>
                    )}
                    {job.status === 'Pending' && (
                      <span className="inline-flex items-center gap-1.5 text-slate-650 font-semibold text-[13.5px]">
                        <Clock size={15} className="text-slate-500" />
                        Pending
                      </span>
                    )}
                    {job.status === 'Completed' && (
                      <span className="inline-flex items-center gap-1.5 text-emerald-600 font-semibold text-[13.5px]">
                        <CheckCircle size={15} className="text-emerald-500" />
                        Completed
                      </span>
                    )}
                  </td>

                  {/* Priority */}
                  <td className="py-4.5 px-6 whitespace-nowrap">
                    <span className={`inline-block px-3 py-1 rounded-full text-[12px] font-bold ${job.priorityBg}`}>
                      {job.priority}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-4.5 px-6 whitespace-nowrap text-right">
                    <button 
                      onClick={() => {
                         if (onNavigateToService) onNavigateToService('open-job-cards');
                      }}
                      className="text-[#184edb] hover:text-[#143eb3] p-1.5 rounded-lg border border-transparent hover:border-slate-200 bg-transparent cursor-pointer transition-all inline-flex items-center"
                      title="View Job Card Details"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="bg-[#f8fafc] border-t border-slate-150 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 w-full box-border">
          <span className="text-[13px] text-slate-500 font-semibold">
            Showing {queueJobs.length} active jobs
          </span>

          <div className="flex items-center gap-1.5">
            <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-50 text-slate-400 cursor-pointer">
              <ChevronLeft size={16} />
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#184edb] text-white font-bold text-[13.5px] border-none shadow-sm cursor-pointer">
              1
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-[13.5px] font-medium cursor-pointer">
              2
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-[13.5px] font-medium cursor-pointer">
              3
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-50 text-slate-400 cursor-pointer">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceManagement;
