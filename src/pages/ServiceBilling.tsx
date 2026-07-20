import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit,
  Printer,
  Eye,
  Save,
  X,
  User,
  Wrench,
  ShoppingBag,
  FileText
} from 'lucide-react';

// Interfaces
interface LabourCharge {
  id: string;
  type: string;
  description: string;
  amount: number;
}

interface SparePart {
  id: string;
  partNo: string;
  name: string;
  qty: number;
  price: number;
  gstPercent: number; // e.g., 18 for 18%
  total: number;
  stockStatus?: 'Available' | 'Low Stock' | 'Out of Stock';
  imageUrl?: string;
}

export const ServiceBilling: React.FC = () => {
  // Header info
  const [billNo] = useState('SB-2023-0045');

  // Customer & Vehicle State
  const [customerName, setCustomerName] = useState('Rahul Sharma');
  const [phoneNumber, setPhoneNumber] = useState('+91 98765 43210');
  const [jobCardNo] = useState('JC-2023-8842');
  const [vehicleNo, setVehicleNo] = useState('DL 3C AW 1234');
  const [model, setModel] = useState('Volvo XC90 B5');
  const [serviceDate, setServiceDate] = useState('11/24/2023');
  const [engineNo, setEngineNo] = useState('FN773429188');
  const [chassisNo, setChassisNo] = useState('CH9921003442');
  const [assignedMechanic, setAssignedMechanic] = useState('Vikram Singh');

  // Mechanic Details State
  const [serviceAdvisor, setServiceAdvisor] = useState('John Admin');
  const [deliveryDate, setDeliveryDate] = useState('11/25/2023');
  const [deliveryTime, setDeliveryTime] = useState('05:00 PM');

  // Labour Charges State
  const [labourCharges, setLabourCharges] = useState<LabourCharge[]>([
    {
      id: 'l-1',
      type: 'Engine Tuning',
      description: 'Complete engine diagnostics and optimization',
      amount: 3000.00
    },
    {
      id: 'l-2',
      type: 'Brake Service',
      description: 'Front brake pad cleaning and lubrication',
      amount: 850.00
    }
  ]);

  // Spare Parts State
  const [spareParts, setSpareParts] = useState<SparePart[]>([
    {
      id: 'p-1',
      partNo: 'P-VLO-9002',
      name: 'Synthetic Engine Oil',
      qty: 1,
      price: 4800.00,
      gstPercent: 18,
      total: 5664.00,
      stockStatus: 'Low Stock'
    },
    {
      id: 'p-2',
      partNo: 'P-FLT-8821',
      name: 'High Performance Oil Filter',
      qty: 1,
      price: 1250.00,
      gstPercent: 12,
      total: 1400.00,
      stockStatus: 'Available'
    }
  ]);

  // Remarks State
  const [remarks, setRemarks] = useState('');

  // Discount & Payment State
  const [discountPercent, setDiscountPercent] = useState<string>('5');
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'Card' | 'UPI' | 'Net Banking'>('Cash');

  // Modals state
  const [showAddLabourModal, setShowAddLabourModal] = useState(false);
  const [editingLabour, setEditingLabour] = useState<LabourCharge | null>(null);

  const [showAddPartModal, setShowAddPartModal] = useState(false);
  const [editingPart, setEditingPart] = useState<SparePart | null>(null);

  const [showInvoicePreview, setShowInvoicePreview] = useState(false);

  // New item form states
  // Labour form
  const [labourTypeInput, setLabourTypeInput] = useState('');
  const [labourDescInput, setLabourDescInput] = useState('');
  const [labourAmountInput, setLabourAmountInput] = useState(500);

  // Parts form
  const [partNoInput, setPartNoInput] = useState('');
  const [partNameInput, setPartNameInput] = useState('');
  const [partQtyInput, setPartQtyInput] = useState(1);
  const [partPriceInput, setPartPriceInput] = useState(100);
  const [partGstInput, setPartGstInput] = useState(18);
  const [partStockInput, setPartStockInput] = useState<'Available' | 'Low Stock' | 'Out of Stock'>('Available');

  // --- DINAMIC CALCULATION OF TOTALS ---
  const labourTotal = labourCharges.reduce((acc, curr) => acc + curr.amount, 0);

  // Calculate parts total dynamically based on quantity, price, and GST
  const calculatePartTotal = (qty: number, price: number, gst: number) => {
    const base = qty * price;
    const tax = base * (gst / 100);
    return base + tax;
  };

  const sparePartsTotal = spareParts.reduce((acc, curr) => {
    return acc + calculatePartTotal(curr.qty, curr.price, curr.gstPercent);
  }, 0);

  const subtotal = labourTotal + sparePartsTotal;
  const discountVal = parseFloat(discountPercent) || 0;
  const discountAmount = subtotal * (discountVal / 100);

  // Combined GST is the sum of GST of parts
  const combinedGst = spareParts.reduce((acc, curr) => {
    return acc + (curr.qty * curr.price * (curr.gstPercent / 100));
  }, 0);

  // Grand total formula matching the screenshot:
  // Grand Total = Subtotal - Discount Amount + Combined GST
  const grandTotal = subtotal - discountAmount + combinedGst;

  // --- QUANTITY HANDLERS FOR SPARE PARTS ---
  const handleUpdateQty = (id: string, delta: number) => {
    setSpareParts(
      spareParts.map((p) => {
        if (p.id === id) {
          const newQty = Math.max(1, p.qty + delta);
          return {
            ...p,
            qty: newQty,
            total: calculatePartTotal(newQty, p.price, p.gstPercent)
          };
        }
        return p;
      })
    );
  };

  // --- LABOUR ACTION HANDLERS ---
  const handleSaveLabour = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLabour) {
      // Edit
      setLabourCharges(
        labourCharges.map((l) => {
          if (l.id === editingLabour.id) {
            return {
              ...l,
              type: labourTypeInput,
              description: labourDescInput,
              amount: Number(labourAmountInput)
            };
          }
          return l;
        })
      );
      setEditingLabour(null);
    } else {
      // Add
      const newLabour: LabourCharge = {
        id: `l-${Math.random().toString(36).substr(2, 9)}`,
        type: labourTypeInput,
        description: labourDescInput,
        amount: Number(labourAmountInput)
      };
      setLabourCharges([...labourCharges, newLabour]);
    }
    setShowAddLabourModal(false);
    // Reset
    setLabourTypeInput('');
    setLabourDescInput('');
    setLabourAmountInput(500);
  };

  const handleEditLabourClick = (labour: LabourCharge) => {
    setEditingLabour(labour);
    setLabourTypeInput(labour.type);
    setLabourDescInput(labour.description);
    setLabourAmountInput(labour.amount);
    setShowAddLabourModal(true);
  };

  const handleDeleteLabour = (id: string) => {
    if (window.confirm('Are you sure you want to delete this labour charge?')) {
      setLabourCharges(labourCharges.filter((l) => l.id !== id));
    }
  };

  // --- SPARE PART ACTION HANDLERS ---
  const handleSavePart = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPart) {
      // Edit
      setSpareParts(
        spareParts.map((p) => {
          if (p.id === editingPart.id) {
            return {
              ...p,
              partNo: partNoInput,
              name: partNameInput,
              qty: Number(partQtyInput),
              price: Number(partPriceInput),
              gstPercent: Number(partGstInput),
              total: calculatePartTotal(Number(partQtyInput), Number(partPriceInput), Number(partGstInput)),
              stockStatus: partStockInput
            };
          }
          return p;
        })
      );
      setEditingPart(null);
    } else {
      // Add
      const newPart: SparePart = {
        id: `p-${Math.random().toString(36).substr(2, 9)}`,
        partNo: partNoInput || `P-${Math.floor(1000 + Math.random() * 9000)}`,
        name: partNameInput,
        qty: Number(partQtyInput),
        price: Number(partPriceInput),
        gstPercent: Number(partGstInput),
        total: calculatePartTotal(Number(partQtyInput), Number(partPriceInput), Number(partGstInput)),
        stockStatus: partStockInput
      };
      setSpareParts([...spareParts, newPart]);
    }
    setShowAddPartModal(false);
    // Reset
    setPartNoInput('');
    setPartNameInput('');
    setPartQtyInput(1);
    setPartPriceInput(100);
    setPartGstInput(18);
    setPartStockInput('Available');
  };

  const handleEditPartClick = (part: SparePart) => {
    setEditingPart(part);
    setPartNoInput(part.partNo);
    setPartNameInput(part.name);
    setPartQtyInput(part.qty);
    setPartPriceInput(part.price);
    setPartGstInput(part.gstPercent);
    setPartStockInput(part.stockStatus || 'Available');
    setShowAddPartModal(true);
  };

  const handleDeletePart = (id: string) => {
    if (window.confirm('Are you sure you want to delete this spare part?')) {
      setSpareParts(spareParts.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-8 p-8 bg-[#f8fafc] w-full box-border font-sans min-h-[calc(100vh-64px)]">

      {/* LEFT COLUMN: Page Title, Stepper, and main sections */}
      <div className="flex-1 flex flex-col min-w-0 box-border">

        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-[13px] text-slate-400 font-semibold mb-2">
          <span>Dashboard</span>
          <span>/</span>
          <span>Service</span>
          <span>/</span>
          <span className="text-[#184edb]">New Service Bill</span>
        </div>

        {/* Title, Bill No, Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight m-0 font-heading">
              Create New Service Bill
            </h1>
            <span className="text-[14px] text-[#184edb] font-bold">
              Bill No: {billNo}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => { if (window.confirm('Discard bill changes?')) window.location.reload(); }}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-650 font-bold text-[13px] rounded-lg border border-slate-200 shadow-sm cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => setShowInvoicePreview(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-650 font-bold text-[13px] rounded-lg border border-slate-200 shadow-sm cursor-pointer transition-colors"
            >
              <Eye size={15} />
              <span>Preview</span>
            </button>
            <button
              onClick={() => alert(`Service Bill ${billNo} saved successfully!`)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#184edb] hover:bg-[#133eb5] text-white font-bold text-[13px] border-none rounded-lg shadow-md cursor-pointer transition-colors"
            >
              <Save size={15} />
              <span>Save Bill</span>
            </button>
          </div>
        </div>

        {/* --- MAIN STEP CONTENT CARDS --- */}
        <div className="flex flex-col gap-8 w-full box-border">

          {/* Card 1: Customer & Vehicle Information */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col gap-6">
            <h3 className="text-base font-extrabold text-slate-800 m-0 flex items-center gap-2 font-heading">
              <User size={18} className="text-[#184edb]" />
              <span>Customer & Vehicle Information</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Customer Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11.5px] font-bold text-slate-400 uppercase tracking-wide">Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="p-2.5 border border-slate-200 rounded-lg text-[13.5px] font-semibold text-slate-700 focus:outline-none focus:border-[#184edb]"
                />
              </div>

              {/* Phone Number */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11.5px] font-bold text-slate-400 uppercase tracking-wide">Phone Number</label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="p-2.5 border border-slate-200 rounded-lg text-[13.5px] font-semibold text-slate-700 focus:outline-none focus:border-[#184edb]"
                />
              </div>

              {/* Job Card No */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11.5px] font-bold text-slate-400 uppercase tracking-wide">Job Card No</label>
                <input
                  type="text"
                  value={jobCardNo}
                  className="p-2.5 border border-slate-100 rounded-lg text-[13.5px] font-bold text-slate-800 bg-[#f1f5f9]/70 cursor-not-allowed"
                  readOnly
                />
              </div>

              {/* Vehicle No */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11.5px] font-bold text-slate-400 uppercase tracking-wide">Vehicle No</label>
                <input
                  type="text"
                  value={vehicleNo}
                  onChange={(e) => setVehicleNo(e.target.value)}
                  className="p-2.5 border border-slate-200 rounded-lg text-[13.5px] font-semibold text-slate-700 focus:outline-none focus:border-[#184edb]"
                />
              </div>

              {/* Model */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11.5px] font-bold text-slate-400 uppercase tracking-wide">Model</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="p-2.5 border border-slate-200 rounded-lg text-[13.5px] font-semibold text-slate-700 focus:outline-none focus:border-[#184edb]"
                />
              </div>

              {/* Service Date */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11.5px] font-bold text-slate-400 uppercase tracking-wide">Service Date</label>
                <input
                  type="text"
                  value={serviceDate}
                  onChange={(e) => setServiceDate(e.target.value)}
                  className="p-2.5 border border-slate-200 rounded-lg text-[13.5px] font-semibold text-slate-700 focus:outline-none focus:border-[#184edb]"
                />
              </div>

              {/* Engine No */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11.5px] font-bold text-slate-400 uppercase tracking-wide">Engine No</label>
                <input
                  type="text"
                  value={engineNo}
                  onChange={(e) => setEngineNo(e.target.value)}
                  className="p-2.5 border border-slate-200 rounded-lg text-[13.5px] font-semibold text-slate-700 focus:outline-none focus:border-[#184edb]"
                />
              </div>

              {/* Chassis No */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11.5px] font-bold text-slate-400 uppercase tracking-wide">Chassis No</label>
                <input
                  type="text"
                  value={chassisNo}
                  onChange={(e) => setChassisNo(e.target.value)}
                  className="p-2.5 border border-slate-200 rounded-lg text-[13.5px] font-semibold text-slate-700 focus:outline-none focus:border-[#184edb]"
                />
              </div>

              {/* Assigned Mechanic */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11.5px] font-bold text-slate-400 uppercase tracking-wide">Assigned Mechanic</label>
                <select
                  value={assignedMechanic}
                  onChange={(e) => setAssignedMechanic(e.target.value)}
                  className="p-2.5 border border-slate-200 rounded-lg text-[13.5px] font-semibold text-slate-700 bg-white focus:outline-none focus:border-[#184edb]"
                >
                  <option value="Vikram Singh">Vikram Singh</option>
                  <option value="Amit Sharma">Amit Sharma</option>
                  <option value="Suresh Gupta">Suresh Gupta</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card 2: Mechanic Details */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col gap-6">
            <h3 className="text-base font-extrabold text-slate-800 m-0 flex items-center gap-2 font-heading">
              <Wrench size={18} className="text-[#184edb]" />
              <span>Mechanic Details</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Assigned Mechanic */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11.5px] font-bold text-slate-400 uppercase tracking-wide">Assigned Mechanic</label>
                <select
                  value={assignedMechanic}
                  onChange={(e) => setAssignedMechanic(e.target.value)}
                  className="p-2.5 border border-slate-200 rounded-lg text-[13.5px] font-semibold text-slate-700 bg-white focus:outline-none focus:border-[#184edb]"
                >
                  <option value="Vikram Singh">Vikram Singh</option>
                  <option value="Amit Sharma">Amit Sharma</option>
                  <option value="Suresh Gupta">Suresh Gupta</option>
                </select>
              </div>

              {/* Service Advisor */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11.5px] font-bold text-slate-400 uppercase tracking-wide">Service Advisor</label>
                <input
                  type="text"
                  value={serviceAdvisor}
                  onChange={(e) => setServiceAdvisor(e.target.value)}
                  className="p-2.5 border border-slate-200 rounded-lg text-[13.5px] font-semibold text-slate-700 focus:outline-none focus:border-[#184edb]"
                />
              </div>

              {/* Delivery Date */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11.5px] font-bold text-slate-400 uppercase tracking-wide">Delivery Date</label>
                <input
                  type="text"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="p-2.5 border border-slate-200 rounded-lg text-[13.5px] font-semibold text-slate-700 focus:outline-none focus:border-[#184edb]"
                />
              </div>

              {/* Delivery Time */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11.5px] font-bold text-slate-400 uppercase tracking-wide">Delivery Time</label>
                <input
                  type="text"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  className="p-2.5 border border-slate-200 rounded-lg text-[13.5px] font-semibold text-slate-700 focus:outline-none focus:border-[#184edb]"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Labour Charges */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-800 m-0 flex items-center gap-2 font-heading">
                <Wrench size={18} className="text-[#184edb]" />
                <span>Labour Charges</span>
              </h3>
              <button
                onClick={() => {
                  setEditingLabour(null);
                  setLabourTypeInput('');
                  setLabourDescInput('');
                  setLabourAmountInput(500);
                  setShowAddLabourModal(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-[#184edb]/10 text-[#184edb] font-bold text-[12.5px] border-none rounded-lg cursor-pointer transition-colors"
              >
                <Plus size={15} />
                <span>Add Labour</span>
              </button>
            </div>

            {/* Table Container */}
            <div className="border border-slate-100 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[11px] uppercase tracking-wider font-bold">
                    <th className="py-3.5 px-5 font-bold">Labour Type</th>
                    <th className="py-3.5 px-5 font-bold">Description</th>
                    <th className="py-3.5 px-5 text-right font-bold">Amount (₹)</th>
                    <th className="py-3.5 px-5 text-right font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[13.5px]">
                  {labourCharges.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400 font-semibold bg-white">
                        No labor charges logged. Click "Add Labour" to create.
                      </td>
                    </tr>
                  ) : (
                    labourCharges.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="py-4.5 px-5 font-bold text-slate-800 whitespace-nowrap">{l.type}</td>
                        <td className="py-4.5 px-5 text-slate-500 font-medium">{l.description}</td>
                        <td className="py-4.5 px-5 text-right font-bold text-slate-800">₹{l.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="py-4.5 px-5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => handleEditLabourClick(l)}
                              className="text-slate-455 hover:text-[#184edb] p-1 border-none bg-transparent cursor-pointer transition-colors"
                              title="Edit Labour Charge"
                            >
                              <Edit size={15} />
                            </button>
                            <button
                              onClick={() => handleDeleteLabour(l.id)}
                              className="text-slate-400 hover:text-rose-600 p-1 border-none bg-transparent cursor-pointer transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pr-5 py-2 font-bold text-[13.5px] text-[#184edb]">
              Labour Total: ₹{labourTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>

          {/* Card 4: Spare Parts Used */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-800 m-0 flex items-center gap-2 font-heading">
                <ShoppingBag size={18} className="text-[#184edb]" />
                <span>Spare Parts Used</span>
              </h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setEditingPart(null);
                    setPartNoInput('');
                    setPartNameInput('');
                    setPartQtyInput(1);
                    setPartPriceInput(100);
                    setPartGstInput(18);
                    setPartStockInput('Available');
                    setShowAddPartModal(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-[#184edb]/10 text-[#184edb] font-bold text-[12.5px] border-none rounded-lg cursor-pointer transition-colors"
                >
                  <Plus size={15} />
                  <span>Add Part</span>
                </button>
                <button
                  onClick={() => alert('Inventory stock allocations secured!')}
                  className="px-3.5 py-1.5 bg-[#184edb] hover:bg-[#133eb5] text-white font-bold text-[12.5px] border-none rounded-lg shadow-sm cursor-pointer transition-colors"
                >
                  Secure Inventory
                </button>
              </div>
            </div>

            {/* Table Container */}
            <div className="border border-slate-100 rounded-xl overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[11px] uppercase tracking-wider font-bold">
                    <th className="py-3.5 px-5 font-bold">Part No</th>
                    <th className="py-3.5 px-5 font-bold">Part Name</th>
                    <th className="py-3.5 px-5 text-center font-bold">Qty</th>
                    <th className="py-3.5 px-5 text-right font-bold">Price (₹)</th>
                    <th className="py-3.5 px-5 text-center font-bold">GST (%)</th>
                    <th className="py-3.5 px-5 text-right font-bold">Total (₹)</th>
                    <th className="py-3.5 px-5 text-right font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[13.5px]">
                  {spareParts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 font-semibold bg-white">
                        No spare parts added. Click "Add Part" to insert items.
                      </td>
                    </tr>
                  ) : (
                    spareParts.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/30 transition-colors">
                        {/* Part No */}
                        <td className="py-4.5 px-5 font-semibold text-slate-500 whitespace-nowrap">{p.partNo}</td>

                        {/* Part Name with stock badge */}
                        <td className="py-4.5 px-5 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <span className="font-bold text-slate-800">{p.name}</span>
                            {p.stockStatus === 'Low Stock' && (
                              <span className="self-start text-[10px] font-extrabold bg-rose-50 text-rose-600 border border-rose-100 rounded px-1.5 py-0.5 mt-0.5">
                                Low Stock
                              </span>
                            )}
                            {p.stockStatus === 'Out of Stock' && (
                              <span className="self-start text-[10px] font-extrabold bg-slate-100 text-slate-650 border border-slate-200 rounded px-1.5 py-0.5 mt-0.5">
                                Out of Stock
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Qty with Counter Controls */}
                        <td className="py-4.5 px-5 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleUpdateQty(p.id, -1)}
                              className="w-6 h-6 border border-slate-200 rounded flex items-center justify-center bg-white hover:bg-slate-50 font-bold cursor-pointer text-slate-600 text-[14px]"
                            >
                              -
                            </button>
                            <span className="w-6 text-center font-bold text-slate-800">{p.qty}</span>
                            <button
                              onClick={() => handleUpdateQty(p.id, 1)}
                              className="w-6 h-6 border border-slate-200 rounded flex items-center justify-center bg-white hover:bg-slate-50 font-bold cursor-pointer text-slate-600 text-[14px]"
                            >
                              +
                            </button>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="py-4.5 px-5 text-right font-medium text-slate-650">₹{p.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>

                        {/* GST */}
                        <td className="py-4.5 px-5 text-center font-semibold text-slate-600">{p.gstPercent}%</td>

                        {/* Total */}
                        <td className="py-4.5 px-5 text-right font-bold text-slate-900">
                          ₹{calculatePartTotal(p.qty, p.price, p.gstPercent).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>

                        {/* Actions (Edit and Delete options requested) */}
                        <td className="py-4.5 px-5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => handleEditPartClick(p)}
                              className="text-slate-400 hover:text-[#184edb] p-1 border-none bg-transparent cursor-pointer transition-colors"
                              title="Edit Part"
                            >
                              <Edit size={15} />
                            </button>
                            <button
                              onClick={() => handleDeletePart(p.id)}
                              className="text-slate-400 hover:text-rose-600 p-1 border-none bg-transparent cursor-pointer transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pr-5 py-2 font-bold text-[13.5px] text-[#184edb]">
              Spare Parts Total: ₹{sparePartsTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>

          {/* Card 5: Service Remarks / Notes */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col gap-4">
            <h3 className="text-base font-extrabold text-slate-800 m-0 flex items-center gap-2 font-heading">
              <FileText size={18} className="text-[#184edb]" />
              <span>Service Remarks / Notes</span>
            </h3>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter any additional service remarks or customer requests..."
              className="w-full border border-slate-200 rounded-xl p-3.5 h-24 focus:outline-none focus:border-[#184edb] text-[14px] font-medium resize-none box-border"
            />
          </div>

        </div>

      </div>

      {/* RIGHT COLUMN: Bill Summary Card */}
      <div className="w-full lg:w-96 flex-shrink-0 box-border">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100/60 sticky top-[80px] flex flex-col gap-6 w-full box-border">

          <h3 className="text-base font-extrabold text-slate-800 m-0 flex items-center gap-2 border-b border-slate-100 pb-3 font-heading">
            <FileText size={18} className="text-[#184edb]" />
            <span>Bill Summary</span>
          </h3>

          {/* Costs details list */}
          <div className="flex flex-col gap-3.5 text-[14px] font-semibold text-slate-500">
            <div className="flex items-center justify-between">
              <span>Labour Total:</span>
              <span className="text-slate-800 font-bold">₹{labourTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex items-center justify-between">
              <span>Spare Parts Total:</span>
              <span className="text-slate-800 font-bold">₹{sparePartsTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-50">
              <span>Subtotal:</span>
              <span className="text-slate-800 font-extrabold">₹{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>

            {/* Discount with editable percentage input box */}
            <div className="flex items-center justify-between">
              <span>Discount (%):</span>
              <input
                type="number"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                className="w-14 p-1 text-center border border-slate-200 rounded text-[13.5px] font-bold text-slate-800 focus:outline-none focus:border-[#184edb]"
              />
            </div>

            <div className="flex items-center justify-between">
              <span>GST (Combined):</span>
              <span className="text-slate-800 font-bold">₹{combinedGst.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Grand Total banner */}
          <div className="bg-[#184edb] rounded-2xl p-5 text-white flex items-center justify-between shadow-md relative overflow-hidden">
            <div className="flex flex-col gap-0.5 z-10">
              <span className="text-[10px] text-blue-150 font-bold uppercase tracking-wider">Grand Total</span>
              <span className="text-2xl font-black font-heading leading-tight">
                ₹{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="text-3xl text-blue-100 font-black opacity-30 z-0">
              ₹
            </div>
          </div>

          {/* Payment Details */}
          <div className="flex flex-col gap-4 border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-[11.5px] font-bold text-slate-400 uppercase tracking-wide">PAYMENT DETAILS</span>
              <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-600 border border-emerald-100">
                FULLY PAID
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11.5px] font-bold text-slate-400">Payment Mode</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as any)}
                className="p-2 border border-slate-200 rounded-lg text-[13.5px] font-semibold text-slate-700 bg-white focus:outline-none cursor-pointer"
              >
                <option value="Cash">Cash</option>
                <option value="Card">Credit/Debit Card</option>
                <option value="UPI">UPI Payment</option>
                <option value="Net Banking">Net Banking</option>
              </select>
            </div>

            <div className="flex items-center justify-between text-[13.5px] font-semibold text-slate-500 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/50 mt-1">
              <span>Paid Amount</span>
              <span className="text-emerald-600 font-extrabold">
                ₹{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Action trigger */}
          <button
            onClick={() => setShowInvoicePreview(true)}
            className="w-full flex items-center justify-center gap-2 bg-[#184edb] hover:bg-[#133eb5] text-white font-extrabold text-[13.5px] py-3 rounded-xl border-none shadow-md cursor-pointer transition-all duration-200"
          >
            <Printer size={16} />
            <span>GENERATE & PRINT INVOICE</span>
          </button>

          <span className="text-[11px] text-center text-slate-400 font-semibold italic mt-0.5 block">
            A digital copy will be sent to {phoneNumber}
          </span>

        </div>
      </div>

      {/* ==================== MODALS ==================== */}

      {/* 1. ADD / EDIT LABOUR MODAL */}
      {showAddLabourModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4.5 bg-[#184edb] text-white flex items-center justify-between">
              <span className="font-extrabold text-[16.5px]">
                {editingLabour ? 'Edit Labour Charge' : 'Add Labour Charge'}
              </span>
              <button
                onClick={() => setShowAddLabourModal(false)}
                className="text-white/80 hover:text-white border-none bg-transparent cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveLabour} className="p-6 flex flex-col gap-4 box-border">

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Labour Type</label>
                <input
                  type="text"
                  placeholder="e.g. Wheel Balancing"
                  value={labourTypeInput}
                  onChange={(e) => setLabourTypeInput(e.target.value)}
                  className="p-2.5 border border-slate-200 rounded-lg text-[13.5px] focus:outline-none focus:border-[#184edb] font-semibold"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Description</label>
                <input
                  type="text"
                  placeholder="Describe task details..."
                  value={labourDescInput}
                  onChange={(e) => setLabourDescInput(e.target.value)}
                  className="p-2.5 border border-slate-200 rounded-lg text-[13.5px] focus:outline-none focus:border-[#184edb] font-medium"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Amount (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={labourAmountInput}
                  onChange={(e) => setLabourAmountInput(Number(e.target.value))}
                  className="p-2.5 border border-slate-200 rounded-lg text-[13.5px] focus:outline-none focus:border-[#184edb] font-medium"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddLabourModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-650 font-semibold text-[13px] rounded-lg bg-white hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#184edb] hover:bg-[#133eb5] text-white font-semibold text-[13px] border-none rounded-lg cursor-pointer transition-colors shadow-md"
                >
                  {editingLabour ? 'Save Changes' : 'Add Labour'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 2. ADD / EDIT SPARE PART MODAL */}
      {showAddPartModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4.5 bg-[#184edb] text-white flex items-center justify-between">
              <span className="font-extrabold text-[16.5px]">
                {editingPart ? 'Edit Spare Part' : 'Add Spare Part'}
              </span>
              <button
                onClick={() => setShowAddPartModal(false)}
                className="text-white/80 hover:text-white border-none bg-transparent cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSavePart} className="p-6 flex flex-col gap-4 box-border">

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Part Number</label>
                  <input
                    type="text"
                    placeholder="e.g. P-FLT-8821"
                    value={partNoInput}
                    onChange={(e) => setPartNoInput(e.target.value)}
                    className="p-2.5 border border-slate-200 rounded-lg text-[13.5px] focus:outline-none focus:border-[#184edb] font-semibold"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Stock Status</label>
                  <select
                    value={partStockInput}
                    onChange={(e) => setPartStockInput(e.target.value as any)}
                    className="p-2.5 border border-slate-200 rounded-lg text-[13.5px] font-medium focus:outline-none focus:border-[#184edb]"
                  >
                    <option value="Available">Available</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Part Name</label>
                <input
                  type="text"
                  placeholder="e.g. Engine Oil Filter"
                  value={partNameInput}
                  onChange={(e) => setPartNameInput(e.target.value)}
                  className="p-2.5 border border-slate-200 rounded-lg text-[13.5px] focus:outline-none focus:border-[#184edb] font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={partQtyInput}
                    onChange={(e) => setPartQtyInput(Number(e.target.value))}
                    className="p-2.5 border border-slate-200 rounded-lg text-[13.5px] focus:outline-none focus:border-[#184edb] font-medium"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={partPriceInput}
                    onChange={(e) => setPartPriceInput(Number(e.target.value))}
                    className="p-2.5 border border-slate-200 rounded-lg text-[13.5px] focus:outline-none focus:border-[#184edb] font-medium"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">GST (%)</label>
                  <select
                    value={partGstInput}
                    onChange={(e) => setPartGstInput(Number(e.target.value))}
                    className="p-2.5 border border-slate-200 rounded-lg text-[13.5px] font-medium focus:outline-none focus:border-[#184edb]"
                  >
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                    <option value="28">28%</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddPartModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-650 font-semibold text-[13px] rounded-lg bg-white hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#184edb] hover:bg-[#133eb5] text-white font-semibold text-[13px] border-none rounded-lg cursor-pointer transition-colors shadow-md"
                >
                  {editingPart ? 'Save Changes' : 'Add Part'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 3. PRINTABLE INVOICE PREVIEW MODAL */}
      {showInvoicePreview && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#184edb] text-white flex items-center justify-between flex-shrink-0">
              <span className="font-extrabold text-[16px] tracking-tight">Invoice Preview - {billNo}</span>
              <button
                onClick={() => setShowInvoicePreview(false)}
                className="text-white/80 hover:text-white border-none bg-transparent cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Printable Area */}
            <div className="p-8 overflow-y-auto flex-1 text-slate-800" id="printable-invoice">

              {/* Invoice Header */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-6 mb-6">
                <div className="flex flex-col gap-1">
                  <span className="text-xl font-extrabold tracking-wide uppercase text-[#184edb]">DMS Pro Heavy Machinery</span>
                  <span className="text-[12px] text-slate-400 font-medium">Workshop ERP & Service Division</span>
                  <span className="text-[12.5px] text-slate-500 font-medium mt-1">Regd: DL 3C AW 1234 • Model: {model}</span>
                </div>
                <div className="text-right flex flex-col gap-1">
                  <span className="text-2xl font-black text-slate-850">INVOICE</span>
                  <span className="text-[13px] font-bold text-slate-650">Bill No: <span className="text-[#184edb]">{billNo}</span></span>
                  <span className="text-[13px] font-medium text-slate-500">Date: {serviceDate}</span>
                </div>
              </div>

              {/* Client & Vehicle grid */}
              <div className="grid grid-cols-2 gap-8 mb-6 bg-slate-50 border border-slate-100 rounded-xl p-4 text-[13.5px]">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Billed To</span>
                  <span className="font-bold text-slate-850">{customerName}</span>
                  <span className="font-semibold text-slate-650">{phoneNumber}</span>
                  <span className="font-medium text-slate-500">Job Card ID: {jobCardNo}</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vehicle Details</span>
                  <div className="grid grid-cols-2 gap-2 text-slate-650 font-semibold">
                    <span>Reg No:</span>
                    <span className="text-slate-800">{vehicleNo}</span>
                    <span>Engine No:</span>
                    <span className="text-slate-800 text-[12px]">{engineNo}</span>
                    <span>Chassis No:</span>
                    <span className="text-slate-800 text-[12px]">{chassisNo}</span>
                  </div>
                </div>
              </div>

              {/* Labour Charges list */}
              <div className="mb-6">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-2.5">Labour Details</span>
                <table className="w-full text-left border-collapse text-[13px]">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50/50">
                      <th className="py-2 px-3">Labour Service</th>
                      <th className="py-2 px-3">Description</th>
                      <th className="py-2 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {labourCharges.map(l => (
                      <tr key={l.id}>
                        <td className="py-2.5 px-3 font-bold text-slate-800">{l.type}</td>
                        <td className="py-2.5 px-3 text-slate-500">{l.description}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-800">₹{l.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Spare Parts list */}
              <div className="mb-6">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-2.5">Spare Parts Details</span>
                <table className="w-full text-left border-collapse text-[13px]">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50/50">
                      <th className="py-2 px-3">Part No</th>
                      <th className="py-2 px-3">Part Name</th>
                      <th className="py-2 px-3 text-center">Qty</th>
                      <th className="py-2 px-3 text-right">Price</th>
                      <th className="py-2 px-3 text-center">GST</th>
                      <th className="py-2 px-3 text-right">Total Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {spareParts.map(p => (
                      <tr key={p.id}>
                        <td className="py-2.5 px-3 text-slate-500">{p.partNo}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-800">{p.name}</td>
                        <td className="py-2.5 px-3 text-center text-slate-700">{p.qty}</td>
                        <td className="py-2.5 px-3 text-right text-slate-650">₹{p.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="py-2.5 px-3 text-center text-slate-500">{p.gstPercent}%</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-850">₹{calculatePartTotal(p.qty, p.price, p.gstPercent).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Summary */}
              <div className="flex flex-col items-end gap-2 border-t border-slate-200 pt-5 mt-4 text-[13.5px] font-semibold text-slate-500">
                <div className="flex items-center gap-16">
                  <span>Labour Subtotal:</span>
                  <span className="text-slate-800 font-bold text-right w-24">₹{labourTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center gap-16">
                  <span>Spare Parts Subtotal:</span>
                  <span className="text-slate-800 font-bold text-right w-24">₹{sparePartsTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center gap-16">
                  <span>Discount ({discountPercent}%):</span>
                  <span className="text-slate-800 font-bold text-right w-24">-₹{discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center gap-16">
                  <span>Combined GST:</span>
                  <span className="text-slate-800 font-bold text-right w-24">₹{combinedGst.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center gap-16 text-[15px] border-t border-slate-100 pt-2.5 mt-1">
                  <span className="text-slate-900 font-extrabold">Grand Total Due:</span>
                  <span className="text-[#184edb] font-black text-right w-28 text-lg">₹{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Signature / Footer */}
              <div className="flex justify-between items-end border-t border-slate-100 pt-8 mt-6 text-[12px] font-medium text-slate-400">
                <div className="flex flex-col">
                  <span>Assigned Mechanic: {assignedMechanic}</span>
                  <span>Service Advisor: {serviceAdvisor}</span>
                </div>
                <div className="text-right flex flex-col items-center">
                  <div className="w-32 border-b border-slate-300 mb-2 h-8" />
                  <span className="font-bold text-slate-500">Authorized Signature</span>
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 flex-shrink-0">
              <button
                onClick={() => setShowInvoicePreview(false)}
                className="px-4 py-2 border border-slate-200 text-slate-650 font-bold text-[13px] bg-white rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex items-center gap-1.5 px-4.5 py-2.5 bg-[#184edb] hover:bg-[#133eb5] text-white font-bold text-[13px] border-none rounded-lg shadow-md cursor-pointer"
              >
                <Printer size={15} />
                <span>Print Invoice</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ServiceBilling;
