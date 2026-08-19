import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle2,
  Percent,
  FileSpreadsheet,
  FileText,
  Plus,
  Eye,
  Edit,
  Printer,
  User,
  SlidersHorizontal,
  Building2,
  Calendar,
  Save,
  ShieldCheck,
  CreditCard,

  Download,
  Truck,
  Trash2
} from 'lucide-react';

export interface SaleRecord {
  invoiceNo: string;
  customerName: string;
  vehicleModel: string;
  status: 'DELIVERED' | 'PENDING' | 'CANCELLED';
  grandTotal: string;
  district: string;
  deliveryDate: string;
  salesExecutive: string;
  customerPhone?: string;
  customerDistrict?: string;
  customerEmail?: string;
  advancePaid?: string;
  balanceAmount?: string;
  baseVehiclePrice?: number;
  accessoriesCharge?: number;
  insuranceAmount?: number;
  subTotal?: number;
  discountAmount?: number;
  taxableValue?: number;
  gstRate?: number;
  gstAmount?: number;
  insuranceProvider?: string;
  policyNumber?: string;
  seatCovers?: boolean;
  gpsTracker?: boolean;
  warranty?: boolean;
  deliveryLocation?: string;
  internalNotes?: string;
  paymentMode?: string;
  financeProvider?: string;
  accessoriesKit?: any[];
  accessoriesTotal?: number;
}

interface PrintModalProps {
  printingSale: SaleRecord;
  setPrintingSale: (sale: SaleRecord | null) => void;
  handlePrintTrigger?: () => void;
  companySettings?: any;
  dbVehicles?: any[];
}

const PrintInvoiceModal: React.FC<PrintModalProps> = ({ printingSale, setPrintingSale, companySettings, dbVehicles = [] }) => {
  const gstRate = printingSale.gstRate || parseFloat((companySettings?.defaultGstPercent || '18').toString().replace(/[^\d.]/g, '')) || 18;
  const discountRate = parseFloat((companySettings?.defaultDiscountPercent || '5').toString().replace(/[^\d.]/g, '')) || 0;
  const grandTotalNum = Number(printingSale.grandTotal.toString().replace(/[^\d.]/g, '')) || 0;
  
  const matchedVehicle = dbVehicles.find((v: any) => v.modelName === printingSale.vehicleModel);

  const accessoriesNum = (printingSale.accessoriesCharge && printingSale.accessoriesCharge > 0)
    ? printingSale.accessoriesCharge
    : ((printingSale.accessoriesTotal && printingSale.accessoriesTotal > 0)
      ? printingSale.accessoriesTotal
      : (matchedVehicle?.accessoriesTotal && matchedVehicle.accessoriesTotal > 0 ? matchedVehicle.accessoriesTotal : 37760));

  const basePriceNum = (printingSale.baseVehiclePrice && printingSale.baseVehiclePrice > 0)
    ? printingSale.baseVehiclePrice
    : ((matchedVehicle?.sellPrice && matchedVehicle.sellPrice > 0)
      ? matchedVehicle.sellPrice
      : ((matchedVehicle?.price && matchedVehicle.price > 0)
        ? matchedVehicle.price
        : Math.max(0, Math.round(grandTotalNum / (1 + gstRate / 100)) - accessoriesNum)));

  const subTotalNum = basePriceNum + accessoriesNum;
  const insuranceNum = printingSale.insuranceAmount || 0;
  const preDiscountTotal = subTotalNum + insuranceNum;

  const discountNum = (printingSale.discountAmount && printingSale.discountAmount > 0)
    ? printingSale.discountAmount
    : Math.round(preDiscountTotal * (discountRate / 100));

  const taxableValue = (printingSale.taxableValue && printingSale.taxableValue > 0)
    ? printingSale.taxableValue
    : Math.max(0, preDiscountTotal - discountNum);

  const taxesNum = (printingSale.gstAmount && printingSale.gstAmount > 0)
    ? printingSale.gstAmount
    : Math.round(taxableValue * (gstRate / 100));

  const computedGrandTotal = printingSale.grandTotal ? grandTotalNum : (taxableValue + taxesNum);

  let accSummary = 'Mats, Mud Flaps, basic toolkit';
  if (matchedVehicle?.accessoriesKit && matchedVehicle.accessoriesKit.length > 0) {
    accSummary = matchedVehicle.accessoriesKit.map((a: any) => a.name).filter(Boolean).join(', ');
  } else if ((printingSale as any).accessoriesKit && (printingSale as any).accessoriesKit.length > 0) {
    accSummary = (printingSale as any).accessoriesKit.map((a: any) => a.name).filter(Boolean).join(', ');
  }

  const items = [
    { sl: '01', desc: `${printingSale.vehicleModel} - Base Vehicle`, subtitle: 'Primary vehicle chassis and cabin', qty: '1 Unit', unitPrice: `₹${basePriceNum.toLocaleString('en-IN')}`, amount: `₹${basePriceNum.toLocaleString('en-IN')}` },
    { sl: '02', desc: 'Standard Accessories Kit', subtitle: accSummary, qty: '1 Set', unitPrice: `₹${accessoriesNum.toLocaleString('en-IN')}`, amount: `₹${accessoriesNum.toLocaleString('en-IN')}` }
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto no-print">
      <div className="bg-slate-100 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh] text-left">
        
        {/* Modal Top Bar */}
        <div className="p-4 px-6 bg-white border-b border-slate-200 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <Printer size={16} className="text-[#184edb]" />
            <h3 className="text-sm font-extrabold text-slate-800 m-0 font-heading">Tax Invoice Statement ({printingSale.invoiceNo})</h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="bg-[#184edb] hover:bg-blue-800 text-white font-bold text-xs py-2 px-4 rounded-md cursor-pointer transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Printer size={13} /> Print Invoice (A4)
            </button>
            <button
              onClick={() => window.print()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-4 rounded-md cursor-pointer transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Download size={13} /> Download PDF
            </button>
            <button
              onClick={() => setPrintingSale(null)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs py-2 px-4 rounded-md cursor-pointer transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        {/* Modal Scrollable Container containing the EXACT Tax Invoice Sheet */}
        <div className="p-6 overflow-y-auto bg-slate-100/80">
          <div id="print-invoice-area" className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex flex-col gap-6 w-full max-w-5xl mx-auto text-slate-700">

            {/* Section 1: Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-5">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  {companySettings?.logoUrl ? (
                    <img src={companySettings.logoUrl} alt="Company Logo" className="h-10 w-auto object-contain max-w-[120px]" />
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-[#184edb] flex items-center justify-center text-white font-extrabold text-sm shadow-xs">
                      {(companySettings?.companyName || 'HHS EICHER').slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900 m-0 font-heading tracking-tight">
                      {companySettings?.companyName || 'HHS EICHER WORKSHOP'}
                    </h2>
                    {companySettings?.dealerName && (
                      <span className="text-xs text-slate-450 font-bold block">{companySettings.dealerName}</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 text-[11px] font-semibold text-slate-455 mt-2">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-slate-500">Address:</span>
                    <span>{companySettings?.streetAddress || 'Industrial Park West, Sector 12, Block C'}</span>
                    <span>
                      {companySettings?.city ? `${companySettings.city}, ${companySettings?.stateName || ''} - ${companySettings?.pinCode || ''}` : 'Automotive City, California - 90210'}
                    </span>
                    <span>GSTIN: {companySettings?.gstNumber || '22AAAAA0000A1Z5'}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-slate-500">Contact Details:</span>
                    <span>Phone: {companySettings?.mobileNumber || companySettings?.phoneNum || '+1 (555) 012-3456'}</span>
                    <span>Email: {companySettings?.emailAddress || 'contact@autopro-elite.com'}</span>
                    <span>Web: {companySettings?.websiteUrl || 'www.autopro-elite.com'}</span>
                  </div>
                </div>
              </div>

              <div className="text-right flex flex-col items-end gap-1.5">
                <h1 className="text-xl font-extrabold text-blue-600 tracking-tight font-heading m-0 uppercase">TAX INVOICE</h1>
                <div className="text-xs font-semibold text-slate-500 mt-2 flex flex-col items-end gap-0.5">
                  <span>Invoice Number: <span className="font-bold text-slate-800">{printingSale.invoiceNo}</span></span>
                  <span>Invoice Date: <span className="font-bold text-slate-800">{printingSale.deliveryDate.replace('Scheduled: ', '')}</span></span>
                  <span>Job Card: <span className="font-bold text-slate-800">JC/8892/23</span></span>
                </div>
                <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-0.5 rounded text-[10px] font-extrabold mt-1">
                  PAID
                </span>
              </div>
            </div>

            {/* Section 2: Profiles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Customer info */}
              <div className="border border-slate-200/80 rounded-xl p-5 bg-slate-50/20 flex flex-col gap-3 text-xs">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <User size={14} className="text-blue-600" />
                  <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Customer Information</span>
                </div>
                <div className="grid grid-cols-2 gap-y-2.5 font-semibold text-slate-500">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Name</span>
                    <span className="text-slate-800 font-bold">{printingSale.customerName}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Contact</span>
                    <span className="text-slate-850 font-semibold">{printingSale.customerPhone || '+91 98765 43210'}</span>
                  </div>
                  <div className="flex flex-col gap-0.5 col-span-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Billing Address</span>
                    <span className="text-slate-700 font-semibold">{printingSale.customerDistrict || printingSale.district || '12B, Skyview Towers, Sector 56, Gurugram, 122011'}</span>
                  </div>
                </div>
              </div>

              {/* Vehicle Details */}
              <div className="border border-slate-200/80 rounded-xl p-5 bg-slate-50/20 flex flex-col gap-3 text-xs">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Truck size={14} className="text-blue-600" />
                  <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Vehicle Details</span>
                </div>
                <div className="grid grid-cols-3 gap-y-2.5 font-semibold text-slate-500">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Model</span>
                    <span className="text-slate-800 font-bold">{printingSale.vehicleModel}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Reg No.</span>
                    <span className="text-slate-805 font-bold">HR 55 AT 4492</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Odometer</span>
                    <span className="text-slate-750">45,210 KM</span>
                  </div>
                  <div className="flex flex-col gap-0.5 col-span-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Chassis No.</span>
                    <span className="text-slate-700 font-mono text-[10px] font-bold">MC284JS92X99023</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Service Type</span>
                    <span className="text-slate-755 font-bold">Comprehensive Annual Service</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Section 3: Items Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden mt-2 text-xs">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[9px] border-b border-slate-250">
                    <th className="p-3.5 px-5">SI.</th>
                    <th className="p-3.5 px-5">Description</th>
                    <th className="p-3.5 px-5 text-center">Qty/Hours</th>
                    <th className="p-3.5 px-5 text-right">Unit Price</th>
                    <th className="p-3.5 px-5 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/20 font-semibold text-slate-705">
                      <td className="p-3.5 px-5 text-slate-455 font-bold">{item.sl}</td>
                      <td className="p-3.5 px-5">
                        <span className="font-extrabold text-slate-850 block">{item.desc}</span>
                        <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{item.subtitle}</span>
                      </td>
                      <td className="p-3.5 px-5 text-center font-bold text-slate-850">{item.qty}</td>
                      <td className="p-3.5 px-5 text-right text-slate-550">{item.unitPrice}</td>
                      <td className="p-3.5 px-5 text-right font-extrabold text-slate-900">{item.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Section 4: Settlement and summary totals */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start mt-2">

              {/* Payment Details */}
              <div className="lg:col-span-3 flex flex-col gap-4 w-full">
                <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/20 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-100 pb-2 mb-3">Payment Details</span>
                  <div className="grid grid-cols-2 gap-y-2.5 font-semibold text-slate-500">
                    <span>Payment Mode:</span>
                    <span className="text-slate-800 font-bold">Online / UPI</span>
                    <span>Transaction ID:</span>
                    <span className="text-slate-800 font-bold font-mono">TXN_9921884200XC</span>
                    <span>Status:</span>
                    <span className="text-emerald-600 font-bold">Successfully Verified</span>
                  </div>
                </div>
              </div>

              {/* Subtotals & Grand Total */}
              <div className="lg:col-span-2 flex flex-col gap-2 text-xs font-semibold text-slate-505 w-full text-right">

                <div className="flex justify-between px-2 font-medium">
                  <span>Subtotal:</span>
                  <span className="text-slate-800 font-bold">₹{subTotalNum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>

                <div className="flex justify-between px-2 font-medium">
                  <span>Service Insurance:</span>
                  <span className="text-slate-800 font-bold">₹{insuranceNum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>

                <div className="flex justify-between px-2 font-medium">
                  <span className="text-red-500 font-bold">Discount ({discountRate}%):</span>
                  <span className="text-red-655 font-extrabold">-₹{discountNum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>

                <div className="flex justify-between px-2 font-medium border-t border-slate-100 pt-2.5">
                  <span>Taxable Value:</span>
                  <span className="text-slate-850 font-bold">₹{taxableValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>

                <div className="flex justify-between px-2 font-medium">
                  <span>GST ({gstRate}%):</span>
                  <span className="text-slate-855 font-bold">₹{taxesNum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>

                {/* Grand Total dark box */}
                <div className="bg-[#0c1a40] rounded-lg p-4 px-5 text-white flex justify-between items-center mt-2.5 shadow-md">
                  <span className="text-xs font-bold text-white/80">Grand Total</span>
                  <span className="text-base font-extrabold text-white">₹{computedGrandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                
                <div className="flex justify-between px-2 font-medium text-emerald-600 mt-2 text-xs">
                  <span>Advance Paid:</span>
                  <span className="font-bold">{printingSale.advancePaid || '₹0'}</span>
                </div>
                
                <div className="flex justify-between px-2 font-extrabold text-red-500 mt-1 pt-1 border-t border-slate-100/50 text-[13px]">
                  <span>Balance Due:</span>
                  <span>{printingSale.balanceAmount || '₹0'}</span>
                </div>
              </div>

            </div>

            {/* Section 5: Terms and Guarantee footer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-100 pt-6 text-[10px] text-slate-400 font-semibold leading-relaxed mt-2">
              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">TERMS & CONDITIONS</span>
                <p className="m-0">Goods once sold will not be taken back. Interest @18% will be charged if not paid within 7 days. All disputes are subject to Gurugram Jurisdiction.</p>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">SERVICE GUARANTEE</span>
                <p className="m-0">All genuine Eicher spare parts come with a 6-month manufacturer warranty. Service labor is guaranteed for 30 days or 2,000 kms, whichever is earlier.</p>
                <div className="mt-6 flex flex-col items-end gap-1">
                  <div className="w-44 border-b border-slate-400 pb-1" />
                  <span className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider mt-1">Authorized Signatory</span>
                  <span className="text-[8px] text-slate-400 font-normal">THIS IS A COMPUTER-GENERATED INVOICE AND DOES NOT REQUIRE A PHYSICAL SIGNATURE.</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

interface VehicleSalesProps {
  sales: SaleRecord[];
  setSales: React.Dispatch<React.SetStateAction<SaleRecord[]>>;
  onCustomerClick?: (name: string) => void;
  companySettings?: any;
}

export const VehicleSales: React.FC<VehicleSalesProps> = ({ sales, setSales, onCustomerClick, companySettings }) => {
  const [dbVehicles, setDbVehicles] = useState<any[]>([]);
  const [dbCustomers, setDbCustomers] = useState<any[]>([]);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetch(`${API_URL}/api/vehicles`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDbVehicles(data);
        }
      })
      .catch(err => console.error('Error fetching vehicles for sales:', err));

    fetch(`${API_URL}/api/customers`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDbCustomers(data);
        }
      })
      .catch(err => console.error('Error fetching customers for sales:', err));
  }, []);

  // Available stock items mapped with exact inventory selling price & accessories total
  const stocks = dbVehicles.filter(v => v.stock > 0 && v.status === 'Available').map(v => ({
    id: v.id,
    label: `${v.modelName} - ${v.colorName || 'White'} (Price: ₹${(v.sellPrice || v.price || 0).toLocaleString('en-IN')}) (Stock: ${v.stock || 0})`,
    model: v.modelName,
    type: v.type,
    engine: v.engineNo,
    color: v.colorName,
    chassis: v.chassisNo,
    price: v.sellPrice || v.price || 1500000,
    stock: v.stock || 0,
    accessoriesKit: v.accessoriesKit || [],
    accessoriesTotal: v.accessoriesTotal || 37760
  }));

  // States for modals & sub-pages
  const [isRegisteringSale, setIsRegisteringSale] = useState(false);
  const [editingSale, setEditingSale] = useState<SaleRecord | null>(null);
  const [viewingSale, setViewingSale] = useState<SaleRecord | null>(null);
  const [printingSale, setPrintingSale] = useState<SaleRecord | null>(null);

  // Form states for New Sale Registration
  const [regFullName, setRegFullName] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regGst, setRegGst] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regSelectedStock, setRegSelectedStock] = useState('');

  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRegFullName(val);
    const existingCust = dbCustomers.find(c => c.name.toLowerCase() === val.toLowerCase());
    if (existingCust) {
      if (existingCust.phone) setRegMobile(existingCust.phone);
      if (existingCust.district) setRegAddress(existingCust.district);
      if (existingCust.email) setRegEmail(existingCust.email);
    }
  };

  useEffect(() => {
    if (stocks.length > 0 && !regSelectedStock) {
      setRegSelectedStock(stocks[0].id);
    }
  }, [dbVehicles, stocks]);

  const [regInsuranceProvider, setRegInsuranceProvider] = useState('');
  const [regPolicyNumber, setRegPolicyNumber] = useState('');
  const [regPremiumAmount, setRegPremiumAmount] = useState('');
  const [regSeatCovers, setRegSeatCovers] = useState(false);
  const [regGpsTracker, setRegGpsTracker] = useState(false);
  const [regWarranty, setRegWarranty] = useState(false);
  const [regDeliveryDate, setRegDeliveryDate] = useState('');
  const [regDeliveryLocation, setRegDeliveryLocation] = useState('Showroom Delivery');
  const [regInternalNotes, setRegInternalNotes] = useState('');
  const [regPaymentMode, setRegPaymentMode] = useState('Cash/Bank Transfer');
  const [regFinanceProvider, setRegFinanceProvider] = useState('');
  const [regAdvancePaid, setRegAdvancePaid] = useState('0');
  const [regDiscount, setRegDiscount] = useState('0');

  // Filter & Search states for Sales Ledger
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Filtered sales ledger
  const filteredSales = sales.filter((sale) => {
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch = !q ||
      (sale.invoiceNo && sale.invoiceNo.toLowerCase().includes(q)) ||
      (sale.customerName && sale.customerName.toLowerCase().includes(q)) ||
      (sale.vehicleModel && sale.vehicleModel.toLowerCase().includes(q));
    const matchesStatus = statusFilter === 'ALL' || sale.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Export Sales Ledger to Excel (.csv)
  const handleExportExcel = () => {
    const headers = ['INVOICE NO', 'CUSTOMER NAME', 'VEHICLE MODEL', 'SALE STATUS', 'GRAND TOTAL', 'DELIVERY DATE'];
    const rows = filteredSales.map(s => [
      `"${(s.invoiceNo || '').replace(/"/g, '""')}"`,
      `"${(s.customerName || '').replace(/"/g, '""')}"`,
      `"${(s.vehicleModel || '').replace(/"/g, '""')}"`,
      `"${(s.status || '').replace(/"/g, '""')}"`,
      `"${(s.grandTotal || '').toString().replace(/"/g, '""')}"`,
      `"${(s.deliveryDate || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Vehicle_Sales_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Sales Ledger directly as a PDF file
  const handleExportPDF = () => {
    const element = document.createElement('div');
    element.style.padding = '20px';
    element.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    element.style.color = '#334155';
    element.style.background = '#ffffff';

    const companyName = companySettings?.companyName || 'HHS EICHER MOTORS';
    const dealerName = companySettings?.dealerName || 'Vehicle Sales Ledger Report';

    const logoHtml = companySettings?.logoUrl
      ? `<img src="${companySettings.logoUrl}" style="height: 38px; object-fit: contain;" />`
      : `<div style="background: #184edb; color: white; font-weight: 800; padding: 6px 12px; border-radius: 6px; font-size: 13px; font-family: sans-serif; display: inline-block;">${companyName.slice(0, 2).toUpperCase()}</div>`;

    const rowsHtml = filteredSales.map((s, idx) => `
      <tr style="border-bottom: 1px solid #e2e8f0; font-size: 10.5px;">
        <td style="padding: 8px 10px; color: #64748b; font-weight: 700; text-align: center;">${idx + 1}</td>
        <td style="padding: 8px 10px; color: #184edb; font-weight: 800;">${s.invoiceNo}</td>
        <td style="padding: 8px 10px; color: #1e293b; font-weight: 700;">${s.customerName}</td>
        <td style="padding: 8px 10px; color: #334155; font-weight: 600;">${s.vehicleModel}</td>
        <td style="padding: 8px 10px;">
          <span style="padding: 2px 6px; border-radius: 4px; font-size: 8.5px; font-weight: 800; background: ${s.status === 'DELIVERED' ? '#ecfdf5; color: #059669; border: 1px solid #a7f3d0' : s.status === 'PENDING' ? '#fffbeb; color: #d97706; border: 1px solid #fde68a' : '#fef2f2; color: #dc2626; border: 1px solid #fecaca'}">
            ${s.status}
          </span>
        </td>
        <td style="padding: 8px 10px; text-align: right; font-weight: 800; color: #0f172a;">${s.grandTotal}</td>
        <td style="padding: 8px 10px; color: #64748b;">${s.deliveryDate}</td>
      </tr>
    `).join('');

    element.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #184edb; padding-bottom: 12px; margin-bottom: 16px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          ${logoHtml}
          <div>
            <h2 style="margin: 0; font-size: 15px; color: #0f172a; font-weight: 800;">${companyName}</h2>
            <span style="font-size: 11px; color: #64748b; font-weight: 600;">${dealerName}</span>
          </div>
        </div>
        <div style="text-align: right;">
          <h1 style="font-size: 17px; font-weight: 800; color: #184edb; margin: 0; text-transform: uppercase;">SALES LEDGER REPORT</h1>
          <div style="font-size: 10px; color: #64748b; margin-top: 4px; font-weight: 600;">
            Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} | Total Records: ${filteredSales.length}
          </div>
        </div>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
          <tr style="background: #f8fafc; color: #475569; font-size: 9.5px; font-weight: 800; text-transform: uppercase;">
            <th style="padding: 8px 10px; text-align: center; border-bottom: 2px solid #cbd5e1; width: 25px;">#</th>
            <th style="padding: 8px 10px; text-align: left; border-bottom: 2px solid #cbd5e1;">INVOICE NO.</th>
            <th style="padding: 8px 10px; text-align: left; border-bottom: 2px solid #cbd5e1;">CUSTOMER NAME</th>
            <th style="padding: 8px 10px; text-align: left; border-bottom: 2px solid #cbd5e1;">VEHICLE MODEL</th>
            <th style="padding: 8px 10px; text-align: left; border-bottom: 2px solid #cbd5e1;">SALE STATUS</th>
            <th style="padding: 8px 10px; text-align: right; border-bottom: 2px solid #cbd5e1;">GRAND TOTAL</th>
            <th style="padding: 8px 10px; text-align: left; border-bottom: 2px solid #cbd5e1;">DELIVERY DATE</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <div style="margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 10px; font-size: 8.5px; color: #94a3b8; text-align: center; font-weight: 600;">
        Vehicle Sales Management Report • Downloaded on ${new Date().toLocaleString()}
      </div>
    `;

    const opt = {
      margin: [8, 8, 8, 8],
      filename: `Vehicle_Sales_Ledger_${new Date().toISOString().slice(0, 10)}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    if ((window as any).html2pdf) {
      (window as any).html2pdf().set(opt).from(element).save();
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.onload = () => {
        (window as any).html2pdf().set(opt).from(element).save();
      };
      document.body.appendChild(script);
    }
  };

  // Handle click edit

  const handleEditClick = (sale: SaleRecord) => {
    setEditingSale(sale);
    setRegFullName(sale.customerName || '');
    setRegMobile(sale.customerPhone || '');
    setRegAddress(sale.customerDistrict || sale.district || '');
    setRegEmail(sale.customerEmail || '');
    setRegInsuranceProvider(sale.insuranceProvider || 'ICICI Lombard GIC');
    setRegPolicyNumber(sale.policyNumber || '');
    setRegPremiumAmount(sale.insuranceAmount !== undefined ? sale.insuranceAmount.toString() : '');
    setRegSeatCovers(!!sale.seatCovers);
    setRegGpsTracker(!!sale.gpsTracker);
    setRegWarranty(!!sale.warranty);
    setRegDeliveryDate(sale.deliveryDate ? sale.deliveryDate.replace('Scheduled: ', '') : '');
    setRegDeliveryLocation(sale.deliveryLocation || 'Showroom Delivery');
    setRegInternalNotes(sale.internalNotes || '');
    setRegPaymentMode(sale.paymentMode || 'Cash/Bank Transfer');
    setRegFinanceProvider(sale.financeProvider || '');
    setRegAdvancePaid(sale.advancePaid ? sale.advancePaid.replace(/[^\d.]/g, '') : '0');
    setRegDiscount(sale.discountAmount !== undefined ? sale.discountAmount.toString() : '0');

    // Match vehicle in stock
    const matchedStock = stocks.find(s => s.model === sale.vehicleModel);
    if (matchedStock) {
      setRegSelectedStock(matchedStock.id);
    }

    setIsRegisteringSale(true);
  };

  const handleDeleteSale = (sale: SaleRecord) => {
    if (window.confirm(`Are you sure you want to delete invoice ${sale.invoiceNo}?`)) {
      fetch(`${API_URL}/api/sales/${encodeURIComponent(sale.invoiceNo)}`, {
        method: 'DELETE'
      })
      .then(res => res.json())
      .then(() => {
        setSales(sales.filter(s => s.invoiceNo !== sale.invoiceNo));
      })
      .catch(err => console.error('Error deleting sale:', err));
    }
  };

  // Trigger print window helper
  const handlePrintTrigger = () => {
    window.print();
  };

  // GST percentage & Discount percentage from Settings
  const gstRate = parseFloat((companySettings?.defaultGstPercent || '18').toString().replace(/[^\d.]/g, '')) || 18;
  const discountRate = parseFloat((companySettings?.defaultDiscountPercent || '5').toString().replace(/[^\d.]/g, '')) || 0;

  // Calculate prices dynamically for active stock item
  const selectedStockItem = stocks.find(s => s.id === regSelectedStock) || stocks[0];
  const vehicleAccessoriesTotal = selectedStockItem?.accessoriesTotal || 37760;
  const optionalAccessoriesCost =
    (regSeatCovers ? 8500 : 0) +
    (regGpsTracker ? 12000 : 0) +
    (regWarranty ? 24999 : 0);
  const calculatedAccessoriesCost = vehicleAccessoriesTotal + optionalAccessoriesCost;
  const calculatedInsuranceCost = parseFloat(regPremiumAmount || '0');
  const basePrice = selectedStockItem ? Number(selectedStockItem.price.toString().replace(/[^\d.]/g, '')) || 0 : 0;
  
  // Subtotal = Base Vehicle + Accessories Kit
  const subTotalNum = basePrice + calculatedAccessoriesCost;

  // Pre-discount total = Subtotal + Insurance
  const preDiscountTotal = subTotalNum + calculatedInsuranceCost;

  // Discount calculation: user custom input if > 0, else Settings discount %
  const userEnteredDiscount = parseFloat(regDiscount || '0');
  const calculatedDiscount = userEnteredDiscount > 0 ? userEnteredDiscount : Math.round(preDiscountTotal * (discountRate / 100));

  // Taxable Value
  const taxableNum = Math.max(0, preDiscountTotal - calculatedDiscount);

  // GST Amount
  const calculatedTaxes = Math.round(taxableNum * (gstRate / 100));

  // Grand Total
  const grandTotalPayable = taxableNum + calculatedTaxes;

  // Advance paid & balance
  const advancePaidNum = parseFloat(regAdvancePaid || '0');
  const balancePayable = Math.max(0, grandTotalPayable - advancePaidNum);
  const financialProgress = grandTotalPayable > 0 ? (advancePaidNum / grandTotalPayable) * 100 : 0;

  // Handle Sale Registration / Edit Form Submit
  const handleRegisterSale = (e: React.FormEvent, forceStatus: 'DELIVERED' | 'PENDING' = 'PENDING') => {
    e.preventDefault();
    if (!regFullName || !regMobile) {
      alert('Please fill out Customer Full Name and Mobile Number.');
      return;
    }
    
    if (!selectedStockItem) {
      alert('Error: No valid vehicle selected. Please select a vehicle from the available stock before saving.');
      return;
    }

    let finalStatus = forceStatus;
    if (advancePaidNum >= grandTotalPayable && grandTotalPayable > 0) {
      finalStatus = 'DELIVERED';
    }

    const currentYear = new Date().getFullYear();
    let maxInvSeq = 1233;
    if (sales && sales.length > 0) {
      sales.forEach(s => {
        if (s.invoiceNo) {
          const match = s.invoiceNo.match(new RegExp(`#?INV-${currentYear}-(\\d{4})$`, 'i'));
          if (match) {
            const num = parseInt(match[1], 10);
            if (!isNaN(num) && num >= 1234 && num < 9999) {
              if (num > maxInvSeq) maxInvSeq = num;
            }
          }
        }
      });
    }
    const generatedInvoiceNo = `#INV-${currentYear}-${maxInvSeq + 1}`;
    const newInvoice = editingSale ? editingSale.invoiceNo : generatedInvoiceNo;
    const salePayload: any = {
      invoiceNo: newInvoice,
      customerName: regFullName,
      customerPhone: regMobile,
      customerDistrict: regAddress,
      customerEmail: regEmail,
      vehicleModel: selectedStockItem ? selectedStockItem.model : 'Unknown Model',
      status: finalStatus,
      baseVehiclePrice: basePrice,
      accessoriesCharge: calculatedAccessoriesCost,
      insuranceAmount: calculatedInsuranceCost,
      subTotal: subTotalNum,
      discountAmount: calculatedDiscount,
      taxableValue: taxableNum,
      gstRate: gstRate,
      gstAmount: calculatedTaxes,
      grandTotal: `₹${Math.round(grandTotalPayable).toLocaleString('en-IN')}`,
      advancePaid: `₹${Math.round(advancePaidNum).toLocaleString('en-IN')}`,
      balanceAmount: `₹${Math.round(balancePayable).toLocaleString('en-IN')}`,
      district: regAddress || 'Not Provided',
      deliveryDate: regDeliveryDate
        ? new Date(regDeliveryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        : 'Scheduled: ' + new Date(Date.now() + 86400000 * 5).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      salesExecutive: 'System User',
      insuranceProvider: regInsuranceProvider,
      policyNumber: regPolicyNumber,
      seatCovers: regSeatCovers,
      gpsTracker: regGpsTracker,
      warranty: regWarranty,
      deliveryLocation: regDeliveryLocation,
      internalNotes: regInternalNotes,
      paymentMode: regPaymentMode,
      financeProvider: regFinanceProvider,
      accessoriesKit: selectedStockItem?.accessoriesKit || [],
      accessoriesTotal: vehicleAccessoriesTotal
    };

    const isEdit = !!editingSale;
    const url = isEdit ? `${API_URL}/api/sales/${encodeURIComponent(editingSale.invoiceNo)}` : `${API_URL}/api/sales`;
    const method = isEdit ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(salePayload)
    })
      .then(res => res.json())
      .then(data => {
        if (isEdit) {
          setSales(sales.map(s => s.invoiceNo === editingSale.invoiceNo ? data : s));
        } else {
          setSales([data, ...sales]);

          // Update vehicle stock only on new sale creation
          if (selectedStockItem && selectedStockItem.id) {
            const newStock = Math.max(0, selectedStockItem.stock - 1);
            const newStatus = newStock === 0 ? 'Out of Stock' : 'Available';

            fetch(`${API_URL}/api/vehicles/${encodeURIComponent(selectedStockItem.id)}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: newStatus, stock: newStock })
            })
              .catch(err => console.error('Error updating vehicle status on sale:', err));
          }
        }

        setIsRegisteringSale(false);
        setEditingSale(null);

        // Reset form fields
        setRegFullName('');
        setRegMobile('');
        setRegAddress('');
        setRegGst('');
        setRegEmail('');
        setRegDeliveryDate('');
        setRegInternalNotes('');
        setRegAdvancePaid('0');
        setRegDiscount('0');
      })
      .catch(err => console.error('Error saving sale:', err));
  };

  // 1. View state switcher: New Sale Registration
  if (isRegisteringSale) {
    return (
      <div className="p-8 bg-[#f6f8fc] min-h-[calc(100vh-70px)] flex flex-col gap-6 box-border font-sans text-slate-700 text-left">

        {/* Header Breadcrumbs and Navigation */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <span className="cursor-pointer hover:text-slate-650" onClick={() => { setIsRegisteringSale(false); setEditingSale(null); }}>Vehicles</span>
              <span>&gt;</span>
              <span className="text-slate-600 font-bold">{editingSale ? 'Edit Vehicle Sale' : 'New Vehicle Sale'}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 m-0 mt-1.5 tracking-tight font-heading">
              {editingSale ? `Edit Vehicle Sale (${editingSale.invoiceNo})` : 'New Vehicle Sale Registration'}
            </h1>
            <p className="text-xs text-slate-400 m-0 mt-1">
              {editingSale ? 'Update customer details, insurance, accessories, and financial payment terms for this invoice.' : 'Register a primary vehicle sale, assign accessories, and generate the commercial invoice.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => { setIsRegisteringSale(false); setEditingSale(null); }}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-605 font-bold text-xs py-2.5 px-6 rounded-md cursor-pointer transition-colors shadow-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={(e) => handleRegisterSale(e, 'PENDING')}
              className="bg-white border border-[#184edb] hover:bg-blue-50/50 text-[#184edb] font-bold text-xs py-2.5 px-5 rounded-md cursor-pointer transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Save size={13} /> Save Sale
            </button>
            <button
              type="button"
              onClick={(e) => handleRegisterSale(e, 'DELIVERED')}
              className="bg-[#184edb] hover:bg-blue-800 text-white font-bold text-xs py-2.5 px-6 border-none rounded-md cursor-pointer transition-colors shadow-md flex items-center gap-1.5"
            >
              <FileText size={13} /> Generate Invoice
            </button>
          </div>
        </div>

        {/* 2-Column form widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start w-full">

          {/* Column 1 (Left) - Customer and Insurance Details */}
          <div className="flex flex-col gap-6 w-full">

            {/* Card 1: Customer Information */}
            <div className="bg-white rounded-xl border border-[#eef2f6] shadow-sm p-6 flex flex-col gap-5">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <User size={15} className="text-blue-600" />
                <h3 className="text-xs font-extrabold text-slate-800 m-0 uppercase tracking-wider font-heading">Customer Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-500">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Full Name</label>
                  <input
                    type="text"
                    list="customer-list"
                    placeholder="Enter customer's full name"
                    value={regFullName}
                    onChange={handleCustomerChange}
                    required
                    className="border border-slate-200 rounded-md py-2 px-3 text-xs outline-none bg-slate-50 focus:border-blue-400 focus:bg-white transition-all font-medium text-slate-700 placeholder-slate-400"
                  />
                  <datalist id="customer-list">
                    {dbCustomers.map((cust, idx) => (
                      <option key={idx} value={cust.name} />
                    ))}
                  </datalist>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Mobile Number</label>
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={regMobile}
                    onChange={(e) => setRegMobile(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                    required
                    className="border border-slate-200 rounded-md py-2 px-3 text-xs outline-none bg-slate-50 focus:border-blue-400 focus:bg-white transition-all font-medium text-slate-700 placeholder-slate-400"
                  />
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Mailing Address</label>
                  <textarea
                    placeholder="Street, Landmark, City, State, PIN"
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    rows={3}
                    className="border border-slate-200 rounded-md py-2 px-3 text-xs outline-none bg-slate-50 focus:border-blue-400 focus:bg-white transition-all font-medium text-slate-700 placeholder-slate-400 resize-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Aadhar Number (Optional)</label>
                  <input
                    type="text"
                    placeholder="2555 6584 6985"
                    value={regGst}
                    onChange={(e) => setRegGst(e.target.value)}
                    className="border border-slate-200 rounded-md py-2 px-3 text-xs outline-none bg-slate-50 focus:border-blue-400 focus:bg-white transition-all font-medium text-slate-700 placeholder-slate-400 font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Email Address</label>
                  <input
                    type="email"
                    placeholder="customer@email.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="border border-slate-200 rounded-md py-2 px-3 text-xs outline-none bg-slate-50 focus:border-blue-400 focus:bg-white transition-all font-medium text-slate-700 placeholder-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Insurance & Accessories */}
            <div className="bg-white rounded-xl border border-[#eef2f6] shadow-sm p-6 flex flex-col gap-5">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <ShieldCheck size={15} className="text-blue-600" />
                <h3 className="text-xs font-extrabold text-slate-800 m-0 uppercase tracking-wider font-heading">Insurance & Accessories</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold text-slate-500">

                {/* Column 1: Insurance */}
                <div className="flex flex-col gap-4">
                  <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase border-b border-slate-50 pb-1">Insurance Details</span>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Provider</label>
                    <select
                      value={regInsuranceProvider}
                      onChange={(e) => setRegInsuranceProvider(e.target.value)}
                      className="border border-slate-200 rounded-md py-2 px-3 text-xs outline-none bg-slate-50 focus:border-blue-400 focus:bg-white font-bold text-slate-700"
                    >
                      <option value="ICICI Lombard GIC">ICICI Lombard GIC</option>
                      <option value="HDFC ERGO General">HDFC ERGO General</option>
                      <option value="Tata AIG General">Tata AIG General</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Policy Number</label>
                      <input
                        type="text"
                        value={regPolicyNumber}
                        onChange={(e) => setRegPolicyNumber(e.target.value)}
                        className="border border-slate-200 rounded-md py-2 px-3 text-xs outline-none bg-slate-50 focus:border-blue-400 focus:bg-white font-medium text-slate-750"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Premium Amount</label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-slate-400">₹</span>
                        <input
                          type="text"
                          value={regPremiumAmount}
                          onChange={(e) => setRegPremiumAmount(e.target.value)}
                          className="border border-slate-200 rounded-md py-2 pl-7 pr-3 text-xs outline-none bg-slate-50 focus:border-blue-400 focus:bg-white font-medium text-slate-750 w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 2: Optional Accessories Checkbox list */}
                <div className="flex flex-col gap-3">
                  <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase border-b border-slate-50 pb-1">Optional Accessories</span>

                  {/* Item 1 */}
                  <label className="flex items-start justify-between p-3 rounded-lg border border-slate-200/80 bg-slate-50/20 hover:bg-slate-50 cursor-pointer transition-colors">
                    <div className="flex items-start gap-2.5">
                      <input
                        type="checkbox"
                        checked={regSeatCovers}
                        onChange={(e) => setRegSeatCovers(e.target.checked)}
                        className="mt-0.5"
                      />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-slate-700">Premium Seat Covers</span>
                        <span className="text-[10px] text-slate-400 font-medium">Genuine leatherette finish</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-700">₹ 8,500</span>
                  </label>

                  {/* Item 2 */}
                  <label className="flex items-start justify-between p-3 rounded-lg border border-slate-200/80 bg-slate-50/20 hover:bg-slate-50 cursor-pointer transition-colors">
                    <div className="flex items-start gap-2.5">
                      <input
                        type="checkbox"
                        checked={regGpsTracker}
                        onChange={(e) => setRegGpsTracker(e.target.checked)}
                        className="mt-0.5"
                      />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-slate-700">GPS Fleet Tracker</span>
                        <span className="text-[10px] text-slate-400 font-medium">Real-time telematics enabled</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-700">₹ 12,000</span>
                  </label>

                  {/* Item 3 */}
                  <label className="flex items-start justify-between p-3 rounded-lg border border-slate-200/80 bg-slate-50/20 hover:bg-slate-50 cursor-pointer transition-colors">
                    <div className="flex items-start gap-2.5">
                      <input
                        type="checkbox"
                        checked={regWarranty}
                        onChange={(e) => setRegWarranty(e.target.checked)}
                        className="mt-0.5"
                      />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-slate-700">Extended Warranty (5yr)</span>
                        <span className="text-[10px] text-slate-400 font-medium">Engine & Powertrain only</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-700">₹ 24,999</span>
                  </label>
                </div>

              </div>
            </div>

          </div>

          {/* Column 2 (Right) - Vehicle Info and delivery schedule */}
          <div className="flex flex-col gap-6 w-full">

            {/* Card 3: Vehicle Information */}
            <div className="bg-white rounded-xl border border-[#eef2f6] shadow-sm p-6 flex flex-col gap-5">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <Building2 size={15} className="text-blue-600" />
                <h3 className="text-xs font-extrabold text-slate-800 m-0 uppercase tracking-wider font-heading">Vehicle Information</h3>
              </div>

              <div className="flex flex-col gap-4 text-xs font-semibold text-slate-500">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Select Inventory Stock</label>
                  <select
                    value={regSelectedStock}
                    onChange={(e) => setRegSelectedStock(e.target.value)}
                    className="border border-slate-200 rounded-md py-2 px-3 text-xs outline-none bg-white text-slate-700 font-bold focus:border-blue-400"
                  >
                    {stocks.map(item => (
                      <option key={item.id} value={item.id}>{item.label}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Vehicle Type</label>
                    <input
                      type="text"
                      value={selectedStockItem.type}
                      disabled
                      className="border border-slate-200 rounded-md py-2 px-3 bg-slate-100 text-slate-500 outline-none font-medium"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Model</label>
                    <input
                      type="text"
                      value={selectedStockItem.model}
                      disabled
                      className="border border-slate-200 rounded-md py-2 px-3 bg-slate-100 text-slate-500 outline-none font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Engine No.</label>
                    <input
                      type="text"
                      value={selectedStockItem.engine}
                      disabled
                      className="border border-slate-200 rounded-md py-2 px-3 bg-slate-100 text-slate-500 outline-none font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Color</label>
                    <div className="relative flex items-center">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-300 absolute left-3 border border-slate-400" />
                      <input
                        type="text"
                        value={selectedStockItem.color}
                        disabled
                        className="border border-slate-200 rounded-md py-2 pl-8 pr-3 bg-slate-100 text-slate-500 outline-none font-medium w-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Chassis No.</label>
                  <input
                    type="text"
                    value={selectedStockItem ? selectedStockItem.chassis : ''}
                    disabled
                    className="border border-blue-200 rounded-md py-2 px-3 bg-blue-50/50 text-[#184edb] outline-none font-mono font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Base Selling Price (From Inventory)</label>
                    <input
                      type="text"
                      value={`₹${(selectedStockItem ? Number(selectedStockItem.price.toString().replace(/[^\d.]/g, '')) : 0).toLocaleString('en-IN')}`}
                      disabled
                      className="border border-emerald-200 rounded-md py-2 px-3 bg-emerald-50/60 text-emerald-700 outline-none font-bold"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Accessories Kit (From Inventory)</label>
                    <input
                      type="text"
                      value={`₹${(selectedStockItem?.accessoriesTotal || 37760).toLocaleString('en-IN')}`}
                      disabled
                      className="border border-amber-200 rounded-md py-2 px-3 bg-amber-50/60 text-amber-800 outline-none font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 4: Delivery Schedule */}
            <div className="bg-white rounded-xl border border-[#eef2f6] shadow-sm p-6 flex flex-col gap-5">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <Calendar size={15} className="text-blue-600" />
                <h3 className="text-xs font-extrabold text-slate-800 m-0 uppercase tracking-wider font-heading">Delivery Schedule</h3>
              </div>

              <div className="flex flex-col gap-4 text-xs font-semibold text-slate-500">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Proposed Delivery Date</label>
                  <input
                    type="date"
                    value={regDeliveryDate}
                    onChange={(e) => setRegDeliveryDate(e.target.value)}
                    className="border border-slate-200 rounded-md py-2 px-3 text-xs outline-none bg-slate-50 focus:border-blue-400 focus:bg-white font-medium text-slate-755"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Delivery Location</label>
                  <select
                    value={regDeliveryLocation}
                    onChange={(e) => setRegDeliveryLocation(e.target.value)}
                    className="border border-slate-200 rounded-md py-2 px-3 text-xs outline-none bg-slate-50 focus:border-blue-400 focus:bg-white font-bold text-slate-705"
                  >
                    <option value="Showroom Delivery">Showroom Delivery</option>
                    <option value="Warehouse Direct">Warehouse Direct</option>
                    <option value="Customer Address">Customer Address</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Internal Notes</label>
                  <textarea
                    placeholder="Any special requests or notes for the delivery team..."
                    value={regInternalNotes}
                    onChange={(e) => setRegInternalNotes(e.target.value)}
                    rows={2.5}
                    className="border border-slate-200 rounded-md py-2 px-3 text-xs outline-none bg-slate-50 focus:border-blue-400 focus:bg-white font-medium text-slate-700 placeholder-slate-400 resize-none"
                  />
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Card 5: Billing & Payment Settlement (Full-width) */}
        <div className="bg-white rounded-xl border border-[#eef2f6] shadow-sm p-6 flex flex-col gap-5 w-full">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <CreditCard size={15} className="text-blue-600" />
              <h3 className="text-xs font-extrabold text-slate-800 m-0 uppercase tracking-wider font-heading">Billing & Payment Settlement</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400">Payment Status:</span>
              <span className="bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded text-[9.5px] font-extrabold tracking-wider uppercase">
                PENDING
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

            {/* Left side price item values */}
            <div className="lg:col-span-3 bg-blue-50/20 border border-blue-100/50 rounded-xl overflow-hidden text-xs">
              <div className="grid grid-cols-1 divide-y divide-blue-100/30">

                <div className="flex justify-between p-3.5 px-5 font-medium">
                  <span className="text-slate-500">Base Vehicle Price (Ex-Showroom)</span>
                  <span className="text-slate-800 font-bold">₹ {selectedStockItem.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>

                <div className="flex justify-between p-3.5 px-5 font-medium">
                  <span className="text-slate-500">Accessories & Add-ons</span>
                  <span className="text-slate-800 font-bold">₹ {calculatedAccessoriesCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>

                <div className="flex justify-between p-3.5 px-5 font-medium">
                  <span className="text-slate-500">Insurance Charges</span>
                  <span className="text-slate-800 font-bold">₹ {calculatedInsuranceCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>

                <div className="flex justify-between p-3.5 px-5 font-medium">
                  <span className="text-slate-500">Taxes (GST 18%)</span>
                  <span className="text-slate-805 font-bold">₹ {calculatedTaxes.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>

                <div className="flex justify-between p-3.5 px-5 font-medium">
                  <span className="text-red-500 font-bold">Dealer Discount</span>
                  <span className="text-red-650 font-extrabold">- ₹ {calculatedDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>

                <div className="flex justify-between p-4 px-5 bg-blue-55/10 font-extrabold text-sm text-[#184edb]">
                  <span>Grand Total Payable</span>
                  <span>₹ {grandTotalPayable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>

              </div>
            </div>

            {/* Right side inputs and financial bar */}
            <div className="lg:col-span-2 flex flex-col gap-4 text-xs font-semibold text-slate-505 w-full text-left">

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Payment Mode</label>
                  <select
                    value={regPaymentMode}
                    onChange={(e) => setRegPaymentMode(e.target.value)}
                    className="border border-slate-200 rounded-md py-2 px-3 text-xs outline-none bg-slate-50 focus:border-blue-400 focus:bg-white font-bold text-slate-700"
                  >
                    <option value="Bank Finance">Bank Finance</option>
                    <option value="Full Outright Cash">Full Outright Cash</option>
                    <option value="Digital/Cheque">Digital/Cheque</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Finance Provider</label>
                  <input
                    type="text"
                    value={regFinanceProvider}
                    onChange={(e) => setRegFinanceProvider(e.target.value)}
                    placeholder="HDFC Bank"
                    className="border border-slate-200 rounded-md py-2 px-3 text-xs outline-none bg-slate-50 focus:border-blue-400 focus:bg-white font-medium text-slate-700 placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Advance Amount Paid</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-slate-450">₹</span>
                    <input
                      type="text"
                      value={regAdvancePaid}
                      onChange={(e) => setRegAdvancePaid(e.target.value)}
                      className="border border-slate-200 rounded-md py-2 pl-7 pr-3 text-xs outline-none bg-slate-50 focus:border-blue-400 focus:bg-white font-medium text-slate-700 w-full"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Balance Payable</label>
                  <input
                    type="text"
                    value={`₹ ${Math.max(0, Math.round(balancePayable)).toLocaleString('en-IN')}`}
                    disabled
                    className="border border-slate-250 rounded-md py-2 px-3 bg-slate-100 text-slate-500 outline-none font-bold"
                  />
                </div>
              </div>

              {/* Financial Progress card */}
              <div className="bg-blue-50/30 rounded-xl p-4 border border-blue-100/40 mt-1 flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#184edb]">
                  <span>FINANCIAL CLEARANCE PROGRESS</span>
                  <span>{isNaN(financialProgress) ? '0.0' : Math.min(100, Math.max(0, financialProgress)).toFixed(1)}%</span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${isNaN(financialProgress) ? 0 : Math.min(100, Math.max(0, financialProgress))}%` }}
                  />
                </div>

                <span className="text-[9.5px] text-slate-400 font-medium">
                  Balance amount will be settled via Finance Disbursement.
                </span>
              </div>

            </div>

          </div>
        </div>

      </div>
    );
  }

  // 2. View state switcher: Detailed Tax Invoice (Mockup Format)
  if (viewingSale) {
    const gstRate = viewingSale.gstRate || parseFloat((companySettings?.defaultGstPercent || '18').toString().replace(/[^\d.]/g, '')) || 18;
    const discountRate = parseFloat((companySettings?.defaultDiscountPercent || '5').toString().replace(/[^\d.]/g, '')) || 0;
    const grandTotalNum = Number(viewingSale.grandTotal.toString().replace(/[^\d.]/g, '')) || 0;
    
    const matchedVehicle = dbVehicles.find(v => v.modelName === viewingSale.vehicleModel);

    const accessoriesNum = (viewingSale.accessoriesCharge && viewingSale.accessoriesCharge > 0)
      ? viewingSale.accessoriesCharge
      : ((viewingSale.accessoriesTotal && viewingSale.accessoriesTotal > 0)
        ? viewingSale.accessoriesTotal
        : (matchedVehicle?.accessoriesTotal && matchedVehicle.accessoriesTotal > 0 ? matchedVehicle.accessoriesTotal : 37760));

    const basePriceNum = (viewingSale.baseVehiclePrice && viewingSale.baseVehiclePrice > 0)
      ? viewingSale.baseVehiclePrice
      : ((matchedVehicle?.sellPrice && matchedVehicle.sellPrice > 0)
        ? matchedVehicle.sellPrice
        : ((matchedVehicle?.price && matchedVehicle.price > 0)
          ? matchedVehicle.price
          : Math.max(0, Math.round(grandTotalNum / (1 + gstRate / 100)) - accessoriesNum)));

    // Subtotal = Base Vehicle + Accessories Kit
    const subTotalNum = basePriceNum + accessoriesNum;

    // Service Insurance: Only if added during sale registration, else 0
    const insuranceNum = viewingSale.insuranceAmount || 0;

    const preDiscountTotal = subTotalNum + insuranceNum;

    // Discount: Settings discount % or saved discount amount
    const discountNum = (viewingSale.discountAmount && viewingSale.discountAmount > 0)
      ? viewingSale.discountAmount
      : Math.round(preDiscountTotal * (discountRate / 100));

    const taxableValue = (viewingSale.taxableValue && viewingSale.taxableValue > 0)
      ? viewingSale.taxableValue
      : Math.max(0, preDiscountTotal - discountNum);

    const taxesNum = (viewingSale.gstAmount && viewingSale.gstAmount > 0)
      ? viewingSale.gstAmount
      : Math.round(taxableValue * (gstRate / 100));

    const computedGrandTotal = viewingSale.grandTotal ? grandTotalNum : (taxableValue + taxesNum);

    let accSummary = 'Mats, Mud Flaps, basic toolkit';
    if (matchedVehicle?.accessoriesKit && matchedVehicle.accessoriesKit.length > 0) {
      accSummary = matchedVehicle.accessoriesKit.map((a: any) => a.name).filter(Boolean).join(', ');
    } else if ((viewingSale as any).accessoriesKit && (viewingSale as any).accessoriesKit.length > 0) {
      accSummary = (viewingSale as any).accessoriesKit.map((a: any) => a.name).filter(Boolean).join(', ');
    }

    const items = [
      { sl: '01', desc: `${viewingSale.vehicleModel} - Base Vehicle`, subtitle: 'Primary vehicle chassis and cabin', qty: '1 Unit', unitPrice: `₹${basePriceNum.toLocaleString('en-IN')}`, amount: `₹${basePriceNum.toLocaleString('en-IN')}` },
      { sl: '02', desc: 'Standard Accessories Kit', subtitle: accSummary, qty: '1 Set', unitPrice: `₹${accessoriesNum.toLocaleString('en-IN')}`, amount: `₹${accessoriesNum.toLocaleString('en-IN')}` }
    ];

    return (
      <div className="p-8 bg-[#f6f8fc] min-h-[calc(100vh-70px)] flex flex-col gap-6 box-border font-sans text-slate-700 text-left relative">

        {/* Top actions bar */}
        <div className="flex justify-between items-center flex-wrap gap-3 no-print">
          <div>
            <button
              onClick={() => setViewingSale(null)}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs py-2 px-4 rounded-md cursor-pointer transition-colors shadow-xs flex items-center gap-1.5"
            >
              &larr; Back to List
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-500">Invoice {viewingSale.invoiceNo}</span>
            <button
              onClick={() => setPrintingSale(viewingSale)}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs py-2.5 px-4 rounded-md cursor-pointer transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Printer size={13} /> Print
            </button>
            <button
              onClick={() => window.print()}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs py-2.5 px-4 rounded-md cursor-pointer transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Download size={13} /> PDF
            </button>
            <button className="bg-[#184edb] hover:bg-blue-800 text-white font-bold text-xs py-2.5 px-5 border-none rounded-md cursor-pointer transition-colors shadow-md flex items-center gap-1.5">
              <FileText size={13} /> Send to Customer
            </button>
          </div>
        </div>

        {/* Invoice Body container strictly matching the screenshot layout */}
        <div id="print-invoice-area" className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex flex-col gap-6 w-full max-w-5xl mx-auto text-slate-700">

          {/* Section 1: Header */}
          <div className="flex justify-between items-start border-b border-slate-100 pb-5">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                {companySettings?.logoUrl ? (
                  <img src={companySettings.logoUrl} alt="Company Logo" className="h-10 w-auto object-contain max-w-[120px]" />
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-[#184edb] flex items-center justify-center text-white font-extrabold text-sm shadow-xs">
                    {(companySettings?.companyName || 'HHS EICHER').slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 m-0 font-heading tracking-tight">
                    {companySettings?.companyName || 'HHS EICHER MOTORS'}
                  </h2>
                  {companySettings?.dealerName && (
                    <span className="text-xs text-slate-450 font-bold block">{companySettings.dealerName}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 text-[11px] font-semibold text-slate-455 mt-2">
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-slate-500">Address:</span>
                  <span>{companySettings?.streetAddress || 'Industrial Park West, Sector 12'}</span>
                  <span>
                    {companySettings?.city ? `${companySettings.city}, ${companySettings?.stateName || ''} - ${companySettings?.pinCode || ''}` : 'Automotive City, CA 90210'}
                  </span>
                  <span>GSTIN: {companySettings?.gstNumber || '22AAAAA0000A1Z5'}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-slate-500">Contact Details:</span>
                  <span>Phone: {companySettings?.mobileNumber || companySettings?.phoneNum || '+1 (555) 012-3456'}</span>
                  <span>Email: {companySettings?.emailAddress || 'contact@autopro-elite.com'}</span>
                  <span>Web: {companySettings?.websiteUrl || 'www.autopro-elite.com'}</span>
                </div>
              </div>
            </div>

            <div className="text-right flex flex-col items-end gap-1.5">
              <h1 className="text-xl font-extrabold text-blue-600 tracking-tight font-heading m-0 uppercase">TAX INVOICE</h1>
              <div className="text-xs font-semibold text-slate-500 mt-2 flex flex-col items-end gap-0.5">
                <span>Invoice Number: <span className="font-bold text-slate-800">{viewingSale.invoiceNo}</span></span>
                <span>Invoice Date: <span className="font-bold text-slate-800">{viewingSale.deliveryDate.replace('Scheduled: ', '')}</span></span>
                <span>Job Card: <span className="font-bold text-slate-800">JC/8892/23</span></span>
              </div>
              <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-0.5 rounded text-[10px] font-extrabold mt-1">
                PAID
              </span>
            </div>
          </div>

          {/* Section 2: Profiles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Customer info */}
            <div className="border border-slate-200/80 rounded-xl p-5 bg-slate-50/20 flex flex-col gap-3 text-xs">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <User size={14} className="text-blue-600" />
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Customer Information</span>
              </div>
              <div className="grid grid-cols-2 gap-y-2.5 font-semibold text-slate-500">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Name</span>
                  <span className="text-slate-800 font-bold">{viewingSale.customerName}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Contact</span>
                  <span className="text-slate-850 font-semibold">+91 98765 43210</span>
                </div>
                <div className="flex flex-col gap-0.5 col-span-2">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Billing Address</span>
                  <span className="text-slate-700 font-semibold">12B, Skyview Towers, Sector 56, Gurugram, 122011</span>
                </div>
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="border border-slate-200/80 rounded-xl p-5 bg-slate-50/20 flex flex-col gap-3 text-xs">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <Truck size={14} className="text-blue-600" />
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Vehicle Details</span>
              </div>
              <div className="grid grid-cols-3 gap-y-2.5 font-semibold text-slate-500">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Model</span>
                  <span className="text-slate-800 font-bold">{viewingSale.vehicleModel}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Reg No.</span>
                  <span className="text-slate-805 font-bold">HR 55 AT 4492</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Odometer</span>
                  <span className="text-slate-750">45,210 KM</span>
                </div>
                <div className="flex flex-col gap-0.5 col-span-2">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Chassis No.</span>
                  <span className="text-slate-700 font-mono text-[10px] font-bold">MC284JS92X99023</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Service Type</span>
                  <span className="text-slate-755 font-bold">Comprehensive Annual Service</span>
                </div>
              </div>
            </div>

          </div>

          {/* Section 3: Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden mt-2 text-xs">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[9px] border-b border-slate-250">
                  <th className="p-3.5 px-5">SI.</th>
                  <th className="p-3.5 px-5">Description</th>
                  <th className="p-3.5 px-5 text-center">Qty/Hours</th>
                  <th className="p-3.5 px-5 text-right">Unit Price</th>
                  <th className="p-3.5 px-5 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/20 font-semibold text-slate-705">
                    <td className="p-3.5 px-5 text-slate-455 font-bold">{item.sl}</td>
                    <td className="p-3.5 px-5">
                      <span className="font-extrabold text-slate-850 block">{item.desc}</span>
                      <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{item.subtitle}</span>
                    </td>
                    <td className="p-3.5 px-5 text-center font-bold text-slate-850">{item.qty}</td>
                    <td className="p-3.5 px-5 text-right text-slate-550">{item.unitPrice}</td>
                    <td className="p-3.5 px-5 text-right font-extrabold text-slate-900">{item.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 4: Settlement and summary totals */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start mt-2">

            {/* Column 1: Payment Details */}
            <div className="lg:col-span-3 flex flex-col gap-4 w-full">
              {/* Payment Details text box */}
              <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/20 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-100 pb-2 mb-3">Payment Details</span>
                <div className="grid grid-cols-2 gap-y-2.5 font-semibold text-slate-500">
                  <span>Payment Mode:</span>
                  <span className="text-slate-800 font-bold">Online / UPI</span>
                  <span>Transaction ID:</span>
                  <span className="text-slate-800 font-bold font-mono">TXN_9921884200XC</span>
                  <span>Status:</span>
                  <span className="text-emerald-600 font-bold">Successfully Verified</span>
                </div>
              </div>
            </div>

            {/* Column 2: Subtotals & grand total */}
            <div className="lg:col-span-2 flex flex-col gap-2 text-xs font-semibold text-slate-505 w-full text-right">

              <div className="flex justify-between px-2 font-medium">
                <span>Subtotal:</span>
                <span className="text-slate-800 font-bold">₹{subTotalNum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between px-2 font-medium">
                <span>Service Insurance:</span>
                <span className="text-slate-800 font-bold">₹{insuranceNum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between px-2 font-medium">
                <span className="text-red-500 font-bold">Discount ({discountRate}%):</span>
                <span className="text-red-655 font-extrabold">-₹{discountNum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between px-2 font-medium border-t border-slate-100 pt-2.5">
                <span>Taxable Value:</span>
                <span className="text-slate-850 font-bold">₹{taxableValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between px-2 font-medium">
                <span>GST ({gstRate}%):</span>
                <span className="text-slate-855 font-bold">₹{taxesNum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>

              {/* Grand Total dark box block */}
              <div className="bg-[#0c1a40] rounded-lg p-4 px-5 text-white flex justify-between items-center mt-2.5 shadow-md">
                <span className="text-xs font-bold text-white/80">Grand Total</span>
                <span className="text-base font-extrabold text-white">₹{computedGrandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              
              <div className="flex justify-between px-2 font-medium text-emerald-600 mt-2 text-xs">
                <span>Advance Paid:</span>
                <span className="font-bold">{viewingSale.advancePaid || '₹0'}</span>
              </div>
              
              <div className="flex justify-between px-2 font-extrabold text-red-500 mt-1 pt-1 border-t border-slate-100/50 text-[13px]">
                <span>Balance Due:</span>
                <span>{viewingSale.balanceAmount || '₹0'}</span>
              </div>
            </div>

          </div>

          {/* Section 5: Terms and Guarantee footer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-100 pt-6 text-[10px] text-slate-400 font-semibold leading-relaxed mt-2">
            <div className="flex flex-col gap-1">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[8.5px]">Terms & Conditions</span>
              <span>Goods once sold will not be taken back. Interest @18% will be charged if not paid within 7 days. All disputes are subject to Gurugram Jurisdiction.</span>
            </div>

            <div className="flex flex-col gap-1 text-right md:text-left">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[8.5px]">Service Guarantee</span>
              <span>All genuine Eicher spare parts come with a 6-month manufacturer warranty. Service labor is guaranteed for 30 days or 2,000 kms, whichever is earlier.</span>
            </div>

            <div className="col-span-1 md:col-span-2 flex flex-col items-end gap-1.5 mt-4 border-t border-slate-100/50 pt-5">
              <div className="w-48 border-b border-slate-350 text-center pb-1 text-xs font-bold text-slate-700 font-handwriting">
                Authorized Signatory
              </div>
              <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">
                This is a computer-generated invoice and does not require a physical signature.
              </span>
            </div>
          </div>

        </div>

        {/* Promo footer AMC banner matching mockup */}
        <div className="bg-gradient-to-r from-[#0c1a40] to-[#040817] rounded-xl p-5 text-white flex justify-between items-center flex-wrap gap-4 shadow-md max-w-5xl mx-auto w-full no-print">
          <div className="flex flex-col gap-1 text-left">
            <h4 className="text-xs font-extrabold m-0 text-white tracking-wide uppercase">Annual Maintenance Contract</h4>
            <span className="text-[10px] text-white/60 font-medium">Renew today and save 15% on your next 3 services.</span>
          </div>
          <button className="bg-white/10 hover:bg-white/15 text-white border border-white/20 py-1.5 px-4 rounded-md text-[10.5px] font-bold cursor-pointer transition-colors">
            Explore Plans &rarr;
          </button>
        </div>

        {/* Render Print Modal overlay inside detailed view scope also to show it in front view */}
        {printingSale && (
          <PrintInvoiceModal
            printingSale={printingSale}
            setPrintingSale={setPrintingSale}
            handlePrintTrigger={handlePrintTrigger}
          />
        )}

      </div>
    );
  }

  // --- Dynamic KPI Calculations ---
  const totalSalesAmount = sales.reduce((acc, sale) => {
    if (sale.status !== 'CANCELLED') {
      const num = Number(sale.grandTotal.toString().replace(/[^\d.]/g, ''));
      return acc + (isNaN(num) ? 0 : num);
    }
    return acc;
  }, 0);

  const pendingSalesCount = sales.filter(s => s.status === 'PENDING').length;
  const deliveredSalesCount = sales.filter(s => s.status === 'DELIVERED').length;

  const formatCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const revenueString = formatCurrency(totalSalesAmount);
  const monthlyString = formatCurrency(totalSalesAmount * 0.35); // Simulated monthly metric

  return (
    <div className="p-8 bg-[#f6f8fc] min-h-[calc(100vh-70px)] flex flex-col gap-6 box-border font-sans text-slate-700 text-left">

      {/* Print Overlay CSS Style Inject */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-invoice-area, #print-invoice-area *,
          #sales-ledger-print-area, #sales-ledger-print-area * {
            visibility: visible;
          }
          #print-invoice-area, #sales-ledger-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            padding: 15px !important;
            margin: 0 auto !important;
            background: #ffffff !important;
            box-sizing: border-box !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Top Header Row with Actions */}
      <div className="flex justify-between items-center">
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Vehicles &gt; Vehicle Sales</span>
          <h1 className="text-2xl font-extrabold text-slate-900 m-0 mt-1.5 tracking-tight font-heading">Vehicle Sales</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportExcel}
            className="bg-white border border-slate-200 rounded-md py-2 px-4 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors text-slate-600 hover:bg-slate-50 shadow-xs"
            title="Export Sales Ledger to Excel CSV"
          >
            <FileSpreadsheet size={13} className="text-emerald-600" /> Export Excel
          </button>
          <button
            onClick={handleExportPDF}
            className="bg-white border border-slate-200 rounded-md py-2 px-4 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors text-slate-600 hover:bg-slate-50 shadow-xs"
            title="Print or Save Sales Ledger as PDF"
          >
            <FileText size={13} className="text-red-500" /> Export PDF
          </button>
          <button
            onClick={() => setIsRegisteringSale(true)}
            className="bg-[#184edb] text-white border-none py-2 px-4 rounded-md text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors hover:bg-blue-900 shadow-sm"
          >
            <Plus size={13} /> New Sale
          </button>
        </div>
      </div>

      {/* KPI Stats Row matching mockup */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">

        {/* Vehicles Sold */}
        <div className="bg-white rounded-xl border border-[#eef2f6] shadow-sm p-4 flex flex-col justify-between h-24">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vehicles Sold</span>
            <TrendingUp size={16} className="text-blue-500" />
          </div>
          <div className="flex items-end justify-between mt-2">
            <h2 className="text-xl font-extrabold text-slate-800 m-0">{sales.length} Units</h2>
            <span className="bg-emerald-50 text-emerald-600 text-[9px] font-bold px-1.5 py-0.5 rounded">+12%</span>
          </div>
        </div>

        {/* Monthly Sales */}
        <div className="bg-white rounded-xl border border-[#eef2f6] shadow-sm p-4 flex flex-col justify-between h-24">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Monthly Sales</span>
            <DollarSign size={16} className="text-blue-500" />
          </div>
          <div className="flex items-end justify-between mt-2">
            <h2 className="text-xl font-extrabold text-slate-800 m-0">{monthlyString}</h2>
            <span className="bg-emerald-50 text-emerald-600 text-[9px] font-bold px-1.5 py-0.5 rounded">+8%</span>
          </div>
        </div>

        {/* Pending Deliveries */}
        <div className="bg-white rounded-xl border border-[#eef2f6] shadow-sm p-4 flex flex-col justify-between h-24">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Deliveries</span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <div className="flex items-end justify-between mt-2">
            <h2 className="text-xl font-extrabold text-slate-800 m-0">{pendingSalesCount}</h2>
            <span className="text-[9px] font-bold text-slate-400">Steady</span>
          </div>
        </div>

        {/* Delivered Vehicles */}
        <div className="bg-white rounded-xl border border-[#eef2f6] shadow-sm p-4 flex flex-col justify-between h-24">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Delivered</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <div className="flex items-end justify-between mt-2">
            <h2 className="text-xl font-extrabold text-slate-800 m-0">{deliveredSalesCount}</h2>
            <span className="bg-blue-50 text-blue-600 text-[9px] font-bold px-1.5 py-0.5 rounded">Target Met</span>
          </div>
        </div>

        {/* Retention Rate */}
        <div className="bg-white rounded-xl border border-[#eef2f6] shadow-sm p-4 flex flex-col justify-between h-24">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Retention Rate</span>
            <Percent size={16} className="text-indigo-500" />
          </div>
          <div className="flex items-end justify-between mt-2">
            <h2 className="text-xl font-extrabold text-slate-800 m-0">94%</h2>
            <span className="bg-emerald-50 text-emerald-600 text-[9px] font-bold px-1.5 py-0.5 rounded">+2.4%</span>
          </div>
        </div>

        {/* Total Revenue - Dark Blue Card matching mockup */}
        <div className="bg-gradient-to-br from-[#184edb] to-[#0d287a] rounded-xl p-4 flex flex-col justify-between h-24 text-white shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider">Total Revenue</span>
            <DollarSign size={16} className="text-white/80" />
          </div>
          <div className="flex items-end justify-between mt-2">
            <h2 className="text-xl font-extrabold m-0 text-white">{revenueString}</h2>
            <span className="bg-white/15 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">YTD</span>
          </div>
        </div>

      </div>

      {/* Sales Ledger Table Section */}
      <div id="sales-ledger-print-area" className="bg-white rounded-xl border border-[#eef2f6] shadow-sm overflow-hidden flex flex-col w-full">

        <div className="p-4 px-6 border-b border-slate-100 bg-slate-50/10 flex items-center justify-between flex-wrap gap-4 no-print">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-extrabold text-slate-800 m-0 font-heading">Sales Ledger</h3>
            <span className="bg-blue-50 text-[#184edb] text-[10px] font-bold py-0.5 px-2.5 rounded-full border border-blue-100">
              Showing {filteredSales.length} of {sales.length} Sales
            </span>
          </div>

          {/* Filter Option Controls right above Sales Ledger table */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search Input */}
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Search invoice, customer, model..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-slate-200 rounded-md py-1.5 pl-3 pr-7 text-xs outline-none bg-slate-50 focus:bg-white focus:border-blue-400 transition-all font-medium text-slate-700 w-56"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Status Filter Dropdown */}
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal size={13} className="text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-slate-200 rounded-md py-1.5 px-3 text-xs outline-none bg-slate-50 focus:bg-white focus:border-blue-400 transition-all font-semibold text-slate-700 cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="DELIVERED">Delivered</option>
                <option value="PENDING">Pending</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Reset Button */}
            {(searchTerm || statusFilter !== 'ALL') && (
              <button
                onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); }}
                className="text-xs text-red-500 font-bold hover:underline cursor-pointer border-none bg-transparent"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse text-left text-[12px]">
            <thead>
              <tr className="bg-slate-50/20 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                <th className="py-3.5 px-6 border-b border-slate-100">INVOICE NO.</th>
                <th className="py-3.5 px-6 border-b border-slate-100">CUSTOMER NAME</th>
                <th className="py-3.5 px-6 border-b border-slate-100">VEHICLE MODEL</th>
                <th className="py-3.5 px-6 border-b border-slate-100">SALE STATUS</th>
                <th className="py-3.5 px-6 border-b border-slate-100 text-right">GRAND TOTAL</th>
                <th className="py-3.5 px-6 border-b border-slate-100">DELIVERY DATE</th>
                <th className="py-3.5 px-6 border-b border-slate-100 text-center no-print">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((sale) => (
                <tr 
                  key={sale.invoiceNo} 
                  onClick={() => setViewingSale(sale)}
                  className="hover:bg-slate-50/50 cursor-pointer transition-colors text-slate-700 font-medium"
                >
                  <td className="py-4 px-6 border-b border-slate-100 font-bold text-[#184edb] hover:underline">
                    {sale.invoiceNo}
                  </td>
                  <td
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onCustomerClick) {
                        onCustomerClick(sale.customerName);
                      } else {
                        setViewingSale(sale);
                      }
                    }}
                    className="py-4 px-6 border-b border-slate-100 text-[#184edb] font-bold cursor-pointer hover:underline"
                  >
                    {sale.customerName}
                  </td>
                  <td className="py-4 px-6 border-b border-slate-100 text-slate-750 font-semibold">{sale.vehicleModel}</td>
                  <td className="py-4 px-6 border-b border-slate-100">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${sale.status === 'DELIVERED'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        : sale.status === 'PENDING'
                          ? 'bg-amber-50 text-amber-600 border border-amber-100'
                          : 'bg-red-50 text-red-600 border border-red-100'
                      }`}>
                      {sale.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 border-b border-slate-100 text-right font-extrabold text-slate-900">{sale.grandTotal}</td>
                  <td className="py-4 px-6 border-b border-slate-100 text-slate-550">{sale.deliveryDate}</td>
                  <td 
                    onClick={(e) => e.stopPropagation()}
                    className="py-4 px-6 border-b border-slate-100"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setViewingSale(sale)}
                        className="p-1.5 bg-blue-50 border border-blue-100 rounded-md text-blue-600 hover:bg-blue-100 cursor-pointer flex items-center justify-center transition-colors shadow-xs"
                        title="View Details"
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        onClick={() => handleEditClick(sale)}
                        className="p-1.5 bg-green-50 border border-green-100 rounded-md text-green-600 hover:bg-green-100 cursor-pointer flex items-center justify-center transition-colors shadow-xs"
                        title="Edit Record"
                      >
                        <Edit size={13} />
                      </button>
                      <button
                        onClick={() => setPrintingSale(sale)}
                        className="p-1.5 bg-amber-50 border border-amber-100 rounded-md text-amber-600 hover:bg-amber-100 cursor-pointer flex items-center justify-center transition-colors shadow-xs"
                        title="Print Invoice"
                      >
                        <Printer size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteSale(sale)}
                        className="p-1.5 bg-red-50 border border-red-100 rounded-md text-red-600 hover:bg-red-100 cursor-pointer flex items-center justify-center transition-colors shadow-xs"
                        title="Delete Record"
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

        {/* Footer controls matching mockup page */}
        <div className="p-4 bg-slate-50/15 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing {sales.length} of {112 + sales.length} entries
          </div>
          <div className="flex items-center gap-1">
            <button className="w-7 h-7 bg-white border border-slate-200 rounded-md flex items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-50" disabled>
              &lt;
            </button>
            <button className="w-8 h-7 bg-[#184edb] text-white border-none rounded-md flex items-center justify-center font-bold text-xs">
              1
            </button>
            <button className="w-8 h-7 bg-white border border-slate-200 text-slate-700 rounded-md flex items-center justify-center hover:bg-slate-50 cursor-pointer">
              2
            </button>
            <button className="w-8 h-7 bg-white border border-slate-200 text-slate-700 rounded-md flex items-center justify-center hover:bg-slate-50 cursor-pointer">
              3
            </button>
            <button className="w-7 h-7 bg-white border border-slate-200 text-slate-650 cursor-pointer hover:bg-slate-50">
              &gt;
            </button>
          </div>
        </div>

      </div>



      {/* Style block for printing Tax Invoice with 100% exact A4 fidelity */}
      <style>{`
        @page {
          size: A4 portrait;
          margin: 8mm;
        }

        @media print {
          html, body {
            width: 210mm;
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body * {
            visibility: hidden;
          }

          #print-invoice-area, #print-invoice-area * {
            visibility: visible;
          }

          #print-invoice-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            padding: 15px !important;
            margin: 0 auto !important;
            background: #ffffff !important;
            box-sizing: border-box !important;
            page-break-inside: avoid !important;
          }

          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Render Print Modal overlay inside main view scope */}
      {printingSale && (
        <PrintInvoiceModal
          printingSale={printingSale}
          setPrintingSale={setPrintingSale}
          companySettings={companySettings}
          dbVehicles={dbVehicles}
        />
      )}

    </div>
  );
};

export default VehicleSales;
