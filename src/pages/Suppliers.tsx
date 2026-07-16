import React, { useState } from 'react';
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
  Printer,
  ShoppingCart,
  CreditCard,
  Truck,
  Calendar,
  Filter,
  MoreVertical,
  Building2
} from 'lucide-react';
import warehouseImage from '../assets/warehouse_efficiency.png';

interface SupplierType {
  id: string;
  name: string;
  gstNumber: string;
  phone: string;
  email: string;
  outstanding: string;
  isOutstandingPositive: boolean;
  status: 'ACTIVE' | 'INACTIVE';
}

export const Suppliers: React.FC = () => {
  const [view, setView] = useState<'list' | 'add' | 'edit' | 'ledger'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [gstSearch, setGstSearch] = useState('22AAAAA0000A1Z5');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [dateRange, setDateRange] = useState('');

  // Form Fields State
  const [formName, setFormName] = useState('');
  const [formGst, setFormGst] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formOutstanding, setFormOutstanding] = useState('');
  const [formStatus, setFormStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [formAddress, setFormAddress] = useState('');

  // Edit Form Fields State (Prefilled with Bharat Motors details as per Figma)
  const [editName, setEditName] = useState('Bharat Motors');
  const [editGst, setEditGst] = useState('29AAACN1234F1Z1');
  const [editCategory, setEditCategory] = useState('Authorized Spare Dealer');
  const [editEmail, setEditEmail] = useState('procurement@bharatmotors.co.in');
  const [editAddress, setEditAddress] = useState('42, Industrial Area Phase II, Electronic City');
  const [editCity, setEditCity] = useState('Bangalore');
  const [editState, setEditState] = useState('Karnataka');
  const [editZip, setEditZip] = useState('560100');
  const [editPaymentTerms, setEditPaymentTerms] = useState('Net 30 Days');
  const [editCreditLimit, setEditCreditLimit] = useState('5,000,000');

  // Ledger Filter States
  const [ledgerSupplier, setLedgerSupplier] = useState('Global Parts Corp.');
  const [ledgerDateRange, setLedgerDateRange] = useState('');
  const [ledgerTxType, setLedgerTxType] = useState('All Transactions');

  const [suppliersList, setSuppliersList] = useState<SupplierType[]>([
    {
      id: 'SUP-9821',
      name: 'AutoParts Direct Ltd.',
      gstNumber: '27AADCA1234F1Z1',
      phone: '+1 202-555-0156',
      email: 'orders@autoparts.com',
      outstanding: '$12,450.00',
      isOutstandingPositive: true,
      status: 'ACTIVE'
    },
    {
      id: 'SUP-7742',
      name: 'Global Engine Spares',
      gstNumber: '19BBEDA4432A1Z9',
      phone: '+1 555-0198-2210',
      email: 'billing@globalspares.co',
      outstanding: '$0.00',
      isOutstandingPositive: false,
      status: 'ACTIVE'
    },
    {
      id: 'SUP-3321',
      name: 'Premium Lubricants Int.',
      gstNumber: '33CCDFA5567G2Z0',
      phone: '+1 212-701-0099',
      email: 'contact@premiumlubes.com',
      outstanding: '$4,200.00',
      isOutstandingPositive: true,
      status: 'INACTIVE'
    },
    {
      id: 'SUP-1102',
      name: 'Zenith Tire Solutions',
      gstNumber: '07AABBA9999K3Z2',
      phone: '+1 415-888-0123',
      email: 'zenith@tires.co',
      outstanding: '$26,200.00',
      isOutstandingPositive: true,
      status: 'ACTIVE'
    }
  ]);

  const handleAddSupplier = () => {
    if (!formName || !formPhone) {
      alert('Please fill out the required fields.');
      return;
    }

    const newId = `SUP-${Math.floor(1000 + Math.random() * 9000)}`;
    const parsedOutstanding = parseFloat(formOutstanding || '0');
    const formattedOutstanding = `$${parsedOutstanding.toLocaleString('en-US', {
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

    setSuppliersList([newSupplier, ...suppliersList]);
    resetForm();
    setView('list');
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
                      placeholder="10-digit mobile number"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
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
                  <label className="text-[12.5px] font-bold text-[#475569]">Opening Outstanding ($)</label>
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
                onClick={() => {
                  if (!formName || !formPhone) {
                    alert('Please fill out the required fields.');
                    return;
                  }
                  const newId = `SUP-${Math.floor(1000 + Math.random() * 9000)}`;
                  const parsedOutstanding = parseFloat(formOutstanding || '0');
                  const formattedOutstanding = `$${parsedOutstanding.toLocaleString('en-US', {
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
                  setSuppliersList([newSupplier, ...suppliersList]);
                  resetForm();
                }}
                className="bg-white hover:bg-slate-50 text-[#184edb] font-bold text-[13.5px] px-6 py-2.5 rounded-lg border border-[#184edb] transition-all cursor-pointer"
              >
                Save & Add New
              </button>
              <button
                type="button"
                onClick={handleAddSupplier}
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
                  <span className="text-[32px] font-extrabold text-[#184edb] leading-none">124</span>
                  <span className="text-[12.5px] text-[#64748b] mt-1 font-semibold">Total Suppliers</span>
                </div>
                <div className="bg-[#eff6ff] p-3 rounded-xl text-[#184edb] flex items-center justify-center">
                  <Users size={24} />
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-[#f1f5fd] h-2.5 rounded-full overflow-hidden mt-2">
                <div className="bg-[#184edb] h-full rounded-full" style={{ width: '75%' }}></div>
              </div>

              <div className="flex items-center justify-between text-[12.5px] font-bold mt-1 text-[#475569]">
                <span>Active (93)</span>
                <span>Inactive (31)</span>
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

                {/* Row 2: Category & Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
              if (confirm("Are you sure you want to deactivate this supplier account?")) {
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
                alert('Supplier updated successfully!');
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
      <div className="flex-1 flex flex-col p-6 gap-6 bg-[#f6f8fc] min-w-0 font-sans">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-[13px] font-semibold text-[#64748b]">
          <span onClick={() => setView('list')} className="cursor-pointer hover:text-slate-800 transition-colors">Dashboard</span>
          <span className="text-[#94a3b8] font-normal">&gt;</span>
          <span onClick={() => setView('list')} className="cursor-pointer hover:text-slate-800 transition-colors">Suppliers</span>
          <span className="text-[#94a3b8] font-normal">&gt;</span>
          <span className="text-[#184edb]">Ledger</span>
        </div>

        {/* Header section with print/export actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-[28px] font-bold text-[#0f172a] font-heading tracking-tight">Supplier Ledger</h1>
          
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 bg-white hover:bg-slate-50 text-[#475569] font-bold text-[13px] px-4 py-2 rounded-lg border border-[#cbd5e1] transition-all cursor-pointer">
              <Printer size={15} />
              <span>Print</span>
            </button>
            <button className="flex items-center gap-2 bg-white hover:bg-slate-50 text-[#475569] font-bold text-[13px] px-4 py-2 rounded-lg border border-[#cbd5e1] transition-all cursor-pointer">
              <FileSpreadsheet size={15} className="text-[#10b981]" />
              <span>Excel</span>
            </button>
            <button className="flex items-center gap-2 bg-[#184edb] hover:bg-[#1544c2] text-white font-bold text-[13px] px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer">
              <FileText size={15} />
              <span>PDF Export</span>
            </button>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Total Purchase */}
          <div className="bg-white border border-[#e2e8f0] p-5.5 rounded-xl flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)] min-h-[125px] relative">
            <div className="flex items-start justify-between">
              <div className="bg-[#eff6ff] p-2.5 rounded-lg flex items-center justify-center text-[#184edb]">
                <ShoppingCart size={20} />
              </div>
              <div className="flex items-center gap-0.5 text-[#10b981] text-[12px] font-bold">
                <span>+8.2%</span>
                <TrendingUp size={14} className="stroke-[2.5px]" />
              </div>
            </div>
            <div className="mt-3.5">
              <span className="text-[26px] font-extrabold text-[#0f172a] leading-none">$124,580.00</span>
              <span className="block text-[10.5px] font-bold text-[#64748b] tracking-wider uppercase mt-1.5">TOTAL PURCHASE</span>
            </div>
          </div>

          {/* Card 2: Total Paid */}
          <div className="bg-white border border-[#e2e8f0] p-5.5 rounded-xl flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)] min-h-[125px] relative">
            <div className="flex items-start justify-between">
              <div className="bg-[#eff6ff] p-2.5 rounded-lg flex items-center justify-center text-[#184edb]">
                <CreditCard size={20} />
              </div>
              <span className="text-[11.5px] font-semibold text-[#64748b]">Last 30 Days</span>
            </div>
            <div className="mt-3.5">
              <span className="text-[26px] font-extrabold text-[#0f172a] leading-none">$98,240.00</span>
              <span className="block text-[10.5px] font-bold text-[#64748b] tracking-wider uppercase mt-1.5">TOTAL PAID</span>
            </div>
          </div>

          {/* Card 3: Outstanding Balance */}
          <div className="bg-white border border-[#e2e8f0] p-5.5 rounded-xl flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)] min-h-[125px] relative">
            <div className="flex items-start justify-between">
              <div className="bg-[#fef2f2] p-2.5 rounded-lg flex items-center justify-center text-[#dc2626]">
                <AlertTriangle size={20} />
              </div>
              <div className="flex items-center gap-1 text-[#dc2626] text-[11.5px] font-bold">
                <span>Attention</span>
                <AlertTriangle size={12} className="stroke-[2.5px]" />
              </div>
            </div>
            <div className="mt-3.5">
              <span className="text-[26px] font-extrabold text-[#dc2626] leading-none">$26,340.00</span>
              <span className="block text-[10.5px] font-bold text-[#64748b] tracking-wider uppercase mt-1.5">OUTSTANDING BALANCE</span>
            </div>
          </div>

          {/* Card 4: Last Payment Made */}
          <div className="bg-[#184edb] text-white p-5.5 rounded-xl flex flex-col justify-between shadow-[0_4px_12px_rgba(24,78,219,0.15)] min-h-[125px] relative">
            <div className="flex items-start justify-between">
              <div className="bg-white/10 p-2.5 rounded-lg flex items-center justify-center text-white">
                <CreditCard size={20} />
              </div>
              <span className="text-[11px] font-bold text-[#a4c2ff] tracking-wide">OCT 15, 2023</span>
            </div>
            <div className="mt-3.5">
              <span className="text-[26px] font-extrabold text-white leading-none">$12,400.00</span>
              <span className="block text-[10.5px] font-bold text-[#a4c2ff] tracking-wider uppercase mt-1.5">LAST PAYMENT MADE</span>
            </div>
            <div className="absolute bottom-2.5 left-5.5 flex items-center gap-1 text-[8.5px] text-[#a4c2ff] tracking-wider font-bold">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-80">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>TRANSACTION ID: #TRX-883120-P</span>
            </div>
          </div>
        </div>

        {/* Filter Records card */}
        <div className="bg-white border border-[#e2e8f0] p-5 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-wrap lg:flex-nowrap items-end gap-4">
          <div className="flex-1 min-w-[220px] flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-[#475569]">Select Supplier</label>
            <div className="relative">
              <Truck className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={16} />
              <select
                value={ledgerSupplier}
                onChange={(e) => setLedgerSupplier(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#cbd5e1] rounded-lg text-[13.5px] text-[#0f172a] font-semibold appearance-none focus:outline-none focus:border-[#184edb]"
              >
                <option>Global Parts Corp.</option>
                <option>Bharat Motors</option>
                <option>AutoParts Direct Ltd.</option>
              </select>
              <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748b] pointer-events-none" />
            </div>
          </div>

          <div className="w-[200px] flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-[#475569]">Date Range</label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={16} />
              <input
                type="text"
                placeholder="mm/dd/yyyy"
                value={ledgerDateRange}
                onChange={(e) => setLedgerDateRange(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#cbd5e1] rounded-lg text-[13.5px] text-[#0f172a] font-medium focus:outline-none focus:border-[#184edb]"
              />
            </div>
          </div>

          <div className="w-[200px] flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-[#475569]">Transaction Type</label>
            <div className="relative">
              <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={16} />
              <select
                value={ledgerTxType}
                onChange={(e) => setLedgerTxType(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#cbd5e1] rounded-lg text-[13.5px] text-[#0f172a] font-semibold appearance-none focus:outline-none focus:border-[#184edb]"
              >
                <option>All Transactions</option>
                <option>Purchases</option>
                <option>Payments</option>
                <option>Credit Notes</option>
              </select>
              <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748b] pointer-events-none" />
            </div>
          </div>

          <div className="flex gap-2.5">
            <button className="bg-[#184edb] hover:bg-[#1544c2] text-white font-bold text-[13.5px] px-6 py-2.5 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer h-[41px] flex items-center gap-2 border-0">
              <Search size={15} />
              <span>Apply Filters</span>
            </button>
            <button className="bg-white hover:bg-slate-50 text-[#64748b] font-bold text-[13.5px] px-6 py-2.5 rounded-lg border border-[#cbd5e1] transition-all cursor-pointer h-[41px]">
              Reset
            </button>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col relative">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-[#f1f5fd] border-b border-[#e2e8f0]">
                  <th className="py-4.5 px-6 text-[12px] font-extrabold text-[#475569] tracking-wider uppercase">Date</th>
                  <th className="py-4.5 px-6 text-[12px] font-extrabold text-[#475569] tracking-wider uppercase">Reference No</th>
                  <th className="py-4.5 px-6 text-[12px] font-extrabold text-[#475569] tracking-wider uppercase">Type</th>
                  <th className="py-4.5 px-6 text-[12px] font-extrabold text-[#475569] tracking-wider uppercase">Description</th>
                  <th className="py-4.5 px-6 text-[12px] font-extrabold text-[#475569] tracking-wider uppercase">Debit ($)</th>
                  <th className="py-4.5 px-6 text-[12px] font-extrabold text-[#475569] tracking-wider uppercase">Credit ($)</th>
                  <th className="py-4.5 px-6 text-[12px] font-extrabold text-[#475569] tracking-wider uppercase">Balance ($)</th>
                  <th className="py-4.5 px-6 text-[12px] font-extrabold text-[#475569] tracking-wider uppercase">Payment Mode</th>
                  <th className="py-4.5 px-6 text-[12px] font-extrabold text-[#475569] tracking-wider uppercase">Remarks</th>
                  <th className="py-4.5 px-6 w-[50px]"></th>
                </tr>
              </thead>
              <tbody className="relative">
                {/* Row 1 */}
                <tr className="border-b border-[#e2e8f0] hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 text-[13px] font-bold text-[#0f172a]">01/10/2023</td>
                  <td className="py-4 px-6 text-[13px] text-[#64748b] font-medium">-</td>
                  <td className="py-4 px-6 text-[12px] text-[#0f172a] font-bold">Balance</td>
                  <td className="py-4 px-6 text-[13px] text-[#0f172a] font-bold">Opening Balance Forwarded</td>
                  <td className="py-4 px-6 text-[13px] text-[#0f172a] font-semibold">0.00</td>
                  <td className="py-4 px-6 text-[13px] text-[#0f172a] font-semibold">0.00</td>
                  <td className="py-4 px-6 text-[13px] text-[#0f172a] font-bold">15,400.00</td>
                  <td className="py-4 px-6 text-[13px] text-[#64748b] font-medium">-</td>
                  <td className="py-4 px-6 text-[12.5px] text-[#475569] font-medium">Forwarded from FY22</td>
                  <td className="py-4 px-6 text-center text-[#64748b]">
                    <button className="hover:text-slate-800 cursor-pointer bg-transparent border-0"><MoreVertical size={16} /></button>
                  </td>
                </tr>

                {/* Row 2 */}
                <tr className="border-b border-[#e2e8f0] hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 text-[13px] font-bold text-[#0f172a]">05/10/2023</td>
                  <td className="py-4 px-6 text-[13px] font-bold text-[#184edb] cursor-pointer hover:underline">PUR-2023-0982</td>
                  <td className="py-4 px-6">
                    <span className="bg-[#eff6ff] text-[#1e40af] text-[10px] font-extrabold px-2.5 py-0.5 rounded tracking-wide uppercase">
                      PURCHASE
                    </span>
                  </td>
                  <td className="py-4 px-6 text-[13px] text-[#475569] font-medium max-w-[220px]">
                    Engine Spares & Gaskets Set (50 units)
                  </td>
                  <td className="py-4 px-6 text-[13px] text-[#0f172a] font-semibold">8,500.00</td>
                  <td className="py-4 px-6 text-[13px] text-[#0f172a] font-semibold">0.00</td>
                  <td className="py-4 px-6 text-[13px] text-[#0f172a] font-bold">23,900.00</td>
                  <td className="py-4 px-6 text-[13px] text-[#0f172a] font-semibold">Credit Account</td>
                  <td className="py-4 px-6 text-[12.5px] text-[#475569] font-medium">Due in 30 days</td>
                  <td className="py-4 px-6 text-center text-[#64748b]">
                    <button className="hover:text-slate-800 cursor-pointer bg-transparent border-0"><MoreVertical size={16} /></button>
                  </td>
                </tr>

                {/* Row 3 */}
                <tr className="border-b border-[#e2e8f0] hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 text-[13px] font-bold text-[#0f172a]">10/10/2023</td>
                  <td className="py-4 px-6 text-[13px] font-bold text-[#184edb] cursor-pointer hover:underline">PAY-9921-X</td>
                  <td className="py-4 px-6">
                    <span className="bg-[#e6f4ea] text-[#137333] text-[10px] font-extrabold px-2.5 py-0.5 rounded tracking-wide uppercase">
                      PAYMENT
                    </span>
                  </td>
                  <td className="py-4 px-6 text-[13px] text-[#475569] font-medium max-w-[220px]">
                    Partial Settlement against INV-8821
                  </td>
                  <td className="py-4 px-6 text-[13px] text-[#0f172a] font-semibold">0.00</td>
                  <td className="py-4 px-6 text-[13px] text-[#10b981] font-bold">10,000.00</td>
                  <td className="py-4 px-6 text-[13px] text-[#0f172a] font-bold">13,900.00</td>
                  <td className="py-4 px-6 text-[13px] text-[#0f172a] font-semibold">Bank Transfer</td>
                  <td className="py-4 px-6 text-[12.5px] text-[#475569] font-medium">Reference: TXN0021</td>
                  <td className="py-4 px-6 text-center text-[#64748b]">
                    <button className="hover:text-slate-800 cursor-pointer bg-transparent border-0"><MoreVertical size={16} /></button>
                  </td>
                </tr>

                {/* Row 4 */}
                <tr className="border-b border-[#e2e8f0] hover:bg-slate-50/50 transition-colors relative">
                  <td className="py-4 px-6 text-[13px] font-bold text-[#0f172a]">15/10/2023</td>
                  <td className="py-4 px-6 text-[13px] font-bold text-[#184edb] cursor-pointer hover:underline">CRN-0012-R</td>
                  <td className="py-4 px-6">
                    <span className="bg-[#faf5ff] text-[#6b21a8] text-[10px] font-extrabold px-2.5 py-0.5 rounded tracking-wide uppercase">
                      CREDIT NOTE
                    </span>
                  </td>
                  <td className="py-4 px-6 text-[13px] text-[#475569] font-medium max-w-[220px]">
                    Damaged items return (INV-8821)
                  </td>
                  <td className="py-4 px-6 text-[13px] text-[#0f172a] font-semibold">0.00</td>
                  <td className="py-4 px-6 text-[13px] text-[#8b5cf6] font-bold">2,400.00</td>
                  <td className="py-4 px-6 text-[13px] text-[#0f172a] font-bold">11,500.00</td>
                  <td className="py-4 px-6 text-[13px] text-[#0f172a] font-semibold">Adjustment</td>
                  <td className="py-4 px-6 text-[12.5px] text-[#475569] font-medium">QC Verified</td>
                  <td className="py-4 px-6 text-center text-[#64748b] relative">
                    <button className="hover:text-slate-800 cursor-pointer bg-transparent border-0"><MoreVertical size={16} /></button>
                    {/* Floating Action Plus button positioned absolute overlapping table */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-30">
                      <button className="w-10 h-10 rounded-full bg-[#184edb] text-white flex items-center justify-center shadow-lg hover:bg-[#1544c2] cursor-pointer border-0">
                        <Plus size={20} className="stroke-[2.5px]" />
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Row 5 */}
                <tr className="border-b border-[#e2e8f0] hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 text-[13px] font-bold text-[#0f172a]">22/10/2023</td>
                  <td className="py-4 px-6 text-[13px] font-bold text-[#184edb] cursor-pointer hover:underline">PUR-2023-1104</td>
                  <td className="py-4 px-6">
                    <span className="bg-[#eff6ff] text-[#1e40af] text-[10px] font-extrabold px-2.5 py-0.5 rounded tracking-wide uppercase">
                      PURCHASE
                    </span>
                  </td>
                  <td className="py-4 px-6 text-[13px] text-[#475569] font-medium max-w-[220px]">
                    Premium Tyre Stock - Summer Edition
                  </td>
                  <td className="py-4 px-6 text-[13px] text-[#0f172a] font-semibold">14,840.00</td>
                  <td className="py-4 px-6 text-[13px] text-[#0f172a] font-semibold">0.00</td>
                  <td className="py-4 px-6 text-[13px] text-[#0f172a] font-bold">26,340.00</td>
                  <td className="py-4 px-6 text-[13px] text-[#0f172a] font-semibold">Credit Account</td>
                  <td className="py-4 px-6 text-[12.5px] text-[#475569] font-medium">Main Warehouse Delivery</td>
                  <td className="py-4 px-6 text-center text-[#64748b]">
                    <button className="hover:text-slate-800 cursor-pointer bg-transparent border-0"><MoreVertical size={16} /></button>
                  </td>
                </tr>

                {/* CLOSING TOTALS */}
                <tr className="bg-slate-50/70 font-bold border-t-2 border-[#cbd5e1]">
                  <td colSpan={4} className="py-4.5 px-6 text-right text-[12.5px] font-bold text-[#475569] uppercase tracking-wider">
                    CLOSING TOTALS
                  </td>
                  <td className="py-4.5 px-6 text-[13.5px] font-extrabold text-[#0f172a]">$23,340.00</td>
                  <td className="py-4.5 px-6 text-[13.5px] font-extrabold text-[#0f172a]">$12,400.00</td>
                  <td className="py-4.5 px-6 text-[13.5px] font-extrabold text-[#dc2626]">$26,340.00</td>
                  <td colSpan={3} className="py-4.5 px-6"></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Table Footer / Pagination */}
          <div className="bg-[#f1f5fd] border-t border-[#e2e8f0] px-6 py-4.5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-[13px] text-[#64748b] font-medium">
              Showing <strong className="text-[#0f172a] font-semibold">1-10</strong> of <strong className="text-[#0f172a] font-semibold">42</strong> entries
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
                5
              </button>
              <button className="p-1.5 rounded-md border border-[#cbd5e1] bg-white text-[#64748b] hover:bg-slate-50 transition-all cursor-pointer">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section: Trend Chart & Supplier Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Transaction Trend Column */}
          <div className="lg:col-span-8 bg-white border border-[#e2e8f0] p-6 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[15.5px] font-bold text-[#0f172a] font-heading">Transaction Trend</h2>
              <div className="relative">
                <select className="pl-3 pr-8 py-1.5 bg-[#f0f5ff] border border-[#d6e4ff] rounded-md text-[11.5px] font-semibold text-[#184edb] appearance-none focus:outline-none cursor-pointer">
                  <option>Monthly View</option>
                  <option>Weekly View</option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#184edb] pointer-events-none" />
              </div>
            </div>

            {/* Custom Bar Chart */}
            <div className="h-[180px] border-b border-[#cbd5e1] border-dashed flex items-end gap-6.5 px-4 pt-4">
              {/* JUL */}
              <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div className="w-full bg-[#cbd5e1]/45 hover:bg-[#cbd5e1]/70 transition-all rounded-t h-[30%]"></div>
                <span className="text-[10px] font-bold text-[#64748b]">JUL</span>
              </div>
              {/* AUG */}
              <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div className="w-full bg-[#8baddf]/75 hover:bg-[#8baddf] transition-all rounded-t h-[60%]"></div>
                <span className="text-[10px] font-bold text-[#64748b]">AUG</span>
              </div>
              {/* SEP */}
              <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div className="w-full bg-[#184edb] hover:bg-[#1544c2] transition-all rounded-t h-[90%]"></div>
                <span className="text-[10px] font-bold text-[#64748b]">SEP</span>
              </div>
              {/* OCT */}
              <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div className="w-full bg-[#6492e8]/85 hover:bg-[#6492e8] transition-all rounded-t h-[55%]"></div>
                <span className="text-[10px] font-bold text-[#64748b]">OCT</span>
              </div>
              {/* NOV */}
              <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div className="w-full bg-[#cbd5e1]/45 hover:bg-[#cbd5e1]/70 transition-all rounded-t h-[20%]"></div>
                <span className="text-[10px] font-bold text-[#64748b]">NOV</span>
              </div>
            </div>
          </div>

          {/* Supplier Details Column */}
          <div className="lg:col-span-4 bg-white border border-[#e2e8f0] p-6 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col gap-5">
            <h2 className="text-[15.5px] font-bold text-[#0f172a] font-heading">Supplier Details</h2>
            
            <div className="flex items-center gap-3">
              <div className="bg-[#eff6ff] p-3 rounded-lg text-[#184edb]">
                <Building2 size={24} />
              </div>
              <div className="flex flex-col">
                <span className="text-[15px] font-bold text-[#0f172a]">Global Parts Corp.</span>
                <span className="text-[11.5px] text-[#64748b] font-medium">Vendor ID: V-449021</span>
              </div>
            </div>

            <div className="flex flex-col gap-3.5 border-t border-b border-[#e2e8f0] py-4 text-[13px]">
              <div className="flex justify-between font-medium">
                <span className="text-[#64748b]">Credit Limit:</span>
                <span className="text-[#0f172a] font-bold">$50,000.00</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-[#64748b]">Credit Period:</span>
                <span className="text-[#0f172a] font-bold">45 Days</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-[#64748b]">Contact:</span>
                <span className="text-[#0f172a] font-bold">+1-800-PARTS-GP</span>
              </div>
            </div>

            <button
              onClick={() => setView('edit')}
              className="w-full py-2.5 border border-[#184edb] rounded-lg text-[#184edb] hover:bg-[#184edb]/5 font-bold text-[13px] transition-all cursor-pointer bg-transparent"
            >
              View Full Profile
            </button>
          </div>
        </div>

        {/* Custom Status Footer */}
        <div className="mt-4 pt-4 border-t border-[#e2e8f0] text-center">
          <span className="text-[11px] text-[#64748b] font-medium">
            &copy; 2023 AutoPro DMS - High Precision Dealership Management Suite. All rights reserved.
          </span>
        </div>

      </div>
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
          <button className="flex items-center gap-2 bg-[#e0ebff] hover:bg-[#d0e0ff] text-[#0f2b80] font-semibold text-[13.5px] px-4 py-2.5 rounded-lg border border-[#c3d8fa] transition-all cursor-pointer">
            <FileSpreadsheet size={16} className="text-[#184edb]" />
            <span>Export Excel</span>
          </button>
          <button className="flex items-center gap-2 bg-[#e0ebff] hover:bg-[#d0e0ff] text-[#0f2b80] font-semibold text-[13.5px] px-4 py-2.5 rounded-lg border border-[#c3d8fa] transition-all cursor-pointer">
            <FileText size={16} className="text-[#184edb]" />
            <span>Export PDF</span>
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
        {/* Card 1 */}
        <div className="bg-white border border-[#e2e8f0] p-6 rounded-2xl flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)] min-h-[140px] relative">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-bold text-[#64748b] tracking-wider uppercase">TOTAL SUPPLIERS</span>
              <span className="text-[32px] font-extrabold text-[#0f172a] leading-none mt-1">284</span>
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

        {/* Card 2 */}
        <div className="bg-white border border-[#e2e8f0] p-6 rounded-2xl flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)] min-h-[140px] relative">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-bold text-[#64748b] tracking-wider uppercase">ACTIVE SUPPLIERS</span>
              <span className="text-[32px] font-extrabold text-[#0f172a] leading-none mt-1">261</span>
            </div>
            <div className="bg-[#eff6ff] p-2.5 rounded-lg flex items-center justify-center">
              <BadgeCheck size={20} className="text-[#184edb]" />
            </div>
          </div>
          <div className="mt-4 text-[12.5px] text-[#475569] font-medium">
            <span>91% Operation Rate</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-[#e2e8f0] p-6 rounded-2xl flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)] min-h-[140px] relative">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-bold text-[#64748b] tracking-wider uppercase">OUTSTANDING AMOUNT</span>
              <span className="text-[32px] font-extrabold text-[#0f172a] leading-none mt-1">$42,850</span>
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

        {/* Card 4 */}
        <div className="bg-white border border-[#e2e8f0] p-6 rounded-2xl flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)] min-h-[140px] relative">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-bold text-[#64748b] tracking-wider uppercase">MONTHLY PURCHASES</span>
              <span className="text-[32px] font-extrabold text-[#0f172a] leading-none mt-1">$128.4k</span>
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
        <div className="flex-1 min-w-[200px] flex flex-col gap-1.5">
          <label className="text-[12.5px] font-bold text-[#475569]">Search Supplier Name / ID</label>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Start typing..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#f0f5ff] border border-[#d6e4ff] rounded-lg text-[13.5px] text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:border-[#184edb] transition-all"
            />
          </div>
        </div>

        <div className="w-[180px] flex flex-col gap-1.5">
          <label className="text-[12.5px] font-bold text-[#475569]">GST Number</label>
          <input
            type="text"
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
          <button className="bg-[#184edb] hover:bg-[#1544c2] text-white font-bold text-[13.5px] px-6 py-2.5 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer h-[41px] flex items-center justify-center">
            Apply
          </button>
          <button className="bg-[#e0ebff] hover:bg-[#d0e0ff] text-[#184edb] font-bold text-[13.5px] px-6 py-2.5 rounded-lg border border-[#c3d8fa] transition-all cursor-pointer h-[41px] flex items-center justify-center">
            Reset
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-[#e2e8f0] rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col">
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
              {suppliersList
                .filter((s) => {
                  const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.id.toLowerCase().includes(searchTerm.toLowerCase());
                  const matchStatus = statusFilter === 'All Status' || s.status === statusFilter.toUpperCase();
                  return matchSearch && matchStatus;
                })
                .map((supplier) => (
                  <tr key={supplier.id} className="border-b border-[#e2e8f0] hover:bg-slate-50/50 transition-colors last:border-b-0">
                    <td 
                      onClick={() => setView('ledger')}
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
                      <button 
                        onClick={() => setView('edit')}
                        className="text-[#64748b] hover:text-[#0f172a] transition-colors cursor-pointer"
                      >
                        <Eye size={18} />
                      </button>
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
