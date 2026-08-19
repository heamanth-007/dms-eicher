import React, { useState, useEffect, useRef } from 'react';
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
  email?: string;
  specialization?: string;
  annualSalary?: string;
  joiningDate?: string;
  photo?: string;
}

interface MechanicsProps {
  onNavigateToService?: (subTab: 'dashboard' | 'open-job-cards' | 'completed-jobs' | 'service-history' | 'job-queue') => void;
}

export const Mechanics: React.FC<MechanicsProps> = ({ onNavigateToService }) => {
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

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Mechanic record updated.');
  const [isRegistering, setIsRegistering] = useState(false);
  const [currentView, setCurrentView] = useState<'list' | 'jobs' | 'assign' | 'completed'>('list');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Low');
  const [statusFilter, setStatusFilter] = useState('All');

  // Assign Job form state
  const [assignMechanicId, setAssignMechanicId] = useState('');
  const [assignVehicle, setAssignVehicle] = useState('');
  const [assignDeliveryDate, setAssignDeliveryDate] = useState('');
  const [assignNotes, setAssignNotes] = useState('');

  // job cards from backend for dropdowns
  const [jobCards, setJobCards] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/api/jobcards`)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setJobCards(data); })
      .catch(err => console.error('Error fetching jobcards:', err));
  }, []);

  const unassignedJobCards = jobCards.filter(jc =>
    jc.status !== 'COMPLETED' &&
    (!jc.mechanicName || jc.mechanicName.trim() === '' || jc.status === 'OPEN' || jc.status === 'OPENING' || jc.status === 'UNASSIGNED' || jc.status === 'PENDING')
  );

  const handleAssignJob = () => {
    const mechanic = mechanics.find(m => m.id === assignMechanicId);
    if (!mechanic || !assignVehicle) {
      alert('Please select a Mechanic and an Unassigned Job Card.');
      return;
    }
    
    const targetJc = jobCards.find(jc => jc.jcNumber === assignVehicle);
    const successMsg = `Job Card ${assignVehicle} (${targetJc?.vehicleModel || 'Vehicle'}) has been successfully assigned to Mechanic ${mechanic.name}!`;

    fetch(`${API_URL}/api/jobcards/${assignVehicle}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        status: 'ASSIGNED', 
        mechanicName: mechanic.name, 
        mechanicInitials: mechanic.initials,
        expectedDelivery: assignDeliveryDate || 'TBD'
      })
    })
      .then(() => fetch(`${API_URL}/api/mechanics/${assignMechanicId}/assign-job`, { method: 'PUT' }))
      .then(() => {
        fetchMechanics();
        fetch(`${API_URL}/api/jobcards`).then(res => res.json()).then(data => { if (Array.isArray(data)) setJobCards(data); });
        setAssignMechanicId('');
        setAssignVehicle('');
        setAssignDeliveryDate('');
        setAssignNotes('');
        setToastMessage(successMsg);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 5000);
        setCurrentView('jobs');
      })
      .catch(err => console.error('Error assigning job:', err));
  };

  const handleDeleteJobCard = (jcNumber: string) => {
    if (window.confirm(`Are you sure you want to delete Job Card ${jcNumber}?`)) {
      fetch(`${API_URL}/api/jobcards/${jcNumber}`, { method: 'DELETE' })
        .then(() => {
          setJobCards(prev => prev.filter(jc => jc.jcNumber !== jcNumber));
          setToastMessage(`Job Card ${jcNumber} deleted successfully.`);
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3000);
        })
        .catch(err => {
          console.error('Error deleting jobcard:', err);
          setJobCards(prev => prev.filter(jc => jc.jcNumber !== jcNumber));
        });
    }
  };

  const formattedJobCards = jobCards.map(jc => {
    const colors = ['bg-emerald-100 text-emerald-600', 'bg-orange-100 text-orange-600', 'bg-rose-100 text-rose-600', 'bg-blue-100 text-blue-600', 'bg-purple-100 text-purple-650'];
    const charCode = jc.mechanicName ? jc.mechanicName.charCodeAt(0) : 0;
    const mechanicBg = colors[charCode % colors.length];

    let statusDisplay = 'Pending';
    if (jc.status === 'IN PROGRESS') statusDisplay = 'In Progress';
    if (jc.status === 'COMPLETED') statusDisplay = 'Completed';
    if (jc.status === 'ASSIGNED') statusDisplay = 'Pending';
    if (jc.status === 'READY') statusDisplay = 'Waiting for Parts';

    return {
      id: jc.jcNumber,
      mechanic: jc.mechanicName || 'Unassigned',
      mechanicInitials: jc.mechanicInitials || 'UN',
      mechanicBg,
      customer: jc.customerName,
      vehicle: `${jc.vehicleModel} • ${jc.vehicleReg}`,
      serviceType: jc.complaintSummary,
      assigned: jc.inTime,
      expected: jc.expectedDelivery || 'TBD',
      expectedBold: false,
      expectedRed: jc.isDelayed,
      status: statusDisplay,
      priority: jc.isDelayed ? 'High' : 'Medium',
      priorityBg: jc.isDelayed ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-amber-50 text-amber-600 border border-amber-100',
      doneTime: jc.status === 'COMPLETED' ? jc.expectedDelivery : '',
      faded: jc.status === 'COMPLETED',
      mechanicName: jc.mechanicName || 'Unassigned',
      serviceColor: 'text-blue-600',
      serviceBg: 'bg-blue-50 text-blue-600 border border-blue-100',
      inDate: jc.inTime,
      outDate: jc.doneTime || jc.expectedDelivery || 'TBD',
      hours: 'N/A',
      amount: jc.amount ? `₹${jc.amount.toLocaleString('en-IN')}` : 'N/A',
      rating: 5,
      customerName: jc.customerName
    };
  });

  const historyJobs = formattedJobCards.filter(j => j.faded && j.mechanicName !== 'Unassigned');
  const queueJobs = formattedJobCards.filter(j => !j.faded && j.mechanicName !== 'Unassigned');

  const todayJobsCount = queueJobs.length;
  const inProgressCount = queueJobs.filter(jc => jc.status === 'In Progress').length;
  const pendingCount = queueJobs.filter(jc => jc.status === 'Waiting for Parts' || jc.status === 'Pending').length;
  const completedTodayCount = historyJobs.length;

  // Register form states
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [specialization, setSpecialization] = useState('Select Specialization');
  const [annualSalary, setAnnualSalary] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [status, setStatus] = useState('Active');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [editingMechanicId, setEditingMechanicId] = useState<string | null>(null);
  const [viewingMechanic, setViewingMechanic] = useState<MechanicType | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size exceeds 2MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartEditMechanic = (m: MechanicType) => {
    setEditingMechanicId(m.id);
    setFullName(m.name || '');
    setPhoneNumber(m.phone || '');
    setEmailAddress(m.email || '');
    setExperienceYears(m.experience ? m.experience.replace(/[^0-9]/g, '') : '');
    setSpecialization(m.specialization || 'Select Specialization');
    setAnnualSalary(m.annualSalary || '');
    setJoiningDate(m.joiningDate || '');
    setStatus(m.status || 'Active');
    setPhotoUrl(m.photo || '');
    setViewingMechanic(null);
    setIsRegistering(true);
  };

  const handleAssignJobForMechanic = (id: string) => {
    setAssignMechanicId(id);
    setViewingMechanic(null);
    setCurrentView('assign');
  };

  const handleSaveMechanic = () => {
    if (!fullName || !phoneNumber) {
      alert('Please enter Name and Phone Number.');
      return;
    }

    const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const colors = ['bg-emerald-100 text-emerald-600', 'bg-orange-100 text-orange-600', 'bg-rose-100 text-rose-600', 'bg-blue-100 text-blue-600'];

    if (editingMechanicId) {
      const payload = {
        name: fullName,
        phone: phoneNumber,
        email: emailAddress,
        specialization: specialization === 'Select Specialization' ? '' : specialization,
        annualSalary: annualSalary,
        joiningDate: joiningDate,
        photo: photoUrl,
        initials,
        experience: experienceYears ? `${experienceYears} Years` : '1 Year',
        status: status === 'Inactive' ? 'Inactive' : 'Available',
      };

      fetch(`${API_URL}/api/mechanics/${editingMechanicId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(res => res.json())
        .then(() => {
          fetchMechanics();
          setIsRegistering(false);
          setEditingMechanicId(null);
          handleResetForm();
          setToastMessage('Action Successful! Mechanic Profile Updated.');
          setShowToast(true);
          setTimeout(() => {
            setShowToast(false);
          }, 2000);
        })
        .catch(err => console.error('Error updating mechanic:', err));
    } else {
      const newId = `MEC-${Math.floor(1000 + Math.random() * 9000)}`;
      const avatarBg = colors[Math.floor(Math.random() * colors.length)];

      const payload = {
        id: newId,
        name: fullName,
        phone: phoneNumber,
        email: emailAddress,
        specialization: specialization === 'Select Specialization' ? '' : specialization,
        annualSalary: annualSalary,
        joiningDate: joiningDate,
        photo: photoUrl,
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
          setToastMessage('Action Successful! Mechanic Profile Saved.');
          setShowToast(true);
          setTimeout(() => {
            setShowToast(false);
          }, 2000);
        })
        .catch(err => console.error('Error saving mechanic:', err));
    }
  };

  const handleDeleteMechanic = (id: string) => {
    if (window.confirm('Are you sure you want to delete this mechanic profile?')) {
      fetch(`${API_URL}/api/mechanics/${id}`, {
        method: 'DELETE'
      })
        .then(res => res.json())
        .then(() => {
          fetchMechanics();
          setViewingMechanic(null);
          setToastMessage('Action Successful! Mechanic Deleted.');
          setShowToast(true);
          setTimeout(() => {
            setShowToast(false);
          }, 2000);
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
    setEditingMechanicId(null);
    setFullName('');
    setPhoneNumber('');
    setEmailAddress('');
    setExperienceYears('');
    setSpecialization('Select Specialization');
    setAnnualSalary('');
    setJoiningDate('');
    setStatus('Active');
    setPhotoUrl('');
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
              {editingMechanicId ? 'Edit Mechanic Profile' : 'Register New Mechanic'}
            </h1>
            <span className="text-slate-550 text-[14px] font-medium">
              {editingMechanicId ? 'Update specialist information and profile photo.' : 'Add a new specialist to the dealership service roster.'}
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
              {editingMechanicId ? `ID: ${editingMechanicId}` : 'Auto-Gen ID: MEC-8842'}
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
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
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
                    type="date"
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
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handlePhotoChange}
                className="hidden"
              />
              {photoUrl ? (
                <div className="w-full min-h-[120px] bg-[#f0f4ff]/70 border-2 border-dashed border-[#184edb] rounded-xl flex items-center justify-between p-4 box-border">
                  <div className="flex items-center gap-4">
                    <img src={photoUrl} alt="Employee Preview" className="w-16 h-16 rounded-full object-cover border-2 border-[#184edb] shadow-sm" />
                    <div className="flex flex-col">
                      <span className="text-[14px] font-bold text-slate-800">Photo Uploaded Successfully</span>
                      <span className="text-[12px] text-slate-500 font-medium">Employee profile picture is ready for saving</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-2 bg-white border border-slate-300 text-slate-700 text-[12px] font-bold rounded-lg hover:bg-slate-50 cursor-pointer transition-colors shadow-2xs"
                    >
                      Change Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhotoUrl('')}
                      className="px-3.5 py-2 bg-rose-50 border border-rose-200 text-rose-600 text-[12px] font-bold rounded-lg hover:bg-rose-100 cursor-pointer transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full min-h-[120px] bg-[#f0f4ff]/50 border-2 border-dashed border-[#d2d9f9] rounded-xl flex flex-col items-center justify-center p-6 text-center text-slate-555 hover:border-[#184edb] transition-colors cursor-pointer group"
                >
                  <UploadCloud size={30} className="text-[#184edb]/80 mb-2 group-hover:scale-105 transition-transform" />
                  <span className="text-[14px] font-bold text-slate-800 mb-1">Click to upload photo</span>
                  <span className="text-[11px] text-slate-400 font-medium">PNG, JPG or WEBP (Max 2MB)</span>
                </div>
              )}
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
                  <span>{editingMechanicId ? 'Update Mechanic Profile' : 'Save Mechanic Profile'}</span>
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

  const selectedJobCard = jobCards.find(jc => jc.jcNumber === assignVehicle);

  return (
    <div className="flex-1 p-6 md:p-8 flex flex-col gap-6 bg-[#f6f8fc] overflow-y-auto box-border max-w-full font-sans relative">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-6 right-6 bg-emerald-600 text-white shadow-2xl rounded-xl p-4 flex items-center gap-3.5 max-w-sm z-[9999] border border-emerald-500 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="text-emerald-600 bg-white p-2 rounded-lg flex items-center justify-center">
            <CheckCircle2 size={22} />
          </div>
          <div className="flex flex-col gap-0.5 pr-2.5">
            <span className="text-[14px] font-bold text-white">Action Successful</span>
            <span className="text-[12px] text-emerald-100 font-medium">{toastMessage}</span>
          </div>
          <button
            onClick={() => setShowToast(false)}
            className="text-white/80 hover:text-white cursor-pointer border-none bg-transparent p-0.5 ml-auto flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Main Top Header Block with 100% FIXED Tab Switcher Pill Container */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-slate-900 m-0 font-heading tracking-tight">
            Mechanics
          </h1>
          <span className="text-slate-500 text-[13.5px] font-medium">
            Manage dealership technicians, active queue, completed jobs, and assignments.
          </span>
        </div>

        {/* View Switcher Tab Group - PERMANENT & FIXED LOCATION */}
        <div className="bg-slate-100 p-1 rounded-xl flex gap-1 items-center border border-slate-200 shadow-2xs self-start md:self-center">
          <button
            onClick={() => setCurrentView('list')}
            className={`text-[13px] font-bold px-4 py-2.5 rounded-lg border-none cursor-pointer transition-all ${
              currentView === 'list'
                ? 'bg-[#184edb] text-white shadow-sm font-extrabold'
                : 'bg-transparent text-slate-650 hover:text-slate-900'
            }`}
          >
            Roster
          </button>
          <button
            onClick={() => setCurrentView('jobs')}
            className={`text-[13px] font-bold px-4 py-2.5 rounded-lg border-none cursor-pointer transition-all ${
              currentView === 'jobs'
                ? 'bg-[#184edb] text-white shadow-sm font-extrabold'
                : 'bg-transparent text-slate-650 hover:text-slate-900'
            }`}
          >
            Active Jobs
          </button>
          <button
            onClick={() => setCurrentView('completed')}
            className={`text-[13px] font-bold px-4 py-2.5 rounded-lg border-none cursor-pointer transition-all ${
              currentView === 'completed'
                ? 'bg-[#184edb] text-white shadow-sm font-extrabold'
                : 'bg-transparent text-slate-650 hover:text-slate-900'
            }`}
          >
            Completed Jobs
          </button>
          <button
            onClick={() => setCurrentView('assign')}
            className={`text-[13px] font-bold px-4 py-2.5 rounded-lg border-none cursor-pointer transition-all ${
              currentView === 'assign'
                ? 'bg-[#184edb] text-white shadow-sm font-extrabold'
                : 'bg-transparent text-slate-655 hover:text-slate-900'
            }`}
          >
            Assign Job
          </button>
        </div>
      </div>

      {/* VIEW 1: ROSTER (currentView === 'list') */}
      {currentView === 'list' && (
        <>
          {/* Sub-toolbar controls */}
          <div className="flex items-center justify-between gap-3 -mt-2">
            <div className="text-slate-500 text-[13px] font-semibold">
              Technician Roster & Shift Status
            </div>
            <div className="flex items-center gap-3">
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

              {/* Add Mechanic button */}
              <button
                onClick={() => { handleResetForm(); setIsRegistering(true); }}
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
                  <span className="text-2xl font-bold text-slate-800 tracking-tight">{mechanics.length}</span>
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
                  <span className="text-2xl font-bold text-slate-800 tracking-tight">{mechanics.filter(m => m.status === 'Available').length}</span>
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
                  <span className="text-2xl font-bold text-slate-800 tracking-tight">{mechanics.filter(m => m.status === 'Busy').length}</span>
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
                  <span className="text-2xl font-bold text-slate-800 tracking-tight">{mechanics.filter(m => m.status === 'Inactive').length}</span>
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
                      <td className="py-4 px-6 font-semibold text-[#184edb] whitespace-nowrap cursor-pointer hover:underline" onClick={() => setViewingMechanic(m)}>
                        {m.id}
                      </td>
                      {/* Name */}
                      <td className="py-4 px-5 whitespace-nowrap cursor-pointer group" onClick={() => setViewingMechanic(m)}>
                        <div className="flex items-center gap-3">
                          {m.photo ? (
                            <img src={m.photo} alt={m.name} className="w-8.5 h-8.5 rounded-full object-cover border border-slate-200 shadow-2xs group-hover:scale-105 transition-transform" />
                          ) : (
                            <div className={`w-8.5 h-8.5 rounded-full ${m.avatarBg} font-bold text-[12px] flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform`}>
                              {m.initials}
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 group-hover:text-[#184edb] transition-colors">{m.name}</span>
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
                        <div className="flex items-center justify-end gap-2.5">
                          <button onClick={(e) => { e.stopPropagation(); setViewingMechanic(m); }} title="View Technician Details" className="p-1.5 text-blue-600 hover:text-blue-700 bg-blue-50/80 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200/60 cursor-pointer shadow-2xs">
                            <Eye size={15} />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleStartEditMechanic(m); }} title="Edit Technician" className="p-1.5 text-amber-600 hover:text-amber-700 bg-amber-50/80 hover:bg-amber-100 rounded-lg transition-colors border border-amber-200/60 cursor-pointer shadow-2xs">
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleAssignJobForMechanic(m.id); }}
                            title="Assign Job"
                            className="p-1.5 text-emerald-600 hover:text-emerald-700 bg-emerald-50/80 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200/60 cursor-pointer shadow-2xs"
                          >
                            <ClipboardList size={15} />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteMechanic(m.id); }}
                            title="Delete Technician"
                            className="p-1.5 text-rose-600 hover:text-rose-700 bg-rose-50/80 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200/60 cursor-pointer shadow-2xs"
                          >
                            <Trash2 size={15} />
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
                Showing {mechanics.length} mechanics
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
        </>
      )}

      {/* VIEW 2: ACTIVE JOBS (currentView === 'jobs') */}
      {currentView === 'jobs' && (
        <>
          {/* Sub-toolbar controls */}
          <div className="flex items-center justify-between gap-3 -mt-2">
            <div className="text-slate-500 text-[13px] font-semibold">
              Real-time operational overview of current service bay activity
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentView('assign')}
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-250 text-slate-700 font-bold rounded-lg text-[13.5px] cursor-pointer transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="14" y2="12" /><line x1="4" y1="18" x2="9" y2="18" /></svg>
                <span>Filter View</span>
              </button>
              <button
                onClick={() => setCurrentView('assign')}
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
                  <span className="text-2xl font-bold text-slate-800 tracking-tight">{inProgressCount.toString().padStart(2, '0')}</span>
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
                  <span className="text-2xl font-bold text-slate-800 tracking-tight">{pendingCount.toString().padStart(2, '0')}</span>
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
                  <span className="text-2xl font-bold text-slate-800 tracking-tight">{completedTodayCount.toString().padStart(2, '0')}</span>
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

                      {/* Actions */}
                      <td className="py-4.5 px-6 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => onNavigateToService && onNavigateToService('open-job-cards')}
                            className="p-1.5 text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200/60 cursor-pointer transition-all inline-flex items-center shadow-2xs"
                            title="Edit Job Card"
                          >
                            <Pencil size={15} />
                          </button>
                          <button 
                            onClick={() => handleDeleteJobCard(job.id)}
                            className="p-1.5 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200/60 cursor-pointer transition-all inline-flex items-center shadow-2xs"
                            title="Delete Job Card"
                          >
                            <Trash2 size={15} />
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
                Showing {queueJobs.length} active jobs
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
        </>
      )}

      {/* VIEW 3: COMPLETED JOBS (currentView === 'completed') */}
      {currentView === 'completed' && (
        <>
          {/* Sub-toolbar controls */}
          <div className="flex items-center justify-between gap-3 -mt-2">
            <div className="text-slate-500 text-[13px] font-semibold">
              Review final performance metrics and historical service records
            </div>
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
                <span className="text-slate-455 text-[11px] font-bold uppercase tracking-wider">COMPLETED TODAY</span>
                <span className="text-3xl font-extrabold text-[#184edb] tracking-tight">{completedTodayCount}</span>
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
                <span className="text-3xl font-extrabold text-slate-800 tracking-tight">{historyJobs.length}</span>
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
                <span className="text-3xl font-extrabold text-slate-800 tracking-tight">{historyJobs.length}</span>
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
                    <th className="py-4.5 px-5 select-none font-bold">AMOUNT</th>
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

                      {/* Amount */}
                      <td className="py-4.5 px-5 text-slate-700 font-bold whitespace-nowrap">
                        <span className="text-[#184edb] bg-blue-50 px-2 py-1 rounded-md">{job.amount}</span>
                      </td>

                      {/* Actions */}
                      <td className="py-4.5 px-6 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-3.5">
                          <button 
                            onClick={() => onNavigateToService && onNavigateToService('completed-jobs')}
                            className="text-[#184edb] hover:text-[#143eb3] p-1.5 rounded-lg border border-transparent hover:border-slate-200 bg-transparent cursor-pointer transition-all"
                            title="View Completed Job Card"
                          >
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
                Showing {historyJobs.length} completed jobs
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
        </>
      )}

      {/* VIEW 4: ASSIGN JOB (currentView === 'assign') */}
      {currentView === 'assign' && (
        <>
          {/* Sub-toolbar title */}
          <div className="text-slate-500 text-[13px] font-semibold -mt-2">
            Configure job details and allocate an available technician to ensure optimal workflow
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
                        <option value="">Select mechanic...</option>
                        {mechanics.map(m => (
                          <option key={m.id} value={m.id}>{m.name} ({m.status}) — {m.experience}</option>
                        ))}
                      </select>
                      <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 pointer-events-none">
                        <ChevronDown size={18} />
                      </span>
                    </div>
                  </div>

                  {/* Select Job Card */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[11.5px] font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                      <span>SELECT UNASSIGNED JOB CARD *</span>
                      <span className="text-[10px] font-extrabold text-[#184edb] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {unassignedJobCards.length} Opening / Pending Jobs
                      </span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                        <ClipboardList size={18} />
                      </span>
                      <select
                        value={assignVehicle}
                        onChange={e => setAssignVehicle(e.target.value)}
                        className="w-full appearance-none bg-white border border-slate-255 rounded-lg py-2.5 pl-10.5 pr-10 text-[14px] text-slate-700 font-medium cursor-pointer focus:outline-none focus:border-[#184edb] transition-colors"
                      >
                        <option value="">-- Select an unassigned / opening job card --</option>
                        {unassignedJobCards.length > 0 ? (
                          unassignedJobCards.map(jc => (
                            <option key={jc.jcNumber || jc.id} value={jc.jcNumber}>
                              {jc.jcNumber} - {jc.vehicleModel || jc.vehicleNo || 'Vehicle'} ({jc.customerName || 'Customer'}) — [{jc.status || 'OPENING'}]
                            </option>
                          ))
                        ) : (
                          <option disabled value="">No unassigned / opening job cards found (All jobs assigned)</option>
                        )}
                      </select>
                      <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 pointer-events-none">
                        <ChevronDown size={18} />
                      </span>
                    </div>
                  </div>
                </div>

                {/* Assignment Preview Banner */}
                {assignMechanicId && assignVehicle && (
                  <div className="bg-blue-50/90 border border-blue-200 rounded-xl p-4 flex items-center justify-between gap-4 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#184edb] text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm">
                        {mechanics.find(m => m.id === assignMechanicId)?.initials || 'MC'}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Job Assignment Preview</span>
                        <span className="text-[13.5px] font-extrabold text-slate-800">
                          Job <span className="text-[#184edb] font-bold">{assignVehicle}</span> → Assigned to Mechanic <span className="text-[#184edb] font-bold">{mechanics.find(m => m.id === assignMechanicId)?.name}</span>
                        </span>
                      </div>
                    </div>
                    <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
                      Ready to Assign
                    </span>
                  </div>
                )}

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
                
                {selectedJobCard ? (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#184edb]"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-[#184edb] text-[15px]">{selectedJobCard.customerName}</span>
                        <span className="text-slate-455 text-[12.5px] font-semibold">{selectedJobCard.vehicleModel}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 text-[13px] border-t border-slate-100 pt-3">
                      <div className="flex justify-between items-center text-slate-500">
                        <span>Vehicle Reg:</span>
                        <span className="font-bold text-slate-850">{selectedJobCard.vehicleReg}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-500">
                        <span>Service Amount:</span>
                        <span className="font-bold text-emerald-600 bg-emerald-50 px-2 rounded">
                          {selectedJobCard.amount ? `₹${selectedJobCard.amount.toLocaleString('en-IN')}` : 'Est. pending'}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center text-slate-400">
                    <ClipboardList size={32} className="mb-2 opacity-50" />
                    <span className="text-[13px] font-medium">Select a job card to view customer details</span>
                  </div>
                )}
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
                <span className="text-[17px] font-bold text-slate-800">N/A</span>
              </div>
            </div>

            {/* Parts Ready */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 flex items-center gap-4">
              <div className="bg-[#e8eeff] text-[#184edb] p-3 rounded-lg flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></svg>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-slate-500 text-[12.5px] font-bold uppercase tracking-wider">PARTS READY</span>
                <span className="text-[17px] font-bold text-slate-800">N/A</span>
              </div>
            </div>

            {/* Tech Rating */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 flex items-center gap-4">
              <div className="bg-[#e8eeff] text-[#184edb] p-3 rounded-lg flex items-center justify-center">
                <ThumbsUp size={22} />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-slate-500 text-[12.5px] font-bold uppercase tracking-wider">TECH RATING</span>
                <span className="text-[17px] font-bold text-slate-800">N/A</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* View Mechanic Details Modal with Passport Size Photo */}
      {viewingMechanic && (
        <div className="fixed inset-0 z-[9990] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-[#f0f4ff] border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <User className="text-[#184edb]" size={20} />
                <span className="font-bold text-slate-850 text-base">Mechanic Profile Details</span>
              </div>
              <button
                onClick={() => setViewingMechanic(null)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors border-none bg-transparent cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex flex-col md:flex-row gap-6 items-start">
              {/* Passport Photo Box */}
              <div className="flex flex-col items-center gap-2 flex-shrink-0 w-full md:w-auto">
                <div className="w-32 h-40 bg-slate-100 rounded-xl border-2 border-slate-300 shadow-sm flex items-center justify-center overflow-hidden relative">
                  {viewingMechanic.photo ? (
                    <img
                      src={viewingMechanic.photo}
                      alt={viewingMechanic.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-1 text-slate-400 p-2 text-center">
                      <User size={44} className="text-slate-300" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Passport Photo</span>
                    </div>
                  )}
                </div>
                <span className="text-[11px] font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full border border-slate-200">
                  ID: {viewingMechanic.id}
                </span>
              </div>

              {/* Details Grid */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13.5px] w-full">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Full Name</span>
                  <span className="font-bold text-slate-900 text-base">{viewingMechanic.name}</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</span>
                  <span className="mt-0.5">
                    {viewingMechanic.status === 'Available' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Available
                      </span>
                    )}
                    {viewingMechanic.status === 'Busy' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-semibold bg-orange-50 text-orange-600 border border-orange-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Busy
                      </span>
                    )}
                    {viewingMechanic.status === 'Inactive' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-semibold bg-rose-50 text-rose-600 border border-rose-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Inactive
                      </span>
                    )}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Phone Number</span>
                  <span className="font-semibold text-slate-800">{viewingMechanic.phone}</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Email Address</span>
                  <span className="font-semibold text-slate-800">{viewingMechanic.email || 'N/A'}</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Specialization</span>
                  <span className="font-semibold text-slate-800">{viewingMechanic.specialization || 'General Repair'}</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Experience</span>
                  <span className="font-semibold text-slate-800">{viewingMechanic.experience}</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Annual Salary</span>
                  <span className="font-semibold text-emerald-600">
                    {viewingMechanic.annualSalary ? `₹${parseFloat(viewingMechanic.annualSalary).toLocaleString('en-IN')}` : 'N/A'}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Joining Date</span>
                  <span className="font-semibold text-slate-800">{viewingMechanic.joiningDate || 'N/A'}</span>
                </div>

                <div className="flex flex-col sm:col-span-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Assigned Active Jobs</span>
                  <span className="font-bold text-[#184edb]">{viewingMechanic.jobs} Jobs Currently Assigned</span>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between">
              <button
                onClick={() => handleDeleteMechanic(viewingMechanic.id)}
                className="px-4 py-2 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 font-bold rounded-lg text-[13px] cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <Trash2 size={15} /> Delete Profile
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleStartEditMechanic(viewingMechanic)}
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold rounded-lg text-[13px] cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <Pencil size={15} /> Edit Profile
                </button>
                <button
                  onClick={() => handleAssignJobForMechanic(viewingMechanic.id)}
                  className="px-4 py-2 bg-[#184edb] hover:bg-[#143eb3] text-white font-bold rounded-lg text-[13px] cursor-pointer border-none shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <ClipboardList size={15} /> Assign Job
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mechanics;
