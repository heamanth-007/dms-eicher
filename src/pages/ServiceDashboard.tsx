import React, { useState, useEffect } from 'react';
import { AddJobCard } from './AddJobCard';
import { OpenJobCards } from './OpenJobCards';
import { CompletedJobs } from './CompletedJobs';
import { ServiceHistory } from './ServiceHistory';
import { ServiceManagement } from './ServiceManagement';
import {
  ClipboardList,
  UserCheck,
  Wrench,
  CreditCard,
  Clock,
  CheckCircle,
  ShoppingCart,
  Users,
  Plus,
  RefreshCw,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

interface JobCard {
  jcNumber: string;
  inTime: string;
  customerName: string;
  vehicleModel: string;
  vehicleReg: string;
  complaintSummary: string;
  mechanicName?: string;
  mechanicInitials?: string;
  status: string;
  expectedDelivery: string;
  isDelayed?: boolean;
  readyForPickup?: boolean;
  amount?: string | number;
}

interface ServiceDashboardProps {
  subTab: 'dashboard' | 'open-job-cards' | 'completed-jobs' | 'service-history' | 'job-queue';
  setSubTab: (tab: any) => void;
  searchTerm: string;
  onNavigateToMechanics?: () => void;
}

export const ServiceDashboard: React.FC<ServiceDashboardProps> = ({
  subTab,
  setSubTab,
  searchTerm,
  onNavigateToMechanics
}) => {
  const [statusFilter, setStatusFilter] = useState('All');
  const [isCreatingJobCard, setIsCreatingJobCard] = useState(false);
  const [showLiveTable] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [mechanics, setMechanics] = useState<any[]>([]);

  const fetchJobCards = () => {
    fetch(`${API_URL}/api/jobcards`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setJobCards(data);
        }
      })
      .catch(err => console.error('Error fetching job cards:', err));
  };

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
    fetchJobCards();
    fetchMechanics();
  }, []);

  const filteredJobCards = jobCards.filter(jc => {
    if (statusFilter !== 'All') {
      if (statusFilter === 'WAITING TO ASSIGN') {
        if (jc.status !== 'WAITING TO ASSIGN' && jc.status !== 'UNASSIGNED' && jc.status !== 'OPEN' && jc.status !== 'OPENING' && jc.mechanicName && jc.mechanicName !== 'Unassigned') {
          return false;
        }
      } else if (jc.status !== statusFilter) {
        return false;
      }
    }
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
    fetchJobCards();
    alert('Live data reloaded successfully!');
  };


  const handleDeleteJc = (num: string) => {
    if (window.confirm(`Are you sure you want to delete Job Card ${num}?`)) {
      fetch(`${API_URL}/api/jobcards/${num}`, { method: 'DELETE' })
        .then(() => fetchJobCards())
        .catch(err => console.error('Error deleting job card:', err));
    }
  };

  if (isCreatingJobCard) {
    return (
      <AddJobCard
        onBack={() => setIsCreatingJobCard(false)}
        onSave={(newJc) => {
          fetch(`${API_URL}/api/jobcards`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newJc)
          })
            .then(async (res) => {
              if (!res.ok) {
                const text = await res.text();
                throw new Error(text);
              }
              fetchJobCards();
              setIsCreatingJobCard(false);
            })
            .catch(err => {
              console.error('Error saving job card:', err);
              alert('Failed to save job card. Please try again.');
            });
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
        jobCards={jobCards}
        onHandoffComplete={() => {
          fetchJobCards();
          alert('Job Card marked as COMPLETED and handed off to Service Billing as a Draft.');
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
        jobCards={jobCards}
      />
    );
  }

  if (subTab === 'service-history') {
    return (
      <ServiceHistory
        searchTerm={searchTerm}
        onBack={() => setSubTab('dashboard')}
        jobCards={jobCards}
        onDeleteJc={handleDeleteJc}
      />
    );
  }

  if (subTab === 'job-queue') {
    return (
      <ServiceManagement
        onBack={() => setSubTab('dashboard')}
        jobCards={jobCards}
        onNavigateToMechanics={onNavigateToMechanics}
        onNavigateToService={(subTab: string) => setSubTab(subTab)}
      />
    );
  }
  // Live KPI counts from database
  const unassignedCount = jobCards.filter(jc => jc.status === 'WAITING TO ASSIGN' || jc.status === 'UNASSIGNED' || jc.status === 'OPEN' || jc.status === 'OPENING' || !jc.mechanicName || jc.mechanicName === 'Unassigned').length;
  const openJobsCount = jobCards.filter(jc => jc.status !== 'COMPLETED').length;
  const assignedJobsCount = jobCards.filter(jc => jc.status === 'ASSIGNED').length;
  const underServiceCount = jobCards.filter(jc => jc.status === 'WORKING').length;
  const waitingPartsCount = jobCards.filter(jc => jc.status === 'WAITING PARTS').length;
  const completedCount = jobCards.filter(jc => jc.status === 'COMPLETED').length;
  const pendingDeliveryCount = jobCards.filter(jc => jc.readyForPickup).length;
  
  const todayStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const deliveredTodayCount = jobCards.filter(jc => jc.status === 'COMPLETED' && (jc.expectedDelivery || '').includes(todayStr)).length;
  
  const activeMechanicsCount = mechanics.filter(m => m.status === 'Available' || m.status === 'Busy').length;

  const totalJobs = jobCards.length;
  const unassignedPct = totalJobs ? (unassignedCount / totalJobs) * 100 : 0;
  const workingPct = totalJobs ? (underServiceCount / totalJobs) * 100 : 0;
  const assignedPct = totalJobs ? (assignedJobsCount / totalJobs) * 100 : 0;
  const waitingPct = totalJobs ? (waitingPartsCount / totalJobs) * 100 : 0;
  const completedPct = totalJobs ? (completedCount / totalJobs) * 100 : 0;

  // Arc math for Donut Chart
  const circumference = 377;
  const unassignedDash = (unassignedPct / 100) * circumference;
  const workingDash = (workingPct / 100) * circumference;
  const assignedDash = (assignedPct / 100) * circumference;
  const waitingDash = (waitingPct / 100) * circumference;
  const completedDash = (completedPct / 100) * circumference;

  const unassignedOffset = 0;
  const workingOffset = unassignedDash;
  const assignedOffset = unassignedDash + workingDash;
  const waitingOffset = unassignedDash + workingDash + assignedDash;
  const completedOffset = unassignedDash + workingDash + assignedDash + waitingDash;

  const serviceRevenue = jobCards
    .filter(jc => jc.status === 'COMPLETED')
    .reduce((sum, jc) => {
      if (!jc.amount) return sum;
      const val = typeof jc.amount === 'string' ? Number(jc.amount.replace(/[^0-9.-]+/g, '')) : jc.amount;
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
  
  const formattedRevenue = serviceRevenue >= 100000 
    ? `₹${(serviceRevenue / 100000).toFixed(2)}L` 
    : `₹${serviceRevenue.toLocaleString('en-IN')}`;

  // Calculate Mechanic Efficiency
  const mechanicStats = jobCards.reduce((acc: any, jc) => {
    if (jc.mechanicName) {
      if (!acc[jc.mechanicName]) acc[jc.mechanicName] = { name: jc.mechanicName, jobs: 0 };
      if (jc.status === 'COMPLETED') acc[jc.mechanicName].jobs += 1;
    }
    return acc;
  }, {});
  const topMechanics = Object.values(mechanicStats)
    .sort((a: any, b: any) => b.jobs - a.jobs)
    .slice(0, 4) as { name: string; jobs: number }[];
  const maxJobs = topMechanics.length > 0 ? Math.max(...topMechanics.map(m => m.jobs), 1) : 1;
  const colors = [
    { text: 'text-[#184edb]', bg: 'bg-[#184edb]' },
    { text: 'text-blue-900', bg: 'bg-blue-900' },
    { text: 'text-cyan-600', bg: 'bg-cyan-500' },
    { text: 'text-emerald-600', bg: 'bg-emerald-500' }
  ];

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
          onClick={() => setSubTab('job-queue')}
          className="bg-white rounded-xl p-5 shadow-xs border border-slate-100/70 flex items-center justify-between min-h-[100px] box-border relative overflow-hidden cursor-pointer hover:border-[#184edb] transition-all"
        >
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Open Job Cards</span>
            <span className="text-3xl font-extrabold text-slate-800 tracking-tight mt-1 font-heading">
              {openJobsCount}
            </span>
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
        <div
          onClick={() => { setStatusFilter('ASSIGNED'); const el = document.getElementById('live-job-cards-table'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}
          className="bg-white rounded-xl p-5 shadow-xs border border-slate-100/70 flex items-center justify-between min-h-[100px] box-border relative cursor-pointer hover:border-[#184edb] transition-all"
        >
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Jobs</span>
            <span className="text-3xl font-extrabold text-slate-800 tracking-tight mt-1 font-heading">
              {assignedJobsCount}
            </span>
          </div>
          <div className="bg-blue-50 text-[#184edb] p-3 rounded-xl flex items-center justify-center">
            <UserCheck size={22} />
          </div>
        </div>

        {/* Card 3: Under Service */}
        <div
          onClick={() => { setStatusFilter('WORKING'); const el = document.getElementById('live-job-cards-table'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}
          className="bg-white rounded-xl p-5 shadow-xs border border-slate-100/70 flex items-center justify-between min-h-[100px] box-border relative cursor-pointer hover:border-amber-400 transition-all"
        >
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Under Service</span>
            <span className="text-3xl font-extrabold text-slate-800 tracking-tight mt-1 font-heading">
              {underServiceCount}
            </span>
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
            <span className="text-2xl font-extrabold tracking-tight mt-1">{formattedRevenue}</span>
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
        <div
          onClick={() => { setStatusFilter('WAITING PARTS'); const el = document.getElementById('live-job-cards-table'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}
          className="bg-white rounded-xl p-4 shadow-xs border border-slate-100/60 flex items-center gap-3 cursor-pointer hover:border-red-400 transition-all"
        >
          <div className="bg-red-50 text-red-600 p-2 rounded-lg flex items-center justify-center">
            <Clock size={16} />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Waiting Parts</span>
            <span className="text-lg font-bold text-slate-800 font-heading mt-0.5">{waitingPartsCount}</span>
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
            <span className="text-lg font-bold text-slate-800 font-heading mt-0.5">{completedCount}</span>
          </div>
        </div>

        {/* Delivered Today */}
        <div
          onClick={() => { setStatusFilter('COMPLETED'); const el = document.getElementById('live-job-cards-table'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}
          className="bg-white rounded-xl p-4 shadow-xs border border-slate-100/60 flex items-center gap-3 cursor-pointer hover:border-blue-400 transition-all"
        >
          <div className="bg-blue-50 text-blue-600 p-2 rounded-lg flex items-center justify-center">
            <ShoppingCart size={16} />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Delivered Today</span>
            <span className="text-lg font-bold text-slate-800 font-heading mt-0.5">{deliveredTodayCount}</span>
          </div>
        </div>

        {/* Pending Delivery */}
        <div
          onClick={() => { setStatusFilter('ASSIGNED'); const el = document.getElementById('live-job-cards-table'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}
          className="bg-white rounded-xl p-4 shadow-xs border border-slate-100/60 flex items-center gap-3 cursor-pointer hover:border-amber-400 transition-all"
        >
          <div className="bg-amber-50 text-amber-600 p-2 rounded-lg flex items-center justify-center">
            <Clock size={16} />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Pending Delivery</span>
            <span className="text-lg font-bold text-slate-800 font-heading mt-0.5">{pendingDeliveryCount}</span>
          </div>
        </div>

        {/* Active Mechanics */}
        <div
          onClick={() => { if (onNavigateToMechanics) onNavigateToMechanics(); else setSubTab('mechanics'); }}
          className="bg-white rounded-xl p-4 shadow-xs border border-slate-100/60 flex items-center gap-3 cursor-pointer hover:border-blue-400 transition-all"
        >
          <div className="bg-blue-50 text-[#184edb] p-2 rounded-lg flex items-center justify-center">
            <Users size={16} />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Active Mechanics</span>
            <span className="text-lg font-bold text-slate-800 font-heading mt-0.5">{activeMechanicsCount}</span>
          </div>
        </div>
      </div>

      {/* 2-Column Section: Status Distribution & Mechanic Efficiency */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full box-border">

        {/* Status Distribution */}
        <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6">
          <h3 className="text-sm font-extrabold text-slate-800 m-0 tracking-tight font-heading">
            Status Distribution
          </h3>

          <div className="flex flex-col sm:flex-row items-center gap-6 justify-center h-full">
            {/* SVG Donut Chart */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="60" fill="transparent" stroke="#f1f5f9" strokeWidth="16" />
                
                {/* Unassigned (Amber/Orange) */}
                {unassignedPct > 0 && (
                  <circle
                    cx="80"
                    cy="80"
                    r="60"
                    fill="transparent"
                    stroke="#f59e0b"
                    strokeWidth="16"
                    strokeDasharray={`${unassignedDash} ${circumference}`}
                    strokeDashoffset={`-${unassignedOffset}`}
                  />
                )}

                {/* Working (Cyan) */}
                {workingPct > 0 && (
                  <circle
                    cx="80"
                    cy="80"
                    r="60"
                    fill="transparent"
                    stroke="#06b6d4"
                    strokeWidth="16"
                    strokeDasharray={`${workingDash} ${circumference}`}
                    strokeDashoffset={`-${workingOffset}`}
                  />
                )}

                {/* Assigned (Dark Blue) */}
                {assignedPct > 0 && (
                  <circle
                    cx="80"
                    cy="80"
                    r="60"
                    fill="transparent"
                    stroke="#184edb"
                    strokeWidth="16"
                    strokeDasharray={`${assignedDash} ${circumference}`}
                    strokeDashoffset={`-${assignedOffset}`}
                  />
                )}

                {/* Waiting Parts (Red) */}
                {waitingPct > 0 && (
                  <circle
                    cx="80"
                    cy="80"
                    r="60"
                    fill="transparent"
                    stroke="#ef4444"
                    strokeWidth="16"
                    strokeDasharray={`${waitingDash} ${circumference}`}
                    strokeDashoffset={`-${waitingOffset}`}
                  />
                )}

                {/* Completed (Emerald Green) */}
                {completedPct > 0 && (
                  <circle
                    cx="80"
                    cy="80"
                    r="60"
                    fill="transparent"
                    stroke="#10b981"
                    strokeWidth="16"
                    strokeDasharray={`${completedDash} ${circumference}`}
                    strokeDashoffset={`-${completedOffset}`}
                  />
                )}
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-extrabold text-slate-800 font-heading leading-none">{totalJobs}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total</span>
              </div>
            </div>

            {/* Donut Legend */}
            <div className="flex flex-col gap-2 justify-center">
              {/* Unassigned */}
              <div
                onClick={() => { setStatusFilter('WAITING TO ASSIGN'); const el = document.getElementById('live-job-cards-table'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}
                className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded-md transition-colors"
                title="Click to filter Unassigned Job Cards"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
                <span className="text-[11.5px] font-semibold text-slate-600 w-24">Unassigned</span>
                <span className="text-[11.5px] font-extrabold text-slate-800 text-right">{unassignedCount} ({Math.round(unassignedPct)}%)</span>
              </div>

              {/* Working */}
              <div
                onClick={() => { setStatusFilter('WORKING'); const el = document.getElementById('live-job-cards-table'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}
                className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded-md transition-colors"
                title="Click to filter Working Job Cards"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4]" />
                <span className="text-[11.5px] font-semibold text-slate-600 w-24">Working</span>
                <span className="text-[11.5px] font-extrabold text-slate-800 text-right">{underServiceCount} ({Math.round(workingPct)}%)</span>
              </div>

              {/* Assigned */}
              <div
                onClick={() => { setStatusFilter('ASSIGNED'); const el = document.getElementById('live-job-cards-table'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}
                className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded-md transition-colors"
                title="Click to filter Assigned Job Cards"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#184edb]" />
                <span className="text-[11.5px] font-semibold text-slate-600 w-24">Assigned</span>
                <span className="text-[11.5px] font-extrabold text-slate-800 text-right">{assignedJobsCount} ({Math.round(assignedPct)}%)</span>
              </div>

              {/* Waiting Parts */}
              <div
                onClick={() => { setStatusFilter('WAITING PARTS'); const el = document.getElementById('live-job-cards-table'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}
                className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded-md transition-colors"
                title="Click to filter Waiting Parts Job Cards"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                <span className="text-[11.5px] font-semibold text-slate-600 w-24">Waiting Parts</span>
                <span className="text-[11.5px] font-extrabold text-slate-800 text-right">{waitingPartsCount} ({Math.round(waitingPct)}%)</span>
              </div>

              {/* Completed */}
              <div
                onClick={() => { setStatusFilter('COMPLETED'); const el = document.getElementById('live-job-cards-table'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}
                className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded-md transition-colors"
                title="Click to filter Completed Job Cards"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                <span className="text-[11.5px] font-semibold text-slate-600 w-24">Completed</span>
                <span className="text-[11.5px] font-extrabold text-slate-800 text-right">{completedCount} ({Math.round(completedPct)}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mechanic Efficiency Section */}
        <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-xs flex flex-col gap-5 justify-between box-border">
          <h3 className="text-sm font-extrabold text-slate-800 m-0 tracking-tight font-heading">
            Mechanic Efficiency (Jobs Completed)
          </h3>

          <div className="flex flex-col gap-3 py-1 w-full box-border">
            {topMechanics.length > 0 ? topMechanics.map((mech, index) => {
              const color = colors[index % colors.length];
              const width = Math.max((mech.jobs / maxJobs) * 100, 5);
              return (
                <div key={mech.name} className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-[12px]">
                    <span className="font-bold text-slate-700">{mech.name}</span>
                    <span className={`font-extrabold ${color.text}`}>{mech.jobs} Jobs</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className={`${color.bg} h-full rounded-full transition-all duration-500`} style={{ width: `${width}%` }} />
                  </div>
                </div>
              );
            }) : (
              <div className="text-slate-400 text-xs font-semibold py-6 text-center">No completed jobs recorded yet.</div>
            )}
          </div>
        </div>

      </div>

      {/* Live Job Cards Table Card */}
      {showLiveTable && (
        <div id="live-job-cards-table" className="bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden w-full flex flex-col box-border">
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
              <option value="WAITING TO ASSIGN">Unassigned</option>
              <option value="WORKING">Working</option>
              <option value="WAITING PARTS">Waiting Parts</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="COMPLETED">Completed</option>
            </select>

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
            Showing {filteredJobCards.length} Job Cards
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
      )}
    </div>
  );
};

export default ServiceDashboard;
