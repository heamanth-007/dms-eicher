import React, { useState, useEffect, useRef } from 'react';
import {
  Printer,
  FileSpreadsheet,
  FileText,
  ShoppingCart,
  TrendingUp,
  CreditCard,
  AlertTriangle,
  Truck,
  ChevronDown,
  Calendar,
  Filter,
  Search,
  Phone,
  Mail,
  BadgeCheck
} from 'lucide-react';

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

interface SupplierLedgerProps {
  selectedSupplier: SupplierType | null;
  setSelectedSupplier: (supplier: SupplierType | null) => void;
  suppliersList: SupplierType[];
  onBack?: () => void;
}

export interface LedgerTransaction {
  id: string;
  date: string;
  referenceNo: string;
  type: 'PURCHASE' | 'PAYMENT' | 'CREDIT NOTE' | 'BALANCE';
  description: string;
  debit: number;
  credit: number;
  balance: number;
  paymentMode: string;
  remarks: string;
}

export const SupplierLedger: React.FC<SupplierLedgerProps> = ({
  selectedSupplier,
  setSelectedSupplier,
  suppliersList,
  onBack
}) => {
  const [ledgerSupplier, setLedgerSupplier] = useState('Global Parts Corp.');
  const [ledgerDateRange, setLedgerDateRange] = useState('');
  const [ledgerTxType, setLedgerTxType] = useState('All Transactions');

  // Supplier Auto-complete search state
  const [supplierSearchText, setSupplierSearchText] = useState('');
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const [highlightedSupplierIndex, setHighlightedSupplierIndex] = useState(-1);
  const supplierDropdownRef = useRef<HTMLDivElement>(null);

  // Active filter state
  const [appliedTxType, setAppliedTxType] = useState('All Transactions');
  const [appliedDateRange, setAppliedDateRange] = useState('');

  const [transactions] = useState<LedgerTransaction[]>([
    {
      id: 'tx-1',
      date: '01/10/2023',
      referenceNo: '-',
      type: 'BALANCE',
      description: 'Opening Balance Forwarded',
      debit: 0,
      credit: 0,
      balance: 15400,
      paymentMode: '-',
      remarks: 'Forwarded from FY22'
    },
    {
      id: 'tx-2',
      date: '05/10/2023',
      referenceNo: 'PUR-2023-0982',
      type: 'PURCHASE',
      description: 'Engine Spares & Gaskets Set (50 units)',
      debit: 8500,
      credit: 0,
      balance: 23900,
      paymentMode: 'Credit Account',
      remarks: 'Due in 30 days'
    },
    {
      id: 'tx-3',
      date: '10/10/2023',
      referenceNo: 'PAY-9921-X',
      type: 'PAYMENT',
      description: 'Partial Settlement against INV-8821',
      debit: 0,
      credit: 10000,
      balance: 13900,
      paymentMode: 'Bank Transfer',
      remarks: 'Reference: TXN0021'
    },
    {
      id: 'tx-4',
      date: '15/10/2023',
      referenceNo: 'CN-2023-014',
      type: 'CREDIT NOTE',
      description: 'Damaged Filters Return Credit',
      debit: 0,
      credit: 1500,
      balance: 12400,
      paymentMode: 'Adjustment',
      remarks: 'Approved by Manager'
    }
  ]);

  useEffect(() => {
    if (selectedSupplier) {
      setLedgerSupplier(selectedSupplier.name);
      setSupplierSearchText(selectedSupplier.name);
    } else if (suppliersList.length > 0) {
      setLedgerSupplier(suppliersList[0].name);
      setSupplierSearchText(suppliersList[0].name);
      setSelectedSupplier(suppliersList[0]);
    }
  }, [selectedSupplier, suppliersList]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (supplierDropdownRef.current && !supplierDropdownRef.current.contains(event.target as Node)) {
        setShowSupplierDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const supplierMatches = suppliersList.filter(s =>
    s.name.toLowerCase().includes(supplierSearchText.toLowerCase()) ||
    s.id.toLowerCase().includes(supplierSearchText.toLowerCase())
  );

  // Filter transactions
  const filteredTransactions = transactions.filter(tx => {
    let matchType = true;
    if (appliedTxType === 'Purchases') {
      matchType = tx.type === 'PURCHASE';
    } else if (appliedTxType === 'Payments') {
      matchType = tx.type === 'PAYMENT';
    } else if (appliedTxType === 'Credit Notes') {
      matchType = tx.type === 'CREDIT NOTE';
    }

    let matchDate = true;
    if (appliedDateRange.trim() !== '') {
      matchDate = tx.date.includes(appliedDateRange.trim());
    }

    return matchType && matchDate;
  });

  const handleApplyFilters = () => {
    setAppliedTxType(ledgerTxType);
    setAppliedDateRange(ledgerDateRange);
  };

  const handleResetFilters = () => {
    setLedgerTxType('All Transactions');
    setLedgerDateRange('');
    setAppliedTxType('All Transactions');
    setAppliedDateRange('');
  };

  // Export & Print handlers
  const exportLedgerToExcel = () => {
    const headers = ['Date', 'Reference No', 'Type', 'Description', 'Debit (₹)', 'Credit (₹)', 'Balance (₹)', 'Payment Mode', 'Remarks'];
    const currentSupplierName = selectedSupplier?.name || ledgerSupplier;
    const rows = filteredTransactions.map(tx => [
      tx.date,
      tx.referenceNo,
      tx.type,
      `"${tx.description.replace(/"/g, '""')}"`,
      tx.debit.toFixed(2),
      tx.credit.toFixed(2),
      tx.balance.toFixed(2),
      tx.paymentMode,
      `"${tx.remarks.replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [
      `"Supplier Ledger: ${currentSupplierName.replace(/"/g, '""')}"`,
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ledger_${currentSupplierName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportLedgerToPDF = () => {
    window.print();
  };

  const printLedger = () => {
    window.print();
  };

  // KPI Calculations
  const totalPurchase = filteredTransactions
    .filter(t => t.type === 'PURCHASE')
    .reduce((acc, t) => acc + t.debit, 0);

  const totalPaid = filteredTransactions
    .filter(t => t.type === 'PAYMENT')
    .reduce((acc, t) => acc + t.credit, 0);

  const currentSupplierDetails = selectedSupplier || suppliersList.find(s => s.name === ledgerSupplier);

  return (
    <div className="flex-1 flex flex-col p-6 gap-6 bg-[#f6f8fc] min-w-0 font-sans text-left">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-[13px] font-semibold text-[#64748b]">
        <span onClick={onBack} className="cursor-pointer hover:text-slate-800 transition-colors">Dashboard</span>
        <span className="text-[#94a3b8] font-normal">&gt;</span>
        <span onClick={onBack} className="cursor-pointer hover:text-slate-800 transition-colors">Suppliers</span>
        <span className="text-[#94a3b8] font-normal">&gt;</span>
        <span className="text-[#184edb]">Ledger</span>
      </div>

      {/* Header section with print/export actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-[28px] font-bold text-[#0f172a] font-heading tracking-tight">
          Ledger: {selectedSupplier?.name || ledgerSupplier}
        </h1>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={printLedger}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-[#475569] font-bold text-[13px] px-4 py-2 rounded-lg border border-[#cbd5e1] transition-all cursor-pointer shadow-xs"
          >
            <Printer size={15} />
            <span>Print</span>
          </button>
          <button 
            onClick={exportLedgerToExcel}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-[#475569] font-bold text-[13px] px-4 py-2 rounded-lg border border-[#cbd5e1] transition-all cursor-pointer shadow-xs"
          >
            <FileSpreadsheet size={15} className="text-[#10b981]" />
            <span>Excel</span>
          </button>
          <button 
            onClick={exportLedgerToPDF}
            className="flex items-center gap-2 bg-[#184edb] hover:bg-[#1544c2] text-white font-bold text-[13px] px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer"
          >
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
            <span className="text-[26px] font-extrabold text-[#0f172a] leading-none">
              ₹{(totalPurchase || 124580).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
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
            <span className="text-[26px] font-extrabold text-[#0f172a] leading-none">
              ₹{(totalPaid || 98240).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
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
            <span className="text-[26px] font-extrabold text-[#dc2626] leading-none">
              {selectedSupplier?.outstanding || '₹12,400.00'}
            </span>
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
            <span className="text-[26px] font-extrabold text-white leading-none">₹12,400.00</span>
            <span className="block text-[10.5px] font-bold text-[#a4c2ff] tracking-wider uppercase mt-1.5">LAST PAYMENT MADE</span>
          </div>
        </div>
      </div>

      {/* Filter Records card */}
      <div className="bg-white border border-[#e2e8f0] p-5 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-wrap lg:flex-nowrap items-end gap-4">
        <div className="flex-1 min-w-[240px] flex flex-col gap-1.5 relative" ref={supplierDropdownRef}>
          <label className="text-[12px] font-bold text-[#475569]">Select Supplier</label>
          <div className="relative">
            <Truck className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={16} />
            <input
              type="text"
              value={supplierSearchText}
              onChange={(e) => {
                setSupplierSearchText(e.target.value);
                setShowSupplierDropdown(true);
                setHighlightedSupplierIndex(-1);
              }}
              onFocus={() => setShowSupplierDropdown(true)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setHighlightedSupplierIndex(prev => (prev + 1) % (supplierMatches.length || 1));
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setHighlightedSupplierIndex(prev => (prev - 1 + (supplierMatches.length || 1)) % (supplierMatches.length || 1));
                } else if (e.key === 'Enter') {
                  e.preventDefault();
                  if (supplierMatches.length > 0) {
                    const selected = highlightedSupplierIndex >= 0 ? supplierMatches[highlightedSupplierIndex] : supplierMatches[0];
                    setSupplierSearchText(selected.name);
                    setLedgerSupplier(selected.name);
                    setSelectedSupplier(selected);
                    setShowSupplierDropdown(false);
                  }
                } else if (e.key === 'Escape') {
                  setShowSupplierDropdown(false);
                }
              }}
              placeholder="Type supplier name or ID..."
              className="w-full pl-10 pr-9 py-2.5 bg-white border border-[#cbd5e1] rounded-lg text-[13.5px] text-[#0f172a] font-semibold focus:outline-none focus:border-[#184edb]"
            />
            <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748b] pointer-events-none" />

            {showSupplierDropdown && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#cbd5e1] rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto divide-y divide-slate-100">
                {supplierMatches.length > 0 ? (
                  supplierMatches.map((supplier, idx) => (
                    <div
                      key={supplier.id}
                      onClick={() => {
                        setSupplierSearchText(supplier.name);
                        setLedgerSupplier(supplier.name);
                        setSelectedSupplier(supplier);
                        setShowSupplierDropdown(false);
                      }}
                      className={`p-3 text-xs cursor-pointer flex justify-between items-center transition-colors ${
                        highlightedSupplierIndex === idx
                          ? 'bg-[#eff6ff] text-[#184edb] font-bold'
                          : selectedSupplier?.id === supplier.id
                          ? 'bg-blue-50/70 text-[#184edb] font-semibold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-[13px]">{supplier.name}</span>
                        <span className="text-[10px] text-slate-400">{supplier.phone} • GST: {supplier.gstNumber}</span>
                      </div>
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="font-mono text-[11px] text-[#184edb] bg-blue-50 px-2 py-0.5 rounded font-bold">{supplier.id}</span>
                        <span className="text-[10px] text-slate-500 font-semibold">{supplier.outstanding}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-xs text-slate-400 italic text-center">No matching suppliers found</div>
                )}
              </div>
            )}
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
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#cbd5e1] rounded-lg text-[13.5px] text-[#0f172a] font-semibold appearance-none focus:outline-none focus:border-[#184edb] cursor-pointer"
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
          <button 
            onClick={handleApplyFilters}
            className="bg-[#184edb] hover:bg-[#1544c2] text-white font-bold text-[13.5px] px-6 py-2.5 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer h-[41px] flex items-center gap-2 border-0"
          >
            <Search size={15} />
            <span>Apply Filters</span>
          </button>
          <button 
            onClick={handleResetFilters}
            className="bg-white hover:bg-slate-50 text-[#64748b] font-bold text-[13.5px] px-6 py-2.5 rounded-lg border border-[#cbd5e1] transition-all cursor-pointer h-[41px]"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Selected Supplier Details Info Card */}
      {currentSupplierDetails && (
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#eff6ff] text-[#184edb] flex items-center justify-center font-bold text-[18px] border border-[#d6e4ff] flex-shrink-0">
              <Truck size={24} />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-[18px] font-bold text-[#0f172a] font-heading">{currentSupplierDetails.name}</h2>
                <span className="font-mono text-[11px] text-[#184edb] bg-[#eff6ff] border border-[#d6e4ff] px-2.5 py-0.5 rounded-full font-bold">
                  {currentSupplierDetails.id}
                </span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                  currentSupplierDetails.status === 'ACTIVE'
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${currentSupplierDetails.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                  {currentSupplierDetails.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-[12.5px] text-[#64748b] flex-wrap mt-0.5">
                {currentSupplierDetails.phone && (
                  <span className="flex items-center gap-1.5 font-medium">
                    <Phone size={14} className="text-[#94a3b8]" />
                    {currentSupplierDetails.phone}
                  </span>
                )}
                {currentSupplierDetails.email && currentSupplierDetails.email !== 'N/A' && (
                  <span className="flex items-center gap-1.5 font-medium">
                    <Mail size={14} className="text-[#94a3b8]" />
                    {currentSupplierDetails.email}
                  </span>
                )}
                {currentSupplierDetails.gstNumber && currentSupplierDetails.gstNumber !== 'N/A' && (
                  <span className="flex items-center gap-1.5 font-medium">
                    <BadgeCheck size={14} className="text-[#94a3b8]" />
                    GST: <span className="font-mono text-[#334155] font-semibold">{currentSupplierDetails.gstNumber}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-[#e2e8f0] pt-3 md:pt-0 md:pl-6 justify-between md:justify-end">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Current Outstanding</span>
              <span className={`text-[20px] font-extrabold font-heading ${
                currentSupplierDetails.isOutstandingPositive ? 'text-[#dc2626]' : 'text-[#10b981]'
              }`}>
                {currentSupplierDetails.outstanding}
              </span>
            </div>
          </div>
        </div>
      )}

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
                <th className="py-4.5 px-6 text-[12px] font-extrabold text-[#475569] tracking-wider uppercase">Debit (₹)</th>
                <th className="py-4.5 px-6 text-[12px] font-extrabold text-[#475569] tracking-wider uppercase">Credit (₹)</th>
                <th className="py-4.5 px-6 text-[12px] font-extrabold text-[#475569] tracking-wider uppercase">Balance (₹)</th>
                <th className="py-4.5 px-6 text-[12px] font-extrabold text-[#475569] tracking-wider uppercase">Payment Mode</th>
                <th className="py-4.5 px-6 text-[12px] font-extrabold text-[#475569] tracking-wider uppercase">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="border-b border-[#e2e8f0] hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 text-[13px] font-bold text-[#0f172a]">{tx.date}</td>
                  <td className="py-4 px-6 text-[13px] font-bold text-[#184edb] cursor-pointer hover:underline">{tx.referenceNo}</td>
                  <td className="py-4 px-6">
                    {tx.type === 'PURCHASE' ? (
                      <span className="bg-[#eff6ff] text-[#1e40af] text-[10px] font-extrabold px-2.5 py-0.5 rounded tracking-wide uppercase">
                        PURCHASE
                      </span>
                    ) : tx.type === 'PAYMENT' ? (
                      <span className="bg-[#e6f4ea] text-[#137333] text-[10px] font-extrabold px-2.5 py-0.5 rounded tracking-wide uppercase">
                        PAYMENT
                      </span>
                    ) : tx.type === 'CREDIT NOTE' ? (
                      <span className="bg-[#fef3c7] text-[#92400e] text-[10px] font-extrabold px-2.5 py-0.5 rounded tracking-wide uppercase">
                        CREDIT NOTE
                      </span>
                    ) : (
                      <span className="text-[12px] text-[#0f172a] font-bold">BALANCE</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-[13px] text-[#475569] font-medium max-w-[220px]">
                    {tx.description}
                  </td>
                  <td className="py-4 px-6 text-[13px] text-[#0f172a] font-semibold">{tx.debit.toFixed(2)}</td>
                  <td className={`py-4 px-6 text-[13px] font-bold ${tx.credit > 0 ? 'text-[#10b981]' : 'text-[#0f172a]'}`}>{tx.credit.toFixed(2)}</td>
                  <td className="py-4 px-6 text-[13px] text-[#0f172a] font-bold">{tx.balance.toFixed(2)}</td>
                  <td className="py-4 px-6 text-[13px] text-[#0f172a] font-semibold">{tx.paymentMode}</td>
                  <td className="py-4 px-6 text-[12.5px] text-[#475569] font-medium">{tx.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
