import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  BadgeCheck,
  CheckCircle,
  X
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

  // Selected Reference No Modal State
  const [selectedLedgerRef, setSelectedLedgerRef] = useState<LedgerTransaction | null>(null);

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

  // Dynamically load purchases and invoices from localStorage for selected supplier
  const [savedPurchasesList, setSavedPurchasesList] = useState<any[]>([]);

  const loadSavedPurchases = () => {
    try {
      const savedP = localStorage.getItem('dms_purchases_list');
      const savedI = localStorage.getItem('dms_supplier_invoices_list');
      let combined: any[] = [];
      if (savedP) {
        const parsedP = JSON.parse(savedP);
        if (Array.isArray(parsedP)) combined = [...parsedP];
      }
      if (savedI) {
        const parsedI = JSON.parse(savedI);
        if (Array.isArray(parsedI)) {
          parsedI.forEach((inv: any) => {
            if (!combined.some(p => p.id === inv.poRef || p.invoiceNo === inv.id)) {
              combined.push({
                id: inv.poRef || inv.id,
                invoiceNo: inv.id,
                supplier: inv.supplier,
                date: inv.issueDate,
                itemsCount: inv.itemsCount || 1,
                grandTotal: inv.amount,
                status: inv.status,
                paidAmount: inv.paidAmount,
                balanceDue: inv.balanceDue,
                items: inv.items || []
              });
            }
          });
        }
      }
      setSavedPurchasesList(combined);
    } catch (e) {}
  };

  useEffect(() => {
    loadSavedPurchases();
    window.addEventListener('dms_purchases_updated', loadSavedPurchases);
    window.addEventListener('dms_inventory_updated', loadSavedPurchases);
    window.addEventListener('storage', loadSavedPurchases);
    return () => {
      window.removeEventListener('dms_purchases_updated', loadSavedPurchases);
      window.removeEventListener('dms_inventory_updated', loadSavedPurchases);
      window.removeEventListener('storage', loadSavedPurchases);
    };
  }, []);

  const currentSupplierName = selectedSupplier?.name || ledgerSupplier;

  // Filter purchase orders matching current supplier name
  const matchedPurchases = savedPurchasesList.filter(p =>
    p.supplier && p.supplier.toLowerCase().trim() === currentSupplierName.toLowerCase().trim()
  );

  // Generate dynamic raw ledger entries for matched purchases & payments
  const dynamicLedgerEntries: LedgerTransaction[] = [];

  matchedPurchases.forEach((p, idx) => {
    const itemDesc = p.items && p.items.length > 0
      ? p.items.map((i: any) => `${i.productName || 'Spare Part'} (x${i.qty || 1} @ ₹${i.rate || i.price || 0})`).join(', ')
      : `${p.itemsCount || 1} item(s) purchased`;

    // 1. Purchase Debit Entry (Adds to Supplier Balance)
    dynamicLedgerEntries.push({
      id: `po-purchase-${p.id}-${idx}`,
      date: p.date,
      referenceNo: p.id || p.invoiceNo,
      type: 'PURCHASE',
      description: itemDesc,
      debit: p.grandTotal || p.amount || 0,
      credit: 0,
      balance: 0,
      paymentMode: p.status === 'PAID' ? 'Paid' : 'Credit Account',
      remarks: `Invoice #: ${p.invoiceNo || p.id}`
    });

    // 2. Payment Credit Entry (Reduces Supplier Balance if paid/partially paid)
    const paidVal = p.paidAmount !== undefined 
      ? p.paidAmount 
      : (p.status === 'PAID' ? (p.grandTotal || p.amount || 0) : (p.status === 'PARTIAL' ? Math.round((p.grandTotal || p.amount || 0) / 2) : 0));

    if (paidVal > 0) {
      dynamicLedgerEntries.push({
        id: `po-pay-${p.id}-${idx}`,
        date: p.date,
        referenceNo: `PAY-${p.invoiceNo || p.id}`,
        type: 'PAYMENT',
        description: `Payment Settlement against ${p.invoiceNo || p.id}`,
        debit: 0,
        credit: paidVal,
        balance: 0,
        paymentMode: p.paymentMode || 'Bank Transfer',
        remarks: `Payment against Invoice ${p.invoiceNo || p.id}`
      });
    }
  });

  // Base opening balance transaction for supplier
  const baseOpeningTx: LedgerTransaction = {
    id: 'tx-1',
    date: '01/10/2023',
    referenceNo: '-',
    type: 'BALANCE',
    description: 'Opening Balance Forwarded',
    debit: 0,
    credit: 0,
    balance: 0,
    paymentMode: '-',
    remarks: 'Forwarded Balance'
  };

  const rawTxList = [baseOpeningTx, ...dynamicLedgerEntries, ...transactions.filter(t => t.id !== 'tx-1')];

  // Progressive running balance computation: Balance = Balance + Debit - Credit
  let runningBal = 0;
  const processedTransactions = rawTxList.map(tx => {
    runningBal = runningBal + tx.debit - tx.credit;
    return {
      ...tx,
      balance: runningBal
    };
  });

  // Totals for top summary KPI cards
  const totalPurchaseAmt = processedTransactions.reduce((acc, t) => acc + t.debit, 0);
  const totalPaidAmt = processedTransactions.reduce((acc, t) => acc + t.credit, 0);
  const currentNetOutstanding = runningBal;

  // Filter transactions
  const filteredTransactions = processedTransactions.filter(tx => {
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
  const currentSupplierDetails = selectedSupplier || suppliersList.find(s => s.name === ledgerSupplier);

  const getPurchaseOrderFromLedgerRef = (tx: LedgerTransaction) => {
    const found = savedPurchasesList.find(p => p.id === tx.referenceNo || p.invoiceNo === tx.referenceNo || p.id === tx.id);
    if (found) return found;

    const totalVal = tx.debit || tx.credit || tx.balance || 0;
    const gstVal = Math.round((totalVal * 0.18 / 1.18) * 100) / 100;
    const invNo = tx.remarks && tx.remarks.includes('Invoice #:') 
      ? tx.remarks.split('Invoice #:')[1].trim() 
      : (tx.referenceNo && tx.referenceNo !== '-' ? tx.referenceNo : `INV-${tx.id}`);

    return {
      id: tx.referenceNo && tx.referenceNo !== '-' ? tx.referenceNo : tx.id,
      invoiceNo: invNo,
      supplier: selectedSupplier?.name || ledgerSupplier,
      supplierInitials: (selectedSupplier?.name || ledgerSupplier).substring(0, 2).toUpperCase(),
      supplierBg: 'bg-blue-500',
      date: tx.date,
      itemsCount: 1,
      gstAmount: gstVal,
      grandTotal: totalVal,
      status: tx.paymentMode === 'Paid' ? 'PAID' : 'PENDING',
      items: [
        {
          id: '1',
          productName: tx.description || 'Purchased Spare Parts / Services Intake',
          qty: 1,
          rate: Math.round((totalVal - gstVal) * 100) / 100,
          gstPercent: 18
        }
      ],
      description: tx.description,
      debit: tx.debit,
      credit: tx.credit,
      balance: tx.balance,
      paymentMode: tx.paymentMode,
      remarks: tx.remarks
    };
  };

  const renderInvoiceSheet = (po: any) => {
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
              <span>GSTIN: <strong className="text-slate-800">{selectedSupplier?.gstNumber || '07AAACG1234F1Z5'}</strong></span>
              <span>Phone: <strong className="text-slate-800">{selectedSupplier?.phone || '+91 91234 56789'}</strong></span>
              <span>Email: <strong className="text-slate-800">{selectedSupplier?.email || `orders@${(po.supplier || 'supplier').toLowerCase().replace(/[^a-z0-9]/g, '')}.com`}</strong></span>
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
                      sku: `SP-${(item.id || String(idx + 1)).substring(0, 5).toUpperCase()}`,
                      qty: String(item.qty).padStart(2, '0'),
                      rate: item.rate,
                      gst: item.rate * item.qty * ((item.gstPercent || 18) / 100),
                      total: item.rate * item.qty * (1 + (item.gstPercent || 18) / 100)
                    }))
                  : [
                      {
                        num: '01',
                        name: 'Eicher Genuine Spare Parts & Components',
                        sub: 'Standard Issue Replacement Parts',
                        sku: `SP-${String(po.id).replace('PO-', '')}`,
                        qty: String(po.itemsCount || 1).padStart(2, '0'),
                        rate: (po.grandTotal - (po.gstAmount || 0)) / (po.itemsCount || 1),
                        gst: po.gstAmount || 0,
                        total: po.grandTotal
                      }
                    ];

                return itemsList.map((item: any) => (
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

        {/* Date & Payment Summary Note Bar */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-slate-700 my-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Transaction Date:</span>
            <span className="font-extrabold text-slate-800">{po.date || 'N/A'}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Amount Paid ({po.paymentMode || 'Cash'}):</span>
            <span className="font-extrabold text-emerald-700">₹{paidVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Balance Remaining:</span>
            <span className="font-extrabold text-rose-600">₹{balanceVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          <span className={`text-[10.5px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
            statusTag === 'PAID'
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              : statusTag === 'PARTIAL'
              ? 'bg-amber-100 text-amber-800 border border-amber-200'
              : 'bg-rose-100 text-rose-800 border border-rose-200'
          }`}>
            Status: {statusTag}
          </span>
        </div>

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
              const subtotalVal = (po.grandTotal || 0) - (po.gstAmount || 0);
              const gstVal = po.gstAmount || 0;

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
                    <span className="text-[#0f172a] font-bold">₹{gstVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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
      </div>
    );
  };

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
              ₹{totalPurchaseAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
            <span className="block text-[10.5px] font-bold text-[#64748b] tracking-wider uppercase mt-1.5">TOTAL PURCHASE (DEBIT)</span>
          </div>
        </div>

        {/* Card 2: Total Paid */}
        <div className="bg-white border border-[#e2e8f0] p-5.5 rounded-xl flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)] min-h-[125px] relative">
          <div className="flex items-start justify-between">
            <div className="bg-[#eff6ff] p-2.5 rounded-lg flex items-center justify-center text-[#184edb]">
              <CreditCard size={20} />
            </div>
            <span className="text-[11.5px] font-semibold text-[#64748b]">Total Paid</span>
          </div>
          <div className="mt-3.5">
            <span className="text-[26px] font-extrabold font-bold text-emerald-600 leading-none">
              ₹{totalPaidAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
            <span className="block text-[10.5px] font-bold text-[#64748b] tracking-wider uppercase mt-1.5">TOTAL PAID (CREDIT)</span>
          </div>
        </div>

        {/* Card 3: Outstanding Balance */}
        <div className="bg-white border border-[#e2e8f0] p-5.5 rounded-xl flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)] min-h-[125px] relative">
          <div className="flex items-start justify-between">
            <div className={`p-2.5 rounded-lg flex items-center justify-center ${currentNetOutstanding > 0 ? 'bg-[#fef2f2] text-[#dc2626]' : 'bg-emerald-50 text-emerald-600'}`}>
              <AlertTriangle size={20} />
            </div>
            <div className={`flex items-center gap-1 text-[11.5px] font-bold ${currentNetOutstanding > 0 ? 'text-[#dc2626]' : 'text-emerald-600'}`}>
              <span>{currentNetOutstanding > 0 ? 'Due Pending' : 'Balanced'}</span>
            </div>
          </div>
          <div className="mt-3.5">
            <span className={`text-[26px] font-extrabold leading-none ${currentNetOutstanding > 0 ? 'text-[#dc2626]' : 'text-slate-800'}`}>
              ₹{currentNetOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
            <span className="block text-[10.5px] font-bold text-[#64748b] tracking-wider uppercase mt-1.5">NET OUTSTANDING BALANCE</span>
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
                  <td
                    onClick={() => setSelectedLedgerRef(tx)}
                    className="py-4 px-6 text-[13px] font-bold text-[#184edb] hover:text-[#133eb5] cursor-pointer hover:underline transition-colors"
                    title="Click to view purchase details"
                  >
                    {tx.referenceNo}
                  </td>
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

      {/* Purchased Products & Items Breakdown Card */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ShoppingCart className="text-[#184edb]" size={18} />
            <h3 className="text-[16px] font-bold text-[#0f172a] m-0 font-heading">
              Purchased Products & Items Details ({matchedPurchases.length} Purchase Orders)
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Purchased from: <strong className="text-[#184edb]">{currentSupplierName}</strong>
          </span>
        </div>

        {matchedPurchases.length === 0 ? (
          <div className="py-8 text-center text-slate-400 font-semibold text-xs">
            No purchase records found for this supplier yet. Create a purchase order in the Purchase section to see items here!
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {matchedPurchases.map((po) => (
              <div key={po.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2.5">
                  <div className="flex items-center gap-3">
                    <span
                      onClick={() => {
                        const matchedTx: LedgerTransaction = {
                          id: po.id,
                          date: po.date,
                          referenceNo: po.id,
                          type: 'PURCHASE',
                          description: po.description || (po.items?.map((i: any) => `${i.productName} (x${i.qty} @ ₹${i.rate})`).join(', ') || 'Purchase Intake'),
                          debit: po.grandTotal,
                          credit: 0,
                          balance: po.grandTotal,
                          paymentMode: po.paymentMode || (po.status === 'PAID' ? 'Paid' : 'Credit Account'),
                          remarks: po.remarks || `Invoice #: ${po.invoiceNo}`
                        };
                        setSelectedLedgerRef(matchedTx);
                      }}
                      className="font-bold text-[#184edb] hover:text-[#133eb5] text-xs font-mono cursor-pointer hover:underline"
                      title="Click to view full purchase details"
                    >
                      {po.id}
                    </span>
                    <span className="text-xs font-bold text-slate-700">Inv #: {po.invoiceNo}</span>
                    <span className="text-[11px] text-slate-400 font-semibold">{po.date}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-600">Total: <span className="text-slate-900 font-extrabold">₹{po.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-600 border border-emerald-100">
                      {po.status}
                    </span>
                  </div>
                </div>

                {/* Items Table */}
                <table className="w-full text-left border-collapse text-xs bg-white rounded-lg overflow-hidden border border-slate-200">
                  <thead>
                    <tr className="bg-slate-100 text-slate-500 font-bold">
                      <th className="py-2 px-3">Product / Part Name</th>
                      <th className="py-2 px-3 text-center">Qty</th>
                      <th className="py-2 px-3 text-right">Rate</th>
                      <th className="py-2 px-3 text-center">GST %</th>
                      <th className="py-2 px-3 text-right">Subtotal / Total Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {(po.items && po.items.length > 0 ? po.items : [{ id: '1', productName: 'Purchased Spare Parts Batch', qty: po.itemsCount || 1, rate: po.grandTotal, gstPercent: 18 }]).map((item: any) => {
                      const itemSub = item.qty * item.rate;
                      const itemTax = itemSub * ((item.gstPercent || 18) / 100);
                      return (
                        <tr key={item.id}>
                          <td className="py-2 px-3 font-bold text-slate-800">{item.productName}</td>
                          <td className="py-2 px-3 text-center">{item.qty}</td>
                          <td className="py-2 px-3 text-right">₹{item.rate.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          <td className="py-2 px-3 text-center">{item.gstPercent || 18}%</td>
                          <td className="py-2 px-3 text-right font-bold text-slate-900">₹{(itemSub + itemTax).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- PURCHASE INVOICE RECEIPT PREVIEW MODAL & PRINT PORTAL --- */}
      {selectedLedgerRef && (() => {
        const poData = getPurchaseOrderFromLedgerRef(selectedLedgerRef);
        return (
          <>
            <style>{`
              @media screen {
                #supplier-invoice-print-area {
                  display: none !important;
                }
              }
              @media print {
                #root {
                  display: none !important;
                }
                #supplier-invoice-print-area {
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
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto print:hidden">
              <div className="bg-white rounded-2xl w-full max-w-[850px] shadow-2xl overflow-hidden my-8 flex flex-col">
                {/* Modal Header Control Bar */}
                <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <ShoppingCart size={18} className="text-blue-400" />
                    <span className="font-extrabold text-[13px] tracking-wider uppercase">Purchase Receipt / Invoice Preview</span>
                  </div>
                  <button
                    onClick={() => setSelectedLedgerRef(null)}
                    className="text-white/80 hover:text-white border-none bg-transparent cursor-pointer flex items-center p-1"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Scrollable invoice body preview on screen */}
                <div className="p-8 bg-white text-left text-slate-700 font-sans overflow-y-auto max-h-[72vh]">
                  {renderInvoiceSheet(poData)}
                </div>

                {/* Modal Control Footer Bar */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between flex-shrink-0">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <CheckCircle size={14} className="text-emerald-500" />
                    Verified Supplier Transaction
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
                      onClick={() => setSelectedLedgerRef(null)}
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
              <div id="supplier-invoice-print-area">
                {renderInvoiceSheet(poData)}
              </div>,
              document.body
            )}
          </>
        );
      })()}
    </div>
  );
};
