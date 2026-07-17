import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  Trash2,
  Info
} from 'lucide-react';

import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider as MuiDivider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';
import BusinessIcon from '@mui/icons-material/Business';

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
  items?: PurchaseItem[];
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

interface PurchaseItem {
  id: string;
  productName: string;
  qty: number;
  rate: number;
  gstPercent: number;
}

export const Purchase: React.FC = () => {
  // Sub-tabs: 'overview', 'return', 'invoice'
  const [subTab, setSubTab] = useState<'overview' | 'return' | 'invoice'>('overview');
  const [showFigmaInvoice, setShowFigmaInvoice] = useState(false);

  // Modals state
  const [showNewPurchaseModal, setShowNewPurchaseModal] = useState(false);
  const [showNewReturnModal, setShowNewReturnModal] = useState(false);
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseOrder | null>(null);
  const [shouldTriggerPrint, setShouldTriggerPrint] = useState(false);

  useEffect(() => {
    if (selectedPurchase && shouldTriggerPrint) {
      const timer = setTimeout(() => {
        window.print();
        setShouldTriggerPrint(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [selectedPurchase, shouldTriggerPrint]);

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

  const [newPoTerms, setNewPoTerms] = useState('Net 30');
  const [newPoRemarks, setNewPoRemarks] = useState('');
  const [newPoAdditionalCharges, setNewPoAdditionalCharges] = useState(45.00);
  const [newPoDiscount, setNewPoDiscount] = useState(100.00);
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);

  const handleItemChange = (id: string, field: keyof PurchaseItem, value: any) => {
    setPurchaseItems(purchaseItems.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleAddItem = () => {
    setPurchaseItems([
      ...purchaseItems,
      {
        id: 'item-' + Date.now(),
        productName: '',
        qty: 1,
        rate: 0,
        gstPercent: 18
      }
    ]);
  };

  const handleRemoveItem = (id: string) => {
    setPurchaseItems(purchaseItems.filter(item => item.id !== id));
  };

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

  if (showNewPurchaseModal) {
    const calculatedSubtotal = purchaseItems.reduce((acc, item) => acc + (item.qty * item.rate), 0);
    const calculatedGst = purchaseItems.reduce((acc, item) => acc + (item.qty * item.rate * (item.gstPercent / 100)), 0);
    const calculatedGrandTotal = calculatedSubtotal + calculatedGst + newPoAdditionalCharges - newPoDiscount;

    const handleSavePurchaseOrder = (status: 'PAID' | 'PENDING') => {
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
        invoiceNo: newPoInvoice || `INV/PUR-${Math.floor(1000 + Math.random() * 9000)}`,
        supplier: newPoSupplier,
        supplierInitials: supplierInitialsMap[newPoSupplier] || 'SU',
        supplierBg: supplierBgMap[newPoSupplier] || 'bg-slate-50 text-slate-600 border border-slate-100',
        date: newPoDate,
        itemsCount: purchaseItems.reduce((acc, item) => acc + item.qty, 0),
        gstAmount: calculatedGst,
        grandTotal: calculatedGrandTotal,
        status: status === 'PAID' ? 'PAID' : 'PENDING',
        items: purchaseItems
      };

      setPurchases([newPurchase, ...purchases]);

      // Auto-generate invoice for this purchase in invoices tab
      const autoInvoice: SupplierInvoice = {
        id: newPurchase.invoiceNo,
        poRef: newPurchase.id,
        supplier: newPurchase.supplier,
        issueDate: newPurchase.date,
        dueDate: 'Nov 26, 2023',
        amount: newPurchase.grandTotal,
        status: status === 'PAID' ? 'PAID' : 'UNPAID'
      };
      setInvoices([autoInvoice, ...invoices]);

      // Reset
      setNewPoInvoice('');
      setPurchaseItems([]);
      setNewPoRemarks('');
      setNewPoAdditionalCharges(45.00);
      setNewPoDiscount(100.00);
      setNewPoId(`PO-2023-0${Number(newPoId.split('-')[2]) + 1}`);
      setShowNewPurchaseModal(false);
    };

    return (
      <div className="flex-1 flex flex-col p-8 bg-[#f8fafc] w-full box-border font-sans min-h-[calc(100vh-64px)] text-left text-slate-700">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-[13px] text-slate-400 font-semibold mb-2">
          <span>Dashboard</span>
          <span>/</span>
          <span
            onClick={() => setShowNewPurchaseModal(false)}
            className="cursor-pointer hover:text-[#184edb] transition-colors"
          >
            Purchase
          </span>
          <span>/</span>
          <span className="text-[#184edb]">New Entry</span>
        </div>

        {/* Title, Import PO */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight m-0 font-heading">
              Create New Purchase Entry
            </h1>
          </div>
          <button
            type="button"
            onClick={() => alert('Import from Purchase Order initiated')}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-650 font-bold text-[13px] rounded-lg border border-slate-200 shadow-sm cursor-pointer transition-colors"
          >
            Import from PO
          </button>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full box-border items-start">
          {/* Left Column */}
          <div className="lg:col-span-2 flex flex-col gap-8 w-full box-border">

            {/* Purchase Info Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <h3 className="text-base font-extrabold text-slate-800 m-0 flex items-center gap-2 font-heading">
                  <span>Purchase Information</span>
                </h3>
                <span className="text-[12px] font-bold text-[#184edb] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                  ENTRY ID: #{newPoId}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Supplier select */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11.5px] font-bold text-slate-400 uppercase tracking-wide">Supplier</label>
                  <select
                    value={newPoSupplier}
                    onChange={(e) => setNewPoSupplier(e.target.value)}
                    className="p-2.5 border border-slate-200 rounded-lg text-[13.5px] font-semibold text-slate-700 bg-white focus:outline-none focus:border-[#184edb]"
                  >
                    {suppliersList.filter(s => s !== 'All').map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Invoice Number */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11.5px] font-bold text-slate-400 uppercase tracking-wide">Invoice Number</label>
                  <input
                    type="text"
                    placeholder="e.g. INV-88291"
                    value={newPoInvoice}
                    onChange={(e) => setNewPoInvoice(e.target.value)}
                    className="p-2.5 border border-slate-200 rounded-lg text-[13.5px] font-semibold text-slate-750 focus:outline-none focus:border-[#184edb]"
                  />
                </div>

                {/* Purchase Date */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11.5px] font-bold text-slate-400 uppercase tracking-wide">Purchase Date</label>
                  <input
                    type="text"
                    placeholder="mm/dd/yyyy"
                    value={newPoDate}
                    onChange={(e) => setNewPoDate(e.target.value)}
                    className="p-2.5 border border-slate-200 rounded-lg text-[13.5px] font-semibold text-slate-750 focus:outline-none focus:border-[#184edb]"
                  />
                </div>

                {/* Payment Terms */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11.5px] font-bold text-slate-400 uppercase tracking-wide">Payment Terms</label>
                  <select
                    value={newPoTerms}
                    onChange={(e) => setNewPoTerms(e.target.value)}
                    className="p-2.5 border border-slate-200 rounded-lg text-[13.5px] font-semibold text-slate-700 bg-white focus:outline-none focus:border-[#184edb]"
                  >
                    <option value="Net 30">Net 30</option>
                    <option value="Net 45">Net 45</option>
                    <option value="Net 60">Net 60</option>
                    <option value="Due on Receipt">Due on Receipt</option>
                  </select>
                </div>

                {/* Remarks */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-[11.5px] font-bold text-slate-400 uppercase tracking-wide">Remarks</label>
                  <textarea
                    placeholder="Any additional notes regarding this purchase..."
                    value={newPoRemarks}
                    onChange={(e) => setNewPoRemarks(e.target.value)}
                    className="p-2.5 border border-slate-200 rounded-lg text-[13.5px] font-medium text-slate-700 focus:outline-none focus:border-[#184edb] h-20 resize-none font-sans"
                  />
                </div>
              </div>
            </div>

            {/* Product Entry Table */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-base font-extrabold text-slate-800 m-0 flex items-center gap-2 font-heading">
                  <span>Product Entry</span>
                </h3>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#184edb] hover:bg-[#133eb5] text-white font-bold text-[12.5px] border-none rounded-lg cursor-pointer transition-colors shadow-sm"
                >
                  <Plus size={15} />
                  <span>Add Product</span>
                </button>
              </div>

              <div className="border border-slate-100 rounded-xl overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[11px] uppercase tracking-wider font-bold">
                      <th className="py-3.5 px-4 font-bold">Product Name</th>
                      <th className="py-3.5 px-3 text-center font-bold">Quantity</th>
                      <th className="py-3.5 px-3 text-right font-bold">Rate ($)</th>
                      <th className="py-3.5 px-3 text-center font-bold">GST %</th>
                      <th className="py-3.5 px-3 text-right font-bold">Tax Amount ($)</th>
                      <th className="py-3.5 px-3 text-right font-bold">Line Total ($)</th>
                      <th className="py-3.5 px-4 text-center font-bold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[13.5px]">
                    {purchaseItems.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400 font-semibold bg-white">
                          No products added. Click "Add Product" to insert items.
                        </td>
                      </tr>
                    ) : (
                      purchaseItems.map((item) => {
                        const baseVal = item.qty * item.rate;
                        const taxVal = baseVal * (item.gstPercent / 100);
                        const lineTotal = baseVal + taxVal;

                        return (
                          <tr key={item.id} className="hover:bg-slate-50/30 transition-colors">
                            {/* Product Name */}
                            <td className="py-3.5 px-4">
                              <input
                                type="text"
                                value={item.productName}
                                onChange={(e) => handleItemChange(item.id, 'productName', e.target.value)}
                                placeholder="Enter product name..."
                                className="p-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 w-full focus:outline-none focus:border-[#184edb]"
                              />
                            </td>

                            {/* Quantity */}
                            <td className="py-3.5 px-3 text-center w-24">
                              <input
                                type="number"
                                min="1"
                                value={item.qty || ''}
                                onChange={(e) => handleItemChange(item.id, 'qty', parseInt(e.target.value, 10) || 0)}
                                className="p-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 text-center w-full focus:outline-none focus:border-[#184edb]"
                              />
                            </td>

                            {/* Rate */}
                            <td className="py-3.5 px-3 w-28">
                              <input
                                type="number"
                                min="0"
                                step="any"
                                value={item.rate || ''}
                                onChange={(e) => handleItemChange(item.id, 'rate', parseFloat(e.target.value) || 0)}
                                className="p-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 text-right w-full focus:outline-none focus:border-[#184edb]"
                              />
                            </td>

                            {/* GST */}
                            <td className="py-3.5 px-3 text-center w-24">
                              <select
                                value={item.gstPercent}
                                onChange={(e) => handleItemChange(item.id, 'gstPercent', parseInt(e.target.value, 10))}
                                className="p-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:border-[#184edb] w-full"
                              >
                                <option value="5">5%</option>
                                <option value="12">12%</option>
                                <option value="18">18%</option>
                                <option value="28">28%</option>
                              </select>
                            </td>

                            {/* Tax Display */}
                            <td className="py-3.5 px-3 text-right font-bold text-slate-500 whitespace-nowrap">
                              ${taxVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>

                            {/* Line Total */}
                            <td className="py-3.5 px-3 text-right font-bold text-slate-800 whitespace-nowrap">
                              ${lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>

                            {/* Action */}
                            <td className="py-3.5 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(item.id)}
                                className="text-slate-400 hover:text-rose-600 p-1 border-none bg-transparent cursor-pointer transition-colors"
                                title="Delete Item"
                              >
                                <Trash2 size={15} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              <span className="text-[11px] text-slate-400 font-semibold italic text-left">
                Add more products from your catalog...
              </span>
            </div>

          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-8 w-full box-border">

            {/* Inventory Sync Banner Card */}
            <div className="rounded-2xl overflow-hidden relative shadow-sm border border-slate-100 min-h-[240px] flex flex-col justify-end p-6 text-white group">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/65 to-transparent" />

              <div className="relative z-10 flex flex-col gap-1.5 text-left">
                <span className="text-[9.5px] font-bold text-blue-300 uppercase tracking-widest">REAL-TIME BRIDGE</span>
                <h4 className="text-lg font-extrabold tracking-tight m-0 font-heading">Inventory Sync</h4>
                <p className="text-[11px] text-slate-300 font-medium leading-relaxed m-0 mt-1">
                  Entering purchases here automatically updates your global inventory levels and calculates average landing costs.
                </p>
              </div>
            </div>

            {/* Purchase Summary */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col gap-6">
              <h3 className="text-base font-extrabold text-slate-800 m-0 flex items-center gap-2 border-b border-slate-100 pb-3 font-heading">
                <span>Purchase Summary</span>
              </h3>

              <div className="flex flex-col gap-3.5 text-[13.5px] font-semibold text-slate-500">
                <div className="flex items-center justify-between">
                  <span>Subtotal:</span>
                  <span className="text-slate-800 font-bold">${calculatedSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span>GST Total (Aggregated):</span>
                  <span className="text-slate-800 font-bold">${calculatedGst.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Additional Charges:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-400">$</span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={newPoAdditionalCharges}
                      onChange={(e) => setNewPoAdditionalCharges(parseFloat(e.target.value) || 0)}
                      className="w-20 p-1 border border-slate-200 rounded text-center text-xs font-bold text-slate-800 focus:outline-none focus:border-[#184edb]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span>Discount:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-400">$</span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={newPoDiscount}
                      onChange={(e) => setNewPoDiscount(parseFloat(e.target.value) || 0)}
                      className="w-20 p-1 border border-slate-200 rounded text-center text-xs font-bold text-slate-800 focus:outline-none focus:border-[#184edb]"
                    />
                  </div>
                </div>
              </div>

              {/* Grand Total Banner */}
              <div className="border-t border-slate-100 pt-4 flex flex-col gap-1 items-center">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Grand Total</span>
                <span className="text-2xl font-black text-[#184edb] tracking-tight font-heading mt-0.5">
                  ${calculatedGrandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Alert Banner */}
              <div className="bg-[#f0f4ff] border border-[#d6e4ff] rounded-xl p-3 flex gap-2 items-start text-[#184edb]">
                <span className="mt-0.5 flex"><Info size={14} /></span>
                <p className="m-0 text-[10.5px] leading-normal text-left font-semibold text-slate-500">
                  Rounded to the nearest dollar. This amount will be credited to the supplier's ledger.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Actions Row */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-8">
          <button
            type="button"
            onClick={() => { if (window.confirm('Discard changes and return to purchases list?')) setShowNewPurchaseModal(false); }}
            className="flex items-center gap-1.5 px-4.5 py-2.5 bg-white hover:bg-slate-50 text-slate-650 font-bold text-[13px] rounded-lg border border-slate-200 shadow-sm cursor-pointer transition-colors"
          >
            <X size={15} />
            <span>Cancel</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleSavePurchaseOrder('PENDING')}
              className="px-5 py-2.5 bg-white border border-[#184edb] hover:bg-blue-50/50 text-[#184edb] font-bold text-[13px] rounded-lg cursor-pointer transition-colors"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => handleSavePurchaseOrder('PAID')}
              className="px-5 py-2.5 bg-[#184edb] hover:bg-[#133eb5] text-white font-bold text-[13px] border-none rounded-lg shadow-md cursor-pointer transition-colors"
            >
              Save Purchase
            </button>
          </div>
        </div>

      </div>
    );
  }

  const renderInvoiceSheet = (po: PurchaseOrder) => {
    return (
      <div className="flex flex-col gap-6 w-full box-border">
        {/* Header section */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="bg-[#184edb] text-white p-2.5 rounded-xl flex items-center justify-center shadow-lg">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 21h18M3 10h18M5 21V10M19 21V10M9 21v-4a2 2 0 014 0v4M12 3L2 10h20L12 3z" />
              </svg>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-lg font-black text-slate-900 tracking-tight leading-tight uppercase font-heading">
                Eicher Workshop
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                Premium Management Solutions
              </span>
            </div>
          </div>
          <div className="flex flex-col text-right">
            <h2 className="text-2xl font-black text-[#184edb] uppercase tracking-tight m-0 font-heading">
              Purchase Invoice
            </h2>
            <div className="flex flex-col gap-0.5 text-xs text-slate-500 font-semibold mt-2">
              <span>Invoice #: <strong className="text-slate-800">{po.invoiceNo}</strong></span>
              <span>Date: <strong className="text-slate-800">{po.date}</strong></span>
              <span>Due Date: <strong className="text-[#e1523a]">Nov 07, 2023</strong></span>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-12 mt-2">
          {/* Left: Supplier Details */}
          <div className="flex flex-col gap-2.5 text-left text-xs font-semibold text-slate-500">
            <span className="text-[10px] font-black text-[#184edb] uppercase tracking-wider">Supplier Details</span>
            <div className="flex flex-col gap-1 text-slate-700">
              <span className="text-[13.5px] font-bold text-slate-900">{po.supplier}</span>
              <span className="leading-relaxed">
                42 Industrial Estate, Sector 18<br />
                Gurgaon, Haryana 122001
              </span>
              <span>GSTIN: <strong className="text-slate-800">07AAACG1234F1Z5</strong></span>
              <span>Phone: <strong className="text-slate-800">+91 91234 56789</strong></span>
              <span>Email: <strong className="text-slate-800">orders@{po.supplier.toLowerCase().replace(/[^a-z0-9]/g, '') || 'supplier'}.com</strong></span>
            </div>
          </div>

          {/* Right: Bill To */}
          <div className="flex flex-col gap-2.5 text-left text-xs font-semibold text-slate-500">
            <span className="text-[10px] font-black text-[#184edb] uppercase tracking-wider">Bill To</span>
            <div className="flex flex-col gap-1 text-slate-700">
              <span className="text-[13.5px] font-bold text-slate-900">Eicher Authorized Service Center</span>
              <span className="leading-relaxed">
                98 Industrial Estate, Phase II<br />
                Okhla, New Delhi 110020
              </span>
              <span>Attn: <strong className="text-[#184edb]">Workshop Manager</strong></span>
              <span>GSTIN: <strong className="text-slate-800">07AABCE4321F1Z2</strong></span>
              <span>Phone: <strong className="text-slate-800">+91 93765 43210</strong></span>
            </div>
          </div>
        </div>

        {/* Table of items */}
        <div className="border border-slate-100 rounded-xl overflow-hidden mt-3">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100 font-heading">
                <th className="py-2.5 px-4 text-center w-8">#</th>
                <th className="py-2.5 px-4">Product Description</th>
                <th className="py-2.5 px-3 text-center">SKU</th>
                <th className="py-2.5 px-3 text-center w-12">Qty</th>
                <th className="py-2.5 px-4 text-right">Rate</th>
                <th className="py-2.5 px-4 text-right">GST</th>
                <th className="py-2.5 px-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="text-[12px] divide-y divide-slate-100 font-semibold text-slate-700">
              {(() => {
                const itemsList = po.items && po.items.length > 0 
                  ? po.items.map((item: any, idx: number) => ({
                      num: String(idx + 1).padStart(2, '0'),
                      name: item.productName || 'Workshop Replacement Spare Part',
                      sub: 'Premium Grade - Dynamic Replacement Component',
                      sku: `SP-${item.id.substring(0, 5).toUpperCase()}`,
                      qty: String(item.qty).padStart(2, '0'),
                      rate: item.rate,
                      gst: item.rate * item.qty * (item.gstPercent / 100),
                      total: item.rate * item.qty * (1 + item.gstPercent / 100)
                    }))
                  : [
                      {
                        num: '01',
                        name: 'Eicher Genuine Spare Parts & Components',
                        sub: 'Standard Issue Replacement Parts',
                        sku: `SP-${po.id.replace('PO-', '')}`,
                        qty: String(po.itemsCount).padStart(2, '0'),
                        rate: (po.grandTotal - po.gstAmount) / (po.itemsCount || 1),
                        gst: po.gstAmount,
                        total: po.grandTotal
                      }
                    ];

                return itemsList.map((item) => (
                  <tr key={item.num} className="hover:bg-slate-50/20">
                    <td className="py-2.5 px-4 text-center font-bold text-slate-400">{item.num}</td>
                    <td className="py-2.5 px-4 text-left">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-slate-800">{item.name}</span>
                        <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wide">{item.sub}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center text-slate-500 text-[11px] font-mono">{item.sku}</td>
                    <td className="py-2.5 px-3 text-center font-extrabold text-slate-800">{item.qty}</td>
                    <td className="py-2.5 px-4 text-right font-medium">${item.rate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="py-2.5 px-4 text-right font-medium text-slate-500">${item.gst.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="py-2.5 px-4 text-right font-extrabold text-slate-800">${item.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>

        {/* Bottom Instructions and Totals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mt-3">
          {/* Left Instructions */}
          <div className="flex flex-col gap-3 text-left">
            <div className="bg-[#f8fafc] border border-slate-100 rounded-xl p-4 flex flex-col gap-2 text-xs text-slate-500 font-semibold leading-relaxed">
              <span className="text-[9.5px] font-black text-[#184edb] uppercase tracking-wider">Payment Terms & Instructions</span>
              <ul className="m-0 pl-4 flex flex-col gap-1 list-disc text-left">
                <li>Payment is due within 15 days of invoice date.</li>
                <li>Please include Invoice #{po.invoiceNo} on all bank transfers.</li>
                <li>Standard warranty applies only to parts installed by certified mechanics.</li>
                <li>Subject to New Delhi Jurisdiction.</li>
              </ul>
            </div>
            <span className="text-[9.5px] text-slate-400 font-bold italic leading-normal">
              *This is a computer-generated invoice and requires no physical signature for digital validation.*
            </span>
          </div>

          {/* Right Totals */}
          <div className="flex flex-col gap-3 text-right">
            {(() => {
              const subtotalVal = po.grandTotal - po.gstAmount;
              const gstVal = po.gstAmount;
              const grandTotalVal = po.grandTotal;

              const numberToWords = (num: number) => {
                const integerPart = Math.floor(num);
                const decimalPart = Math.round((num - integerPart) * 100);
                return `${integerPart.toLocaleString()} and ${decimalPart}/100 Dollars Only`;
              };

              return (
                <div className="flex flex-col gap-2.5 font-semibold text-slate-500 text-xs">
                  <div className="flex items-center justify-between pl-12">
                    <span>Subtotal:</span>
                    <span className="text-slate-800 font-bold">${subtotalVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  
                  <div className="flex items-center justify-between pl-12">
                    <span>Total GST:</span>
                    <span className="text-slate-800 font-bold">${gstVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>

                  <div className="flex items-center justify-between pl-12 border-t border-slate-100 pt-2.5">
                    <span className="text-sm font-black text-slate-900 uppercase tracking-tight font-heading">Grand Total:</span>
                    <span className="text-xl font-black text-[#184edb] font-heading">${grandTotalVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>

                  {/* Amount In Words */}
                  <div className="bg-[#f8fafc] border border-slate-100 rounded-xl p-3 flex flex-col gap-0.5 text-[11px] mt-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider text-right">Amount in Words</span>
                    <p className="m-0 text-slate-700 font-bold leading-normal text-right">
                      {numberToWords(grandTotalVal)}
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-12 items-end mt-6 border-t border-slate-100 pt-6">
          {/* Stamp box */}
          <div className="flex flex-col gap-2 items-start">
            <div className="w-52 h-20 border border-dashed border-slate-200 rounded-xl flex items-center justify-center text-[10px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/50">
              Supplier Stamp Area
            </div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
              Authorized Supplier Representative
            </span>
          </div>

          {/* Manager Signature */}
          <div className="flex flex-col items-end gap-1">
            <span className="text-[13px] font-bold text-slate-800 italic font-heading pr-4">
              Alex E. Johnson
            </span>
            <div className="w-56 h-px bg-slate-200" />
            <div className="flex flex-col text-right mt-1 font-semibold text-slate-500 text-[9px] uppercase tracking-wider gap-0.5">
              <span>Authorized Signature (Workshop Manager)</span>
              <span className="text-[#184edb] font-bold text-[8.5px]">Eicher Workshop Operations</span>
            </div>
          </div>
        </div>

        {/* Print Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4 text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
          <span>Generated by <strong className="text-[#184edb]">AutoCore DMS</strong> v2.4.0</span>
          <span className="font-bold text-slate-500">Thank you for your business</span>
          <span>{po.date} | 14:45:12 IST</span>
        </div>
      </div>
    );
  };

  if (showFigmaInvoice) {
    return (
      <FigmaInvoiceView onBack={() => setShowFigmaInvoice(false)} />
    );
  }

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
            onClick={() => setShowFigmaInvoice(true)}
            className="flex items-center gap-2 bg-[#184edb] hover:bg-[#133eb5] text-white font-semibold text-[13.5px] px-4.5 py-2.5 rounded-lg border-none shadow-md cursor-pointer transition-all duration-200"
          >
            <span>View Invoice</span>
          </button>

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
          className={`flex items-start gap-4 p-5 rounded-2xl border text-left cursor-pointer transition-all duration-300 relative overflow-hidden group hover:scale-[1.01] hover:shadow-md ${subTab === 'overview'
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
          className={`flex items-start gap-4 p-5 rounded-2xl border text-left cursor-pointer transition-all duration-300 relative overflow-hidden group hover:scale-[1.01] hover:shadow-md ${subTab === 'return'
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
          className={`flex items-start gap-4 p-5 rounded-2xl border text-left cursor-pointer transition-all duration-300 relative overflow-hidden group hover:scale-[1.01] hover:shadow-md ${subTab === 'invoice'
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
                            onClick={() => {
                              setSelectedPurchase(p);
                              setShouldTriggerPrint(true);
                            }}
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

      {/* Modal removed */}

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
        <>
          <style>{`
            @media screen {
              #purchase-invoice-print-area {
                display: none !important;
              }
            }
            @media print {
              #root {
                display: none !important;
              }
              #purchase-invoice-print-area {
                display: block !important;
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 20px !important;
                border: none !important;
                background: white !important;
                color: black !important;
              }
            }
          `}</style>

          {/* On-screen modal preview */}
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto print:hidden">
            <div className="bg-white rounded-2xl w-full max-w-[850px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 my-8 flex flex-col">
              {/* Modal Header Control Bar */}
              <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between flex-shrink-0">
                <span className="font-extrabold text-[13px] tracking-wider uppercase">Purchase Invoice Preview</span>
                <button
                  onClick={() => setSelectedPurchase(null)}
                  className="text-white/80 hover:text-white border-none bg-transparent cursor-pointer flex items-center"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable invoice body preview on screen */}
              <div className="p-8 bg-white text-left text-slate-700 font-sans overflow-y-auto max-h-[70vh]">
                {renderInvoiceSheet(selectedPurchase)}
              </div>

              {/* Modal Control Footer Bar */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between flex-shrink-0">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-emerald-500" />
                  Verified by Rohan Sharma
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 bg-[#184edb] hover:bg-[#133eb5] text-white font-bold text-[12.5px] px-5 py-2.5 border-none rounded-lg shadow-md cursor-pointer transition-colors"
                  >
                    <Printer size={15} />
                    <span>Print Invoice</span>
                  </button>
                  <button
                    onClick={() => setSelectedPurchase(null)}
                    className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-[12.5px] px-5 py-2.5 rounded-lg cursor-pointer transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Printable Invoice Portal (renders outside of #root) */}
          {createPortal(
            <div id="purchase-invoice-print-area">
              {renderInvoiceSheet(selectedPurchase)}
            </div>,
            document.body
          )}
        </>
      )}

    </div>
  );
};

interface FigmaInvoiceViewProps {
  onBack: () => void;
}

const FigmaInvoiceView: React.FC<FigmaInvoiceViewProps> = ({ onBack }) => {
  return (
    <Box sx={{ p: 4, bgcolor: '#f3f4f6', minHeight: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, boxSizing: 'border-box' }}>
      
      {/* Back Button */}
      <Box sx={{ width: '100%', maxWidth: '1000px', display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
        <Button 
          variant="text" 
          startIcon={<ArrowBackIcon sx={{ color: '#475569', fontSize: 20 }} />}
          onClick={onBack}
          sx={{ 
            color: '#475569', 
            fontWeight: 700,
            textTransform: 'none',
            '&:hover': { bgcolor: 'transparent', color: '#184edb' }
          }}
        >
          Back to Purchase Overview
        </Button>
      </Box>

      {/* Main Invoice Card */}
      <Paper 
        elevation={0} 
        sx={{ 
          width: '100%',
          maxWidth: '1000px',
          p: 6, 
          borderRadius: '16px', 
          border: '1px solid #e5e7eb', 
          bgcolor: '#ffffff',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: 4.5,
          boxSizing: 'border-box'
        }}
      >
        
        {/* Invoice Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box 
              sx={{ 
                width: 48, 
                height: 48, 
                borderRadius: '10px', 
                bgcolor: '#184edb', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: '0 4px 6px -1px rgba(24, 78, 219, 0.2)'
              }}
            >
              <BusinessIcon sx={{ color: '#ffffff', fontSize: 26 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#184edb', m: 0, letterSpacing: '-0.01em' }}>
                EICHER WORKSHOP
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 800, letterSpacing: '0.05em', mt: 0.5, display: 'block' }}>
                PREMIUM MANAGEMENT SOLUTIONS
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ textAlign: 'right' }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 900, 
                color: '#184edb', 
                letterSpacing: '-0.025em',
                fontFamily: 'system-ui, sans-serif'
              }}
            >
              PURCHASE INVOICE
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1.5, alignItems: 'flex-end' }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', fontSize: '13.5px' }}>
                Invoice #: <Box component="span" sx={{ color: '#0f172a', fontWeight: 800 }}>PUR-2023-8842</Box>
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', fontSize: '13.5px' }}>
                Date: <Box component="span" sx={{ color: '#0f172a', fontWeight: 800 }}>Oct 24, 2023</Box>
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 750, color: '#ef4444', fontSize: '13.5px', mt: 0.5 }}>
                Due Date: <Box component="span" sx={{ fontWeight: 800 }}>Nov 07, 2023</Box>
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Supplier Details & Bill To Columns */}
        <Grid container spacing={6}>
          {/* Supplier Details */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Typography variant="caption" sx={{ color: '#184edb', fontWeight: 800, letterSpacing: '0.1em' }}>
                SUPPLIER DETAILS
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '15px' }}>
                Global Parts Distribution Ltd.
              </Typography>
              <Typography variant="body2" sx={{ color: '#475569', fontWeight: 600, lineHeight: 1.5 }}>
                42 Industrial Estate, Sector 18<br />
                Gurgaon, Haryana 122001<br />
                <Box component="span" sx={{ fontWeight: 750, color: '#0f172a' }}>GSTIN: </Box>07AAACG1234F1Z5<br />
                <Box component="span" sx={{ fontWeight: 750, color: '#0f172a' }}>Phone: </Box>+91 91234 56789<br />
                <Box component="span" sx={{ fontWeight: 750, color: '#0f172a' }}>Email: </Box>
                <Box component="span" sx={{ color: '#184edb', cursor: 'pointer', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                  orders@globalparts.com
                </Box>
              </Typography>
            </Box>
          </Grid>

          {/* Bill To */}
          <Grid size={{ xs: 12, md: 6 }} sx={{ textAlign: 'right' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, alignItems: 'flex-end' }}>
              <Typography variant="caption" sx={{ color: '#184edb', fontWeight: 800, letterSpacing: '0.1em' }}>
                BILL TO
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '15px' }}>
                Eicher Authorized Service Center
              </Typography>
              <Typography variant="body2" sx={{ color: '#475569', fontWeight: 600, lineHeight: 1.5, textAlign: 'right' }}>
                98 Industrial Estate, Phase II<br />
                Okhla, New Delhi 110020<br />
                <Box component="span" sx={{ color: '#184edb', fontWeight: 750 }}>Attn: </Box>Workshop Manager<br />
                <Box component="span" sx={{ fontWeight: 750, color: '#0f172a' }}>GSTIN: </Box>07AABCE4321F1Z2<br />
                <Box component="span" sx={{ fontWeight: 750, color: '#0f172a' }}>Phone: </Box>+91 93765 43210
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Product Table */}
        <TableContainer sx={{ border: 'none', overflow: 'hidden' }}>
          <Table sx={{ minWidth: 650 }} aria-label="invoice items table">
            <TableHead>
              <TableRow sx={{ borderBottom: '2px solid #e2e8f0' }}>
                <TableCell sx={{ fontWeight: 800, color: '#64748b', fontSize: '10.5px', py: 1.5, px: 1 }}>#</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#64748b', fontSize: '10.5px', py: 1.5, px: 1 }}>PRODUCT DESCRIPTION</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#64748b', fontSize: '10.5px', py: 1.5, px: 1 }}>SKU</TableCell>
                <TableCell align="center" sx={{ fontWeight: 800, color: '#64748b', fontSize: '10.5px', py: 1.5, px: 1 }}>QTY</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: '#64748b', fontSize: '10.5px', py: 1.5, px: 1 }}>RATE</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: '#64748b', fontSize: '10.5px', py: 1.5, px: 1 }}>GST (18%)</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: '#64748b', fontSize: '10.5px', py: 1.5, px: 1 }}>TOTAL</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Row 1 */}
              <TableRow sx={{ borderBottom: '1px solid #f1f5f9' }}>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 600, fontSize: '13px', px: 1 }}>01</TableCell>
                <TableCell sx={{ py: 2, px: 1 }}>
                  <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '13.5px' }}>
                    Turbocharger Assembly
                  </Typography>
                  <Typography sx={{ color: '#64748b', fontSize: '11px', fontWeight: 550, mt: 0.5 }}>
                    VNT Grade - High Performance Euro VI Compliant
                  </Typography>
                </TableCell>
                <TableCell sx={{ fontWeight: 650, color: '#334155', fontSize: '12.5px', px: 1 }}>TC-882-VNT</TableCell>
                <TableCell align="center" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '13.5px', px: 1 }}>02</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#334155', fontSize: '13.5px', px: 1 }}>$3,450.00</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: '#334155', fontSize: '13.5px', px: 1 }}>$1,242.00</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '13.5px', px: 1 }}>$8,142.00</TableCell>
              </TableRow>
              {/* Row 2 */}
              <TableRow sx={{ borderBottom: '1px solid #f1f5f9' }}>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 600, fontSize: '13px', px: 1 }}>02</TableCell>
                <TableCell sx={{ py: 2, px: 1 }}>
                  <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '13.5px' }}>
                    High-Pressure Fuel Pump
                  </Typography>
                  <Typography sx={{ color: '#64748b', fontSize: '11px', fontWeight: 550, mt: 0.5 }}>
                    Common Rail System - 2000 Bar Rated
                  </Typography>
                </TableCell>
                <TableCell sx={{ fontWeight: 650, color: '#334155', fontSize: '12.5px', px: 1 }}>FP-CR-2K-9</TableCell>
                <TableCell align="center" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '13.5px', px: 1 }}>01</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#334155', fontSize: '13.5px', px: 1 }}>$2,100.00</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: '#334155', fontSize: '13.5px', px: 1 }}>$378.00</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '13.5px', px: 1 }}>$2,478.00</TableCell>
              </TableRow>
              {/* Row 3 */}
              <TableRow sx={{ borderBottom: '1px solid #f1f5f9' }}>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 600, fontSize: '13px', px: 1 }}>03</TableCell>
                <TableCell sx={{ py: 2, px: 1 }}>
                  <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '13.5px' }}>
                    Carbon Ceramic Brake Pad Set
                  </Typography>
                  <Typography sx={{ color: '#64748b', fontSize: '11px', fontWeight: 550, mt: 0.5 }}>
                    Front Axle - Low Dust Formula
                  </Typography>
                </TableCell>
                <TableCell sx={{ fontWeight: 650, color: '#334155', fontSize: '12.5px', px: 1 }}>BP-CC-F-4X</TableCell>
                <TableCell align="center" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '13.5px', px: 1 }}>04</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#334155', fontSize: '13.5px', px: 1 }}>$1,250.00</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: '#334155', fontSize: '13.5px', px: 1 }}>$900.00</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '13.5px', px: 1 }}>$5,900.00</TableCell>
              </TableRow>
              {/* Row 4 */}
              <TableRow sx={{ borderBottom: '2px solid #e2e8f0' }}>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 600, fontSize: '13px', px: 1 }}>04</TableCell>
                <TableCell sx={{ py: 2, px: 1 }}>
                  <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '13.5px' }}>
                    Forged Piston Set
                  </Typography>
                  <Typography sx={{ color: '#64748b', fontSize: '11px', fontWeight: 550, mt: 0.5 }}>
                    Over-sized +0.50mm - Set of 6
                  </Typography>
                </TableCell>
                <TableCell sx={{ fontWeight: 650, color: '#334155', fontSize: '12.5px', px: 1 }}>PS-FRG-050</TableCell>
                <TableCell align="center" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '13.5px', px: 1 }}>01</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#334155', fontSize: '13.5px', px: 1 }}>$3,850.00</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: '#334155', fontSize: '13.5px', px: 1 }}>$693.00</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '13.5px', px: 1 }}>$4,543.00</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {/* Notes & Calculations Section */}
        <Grid container spacing={4}>
          {/* Notes & Terms */}
          <Grid size={{ xs: 12, md: 7 }} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box 
              sx={{ 
                p: 2.5, 
                borderRadius: '8px', 
                bgcolor: '#f8fafc',
                border: '1px solid #f1f5f9'
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 800, color: '#184edb', letterSpacing: '0.02em', mb: 1.5, fontSize: '11.5px' }}>
                PAYMENT TERMS & INSTRUCTIONS
              </Typography>
              <Box component="ul" sx={{ m: 0, p: 0, pl: 2, display: 'flex', flexDirection: 'column', gap: 1, color: '#64748b', fontSize: '11px', fontWeight: 600, lineHeight: 1.5 }}>
                <Box component="li">Payment is due within 15 days of invoice date.</Box>
                <Box component="li">Please include Invoice #PUR-2023-8842 on all bank transfers.</Box>
                <Box component="li">Standard warranty applies only to parts installed by certified mechanics.</Box>
                <Box component="li">Subject to New Delhi Jurisdiction.</Box>
              </Box>
            </Box>

            <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#94a3b8', fontSize: '11px', fontWeight: 550, mt: 1, pr: 4 }}>
              "*This is a computer-generated invoice and requires no physical signature for digital validation.*"
            </Typography>
          </Grid>

          {/* Calculations */}
          <Grid size={{ xs: 12, md: 5 }} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, px: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 650 }}>Subtotal:</Typography>
                <Typography variant="body2" sx={{ color: '#0f172a', fontWeight: 800 }}>$16,650.00</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 650 }}>Total GST (18%):</Typography>
                <Typography variant="body2" sx={{ color: '#0f172a', fontWeight: 800 }}>$3,213.00</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: '#ef4444', fontWeight: 800 }}>Corporate Discount (5%):</Typography>
                <Typography variant="body2" sx={{ color: '#ef4444', fontWeight: 800 }}>-$993.15</Typography>
              </Box>
            </Box>

            <MuiDivider sx={{ borderColor: '#cbd5e1', borderHeight: '1.5px' }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2 }}>
              <Typography variant="h6" sx={{ color: '#0f172a', fontWeight: 900 }}>Grand Total:</Typography>
              <Typography 
                variant="h4" 
                sx={{ 
                  color: '#184edb', 
                  fontWeight: 900,
                  letterSpacing: '-0.025em',
                  fontFamily: 'system-ui, sans-serif'
                }}
              >
                $18,869.85
              </Typography>
            </Box>

            <Box 
              sx={{ 
                p: 2, 
                borderRadius: '8px', 
                bgcolor: '#f0f4ff',
                border: '1px solid #d6e4ff',
                textAlign: 'right',
                mt: 1
              }}
            >
              <Typography variant="caption" sx={{ color: '#184edb', fontWeight: 800, letterSpacing: '0.05em', display: 'block', mb: 0.5 }}>
                AMOUNT IN WORDS
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 800, color: '#334155', fontSize: '11px', lineHeight: 1.4 }}>
                Eighteen Thousand Eight Hundred Sixty Nine and<br />85/100 Dollars Only
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Footer Stamp & Signature */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 4 }}>
          {/* Representative stamp */}
          <Box sx={{ textAlign: 'center' }}>
            <Box 
              sx={{ 
                width: 240, 
                height: 60, 
                border: '1px dashed #cbd5e1', 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#f8fafc'
              }}
            >
              <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 850, letterSpacing: '0.05em', fontSize: '10px' }}>
                SUPPLIER STAMP AREA
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ display: 'block', color: '#64748b', fontWeight: 800, mt: 1.5, letterSpacing: '0.05em', fontSize: '10px' }}>
              AUTHORIZED SUPPLIER REPRESENTATIVE
            </Typography>
          </Box>

          {/* Signature */}
          <Box sx={{ textAlign: 'right' }}>
            <Typography 
              sx={{ 
                fontFamily: '"Playfair Display", "Georgia", serif', 
                fontSize: '22px', 
                color: '#334155', 
                fontStyle: 'italic',
                fontWeight: 600,
                pr: 2
              }}
            >
              Alex E. Johnson
            </Typography>
            <Box sx={{ width: 260, height: '1px', bgcolor: '#cbd5e1', my: 1, ml: 'auto' }} />
            <Typography variant="caption" sx={{ display: 'block', color: '#64748b', fontWeight: 800, letterSpacing: '0.05em', fontSize: '9.5px' }}>
              AUTHORIZED SIGNATURE (WORKSHOP MANAGER)
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', color: '#184edb', fontWeight: 800, mt: 0.5, letterSpacing: '0.05em', fontSize: '9.5px' }}>
              Eicher Workshop Operations
            </Typography>
          </Box>
        </Box>

        <MuiDivider sx={{ mt: 3, borderColor: '#f1f5f9' }} />

        {/* Bottom Small Print */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '10px', fontWeight: 600 }}>
          <Typography variant="caption" sx={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>
            Generated by <Box component="span" sx={{ color: '#64748b', fontWeight: 800 }}>AutoCore DMS</Box> v2.4.0
          </Typography>
          <Typography variant="caption" sx={{ fontSize: '10px', color: '#64748b', fontWeight: 800, letterSpacing: '0.05em' }}>
            THANK YOU FOR YOUR BUSINESS
          </Typography>
          <Typography variant="caption" sx={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>
            Oct 24, 2023 | 14:45:12 IST
          </Typography>
        </Box>

      </Paper>

      {/* Floating/Bottom Action Buttons */}
      <Box sx={{ width: '100%', maxWidth: '1000px', display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
        <Button
          variant="contained"
          startIcon={<PrintIcon sx={{ color: '#ffffff' }} />}
          onClick={() => window.print()}
          sx={{
            bgcolor: '#184edb',
            color: '#ffffff',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            borderRadius: '8px',
            px: 3.5,
            py: 1.5,
            fontSize: '13px',
            boxShadow: '0 4px 6px -1px rgba(24, 78, 219, 0.25)',
            '&:hover': {
              bgcolor: '#133eb5',
            }
          }}
        >
          Print Invoice
        </Button>
      </Box>

    </Box>
  );
};

export default Purchase;
