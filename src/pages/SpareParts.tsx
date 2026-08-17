import React, { useState, useEffect } from 'react';
import {
  Package,
  Layers,
  AlertTriangle,
  CircleAlert,
  CircleDollarSign,
  Receipt,
  ChevronDown,
  Printer,
  FileText,
  Plus,
  ChevronLeft,
  ChevronRight,
  Info,
  Coins,
  Warehouse,
  Image,
  Save,
  PlusCircle,
  Trash2,
  Car,
  Download,
  X,
  Search
} from 'lucide-react';
import { getStoredInventory, saveStoredInventory, type PartType } from '../utils/inventory';

interface SearchableDropdownInputProps {
  id: string;
  label: string;
  placeholder: string;
  defaultValue?: string;
  options: string[];
}

const SearchableDropdownInput: React.FC<SearchableDropdownInputProps> = ({
  id,
  label,
  placeholder,
  defaultValue = '',
  options
}) => {
  const [value, setValue] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (defaultValue) setValue(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt =>
    opt.toLowerCase().includes(value.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-2 relative z-30" ref={containerRef}>
      <label className="text-[11.5px] font-bold text-slate-800 uppercase tracking-wider font-sans">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          id={id}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full px-4 py-2.5 pr-10 text-[14px] bg-white border-2 border-slate-300 rounded-lg text-slate-900 font-bold focus:outline-none focus:border-[#184edb] focus:ring-2 focus:ring-blue-500/20 transition-all shadow-xs"
          autoComplete="off"
        />
        <button
          type="button"
          onClick={() => setIsOpen(prev => !prev)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-[#184edb] bg-transparent border-none cursor-pointer"
        >
          <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Floating Filtered Dropdown List - Ultra High Visibility & Contrast */}
      {isOpen && (
        <div className="absolute top-[100%] left-0 right-0 mt-1.5 bg-white border-2 border-blue-500/40 rounded-xl shadow-2xl z-[100] max-h-60 overflow-y-auto divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100 box-border ring-1 ring-black/5">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => {
              const isSelected = value.toLowerCase() === opt.toLowerCase();
              return (
                <div
                  key={opt}
                  onClick={() => {
                    setValue(opt);
                    setIsOpen(false);
                  }}
                  className={`px-4 py-3 text-[14px] font-bold cursor-pointer transition-colors flex items-center justify-between ${
                    isSelected 
                      ? 'bg-[#184edb] text-white' 
                      : 'bg-white text-slate-900 hover:bg-blue-50 hover:text-[#184edb]'
                  }`}
                >
                  <span className="truncate">{opt}</span>
                  {isSelected && (
                    <span className="text-[10.5px] font-extrabold text-[#184edb] bg-white px-2.5 py-0.5 rounded-full shadow-xs">
                      ✓ Selected
                    </span>
                  )}
                </div>
              );
            })
          ) : (
            <div
              onClick={() => setIsOpen(false)}
              className="px-4 py-3 text-[13.5px] text-slate-800 font-bold bg-slate-50 flex items-center gap-2 cursor-pointer hover:bg-blue-50 hover:text-[#184edb]"
            >
              <Plus size={15} className="text-[#184edb]" />
              <span>Use custom entry: <strong className="text-[#184edb]">"{value}"</strong></span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};



export const SpareParts: React.FC = () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [parts, setParts] = useState<PartType[]>(() => getStoredInventory());

  const fetchParts = () => {
    const stored = getStoredInventory();
    setParts(stored);
    fetch(`${API_URL}/api/parts`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setParts(data);
          saveStoredInventory(data);
        }
      })
      .catch(err => console.error('Error fetching parts:', err));
  };

  useEffect(() => {
    fetchParts();

    const handleInventoryUpdate = () => {
      const stored = getStoredInventory();
      setParts(stored);
    };

    window.addEventListener('dms_inventory_updated', handleInventoryUpdate);
    return () => window.removeEventListener('dms_inventory_updated', handleInventoryUpdate);
  }, []);

  const [activeSubTab, setActiveSubTab] = useState<'history' | 'live'>('live');
  const [isAdding, setIsAdding] = useState(false);
  const [editingPart, setEditingPart] = useState<string | null>(null);
  const [uom, setUom] = useState<'Piece' | 'Box' | 'Set'>('Piece');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedBrand, setSelectedBrand] = useState('All Brands');
  const [statusTab, setStatusTab] = useState<'All' | 'In Stock' | 'Low Stock' | 'Out of Stock'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Interactive KPI Modals & Filter States
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [showValuationModal, setShowValuationModal] = useState(false);
  const [showTxnsModal, setShowTxnsModal] = useState(false);
  const [activeKpiFilter, setActiveKpiFilter] = useState<'total' | 'low' | 'out' | null>(null);
  // Stock History Data

  const [transactionsList, setTransactionsList] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('dms_spare_parts_transactions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  useEffect(() => {
    const handleTxnsUpdate = () => {
      try {
        const saved = localStorage.getItem('dms_spare_parts_transactions');
        if (saved) setTransactionsList(JSON.parse(saved));
      } catch (e) {}
    };
    window.addEventListener('dms_inventory_updated', handleTxnsUpdate);
    return () => window.removeEventListener('dms_inventory_updated', handleTxnsUpdate);
  }, []);

  // History Tab Filter & Detail States
  const [histFromDate, setHistFromDate] = useState('');
  const [histToDate, setHistToDate] = useState('');
  const [histType, setHistType] = useState('All Types');
  const [histCategory, setHistCategory] = useState('All Categories');
  const [histSearch, setHistSearch] = useState('');
  const [viewingTxn, setViewingTxn] = useState<any | null>(null);
  const [histPage, setHistPage] = useState(1);
  const histItemsPerPage = 10;

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const displayParts = parts;

  // Auto-derived stock status helper: Qty < 12 is Low Stock!
  const getDerivedStatus = (p: PartType): 'normal' | 'low' | 'out' => {
    const qty = parseInt(p.stock.replace(/[^0-9]/g, ''), 10) || 0;
    if (qty === 0) return 'out';
    if (qty < 12) return 'low';
    return 'normal';
  };

  const categoriesList = ['All Categories', ...Array.from(new Set(displayParts.map(p => p.category)))];
  const brandsList = ['All Brands', ...Array.from(new Set(displayParts.map(p => p.brand)))];

  const filteredParts = displayParts.filter((part) => {
    const effectiveStatus = getDerivedStatus(part);
    if (selectedCategory !== 'All Categories' && part.category !== selectedCategory) return false;
    if (selectedBrand !== 'All Brands' && part.brand !== selectedBrand) return false;
    if (statusTab === 'In Stock' && effectiveStatus !== 'normal') return false;
    if (statusTab === 'Low Stock' && effectiveStatus !== 'low') return false;
    if (statusTab === 'Out of Stock' && effectiveStatus !== 'out') return false;

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      const matchName = part.partName.toLowerCase().includes(q);
      const matchNum = part.partNumber.toLowerCase().includes(q);
      const matchHsn = part.hsnCode.toLowerCase().includes(q);
      const matchCat = part.category.toLowerCase().includes(q);
      const matchBrand = part.brand.toLowerCase().includes(q);
      if (!matchName && !matchNum && !matchHsn && !matchCat && !matchBrand) return false;
    }
    return true;
  });

  // Reset pagination to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedBrand, statusTab, searchQuery]);

  // Paginated parts calculation
  const totalItems = filteredParts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const validCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);

  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedParts = filteredParts.slice(startIndex, endIndex);

  // Find the part currently being edited to prefill fields
  const currentEditingPartObj = displayParts.find(p => p.partNumber === editingPart);

  const getDefaultHsnFromSettings = () => {
    try {
      const saved = localStorage.getItem('dms_company_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.defaultHsnCode) return parsed.defaultHsnCode;
      }
    } catch (e) {}
    return '842123';
  };

  const getDefaultGstFromSettings = () => {
    try {
      const saved = localStorage.getItem('dms_company_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.defaultGstPercent) return parsed.defaultGstPercent;
      }
    } catch (e) {}
    return '18%';
  };

  const handleSavePart = () => {
    const nameEl = document.getElementById('add-part-name') as HTMLInputElement;
    const categoryEl = document.getElementById('add-part-category') as HTMLInputElement;
    const brandEl = document.getElementById('add-part-brand') as HTMLInputElement;
    const purchasePriceEl = document.getElementById('add-purchase-price') as HTMLInputElement;
    const salePriceEl = document.getElementById('add-sale-price') as HTMLInputElement;
    const hsnEl = document.getElementById('add-hsn-code') as HTMLInputElement;
    const gstEl = document.getElementById('add-gst-percent') as HTMLSelectElement;
    const stockEl = document.getElementById('add-stock') as HTMLInputElement;

    if (!nameEl?.value) {
      alert('Please enter a Part Name.');
      return;
    }

    const randomNum = `SP-${Math.floor(10000 + Math.random() * 90000)}`;
    const parsedStock = parseInt(stockEl?.value || '0', 10);
    // Low Stock condition: Qty < 12 is Low Stock!
    const stockStatusVal: 'normal' | 'low' | 'out' = parsedStock === 0 ? 'out' : parsedStock < 12 ? 'low' : 'normal';

    const newPart: PartType = {
      partNumber: randomNum,
      partName: nameEl.value,
      category: categoryEl?.value?.trim() || 'Consumables',
      brand: brandEl?.value?.trim() || 'Bosch',
      hsnCode: hsnEl?.value?.trim() || getDefaultHsnFromSettings(),
      gstPercent: gstEl?.value || getDefaultGstFromSettings(),
      purchasePrice: purchasePriceEl?.value ? (purchasePriceEl.value.startsWith('₹') ? purchasePriceEl.value : `₹${purchasePriceEl.value}`) : '₹0.00',
      salePrice: salePriceEl?.value ? (salePriceEl.value.startsWith('₹') ? salePriceEl.value : `₹${salePriceEl.value}`) : '₹0.00',
      stock: parsedStock.toLocaleString(),
      stockStatus: stockStatusVal
    };

    const currentInv = getStoredInventory();
    const updatedInv = [newPart, ...currentInv.filter(p => p.partNumber !== newPart.partNumber)];
    saveStoredInventory(updatedInv);
    setParts(updatedInv);
    setIsAdding(false);

    fetch(`${API_URL}/api/parts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPart)
    })
      .then(res => res.json())
      .then(() => {
        fetchParts();
      })
      .catch(err => {
        console.error('Error saving part to server:', err);
      });
  };

  const handleUpdatePart = () => {
    if (!editingPart) return;

    const nameEl = document.getElementById('edit-part-name') as HTMLInputElement;
    const categoryEl = document.getElementById('edit-part-category') as HTMLInputElement;
    const brandEl = document.getElementById('edit-part-brand') as HTMLInputElement;
    const purchasePriceEl = document.getElementById('edit-purchase-price') as HTMLInputElement;
    const salePriceEl = document.getElementById('edit-sale-price') as HTMLInputElement;
    const hsnEl = document.getElementById('edit-hsn-code') as HTMLInputElement;
    const stockEl = document.getElementById('edit-stock') as HTMLInputElement;

    if (!nameEl?.value) {
      alert('Please enter a Part Name.');
      return;
    }

    const parsedStock = parseInt(stockEl?.value || '0', 10);
    // Low Stock condition: Qty < 12 is Low Stock!
    const stockStatusVal: 'normal' | 'low' | 'out' = parsedStock === 0 ? 'out' : parsedStock < 12 ? 'low' : 'normal';

    const updatedFields = {
      partName: nameEl.value,
      category: categoryEl?.value?.trim() || currentEditingPartObj?.category || 'Consumables',
      brand: brandEl?.value?.trim() || currentEditingPartObj?.brand || 'Bosch',
      hsnCode: hsnEl?.value || '842123',
      purchasePrice: purchasePriceEl?.value ? (purchasePriceEl.value.startsWith('₹') ? purchasePriceEl.value : `₹${purchasePriceEl.value}`) : '₹0.00',
      salePrice: salePriceEl?.value ? (salePriceEl.value.startsWith('₹') ? salePriceEl.value : `₹${salePriceEl.value}`) : '₹0.00',
      stock: parsedStock.toLocaleString(),
      stockStatus: stockStatusVal
    };

    const currentInv = getStoredInventory();
    const updatedInv = currentInv.map(p => p.partNumber === editingPart ? { ...p, ...updatedFields } : p);
    saveStoredInventory(updatedInv);
    setParts(updatedInv);
    setEditingPart(null);

    fetch(`${API_URL}/api/parts/${editingPart}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedFields)
    })
      .then(res => res.json())
      .then(() => {
        fetchParts();
      })
      .catch(err => {
        console.error('Error updating part on server:', err);
      });
  };

  const handleDeletePart = () => {
    if (!editingPart) return;
    if (window.confirm(`Are you sure you want to delete spare part ${editingPart}?`)) {
      const currentInv = getStoredInventory();
      const updatedInv = currentInv.filter(p => p.partNumber !== editingPart);
      saveStoredInventory(updatedInv);
      setParts(updatedInv);
      setEditingPart(null);

      fetch(`${API_URL}/api/parts/${editingPart}`, {
        method: 'DELETE'
      })
        .then(() => {
          fetchParts();
        })
        .catch(err => console.error('Error deleting part on server:', err));
    }
  };

  // partsData removed and connected to DB state

  if (editingPart) {
    return (
      <div className="flex-1 p-6 md:p-8 flex flex-col gap-6 bg-[#f6f8fc] overflow-y-auto box-border max-w-full font-sans relative">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-[13px] text-slate-500 font-semibold mb-1">
          <span className="cursor-pointer hover:text-[#184edb] transition-colors" onClick={() => setEditingPart(null)}>Inventory</span>
          <span>&gt;</span>
          <span className="text-[#184edb] font-bold border-b-2 border-[#184edb] pb-0.5">Edit Spare Part</span>
        </div>

        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-3xl font-bold text-slate-900 m-0 font-heading tracking-tight">
              Edit Spare Part
            </h1>
            <span className="text-slate-500 text-[14.5px] font-medium">
              Update stock information for Part ID: <span className="text-[#184edb] font-bold">{editingPart}</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setEditingPart(null)}
              className="px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-lg text-[13.5px] cursor-pointer transition-colors shadow-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleDeletePart}
              className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-red-50 border border-red-200 text-[#dc2626] font-bold rounded-lg text-[13.5px] cursor-pointer transition-colors shadow-sm"
            >
              <Trash2 size={16} />
              <span>Delete Spare Part</span>
            </button>
            <button
              onClick={handleUpdatePart}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#184edb] hover:bg-[#143eb3] text-white font-bold rounded-lg text-[13.5px] border-none shadow-sm cursor-pointer transition-colors"
            >
              <Save size={16} />
              <span>Update Spare Part</span>
            </button>
          </div>
        </div>

        {/* Form Grid Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start w-full box-border">
          {/* Left Columns (General Info) */}
          <div className="lg:col-span-2 flex flex-col gap-6 w-full">
            {/* General Information Card */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-visible w-full flex flex-col box-border shadow-sm relative z-20">
              <div className="bg-white border-b border-slate-150 px-6 py-4.5 flex items-center gap-2.5 rounded-t-xl">
                <Info size={18} className="text-[#184edb]" />
                <span className="font-bold text-slate-800 text-[14.5px]">General Information</span>
              </div>

              <div className="p-6 flex flex-col gap-5.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5.5">
                  {/* Part Name */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[11.5px] font-bold text-slate-800 uppercase tracking-wider font-sans">Part Name</label>
                    <input
                      type="text"
                      id="edit-part-name"
                      defaultValue={currentEditingPartObj?.partName || 'Brake Pad - Front'}
                      className="w-full px-4 py-2.5 text-[14px] bg-[#f1f4fd] border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:border-[#184edb] transition-colors"
                    />
                  </div>

                  {/* Part Number / SKU */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[11.5px] font-bold text-slate-800 uppercase tracking-wider font-sans">Part Number / SKU</label>
                    <input
                      type="text"
                      id="edit-part-number"
                      value={currentEditingPartObj?.partNumber || 'BP-FR-2024-X'}
                      disabled
                      readOnly
                      className="w-full px-4 py-2.5 text-[14px] bg-[#f1f4fd] border border-slate-200 rounded-lg text-slate-500 font-semibold focus:outline-none"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11.5px] font-bold text-slate-800 uppercase tracking-wider font-sans">Description</label>
                  <textarea
                    rows={4}
                    defaultValue="High-performance ceramic brake pads for luxury sedan models. Enhanced heat dissipation and low-noise operation. Compatible with BMW 3-Series and Audi A4 platforms."
                    className="w-full px-4 py-2.5 text-[14px] bg-[#f1f4fd] border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:border-[#184edb] transition-colors resize-none leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Manufacturer / Brand */}
                  <SearchableDropdownInput
                    id="edit-part-brand"
                    label="Brand / Manufacturer"
                    placeholder="Search or type brand (e.g. Bosch, Castrol)..."
                    defaultValue={currentEditingPartObj?.brand || 'Bosch'}
                    options={brandsList.filter(b => b !== 'All Brands')}
                  />

                  {/* Warranty */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[11.5px] font-bold text-slate-800 uppercase tracking-wider font-sans">Warranty (Months)</label>
                    <input
                      type="text"
                      defaultValue="24"
                      className="w-full px-4 py-2.5 text-[14px] bg-[#f1f4fd] border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:border-[#184edb] transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Stock & Pricing) */}
          <div className="flex flex-col gap-6 w-full">
            {/* Stock & Pricing Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-5 box-border shadow-sm">
              <div className="flex items-center gap-2.5">
                <Warehouse size={18} className="text-[#184edb]" />
                <span className="font-bold text-slate-800 text-[14.5px]">Stock & Pricing</span>
              </div>

              <div className="flex flex-col gap-4.5">
                {/* Purchase Price */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11.5px] font-bold text-slate-800 uppercase tracking-wider font-sans">Purchase Price (₹)</label>
                  <input
                    type="text"
                    id="edit-purchase-price"
                    defaultValue={currentEditingPartObj?.purchasePrice || '₹45.00'}
                    className="w-full px-4 py-2.5 text-[14px] bg-[#f1f4fd] border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:border-[#184edb] transition-colors"
                  />
                </div>

                {/* Selling Price */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11.5px] font-bold text-slate-800 uppercase tracking-wider font-sans">Selling Price (₹)</label>
                  <input
                    type="text"
                    id="edit-sale-price"
                    defaultValue={currentEditingPartObj?.salePrice || '₹89.99'}
                    className="w-full px-4 py-2.5 text-[14px] bg-[#f1f4fd] border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:border-[#184edb] transition-colors"
                  />
                </div>

                {/* Separator line */}
                <div className="h-px bg-slate-200 w-full my-1" />

                {/* Current Inventory row */}
                <div className="flex flex-col gap-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] font-bold text-slate-800 uppercase tracking-wider font-sans">Current Inventory</span>
                    <span className="bg-[#184edb] text-white px-2 py-0.5 rounded text-[10px] font-bold tracking-wide">
                      IN STOCK
                    </span>
                  </div>

                  {/* Grid blocks */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#eef2ff] rounded-xl p-4 flex flex-col items-center justify-center gap-1 min-h-[75px]">
                      <span className="text-2xl font-extrabold text-[#184edb]">142</span>
                      <span className="text-[10px] font-extrabold text-slate-500 tracking-wider">UNITS</span>
                    </div>

                    <div className="bg-[#eef2ff] rounded-xl p-4 flex flex-col items-center justify-center gap-1 min-h-[75px]">
                      <span className="text-2xl font-extrabold text-[#184edb]">A4</span>
                      <span className="text-[10px] font-extrabold text-slate-500 tracking-wider">SHELF LOC</span>
                    </div>
                  </div>
                </div>

                {/* Minimum Alert Threshold */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11.5px] font-bold text-slate-800 uppercase tracking-wider font-sans">Minimum Alert Threshold</label>
                  <input
                    type="text"
                    id="edit-stock"
                    defaultValue={currentEditingPartObj?.stock || '20'}
                    className="w-full px-4 py-2.5 text-[14px] bg-[#f1f4fd] border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:border-[#184edb] transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    );
  }

  if (isAdding) {
    return (
      <div className="flex-1 p-6 md:p-8 flex flex-col gap-6 bg-[#f6f8fc] overflow-y-auto box-border max-w-full font-sans relative">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold text-slate-900 m-0 font-heading tracking-tight">
              Add Spare Part
            </h1>
            <span className="text-slate-500 text-[14px] font-medium">
              Create a new entry in the vehicle component inventory system.
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {}} 
              className="px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-lg text-[13.5px] cursor-pointer transition-colors shadow-sm"
            >
              Reset
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="px-5 py-2.5 bg-white hover:bg-[#f1f4fd] border border-[#184edb] text-[#184edb] font-bold rounded-lg text-[13.5px] cursor-pointer transition-colors shadow-sm"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Form Body Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start w-full box-border">
          {/* Left Column (Forms) */}
          <div className="lg:col-span-2 flex flex-col gap-6 w-full">
            {/* Basic Information Card */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-visible w-full flex flex-col box-border shadow-sm relative z-20">
              <div className="bg-white border-b border-slate-150 px-6 py-4.5 flex items-center gap-2.5 rounded-t-xl">
                <Info size={18} className="text-[#184edb]" />
                <span className="font-bold text-[#184edb] text-[14.5px]">Basic Information</span>
              </div>

              <div className="p-6 flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5.5">
                  {/* Part Number */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[11.5px] font-bold text-slate-800 uppercase tracking-wider">Part Number (Auto-generated)</label>
                    <input
                      type="text"
                      value="AP-PART-2023-0892"
                      disabled
                      readOnly
                      className="w-full px-4 py-2.5 text-[14px] bg-[#f1f4fd] border border-slate-200 rounded-lg text-slate-500 font-semibold focus:outline-none"
                    />
                  </div>

                  {/* Part Name */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[11.5px] font-bold text-slate-800 uppercase tracking-wider">Part Name</label>
                    <input
                      type="text"
                      id="add-part-name"
                      placeholder="e.g. Front Brake Pads"
                      className="w-full px-4 py-2.5 text-[14px] bg-white border border-slate-255 rounded-lg text-slate-850 focus:outline-none focus:border-[#184edb] transition-colors"
                    />
                  </div>

                  {/* Brand */}
                  <SearchableDropdownInput
                    id="add-part-brand"
                    label="Brand / Manufacturer"
                    placeholder="Search or type brand (e.g. Bosch, Castrol, Eicher)..."
                    options={brandsList.filter(b => b !== 'All Brands')}
                  />
                </div>

                {/* Unit of Measurement */}
                <div className="flex flex-col gap-2.5">
                  <span className="text-[11.5px] font-bold text-slate-800 uppercase tracking-wider">Unit of Measurement</span>
                  <div className="grid grid-cols-3 gap-3">
                    {(['Piece', 'Box', 'Set'] as const).map((unit) => (
                      <button
                        key={unit}
                        onClick={() => setUom(unit)}
                        className={`flex items-center justify-center gap-2.5 py-3.5 rounded-lg border cursor-pointer text-[13.5px] font-bold transition-all bg-transparent ${
                          uom === unit
                            ? 'border-[#184edb] text-[#184edb] font-extrabold'
                            : 'border-slate-250 text-slate-600 hover:text-slate-850'
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${uom === unit ? 'border-[#184edb]' : 'border-slate-400'}`}>
                          {uom === unit && <span className="w-1.5 h-1.5 rounded-full bg-[#184edb]" />}
                        </span>
                        <span>{unit}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing & Tax Details Card */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden w-full flex flex-col box-border shadow-sm">
              <div className="bg-white border-b border-slate-150 px-6 py-4.5 flex items-center gap-2.5">
                <Coins size={18} className="text-[#184edb]" />
                <span className="font-bold text-[#184edb] text-[14.5px]">Pricing & Tax Details</span>
              </div>

              <div className="p-6 flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5.5">
                  {/* Purchase Price */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[11.5px] font-bold text-slate-800 uppercase tracking-wider">Purchase Price (₹)</label>
                    <input
                      type="text"
                      id="add-purchase-price"
                      placeholder="0.00"
                      className="w-full px-4 py-2.5 text-[14px] bg-white border border-slate-255 rounded-lg text-slate-850 focus:outline-none focus:border-[#184edb] transition-colors"
                    />
                  </div>

                  {/* Sale Price */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[11.5px] font-bold text-slate-800 uppercase tracking-wider">Sale Price (₹)</label>
                    <input
                      type="text"
                      id="add-sale-price"
                      placeholder="0.00"
                      className="w-full px-4 py-2.5 text-[14px] bg-white border border-slate-255 rounded-lg text-slate-850 focus:outline-none focus:border-[#184edb] transition-colors"
                    />
                  </div>
                </div>

                {/* Profit Margin banner */}
                <div className="bg-[#eef2ff] border border-dashed border-[#184edb]/40 rounded-xl p-4 flex justify-between items-center text-[#184edb] font-bold text-[14.5px]">
                  <span>Estimated Profit Margin:</span>
                  <span className="text-xl font-extrabold">0%</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5.5">
                  {/* HSN Code */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[11.5px] font-bold text-slate-800 uppercase tracking-wider">HSN Code (Editable in Settings only)</label>
                    <input
                      type="text"
                      id="add-hsn-code"
                      value={getDefaultHsnFromSettings()}
                      readOnly
                      disabled
                      className="w-full px-4 py-2.5 text-[14px] bg-[#f1f4fd] border border-slate-200 rounded-lg text-slate-500 font-semibold cursor-not-allowed focus:outline-none"
                    />
                  </div>

                  {/* GST */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[11.5px] font-bold text-slate-800 uppercase tracking-wider">GST (%) (Settings Default)</label>
                    <div className="relative">
                      <select
                        id="add-gst-percent"
                        defaultValue={getDefaultGstFromSettings()}
                        className="w-full appearance-none bg-white border border-slate-255 rounded-lg py-2.5 pl-4 pr-10 text-[14px] text-[#184edb] font-bold cursor-pointer focus:outline-none focus:border-[#184edb] transition-colors"
                      >
                        <option value={getDefaultGstFromSettings()}>{getDefaultGstFromSettings()} (Settings Default)</option>
                        <option value="28%">28%</option>
                        <option value="18%">18%</option>
                        <option value="12%">12%</option>
                        <option value="5%">5%</option>
                        <option value="0%">0%</option>
                      </select>
                      <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#184edb] pointer-events-none">
                        <ChevronDown size={18} />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Inventory Status & Save) */}
          <div className="flex flex-col gap-6 w-full">
            {/* Inventory Status Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-4 box-border shadow-sm">
              <div className="flex items-center gap-2.5">
                <Warehouse size={18} className="text-[#184edb]" />
                <span className="font-bold text-[#184edb] text-[14.5px]">Inventory Status</span>
              </div>

              <div className="flex flex-col gap-4">
                {/* Opening Stock */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11.5px] font-bold text-slate-800 uppercase tracking-wider">Opening Stock</label>
                  <div className="relative">
                    <input
                      type="text"
                      id="add-stock"
                      placeholder="0"
                      className="w-full pl-4 pr-16 py-2.5 text-[14px] bg-white border border-slate-255 rounded-lg text-slate-855 focus:outline-none focus:border-[#184edb] transition-colors font-semibold"
                    />
                    <span className="absolute inset-y-0 right-4 flex items-center text-slate-450 font-bold text-[13.5px]">
                      Units
                    </span>
                  </div>
                </div>

                {/* Minimum Stock Level */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11.5px] font-bold text-slate-800 uppercase tracking-wider">Minimum Stock Level</label>
                  <div className="relative">
                    <input
                      type="text"
                      value="5"
                      readOnly
                      className="w-full pl-4 pr-20 py-2.5 text-[14px] bg-white border border-slate-255 rounded-lg text-slate-850 focus:outline-none focus:border-[#184edb] transition-colors font-semibold"
                    />
                    <span className="absolute inset-y-0 right-4 flex items-center text-rose-600 font-bold text-[13.5px] tracking-wide">
                      Critical
                    </span>
                  </div>
                </div>

                <span className="text-[12px] italic text-slate-400 font-medium leading-relaxed mt-1">
                  System will alert when stock falls below this level.
                </span>
              </div>
            </div>

            {/* Part Preview Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-4 box-border shadow-sm">
              <div className="flex items-center gap-2.5">
                <Image size={18} className="text-[#184edb]" />
                <span className="font-bold text-[#184edb] text-[14.5px]">Part Preview</span>
              </div>

              <div className="border border-dashed border-slate-250 rounded-xl p-6.5 flex flex-col items-center justify-center gap-3 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer min-h-[130px] border-spacing-2">
                <div className="bg-blue-50 text-[#184edb] p-3 rounded-lg flex items-center justify-center border border-blue-100 shadow-sm">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" /><path d="M12 12v9" /><path d="m8 16 4-4 4 4" /></svg>
                </div>
                <span className="text-[13px] text-slate-550 font-bold text-center">
                  Click to upload high-res image
                </span>
              </div>
            </div>

            {/* Save Actions Panel */}
            <div className="bg-[#184edb] rounded-xl p-5 flex flex-col gap-3.5 box-border shadow-md">
              <button
                onClick={handleSavePart}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-white hover:bg-slate-50 text-[#184edb] font-bold rounded-lg text-[14px] cursor-pointer transition-colors border-none shadow-sm"
              >
                <Save size={16} />
                <span>Save Changes</span>
              </button>
              <button
                onClick={handleSavePart}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-[#113bb3] hover:bg-[#0c2a80] text-white font-bold rounded-lg text-[14px] cursor-pointer transition-colors border-none"
              >
                <PlusCircle size={16} />
                <span>Save & Add New</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col box-border max-w-full">
      {/* Sub-tab Switcher Header Row */}
      <div className="bg-white border-b border-slate-200 px-8 py-3.5 flex justify-end items-center gap-6 shadow-sm w-full box-border">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveSubTab('history')}
            className={`pb-1.5 text-[14px] font-bold border-none bg-transparent cursor-pointer transition-all ${
              activeSubTab === 'history'
                ? 'text-[#184edb] border-b-2 border-solid border-[#184edb] font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Stock History
          </button>
          <button
            onClick={() => setActiveSubTab('live')}
            className={`pb-1.5 text-[14px] font-bold border-none bg-transparent cursor-pointer transition-all ${
              activeSubTab === 'live'
                ? 'text-[#184edb] border-b-2 border-solid border-[#184edb] font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Live Inventory
          </button>
        </div>
      </div>

      {activeSubTab === 'history' ? (
        <div className="flex-1 p-6 md:p-8 flex flex-col gap-6 bg-[#f6f8fc] overflow-y-auto box-border max-w-full font-sans text-left">
          {/* Header Block */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-bold text-slate-900 m-0 font-heading tracking-tight animate-in fade-in slide-in-from-top-3 duration-300">
                Inventory History & Timeline
              </h1>
              <span className="text-slate-500 text-[14px] font-medium">
                Trace every part movement, purchase, sale, and stock adjustment across your enterprise.
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const headers = ['Date', 'Time', 'Part Name', 'Part Number', 'Type', 'Qty In', 'Qty Out', 'Balance', 'Reference', 'Updated By', 'Department'];
                  const rows = transactionsList.map(t => [
                    `"${t.date || ''}"`,
                    `"${t.time || ''}"`,
                    `"${(t.partName || t.name || '').replace(/"/g, '""')}"`,
                    `"${(t.partNumber || t.code || '').replace(/"/g, '""')}"`,
                    `"${t.type || ''}"`,
                    `"${t.qtyIn || (t.quantity?.includes('+') ? t.quantity : '-')}"`,
                    `"${t.qtyOut || (t.quantity?.includes('-') ? t.quantity : '-')}"`,
                    `"${t.balance ?? '-'}"`,
                    `"${t.reference || t.refNo || ''}"`,
                    `"${t.updatedBy || t.user || ''}"`,
                    `"${t.department || ''}"`
                  ]);
                  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
                  const encodedUri = encodeURI(csvContent);
                  const link = document.createElement('a');
                  link.setAttribute('href', encodedUri);
                  link.setAttribute('download', `inventory_history_report_${new Date().toISOString().slice(0, 10)}.csv`);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#184edb] hover:bg-[#143eb3] text-white font-bold rounded-lg text-[13.5px] border-none shadow-sm cursor-pointer transition-colors"
              >
                <Download size={15} />
                <span>Export Report</span>
              </button>

              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-lg text-[13.5px] cursor-pointer transition-colors shadow-sm"
              >
                <Printer size={15} className="text-slate-500" />
                <span>Print Log</span>
              </button>
            </div>
          </div>

          {/* Filters Block */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            {/* Date Range */}
            <div className="bg-white rounded-xl border border-slate-200 p-4.5 shadow-sm flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date Range</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. Jul 01"
                  value={histFromDate}
                  onChange={(e) => { setHistFromDate(e.target.value); setHistPage(1); }}
                  className="w-full px-3 py-2.5 text-[13.5px] bg-[#f1f4fd] border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:border-[#184edb]"
                />
                <span className="text-slate-400 font-bold text-[13px]">to</span>
                <input
                  type="text"
                  placeholder="e.g. Jul 30"
                  value={histToDate}
                  onChange={(e) => { setHistToDate(e.target.value); setHistPage(1); }}
                  className="w-full px-3 py-2.5 text-[13.5px] bg-[#f1f4fd] border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:border-[#184edb]"
                />
              </div>
            </div>

            {/* Transaction Type */}
            <div className="bg-white rounded-xl border border-slate-200 p-4.5 shadow-sm flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Transaction Type</label>
              <div className="relative">
                <select
                  value={histType}
                  onChange={(e) => { setHistType(e.target.value); setHistPage(1); }}
                  className="w-full appearance-none bg-[#f1f4fd] border border-slate-200 rounded-lg py-2.5 pl-4 pr-10 text-[13.5px] text-slate-700 font-bold cursor-pointer focus:outline-none focus:border-[#184edb]"
                >
                  <option value="All Types">All Types</option>
                  <option value="SALE">SALE / Outward</option>
                  <option value="PURCHASE">PURCHASE / Inward</option>
                  <option value="ADJUSTMENT">ADJUSTMENT</option>
                  <option value="RETURN">RETURN</option>
                  <option value="JOB CARD">JOB CARD</option>
                </select>
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 pointer-events-none">
                  <ChevronDown size={16} />
                </span>
              </div>
            </div>

            {/* Category */}
            <div className="bg-white rounded-xl border border-slate-200 p-4.5 shadow-sm flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Category</label>
              <div className="relative">
                <select
                  value={histCategory}
                  onChange={(e) => { setHistCategory(e.target.value); setHistPage(1); }}
                  className="w-full appearance-none bg-[#f1f4fd] border border-slate-200 rounded-lg py-2.5 pl-4 pr-10 text-[13.5px] text-slate-700 font-bold cursor-pointer focus:outline-none focus:border-[#184edb]"
                >
                  <option value="All Categories">All Categories</option>
                  {Array.from(new Set([...parts.map(p => p.category), ...transactionsList.map(t => t.category)].filter(Boolean))).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 pointer-events-none">
                  <ChevronDown size={16} />
                </span>
              </div>
            </div>

            {/* Part Search */}
            <div className="bg-white rounded-xl border border-slate-200 p-4.5 shadow-sm flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Part Search</label>
              <div className="relative">
                <input
                  type="text"
                  value={histSearch}
                  onChange={(e) => { setHistSearch(e.target.value); setHistPage(1); }}
                  placeholder="Enter part name, SKU, or ref..."
                  className="w-full pl-9 pr-4 py-2.5 text-[13.5px] bg-[#f1f4fd] border border-slate-200 rounded-lg text-slate-850 focus:outline-none font-semibold focus:border-[#184edb]"
                />
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Search size={15} />
                </span>
              </div>
            </div>
          </div>

          {/* Dynamic Timeline History Table */}
          {(() => {
            const filtered = transactionsList.filter(t => {
              // Type filter
              if (histType !== 'All Types') {
                const tType = (t.type || '').toUpperCase();
                if (!tType.includes(histType.toUpperCase())) return false;
              }
              // Category filter
              if (histCategory !== 'All Categories') {
                if ((t.category || '').toLowerCase() !== histCategory.toLowerCase()) return false;
              }
              // Date Filter
              if (histFromDate.trim()) {
                if (!(t.date || '').toLowerCase().includes(histFromDate.toLowerCase().trim())) return false;
              }
              if (histToDate.trim()) {
                if (!(t.date || '').toLowerCase().includes(histToDate.toLowerCase().trim())) return false;
              }
              // Search filter
              if (histSearch.trim()) {
                const q = histSearch.toLowerCase().trim();
                const matchName = (t.partName || t.name || '').toLowerCase().includes(q);
                const matchNo = (t.partNumber || t.code || '').toLowerCase().includes(q);
                const matchRef = (t.reference || t.refNo || '').toLowerCase().includes(q);
                const matchUser = (t.updatedBy || t.user || '').toLowerCase().includes(q);
                const matchDept = (t.department || '').toLowerCase().includes(q);
                if (!matchName && !matchNo && !matchRef && !matchUser && !matchDept) return false;
              }
              return true;
            });

            const totalHistPages = Math.max(1, Math.ceil(filtered.length / histItemsPerPage));
            const safeHistPage = Math.min(histPage, totalHistPages);
            const startIndex = (safeHistPage - 1) * histItemsPerPage;
            const paginatedHistory = filtered.slice(startIndex, startIndex + histItemsPerPage);

            return (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden w-full flex flex-col box-border shadow-sm">
                <div className="overflow-x-auto w-full">
                  <table className="w-full border-collapse text-left text-slate-655">
                    <thead>
                      <tr className="bg-[#f8fafc] border-b border-slate-200 text-[11.5px] font-bold text-slate-800 uppercase tracking-wider">
                        <th className="py-4.5 px-6 select-none font-bold">DATE & TIME</th>
                        <th className="py-4.5 px-5 select-none font-bold">PART DETAIL</th>
                        <th className="py-4.5 px-5 select-none font-bold">TYPE</th>
                        <th className="py-4.5 px-5 select-none font-bold text-center">QTY IN</th>
                        <th className="py-4.5 px-5 select-none font-bold text-center">QTY OUT</th>
                        <th className="py-4.5 px-5 select-none font-bold text-center">BALANCE</th>
                        <th className="py-4.5 px-5 select-none font-bold">REFERENCE</th>
                        <th className="py-4.5 px-6 select-none font-bold">UPDATED BY</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[14px]">
                      {filtered.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-slate-400 font-semibold bg-white">
                            No inventory history records found matching your filters.
                          </td>
                        </tr>
                      ) : (
                        paginatedHistory.map((t, idx) => {
                          const isOutward = (t.type || '').toUpperCase().includes('SALE') || 
                                            (t.type || '').toUpperCase().includes('OUT') || 
                                            (t.type || '').toUpperCase().includes('JOB');
                          const isInward = (t.type || '').toUpperCase().includes('PURCHASE') || 
                                           (t.type || '').toUpperCase().includes('IN');
                          const isReturn = (t.type || '').toUpperCase().includes('RETURN');
                          const isAdj = (t.type || '').toUpperCase().includes('ADJUST');

                          const badgeClass = isOutward
                            ? 'bg-red-50 text-red-600 border border-red-100'
                            : isInward
                            ? 'bg-blue-50 text-blue-600 border border-blue-100'
                            : isReturn
                            ? 'bg-amber-50 text-amber-600 border border-amber-100'
                            : isAdj
                            ? 'bg-purple-50 text-purple-600 border border-purple-100'
                            : 'bg-emerald-50 text-emerald-600 border border-emerald-100';

                          const qtyInVal = t.qtyIn !== undefined && t.qtyIn !== '-' ? t.qtyIn : (isInward || isReturn ? (t.quantity || 1) : '-');
                          const qtyOutVal = t.qtyOut !== undefined && t.qtyOut !== '-' ? t.qtyOut : (isOutward ? (t.quantity || 1) : '-');

                          return (
                            <tr key={t.id || idx} className="hover:bg-slate-50/60 transition-colors">
                              {/* Date & Time */}
                              <td className="py-4.5 px-6 whitespace-nowrap text-slate-700">
                                <div className="flex flex-col gap-0.5">
                                  <span className="font-bold text-slate-800">{t.date || 'Today'}</span>
                                  <span className="text-[12px] text-slate-400 font-bold">{t.time || '09:00 AM'}</span>
                                </div>
                              </td>

                              {/* Part Detail */}
                              <td className="py-4.5 px-5 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                  <div className="bg-blue-50 text-[#184edb] p-2.5 rounded-lg border border-blue-100">
                                    {isOutward ? <Car size={16} /> : <Package size={16} />}
                                  </div>
                                  <div className="flex flex-col gap-0.5">
                                    <span className="font-bold text-slate-805">{t.partName || t.name}</span>
                                    <span className="text-[11.5px] text-slate-400 font-bold">SKU: {t.partNumber || t.code || 'SP-PART'}</span>
                                  </div>
                                </div>
                              </td>

                              {/* Type */}
                              <td className="py-4.5 px-5 whitespace-nowrap">
                                <span className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-wide ${badgeClass}`}>
                                  {t.type || 'MOVEMENT'}
                                </span>
                              </td>

                              {/* Qty In */}
                              <td className="py-4.5 px-5 whitespace-nowrap text-center">
                                {qtyInVal !== '-' ? (
                                  <span className="text-blue-650 font-bold">{qtyInVal}</span>
                                ) : (
                                  <span className="text-slate-400 font-medium">-</span>
                                )}
                              </td>

                              {/* Qty Out */}
                              <td className="py-4.5 px-5 whitespace-nowrap text-center">
                                {qtyOutVal !== '-' ? (
                                  <span className="text-red-600 font-bold">{qtyOutVal}</span>
                                ) : (
                                  <span className="text-slate-400 font-medium">-</span>
                                )}
                              </td>

                              {/* Balance */}
                              <td className="py-4.5 px-5 whitespace-nowrap text-center text-slate-800 font-bold">
                                {t.balance !== undefined ? t.balance : 'In Stock'}
                              </td>

                              {/* Reference */}
                              <td className="py-4.5 px-5 whitespace-nowrap font-bold text-[#184edb]">
                                {t.reference || t.refNo || t.ref || '#REF-101'}
                              </td>

                              {/* Updated By */}
                              <td className="py-4.5 px-6 whitespace-nowrap">
                                <div className="flex flex-col gap-0.5">
                                  <span className="font-bold text-slate-800">{t.updatedBy || t.user || 'Store Manager'}</span>
                                  <span className="text-[11.5px] text-slate-400 font-bold uppercase tracking-wider">
                                    {t.department || 'STOREFRONT'}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer Pagination */}
                <div className="bg-[#f8fafc] border-t border-slate-150 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 w-full box-border">
                  <span className="text-[13px] text-slate-500 font-semibold">
                    Showing {filtered.length === 0 ? 0 : startIndex + 1}-{Math.min(startIndex + histItemsPerPage, filtered.length)} of {filtered.length} entries
                  </span>

                  {totalHistPages > 1 && (
                    <div className="flex items-center gap-1.5">
                      <button
                        disabled={safeHistPage === 1}
                        onClick={() => setHistPage(p => Math.max(1, p - 1))}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white ${
                          safeHistPage === 1 ? 'opacity-50 cursor-not-allowed text-slate-300' : 'hover:bg-slate-50 text-slate-600 cursor-pointer'
                        }`}
                      >
                        <ChevronLeft size={16} />
                      </button>

                      {Array.from({ length: totalHistPages }, (_, i) => i + 1).map(pg => (
                        <button
                          key={pg}
                          onClick={() => setHistPage(pg)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[13.5px] border cursor-pointer transition-colors ${
                            pg === safeHistPage
                              ? 'bg-[#184edb] text-white border-[#184edb] shadow-sm'
                              : 'bg-white text-slate-650 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {pg}
                        </button>
                      ))}

                      <button
                        disabled={safeHistPage === totalHistPages}
                        onClick={() => setHistPage(p => Math.min(totalHistPages, p + 1))}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white ${
                          safeHistPage === totalHistPages ? 'opacity-50 cursor-not-allowed text-slate-300' : 'hover:bg-slate-50 text-slate-600 cursor-pointer'
                        }`}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Bottom Row Blocks */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full items-stretch">
            {/* Stock Turn Intensity Chart */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5.5 flex flex-col gap-6 box-border shadow-sm justify-between">
              <div className="flex justify-between items-center w-full">
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-slate-800 text-[15px]">Stock Turn Intensity</span>
                  <span className="text-[12.5px] text-slate-450 font-medium">Real-time velocity of inventory movement across categories.</span>
                </div>
                <span className="bg-[#eef2ff] text-[#184edb] px-3 py-1 rounded-md text-[11px] font-extrabold tracking-wide">
                  Live Updates
                </span>
              </div>

              {/* Custom high fidelity Bar Chart representation */}
              <div className="flex items-end justify-between px-6 pt-4 h-[120px] w-full box-border relative">
                {/* Mon */}
                <div className="flex flex-col items-center gap-2.5 w-12">
                  <div className="bg-slate-100 rounded-t-md w-full h-[30px]" />
                  <span className="text-[11.5px] font-bold text-slate-400">MON</span>
                </div>

                {/* Tue */}
                <div className="flex flex-col items-center gap-2.5 w-12">
                  <div className="bg-slate-100 rounded-t-md w-full h-[55px]" />
                  <span className="text-[11.5px] font-bold text-slate-400">TUE</span>
                </div>

                {/* Wed */}
                <div className="flex flex-col items-center gap-2.5 w-12">
                  <div className="bg-slate-100 rounded-t-md w-full h-[85px]" />
                  <span className="text-[11.5px] font-bold text-slate-400">WED</span>
                </div>

                {/* Thu */}
                <div className="flex flex-col items-center gap-2.5 w-12 relative">
                  <span className="absolute -top-6 text-[11.5px] font-extrabold text-[#184edb]">THU</span>
                  <div className="bg-[#184edb] rounded-t-md w-full h-[110px] shadow-sm" />
                  <span className="text-[11.5px] font-extrabold text-[#184edb]">THU</span>
                </div>

                {/* Fri */}
                <div className="flex flex-col items-center gap-2.5 w-12">
                  <div className="bg-slate-100 rounded-t-md w-full h-[70px]" />
                  <span className="text-[11.5px] font-bold text-slate-400">FRI</span>
                </div>
              </div>
            </div>

            {/* Inventory Value Blue Card */}
            <div className="bg-[#184edb] rounded-xl p-6.5 text-white flex flex-col justify-between box-border relative overflow-hidden shadow-md min-h-[220px]">
              {/* Plus absolute button */}
              <button className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#113bb3] hover:bg-[#0c2a80] border-none text-white flex items-center justify-center cursor-pointer transition-colors shadow-sm font-bold text-[18px]">
                +
              </button>

              <div className="flex flex-col gap-1 pr-6">
                <span className="font-extrabold text-white text-[15px] tracking-wide">Inventory Value</span>
                <span className="text-[12.5px] text-blue-200 font-medium">Total current asset worth in warehouses.</span>
              </div>

              <div className="flex flex-col gap-4 mt-6">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-extrabold text-blue-200 uppercase tracking-widest">CURRENT BALANCE</span>
                  <span className="text-[32px] font-extrabold text-white tracking-tight">₹1,245,800.00</span>
                </div>

                {/* Overlapping Avatars and footer text */}
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <div className="w-6.5 h-6.5 rounded-full border-2 border-solid border-[#184edb] bg-slate-350 flex items-center justify-center text-[10px] font-bold overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="avatar" className="w-full h-full object-cover" />
                    </div>
                    <div className="w-6.5 h-6.5 rounded-full border-2 border-solid border-[#184edb] bg-slate-350 flex items-center justify-center text-[10px] font-bold overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" alt="avatar" className="w-full h-full object-cover" />
                    </div>
                    <div className="w-6.5 h-6.5 rounded-full border-2 border-solid border-[#184edb] bg-[#113bb3] flex items-center justify-center text-[9px] font-extrabold text-white">
                      +4
                    </div>
                  </div>
                  <span className="text-[12px] text-blue-100 font-semibold">
                    Managers active now
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 p-6 md:p-8 flex flex-col gap-6 bg-[#f6f8fc] overflow-y-auto box-border max-w-full font-sans relative">
          {/* KPI Cards Row (All Cards Fully Interactive) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 w-full">
            {/* 1. Total Spare Parts */}
            <div
              onClick={() => {
                setStatusTab('All');
                setSelectedCategory('All Categories');
                setSelectedBrand('All Brands');
                setActiveKpiFilter('total');
              }}
              className={`bg-white rounded-xl p-4 shadow-sm border flex items-center justify-between min-h-[90px] box-border relative cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98] ${
                activeKpiFilter === 'total' || (statusTab === 'All' && selectedCategory === 'All Categories' && selectedBrand === 'All Brands')
                  ? 'border-[#184edb] ring-2 ring-blue-500/20 bg-blue-50/10'
                  : 'border-slate-200 hover:border-blue-300'
              }`}
              title="Click to view all spare parts & stock quantities"
            >
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 text-[#184edb] p-2.5 rounded-lg flex items-center justify-center border border-blue-100">
                  <Package size={18} />
                </div>
                <div className="flex flex-col gap-0.5 text-left">
                  <span className="text-slate-500 text-[12px] font-bold">Total Spare Parts</span>
                  <span className="text-xl font-bold text-slate-800 tracking-tight">{parts.length.toLocaleString()}</span>
                </div>
              </div>
              <span className="absolute top-3 right-3 text-emerald-600 text-[10.5px] font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                Live
              </span>
            </div>

            {/* 3. Low Stock Items */}
            <div
              onClick={() => {
                setStatusTab('Low Stock');
                setActiveKpiFilter('low');
              }}
              className={`bg-white rounded-xl p-4 shadow-sm border flex items-center justify-between min-h-[90px] box-border cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98] ${
                statusTab === 'Low Stock'
                  ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20'
                  : 'border-slate-200 hover:border-amber-400'
              }`}
              title="Click to filter Low Stock items & quantities"
            >
              <div className="flex items-center gap-3">
                <div className="bg-amber-50 text-amber-600 p-2.5 rounded-lg flex items-center justify-center border border-amber-100">
                  <AlertTriangle size={18} />
                </div>
                <div className="flex flex-col gap-0.5 text-left">
                  <span className="text-slate-500 text-[12px] font-bold">Low Stock Items</span>
                  <span className="text-xl font-bold text-amber-500 tracking-tight">{parts.filter(p => p.stockStatus === 'low').length}</span>
                </div>
              </div>
            </div>

            {/* 4. Out of Stock */}
            <div
              onClick={() => {
                setStatusTab('Out of Stock');
                setActiveKpiFilter('out');
              }}
              className={`bg-white rounded-xl p-4 shadow-sm border flex items-center justify-between min-h-[90px] box-border cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98] ${
                statusTab === 'Out of Stock'
                  ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20'
                  : 'border-slate-200 hover:border-rose-400'
              }`}
              title="Click to filter Out of Stock items"
            >
              <div className="flex items-center gap-3">
                <div className="bg-rose-50 text-rose-600 p-2.5 rounded-lg flex items-center justify-center border border-rose-100">
                  <CircleAlert size={18} />
                </div>
                <div className="flex flex-col gap-0.5 text-left">
                  <span className="text-slate-500 text-[12px] font-bold">Out of Stock</span>
                  <span className="text-xl font-bold text-rose-600 tracking-tight">{parts.filter(p => p.stockStatus === 'out').length}</span>
                </div>
              </div>
            </div>

            {/* 5. Inventory Value */}
            <div
              onClick={() => setShowValuationModal(true)}
              className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:border-emerald-400 flex items-center justify-between min-h-[90px] box-border cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98] group"
              title="Click to view Inventory Valuation breakdown"
            >
              <div className="flex items-center gap-3">
                <div className="bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white p-2.5 rounded-lg flex items-center justify-center border border-emerald-100 transition-colors">
                  <CircleDollarSign size={18} />
                </div>
                <div className="flex flex-col gap-0.5 text-left">
                  <span className="text-slate-500 text-[12px] font-bold group-hover:text-emerald-600 transition-colors">Inventory Value</span>
                  <span className="text-xl font-bold text-slate-800 tracking-tight">
                    {(() => {
                      const totalVal = parts.reduce((acc, p) => {
                        const qty = parseInt(p.stock.replace(/[^0-9]/g, ''), 10) || 0;
                        const price = parseFloat(p.purchasePrice.replace(/[^0-9.]/g, '')) || 0;
                        return acc + (qty * price);
                      }, 0);
                      if (totalVal >= 100000) return `₹${(totalVal / 100000).toFixed(1)}L`;
                      if (totalVal >= 1000) return `₹${(totalVal / 1000).toFixed(1)}k`;
                      return `₹${totalVal.toLocaleString('en-IN')}`;
                    })()}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Asset</span>
            </div>

            {/* 6. Today's Txns */}
            <div
              onClick={() => setShowTxnsModal(true)}
              className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:border-blue-400 flex items-center justify-between min-h-[90px] box-border cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98] group"
              title="Click to view Today's Stock Transactions"
            >
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 text-[#184edb] group-hover:bg-[#184edb] group-hover:text-white p-2.5 rounded-lg flex items-center justify-center border border-blue-100 transition-colors">
                  <Receipt size={18} />
                </div>
                <div className="flex flex-col gap-0.5 text-left">
                  <span className="text-slate-500 text-[12px] font-bold group-hover:text-[#184edb] transition-colors">Today's Txns</span>
                  <span className="text-xl font-bold text-slate-800 tracking-tight">{transactionsList.length}</span>
                </div>
              </div>
              <span className="text-[10px] font-extrabold text-[#184edb] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{transactionsList.length} Today</span>
            </div>
          </div>

          {/* Filter & Search Options Panel Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-4.5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 box-border shadow-sm">
            <div className="flex flex-wrap items-center gap-3.5 flex-1">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[260px] max-w-md">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Part Name, SKU, HSN, Category..."
                  className="w-full pl-9 pr-8 py-2 text-[13.5px] bg-[#f8fafc] hover:bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:border-[#184edb] focus:bg-white transition-all shadow-inner"
                />
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                  <Search size={15} />
                </span>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Brands Selector */}
              <div className="relative">
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="appearance-none bg-[#f1f4fd] hover:bg-[#e8eeff] border border-slate-200 rounded-lg py-2 pl-4 pr-10 text-[13.5px] text-slate-700 font-bold cursor-pointer focus:outline-none transition-colors"
                >
                  {brandsList.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
                <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-550 pointer-events-none">
                  <ChevronDown size={16} />
                </span>
              </div>

              {/* Bordered View Tabs */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-0.5 flex gap-0.5">
                {(['All', 'In Stock', 'Low Stock', 'Out of Stock'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setStatusTab(tab);
                      setActiveKpiFilter(tab === 'Low Stock' ? 'low' : tab === 'Out of Stock' ? 'out' : 'total');
                    }}
                    className={`px-3 py-1.5 rounded-md text-[13px] font-bold border-none cursor-pointer transition-all ${
                      statusTab === tab
                        ? 'bg-[#184edb] text-white shadow-sm'
                        : 'bg-transparent text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Active Filter Indicator / Reset Button */}
              {(selectedCategory !== 'All Categories' || selectedBrand !== 'All Brands' || statusTab !== 'All' || searchQuery.trim() !== '') && (
                <button
                  onClick={() => {
                    setSelectedCategory('All Categories');
                    setSelectedBrand('All Brands');
                    setStatusTab('All');
                    setSearchQuery('');
                    setActiveKpiFilter('total');
                  }}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg border border-rose-200 cursor-pointer flex items-center gap-1 transition-colors shadow-sm"
                >
                  <X size={13} />
                  <span>Reset All Filters</span>
                </button>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => window.print()}
                className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-750 font-bold rounded-lg text-[13.5px] cursor-pointer transition-colors shadow-sm"
              >
                <Printer size={15} className="text-slate-500" />
                <span>Print</span>
              </button>
              <button className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-755 font-bold rounded-lg text-[13.5px] cursor-pointer transition-colors shadow-sm">
                <FileText size={15} className="text-slate-500" />
                <span>Export Excel</span>
              </button>
              <button
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#184edb] hover:bg-[#143eb3] text-white font-bold rounded-lg text-[13.5px] border-none shadow-sm cursor-pointer transition-colors"
              >
                <Plus size={16} />
                <span>Add Spare Part</span>
              </button>
            </div>
          </div>

          {/* Active Search & Filter Banner */}
          {(statusTab !== 'All' || selectedCategory !== 'All Categories' || selectedBrand !== 'All Brands' || searchQuery.trim() !== '') && (
            <div className="bg-blue-50/80 border border-blue-200 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-[#184edb] font-semibold">
              <div className="flex items-center gap-2">
                <Info size={15} />
                <span>
                  Filtering stock list by: {searchQuery && <span>Search: <strong>"{searchQuery}"</strong> • </span>}
                  {selectedCategory !== 'All Categories' && <span>Category: <strong>"{selectedCategory}"</strong> • </span>}
                  {selectedBrand !== 'All Brands' && <span>Brand: <strong>"{selectedBrand}"</strong> • </span>}
                  {statusTab !== 'All' && <span>Status: <strong>"{statusTab}"</strong> • </span>}
                  Showing <strong>{filteredParts.length}</strong> matching spare parts.
                </span>
              </div>
              <button
                onClick={() => {
                  setSelectedCategory('All Categories');
                  setSelectedBrand('All Brands');
                  setStatusTab('All');
                  setSearchQuery('');
                }}
                className="text-xs font-extrabold text-[#184edb] hover:underline bg-transparent border-none cursor-pointer"
              >
                Clear Search & Filters
              </button>
            </div>
          )}

          {/* Spare Parts Inventory Table Card */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden w-full flex flex-col box-border">
            {/* Table */}
            <div className="overflow-x-auto w-full">
              <table className="w-full border-collapse text-left text-slate-650">
                <thead>
                  <tr className="bg-[#f8fafc] border-b border-slate-200 text-[11.5px] font-bold text-slate-800 uppercase tracking-wider">
                    <th className="py-4.5 px-6 select-none font-bold">PART NUMBER</th>
                    <th className="py-4.5 px-5 select-none font-bold">PART NAME</th>
                    <th className="py-4.5 px-5 select-none font-bold">BRAND</th>
                    <th className="py-4.5 px-5 select-none font-bold">HSN CODE</th>
                    <th className="py-4.5 px-5 select-none font-bold">GST %</th>
                    <th className="py-4.5 px-5 select-none font-bold">PURCHASE PRICE</th>
                    <th className="py-4.5 px-5 select-none font-bold">SALE PRICE</th>
                    <th className="py-4.5 px-6 select-none font-bold">STOCK</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[14px]">
                  {paginatedParts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400 font-semibold bg-white">
                        No spare parts found matching the selected status or brand filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedParts.map((part) => {
                      const effectiveStatus = getDerivedStatus(part);
                      return (
                        <tr key={part.partNumber} className="hover:bg-slate-50/50 transition-colors">
                          {/* Part Number */}
                          <td
                            onClick={() => setEditingPart(part.partNumber)}
                            className="py-4.5 px-6 font-bold text-[#184edb] whitespace-nowrap cursor-pointer hover:underline"
                          >
                            {part.partNumber}
                          </td>

                          {/* Part Name */}
                          <td className="py-4.5 px-5 text-slate-850 font-bold whitespace-nowrap">
                            {part.partName}
                          </td>

                          {/* Brand */}
                          <td className="py-4.5 px-5 text-slate-700 font-medium whitespace-nowrap">
                            {part.brand}
                          </td>

                          {/* HSN Code */}
                          <td className="py-4.5 px-5 text-slate-600 font-medium whitespace-nowrap">
                            {part.hsnCode}
                          </td>

                          {/* GST % */}
                          <td className="py-4.5 px-5 text-slate-600 font-medium whitespace-nowrap">
                            {part.gstPercent}
                          </td>

                          {/* Purchase Price */}
                          <td className="py-4.5 px-5 text-slate-600 font-medium whitespace-nowrap">
                            {part.purchasePrice}
                          </td>

                          {/* Sale Price */}
                          <td className="py-4.5 px-5 text-slate-800 font-bold whitespace-nowrap">
                            {part.salePrice}
                          </td>

                          {/* Stock Quantity & Badge (Qty < 12 is Low Stock) */}
                          <td className="py-4.5 px-6 whitespace-nowrap">
                            <span
                              className={`font-extrabold text-[13.5px] px-3 py-1 rounded-md inline-flex items-center gap-1.5 ${
                                effectiveStatus === 'low'
                                  ? 'bg-amber-50 text-amber-600 border border-amber-200'
                                  : effectiveStatus === 'out'
                                  ? 'bg-rose-50 text-rose-600 border border-rose-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {part.stock} Units {effectiveStatus === 'low' ? '(Low Stock)' : effectiveStatus === 'out' ? '(Out of Stock)' : ''}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer with Working Dynamic Pagination (Page 1, 2, 3, 4, 5...) */}
            <div className="bg-[#f8fafc] border-t border-slate-150 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 w-full box-border">
              <span className="text-[13px] text-slate-500 font-semibold">
                Showing {totalItems > 0 ? startIndex + 1 : 0} - {endIndex} of {totalItems} items (Page {validCurrentPage} of {totalPages})
              </span>

              <div className="flex items-center gap-1.5">
                {/* Previous Page */}
                <button
                  disabled={validCurrentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-colors ${
                    validCurrentPage === 1
                      ? 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 cursor-pointer'
                  }`}
                  title="Previous Page"
                >
                  <ChevronLeft size={16} />
                </button>

                {/* Dynamic Page Buttons */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[13.5px] border transition-all ${
                      validCurrentPage === pageNum
                        ? 'bg-[#184edb] text-white border-[#184edb] shadow-sm'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 cursor-pointer'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                {/* Next Page */}
                <button
                  disabled={validCurrentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-colors ${
                    validCurrentPage === totalPages
                      ? 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 cursor-pointer'
                  }`}
                  title="Next Page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auto-Suggestion Datalists for Category & Brand */}
      <datalist id="category-suggestions">
        {categoriesList.filter(c => c !== 'All Categories').map((cat) => (
          <option key={cat} value={cat} />
        ))}
      </datalist>

      <datalist id="brand-suggestions">
        {brandsList.filter(b => b !== 'All Brands').map((b) => (
          <option key={b} value={b} />
        ))}
      </datalist>

      {/* 1. CATEGORIES BREAKDOWN MODAL */}
      {showCategoriesModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[85vh] flex flex-col">
            <div className="px-6 py-4 bg-[#184edb] text-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <Layers size={22} />
                <div>
                  <span className="font-extrabold text-[17px] block">Total Categories Breakdown (84 Categories)</span>
                  <span className="text-xs text-blue-100 font-medium">Spare parts count and total quantity stored by category</span>
                </div>
              </div>
              <button
                onClick={() => setShowCategoriesModal(false)}
                className="text-white/80 hover:text-white border-none bg-transparent cursor-pointer p-1.5 rounded-lg hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: 'Consumables', count: 1420, totalQty: '8,450 Units', totalVal: '₹1,85,900', color: 'bg-blue-50 text-blue-600 border-blue-100' },
                  { name: 'Brake System', count: 980, totalQty: '4,210 Units', totalVal: '₹2,14,500', color: 'bg-rose-50 text-rose-600 border-rose-100' },
                  { name: 'Electrical', count: 1250, totalQty: '5,100 Units', totalVal: '₹1,45,000', color: 'bg-amber-50 text-amber-600 border-amber-100' },
                  { name: 'Engine Components', count: 860, totalQty: '1,980 Units', totalVal: '₹4,12,000', color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
                  { name: 'Lubricants & Fluids', count: 640, totalQty: '6,200 Units', totalVal: '₹1,28,400', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
                  { name: 'Suspension & Steering', count: 720, totalQty: '2,450 Units', totalVal: '₹1,95,000', color: 'bg-purple-50 text-purple-600 border-purple-100' },
                  { name: 'Transmission & Clutch', count: 510, totalQty: '1,120 Units', totalVal: '₹2,85,000', color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
                  { name: 'Accessories & Fittings', count: 1100, totalQty: '4,800 Units', totalVal: '₹76,400', color: 'bg-slate-100 text-slate-700 border-slate-200' }
                ].map((cat) => (
                  <div
                    key={cat.name}
                    onClick={() => {
                      setSelectedCategory(cat.name);
                      setShowCategoriesModal(false);
                    }}
                    className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 hover:bg-white hover:border-[#184edb] hover:shadow-md cursor-pointer transition-all flex flex-col justify-between gap-3 text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-lg border font-bold text-xs ${cat.color}`}>
                        <Layers size={16} />
                      </div>
                      <span className="text-[10px] font-extrabold text-[#184edb] opacity-0 group-hover:opacity-100 transition-opacity">
                        Filter &gt;
                      </span>
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <span className="font-extrabold text-slate-900 text-sm">{cat.name}</span>
                      <span className="text-xs text-slate-500 font-semibold">{cat.count.toLocaleString()} Spare Parts</span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs font-bold text-slate-700">
                      <span>Stock: <strong className="text-slate-900">{cat.totalQty}</strong></span>
                      <span className="text-[#184edb] font-extrabold">{cat.totalVal}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
              <button
                onClick={() => setShowCategoriesModal(false)}
                className="px-5 py-2 bg-[#184edb] hover:bg-[#143eb3] text-white font-bold rounded-lg text-xs cursor-pointer border-none shadow-sm"
              >
                Close Modal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. INVENTORY VALUATION MODAL */}
      {showValuationModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[85vh] flex flex-col">
              <div className="px-6 py-4 bg-emerald-600 text-white flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <CircleDollarSign size={22} />
                  <div>
                    <span className="font-extrabold text-[17px] block">Inventory Asset Valuation Summary</span>
                    <span className="text-xs text-emerald-100 font-medium">Real-time valuation of spare parts stock across warehouses</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowValuationModal(false)}
                  className="text-white/80 hover:text-white border-none bg-transparent cursor-pointer p-1.5 rounded-lg hover:bg-white/10"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4">
                <div className="border border-slate-200 rounded-xl overflow-hidden flex flex-col">
                  <div className="bg-slate-100 px-4 py-2.5 text-slate-700 font-bold text-xs uppercase tracking-wider text-left border-b border-slate-200 flex items-center justify-between">
                    <span>Top Valued Spare Parts In Warehouse Stock</span>
                    <span className="text-slate-500 text-[11px] font-semibold">{displayParts.length} Spare Parts</span>
                  </div>
                  <div className="max-h-[480px] overflow-y-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="sticky top-0 bg-slate-50 z-10 shadow-xs">
                        <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                          <th className="p-3">Part Number</th>
                          <th className="p-3">Spare Part Name</th>
                          <th className="p-3 text-center">Stock Qty</th>
                          <th className="p-3 text-right">Purchase Price</th>
                          <th className="p-3 text-right">Sale Price</th>
                          <th className="p-3 text-right">Total Asset Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                        {displayParts.map(p => {
                          const qty = parseInt(p.stock.replace(/[^0-9]/g, ''), 10) || 0;
                          const price = parseFloat(p.purchasePrice.replace(/[^0-9.]/g, '')) || 0;
                          const totVal = qty * price;
                          return (
                            <tr key={p.partNumber} className="hover:bg-slate-50/60">
                              <td className="p-3 font-bold text-[#184edb]">{p.partNumber}</td>
                              <td className="p-3 font-bold text-slate-900">{p.partName}</td>
                              <td className="p-3 text-center font-extrabold">{p.stock} Units</td>
                              <td className="p-3 text-right text-slate-600">{p.purchasePrice}</td>
                              <td className="p-3 text-right text-slate-800">{p.salePrice}</td>
                              <td className="p-3 text-right font-black text-emerald-700">₹{totVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
                <button
                  onClick={() => setShowValuationModal(false)}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs cursor-pointer border-none shadow-sm"
                >
                  Close Valuation Summary
                </button>
              </div>
            </div>
          </div>
        )}

      {/* 3. TODAY'S TRANSACTIONS MODAL */}
      {showTxnsModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[85vh] flex flex-col">
            <div className="px-6 py-4 bg-[#184edb] text-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <Receipt size={22} />
                <div>
                  <span className="font-extrabold text-[17px] block">Today's Stock Movements & Transactions (114 Txns)</span>
                  <span className="text-xs text-blue-100 font-medium">Real-time log of stock intakes, customer sales, adjustments, and returns</span>
                </div>
              </div>
              <button
                onClick={() => setShowTxnsModal(false)}
                className="text-white/80 hover:text-white border-none bg-transparent cursor-pointer p-1.5 rounded-lg hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4">
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                      <th className="p-3">Time</th>
                      <th className="p-3">Transaction Type</th>
                      <th className="p-3">Spare Part Name</th>
                      <th className="p-3 text-center">Qty Change</th>
                      <th className="p-3">Ref ID</th>
                      <th className="p-3">Handled By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {(transactionsList.length > 0 ? transactionsList : [
                      { date: 'Today', type: 'Outward (Sale)', partName: 'Heavy Duty Oil Filter', partNumber: 'SP-33821', quantity: '-1 Unit', reference: 'Counter Sales #INV-2023-8842', amount: '₹220.00' },
                      { date: 'Today', type: 'Outward (Sale)', partName: 'Ceramic Brake Pads', partNumber: 'SP-10921', quantity: '-4 Units', reference: 'Service Billing #SB-2023-0045', amount: '₹2,720.00' },
                      { date: 'Today', type: 'Outward (Sale)', partName: 'Synthetic Oil 5W-30 (1L)', partNumber: 'SP-22019', quantity: '-2 Units', reference: 'Counter Sales #INV-2023-8843', amount: '₹980.00' }
                    ]).map((tx, idx) => (
                      <tr key={tx.id || idx} className="hover:bg-slate-50/60">
                        <td className="p-3 text-slate-500 font-bold">{tx.date || tx.time || 'Today'}</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-0.5 rounded text-[10.5px] font-extrabold uppercase border ${
                            tx.type?.includes('Sale') ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {tx.type || 'Outward (Sale)'}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900">{tx.partName}</span>
                            <span className="text-[10px] text-[#184edb] font-mono">{tx.partNumber || tx.partNo}</span>
                          </div>
                        </td>
                        <td className="p-3 text-center font-extrabold text-[#184edb]">{tx.quantity || tx.qty}</td>
                        <td className="p-3 font-bold text-slate-700 font-mono">{tx.reference || tx.ref}</td>
                        <td className="p-3 text-slate-600 font-medium">{tx.amount || 'Recorded'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
              <button
                onClick={() => setShowTxnsModal(false)}
                className="px-5 py-2 bg-[#184edb] hover:bg-[#143eb3] text-white font-bold rounded-lg text-xs cursor-pointer border-none shadow-sm"
              >
                Close Transaction Log
              </button>
            </div>
          </div>
        </div>
      )}
      {/* VIEWING TRANSACTION DETAILS MODAL */}
      {viewingTxn && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 bg-[#184edb] text-white flex items-center justify-between">
              <div className="flex flex-col text-left">
                <span className="font-extrabold text-base">Transaction Details</span>
                <span className="text-xs text-blue-100 font-medium">Ref: {viewingTxn.reference || viewingTxn.refNo || viewingTxn.id}</span>
              </div>
              <button onClick={() => setViewingTxn(null)} className="text-white/80 hover:text-white bg-transparent border-none cursor-pointer p-1">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-left text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Date & Time</span>
                  <span className="font-extrabold text-slate-800 text-sm">{viewingTxn.date} {viewingTxn.time}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Transaction Type</span>
                  <span className="font-extrabold text-blue-600 text-sm uppercase">{viewingTxn.type}</span>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-semibold">Part Name:</span>
                  <span className="font-bold text-slate-900">{viewingTxn.partName || viewingTxn.name}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-semibold">Part Number / SKU:</span>
                  <span className="font-bold text-[#184edb]">{viewingTxn.partNumber || viewingTxn.code || 'SP-PART'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-semibold">Qty In (Restocked):</span>
                  <span className="font-bold text-blue-600">{viewingTxn.qtyIn ?? '-'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-semibold">Qty Out (Deducted):</span>
                  <span className="font-bold text-red-600">{viewingTxn.qtyOut ?? '-'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-semibold">Stock Balance After:</span>
                  <span className="font-extrabold text-slate-900 text-sm">{viewingTxn.balance} Units</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-semibold">Updated By:</span>
                  <span className="font-bold text-slate-800">{viewingTxn.updatedBy || viewingTxn.user || 'Store Manager'} ({viewingTxn.department || 'STOREFRONT'})</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setViewingTxn(null)}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg cursor-pointer transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
