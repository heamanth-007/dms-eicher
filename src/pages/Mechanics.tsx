import React, { useState, useEffect } from 'react';
import {
  Users,
  CheckCircle,
  AlertCircle,
  Eye,
  Pencil,
  Trash2,
  ClipboardList,
  ChevronDown,
  CheckCircle2,
  X,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  User,
  Phone,
  Mail,
  Briefcase,
  Wrench,
  Calendar,
  UploadCloud,
  Save,
  Info,
  Banknote,
  ShieldCheck,
  History,
  XCircle,
  RotateCcw,
  LayoutGrid,
  RotateCw,
  Hourglass,
  TrendingUp,
  AlertTriangle,
  Download,
  Clock,
  Car,
  Star,
  ThumbsUp,
  Printer,
  Award,
  Timer,
  SlidersHorizontal,
  FileText
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
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [mechanics, setMechanics] = useState<MechanicType[]>([]);

  const fetchMechanics = () => {
    fetch(`${API_URL}/api/mechanics`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMechanics(data);
        }
      })
      .catch(err => console.error('Error fetching mechanics:', err));
  };

  useEffect(() => {
    fetchMechanics();
  }, []);

  const [showToast, setShowToast] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [currentView, setCurrentView] = useState<'list' | 'jobs' | 'assign' | 'completed'>('list');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Low');
  const [statusFilter, setStatusFilter] = useState('All');
  const [expFilter, setExpFilter] = useState('Any');

  // Assign Job form state
  const [assignMechanicId, setAssignMechanicId] = useState('');
  const [assignCustomer, setAssignCustomer] = useState('');
  const [assignVehicle, setAssignVehicle] = useState('');
  const [assignServiceType, setAssignServiceType] = useState('');
  const [assignDeliveryDate, setAssignDeliveryDate] = useState('');
  const [assignNotes, setAssignNotes] = useState('');

  // Customers and job cards from backend for dropdowns
  const [customers, setCustomers] = useState<any[]>([]);
  const [jobCards, setJobCards] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/api/customers`)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setCustomers(data); })
      .catch(err => console.error('Error fetching customers:', err));

    fetch(`${API_URL}/api/jobcards`)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setJobCards(data); })
      .catch(err => console.error('Error fetching jobcards:', err));
  }, []);

  const handleAssignJob = () => {
    const mechanic = mechanics.find(m => m.id === assignMechanicId);
    if (!mechanic || !assignCustomer || !assignVehicle) {
      alert('Please select a Mechanic, Customer and Vehicle.');
      return;
    }
    const jcNumber = `JC-${Date.now().toString().slice(-6)}`;
    const newJc = {
      jcNumber,
      inTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      customerName: assignCustomer,
      vehicleModel: assignVehicle,
      vehicleReg: assignVehicle,
      complaintSummary: assignServiceType || 'General Service',
      mechanicName: mechanic.name,
      mechanicInitials: mechanic.initials,
      status: 'ASSIGNED',
      expectedDelivery: assignDeliveryDate || 'TBD',
      isDelayed: false,
      readyForPickup: false
    };
    fetch(`${API_URL}/api/jobcards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newJc)
    })
      .then(() => fetch(`${API_URL}/api/mechanics/${assignMechanicId}/assign-job`, { method: 'PUT' }))
      .then(() => {
        fetchMechanics();
        setAssignMechanicId('');
        setAssignCustomer('');
        setAssignVehicle('');
        setAssignServiceType('');
        setAssignDeliveryDate('');
        setAssignNotes('');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4000);
        setCurrentView('jobs');
      })
      .catch(err => console.error('Error assigning job:', err));
  };

  const historyJobs = [
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


  const queueJobs = [
    {
      id: '#JO-8821',
      mechanic: 'Mark Stevens',
      mechanicInitials: 'MS',
      mechanicBg: 'bg-blue-100 text-blue-650',
      customer: 'Jonathan Wick',
      vehicle: '2023 Ford F-150 Raptor',
      serviceType: 'Engine Diagnostics',
      assigned: 'Oct 24',
      expected: 'Oct 25, 14:00',
      expectedBold: true,
      expectedRed: true,
      status: 'In Progress',
      statusDot: 'bg-blue-500',
      statusColor: 'text-blue-600',
      statusBg: 'bg-blue-50 text-blue-600 border-blue-100',
      priority: 'High',
      priorityBg: 'bg-rose-50 text-rose-600 border border-rose-100'
    },
    {
      id: '#JO-8822',
      mechanic: 'Laura Chen',
      mechanicInitials: 'LC',
      mechanicBg: 'bg-purple-100 text-purple-650',
      customer: 'Sarah Miller',
      vehicle: '2021 Toyota Camry Hybrid',
      serviceType: 'Brake Pad Replace',
      assigned: 'Oct 24',
      expected: 'Oct 26, 10:00',
      expectedBold: true,
      expectedRed: false,
      status: 'Waiting for Parts',
      statusDot: 'bg-slate-400',
      statusColor: 'text-slate-600',
      statusBg: 'bg-slate-50 text-slate-650 border-slate-200',
      priority: 'Medium',
      priorityBg: 'bg-amber-50 text-amber-600 border border-amber-100'
    },
    {
      id: '#JO-8825',
      mechanic: 'David Jones',
      mechanicInitials: 'DJ',
      mechanicBg: 'bg-blue-150 text-blue-700',
      customer: 'Robert Evans',
      vehicle: '2024 Chevrolet Silverado',
      serviceType: 'Oil Change & Filter',
      assigned: 'Oct 25',
      expected: 'Oct 25, 17:00',
      expectedBold: false,
      expectedRed: false,
      status: 'Pending',
      statusIcon: 'Clock',
      statusColor: 'text-slate-600',
      priority: 'Low',
      priorityBg: 'bg-blue-50 text-[#184edb] border border-blue-100'
    },
    {
      id: '#JO-8819',
      mechanic: 'Laura Chen',
      mechanicInitials: 'LC',
      mechanicBg: 'bg-slate-100 text-slate-450',
      customer: 'Amanda King',
      vehicle: '2020 Honda CR-V',
      assigned: '',
      expected: '',
      doneTime: 'Done: 09:45 AM',
      status: 'Completed',
      statusIcon: 'CheckCircle',
      statusColor: 'text-emerald-600',
      priority: 'Low',
      priorityBg: 'bg-slate-100 text-slate-500 border border-slate-200',
      faded: true
    }
  ];

  // Register form states
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [specialization, setSpecialization] = useState('Select Specialization');
  const [annualSalary, setAnnualSalary] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [status, setStatus] = useState('Active');

  // mechanicsData removed to use dynamic db state
  
  const handleSaveMechanic = () => {
    if (!fullName || !phoneNumber) {
      alert('Please enter Name and Phone Number.');
      return;
    }

    const newId = `MEC-${Math.floor(1000 + Math.random() * 9000)}`;
    const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    
    // Choose a random color for avatar
    const colors = ['bg-emerald-100 text-emerald-600', 'bg-orange-100 text-orange-600', 'bg-rose-100 text-rose-600', 'bg-blue-100 text-blue-600'];
    const avatarBg = colors[Math.floor(Math.random() * colors.length)];

    const payload = {
      id: newId,
      name: fullName,
      phone: phoneNumber,
      initials,
      avatarBg,
      experience: experienceYears ? `${experienceYears} Years` : '1 Year',
      status: 'Available',
      jobs: 0
    };

    fetch(`${API_URL}/api/mechanics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(() => {
        fetchMechanics();
        setIsRegistering(false);
        handleResetForm();
      })
      .catch(err => console.error('Error saving mechanic:', err));
  };

  const handleDeleteMechanic = (id: string) => {
    if (window.confirm('Are you sure you want to delete this mechanic?')) {
      fetch(`${API_URL}/api/mechanics/${id}`, {
        method: 'DELETE'
      })
        .then(res => res.json())
        .then(() => {
          fetchMechanics();
        })
        .catch(err => console.error('Error deleting mechanic:', err));
    }
  };

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
        <div className="flex items-center gap-2 text-[13px] text-slate-500 font-semibold mb-1">
          <LayoutGrid size={16} className="text-slate-500" />
          <span className="cursor-pointer hover:text-[#184edb] transition-colors" onClick={() => setIsRegistering(false)}>Dashboard</span>
          <span>&gt;</span>
          <span className="cursor-pointer hover:text-[#184edb] transition-colors" onClick={() => setIsRegistering(false)}>Mechanics</span>
          <span>&gt;</span>
          <span className="text-[#184edb] font-bold">Add New</span>
        </div>

        {/* Header block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold text-slate-900 m-0 font-heading tracking-tight">
              Register New Mechanic
            </h1>
            <span className="text-slate-550 text-[14px] font-medium">
              Add a new specialist to the dealership service roster.
            </span>
          </div>

          <button
            onClick={() => setIsRegistering(false)}
            className="flex items-center gap-1.5 px-0 py-2 border-none text-[#184edb] hover:text-[#143eb3] font-bold rounded-lg text-[14px] cursor-pointer bg-transparent transition-colors"
          >
            <History size={16} />
            <span>View Recent Additions</span>
          </button>
        </div>

        {/* Mechanic Info Card Form */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden w-full flex flex-col box-border">
          {/* Light-blue Banner Header */}
          <div className="bg-[#f0f4ff]/80 border-b border-slate-150 px-6 py-4.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#184edb]"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="16" y1="11" x2="22" y2="11" /></svg>
              <span className="font-bold text-slate-800 text-[14.5px]">Mechanic Information</span>
            </div>
            <span className="bg-slate-200/60 text-slate-700 text-[11px] font-bold px-3 py-1 rounded-full">
              Auto-Gen ID: MEC-8842
            </span>
          </div>

          {/* Form Content */}
          <div className="p-6 flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Full Name */}
              <div className="flex flex-col gap-2">
                <label className="text-[11.5px] font-bold text-slate-800 uppercase tracking-wider">FULL NAME *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <User size={18} />
                  </span>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10.5 pr-4 py-2.5 text-[14px] bg-[#fff] border border-slate-250 rounded-lg text-slate-800 focus:outline-none focus:border-[#184edb] transition-colors"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="flex flex-col gap-2">
                <label className="text-[11.5px] font-bold text-slate-800 uppercase tracking-wider">PHONE NUMBER *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Phone size={18} />
                  </span>
                  <input
                    type="text"
                    placeholder="1234567890"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full pl-10.5 pr-4 py-2.5 text-[14px] bg-[#fff] border border-slate-250 rounded-lg text-slate-800 focus:outline-none focus:border-[#184edb] transition-colors"
                  />
                </div>
                <span className="text-[10px] text-slate-400 italic font-medium -mt-0.5 pl-1">Format: 10-digit numeric only</span>
              </div>

              {/* Email Address */}
              <div className="flex flex-col gap-2">
                <label className="text-[11.5px] font-bold text-slate-800 uppercase tracking-wider">EMAIL ADDRESS</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Mail size={18} />
                  </span>
                  <input
                    type="email"
                    placeholder="mechanic@dealership.com"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    className="w-full pl-10.5 pr-4 py-2.5 text-[14px] bg-[#fff] border border-slate-250 rounded-lg text-slate-800 focus:outline-none focus:border-[#184edb] transition-colors"
                  />
                </div>
              </div>

              {/* Experience (Years) */}
              <div className="flex flex-col gap-2">
                <label className="text-[11.5px] font-bold text-slate-800 uppercase tracking-wider">EXPERIENCE (YEARS)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Briefcase size={18} />
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. 5"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className="w-full pl-10.5 pr-4 py-2.5 text-[14px] bg-[#fff] border border-slate-250 rounded-lg text-slate-800 focus:outline-none focus:border-[#184edb] transition-colors"
                  />
                </div>
              </div>

              {/* Specialization */}
              <div className="flex flex-col gap-2">
                <label className="text-[11.5px] font-bold text-slate-800 uppercase tracking-wider">SPECIALIZATION *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Wrench size={18} />
                  </span>
                  <select
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full appearance-none bg-white border border-slate-250 rounded-lg py-2.5 pl-10.5 pr-10 text-[14px] text-slate-700 font-medium cursor-pointer focus:outline-none focus:border-[#184edb] transition-colors"
                  >
                    <option value="Select Specialization">Select Specialization</option>
                    <option value="Diagnostics">Diagnostics</option>
                    <option value="Engine Repair">Engine Repair</option>
                    <option value="Hydraulics">Hydraulics</option>
                    <option value="Electrical Systems">Electrical Systems</option>
                  </select>
                  <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 pointer-events-none">
                    <ChevronDown size={18} />
                  </span>
                </div>
              </div>

              {/* Annual Salary */}
              <div className="flex flex-col gap-2">
                <label className="text-[11.5px] font-bold text-slate-800 uppercase tracking-wider">ANNUAL SALARY (INR) *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Banknote size={18} />
                  </span>
                  <input
                    type="text"
                    placeholder="55000"
                    value={annualSalary}
                    onChange={(e) => setAnnualSalary(e.target.value)}
                    className="w-full pl-10.5 pr-4 py-2.5 text-[14px] bg-[#fff] border border-slate-250 rounded-lg text-slate-800 focus:outline-none focus:border-[#184edb] transition-colors"
                  />
                </div>
                <span className="text-[10px] text-slate-400 italic font-medium -mt-0.5 pl-1">Numeric value without symbols</span>
              </div>

              {/* Joining Date */}
              <div className="flex flex-col gap-2">
                <label className="text-[11.5px] font-bold text-slate-800 uppercase tracking-wider">JOINING DATE</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Calendar size={18} />
                  </span>
                  <input
                    type="text"
                    placeholder="mm/dd/yyyy"
                    value={joiningDate}
                    onChange={(e) => setJoiningDate(e.target.value)}
                    className="w-full pl-10.5 pr-4 py-2.5 text-[14px] bg-[#fff] border border-slate-250 rounded-lg text-slate-800 focus:outline-none focus:border-[#184edb] transition-colors"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="flex flex-col gap-2">
                <label className="text-[11.5px] font-bold text-slate-800 uppercase tracking-wider">STATUS</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <ShieldCheck size={18} />
                  </span>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full appearance-none bg-white border border-slate-250 rounded-lg py-2.5 pl-10.5 pr-10 text-[14px] text-slate-700 font-medium cursor-pointer focus:outline-none focus:border-[#184edb] transition-colors"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 pointer-events-none">
                    <ChevronDown size={18} />
                  </span>
                </div>
              </div>
            </div>

            {/* Photo upload block */}
            <div className="flex flex-col gap-2 mt-2">
              <span className="text-[11.5px] font-bold text-slate-800 uppercase tracking-wider">EMPLOYEE PHOTO</span>
              <div className="w-full min-h-[120px] bg-[#f0f4ff]/50 border-2 border-dashed border-[#d2d9f9] rounded-xl flex flex-col items-center justify-center p-6 text-center text-slate-550 hover:border-[#184edb] transition-colors cursor-pointer group">
                <UploadCloud size={30} className="text-[#184edb]/80 mb-2 group-hover:scale-105 transition-transform" />
                <span className="text-[14px] font-bold text-slate-800 mb-1">Click to upload or drag and drop</span>
                <span className="text-[11px] text-slate-400 font-medium">PNG, JPG or WEBP (Max 2MB)</span>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-slate-200 my-2" />

            {/* Form footer actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-1">
              {/* Cancel button */}
              <button
                onClick={() => setIsRegistering(false)}
                className="flex items-center gap-2 px-4 py-2 border-none hover:bg-slate-100 text-slate-700 font-bold rounded-lg text-[14.5px] cursor-pointer transition-colors bg-transparent"
              >
                <XCircle size={18} className="text-slate-700" />
                <span>Cancel & Exit</span>
              </button>

              {/* Right buttons */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  onClick={handleResetForm}
                  className="flex items-center gap-2 px-5 py-2.5 border border-slate-350 hover:bg-slate-50 text-slate-800 font-semibold rounded-lg text-[14.5px] cursor-pointer transition-all bg-white"
                >
                  <RotateCcw size={16} />
                  <span>Reset Form</span>
                </button>

                <button
                  onClick={handleSaveMechanic}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#184edb] hover:bg-[#143eb3] text-white font-bold rounded-lg text-[14.5px] cursor-pointer transition-all border-none shadow-sm"
                >
                  <Save size={16} />
                  <span>Save Mechanic Profile</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom checklist row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* Onboarding checklist */}
          <div className="bg-[#e8eeff] rounded-xl p-5 flex gap-4.5 box-border border border-[#c7d2fe]/50">
            <div className="text-[#184edb] flex-shrink-0">
              <div className="bg-white w-11 h-11 rounded-full flex items-center justify-center shadow-sm">
                <Info size={22} />
              </div>
            </div>
            <div className="flex flex-col gap-2 pt-1">
              <span className="text-[15.5px] font-bold text-slate-850">Onboarding Checklist</span>
              <ul className="m-0 p-0 list-none flex flex-col gap-1.5 text-[13.5px] text-[#184edb] font-semibold">
                <li>Collect signed contract and NDA</li>
                <li>Issue service department ID badge</li>
                <li>Assign a primary tool-bay and workstation</li>
                <li>Add to dealership payroll system</li>
              </ul>
            </div>
          </div>

          {/* Certification required */}
          <div className="bg-[#e8eeff] rounded-xl p-5 flex gap-4.5 box-border border border-[#c7d2fe]/50">
            <div className="text-[#184edb] flex-shrink-0">
              <div className="bg-white w-11 h-11 rounded-full flex items-center justify-center shadow-sm">
                <ShieldCheck size={22} />
              </div>
            </div>
            <div className="flex flex-col gap-2 pt-1">
              <span className="text-[15.5px] font-bold text-slate-850">Certification Required</span>
              <span className="text-[13.5px] text-slate-550 font-medium leading-relaxed">
                New mechanics must complete the Manufacturer Safety Protocol within 30 days of joining to maintain active status.
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'completed') {
    return (
      <div className="flex-1 p-6 md:p-8 flex flex-col gap-6 bg-[#f6f8fc] overflow-y-auto box-border max-w-full font-sans relative">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-[13px] text-slate-500 font-semibold mb-1">
          <span className="cursor-pointer hover:text-[#184edb] transition-colors" onClick={() => setCurrentView('list')}>Dashboard</span>
          <span>&gt;</span>
          <span className="cursor-pointer hover:text-[#184edb] transition-colors" onClick={() => setCurrentView('list')}>Reports</span>
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
            {/* View Switcher Tab Group */}
            <div className="bg-slate-100 p-1 rounded-xl flex gap-1 items-center border border-slate-200">
              <button
                onClick={() => setCurrentView('list')}
                className="text-[13px] font-bold px-4 py-2.5 rounded-lg border-none cursor-pointer transition-all bg-transparent text-slate-650 hover:text-slate-900"
              >
                Roster
              </button>
              <button
                onClick={() => setCurrentView('jobs')}
                className="text-[13px] font-bold px-4 py-2.5 rounded-lg border-none cursor-pointer transition-all bg-transparent text-slate-650 hover:text-slate-900"
              >
                Active Jobs
              </button>
              <button
                onClick={() => setCurrentView('completed')}
                className="text-[13px] font-bold px-4 py-2.5 rounded-lg border-none cursor-pointer transition-all bg-[#184edb] text-white shadow-sm font-extrabold"
              >
                Completed Jobs
              </button>
              <button
                onClick={() => setCurrentView('assign')}
                className="text-[13px] font-bold px-4 py-2.5 rounded-lg border-none cursor-pointer transition-all bg-transparent text-slate-655 hover:text-slate-900"
              >
                Assign Job
              </button>
            </div>

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
              <span className="text-slate-455 text-[11px] font-bold uppercase tracking-wider">COMPLETED TODAY</span>
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
              <span className="text-slate-455 text-[11px] font-bold uppercase tracking-wider">THIS WEEK</span>
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
              <span className="text-slate-455 text-[11px] font-bold uppercase tracking-wider">THIS MONTH</span>
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
                      <div className="flex flex-col text-[12.5px] text-slate-555 font-medium">
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
  }

  if (currentView === 'assign') {
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
                <span className="text-[12px] text-slate-400 font-medium">Job assigned to David Chen.</span>
              </div>
              <button
                onClick={() => setShowToast(false)}
                className="text-slate-455 hover:text-slate-650 cursor-pointer border-none bg-transparent p-0.5 ml-auto flex items-center justify-center"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-[13px] text-slate-500 font-semibold mb-1">
          <LayoutGrid size={16} className="text-slate-500" />
          <span className="cursor-pointer hover:text-[#184edb] transition-colors" onClick={() => setCurrentView('jobs')}>Dashboard</span>
          <span>&gt;</span>
          <span className="cursor-pointer hover:text-[#184edb] transition-colors" onClick={() => setCurrentView('jobs')}>Jobs</span>
          <span>&gt;</span>
          <span className="text-[#184edb] font-bold">Assign Job</span>
        </div>

        {/* Header block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold text-slate-900 m-0 font-heading tracking-tight">
              Assign Service Job
            </h1>
            <span className="text-slate-555 text-[14px] font-medium">
              Configure job details and allocate an available technician to ensure optimal workflow.
            </span>
          </div>

          {/* View Switcher Tab Group */}
          <div className="bg-slate-100 p-1 rounded-xl flex gap-1 items-center border border-slate-200 self-start sm:self-center">
            <button
              onClick={() => setCurrentView('list')}
              className="text-[13px] font-bold px-4 py-2.5 rounded-lg border-none cursor-pointer transition-all bg-transparent text-slate-650 hover:text-slate-900"
            >
              Roster
            </button>
            <button
              onClick={() => setCurrentView('jobs')}
              className="text-[13px] font-bold px-4 py-2.5 rounded-lg border-none cursor-pointer transition-all bg-transparent text-slate-650 hover:text-slate-900"
            >
              Active Jobs
            </button>
            <button
              onClick={() => setCurrentView('completed')}
              className="text-[13px] font-bold px-4 py-2.5 rounded-lg border-none cursor-pointer transition-all bg-transparent text-slate-650 hover:text-slate-900"
            >
              Completed Jobs
            </button>
            <button
              onClick={() => setCurrentView('assign')}
              className="text-[13px] font-bold px-4 py-2.5 rounded-lg border-none cursor-pointer transition-all bg-[#184edb] text-white shadow-sm font-extrabold"
            >
              Assign Job
            </button>
          </div>
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
                  <label className="text-[11.5px] font-bold text-slate-800 uppercase tracking-wider">SELECT MECHANIC (AVAILABLE ONLY)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="m21 21-4.3-4.3" /><circle cx="15" cy="11" r="4" /></svg>
                    </span>
                    <select
                      value={assignMechanicId}
                      onChange={e => setAssignMechanicId(e.target.value)}
                      className="w-full appearance-none bg-white border border-slate-255 rounded-lg py-2.5 pl-10.5 pr-10 text-[14px] text-slate-700 font-medium cursor-pointer focus:outline-none focus:border-[#184edb] transition-colors"
                    >
                      <option value="">Search available mechanics...</option>
                      {mechanics.filter(m => m.status === 'Available').map(m => (
                        <option key={m.id} value={m.id}>{m.name} — {m.experience}</option>
                      ))}
                    </select>
                    <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 pointer-events-none">
                      <ChevronDown size={18} />
                    </span>
                  </div>
                </div>

                {/* Select Customer */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11.5px] font-bold text-slate-800 uppercase tracking-wider">SELECT CUSTOMER</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                      <User size={18} />
                    </span>
                    <select
                      value={assignCustomer}
                      onChange={e => setAssignCustomer(e.target.value)}
                      className="w-full appearance-none bg-white border border-slate-255 rounded-lg py-2.5 pl-10.5 pr-10 text-[14px] text-slate-700 font-medium cursor-pointer focus:outline-none focus:border-[#184edb] transition-colors"
                    >
                      <option value="">Search customer records...</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                    <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 pointer-events-none">
                      <ChevronDown size={18} />
                    </span>
                  </div>
                </div>

                {/* Select Vehicle */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11.5px] font-bold text-slate-800 uppercase tracking-wider">SELECT VEHICLE / JOB CARD</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                      <Car size={18} />
                    </span>
                    <select
                      value={assignVehicle}
                      onChange={e => setAssignVehicle(e.target.value)}
                      className="w-full appearance-none bg-white border border-slate-255 rounded-lg py-2.5 pl-10.5 pr-10 text-[14px] text-slate-700 font-medium cursor-pointer focus:outline-none focus:border-[#184edb] transition-colors"
                    >
                      <option value="">Identify vehicle VIN/Plate...</option>
                      {jobCards.filter(jc => jc.status !== 'COMPLETED').map(jc => (
                        <option key={jc.jcNumber} value={`${jc.vehicleModel} • ${jc.vehicleReg}`}>
                          {jc.vehicleModel} • {jc.vehicleReg} ({jc.customerName})
                        </option>
                      ))}
                    </select>
                    <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 pointer-events-none">
                      <ChevronDown size={18} />
                    </span>
                  </div>
                </div>

                {/* Service Type */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11.5px] font-bold text-slate-800 uppercase tracking-wider">SERVICE TYPE</label>
                  <input
                    type="text"
                    placeholder="e.g., Brake Pad Replacement"
                    value={assignServiceType}
                    onChange={e => setAssignServiceType(e.target.value)}
                    className="w-full px-4 py-2.5 text-[14px] bg-[#fff] border border-slate-255 rounded-lg text-slate-800 focus:outline-none focus:border-[#184edb] transition-colors"
                  />
                </div>
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
                      type="date"
                      value={assignDeliveryDate}
                      onChange={e => setAssignDeliveryDate(e.target.value)}
                      className="w-full pl-10.5 pr-4 py-2.5 text-[14px] bg-[#fff] border border-slate-255 rounded-lg text-slate-800 focus:outline-none focus:border-[#184edb] transition-colors"
                    />
                  </div>
                </div>

                {/* Internal Notes */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11.5px] font-bold text-slate-800 uppercase tracking-wider">INTERNAL NOTES</label>
                  <textarea
                    placeholder="Add specific technical notes for the mechanic..."
                    rows={2}
                    value={assignNotes}
                    onChange={e => setAssignNotes(e.target.value)}
                    className="w-full px-4 py-2.5 text-[14px] bg-[#fff] border border-slate-255 rounded-lg text-slate-800 focus:outline-none focus:border-[#184edb] transition-colors resize-none font-sans"
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-slate-200 my-2" />

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-4">
                <button
                  onClick={() => setCurrentView('jobs')}
                  className="px-5 py-2 border-none hover:bg-slate-100 text-slate-700 font-bold rounded-lg text-[14.5px] cursor-pointer bg-transparent transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignJob}
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
                {mechanics.slice(0, 3).map((m, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white p-2 rounded-lg hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${m.avatarBg}`}>
                          {m.initials}
                        </div>
                        <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                          m.status === 'Available' ? 'bg-emerald-500' : m.status === 'Busy' ? 'bg-orange-400' : 'bg-slate-400'
                        }`} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-850 text-[14px]">{m.name}</span>
                        <span className="text-slate-400 text-[12px] font-semibold">{m.experience} exp.</span>
                      </div>
                    </div>
                    <span className={`text-[12.5px] font-bold ${
                      m.status === 'Available' ? 'text-emerald-600' : m.status === 'Busy' ? 'text-orange-500' : 'text-slate-400'
                    }`}>{m.status.toUpperCase()}</span>
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
                  <span className="font-bold text-[#184edb] text-[15px]">Alexander Pierce</span>
                  <span className="text-slate-450 text-[12.5px] font-semibold">Platinum Member</span>
                  <div className="flex gap-0.5 text-amber-500">
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 text-[13px] border-t border-slate-100 pt-3">
                <div className="flex justify-between items-center text-slate-500">
                  <span>Active Orders:</span>
                  <span className="font-bold text-slate-850">1</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Last Visit:</span>
                  <span className="font-bold text-slate-850">Mar 12, 2024</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-2">
          {/* Avg Time */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 flex items-center gap-4">
            <div className="bg-[#e8eeff] text-[#184edb] p-3 rounded-lg flex items-center justify-center">
              <Clock size={22} />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-slate-500 text-[12.5px] font-bold uppercase tracking-wider">AVG TIME</span>
              <span className="text-[17px] font-bold text-slate-800">2.4 Hours</span>
            </div>
          </div>

          {/* Parts Ready */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 flex items-center gap-4">
            <div className="bg-[#e8eeff] text-[#184edb] p-3 rounded-lg flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></svg>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-slate-500 text-[12.5px] font-bold uppercase tracking-wider">PARTS READY</span>
              <span className="text-[17px] font-bold text-slate-800">85% In Stock</span>
            </div>
          </div>

          {/* Tech Rating */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 flex items-center gap-4">
            <div className="bg-[#e8eeff] text-[#184edb] p-3 rounded-lg flex items-center justify-center">
              <ThumbsUp size={22} />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-slate-500 text-[12.5px] font-bold uppercase tracking-wider">TECH RATING</span>
              <span className="text-[17px] font-bold text-slate-800">4.9 / 5.0</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'jobs') {
    return (
      <div className="flex-1 p-6 md:p-8 flex flex-col gap-6 bg-[#f6f8fc] overflow-y-auto box-border max-w-full font-sans relative">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-[13px] text-slate-500 font-semibold mb-1">
          <span>Dashboard</span>
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
            {/* View Switcher Tab Group */}
            <div className="bg-slate-100 p-1 rounded-xl flex gap-1 items-center border border-slate-200">
              <button
                onClick={() => setCurrentView('list')}
                className="text-[13px] font-bold px-4 py-2.5 rounded-lg border-none cursor-pointer transition-all bg-transparent text-slate-650 hover:text-slate-900"
              >
                Roster
              </button>
              <button
                onClick={() => setCurrentView('jobs')}
                className="text-[13px] font-bold px-4 py-2.5 rounded-lg border-none cursor-pointer transition-all bg-[#184edb] text-white shadow-sm font-extrabold"
              >
                Active Jobs
              </button>
              <button
                onClick={() => setCurrentView('completed')}
                className="text-[13px] font-bold px-4 py-2.5 rounded-lg border-none cursor-pointer transition-all bg-transparent text-slate-650 hover:text-slate-900"
              >
                Completed Jobs
              </button>
              <button
                onClick={() => setCurrentView('assign')}
                className="text-[13px] font-bold px-4 py-2.5 rounded-lg border-none cursor-pointer transition-all bg-transparent text-slate-655 hover:text-slate-900"
              >
                Assign Job
              </button>
            </div>
            <button
              onClick={() => setCurrentView('assign')}
              className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-250 text-slate-700 font-bold rounded-lg text-[13.5px] cursor-pointer transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="14" y2="12" /><line x1="4" y1="18" x2="9" y2="18" /></svg>
              <span>Filter View</span>
            </button>
            <button
              onClick={() => setCurrentView('assign')}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#184edb] hover:bg-[#143eb3] text-white font-bold rounded-lg text-[13.5px] border-none shadow-sm cursor-pointer transition-colors"
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
                <span className="text-2xl font-bold text-slate-800 tracking-tight">15</span>
              </div>
            </div>
            <span className="absolute top-4 right-4 text-[12px] font-bold text-emerald-600 flex items-center gap-0.5">
              <TrendingUp size={12} />
              +4%
            </span>
          </div>

          {/* In Progress */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex items-center justify-between min-h-[90px] box-border relative">
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 text-[#184edb] p-3 rounded-lg flex items-center justify-center">
                <RotateCw size={20} />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-slate-500 text-[12px] font-bold uppercase tracking-wider">IN PROGRESS</span>
                <span className="text-2xl font-bold text-slate-800 tracking-tight">09</span>
              </div>
            </div>
            <span className="absolute top-4 right-4 text-[12.5px] font-bold text-slate-500">
              60% Total
            </span>
          </div>

          {/* Pending */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex items-center justify-between min-h-[90px] box-border relative">
            <div className="flex items-center gap-4">
              <div className="bg-amber-50 text-amber-600 p-3 rounded-lg flex items-center justify-center">
                <Hourglass size={20} />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-slate-500 text-[12px] font-bold uppercase tracking-wider">PENDING</span>
                <span className="text-2xl font-bold text-slate-800 tracking-tight">03</span>
              </div>
            </div>
            <span className="absolute top-4 right-4 text-[12px] font-bold text-rose-500 flex items-center gap-0.5">
              <AlertTriangle size={12} />
              Priority
            </span>
          </div>

          {/* Completed Today */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex items-center justify-between min-h-[90px] box-border relative">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-50 text-emerald-650 p-3 rounded-lg flex items-center justify-center">
                <CheckCircle size={20} />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-slate-500 text-[12px] font-bold uppercase tracking-wider">COMPLETED TODAY</span>
                <span className="text-2xl font-bold text-slate-800 tracking-tight">03</span>
              </div>
            </div>
            <span className="absolute top-4 right-4 text-[12.5px] font-bold text-slate-500">
              Target: 10
            </span>
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
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${job.mechanicBg} font-bold text-[12px] flex items-center justify-center`}>
                          {job.mechanicInitials}
                        </div>
                        <span className="font-bold text-slate-800">{job.mechanic}</span>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="bg-[#f8fafc] border-t border-slate-150 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 w-full box-border">
            <span className="text-[13px] text-slate-500 font-semibold">
              Showing 4 of 15 active jobs
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
              <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-50 text-slate-650 text-[13.5px] font-medium cursor-pointer">
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
  }

  return (
    <div className="flex-1 p-6 md:p-8 flex flex-col gap-6 bg-[#f6f8fc] overflow-y-auto box-border max-w-full font-sans relative">
      {/* Toast Notification (Action Successful) */}
      {showToast && (
        <div className="absolute top-[80px] right-6 md:right-8 bg-white border border-slate-100 shadow-xl rounded-xl p-4 flex items-center gap-3.5 max-w-sm z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="text-emerald-500 bg-emerald-50 p-2 rounded-lg flex items-center justify-center border border-emerald-100">
            <CheckCircle2 size={20} />
          </div>
          <div className="flex flex-col gap-0.5 pr-2.5">
            <span className="text-[13.5px] font-bold text-slate-800">Action Successful</span>
            <span className="text-[12px] text-slate-400 font-medium">Mechanic record updated.</span>
          </div>
          <button
            onClick={() => setShowToast(false)}
            className="text-slate-450 hover:text-slate-650 cursor-pointer border-none bg-transparent p-0.5 ml-auto flex items-center justify-center"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Header Block with Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-slate-900 m-0 font-heading tracking-tight">
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
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="14" y2="12" /><line x1="4" y1="18" x2="9" y2="18" /></svg>
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-white border border-slate-200 rounded-lg py-2.5 pl-10 pr-10 text-[13.5px] text-slate-700 font-semibold cursor-pointer focus:outline-none focus:border-[#184edb] transition-colors"
            >
              <option value="All">Status: All</option>
              <option value="Available">Available</option>
              <option value="Busy">Busy</option>
              <option value="Inactive">Inactive</option>
            </select>
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 pointer-events-none">
              <ChevronDown size={16} />
            </span>
          </div>

          {/* Exp filter */}
          <div className="relative">
            <select
              value={expFilter}
              onChange={(e) => setExpFilter(e.target.value)}
              className="appearance-none bg-white border border-slate-200 rounded-lg py-2.5 pl-4 pr-10 text-[13.5px] text-slate-700 font-semibold cursor-pointer focus:outline-none focus:border-[#184edb] transition-colors"
            >
              <option value="Any">Exp: Any</option>
              <option value="Senior">Senior</option>
              <option value="Mid">Mid</option>
              <option value="Expert">Expert</option>
              <option value="Junior">Junior</option>
            </select>
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 pointer-events-none">
              <ChevronDown size={16} />
            </span>
          </div>

          {/* View Switcher Tab Group */}
          <div className="bg-slate-100 p-1 rounded-xl flex gap-1 items-center border border-slate-200">
            <button
              onClick={() => setCurrentView('list')}
              className="text-[13px] font-bold px-4 py-2.5 rounded-lg border-none cursor-pointer transition-all bg-[#184edb] text-white shadow-sm font-extrabold"
            >
              Roster
            </button>
            <button
              onClick={() => setCurrentView('jobs')}
              className="text-[13px] font-bold px-4 py-2.5 rounded-lg border-none cursor-pointer transition-all bg-transparent text-slate-650 hover:text-slate-900"
            >
              Active Jobs
            </button>
            <button
              onClick={() => setCurrentView('completed')}
              className="text-[13px] font-bold px-4 py-2.5 rounded-lg border-none cursor-pointer transition-all bg-transparent text-slate-650 hover:text-slate-900"
            >
              Completed Jobs
            </button>
            <button
              onClick={() => setCurrentView('assign')}
              className="text-[13px] font-bold px-4 py-2.5 rounded-lg border-none cursor-pointer transition-all bg-transparent text-slate-655 hover:text-slate-900"
            >
              Assign Job
            </button>
          </div>

          {/* Add Mechanic button */}
          <button
            onClick={() => { setIsRegistering(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#184edb] hover:bg-[#143eb3] text-white font-semibold rounded-lg text-[13.5px] cursor-pointer transition-colors border-none shadow-sm"
          >
            <PlusCircle size={16} />
            <span>Add Mechanic</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {/* Total Mechanics */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex items-center justify-between min-h-[90px] box-border relative">
          <div className="flex items-center gap-4">
            <div className="bg-[#eef2ff] text-[#184edb] p-3 rounded-lg flex items-center justify-center">
              <Users size={20} />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-slate-500 text-[13.5px] font-medium">Total Mechanics</span>
              <span className="text-2xl font-bold text-slate-800 tracking-tight">24</span>
            </div>
          </div>
          <span className="absolute top-4 right-4 bg-emerald-50 text-emerald-600 text-[11px] font-bold px-2 py-0.5 rounded-full border border-emerald-100 uppercase tracking-wide">
            +2 New
          </span>
        </div>

        {/* Available */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex items-center justify-between min-h-[90px] box-border relative">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-50 text-emerald-650 p-3 rounded-lg flex items-center justify-center">
              <CheckCircle size={20} />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-slate-500 text-[13.5px] font-medium">Available</span>
              <span className="text-2xl font-bold text-slate-800 tracking-tight">12</span>
            </div>
          </div>
          <span className="absolute top-4 right-4 text-[13px] text-slate-500 font-semibold">
            50% Ratio
          </span>
        </div>

        {/* Busy */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex items-center justify-between min-h-[90px] box-border relative">
          <div className="flex items-center gap-4">
            <div className="bg-orange-50 text-orange-600 p-3 rounded-lg flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 11h-4" /></svg>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-slate-500 text-[13.5px] font-medium">Busy</span>
              <span className="text-2xl font-bold text-slate-800 tracking-tight">8</span>
            </div>
          </div>
          <span className="absolute top-4 right-4 text-[13px] text-slate-500 font-semibold">
            Active Jobs
          </span>
        </div>

        {/* Inactive */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex items-center justify-between min-h-[90px] box-border relative">
          <div className="flex items-center gap-4">
            <div className="bg-rose-50 text-rose-600 p-3 rounded-lg flex items-center justify-center">
              <AlertCircle size={20} />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-slate-500 text-[13.5px] font-medium">Inactive</span>
              <span className="text-2xl font-bold text-slate-800 tracking-tight">4</span>
            </div>
          </div>
          <span className="absolute top-4 right-4 text-[13px] text-slate-500 font-semibold">
            Off Shift
          </span>
        </div>
      </div>

      {/* Mechanics Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden w-full flex flex-col box-border">
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse text-left text-slate-650">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-slate-100 text-[12px] font-bold text-slate-800 uppercase tracking-wider">
                <th className="py-4.5 px-6 select-none font-bold">ID</th>
                <th className="py-4.5 px-5 select-none font-bold">MECHANIC NAME</th>
                <th className="py-4.5 px-5 select-none font-bold">EXPERIENCE</th>
                <th className="py-4.5 px-5 select-none font-bold">STATUS</th>
                <th className="py-4.5 px-5 select-none font-bold">ASSIGNED JOBS</th>
                <th className="py-4.5 px-6 select-none text-right font-bold">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[14px]">
              {mechanics.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                  {/* ID */}
                  <td className="py-4 px-6 font-semibold text-slate-800 whitespace-nowrap">
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
                  <td className="py-4 px-5 text-slate-700 font-medium whitespace-nowrap">
                    {m.experience}
                  </td>

                  {/* Status */}
                  <td className="py-4 px-5 whitespace-nowrap">
                    {m.status === 'Available' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Available
                      </span>
                    )}
                    {m.status === 'Busy' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold bg-orange-50 text-orange-600 border border-orange-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                        Busy
                      </span>
                    )}
                    {m.status === 'Inactive' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold bg-rose-50 text-rose-600 border border-rose-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        Inactive
                      </span>
                    )}
                  </td>

                  {/* Assigned Jobs */}
                  <td className="py-4 px-5 text-slate-700 font-medium whitespace-nowrap">
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
                      <button
                        onClick={() => setCurrentView('assign')}
                        className="text-[#184edb] hover:text-[#143eb3] p-0 border-none bg-transparent cursor-pointer"
                      >
                        <ClipboardList size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteMechanic(m.id)}
                        className="text-slate-400 hover:text-rose-600 p-0 border-none bg-transparent cursor-pointer"
                      >
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
        <div className="bg-[#eef2ff]/70 border-t border-slate-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 w-full box-border">
          <span className="text-[13px] text-slate-500 font-semibold">
            Showing 1 - 10 of 24 mechanics
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
        <div className="bg-[#e8eeff] rounded-xl p-5 shadow-sm flex flex-col justify-between gap-4 box-border border border-[#c7d2fe]/60">
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">DEPARTMENT LOAD</span>
          </div>

          <div className="flex items-end justify-between h-[90px] px-2">
            {departmentLoadBars.map((bar, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1.5 flex-1">
                <div className="w-6.5 bg-[#184edb] rounded-t-sm transition-all duration-300 relative" style={{ height: bar.height }}>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-[13px] font-semibold text-slate-550 pt-2.5 border-t border-slate-300/40">
            <span>Peak usage: 10:00 AM</span>
            <span className="text-[#184edb] cursor-pointer hover:underline font-bold">
              Details
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mechanics;
