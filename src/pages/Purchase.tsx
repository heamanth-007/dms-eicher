import React, { useState } from 'react';
import {
  ShoppingBag,
  RotateCcw,
  FileText,
  Plus,
  Download,
  Eye,
  Pencil,
  Printer,
  Search,
  Filter,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Trash2
} from 'lucide-react';

// Interfaces
interface PurchaseOrder {
  id: string;
  invoiceNo: string;
  supplier: string;
  supplierInitials: string;
  supplierBg: string;
  date: string;
  itemsCount: number;
  gstAmount: number;
  grandTotal: number;
  status: 'PAID' | 'PARTIAL' | 'PENDING';
}

interface PurchaseReturn {
  id: string;
  poRef: string;
  supplier: string;
  date: string;
  itemsCount: number;
  refundValue: number;
  reason: string;
  status: 'COMPLETED' | 'PENDING' | 'REJECTED';
}

interface SupplierInvoice {
  id: string;
  poRef: string;
  supplier: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  status: 'PAID' | 'PARTIAL' | 'UNPAID' | 'OVERDUE';
}

export const Purchase: React.FC = () => {
  // Sub-tabs: 'overview', 'return', 'invoice'
  const [subTab, setSubTab] = useState<'overview' | 'return' | 'invoice'>('overview');

  // Modals state
  const [showNewPurchaseModal, setShowNewPurchaseModal] = useState(false);
  const [showNewReturnModal, setShowNewReturnModal] = useState(false);
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseOrder | null>(null);

  // Filters state
  const [supplierFilter, setSupplierFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('All');

  // --- MOCK DATA ---
  // Initial Purchases
  const [purchases, setPurchases] = useState<PurchaseOrder[]>([
    {
      id: 'PO-2023-0942',
      invoiceNo: 'INV/8842/23',
      supplier: 'Precision Parts Co.',
      supplierInitials: 'PP',
      supplierBg: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
      date: 'Oct 24, 2023',
      itemsCount: 142,
      gstAmount: 1240.00,
      grandTotal: 13640.00,
      status: 'PAID'
    },
    {
      id: 'PO-2023-0941',
      invoiceNo: 'EMW/92/2023',
      supplier: 'Elite Motors Wholesale',
      supplierInitials: 'EM',
      supplierBg: 'bg-purple-50 text-purple-600 border border-purple-100',
      date: 'Oct 23, 2023',
      itemsCount: 85,
      gstAmount: 840.00,
      grandTotal: 9240.00,
      status: 'PARTIAL'
    },
    {
      id: 'PO-2023-0940',
      invoiceNo: 'GT-INV-551',
      supplier: 'Global Tyres Ltd.',
      supplierInitials: 'GT',
      supplierBg: 'bg-rose-50 text-rose-600 border border-rose-100',
      date: 'Oct 22, 2023',
      itemsCount: 210,
      gstAmount: 2450.00,
      grandTotal: 26950.00,
      status: 'PENDING'
    },
    {
      id: 'PO-2023-0939',
      invoiceNo: 'PR-920-X',
      supplier: 'Precision Parts Co.',
      supplierInitials: 'PP',
      supplierBg: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
      date: 'Oct 21, 2023',
      itemsCount: 45,
      gstAmount: 410.00,
      grandTotal: 4510.00,
      status: 'PAID'
    },
    {
      id: 'PO-2023-0938',
      invoiceNo: 'INV-7731',
      supplier: 'Apex Hydraulics',
      supplierInitials: 'AH',
      supplierBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
      date: 'Oct 18, 2023',
      itemsCount: 12,
      gstAmount: 150.00,
      grandTotal: 1800.00,
      status: 'PAID'
    },
    {
      id: 'PO-2023-0937',
      invoiceNo: 'INV-7720',
      supplier: 'Standard Engines Co.',
      supplierInitials: 'SE',
      supplierBg: 'bg-orange-50 text-orange-600 border border-orange-100',
      date: 'Oct 15, 2023',
      itemsCount: 3,
      gstAmount: 1850.00,
      grandTotal: 22150.00,
      status: 'PENDING'
    },
    {
      id: 'PO-2023-0936',
      invoiceNo: 'EMW/88/2023',
      supplier: 'Elite Motors Wholesale',
      supplierInitials: 'EM',
      supplierBg: 'bg-purple-50 text-purple-600 border border-purple-100',
      date: 'Oct 12, 2023',
      itemsCount: 90,
      gstAmount: 990.00,
      grandTotal: 10890.00,
      status: 'PAID'
    },
    {
      id: 'PO-2023-0935',
      invoiceNo: 'GT-INV-520',
      supplier: 'Global Tyres Ltd.',
      supplierInitials: 'GT',
      supplierBg: 'bg-rose-50 text-rose-600 border border-rose-100',
      date: 'Oct 10, 2023',
      itemsCount: 105,
      gstAmount: 1120.00,
      grandTotal: 12320.00,
      status: 'PARTIAL'
    }
  ]);

  // Initial Returns
  const [returns, setReturns] = useState<PurchaseReturn[]>([
    {
      id: 'RET-2023-010',
      poRef: 'PO-2023-0941',
      supplier: 'Elite Motors Wholesale',
      date: 'Oct 25, 2023',
      itemsCount: 5,
      refundValue: 550.00,
      reason: 'Defective alternators',
      status: 'COMPLETED'
    },
    {
      id: 'RET-2023-009',
      poRef: 'PO-2023-0938',
      supplier: 'Apex Hydraulics',
      date: 'Oct 20, 2023',
      itemsCount: 2,
      refundValue: 300.00,
      reason: 'Incorrect size fittings',
      status: 'PENDING'
    },
    {
      id: 'RET-2023-008',
      poRef: 'PO-2023-0935',
      supplier: 'Global Tyres Ltd.',
      date: 'Oct 14, 2023',
      itemsCount: 8,
      refundValue: 960.00,
      reason: 'Sidewall rubber cracking',
      status: 'COMPLETED'
    },
    {
      id: 'RET-2023-007',
      poRef: 'PO-2023-0939',
      supplier: 'Precision Parts Co.',
      date: 'Oct 22, 2023',
      itemsCount: 1,
      refundValue: 100.00,
      reason: 'Damaged packaging',
      status: 'REJECTED'
    }
  ]);

  // Initial Invoices
  const [invoices, setInvoices] = useState<SupplierInvoice[]>([
    {
      id: 'INV/8842/23',
      poRef: 'PO-2023-0942',
      supplier: 'Precision Parts Co.',
      issueDate: 'Oct 24, 2023',
      dueDate: 'Nov 24, 2023',
      amount: 13640.00,
      status: 'PAID'
    },
    {
      id: 'EMW/92/2023',
      poRef: 'PO-2023-0941',
      supplier: 'Elite Motors Wholesale',
      issueDate: 'Oct 23, 2023',
      dueDate: 'Nov 23, 2023',
      amount: 9240.00,
      status: 'PARTIAL'
    },
    {
      id: 'GT-INV-551',
      poRef: 'PO-2023-0940',
      supplier: 'Global Tyres Ltd.',
      issueDate: 'Oct 22, 2023',
      dueDate: 'Nov 22, 2023',
      amount: 26950.00,
      status: 'OVERDUE'
    },
    {
      id: 'PR-920-X',
      poRef: 'PO-2023-0939',
      supplier: 'Precision Parts Co.',
      issueDate: 'Oct 21, 2023',
      dueDate: 'Nov 21, 2023',
      amount: 4510.00,
      status: 'PAID'
    },
    {
      id: 'INV-7731',
      poRef: 'PO-2023-0938',
      supplier: 'Apex Hydraulics',
      issueDate: 'Oct 18, 2023',
      dueDate: 'Nov 18, 2023',
      amount: 1800.00,
      status: 'PAID'
    },
    {
      id: 'INV-7720',
      poRef: 'PO-2023-0937',
      supplier: 'Standard Engines Co.',
      issueDate: 'Oct 15, 2023',
      dueDate: 'Nov 15, 2023',
      amount: 22150.00,
      status: 'UNPAID'
    }
  ]);

  // --- NEW ENTRY STATE VARIABLES ---
  // Purchase form state
  const [newPoId, setNewPoId] = useState('PO-2023-0943');
  const [newPoInvoice, setNewPoInvoice] = useState('');
  const [newPoSupplier, setNewPoSupplier] = useState('Precision Parts Co.');
  const [newPoDate, setNewPoDate] = useState('Oct 26, 2023');
  const [newPoItems, setNewPoItems] = useState(50);
  const [newPoGst, setNewPoGst] = useState(250);
  const [newPoTotal, setNewPoTotal] = useState(2500);
  const [newPoStatus, setNewPoStatus] = useState<'PAID' | 'PARTIAL' | 'PENDING'>('PAID');

  // Return form state
  const [newRetId, setNewRetId] = useState('RET-2023-011');
  const [newRetPoRef, setNewRetPoRef] = useState('PO-2023-0942');
  const [newRetSupplier, setNewRetSupplier] = useState('Precision Parts Co.');
  const [newRetDate, setNewRetDate] = useState('Oct 26, 2023');
  const [newRetQty, setNewRetQty] = useState(3);
  const [newRetRefund, setNewRetRefund] = useState(150);
  const [newRetReason, setNewRetReason] = useState('Faulty electronics');
  const [newRetStatus, setNewRetStatus] = useState<'COMPLETED' | 'PENDING' | 'REJECTED'>('PENDING');

  // Invoice form state
  const [newInvNo, setNewInvNo] = useState('INV-8850');
  const [newInvPoRef, setNewInvPoRef] = useState('PO-2023-0942');
  const [newInvSupplier, setNewInvSupplier] = useState('Precision Parts Co.');
  const [newInvIssueDate, setNewInvIssueDate] = useState('Oct 26, 2023');
  const [newInvDueDate, setNewInvDueDate] = useState('Nov 26, 2023');
  const [newInvAmount, setNewInvAmount] = useState(1500);
  const [newInvStatus, setNewInvStatus] = useState<'PAID' | 'PARTIAL' | 'UNPAID' | 'OVERDUE'>('UNPAID');

  // --- STATS COMPUTATION ---
  const totalPurchasesCount = purchases.length + 1276; // Adding base mock number (1284 original)
  const todayPurchasesCount = purchases.filter(p => p.date.includes('Oct 26') || p.date.includes('Oct 24')).length + 16;
  const totalPurchasesValue = purchases.reduce((acc, p) => acc + p.grandTotal, 0) + 368000;
  const pendingPaymentsValue = purchases.filter(p => p.status !== 'PAID').reduce((acc, p) => acc + (p.status === 'PENDING' ? p.grandTotal : p.grandTotal * 0.5), 0) + 12000;

  const totalReturnsCount = returns.length + 38;
  const pendingReturnsCount = returns.filter(r => r.status === 'PENDING').length;
  const totalRefundsValue = returns.filter(r => r.status === 'COMPLETED').reduce((acc, r) => acc + r.refundValue, 0) + 7200;

  const unpaidInvoicesCount = invoices.filter(i => i.status === 'UNPAID' || i.status === 'OVERDUE').length;
  const totalInvoicedValue = invoices.reduce((acc, i) => acc + i.amount, 0) + 350000;

  // List of suppliers for dropdown
  const suppliersList = ['All', 'Precision Parts Co.', 'Elite Motors Wholesale', 'Global Tyres Ltd.', 'Apex Hydraulics', 'Standard Engines Co.'];

  // Handle New Purchase Submit
  const handleCreatePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    const supplierInitialsMap: { [key: string]: string } = {
      'Precision Parts Co.': 'PP',
      'Elite Motors Wholesale': 'EM',
      'Global Tyres Ltd.': 'GT',
      'Apex Hydraulics': 'AH',
      'Standard Engines Co.': 'SE'
    };
    const supplierBgMap: { [key: string]: string } = {
      'Precision Parts Co.': 'bg-indigo-50 text-indigo-600 border border-indigo-100',
      'Elite Motors Wholesale': 'bg-purple-50 text-purple-600 border border-purple-100',
      'Global Tyres Ltd.': 'bg-rose-50 text-rose-600 border border-rose-100',
      'Apex Hydraulics': 'bg-emerald-50 text-emerald-600 border border-emerald-100',
      'Standard Engines Co.': 'bg-orange-50 text-orange-600 border border-orange-100'
    };

    const newPurchase: PurchaseOrder = {
      id: newPoId,
      invoiceNo: newPoInvoice || `INV/CS-${Math.floor(1000 + Math.random() * 9000)}`,
      supplier: newPoSupplier,
      supplierInitials: supplierInitialsMap[newPoSupplier] || 'SU',
      supplierBg: supplierBgMap[newPoSupplier] || 'bg-slate-50 text-slate-600 border border-slate-100',
      date: newPoDate,
      itemsCount: Number(newPoItems),
      gstAmount: Number(newPoGst),
      grandTotal: Number(newPoTotal),
      status: newPoStatus
    };

    setPurchases([newPurchase, ...purchases]);
    setShowNewPurchaseModal(false);

    // Auto-generate invoice for this purchase in invoices tab
    const autoInvoice: SupplierInvoice = {
      id: newPurchase.invoiceNo,
      poRef: newPurchase.id,
      supplier: newPurchase.supplier,
      issueDate: newPurchase.date,
      dueDate: 'Nov 26, 2023',
      amount: newPurchase.grandTotal,
      status: newPurchase.status === 'PAID' ? 'PAID' : (newPurchase.status === 'PARTIAL' ? 'PARTIAL' : 'UNPAID')
    };
    setInvoices([autoInvoice, ...invoices]);

    // Reset Form
    setNewPoInvoice('');
    setNewPoItems(50);
    setNewPoGst(250);
    setNewPoTotal(2500);
    setNewPoId(`PO-2023-0${Number(newPoId.split('-')[2]) + 1}`);
  };

  // Handle New Return Submit
  const handleCreateReturn = (e: React.FormEvent) => {
    e.preventDefault();
    const newReturn: PurchaseReturn = {
      id: newRetId,
      poRef: newRetPoRef,
      supplier: newRetSupplier,
      date: newRetDate,
      itemsCount: Number(newRetQty),
      refundValue: Number(newRetRefund),
      reason: newRetReason,
      status: newRetStatus
    };

    setReturns([newReturn, ...returns]);
    setShowNewReturnModal(false);

    // Reset Form
    setNewRetReason('');
    setNewRetQty(3);
    setNewRetRefund(150);
    setNewRetId(`RET-2023-0${Number(newRetId.split('-')[2]) + 1}`);
  };

  // Handle New Invoice Submit
  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const newInvoice: SupplierInvoice = {
      id: newInvNo,
      poRef: newInvPoRef,
      supplier: newInvSupplier,
      issueDate: newInvIssueDate,
      dueDate: newInvDueDate,
      amount: Number(newInvAmount),
      status: newInvStatus
    };

    setInvoices([newInvoice, ...invoices]);
    setShowNewInvoiceModal(false);

    // Reset Form
    setNewInvNo('');
    setNewInvAmount(1500);
  };

  // Delete Handlers
  const handleDeletePurchase = (id: string) => {
    if (window.confirm(`Are you sure you want to delete purchase order ${id}?`)) {
      setPurchases(purchases.filter(p => p.id !== id));
    }
  };

  const handleDeleteReturn = (id: string) => {
    if (window.confirm(`Are you sure you want to delete return record ${id}?`)) {
      setReturns(returns.filter(r => r.id !== id));
    }
  };

  const handleDeleteInvoice = (id: string) => {
    if (window.confirm(`Are you sure you want to delete invoice ${id}?`)) {
      setInvoices(invoices.filter(i => i.id !== id));
    }
  };

  // Export current purchases as CSV
  const handleExportCSV = () => {
    let headers = '';
    let rows: any[] = [];
    let filename = '';

    if (subTab === 'overview') {
      headers = 'Purchase ID,Invoice #,Supplier,Date,Total Items,GST Amount,Grand Total,Status\n';
      rows = filteredPurchases.map(p => `"${p.id}","${p.invoiceNo}","${p.supplier}","${p.date}",${p.itemsCount},${p.gstAmount},${p.grandTotal},"${p.status}"`);
      filename = 'purchase_history.csv';
    } else if (subTab === 'return') {
      headers = 'Return ID,PO Reference,Supplier,Date,Total Items,Refund Value,Reason,Status\n';
      rows = filteredReturns.map(r => `"${r.id}","${r.poRef}","${r.supplier}","${r.date}",${r.itemsCount},${r.refundValue},"${r.reason.replace(/"/g, '""')}","${r.status}"`);
      filename = 'purchase_returns.csv';
    } else {
      headers = 'Invoice No,PO Reference,Supplier,Issue Date,Due Date,Amount,Status\n';
      rows = filteredInvoices.map(i => `"${i.id}","${i.poRef}","${i.supplier}","${i.issueDate}","${i.dueDate}",${i.amount},"${i.status}"`);
      filename = 'supplier_invoices.csv';
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + headers + rows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- FILTERED LISTS ---
  const filteredPurchases = purchases.filter(p => {
    if (supplierFilter !== 'All' && p.supplier !== supplierFilter) return false;
    if (statusFilter !== 'All' && p.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        p.id.toLowerCase().includes(q) ||
        p.invoiceNo.toLowerCase().includes(q) ||
        p.supplier.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredReturns = returns.filter(r => {
    if (supplierFilter !== 'All' && r.supplier !== supplierFilter) return false;
    if (statusFilter !== 'All' && r.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        r.id.toLowerCase().includes(q) ||
        r.poRef.toLowerCase().includes(q) ||
        r.supplier.toLowerCase().includes(q) ||
        r.reason.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredInvoices = invoices.filter(i => {
    if (supplierFilter !== 'All' && i.supplier !== supplierFilter) return false;
    if (statusFilter !== 'All' && i.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        i.id.toLowerCase().includes(q) ||
        i.poRef.toLowerCase().includes(q) ||
        i.supplier.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col p-8 bg-[#f8fafc] w-full box-border font-sans min-h-[calc(100vh-64px)]">
      
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-[13px] text-slate-400 font-semibold mb-2">
        <span>Dashboard</span>
        <span>/</span>
        <span className="text-[#184edb]">Purchase</span>
      </div>

      {/* Header Title with Subtitle & Action buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight m-0 font-heading">
            {subTab === 'overview' && 'Purchase Overview'}
            {subTab === 'return' && 'Purchase Returns'}
            {subTab === 'invoice' && 'Supplier Invoices'}
          </h1>
          <p className="text-slate-500 text-[14px] font-medium max-w-2xl m-0 leading-relaxed">
            {subTab === 'overview' && 'Manage supplier purchases, invoices, stock intake, and returns with real-time tracking.'}
            {subTab === 'return' && 'Track and manage purchase returns, supplier refunds, and replacement credits.'}
            {subTab === 'invoice' && 'Monitor and reconcile supplier invoices, incoming bills, and outgoing payments.'}
          </p>
        </div>
        <div className="flex items-center gap-3.5 self-start md:self-center">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-[13.5px] px-4.5 py-2.5 rounded-lg border border-slate-200 shadow-sm cursor-pointer transition-all duration-200"
          >
            <Download size={16} className="text-slate-500" />
            <span>Export</span>
          </button>
          
          {subTab === 'overview' && (
            <button
              onClick={() => setShowNewPurchaseModal(true)}
              className="flex items-center gap-2 bg-[#184edb] hover:bg-[#133eb5] text-white font-semibold text-[13.5px] px-4.5 py-2.5 rounded-lg border-none shadow-md cursor-pointer transition-all duration-200"
            >
              <Plus size={16} />
              <span>New Purchase</span>
            </button>
          )}
          {subTab === 'return' && (
            <button
              onClick={() => setShowNewReturnModal(true)}
              className="flex items-center gap-2 bg-[#184edb] hover:bg-[#133eb5] text-white font-semibold text-[13.5px] px-4.5 py-2.5 rounded-lg border-none shadow-md cursor-pointer transition-all duration-200"
            >
              <Plus size={16} />
              <span>Record Return</span>
            </button>
          )}
          {subTab === 'invoice' && (
            <button
              onClick={() => setShowNewInvoiceModal(true)}
              className="flex items-center gap-2 bg-[#184edb] hover:bg-[#133eb5] text-white font-semibold text-[13.5px] px-4.5 py-2.5 rounded-lg border-none shadow-md cursor-pointer transition-all duration-200"
            >
              <Plus size={16} />
              <span>Add Invoice</span>
            </button>
          )}
        </div>
      </div>

      {/* --- SUB-TABS (THREE BOX TABS) BELOW NAVBAR --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Tab 1: Overview */}
        <button
          onClick={() => setSubTab('overview')}
          className={`flex items-start gap-4 p-5 rounded-2xl border text-left cursor-pointer transition-all duration-300 relative overflow-hidden group hover:scale-[1.01] hover:shadow-md ${
            subTab === 'overview'
              ? 'bg-white border-[#184edb] shadow-sm ring-1 ring-[#184edb]/30'
              : 'bg-white border-slate-100 shadow-sm'
          }`}
        >
          <div className={`p-3 rounded-xl ${subTab === 'overview' ? 'bg-[#184edb] text-white' : 'bg-slate-50 text-slate-500 group-hover:bg-[#184edb]/10 group-hover:text-[#184edb]'} transition-colors duration-300`}>
            <ShoppingBag size={22} />
          </div>
          <div className="flex flex-col gap-1.5 z-10">
            <span className="text-[11.5px] font-bold text-slate-400 uppercase tracking-widest">SUB-TAB SELECTION</span>
            <span className="text-lg font-bold text-slate-800 tracking-tight">Overview</span>
            <span className="text-[13px] text-slate-500 font-semibold mt-0.5">
              {totalPurchasesCount.toLocaleString()} Purchases • {purchases.filter(p => p.status === 'PENDING').length} Pending
            </span>
          </div>
          {subTab === 'overview' && (
            <div className="absolute right-0 top-0 w-1.5 h-full bg-[#184edb]" />
          )}
        </button>

        {/* Tab 2: Return */}
        <button
          onClick={() => setSubTab('return')}
          className={`flex items-start gap-4 p-5 rounded-2xl border text-left cursor-pointer transition-all duration-300 relative overflow-hidden group hover:scale-[1.01] hover:shadow-md ${
            subTab === 'return'
              ? 'bg-white border-[#184edb] shadow-sm ring-1 ring-[#184edb]/30'
              : 'bg-white border-slate-100 shadow-sm'
          }`}
        >
          <div className={`p-3 rounded-xl ${subTab === 'return' ? 'bg-[#184edb] text-white' : 'bg-slate-50 text-slate-500 group-hover:bg-[#184edb]/10 group-hover:text-[#184edb]'} transition-colors duration-300`}>
            <RotateCcw size={22} />
          </div>
          <div className="flex flex-col gap-1.5 z-10">
            <span className="text-[11.5px] font-bold text-slate-400 uppercase tracking-widest">SUB-TAB SELECTION</span>
            <span className="text-lg font-bold text-slate-800 tracking-tight">Returns</span>
            <span className="text-[13px] text-slate-500 font-semibold mt-0.5">
              {totalReturnsCount} Return Entries • {pendingReturnsCount} Pending Refund
            </span>
          </div>
          {subTab === 'return' && (
            <div className="absolute right-0 top-0 w-1.5 h-full bg-[#184edb]" />
          )}
        </button>

        {/* Tab 3: Invoice */}
        <button
          onClick={() => setSubTab('invoice')}
          className={`flex items-start gap-4 p-5 rounded-2xl border text-left cursor-pointer transition-all duration-300 relative overflow-hidden group hover:scale-[1.01] hover:shadow-md ${
            subTab === 'invoice'
              ? 'bg-white border-[#184edb] shadow-sm ring-1 ring-[#184edb]/30'
              : 'bg-white border-slate-100 shadow-sm'
          }`}
        >
          <div className={`p-3 rounded-xl ${subTab === 'invoice' ? 'bg-[#184edb] text-white' : 'bg-slate-50 text-slate-500 group-hover:bg-[#184edb]/10 group-hover:text-[#184edb]'} transition-colors duration-300`}>
            <FileText size={22} />
          </div>
          <div className="flex flex-col gap-1.5 z-10">
            <span className="text-[11.5px] font-bold text-slate-400 uppercase tracking-widest">SUB-TAB SELECTION</span>
            <span className="text-lg font-bold text-slate-800 tracking-tight">Invoices</span>
            <span className="text-[13px] text-slate-500 font-semibold mt-0.5">
              ${totalInvoicedValue.toLocaleString()} Invoiced • {unpaidInvoicesCount} Unpaid Bills
            </span>
          </div>
          {subTab === 'invoice' && (
            <div className="absolute right-0 top-0 w-1.5 h-full bg-[#184edb]" />
          )}
        </button>
      </div>

      {/* --- METRICS CARDS (Changes dynamically according to active tab) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Metric 1 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100/60 flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <span className="text-[11.5px] font-bold text-slate-400 uppercase tracking-wider">
              {subTab === 'overview' && 'Total Purchases'}
              {subTab === 'return' && 'Total Return Cases'}
              {subTab === 'invoice' && 'Total Supplier Bills'}
            </span>
            <span className="text-3xl font-extrabold text-slate-850 tracking-tight">
              {subTab === 'overview' && totalPurchasesCount.toLocaleString()}
              {subTab === 'return' && totalReturnsCount}
              {subTab === 'invoice' && invoices.length + 84}
            </span>
          </div>
          <div className="flex flex-col items-end gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#184edb] flex items-center justify-center">
              <ShoppingBag size={20} />
            </div>
            {subTab === 'overview' && (
              <span className="inline-flex items-center gap-0.5 bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full text-[11px] font-bold border border-emerald-100">
                +12%
              </span>
            )}
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100/60 flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <span className="text-[11.5px] font-bold text-slate-400 uppercase tracking-wider">
              {subTab === 'overview' && "Today's Purchases"}
              {subTab === 'return' && 'Pending Refund Value'}
              {subTab === 'invoice' && 'Paid Invoices'}
            </span>
            <span className="text-3xl font-extrabold text-slate-850 tracking-tight">
              {subTab === 'overview' && todayPurchasesCount}
              {subTab === 'return' && `$${returns.filter(r => r.status === 'PENDING').reduce((acc, r) => acc + r.refundValue, 0).toLocaleString()}`}
              {subTab === 'invoice' && invoices.filter(i => i.status === 'PAID').length + 65}
            </span>
          </div>
          <div className="flex flex-col items-end gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar size={20} />
            </div>
            <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold ${subTab === 'overview' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-slate-50 text-slate-500'}`}>
              {subTab === 'overview' ? 'Today' : 'Active'}
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100/60 flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <span className="text-[11.5px] font-bold text-slate-400 uppercase tracking-wider">
              {subTab === 'overview' && 'Total Purchase Value'}
              {subTab === 'return' && 'Completed Refund Value'}
              {subTab === 'invoice' && 'Outstanding Amount'}
            </span>
            <span className="text-3xl font-extrabold text-slate-850 tracking-tight">
              {subTab === 'overview' && `$${totalPurchasesValue.toLocaleString()}`}
              {subTab === 'return' && `$${totalRefundsValue.toLocaleString()}`}
              {subTab === 'invoice' && `$${invoices.filter(i => i.status !== 'PAID').reduce((acc, i) => acc + i.amount, 0 + 24120).toLocaleString()}`}
            </span>
          </div>
          <div className="flex flex-col items-end gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
            <span className="inline-flex items-center gap-0.5 bg-slate-550 text-slate-600 px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-50">
              Total Value
            </span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100/60 flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <span className="text-[11.5px] font-bold text-slate-400 uppercase tracking-wider">
              {subTab === 'overview' && 'Pending Payments'}
              {subTab === 'return' && 'Rejected Return Cases'}
              {subTab === 'invoice' && 'Overdue Bills Value'}
            </span>
            <span className="text-3xl font-extrabold text-slate-850 tracking-tight">
              {subTab === 'overview' && `$${pendingPaymentsValue.toLocaleString()}`}
              {subTab === 'return' && returns.filter(r => r.status === 'REJECTED').length}
              {subTab === 'invoice' && `$${invoices.filter(i => i.status === 'OVERDUE').reduce((acc, i) => acc + i.amount, 0).toLocaleString()}`}
            </span>
          </div>
          <div className="flex flex-col items-end gap-2.5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${subTab === 'overview' && pendingPaymentsValue > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-500'}`}>
              <AlertCircle size={20} />
            </div>
            <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold ${subTab === 'overview' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-slate-50 text-slate-500'}`}>
              {subTab === 'overview' ? 'Pending' : 'Reconciled'}
            </span>
          </div>
        </div>

      </div>

      {/* --- SEARCH AND FILTERS CONTAINER --- */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row items-center gap-4.5 w-full box-border">
        
        {/* Search bar */}
        <div className="flex-1 w-full relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={
              subTab === 'overview'
                ? 'Search purchase ID, invoice #, supplier...'
                : subTab === 'return'
                ? 'Search return ID, PO ref, supplier, reason...'
                : 'Search invoice no, PO ref, supplier...'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 text-[14.5px] border border-slate-200 rounded-xl focus:border-[#184edb] focus:ring-1 focus:ring-[#184edb] focus:outline-none transition-all placeholder-slate-400 font-medium box-border"
          />
        </div>

        {/* Filter dropdowns */}
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          {/* Supplier filter */}
          <div className="flex flex-col gap-1 flex-1 sm:flex-initial min-w-[140px]">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SUPPLIER</span>
            <select
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
              className="py-2.5 px-3.5 border border-slate-200 rounded-xl text-[13.5px] font-semibold text-slate-700 bg-white focus:outline-none focus:border-[#184edb] cursor-pointer"
            >
              {suppliersList.map(s => (
                <option key={s} value={s}>{s === 'All' ? 'All Suppliers' : s}</option>
              ))}
            </select>
          </div>

          {/* Date range filter */}
          <div className="flex flex-col gap-1 flex-1 sm:flex-initial min-w-[170px]">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">DATE RANGE</span>
            <div className="relative">
              <Calendar size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full py-2.5 pl-3.5 pr-10 border border-slate-200 rounded-xl text-[13.5px] font-semibold text-slate-700 bg-white focus:outline-none focus:border-[#184edb] cursor-pointer appearance-none"
              >
                <option value="All">All Date Ranges</option>
                <option value="Oct 01 - Oct 31, 2023">Oct 01 - Oct 31, 2023</option>
                <option value="Today">Today Only</option>
                <option value="Last 7 Days">Last 7 Days</option>
              </select>
            </div>
          </div>

          {/* Status filter */}
          <div className="flex flex-col gap-1 flex-1 sm:flex-initial min-w-[130px]">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">STATUS</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2.5 px-3.5 border border-slate-200 rounded-xl text-[13.5px] font-semibold text-slate-700 bg-white focus:outline-none focus:border-[#184edb] cursor-pointer"
            >
              <option value="All">All Statuses</option>
              {subTab === 'overview' && (
                <>
                  <option value="PAID">PAID</option>
                  <option value="PARTIAL">PARTIAL</option>
                  <option value="PENDING">PENDING</option>
                </>
              )}
              {subTab === 'return' && (
                <>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="PENDING">PENDING</option>
                  <option value="REJECTED">REJECTED</option>
                </>
              )}
              {subTab === 'invoice' && (
                <>
                  <option value="PAID">PAID</option>
                  <option value="PARTIAL">PARTIAL</option>
                  <option value="UNPAID">UNPAID</option>
                  <option value="OVERDUE">OVERDUE</option>
                </>
              )}
            </select>
          </div>

          {/* Reset Filters button */}
          <button
            onClick={() => {
              setSearchTerm('');
              setSupplierFilter('All');
              setStatusFilter('All');
              setDateRange('All');
            }}
            className="flex items-center justify-center p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer mt-5"
            title="Reset Filters"
          >
            <Filter size={18} />
          </button>
        </div>

      </div>

      {/* --- DATA TABLE CARD --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col w-full">
        
        {/* Table Title / Header */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100">
          <span className="text-base font-extrabold text-slate-800 font-heading">
            {subTab === 'overview' && 'Purchase History'}
            {subTab === 'return' && 'Returns History'}
            {subTab === 'invoice' && 'Invoices History'}
          </span>
          <div className="flex items-center gap-4">
            <span className="text-[12.5px] text-slate-500 font-semibold">
              Showing 1 - {subTab === 'overview' ? filteredPurchases.length : subTab === 'return' ? filteredReturns.length : filteredInvoices.length} of {subTab === 'overview' ? totalPurchasesCount : subTab === 'return' ? totalReturnsCount : invoices.length + 84} entries
            </span>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 bg-white cursor-pointer hover:bg-slate-50">
                <ChevronLeft size={16} />
              </button>
              <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 bg-white cursor-pointer hover:bg-slate-50">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Responsive Table Container */}
        <div className="overflow-x-auto w-full">
          
          {/* OVERVIEW TAB TABLE */}
          {subTab === 'overview' && (
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-400 text-[11px] uppercase tracking-wider font-bold">
                  <th className="py-4.5 px-6 font-bold">Purchase ID</th>
                  <th className="py-4.5 px-5 font-bold">Invoice #</th>
                  <th className="py-4.5 px-5 font-bold">Supplier</th>
                  <th className="py-4.5 px-5 font-bold">Purchase Date</th>
                  <th className="py-4.5 px-5 font-bold text-center">Total Items</th>
                  <th className="py-4.5 px-5 text-right font-bold">GST Amount</th>
                  <th className="py-4.5 px-5 text-right font-bold">Grand Total</th>
                  <th className="py-4.5 px-5 text-center font-bold">Status</th>
                  <th className="py-4.5 px-6 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[14px]">
                {filteredPurchases.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-slate-400 font-semibold bg-white">
                      No purchase orders found matching the filters.
                    </td>
                  </tr>
                ) : (
                  filteredPurchases.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/40 transition-colors">
                      {/* ID */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedPurchase(p)}
                          className="font-bold text-[#184edb] hover:text-[#133eb5] border-none bg-transparent p-0 cursor-pointer text-left"
                        >
                          {p.id}
                        </button>
                      </td>

                      {/* Invoice No */}
                      <td className="py-4 px-5 font-semibold text-slate-800 whitespace-nowrap">
                        {p.invoiceNo}
                      </td>

                      {/* Supplier */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full ${p.supplierBg} font-bold text-[11.5px] flex items-center justify-center`}>
                            {p.supplierInitials}
                          </div>
                          <span className="font-bold text-slate-800">{p.supplier}</span>
                        </div>
                      </td>

                      {/* Purchase Date */}
                      <td className="py-4 px-5 text-slate-650 font-medium whitespace-nowrap">
                        {p.date}
                      </td>

                      {/* Items */}
                      <td className="py-4 px-5 text-slate-700 font-semibold text-center whitespace-nowrap">
                        {p.itemsCount} Units
                      </td>

                      {/* GST Amount */}
                      <td className="py-4 px-5 text-slate-500 text-right font-medium whitespace-nowrap">
                        ${p.gstAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Grand Total */}
                      <td className="py-4 px-5 text-slate-900 text-right font-bold whitespace-nowrap">
                        ${p.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5 text-center whitespace-nowrap">
                        {p.status === 'PAID' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                            PAID
                          </span>
                        )}
                        {p.status === 'PARTIAL' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-bold bg-amber-50 text-amber-600 border border-amber-100">
                            PARTIAL
                          </span>
                        )}
                        {p.status === 'PENDING' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
                            PENDING
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-3.5">
                          <button
                            onClick={() => setSelectedPurchase(p)}
                            className="text-slate-400 hover:text-[#184edb] p-0 border-none bg-transparent cursor-pointer transition-colors"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="text-slate-400 hover:text-slate-700 p-0 border-none bg-transparent cursor-pointer transition-colors"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => alert(`Printing purchase invoice for PO: ${p.id}`)}
                            className="text-slate-400 hover:text-slate-700 p-0 border-none bg-transparent cursor-pointer transition-colors"
                            title="Print"
                          >
                            <Printer size={16} />
                          </button>
                          <button
                            onClick={() => handleDeletePurchase(p.id)}
                            className="text-slate-400 hover:text-rose-600 p-0 border-none bg-transparent cursor-pointer transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* RETURN TAB TABLE */}
          {subTab === 'return' && (
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-400 text-[11px] uppercase tracking-wider font-bold">
                  <th className="py-4.5 px-6 font-bold">Return ID</th>
                  <th className="py-4.5 px-5 font-bold">PO Reference</th>
                  <th className="py-4.5 px-5 font-bold">Supplier</th>
                  <th className="py-4.5 px-5 font-bold">Return Date</th>
                  <th className="py-4.5 px-5 text-center font-bold">Returned Qty</th>
                  <th className="py-4.5 px-5 text-right font-bold">Refund Value</th>
                  <th className="py-4.5 px-5 font-bold">Reason</th>
                  <th className="py-4.5 px-5 text-center font-bold">Refund Status</th>
                  <th className="py-4.5 px-6 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[14px]">
                {filteredReturns.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-slate-400 font-semibold bg-white">
                      No purchase returns found matching the filters.
                    </td>
                  </tr>
                ) : (
                  filteredReturns.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/40 transition-colors">
                      
                      {/* ID */}
                      <td className="py-4 px-6 font-bold text-slate-800 whitespace-nowrap">
                        {r.id}
                      </td>

                      {/* PO Ref */}
                      <td className="py-4 px-5 font-semibold text-slate-650 whitespace-nowrap">
                        <span className="text-[#184edb] hover:underline cursor-pointer">{r.poRef}</span>
                      </td>

                      {/* Supplier */}
                      <td className="py-4 px-5 font-bold text-slate-800 whitespace-nowrap">
                        {r.supplier}
                      </td>

                      {/* Return Date */}
                      <td className="py-4 px-5 text-slate-650 font-medium whitespace-nowrap">
                        {r.date}
                      </td>

                      {/* Qty */}
                      <td className="py-4 px-5 text-slate-700 font-semibold text-center whitespace-nowrap">
                        {r.itemsCount} Items
                      </td>

                      {/* Refund Value */}
                      <td className="py-4 px-5 text-slate-900 text-right font-bold whitespace-nowrap">
                        ${r.refundValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      {/* Reason */}
                      <td className="py-4 px-5 text-slate-600 font-medium">
                        {r.reason}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5 text-center whitespace-nowrap">
                        {r.status === 'COMPLETED' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                            COMPLETED
                          </span>
                        )}
                        {r.status === 'PENDING' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-bold bg-amber-50 text-amber-600 border border-amber-100">
                            PENDING
                          </span>
                        )}
                        {r.status === 'REJECTED' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
                            REJECTED
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-3.5">
                          <button
                            onClick={() => alert(`Refund slip for Return: ${r.id}`)}
                            className="text-slate-400 hover:text-slate-700 p-0 border-none bg-transparent cursor-pointer transition-colors"
                            title="Print Return Slip"
                          >
                            <Printer size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteReturn(r.id)}
                            className="text-slate-400 hover:text-rose-600 p-0 border-none bg-transparent cursor-pointer transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* INVOICE TAB TABLE */}
          {subTab === 'invoice' && (
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-400 text-[11px] uppercase tracking-wider font-bold">
                  <th className="py-4.5 px-6 font-bold">Invoice No</th>
                  <th className="py-4.5 px-5 font-bold">PO Reference</th>
                  <th className="py-4.5 px-5 font-bold">Supplier</th>
                  <th className="py-4.5 px-5 font-bold">Issue Date</th>
                  <th className="py-4.5 px-5 font-bold">Due Date</th>
                  <th className="py-4.5 px-5 text-right font-bold">Amount</th>
                  <th className="py-4.5 px-5 text-center font-bold">Payment Status</th>
                  <th className="py-4.5 px-6 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[14px]">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-400 font-semibold bg-white">
                      No invoices found matching the filters.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((i) => (
                    <tr key={i.id} className="hover:bg-slate-50/40 transition-colors">
                      
                      {/* Invoice No */}
                      <td className="py-4 px-6 font-bold text-slate-800 whitespace-nowrap">
                        {i.id}
                      </td>

                      {/* PO Ref */}
                      <td className="py-4 px-5 font-semibold text-[#184edb] whitespace-nowrap">
                        {i.poRef}
                      </td>

                      {/* Supplier */}
                      <td className="py-4 px-5 font-bold text-slate-850 whitespace-nowrap">
                        {i.supplier}
                      </td>

                      {/* Issue Date */}
                      <td className="py-4 px-5 text-slate-600 font-medium whitespace-nowrap">
                        {i.issueDate}
                      </td>

                      {/* Due Date */}
                      <td className="py-4 px-5 text-slate-600 font-medium whitespace-nowrap">
                        {i.dueDate}
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-5 text-slate-900 text-right font-bold whitespace-nowrap">
                        ${i.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      {/* Payment Status */}
                      <td className="py-4 px-5 text-center whitespace-nowrap">
                        {i.status === 'PAID' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                            PAID
                          </span>
                        )}
                        {i.status === 'PARTIAL' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-bold bg-amber-50 text-amber-600 border border-amber-100">
                            PARTIAL
                          </span>
                        )}
                        {i.status === 'UNPAID' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            UNPAID
                          </span>
                        )}
                        {i.status === 'OVERDUE' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
                            OVERDUE
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-3.5">
                          <button
                            onClick={() => alert(`Downloading Invoice PDF: ${i.id}`)}
                            className="text-slate-400 hover:text-[#184edb] p-0 border-none bg-transparent cursor-pointer transition-colors"
                            title="Download PDF"
                          >
                            <Download size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteInvoice(i.id)}
                            className="text-slate-400 hover:text-rose-600 p-0 border-none bg-transparent cursor-pointer transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

        </div>

        {/* Footer / Pagination links */}
        <div className="bg-slate-50/70 border-t border-slate-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 w-full box-border text-[13.5px] font-semibold text-slate-500">
          <div className="flex items-center gap-2">
            <span>Show</span>
            <select className="border border-slate-200 rounded-lg p-1 text-[13px] bg-white cursor-pointer focus:outline-none">
              <option value="10">10 entries</option>
              <option value="25">25 entries</option>
              <option value="50">50 entries</option>
            </select>
          </div>
          
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-50 text-slate-400 cursor-pointer">
              <ChevronLeft size={16} />
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#184edb] text-white font-bold text-[13px] border-none shadow-sm cursor-pointer">
              1
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-50 text-slate-650 cursor-pointer">
              2
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-50 text-slate-650 cursor-pointer">
              3
            </button>
            <span className="px-2">...</span>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-50 text-slate-650 cursor-pointer">
              12
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-50 text-slate-400 cursor-pointer">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>

      {/* ==================== MODALS ==================== */}

      {/* 1. NEW PURCHASE MODAL */}
      {showNewPurchaseModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4.5 bg-[#184edb] text-white flex items-center justify-between">
              <span className="font-extrabold text-[16.5px]">Create Purchase Order</span>
              <button
                onClick={() => setShowNewPurchaseModal(false)}
                className="text-white/80 hover:text-white border-none bg-transparent cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreatePurchase} className="p-6 flex flex-col gap-4 box-border">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">PO Number</label>
                  <input
                    type="text"
                    value={newPoId}
                    onChange={(e) => setNewPoId(e.target.value)}
                    className="p-2.5 border border-slate-200 rounded-lg text-[13.5px] font-semibold bg-slate-50 text-slate-500 cursor-not-allowed"
                    readOnly
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Invoice No</label>
                  <input
                    type="text"
                    placeholder="e.g. INV/9941/23"
                    value={newPoInvoice}
                    onChange={(e) => setNewPoInvoice(e.target.value)}
                    className="p-2.5 border border-slate-200 rounded-lg text-[13.5px] focus:outline-none focus:border-[#184edb] font-medium"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Supplier</label>
                <select
                  value={newPoSupplier}
                  onChange={(e) => setNewPoSupplier(e.target.value)}
                  className="p-2.5 border border-slate-200 rounded-lg text-[13.5px] font-medium focus:outline-none focus:border-[#184edb]"
                >
                  {suppliersList.filter(s => s !== 'All').map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Purchase Date</label>
                  <input
                    type="text"
                    value={newPoDate}
                    onChange={(e) => setNewPoDate(e.target.value)}
                    className="p-2.5 border border-slate-200 rounded-lg text-[13.5px] focus:outline-none focus:border-[#184edb] font-medium"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Total Items Qty</label>
                  <input
                    type="number"
                    value={newPoItems}
                    onChange={(e) => setNewPoItems(Number(e.target.value))}
                    className="p-2.5 border border-slate-200 rounded-lg text-[13.5px] focus:outline-none focus:border-[#184edb] font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">GST Amount ($)</label>
                  <input
                    type="number"
                    value={newPoGst}
                    onChange={(e) => setNewPoGst(Number(e.target.value))}
                    className="p-2.5 border border-slate-200 rounded-lg text-[13.5px] focus:outline-none focus:border-[#184edb] font-medium"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Grand Total ($)</label>
                  <input
                    type="number"
                    value={newPoTotal}
                    onChange={(e) => setNewPoTotal(Number(e.target.value))}
                    className="p-2.5 border border-slate-200 rounded-lg text-[13.5px] focus:outline-none focus:border-[#184edb] font-medium"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Payment Status</label>
                <select
                  value={newPoStatus}
                  onChange={(e) => setNewPoStatus(e.target.value as any)}
                  className="p-2.5 border border-slate-200 rounded-lg text-[13.5px] font-medium focus:outline-none focus:border-[#184edb]"
                >
                  <option value="PAID">PAID</option>
                  <option value="PARTIAL">PARTIAL</option>
                  <option value="PENDING">PENDING</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowNewPurchaseModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-650 font-semibold text-[13px] rounded-lg bg-white hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#184edb] hover:bg-[#133eb5] text-white font-semibold text-[13px] border-none rounded-lg cursor-pointer transition-colors shadow-md"
                >
                  Save Entry
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 2. RECORD RETURN MODAL */}
      {showNewReturnModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4.5 bg-[#184edb] text-white flex items-center justify-between">
              <span className="font-extrabold text-[16.5px]">Record Purchase Return</span>
              <button
                onClick={() => setShowNewReturnModal(false)}
                className="text-white/80 hover:text-white border-none bg-transparent cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateReturn} className="p-6 flex flex-col gap-4 box-border">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Return ID</label>
                  <input
                    type="text"
                    value={newRetId}
                    className="p-2.5 border border-slate-200 rounded-lg text-[13.5px] font-semibold bg-slate-50 text-slate-500 cursor-not-allowed"
                    readOnly
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">PO Reference</label>
                  <select
                    value={newRetPoRef}
                    onChange={(e) => setNewRetPoRef(e.target.value)}
                    className="p-2.5 border border-slate-200 rounded-lg text-[13.5px] font-medium focus:outline-none focus:border-[#184edb]"
                  >
                    {purchases.map(p => (
                      <option key={p.id} value={p.id}>{p.id}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Supplier</label>
                <select
                  value={newRetSupplier}
                  onChange={(e) => setNewRetSupplier(e.target.value)}
                  className="p-2.5 border border-slate-200 rounded-lg text-[13.5px] font-medium focus:outline-none focus:border-[#184edb]"
                >
                  {suppliersList.filter(s => s !== 'All').map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5 col-span-2">
                  <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Return Date</label>
                  <input
                    type="text"
                    value={newRetDate}
                    onChange={(e) => setNewRetDate(e.target.value)}
                    className="p-2.5 border border-slate-200 rounded-lg text-[13.5px] focus:outline-none focus:border-[#184edb] font-medium"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Qty</label>
                  <input
                    type="number"
                    value={newRetQty}
                    onChange={(e) => setNewRetQty(Number(e.target.value))}
                    className="p-2.5 border border-slate-200 rounded-lg text-[13.5px] focus:outline-none focus:border-[#184edb] font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Refund Value ($)</label>
                  <input
                    type="number"
                    value={newRetRefund}
                    onChange={(e) => setNewRetRefund(Number(e.target.value))}
                    className="p-2.5 border border-slate-200 rounded-lg text-[13.5px] focus:outline-none focus:border-[#184edb] font-medium"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Refund Status</label>
                  <select
                    value={newRetStatus}
                    onChange={(e) => setNewRetStatus(e.target.value as any)}
                    className="p-2.5 border border-slate-200 rounded-lg text-[13.5px] font-medium focus:outline-none focus:border-[#184edb]"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Reason for Return</label>
                <textarea
                  value={newRetReason}
                  onChange={(e) => setNewRetReason(e.target.value)}
                  className="p-2.5 border border-slate-200 rounded-lg text-[13.5px] font-medium focus:outline-none focus:border-[#184edb] resize-none h-20"
                  placeholder="Describe return justification..."
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowNewReturnModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-650 font-semibold text-[13px] rounded-lg bg-white hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#184edb] hover:bg-[#133eb5] text-white font-semibold text-[13px] border-none rounded-lg cursor-pointer transition-colors shadow-md"
                >
                  Save Entry
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 3. ADD INVOICE MODAL */}
      {showNewInvoiceModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4.5 bg-[#184edb] text-white flex items-center justify-between">
              <span className="font-extrabold text-[16.5px]">Record Supplier Invoice</span>
              <button
                onClick={() => setShowNewInvoiceModal(false)}
                className="text-white/80 hover:text-white border-none bg-transparent cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateInvoice} className="p-6 flex flex-col gap-4 box-border">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Invoice No</label>
                  <input
                    type="text"
                    placeholder="e.g. INV-9022"
                    value={newInvNo}
                    onChange={(e) => setNewInvNo(e.target.value)}
                    className="p-2.5 border border-slate-200 rounded-lg text-[13.5px] focus:outline-none focus:border-[#184edb] font-semibold"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">PO Reference</label>
                  <select
                    value={newInvPoRef}
                    onChange={(e) => setNewInvPoRef(e.target.value)}
                    className="p-2.5 border border-slate-200 rounded-lg text-[13.5px] font-medium focus:outline-none focus:border-[#184edb]"
                  >
                    {purchases.map(p => (
                      <option key={p.id} value={p.id}>{p.id}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Supplier</label>
                <select
                  value={newInvSupplier}
                  onChange={(e) => setNewInvSupplier(e.target.value)}
                  className="p-2.5 border border-slate-200 rounded-lg text-[13.5px] font-medium focus:outline-none focus:border-[#184edb]"
                >
                  {suppliersList.filter(s => s !== 'All').map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Issue Date</label>
                  <input
                    type="text"
                    value={newInvIssueDate}
                    onChange={(e) => setNewInvIssueDate(e.target.value)}
                    className="p-2.5 border border-slate-200 rounded-lg text-[13.5px] focus:outline-none focus:border-[#184edb] font-medium"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Due Date</label>
                  <input
                    type="text"
                    value={newInvDueDate}
                    onChange={(e) => setNewInvDueDate(e.target.value)}
                    className="p-2.5 border border-slate-200 rounded-lg text-[13.5px] focus:outline-none focus:border-[#184edb] font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Invoice Amount ($)</label>
                  <input
                    type="number"
                    value={newInvAmount}
                    onChange={(e) => setNewInvAmount(Number(e.target.value))}
                    className="p-2.5 border border-slate-200 rounded-lg text-[13.5px] focus:outline-none focus:border-[#184edb] font-medium"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Payment Status</label>
                  <select
                    value={newInvStatus}
                    onChange={(e) => setNewInvStatus(e.target.value as any)}
                    className="p-2.5 border border-slate-200 rounded-lg text-[13.5px] font-medium focus:outline-none focus:border-[#184edb]"
                  >
                    <option value="UNPAID">UNPAID</option>
                    <option value="PAID">PAID</option>
                    <option value="PARTIAL">PARTIAL</option>
                    <option value="OVERDUE">OVERDUE</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowNewInvoiceModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-650 font-semibold text-[13px] rounded-lg bg-white hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#184edb] hover:bg-[#133eb5] text-white font-semibold text-[13px] border-none rounded-lg cursor-pointer transition-colors shadow-md"
                >
                  Save Entry
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 4. PURCHASE ORDER DETAIL PREVIEW MODAL */}
      {selectedPurchase && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4.5 bg-[#184edb] text-white flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-extrabold text-[16.5px] tracking-tight">{selectedPurchase.id} Details</span>
                <span className="text-[11.5px] text-blue-100 font-medium">Invoice: {selectedPurchase.invoiceNo}</span>
              </div>
              <button
                onClick={() => setSelectedPurchase(null)}
                className="text-white/80 hover:text-white border-none bg-transparent cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 flex flex-col gap-6 box-border max-h-[75vh] overflow-y-auto">
              
              {/* Top Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Supplier</span>
                  <span className="text-[13.5px] font-bold text-slate-800">{selectedPurchase.supplier}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order Date</span>
                  <span className="text-[13.5px] font-medium text-slate-700">{selectedPurchase.date}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</span>
                  <span className="self-start mt-0.5">
                    {selectedPurchase.status === 'PAID' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                        PAID
                      </span>
                    )}
                    {selectedPurchase.status === 'PARTIAL' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-100">
                        PARTIAL
                      </span>
                    )}
                    {selectedPurchase.status === 'PENDING' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
                        PENDING
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Invoiced Value</span>
                  <span className="text-[13.5px] font-extrabold text-[#184edb]">${selectedPurchase.grandTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Items Breakdown list */}
              <div className="flex flex-col gap-3">
                <span className="text-[12.5px] font-extrabold text-slate-800 tracking-wider uppercase">Order Items Breakdown</span>
                
                <div className="border border-slate-100 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 text-[10.5px] uppercase font-bold tracking-wider border-b border-slate-100">
                        <th className="py-2.5 px-4">Item Name</th>
                        <th className="py-2.5 px-3 text-center">Qty</th>
                        <th className="py-2.5 px-4 text-right">Unit Price</th>
                        <th className="py-2.5 px-4 text-right">Total Price</th>
                      </tr>
                    </thead>
                    <tbody className="text-[13px] divide-y divide-slate-50">
                      <tr>
                        <td className="py-3 px-4 font-bold text-slate-800">Eicher Heavy Engine Cylinder Block V8</td>
                        <td className="py-3 px-3 text-center font-semibold text-slate-700">12 Units</td>
                        <td className="py-3 px-4 text-right font-medium text-slate-600">$500.00</td>
                        <td className="py-3 px-4 text-right font-bold text-slate-800">$6,000.00</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-bold text-slate-800">Vibrashield Cabin Shocks Mounts</td>
                        <td className="py-3 px-3 text-center font-semibold text-slate-700">80 Units</td>
                        <td className="py-3 px-4 text-right font-medium text-slate-600">$45.00</td>
                        <td className="py-3 px-4 text-right font-bold text-slate-800">$3,600.00</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-bold text-slate-800">Advanced Steering Column Assembly (Pro)</td>
                        <td className="py-3 px-3 text-center font-semibold text-slate-700 text-slate-700">10 Units</td>
                        <td className="py-3 px-4 text-right font-medium text-slate-600">$280.00</td>
                        <td className="py-3 px-4 text-right font-bold text-slate-800">$2,800.00</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-bold text-slate-800">Brake Liner Rivets & Shims Pack</td>
                        <td className="py-3 px-3 text-center font-semibold text-slate-700 text-slate-700">40 Units</td>
                        <td className="py-3 px-4 text-right font-medium text-slate-600">$30.00</td>
                        <td className="py-3 px-4 text-right font-bold text-slate-800">$1,200.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary / Totals */}
              <div className="flex flex-col items-end gap-2 border-t border-slate-100 pt-4.5">
                <div className="flex items-center gap-10 text-[13.5px]">
                  <span className="text-slate-400 font-semibold">Subtotal:</span>
                  <span className="text-slate-800 font-bold">${(selectedPurchase.grandTotal - selectedPurchase.gstAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center gap-10 text-[13.5px]">
                  <span className="text-slate-400 font-semibold">GST (18%):</span>
                  <span className="text-slate-800 font-bold">${selectedPurchase.gstAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center gap-10 text-[14.5px] border-t border-slate-100 pt-2">
                  <span className="text-slate-900 font-extrabold font-heading">Grand Total:</span>
                  <span className="text-[#184edb] font-extrabold text-lg">${selectedPurchase.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-[11.5px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-emerald-500" />
                  Verified by Rohan Sharma
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => alert('Printing order detail sheet...')}
                    className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-bold text-[12.5px] px-4 py-2 border border-slate-200 rounded-lg shadow-sm cursor-pointer transition-colors"
                  >
                    <Printer size={15} />
                    <span>Print Invoice</span>
                  </button>
                  <button
                    onClick={() => setSelectedPurchase(null)}
                    className="bg-[#184edb] hover:bg-[#133eb5] text-white font-bold text-[12.5px] px-4 py-2 border-none rounded-lg shadow-md cursor-pointer transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Purchase;
