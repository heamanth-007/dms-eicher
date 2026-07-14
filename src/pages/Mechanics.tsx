import React, { useState } from 'react';
import {
  Users,
  CheckCircle,
  AlertCircle,
  Eye,
  Pencil,
  Trash2,
  ClipboardList,
  ChevronDown,
  Filter,
  CheckCircle2,
  X,
  Plus,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Phone,
  Mail,
  Briefcase,
  Wrench,
  DollarSign,
  Calendar,
  UploadCloud,
  RefreshCcw,
  Save,
  Info
} from 'lucide-react';

interface MechanicType {
  id: string;
  name: string;
  phone: string;
  initials: string;
  avatarBg: string;
  experience: string;
  status: 'Available' | 'Busy' | 'Inactive';
  jobs: number;
}

export const Mechanics: React.FC = () => {
  const [showToast, setShowToast] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [expFilter, setExpFilter] = useState('Any');

  // Register form states
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [specialization, setSpecialization] = useState('Select Specialization');
  const [annualSalary, setAnnualSalary] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [status, setStatus] = useState('Active');

  const mechanicsData: MechanicType[] = [
    {
      id: 'MEC-8842',
      name: 'John Ramirez',
      phone: '+1 (555) 012-3456',
      initials: 'JR',
      avatarBg: 'bg-blue-100 text-blue-600',
      experience: '8 Years (Senior)',
      status: 'Available',
      jobs: 0
    },
    {
      id: 'MEC-8843',
      name: 'Sarah Williams',
      phone: '+1 (555) 012-7890',
      initials: 'SW',
      avatarBg: 'bg-purple-100 text-purple-650',
      experience: '4 Years (Mid)',
      status: 'Busy',
      jobs: 2
    },
    {
      id: 'MEC-8844',
      name: 'Michael Tan',
      phone: '+1 (555) 012-1122',
      initials: 'MT',
      avatarBg: 'bg-teal-100 text-teal-600',
      experience: '12 Years (Expert)',
      status: 'Inactive',
      jobs: 0
    },
    {
      id: 'MEC-8845',
      name: 'Anita Patel',
      phone: '+1 (555) 012-3344',
      initials: 'AP',
      avatarBg: 'bg-orange-100 text-orange-600',
      experience: '2 Years (Junior)',
      status: 'Available',
      jobs: 0
    }
  ];

  const departmentLoadBars = [
    { height: '35%', label: '9 AM' },
    { height: '55%', label: '10 AM' },
    { height: '75%', label: '11 AM' },
    { height: '90%', label: '12 PM' },
    { height: '65%', label: '1 PM' },
    { height: '45%', label: '2 PM' },
    { height: '25%', label: '3 PM' }
  ];

  const handleResetForm = () => {
    setFullName('');
    setPhoneNumber('');
    setEmailAddress('');
    setExperienceYears('');
    setSpecialization('Select Specialization');
    setAnnualSalary('');
    setJoiningDate('');
    setStatus('Active');
  };

  // Register New Mechanic View
  if (isRegistering) {
    return (
      <div className="flex-1 p-6 md:p-8 flex flex-col gap-6 bg-[#f6f8fc] overflow-y-auto box-border max-w-full font-sans">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-[13px] text-slate-500 font-medium">
          <span className="cursor-pointer hover:text-[#184edb] transition-colors" onClick={() => setIsRegistering(false)}>Dashboard</span>
          <span>&gt;</span>
          <span className="cursor-pointer hover:text-[#184edb] transition-colors" onClick={() => setIsRegistering(false)}>Mechanics</span>
          <span>&gt;</span>
          <span className="text-[#184edb] font-semibold">Add New</span>
        </div>

        {/* Header block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 m-0 font-heading tracking-tight">
              Register New Mechanic
            </h1>
            <span className="text-slate-500 text-[13.5px] font-medium">
              Add a new specialist to the dealership service roster.
            </span>
          </div>

          <button
            onClick={() => setIsRegistering(false)}
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 hover:border-slate-300 text-[#184edb] font-semibold rounded-lg text-[13px] cursor-pointer bg-white transition-colors"
          >
            <Clock size={15} />
            <span>View Recent Additions</span>
          </button>
        </div>

        {/* Mechanic Info Card Form */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden w-full flex flex-col box-border">
          {/* Light-blue Banner Header */}
          <div className="bg-[#f0f4ff]/50 border-b border-slate-100 px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-[#184edb]">
              <PlusCircle size={18} />
              <span className="font-bold text-slate-800 text-[14.5px]">Mechanic Information</span>
            </div>
            <span className="bg-slate-100 text-slate-600 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-slate-200">
              Auto-Gen ID: MEC-8842
            </span>
          </div>

          {/* Form Content */}
          <div className="p-6 flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">FULL NAME *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <User size={16} />
                  </span>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-[14px] bg-[#fff] border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#184edb] transition-colors"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">PHONE NUMBER *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Phone size={16} />
                  </span>
                  <input
                    type="text"
                    placeholder="1234567890"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-[14px] bg-[#fff] border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#184edb] transition-colors"
                  />
                </div>
                <span className="text-[10px] text-slate-400 italic font-medium -mt-0.5 pl-1">Format: 10-digit numeric only</span>
              </div>

              {/* Email Address */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">EMAIL ADDRESS</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    placeholder="mechanic@dealership.com"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-[14px] bg-[#fff] border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#184edb] transition-colors"
                  />
                </div>
              </div>

              {/* Experience (Years) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">EXPERIENCE (YEARS)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Briefcase size={16} />
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. 5"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-[14px] bg-[#fff] border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#184edb] transition-colors"
                  />
                </div>
              </div>

              {/* Specialization */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">SPECIALIZATION *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Wrench size={16} />
                  </span>
                  <select
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full appearance-none bg-white border border-slate-200 rounded-lg py-2.5 pl-10 pr-10 text-[14px] text-slate-700 font-medium cursor-pointer focus:outline-none focus:border-[#184edb] transition-colors"
                  >
                    <option value="Select Specialization">Select Specialization</option>
                    <option value="Diagnostics">Diagnostics</option>
                    <option value="Engine Repair">Engine Repair</option>
                    <option value="Hydraulics">Hydraulics</option>
                    <option value="Electrical Systems">Electrical Systems</option>
                  </select>
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 pointer-events-none">
                    <ChevronDown size={16} />
                  </span>
                </div>
              </div>

              {/* Annual Salary */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">ANNUAL SALARY (USD) *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <DollarSign size={16} />
                  </span>
                  <input
                    type="text"
                    placeholder="55000"
                    value={annualSalary}
                    onChange={(e) => setAnnualSalary(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-[14px] bg-[#fff] border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#184edb] transition-colors"
                  />
                </div>
                <span className="text-[10px] text-slate-400 italic font-medium -mt-0.5 pl-1">Numeric value without symbols</span>
              </div>

              {/* Joining Date */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">JOINING DATE</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Calendar size={16} />
                  </span>
                  <input
                    type="text"
                    placeholder="mm/dd/yyyy"
                    value={joiningDate}
                    onChange={(e) => setJoiningDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-[14px] bg-[#fff] border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#184edb] transition-colors"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">STATUS</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <CheckCircle size={16} />
                  </span>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full appearance-none bg-white border border-slate-200 rounded-lg py-2.5 pl-10 pr-10 text-[14px] text-slate-700 font-medium cursor-pointer focus:outline-none focus:border-[#184edb] transition-colors"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 pointer-events-none">
                    <ChevronDown size={16} />
                  </span>
                </div>
              </div>
            </div>

            {/* Photo upload block */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">EMPLOYEE PHOTO</span>
              <div className="w-full min-h-[120px] bg-[#f4f6ff]/40 border-2 border-dashed border-[#d2d9f9] rounded-xl flex flex-col items-center justify-center p-6 text-center text-slate-500 hover:border-[#184edb] transition-colors cursor-pointer group">
                <UploadCloud size={28} className="text-[#184edb]/80 mb-2 group-hover:scale-105 transition-transform" />
                <span className="text-[13.5px] font-bold text-slate-750 mb-1">Click to upload or drag and drop</span>
                <span className="text-[11.5px] text-slate-400 font-medium">PNG, JPG or WEBP (Max 2MB)</span>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-slate-100 my-1" />

            {/* Form footer actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Cancel button */}
              <button
                onClick={() => setIsRegistering(false)}
                className="flex items-center gap-1.5 px-4 py-2 border-none hover:bg-slate-100 text-slate-600 font-semibold rounded-lg text-[13.5px] cursor-pointer transition-colors bg-transparent"
              >
                <X size={16} />
                <span>Cancel & Exit</span>
              </button>

              {/* Right buttons */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  onClick={handleResetForm}
                  className="flex items-center gap-1.5 px-4 py-2.5 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg text-[13px] cursor-pointer transition-all bg-white"
                >
                  <RefreshCcw size={14} />
                  <span>Reset Form</span>
                </button>

                <button
                  onClick={() => setIsRegistering(false)}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-[#184edb] hover:bg-[#143eb3] text-white font-semibold rounded-lg text-[13px] cursor-pointer transition-all border-none shadow-sm"
                >
                  <Save size={14} />
                  <span>Save Mechanic Profile</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom checklist row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {/* Onboarding checklist */}
          <div className="bg-[#f0f4ff] rounded-xl p-5 flex gap-4 box-border border border-[#e2e7f8]">
            <div className="text-[#184edb] flex-shrink-0">
              <div className="bg-white p-2.5 rounded-lg flex items-center justify-center shadow-sm">
                <Info size={20} />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[14px] font-bold text-slate-800">Onboarding Checklist</span>
              <ul className="m-0 p-0 pl-1 list-none flex flex-col gap-1.5 text-[12.5px] text-[#184edb] font-semibold">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#184edb]" />
                  Collect signed contract and NDA
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#184edb]" />
                  Issue service department ID badge
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#184edb]" />
                  Assign a primary tool-bay and workstation
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#184edb]" />
                  Add to dealership payroll system
                </li>
              </ul>
            </div>
          </div>

          {/* Certification required */}
          <div className="bg-[#f0f4ff] rounded-xl p-5 flex gap-4 box-border border border-[#e2e7f8]">
            <div className="text-[#184edb] flex-shrink-0">
              <div className="bg-white p-2.5 rounded-lg flex items-center justify-center shadow-sm">
                <CheckCircle size={20} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[14px] font-bold text-slate-800">Certification Required</span>
              <span className="text-[12.5px] text-slate-500 font-medium leading-relaxed">
                New mechanics must complete the Manufacturer Safety Protocol within 30 days of joining to maintain active status.
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-8 flex flex-col gap-6 bg-[#f6f8fc] overflow-y-auto box-border max-w-full font-sans relative">
      {/* Toast Notification (Action Successful) */}
      {showToast && (
        <div className="absolute top-6 right-6 md:right-8 bg-white border border-slate-100 shadow-xl rounded-xl p-4 flex items-center gap-3.5 max-w-sm z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="text-emerald-500 bg-emerald-50 p-2 rounded-lg flex items-center justify-center">
            <CheckCircle2 size={20} />
          </div>
          <div className="flex flex-col gap-0.5 pr-2.5">
            <span className="text-[13.5px] font-bold text-slate-800">Action Successful</span>
            <span className="text-[12px] text-slate-400 font-medium">Mechanic record updated.</span>
          </div>
          <button
            onClick={() => setShowToast(false)}
            className="text-slate-400 hover:text-slate-650 cursor-pointer border-none bg-transparent p-0.5 ml-auto flex items-center justify-center"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-[13px] text-slate-500 font-medium">
        <span className="cursor-pointer hover:text-[#184edb] transition-colors">Dashboard</span>
        <span>&gt;</span>
        <span className="text-[#184edb] font-semibold">Mechanics</span>
      </div>

      {/* Header Block with Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-slate-900 m-0 font-heading tracking-tight">
            Mechanics
          </h1>
          <span className="text-slate-500 text-[13.5px] font-medium">
            Manage dealership technicians and job assignments.
          </span>
        </div>

        {/* Filters and buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status filter */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Filter size={15} />
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-white border border-slate-200 rounded-lg py-2 pl-9 pr-10 text-[13.5px] text-slate-700 font-semibold cursor-pointer focus:outline-none focus:border-[#184edb] transition-colors"
            >
              <option value="All">Status: All</option>
              <option value="Available">Available</option>
              <option value="Busy">Busy</option>
              <option value="Inactive">Inactive</option>
            </select>
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 pointer-events-none">
              <ChevronDown size={14} />
            </span>
          </div>

          {/* Exp filter */}
          <div className="relative">
            <select
              value={expFilter}
              onChange={(e) => setExpFilter(e.target.value)}
              className="appearance-none bg-white border border-slate-200 rounded-lg py-2 pl-4 pr-10 text-[13.5px] text-slate-700 font-semibold cursor-pointer focus:outline-none focus:border-[#184edb] transition-colors"
            >
              <option value="Any">Exp: Any</option>
              <option value="Senior">Senior</option>
              <option value="Mid">Mid</option>
              <option value="Expert">Expert</option>
              <option value="Junior">Junior</option>
            </select>
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 pointer-events-none">
              <ChevronDown size={14} />
            </span>
          </div>

          {/* Add Mechanic button */}
          <button
            onClick={() => { setIsRegistering(true); }}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#184edb] hover:bg-[#143eb3] text-white font-semibold rounded-lg text-[13.5px] cursor-pointer transition-colors border-none shadow-sm"
          >
            <Plus size={16} />
            <span>Add Mechanic</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {/* Total Mechanics */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center justify-between min-h-[90px] box-border">
          <div className="flex flex-col gap-1">
            <span className="text-slate-400 text-[12px] font-bold uppercase tracking-wider">Total Mechanics</span>
            <span className="text-2xl font-bold text-slate-800 tracking-tight">24</span>
          </div>
          <div className="flex flex-col items-end gap-2.5">
            <div className="bg-[#eef2ff] text-[#184edb] p-2 rounded-lg flex items-center justify-center">
              <Users size={18} />
            </div>
            <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-100 uppercase tracking-wide">
              +2 New
            </span>
          </div>
        </div>

        {/* Available */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center justify-between min-h-[90px] box-border">
          <div className="flex flex-col gap-1">
            <span className="text-slate-400 text-[12px] font-bold uppercase tracking-wider">Available</span>
            <span className="text-2xl font-bold text-slate-800 tracking-tight">12</span>
          </div>
          <div className="flex flex-col items-end gap-2.5">
            <div className="bg-emerald-50 text-emerald-650 p-2 rounded-lg flex items-center justify-center">
              <CheckCircle size={18} />
            </div>
            <span className="text-[11.5px] text-slate-500 font-semibold uppercase tracking-wider">
              50% Ratio
            </span>
          </div>
        </div>

        {/* Busy */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center justify-between min-h-[90px] box-border">
          <div className="flex flex-col gap-1">
            <span className="text-slate-400 text-[12px] font-bold uppercase tracking-wider">Busy</span>
            <span className="text-2xl font-bold text-slate-800 tracking-tight">8</span>
          </div>
          <div className="flex flex-col items-end gap-2.5">
            <div className="bg-orange-50 text-orange-600 p-2 rounded-lg flex items-center justify-center">
              <Users size={18} />
            </div>
            <span className="text-[11.5px] text-slate-500 font-semibold uppercase tracking-wider">
              Active Jobs
            </span>
          </div>
        </div>

        {/* Inactive */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center justify-between min-h-[90px] box-border">
          <div className="flex flex-col gap-1">
            <span className="text-slate-400 text-[12px] font-bold uppercase tracking-wider">Inactive</span>
            <span className="text-2xl font-bold text-slate-800 tracking-tight">4</span>
          </div>
          <div className="flex flex-col items-end gap-2.5">
            <div className="bg-rose-50 text-rose-600 p-2 rounded-lg flex items-center justify-center">
              <AlertCircle size={18} />
            </div>
            <span className="text-[11.5px] text-slate-500 font-semibold uppercase tracking-wider">
              Off Shift
            </span>
          </div>
        </div>
      </div>

      {/* Mechanics Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden w-full flex flex-col box-border">
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse text-left text-slate-600">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-slate-100 text-[11px] font-bold text-slate-555 uppercase tracking-wider">
                <th className="py-4 px-6 select-none">ID</th>
                <th className="py-4 px-5 select-none">MECHANIC NAME</th>
                <th className="py-4 px-5 select-none">EXPERIENCE</th>
                <th className="py-4 px-5 select-none">STATUS</th>
                <th className="py-4 px-5 select-none">ASSIGNED JOBS</th>
                <th className="py-4 px-6 select-none text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[13.5px]">
              {mechanicsData.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                  {/* ID */}
                  <td className="py-4 px-6 font-bold text-slate-800 whitespace-nowrap">
                    {m.id}
                  </td>

                  {/* Name */}
                  <td className="py-4 px-5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${m.avatarBg} font-bold text-[12px] flex items-center justify-center`}>
                        {m.initials}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{m.name}</span>
                        <span className="text-[11.5px] text-slate-400 font-medium">{m.phone}</span>
                      </div>
                    </div>
                  </td>

                  {/* Experience */}
                  <td className="py-4 px-5 text-slate-700 font-semibold whitespace-nowrap">
                    {m.experience}
                  </td>

                  {/* Status */}
                  <td className="py-4 px-5 whitespace-nowrap">
                    {m.status === 'Available' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11.5px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Available
                      </span>
                    )}
                    {m.status === 'Busy' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11.5px] font-bold bg-amber-50 text-amber-600 border border-amber-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        Busy
                      </span>
                    )}
                    {m.status === 'Inactive' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11.5px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        Inactive
                      </span>
                    )}
                  </td>

                  {/* Assigned Jobs */}
                  <td className="py-4 px-5 text-slate-700 font-semibold whitespace-nowrap">
                    {m.jobs} Jobs
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="flex items-center justify-end gap-3.5">
                      <button className="text-slate-400 hover:text-slate-650 p-0 border-none bg-transparent cursor-pointer">
                        <Eye size={16} />
                      </button>
                      <button className="text-slate-400 hover:text-slate-650 p-0 border-none bg-transparent cursor-pointer">
                        <Pencil size={16} />
                      </button>
                      <button className="text-[#184edb] hover:text-[#143eb3] p-0 border-none bg-transparent cursor-pointer">
                        <ClipboardList size={16} />
                      </button>
                      <button className="text-slate-400 hover:text-rose-600 p-0 border-none bg-transparent cursor-pointer">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="bg-[#f8fafc] border-t border-slate-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 w-full box-border">
          <span className="text-[13px] text-slate-500 font-medium">
            Showing 1 - 10 of 24 mechanics
          </span>

          <div className="flex items-center gap-1.5">
            <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 cursor-pointer">
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
            <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 cursor-pointer">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Panel (Scheduler and Load Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch w-full box-border">
        {/* Automated Shift Scheduler */}
        <div className="lg:col-span-2 bg-[#184edb] text-white rounded-xl p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-6 box-border">
          <div className="flex flex-col gap-2 max-w-xl">
            <span className="text-lg font-bold">Automated Shift Scheduler</span>
            <p className="text-blue-100 text-[13.5px] font-medium leading-relaxed m-0">
              The system has detected 3 upcoming major services. Would you like to auto-assign mechanics based on availability and specialized experience?
            </p>
          </div>
          <button className="bg-white hover:bg-blue-50 text-[#184edb] font-bold text-[13.5px] px-5 py-2.5 rounded-lg border-none shadow-sm cursor-pointer transition-colors whitespace-nowrap self-start sm:self-center">
            Optimize Schedule
          </button>
        </div>

        {/* Department Load */}
        <div className="bg-[#e0e7ff] rounded-xl p-5 shadow-sm flex flex-col justify-between gap-4 box-border border border-[#c7d2fe]">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest">DEPARTMENT LOAD</span>
          </div>

          <div className="flex items-end justify-between h-[80px] px-2">
            {departmentLoadBars.map((bar, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1.5 flex-1 group">
                <div className="w-5 bg-[#184edb] rounded-t-sm transition-all duration-300 relative" style={{ height: bar.height }}>
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] font-bold px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap mb-1">
                    {bar.height}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-[11.5px] font-bold text-slate-500 pt-1 border-t border-slate-200/40">
            <span>Peak usage: 10:00 AM</span>
            <span className="text-[#184edb] cursor-pointer hover:underline flex items-center gap-0.5">
              Details
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mechanics;
