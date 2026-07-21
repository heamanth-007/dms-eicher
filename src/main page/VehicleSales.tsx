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
  X,
  User,
  SlidersHorizontal,
  Building2,
  Calendar,
  Save,
  ShieldCheck,
  CreditCard,
  Wrench,
  Download,
  Truck
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
}

interface PrintModalProps {
  printingSale: SaleRecord;
  setPrintingSale: (sale: SaleRecord | null) => void;
  handlePrintTrigger: () => void;
}

// Reusable print modal matching the mockup format exactly
const PrintInvoiceModal: React.FC<PrintModalProps> = ({ printingSale, setPrintingSale, handlePrintTrigger }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 no-print">
      <div className="bg-white rounded-xl shadow-lg border border-slate-100 w-full max-w-3xl overflow-hidden flex flex-col">

        {/* Modal Header */}
        <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-sm font-extrabold text-slate-800 m-0 font-heading">Print Invoice Statement</h3>
          <button
            onClick={() => setPrintingSale(null)}
            className="bg-transparent border-none text-slate-400 hover:text-slate-650 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Invoice Body Container */}
        <div className="p-8 max-h-[80vh] overflow-y-auto bg-slate-50/40">
          <div
            id="print-invoice-area"
            className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm text-left flex flex-col gap-6 text-slate-700 relative overflow-hidden"
          >

            {/* Watermark background */}
            <div
              className="absolute pointer-events-none text-slate-100/15 font-black uppercase text-[52px] tracking-[6px] select-none text-center"
              style={{
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) rotate(-30deg)',
                whiteSpace: 'nowrap',
                zIndex: 0
              }}
            >
              EICHER WORKSHOP
            </div>

            <div className="relative z-10 flex flex-col gap-6 w-full">

              {/* Invoice Header */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-5 w-full">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    {/* Mock logo */}
                    <div className="bg-slate-900 text-white font-extrabold px-2 py-0.5 rounded text-xs tracking-wider">
                      EICH
                    </div>
                    <h2 className="text-sm font-extrabold text-slate-955 m-0 font-heading tracking-tight">WORKSHOP ERP</h2>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold -mt-1 block">Industrial Solutions & Maintenance</span>
                  <div className="text-[10.5px] font-medium text-slate-450 mt-1 flex flex-col gap-0.5 leading-tight">
                    <span>Plot No. 42, Heavy Engineering Zone,</span>
                    <span>Industrial Area Phase II, Bangalore, 560058</span>
                    <span>GSTIN: 29AAACE1234F1Z5</span>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end gap-1">
                  <h1 className="text-lg font-extrabold text-blue-600 tracking-tight font-heading m-0 uppercase">TAX INVOICE</h1>
                  <div className="text-xs font-semibold text-slate-500 mt-2 flex flex-col items-end gap-0.5">
                    <span>INVOICE NO: &nbsp;<span className="font-bold text-slate-950">{printingSale.invoiceNo}</span></span>
                    <span>DATE: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="font-bold text-slate-800">{printingSale.deliveryDate.replace('Scheduled: ', '')}</span></span>
                    <span>JOB CARD: &nbsp;&nbsp;&nbsp;&nbsp;<span className="font-bold text-slate-800">JC/882/2024</span></span>
                  </div>
                </div>
              </div>

              {/* BILL TO & VEHICLE DETAILS side-by-side cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">

                {/* Bill To */}
                <div className="border border-slate-200/80 rounded-lg p-4 bg-slate-50/15 flex flex-col gap-2 text-xs">
                  <span className="font-bold text-blue-600 tracking-wider text-[9px] uppercase">BILL TO:</span>
                  <h4 className="text-slate-900 font-bold m-0 text-[12.5px]">{printingSale.customerName}</h4>
                  <div className="text-slate-500 font-medium flex flex-col gap-0.5 mt-0.5">
                    <span>45/A North Industrial Park, Mumbai</span>
                    <span>Phone: +91 98765 43210</span>
                    <span>GSTIN: 27AABCT8844D1Z2</span>
                  </div>
                </div>

                {/* Vehicle Details */}
                <div className="border border-slate-200/80 rounded-lg p-4 bg-slate-50/15 flex flex-col gap-2 text-xs">
                  <span className="font-bold text-blue-600 tracking-wider text-[9px] uppercase">VEHICLE DETAILS:</span>
                  <div className="grid grid-cols-3 gap-y-1 font-semibold text-slate-500">
                    <span className="text-slate-400">Model:</span>
                    <span className="col-span-2 text-slate-850 font-bold">{printingSale.vehicleModel}</span>
                    <span className="text-slate-400">Reg. No:</span>
                    <span className="col-span-2 text-slate-900 font-bold">MH-01-AX-9922</span>
                    <span className="text-slate-400">Odometer:</span>
                    <span className="col-span-2 text-slate-750">45,210 KM</span>
                    <span className="text-slate-400">Chassis:</span>
                    <span className="col-span-2 text-slate-750 font-mono text-[10.5px]">MC284HL99K201</span>
                  </div>
                </div>

              </div>

              {/* Items Table matching mockup items */}
              <div className="border border-slate-200 rounded-lg overflow-hidden mt-1 text-[11px] w-full">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[9.5px] border-b border-slate-200">
                      <th className="p-3 text-center w-8">#</th>
                      <th className="p-3">DESCRIPTION</th>
                      <th className="p-3 text-center">QTY/HRS</th>
                      <th className="p-3 text-right">UNIT PRICE</th>
                      <th className="p-3 text-center">TAX (%)</th>
                      <th className="p-3 text-right">TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { id: 1, desc: 'Turbocharger Gasket Replacement', sub: 'Labor - Engine System', qty: '4.5', price: '₹850.00', tax: '18%', total: '₹3,825.00' },
                      { id: 2, desc: 'Heavy Duty Air Filter (E-Series)', sub: 'Part ID: #EICH-AF-992', qty: '1', price: '₹4,200.00', tax: '28%', total: '₹4,200.00' },
                      { id: 3, desc: 'Engine Oil - 15W40 (Semi-Synth)', sub: 'Volume: 12 Liters', qty: '12', price: '₹450.00', tax: '18%', total: '₹5,400.00' },
                      { id: 4, desc: 'Wheel Alignment & Balancing', sub: 'Service Bundle', qty: '1', price: '₹1,200.00', tax: '18%', total: '₹1,200.00' }
                    ].map((item) => (
                      <tr key={item.id} className="border-b border-slate-100 font-semibold text-slate-700">
                        <td className="p-3 text-center text-slate-450">{item.id}</td>
                        <td className="p-3">
                          <span className="font-bold text-slate-850 block">{item.desc}</span>
                          <span className="text-[9.5px] text-slate-400 font-medium block mt-0.5">{item.sub}</span>
                        </td>
                        <td className="p-3 text-center font-bold text-slate-800">{item.qty}</td>
                        <td className="p-3 text-right text-slate-550">{item.price}</td>
                        <td className="p-3 text-center text-slate-500">{item.tax}</td>
                        <td className="p-3 text-right font-extrabold text-slate-900">{item.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary row & auth stamp */}
              <div className="flex justify-between items-start mt-2 flex-wrap gap-4 w-full text-xs">

                {/* Left: Stamp */}
                <div className="pt-2 flex justify-start items-center">
                  <div
                    className="rounded-full border-3 border-double border-blue-500/30 text-blue-600/50 text-[7px] font-black w-[58px] h-[58px] flex items-center justify-center text-center uppercase tracking-wider leading-tight select-none rotate-[-15deg] flex-shrink-0"
                    style={{
                      textShadow: '0 0 1px rgba(59, 130, 246, 0.1)'
                    }}
                  >
                    EICHER<br />AUTH STAMP
                  </div>
                </div>

                {/* Right: Sum values */}
                <div className="w-72 flex flex-col gap-2 text-right font-semibold text-slate-500">
                  <div className="flex justify-between px-1">
                    <span>Subtotal (Excl. Tax)</span>
                    <span className="text-slate-850 font-bold">₹14,625.00</span>
                  </div>
                  <div className="flex justify-between px-1">
                    <span>CGST (9%)</span>
                    <span className="text-slate-850 font-bold">₹1,316.25</span>
                  </div>
                  <div className="flex justify-between px-1">
                    <span>SGST (9%)</span>
                    <span className="text-slate-850 font-bold">₹1,316.25</span>
                  </div>
                  <div className="flex justify-between px-1">
                    <span>IGST (0%)</span>
                    <span className="text-slate-850 font-bold">₹0.00</span>
                  </div>

                  <div className="flex justify-between font-extrabold text-blue-650 border-t border-slate-100 pt-2 text-[13px]">
                    <span>Grand Total</span>
                    <span>₹17,257.50</span>
                  </div>
                  <span className="text-[9px] text-slate-400 italic block -mt-1 font-medium text-right">
                    Rupees Seventeen Thousand Two Hundred Fifty Seven and Fifty Paise Only
                  </span>
                </div>

              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-10 mt-8 border-t border-slate-100 pt-6 text-[10px] text-slate-450 uppercase font-bold w-full">
                <div className="flex flex-col gap-1 items-start text-left">
                  <div className="w-40 border-b border-slate-200 pb-1 h-6" />
                  <span className="text-slate-700">CUSTOMER SIGNATURE</span>
                  <span className="text-[8.5px] text-slate-400 lowercase font-medium">Date: _____/_____/2024</span>
                </div>

                <div className="flex flex-col gap-1 items-end text-right">
                  <div className="w-40 border-b border-slate-200 pb-1 h-6" />
                  <span className="text-slate-700">AUTHORIZED SIGNATORY</span>
                  <span className="text-[8.5px] text-slate-400 lowercase font-medium">Workshop Manager - Bangalore Hub</span>
                </div>
              </div>

              {/* Terms & Conditions footer */}
              <div className="border-t border-slate-100 pt-5 text-[9px] text-slate-400 leading-relaxed w-full text-left">
                <span className="font-bold text-slate-500 uppercase tracking-wider block text-[8px] mb-1">TERMS & CONDITIONS</span>
                <ul className="list-disc pl-3 flex flex-col gap-0.5 m-0 p-0 font-medium">
                  <li>All payments are due within 7 days of invoice date.</li>
                  <li>Interest at 18% p.a. will be charged for delayed payments beyond 15 days.</li>
                  <li>Spare parts warranty is applicable as per manufacturer guidelines only.</li>
                  <li>Any disputes are subject to Bangalore jurisdiction only.</li>
                  <li>Goods once sold will not be taken back or exchanged.</li>
                </ul>
              </div>

              {/* Centered links and generation message */}
              <div className="flex flex-col items-center justify-center gap-1 mt-1 text-[8.5px] text-slate-400 font-bold border-t border-slate-100/50 pt-3 w-full">
                <span>This is a computer-generated document and does not require a physical signature.</span>
                <span className="text-blue-500 font-bold mt-0.5">
                  www.eicherworkshop.org | support@eicher.com | 1800-425-XXXX
                </span>
              </div>

            </div>

          </div>
        </div>

        {/* Modal Actions */}
        <div className="bg-slate-50 border-t border-slate-100 p-4 px-8 flex items-center justify-end gap-3 no-print">
          <button
            onClick={() => setPrintingSale(null)}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-655 font-bold text-xs py-2.5 px-6 rounded-md cursor-pointer transition-colors shadow-xs"
          >
            Close Preview
          </button>

          <button
            onClick={handlePrintTrigger}
            className="bg-[#184edb] hover:bg-blue-800 text-white font-bold text-xs py-2.5 px-6 border-none rounded-md cursor-pointer transition-colors shadow-md flex items-center gap-1.5"
          >
            <Printer size={13} /> Print Invoice
          </button>
        </div>

      </div>
    </div>
  );
};

interface VehicleSalesProps {
  sales: SaleRecord[];
  setSales: React.Dispatch<React.SetStateAction<SaleRecord[]>>;
  onCustomerClick?: (name: string) => void;
}

export const VehicleSales: React.FC<VehicleSalesProps> = ({ sales, setSales, onCustomerClick }) => {
  const [dbVehicles, setDbVehicles] = useState<any[]>([]);

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
  }, []);

  // Available stock items
  const stocks = dbVehicles.length > 0
    ? dbVehicles.filter(v => v.status === 'Available' || v.status === 'Reserved').map(v => ({
        id: v.id,
        label: `${v.modelName} - ${v.colorName || 'White'}`,
        model: v.modelName,
        type: v.type,
        engine: v.engineNo,
        color: v.colorName,
        chassis: v.chassisNo,
        price: v.sellPrice || 1500000
      }))
    : [
        {
          id: 'STK-01',
          label: 'Eicher Pro 2049 - Alpine White',
          model: 'Pro 2049',
          type: 'Light Duty Truck',
          engine: 'E483-CD32-901',
          color: 'Alpine White',
          chassis: 'ME3BAH4A2F0004522',
          price: 1450000
        },
        {
          id: 'STK-02',
          label: 'Eicher Pro 6028 - Eicher Blue',
          model: 'Pro 6028',
          type: 'Heavy Duty Truck',
          engine: 'E694-CD88-102',
          color: 'Eicher Blue',
          chassis: 'ME3BAH6A2F0008812',
          price: 4550000
        },
        {
          id: 'STK-03',
          label: 'Eicher Pro 3019 - Forest Green',
          model: 'Pro 3019',
          type: 'Medium Duty Truck',
          engine: 'E494-CD60-909',
          color: 'Forest Green',
          chassis: 'ME3BAH3A2F0003019',
          price: 2820000
        }
      ];

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

  useEffect(() => {
    if (stocks.length > 0 && !regSelectedStock) {
      setRegSelectedStock(stocks[0].id);
    }
  }, [dbVehicles, stocks]);

  const [regInsuranceProvider, setRegInsuranceProvider] = useState('ICICI Lombard GIC');
  const [regPolicyNumber, setRegPolicyNumber] = useState('POL-9921-X382');
  const [regPremiumAmount, setRegPremiumAmount] = useState('35450');
  const [regSeatCovers, setRegSeatCovers] = useState(false);
  const [regGpsTracker, setRegGpsTracker] = useState(true);
  const [regWarranty, setRegWarranty] = useState(false);
  const [regDeliveryDate, setRegDeliveryDate] = useState('');
  const [regDeliveryLocation, setRegDeliveryLocation] = useState('Showroom Delivery');
  const [regInternalNotes, setRegInternalNotes] = useState('');
  const [regPaymentMode, setRegPaymentMode] = useState('Bank Finance');
  const [regFinanceProvider, setRegFinanceProvider] = useState('HDFC Bank');
  const [regAdvancePaid, setRegAdvancePaid] = useState('50000');
  const regDiscount = '15000';

  // Form states for Editing
  const [editCustomer, setEditCustomer] = useState('');
  const [editVehicle, setEditVehicle] = useState('');
  const [editStatus, setEditStatus] = useState<'DELIVERED' | 'PENDING' | 'CANCELLED'>('DELIVERED');
  const [editTotal, setEditTotal] = useState('');
  const [editDistrict, setEditDistrict] = useState('');
  const [editDeliveryDate, setEditDeliveryDate] = useState('');
  const [editExecutive, setEditExecutive] = useState('');

  // Handle click edit

  const handleEditClick = (sale: SaleRecord) => {
    setEditingSale(sale);
    setEditCustomer(sale.customerName);
    setEditVehicle(sale.vehicleModel);
    setEditStatus(sale.status);
    setEditTotal(sale.grandTotal);
    setEditDistrict(sale.district);
    setEditDeliveryDate(sale.deliveryDate);
    setEditExecutive(sale.salesExecutive);
  };

  // Save edit changes
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSale) return;

    fetch(`${API_URL}/api/sales/${editingSale.invoiceNo}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: editCustomer,
        vehicleModel: editVehicle,
        status: editStatus,
        grandTotal: editTotal,
        district: editDistrict,
        deliveryDate: editDeliveryDate,
        salesExecutive: editExecutive
      })
    })
      .then(res => res.json())
      .then(data => {
        setSales(sales.map(s => s.invoiceNo === editingSale.invoiceNo ? data : s));
        setEditingSale(null);
      })
      .catch(err => console.error('Error saving edited sale:', err));
  };

  // Trigger print window helper
  const handlePrintTrigger = () => {
    window.print();
  };

  // Calculate prices dynamically for active stock item
  const selectedStockItem = stocks.find(s => s.id === regSelectedStock) || stocks[0];
  const calculatedAccessoriesCost =
    (regSeatCovers ? 8500 : 0) +
    (regGpsTracker ? 12000 : 0) +
    (regWarranty ? 24999 : 0);
  const calculatedInsuranceCost = parseFloat(regPremiumAmount || '0');
  const calculatedTaxes = selectedStockItem.price * 0.18;
  const calculatedDiscount = parseFloat(regDiscount || '0');
  const grandTotalPayable =
    selectedStockItem.price +
    calculatedAccessoriesCost +
    calculatedInsuranceCost +
    calculatedTaxes -
    calculatedDiscount;
  const balancePayable = grandTotalPayable - parseFloat(regAdvancePaid || '0');
  const financialProgress = (parseFloat(regAdvancePaid || '0') / grandTotalPayable) * 100;

  // Handle New Sale Registration Form Submit
  const handleRegisterSale = (e: React.FormEvent, forceStatus: 'DELIVERED' | 'PENDING' = 'PENDING') => {
    e.preventDefault();
    if (!regFullName || !regMobile) {
      alert('Please fill out Customer Full Name and Mobile Number.');
      return;
    }

    const newInvoice = `#INV-2023-0${183 + sales.length}`;
    const newRecord: SaleRecord = {
      invoiceNo: newInvoice,
      customerName: regFullName,
      vehicleModel: `Eicher ${selectedStockItem.model}`,
      status: forceStatus,
      grandTotal: `₹${Math.round(grandTotalPayable).toLocaleString('en-IN')}`,
      district: 'Central Valley',
      deliveryDate: regDeliveryDate
        ? new Date(regDeliveryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        : 'Scheduled: ' + new Date(Date.now() + 86400000 * 5).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      salesExecutive: 'Vikram Singh'
    };

    fetch(`${API_URL}/api/sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRecord)
    })
      .then(res => res.json())
      .then(data => {
        setSales([data, ...sales]);
        setIsRegisteringSale(false);

        // Also update the vehicle's status in the database
        if (selectedStockItem.id) {
          fetch(`${API_URL}/api/vehicles/${encodeURIComponent(selectedStockItem.id)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: forceStatus === 'DELIVERED' ? 'Sold' : 'Reserved' })
          })
            .catch(err => console.error('Error updating vehicle status on sale:', err));
        }

        // Reset fields
        setRegFullName('');
        setRegMobile('');
        setRegAddress('');
        setRegGst('');
        setRegEmail('');
        setRegDeliveryDate('');
        setRegInternalNotes('');
        setRegAdvancePaid('50000');
      })
      .catch(err => console.error('Error registering sale:', err));
  };

  // 1. View state switcher: New Sale Registration
  if (isRegisteringSale) {
    return (
      <div className="p-8 bg-[#f6f8fc] min-h-[calc(100vh-70px)] flex flex-col gap-6 box-border font-sans text-slate-700 text-left">

        {/* Header Breadcrumbs and Navigation */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <span className="cursor-pointer hover:text-slate-650" onClick={() => setIsRegisteringSale(false)}>Vehicles</span>
              <span>&gt;</span>
              <span className="text-slate-600 font-bold">New Vehicle Sale</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 m-0 mt-1.5 tracking-tight font-heading">
              New Vehicle Sale Registration
            </h1>
            <p className="text-xs text-slate-400 m-0 mt-1">Register a primary vehicle sale, assign accessories, and generate the commercial invoice.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsRegisteringSale(false)}
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
                    placeholder="Enter customer's full name"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    required
                    className="border border-slate-200 rounded-md py-2 px-3 text-xs outline-none bg-slate-50 focus:border-blue-400 focus:bg-white transition-all font-medium text-slate-700 placeholder-slate-400"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Mobile Number</label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={regMobile}
                    onChange={(e) => setRegMobile(e.target.value.replace(/[^0-9]/g, ''))}
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
                  <label className="text-[10px] font-bold text-slate-400 uppercase">GST Number (Optional)</label>
                  <input
                    type="text"
                    placeholder="27AAAAA0000A1Z5"
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
                    value={selectedStockItem.chassis}
                    disabled
                    className="border border-blue-200 rounded-md py-2 px-3 bg-blue-50/50 text-[#184edb] outline-none font-mono font-bold"
                  />
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
    const isTruck = viewingSale.vehicleModel.includes('Pro');
    const basePriceNum = isTruck ? (viewingSale.vehicleModel.includes('6028') ? 4550000 : viewingSale.vehicleModel.includes('3019') ? 2820000 : 1450000) : 24750;
    const taxesNum = isTruck ? basePriceNum * 0.18 : 4392;
    const accessoriesNum = isTruck ? 12000 : 1200;
    const insuranceNum = isTruck ? 35450 : 450;
    const discountNum = isTruck ? 15000 : 2000;
    const grandTotalNum = isTruck ? (basePriceNum + accessoriesNum + insuranceNum + taxesNum - discountNum) : 28792;

    const items = isTruck
      ? [
        { sl: '01', desc: `${viewingSale.vehicleModel} - Standard Chassis Cabin`, subtitle: 'Primary commercial chassis configuration', qty: '1 Unit', unitPrice: `₹${basePriceNum.toLocaleString('en-IN')}`, amount: `₹${basePriceNum.toLocaleString('en-IN')}` },
        { sl: '02', desc: 'GPS Fleet Tracker & Telematics Upgrade', subtitle: 'Real-time vehicle position and health diagnostics', qty: '1', unitPrice: '₹12,000.00', amount: '₹12,000.00' }
      ]
      : [
        { sl: '01', desc: 'Standard Labor - Major Service', subtitle: 'Comprehensive engine and electrical system diagnostic', qty: '4.5 Hrs', unitPrice: '₹1,200.00', amount: '₹5,400.00' },
        { sl: '02', desc: 'Eicher Genuine Synthetic Oil - 15L', subtitle: 'Part No: E-OIL-SYN-15L', qty: '1', unitPrice: '₹8,500.00', amount: '₹8,500.00' },
        { sl: '03', desc: 'Air Filter Assembly', subtitle: 'Part No: E-AF-992-B', qty: '1', unitPrice: '₹2,450.00', amount: '₹2,450.00' },
        { sl: '04', desc: 'Brake Pad Kit (Front)', subtitle: 'Part No: E-BRK-442-PAD', qty: '2 Sets', unitPrice: '₹4,200.00', amount: '₹8,400.00' }
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
            <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs py-2.5 px-4 rounded-md cursor-pointer transition-colors shadow-xs flex items-center gap-1.5">
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
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <Wrench size={16} />
                </div>
                <h2 className="text-base font-extrabold text-slate-900 m-0 font-heading">Eicher Authorized Workshop</h2>
              </div>
              <span className="text-xs text-slate-450 font-bold">Grand Motor Works Pvt. Ltd.</span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 text-[11px] font-semibold text-slate-455 mt-2">
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-slate-500">Workshop Address:</span>
                  <span>Plot No. 45, Industrial Area</span>
                  <span>Phase II, Gurugram, Haryana - 122001</span>
                  <span>GSTIN: 07AAACG1234F1Z5</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-slate-500">Contact Details:</span>
                  <span>Phone: +91 124 456 7890</span>
                  <span>Email: service@grandmotors.in</span>
                  <span>Web: www.eicher-service.com</span>
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

            {/* Column 1: Payment Settlement */}
            <div className="lg:col-span-3 flex flex-col gap-4 w-full">

              {/* Quick scan box */}
              <div className="border border-blue-100 rounded-xl p-4 bg-blue-50/10 flex items-center gap-4">
                <div className="w-14 h-14 bg-white border border-slate-200 rounded p-1 flex items-center justify-center flex-shrink-0 shadow-xs">
                  {/* Mock small QR */}
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-slate-800">
                    <rect x="2" y="2" width="6" height="6" strokeWidth="2" />
                    <rect x="16" y="2" width="6" height="6" strokeWidth="2" />
                    <rect x="2" y="16" width="6" height="6" strokeWidth="2" />
                    <path d="M10 2h4M10 6h4M10 10h4M2 12h8M14 12h8M12 14v8" strokeWidth="2" />
                  </svg>
                </div>
                <div className="flex flex-col gap-1 text-xs text-left">
                  <span className="font-extrabold text-blue-600 font-heading">Quick Settlement</span>
                  <span className="text-[10px] text-slate-455 font-medium">Scan to pay via any UPI app</span>
                  <span className="font-mono text-slate-700 font-bold">VPA: grandmotors@upi</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="bg-slate-100 text-slate-450 border border-slate-200 px-1 py-0.2 rounded text-[7.5px] font-extrabold uppercase">BHIM</span>
                    <span className="bg-slate-100 text-slate-450 border border-slate-200 px-1 py-0.2 rounded text-[7.5px] font-extrabold uppercase">GPay</span>
                    <span className="bg-slate-100 text-slate-450 border border-slate-200 px-1 py-0.2 rounded text-[7.5px] font-extrabold uppercase">PhonePe</span>
                  </div>
                </div>
              </div>

              {/* Payment Details text box */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/20 text-xs">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-100 pb-1.5 mb-2.5">Payment Details</span>
                <div className="grid grid-cols-2 gap-y-2 font-semibold text-slate-500">
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
                <span className="text-slate-800 font-bold">₹{isTruck ? (basePriceNum + accessoriesNum).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '24,750.00'}</span>
              </div>

              <div className="flex justify-between px-2 font-medium">
                <span>Accessories Charge:</span>
                <span className="text-slate-800 font-bold">₹{isTruck ? '0.00' : '1,200.00'}</span>
              </div>

              <div className="flex justify-between px-2 font-medium">
                <span>Service Insurance:</span>
                <span className="text-slate-800 font-bold">₹{isTruck ? insuranceNum.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '450.00'}</span>
              </div>

              <div className="flex justify-between px-2 font-medium">
                <span className="text-red-500 font-bold">Discount (Loyalty Bonus):</span>
                <span className="text-red-655 font-extrabold">-₹{isTruck ? discountNum.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '2,000.00'}</span>
              </div>

              <div className="flex justify-between px-2 font-medium border-t border-slate-100 pt-2.5">
                <span>Taxable Value:</span>
                <span className="text-slate-850 font-bold">₹{isTruck ? (basePriceNum + accessoriesNum + insuranceNum - discountNum).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '24,400.00'}</span>
              </div>

              <div className="flex justify-between px-2 font-medium">
                <span>GST (18%):</span>
                <span className="text-slate-855 font-bold">₹{taxesNum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>

              {/* Grand Total dark box block */}
              <div className="bg-[#0c1a40] rounded-lg p-4 px-5 text-white flex justify-between items-center mt-2.5 shadow-md">
                <span className="text-xs font-bold text-white/80">Grand Total</span>
                <span className="text-base font-extrabold text-white">₹{grandTotalNum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>

              <span className="text-[9.5px] text-slate-400 mt-1 font-medium italic block text-right font-semibold">
                Amount in words: {isTruck ? 'Seventeen Lakh Forty-Three Thousand Four Hundred Fifty Only' : 'Twenty-Eight Thousand Seven Hundred Ninety-Two Only'}
              </span>

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

  return (
    <div className="p-8 bg-[#f6f8fc] min-h-[calc(100vh-70px)] flex flex-col gap-6 box-border font-sans text-slate-700 text-left">

      {/* Print Overlay CSS Style Inject */}
      <style>{`
        @media print {
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
            width: 100%;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
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
          <button className="bg-white border border-slate-200 rounded-md py-2 px-4 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors text-slate-600 hover:bg-slate-50">
            <SlidersHorizontal size={13} /> Filter
          </button>
          <button className="bg-white border border-slate-200 rounded-md py-2 px-4 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors text-slate-600 hover:bg-slate-50">
            <FileSpreadsheet size={13} /> Export Excel
          </button>
          <button className="bg-white border border-slate-200 rounded-md py-2 px-4 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors text-slate-600 hover:bg-slate-50">
            <FileText size={13} /> Export PDF
          </button>
          <button
            onClick={() => setIsRegisteringSale(true)}
            className="bg-[#184edb] text-white border-none py-2 px-4 rounded-md text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors hover:bg-blue-900"
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
            <h2 className="text-xl font-extrabold text-slate-800 m-0">₹4.2 Cr</h2>
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
            <h2 className="text-xl font-extrabold text-slate-800 m-0">
              {14 + sales.filter(s => s.status === 'PENDING').length}
            </h2>
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
            <h2 className="text-xl font-extrabold text-slate-800 m-0">
              {112 + sales.filter(s => s.status === 'DELIVERED').length}
            </h2>
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
            <h2 className="text-xl font-extrabold m-0 text-white">₹12.85 Cr</h2>
            <span className="bg-white/15 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">YTD</span>
          </div>
        </div>

      </div>

      {/* Sales Ledger Table Section */}
      <div className="bg-white rounded-xl border border-[#eef2f6] shadow-sm overflow-hidden flex flex-col w-full">

        <div className="p-4 px-6 border-b border-slate-100 bg-slate-50/10 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-extrabold text-slate-800 m-0 font-heading">Sales Ledger</h3>
            <span className="bg-blue-50 text-[#184edb] text-[10px] font-bold py-0.5 px-2.5 rounded-full border border-blue-100">
              Total {112 + sales.length} Sales
            </span>
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
                <th className="py-3.5 px-6 border-b border-slate-100">DISTRICT</th>
                <th className="py-3.5 px-6 border-b border-slate-100">DELIVERY DATE</th>
                <th className="py-3.5 px-6 border-b border-slate-100">SALES EXECUTIVE</th>
                <th className="py-3.5 px-6 border-b border-slate-100 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
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
                  <td className="py-4 px-6 border-b border-slate-100 text-slate-550">{sale.district}</td>
                  <td className="py-4 px-6 border-b border-slate-100 text-slate-550">{sale.deliveryDate}</td>
                  <td className="py-4 px-6 border-b border-slate-100 text-slate-800 font-semibold">{sale.salesExecutive}</td>
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

      {/* Bottom Charts & Leaderboard Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Sales Velocity */}
        <div className="bg-white rounded-xl border border-[#eef2f6] shadow-sm p-6 lg:col-span-2 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[13.5px] font-extrabold text-slate-800 m-0 font-heading">Sales Velocity</h3>
              <span className="text-[10px] text-slate-400">Monthly units sold summary</span>
            </div>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">Q3 2023</span>
          </div>

          {/* Graphical Bar Chart */}
          <div className="flex items-end justify-between h-40 pt-4 px-2 border-b border-slate-100">
            {[
              { month: 'Feb 23', height: 'h-1/4', value: '4' },
              { month: 'Mar 23', height: 'h-2/5', value: '8' },
              { month: 'Apr 23', height: 'h-1/2', value: '10' },
              { month: 'May 23', height: 'h-4/5', value: '16' },
              { month: 'Jun 23', height: 'h-3/5', value: '12' },
              { month: 'Jul 23', height: 'h-full', value: '20' }
            ].map((bar, i) => (
              <div key={i} className="flex flex-col items-center gap-2 w-12 flex-1 group cursor-pointer">
                <span className="text-[9px] font-extrabold text-[#184edb] opacity-0 group-hover:opacity-100 transition-opacity">{bar.value}</span>
                <div className={`w-8 bg-blue-100 rounded-t-md group-hover:bg-[#184edb] transition-all flex items-end justify-center ${bar.height}`}>
                  <div className="w-8 bg-[#184edb]/10 group-hover:bg-transparent h-full rounded-t-md" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 mt-1">{bar.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Executive Leaderboard */}
        <div className="bg-gradient-to-br from-[#0d287a] to-[#06143c] rounded-xl p-6 text-white flex flex-col justify-between shadow-md">
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-[13.5px] font-extrabold m-0 text-white tracking-wide font-heading">Sales Executive Leaderboard</h3>
              <span className="text-[10px] text-white/50">Top performers this quarter</span>
            </div>

            <div className="flex flex-col gap-3.5 mt-2">
              {[
                { rank: '1', name: 'Anjali Gupta', units: '48 Sold', bg: 'bg-white/10' },
                { rank: '2', name: 'Vikram Singh', units: '36 Sold', bg: 'bg-white/5' },
                { rank: '3', name: 'Rajesh Kumar', units: '28 Sold', bg: 'bg-white/5' }
              ].map((exec, i) => (
                <div key={i} className={`flex items-center justify-between p-3 rounded-lg ${exec.bg} border border-white/5`}>
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-blue-600/50 flex items-center justify-center text-[10px] font-extrabold border border-blue-400/40">
                      {exec.rank}
                    </span>
                    <span className="text-xs font-bold">{exec.name}</span>
                  </div>
                  <span className="text-xs font-extrabold text-[#95b4ff]">{exec.units}</span>
                </div>
              ))}
            </div>
          </div>

          <button className="bg-white/10 hover:bg-white/15 text-white border border-white/15 py-2 px-4 rounded-md text-[11px] font-bold cursor-pointer transition-colors w-full text-center mt-6">
            View All Leaderboard
          </button>
        </div>

      </div>

      {/* EDIT MODAL DIALOG */}
      {editingSale && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg border border-slate-100 w-full max-w-lg overflow-hidden flex flex-col">

            {/* Header */}
            <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-sm font-extrabold text-slate-800 m-0 font-heading">Edit Sale: {editingSale.invoiceNo}</h3>
              <button
                onClick={() => setEditingSale(null)}
                className="bg-transparent border-none text-slate-400 hover:text-slate-650 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEdit} className="p-6 flex flex-col gap-4 text-xs font-semibold text-slate-500">

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Customer Name</label>
                <input
                  type="text"
                  value={editCustomer}
                  onChange={(e) => setEditCustomer(e.target.value)}
                  required
                  className="border border-slate-200 rounded-md py-2 px-3 outline-none focus:border-blue-400 bg-slate-50 focus:bg-white transition-all font-medium text-slate-700"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vehicle Model</label>
                <input
                  type="text"
                  value={editVehicle}
                  onChange={(e) => setEditVehicle(e.target.value)}
                  required
                  className="border border-slate-200 rounded-md py-2 px-3 outline-none focus:border-blue-400 bg-slate-50 focus:bg-white transition-all font-medium text-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Grand Total</label>
                  <input
                    type="text"
                    value={editTotal}
                    onChange={(e) => setEditTotal(e.target.value)}
                    required
                    className="border border-slate-200 rounded-md py-2 px-3 outline-none focus:border-blue-400 bg-slate-50 focus:bg-white transition-all font-medium text-slate-700"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sale Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="border border-slate-200 rounded-md py-2 px-3 outline-none focus:border-blue-400 bg-slate-50 focus:bg-white transition-all font-bold text-slate-705"
                  >
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="PENDING">PENDING</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">District</label>
                  <input
                    type="text"
                    value={editDistrict}
                    onChange={(e) => setEditDistrict(e.target.value)}
                    className="border border-slate-200 rounded-md py-2 px-3 outline-none focus:border-blue-400 bg-slate-50 focus:bg-white transition-all font-medium text-slate-700"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Delivery Date</label>
                  <input
                    type="text"
                    value={editDeliveryDate}
                    onChange={(e) => setEditDeliveryDate(e.target.value)}
                    className="border border-slate-200 rounded-md py-2 px-3 outline-none focus:border-blue-400 bg-slate-50 focus:bg-white transition-all font-medium text-slate-700"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sales Executive</label>
                <input
                  type="text"
                  value={editExecutive}
                  onChange={(e) => setEditExecutive(e.target.value)}
                  className="border border-slate-200 rounded-md py-2 px-3 outline-none focus:border-blue-400 bg-slate-50 focus:bg-white transition-all font-medium text-slate-700"
                />
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setEditingSale(null)}
                  className="bg-transparent border-none text-slate-400 hover:text-slate-700 font-bold text-xs py-2 px-4 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#184edb] hover:bg-blue-800 text-white font-bold text-xs py-2.5 px-6 border-none rounded-md cursor-pointer transition-colors shadow-md"
                >
                  Save Changes
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Render Print Modal overlay inside main view scope */}
      {printingSale && (
        <PrintInvoiceModal
          printingSale={printingSale}
          setPrintingSale={setPrintingSale}
          handlePrintTrigger={handlePrintTrigger}
        />
      )}

    </div>
  );
};

export default VehicleSales;
