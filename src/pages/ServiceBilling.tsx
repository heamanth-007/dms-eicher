import React, { useState, useEffect, useRef } from 'react';
import { getStoredInventory, saveStoredInventory, type PartType } from '../utils/inventory';
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
  FileText,
  Clock,
  Search,
  FolderOpen
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

export interface ServiceBillRecord {
  id: string;
  billNo: string;
  jobCardNo: string;
  customerName: string;
  phoneNumber: string;
  vehicleNo: string;
  model: string;
  serviceDate: string;
  engineNo?: string;
  chassisNo?: string;
  assignedMechanic?: string;
  serviceAdvisor?: string;
  deliveryDate?: string;
  deliveryTime?: string;
  labourCharges: LabourCharge[];
  spareParts: SparePart[];
  remarks?: string;
  discountPercent?: string;
  paymentMode?: 'Cash' | 'Card' | 'UPI' | 'Net Banking';
  grandTotal: number;
  status: 'PAID' | 'PARTIAL' | 'PENDING' | 'DRAFT';
  createdAt: string;
}

export interface ServiceBillingProps {
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

export const ServiceBilling: React.FC<ServiceBillingProps> = ({ companySettings }) => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const currentYear = new Date().getFullYear();

  const getNextServiceBillNo = (bills: ServiceBillRecord[], drafts: ServiceBillRecord[]) => {
    let maxSeq = 6000;
    [...bills, ...drafts].forEach(b => {
      if (b.billNo) {
        const match = b.billNo.match(new RegExp(`SB-${currentYear}-(6\\d{3})$`, 'i'));
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num >= 6001 && num < 7000) {
            if (num > maxSeq) maxSeq = num;
          }
        }
      }
    });
    return `SB-${currentYear}-${maxSeq + 1}`;
  };

  // Header info
  const [billNo, setBillNo] = useState('');

  // Customer & Vehicle State
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [jobCardNo, setJobCardNo] = useState('');
  const [vehicleNo, setVehicleNo] = useState('');
  const [model, setModel] = useState('');
  const [serviceDate, setServiceDate] = useState('');
  const [engineNo, setEngineNo] = useState('');
  const [chassisNo, setChassisNo] = useState('');
  const [assignedMechanic, setAssignedMechanic] = useState('');
  const [mechanicsList, setMechanicsList] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/api/mechanics`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMechanicsList(data);
        }
      })
      .catch(err => console.error('Error fetching mechanics in ServiceBilling:', err));
  }, [API_URL]);

  const activeMechanics = mechanicsList.filter(m => !m.status || m.status.toLowerCase() !== 'inactive');

  // Mechanic Details State
  const [serviceAdvisor, setServiceAdvisor] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');

  // Total Bills & Draft Lists with localStorage persistence
  const [totalBillsList, setTotalBillsList] = useState<ServiceBillRecord[]>(() => {
    const saved = localStorage.getItem('dms_service_bills');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing dms_service_bills:', e);
      }
    }
    return [];
  });

  const [draftBillsList, setDraftBillsList] = useState<ServiceBillRecord[]>(() => {
    const saved = localStorage.getItem('dms_service_drafts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing dms_service_drafts:', e);
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('dms_service_bills', JSON.stringify(totalBillsList));
    if (!billNo) {
      setBillNo(getNextServiceBillNo(totalBillsList, draftBillsList));
    }
  }, [totalBillsList, draftBillsList]);

  useEffect(() => {
    localStorage.setItem('dms_service_drafts', JSON.stringify(draftBillsList));
  }, [draftBillsList]);

  // Modals for Total Bills & Drafts
  const [showTotalBillsModal, setShowTotalBillsModal] = useState(false);
  const [showDraftsModal, setShowDraftsModal] = useState(false);
  const [searchBillsTerm, setSearchBillsTerm] = useState('');
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [editingBillId, setEditingBillId] = useState<string | null>(null);

  // Labour Charges State
  const [labourCharges, setLabourCharges] = useState<LabourCharge[]>([]);

  // Spare Parts State
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);

  // Remarks State
  const [remarks, setRemarks] = useState('');

  // Discount & Payment State
  const getDefaultDiscountFromSettings = () => {
    try {
      if ((companySettings as any)?.defaultDiscountPercent) {
        return (companySettings as any).defaultDiscountPercent.toString().replace(/[^0-9.]/g, '') || '5';
      }
      const saved = localStorage.getItem('dms_company_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.defaultDiscountPercent !== undefined) {
          return parsed.defaultDiscountPercent.toString().replace(/[^0-9.]/g, '') || '5';
        }
      }
    } catch (e) {}
    return '5';
  };

  const [discountPercent, setDiscountPercent] = useState<string>(() => getDefaultDiscountFromSettings());
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'Card' | 'UPI' | 'Net Banking'>('Cash');

  useEffect(() => {
    const handleSettingsUpdate = () => {
      setDiscountPercent(getDefaultDiscountFromSettings());
    };
    window.addEventListener('dms_settings_updated', handleSettingsUpdate);
    return () => window.removeEventListener('dms_settings_updated', handleSettingsUpdate);
  }, [companySettings]);

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

  const [inventoryParts, setInventoryParts] = useState<PartType[]>(() => getStoredInventory());

  const loadInventoryParts = () => {
    const stored = getStoredInventory();
    if (stored && stored.length > 0) setInventoryParts(stored);

    fetch(`${API_URL}/api/parts`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setInventoryParts(data);
      })
      .catch(err => console.error('Error fetching inventory parts:', err));
  };

  useEffect(() => {
    loadInventoryParts();

    const handleInvUpdate = () => {
      loadInventoryParts();
    };

    window.addEventListener('dms_inventory_updated', handleInvUpdate);
    return () => window.removeEventListener('dms_inventory_updated', handleInvUpdate);
  }, []);

  const handleSelectInventoryPart = (part: PartType) => {
    setPartNoInput(part.partNumber);
    setPartNameInput(part.partName);
    const parsedPrice = parseFloat(part.salePrice.replace(/[^0-9.]/g, '')) || 0;
    setPartPriceInput(parsedPrice);
    const parsedGst = parseInt(part.gstPercent?.replace(/[^0-9]/g, '') || '18', 10) || 18;
    setPartGstInput(parsedGst);
    const stockQty = parseInt(part.stock.replace(/[^0-9]/g, ''), 10) || 0;
    setPartStockInput(stockQty === 0 ? 'Out of Stock' : stockQty < 12 ? 'Low Stock' : 'Available');
  };

  // Parts form refs for smooth Enter key step-by-step focus move
  const partNoRef = useRef<HTMLInputElement>(null);
  const partStockRef = useRef<HTMLSelectElement>(null);
  const partNameRef = useRef<HTMLInputElement>(null);
  const partQtyRef = useRef<HTMLInputElement>(null);
  const partPriceRef = useRef<HTMLInputElement>(null);
  const partGstRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (showAddPartModal) {
      setTimeout(() => {
        partNoRef.current?.focus();
      }, 100);
    }
  }, [showAddPartModal]);

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
  const handleAddAndNewPart = (e?: React.FormEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();

    if (!partNameInput.trim()) {
      alert('Please enter a part name!');
      setTimeout(() => partNameRef.current?.focus(), 50);
      return;
    }

    const newPart: SparePart = {
      id: `p-${Math.random().toString(36).substr(2, 9)}`,
      partNo: partNoInput || `P-${Math.floor(1000 + Math.random() * 9000)}`,
      name: partNameInput,
      qty: Number(partQtyInput) || 1,
      price: Number(partPriceInput) || 0,
      gstPercent: Number(partGstInput) || 18,
      total: calculatePartTotal(Number(partQtyInput) || 1, Number(partPriceInput) || 0, Number(partGstInput) || 18),
      stockStatus: partStockInput
    };

    setSpareParts(prev => [...prev, newPart]);

    // Reset inputs for next entry
    setPartNoInput('');
    setPartNameInput('');
    setPartQtyInput(1);
    setPartPriceInput(100);
    setPartGstInput(18);
    setPartStockInput('Available');
    setEditingPart(null);

    // Focus back on Part Number for next part entry
    setTimeout(() => {
      partNoRef.current?.focus();
    }, 50);
  };

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

  const deductInventoryStock = (partsList: SparePart[], refBillNo: string, moduleName: string) => {
    try {
      const currentInv = getStoredInventory();
      let txns: any[] = [];
      try {
        const savedTxns = localStorage.getItem('dms_spare_parts_transactions');
        if (savedTxns) txns = JSON.parse(savedTxns);
      } catch (e) {}

      if (currentInv && currentInv.length > 0) {
        let updatedInv = [...currentInv];
        let changed = false;

        partsList.forEach(item => {
          let invPart = updatedInv.find(p => p.partNumber.toLowerCase() === item.partNo.toLowerCase());
          if (!invPart) {
            invPart = updatedInv.find(p => p.partName.toLowerCase().includes(item.name.toLowerCase()) || item.name.toLowerCase().includes(p.partName.toLowerCase()));
          }

          if (invPart) {
            const currStock = parseInt(invPart.stock.replace(/[^0-9]/g, ''), 10) || 0;
            const newStock = Math.max(0, currStock - item.qty);
            invPart.stock = newStock.toString();
            invPart.stockStatus = newStock === 0 ? 'out' : newStock < 12 ? 'low' : 'normal';
            changed = true;

            // Log outward transaction in Stock History
            txns.unshift({
              id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              partNumber: invPart.partNumber,
              partName: invPart.partName,
              type: `Outward (${moduleName})`,
              quantity: `-${item.qty} Units`,
              reference: `Bill #${refBillNo}`,
              date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              amount: `₹${(item.qty * item.price).toFixed(2)}`
            });
          }
        });

        if (changed) {
          saveStoredInventory(updatedInv);
          try {
            localStorage.setItem('dms_spare_parts_transactions', JSON.stringify(txns));
          } catch (e) {}
          window.dispatchEvent(new Event('dms_inventory_updated'));
        }
      }
    } catch (e) {}
  };

  // --- SAVE BILL & DRAFT HANDLERS ---
  const handleSaveBill = () => {
    if (spareParts.length > 0) {
      // Automatically deduct spare parts stock from inventory!
      deductInventoryStock(spareParts, billNo, 'Service Billing');
    }

    // Update the backend JobCard with the final amount
    if (jobCardNo) {
      fetch(`${API_URL}/api/jobcards/${jobCardNo}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: grandTotal })
      }).catch(err => console.error('Failed to update JobCard amount:', err));
    }

    const existingIndex = editingBillId
      ? totalBillsList.findIndex(b => b.id === editingBillId)
      : totalBillsList.findIndex(b => b.billNo === billNo);

    if (existingIndex >= 0) {
      const updatedBill: ServiceBillRecord = {
        ...totalBillsList[existingIndex],
        billNo,
        jobCardNo,
        customerName,
        phoneNumber,
        vehicleNo,
        model,
        serviceDate,
        engineNo,
        chassisNo,
        assignedMechanic,
        serviceAdvisor,
        deliveryDate,
        deliveryTime,
        labourCharges: [...labourCharges],
        spareParts: [...spareParts],
        remarks,
        discountPercent,
        paymentMode,
        grandTotal,
        status: 'PAID'
      };

      setTotalBillsList(prev => {
        const updated = [...prev];
        updated[existingIndex] = updatedBill;
        return updated;
      });

      if (editingDraftId) {
        setDraftBillsList(prev => prev.filter(d => d.id !== editingDraftId));
      }
      handleClearForm();
      alert(`Service Bill ${billNo} updated successfully!`);
    } else {
      const newBill: ServiceBillRecord = {
        id: `sb-${Date.now()}`,
        billNo,
        jobCardNo,
        customerName,
        phoneNumber,
        vehicleNo,
        model,
        serviceDate,
        engineNo,
        chassisNo,
        assignedMechanic,
        serviceAdvisor,
        deliveryDate,
        deliveryTime,
        labourCharges: [...labourCharges],
        spareParts: [...spareParts],
        remarks,
        discountPercent,
        paymentMode,
        grandTotal,
        status: 'PAID',
        createdAt: new Date().toLocaleDateString()
      };

      setTotalBillsList(prev => [newBill, ...prev]);

      if (editingDraftId) {
        setDraftBillsList(prev => prev.filter(d => d.id !== editingDraftId));
      }

      // Auto-increment bill number only when a new bill is created
      const nextBillNo = getNextServiceBillNo([...totalBillsList, newBill], draftBillsList);
      setBillNo(nextBillNo);

      handleClearForm();
      alert(`Service Bill ${billNo} saved successfully! Added to Total Bills list.`);
    }
  };

  const handleSaveDraft = () => {
    if (!customerName && !phoneNumber && !vehicleNo && labourCharges.length === 0 && spareParts.length === 0) {
      alert('Please add customer details, vehicle info, or charges before saving as draft!');
      return;
    }

    const draftBillNo = billNo.includes('DRAFT') ? billNo : `${billNo}-DRAFT`;
    const existingIndex = editingDraftId
      ? draftBillsList.findIndex(d => d.id === editingDraftId)
      : draftBillsList.findIndex(d => d.billNo === draftBillNo || d.billNo === billNo);
    
    const draftRecord: ServiceBillRecord = {
      id: existingIndex >= 0 ? draftBillsList[existingIndex].id : `draft-${Date.now()}`,
      billNo: draftBillNo,
      jobCardNo,
      customerName: customerName || 'Draft Customer',
      phoneNumber,
      vehicleNo: vehicleNo || 'Draft Vehicle',
      model,
      serviceDate,
      engineNo,
      chassisNo,
      assignedMechanic,
      serviceAdvisor,
      deliveryDate,
      deliveryTime,
      labourCharges: [...labourCharges],
      spareParts: [...spareParts],
      remarks,
      discountPercent,
      paymentMode,
      grandTotal,
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

    // Auto-increment bill number for next new bill/draft
    const currentNum = parseInt(billNo.replace(/[^0-9]/g, ''), 10) || 45;
    const nextBillNo = `SB-2023-00${currentNum + 1}`;
    setBillNo(nextBillNo);

    // Clear filled data from form
    handleClearForm();

    alert(`Service Bill ${draftBillNo} saved as Draft and form cleared!`);
  };

  const handleClearForm = () => {
    setCustomerName('');
    setPhoneNumber('');
    setVehicleNo('');
    setModel('');
    setServiceDate('');
    setEngineNo('');
    setChassisNo('');
    setDeliveryDate('');
    setDeliveryTime('');
    setLabourCharges([]);
    setSpareParts([]);
    setRemarks('');
    setDiscountPercent(getDefaultDiscountFromSettings());
    setEditingDraftId(null);
    setEditingBillId(null);
  };

  const handleLoadRecord = (record: ServiceBillRecord) => {
    if (record.status === 'DRAFT') {
      setEditingDraftId(record.id);
      setEditingBillId(null);
    } else {
      setEditingBillId(record.id);
      setEditingDraftId(null);
    }
    setBillNo(record.billNo.replace('-DRAFT', ''));
    if (record.jobCardNo) setJobCardNo(record.jobCardNo);
    setCustomerName(record.customerName || '');
    setPhoneNumber(record.phoneNumber || '');
    setVehicleNo(record.vehicleNo || '');
    setModel(record.model || '');
    setServiceDate(record.serviceDate || '');
    setEngineNo(record.engineNo || '');
    setChassisNo(record.chassisNo || '');
    setAssignedMechanic(record.assignedMechanic || 'Vikram Singh');
    setServiceAdvisor(record.serviceAdvisor || 'John Admin');
    setDeliveryDate(record.deliveryDate || '');
    setDeliveryTime(record.deliveryTime || '05:00 PM');
    setLabourCharges(record.labourCharges || []);
    setSpareParts(record.spareParts || []);
    setRemarks(record.remarks || '');
    setDiscountPercent(record.discountPercent || '5');
    setPaymentMode(record.paymentMode || 'Cash');

    setShowTotalBillsModal(false);
    setShowDraftsModal(false);
  };

  const handleDeleteBill = (id: string) => {
    if (window.confirm('Are you sure you want to delete this service bill from records?')) {
      setTotalBillsList(totalBillsList.filter(b => b.id !== id));
    }
  };

  const handleDeleteDraft = (id: string) => {
    if (window.confirm('Are you sure you want to delete this draft?')) {
      setDraftBillsList(draftBillsList.filter(d => d.id !== id));
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
          <span className="text-[#184edb]">New Service Bill</span>
        </div>

        {/* Title, Bill No, Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight m-0 font-heading">
              Create New Service Bill
            </h1>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="text-[14px] text-[#184edb] font-bold">
                Bill No: {billNo}
              </span>
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
              onClick={handleClearForm}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-650 font-bold text-[13px] rounded-lg border border-slate-200 shadow-sm cursor-pointer transition-colors"
            >
              Clear Form
            </button>
            <button
              type="button"
              onClick={() => setShowInvoicePreview(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-650 font-bold text-[13px] rounded-lg border border-slate-200 shadow-sm cursor-pointer transition-colors"
            >
              <Eye size={15} />
              <span>Preview</span>
            </button>
            <button
              type="button"
              onClick={handleSaveBill}
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
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
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
                  type="date"
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
                  <option value="">Select Mechanic...</option>
                  {activeMechanics.map(m => (
                    <option key={m.id || m._id} value={m.name}>{m.name} ({m.status || 'Active'})</option>
                  ))}
                  {activeMechanics.length === 0 && (
                    <>
                      <option value="Vikram Singh">Vikram Singh</option>
                      <option value="Amit Sharma">Amit Sharma</option>
                      <option value="Suresh Gupta">Suresh Gupta</option>
                    </>
                  )}
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
                  <option value="">Select Mechanic...</option>
                  {activeMechanics.map(m => (
                    <option key={m.id || m._id} value={m.name}>{m.name} ({m.status || 'Active'})</option>
                  ))}
                  {activeMechanics.length === 0 && (
                    <>
                      <option value="Vikram Singh">Vikram Singh</option>
                      <option value="Amit Sharma">Amit Sharma</option>
                      <option value="Suresh Gupta">Suresh Gupta</option>
                    </>
                  )}
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
                  type="date"
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

          <button
            type="button"
            onClick={handleSaveDraft}
            className="w-full flex items-center justify-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-[13px] py-2.5 rounded-xl border border-amber-200 cursor-pointer transition-all duration-200"
          >
            <Clock size={15} />
            <span>Save as Draft</span>
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
              {/* Fast Inventory Selector */}
              <div className="flex flex-col gap-1.5 bg-blue-50/60 p-3 rounded-xl border border-blue-100">
                <label className="text-[11.5px] font-extrabold text-[#184edb] uppercase tracking-wider">
                  🔍 Search & Select From Inventory Catalog
                </label>
                <select
                  onChange={(e) => {
                    const selected = inventoryParts.find(p => p.partNumber === e.target.value);
                    if (selected) handleSelectInventoryPart(selected);
                  }}
                  defaultValue=""
                  className="p-2 border border-blue-200 rounded-lg text-[13px] font-semibold text-slate-800 focus:outline-none focus:border-[#184edb] bg-white cursor-pointer"
                >
                  <option value="" disabled>-- Select Spare Part from Inventory --</option>
                  {inventoryParts.map(p => (
                    <option key={p.partNumber} value={p.partNumber}>
                      {p.partName} ({p.partNumber}) - {p.salePrice}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Part Number</label>
                  <input
                    ref={partNoRef}
                    type="text"
                    list="inventory-partnos-datalist"
                    placeholder="e.g. SP-10921"
                    value={partNoInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPartNoInput(val);
                      const match = inventoryParts.find(p => p.partNumber.toLowerCase() === val.toLowerCase() || p.partName.toLowerCase() === val.toLowerCase());
                      if (match) handleSelectInventoryPart(match);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        partStockRef.current?.focus();
                      }
                    }}
                    className="p-2.5 border border-slate-200 rounded-lg text-[13.5px] focus:outline-none focus:border-[#184edb] font-semibold"
                  />
                  <datalist id="inventory-partnos-datalist">
                    {inventoryParts.map(p => (
                      <option key={p.partNumber} value={p.partNumber}>
                        {p.partName} ({p.salePrice})
                      </option>
                    ))}
                  </datalist>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Stock Status</label>
                  <select
                    ref={partStockRef}
                    value={partStockInput}
                    onChange={(e) => setPartStockInput(e.target.value as any)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        partNameRef.current?.focus();
                      }
                    }}
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
                  ref={partNameRef}
                  type="text"
                  list="inventory-parts-datalist"
                  placeholder="e.g. Ceramic Brake Pads"
                  value={partNameInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPartNameInput(val);
                    const match = inventoryParts.find(p => p.partName.toLowerCase() === val.toLowerCase() || p.partNumber.toLowerCase() === val.toLowerCase());
                    if (match) handleSelectInventoryPart(match);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      partQtyRef.current?.focus();
                    }
                  }}
                  className="p-2.5 border border-slate-200 rounded-lg text-[13.5px] focus:outline-none focus:border-[#184edb] font-semibold"
                  required
                />
                <datalist id="inventory-parts-datalist">
                  {inventoryParts.map(p => (
                    <option key={p.partNumber} value={p.partName}>
                      {p.partNumber} - {p.salePrice}
                    </option>
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Qty</label>
                  <input
                    ref={partQtyRef}
                    type="number"
                    min="1"
                    value={partQtyInput}
                    onChange={(e) => setPartQtyInput(Number(e.target.value))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        partPriceRef.current?.focus();
                      }
                    }}
                    className="p-2.5 border border-slate-200 rounded-lg text-[13.5px] focus:outline-none focus:border-[#184edb] font-medium"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Price (₹)</label>
                  <input
                    ref={partPriceRef}
                    type="number"
                    min="0"
                    value={partPriceInput}
                    onChange={(e) => setPartPriceInput(Number(e.target.value))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        partGstRef.current?.focus();
                      }
                    }}
                    className="p-2.5 border border-slate-200 rounded-lg text-[13.5px] focus:outline-none focus:border-[#184edb] font-medium"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">GST (%)</label>
                  <select
                    ref={partGstRef}
                    value={partGstInput}
                    onChange={(e) => setPartGstInput(Number(e.target.value))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (!editingPart) {
                          handleAddAndNewPart();
                        } else {
                          handleSavePart(e);
                        }
                      }
                    }}
                    className="p-2.5 border border-slate-200 rounded-lg text-[13.5px] font-medium focus:outline-none focus:border-[#184edb]"
                  >
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                    <option value="28">28%</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddPartModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-650 font-semibold text-[13px] rounded-lg bg-white hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                {!editingPart && (
                  <button
                    type="button"
                    onClick={handleAddAndNewPart}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[13px] border-none rounded-lg cursor-pointer transition-colors shadow-md flex items-center gap-1.5"
                    title="Add this part and clear form for the next entry"
                  >
                    <Plus size={15} />
                    <span>Add & New</span>
                  </button>
                )}
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#184edb] hover:bg-[#133eb5] text-white font-bold text-[13px] border-none rounded-lg cursor-pointer transition-colors shadow-md"
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
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              body * {
                visibility: hidden !important;
              }
              #printable-invoice, #printable-invoice * {
                visibility: visible !important;
              }
              #printable-invoice {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                max-height: none !important;
                overflow: visible !important;
                padding: 8mm !important;
                margin: 0 !important;
                box-shadow: none !important;
                border: none !important;
                background: white !important;
              }
              @page {
                size: A4 portrait;
                margin: 0;
              }
            }
          `}} />
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
                <div className="flex items-start gap-4">
                  {companySettings?.logoUrl && (
                    <img src={companySettings.logoUrl} alt="Logo" className="w-14 h-14 object-contain rounded-lg border border-slate-200 p-1 bg-white" />
                  )}
                  <div className="flex flex-col gap-1">
                    <span className="text-xl font-extrabold tracking-wide uppercase text-[#184edb]">
                      {companySettings?.companyName || 'DMS Pro Heavy Machinery'}
                    </span>
                    <span className="text-[12px] text-slate-400 font-medium">
                      {companySettings?.dealerName ? `${companySettings.dealerName} • ` : ''}Workshop ERP & Service Division
                    </span>
                    <span className="text-[12.5px] text-slate-500 font-medium mt-1">
                      {companySettings?.streetAddress ? `${companySettings.streetAddress}, ${companySettings.city}, ${companySettings.stateName} ${companySettings.pinCode} • ` : ''}GSTIN: {companySettings?.gstNumber || '22AAAAA0000A1Z5'}
                    </span>
                    <span className="text-[11.5px] text-slate-400 font-medium">
                      Ph: {companySettings?.mobileNumber || companySettings?.phoneNum || '+1 (555) 012-3456'} • Email: {companySettings?.emailAddress || 'service@company.com'}
                    </span>
                  </div>
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
                  handleSaveBill();
                  window.print();
                  setShowInvoicePreview(false);
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

      {/* 4. TOTAL BILLS LIST MODAL */}
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
                  <h3 className="text-lg font-bold text-slate-900 m-0 font-heading">Total Service Bills</h3>
                  <p className="text-xs text-slate-500 m-0 font-medium">Showing {totalBillsList.length} total generated bills in the system</p>
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
                  placeholder="Search by Bill No, Customer, Vehicle..."
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
                  No service bills generated yet. Save a bill to see it here!
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-3 px-3">Bill No</th>
                      <th className="py-3 px-3">Customer Name</th>
                      <th className="py-3 px-3">Vehicle No</th>
                      <th className="py-3 px-3">Date</th>
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
                        b.vehicleNo.toLowerCase().includes(searchBillsTerm.toLowerCase())
                      )
                      .map((b) => (
                        <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-3 font-bold text-[#184edb]">{b.billNo}</td>
                          <td className="py-3 px-3 font-bold text-slate-800">{b.customerName}</td>
                          <td className="py-3 px-3 font-mono text-slate-600">{b.vehicleNo}</td>
                          <td className="py-3 px-3 text-slate-500">{b.serviceDate}</td>
                          <td className="py-3 px-3 text-right font-bold text-slate-900">₹{b.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          <td className="py-3 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                              b.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                              b.status === 'PARTIAL' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                              'bg-slate-100 text-slate-600'
                            }`}>
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

      {/* 5. DRAFTS LIST MODAL */}
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
                  <h3 className="text-lg font-bold text-slate-900 m-0 font-heading">Saved Draft Bills</h3>
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
                      <th className="py-3 px-3">Vehicle No</th>
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3 text-right">Draft Total</th>
                      <th className="py-3 px-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {draftBillsList.map((d) => (
                      <tr key={d.id} className="hover:bg-amber-50/30 transition-colors">
                        <td className="py-3 px-3 font-bold text-amber-800">{d.billNo}</td>
                        <td className="py-3 px-3 font-bold text-slate-800">{d.customerName}</td>
                        <td className="py-3 px-3 font-mono text-slate-600">{d.vehicleNo}</td>
                        <td className="py-3 px-3 text-slate-500">{d.serviceDate}</td>
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

export default ServiceBilling;
