import React, { useState } from 'react';
import { AddJobCard } from './AddJobCard';
import { OpenJobCards } from './OpenJobCards';
import { CompletedJobs } from './CompletedJobs';
import { ServiceHistory } from './ServiceHistory';
import {
  ClipboardList,
  UserCheck,
  Wrench,
  CreditCard,
  Clock,
  CheckCircle,
  ShoppingCart,
  Users,
  ChevronDown,
  Plus,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Filter
} from 'lucide-react';

interface JobCard {
  jcNumber: string;
  inTime: string;
  customerName: string;
  vehicleModel: string;
  vehicleReg: string;
  complaintSummary: string;
  mechanicName: string;
  mechanicInitials: string;
  status: 'WORKING' | 'WAITING PARTS' | 'ASSIGNED' | 'COMPLETED';
  expectedDelivery: string;
  isDelayed?: boolean;
  readyForPickup?: boolean;
}

interface ServiceDashboardProps {
  subTab: 'dashboard' | 'open-job-cards' | 'completed-jobs' | 'service-history';
  setSubTab: (tab: any) => void;
  searchTerm: string;
}

export const ServiceDashboard: React.FC<ServiceDashboardProps> = ({
  subTab,
  setSubTab,
  searchTerm
}) => {
  const [statusFilter, setStatusFilter] = useState('All');
  const [isCreatingJobCard, setIsCreatingJobCard] = useState(false);

  const [jobCards, setJobCards] = useState<JobCard[]>([
    {
      jcNumber: 'JC-2023-8841',
      inTime: '09:15 AM',
      customerName: 'Mohan Logistics',
      vehicleModel: 'Eicher Pro 3015',
      vehicleReg: 'MH-12-PQ-9042',
      complaintSummary: 'Brake liner replacement & general inspection',
      mechanicName: 'Amit S.',
      mechanicInitials: 'AM',
      status: 'WORKING',
      expectedDelivery: 'Today, 04:30 PM'
    },
    {
      jcNumber: 'JC-2023-8845',
      inTime: '10:30 AM',
      customerName: 'Raj Express',
      vehicleModel: 'Eicher Pro 2049',
      vehicleReg: 'DL-1C-AA-5582',
      complaintSummary: 'Periodic Maintenance Service (PMS-40k)',
      mechanicName: 'Suresh G.',
      mechanicInitials: 'SG',
      status: 'WAITING PARTS',
      expectedDelivery: 'Delayed: Oct 25',
      isDelayed: true
    },
    {
      jcNumber: 'JC-2023-8848',
      inTime: '11:15 AM',
      customerName: 'Pooja Transports',
      vehicleModel: 'Eicher Skyline Pro',
      vehicleReg: 'UP-16-BT-0021',
      complaintSummary: 'Suspension noise & Steering alignment check',
      mechanicName: 'Abdul R.',
      mechanicInitials: 'AR',
      status: 'ASSIGNED',
      expectedDelivery: 'Oct 26, 11:00 AM'
    },
    {
      jcNumber: 'JC-2023-8839',
      inTime: '08:00 AM',
      customerName: 'Shiva Carriers',
      vehicleModel: 'Eicher Pro 6028',
      vehicleReg: 'KA-01-EE-1234',
      complaintSummary: 'Air conditioning service & cabin filter swap',
      mechanicName: 'Vikram S.',
      mechanicInitials: 'VS',
      status: 'COMPLETED',
      expectedDelivery: 'Ready for Pick-up',
      readyForPickup: true
    }
  ]);

  const filteredJobCards = jobCards.filter(jc => {
    if (statusFilter !== 'All' && jc.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        jc.jcNumber.toLowerCase().includes(q) ||
        jc.customerName.toLowerCase().includes(q) ||
        jc.vehicleModel.toLowerCase().includes(q) ||
        jc.vehicleReg.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleRefresh = () => {
    // Re-set initial state or mock refresh
    alert('Live data reloaded successfully!');
  };


  const handleDeleteJc = (num: string) => {
    if (window.confirm(`Are you sure you want to delete Job Card ${num}?`)) {
      setJobCards(jobCards.filter(jc => jc.jcNumber !== num));
    }
  };

  if (isCreatingJobCard) {
    return (
      <AddJobCard
        onBack={() => setIsCreatingJobCard(false)}
        onSave={(newJc) => {
          setJobCards([newJc, ...jobCards]);
          setIsCreatingJobCard(false);
        }}
      />
    );
  }

  if (subTab === 'open-job-cards') {
    return (
      <OpenJobCards
        searchTerm={searchTerm}
        onBack={() => setSubTab('dashboard')}
        onNewJobCard={() => {
          setSubTab('dashboard');
          setIsCreatingJobCard(true);
        }}
        onViewJcDetails={(jc) => {
          setSubTab('dashboard');
          alert(`Viewing Details for ${jc.jcNumber}`);
        }}
        onEditJc={(jc) => {
          setSubTab('dashboard');
          alert(`Editing Job Card ${jc.jcNumber}`);
        }}
      />
    );
  }

  if (subTab === 'completed-jobs') {
    return (
      <CompletedJobs
        searchTerm={searchTerm}
        onBack={() => setSubTab('dashboard')}
        onNewJobCard={() => {
          setSubTab('dashboard');
          setIsCreatingJobCard(true);
        }}
      />
    );
  }

  if (subTab === 'service-history') {
    return (
      <ServiceHistory
        searchTerm={searchTerm}
        onBack={() => setSubTab('dashboard')}
      />
    );
  }
  return (
    <div className="flex-1 p-6 md:p-8 flex flex-col gap-6 bg-[#f6f8fc] overflow-y-auto box-border max-w-full text-slate-700 text-left font-sans">

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 m-0 tracking-tight font-heading">
            Service Dashboard
          </h1>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Real-time workshop operations overview for today, July 11, 2026
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-650 font-bold rounded-lg text-xs cursor-pointer transition-colors bg-white shadow-xs">
            <Filter size={14} />
            <span>Filters</span>
          </button>
          <button
            onClick={() => setIsCreatingJobCard(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#184edb] hover:bg-[#143eb3] text-white font-bold rounded-lg text-xs cursor-pointer transition-colors border-none shadow-md"
          >
            <Plus size={14} />
            <span>New Job Card</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full box-border">

        {/* Card 1: Open Job Cards */}
        <div
          onClick={() => setSubTab('open-job-cards')}
          className="bg-white rounded-xl p-5 shadow-xs border border-slate-100/70 flex items-center justify-between min-h-[100px] box-border relative overflow-hidden cursor-pointer hover:border-[#184edb] transition-all"
        >
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Open Job Cards</span>
            <span className="text-3xl font-extrabold text-slate-800 tracking-tight mt-1 font-heading">42</span>
          </div>
          <div className="flex flex-col items-end gap-2.5">
            <div className="bg-blue-50 text-[#184edb] p-3 rounded-xl flex items-center justify-center">
              <ClipboardList size={22} />
            </div>
            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
              +4%
            </span>
          </div>
        </div>

        {/* Card 2: Assigned Jobs */}
        <div className="bg-white rounded-xl p-5 shadow-xs border border-slate-100/70 flex items-center justify-between min-h-[100px] box-border relative">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Jobs</span>
            <span className="text-3xl font-extrabold text-slate-800 tracking-tight mt-1 font-heading">28</span>
          </div>
          <div className="bg-blue-50 text-[#184edb] p-3 rounded-xl flex items-center justify-center">
            <UserCheck size={22} />
          </div>
        </div>

        {/* Card 3: Under Service */}
        <div className="bg-white rounded-xl p-5 shadow-xs border border-slate-100/70 flex items-center justify-between min-h-[100px] box-border relative">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Under Service</span>
            <span className="text-3xl font-extrabold text-slate-800 tracking-tight mt-1 font-heading">15</span>
          </div>
          <div className="bg-amber-50 text-amber-600 p-3 rounded-xl flex items-center justify-center">
            <Wrench size={22} />
          </div>
        </div>

        {/* Card 4: Service Revenue */}
        <div
          onClick={() => setSubTab('service-history')}
          className="bg-gradient-to-br from-[#184edb] to-[#0d287a] rounded-xl p-5 shadow-md flex items-center justify-between min-h-[100px] text-white box-border relative cursor-pointer hover:opacity-95 transition-opacity"
        >
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-blue-100 uppercase tracking-wider">Service Revenue</span>
            <span className="text-2xl font-extrabold tracking-tight mt-1">₹1,45,000</span>
          </div>
          <div className="flex flex-col items-end gap-2.5">
            <div className="bg-white/15 text-white p-3 rounded-xl flex items-center justify-center">
              <CreditCard size={22} />
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded">
              Today
            </span>
          </div>
        </div>
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full box-border">

        {/* Waiting Parts */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-100/60 flex items-center gap-3">
          <div className="bg-red-50 text-red-600 p-2 rounded-lg flex items-center justify-center">
            <Clock size={16} />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Waiting Parts</span>
            <span className="text-lg font-bold text-slate-800 font-heading mt-0.5">8</span>
          </div>
        </div>

        {/* Completed Today */}
        <div
          onClick={() => setSubTab('completed-jobs')}
          className="bg-white rounded-xl p-4 shadow-xs border border-slate-100/65 flex items-center gap-3 cursor-pointer hover:border-emerald-400 transition-all"
        >
          <div className="bg-emerald-50 text-emerald-600 p-2 rounded-lg flex items-center justify-center">
            <CheckCircle size={16} />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Completed Today</span>
            <span className="text-lg font-bold text-slate-800 font-heading mt-0.5">12</span>
          </div>
        </div>

        {/* Delivered Today */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-100/60 flex items-center gap-3">
          <div className="bg-blue-50 text-blue-600 p-2 rounded-lg flex items-center justify-center">
            <ShoppingCart size={16} />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Delivered Today</span>
            <span className="text-lg font-bold text-slate-800 font-heading mt-0.5">9</span>
          </div>
        </div>

        {/* Pending Delivery */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-100/60 flex items-center gap-3">
          <div className="bg-amber-50 text-amber-600 p-2 rounded-lg flex items-center justify-center">
            <Clock size={16} />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Pending Delivery</span>
            <span className="text-lg font-bold text-slate-800 font-heading mt-0.5">5</span>
          </div>
        </div>

        {/* Active Mechanics */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-100/60 flex items-center gap-3">
          <div className="bg-blue-50 text-[#184edb] p-2 rounded-lg flex items-center justify-center">
            <Users size={16} />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Active Mechanics</span>
            <span className="text-lg font-bold text-slate-800 font-heading mt-0.5">18</span>
          </div>
        </div>
      </div>

      {/* Chart Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full box-border">

        {/* Monthly Service Revenue Trend (Takes 2/3 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-extrabold text-slate-800 m-0 tracking-tight font-heading">
              Monthly Service Revenue Trend
            </h3>
            <button className="flex items-center gap-1.5 px-3 py-1 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-lg text-[10.5px] cursor-pointer bg-white">
              <span>Last 6 Months</span>
              <ChevronDown size={12} />
            </button>
          </div>

          {/* Bar Chart */}
          <div className="flex flex-col justify-between h-56 w-full mt-4">
            <div className="flex items-end justify-between h-48 px-4 gap-6">
              {/* May */}
              <div className="flex flex-col items-center flex-1 h-full justify-end">
                <div className="w-10 hover:opacity-90 transition-opacity flex flex-col justify-end h-[50%]">
                  <div className="bg-blue-100 rounded-t-sm h-[40%]" />
                  <div className="bg-[#184edb] h-[60%]" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 mt-2">May</span>
              </div>

              {/* Jun */}
              <div className="flex flex-col items-center flex-1 h-full justify-end">
                <div className="w-10 hover:opacity-90 transition-opacity flex flex-col justify-end h-[68%]">
                  <div className="bg-blue-100 rounded-t-sm h-[35%]" />
                  <div className="bg-[#184edb] h-[65%]" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 mt-2">Jun</span>
              </div>

              {/* Jul */}
              <div className="flex flex-col items-center flex-1 h-full justify-end">
                <div className="w-10 hover:opacity-90 transition-opacity flex flex-col justify-end h-[42%]">
                  <div className="bg-blue-100 rounded-t-sm h-[50%]" />
                  <div className="bg-[#184edb] h-[50%]" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 mt-2">Jul</span>
              </div>

              {/* Aug */}
              <div className="flex flex-col items-center flex-1 h-full justify-end">
                <div className="w-10 hover:opacity-90 transition-opacity flex flex-col justify-end h-[82%]">
                  <div className="bg-blue-100 rounded-t-sm h-[20%]" />
                  <div className="bg-[#184edb] h-[80%]" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 mt-2">Aug</span>
              </div>

              {/* Sep */}
              <div className="flex flex-col items-center flex-1 h-full justify-end">
                <div className="w-10 hover:opacity-90 transition-opacity flex flex-col justify-end h-[96%]">
                  <div className="bg-blue-100 rounded-t-sm h-[15%]" />
                  <div className="bg-[#184edb] h-[85%]" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 mt-2">Sep</span>
              </div>

              {/* Oct */}
              <div className="flex flex-col items-center flex-1 h-full justify-end">
                <div className="w-10 hover:opacity-90 transition-opacity flex flex-col justify-end h-[60%]">
                  <div className="bg-blue-100 rounded-t-sm h-[40%]" />
                  <div className="bg-[#184edb] h-[60%]" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 mt-2">Oct</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Distribution (Takes 1/3 col) */}
        <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6">
          <h3 className="text-sm font-extrabold text-slate-800 m-0 tracking-tight font-heading">
            Status Distribution
          </h3>

          <div className="flex flex-col md:flex-row items-center gap-6 justify-center h-full">
            {/* SVG Donut Chart */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="60" fill="transparent" stroke="#f1f5f9" strokeWidth="16" />
                {/* Completed (35% - green) */}
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  fill="transparent"
                  stroke="#10b981"
                  strokeWidth="16"
                  strokeDasharray="132 377"
                  strokeDashoffset="0"
                />
                {/* Working (30% - green/blue) */}
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  fill="transparent"
                  stroke="#06b6d4"
                  strokeWidth="16"
                  strokeDasharray="113 377"
                  strokeDashoffset="-132"
                />
                {/* Assigned (20% - dark blue) */}
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  fill="transparent"
                  stroke="#184edb"
                  strokeWidth="16"
                  strokeDasharray="75 377"
                  strokeDashoffset="-245"
                />
                {/* Waiting Parts (15% - red) */}
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  fill="transparent"
                  stroke="#ef4444"
                  strokeWidth="16"
                  strokeDasharray="57 377"
                  strokeDashoffset="-320"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-extrabold text-slate-800 font-heading leading-none">119</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total</span>
              </div>
            </div>

            {/* Donut Legend */}
            <div className="flex flex-col gap-2.5 justify-center">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4]" />
                <span className="text-[11.5px] font-semibold text-slate-500 w-16">Working</span>
                <span className="text-[11.5px] font-extrabold text-slate-800 text-right">30%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#184edb]" />
                <span className="text-[11.5px] font-semibold text-slate-500 w-16">Assigned</span>
                <span className="text-[11.5px] font-extrabold text-slate-800 text-right">20%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                <span className="text-[11.5px] font-semibold text-slate-500 w-16">Waiting Parts</span>
                <span className="text-[11.5px] font-extrabold text-slate-800 text-right">15%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                <span className="text-[11.5px] font-semibold text-slate-500 w-16">Completed</span>
                <span className="text-[11.5px] font-extrabold text-slate-800 text-right">35%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mechanic Efficiency Section */}
      <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-xs flex flex-col gap-5 w-full box-border">
        <h3 className="text-sm font-extrabold text-slate-800 m-0 tracking-tight font-heading">
          Mechanic Efficiency (Jobs Completed)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-1 w-full box-border">
          {/* Abdul Rahman */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-[12px]">
              <span className="font-bold text-slate-700">Abdul Rahman</span>
              <span className="font-extrabold text-[#184edb]">18 Jobs</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-[#184edb] h-full rounded-full transition-all duration-500" style={{ width: '72%' }} />
            </div>
          </div>

          {/* Suresh G. */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-[12px]">
              <span className="font-bold text-slate-700">Suresh G.</span>
              <span className="font-extrabold text-blue-900">15 Jobs</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-900 h-full rounded-full transition-all duration-500" style={{ width: '60%' }} />
            </div>
          </div>

          {/* Vikram Singh */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-[12px]">
              <span className="font-bold text-slate-700">Vikram Singh</span>
              <span className="font-extrabold text-cyan-600">12 Jobs</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-cyan-500 h-full rounded-full transition-all duration-500" style={{ width: '48%' }} />
            </div>
          </div>

          {/* Amit Sharma */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-[12px]">
              <span className="font-bold text-slate-700">Amit Sharma</span>
              <span className="font-extrabold text-emerald-600">22 Jobs</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: '88%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Live Job Cards Table Card */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden w-full flex flex-col box-border">
        {/* Table Header Row */}
        <div className="p-5 px-6 border-b border-slate-100 bg-slate-50/15 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 m-0 tracking-tight font-heading">
              Live Job Cards
            </h3>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mt-1">
              Currently active in workshop floor
            </span>
          </div>
          <div className="flex items-center gap-3">

            {/* Status Select */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-slate-200 rounded-md py-1.5 px-3 text-xs outline-none bg-white text-slate-700 font-medium cursor-pointer focus:border-[#184edb]"
            >
              <option value="All">All Statuses</option>
              <option value="WORKING">Working</option>
              <option value="WAITING PARTS">Waiting Parts</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="COMPLETED">Completed</option>
            </select>

            <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 hover:bg-slate-50 text-slate-500 cursor-pointer bg-white transition-colors">
              <Download size={14} />
            </button>
            <button
              onClick={handleRefresh}
              className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 hover:bg-slate-50 text-slate-500 cursor-pointer bg-white transition-colors"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse text-left text-slate-650 text-[12.5px]">
            <thead>
              <tr className="bg-slate-50/30 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-6">JC NUMBER</th>
                <th className="py-3.5 px-5">CUSTOMER & VEHICLE</th>
                <th className="py-3.5 px-5">COMPLAINT SUMMARY</th>
                <th className="py-3.5 px-5">MECHANIC</th>
                <th className="py-3.5 px-5">STATUS</th>
                <th className="py-3.5 px-5">EXPECTED DELIVERY</th>
                <th className="py-3.5 px-6 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredJobCards.map((jc) => (
                <tr key={jc.jcNumber} className="hover:bg-slate-50/30 transition-colors">
                  {/* JC NUMBER */}
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span
                        onClick={() => setSubTab('open-job-cards')}
                        className="font-extrabold text-[#184edb] hover:underline cursor-pointer"
                      >
                        {jc.jcNumber}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold mt-1">In: {jc.inTime}</span>
                    </div>
                  </td>

                  {/* CUSTOMER & VEHICLE */}
                  <td className="py-4 px-5 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 text-[13.5px]">{jc.customerName}</span>
                      <span className="text-[11px] text-slate-400 font-semibold mt-0.5">
                        {jc.vehicleModel} <span className="text-slate-300 mx-0.5">•</span> {jc.vehicleReg}
                      </span>
                    </div>
                  </td>

                  {/* COMPLAINT SUMMARY */}
                  <td className="py-4 px-5 max-w-[220px] truncate text-slate-600 font-semibold">
                    {jc.complaintSummary}
                  </td>

                  {/* MECHANIC */}
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[9px] bg-blue-50 text-[#184edb] border border-blue-100">
                        {jc.mechanicInitials}
                      </div>
                      <span className="text-slate-700 font-semibold text-[13px]">{jc.mechanicName}</span>
                    </div>
                  </td>

                  {/* STATUS */}
                  <td className="py-4 px-5 whitespace-nowrap">
                    {jc.status === 'WORKING' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold bg-cyan-50 text-cyan-600 border border-cyan-100">
                        WORKING
                      </span>
                    )}
                    {jc.status === 'WAITING PARTS' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-500 border border-red-100">
                        WAITING PARTS
                      </span>
                    )}
                    {jc.status === 'ASSIGNED' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#184edb] border border-blue-100">
                        ASSIGNED
                      </span>
                    )}
                    {jc.status === 'COMPLETED' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-600 border border-green-100">
                        COMPLETED
                      </span>
                    )}
                  </td>

                  {/* EXPECTED DELIVERY */}
                  <td className="py-4 px-5">
                    {jc.isDelayed ? (
                      <span className="text-red-500 font-extrabold">{jc.expectedDelivery}</span>
                    ) : jc.readyForPickup ? (
                      <span className="text-green-600 font-extrabold">{jc.expectedDelivery}</span>
                    ) : (
                      <span className="text-slate-800 font-semibold">{jc.expectedDelivery}</span>
                    )}
                  </td>

                  {/* ACTIONS */}
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setSubTab('open-job-cards')}
                        title="View Details"
                        className="p-1.5 bg-blue-50 border border-blue-100 rounded-md text-blue-600 hover:bg-blue-100 cursor-pointer flex items-center justify-center transition-colors shadow-xs"
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        onClick={() => alert(`Editing Job Card: ${jc.jcNumber}`)}
                        title="Edit Job Card"
                        className="p-1.5 bg-green-50 border border-green-100 rounded-md text-green-600 hover:bg-green-100 cursor-pointer flex items-center justify-center transition-colors shadow-xs"
                      >
                        <Edit size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteJc(jc.jcNumber)}
                        title="Delete Job Card"
                        className="p-1.5 bg-red-50 border border-red-100 rounded-md text-red-600 hover:bg-red-100 cursor-pointer flex items-center justify-center transition-colors shadow-xs"
                      >
                        <Edit size={13} className="rotate-45" /> {/* Small trick to show delete/action or we can just import other icons */}
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
            Showing 1-4 of 42 Job Cards
          </span>

          <div className="flex items-center gap-1.5">
            <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 cursor-pointer transition-colors">
              Prev
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#184edb] text-white font-bold text-xs border-none shadow-xs cursor-pointer">
              1
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold cursor-pointer transition-colors">
              2
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold cursor-pointer transition-colors">
              3
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 cursor-pointer transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDashboard;
