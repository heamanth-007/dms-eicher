import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { getStoredInventory, addPendingPurchaseItems, type PartType } from '../utils/inventory';
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
  Info,
  Mail,
  Wallet,
  QrCode,
  Smartphone,
  ExternalLink,
  History
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
export interface PaymentHistoryItem {
  id: string;
  date: string;
  amount: number;
  mode?: string;
  remarks?: string;
}

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
  type?: 'PURCHASE' | 'BALANCE' | 'PAYMENT' | 'CREDIT NOTE';
  description?: string;
  debit?: number;
  credit?: number;
  balance?: number;
  paymentMode?: string;
  remarks?: string;
  payments?: PaymentHistoryItem[];
}

interface ReturnItem {
  id: string;
  productName: string;
  qty: number;
  amount: number;
  reason: string;
}

interface PurchaseReturn {
  id: string;
  poRef: string;
  supplier: string;
  date: string;
  purchaseDate?: string;
  productName?: string;
  itemsCount: number;
  refundValue: number;
  reason: string;
  status: 'COMPLETED' | 'PENDING' | 'REJECTED';
  items?: ReturnItem[];
}

interface SupplierInvoice {
  id: string;
  poRef: string;
  supplier: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  paidAmount?: number;
  balanceDue?: number;
  status: 'PAID' | 'PARTIAL' | 'UNPAID' | 'OVERDUE';
  items?: PurchaseItem[];
}

interface PurchaseItem {
  id: string;
  productName: string;
  qty: number;
  rate: number;
  gstPercent: number;
}

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

interface PurchaseProps {
  suppliersList?: SupplierType[];
}

const getTodayFormattedDate = () => {
  return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const cleanReasonDisplay = (reasonStr?: string) => {
  if (!reasonStr) return '-';
  return reasonStr
    .split(/\s*\|\s*/)
    .map(segment => segment.replace(/^[^:]+:\s*/, '').trim())
    .filter(Boolean)
    .filter((value, index, self) => self.indexOf(value) === index)
    .join(', ') || reasonStr;
};

export const Purchase: React.FC<PurchaseProps> = ({ suppliersList: propSuppliersList = [] }) => {
  // Sub-tabs: 'overview', 'return', 'invoice'
  const [subTab, setSubTab] = useState<'overview' | 'return' | 'invoice'>('overview');
  const [showFigmaInvoice, setShowFigmaInvoice] = useState(false);

  // Modals state
  const [showNewPurchaseModal, setShowNewPurchaseModal] = useState(false);
  const [showNewReturnModal, setShowNewReturnModal] = useState(false);
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseOrder | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<SupplierInvoice | null>(null);
  const [showSupplierBreakdownModal, setShowSupplierBreakdownModal] = useState(false);
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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // QR Payment Modal state
  const [showQrPaymentModal, setShowQrPaymentModal] = useState(false);
  const [qrPaymentInvoice, setQrPaymentInvoice] = useState<SupplierInvoice | null>(null);
  const [customPaymentAmount, setCustomPaymentAmount] = useState<number>(0);

  // Reset to page 1 whenever subTab or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [subTab, supplierFilter, statusFilter, searchTerm, dateRange]);

  // Synced Data Setup for Overview (purchases) & Invoices (invoices)
  const initialSyncedData = { purchases: [], invoices: [] };

  // Initial Purchases with localStorage persistence
  const [purchases, setPurchases] = useState<PurchaseOrder[]>(() => {
    try {
      const saved = localStorage.getItem('dms_purchases_list');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {}
    return initialSyncedData.purchases;
  });

  // Initial Returns with localStorage persistence
  const [returns, setReturns] = useState<PurchaseReturn[]>(() => {
    try {
      const saved = localStorage.getItem('dms_purchase_returns_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('dms_purchase_returns_list', JSON.stringify(returns));
    } catch (e) {}
  }, [returns]);

  // Helper for invoice financial status
  const getPaidAmount = (inv: SupplierInvoice) => {
    if (inv.paidAmount !== undefined) return inv.paidAmount;
    if (inv.status === 'PAID') return inv.amount;
    if (inv.status === 'PARTIAL') return Math.round(inv.amount * 0.4);
    return 0;
  };

  const getBalanceDue = (inv: SupplierInvoice) => {
    if (inv.balanceDue !== undefined) return inv.balanceDue;
    const paid = getPaidAmount(inv);
    return Math.max(0, inv.amount - paid);
  };

  // Initial Invoices with localStorage persistence
  const [invoices, setInvoices] = useState<SupplierInvoice[]>(() => {
    try {
      const saved = localStorage.getItem('dms_supplier_invoices_list');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return initialSyncedData.invoices;
  });

  // Unified sync helper to update purchases and invoices in state, localStorage, and Supplier Ledger
  const saveAndSyncPurchasesAndInvoices = (updatedPurchases: PurchaseOrder[], updatedInvoices: SupplierInvoice[]) => {
    setPurchases(updatedPurchases);
    setInvoices(updatedInvoices);
    try {
      localStorage.setItem('dms_purchases_list', JSON.stringify(updatedPurchases));
      localStorage.setItem('dms_supplier_invoices_list', JSON.stringify(updatedInvoices));
    } catch (e) {}
    window.dispatchEvent(new Event('dms_purchases_updated'));
  };

  // Automatic Sequential Invoice Number Generator (INV-7728 Order & Alphabet Extension)
  const generateNextInvoiceNumber = (allInvoices: SupplierInvoice[], allPurchases: PurchaseOrder[]) => {
    let maxNum = 7727;
    let maxLetterCode = 0;

    const allNos = [
      ...allInvoices.map(i => i.id),
      ...allPurchases.map(p => p.invoiceNo)
    ];

    allNos.forEach(no => {
      if (!no) return;
      // Match pattern INV-7728 or INV-7728-A
      const match = no.match(/INV[/-]?(\d+)(?:[/-]?([A-Z]))?/i);
      if (match && match[1]) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
        if (match[2]) {
          const letterCode = match[2].toUpperCase().charCodeAt(0) - 64; // A=1, B=2
          if (letterCode > maxLetterCode) {
            maxLetterCode = letterCode;
          }
        }
      }
    });

    // If numeric range exceeds 9999, append alphabet series (e.g. INV-9999-A, INV-9999-B...)
    if (maxNum >= 9999) {
      const nextLetter = String.fromCharCode(65 + maxLetterCode);
      return `INV-9999-${nextLetter}`;
    }

    const nextNum = maxNum + 1;
    return `INV-${nextNum}`;
  };

  // Automatic Sequential PO ID Generator (Order Padi)
  const generateNextPoId = (allPurchases: PurchaseOrder[]) => {
    const yearStr = new Date().getFullYear();
    let maxSeq = 943;
    allPurchases.forEach(p => {
      if (p.id) {
        const match = p.id.match(/PO-(?:\d{4})-(\d+)/i);
        if (match && match[1]) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxSeq) {
            maxSeq = num;
          }
        }
      }
    });
    const nextSeq = String(maxSeq + 1).padStart(4, '0');
    return `PO-${yearStr}-${nextSeq}`;
  };

  // --- NEW ENTRY STATE VARIABLES ---
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [fetchedSuppliers, setFetchedSuppliers] = useState<SupplierType[]>([]);

  useEffect(() => {
    if (propSuppliersList.length === 0) {
      fetch(`${API_URL}/api/suppliers`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setFetchedSuppliers(data);
          }
        })
        .catch((err) => console.error('Error fetching suppliers in Purchase component:', err));
    }
  }, [propSuppliersList]);

  const defaultSuppliersList: SupplierType[] = [];

  // Use suppliers from Suppliers page (via props or API), fallback to defaults only if none exist
  const activeSuppliersList = propSuppliersList.length > 0 
    ? propSuppliersList 
    : (fetchedSuppliers.length > 0 ? fetchedSuppliers : defaultSuppliersList);

  // Purchase form state
  const [newPoType, setNewPoType] = useState<'PURCHASE' | 'BALANCE' | 'PAYMENT' | 'CREDIT NOTE'>('PURCHASE');
  const [newPoId, setNewPoId] = useState('PO-2026-0943');
  const [newPoInvoice, setNewPoInvoice] = useState('');
  const [newPoSupplier, setNewPoSupplier] = useState(activeSuppliersList[0]?.name || '');
  const [newPoDate, setNewPoDate] = useState(getTodayFormattedDate());
  const [newPoPaymentMode, setNewPoPaymentMode] = useState<string>('Bank Transfer');
  const [newPoPaidAmount, setNewPoPaidAmount] = useState<number | string>('');
  const [newPoCredit, setNewPoCredit] = useState<number | string>(0);
  const [newPoDescription, setNewPoDescription] = useState<string>('');

  const [newPoTerms, setNewPoTerms] = useState('Net 30');
  const [newPoRemarks, setNewPoRemarks] = useState('');
  const [newPoAdditionalCharges, setNewPoAdditionalCharges] = useState(0);
  const [newPoDiscount, setNewPoDiscount] = useState(0);
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);

  // Inline manual product entry state & ref
  const [quickProdName, setQuickProdName] = useState('');
  const [quickProdQty, setQuickProdQty] = useState<number | string>(1);
  const [quickProdRate, setQuickProdRate] = useState<number | string>('');
  const [quickProdGst, setQuickProdGst] = useState<number>(18);
  const quickProdNameRef = useRef<HTMLInputElement>(null);
  const quickProdQtyRef = useRef<HTMLInputElement>(null);
  const quickProdRateRef = useRef<HTMLInputElement>(null);
  const quickProdGstRef = useRef<HTMLSelectElement>(null);

  // Edit Purchase form state
  const [editingPurchase, setEditingPurchase] = useState<PurchaseOrder | null>(null);
  const [editPoId, setEditPoId] = useState('');
  const [editPoType, setEditPoType] = useState<'PURCHASE' | 'BALANCE' | 'PAYMENT' | 'CREDIT NOTE'>('PURCHASE');
  const [editPoInvoice, setEditPoInvoice] = useState('');
  const [editPoSupplier, setEditPoSupplier] = useState('');
  const [editPoDate, setEditPoDate] = useState('');
  const [editPoPaymentMode, setEditPoPaymentMode] = useState<string>('Paid');
  const [editPoCredit, setEditPoCredit] = useState<number | string>(0);
  const [editPoDescription, setEditPoDescription] = useState<string>('');
  const [editPoRemarks, setEditPoRemarks] = useState('');
  const [editPoAdditionalCharges, setEditPoAdditionalCharges] = useState(0);
  const [editPoDiscount, setEditPoDiscount] = useState(0);
  const [editPurchaseItems, setEditPurchaseItems] = useState<PurchaseItem[]>([]);

  // Edit inline product entry state & ref
  const [editQuickProdName, setEditQuickProdName] = useState('');
  const [editQuickProdQty, setEditQuickProdQty] = useState<number | string>(1);
  const [editQuickProdRate, setEditQuickProdRate] = useState<number | string>('');
  const [editQuickProdGst, setEditQuickProdGst] = useState<number>(18);
  const editQuickProdNameRef = useRef<HTMLInputElement>(null);
  const editQuickProdQtyRef = useRef<HTMLInputElement>(null);
  const editQuickProdRateRef = useRef<HTMLInputElement>(null);
  const editQuickProdGstRef = useRef<HTMLSelectElement>(null);

  const [sparePartsInventory, setSparePartsInventory] = useState<PartType[]>(() => getStoredInventory());

  useEffect(() => {
    const handleInvUpdate = () => {
      setSparePartsInventory(getStoredInventory());
    };
    window.addEventListener('dms_inventory_updated', handleInvUpdate);
    return () => window.removeEventListener('dms_inventory_updated', handleInvUpdate);
  }, []);

  useEffect(() => {
    if (activeSuppliersList.length > 0 && (!newPoSupplier || !activeSuppliersList.some(s => s.name === newPoSupplier))) {
      setNewPoSupplier(activeSuppliersList[0].name);
    }
  }, [propSuppliersList, fetchedSuppliers, activeSuppliersList]);

  const handleAddQuickProduct = () => {
    if (!quickProdName.trim()) {
      alert('Please enter a product name.');
      quickProdNameRef.current?.focus();
      return;
    }
    const qty = Number(quickProdQty) || 1;
    const rate = Number(quickProdRate) || 0;

    const newItem: PurchaseItem = {
      id: 'item-' + Date.now(),
      productName: quickProdName.trim(),
      qty: qty,
      rate: rate,
      gstPercent: quickProdGst
    };

    setPurchaseItems(prev => [...prev, newItem]);
    setQuickProdName('');
    setQuickProdQty(1);
    setQuickProdRate('');
    setQuickProdGst(18);

    setTimeout(() => {
      quickProdNameRef.current?.focus();
    }, 50);
  };

  const handleRemoveItem = (id: string) => {
    setPurchaseItems(purchaseItems.filter(item => item.id !== id));
  };

  // View & Edit Return Modal state
  const [viewingReturn, setViewingReturn] = useState<PurchaseReturn | null>(null);
  const [editingReturn, setEditingReturn] = useState<PurchaseReturn | null>(null);

  const handleViewReturn = (ret: PurchaseReturn) => {
    setViewingReturn(ret);
  };

  const handleStartNewReturn = () => {
    setEditingReturn(null);
    setNewRetId(`RET-2026-${String(returns.length + 1).padStart(3, '0')}`);
    setNewRetSupplier(activeSuppliersList[0]?.name || suppliersList.filter(s => s !== 'All')[0] || '');
    setNewRetPoRef(purchases[0]?.id || 'PO-2026-0942');
    setNewRetDate(getTodayFormattedDate());
    setNewRetStatus('PENDING');
    setNewRetItems([]);
    setRetLineProdName('');
    setRetLineQty(1);
    setRetLineAmount('');
    setRetLineReason('');
    setShowNewReturnModal(true);
  };

  const handleStartEditReturn = (ret: PurchaseReturn) => {
    setEditingReturn(ret);
    setNewRetId(ret.id);
    setNewRetSupplier(ret.supplier || activeSuppliersList[0]?.name || '');
    setNewRetPoRef(ret.poRef || '');
    setNewRetDate(ret.date || getTodayFormattedDate());
    setNewRetStatus(ret.status || 'PENDING');

    if (ret.items && ret.items.length > 0) {
      setNewRetItems(JSON.parse(JSON.stringify(ret.items)));
    } else {
      setNewRetItems([
        {
          id: `ret-item-${Date.now()}-1`,
          productName: ret.productName || 'Returned Component / Part',
          qty: ret.itemsCount || 1,
          amount: ret.refundValue || 0,
          reason: ret.reason || 'Defective'
        }
      ]);
    }

    setRetLineProdName('');
    setRetLineQty(1);
    setRetLineAmount('');
    setRetLineReason('');
    setShowNewReturnModal(true);
  };

  // Return form state
  const [newRetId, setNewRetId] = useState('RET-2023-011');
  const [newRetSupplier, setNewRetSupplier] = useState(activeSuppliersList[0]?.name || '');
  const [newRetPoRef, setNewRetPoRef] = useState('PO-2023-0942');
  const [newRetDate, setNewRetDate] = useState('Oct 26, 2023');
  const [newRetStatus, setNewRetStatus] = useState<'COMPLETED' | 'PENDING' | 'REJECTED'>('PENDING');

  // Multi-product return line items state & focus refs
  const [newRetItems, setNewRetItems] = useState<ReturnItem[]>([]);
  const [retLineProdName, setRetLineProdName] = useState('');
  const [retLineQty, setRetLineQty] = useState<number | string>(1);
  const [retLineAmount, setRetLineAmount] = useState<number | string>('');
  const [retLineReason, setRetLineReason] = useState('');

  const retProdNameRef = useRef<HTMLInputElement>(null);
  const retQtyRef = useRef<HTMLInputElement>(null);
  const retAmtRef = useRef<HTMLInputElement>(null);
  const retReasonRef = useRef<HTMLInputElement>(null);

  const handleAddReturnLineItem = () => {
    const trimmedName = retLineProdName.trim();
    if (!trimmedName) {
      alert('Please enter or select a product name.');
      retProdNameRef.current?.focus();
      return;
    }

    // Prevent duplicate product additions in the return record!
    const isDuplicate = newRetItems.some(
      item => item.productName.toLowerCase() === trimmedName.toLowerCase()
    );
    if (isDuplicate) {
      alert(`Product "${trimmedName}" is already added to this return record. If you need to change quantity or amount, remove the existing line item first.`);
      retProdNameRef.current?.focus();
      return;
    }

    const qty = Number(retLineQty) || 1;
    const amt = Number(retLineAmount) || 0;
    const reasonText = retLineReason.trim() || 'Defective / Damaged part';

    const newItem: ReturnItem = {
      id: 'ret-item-' + Date.now(),
      productName: trimmedName,
      qty: qty,
      amount: amt,
      reason: reasonText
    };

    setNewRetItems(prev => [...prev, newItem]);
    setRetLineProdName('');
    setRetLineQty(1);
    setRetLineAmount('');
    setRetLineReason('');

    // Focus back to Product Name for seamless step entry
    setTimeout(() => {
      retProdNameRef.current?.focus();
    }, 50);
  };

  const handleRemoveReturnLineItem = (id: string) => {
    setNewRetItems(prev => prev.filter(item => item.id !== id));
  };

  // Invoice form state
  const [newInvNo, setNewInvNo] = useState('INV-8850');
  const [newInvPoRef, setNewInvPoRef] = useState('PO-2023-0942');
  const [newInvSupplier, setNewInvSupplier] = useState(activeSuppliersList[0]?.name || '');
  const [newInvIssueDate, setNewInvIssueDate] = useState('Oct 26, 2023');
  const [newInvDueDate, setNewInvDueDate] = useState('Nov 26, 2023');
  const [newInvAmount, setNewInvAmount] = useState(1500);
  const [newInvStatus, setNewInvStatus] = useState<'PAID' | 'PARTIAL' | 'UNPAID' | 'OVERDUE'>('UNPAID');

  const isTodayPurchase = (dateStr: string) => {
    if (!dateStr) return false;
    const todayStr = getTodayFormattedDate();
    const shortToday = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const isoToday = new Date().toISOString().split('T')[0];
    return (
      dateStr === todayStr ||
      dateStr.includes(todayStr) ||
      dateStr.includes(shortToday) ||
      dateStr.includes(isoToday) ||
      dateStr.includes('Today')
    );
  };

  const isLast7Days = (dateStr: string) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return false;
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    return date >= sevenDaysAgo && date <= today;
  };

  const isOct2023 = (dateStr: string) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return false;
    return date.getFullYear() === 2023 && date.getMonth() === 9; // October is index 9
  };



  // List of suppliers for dropdown
  const suppliersList = ['All', ...activeSuppliersList.map(s => s.name)];

  // Handle New Purchase Order Submit
  const handleCreatePurchaseOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPoSupplier) {
      alert('Please select a supplier.');
      return;
    }

    const itemsSubtotal = purchaseItems.reduce((acc, item) => acc + (item.qty * item.rate), 0);
    const totalGst = purchaseItems.reduce((acc, item) => acc + (item.qty * item.rate * (item.gstPercent / 100)), 0);
    const calculatedTotal = itemsSubtotal + totalGst + Number(newPoAdditionalCharges) - Number(newPoDiscount);
    const debitVal = Math.max(0, calculatedTotal > 0 ? calculatedTotal : (itemsSubtotal || 0));

    // Credit value (Paid Amount)
    const creditVal = Number(newPoCredit) || (newPoPaymentMode === 'Paid' ? debitVal : 0);
    const balanceVal = Math.max(0, debitVal - creditVal);

    let statusVal: 'PAID' | 'PARTIAL' | 'PENDING' = 'PAID';
    if (newPoPaymentMode === 'Paid' || (creditVal >= debitVal && debitVal > 0)) {
      statusVal = 'PAID';
    } else if (creditVal > 0 && creditVal < debitVal) {
      statusVal = 'PARTIAL';
    } else {
      statusVal = 'PENDING';
    }

    const itemsDesc = purchaseItems.length > 0 
      ? purchaseItems.map(i => `${i.productName} (x${i.qty} @ ₹${i.rate})`).join(', ') 
      : 'General Purchase Intake';
    const finalDescription = newPoDescription.trim() || itemsDesc;

    const initials = newPoSupplier.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'SP';
    const bgColors = ['bg-indigo-500', 'bg-[#184edb]', 'bg-emerald-500', 'bg-purple-500'];
    const randomBg = bgColors[Math.floor(Math.random() * bgColors.length)];

    const initialPaymentsArr: PaymentHistoryItem[] = creditVal > 0 ? [
      {
        id: `pay-${Date.now()}`,
        date: newPoDate || getTodayFormattedDate(),
        amount: creditVal,
        mode: newPoPaymentMode || 'Cash',
        remarks: newPoRemarks || 'Initial Payment'
      }
    ] : [];

    const currentYear = new Date().getFullYear();
    let maxPoSeq = 5000;
    purchases.forEach(p => {
      if (p.id) {
        const match = p.id.match(new RegExp(`PO-${currentYear}-(5\\d{3})$`, 'i'));
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num >= 5001 && num < 6000) {
            if (num > maxPoSeq) maxPoSeq = num;
          }
        }
      }
    });
    const generatedPoId = `PO-${currentYear}-${maxPoSeq + 1}`;

    const newPO: PurchaseOrder = {
      id: newPoId || generatedPoId,
      invoiceNo: newPoInvoice || generateNextInvoiceNumber(invoices, purchases),
      supplier: newPoSupplier,
      supplierInitials: initials,
      supplierBg: randomBg,
      date: newPoDate || getTodayFormattedDate(),
      itemsCount: purchaseItems.reduce((acc, i) => acc + i.qty, 0) || (purchaseItems.length > 0 ? purchaseItems.length : 1),
      gstAmount: totalGst,
      grandTotal: debitVal,
      status: statusVal,
      items: purchaseItems.length > 0 ? [...purchaseItems] : [
        { id: 'p1', productName: 'Spare Parts Batch Intake', qty: 1, rate: debitVal || 1500, gstPercent: 18 }
      ],
      type: newPoType,
      description: finalDescription,
      debit: debitVal,
      credit: creditVal,
      balance: balanceVal,
      paymentMode: newPoPaymentMode,
      remarks: newPoRemarks,
      payments: initialPaymentsArr
    };

    setPurchases(prev => {
      const updated = [newPO, ...prev];
      try {
        localStorage.setItem('dms_purchases_list', JSON.stringify(updated));
      } catch (err) {}
      return updated;
    });

    setShowNewPurchaseModal(false);

    // Reset Form
    const currentNum = parseInt(newPoId.replace(/[^0-9]/g, ''), 10) || 943;
    setNewPoId(`PO-2026-0${currentNum + 1}`);
    setNewPoInvoice('');
    setNewPoType('PURCHASE');
    setNewPoPaymentMode('Paid');
    setNewPoCredit(0);
    setNewPoDescription('');
    setNewPoRemarks('');
    setPurchaseItems([]);
    setQuickProdName('');
    setQuickProdQty(1);
    setQuickProdRate('');
    setQuickProdGst(18);

    alert(`Purchase / Ledger Entry ${newPO.id} (${newPO.type}) saved successfully!`);
  };

  // Edit Handlers
  const handleStartEditPurchase = (po: PurchaseOrder) => {
    let paymentsArr = po.payments;
    if (!paymentsArr || paymentsArr.length === 0) {
      let initialPaidAmount = 0;
      if (po.credit !== undefined && po.credit > 0) {
        initialPaidAmount = po.credit;
      } else if (po.debit !== undefined && po.debit > 0 && po.debit < po.grandTotal) {
        initialPaidAmount = po.debit;
      } else if (po.debit !== undefined && po.balance !== undefined) {
        initialPaidAmount = Math.max(0, po.grandTotal - po.balance);
      } else if (po.status === 'PAID') {
        initialPaidAmount = po.grandTotal;
      } else if (po.status === 'PARTIAL') {
        initialPaidAmount = Math.round(po.grandTotal / 2);
      }

      if (initialPaidAmount > 0) {
        paymentsArr = [{
          id: `pay-init-${po.id}`,
          date: po.date || getTodayFormattedDate(),
          amount: initialPaidAmount,
          mode: po.paymentMode || 'Cash',
          remarks: 'Initial Payment'
        }];
      } else {
        paymentsArr = [];
      }
    }

    const updatedPoWithPayments = { ...po, payments: paymentsArr };
    setEditingPurchase(updatedPoWithPayments);
    setEditPoId(po.id);
    setEditPoType(po.type || 'PURCHASE');
    setEditPoInvoice(po.invoiceNo || '');
    setEditPoSupplier(po.supplier);
    setEditPoDate(po.date || getTodayFormattedDate());
    setEditPoPaymentMode(po.paymentMode || (po.status === 'PAID' ? 'Paid' : 'Credit Account'));

    // Reset Amount Paid Now to empty string so user can type amount to pay now
    setEditPoCredit('');
    setEditPoDescription(po.description || '');
    setEditPoRemarks(po.remarks || '');

    const itemsGstTotal = po.items ? Math.round(po.items.reduce((acc, i) => acc + (i.qty * (Number(i.rate) || 0) * (1 + (Number(i.gstPercent) || 0)/100)), 0)) : 0;
    const diffCharges = itemsGstTotal > 0 && po.grandTotal > itemsGstTotal
      ? Math.max(0, po.grandTotal - itemsGstTotal) 
      : po.grandTotal;

    setEditPoAdditionalCharges(diffCharges);
    setEditPoDiscount(0);
    setEditPurchaseItems(po.items ? [...po.items] : []);
    setEditQuickProdName('');
    setEditQuickProdQty(1);
    setEditQuickProdRate('');
    setEditQuickProdGst(18);
  };

  const handleAddEditQuickProduct = () => {
    if (!editQuickProdName.trim()) {
      alert('Please enter a product name.');
      editQuickProdNameRef.current?.focus();
      return;
    }
    const qty = Number(editQuickProdQty) || 1;
    const rate = Number(editQuickProdRate) || 0;

    const newItem: PurchaseItem = {
      id: 'item-' + Date.now(),
      productName: editQuickProdName.trim(),
      qty: qty,
      rate: rate,
      gstPercent: editQuickProdGst
    };

    setEditPurchaseItems(prev => [...prev, newItem]);
    setEditQuickProdName('');
    setEditQuickProdQty(1);
    setEditQuickProdRate('');
    setEditQuickProdGst(18);

    setTimeout(() => {
      editQuickProdNameRef.current?.focus();
    }, 50);
  };

  const handleRemoveEditItem = (id: string) => {
    setEditPurchaseItems(editPurchaseItems.filter(item => item.id !== id));
  };

  const handleUpdatePurchaseOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPurchase) return;
    if (!editPoSupplier) {
      alert('Please select a supplier.');
      return;
    }

    const itemsSubtotal = editPurchaseItems.reduce((acc, item) => acc + (item.qty * (Number(item.rate) || 0)), 0);
    const totalGst = editPurchaseItems.reduce((acc, item) => acc + (item.qty * (Number(item.rate) || 0) * ((Number(item.gstPercent) || 0) / 100)), 0);
    const itemsWithRateTotal = Math.round(itemsSubtotal + totalGst);
    const calculatedTotal = itemsWithRateTotal > 0
      ? Math.round(itemsWithRateTotal + Number(editPoAdditionalCharges || 0) - Number(editPoDiscount || 0))
      : (Number(editPoAdditionalCharges) || editingPurchase.grandTotal);
    
    const debitVal = Math.max(0, calculatedTotal);
    const amountPaidNow = Number(editPoCredit) || 0;

    const existingPayments = editingPurchase.payments || [];
    let updatedPayments = [...existingPayments];

    if (amountPaidNow > 0) {
      const newPaymentItem: PaymentHistoryItem = {
        id: `pay-${Date.now()}`,
        date: getTodayFormattedDate(),
        amount: amountPaidNow,
        mode: editPoPaymentMode || 'Paid',
        remarks: editPoRemarks || 'Payment Installment'
      };
      updatedPayments.push(newPaymentItem);
    }

    const totalPaidVal = updatedPayments.reduce((acc, p) => acc + p.amount, 0);
    const balanceVal = Math.max(0, debitVal - totalPaidVal);

    let statusVal: 'PAID' | 'PARTIAL' | 'PENDING' = 'PAID';
    if (balanceVal === 0) {
      statusVal = 'PAID';
    } else if (totalPaidVal > 0 && balanceVal > 0) {
      statusVal = 'PARTIAL';
    } else {
      statusVal = 'PENDING';
    }

    const itemsDesc = editPurchaseItems.length > 0 
      ? editPurchaseItems.map(i => `${i.productName} (x${i.qty} @ ₹${i.rate})`).join(', ') 
      : 'General Purchase Intake';
    const finalDescription = editPoDescription.trim() || itemsDesc;

    const initials = editPoSupplier.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'SP';

    const updatedPO: PurchaseOrder = {
      ...editingPurchase,
      id: editPoId || editingPurchase.id,
      invoiceNo: editPoInvoice || editingPurchase.invoiceNo,
      supplier: editPoSupplier,
      supplierInitials: initials,
      date: editPoDate || editingPurchase.date,
      itemsCount: editPurchaseItems.reduce((acc, i) => acc + i.qty, 0) || (editPurchaseItems.length > 0 ? editPurchaseItems.length : editingPurchase.itemsCount),
      gstAmount: totalGst,
      grandTotal: debitVal,
      status: statusVal,
      items: editPurchaseItems.length > 0 ? [...editPurchaseItems] : editingPurchase.items,
      type: editPoType,
      description: finalDescription,
      debit: totalPaidVal,
      credit: totalPaidVal,
      balance: balanceVal,
      paymentMode: editPoPaymentMode,
      remarks: editPoRemarks,
      payments: updatedPayments
    };

    setPurchases(prev => {
      const updated = prev.map(p => p.id === editingPurchase.id ? updatedPO : p);
      try {
        localStorage.setItem('dms_purchases_list', JSON.stringify(updated));
      } catch (err) {}
      return updated;
    });

    setEditingPurchase(null);
    alert(`Purchase Order ${updatedPO.id} updated successfully!`);
  };

  // Handle Create or Update Return Submit
  const handleCreateReturn = (e: React.FormEvent) => {
    e.preventDefault();

    let itemsToSave = [...newRetItems];
    if (retLineProdName.trim()) {
      const qty = Number(retLineQty) || 1;
      const amt = Number(retLineAmount) || 0;
      const reasonText = retLineReason.trim() || 'Defective / Damaged part';
      itemsToSave.push({
        id: 'ret-item-' + Date.now(),
        productName: retLineProdName.trim(),
        qty: qty,
        amount: amt,
        reason: reasonText
      });
    }

    if (itemsToSave.length === 0) {
      alert('Please add at least one product item to return.');
      return;
    }

    const totalQty = itemsToSave.reduce((acc, i) => acc + i.qty, 0);
    const totalRefundVal = itemsToSave.reduce((acc, i) => acc + i.amount, 0);
    const summaryReasons = Array.from(
      new Set(
        itemsToSave
          .map(i => i.reason ? i.reason.replace(/^[^:]+:\s*/, '').trim() : '')
          .filter(Boolean)
      )
    ).join(', ') || 'Purchase Return';
    const mainProdName = itemsToSave.length === 1 ? itemsToSave[0].productName : `${itemsToSave[0].productName} (+${itemsToSave.length - 1} items)`;

    const returnRecordObj: PurchaseReturn = {
      id: newRetId,
      poRef: newRetPoRef,
      supplier: newRetSupplier,
      date: newRetDate || getTodayFormattedDate(),
      productName: mainProdName,
      itemsCount: totalQty,
      refundValue: totalRefundVal,
      reason: summaryReasons,
      status: newRetStatus,
      items: itemsToSave
    };

    if (editingReturn) {
      // UPDATE EXISTING RETURN RECORD
      const updatedReturns = returns.map(r => r.id === editingReturn.id ? returnRecordObj : r);
      setReturns(updatedReturns);
      try {
        localStorage.setItem('dms_purchase_returns_list', JSON.stringify(updatedReturns));
      } catch (err) {}
      setEditingReturn(null);
      setShowNewReturnModal(false);
      alert(`Purchase Return ${newRetId} updated successfully!`);
    } else {
      // CREATE NEW RETURN RECORD
      const updatedReturns = [returnRecordObj, ...returns];
      setReturns(updatedReturns);
      try {
        localStorage.setItem('dms_purchase_returns_list', JSON.stringify(updatedReturns));
      } catch (err) {}
      setShowNewReturnModal(false);
      alert(`Purchase Return ${newRetId} created successfully!`);
    }

    // Reset Form State
    setNewRetItems([]);
    setRetLineProdName('');
    setRetLineQty(1);
    setRetLineAmount('');
    setRetLineReason('');
    setNewRetId(`RET-2026-${String(returns.length + 2).padStart(3, '0')}`);
    setNewRetDate(getTodayFormattedDate());
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const invAmount = Number(newInvAmount) || 0;
    const invPaid = newInvStatus === 'PAID' ? invAmount : (newInvStatus === 'PARTIAL' ? Math.round(invAmount / 2) : 0);
    const invBal = Math.max(0, invAmount - invPaid);
    const poStat: 'PAID' | 'PARTIAL' | 'PENDING' = newInvStatus === 'PAID' ? 'PAID' : (newInvStatus === 'PARTIAL' ? 'PARTIAL' : 'PENDING');

    const newInvoice: SupplierInvoice = {
      id: newInvNo || generateNextInvoiceNumber(invoices, purchases),
      poRef: newInvPoRef || generateNextPoId(purchases),
      supplier: newInvSupplier,
      issueDate: newInvIssueDate,
      dueDate: newInvDueDate,
      amount: invAmount,
      paidAmount: invPaid,
      balanceDue: invBal,
      status: newInvStatus
    };

    const autoPurchase: PurchaseOrder = {
      id: newInvoice.poRef,
      invoiceNo: newInvoice.id,
      supplier: newInvoice.supplier,
      supplierInitials: newInvoice.supplier.substring(0, 2).toUpperCase(),
      supplierBg: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
      date: newInvoice.issueDate,
      itemsCount: 1,
      gstAmount: Math.round(invAmount * 0.18),
      grandTotal: invAmount,
      status: poStat,
      debit: invPaid,
      balance: invBal
    };

    const nextInvoices = [newInvoice, ...invoices.filter(i => i.id !== newInvoice.id)];
    const nextPurchases = purchases.some(p => p.id === autoPurchase.id || p.invoiceNo === autoPurchase.invoiceNo)
      ? purchases.map(p => (p.id === autoPurchase.id || p.invoiceNo === autoPurchase.invoiceNo) ? {
          ...p,
          status: poStat,
          debit: invPaid,
          balance: invBal
        } : p)
      : [autoPurchase, ...purchases];

    saveAndSyncPurchasesAndInvoices(nextPurchases, nextInvoices);
    setShowNewInvoiceModal(false);

    // Reset Form
    setNewInvNo('');
    setNewInvAmount(1500);
  };

  // Delete Handlers
  const handleDeletePurchase = (id: string) => {
    if (window.confirm(`Are you sure you want to delete purchase order ${id}?`)) {
      const targetP = purchases.find(p => p.id === id);
      const updatedP = purchases.filter(p => p.id !== id);
      const updatedI = invoices.filter(i => i.poRef !== id && (targetP ? i.id !== targetP.invoiceNo : true));
      saveAndSyncPurchasesAndInvoices(updatedP, updatedI);
      alert(`Purchase Order ${id} has been deleted successfully.`);
    }
  };

  const handleDeleteReturn = (id: string) => {
    if (window.confirm(`Are you sure you want to delete return record ${id}?`)) {
      setReturns(returns.filter(r => r.id !== id));
    }
  };

  const handleDeleteInvoice = (id: string) => {
    if (window.confirm(`Are you sure you want to delete invoice ${id}?`)) {
      const targetI = invoices.find(i => i.id === id);
      const updatedI = invoices.filter(i => i.id !== id);
      const updatedP = purchases.filter(p => p.invoiceNo !== id && (targetI ? p.id !== targetI.poRef : true));
      saveAndSyncPurchasesAndInvoices(updatedP, updatedI);
      alert(`Invoice ${id} has been deleted successfully.`);
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
    if (supplierFilter !== 'All' && !p.supplier?.toLowerCase().trim().includes(supplierFilter.toLowerCase().trim())) {
      return false;
    }
    if (statusFilter !== 'All') {
      if (statusFilter === 'PENDING') {
        if (p.status === 'PAID') return false;
      } else if (p.status?.toUpperCase() !== statusFilter.toUpperCase()) {
        return false;
      }
    }
    if (dateRange !== 'All') {
      if (dateRange === 'Today') {
        if (!isTodayPurchase(p.date)) return false;
      } else if (dateRange === 'Last 7 Days') {
        if (!isLast7Days(p.date)) return false;
      } else if (dateRange === 'Oct 01 - Oct 31, 2023') {
        if (!isOct2023(p.date)) return false;
      }
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase().trim();
      const matchItems = p.items?.some(i => i.productName?.toLowerCase().includes(q));
      return (
        p.id?.toLowerCase().includes(q) ||
        p.invoiceNo?.toLowerCase().includes(q) ||
        p.supplier?.toLowerCase().includes(q) ||
        p.remarks?.toLowerCase().includes(q) ||
        Boolean(matchItems)
      );
    }
    return true;
  });

  const filteredReturns = returns.filter(r => {
    if (supplierFilter !== 'All' && !r.supplier?.toLowerCase().trim().includes(supplierFilter.toLowerCase().trim())) {
      return false;
    }
    if (statusFilter !== 'All' && r.status?.toUpperCase() !== statusFilter.toUpperCase()) {
      return false;
    }
    if (dateRange !== 'All') {
      if (dateRange === 'Today') {
        if (!isTodayPurchase(r.date)) return false;
      } else if (dateRange === 'Last 7 Days') {
        if (!isLast7Days(r.date)) return false;
      } else if (dateRange === 'Oct 01 - Oct 31, 2023') {
        if (!isOct2023(r.date)) return false;
      }
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase().trim();
      return (
        r.id?.toLowerCase().includes(q) ||
        r.poRef?.toLowerCase().includes(q) ||
        r.supplier?.toLowerCase().includes(q) ||
        r.reason?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredInvoices = invoices.filter(i => {
    if (supplierFilter !== 'All' && !i.supplier?.toLowerCase().trim().includes(supplierFilter.toLowerCase().trim())) {
      return false;
    }
    if (statusFilter !== 'All') {
      if (statusFilter === 'OUTSTANDING' || statusFilter === 'PENDING' || statusFilter === 'UNPAID') {
        if (i.status === 'PAID') return false;
      } else if (i.status?.toUpperCase() !== statusFilter.toUpperCase()) {
        return false;
      }
    }
    if (dateRange !== 'All') {
      if (dateRange === 'Today') {
        if (!isTodayPurchase(i.issueDate)) return false;
      } else if (dateRange === 'Last 7 Days') {
        if (!isLast7Days(i.issueDate)) return false;
      } else if (dateRange === 'Oct 01 - Oct 31, 2023') {
        if (!isOct2023(i.issueDate)) return false;
      }
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase().trim();
      const matchItems = i.items?.some(item => item.productName?.toLowerCase().includes(q));
      return (
        i.id?.toLowerCase().includes(q) ||
        i.poRef?.toLowerCase().includes(q) ||
        i.supplier?.toLowerCase().includes(q) ||
        Boolean(matchItems)
      );
    }
    return true;
  });

  // --- PAGINATION COMPUTATION ---
  const activeList = subTab === 'overview' ? filteredPurchases : (subTab === 'return' ? filteredReturns : filteredInvoices);
  const totalItems = activeList.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const paginatedPurchases = filteredPurchases.slice(startIndex, endIndex);
  const paginatedReturns = filteredReturns.slice(startIndex, endIndex);
  const paginatedInvoices = filteredInvoices.slice(startIndex, endIndex);

  // --- OVERALL WORKSHOP KPI SUMMARY METRICS (FIXED OVERALL TOTALS THAT DO NOT CHANGE ON TABLE FILTERING) ---
  // Overview Metrics (overall purchases)
  const totalPurchasesCount = purchases.length;
  const todayPurchasesCount = purchases.filter(p => isTodayPurchase(p.date)).length;
  const totalPurchasesValue = purchases.reduce((acc, p) => acc + (p.grandTotal || 0), 0);
  const pendingPaymentsValue = purchases.reduce((acc, p) => {
    const bal = p.balance !== undefined 
      ? p.balance 
      : (p.status === 'PAID' ? 0 : Math.max(0, (p.grandTotal || 0) - (p.debit || 0)));
    return acc + bal;
  }, 0);

  // Invoices Metrics (overall invoices)
  const totalInvoicedValue = invoices.reduce((acc, i) => acc + (i.amount || 0), 0);
  const totalInvoiceAmount = totalInvoicedValue;
  const totalInvoicePaid = invoices.reduce((acc, i) => acc + getPaidAmount(i), 0);
  const totalInvoiceBalance = invoices.reduce((acc, i) => acc + getBalanceDue(i), 0);
  const totalPaidInvoicesCount = invoices.filter(i => i.status === 'PAID').length;
  const totalPendingInvoicesCount = invoices.filter(i => i.status !== 'PAID').length;
  const unpaidInvoicesCount = totalPendingInvoicesCount;
  const totalOverdueInvoicesCount = invoices.filter(i => i.status === 'OVERDUE').length;
  const uniqueSuppliersCount = new Set(invoices.map(i => (i.supplier || '').trim()).filter(Boolean)).size;

  // Returns Metrics (overall returns)
  const totalReturnsCount = returns.length;
  const pendingReturnsCount = returns.filter(r => r.status === 'PENDING').length;
  const totalRefundsValue = returns.filter(r => r.status === 'COMPLETED').reduce((acc, r) => acc + r.refundValue, 0);

  // Supplier Breakdown Data (Ethana supplier ku ethana bill)
  const supplierBillSummary = Array.from(new Set(invoices.map(i => (i.supplier || '').trim()).filter(Boolean))).map(sup => {
    const supInvoices = invoices.filter(i => (i.supplier || '').trim().toLowerCase() === sup.toLowerCase());
    const totalAmt = supInvoices.reduce((a, b) => a + (b.amount || 0), 0);
    const paidAmt = supInvoices.reduce((a, b) => a + getPaidAmount(b), 0);
    const balDue = supInvoices.reduce((a, b) => a + getBalanceDue(b), 0);
    const paidCount = supInvoices.filter(i => i.status === 'PAID').length;
    const pendingCount = supInvoices.filter(i => i.status !== 'PAID').length;
    return {
      supplier: sup,
      totalBills: supInvoices.length,
      paidBills: paidCount,
      pendingBills: pendingCount,
      totalAmount: totalAmt,
      paidAmount: paidAmt,
      balanceDue: balDue
    };
  });

  if (showNewPurchaseModal) {
    let itemsToSave = [...purchaseItems];
    if (quickProdName.trim()) {
      const qty = Number(quickProdQty) || 1;
      const rate = Number(quickProdRate) || 0;
      itemsToSave.push({
        id: 'item-' + Date.now(),
        productName: quickProdName.trim(),
        qty: qty,
        rate: rate,
        gstPercent: quickProdGst
      });
    }

    const calculatedSubtotal = itemsToSave.reduce((acc, item) => acc + (item.qty * item.rate), 0);
    const calculatedGst = itemsToSave.reduce((acc, item) => acc + (item.qty * item.rate * (item.gstPercent / 100)), 0);
    const calculatedGrandTotal = Math.round(calculatedSubtotal + calculatedGst);

    const effectivePaidAmount = newPoPaidAmount === ''
      ? 0
      : Math.max(0, Number(newPoPaidAmount) || 0);

    const calculatedBalanceAmount = Math.max(0, calculatedGrandTotal - effectivePaidAmount);

    const calculatedStatus: 'PAID' | 'PARTIAL' | 'PENDING' =
      calculatedBalanceAmount === 0
        ? 'PAID'
        : (effectivePaidAmount > 0 ? 'PARTIAL' : 'PENDING');

    const handleSavePurchaseOrder = (overrideStatus?: 'PAID' | 'PENDING') => {
      if (itemsToSave.length === 0) {
        alert('Please enter at least one product before saving the purchase.');
        return;
      }

      const finalPaid = overrideStatus === 'PAID'
        ? calculatedGrandTotal
        : (overrideStatus === 'PENDING' ? 0 : effectivePaidAmount);

      const finalBalance = Math.max(0, calculatedGrandTotal - finalPaid);
      const finalStatus: 'PAID' | 'PARTIAL' | 'PENDING' = overrideStatus || (finalBalance === 0 ? 'PAID' : (finalPaid > 0 ? 'PARTIAL' : 'PENDING'));

      const newPurchase: PurchaseOrder = {
        id: newPoId,
        invoiceNo: newPoInvoice || `INV/PUR-${Math.floor(1000 + Math.random() * 9000)}`,
        supplier: newPoSupplier || (activeSuppliersList[0]?.name || 'Supplier'),
        supplierInitials: (newPoSupplier || 'SU').substring(0, 2).toUpperCase(),
        supplierBg: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
        date: newPoDate || getTodayFormattedDate(),
        itemsCount: itemsToSave.reduce((acc, item) => acc + item.qty, 0),
        gstAmount: calculatedGst,
        grandTotal: calculatedGrandTotal,
        status: finalStatus,
        items: itemsToSave,
        paymentMode: newPoPaymentMode,
        debit: finalPaid,
        credit: 0,
        balance: finalBalance,
        remarks: newPoRemarks
      };

      // Auto-generate synced invoice for this purchase in invoices tab
      const autoInvoice: SupplierInvoice = {
        id: newPurchase.invoiceNo,
        poRef: newPurchase.id,
        supplier: newPurchase.supplier,
        issueDate: newPurchase.date,
        dueDate: 'Nov 30, 2026',
        amount: newPurchase.grandTotal,
        paidAmount: finalPaid,
        balanceDue: finalBalance,
        status: finalStatus === 'PAID' ? 'PAID' : (finalStatus === 'PARTIAL' ? 'PARTIAL' : 'UNPAID'),
        items: itemsToSave
      };

      const updatedP = [newPurchase, ...purchases.filter(p => p.id !== newPurchase.id)];
      const updatedI = [autoInvoice, ...invoices.filter(i => i.id !== autoInvoice.id)];

      saveAndSyncPurchasesAndInvoices(updatedP, updatedI);
      
      // Save purchased products to Pending Purchases (without price set)
      addPendingPurchaseItems(itemsToSave, newPurchase.id);

      // Reset Form
      setNewPoInvoice('');
      setPurchaseItems([]);
      setQuickProdName('');
      setQuickProdQty(1);
      setQuickProdRate('');
      setNewPoRemarks('');
      setNewPoAdditionalCharges(0);
      setNewPoDiscount(0);
      setNewPoPaymentMode('Bank Transfer');
      setNewPoPaidAmount('');
      setNewPoDate(getTodayFormattedDate());
      setShowNewPurchaseModal(false);

      alert(`Purchase Order #${newPurchase.id} (${newPurchase.invoiceNo}) saved successfully!\nStatus: ${finalStatus}\nAmount Paid: ₹${finalPaid.toLocaleString('en-IN')}\nBalance Amount: ₹${finalBalance.toLocaleString('en-IN')}`);
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

        {/* Full-Width Stacked Layout */}
        <div className="flex flex-col gap-8 w-full box-border">

          {/* 1. Purchase Information Card (FULL WIDTH) */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col gap-6 w-full box-border">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-base font-extrabold text-slate-800 m-0 flex items-center gap-2 font-heading">
                <span>Purchase Information</span>
              </h3>
              <span className="text-[12px] font-bold text-[#184edb] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                ENTRY ID: #{newPoId}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Supplier select */}
              <div className="flex flex-col gap-1.5 lg:col-span-2">
                <label className="text-[11.5px] font-bold text-slate-400 uppercase tracking-wide">Supplier *</label>
                <select
                  value={newPoSupplier}
                  onChange={(e) => setNewPoSupplier(e.target.value)}
                  className="p-2.5 border border-slate-200 rounded-lg text-[13.5px] font-semibold text-slate-700 bg-white focus:outline-none focus:border-[#184edb]"
                >
                  {activeSuppliersList.map(s => (
                    <option key={s.id || s.name} value={s.name}>{s.name} ({s.id})</option>
                  ))}
                </select>

                {/* Selected Supplier Details Badge */}
                {(() => {
                  const sel = activeSuppliersList.find(s => s.name === newPoSupplier);
                  if (!sel) return null;
                  return (
                    <div className="bg-[#eff6ff] border border-[#d6e4ff] rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-700 mt-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#184edb] text-[13.5px]">{sel.name}</span>
                        <span className="font-mono text-[11px] bg-white px-2.5 py-0.5 rounded-full border border-[#d6e4ff] text-[#184edb] font-bold">
                          {sel.id}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-slate-600 font-semibold text-[12px] flex-wrap">
                        {sel.phone && <span>Ph: {sel.phone}</span>}
                        {sel.gstNumber && sel.gstNumber !== 'N/A' && (
                          <span>GSTIN: <span className="font-mono text-slate-800">{sel.gstNumber}</span></span>
                        )}
                        {sel.outstanding && <span>Outstanding: <span className="text-[#dc2626] font-bold">{sel.outstanding}</span></span>}
                      </div>
                    </div>
                  );
                })()}
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

              {/* Payment Mode */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11.5px] font-bold text-[#184edb] uppercase tracking-wide">Payment Mode *</label>
                <select
                  value={newPoPaymentMode}
                  onChange={(e) => setNewPoPaymentMode(e.target.value)}
                  className="p-2.5 border border-[#184edb]/40 bg-blue-50/20 rounded-lg text-[13.5px] font-bold text-slate-800 focus:outline-none focus:border-[#184edb]"
                >
                  <option value="Bank Transfer">Bank Transfer / NEFT / RTGS</option>
                  <option value="Cash">Cash Payment</option>
                  <option value="UPI">UPI / GPay / PhonePe</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Credit Account">Credit Account / Pay Later</option>
                </select>
              </div>

              {/* Remarks */}
              <div className="flex flex-col gap-1.5 lg:col-span-2">
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

          {/* 2. Product Entry Card (FULL WIDTH) */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col gap-5 w-full box-border">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#184edb] flex items-center justify-center border border-blue-100">
                  <ShoppingBag size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-800 m-0 font-heading">
                    Product Entry
                  </h3>
                  <p className="text-xs text-slate-400 m-0 font-medium">Add products/parts to this purchase order entry</p>
                </div>
              </div>
              <span className="text-[12px] font-bold text-[#184edb] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                {purchaseItems.length} Products Added
              </span>
            </div>

            {/* Fast Product Line Entry Card */}
            <div className="bg-[#f8fafc] border border-slate-200/80 rounded-xl p-4 flex flex-col gap-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-[#184edb] uppercase tracking-wider flex items-center gap-1.5">
                  <Plus size={14} /> Add Product Line
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                {/* Product Name */}
                <div className="sm:col-span-7 flex flex-col gap-1 text-left">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Product Name *</label>
                  <input
                    ref={quickProdNameRef}
                    type="text"
                    list="spare-parts-suggestions"
                    value={quickProdName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setQuickProdName(val);
                      const match = sparePartsInventory.find(
                        p => p.partName.toLowerCase() === val.toLowerCase() || p.partNumber.toLowerCase() === val.toLowerCase()
                      );
                      if (match) {
                        const cleanPrice = parseFloat(match.purchasePrice?.replace(/[^0-9.]/g, '') || '0');
                        if (cleanPrice > 0) setQuickProdRate(cleanPrice);
                        const cleanGst = parseInt(match.gstPercent?.replace(/[^0-9]/g, '') || '18', 10);
                        if (cleanGst > 0) setQuickProdGst(cleanGst);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (!quickProdName.trim()) {
                          alert('Please enter a product name.');
                          return;
                        }
                        quickProdQtyRef.current?.focus();
                        quickProdQtyRef.current?.select();
                      }
                    }}
                    placeholder="Type or select from Spare Parts..."
                    className="p-2.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#184edb] bg-white shadow-2xs"
                  />
                  <datalist id="spare-parts-suggestions">
                    {sparePartsInventory.map((part) => (
                      <option key={part.partNumber} value={part.partName}>
                        {part.partNumber} - {part.partName} (Stock: {part.stock})
                      </option>
                    ))}
                  </datalist>
                </div>

                {/* Quantity */}
                <div className="sm:col-span-3 flex flex-col gap-1 text-left">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Quantity *</label>
                  <input
                    ref={quickProdQtyRef}
                    type="number"
                    min="1"
                    value={quickProdQty}
                    onChange={(e) => setQuickProdQty(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddQuickProduct();
                      }
                    }}
                    placeholder="1"
                    className="p-2.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 text-center focus:outline-none focus:border-[#184edb] bg-white shadow-2xs"
                  />
                </div>

                {/* Add Button */}
                <div className="sm:col-span-2 flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={handleAddQuickProduct}
                    className="h-9.5 bg-[#184edb] hover:bg-[#133eb5] text-white font-bold text-xs rounded-lg border-none cursor-pointer flex items-center justify-center gap-1.5 transition-all shadow-xs"
                  >
                    <Plus size={15} />
                    <span>Add Item</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Clean Table Displaying Added Items */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-500 text-[11px] uppercase tracking-wider font-extrabold">
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4 text-center w-32">Quantity</th>
                    <th className="py-3 px-4 text-center w-20">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[13px]">
                  {purchaseItems.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-slate-400 bg-white">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <ShoppingBag size={26} className="text-slate-300" />
                          <span className="font-semibold text-slate-500 text-sm">No products added yet</span>
                          <span className="text-xs text-slate-400">Fill product details above and click "+ Add Item" to add to this purchase order.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    purchaseItems.map((item, index) => (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 text-center font-bold text-slate-400 text-xs">
                          {index + 1}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-800">
                          {item.productName}
                        </td>
                        <td className="py-3.5 px-4 text-center font-semibold text-slate-700">
                          {item.qty}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg border-none bg-transparent cursor-pointer transition-colors hover:bg-rose-50"
                            title="Delete Item"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {purchaseItems.length > 0 && (
                  <tfoot>
                    <tr className="bg-slate-50/80 border-t-2 border-slate-200 text-xs font-bold text-slate-700">
                      <td colSpan={2} className="py-3 px-4 text-right font-extrabold uppercase tracking-wider text-slate-500">
                        Total Quantity:
                      </td>
                      <td className="py-3 px-4 text-center font-extrabold text-slate-800 text-sm">
                        {purchaseItems.reduce((acc, i) => acc + i.qty, 0)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          {/* 3. Purchase Summary & Payment Settlement Card (FULL WIDTH AT BOTTOM NEAR SAVE) */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col gap-6 w-full box-border">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-800 m-0 flex items-center gap-2 font-heading">
                <span>Purchase Summary & Payment Settlement</span>
              </h3>
              <span className="text-xs font-bold text-slate-500">
                Payment Mode: <strong className="text-[#184edb] font-extrabold">{newPoPaymentMode}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Cost Breakdown */}
              <div className="lg:col-span-5 flex flex-col gap-4 text-[13.5px] font-semibold text-slate-600 bg-slate-50/60 p-5 rounded-xl border border-slate-200/70">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  Cost Breakdown
                </span>

                <div className="flex items-center justify-between">
                  <span>Subtotal:</span>
                  <span className="text-slate-800 font-bold">₹{calculatedSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span>GST Total (Aggregated):</span>
                  <span className="text-slate-800 font-bold">₹{calculatedGst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Right Column: Payment Settlement Cards (Total, Debit/Paid, Balance) */}
              <div className="lg:col-span-7 flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Card 1: Total Amount */}
                  <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex flex-col gap-1 text-left">
                    <span className="text-[10.5px] font-extrabold text-blue-600 uppercase tracking-wider">Total Amount</span>
                    <span className="text-xl font-black text-[#184edb] tracking-tight font-heading">
                      ₹{calculatedGrandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">Grand Total Payable</span>
                  </div>

                  {/* Card 2: Debit / Paid Amount Input */}
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 flex flex-col gap-1.5 text-left">
                    <span className="text-[10.5px] font-extrabold text-emerald-700 uppercase tracking-wider">Debit / Amount Paid (₹)</span>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-extrabold text-emerald-700">₹</span>
                      <input
                        type="number"
                        min="0"
                        max={calculatedGrandTotal}
                        step="any"
                        placeholder="0.00"
                        value={newPoPaidAmount}
                        onChange={(e) => setNewPoPaidAmount(e.target.value)}
                        className="w-full p-1.5 bg-white border border-emerald-200 rounded text-sm font-extrabold text-emerald-800 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    {/* Quick presets */}
                    <div className="flex items-center gap-1 mt-0.5">
                      <button
                        type="button"
                        onClick={() => setNewPoPaidAmount(calculatedGrandTotal)}
                        className="text-[9.5px] font-bold bg-white hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                      >
                        Full Paid
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewPoPaidAmount(Math.round(calculatedGrandTotal / 2))}
                        className="text-[9.5px] font-bold bg-white hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                      >
                        50%
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewPoPaidAmount(0)}
                        className="text-[9.5px] font-bold bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                      >
                        Credit (₹0)
                      </button>
                    </div>
                  </div>

                  {/* Card 3: Balance Amount */}
                  <div className={`border rounded-xl p-4 flex flex-col gap-1 text-left ${
                    calculatedBalanceAmount === 0 
                      ? 'bg-emerald-50/30 border-emerald-200' 
                      : 'bg-rose-50/50 border-rose-100'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-[10.5px] font-extrabold uppercase tracking-wider ${
                        calculatedBalanceAmount === 0 ? 'text-emerald-700' : 'text-rose-600'
                      }`}>Balance Amount</span>
                      <span className={`text-[9.5px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                        calculatedStatus === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800'
                          : calculatedStatus === 'PARTIAL'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {calculatedStatus}
                      </span>
                    </div>
                    <span className={`text-xl font-black tracking-tight font-heading ${
                      calculatedBalanceAmount === 0 ? 'text-emerald-700' : 'text-rose-600'
                    }`}>
                      ₹{calculatedBalanceAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {calculatedBalanceAmount === 0 ? 'Fully Paid & Settled' : 'Credited to Supplier Ledger'}
                    </span>
                  </div>
                </div>

                {/* Alert Info Banner */}
                <div className="bg-[#f0f4ff] border border-[#d6e4ff] rounded-xl p-3 flex gap-2 items-center text-[#184edb]">
                  <span className="flex"><Info size={15} /></span>
                  <p className="m-0 text-[11px] leading-normal text-left font-semibold text-slate-600">
                    Paid Amount (<strong>₹{effectivePaidAmount.toLocaleString('en-IN')}</strong>) is debited, and Balance Amount (<strong>₹{calculatedBalanceAmount.toLocaleString('en-IN')}</strong>) will be recorded as Outstanding in the supplier ledger.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Actions Row */}
        <div className="flex items-center justify-between border-t border-slate-200 pt-6 mt-8">
          <button
            type="button"
            onClick={() => { if (window.confirm('Discard changes and return to purchases list?')) setShowNewPurchaseModal(false); }}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-650 font-bold text-[13.5px] rounded-lg border border-slate-200 shadow-xs cursor-pointer transition-colors"
          >
            <X size={15} />
            <span>Cancel</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleSavePurchaseOrder('PENDING')}
              className="px-5 py-2.5 bg-white border border-[#184edb] hover:bg-blue-50/50 text-[#184edb] font-bold text-[13.5px] rounded-lg cursor-pointer transition-colors"
            >
              Save as Draft / Credit
            </button>
            <button
              type="button"
              onClick={() => handleSavePurchaseOrder()}
              className="px-6 py-2.5 bg-[#184edb] hover:bg-[#133eb5] text-white font-bold text-[13.5px] border-none rounded-lg shadow-md cursor-pointer transition-all flex items-center gap-2"
            >
              <CheckCircle size={16} />
              <span>Save Purchase</span>
            </button>
          </div>
        </div>

      </div>
    );
  }

  const renderInvoiceSheet = (po: PurchaseOrder) => {
    const totalVal = po.grandTotal || 0;
    const paidVal = po.debit !== undefined 
      ? po.debit 
      : (po.credit !== undefined 
        ? po.credit 
        : (po.status === 'PAID' ? totalVal : (po.status === 'PARTIAL' ? Math.round(totalVal / 2) : 0)));
    const balanceVal = po.balance !== undefined 
      ? po.balance 
      : Math.max(0, totalVal - paidVal);
    const statusTag = po.status || (balanceVal === 0 ? 'PAID' : (paidVal > 0 ? 'PARTIAL' : 'PENDING'));

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
              <span>Status: <strong className={statusTag === 'PAID' ? 'text-emerald-600' : statusTag === 'PARTIAL' ? 'text-amber-600' : 'text-rose-600'}>{statusTag}</strong></span>
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
                    <td className="py-2.5 px-4 text-right font-medium">₹{item.rate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="py-2.5 px-4 text-right font-medium text-slate-500">₹{item.gst.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="py-2.5 px-4 text-right font-extrabold text-slate-800">₹{item.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>



        {/* PAYMENT HISTORY & INSTALLMENTS BREAKDOWN ON INVOICE */}
        {(() => {
          const payList: PaymentHistoryItem[] = (po.payments && po.payments.length > 0)
            ? po.payments
            : (paidVal > 0 ? [{ id: 'pay-legacy', date: po.date || 'N/A', amount: paidVal, mode: po.paymentMode || 'Cash', remarks: 'Initial Payment' }] : []);
          
          if (payList.length === 0) return null;

          return (
            <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/70 flex flex-col gap-2 my-1 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-black text-[#184edb] uppercase tracking-wider flex items-center gap-1.5">
                  <History size={13} className="text-[#184edb]" />
                  <span>Payment History & Installments Breakdown</span>
                </span>
                <span className="text-[10px] font-bold text-slate-500">
                  Total Installments Paid: <strong className="text-emerald-700 font-extrabold">₹{paidVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                </span>
              </div>
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-500 text-[9.5px] font-bold uppercase tracking-wider border-b border-slate-200">
                      <th className="py-2 px-3">#</th>
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3">Payment Mode</th>
                      <th className="py-2 px-3 text-right">Amount Paid</th>
                      <th className="py-2 px-3">Remarks / Reference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px] font-semibold text-slate-700">
                    {payList.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-slate-50/40">
                        <td className="py-1.5 px-3 font-bold text-slate-400">{String(idx + 1).padStart(2, '0')}</td>
                        <td className="py-1.5 px-3 font-bold text-slate-800">{item.date}</td>
                        <td className="py-1.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-blue-50 text-blue-700 border border-blue-100">
                            {item.mode || po.paymentMode || 'Cash'}
                          </span>
                        </td>
                        <td className="py-1.5 px-3 text-right font-extrabold text-emerald-700">
                          ₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-1.5 px-3 text-slate-500 text-[10px]">{item.remarks || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()}

        {/* Bottom Instructions and Totals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mt-1">
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

              const numberToWords = (num: number) => {
                const integerPart = Math.floor(num);
                const decimalPart = Math.round((num - integerPart) * 100);
                return `${integerPart.toLocaleString()} and ${decimalPart}/100 Rupees Only`;
              };

              return (
                <div className="flex flex-col gap-2.5 font-semibold text-slate-500 text-xs">
                  <div className="flex items-center justify-between pl-12">
                    <span>Subtotal:</span>
                    <span className="text-slate-800 font-bold">₹{subtotalVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  
                  <div className="flex items-center justify-between pl-12">
                    <span>Total GST:</span>
                    <span className="text-slate-800 font-bold">₹{gstVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>

                  <div className="flex items-center justify-between pl-12 border-t border-slate-100 pt-2 text-[#184edb]">
                    <span className="text-sm font-black uppercase tracking-tight font-heading">Total Amount:</span>
                    <span className="text-lg font-black font-heading">₹{totalVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>

                  <div className="flex items-center justify-between pl-12 text-emerald-700">
                    <span className="text-xs font-bold">Amount Paid (Debit):</span>
                    <span className="text-sm font-extrabold text-emerald-700">₹{paidVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>

                  {/* Amount In Words */}
                  <div className="bg-[#f8fafc] border border-slate-100 rounded-xl p-3 flex flex-col gap-0.5 text-[11px] mt-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider text-right">Amount in Words</span>
                    <p className="m-0 text-slate-700 font-bold leading-normal text-right">
                      {numberToWords(totalVal)}
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

  if (selectedInvoice) {
    const inv = selectedInvoice;
    const paidAmt = getPaidAmount(inv);
    const balDue = getBalanceDue(inv);
    const relatedPurchase = purchases.find(p => p.invoiceNo === inv.id || p.id === inv.poRef);

    // Line items list
    const itemsList = (inv.items && inv.items.length > 0)
      ? inv.items
      : ((relatedPurchase && relatedPurchase.items && relatedPurchase.items.length > 0)
          ? relatedPurchase.items
          : [
              { id: '1', productName: 'Ceramic Brake Pads (Set)', qty: 4, rate: 12500, gstPercent: 18, sku: 'BRK-C-902' },
              { id: '2', productName: 'Synthetic Engine Oil 5W-30', qty: 6, rate: 2400, gstPercent: 18, sku: 'OIL-SYN-5L' },
              { id: '3', productName: 'Premium Oil Filter', qty: 2, rate: 450, gstPercent: 18, sku: 'FLT-O-01' },
              { id: '4', productName: 'Cleaning Service Bundle', qty: 1, rate: 466.10, gstPercent: 18, sku: 'SVC-CLN-X' }
            ]);

    return (
      <div className="flex-1 flex flex-col p-8 bg-[#f8fafc] w-full box-border font-sans min-h-[calc(100vh-64px)] text-left text-slate-700">
        
        {/* Breadcrumbs: Purchase > Invoices History > INV-8847 */}
        <div className="flex items-center gap-2 text-[13px] text-slate-400 font-semibold mb-4">
          <span 
            onClick={() => setSelectedInvoice(null)} 
            className="hover:text-[#184edb] cursor-pointer transition-colors"
          >
            Purchase
          </span>
          <span>&gt;</span>
          <span 
            onClick={() => setSelectedInvoice(null)} 
            className="hover:text-[#184edb] cursor-pointer transition-colors"
          >
            Invoices History
          </span>
          <span>&gt;</span>
          <span className="text-slate-900 font-bold">{inv.id}</span>
        </div>

        {/* Title Header with Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight m-0 font-heading">
              Invoice #{inv.id}
            </h1>
            {inv.status === 'PAID' && (
              <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-600 border border-emerald-200 tracking-wider">
                PAID
              </span>
            )}
            {inv.status === 'PARTIAL' && (
              <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-600 border border-amber-200 tracking-wider uppercase">
                PARTIAL
              </span>
            )}
            {inv.status === 'UNPAID' && (
              <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200 tracking-wider">
                UNPAID
              </span>
            )}
            {inv.status === 'OVERDUE' && (
              <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-rose-50 text-rose-600 border border-rose-200 tracking-wider">
                OVERDUE
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-bold text-[13px] px-4 py-2 rounded-lg border border-slate-200 shadow-sm cursor-pointer transition-all"
            >
              <Printer size={16} className="text-slate-500" />
              <span>Print</span>
            </button>
            <button
              type="button"
              onClick={() => alert(`Downloading PDF for Invoice #${inv.id}`)}
              className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-bold text-[13px] px-4 py-2 rounded-lg border border-slate-200 shadow-sm cursor-pointer transition-all"
            >
              <FileText size={16} className="text-slate-500" />
              <span>PDF</span>
            </button>
            <button
              type="button"
              onClick={() => alert(`Sending Email for Invoice #${inv.id} to ${inv.supplier}`)}
              className="flex items-center gap-2 bg-[#184edb] hover:bg-[#133eb5] text-white font-bold text-[13px] px-4 py-2 rounded-lg shadow-md cursor-pointer transition-all border-none"
            >
              <Mail size={16} />
              <span>Email Invoice</span>
            </button>
          </div>
        </div>

        {/* Top Grid: Summary Card (Left) & Payment Details Card (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          
          {/* Left Card: Summary */}
          <div className="lg:col-span-8 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-base pb-3 border-b border-slate-100 font-heading">
              <Info size={18} className="text-[#184edb]" />
              <span>Summary</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">SUPPLIER</span>
                <span className="text-[14px] font-extrabold text-slate-900">{inv.supplier}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">PO REFERENCE</span>
                <span className="text-[14px] font-extrabold text-[#184edb] hover:underline cursor-pointer">{inv.poRef}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">ISSUE DATE</span>
                <span className="text-[14px] font-extrabold text-slate-800">{inv.issueDate}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">DUE DATE</span>
                <span className="text-[14px] font-extrabold text-slate-800">{inv.dueDate}</span>
              </div>
            </div>
          </div>

          {/* Right Card: Payment Details (Dark Navy Background) */}
          <div className="lg:col-span-4 bg-[#0f172a] text-white rounded-2xl p-6 shadow-md flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[15px] font-bold tracking-tight flex items-center gap-2">
                Payment Details
              </span>
              <Wallet size={18} className="text-slate-400" />
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-[13.5px]">
                <span className="text-slate-400 font-medium">Total Amount</span>
                <span className="font-extrabold text-white">₹{inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex items-center justify-between text-[13.5px]">
                <span className="text-slate-400 font-medium">Paid Amount</span>
                <span className="font-extrabold text-[#10b981]">₹{paidAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              <div className="border-t border-slate-700/80 my-1"></div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">BALANCE DUE</span>
                  <span className="text-2xl font-extrabold text-white">₹{balDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Line Items Section Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-white">
            <h3 className="text-base font-extrabold text-slate-800 m-0 font-heading">Line Items</h3>
            <span className="text-[12.5px] font-bold text-slate-400">{itemsList.length} Items Listed</span>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-[13.5px]">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-400 text-[11px] uppercase tracking-wider font-bold">
                  <th className="py-3.5 px-6">ITEM NAME</th>
                  <th className="py-3.5 px-5 text-center">QTY</th>
                  <th className="py-3.5 px-5 text-right">UNIT PRICE</th>
                  <th className="py-3.5 px-5 text-right">TAX (18%)</th>
                  <th className="py-3.5 px-6 text-right">TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {itemsList.map((item: any, idx: number) => {
                  const qty = item.qty || 1;
                  const rate = item.rate || 0;
                  const itemSubtotal = qty * rate;
                  const gst = itemSubtotal * ((item.gstPercent || 18) / 100);
                  const itemTotal = itemSubtotal + gst;

                  const itemIcons = [
                    <div key="1" className="w-9 h-9 rounded-lg bg-blue-50 text-[#184edb] flex items-center justify-center font-bold text-xs"><ShoppingBag size={18} /></div>,
                    <div key="2" className="w-9 h-9 rounded-lg bg-[#f0f5ff] text-[#184edb] flex items-center justify-center font-bold text-xs"><FileText size={18} /></div>,
                    <div key="3" className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs"><TrendingUp size={18} /></div>,
                    <div key="4" className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs"><CheckCircle size={18} /></div>
                  ];

                  return (
                    <tr key={item.id || idx} className="hover:bg-slate-50/40 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {itemIcons[idx % itemIcons.length]}
                          <div className="flex flex-col">
                            <span className="font-extrabold text-slate-900">{item.productName}</span>
                            <span className="text-[11px] font-semibold text-slate-400">SKU: {item.sku || `SKU-PART-${idx + 101}`}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5 text-center font-extrabold text-slate-800">{qty}</td>
                      <td className="py-4 px-5 text-right font-medium text-slate-700">₹{rate.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="py-4 px-5 text-right font-medium text-slate-500">₹{gst.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="py-4 px-6 text-right font-extrabold text-slate-900">₹{itemTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-[#f0f7ff] border-t border-slate-200 text-slate-900">
                  <td colSpan={4} className="py-4 px-6 text-right font-extrabold text-[13px] uppercase tracking-wider text-slate-500">
                    Grand Total
                  </td>
                  <td className="py-4 px-6 text-right font-extrabold text-xl text-[#184edb]">
                    ₹{inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

      </div>
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
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-[13.5px] px-4.5 py-2.5 rounded-lg border border-slate-200 shadow-sm cursor-pointer transition-all duration-200"
          >
            <Download size={16} className="text-slate-500" />
            <span>Export</span>
          </button>

          {subTab === 'overview' && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all purchase history?')) {
                  saveAndSyncPurchasesAndInvoices([], []);
                }
              }}
              className="flex items-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold text-[13.5px] px-4 py-2.5 rounded-lg border border-rose-200 cursor-pointer transition-all duration-200"
              title="Clear Purchase History"
            >
              <Trash2 size={16} />
              <span>Clear History</span>
            </button>
          )}

          {subTab === 'overview' && (
            <button
              onClick={() => {
                const autoInv = generateNextInvoiceNumber(invoices, purchases);
                const autoPo = generateNextPoId(purchases);
                setNewPoInvoice(autoInv);
                setNewPoId(autoPo);
                setShowNewPurchaseModal(true);
              }}
              className="flex items-center gap-2 bg-[#184edb] hover:bg-[#133eb5] text-white font-semibold text-[13.5px] px-4.5 py-2.5 rounded-lg border-none shadow-md cursor-pointer transition-all duration-200"
            >
              <Plus size={16} />
              <span>New Purchase</span>
            </button>
          )}
          {subTab === 'return' && (
            <button
              onClick={handleStartNewReturn}
              className="flex items-center gap-2 bg-[#184edb] hover:bg-[#133eb5] text-white font-semibold text-[13.5px] px-4.5 py-2.5 rounded-lg border-none shadow-md cursor-pointer transition-all duration-200"
            >
              <Plus size={16} />
              <span>Record Return</span>
            </button>
          )}
          {subTab === 'invoice' && (
            <button
              onClick={() => {
                const autoInv = generateNextInvoiceNumber(invoices, purchases);
                setNewInvNo(autoInv);
                setShowNewInvoiceModal(true);
              }}
              className="flex items-center gap-2 bg-[#184edb] hover:bg-[#133eb5] text-white font-semibold text-[13.5px] px-4.5 py-2.5 rounded-lg border-none shadow-md cursor-pointer transition-all duration-200"
            >
              <Plus size={16} />
              <span>Add Invoice</span>
            </button>
          )}
        </div>
      </div>

      {/* --- SUB-TABS (THREE BOX TABS) BELOW NAVBAR --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

        {/* Tab 1: Overview */}
        <button
          onClick={() => setSubTab('overview')}
          className={`flex items-center gap-3 p-3 px-4 rounded-xl border text-left cursor-pointer transition-all duration-300 relative overflow-hidden group hover:scale-[1.01] hover:shadow-md ${subTab === 'overview'
            ? 'bg-white border-[#184edb] shadow-sm ring-1 ring-[#184edb]/30'
            : 'bg-white border-slate-100 shadow-sm'
            }`}
        >
          <div className={`p-2 rounded-lg ${subTab === 'overview' ? 'bg-[#184edb] text-white' : 'bg-slate-50 text-slate-500 group-hover:bg-[#184edb]/10 group-hover:text-[#184edb]'} transition-colors duration-300`}>
            <ShoppingBag size={18} />
          </div>
          <div className="flex flex-col gap-0.5 z-10">
            <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest">SUB-TAB SELECTION</span>
            <span className="text-base font-bold text-slate-800 tracking-tight">Overview</span>
            <span className="text-xs text-slate-500 font-semibold mt-0.5">
              {totalPurchasesCount.toLocaleString()} Purchases •{' '}
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setSubTab('overview');
                  setStatusFilter(statusFilter === 'PENDING' ? 'All' : 'PENDING');
                  setDateRange('All');
                }}
                className="hover:underline cursor-pointer font-bold text-amber-600 hover:text-amber-700"
                title="Click to filter pending purchases"
              >
                {purchases.filter(p => p.status !== 'PAID').length} Pending
              </span>
            </span>
          </div>
          {subTab === 'overview' && (
            <div className="absolute right-0 top-0 w-1.5 h-full bg-[#184edb]" />
          )}
        </button>

        {/* Tab 2: Return */}
        <button
          onClick={() => setSubTab('return')}
          className={`flex items-center gap-3 p-3 px-4 rounded-xl border text-left cursor-pointer transition-all duration-300 relative overflow-hidden group hover:scale-[1.01] hover:shadow-md ${subTab === 'return'
            ? 'bg-white border-[#184edb] shadow-sm ring-1 ring-[#184edb]/30'
            : 'bg-white border-slate-100 shadow-sm'
            }`}
        >
          <div className={`p-2 rounded-lg ${subTab === 'return' ? 'bg-[#184edb] text-white' : 'bg-slate-50 text-slate-500 group-hover:bg-[#184edb]/10 group-hover:text-[#184edb]'} transition-colors duration-300`}>
            <RotateCcw size={18} />
          </div>
          <div className="flex flex-col gap-0.5 z-10">
            <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest">SUB-TAB SELECTION</span>
            <span className="text-base font-bold text-slate-800 tracking-tight">Returns</span>
            <span className="text-xs text-slate-500 font-semibold mt-0.5">
              {totalReturnsCount} Return Entries •{' '}
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setSubTab('return');
                  setStatusFilter(statusFilter === 'PENDING' ? 'All' : 'PENDING');
                  setDateRange('All');
                }}
                className="hover:underline cursor-pointer font-bold text-amber-600 hover:text-amber-700"
                title="Click to filter pending returns"
              >
                {pendingReturnsCount} Pending Refund
              </span>
            </span>
          </div>
          {subTab === 'return' && (
            <div className="absolute right-0 top-0 w-1.5 h-full bg-[#184edb]" />
          )}
        </button>

        {/* Tab 3: Invoice */}
        <button
          onClick={() => setSubTab('invoice')}
          className={`flex items-center gap-3 p-3 px-4 rounded-xl border text-left cursor-pointer transition-all duration-300 relative overflow-hidden group hover:scale-[1.01] hover:shadow-md ${subTab === 'invoice'
            ? 'bg-white border-[#184edb] shadow-sm ring-1 ring-[#184edb]/30'
            : 'bg-white border-slate-100 shadow-sm'
            }`}
        >
          <div className={`p-2 rounded-lg ${subTab === 'invoice' ? 'bg-[#184edb] text-white' : 'bg-slate-50 text-slate-500 group-hover:bg-[#184edb]/10 group-hover:text-[#184edb]'} transition-colors duration-300`}>
            <FileText size={18} />
          </div>
          <div className="flex flex-col gap-0.5 z-10">
            <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest">SUB-TAB SELECTION</span>
            <span className="text-base font-bold text-slate-800 tracking-tight">Invoices</span>
            <span className="text-xs text-slate-500 font-semibold mt-0.5">
              ₹{totalInvoicedValue.toLocaleString()} Invoiced •{' '}
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setSubTab('invoice');
                  setStatusFilter(statusFilter === 'OUTSTANDING' ? 'All' : 'OUTSTANDING');
                  setDateRange('All');
                }}
                className="hover:underline cursor-pointer font-bold text-amber-600 hover:text-amber-700"
                title="Click to filter unpaid invoices"
              >
                {unpaidInvoicesCount} Unpaid Bills
              </span>
            </span>
          </div>
          {subTab === 'invoice' && (
            <div className="absolute right-0 top-0 w-1.5 h-full bg-[#184edb]" />
          )}
        </button>
      </div>

      {/* --- METRICS CARDS (Changes dynamically according to active tab) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

        {/* Metric 1: Total Purchases / Total Returns / Total Invoices */}
        <div 
          onClick={() => { 
            if (subTab === 'invoice') {
              setShowSupplierBreakdownModal(true);
            } else {
              setStatusFilter('All'); 
              setDateRange('All'); 
            }
          }}
          className={`bg-white rounded-2xl p-6 shadow-sm border flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] ${
            statusFilter === 'All' && (subTab !== 'overview' || dateRange === 'All')
              ? 'border-[#184edb] ring-2 ring-[#184edb]/20 bg-blue-50/20'
              : 'border-slate-100/60 hover:border-slate-300'
          }`}
          title={subTab === 'invoice' ? "Click to view Supplier Bills Breakdown" : "Click to view all"}
        >
          <div className="flex flex-col gap-2">
            <span className="text-[11.5px] font-bold text-slate-400 uppercase tracking-wider">
              {subTab === 'overview' && 'Total Purchases'}
              {subTab === 'return' && 'Total Return Cases'}
              {subTab === 'invoice' && 'Total Supplier Bills'}
            </span>
            <span className="text-3xl font-extrabold text-slate-850 tracking-tight">
              {subTab === 'overview' && totalPurchasesCount.toLocaleString()}
              {subTab === 'return' && totalReturnsCount}
              {subTab === 'invoice' && `${invoices.length} Bills`}
            </span>
            {subTab === 'invoice' && (
              <span className="text-[12px] font-bold text-[#184edb] hover:underline flex items-center gap-1">
                Across {uniqueSuppliersCount} Suppliers • View Breakdown &rarr;
              </span>
            )}
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

        {/* Metric 2: Today's Purchases / Pending Refund Value / Paid Invoices */}
        <div 
          onClick={() => {
            if (subTab === 'overview') {
              setDateRange(dateRange === 'Today' ? 'All' : 'Today');
              setStatusFilter('All');
            } else if (subTab === 'return') {
              setStatusFilter(statusFilter === 'PENDING' ? 'All' : 'PENDING');
            } else if (subTab === 'invoice') {
              setStatusFilter(statusFilter === 'PAID' ? 'All' : 'PAID');
            }
          }}
          className={`bg-white rounded-2xl p-6 shadow-sm border flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] ${
            (subTab === 'overview' && dateRange === 'Today') ||
            (subTab === 'return' && statusFilter === 'PENDING') ||
            (subTab === 'invoice' && statusFilter === 'PAID')
              ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20'
              : 'border-slate-100/60 hover:border-slate-300'
          }`}
          title="Click to view details"
        >
          <div className="flex flex-col gap-2">
            <span className="text-[11.5px] font-bold text-slate-400 uppercase tracking-wider">
              {subTab === 'overview' && "Today's Purchases"}
              {subTab === 'return' && 'Pending Refund Value'}
              {subTab === 'invoice' && 'Paid Invoices (Count & Paid Amt)'}
            </span>
            <span className="text-3xl font-extrabold text-slate-850 tracking-tight">
              {subTab === 'overview' && todayPurchasesCount}
              {subTab === 'return' && `₹${returns.filter(r => r.status === 'PENDING').reduce((acc, r) => acc + r.refundValue, 0).toLocaleString()}`}
              {subTab === 'invoice' && `${totalPaidInvoicesCount} Paid`}
            </span>
            {subTab === 'invoice' && (
              <span className="text-[12px] font-bold text-emerald-600">
                Total Paid: ₹{totalInvoicePaid.toLocaleString()}
              </span>
            )}
          </div>
          <div className="flex flex-col items-end gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar size={20} />
            </div>
            <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold ${
              (subTab === 'overview' && dateRange === 'Today') ||
              (subTab === 'return' && statusFilter === 'PENDING') ||
              (subTab === 'invoice' && statusFilter === 'PAID')
                ? 'bg-blue-50 text-blue-600 border border-blue-100'
                : 'bg-slate-50 text-slate-500'
            }`}>
              {subTab === 'overview' ? 'Today' : 'Active'}
            </span>
          </div>
        </div>

        {/* Metric 3: Total Purchase Value / Completed Refund Value / Outstanding Amount */}
        <div 
          onClick={() => {
            if (subTab === 'overview') {
              setStatusFilter('All');
              setDateRange('All');
            } else if (subTab === 'return') {
              setStatusFilter(statusFilter === 'COMPLETED' ? 'All' : 'COMPLETED');
            } else if (subTab === 'invoice') {
              setStatusFilter(statusFilter === 'OUTSTANDING' ? 'All' : 'OUTSTANDING');
            }
          }}
          className={`bg-white rounded-2xl p-6 shadow-sm border flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] ${
            (subTab === 'return' && statusFilter === 'COMPLETED') ||
            (subTab === 'invoice' && statusFilter === 'OUTSTANDING')
              ? 'border-purple-500 ring-2 ring-purple-500/20 bg-purple-50/20'
              : 'border-slate-100/60 hover:border-slate-300'
          }`}
          title="Click to view details"
        >
          <div className="flex flex-col gap-2">
            <span className="text-[11.5px] font-bold text-slate-400 uppercase tracking-wider">
              {subTab === 'overview' && 'Total Purchase Value'}
              {subTab === 'return' && 'Completed Refund Value'}
              {subTab === 'invoice' && 'Balance Due (Ino Evalo Iruku)'}
            </span>
            <span className="text-3xl font-extrabold text-slate-850 tracking-tight">
              {subTab === 'overview' && `₹${totalPurchasesValue.toLocaleString()}`}
              {subTab === 'return' && `₹${totalRefundsValue.toLocaleString()}`}
              {subTab === 'invoice' && `₹${totalInvoiceBalance.toLocaleString()}`}
            </span>
            {subTab === 'invoice' && (
              <span className="text-[12px] font-bold text-amber-600">
                {totalPendingInvoicesCount} Pending/Partial Bills
              </span>
            )}
          </div>
          <div className="flex flex-col items-end gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
            <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold ${
              (subTab === 'return' && statusFilter === 'COMPLETED') ||
              (subTab === 'invoice' && statusFilter === 'OUTSTANDING')
                ? 'bg-[#8b5cf6]/10 text-[#8b5cf6] border border-[#8b5cf6]/20'
                : 'bg-slate-50 text-slate-500'
            }`}>
              Total Value
            </span>
          </div>
        </div>

        {/* Metric 4: Pending Payments / Rejected Return Cases / Overdue Bills Value */}
        <div 
          onClick={() => {
            if (subTab === 'overview') {
              setStatusFilter(statusFilter === 'PENDING' ? 'All' : 'PENDING');
              setDateRange('All');
            } else if (subTab === 'return') {
              setStatusFilter(statusFilter === 'REJECTED' ? 'All' : 'REJECTED');
            } else if (subTab === 'invoice') {
              setStatusFilter(statusFilter === 'OVERDUE' ? 'All' : 'OVERDUE');
            }
          }}
          className={`bg-white rounded-2xl p-6 shadow-sm border flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] ${
            (subTab === 'overview' && statusFilter === 'PENDING') ||
            (subTab === 'return' && statusFilter === 'REJECTED') ||
            (subTab === 'invoice' && statusFilter === 'OVERDUE')
              ? 'border-amber-400 ring-2 ring-amber-400/30 bg-amber-50/20'
              : 'border-slate-100/60 hover:border-slate-300'
          }`}
          title="Click to filter pending payments"
        >
          <div className="flex flex-col gap-2">
            <span className="text-[11.5px] font-bold text-slate-400 uppercase tracking-wider">
              {subTab === 'overview' && 'Pending Payments'}
              {subTab === 'return' && 'Rejected Return Cases'}
              {subTab === 'invoice' && 'Overdue Bills Value'}
            </span>
            <span className="text-3xl font-extrabold text-slate-850 tracking-tight">
              {subTab === 'overview' && `₹${pendingPaymentsValue.toLocaleString()}`}
              {subTab === 'return' && returns.filter(r => r.status === 'REJECTED').length}
              {subTab === 'invoice' && `₹${invoices.filter(i => i.status === 'OVERDUE').reduce((acc, i) => acc + getBalanceDue(i), 0).toLocaleString()}`}
            </span>
            {subTab === 'invoice' && (
              <span className="text-[12px] font-bold text-rose-600">
                {totalOverdueInvoicesCount} Overdue Bills
              </span>
            )}
          </div>
          <div className="flex flex-col items-end gap-2.5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              (subTab === 'overview' && pendingPaymentsValue > 0) ||
              (subTab === 'return' && returns.filter(r => r.status === 'REJECTED').length > 0) ||
              (subTab === 'invoice' && totalOverdueInvoicesCount > 0)
                ? 'bg-amber-50 text-amber-600'
                : 'bg-slate-50 text-slate-500'
            }`}>
              <AlertCircle size={20} />
            </div>
            <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold ${
              (subTab === 'overview' && statusFilter === 'PENDING') ||
              (subTab === 'return' && statusFilter === 'REJECTED') ||
              (subTab === 'invoice' && statusFilter === 'OVERDUE')
                ? 'bg-amber-100 text-amber-700 border border-amber-200'
                : 'bg-slate-50 text-slate-500'
            }`}>
              {subTab === 'overview' ? (statusFilter === 'PENDING' ? 'Filter Active' : 'Pending') : 'Alert'}
            </span>
          </div>
        </div>

      </div>

      {/* --- SEARCH AND FILTERS CONTAINER --- */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-8 flex flex-col items-start gap-4.5 w-full box-border">
        <div className="flex flex-col md:flex-row items-center gap-4.5 w-full">
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
                className={`py-2.5 px-3.5 border rounded-xl text-[13.5px] font-semibold bg-white focus:outline-none focus:border-[#184edb] cursor-pointer ${
                  statusFilter !== 'All' ? 'border-amber-400 text-amber-700 bg-amber-50/20' : 'border-slate-200 text-slate-700'
                }`}
              >
                <option value="All">All Statuses</option>
                {subTab === 'overview' && (
                  <>
                    <option value="PENDING">PENDING (Pending Payments)</option>
                    <option value="PAID">PAID</option>
                    <option value="PARTIAL">PARTIAL</option>
                  </>
                )}
                {subTab === 'return' && (
                  <>
                    <option value="PENDING">PENDING</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="REJECTED">REJECTED</option>
                  </>
                )}
                {subTab === 'invoice' && (
                  <>
                    <option value="OUTSTANDING">OUTSTANDING (Unpaid / Overdue)</option>
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

        {/* Active Filters Pill Bar */}
        {(statusFilter !== 'All' || supplierFilter !== 'All' || dateRange !== 'All' || searchTerm) && (
          <div className="flex items-center flex-wrap gap-2 pt-3 border-t border-slate-100 w-full text-xs">
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Active Filters:</span>
            {statusFilter !== 'All' && (
              <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-lg font-bold">
                Status: {statusFilter === 'PENDING' ? 'Pending Payments' : statusFilter}
                <button
                  onClick={() => setStatusFilter('All')}
                  className="hover:bg-amber-100 rounded-full p-0.5 border-none bg-transparent cursor-pointer text-amber-700 flex items-center justify-center"
                  title="Remove status filter"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {supplierFilter !== 'All' && (
              <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-lg font-bold">
                Supplier: {supplierFilter}
                <button
                  onClick={() => setSupplierFilter('All')}
                  className="hover:bg-blue-100 rounded-full p-0.5 border-none bg-transparent cursor-pointer text-blue-700 flex items-center justify-center"
                  title="Remove supplier filter"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {dateRange !== 'All' && (
              <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-lg font-bold">
                Date: {dateRange}
                <button
                  onClick={() => setDateRange('All')}
                  className="hover:bg-purple-100 rounded-full p-0.5 border-none bg-transparent cursor-pointer text-purple-700 flex items-center justify-center"
                  title="Remove date filter"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {searchTerm && (
              <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-lg font-bold">
                Search: "{searchTerm}"
                <button
                  onClick={() => setSearchTerm('')}
                  className="hover:bg-slate-200 rounded-full p-0.5 border-none bg-transparent cursor-pointer text-slate-700 flex items-center justify-center"
                  title="Clear search"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSearchTerm('');
                setSupplierFilter('All');
                setStatusFilter('All');
                setDateRange('All');
              }}
              className="text-xs text-[#184edb] hover:underline font-bold bg-transparent border-none cursor-pointer ml-auto"
            >
              Clear All
            </button>
          </div>
        )}
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
                  paginatedPurchases.map((p) => (
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
                        ₹{p.gstAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Grand Total & Paid / Balance breakdown */}
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        {(() => {
                          const rowPaid = p.credit !== undefined && p.credit > 0 
                            ? p.credit 
                            : (p.debit !== undefined && p.debit > 0 && p.debit < p.grandTotal 
                              ? p.debit 
                              : (p.debit !== undefined && p.balance !== undefined 
                                ? Math.max(0, p.grandTotal - p.balance) 
                                : (p.status === 'PAID' ? p.grandTotal : (p.status === 'PARTIAL' ? Math.round(p.grandTotal / 2) : 0))));

                          const rowBalance = p.balance !== undefined 
                            ? p.balance 
                            : Math.max(0, p.grandTotal - rowPaid);

                          return (
                            <div className="flex flex-col text-right">
                              <span className="font-extrabold text-slate-900">
                                ₹{p.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                              <span className="text-[10.5px] font-semibold text-slate-500">
                                Paid: <strong className="text-emerald-600">₹{rowPaid.toLocaleString()}</strong>
                              </span>
                              {(p.status === 'PARTIAL' || p.status === 'PENDING') && (
                                <span className="text-[10.5px] font-semibold text-rose-600">
                                  Bal: <strong>₹{rowBalance.toLocaleString()}</strong>
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5 text-center whitespace-nowrap">
                        {(() => {
                          const rowPaid = p.credit !== undefined && p.credit > 0 
                            ? p.credit 
                            : (p.debit !== undefined && p.debit > 0 && p.debit < p.grandTotal 
                              ? p.debit 
                              : (p.debit !== undefined && p.balance !== undefined 
                                ? Math.max(0, p.grandTotal - p.balance) 
                                : (p.status === 'PAID' ? p.grandTotal : (p.status === 'PARTIAL' ? Math.round(p.grandTotal / 2) : 0))));

                          const rowBalance = p.balance !== undefined 
                            ? p.balance 
                            : Math.max(0, p.grandTotal - rowPaid);

                          return (
                            <>
                              {p.status === 'PAID' && (
                                <div className="flex flex-col items-center gap-0.5">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-extrabold bg-emerald-50 text-emerald-600 border border-emerald-100">
                                    PAID
                                  </span>
                                  <span className="text-[9.5px] font-semibold text-slate-400">
                                    {p.paymentMode || 'Fully Settled'}
                                  </span>
                                </div>
                              )}
                              {p.status === 'PARTIAL' && (
                                <div className="flex flex-col items-center gap-0.5">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-extrabold bg-amber-50 text-amber-600 border border-amber-100">
                                    PARTIAL
                                  </span>
                                  <span className="text-[9.5px] font-bold text-amber-700">
                                    Bal: ₹{rowBalance.toLocaleString()}
                                  </span>
                                </div>
                              )}
                              {p.status === 'PENDING' && (
                                <div className="flex flex-col items-center gap-0.5">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-extrabold bg-rose-50 text-rose-600 border border-rose-100">
                                    PENDING
                                  </span>
                                  <span className="text-[9.5px] font-bold text-rose-600">
                                    Unpaid (₹{rowBalance.toLocaleString()})
                                  </span>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-3.5">
                          <button
                            onClick={() => setSelectedPurchase(p)}
                            className="p-1.5 text-blue-600 hover:text-blue-700 bg-blue-50/80 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200/60 cursor-pointer shadow-2xs"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleStartEditPurchase(p)}
                            className="p-1.5 text-amber-600 hover:text-amber-700 bg-amber-50/80 hover:bg-amber-100 rounded-lg transition-colors border border-amber-200/60 cursor-pointer shadow-2xs"
                            title="Edit Purchase Order"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPurchase(p);
                              setShouldTriggerPrint(true);
                            }}
                            className="p-1.5 text-emerald-600 hover:text-emerald-700 bg-emerald-50/80 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200/60 cursor-pointer shadow-2xs"
                            title="Print"
                          >
                            <Printer size={16} />
                          </button>
                          <button
                            onClick={() => handleDeletePurchase(p.id)}
                            className="p-1.5 text-rose-600 hover:text-rose-700 bg-rose-50/80 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200/60 cursor-pointer shadow-2xs"
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
              {filteredPurchases.length > 0 && (
                <tfoot>
                  <tr className="bg-slate-50/90 border-t-2 border-slate-200 text-xs font-bold text-slate-800">
                    <td colSpan={4} className="py-4 px-6 text-right font-extrabold uppercase tracking-wider text-slate-500">
                      Total Summary ({filteredPurchases.length} Entries):
                    </td>
                    <td className="py-4 px-5 text-center font-extrabold text-slate-800">
                      {filteredPurchases.reduce((acc, p) => acc + p.itemsCount, 0)} Units
                    </td>
                    <td className="py-4 px-5 text-right font-mono text-slate-600 font-bold">
                      ₹{filteredPurchases.reduce((acc, p) => acc + p.gstAmount, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-5 text-right font-mono font-extrabold text-[#184edb]">
                      <div className="flex flex-col text-right">
                        <span>₹{filteredPurchases.reduce((acc, p) => acc + p.grandTotal, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        <span className="text-[10px] font-bold text-emerald-600">
                          Paid: ₹{filteredPurchases.reduce((acc, p) => {
                            const paid = p.credit !== undefined && p.credit > 0 ? p.credit : (p.debit !== undefined ? p.debit : (p.status === 'PAID' ? p.grandTotal : 0));
                            return acc + paid;
                          }, 0).toLocaleString()}
                        </span>
                        <span className="text-[10px] font-bold text-rose-600">
                          Pending: ₹{filteredPurchases.reduce((acc, p) => {
                            const bal = p.balance !== undefined ? p.balance : (p.status === 'PAID' ? 0 : Math.max(0, p.grandTotal - (p.debit || 0)));
                            return acc + bal;
                          }, 0).toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              )}
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
                  paginatedReturns.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/40 transition-colors">

                      {/* ID */}
                      <td className="py-4 px-6 font-bold text-slate-800 whitespace-nowrap">
                        {r.id}
                      </td>

                      {/* PO Ref */}
                      <td className="py-4 px-5 font-semibold text-slate-650 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleViewReturn(r)}
                          className="text-[#184edb] hover:text-[#133eb5] font-bold hover:underline cursor-pointer border-none bg-transparent p-0 text-left inline-flex items-center gap-1 group"
                          title={`Click to view Return details for ${r.poRef}`}
                        >
                          <span>{r.poRef}</span>
                          <ExternalLink size={13} className="opacity-70 group-hover:opacity-100 transition-opacity" />
                        </button>
                      </td>

                      {/* Supplier */}
                      <td className="py-4 px-5 font-bold text-slate-800 whitespace-nowrap">
                        {r.supplier}
                      </td>

                      {/* Return Date */}
                      <td className="py-4 px-5 text-slate-650 font-medium whitespace-nowrap">
                        {r.date || getTodayFormattedDate()}
                      </td>

                      {/* Qty & Product */}
                      <td className="py-4 px-5 text-slate-700 font-semibold text-center whitespace-nowrap">
                        <div className="flex flex-col items-center">
                          <span>{r.itemsCount} Items</span>
                          {r.productName && (
                            <span className="text-[11px] font-bold text-[#184edb]">{r.productName}</span>
                          )}
                        </div>
                      </td>

                      {/* Refund Value */}
                      <td className="py-4 px-5 text-slate-900 text-right font-bold whitespace-nowrap">
                        ₹{r.refundValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      {/* Reason */}
                      <td className="py-4 px-5 text-slate-600 font-medium">
                        {cleanReasonDisplay(r.reason)}
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
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleViewReturn(r)}
                            className="p-2 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100 cursor-pointer"
                            title="View Return Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStartEditReturn(r)}
                            className="p-2 text-amber-600 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors border border-amber-100 cursor-pointer"
                            title="Edit Return"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => alert(`Refund slip for Return: ${r.id}`)}
                            className="p-2 text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 cursor-pointer"
                            title="Print Return Slip"
                          >
                            <Printer size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteReturn(r.id)}
                            className="p-2 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-100 cursor-pointer"
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
            <table className="w-full text-left border-collapse min-w-[1100px]">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-400 text-[11px] uppercase tracking-wider font-bold">
                  <th className="py-4.5 px-6 font-bold">Invoice No</th>
                  <th className="py-4.5 px-5 font-bold">PO Reference</th>
                  <th className="py-4.5 px-5 font-bold">Supplier</th>
                  <th className="py-4.5 px-5 font-bold">Issue Date</th>
                  <th className="py-4.5 px-5 font-bold">Due Date</th>
                  <th className="py-4.5 px-5 text-right font-bold">Total Amount</th>
                  <th className="py-4.5 px-5 text-right font-bold">Paid Amount</th>
                  <th className="py-4.5 px-5 text-right font-bold">Balance Due</th>
                  <th className="py-4.5 px-5 text-center font-bold">Payment Status</th>
                  <th className="py-4.5 px-6 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[14px]">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-10 text-center text-slate-400 font-semibold bg-white">
                      No invoices found matching the filters.
                    </td>
                  </tr>
                ) : (
                  paginatedInvoices.map((i) => {
                    const paidAmt = getPaidAmount(i);
                    const balAmt = getBalanceDue(i);
                    return (
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

                        {/* Total Amount */}
                        <td className="py-4 px-5 text-slate-900 text-right font-bold whitespace-nowrap">
                          ₹{i.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>

                        {/* Paid Amount */}
                        <td className="py-4 px-5 text-emerald-600 text-right font-bold whitespace-nowrap">
                          ₹{paidAmt.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>

                        {/* Balance Due */}
                        <td className={`py-4 px-5 text-right font-bold whitespace-nowrap ${balAmt > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                          ₹{balAmt.toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
                              onClick={() => {
                                setQrPaymentInvoice(i);
                                setCustomPaymentAmount(getBalanceDue(i));
                                setShowQrPaymentModal(true);
                              }}
                              className="p-1.5 text-purple-600 hover:text-purple-700 bg-purple-50/80 hover:bg-purple-100 rounded-lg transition-colors border border-purple-200/60 cursor-pointer shadow-2xs"
                              title="Pay via UPI QR Code"
                            >
                              <QrCode size={16} />
                            </button>
                            <button
                              onClick={() => setSelectedInvoice(i)}
                              className="p-1.5 text-blue-600 hover:text-blue-700 bg-blue-50/80 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200/60 cursor-pointer shadow-2xs"
                              title="View & Edit Invoice Details"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => alert(`Downloading Invoice PDF: ${i.id}`)}
                              className="p-1.5 text-emerald-600 hover:text-emerald-700 bg-emerald-50/80 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200/60 cursor-pointer shadow-2xs"
                              title="Download PDF"
                            >
                              <Download size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteInvoice(i.id)}
                              className="p-1.5 text-rose-600 hover:text-rose-700 bg-rose-50/80 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200/60 cursor-pointer shadow-2xs"
                              title="Delete Invoice"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
              {filteredInvoices.length > 0 && (
                <tfoot>
                  <tr className="bg-slate-50/90 border-t-2 border-slate-200 text-xs font-bold text-slate-800">
                    <td colSpan={5} className="py-4 px-6 text-right font-extrabold uppercase tracking-wider text-slate-500">
                      Total Summary ({filteredInvoices.length} Bills):
                    </td>
                    <td className="py-4 px-5 text-right font-mono font-extrabold text-[#184edb]">
                      ₹{filteredInvoices.reduce((acc, i) => acc + i.amount, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-5 text-right font-mono font-extrabold text-emerald-600">
                      ₹{filteredInvoices.reduce((acc, i) => acc + getPaidAmount(i), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-5 text-right font-mono font-extrabold text-rose-600">
                      ₹{filteredInvoices.reduce((acc, i) => acc + getBalanceDue(i), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              )}
            </table>
          )}

        </div>

        {/* Footer / Interactive Pagination links */}
        <div className="bg-slate-50/70 border-t border-slate-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 w-full box-border text-[13.5px] font-semibold text-slate-500">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span>Show</span>
              <select 
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-slate-200 rounded-lg px-2 py-1 text-[13px] bg-white cursor-pointer focus:outline-none font-bold text-slate-700 shadow-sm"
              >
                <option value={10}>10 entries</option>
                <option value={25}>25 entries</option>
                <option value={50}>50 entries</option>
                <option value={100}>100 entries</option>
              </select>
            </div>
            <span className="text-[13px] text-slate-600 font-medium">
              Showing <strong className="text-slate-900 font-bold">{totalItems === 0 ? 0 : startIndex + 1} - {Math.min(endIndex, totalItems)}</strong> of <strong className="text-slate-900 font-bold">{totalItems}</strong> entries
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button 
              disabled={safeCurrentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className={`w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 transition-all ${
                safeCurrentPage === 1 
                  ? 'bg-slate-100 text-slate-300 cursor-not-allowed border-slate-100' 
                  : 'bg-white hover:bg-slate-50 text-slate-700 cursor-pointer hover:border-slate-300 shadow-sm'
              }`}
              title="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[13px] transition-all cursor-pointer ${
                  safeCurrentPage === page
                    ? 'bg-[#184edb] text-white shadow-md border-none'
                    : 'bg-white border border-slate-200 text-slate-650 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                {page}
              </button>
            ))}

            <button 
              disabled={safeCurrentPage >= totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className={`w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 transition-all ${
                safeCurrentPage >= totalPages 
                  ? 'bg-slate-100 text-slate-300 cursor-not-allowed border-slate-100' 
                  : 'bg-white hover:bg-slate-50 text-slate-700 cursor-pointer hover:border-slate-300 shadow-sm'
              }`}
              title="Next Page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>

      {/* 1. NEW PURCHASE ORDER MODAL */}
      {showNewPurchaseModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 bg-[#184edb] text-white flex items-center justify-between flex-shrink-0">
              <div>
                <span className="font-extrabold text-[17px] block">Create Purchase / Ledger Entry</span>
                <span className="text-xs text-blue-100 font-medium">Record Purchase, Opening Balance, Payment, or Credit Note</span>
              </div>
              <button
                onClick={() => setShowNewPurchaseModal(false)}
                className="text-white/80 hover:text-white border-none bg-transparent cursor-pointer p-1 rounded-lg hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreatePurchaseOrder} className="p-6 flex flex-col gap-5 overflow-y-auto flex-1 box-border">
              
              {/* Ledger Header Fields (TYPE, SUPPLIER, REFERENCE NO, DATE) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50/80 p-4 rounded-xl border border-slate-200/80">
                {/* 1. TYPE */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Type</label>
                  <select
                    value={newPoType}
                    onChange={(e) => setNewPoType(e.target.value as any)}
                    className="p-2.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-[#184edb] bg-white cursor-pointer shadow-sm"
                  >
                    <option value="PURCHASE">PURCHASE</option>
                    <option value="BALANCE">BALANCE (Opening)</option>
                    <option value="PAYMENT">PAYMENT</option>
                    <option value="CREDIT NOTE">CREDIT NOTE</option>
                  </select>
                </div>

                {/* 2. SUPPLIER */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Supplier</label>
                  <select
                    value={newPoSupplier}
                    onChange={(e) => setNewPoSupplier(e.target.value)}
                    className="p-2.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-[#184edb] bg-white cursor-pointer shadow-sm"
                    required
                  >
                    {activeSuppliersList.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>

                {/* 3. REFERENCE NO */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Reference No</label>
                  <input
                    type="text"
                    value={newPoId}
                    onChange={(e) => setNewPoId(e.target.value)}
                    placeholder="PO-2026-0943"
                    className="p-2.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-[#184edb] bg-white shadow-sm"
                    required
                  />
                </div>

                {/* 4. DATE */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Date</label>
                  <input
                    type="date"
                    value={newPoDate}
                    onChange={(e) => setNewPoDate(e.target.value)}
                    className="p-2.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-[#184edb] bg-white shadow-sm"
                    required
                  />
                </div>
              </div>

              {/* Payment Mode, Invoice No & Remarks */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* INVOICE NO */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Invoice No #</label>
                  <input
                    type="text"
                    placeholder="e.g. INV-8842 / huih86452"
                    value={newPoInvoice}
                    onChange={(e) => setNewPoInvoice(e.target.value)}
                    className="p-2.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#184edb] bg-white"
                  />
                </div>

                {/* PAYMENT MODE */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Payment Mode</label>
                  <select
                    value={newPoPaymentMode}
                    onChange={(e) => setNewPoPaymentMode(e.target.value)}
                    className="p-2.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#184edb] bg-white cursor-pointer"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Credit Account">Credit Account</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Adjustment">Adjustment</option>
                  </select>
                </div>

                {/* REMARKS */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Remarks / Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Due in 30 days / Ref: TXN0021"
                    value={newPoRemarks}
                    onChange={(e) => setNewPoRemarks(e.target.value)}
                    className="p-2.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#184edb] bg-white"
                  />
                </div>
              </div>

              {/* Items & Product Description Box */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-extrabold text-slate-600 uppercase tracking-wider">Description & Products</span>
                  <span className="text-[11px] font-semibold text-slate-400">Add products or overall entry description</span>
                </div>

                {/* Overall Description text input */}
                <input
                  type="text"
                  placeholder="General Description (e.g. oil filter x5 @ ₹500, head light x85 @ ₹50)"
                  value={newPoDescription}
                  onChange={(e) => setNewPoDescription(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-semibold bg-white"
                />

                {/* Add Product Items Row */}
                <div className="grid grid-cols-12 gap-2 items-center mt-1">
                  <input
                    ref={quickProdNameRef}
                    type="text"
                    placeholder="Product Name (e.g. Oil Filter)"
                    value={quickProdName}
                    onChange={(e) => setQuickProdName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); quickProdQtyRef.current?.focus(); } }}
                    className="col-span-4 p-2 border border-slate-200 rounded-lg text-xs font-semibold bg-white"
                  />
                  <input
                    ref={quickProdQtyRef}
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={quickProdQty}
                    onChange={(e) => setQuickProdQty(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); quickProdRateRef.current?.focus(); } }}
                    className="col-span-2 p-2 border border-slate-200 rounded-lg text-xs font-semibold bg-white"
                  />
                  <input
                    ref={quickProdRateRef}
                    type="number"
                    min="0"
                    placeholder="Rate (₹)"
                    value={quickProdRate}
                    onChange={(e) => setQuickProdRate(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); quickProdGstRef.current?.focus(); } }}
                    className="col-span-3 p-2 border border-slate-200 rounded-lg text-xs font-semibold bg-white"
                  />
                  <select
                    ref={quickProdGstRef}
                    value={quickProdGst}
                    onChange={(e) => setQuickProdGst(Number(e.target.value))}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddQuickProduct(); } }}
                    className="col-span-2 p-2 border border-slate-200 rounded-lg text-xs font-semibold bg-white"
                  >
                    <option value={5}>5% GST</option>
                    <option value={12}>12% GST</option>
                    <option value={18}>18% GST</option>
                    <option value={28}>28% GST</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddQuickProduct}
                    className="col-span-1 p-2 bg-[#184edb] hover:bg-[#133eb5] text-white rounded-lg cursor-pointer flex items-center justify-center border-none"
                    title="Add Item"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Items Table */}
                {purchaseItems.length > 0 && (
                  <table className="w-full text-left border-collapse text-xs mt-2 bg-white rounded-lg overflow-hidden border border-slate-200">
                    <thead>
                      <tr className="bg-slate-100 text-slate-500 font-bold">
                        <th className="p-2">Product Name</th>
                        <th className="p-2 text-center">Qty</th>
                        <th className="p-2 text-right">Rate</th>
                        <th className="p-2 text-center">GST</th>
                        <th className="p-2 text-right">Total</th>
                        <th className="p-2 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {purchaseItems.map((item) => {
                        const itemSub = item.qty * item.rate;
                        const itemTotal = itemSub + (itemSub * (item.gstPercent / 100));
                        return (
                          <tr key={item.id}>
                            <td className="p-2 font-bold text-slate-800">{item.productName}</td>
                            <td className="p-2 text-center">{item.qty}</td>
                            <td className="p-2 text-right">₹{item.rate.toFixed(2)}</td>
                            <td className="p-2 text-center">{item.gstPercent}%</td>
                            <td className="p-2 text-right font-bold text-slate-900">₹{itemTotal.toFixed(2)}</td>
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(item.id)}
                                className="text-rose-500 hover:bg-rose-50 p-1 rounded border-none cursor-pointer"
                              >
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Financials Ledger Box (DEBIT, CREDIT, BALANCE) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-blue-50/40 p-4 rounded-xl border border-blue-100">
                {/* DEBIT (₹) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider flex items-center justify-between">
                    <span>Debit Amount (₹)</span>
                    <span className="text-[10px] text-slate-400 font-normal">(Bill Total)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={
                      purchaseItems.length > 0 
                        ? purchaseItems.reduce((acc, i) => acc + (i.qty * i.rate * (1 + i.gstPercent/100)), 0)
                        : (newPoAdditionalCharges || '')
                    }
                    onChange={(e) => setNewPoAdditionalCharges(Number(e.target.value))}
                    className="p-2.5 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 bg-white"
                  />
                </div>

                {/* CREDIT (₹) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider flex items-center justify-between">
                    <span>Credit Amount (₹)</span>
                    <span className="text-[10px] text-slate-400 font-normal">(Paid)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={newPoCredit}
                    onChange={(e) => setNewPoCredit(e.target.value)}
                    className="p-2.5 border border-slate-200 rounded-lg text-sm font-bold text-emerald-700 bg-white"
                  />
                </div>

                {/* BALANCE (₹) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                    Balance Outstanding (₹)
                  </label>
                  <div className="p-2.5 border border-slate-200 rounded-lg text-sm font-extrabold text-slate-800 bg-slate-100 flex items-center justify-between">
                    <span>₹{
                      Math.max(0, 
                        (purchaseItems.length > 0 
                          ? purchaseItems.reduce((acc, i) => acc + (i.qty * i.rate * (1 + i.gstPercent/100)), 0)
                          : Number(newPoAdditionalCharges) || 0) - (Number(newPoCredit) || 0)
                      ).toFixed(2)
                    }</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      (Number(newPoCredit) || 0) >= (purchaseItems.length > 0 ? purchaseItems.reduce((acc, i) => acc + (i.qty * i.rate * (1 + i.gstPercent/100)), 0) : Number(newPoAdditionalCharges) || 0)
                        ? 'bg-emerald-100 text-emerald-700'
                        : (Number(newPoCredit) || 0) > 0
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}>
                      {(Number(newPoCredit) || 0) >= (purchaseItems.length > 0 ? purchaseItems.reduce((acc, i) => acc + (i.qty * i.rate * (1 + i.gstPercent/100)), 0) : Number(newPoAdditionalCharges) || 0)
                        ? 'Paid'
                        : (Number(newPoCredit) || 0) > 0
                        ? 'Partial'
                        : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 mt-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setShowNewPurchaseModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-650 font-bold text-[13px] rounded-lg bg-white hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#184edb] hover:bg-[#133eb5] text-white font-bold text-[13px] border-none rounded-lg cursor-pointer shadow-md"
                >
                  Save Entry
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* EDIT PURCHASE ORDER MODAL */}
      {editingPurchase && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 bg-[#184edb] text-white flex items-center justify-between flex-shrink-0">
              <div>
                <span className="font-extrabold text-[17px] block">Edit Purchase / Ledger Entry ({editingPurchase.id})</span>
                <span className="text-xs text-blue-100 font-medium">Modify purchase details, supplier, items, or payment balance</span>
              </div>
              <button
                onClick={() => setEditingPurchase(null)}
                className="text-white/80 hover:text-white border-none bg-transparent cursor-pointer p-1 rounded-lg hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdatePurchaseOrder} className="p-6 flex flex-col gap-5 overflow-y-auto flex-1 box-border">
              
              {/* Ledger Header Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50/80 p-4 rounded-xl border border-slate-200/80">
                {/* TYPE */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Type</label>
                  <select
                    value={editPoType}
                    onChange={(e) => setEditPoType(e.target.value as any)}
                    className="p-2.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-[#184edb] bg-white cursor-pointer shadow-sm"
                  >
                    <option value="PURCHASE">PURCHASE</option>
                    <option value="BALANCE">BALANCE (Opening)</option>
                    <option value="PAYMENT">PAYMENT</option>
                    <option value="CREDIT NOTE">CREDIT NOTE</option>
                  </select>
                </div>

                {/* SUPPLIER */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Supplier</label>
                  <select
                    value={editPoSupplier}
                    onChange={(e) => setEditPoSupplier(e.target.value)}
                    className="p-2.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-[#184edb] bg-white cursor-pointer shadow-sm"
                    required
                  >
                    {activeSuppliersList.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>

                {/* REFERENCE NO */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Reference No</label>
                  <input
                    type="text"
                    value={editPoId}
                    onChange={(e) => setEditPoId(e.target.value)}
                    className="p-2.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-[#184edb] bg-white shadow-sm"
                    required
                  />
                </div>

                {/* DATE */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Date</label>
                  <input
                    type="text"
                    value={editPoDate}
                    onChange={(e) => setEditPoDate(e.target.value)}
                    className="p-2.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-[#184edb] bg-white shadow-sm"
                    required
                  />
                </div>
              </div>

              {/* Payment Mode, Invoice No & Remarks */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* INVOICE NO */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Invoice No #</label>
                  <input
                    type="text"
                    placeholder="e.g. INV-8842"
                    value={editPoInvoice}
                    onChange={(e) => setEditPoInvoice(e.target.value)}
                    className="p-2.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#184edb] bg-white"
                  />
                </div>

                {/* PAYMENT MODE */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Payment Mode</label>
                  <select
                    value={editPoPaymentMode}
                    onChange={(e) => setEditPoPaymentMode(e.target.value)}
                    className="p-2.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#184edb] bg-white cursor-pointer"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Credit Account">Credit Account</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Adjustment">Adjustment</option>
                  </select>
                </div>

                {/* REMARKS */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Remarks / Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Due in 30 days"
                    value={editPoRemarks}
                    onChange={(e) => setEditPoRemarks(e.target.value)}
                    className="p-2.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#184edb] bg-white"
                  />
                </div>
              </div>

              {/* Items & Product Description Box */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-extrabold text-slate-600 uppercase tracking-wider">Description & Products</span>
                  <span className="text-[11px] font-semibold text-slate-400">Add products or edit entry description</span>
                </div>

                {/* Overall Description text input */}
                <input
                  type="text"
                  placeholder="General Description"
                  value={editPoDescription}
                  onChange={(e) => setEditPoDescription(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-semibold bg-white"
                />

                {/* Add Product Items Row */}
                <div className="grid grid-cols-12 gap-2 items-center mt-1">
                  <input
                    ref={editQuickProdNameRef}
                    type="text"
                    placeholder="Product Name"
                    value={editQuickProdName}
                    onChange={(e) => setEditQuickProdName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); editQuickProdQtyRef.current?.focus(); } }}
                    className="col-span-4 p-2 border border-slate-200 rounded-lg text-xs font-semibold bg-white"
                  />
                  <input
                    ref={editQuickProdQtyRef}
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={editQuickProdQty}
                    onChange={(e) => setEditQuickProdQty(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); editQuickProdRateRef.current?.focus(); } }}
                    className="col-span-2 p-2 border border-slate-200 rounded-lg text-xs font-semibold bg-white"
                  />
                  <input
                    ref={editQuickProdRateRef}
                    type="number"
                    min="0"
                    placeholder="Rate (₹)"
                    value={editQuickProdRate}
                    onChange={(e) => setEditQuickProdRate(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); editQuickProdGstRef.current?.focus(); } }}
                    className="col-span-3 p-2 border border-slate-200 rounded-lg text-xs font-semibold bg-white"
                  />
                  <select
                    ref={editQuickProdGstRef}
                    value={editQuickProdGst}
                    onChange={(e) => setEditQuickProdGst(Number(e.target.value))}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddEditQuickProduct(); } }}
                    className="col-span-2 p-2 border border-slate-200 rounded-lg text-xs font-semibold bg-white"
                  >
                    <option value={5}>5% GST</option>
                    <option value={12}>12% GST</option>
                    <option value={18}>18% GST</option>
                    <option value={28}>28% GST</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddEditQuickProduct}
                    className="col-span-1 p-2 bg-[#184edb] hover:bg-[#133eb5] text-white rounded-lg cursor-pointer flex items-center justify-center border-none"
                    title="Add Item"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Items Table */}
                {editPurchaseItems.length > 0 && (
                  <table className="w-full text-left border-collapse text-xs mt-2 bg-white rounded-lg overflow-hidden border border-slate-200">
                    <thead>
                      <tr className="bg-slate-100 text-slate-500 font-bold">
                        <th className="p-2">Product Name</th>
                        <th className="p-2 text-center">Qty</th>
                        <th className="p-2 text-right">Rate</th>
                        <th className="p-2 text-center">GST</th>
                        <th className="p-2 text-right">Total</th>
                        <th className="p-2 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {editPurchaseItems.map((item) => {
                        const itemSub = (Number(item.qty) || 0) * (Number(item.rate) || 0);
                        const itemTotal = itemSub + (itemSub * ((Number(item.gstPercent) || 0) / 100));
                        return (
                          <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-2 font-bold text-slate-800">{item.productName}</td>
                            <td className="p-2 text-center">
                              <input
                                type="number"
                                min="1"
                                value={item.qty}
                                onChange={(e) => {
                                  const newQty = Math.max(1, Number(e.target.value) || 1);
                                  setEditPurchaseItems(prev => prev.map(i => i.id === item.id ? { ...i, qty: newQty } : i));
                                }}
                                className="w-16 p-1 border border-slate-200 rounded text-center text-xs font-semibold focus:outline-none focus:border-[#184edb]"
                              />
                            </td>
                            <td className="p-2 text-right">
                              <div className="relative flex items-center justify-end">
                                <span className="text-slate-400 text-xs mr-0.5 font-bold">₹</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={item.rate === 0 ? '' : item.rate}
                                  placeholder="0.00"
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const newRate = val === '' ? 0 : (parseFloat(val) || 0);
                                    setEditPurchaseItems(prev => prev.map(i => i.id === item.id ? { ...i, rate: newRate } : i));
                                  }}
                                  className="w-24 p-1 border border-slate-200 rounded text-right text-xs font-bold text-slate-800 focus:outline-none focus:border-[#184edb]"
                                />
                              </div>
                            </td>
                            <td className="p-2 text-center">
                              <select
                                value={item.gstPercent}
                                onChange={(e) => {
                                  const newGst = Number(e.target.value) || 0;
                                  setEditPurchaseItems(prev => prev.map(i => i.id === item.id ? { ...i, gstPercent: newGst } : i));
                                }}
                                className="p-1 border border-slate-200 rounded text-center text-xs font-bold text-slate-700 focus:outline-none focus:border-[#184edb] bg-white cursor-pointer"
                              >
                                <option value={0}>0%</option>
                                <option value={5}>5%</option>
                                <option value={12}>12%</option>
                                <option value={18}>18%</option>
                                <option value={28}>28%</option>
                              </select>
                            </td>
                            <td className="p-2 text-right font-bold text-slate-900">₹{itemTotal.toFixed(2)}</td>
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveEditItem(item.id)}
                                className="text-rose-500 hover:bg-rose-50 p-1 rounded border-none cursor-pointer"
                              >
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Financials Ledger Box & Payment History Breakdown */}
              {(() => {
                const calculatedItemsTotal = editPurchaseItems.reduce((acc, i) => acc + (i.qty * (Number(i.rate) || 0) * (1 + (Number(i.gstPercent) || 0)/100)), 0);
                const totalVal = calculatedItemsTotal > 0 
                  ? Math.round(calculatedItemsTotal + Number(editPoAdditionalCharges || 0) - Number(editPoDiscount || 0))
                  : (Number(editPoAdditionalCharges) || editingPurchase.grandTotal);
                
                const pastPayments = editingPurchase.payments || [];
                const pastPaidTotal = pastPayments.reduce((acc, p) => acc + p.amount, 0);
                const paidNowVal = Number(editPoCredit) || 0;
                const cumPaidVal = pastPaidTotal + paidNowVal;
                const balVal = Math.max(0, totalVal - cumPaidVal);
                const statusTag = balVal === 0 ? 'PAID' : (cumPaidVal > 0 ? 'PARTIAL' : 'PENDING');

                return (
                  <div className="flex flex-col gap-4">
                    {/* Financials Summary Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-blue-50/40 p-4 rounded-xl border border-blue-100">
                      {/* 1. Total Amount (Grand Total) */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider flex items-center justify-between">
                          <span>Total Amount (₹)</span>
                          <span className="text-[10px] text-slate-400 font-normal">(Grand Total)</span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={totalVal}
                          onChange={(e) => setEditPoAdditionalCharges(Number(e.target.value))}
                          className="p-2.5 border border-slate-200 rounded-lg text-sm font-bold text-[#184edb] bg-white"
                        />
                      </div>

                      {/* 2. Amount Paid Now (Current Installment) */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-extrabold text-emerald-700 uppercase tracking-wider flex items-center justify-between">
                          <span>Amount Paid Now (₹)</span>
                          <span className="text-[10px] text-emerald-600 font-bold">(Current Installment)</span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Enter amount to pay now..."
                          value={editPoCredit}
                          onChange={(e) => setEditPoCredit(e.target.value)}
                          className="p-2.5 border border-emerald-300 rounded-lg text-sm font-bold text-emerald-800 bg-white focus:outline-none focus:border-emerald-500 shadow-sm"
                        />
                        {/* Presets */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              const rem = Math.max(0, totalVal - pastPaidTotal);
                              setEditPoCredit(rem);
                            }}
                            className="text-[9.5px] font-bold bg-white hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded cursor-pointer"
                          >
                            Full Remaining (₹{Math.max(0, totalVal - pastPaidTotal).toFixed(2)})
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const rem = Math.max(0, totalVal - pastPaidTotal);
                              setEditPoCredit(Math.round(rem / 2));
                            }}
                            className="text-[9.5px] font-bold bg-white hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded cursor-pointer"
                          >
                            50% Balance
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditPoCredit(0)}
                            className="text-[9.5px] font-bold bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 px-1.5 py-0.5 rounded cursor-pointer"
                          >
                            Clear (₹0)
                          </button>
                        </div>
                      </div>

                      {/* 3. Balance Remaining (₹) */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider flex items-center justify-between">
                          <span>Balance Amount (₹)</span>
                          <span className={`text-[9.5px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                            statusTag === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800'
                              : statusTag === 'PARTIAL'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {statusTag}
                          </span>
                        </label>
                        <div className={`p-2.5 border rounded-lg text-sm font-extrabold flex items-center justify-between ${
                          balVal === 0 ? 'bg-emerald-50/50 border-emerald-200 text-emerald-700' : 'bg-rose-50/50 border-rose-200 text-rose-700'
                        }`}>
                          <span>₹{balVal.toFixed(2)}</span>
                          <span className="text-[10px] font-bold">
                            {balVal === 0 ? 'Fully Settled' : 'Unpaid Credit'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Payment History Breakdown inside Edit Purchase Modal */}
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                          <History size={16} className="text-[#184edb]" />
                          <span>Payment History Breakdown ({pastPayments.length})</span>
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500">
                          Total Paid to Date: <strong className="text-emerald-700 font-extrabold">₹{pastPaidTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                        </span>
                      </div>

                      {pastPayments.length > 0 ? (
                        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                                <th className="p-2.5">Date</th>
                                <th className="p-2.5">Payment Mode</th>
                                <th className="p-2.5 text-right">Amount Paid (₹)</th>
                                <th className="p-2.5">Remarks</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                              {pastPayments.map((pay, idx) => (
                                <tr key={pay.id || idx} className="hover:bg-slate-50/50">
                                  <td className="p-2.5 font-bold text-slate-800">{pay.date}</td>
                                  <td className="p-2.5">
                                    <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-100">
                                      {pay.mode || 'Cash'}
                                    </span>
                                  </td>
                                  <td className="p-2.5 text-right font-extrabold text-emerald-700">
                                    ₹{pay.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </td>
                                  <td className="p-2.5 text-slate-500 text-[11px]">{pay.remarks || '-'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="p-3 text-center text-xs text-slate-400 font-medium bg-white rounded-lg border border-dashed border-slate-200">
                          No past payment history recorded yet. Enter an amount in "Amount Paid Now" to record a payment installment.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 mt-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingPurchase(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-650 font-bold text-[13px] rounded-lg bg-white hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#184edb] hover:bg-[#133eb5] text-white font-bold text-[13px] border-none rounded-lg cursor-pointer shadow-md"
                >
                  Update Entry
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 2. RECORD / EDIT RETURN MODAL (MULTI-PRODUCT ITEM ENTRY WITH PER-ITEM REASON & AMOUNT) */}
      {showNewReturnModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 my-6 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#184edb] text-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                  <RotateCcw size={18} />
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-extrabold text-base">
                    {editingReturn ? `Edit Purchase Return (${editingReturn.id})` : 'Record Purchase Return'}
                  </span>
                  <span className="text-[11.5px] text-blue-100 font-medium">
                    {editingReturn ? 'Update returned products, reasons, quantities and amounts' : 'Add returned products with individual reasons and amounts'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowNewReturnModal(false);
                  setEditingReturn(null);
                }}
                className="text-white/80 hover:text-white border-none bg-transparent cursor-pointer p-1"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateReturn} className="p-6 flex flex-col gap-5 overflow-y-auto box-border">

              {/* Header Info Section (Return ID, Supplier, PO Ref, Return Date, Refund Status) */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-5 gap-3 text-left">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Return ID</label>
                  <input
                    type="text"
                    value={newRetId}
                    className="p-2 border border-slate-200 rounded-lg text-xs font-bold bg-white text-slate-700 cursor-not-allowed"
                    readOnly
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Supplier *</label>
                  <select
                    value={newRetSupplier}
                    onChange={(e) => {
                      const selectedSup = e.target.value;
                      setNewRetSupplier(selectedSup);
                      const matchingPo = purchases.find(p => p.supplier === selectedSup);
                      if (matchingPo) {
                        setNewRetPoRef(matchingPo.id);
                      }
                    }}
                    className="p-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-[#184edb]"
                  >
                    {suppliersList.filter(s => s !== 'All').map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">PO Reference *</label>
                  <select
                    value={newRetPoRef}
                    onChange={(e) => setNewRetPoRef(e.target.value)}
                    className="p-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-[#184edb]"
                  >
                    {purchases
                      .filter(p => !newRetSupplier || p.supplier === newRetSupplier)
                      .map(p => (
                        <option key={p.id} value={p.id}>{p.id}</option>
                      ))}
                    {purchases.filter(p => !newRetSupplier || p.supplier === newRetSupplier).length === 0 && (
                      <option value={newRetPoRef}>{newRetPoRef}</option>
                    )}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Return Date *</label>
                  <input
                    type="text"
                    value={newRetDate}
                    onChange={(e) => setNewRetDate(e.target.value)}
                    placeholder="e.g. Jul 30, 2026"
                    className="p-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-[#184edb]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Refund Status</label>
                  <select
                    value={newRetStatus}
                    onChange={(e) => setNewRetStatus(e.target.value as any)}
                    className="p-2 border border-slate-200 rounded-lg text-xs font-extrabold text-amber-700 bg-amber-50/50 focus:outline-none focus:border-[#184edb]"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>
              </div>

              {/* Product Return Line Entry Box */}
              {(() => {
                const selectedPoForReturn = purchases.find(p => p.id === newRetPoRef);
                const poReturnItems = selectedPoForReturn?.items || [];

                return (
                  <div className="bg-[#f8fafc] border border-blue-100 rounded-xl p-4 flex flex-col gap-3 shadow-2xs text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold text-[#184edb] uppercase tracking-wider flex items-center gap-1.5">
                        <Plus size={14} /> Add Product Return Line Item
                      </span>
                      {poReturnItems.length > 0 && (
                        <span className="text-[11px] font-bold text-slate-500">
                          {poReturnItems.length} Products in PO #{newRetPoRef}
                        </span>
                      )}
                    </div>

                    {/* Quick Selection Pills for Products Purchased under selected PO */}
                    {poReturnItems.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 bg-blue-50/70 p-2.5 rounded-lg border border-blue-100">
                        <span className="text-[10px] font-extrabold text-[#184edb] uppercase tracking-wider">
                          Click to select items bought in {newRetPoRef}:
                        </span>
                        {poReturnItems.map((item, idx) => (
                          <button
                            key={`po-item-btn-${idx}`}
                            type="button"
                            onClick={() => {
                              const isDuplicate = newRetItems.some(
                                i => i.productName.toLowerCase() === item.productName.toLowerCase()
                              );
                              if (isDuplicate) {
                                alert(`Product "${item.productName}" is already added to this return record.`);
                                return;
                              }
                              setRetLineProdName(item.productName);
                              setRetLineQty(item.qty);
                              const totalVal = Math.round(item.qty * item.rate * (1 + (item.gstPercent || 0) / 100));
                              setRetLineAmount(totalVal);
                              setTimeout(() => {
                                retReasonRef.current?.focus();
                              }, 50);
                            }}
                            className="text-[11.5px] font-bold bg-white text-slate-800 hover:bg-[#184edb] hover:text-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs transition-all cursor-pointer flex items-center gap-1"
                            title={`Click to fill ${item.productName}`}
                          >
                            <span>+ {item.productName}</span>
                            <span className="text-[10px] opacity-80">({item.qty} Qty • ₹{item.rate})</span>
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                      {/* Product Name */}
                      <div className="sm:col-span-4 flex flex-col gap-1">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Product Name / Part *</label>
                        <input
                          ref={retProdNameRef}
                          type="text"
                          list="po-return-suggestions"
                          value={retLineProdName}
                          onChange={(e) => {
                            const val = e.target.value;
                            setRetLineProdName(val);

                            // Check PO items match first
                            const poMatch = poReturnItems.find(i => i.productName.toLowerCase() === val.toLowerCase());
                            if (poMatch) {
                              setRetLineQty(poMatch.qty);
                              const totalVal = Math.round(poMatch.qty * poMatch.rate * (1 + (poMatch.gstPercent || 0) / 100));
                              setRetLineAmount(totalVal);
                              return;
                            }

                            // Check general inventory match
                            const match = sparePartsInventory.find(
                              p => p.partName.toLowerCase() === val.toLowerCase() || p.partNumber.toLowerCase() === val.toLowerCase()
                            );
                            if (match) {
                              const cleanPrice = parseFloat(match.purchasePrice?.replace(/[^0-9.]/g, '') || '0');
                              if (cleanPrice > 0) setRetLineAmount(cleanPrice);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              retQtyRef.current?.focus();
                            }
                          }}
                          placeholder="Type or select purchased product..."
                          className="p-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#184edb] bg-white"
                        />
                        <datalist id="po-return-suggestions">
                          {poReturnItems.map((item, idx) => (
                            <option key={`po-sug-${idx}`} value={item.productName}>
                              [PO {newRetPoRef}] {item.productName} ({item.qty} Purchased @ ₹{item.rate})
                            </option>
                          ))}
                          {sparePartsInventory.map((part) => (
                            <option key={`sp-sug-${part.partNumber}`} value={part.partName}>
                              {part.partNumber} - {part.partName} (Stock: {part.stock})
                            </option>
                          ))}
                        </datalist>
                      </div>

                      {/* Qty */}
                      <div className="sm:col-span-2 flex flex-col gap-1">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Qty *</label>
                        <input
                          ref={retQtyRef}
                          type="number"
                          min="1"
                          value={retLineQty}
                          onChange={(e) => setRetLineQty(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              retAmtRef.current?.focus();
                            }
                          }}
                          className="p-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 text-center focus:outline-none focus:border-[#184edb] bg-white"
                        />
                      </div>

                      {/* Refund Amount */}
                      <div className="sm:col-span-2 flex flex-col gap-1">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Amount (₹) *</label>
                        <input
                          ref={retAmtRef}
                          type="number"
                          min="0"
                          step="any"
                          value={retLineAmount}
                          onChange={(e) => setRetLineAmount(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              retReasonRef.current?.focus();
                            }
                          }}
                          placeholder="Refund ₹"
                          className="p-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 text-right focus:outline-none focus:border-[#184edb] bg-white"
                        />
                      </div>

                      {/* Reason for Return */}
                      <div className="sm:col-span-3 flex flex-col gap-1">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Reason *</label>
                        <input
                          ref={retReasonRef}
                          type="text"
                          value={retLineReason}
                          onChange={(e) => setRetLineReason(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddReturnLineItem();
                            }
                          }}
                          placeholder="e.g. Defective / Damaged"
                          className="p-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-[#184edb] bg-white"
                        />
                      </div>

                      {/* Add Button */}
                      <div className="sm:col-span-1 flex flex-col">
                        <button
                          type="button"
                          onClick={handleAddReturnLineItem}
                          className="p-2 bg-[#184edb] hover:bg-[#133eb5] text-white font-bold text-xs rounded-lg border-none cursor-pointer transition-colors shadow-2xs flex items-center justify-center h-[34px]"
                          title="Add Item"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                </div>
              </div>
            );
          })()}

              {/* Added Returned Products Table */}
              <div className="flex flex-col gap-2 text-left">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                    Returned Products List ({newRetItems.length} Added)
                  </span>
                  <span className="text-xs font-extrabold text-[#184edb]">
                    Total Refund: ₹{(newRetItems.reduce((acc, i) => acc + i.amount, 0) + (Number(retLineAmount) || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs bg-white">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                        <th className="py-2.5 px-3.5 text-center w-8">#</th>
                        <th className="py-2.5 px-4 font-bold">Product Name</th>
                        <th className="py-2.5 px-3 text-center font-bold">Qty</th>
                        <th className="py-2.5 px-4 font-bold">Reason for Return</th>
                        <th className="py-2.5 px-4 text-right font-bold">Refund Amount</th>
                        <th className="py-2.5 px-3 text-center w-10">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {newRetItems.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-slate-400 font-medium italic bg-slate-50/40">
                            No product return line items added yet. Fill above fields &amp; click "+" button.
                          </td>
                        </tr>
                      ) : (
                        newRetItems.map((item, idx) => (
                          <tr key={item.id} className="hover:bg-slate-50/60">
                            <td className="py-2.5 px-3.5 text-center font-bold text-slate-400">{idx + 1}</td>
                            <td className="py-2.5 px-4 font-bold text-slate-800">{item.productName}</td>
                            <td className="py-2.5 px-3 text-center font-semibold text-slate-700">{item.qty}</td>
                            <td className="py-2.5 px-4 text-slate-600 font-medium">
                              <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded text-[11px] font-bold border border-rose-100">
                                {item.reason}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-right font-extrabold text-[#184edb] font-mono">
                              ₹{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveReturnLineItem(item.id)}
                                className="text-slate-400 hover:text-rose-600 p-1 rounded-md border-none bg-transparent cursor-pointer transition-colors"
                                title="Remove item"
                              >
                                <Trash2 size={15} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    {newRetItems.length > 0 && (
                      <tfoot>
                        <tr className="bg-slate-50 font-bold border-t border-slate-200 text-slate-800 text-xs">
                          <td colSpan={2} className="py-2.5 px-4 text-right uppercase tracking-wider font-extrabold text-slate-500">
                            Grand Total:
                          </td>
                          <td className="py-2.5 px-3 text-center font-extrabold text-slate-800">
                            {newRetItems.reduce((acc, i) => acc + i.qty, 0)} Items
                          </td>
                          <td></td>
                          <td className="py-2.5 px-4 text-right font-mono font-black text-sm text-[#184edb]">
                            ₹{newRetItems.reduce((acc, i) => acc + i.amount, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewReturnModal(false);
                    setEditingReturn(null);
                  }}
                  className="px-4 py-2 border border-slate-200 text-slate-650 font-semibold text-[13px] rounded-lg bg-white hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#184edb] hover:bg-[#133eb5] text-white font-bold text-[13px] border-none rounded-lg cursor-pointer transition-colors shadow-md flex items-center gap-2"
                >
                  <CheckCircle size={16} />
                  <span>{editingReturn ? 'Update Purchase Return Record' : 'Save Purchase Return Record'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* VIEW RETURN DETAILS MODAL */}
      {viewingReturn && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 my-6 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#184edb] text-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                  <Eye size={20} />
                </div>
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-lg tracking-tight">Return Details - {viewingReturn.id}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wide ${
                      viewingReturn.status === 'COMPLETED' ? 'bg-emerald-400/20 text-emerald-100 border border-emerald-300/30' :
                      viewingReturn.status === 'PENDING' ? 'bg-amber-400/20 text-amber-100 border border-amber-300/30' :
                      'bg-rose-400/20 text-rose-100 border border-rose-300/30'
                    }`}>
                      {viewingReturn.status}
                    </span>
                  </div>
                  <span className="text-[12px] text-blue-100 font-medium">
                    PO Ref: {viewingReturn.poRef} • Supplier: {viewingReturn.supplier}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const retToEdit = viewingReturn;
                    setViewingReturn(null);
                    handleStartEditReturn(retToEdit);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-lg border border-white/20 transition-colors cursor-pointer"
                  title="Edit Return"
                >
                  <Pencil size={14} />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingReturn(null)}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer border-none"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
              
              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <div className="bg-white p-3 rounded-lg border border-slate-200/60 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Supplier</span>
                  <span className="text-sm font-bold text-slate-800 mt-0.5 block truncate" title={viewingReturn.supplier}>
                    {viewingReturn.supplier}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200/60 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">PO Ref No.</span>
                  <span className="text-sm font-bold text-[#184edb] mt-0.5 block">
                    {viewingReturn.poRef}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200/60 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Purchase Date</span>
                  <span className="text-sm font-bold text-slate-700 mt-0.5 block">
                    {viewingReturn.purchaseDate || purchases.find(p => p.id.toLowerCase() === (viewingReturn.poRef || '').toLowerCase())?.date || 'N/A'}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200/60 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Return Date</span>
                  <span className="text-sm font-bold text-slate-700 mt-0.5 block">
                    {viewingReturn.date || getTodayFormattedDate()}
                  </span>
                </div>
              </div>

              {/* Reason Banner if available */}
              {viewingReturn.reason && (
                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3.5 flex items-start gap-2.5">
                  <Info size={16} className="text-[#184edb] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-slate-700 block">Overall Return Reason</span>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">{viewingReturn.reason}</p>
                  </div>
                </div>
              )}

              {/* Products Returned Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                    Returned Products ({viewingReturn.items?.length || (viewingReturn.itemsCount || 1)})
                  </h4>
                  <span className="text-xs font-bold text-slate-500">
                    Total Qty: {viewingReturn.items?.reduce((s, i) => s + (Number(i.qty) || 0), 0) || viewingReturn.itemsCount || 1}
                  </span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100/80 text-slate-600 font-bold border-b border-slate-200 uppercase text-[11px] tracking-wider">
                        <th className="py-3 px-4">#</th>
                        <th className="py-3 px-4">Product Name</th>
                        <th className="py-3 px-4 text-center">Qty</th>
                        <th className="py-3 px-4 text-right">Amount</th>
                        <th className="py-3 px-4">Reason</th>
                        <th className="py-3 px-4 text-center">Refund Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(() => {
                        const displayItems = viewingReturn.items && viewingReturn.items.length > 0
                          ? viewingReturn.items
                          : [{
                              id: '1',
                              productName: viewingReturn.productName || 'Returned Component / Part',
                              qty: viewingReturn.itemsCount || 1,
                              amount: viewingReturn.refundValue || 0,
                              reason: viewingReturn.reason || 'Defective'
                            }];

                        return displayItems.map((item, idx) => (
                          <tr key={item.id || idx} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-4 font-bold text-slate-400">{idx + 1}</td>
                            <td className="py-3 px-4 font-bold text-slate-800">{item.productName}</td>
                            <td className="py-3 px-4 text-center font-bold text-slate-700">{item.qty}</td>
                            <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                              ₹{(Number(item.amount) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="py-3 px-4 font-medium text-slate-600">{item.reason || viewingReturn.reason || '-'}</td>
                            <td className="py-3 px-4 text-center">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                                viewingReturn.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                viewingReturn.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                'bg-rose-50 text-rose-600 border border-rose-100'
                              }`}>
                                {viewingReturn.status}
                              </span>
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total Amount Summary Box */}
              <div className="bg-gradient-to-r from-blue-50 via-slate-50 to-blue-50/30 p-4 rounded-xl border border-blue-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#184edb]/10 text-[#184edb] flex items-center justify-center font-bold">
                    ₹
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Refund Amount</span>
                    <span className="text-xs text-slate-500 font-medium">Total value calculated from return items</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Grand Total</span>
                  <span className="text-2xl font-black text-[#184edb]">
                    ₹{(viewingReturn.refundValue || (viewingReturn.items?.reduce((s, i) => s + (Number(i.amount) || 0), 0) || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between flex-shrink-0">
              <div className="text-xs text-slate-500 font-medium">
                Return ID: <span className="font-bold text-slate-700">{viewingReturn.id}</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => alert(`Printing Return Slip for ${viewingReturn.id}...`)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Printer size={14} />
                  <span>Print Slip</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingReturn(null)}
                  className="px-5 py-2 bg-[#184edb] hover:bg-[#133eb5] text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

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

      {/* 5. SUPPLIER BILLS BREAKDOWN MODAL (Ethana Supplier ku Ethana Bill) */}
      {showSupplierBreakdownModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[85vh] my-auto">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#184edb] text-white flex items-center justify-between flex-shrink-0">
              <div className="flex flex-col text-left">
                <span className="font-extrabold text-base">Supplier Bills Breakdown</span>
                <span className="text-[11.5px] text-blue-100 font-medium">
                  Grouped breakdown of all {invoices.length} bills across {supplierBillSummary.length} suppliers
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowSupplierBreakdownModal(false)}
                className="text-white/80 hover:text-white border-none bg-transparent cursor-pointer p-1"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body with proper scrolling */}
            <div className="p-6 overflow-y-auto flex-1 min-h-0 space-y-4 box-border text-left">
              
              {/* Summary Cards matching outside data 100% */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-blue-50/80 border border-blue-100 p-3.5 rounded-xl flex flex-col gap-0.5">
                  <span className="text-[10.5px] font-bold text-blue-600 uppercase tracking-wider">Total Suppliers</span>
                  <span className="text-xl font-black text-slate-800">{supplierBillSummary.length} Suppliers</span>
                </div>
                <div className="bg-indigo-50/80 border border-indigo-100 p-3.5 rounded-xl flex flex-col gap-0.5">
                  <span className="text-[10.5px] font-bold text-indigo-600 uppercase tracking-wider">Total Bills</span>
                  <span className="text-xl font-black text-slate-800">{invoices.length} Bills</span>
                </div>
                <div className="bg-emerald-50/80 border border-emerald-100 p-3.5 rounded-xl flex flex-col gap-0.5">
                  <span className="text-[10.5px] font-bold text-emerald-600 uppercase tracking-wider">Total Invoiced Amt</span>
                  <span className="text-xl font-black text-slate-800">₹{totalInvoiceAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="bg-amber-50/80 border border-amber-100 p-3.5 rounded-xl flex flex-col gap-0.5">
                  <span className="text-[10.5px] font-bold text-amber-600 uppercase tracking-wider">Total Balance Due</span>
                  <span className="text-xl font-black text-slate-800">₹{totalInvoiceBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Scrollable Table Container */}
              <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100/90 text-slate-600 text-[11px] uppercase tracking-wider font-bold border-b border-slate-200">
                      <th className="py-3 px-4">Supplier Name</th>
                      <th className="py-3 px-4 text-center">Bills Count</th>
                      <th className="py-3 px-4 text-center">Status Breakdown</th>
                      <th className="py-3 px-4 text-right">Total Amount</th>
                      <th className="py-3 px-4 text-right">Paid Amount</th>
                      <th className="py-3 px-4 text-right">Balance Due</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {supplierBillSummary.map((sum) => (
                      <tr key={sum.supplier} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-800">{sum.supplier}</td>
                        <td className="py-3 px-4 text-center font-extrabold text-[#184edb]">
                          {sum.totalBills} Bills
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-[10.5px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100 mr-1">
                            {sum.paidBills} Paid
                          </span>
                          {sum.pendingBills > 0 && (
                            <span className="text-[10.5px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-100">
                              {sum.pendingBills} Unpaid
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-800">
                          ₹{sum.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-600">
                          ₹{sum.paidAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className={`py-3 px-4 text-right font-extrabold ${sum.balanceDue > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                          ₹{sum.balanceDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setSupplierFilter(sum.supplier);
                              setShowSupplierBreakdownModal(false);
                            }}
                            className="px-2.5 py-1 text-[11px] font-bold bg-blue-50 hover:bg-[#184edb] text-[#184edb] hover:text-white rounded-lg border border-blue-200 cursor-pointer transition-colors"
                          >
                            Filter Bills
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {/* Table Footer Grand Totals */}
                  <tfoot className="bg-slate-50 font-bold text-slate-800 border-t-2 border-slate-200">
                    <tr>
                      <td className="py-3 px-4 font-black">Grand Total Summary</td>
                      <td className="py-3 px-4 text-center font-extrabold text-[#184edb]">
                        {supplierBillSummary.reduce((a, b) => a + b.totalBills, 0)} Bills
                      </td>
                      <td className="py-3 px-4 text-center text-[10.5px]">
                        <span className="text-emerald-700">{supplierBillSummary.reduce((a, b) => a + b.paidBills, 0)} Paid</span> •{' '}
                        <span className="text-amber-700">{supplierBillSummary.reduce((a, b) => a + b.pendingBills, 0)} Unpaid</span>
                      </td>
                      <td className="py-3 px-4 text-right font-black text-slate-900">
                        ₹{supplierBillSummary.reduce((a, b) => a + b.totalAmount, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-emerald-600">
                        ₹{supplierBillSummary.reduce((a, b) => a + b.paidAmount, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-rose-600">
                        ₹{supplierBillSummary.reduce((a, b) => a + b.balanceDue, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between flex-shrink-0">
              <span className="text-xs text-slate-500 font-semibold">
                Showing breakdown for {supplierBillSummary.length} suppliers
              </span>
              <button
                type="button"
                onClick={() => setShowSupplierBreakdownModal(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 6. VIEW & EDIT SUPPLIER INVOICE DETAILS MODAL */}
      {((invScope) => {
        if (!invScope) return null;
        const selectedInvoice = invScope;
        return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 my-8 flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4.5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText size={22} className="text-[#184edb]" />
                <div className="flex flex-col">
                  <span className="font-extrabold text-[16px]">Supplier Invoice: {selectedInvoice.id}</span>
                  <span className="text-[12px] text-slate-400 font-medium">PO Ref: {selectedInvoice.poRef}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-white/80 hover:text-white border-none bg-transparent cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex flex-col gap-6 box-border max-h-[75vh] overflow-y-auto">

              {/* Status Header Badge */}
              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Supplier Name</span>
                  <span className="text-lg font-extrabold text-slate-850">{selectedInvoice.supplier}</span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Payment Status</span>
                  {selectedInvoice.status === 'PAID' && (
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-700 border border-emerald-200">
                      PAID
                    </span>
                  )}
                  {selectedInvoice.status === 'PARTIAL' && (
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-700 border border-amber-200">
                      PARTIAL PAYMENT
                    </span>
                  )}
                  {selectedInvoice.status === 'UNPAID' && (
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-slate-200 text-slate-700 border border-slate-300">
                      UNPAID
                    </span>
                  )}
                  {selectedInvoice.status === 'OVERDUE' && (
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-700 border border-rose-200">
                      OVERDUE
                    </span>
                  )}
                </div>
              </div>

              {/* Dates & Reference grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-slate-200">
                <div className="flex flex-col">
                  <span className="text-[10.5px] font-bold text-slate-400 uppercase">Invoice No</span>
                  <span className="text-[13.5px] font-bold text-slate-800">{selectedInvoice.id}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10.5px] font-bold text-slate-400 uppercase">PO Reference</span>
                  <span className="text-[13.5px] font-bold text-[#184edb]">{selectedInvoice.poRef}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10.5px] font-bold text-slate-400 uppercase">Issue Date</span>
                  <span className="text-[13.5px] font-semibold text-slate-700">{selectedInvoice.issueDate}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10.5px] font-bold text-slate-400 uppercase">Due Date</span>
                  <span className="text-[13.5px] font-semibold text-slate-700">{selectedInvoice.dueDate}</span>
                </div>
              </div>

              {/* Financial Metrics Cards (Evalo Amount Iruku / Evalo Kattirukom / Ino Evalo Iruku) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-blue-50/80 border border-blue-100 rounded-xl p-4 flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-blue-600 uppercase">Total Bill Amount</span>
                  <span className="text-xl font-extrabold text-slate-850">
                    ₹{selectedInvoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[11px] font-semibold text-blue-700">Full Invoice Value</span>
                </div>

                <div className="bg-emerald-50/80 border border-emerald-100 rounded-xl p-4 flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-emerald-600 uppercase">Amount Paid (Kattirukom)</span>
                  <span className="text-xl font-extrabold text-emerald-700">
                    ₹{getPaidAmount(selectedInvoice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-600">Total Payment Received</span>
                </div>

                <div className="bg-rose-50/80 border border-rose-100 rounded-xl p-4 flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-rose-600 uppercase">Balance Due (Ino Iruku)</span>
                  <span className="text-xl font-extrabold text-rose-700">
                    ₹{getBalanceDue(selectedInvoice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[11px] font-semibold text-rose-600">Remaining Pending Due</span>
                </div>
              </div>

              {/* Payment Status & Paid Amount Updater Form */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
                <span className="text-[12.5px] font-extrabold text-slate-800 uppercase tracking-wider">
                  Update Invoice Payment & Status
                </span>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const statusSelect = document.getElementById('edit-inv-status') as HTMLSelectElement;
                    const paidInput = document.getElementById('edit-inv-paid') as HTMLInputElement;
                    if (statusSelect && paidInput) {
                      const newStat = statusSelect.value as 'PAID' | 'PARTIAL' | 'UNPAID' | 'OVERDUE';
                      const newPaid = Number(paidInput.value) || 0;
                      const newBal = Math.max(0, selectedInvoice.amount - newPaid);
                      const newPoStat: 'PAID' | 'PARTIAL' | 'PENDING' = newStat === 'PAID' ? 'PAID' : (newStat === 'PARTIAL' ? 'PARTIAL' : 'PENDING');

                      const updatedInvoices = invoices.map(inv => inv.id === selectedInvoice.id ? {
                        ...inv,
                        status: newStat,
                        paidAmount: newPaid,
                        balanceDue: newBal
                      } : inv);

                      const updatedPurchases = purchases.map(p => (p.invoiceNo === selectedInvoice.id || p.id === selectedInvoice.poRef) ? {
                        ...p,
                        status: newPoStat,
                        debit: newPaid,
                        balance: newBal
                      } : p);

                      saveAndSyncPurchasesAndInvoices(updatedPurchases, updatedInvoices);

                      setSelectedInvoice({
                        ...selectedInvoice,
                        status: newStat,
                        paidAmount: newPaid,
                        balanceDue: newBal
                      });

                      alert(`Invoice ${selectedInvoice.id} status updated to ${newStat} with ₹${newPaid.toLocaleString()} paid!`);
                    }
                  }}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end"
                >
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-slate-600 uppercase">Payment Status</label>
                    <select
                      id="edit-inv-status"
                      defaultValue={selectedInvoice.status}
                      className="p-2.5 border border-slate-300 rounded-lg text-[13.5px] font-semibold bg-white focus:outline-none focus:border-[#184edb]"
                    >
                      <option value="PAID">PAID</option>
                      <option value="PARTIAL">PARTIAL</option>
                      <option value="UNPAID">UNPAID</option>
                      <option value="OVERDUE">OVERDUE</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-slate-600 uppercase">Paid Amount (₹)</label>
                    <input
                      type="number"
                      id="edit-inv-paid"
                      defaultValue={getPaidAmount(selectedInvoice)}
                      className="p-2.5 border border-slate-300 rounded-lg text-[13.5px] font-bold text-slate-800 bg-white focus:outline-none focus:border-[#184edb]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="py-2.5 px-4 bg-[#184edb] hover:bg-[#133eb5] text-white font-extrabold text-[13px] rounded-lg border-none cursor-pointer transition-colors shadow-md"
                  >
                    Save Status Update
                  </button>
                </form>
              </div>

              {/* Sample Line Items Table */}
              <div className="flex flex-col gap-2">
                <span className="text-[12.5px] font-extrabold text-slate-800 uppercase tracking-wider">
                  Billed Products / Services Items
                </span>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse text-[13px]">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                        <th className="py-2.5 px-4">Item Description</th>
                        <th className="py-2.5 px-3 text-center">Qty</th>
                        <th className="py-2.5 px-4 text-right">Unit Rate</th>
                        <th className="py-2.5 px-4 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      <tr>
                        <td className="py-2.5 px-4 font-bold text-slate-800">Eicher Genuine Brake Pads (Heavy Duty)</td>
                        <td className="py-2.5 px-3 text-center">10</td>
                        <td className="py-2.5 px-4 text-right">₹{Math.round(selectedInvoice.amount * 0.06).toLocaleString()}</td>
                        <td className="py-2.5 px-4 text-right font-bold">₹{Math.round(selectedInvoice.amount * 0.60).toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-bold text-slate-800">Synthetic Engine Oil 15W-40 (20L Drum)</td>
                        <td className="py-2.5 px-3 text-center">4</td>
                        <td className="py-2.5 px-4 text-right">₹{Math.round(selectedInvoice.amount * 0.10).toLocaleString()}</td>
                        <td className="py-2.5 px-4 text-right font-bold">₹{Math.round(selectedInvoice.amount * 0.40).toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 bg-[#184edb] hover:bg-[#133eb5] text-white font-bold text-[12.5px] px-5 py-2.5 border-none rounded-lg cursor-pointer transition-colors shadow-md"
                >
                  <Printer size={15} />
                  <span>Print Invoice</span>
                </button>
                <button
                  onClick={() => {
                    setQrPaymentInvoice(selectedInvoice);
                    setCustomPaymentAmount(getBalanceDue(selectedInvoice));
                    setShowQrPaymentModal(true);
                  }}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-[12.5px] px-4 py-2.5 border-none rounded-lg cursor-pointer transition-colors shadow-md"
                >
                  <QrCode size={15} />
                  <span>Pay via QR</span>
                </button>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-[12.5px] px-5 py-2.5 rounded-lg cursor-pointer transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      );
      })(selectedInvoice as unknown as SupplierInvoice | null)}

      {/* 7. UPI QR CODE PAYMENT MODAL */}
      {((invScope) => {
        const selectedInvoice = invScope;
        return showQrPaymentModal && qrPaymentInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#0f172a] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-400">
                  <QrCode size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-[15px]">Scan & Pay via UPI</span>
                  <span className="text-[11.5px] text-slate-400 font-medium">Invoice #{qrPaymentInvoice.id}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowQrPaymentModal(false);
                  setQrPaymentInvoice(null);
                }}
                className="text-slate-400 hover:text-white border-none bg-transparent cursor-pointer p-1"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex flex-col items-center gap-4 text-center bg-slate-50/50">
              
              {/* Supplier Info Badge */}
              <div className="w-full bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between shadow-xs text-left">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payee / Supplier</span>
                  <span className="text-[14px] font-extrabold text-slate-900">{qrPaymentInvoice.supplier}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">UPI VPA ID</span>
                  <span className="text-[12px] font-mono font-extrabold text-[#184edb]">
                    {(() => {
                      const sup = activeSuppliersList.find(s => s.name === qrPaymentInvoice.supplier);
                      return sup?.phone ? `${sup.phone}@upi` : `${qrPaymentInvoice.supplier.toLowerCase().replace(/[^a-z0-9]/g, '')}@okaxis`;
                    })()}
                  </span>
                </div>
              </div>

              {/* Editable Payable Amount */}
              <div className="w-full flex flex-col gap-1 text-left">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Payable Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-extrabold text-slate-400 text-lg">₹</span>
                  <input
                    type="number"
                    value={customPaymentAmount}
                    onChange={(e) => setCustomPaymentAmount(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-8 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-lg font-extrabold text-slate-900 focus:outline-none focus:border-[#184edb] shadow-xs"
                  />
                </div>
              </div>

              {/* QR Code Container */}
              <div className="bg-white p-4 rounded-2xl border-2 border-slate-200 shadow-md flex flex-col items-center gap-2 my-1">
                {(() => {
                  const sup = activeSuppliersList.find(s => s.name === qrPaymentInvoice.supplier);
                  const vpa = sup?.phone ? `${sup.phone}@upi` : `${qrPaymentInvoice.supplier.toLowerCase().replace(/[^a-z0-9]/g, '')}@okaxis`;
                  const upiPayload = `upi://pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(qrPaymentInvoice.supplier)}&am=${customPaymentAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Inv_${qrPaymentInvoice.id}`)}`;
                  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiPayload)}`;
                  
                  return (
                    <>
                      <img 
                        src={qrUrl} 
                        alt="UPI QR Code" 
                        className="w-48 h-48 object-contain rounded-lg border border-slate-100"
                      />
                      <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5 mt-1">
                        <Smartphone size={14} className="text-[#184edb]" />
                        Scan with GPay, PhonePe, Paytm or BHIM
                      </span>
                    </>
                  );
                })()}
              </div>

              {/* Payment Apps Badges */}
              <div className="flex items-center justify-center gap-2 text-[11px] font-extrabold text-slate-500">
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-100">GPay</span>
                <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-md border border-purple-100">PhonePe</span>
                <span className="px-2.5 py-1 bg-sky-50 text-sky-700 rounded-md border border-sky-100">Paytm</span>
                <span className="px-2.5 py-1 bg-orange-50 text-orange-700 rounded-md border border-orange-100">BHIM UPI</span>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-white border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowQrPaymentModal(false);
                  setQrPaymentInvoice(null);
                }}
                className="px-4 py-2.5 border border-slate-200 text-slate-650 font-bold text-[12.5px] rounded-xl bg-white hover:bg-slate-50 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetInv = qrPaymentInvoice;
                  const paidAmt = getPaidAmount(targetInv);
                  const payVal = customPaymentAmount || (targetInv.amount - paidAmt);

                  if (payVal <= 0) {
                    alert('Please enter a valid payment amount.');
                    return;
                  }

                  const newPaid = Math.min(targetInv.amount, paidAmt + payVal);
                  const newBal = Math.max(0, targetInv.amount - newPaid);
                  const newStatus: 'PAID' | 'PARTIAL' = newBal === 0 ? 'PAID' : 'PARTIAL';

                  const updatedInvoices: SupplierInvoice[] = invoices.map(i => i.id === targetInv.id ? {
                    ...i,
                    status: newStatus,
                    paidAmount: newPaid,
                    balanceDue: newBal
                  } : i);

                  const updatedPurchases: PurchaseOrder[] = purchases.map(p => (p.invoiceNo === targetInv.id || p.id === targetInv.poRef) ? {
                    ...p,
                    status: (newStatus === 'PAID' ? 'PAID' : 'PARTIAL') as 'PENDING' | 'PAID' | 'PARTIAL',
                    debit: newPaid,
                    balance: newBal
                  } : p);

                  saveAndSyncPurchasesAndInvoices(updatedPurchases, updatedInvoices);
                  
                  if (selectedInvoice && selectedInvoice.id === targetInv.id) {
                    setSelectedInvoice({
                      ...targetInv,
                      status: newStatus,
                      paidAmount: newPaid,
                      balanceDue: newBal
                    });
                  }

                  setShowQrPaymentModal(false);
                  setQrPaymentInvoice(null);
                  alert(`✅ UPI Payment of ₹${payVal.toLocaleString()} recorded successfully for Invoice #${targetInv.id}!`);
                }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[13px] rounded-xl border-none cursor-pointer transition-colors shadow-md flex items-center gap-2"
              >
                <CheckCircle size={16} />
                <span>Payment Complete</span>
              </button>
            </div>

          </div>
        </div>
      );
      })(selectedInvoice as unknown as SupplierInvoice | null)}

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
                <TableCell align="right" sx={{ fontWeight: 700, color: '#334155', fontSize: '13.5px', px: 1 }}>₹3,450.00</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: '#334155', fontSize: '13.5px', px: 1 }}>₹1,242.00</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '13.5px', px: 1 }}>₹8,142.00</TableCell>
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
                <TableCell align="right" sx={{ fontWeight: 700, color: '#334155', fontSize: '13.5px', px: 1 }}>₹2,100.00</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: '#334155', fontSize: '13.5px', px: 1 }}>₹378.00</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '13.5px', px: 1 }}>₹2,478.00</TableCell>
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
                <TableCell align="right" sx={{ fontWeight: 700, color: '#334155', fontSize: '13.5px', px: 1 }}>₹1,250.00</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: '#334155', fontSize: '13.5px', px: 1 }}>₹900.00</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '13.5px', px: 1 }}>₹5,900.00</TableCell>
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
                <TableCell align="right" sx={{ fontWeight: 700, color: '#334155', fontSize: '13.5px', px: 1 }}>₹3,850.00</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: '#334155', fontSize: '13.5px', px: 1 }}>₹693.00</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '13.5px', px: 1 }}>₹4,543.00</TableCell>
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
                <Typography variant="body2" sx={{ color: '#0f172a', fontWeight: 800 }}>₹16,650.00</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 650 }}>Total GST (18%):</Typography>
                <Typography variant="body2" sx={{ color: '#0f172a', fontWeight: 800 }}>₹3,213.00</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: '#ef4444', fontWeight: 800 }}>Corporate Discount (5%):</Typography>
                <Typography variant="body2" sx={{ color: '#ef4444', fontWeight: 800 }}>-₹993.15</Typography>
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
                ₹18,869.85
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
                Eighteen Thousand Eight Hundred Sixty Nine and<br />85/100 Rupees Only
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
