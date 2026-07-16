import React, { useState, useRef } from 'react';
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
  Hash,
  ShoppingBag,
  Info,
  Users,
  Mail,
  Download,
  ArrowLeft
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

export const CounterSales: React.FC = () => {
  // Navigation overlay toggle
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);

  // Customer details state
  const [customerName, setCustomerName] = useState('');
  const [customerType, setCustomerType] = useState('Retail');
  const [mobileNumber, setMobileNumber] = useState('');
  const [remarks, setRemarks] = useState('');

  // Bill items state initialized with the mockup items
  const [billItems, setBillItems] = useState<BillItem[]>([]);

  // Product Catalog for Search/Select dropdown
  const productCatalog = [
    { name: "Synthetic Engine Oil (5W-40) | Part No: AC-OIL-772", code: "AC-OIL-772", price: 850.00, stock: 124, discount: 5, gst: 18, hsn: "2710" },
    { name: "High-Flow Air Filter | Part No: AF-K7-001", code: "AF-K7-001", price: 2400.00, stock: 45, discount: 5, gst: 28, hsn: "8421" },
    { name: "Periodic Maintenance Labor | Service: 20K Checkup", code: "PM-LABOR-01", price: 1500.00, stock: 80, discount: 5, gst: 18, hsn: "9987" },
    { name: "Brake Pad Set - Front Performance", code: "BP-992-FR", price: 120.00, stock: 150, discount: 10, gst: 18, hsn: "8708" },
    { name: "Oil Filter - V6 Engine", code: "OF-V6-33", price: 35.00, stock: 300, discount: 0, gst: 18, hsn: "8421" },
    { name: "Standard Spark Plug", code: "SP-STD-02", price: 15.00, stock: 90, discount: 0, gst: 18, hsn: "8511" },
    { name: "Coolant 1L - Green", code: "CL-GR-01", price: 25.00, stock: 200, discount: 0, gst: 18, hsn: "3820" }
  ];

  // Active product entry selection
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(productCatalog[0]);
  const [entryQty, setEntryQty] = useState<number | ''>('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const productSearchRef = useRef<HTMLInputElement>(null);
  const quantityInputRef = useRef<HTMLInputElement>(null);

  // Edit item state
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState(1);
  const [editDiscount, setEditDiscount] = useState(0);

  // Handle selecting product from dropdown
  const handleSelectProduct = (product: typeof productCatalog[0]) => {
    setSelectedProduct(product);
    setSearchQuery(product.name);
    setShowProductDropdown(false);
  };

  // Add selected product to bill
  const handleAddProduct = () => {
    const finalQty = entryQty === '' ? 1 : entryQty;
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
        discountPercent: selectedProduct.discount,
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
        discountPercent: discount,
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
  const filteredCatalog = productCatalog.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper function to find matching HSN code
  const getHsnCode = (code: string) => {
    const item = productCatalog.find(p => p.code === code);
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
                <div className="bg-[#184edb] text-white p-2.5 rounded-lg flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-black text-slate-800 font-heading tracking-wide">AutoCore DMS</span>
                  <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">Premium Automotive Solutions</span>
                  
                  <div className="text-[11px] text-slate-400 font-semibold mt-3 flex flex-col gap-0.5 leading-relaxed">
                    <span>128 Tech Park, Sector 45</span>
                    <span>Bangalore, KA 560001, India</span>
                    <span>GSTIN: 29AAAAA0000A1Z5</span>
                    <span>Ph: +91 80 4567 8900</span>
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
            onClick={() => window.print()}
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
            onClick={() => setShowInvoicePreview(false)}
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
          <h1 className="text-2xl font-extrabold text-[#111827] m-0 tracking-tight font-heading flex items-center gap-2">
            Generate New Bill
          </h1>
          <p className="text-xs text-slate-400 font-semibold mt-1 uppercase tracking-wider">
            Spare Parts Direct Sales Terminal
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Current Date</span>
            <span className="text-xs font-extrabold text-slate-700 mt-0.5 block">Oct 24, 2023</span>
          </div>

          <div className="bg-[#184edb] text-white px-5 py-2.5 rounded-lg flex flex-col items-center justify-center shadow-md">
            <span className="text-[8px] font-extrabold uppercase tracking-widest text-blue-100">Bill Number</span>
            <span className="text-sm font-extrabold tracking-tight mt-0.5">#INV-2023-8842</span>
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
            <span className="text-sm font-extrabold text-slate-800 tracking-tight mt-0.5">$12,450.00</span>
          </div>
        </div>

        {/* Total Bills */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-100 flex items-center gap-3">
          <div className="bg-indigo-50 text-indigo-600 p-2 rounded-lg flex items-center justify-center">
            <FileText size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Bills</span>
            <span className="text-sm font-extrabold text-slate-800 tracking-tight mt-0.5">42</span>
          </div>
        </div>

        {/* Total Amount */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-100 flex items-center gap-3">
          <div className="bg-emerald-50 text-emerald-600 p-2 rounded-lg flex items-center justify-center">
            <DollarSign size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Amount</span>
            <span className="text-sm font-extrabold text-slate-800 tracking-tight mt-0.5">$142,880.50</span>
          </div>
        </div>

        {/* GST Collection */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-100 flex items-center gap-3">
          <div className="bg-amber-50 text-amber-600 p-2 rounded-lg flex items-center justify-center">
            <Hash size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">GST Collection</span>
            <span className="text-sm font-extrabold text-slate-800 tracking-tight mt-0.5">$2,241.00</span>
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
              <span className="text-[#184edb] flex items-center"><Users size={16} /></span>
              <h2 className="text-[13.5px] font-extrabold text-slate-800 uppercase tracking-wider m-0 font-heading">
                Customer Information
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Customer Search Input */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">
                  Customer Name / Search
                </label>
                <div className="relative flex items-center">
                  <Search className="absolute right-3.5 text-slate-400" size={14} />
                  <input 
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3.5 pr-10 text-xs font-semibold text-slate-700 outline-none focus:border-[#184edb] focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Customer Type Select */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">
                  Customer Type
                </label>
                <select
                  value={customerType}
                  onChange={(e) => setCustomerType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3.5 text-xs font-semibold text-slate-700 cursor-pointer outline-none focus:border-[#184edb] focus:bg-white transition-all"
                >
                  <option>Retail</option>
                  <option>Wholesale</option>
                  <option>Corporate</option>
                  <option>Walk-In</option>
                </select>
              </div>

              {/* Mobile Number Input */}
              <div className="flex flex-col gap-1.5 sm:col-span-3">
                <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">
                  Mobile Number
                </label>
                <input 
                  type="text"
                  placeholder="e.g. +1 234 567 8900"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3.5 text-xs font-semibold text-slate-700 outline-none focus:border-[#184edb] focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* DIVISION 2 CONTAINER: Product Entry */}
          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="text-[#184edb] flex items-center"><ShoppingBag size={16} /></span>
              <h2 className="text-[13.5px] font-extrabold text-slate-800 uppercase tracking-wider m-0 font-heading">
                Product Entry
              </h2>
            </div>

            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                {/* Search Product (Name or Code) */}
                <div className="flex flex-col gap-1.5 sm:col-span-2 relative">
                  <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">
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
                      }}
                      onFocus={() => setShowProductDropdown(true)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (filteredCatalog.length > 0) {
                            handleSelectProduct(filteredCatalog[0]);
                          }
                          quantityInputRef.current?.focus();
                        }
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-9 pr-3.5 text-xs font-semibold text-slate-700 outline-none focus:border-[#184edb] focus:bg-white transition-all"
                    />
                  </div>

                  {/* Dropdown Match Results */}
                  {showProductDropdown && searchQuery && (
                    <div className="absolute top-[56px] left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg z-30 max-h-48 overflow-y-auto box-border p-1 flex flex-col gap-0.5">
                      {filteredCatalog.map(product => (
                        <div 
                          key={product.code}
                          onClick={() => handleSelectProduct(product)}
                          className="px-3 py-2 text-xs hover:bg-slate-50 cursor-pointer rounded-md flex justify-between font-medium"
                        >
                          <span className="text-slate-800">{product.name}</span>
                          <span className="text-slate-400 font-extrabold">{product.code}</span>
                        </div>
                      ))}
                      {filteredCatalog.length === 0 && (
                        <span className="p-2 text-xs text-slate-400 italic text-center">No matching products found</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Quantity */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-slate-455 uppercase tracking-wider">
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs font-semibold text-slate-700 text-center outline-none focus:border-[#184edb] focus:bg-white transition-all"
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
              <div className="bg-[#f8fafc] border border-slate-100 rounded-lg p-3 grid grid-cols-5 text-center gap-2">
                <div className="flex flex-col">
                  <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">Part Code</span>
                  <span className="text-xs font-bold text-[#184edb] mt-0.5">{selectedProduct.code}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">Stock Available</span>
                  <span className="text-xs font-bold text-slate-700 mt-0.5">{selectedProduct.stock} Units</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">Unit Price</span>
                  <span className="text-xs font-bold text-slate-700 mt-0.5">${selectedProduct.price.toFixed(2)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">Discount %</span>
                  <span className="text-xs font-bold text-red-500 mt-0.5">{selectedProduct.discount}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">GST %</span>
                  <span className="text-xs font-bold text-slate-700 mt-0.5">{selectedProduct.gst}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* DIVISION 3 CONTAINER: Product List Table */}
          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs flex flex-col gap-4">
            <div className="overflow-x-auto w-full">
              <table className="w-full border-collapse text-left text-slate-650 text-[12px]">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-3">Code</th>
                    <th className="py-3 px-3 text-center">Qty</th>
                    <th className="py-3 px-3">Unit Price</th>
                    <th className="py-3 px-3">Discount</th>
                    <th className="py-3 px-3">Tax (GST)</th>
                    <th className="py-3 px-3">Total</th>
                    <th className="py-3 px-4 text-center">Actions</th>
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
                          ${item.unitPrice.toFixed(2)}
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
                              <span className="text-red-500 font-bold">-${vals.discountAmount.toFixed(2)}</span>
                              {item.discountPercent > 0 && (
                                <span className="text-[9px] text-slate-400 font-semibold">({item.discountPercent}%)</span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Tax (GST) */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-slate-700 font-semibold">${vals.gstAmount.toFixed(2)}</span>
                            <span className="text-[9px] text-slate-400 font-semibold">({item.gstPercent}%)</span>
                          </div>
                        </td>

                        {/* Total */}
                        <td className="py-3.5 px-3 whitespace-nowrap font-extrabold text-[#184edb]">
                          ${vals.total.toFixed(2)}
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
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              Bill Remarks
            </label>
            <textarea 
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add any special instructions or customer notes here..."
              rows={3}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-semibold text-slate-700 outline-none focus:border-[#184edb] focus:bg-white transition-all font-sans resize-none"
            />
          </div>
        </div>

        {/* Right Side: Bill Summary & Frequent Parts Column */}
        <div className="flex flex-col gap-6 w-full box-border">
          
          {/* DIVISION 5 CONTAINER: Bill Summary */}
          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="text-[#184edb] flex items-center"><FileText size={16} /></span>
              <h2 className="text-[13.5px] font-extrabold text-slate-800 uppercase tracking-wider m-0 font-heading">
                Bill Summary
              </h2>
            </div>

            {/* Calculations Breakdown */}
            <div className="flex flex-col gap-2.5 text-xs font-semibold text-slate-600 border-b border-slate-100 pb-4">
              <div className="flex justify-between">
                <span>Sub Total</span>
                <span className="text-slate-800 font-bold">${calculatedSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Discount</span>
                <span className="text-red-500 font-bold">-${calculatedDiscount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total GST (18%)</span>
                <span className="text-slate-800 font-bold">${calculatedGst.toFixed(2)}</span>
              </div>
            </div>

            {/* Grand Total */}
            <div className="flex flex-col gap-1 items-center py-2">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Grand Total</span>
              <span className="text-3xl font-extrabold text-[#184edb] tracking-tight font-heading mt-0.5">
                ${calculatedGrandTotal.toFixed(2)}
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
                onClick={() => alert('Bill draft saved successfully.')}
                disabled={billItems.length === 0}
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
              <span className="text-[#184edb] flex items-center"><ShoppingBag size={16} /></span>
              <h2 className="text-[13.5px] font-extrabold text-slate-800 uppercase tracking-wider m-0 font-heading">
                Frequent Parts
              </h2>
            </div>

            <div className="flex flex-col gap-2">
              <div 
                onClick={() => handleAddFrequentPart('Oil Filter - V6 Engine', 'OF-V6-33', 35.00, 0, 18)}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:border-[#184edb] hover:bg-slate-50/50 cursor-pointer transition-all"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800">Oil Filter - V6 Engine</span>
                  <span className="text-[9px] text-slate-400 font-semibold mt-0.5">OF-V6-33 | Price: $35.00</span>
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
                  <span className="text-[9px] text-slate-400 font-semibold mt-0.5">SP-STD-02 | Price: $15.00</span>
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
                  <span className="text-[9px] text-slate-400 font-semibold mt-0.5">CL-GR-01 | Price: $25.00</span>
                </div>
                <button className="p-1 bg-blue-50 text-[#184edb] rounded-full border-none cursor-pointer flex items-center justify-center">
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default CounterSales;
