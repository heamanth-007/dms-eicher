import React, { useState, useRef } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Plus,
  Users,
  BadgeCheck,
  AlertTriangle,
  ShoppingBag,
  Search,
  ChevronDown,
  Eye,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Store,
  Phone,
  Mail,
  Wallet,
  MapPin,
  CheckCircle2,
  XCircle,
  Save,
  Clock,
  Notebook,
  IdCard,
  Shield,
  Trash2,
  Star,
  Edit
} from 'lucide-react';
import warehouseImage from '../assets/warehouse_efficiency.png';
import { SupplierLedger } from './SupplierLedger';

export interface SupplierType {
  id: string;
  name: string;
  gstNumber: string;
  phone: string;
  email: string;
  outstanding: string;
  isOutstandingPositive: boolean;
  status: 'ACTIVE' | 'INACTIVE';
}

interface SuppliersProps {
  suppliersList: SupplierType[];
  setSuppliersList: React.Dispatch<React.SetStateAction<SupplierType[]>>;
}

export const Suppliers: React.FC<SuppliersProps> = ({ suppliersList, setSuppliersList }) => {
  const [view, setView] = useState<'list' | 'add' | 'edit' | 'ledger'>('list');
  const [selectedLedgerSupplier, setSelectedLedgerSupplier] = useState<SupplierType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [gstSearch, setGstSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [dateRange, setDateRange] = useState('');

  // Search auto-complete & KPI filter states
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [outstandingOnlyFilter, setOutstandingOnlyFilter] = useState(false);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [editingSupplierId, setEditingSupplierId] = useState<string | null>(null);

  // Form Fields State
  const [formName, setFormName] = useState('');
  const [formGst, setFormGst] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formOutstanding, setFormOutstanding] = useState('');
  const [formStatus, setFormStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [formAddress, setFormAddress] = useState('');

  // Edit Form Fields State
  const [editName, setEditName] = useState('Bharat Motors');
  const [editGst, setEditGst] = useState('29AAACN1234F1Z1');
  const [editCategory, setEditCategory] = useState('Authorized Spare Dealer');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('procurement@bharatmotors.co.in');
  const [editOutstanding, setEditOutstanding] = useState('');
  const [editStatus, setEditStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [editAddress, setEditAddress] = useState('42, Industrial Area Phase II, Electronic City');
  const [editCity, setEditCity] = useState('Bangalore');
  const [editState, setEditState] = useState('Karnataka');
  const [editZip, setEditZip] = useState('560100');
  const [editPaymentTerms, setEditPaymentTerms] = useState('Net 30 Days');
  const [editCreditLimit, setEditCreditLimit] = useState('5,000,000');

  const handleAddSupplier = (navigateToList = true) => {
    if (!formName || !formPhone) {
      alert('Please fill out the required fields: Supplier Name and Phone Number.');
      return;
    }

    let maxSupSeq = 4000;
    suppliersList.forEach(s => {
      if (s.id) {
        const match = s.id.match(/#?SUP-(4\d{3})/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num >= 4001 && num < 5000) {
            if (num > maxSupSeq) maxSupSeq = num;
          }
        }
      }
    });
    const newId = `#SUP-${maxSupSeq + 1}`;
    const parsedOutstanding = parseFloat(formOutstanding || '0');
    const formattedOutstanding = `₹${parsedOutstanding.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;

    const newSupplier: SupplierType = {
      id: newId,
      name: formName,
      gstNumber: formGst || 'N/A',
      phone: formPhone,
      email: formEmail || 'N/A',
      outstanding: formattedOutstanding,
      isOutstandingPositive: parsedOutstanding > 0,
      status: formStatus
    };

    setSuppliersList(prev => {
      const updated = [newSupplier, ...prev];
      try {
        localStorage.setItem('dms_suppliers_list', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    fetch(`${API_URL}/api/suppliers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSupplier)
    })
      .catch((err) => console.error('API sync error (skipped):', err));

    resetForm();

    if (navigateToList) {
      setView('list');
      alert(`Supplier "${newSupplier.name}" saved successfully!`);
    } else {
      alert(`Supplier "${newSupplier.name}" saved successfully! Form cleared for next entry.`);
    }
  };

  const resetForm = () => {
    setFormName('');
    setFormGst('');
    setFormPhone('');
    setFormEmail('');
    setFormOutstanding('');
    setFormStatus('ACTIVE');
    setFormAddress('');
  };

  // Ecosystem statistics from actual suppliers list
  const totalSuppliersCount = suppliersList.length;
  const activeSuppliersCount = suppliersList.filter(s => s.status === 'ACTIVE').length;
  const inactiveSuppliersCount = suppliersList.filter(s => s.status === 'INACTIVE').length;
  const activePercent = totalSuppliersCount > 0 
    ? Math.round((activeSuppliersCount / totalSuppliersCount) * 100) 
    : 0;

  // Filtered suppliers computation
  const searchMatches = suppliersList.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSuppliers = suppliersList.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchGst = !gstSearch || s.gstNumber.toLowerCase().includes(gstSearch.toLowerCase());
    const matchStatus = statusFilter === 'All Status' || s.status === statusFilter.toUpperCase();
    const matchOutstanding = !outstandingOnlyFilter || s.isOutstandingPositive;
    return matchSearch && matchGst && matchStatus && matchOutstanding;
  });

  // Export handlers
  const exportSuppliersToExcel = () => {
    const headers = ['Supplier ID', 'Supplier Name', 'GST Number', 'Phone', 'Email', 'Outstanding', 'Status'];
    const rows = filteredSuppliers.map(s => [
      s.id,
      `"${s.name.replace(/"/g, '""')}"`,
      s.gstNumber,
      s.phone,
      s.email,
      `"${s.outstanding}"`,
      s.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `suppliers_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportSuppliersToPDF = () => {
    window.print();
  };

  if (view === 'add') {
    return (
      <div className="flex-1 flex flex-col p-6 gap-6 bg-[#f6f8fc] min-w-0 font-sans">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-[13px] font-medium">
          <span onClick={() => setView('list')} className="text-[#64748b] cursor-pointer hover:text-slate-800 transition-colors">Dashboard</span>
          <span className="text-[#94a3b8] font-normal">&gt;</span>
          <span onClick={() => setView('list')} className="text-[#64748b] cursor-pointer hover:text-slate-800 transition-colors">Suppliers</span>
          <span className="text-[#94a3b8] font-normal">&gt;</span>
          <span className="text-[#184edb]">Add</span>
        </div>

        {/* Header section */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold text-[#0f172a] font-heading tracking-tight">New Supplier Registry</h1>
          <p className="text-[14px] text-[#64748b]">Onboard a new vendor to manage parts inventory and accounts payable.</p>
        </div>

        {/* 2-Column Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Form Details */}
          <div className="lg:col-span-8 bg-white border border-[#e2e8f0] rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col">
            
            {/* Form Header */}
            <div className="bg-[#f8fafc] border-b border-[#e2e8f0] px-6 py-4.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-[#eff6ff] p-2 rounded-lg text-[#184edb] flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="16" height="13" x="2" y="6" rx="2" />
                    <path d="M16 2v4M8 2v4M2 11h20" />
                  </svg>
                </div>
                <h2 className="text-[16px] font-bold text-[#0f172a] font-heading">Supplier Details</h2>
              </div>
              <span className="text-[12px] font-semibold text-[#dc2626]">* Required Fields</span>
            </div>

            {/* Form Fields Body */}
            <div className="p-6 flex flex-col gap-5">
              
              {/* Row 1: Name and GST */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12.5px] font-bold text-[#475569]">Supplier Name <span className="text-[#dc2626]">*</span></label>
                  <div className="relative">
                    <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={16} />
                    <input
                      type="text"
                      placeholder="e.g. Continental Auto Parts"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#cbd5e1] rounded-lg text-[13.5px] text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:border-[#184edb] focus:ring-1 focus:ring-[#184edb]"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[12.5px] font-bold text-[#475569]">GST Number</label>
                  <div className="relative">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]">
                      <rect width="18" height="18" x="3" y="3" rx="2" />
                      <path d="M9 17h6M9 13h6M9 9h6" />
                    </svg>
                    <input
                      type="text"
                      placeholder="e.g. 22AAAAA0000A1Z5"
                      value={formGst}
                      onChange={(e) => setFormGst(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#cbd5e1] rounded-lg text-[13.5px] text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:border-[#184edb] focus:ring-1 focus:ring-[#184edb]"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Phone and Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12.5px] font-bold text-[#475569]">Phone Number <span className="text-[#dc2626]">*</span></label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={16} />
                    <input
                      type="text"
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#cbd5e1] rounded-lg text-[13.5px] text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:border-[#184edb] focus:ring-1 focus:ring-[#184edb]"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[12.5px] font-bold text-[#475569]">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={16} />
                    <input
                      type="text"
                      placeholder="vendor@example.com"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#cbd5e1] rounded-lg text-[13.5px] text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:border-[#184edb] focus:ring-1 focus:ring-[#184edb]"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Outstanding and Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12.5px] font-bold text-[#475569]">Opening Outstanding (₹)</label>
                  <div className="relative">
                    <Wallet className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={16} />
                    <input
                      type="text"
                      placeholder="0.00"
                      value={formOutstanding}
                      onChange={(e) => setFormOutstanding(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#cbd5e1] rounded-lg text-[13.5px] text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:border-[#184edb] focus:ring-1 focus:ring-[#184edb]"
                    />
                  </div>
                  <span className="text-[11px] text-[#94a3b8] italic">Enter initial balance payable to this supplier.</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[12.5px] font-bold text-[#475569]">Status</label>
                  <div className="flex bg-[#f1f5fd] border border-[#d6e4ff] rounded-lg overflow-hidden h-[41px]">
                    <button
                      type="button"
                      onClick={() => setFormStatus('ACTIVE')}
                      className={`flex-1 flex items-center justify-center gap-2 text-[13px] font-bold transition-all cursor-pointer ${
                        formStatus === 'ACTIVE'
                          ? 'bg-[#184edb] text-white shadow-sm'
                          : 'text-[#475569] hover:bg-slate-100'
                      }`}
                    >
                      <CheckCircle2 size={16} />
                      <span>Active</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormStatus('INACTIVE')}
                      className={`flex-1 flex items-center justify-center gap-2 text-[13px] font-bold transition-all cursor-pointer ${
                        formStatus === 'INACTIVE'
                          ? 'bg-[#184edb] text-white shadow-sm'
                          : 'text-[#475569] hover:bg-slate-100'
                      }`}
                    >
                      <XCircle size={16} />
                      <span>Inactive</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 4: Business Address */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12.5px] font-bold text-[#475569]">Business Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3.5 text-[#94a3b8]" size={16} />
                  <textarea
                    rows={3}
                    placeholder="Full street address, City, Zip Code"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#cbd5e1] rounded-lg text-[13.5px] text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:border-[#184edb] focus:ring-1 focus:ring-[#184edb] resize-none"
                  />
                </div>
              </div>

            </div>

            {/* Form Footer Buttons */}
            <div className="border-t border-[#e2e8f0] p-6 flex items-center justify-end gap-3 bg-white">
              <button
                type="button"
                onClick={() => { resetForm(); setView('list'); }}
                className="bg-white hover:bg-slate-50 text-[#64748b] font-bold text-[13.5px] px-6 py-2.5 rounded-lg border border-[#cbd5e1] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleAddSupplier(false)}
                className="bg-white hover:bg-slate-50 text-[#184edb] font-bold text-[13.5px] px-6 py-2.5 rounded-lg border border-[#184edb] transition-all cursor-pointer"
              >
                Save & Add New
              </button>
              <button
                type="button"
                onClick={() => handleAddSupplier(true)}
                className="flex items-center gap-2 bg-[#184edb] hover:bg-[#1544c2] text-white font-bold text-[13.5px] px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <Save size={16} />
                <span>Save Supplier</span>
              </button>
            </div>

          </div>

          {/* Right Column: Help Panels */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Quick Help Card */}
            <div className="bg-[#184edb] text-white p-6 rounded-2xl flex flex-col gap-5 shadow-[0_4px_12px_rgba(24,78,219,0.15)] relative overflow-hidden">
              <h3 className="text-[17px] font-bold font-heading">Quick Help</h3>
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <BadgeCheck size={20} className="text-[#a4c2ff] flex-shrink-0 mt-0.5" />
                  <p className="text-[12.5px] leading-relaxed text-[#f1f5fd]">GST Numbers are validated against current regional tax formats to ensure compliance.</p>
                </div>
                <div className="flex items-start gap-3">
                  <Notebook size={20} className="text-[#a4c2ff] flex-shrink-0 mt-0.5" />
                  <p className="text-[12.5px] leading-relaxed text-[#f1f5fd]">Opening outstanding balances will be reflected in your Accounts Payable ledger immediately.</p>
                </div>
                <div className="flex items-start gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#a4c2ff] flex-shrink-0 mt-0.5">
                    <path d="M22 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5C2 8.67 2.67 8 3.5 8h17c.83 0 1.5.67 1.5 1.5Z" />
                    <path d="M22 9L13 14a2 2 0 0 1-2 0L2 9" />
                  </svg>
                  <p className="text-[12.5px] leading-relaxed text-[#f1f5fd]">Email addresses will be used for automated Purchase Orders and payment notifications.</p>
                </div>
              </div>
              <div className="absolute right-0 bottom-0 translate-y-1/4 translate-x-1/4 opacity-10 pointer-events-none">
                <svg width="200" height="200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeWidth="1" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
            </div>

            {/* Supplier Ecosystem Card */}
            <div className="bg-white border border-[#e2e8f0] p-6 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col gap-4">
              <span className="text-[11px] font-bold text-[#64748b] tracking-wider uppercase">SUPPLIER ECOSYSTEM</span>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[32px] font-extrabold text-[#184edb] leading-none">{totalSuppliersCount}</span>
                  <span className="text-[12.5px] text-[#64748b] mt-1 font-semibold">Total Suppliers</span>
                </div>
                <div className="bg-[#eff6ff] p-3 rounded-xl text-[#184edb] flex items-center justify-center">
                  <Users size={24} />
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-[#f1f5fd] h-2.5 rounded-full overflow-hidden mt-2">
                <div className="bg-[#184edb] h-full rounded-full transition-all duration-300" style={{ width: `${activePercent}%` }}></div>
              </div>

              <div className="flex items-center justify-between text-[12.5px] font-bold mt-1 text-[#475569]">
                <span>Active ({activeSuppliersCount})</span>
                <span>Inactive ({inactiveSuppliersCount})</span>
              </div>
            </div>

            {/* Marketing / Image Card */}
            <div className="relative rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)] h-[210px]">
              <img
                src={warehouseImage}
                alt="Warehouse workflow"
                className="w-full h-full object-cover filter brightness-50"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-5">
                <p className="text-white text-[13.5px] font-semibold italic leading-relaxed">
                  "Efficiency starts with a well-managed supply chain."
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* Custom Status Footer */}
        <div className="border-t border-[#cbd5e1] pt-5 mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-[12.5px] text-[#64748b] font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#184edb]"></span>
              <span>Cloud Sync Active</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={14} />
              <span>Last edit 2 mins ago</span>
            </div>
          </div>
          <div className="text-[12.5px] text-[#64748b] font-medium flex items-center gap-2">
            <span>&copy; 2024 AutoPro DMS v4.2</span>
            <span>|</span>
            <span className="hover:underline cursor-pointer">Privacy Policy</span>
          </div>
        </div>

      </div>
    );
  }

  if (view === 'edit') {
    return (
      <div className="flex-1 flex flex-col p-6 gap-6 bg-[#f6f8fc] min-w-0 font-sans">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-[13px] font-semibold text-[#64748b]">
          <span onClick={() => setView('list')} className="cursor-pointer hover:text-slate-800 transition-colors">Dashboard</span>
          <span className="text-[#94a3b8] font-normal">&gt;</span>
          <span onClick={() => setView('list')} className="cursor-pointer hover:text-slate-800 transition-colors">Suppliers</span>
          <span className="text-[#94a3b8] font-normal">&gt;</span>
          <span className="text-[#184edb]">Edit</span>
        </div>

        {/* Header section with Audit Trail */}
        <div className="flex justify-between items-start gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-[28px] font-bold text-[#0f172a] font-heading tracking-tight leading-tight">Edit Supplier</h1>
            <p className="text-[13.5px] text-[#64748b]">Modify account details and procurement settings for Bharat Motors.</p>
          </div>
          <div className="text-right text-[11px] font-medium text-[#64748b]">
            <span className="font-bold text-[#94a3b8] tracking-wider uppercase block text-[10px] mb-1">AUDIT TRAIL</span>
            <span>Created: <strong>Oct 12, 2023</strong></span>
            <span className="block mt-0.5">Last Updated: <strong>Nov 05, 2023</strong></span>
          </div>
        </div>

        {/* 2-Column Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Info and Address */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* General Information Card */}
            <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col">
              <div className="border-b border-[#e2e8f0] px-6 py-4.5 flex items-center gap-3">
                <div className="text-[#184edb] flex items-center justify-center">
                  <IdCard size={20} />
                </div>
                <h2 className="text-[15.5px] font-bold text-[#0f172a] font-heading">General Information</h2>
              </div>
              
              <div className="p-6 flex flex-col gap-5">
                {/* Row 1: Legal Supplier Name & GSTIN */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold text-[#475569]">Legal Supplier Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#f0f5ff] border border-[#cbd5e1] rounded-lg text-[13.5px] text-[#0f172a] font-medium focus:outline-none focus:border-[#184edb] focus:ring-1 focus:ring-[#184edb]"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold text-[#475569]">GST Identification Number (GSTIN)</label>
                    <input
                      type="text"
                      value={editGst}
                      onChange={(e) => setEditGst(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#f0f5ff] border border-[#cbd5e1] rounded-lg text-[13.5px] text-[#0f172a] font-medium focus:outline-none focus:border-[#184edb] focus:ring-1 focus:ring-[#184edb]"
                    />
                  </div>
                </div>

                {/* Row 2: Phone & Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold text-[#475569]">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none" size={16} />
                      <input
                        type="text"
                        maxLength={10}
                        placeholder="10-digit mobile number"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#f0f5ff] border border-[#cbd5e1] rounded-lg text-[13.5px] text-[#0f172a] font-medium focus:outline-none focus:border-[#184edb]"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold text-[#475569]">Business Contact Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none" size={16} />
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#f0f5ff] border border-[#cbd5e1] rounded-lg text-[13.5px] text-[#0f172a] font-medium focus:outline-none focus:border-[#184edb] focus:ring-1 focus:ring-[#184edb]"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 3: Category, Outstanding, Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold text-[#475569]">Supplier Category</label>
                    <div className="relative">
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="w-full pl-4 pr-10 py-2.5 bg-[#f0f5ff] border border-[#cbd5e1] rounded-lg text-[13.5px] text-[#0f172a] font-medium appearance-none focus:outline-none focus:border-[#184edb]"
                      >
                        <option>Authorized Spare Dealer</option>
                        <option>Direct Manufacturer</option>
                        <option>Distributor</option>
                        <option>Local Vendor</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748b] pointer-events-none" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold text-[#475569]">Opening Outstanding (₹)</label>
                    <input
                      type="text"
                      value={editOutstanding}
                      onChange={(e) => setEditOutstanding(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#f0f5ff] border border-[#cbd5e1] rounded-lg text-[13.5px] text-[#0f172a] font-medium focus:outline-none focus:border-[#184edb]"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold text-[#475569]">Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
                      className="w-full px-4 py-2.5 bg-[#f0f5ff] border border-[#cbd5e1] rounded-lg text-[13.5px] text-[#0f172a] font-medium focus:outline-none focus:border-[#184edb]"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Registered Office Address Card */}
            <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col">
              <div className="border-b border-[#e2e8f0] px-6 py-4.5 flex items-center gap-3">
                <div className="text-[#184edb] flex items-center justify-center">
                  <MapPin size={20} />
                </div>
                <h2 className="text-[15.5px] font-bold text-[#0f172a] font-heading">Registered Office Address</h2>
              </div>
              
              <div className="p-6 flex flex-col gap-5">
                {/* Row 1: Street Address */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-[#475569]">Street Address</label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#f0f5ff] border border-[#cbd5e1] rounded-lg text-[13.5px] text-[#0f172a] font-medium focus:outline-none focus:border-[#184edb]"
                  />
                </div>

                {/* Row 2: City, State, ZIP */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold text-[#475569]">City</label>
                    <input
                      type="text"
                      value={editCity}
                      onChange={(e) => setEditCity(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#f0f5ff] border border-[#cbd5e1] rounded-lg text-[13.5px] text-[#0f172a] font-medium focus:outline-none focus:border-[#184edb]"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold text-[#475569]">State</label>
                    <input
                      type="text"
                      value={editState}
                      onChange={(e) => setEditState(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#f0f5ff] border border-[#cbd5e1] rounded-lg text-[13.5px] text-[#0f172a] font-medium focus:outline-none focus:border-[#184edb]"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold text-[#475569]">ZIP / Postal Code</label>
                    <input
                      type="text"
                      value={editZip}
                      onChange={(e) => setEditZip(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#f0f5ff] border border-[#cbd5e1] rounded-lg text-[13.5px] text-[#0f172a] font-medium focus:outline-none focus:border-[#184edb]"
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Financial Terms & Brand Summary Card */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Financial Terms Card */}
            <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col">
              <div className="border-b border-[#e2e8f0] px-6 py-4.5 flex items-center gap-3">
                <div className="text-[#184edb] flex items-center justify-center">
                  <Wallet size={20} />
                </div>
                <h2 className="text-[15.5px] font-bold text-[#0f172a] font-heading">Financial Terms</h2>
              </div>
              
              <div className="p-6 flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-[#475569]">Payment Terms</label>
                  <div className="relative">
                    <select
                      value={editPaymentTerms}
                      onChange={(e) => setEditPaymentTerms(e.target.value)}
                      className="w-full pl-4 pr-10 py-2.5 bg-[#f0f5ff] border border-[#cbd5e1] rounded-lg text-[13.5px] text-[#0f172a] font-medium appearance-none focus:outline-none focus:border-[#184edb]"
                    >
                      <option>Net 30 Days</option>
                      <option>Net 45 Days</option>
                      <option>Net 60 Days</option>
                      <option>COD (Cash on Delivery)</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748b] pointer-events-none" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-[#475569]">Credit Limit (₹)</label>
                  <input
                    type="text"
                    value={editCreditLimit}
                    onChange={(e) => setEditCreditLimit(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#f0f5ff] border border-[#cbd5e1] rounded-lg text-[13.5px] text-[#0f172a] font-medium text-right focus:outline-none focus:border-[#184edb]"
                  />
                </div>

                {/* Account Health Box */}
                <div className="bg-[#e9eefd] border border-[#cbd5e1] rounded-lg p-4 flex flex-col gap-2 mt-1">
                  <div className="flex items-center gap-2 text-[#184edb]">
                    <Shield size={16} className="fill-[#184edb]/10" />
                    <span className="text-[11px] font-extrabold tracking-wider uppercase">ACCOUNT HEALTH</span>
                  </div>
                  <p className="text-[12px] text-[#1e3a8a] leading-relaxed font-medium">
                    Currently Active with no outstanding disputes or late payment flags.
                  </p>
                </div>
              </div>
            </div>

            {/* Brand Card (Bharat Motors gradient) */}
            <div className="bg-gradient-to-br from-[#184edb] to-[#0f2b80] text-white p-6 rounded-xl shadow-[0_4px_12px_rgba(24,78,219,0.15)] flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <h3 className="text-[20px] font-bold font-heading">{editName || 'Bharat Motors'}</h3>
                
                <div className="flex items-center gap-2">
                  <span className="bg-[#fef3c7] text-[#92400e] text-[9.5px] font-extrabold px-2 py-0.5 rounded tracking-wider uppercase">
                    GOLD TIER VENDOR
                  </span>
                  <div className="flex items-center gap-0.5 text-[#fbbf24]">
                    <Star size={12} className="fill-current" />
                    <Star size={12} className="fill-current" />
                    <Star size={12} className="fill-current" />
                    <Star size={12} className="fill-current" />
                    <Star size={12} className="text-[#a4c2ff]" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <div className="flex justify-between items-end text-[12px]">
                  <span className="text-[#a4c2ff] font-medium">Total Purchases YTD</span>
                  <span className="text-[16px] font-extrabold">₹12.4M</span>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                  <div className="bg-white h-full rounded-full" style={{ width: '82%' }}></div>
                </div>

                <div className="flex justify-between text-[11px] text-[#a4c2ff] font-medium">
                  <span>Target: ₹15.0M</span>
                  <span>82% of Goal</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Deactivate & Action Card */}
        <div className="bg-white border border-[#e2e8f0] p-5 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <button 
            type="button"
            onClick={() => {
              if (!editingSupplierId) return;
              if (confirm("Are you sure you want to deactivate this supplier account?")) {
                const updatedList = suppliersList.filter(s => s.id !== editingSupplierId);
                setSuppliersList(updatedList);
                try {
                  localStorage.setItem('dms_suppliers_list', JSON.stringify(updatedList));
                } catch (e) {}
                fetch(`${API_URL}/api/suppliers/${editingSupplierId}`, {
                  method: 'DELETE'
                }).catch((err) => console.error('Error deactivating supplier:', err));
                setView('list');
              }
            }}
            className="flex items-center gap-2 text-[#dc2626] hover:text-[#b91c1c] font-bold text-[13.5px] transition-colors cursor-pointer bg-transparent border-0 outline-none"
          >
            <Trash2 size={16} />
            <span>Deactivate Supplier Account</span>
          </button>
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setView('list')}
              className="bg-white hover:bg-slate-50 text-[#64748b] font-bold text-[13.5px] px-6 py-2.5 rounded-lg border border-[#cbd5e1] transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (!editingSupplierId) return;

                const rawOutstanding = parseFloat((editOutstanding || '').replace(/[^0-9.]/g, '') || '0');
                const formattedOutstanding = `₹${rawOutstanding.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}`;

                const updatedList = suppliersList.map(s => s.id === editingSupplierId ? {
                  ...s,
                  name: editName || s.name,
                  gstNumber: editGst || s.gstNumber,
                  phone: editPhone || s.phone,
                  email: editEmail || s.email,
                  outstanding: formattedOutstanding,
                  isOutstandingPositive: rawOutstanding > 0,
                  status: editStatus
                } : s);

                setSuppliersList(updatedList);
                try {
                  localStorage.setItem('dms_suppliers_list', JSON.stringify(updatedList));
                } catch (e) {}

                fetch(`${API_URL}/api/suppliers/${editingSupplierId}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    name: editName,
                    gstNumber: editGst,
                    phone: editPhone,
                    email: editEmail,
                    outstanding: formattedOutstanding,
                    status: editStatus
                  })
                }).catch((err) => console.error('Error updating supplier:', err));

                alert(`Supplier "${editName}" updated successfully!`);
                setView('list');
              }}
              className="flex items-center gap-2 bg-[#184edb] hover:bg-[#1544c2] text-white font-bold text-[13.5px] px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Save size={16} />
              <span>Update Supplier</span>
            </button>
          </div>
        </div>

        {/* Custom Status Footer */}
        <div className="border-t border-[#cbd5e1] pt-4 mt-2 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12.5px] text-[#64748b] font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
            <span>Database Synced</span>
            <span className="text-[#cbd5e1]">|</span>
            <span>Server ID: DMS-ASIA-04</span>
          </div>
          <div>
            <span>&copy; 2024 AutoPro DMS v4.2.1-Enterprise</span>
          </div>
        </div>

      </div>
    );
  }



  if (view === 'ledger') {
    return (
      <SupplierLedger
        selectedSupplier={selectedLedgerSupplier}
        setSelectedSupplier={setSelectedLedgerSupplier}
        suppliersList={suppliersList}
        onBack={() => setView('list')}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col p-6 gap-6 bg-[#f6f8fc] min-w-0 font-sans">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-[13px] font-medium">
        <span className="text-[#64748b] cursor-pointer hover:text-slate-800 transition-colors">Dashboard</span>
        <span className="text-[#94a3b8] font-normal">&gt;</span>
        <span className="text-[#184edb]">Suppliers</span>
      </div>

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-[#0f172a] font-heading tracking-tight">Suppliers</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={exportSuppliersToExcel}
            className="flex items-center gap-2 bg-[#e0ebff] hover:bg-[#d0e0ff] text-[#0f2b80] font-semibold text-[13.5px] px-4 py-2.5 rounded-lg border border-[#c3d8fa] transition-all cursor-pointer"
          >
            <FileSpreadsheet size={16} className="text-[#184edb]" />
            <span>Export Excel</span>
          </button>
          <button
            onClick={exportSuppliersToPDF}
            className="flex items-center gap-2 bg-[#e0ebff] hover:bg-[#d0e0ff] text-[#0f2b80] font-semibold text-[13.5px] px-4 py-2.5 rounded-lg border border-[#c3d8fa] transition-all cursor-pointer"
          >
            <FileText size={16} className="text-[#184edb]" />
            <span>Export PDF</span>
          </button>
          <button
            onClick={() => { setSelectedLedgerSupplier(null); setView('ledger'); }}
            className="flex items-center gap-2 bg-[#e0ebff] hover:bg-[#d0e0ff] text-[#0f2b80] font-semibold text-[13.5px] px-4 py-2.5 rounded-lg border border-[#c3d8fa] transition-all cursor-pointer"
          >
            <Notebook size={16} className="text-[#184edb]" />
            <span>View Ledger</span>
          </button>
          
          <button
            onClick={() => setView('add')}
            className="flex items-center gap-2 bg-[#184edb] hover:bg-[#1544c2] text-white font-semibold text-[13.5px] px-4 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Plus size={18} className="stroke-[2.5px]" />
            <span>Add Supplier</span>
          </button>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Suppliers */}
        <div 
          onClick={() => { setStatusFilter('All Status'); setOutstandingOnlyFilter(false); setSearchTerm(''); }}
          className={`bg-white border p-6 rounded-2xl flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)] min-h-[140px] relative cursor-pointer transition-all hover:border-[#184edb] ${!outstandingOnlyFilter && statusFilter === 'All Status' ? 'border-[#184edb] ring-1 ring-[#184edb]/20' : 'border-[#e2e8f0]'}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-bold text-[#64748b] tracking-wider uppercase">TOTAL SUPPLIERS</span>
              <span className="text-[32px] font-extrabold text-[#0f172a] leading-none mt-1">{suppliersList.length}</span>
            </div>
            <div className="bg-[#eff6ff] p-2.5 rounded-lg flex items-center justify-center">
              <Users size={20} className="text-[#184edb]" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-4 text-[12.5px] font-semibold text-[#184edb]">
            <TrendingUp size={14} className="stroke-[2.5px]" />
            <span>+12% this month</span>
          </div>
        </div>

        {/* Card 2: Active Suppliers */}
        <div 
          onClick={() => { setStatusFilter('Active'); setOutstandingOnlyFilter(false); }}
          className={`bg-white border p-6 rounded-2xl flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)] min-h-[140px] relative cursor-pointer transition-all hover:border-[#184edb] ${statusFilter === 'Active' ? 'border-[#184edb] ring-1 ring-[#184edb]/20' : 'border-[#e2e8f0]'}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-bold text-[#64748b] tracking-wider uppercase">ACTIVE SUPPLIERS</span>
              <span className="text-[32px] font-extrabold text-[#0f172a] leading-none mt-1">
                {suppliersList.filter(s => s.status === 'ACTIVE').length}
              </span>
            </div>
            <div className="bg-[#eff6ff] p-2.5 rounded-lg flex items-center justify-center">
              <BadgeCheck size={20} className="text-[#184edb]" />
            </div>
          </div>
          <div className="mt-4 text-[12.5px] text-[#475569] font-medium">
            <span>{suppliersList.length > 0 ? Math.round((suppliersList.filter(s => s.status === 'ACTIVE').length / suppliersList.length) * 100) : 0}% Operation Rate</span>
          </div>
        </div>

        {/* Card 3: Outstanding Amount */}
        <div 
          onClick={() => setOutstandingOnlyFilter(prev => !prev)}
          className={`bg-white border p-6 rounded-2xl flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)] min-h-[140px] relative cursor-pointer transition-all hover:border-[#dc2626] ${outstandingOnlyFilter ? 'border-[#dc2626] ring-1 ring-[#dc2626]/20 bg-red-50/20' : 'border-[#e2e8f0]'}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-bold text-[#64748b] tracking-wider uppercase">OUTSTANDING AMOUNT</span>
              <span className="text-[32px] font-extrabold text-[#0f172a] leading-none mt-1">
                ₹{suppliersList.reduce((acc, s) => {
                  const num = parseFloat(s.outstanding.replace(/[^0-9.]/g, '')) || 0;
                  return acc + num;
                }, 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="bg-[#fef2f2] p-2.5 rounded-lg flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#dc2626]">
                <rect width="20" height="12" x="2" y="6" rx="2" />
                <circle cx="12" cy="12" r="2" />
                <path d="M6 12h.01M18 12h.01" />
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-[12.5px] font-semibold text-[#dc2626]">
            <AlertTriangle size={14} className="stroke-[2.5px]" />
            <span>High Priority</span>
          </div>
        </div>

        {/* Card 4: Monthly Purchases */}
        <div className="bg-white border border-[#e2e8f0] p-6 rounded-2xl flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)] min-h-[140px] relative">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-bold text-[#64748b] tracking-wider uppercase">MONTHLY PURCHASES</span>
              <span className="text-[32px] font-extrabold text-[#0f172a] leading-none mt-1">₹1.28L</span>
            </div>
            <div className="bg-[#f8fafc] p-2.5 rounded-lg flex items-center justify-center border border-[#e2e8f0]">
              <ShoppingBag size={20} className="text-[#64748b]" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-[12.5px] text-[#475569] font-medium">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#64748b]">
              <rect width="18" height="18" x="3" y="4" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            <span>Oct 2023</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-[#e2e8f0] p-5 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-wrap lg:flex-nowrap items-end gap-4">
        <div className="flex-1 min-w-[200px] flex flex-col gap-1.5 relative">
          <label className="text-[12.5px] font-bold text-[#475569]">Search Supplier Name / ID</label>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSearchDropdown(true);
                setHighlightedIndex(-1);
              }}
              onFocus={() => setShowSearchDropdown(true)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setHighlightedIndex(prev => (prev + 1) % searchMatches.length);
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setHighlightedIndex(prev => (prev - 1 + searchMatches.length) % searchMatches.length);
                } else if (e.key === 'Enter') {
                  e.preventDefault();
                  if (searchMatches.length > 0) {
                    const selected = highlightedIndex >= 0 ? searchMatches[highlightedIndex] : searchMatches[0];
                    setSearchTerm(selected.name);
                    setShowSearchDropdown(false);
                    tableContainerRef.current?.scrollIntoView({ behavior: 'smooth' });
                  }
                } else if (e.key === 'Escape') {
                  setShowSearchDropdown(false);
                }
              }}
              placeholder="Start typing..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#f0f5ff] border border-[#d6e4ff] rounded-lg text-[13.5px] text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:border-[#184edb] transition-all"
            />
            {showSearchDropdown && searchTerm.trim() !== '' && searchMatches.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#cbd5e1] rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto divide-y divide-slate-100">
                {searchMatches.map((supplier, idx) => (
                  <div
                    key={supplier.id}
                    onClick={() => {
                      setSearchTerm(supplier.name);
                      setShowSearchDropdown(false);
                      tableContainerRef.current?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`p-3 text-xs cursor-pointer flex justify-between items-center transition-colors ${
                      highlightedIndex === idx ? 'bg-[#eff6ff] text-[#184edb] font-bold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-bold">{supplier.name}</span>
                      <span className="text-[10px] text-slate-400">{supplier.phone} • GST: {supplier.gstNumber}</span>
                    </div>
                    <span className="font-mono text-[11px] text-[#184edb] bg-blue-50 px-2 py-0.5 rounded font-bold">{supplier.id}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="w-[180px] flex flex-col gap-1.5">
          <label className="text-[12.5px] font-bold text-[#475569]">GST Number</label>
          <input
            type="text"
            placeholder="e.g. 22AAAAA..."
            value={gstSearch}
            onChange={(e) => setGstSearch(e.target.value)}
            className="w-full px-4 py-2.5 bg-[#f0f5ff] border border-[#d6e4ff] rounded-lg text-[13.5px] text-[#0f172a] focus:outline-none focus:border-[#184edb] transition-all"
          />
        </div>

        <div className="w-[160px] flex flex-col gap-1.5">
          <label className="text-[12.5px] font-bold text-[#475569]">Status</label>
          <div className="relative cursor-pointer">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-[#f0f5ff] border border-[#d6e4ff] rounded-lg text-[13.5px] text-[#0f172a] appearance-none focus:outline-none focus:border-[#184edb] transition-all cursor-pointer"
            >
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
            <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748b] pointer-events-none" />
          </div>
        </div>

        <div className="w-[180px] flex flex-col gap-1.5">
          <label className="text-[12.5px] font-bold text-[#475569]">Date Range</label>
          <input
            type="text"
            placeholder="mm/dd/yyyy"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full px-4 py-2.5 bg-[#f0f5ff] border border-[#d6e4ff] rounded-lg text-[13.5px] text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:border-[#184edb] transition-all"
          />
        </div>

        <div className="flex gap-2.5">
          <button 
            onClick={() => tableContainerRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-[#184edb] hover:bg-[#1544c2] text-white font-bold text-[13.5px] px-6 py-2.5 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer h-[41px] flex items-center justify-center"
          >
            Apply
          </button>
          <button 
            onClick={() => {
              setSearchTerm('');
              setGstSearch('');
              setStatusFilter('All Status');
              setDateRange('');
              setOutstandingOnlyFilter(false);
            }}
            className="bg-[#e0ebff] hover:bg-[#d0e0ff] text-[#184edb] font-bold text-[13.5px] px-6 py-2.5 rounded-lg border border-[#c3d8fa] transition-all cursor-pointer h-[41px] flex items-center justify-center"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div ref={tableContainerRef} className="bg-white border border-[#e2e8f0] rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#f1f5fd] border-b border-[#e2e8f0]">
                <th className="py-4 px-6 text-[12.5px] font-extrabold text-[#475569] tracking-wider">Supplier ID</th>
                <th className="py-4 px-6 text-[12.5px] font-extrabold text-[#475569] tracking-wider">Supplier Name</th>
                <th className="py-4 px-6 text-[12.5px] font-extrabold text-[#475569] tracking-wider">GST Number</th>
                <th className="py-4 px-6 text-[12.5px] font-extrabold text-[#475569] tracking-wider">Phone / Email</th>
                <th className="py-4 px-6 text-[12.5px] font-extrabold text-[#475569] tracking-wider">Outstanding</th>
                <th className="py-4 px-6 text-[12.5px] font-extrabold text-[#475569] tracking-wider">Status</th>
                <th className="py-4 px-6 w-[60px]"></th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.map((supplier) => (
                <tr key={supplier.id} className="border-b border-[#e2e8f0] hover:bg-slate-50/50 transition-colors last:border-b-0">
                    <td 
                      onClick={() => { setSelectedLedgerSupplier(supplier); setView('ledger'); }}
                      className="py-4.5 px-6 text-[13.5px] font-bold text-[#184edb] cursor-pointer hover:underline"
                    >
                      {supplier.id}
                    </td>
                    <td className="py-4.5 px-6 text-[13.5px] font-bold text-[#0f172a]">
                      {supplier.name}
                    </td>
                    <td className="py-4.5 px-6 text-[13.5px] text-[#475569]">
                      {supplier.gstNumber}
                    </td>
                    <td className="py-4.5 px-6">
                      <div className="flex flex-col">
                        <span className="text-[13.5px] font-semibold text-[#0f172a]">{supplier.phone}</span>
                        <span className="text-[11.5px] text-[#64748b]">{supplier.email}</span>
                      </div>
                    </td>
                    <td className={`py-4.5 px-6 text-[13.5px] font-bold ${supplier.isOutstandingPositive ? 'text-[#dc2626]' : 'text-[#0f172a]'}`}>
                      {supplier.outstanding}
                    </td>
                    <td className="py-4.5 px-6">
                      {supplier.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center gap-1.5 bg-[#e6f4ea] text-[#137333] font-bold text-[11.5px] px-2.5 py-1 rounded-full uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#137333]"></span>
                          ACTIVE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-[#e8eaed] text-[#5f6368] font-bold text-[11.5px] px-2.5 py-1 rounded-full uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#5f6368]"></span>
                          INACTIVE
                        </span>
                      )}
                    </td>
                    <td className="py-4.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <button 
                          onClick={() => { setSelectedLedgerSupplier(supplier); setView('ledger'); }}
                          title="View Ledger"
                          className="p-1.5 text-blue-600 hover:text-blue-700 bg-blue-50/80 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200/60 cursor-pointer shadow-2xs"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            setEditingSupplierId(supplier.id);
                            setEditName(supplier.name);
                            setEditGst(supplier.gstNumber);
                            setEditPhone(supplier.phone || '');
                            setEditEmail(supplier.email || '');
                            setEditOutstanding(supplier.outstanding ? supplier.outstanding.replace(/[^0-9.]/g, '') : '0');
                            setEditStatus(supplier.status || 'ACTIVE');
                            setView('edit');
                          }}
                          title="Edit Supplier"
                          className="p-1.5 text-amber-600 hover:text-amber-700 bg-amber-50/80 hover:bg-amber-100 rounded-lg transition-colors border border-amber-200/60 cursor-pointer shadow-2xs"
                        >
                          <Edit size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="bg-[#f1f5fd] border-t border-[#e2e8f0] px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-[13px] text-[#64748b] font-medium">
            Showing <strong className="text-[#0f172a] font-semibold">1 - 4</strong> of <strong className="text-[#0f172a] font-semibold">284</strong> suppliers
          </span>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-md border border-[#cbd5e1] bg-white text-[#64748b] hover:bg-slate-50 transition-all cursor-pointer">
              <ChevronLeft size={16} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md font-semibold text-[13px] bg-[#184edb] text-white transition-all cursor-pointer">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md font-semibold text-[13px] bg-white border border-[#cbd5e1] text-[#64748b] hover:bg-slate-50 transition-all cursor-pointer">
              2
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md font-semibold text-[13px] bg-white border border-[#cbd5e1] text-[#64748b] hover:bg-slate-50 transition-all cursor-pointer">
              3
            </button>
            <span className="text-[#64748b] text-[13px] px-1">...</span>
            <button className="w-8 h-8 flex items-center justify-center rounded-md font-semibold text-[13px] bg-white border border-[#cbd5e1] text-[#64748b] hover:bg-slate-50 transition-all cursor-pointer">
              71
            </button>
            <button className="p-1.5 rounded-md border border-[#cbd5e1] bg-white text-[#64748b] hover:bg-slate-50 transition-all cursor-pointer">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>



      {/* Footer Branding */}
      <div className="mt-8 text-center">
        <span className="text-[10px] tracking-[0.15em] font-bold text-[#94a3b8] uppercase">
          AUTOPRO DMS ENTERPRISE SUITE &copy; 2024 &bull; PRECISION ENGINEERED FOR SCALE
        </span>
      </div>
    </div>
  );
};

export default Suppliers;
