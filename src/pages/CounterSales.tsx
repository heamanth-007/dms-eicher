import React, { useState, useRef, useEffect } from 'react';
import { deductInventoryStock, getStoredInventory, saveStoredInventory, type PartType } from '../utils/inventory';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  Printer, 
  Save, 
  RefreshCw, 
  X, 
  FileText,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Info,
  Users,
  Mail,
  Download,
  ArrowLeft,
  Clock,
  FolderOpen
} from 'lucide-react';

interface BillItem {
  id: string;
  name: string;
  code: string;
  qty: number;
  unitPrice: number;
  discountPercent: number; // e.g. 10 for 10%
  gstPercent: number; // e.g. 18 for 18%
}

export interface CounterSalesRecord {
  id: string;
  billNo: string;
  customerName: string;
  customerType: string;
  mobileNumber: string;
  date: string;
  billItems: BillItem[];
  subtotal: number;
  discount: number;
  gst: number;
  grandTotal: number;
  remarks: string;
  status: 'PAID' | 'DRAFT' | 'PENDING';
  createdAt: string;
}

export interface CounterSalesProps {
  companySettings?: {
    companyName: string;
    dealerName: string;
    gstNumber: string;
    panNumber: string;
    streetAddress: string;
    city: string;
    stateName: string;
    pinCode: string;
    mobileNumber: string;
    phoneNum: string;
    emailAddress: string;
    websiteUrl: string;
    logoUrl: string;
    defaultDiscountPercent?: number | string;
  };
}

export const CounterSales: React.FC<CounterSalesProps> = ({ companySettings }) => {
  const currentYear = new Date().getFullYear();
  // Navigation overlay toggle
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [billNo, setBillNo] = useState(`INV-${currentYear}-2001`);

  // Customer details state
  const [customerName, setCustomerName] = useState('');
  const [customerType, setCustomerType] = useState('Retail');
  const [mobileNumber, setMobileNumber] = useState('');
  const [remarks, setRemarks] = useState('');

  // Total Bills & Draft Lists with localStorage persistence
  const [totalBillsList, setTotalBillsList] = useState<CounterSalesRecord[]>(() => {
    const saved = localStorage.getItem('dms_counter_sales_bills');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing dms_counter_sales_bills:', e);
      }
    }
    return [];
  });

  const [draftBillsList, setDraftBillsList] = useState<CounterSalesRecord[]>(() => {
    const saved = localStorage.getItem('dms_counter_sales_drafts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing dms_counter_sales_drafts:', e);
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('dms_counter_sales_bills', JSON.stringify(totalBillsList));
  }, [totalBillsList]);

  useEffect(() => {
    localStorage.setItem('dms_counter_sales_drafts', JSON.stringify(draftBillsList));
  }, [draftBillsList]);

  const [showTotalBillsModal, setShowTotalBillsModal] = useState(false);
  const [showDraftsModal, setShowDraftsModal] = useState(false);
  const [searchBillsTerm, setSearchBillsTerm] = useState('');
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [editingBillId, setEditingBillId] = useState<string | null>(null);

  // Bill items state initialized with the mockup items
  const [billItems, setBillItems] = useState<BillItem[]>([]);

  // Active product entry selection
  const [searchQuery, setSearchQuery] = useState('');
  const [catalog, setCatalog] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const getDefaultDiscountFromSettings = () => {
    try {
      if (companySettings?.defaultDiscountPercent) {
        return parseFloat(companySettings.defaultDiscountPercent.toString().replace(/[^0-9.]/g, '')) || 0;
      }
      const saved = localStorage.getItem('dms_company_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.defaultDiscountPercent !== undefined) {
          return parseFloat(parsed.defaultDiscountPercent.toString().replace(/[^0-9.]/g, '')) || 0;
        }
      }
    } catch (e) {}
    return 5;
  };

  // Dynamic stock calculation: deducts quantity currently added in the active bill!
  const getEffectiveStock = (product: any) => {
    if (!product) return 0;
    const addedQty = billItems
      .filter(item => item.code === product.code)
      .reduce((acc, curr) => acc + curr.qty, 0);
    return Math.max(0, (product.stock || 0) - addedQty);
  };

  const productSearchContainerRef = useRef<HTMLDivElement>(null);

  const loadCatalog = () => {
    const defaultDisc = getDefaultDiscountFromSettings();
    const stored = getStoredInventory();
    let mappedStored: any[] = [];
    if (stored && stored.length > 0) {
      mappedStored = stored.map((item: PartType) => ({
        name: `${item.partName} | Part No: ${item.partNumber}`,
        code: item.partNumber,
        price: parseFloat(item.salePrice.replace(/[^0-9.]/g, '')) || 0,
        stock: parseInt(item.stock.replace(/[^0-9]/g, ''), 10) || 0,
        discount: defaultDisc,
        gst: parseInt(item.gstPercent?.replace(/[^0-9]/g, '') || '18', 10) || 18,
        hsn: item.hsnCode
      }));
      setCatalog(mappedStored);
      setSelectedProduct(mappedStored[0]);
    }

    fetch(`${API_URL}/api/parts`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const apiMapped = data.map((item: any) => ({
            name: `${item.partName} | Part No: ${item.partNumber}`,
            code: item.partNumber,
            price: parseFloat(item.salePrice.replace(/[^0-9.]/g, '')) || 0,
            stock: parseInt(item.stock.replace(/[^0-9]/g, ''), 10) || 0,
            discount: defaultDisc,
            gst: parseInt(item.gstPercent?.replace(/[^0-9]/g, '') || '18', 10) || 18,
            hsn: item.hsnCode
          }));
          const combinedMap = new Map();
          mappedStored.forEach(p => combinedMap.set(p.code, p));
          apiMapped.forEach(p => {
            if (!combinedMap.has(p.code)) {
              combinedMap.set(p.code, p);
            }
          });
          const merged = Array.from(combinedMap.values());
          setCatalog(merged);
          if (merged.length > 0) setSelectedProduct(merged[0]);
        }
      })
      .catch(err => {
        console.error('Error fetching parts for catalog:', err);
      });
  };

  useEffect(() => {
    loadCatalog();

    const handleInvUpdate = () => {
      loadCatalog();
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (productSearchContainerRef.current && !productSearchContainerRef.current.contains(event.target as Node)) {
        setShowProductDropdown(false);
      }
    };

    window.addEventListener('dms_inventory_updated', handleInvUpdate);
    window.addEventListener('dms_settings_updated', handleInvUpdate);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('dms_inventory_updated', handleInvUpdate);
      window.removeEventListener('dms_settings_updated', handleInvUpdate);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const [entryQty, setEntryQty] = useState<number | ''>('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const productSearchRef = useRef<HTMLInputElement>(null);
  const quantityInputRef = useRef<HTMLInputElement>(null);

  // Edit item state
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState(1);
  const [editDiscount, setEditDiscount] = useState(0);

  // Handle selecting product from dropdown
  const handleSelectProduct = (product: any) => {
    setSelectedProduct(product);
    setSearchQuery(product.name);
    setShowProductDropdown(false);
    setTimeout(() => {
      quantityInputRef.current?.focus();
      quantityInputRef.current?.select();
    }, 50);
  };

  // Add selected product to bill
  const handleAddProduct = () => {
    if (!selectedProduct) {
      alert('Please select a product first.');
      return;
    }
    const finalQty = entryQty === '' ? 1 : entryQty;
    const availableStock = getEffectiveStock(selectedProduct);
    if (availableStock <= 0) {
      alert(`Out of Stock! Product "${selectedProduct.name}" has no available units remaining.`);
      return;
    }
    if (finalQty > availableStock) {
      alert(`Cannot add ${finalQty} units. Only ${availableStock} units available in stock!`);
      return;
    }

    const existingItemIndex = billItems.findIndex(item => item.code === selectedProduct.code);
    if (existingItemIndex > -1) {
      const updated = [...billItems];
      updated[existingItemIndex].qty += finalQty;
      setBillItems(updated);
    } else {
      const newItem: BillItem = {
        id: 'item-' + Date.now(),
        name: selectedProduct.name,
        code: selectedProduct.code,
        qty: finalQty,
        unitPrice: selectedProduct.price,
        discountPercent: selectedProduct.discount ?? getDefaultDiscountFromSettings(),
        gstPercent: selectedProduct.gst
      };
      setBillItems([...billItems, newItem]);
    }
    setEntryQty('');
    setSearchQuery('');
    productSearchRef.current?.focus();
  };

  // Add frequent part directly
  const handleAddFrequentPart = (name: string, code: string, price: number, discount: number, gst: number) => {
    const catItem = catalog.find(p => p.code === code);
    const availableStock = getEffectiveStock(catItem || { code, stock: 100 });
    if (availableStock <= 0) {
      alert(`Out of Stock! Product "${name}" has no available units remaining.`);
      return;
    }

    const existingItemIndex = billItems.findIndex(item => item.code === code);
    if (existingItemIndex > -1) {
      const updated = [...billItems];
      updated[existingItemIndex].qty += 1;
      setBillItems(updated);
    } else {
      const newItem: BillItem = {
        id: 'item-' + Date.now(),
        name: name,
        code: code,
        qty: 1,
        unitPrice: price,
        discountPercent: discount ?? getDefaultDiscountFromSettings(),
        gstPercent: gst
      };
      setBillItems([...billItems, newItem]);
    }
  };

  // Delete item
  const handleDeleteItem = (id: string) => {
    setBillItems(billItems.filter(item => item.id !== id));
    if (editingItemId === id) {
      setEditingItemId(null);
    }
  };

  // Start inline editing of item
  const handleStartEdit = (item: BillItem) => {
    setEditingItemId(item.id);
    setEditQty(item.qty);
    setEditDiscount(item.discountPercent);
  };

  // Save inline edit
  const handleSaveEdit = (id: string) => {
    setBillItems(billItems.map(item => {
      if (item.id === id) {
        return {
          ...item,
          qty: Number(editQty),
          discountPercent: Number(editDiscount)
        };
      }
      return item;
    }));
    setEditingItemId(null);
  };

  // Clear entire form
  const handleClearForm = () => {
    if (window.confirm("Are you sure you want to clear the billing form?")) {
      setBillItems([]);
      setRemarks('');
      setCustomerName('');
      setCustomerType('Retail');
      setMobileNumber('');
      setSearchQuery('');
      setEntryQty('');
      setEditingDraftId(null);
      setEditingBillId(null);
    }
  };

  // Dynamic calculations
  const calculateItemValues = (item: BillItem) => {
    const subtotal = item.qty * item.unitPrice;
    const discountAmount = (subtotal * item.discountPercent) / 100;
    const taxableValue = subtotal - discountAmount;
    const gstAmount = (taxableValue * item.gstPercent) / 100;
    const total = taxableValue + gstAmount;

    return {
      subtotal,
      discountAmount,
      taxableValue,
      gstAmount,
      total
    };
  };

  // Totals calculations
  let calculatedSubtotal = 0;
  let calculatedDiscount = 0;
  let calculatedGst = 0;
  let calculatedGrandTotal = 0;

  billItems.forEach(item => {
    const vals = calculateItemValues(item);
    calculatedSubtotal += vals.subtotal;
    calculatedDiscount += vals.discountAmount;
    calculatedGst += vals.gstAmount;
    calculatedGrandTotal += vals.total;
  });

  // Filter products for catalog search
  const filteredCatalog = catalog.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper function to find matching HSN code
  const getHsnCode = (code: string) => {
    const item = catalog.find(p => p.code === code);
    return item ? item.hsn : "8708"; // default automotive spare parts hsn
  };

  // Indian Rupee number to words converter
  const convertNumberToWords = (num: number): string => {
    const a = [
      '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
      'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
    ];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const parts = num.toFixed(2).split('.');
    const integerPart = parseInt(parts[0], 10);
    const decimalPart = parseInt(parts[1], 10);

    const helper = (n: number): string => {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
      if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + helper(n % 100) : '');
      if (n < 100000) return helper(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + helper(n % 1000) : '');
      if (n < 10000000) return helper(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + helper(n % 100000) : '');
      return helper(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + helper(n % 10000000) : '');
    };

    let result = '';
    if (integerPart === 0) {
      result = 'Zero Rupees';
    } else {
      result = helper(integerPart) + ' Rupees';
    }

    if (decimalPart > 0) {
      result += ' and ' + helper(decimalPart) + ' Paise';
    }
    return result + ' Only';
  };

  // --- SAVE BILL & DRAFT HANDLERS ---
  const handleSaveBill = (shouldOpenPreview = false) => {
    if (billItems.length === 0) {
      alert('Please add at least one part item to save the bill!');
      return;
    }

    // Automatically deduct spare parts stock from inventory!
    deductInventoryStock(billItems, billNo, 'Counter Sales');

    const existingIndex = editingBillId
      ? totalBillsList.findIndex(b => b.id === editingBillId)
      : totalBillsList.findIndex(b => b.billNo === billNo);

    if (existingIndex >= 0) {
      const updatedRecord: CounterSalesRecord = {
        ...totalBillsList[existingIndex],
        billNo,
        customerName: customerName || 'Retail Customer',
        customerType,
        mobileNumber: mobileNumber || 'N/A',
        billItems: [...billItems],
        subtotal: calculatedSubtotal,
        discount: calculatedDiscount,
        gst: calculatedGst,
        grandTotal: calculatedGrandTotal,
        remarks,
        status: 'PAID'
      };

      setTotalBillsList(prev => {
        const updated = [...prev];
        updated[existingIndex] = updatedRecord;
        return updated;
      });

      if (editingDraftId) {
        setDraftBillsList(prev => prev.filter(d => d.id !== editingDraftId));
        setEditingDraftId(null);
      }
    } else {
      const newBill: CounterSalesRecord = {
        id: `cs-${Date.now()}`,
        billNo,
        customerName: customerName || 'Retail Customer',
        customerType,
        mobileNumber: mobileNumber || 'N/A',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        billItems: [...billItems],
        subtotal: calculatedSubtotal,
        discount: calculatedDiscount,
        gst: calculatedGst,
        grandTotal: calculatedGrandTotal,
        remarks,
        status: 'PAID',
        createdAt: new Date().toLocaleDateString()
      };

      setTotalBillsList(prev => [newBill, ...prev]);

      if (editingDraftId) {
        setDraftBillsList(prev => prev.filter(d => d.id !== editingDraftId));
        setEditingDraftId(null);
      }
      
      // Auto increment bill number only when creating a NEW bill
      let maxInvSeq = 2000;
      [...totalBillsList, ...draftBillsList].forEach(b => {
        if (b.billNo) {
          const match = b.billNo.match(new RegExp(`INV-${currentYear}-(2\\d{3})$`, 'i'));
          if (match) {
            const num = parseInt(match[1], 10);
            if (!isNaN(num) && num >= 2001 && num < 3000) {
              if (num > maxInvSeq) maxInvSeq = num;
            }
          }
        }
      });
      const nextBillNo = `INV-${currentYear}-${maxInvSeq + 1}`;
      setBillNo(nextBillNo);
    }

    // Permanently deduct spare parts stock from inventory & log Stock History
    try {
      const currentInv = getStoredInventory();
      let txns: any[] = [];
      try {
        const savedTxns = localStorage.getItem('dms_spare_parts_transactions');
        if (savedTxns) txns = JSON.parse(savedTxns);
      } catch (e) {}

      if (currentInv && currentInv.length > 0) {
        let updatedInv = [...currentInv];
        let inventoryChanged = false;

        billItems.forEach(item => {
          let invPart = updatedInv.find(p => p.partNumber.toLowerCase() === item.code.toLowerCase());
          if (!invPart) {
            invPart = updatedInv.find(p => p.partName.toLowerCase().includes(item.name.toLowerCase()) || item.name.toLowerCase().includes(p.partName.toLowerCase()));
          }

          if (invPart) {
            const currStock = parseInt(invPart.stock.replace(/[^0-9]/g, ''), 10) || 0;
            const newStock = Math.max(0, currStock - item.qty);
            invPart.stock = newStock.toString();
            invPart.stockStatus = newStock === 0 ? 'out' : newStock < 12 ? 'low' : 'normal';
            inventoryChanged = true;

            // Log outward transaction in Stock History
            txns.unshift({
              id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              partNumber: invPart.partNumber,
              partName: invPart.partName,
              type: 'Outward (Counter Sale)',
              quantity: `-${item.qty} Units`,
              reference: `Sale Bill #${billNo}`,
              date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              amount: `₹${(item.qty * item.unitPrice).toFixed(2)}`
            });
          }
        });

        if (inventoryChanged) {
          saveStoredInventory(updatedInv);
          try {
            localStorage.setItem('dms_spare_parts_transactions', JSON.stringify(txns));
          } catch (e) {}
          window.dispatchEvent(new Event('dms_inventory_updated'));
        }
      }
    } catch (e) {}

    if (shouldOpenPreview) {
      setShowInvoicePreview(true);
    } else {
      setBillItems([]);
      setRemarks('');
      setCustomerName('');
      setCustomerType('Retail');
      setMobileNumber('');
      setSearchQuery('');
      setEntryQty('');
      setEditingBillId(null);
      alert(`Counter Sales Bill ${billNo} saved successfully!`);
    }
  };

  const handleSaveDraft = () => {
    if (billItems.length === 0 && !customerName && !mobileNumber) {
      alert('Please add customer details or product items before saving draft!');
      return;
    }

    // Check if we are updating an existing draft that was explicitly loaded
    const existingIndex = editingDraftId ? draftBillsList.findIndex(d => d.id === editingDraftId) : -1;

    const draftBillNo = existingIndex >= 0 
      ? draftBillsList[existingIndex].billNo 
      : (billNo.includes('DRAFT') ? billNo : `${billNo}-DRAFT`);

    const draftRecord: CounterSalesRecord = {
      id: existingIndex >= 0 ? editingDraftId! : `cs-draft-${Date.now()}`,
      billNo: draftBillNo,
      customerName: customerName || 'Draft Customer',
      customerType,
      mobileNumber: mobileNumber || '',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      billItems: [...billItems],
      subtotal: calculatedSubtotal,
      discount: calculatedDiscount,
      gst: calculatedGst,
      grandTotal: calculatedGrandTotal,
      remarks,
      status: 'DRAFT',
      createdAt: new Date().toLocaleDateString()
    };

    if (existingIndex >= 0) {
      const updated = [...draftBillsList];
      updated[existingIndex] = draftRecord;
      setDraftBillsList(updated);
    } else {
      setDraftBillsList(prev => [draftRecord, ...prev]);
    }

    // Reset editing draft state
    setEditingDraftId(null);
    setEditingBillId(null);

    // Auto increment bill number so subsequent new drafts get unique numbers
    let maxInvSeq = 2000;
    [...totalBillsList, ...draftBillsList].forEach(b => {
      if (b.billNo) {
        const match = b.billNo.match(new RegExp(`INV-${currentYear}-(2\\d{3})$`, 'i'));
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num >= 2001 && num < 3000) {
            if (num > maxInvSeq) maxInvSeq = num;
          }
        }
      }
    });
    const nextBillNo = `INV-${currentYear}-${maxInvSeq + 1}`;
    setBillNo(nextBillNo);

    // Clear filled details from form
    setBillItems([]);
    setCustomerName('');
    setCustomerType('Retail');
    setMobileNumber('');
    setRemarks('');
    setSearchQuery('');
    setEntryQty('');

    alert(`Bill ${draftBillNo} saved as Draft and form cleared!`);
  };

  const handleLoadRecord = (record: CounterSalesRecord) => {
    if (record.status === 'DRAFT') {
      setEditingDraftId(record.id);
      setEditingBillId(null);
    } else {
      setEditingBillId(record.id);
      setEditingDraftId(null);
    }
    setBillNo(record.billNo.replace('-DRAFT', ''));
    setCustomerName(record.customerName || '');
    setCustomerType(record.customerType || 'Retail');
    setMobileNumber(record.mobileNumber || '');
    setRemarks(record.remarks || '');
    setBillItems(record.billItems || []);

    setShowTotalBillsModal(false);
    setShowDraftsModal(false);
  };

  const handleDeleteBill = (id: string) => {
    if (window.confirm('Are you sure you want to delete this sales bill from records?')) {
      setTotalBillsList(totalBillsList.filter(b => b.id !== id));
    }
  };

  const handleDeleteDraft = (id: string) => {
    if (window.confirm('Are you sure you want to delete this draft?')) {
      setDraftBillsList(draftBillsList.filter(d => d.id !== id));
    }
  };

  // If in Preview view, render the full-screen Tax Invoice page overlay
  if (showInvoicePreview) {
    return (
      <div className="flex-1 bg-slate-100 min-h-screen py-8 px-4 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6 overflow-y-auto box-border font-sans text-slate-800 relative select-text print:p-0 print:bg-white print:block">
        
        {/* Style block for clean printing hacks */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body {
              background: white !important;
              color: black !important;
            }
            /* Hide the main app wrappers, sidebar, navbar, and overlay header buttons */
            aside, header, .no-print, button {
              display: none !important;
            }
            .print-area {
              border: none !important;
              box-shadow: none !important;
              padding: 0 !important;
              margin: 0 !important;
              width: 100% !important;
              max-width: 100% !important;
              min-height: 0 !important;
              position: absolute;
              left: 0;
              top: 0;
            }
          }
        `}} />

        {/* INVOICE CONTAINER SHEET (printable) */}
        <div className="print-area w-full max-w-[800px] bg-white border-t-[8px] border-[#184edb] p-8 md:p-10 shadow-2xl relative box-border min-h-[1050px] flex flex-col justify-between print:shadow-none print:border-t-4 print:p-0 print:m-0 print:w-full print:min-h-0 bg-repeat">
          <div>
            
            {/* Top Corporate Brand Row */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-100 pb-6 w-full">
              <div className="flex gap-3 items-start">
                <div className="bg-[#184edb] text-white p-2 rounded-lg flex items-center justify-center min-w-[44px] h-[44px] overflow-hidden">
                  {companySettings?.logoUrl ? (
                    <img src={companySettings.logoUrl} alt="Logo" className="w-full h-full object-contain bg-white rounded p-0.5" />
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-black text-slate-800 font-heading tracking-wide">
                    {companySettings?.companyName || 'AutoPro Elite Motors'}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">
                    {companySettings?.dealerName || 'Authorized Dealership'}
                  </span>
                  
                  <div className="text-[11px] text-slate-400 font-semibold mt-3 flex flex-col gap-0.5 leading-relaxed">
                    <span>{companySettings?.streetAddress || 'Industrial Park West, Sector 12'}</span>
                    <span>
                      {companySettings?.city || 'Automotive City'}, {companySettings?.stateName || 'California'} {companySettings?.pinCode || '90210'}
                    </span>
                    <span>GSTIN: {companySettings?.gstNumber || '22AAAAA0000A1Z5'} • PAN: {companySettings?.panNumber || 'ABCDE1234F'}</span>
                    <span>Ph: {companySettings?.mobileNumber || companySettings?.phoneNum || '+1 (555) 012-3456'} • Email: {companySettings?.emailAddress || 'contact@company.com'}</span>
                    {companySettings?.websiteUrl && <span>Website: {companySettings.websiteUrl}</span>}
                  </div>
                </div>
              </div>

              {/* Tax Invoice Document details header box */}
              <div className="text-right flex flex-col items-end gap-3 min-w-[200px]">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight m-0 uppercase font-heading">
                  Tax Invoice
                </h1>

                <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50 flex flex-col gap-1.5 text-xs text-left w-full">
                  <div className="flex justify-between">
                    <span className="text-slate-450 font-semibold">Invoice No:</span>
                    <span className="text-slate-800 font-extrabold">INV-2024-0892</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-450 font-semibold">Date:</span>
                    <span className="text-slate-800 font-bold">Oct 24, 2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-450 font-semibold">Place of Supply:</span>
                    <span className="text-slate-800 font-bold">Karnataka (29)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bill To & Vehicle Details section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-6 border-b border-slate-100 text-xs w-full">
              
              {/* BILL TO */}
              <div className="sm:col-span-2 flex flex-col gap-1 pr-6 border-r border-slate-100 print:border-r">
                <span className="text-[10px] font-extrabold text-[#184edb] uppercase tracking-wider mb-1 block">Bill To</span>
                <span className="text-sm font-black text-slate-800">{customerName || 'Walk-in Customer'}</span>
                <span className="text-slate-500 font-medium mt-1">Ph: {mobileNumber || '+91 98765 43210'}</span>
                <span className="text-slate-500 font-medium">{customerName.toLowerCase().replace(/\s+/g, '') || 'customer'}@email.com</span>
                <span className="text-slate-400 font-semibold leading-relaxed mt-1">
                  45 Oakwood Residency, Indiranagar, Bangalore
                </span>
              </div>

              {/* VEHICLE DETAILS */}
              <div className="flex flex-col gap-1 pl-0 sm:pl-2">
                <span className="text-[10px] font-extrabold text-[#184edb] uppercase tracking-wider mb-1 block">Vehicle Details</span>
                <div className="flex flex-col gap-1 text-slate-650 font-semibold">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Reg No:</span>
                    <span className="text-slate-800 font-extrabold">KA 03 MS 4421</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Model:</span>
                    <span className="text-slate-800 font-bold">2023 Sedan (GT)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Odometer:</span>
                    <span className="text-slate-800 font-bold">12,450 km</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Invoice items Grid Table */}
            <div className="py-6 w-full">
              <table className="w-full border-collapse text-left text-slate-650 text-xs">
                <thead>
                  <tr className="bg-slate-50/70 border border-slate-200 text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">
                    <th className="py-3 px-3 text-center border-r border-slate-200">#</th>
                    <th className="py-3 px-4 border-r border-slate-200">Product / Service</th>
                    <th className="py-3 px-3 border-r border-slate-200">HSN/SAC</th>
                    <th className="py-3 px-3 text-center border-r border-slate-200">Qty</th>
                    <th className="py-3 px-3 border-r border-slate-200">Rate</th>
                    <th className="py-3 px-3 border-r border-slate-200">GST %</th>
                    <th className="py-3 px-4">Total</th>
                  </tr>
                </thead>
                <tbody className="border-x border-b border-slate-200 divide-y divide-slate-100 font-medium text-slate-700">
                  {billItems.map((item, idx) => {
                    const vals = calculateItemValues(item);
                    return (
                      <tr key={item.id}>
                        <td className="py-3 px-3 text-center border-r border-slate-200 text-slate-400 font-bold">
                          {String(idx + 1).padStart(2, '0')}
                        </td>
                        <td className="py-3 px-4 border-r border-slate-200 font-bold text-slate-850">
                          {item.name}
                        </td>
                        <td className="py-3 px-3 border-r border-slate-200 text-slate-450 font-bold">
                          {getHsnCode(item.code)}
                        </td>
                        <td className="py-3 px-3 text-center border-r border-slate-200 font-bold text-slate-800">
                          {item.qty} {item.code.includes('OIL') ? 'L' : item.code.includes('LABOR') ? 'Job' : 'Unit'}
                        </td>
                        <td className="py-3 px-3 border-r border-slate-200 font-semibold">
                          ₹{item.unitPrice.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 border-r border-slate-200 font-bold text-slate-500">
                          {item.gstPercent}%
                        </td>
                        <td className="py-3 px-4 font-extrabold text-slate-900 text-right">
                          ₹{vals.total.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                  {billItems.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-slate-400 italic">
                        No items billed.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Calculations and Terms and Conditions split layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start text-xs pt-4 w-full">
              
              {/* Left Column: Terms and Conditions */}
              <div className="md:col-span-7 bg-[#f8fafc] border border-slate-100 rounded-lg p-4 flex flex-col gap-2.5">
                <span className="text-[10px] font-extrabold text-[#184edb] uppercase tracking-wider block">
                  Terms & Conditions
                </span>
                
                <ul className="m-0 pl-4 text-[10px] text-slate-400 font-semibold leading-relaxed flex flex-col gap-1.5 list-disc">
                  <li>Warranty on parts applicable as per manufacturer policy.</li>
                  <li>Goods once sold cannot be returned after 48 hours.</li>
                  <li>Interest @18% p.a. will be charged for delayed payments.</li>
                  <li>Subject to Bangalore Jurisdiction only.</li>
                </ul>
              </div>

              {/* Right Column: Pricing breakdown */}
              <div className="md:col-span-5 flex flex-col gap-4 text-xs font-semibold text-slate-600">
                <div className="flex flex-col gap-2.5 border-b border-slate-200 pb-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sub Total</span>
                    <span className="text-slate-800 font-bold">₹{calculatedSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Discount ({customerType === 'Retail' ? '5%' : '0%'})</span>
                    <span className="text-red-500 font-bold">-₹{calculatedDiscount.toFixed(2)}</span>
                  </div>
                  
                  {/* CGST / SGST split details */}
                  <div className="flex justify-between">
                    <span className="text-slate-400">CGST (9%)</span>
                    <span className="text-slate-800 font-bold">₹{(calculatedGst / 2).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">SGST (9%)</span>
                    <span className="text-slate-800 font-bold">₹{(calculatedGst / 2).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">IGST (0%)</span>
                    <span className="text-slate-800 font-bold">₹0.00</span>
                  </div>
                </div>

                {/* Grand Total */}
                <div className="bg-[#f0f4ff] rounded-lg p-3.5 border border-[#d6e4ff] flex flex-col items-center">
                  <div className="flex justify-between w-full items-center">
                    <span className="text-[10px] font-black text-slate-450 uppercase tracking-wider">Grand Total</span>
                    <span className="text-lg font-black text-[#184edb] font-heading">
                      ₹{calculatedGrandTotal.toFixed(2)}
                    </span>
                  </div>
                  <span className="text-[9px] text-[#184edb] font-extrabold w-full text-center mt-2 pt-2 border-t border-blue-100 uppercase tracking-wide leading-normal">
                    {convertNumberToWords(calculatedGrandTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Signature lines block */}
            <div className="grid grid-cols-2 gap-10 mt-12 text-center text-xs font-semibold text-slate-500 pt-8 border-t border-slate-100 w-full">
              <div className="flex flex-col items-center">
                <div className="w-48 border-b border-slate-300 h-8" />
                <span className="mt-2 text-[10px] text-slate-400 font-bold">Customer Signature</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[11px] font-black italic text-[#184edb] select-none opacity-50">AutoCore DMS</span>
                <div className="w-48 border-b border-[#184edb]/50 h-3" />
                <span className="mt-2 text-[10px] text-[#184edb] font-extrabold uppercase tracking-wider">Authorized Signatory</span>
              </div>
            </div>

          </div>

          {/* Footer Text info */}
          <div className="text-center text-[10px] text-slate-400 font-semibold pt-10 border-t border-slate-100/50 w-full">
            <span>Thank you for choosing AutoCore DMS. For support, reach us at support@autocoredms.com</span>
          </div>

        </div>

        {/* SIDEBAR FLOATING ACTION PANEL (excluded from print) */}
        <div className="no-print flex flex-col gap-3 min-w-[200px] w-full max-w-[200px]">
          
          <button 
            onClick={() => {
              handleSaveBill(false);
              window.print();
              setShowInvoicePreview(false);
            }}
            className="w-full bg-[#184edb] hover:bg-[#143eb3] text-white py-3 px-4 rounded-xl text-xs font-black border-none cursor-pointer flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Printer size={16} />
            <span>Print Invoice</span>
          </button>

          <button 
            onClick={() => alert('Sending PDF invoice mail spool...')}
            className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 py-3 px-4 rounded-xl text-xs font-black cursor-pointer flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Mail size={16} />
            <span>Send via Email</span>
          </button>

          <button 
            onClick={() => alert('Downloading PDF receipt...')}
            className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 py-3 px-4 rounded-xl text-xs font-black cursor-pointer flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Download size={16} />
            <span>Download PDF</span>
          </button>

          <button 
            onClick={() => {
              setShowInvoicePreview(false);
            }}
            className="w-full bg-slate-200 hover:bg-slate-350 border-none text-slate-700 py-3 px-4 rounded-xl text-xs font-black cursor-pointer flex items-center justify-center gap-2 shadow-sm transition-all mt-4"
          >
            <ArrowLeft size={16} />
            <span>Back to Billing</span>
          </button>

        </div>

      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-8 flex flex-col gap-6 bg-[#f6f8fc] overflow-y-auto box-border max-w-full text-slate-700 text-left font-sans">
      
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight m-0 font-heading flex items-center gap-2">
            Generate New Bill
          </h1>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <p className="text-slate-500 text-[14px] font-medium m-0 font-sans">
              Spare Parts Direct Sales Terminal
            </p>
            <span className="text-slate-300">•</span>
            {/* Clickable Total Bills Badge */}
            <button
              type="button"
              onClick={() => setShowTotalBillsModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-[#184edb] border border-blue-200 rounded-md text-[12px] font-bold shadow-xs cursor-pointer transition-colors"
              title="Click to view all Total Bills"
            >
              <FileText size={13} />
              <span>Total Bills: {totalBillsList.length}</span>
            </button>

            {/* Clickable Drafts Badge */}
            <button
              type="button"
              onClick={() => setShowDraftsModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-md text-[12px] font-bold shadow-xs cursor-pointer transition-colors"
              title="Click to view all saved Drafts"
            >
              <Clock size={13} />
              <span>Draft: {draftBillsList.length}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleSaveBill()}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#184edb] hover:bg-[#133eb5] text-white font-bold text-[13px] border-none rounded-lg shadow-md cursor-pointer transition-colors"
          >
            <Save size={15} />
            <span>Save Bill</span>
          </button>

          <div className="bg-[#184edb] text-white px-4 py-2 rounded-lg flex flex-col items-center justify-center shadow-md">
            <span className="text-[8px] font-extrabold uppercase tracking-widest text-blue-100">Bill Number</span>
            <span className="text-sm font-extrabold tracking-tight mt-0.5">#{billNo}</span>
          </div>
        </div>
      </div>

      {/* Direct Quick Action Buttons & stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 w-full box-border">
        {/* NEW BILL */}
        <div 
          onClick={() => {
            setBillItems([]);
            setRemarks('');
            setCustomerName('');
            setMobileNumber('');
            setEditingDraftId(null);
            setEditingBillId(null);
          }}
          className="bg-[#0b46d1] hover:bg-[#093db5] rounded-xl p-4 shadow-sm flex items-center gap-3 cursor-pointer text-white transition-all transform hover:-translate-y-0.5"
        >
          <div className="bg-white/20 p-2 rounded-lg flex items-center justify-center">
            <Plus size={18} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-extrabold text-blue-100 uppercase tracking-widest">New Bill</span>
            <span className="text-xs font-bold mt-0.5">Start fresh entry</span>
          </div>
        </div>

        {/* Today's Sales */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-100 flex items-center gap-3">
          <div className="bg-blue-50 text-[#184edb] p-2 rounded-lg flex items-center justify-center">
            <TrendingUp size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Today's Sales</span>
            <span className="text-sm font-extrabold text-slate-800 tracking-tight mt-0.5">₹{totalBillsList.reduce((acc, b) => acc + b.grandTotal, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* Total Bills (CLICKABLE CARD) */}
        <div 
          onClick={() => setShowTotalBillsModal(true)}
          className="bg-white hover:bg-blue-50/50 rounded-xl p-4 shadow-xs border border-slate-100 hover:border-blue-200 flex items-center gap-3 cursor-pointer transition-all"
        >
          <div className="bg-indigo-50 text-indigo-600 p-2 rounded-lg flex items-center justify-center">
            <FileText size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Bills</span>
            <span className="text-sm font-extrabold text-slate-800 tracking-tight mt-0.5">{totalBillsList.length} Bills</span>
          </div>
        </div>

        {/* Drafts (CLICKABLE CARD) */}
        <div 
          onClick={() => setShowDraftsModal(true)}
          className="bg-white hover:bg-amber-50/50 rounded-xl p-4 shadow-xs border border-slate-100 hover:border-amber-200 flex items-center gap-3 cursor-pointer transition-all"
        >
          <div className="bg-amber-50 text-amber-600 p-2 rounded-lg flex items-center justify-center">
            <Clock size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Drafts</span>
            <span className="text-sm font-extrabold text-slate-800 tracking-tight mt-0.5">{draftBillsList.length} Drafts</span>
          </div>
        </div>

        {/* GST Collection */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-100 flex items-center gap-3">
          <div className="bg-emerald-50 text-emerald-600 p-2 rounded-lg flex items-center justify-center">
            <DollarSign size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">GST Collection</span>
            <span className="text-sm font-extrabold text-slate-800 tracking-tight mt-0.5">₹{totalBillsList.reduce((acc, b) => acc + b.gst, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      {/* Main Content Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full box-border items-start">
        
        {/* Left Side: Form Elements Column */}
        <div className="lg:col-span-2 flex flex-col gap-6 w-full box-border">
          
          {/* DIVISION 1 CONTAINER: Customer Information */}
          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="text-[#184edb] flex items-center"><Users size={18} /></span>
              <h3 className="text-base font-extrabold text-slate-800 m-0 flex items-center gap-2 font-heading">
                Customer Information
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Customer Search Input */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-[11.5px] font-bold text-slate-400 uppercase tracking-wide font-sans">
                  Customer Name / Search
                </label>
                <div className="relative flex items-center">
                  <Search className="absolute right-3.5 text-slate-400" size={14} />
                  <input 
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-[13.5px] font-semibold text-slate-700 focus:outline-none focus:border-[#184edb] bg-slate-50 focus:bg-white transition-all font-sans"
                  />
                </div>
              </div>

              {/* Customer Type Select */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11.5px] font-bold text-slate-400 uppercase tracking-wide font-sans">
                  Customer Type
                </label>
                <select
                  value={customerType}
                  onChange={(e) => setCustomerType(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-[13.5px] font-semibold text-slate-700 cursor-pointer outline-none focus:border-[#184edb] bg-slate-50 focus:bg-white transition-all font-sans"
                >
                  <option>Retail</option>
                  <option>Wholesale</option>
                  <option>Corporate</option>
                  <option>Walk-In</option>
                </select>
              </div>

              {/* Mobile Number Input */}
              <div className="flex flex-col gap-1.5 sm:col-span-3">
                <label className="text-[11.5px] font-bold text-slate-400 uppercase tracking-wide font-sans">
                  Mobile Number
                </label>
                <input 
                  type="text"
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-[13.5px] font-semibold text-slate-700 outline-none focus:border-[#184edb] bg-slate-50 focus:bg-white transition-all font-sans"
                />
              </div>
            </div>
          </div>

          {/* DIVISION 2 CONTAINER: Product Entry */}
          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="text-[#184edb] flex items-center"><ShoppingBag size={18} /></span>
              <h3 className="text-base font-extrabold text-slate-800 m-0 flex items-center gap-2 font-heading">
                Product Entry
              </h3>
            </div>

            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                {/* Search Product (Name or Code) */}
                <div className="flex flex-col gap-1.5 sm:col-span-2 relative" ref={productSearchContainerRef}>
                  <label className="text-[11.5px] font-bold text-slate-400 uppercase tracking-wide font-sans">
                    Search Product (Name or Code)
                  </label>
                  <div className="relative flex items-center">
                    <Search className="absolute left-3 text-slate-400" size={14} />
                    <input 
                      ref={productSearchRef}
                      type="text"
                      placeholder="Start typing product name..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowProductDropdown(true);
                        setHighlightedIndex(0);
                      }}
                      onFocus={() => {
                        setShowProductDropdown(true);
                        setHighlightedIndex(0);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'ArrowDown') {
                          e.preventDefault();
                          setHighlightedIndex(prev => (filteredCatalog.length > 0 ? (prev + 1) % filteredCatalog.length : 0));
                        } else if (e.key === 'ArrowUp') {
                          e.preventDefault();
                          setHighlightedIndex(prev => (filteredCatalog.length > 0 ? (prev - 1 + filteredCatalog.length) % filteredCatalog.length : 0));
                        } else if (e.key === 'Enter') {
                          e.preventDefault();
                          if (filteredCatalog.length > 0) {
                            const prod = filteredCatalog[highlightedIndex] || filteredCatalog[0];
                            handleSelectProduct(prod);
                          }
                        } else if (e.key === 'Escape') {
                          setShowProductDropdown(false);
                        }
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-9 pr-3.5 text-xs font-semibold text-slate-700 outline-none focus:border-[#184edb] focus:bg-white transition-all"
                    />
                  </div>

                  {/* Dropdown Match Results */}
                  {showProductDropdown && (
                    <div className="absolute top-[56px] left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg z-30 max-h-48 overflow-y-auto box-border p-1 flex flex-col gap-0.5">
                      {filteredCatalog.map((product, index) => {
                        const effStock = getEffectiveStock(product);
                        return (
                          <div 
                            key={product.code}
                            onClick={() => handleSelectProduct(product)}
                            onMouseEnter={() => setHighlightedIndex(index)}
                            className={`px-3 py-2 text-xs cursor-pointer rounded-md flex justify-between items-center font-medium transition-colors ${
                              index === highlightedIndex ? 'bg-[#184edb] text-white' : 'hover:bg-slate-50 text-slate-800'
                            }`}
                          >
                            <div className="flex flex-col">
                              <span className={index === highlightedIndex ? 'text-white font-bold' : 'text-slate-800 font-bold'}>{product.name}</span>
                              <span className={index === highlightedIndex ? 'text-blue-100 text-[10.5px] font-semibold' : 'text-slate-500 text-[10.5px] font-semibold'}>
                                Stock Available: {effStock} Units
                              </span>
                            </div>
                            <span className={index === highlightedIndex ? 'text-blue-100 font-extrabold' : 'text-slate-400 font-extrabold'}>{product.code}</span>
                          </div>
                        );
                      })}
                      {filteredCatalog.length === 0 && (
                        <span className="p-2 text-xs text-slate-400 italic text-center">No matching products found</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Quantity */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11.5px] font-bold text-slate-400 uppercase tracking-wide font-sans">
                    Quantity
                  </label>
                  <input 
                    ref={quantityInputRef}
                    type="number"
                    step="1"
                    min="1"
                    data-no-focus-shift="true"
                    value={entryQty}
                    onChange={(e) => {
                      if (e.target.value === '') {
                        setEntryQty('');
                        return;
                      }
                      const val = parseInt(e.target.value, 10);
                      setEntryQty(isNaN(val) ? 1 : Math.max(1, val));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddProduct();
                      }
                    }}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-[13.5px] font-semibold text-slate-700 text-center outline-none focus:border-[#184edb] bg-slate-50 focus:bg-white transition-all font-sans"
                  />
                </div>

                {/* Add Product Button */}
                <button 
                  onClick={handleAddProduct}
                  className="w-full bg-[#184edb] hover:bg-[#143eb3] text-white py-2 px-4 rounded-lg text-xs font-extrabold border-none cursor-pointer flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                >
                  <Plus size={16} />
                  <span>Add Product</span>
                </button>
              </div>

              {/* Part Code preview row */}
              {selectedProduct ? (
                <div className="bg-[#f8fafc] border border-slate-100 rounded-lg p-3 grid grid-cols-5 text-center gap-2">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">Part Code</span>
                    <span className="text-xs font-bold text-[#184edb] mt-0.5">{selectedProduct.code || '-'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">Stock Available</span>
                    <span className={`text-xs font-bold mt-0.5 ${getEffectiveStock(selectedProduct) === 0 ? 'text-rose-600 font-extrabold' : 'text-slate-700'}`}>
                      {getEffectiveStock(selectedProduct)} Units
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">Unit Price</span>
                    <span className="text-xs font-bold text-slate-700 mt-0.5">₹{(selectedProduct.price || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">Discount %</span>
                    <span className="text-xs font-bold text-red-500 mt-0.5">{selectedProduct.discount ?? 0}%</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">GST %</span>
                    <span className="text-xs font-bold text-slate-700 mt-0.5">{selectedProduct.gst ?? 18}%</span>
                  </div>
                </div>
              ) : (
                <div className="bg-[#f8fafc] border border-slate-100 rounded-lg p-3 text-center text-xs font-bold text-slate-400">
                  Select a product from the list to preview details
                </div>
              )}
            </div>
          </div>

          {/* DIVISION 3 CONTAINER: Product List Table */}
          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs flex flex-col gap-4">
            <div className="overflow-x-auto w-full">
              <table className="w-full border-collapse text-left text-slate-650 text-[13.5px]">
                <thead>
                  <tr className="bg-[#f8fafc] border-b border-slate-200 text-[11.5px] font-bold text-slate-800 uppercase tracking-wider font-heading">
                    <th className="py-3.5 px-4 font-bold">Product Name</th>
                    <th className="py-3.5 px-3 font-bold">Code</th>
                    <th className="py-3.5 px-3 font-bold text-center">Qty</th>
                    <th className="py-3.5 px-3 font-bold">Unit Price</th>
                    <th className="py-3.5 px-3 font-bold">Discount</th>
                    <th className="py-3.5 px-3 font-bold">Tax (GST)</th>
                    <th className="py-3.5 px-3 font-bold">Total</th>
                    <th className="py-3.5 px-4 font-bold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {billItems.map(item => {
                    const vals = calculateItemValues(item);
                    const isEditing = editingItemId === item.id;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/30 transition-colors">
                        
                        {/* Name */}
                        <td className="py-3.5 px-4 font-bold text-slate-800 max-w-[180px] break-words">
                          {item.name}
                        </td>

                        {/* Code */}
                        <td className="py-3.5 px-3 whitespace-nowrap text-slate-400 font-semibold text-[11px]">
                          {item.code}
                        </td>

                        {/* Qty */}
                        <td className="py-3.5 px-3 text-center">
                          {isEditing ? (
                            <input 
                              type="number"
                              step="1"
                              min="1"
                              value={editQty}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                setEditQty(isNaN(val) ? 1 : Math.max(1, val));
                              }}
                              className="w-12 bg-white border border-slate-200 rounded p-1 text-center text-xs font-bold outline-none"
                            />
                          ) : (
                            <span className="font-extrabold text-slate-800">{item.qty}</span>
                          )}
                        </td>

                        {/* Unit Price */}
                        <td className="py-3.5 px-3 whitespace-nowrap text-slate-700 font-semibold">
                          ₹{item.unitPrice.toFixed(2)}
                        </td>

                        {/* Discount */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              <input 
                                type="number"
                                min="0"
                                max="100"
                                value={editDiscount}
                                onChange={(e) => setEditDiscount(Math.min(100, Math.max(0, Number(e.target.value))))}
                                className="w-12 bg-white border border-slate-200 rounded p-1 text-center text-xs font-bold outline-none"
                              />
                              <span className="text-[10px] text-slate-400">%</span>
                            </div>
                          ) : (
                            <div className="flex flex-col">
                              <span className="text-red-500 font-bold">-₹{vals.discountAmount.toFixed(2)}</span>
                              {item.discountPercent > 0 && (
                                <span className="text-[9px] text-slate-400 font-semibold">({item.discountPercent}%)</span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Tax (GST) */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-slate-700 font-semibold">₹{vals.gstAmount.toFixed(2)}</span>
                            <span className="text-[9px] text-slate-400 font-semibold">({item.gstPercent}%)</span>
                          </div>
                        </td>

                        {/* Total */}
                        <td className="py-3.5 px-3 whitespace-nowrap font-extrabold text-[#184edb]">
                          ₹{vals.total.toFixed(2)}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {isEditing ? (
                              <>
                                <button 
                                  onClick={() => handleSaveEdit(item.id)}
                                  className="p-1 bg-emerald-50 hover:bg-emerald-100 rounded text-emerald-600 border-none cursor-pointer flex items-center justify-center transition-colors"
                                >
                                  <Save size={12} />
                                </button>
                                <button 
                                  onClick={() => setEditingItemId(null)}
                                  className="p-1 bg-slate-50 hover:bg-slate-100 rounded text-slate-500 border-none cursor-pointer flex items-center justify-center transition-colors"
                                >
                                  <X size={12} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button 
                                  onClick={() => handleStartEdit(item)}
                                  className="p-1 bg-slate-50 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-700 border-none cursor-pointer flex items-center justify-center transition-colors"
                                >
                                  <Edit2 size={12} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="p-1 bg-red-50 hover:bg-red-100 rounded text-red-500 hover:text-red-700 border-none cursor-pointer flex items-center justify-center transition-colors"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {billItems.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                        No products added to the invoice yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* DIVISION 4 CONTAINER: Bill Remarks */}
          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs flex flex-col gap-3">
            <label className="text-[11.5px] font-bold text-slate-400 uppercase tracking-wide font-sans">
              Bill Remarks
            </label>
            <textarea 
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add any special instructions or customer notes here..."
              rows={3}
              className="w-full p-2.5 border border-slate-200 rounded-lg text-[13.5px] font-semibold text-slate-700 outline-none focus:border-[#184edb] bg-slate-50 focus:bg-white transition-all font-sans resize-none"
            />
          </div>
        </div>

        {/* Right Side: Bill Summary & Frequent Parts Column */}
        <div className="flex flex-col gap-6 w-full box-border">
          
          {/* DIVISION 5 CONTAINER: Bill Summary */}
          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="text-[#184edb] flex items-center"><FileText size={18} /></span>
              <h3 className="text-base font-extrabold text-slate-800 m-0 flex items-center gap-2 font-heading">
                Bill Summary
              </h3>
            </div>

            {/* Calculations Breakdown */}
            <div className="flex flex-col gap-2.5 text-xs font-semibold text-slate-600 border-b border-slate-100 pb-4">
              <div className="flex justify-between">
                <span>Sub Total</span>
                <span className="text-slate-800 font-bold">₹{calculatedSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Discount</span>
                <span className="text-red-500 font-bold">-₹{calculatedDiscount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total GST (18%)</span>
                <span className="text-slate-800 font-bold">₹{calculatedGst.toFixed(2)}</span>
              </div>
            </div>

            {/* Grand Total */}
            <div className="flex flex-col gap-1 items-center py-2">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Grand Total</span>
              <span className="text-3xl font-extrabold text-[#184edb] tracking-tight font-heading mt-0.5">
                ₹{calculatedGrandTotal.toFixed(2)}
              </span>
            </div>
            {/* Print/Save Buttons */}
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => setShowInvoicePreview(true)}
                disabled={billItems.length === 0}
                className="w-full bg-[#184edb] hover:bg-[#143eb3] disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 px-4 rounded-lg text-xs font-extrabold border-none cursor-pointer flex items-center justify-center gap-2 shadow-md transition-colors"
              >
                <Printer size={15} />
                <span>Generate & Print Bill</span>
              </button>

              <button 
                onClick={handleSaveDraft}
                disabled={billItems.length === 0 && !customerName && !mobileNumber}
                className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 py-2.5 px-4 rounded-lg text-xs font-extrabold cursor-pointer flex items-center justify-center gap-2 transition-colors"
              >
                <Save size={15} />
                <span>Save as Draft</span>
              </button>

              <div className="grid grid-cols-2 gap-2 mt-1">
                <button 
                  onClick={handleClearForm}
                  className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 py-2 rounded-lg text-xs font-extrabold cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RefreshCw size={12} />
                  <span>Clear Form</span>
                </button>

                <button 
                  onClick={() => {
                    if (window.confirm("Cancel this checkout session? All changes will be discarded.")) {
                      setBillItems([]);
                      setRemarks('');
                    }
                  }}
                  className="w-full bg-red-50/50 hover:bg-red-50 text-red-500 border border-red-100 rounded-lg py-2 text-xs font-extrabold cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                >
                  <X size={12} />
                  <span>Cancel</span>
                </button>
              </div>
            </div>

            {/* Security Alert Badge */}
            <div className="bg-[#f8fafc] border border-slate-100 rounded-lg p-3 flex gap-2 items-start mt-1">
              <span className="text-[#184edb] mt-0.5"><Info size={13} /></span>
              <p className="text-[10px] text-slate-400 font-semibold m-0 leading-normal">
                Securely processed by FleetManager Cloud. All transactions are encrypted.
              </p>
            </div>
          </div>

          {/* DIVISION 6 CONTAINER: Frequent Parts */}
          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="text-[#184edb] flex items-center"><ShoppingBag size={18} /></span>
              <h3 className="text-base font-extrabold text-slate-800 m-0 flex items-center gap-2 font-heading">
                Frequent Parts
              </h3>
            </div>

            <div className="flex flex-col gap-2">
              <div 
                onClick={() => handleAddFrequentPart('Oil Filter - V6 Engine', 'OF-V6-33', 35.00, 0, 18)}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:border-[#184edb] hover:bg-slate-50/50 cursor-pointer transition-all"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800">Oil Filter - V6 Engine</span>
                  <span className="text-[9px] text-slate-400 font-semibold mt-0.5">OF-V6-33 | Price: ₹35.00</span>
                </div>
                <button className="p-1 bg-blue-50 text-[#184edb] rounded-full border-none cursor-pointer flex items-center justify-center">
                  <Plus size={14} />
                </button>
              </div>

              <div 
                onClick={() => handleAddFrequentPart('Standard Spark Plug', 'SP-STD-02', 15.00, 0, 18)}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:border-[#184edb] hover:bg-slate-50/50 cursor-pointer transition-all"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800">Standard Spark Plug</span>
                  <span className="text-[9px] text-slate-400 font-semibold mt-0.5">SP-STD-02 | Price: ₹15.00</span>
                </div>
                <button className="p-1 bg-blue-50 text-[#184edb] rounded-full border-none cursor-pointer flex items-center justify-center">
                  <Plus size={14} />
                </button>
              </div>

              <div 
                onClick={() => handleAddFrequentPart('Coolant 1L - Green', 'CL-GR-01', 25.00, 0, 18)}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:border-[#184edb] hover:bg-slate-50/50 cursor-pointer transition-all"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800">Coolant 1L - Green</span>
                  <span className="text-[9px] text-slate-400 font-semibold mt-0.5">CL-GR-01 | Price: ₹25.00</span>
                </div>
                <button className="p-1 bg-blue-50 text-[#184edb] rounded-full border-none cursor-pointer flex items-center justify-center">
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* TOTAL BILLS MODAL */}
      {showTotalBillsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-100 text-[#184edb] rounded-lg">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 m-0 font-heading">Total Counter Sales Bills</h3>
                  <p className="text-xs text-slate-500 m-0 font-medium">Showing {totalBillsList.length} total generated sales bills</p>
                </div>
              </div>
              <button
                onClick={() => setShowTotalBillsModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search & Stats Bar */}
            <div className="p-4 border-b border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-72">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by Bill No, Customer, Mobile..."
                  value={searchBillsTerm}
                  onChange={(e) => setSearchBillsTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg font-semibold text-slate-700 focus:outline-none focus:border-[#184edb]"
                />
              </div>
              <div className="text-xs font-bold text-[#184edb] bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                Total Revenue: ₹{totalBillsList.reduce((acc, b) => acc + b.grandTotal, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>

            {/* Table Body */}
            <div className="flex-1 overflow-y-auto p-4">
              {totalBillsList.length === 0 ? (
                <div className="text-center py-12 text-slate-400 font-semibold">
                  No counter sales bills generated yet. Save a bill to see it here!
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-3 px-3">Bill No</th>
                      <th className="py-3 px-3">Customer Name</th>
                      <th className="py-3 px-3">Type</th>
                      <th className="py-3 px-3">Mobile No</th>
                      <th className="py-3 px-3 text-right">Grand Total</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {totalBillsList
                      .filter(b =>
                        b.billNo.toLowerCase().includes(searchBillsTerm.toLowerCase()) ||
                        b.customerName.toLowerCase().includes(searchBillsTerm.toLowerCase()) ||
                        b.mobileNumber.toLowerCase().includes(searchBillsTerm.toLowerCase())
                      )
                      .map((b) => (
                        <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-3 font-bold text-[#184edb]">{b.billNo}</td>
                          <td className="py-3 px-3 font-bold text-slate-800">{b.customerName}</td>
                          <td className="py-3 px-3 text-slate-500">{b.customerType}</td>
                          <td className="py-3 px-3 font-mono text-slate-600">{b.mobileNumber}</td>
                          <td className="py-3 px-3 text-right font-bold text-slate-900">₹{b.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          <td className="py-3 px-3 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-600 border border-emerald-200">
                              {b.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleLoadRecord(b)}
                                className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-[#184edb] font-bold text-[11px] rounded border border-blue-100 cursor-pointer transition-colors"
                              >
                                <FolderOpen size={12} />
                                <span>Open</span>
                              </button>
                              <button
                                onClick={() => handleDeleteBill(b.id)}
                                className="p-1 text-rose-500 hover:bg-rose-50 rounded cursor-pointer transition-colors"
                                title="Delete Bill"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                onClick={() => setShowTotalBillsModal(false)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DRAFTS LIST MODAL */}
      {showDraftsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-amber-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                  <Clock size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 m-0 font-heading">Saved Sales Drafts</h3>
                  <p className="text-xs text-slate-500 m-0 font-medium">Click "Load Draft" to restore any saved draft into the billing form</p>
                </div>
              </div>
              <button
                onClick={() => setShowDraftsModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Table Body */}
            <div className="flex-1 overflow-y-auto p-4">
              {draftBillsList.length === 0 ? (
                <div className="text-center py-12 text-slate-400 font-semibold">
                  No saved drafts found. Click the "Draft" button at the top to save your work in progress.
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-3 px-3">Draft Ref</th>
                      <th className="py-3 px-3">Customer Name</th>
                      <th className="py-3 px-3">Mobile No</th>
                      <th className="py-3 px-3 text-right">Items</th>
                      <th className="py-3 px-3 text-right">Draft Total</th>
                      <th className="py-3 px-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {draftBillsList.map((d) => (
                      <tr key={d.id} className="hover:bg-amber-50/30 transition-colors">
                        <td className="py-3 px-3 font-bold text-amber-800">{d.billNo}</td>
                        <td className="py-3 px-3 font-bold text-slate-800">{d.customerName}</td>
                        <td className="py-3 px-3 font-mono text-slate-600">{d.mobileNumber || 'N/A'}</td>
                        <td className="py-3 px-3 text-right text-slate-500">{d.billItems.length} parts</td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900">₹{d.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleLoadRecord(d)}
                              className="flex items-center gap-1 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] rounded shadow-xs cursor-pointer transition-colors"
                            >
                              <FolderOpen size={13} />
                              <span>Load Draft</span>
                            </button>
                            <button
                              onClick={() => handleDeleteDraft(d.id)}
                              className="p-1 text-rose-500 hover:bg-rose-50 rounded cursor-pointer transition-colors"
                              title="Delete Draft"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                onClick={() => setShowDraftsModal(false)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CounterSales;
