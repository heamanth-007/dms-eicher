import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LayoutDashboard,
  CheckCircle,
  Bookmark,
  ShoppingCart,
  Wrench,
  CircleDollarSign,
  Calendar,
  Settings,
  Image as ImageIcon,
  Camera,
  X,
  PlusCircle,
  ShieldAlert,
  RefreshCw,
  History,
  Info,
  ArrowLeft,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

interface VehicleType {
  id: string;
  model: string;
  category: string;
  statusText: string;
  eng: string;
  chs: string;
  colorName: string;
  colorHex: string;
  price: string;
  sellPrice: string;
  status: 'Available' | 'Reserved' | 'In Service' | 'Sold';
  imageSvg: React.ReactNode;
  imageUrl?: string;
  stock: number;
  year: string;
}

export const VehicleInventory: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [viewingDetails, setViewingDetails] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [brandFilter, setBrandFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');

  // Edit view form states
  const [vehicleModel, setVehicleModel] = useState('Eicher Pro 3015');
  const [regNumber, setRegNumber] = useState('MH-12-FG-8821');
  const [chassisNumber, setChassisNumber] = useState('EIC3015X2024KL9902');
  const [engineNumber, setEngineNumber] = useState('E494-CRT-24');
  const [vehicleStock, setVehicleStock] = useState('1');
  const [vehicleStatus, setVehicleStatus] = useState('Available');

  // Register view form states
  const [regVehicleType, setRegVehicleType] = useState('Eicher');
  const [regModel, setRegModel] = useState('');
  const [regImage, setRegImage] = useState<string | null>(null);
  const [regColor, setRegColor] = useState('');
  const [regEngineNum, setRegEngineNum] = useState('');
  const [regChassisNum, setRegChassisNum] = useState('');
  const [regPurchasePrice, setRegPurchasePrice] = useState('');
  const [regSellingPrice, setRegSellingPrice] = useState('');
  const [regStock, setRegStock] = useState('1');

  // SVGs for the vehicles
  const SemiTruckSVG = (
    <svg width="64" height="40" viewBox="0 0 64 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto object-contain max-h-10">
      <circle cx="16" cy="30" r="6" fill="#1e293b" />
      <circle cx="16" cy="30" r="2.5" fill="#94a3b8" />
      <circle cx="44" cy="30" r="6" fill="#1e293b" />
      <circle cx="44" cy="30" r="2.5" fill="#94a3b8" />
      <circle cx="53" cy="30" r="6" fill="#1e293b" />
      <circle cx="53" cy="30" r="2.5" fill="#94a3b8" />
      <rect x="16" y="26" width="38" height="4" fill="#475569" />
      <path d="M6 10H16C18 10 20 12 20 14V28H6C5 28 4 27 4 26V12C4 11 5 10 6 10Z" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />
      <path d="M5 12H12V18H5V12Z" fill="#38bdf8" opacity="0.6" />
      <rect x="4" y="22" width="4" height="2" fill="#f59e0b" />
      <rect x="21" y="6" width="37" height="21" rx="2" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" />
      <line x1="28" y1="6" x2="28" y2="27" stroke="#94a3b8" />
      <line x1="38" y1="6" x2="38" y2="27" stroke="#94a3b8" />
      <line x1="48" y1="6" x2="48" y2="27" stroke="#94a3b8" />
    </svg>
  );

  const CoachBusSVG = (
    <svg width="64" height="40" viewBox="0 0 64 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto object-contain max-h-10">
      <circle cx="16" cy="30" r="6" fill="#1e293b" />
      <circle cx="16" cy="30" r="2.5" fill="#94a3b8" />
      <circle cx="48" cy="30" r="6" fill="#1e293b" />
      <circle cx="48" cy="30" r="2.5" fill="#94a3b8" />
      <path d="M4 12C4 10 6 8 8 8H56C58 8 60 10 60 12V28C60 29 59 30 58 30H6C5 30 4 29 4 28V12Z" fill="#2563eb" stroke="#1d4ed8" strokeWidth="1" />
      <rect x="8" y="11" width="8" height="6" rx="1" fill="#38bdf8" opacity="0.8" />
      <rect x="18" y="11" width="8" height="6" rx="1" fill="#38bdf8" opacity="0.8" />
      <rect x="28" y="11" width="8" height="6" rx="1" fill="#38bdf8" opacity="0.8" />
      <rect x="38" y="11" width="8" height="6" rx="1" fill="#38bdf8" opacity="0.8" />
      <rect x="48" y="11" width="8" height="6" rx="1" fill="#38bdf8" opacity="0.8" />
      <rect x="4" y="24" width="2" height="3" fill="#f59e0b" />
      <rect x="8" y="22" width="48" height="2" fill="#1d4ed8" />
    </svg>
  );

  const LcvSVG = (
    <svg width="64" height="40" viewBox="0 0 64 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto object-contain max-h-10">
      <circle cx="14" cy="28" r="5" fill="#1e293b" />
      <circle cx="14" cy="28" r="2" fill="#cbd5e1" />
      <circle cx="46" cy="28" r="5" fill="#1e293b" />
      <circle cx="46" cy="28" r="2" fill="#cbd5e1" />
      <path d="M6 14H16C17 14 18 15 18 16V27H6C5 27 4 26 4 25V16C4 15 5 14 6 14Z" fill="#f1f5f9" stroke="#cbd5e1" />
      <path d="M5 16H12V20H5V16Z" fill="#38bdf8" opacity="0.7" />
      <rect x="19" y="10" width="38" height="17" rx="1" fill="#e2e8f0" stroke="#cbd5e1" />
      <line x1="38" y1="10" x2="38" y2="27" stroke="#cbd5e1" />
    </svg>
  );

  const TipperSVG = (
    <svg width="64" height="40" viewBox="0 0 64 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto object-contain max-h-10">
      <circle cx="16" cy="30" r="6" fill="#1e293b" />
      <circle cx="16" cy="30" r="2.5" fill="#94a3b8" />
      <circle cx="42" cy="30" r="6" fill="#1e293b" />
      <circle cx="42" cy="30" r="2.5" fill="#94a3b8" />
      <circle cx="51" cy="30" r="6" fill="#1e293b" />
      <circle cx="51" cy="30" r="2.5" fill="#94a3b8" />
      <path d="M6 14H18C19 14 20 15 20 16V29H6C5 29 4 28 4 27V16C4 15 5 14 6 14Z" fill="#f59e0b" stroke="#d97706" />
      <path d="M5 16H13V20H5V16Z" fill="#38bdf8" opacity="0.8" />
      <path d="M22 12L56 8V25H22V12Z" fill="#eab308" stroke="#d97706" />
      <rect x="25" y="25" width="28" height="3" fill="#475569" />
    </svg>
  );

  const TruckVisualSVG = (
    <svg viewBox="0 0 160 110" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover">
      <rect width="160" height="110" fill="#1e293b" />
      <rect x="0" y="80" width="160" height="30" fill="#0f172a" />
      <rect x="35" y="15" width="90" height="68" rx="8" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
      <rect x="42" y="22" width="76" height="24" rx="4" fill="#0284c7" />
      <rect x="44" y="24" width="72" height="10" fill="#38bdf8" opacity="0.5" />
      <line x1="55" y1="42" x2="68" y2="38" stroke="#0f172a" strokeWidth="1.5" />
      <line x1="90" y1="42" x2="103" y2="38" stroke="#0f172a" strokeWidth="1.5" />
      <rect x="42" y="52" width="76" height="18" rx="2" fill="#0f172a" />
      <circle cx="80" cy="61" r="3.5" fill="#e2e8f0" />
      <rect x="68" y="60.5" width="24" height="1" fill="#e2e8f0" />
      <rect x="46" y="56" width="10" height="8" rx="2" fill="#ffffff" />
      <circle cx="51" cy="60" r="2" fill="#fbbf24" />
      <rect x="104" y="56" width="10" height="8" rx="2" fill="#ffffff" />
      <circle cx="109" cy="60" r="2" fill="#fbbf24" />
      <rect x="30" y="76" width="100" height="10" rx="3" fill="#334155" />
      <rect x="32" y="78" width="6" height="3" fill="#f59e0b" />
      <rect x="122" y="78" width="6" height="3" fill="#f59e0b" />
      <rect x="42" y="86" width="16" height="14" rx="3" fill="#090d16" />
      <rect x="102" y="86" width="16" height="14" rx="3" fill="#090d16" />
    </svg>
  );

  const ExcavatorDetailsSVG = (
    <svg viewBox="0 0 240 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover">
      <rect width="240" height="160" fill="#f1f5f9" />
      <rect x="0" y="120" width="240" height="40" fill="#cbd5e1" />
      <rect x="45" y="110" width="115" height="22" rx="6" fill="#1e293b" />
      <rect x="52" y="113" width="101" height="16" rx="4" fill="#475569" />
      <circle cx="60" cy="121" r="5" fill="#0f172a" />
      <circle cx="78" cy="121" r="5" fill="#0f172a" />
      <circle cx="96" cy="121" r="5" fill="#0f172a" />
      <circle cx="114" cy="121" r="5" fill="#0f172a" />
      <circle cx="132" cy="121" r="5" fill="#0f172a" />
      <circle cx="148" cy="121" r="5" fill="#0f172a" />
      <rect x="65" y="100" width="65" height="10" fill="#334155" />
      <path d="M55 55H118L124 100H55V55Z" fill="#eab308" stroke="#ca8a04" strokeWidth="2" />
      <rect x="62" y="60" width="24" height="22" rx="3" fill="#0f172a" />
      <rect x="64" y="62" width="20" height="18" rx="2" fill="#38bdf8" opacity="0.7" />
      <rect x="94" y="65" width="18" height="3" fill="#475569" />
      <rect x="94" y="71" width="18" height="3" fill="#475569" />
      <rect x="94" y="77" width="18" height="3" fill="#475569" />
      <path d="M118 62H134V94H122L118 62Z" fill="#475569" />
      <path d="M100 70L155 35L185 85L202 105" stroke="#eab308" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M100 70L155 35L185 85L202 105" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="90" y1="85" x2="135" y2="48" stroke="#94a3b8" strokeWidth="3" />
      <line x1="148" y1="41" x2="176" y2="76" stroke="#94a3b8" strokeWidth="3" />
      <path d="M202 105L210 115H190L186 99L202 105Z" fill="#475569" stroke="#1e293b" strokeWidth="1.5" />
      <line x1="210" y1="115" x2="216" y2="111" stroke="#1e293b" strokeWidth="2" />
      <line x1="208" y1="115" x2="214" y2="108" stroke="#1e293b" strokeWidth="2" />
    </svg>
  );

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [vehicles, setVehicles] = useState<VehicleType[]>([]);

  const getVehicleSVG = (category: string) => {
    switch (category) {
      case 'Heavy Duty Truck': return SemiTruckSVG;
      case 'Coach Bus': return CoachBusSVG;
      case 'LCV': return LcvSVG;
      case 'Tipper Truck': return TipperSVG;
      default: return SemiTruckSVG;
    }
  };

  const fetchVehicles = () => {
    fetch(`${API_URL}/api/vehicles`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const formatted = data.map((v: any) => ({
            id: v.id,
            model: v.modelName,
            category: v.type,
            statusText: v.condition,
            eng: v.engineNo,
            chs: v.chassisNo,
            colorName: v.colorName,
            colorHex: v.colorHex || '#ffffff',
            price: `₹${Number(v.price).toLocaleString('en-IN')}`,
            sellPrice: `₹${Number(v.sellPrice).toLocaleString('en-IN')}`,
            status: v.status || 'Available',
            stock: v.stock || 0,
            imageSvg: getVehicleSVG(v.type),
            imageUrl: v.imageUrl,
            year: v.createdAt ? new Date(v.createdAt).getFullYear().toString() : '2024'
          }));
          setVehicles(formatted);
        }
      })
      .catch(err => console.error('Error fetching vehicles:', err));
  };

  // Filter logic
  const filteredVehicles = vehicles.filter(v => {
    if (statusFilter !== 'All' && v.status !== statusFilter) return false;
    if (brandFilter !== 'All' && !v.model.toLowerCase().includes(brandFilter.toLowerCase())) return false;
    if (typeFilter !== 'All' && v.category !== typeFilter) return false;
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      if (!v.model.toLowerCase().includes(lower) && 
          !v.id.toLowerCase().includes(lower) && 
          !(v.chs && v.chs.toLowerCase().includes(lower))) {
        return false;
      }
    }
    return true;
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleSaveVehicle = () => {
    if (!regModel) {
      alert('Please enter a vehicle model.');
      return;
    }
    const priceVal = parseFloat(regPurchasePrice.replace(/[^\d.]/g, '')) || 0;
    const sellPriceVal = parseFloat(regSellingPrice.replace(/[^\d.]/g, '')) || 0;
    
    const bodyPayload = {
      modelName: regModel,
      type: regVehicleType,
      condition: 'Brand New',
      engineNo: regEngineNum || `ENG-${Math.floor(100000 + Math.random() * 900000)}`,
      chassisNo: regChassisNum || `CHS-${Math.floor(100000 + Math.random() * 900000)}`,
      colorName: regColor || 'Arctic White',
      colorHex: '#ffffff',
      price: priceVal,
      sellPrice: sellPriceVal,
      status: 'Available',
      stock: Number(regStock) || 0,
      imageUrl: regImage || 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=400'
    };

    fetch(`${API_URL}/api/vehicles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyPayload)
    })
      .then(res => res.json())
      .then(() => {
        fetchVehicles();
        setIsRegistering(false);
        // Reset registration fields
        setRegModel('');
        setRegColor('');
        setRegEngineNum('');
        setRegChassisNum('');
        setRegPurchasePrice('');
        setRegSellingPrice('');
        setRegStock('1');
        setRegImage(null);
      })
      .catch(err => console.error(err));
  };

  const handleUpdateVehicle = () => {
    const bodyPayload = {
      modelName: vehicleModel,
      engineNo: engineNumber,
      chassisNo: chassisNumber,
      stock: Number(vehicleStock) || 0,
      status: vehicleStatus
    };

    fetch(`${API_URL}/api/vehicles/${encodeURIComponent(editingVehicleId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyPayload)
    })
      .then(res => res.json())
      .then(() => {
        fetchVehicles();
        setIsEditing(false);
      })
      .catch(err => console.error('Error updating vehicle:', err));
  };  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType | null>(null);

  const handleRowClick = (v: VehicleType) => {
    setSelectedVehicle(v);
    setViewingDetails(true);
    setIsEditing(false);
    setIsRegistering(false);
  };

  // Detailed view of the Vehicle
  if (viewingDetails && selectedVehicle) {
    const priceVal = parseFloat(selectedVehicle.price.replace(/[^\d.]/g, '')) || 0;
    const sellPriceVal = parseFloat(selectedVehicle.sellPrice.replace(/[^\d.]/g, '')) || 0;
    const profitMargin = sellPriceVal - priceVal;
    const marginPercent = priceVal > 0 ? ((profitMargin / priceVal) * 100).toFixed(1) : '0.0';

    return (
      <div className="flex-1 p-6 md:p-8 flex flex-col gap-6 bg-[#f6f8fc] overflow-y-auto box-border max-w-full font-sans">
        {/* Navigation Breadcrumb & Back button */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => { setViewingDetails(false); setSelectedVehicle(null); }}
            className="flex items-center gap-2 text-[13px] text-slate-500 hover:text-[#184edb] font-semibold border-none bg-transparent cursor-pointer transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Inventory</span>
          </button>

          <button
            onClick={() => {
              setVehicleModel(selectedVehicle.model);
              setRegNumber(selectedVehicle.id);
              setChassisNumber(selectedVehicle.chs);
              setEngineNumber(selectedVehicle.eng);
              setVehicleStock(selectedVehicle.stock?.toString() || '0');
              setVehicleStatus(selectedVehicle.status || 'Available');
              setEditingVehicleId(selectedVehicle.id);
              setIsEditing(true);
              setViewingDetails(false);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#184edb] hover:bg-[#143eb3] text-white font-semibold rounded-lg text-[13.5px] cursor-pointer transition-colors border-none shadow-sm"
          >
            <Settings size={15} />
            <span>Edit Specifications</span>
          </button>
        </div>

        {/* Vehicle Header details */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] font-bold text-[#184edb] tracking-wider uppercase">{selectedVehicle.category} • {selectedVehicle.statusText}</span>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 m-0 font-heading tracking-tight">
              {selectedVehicle.model}
            </h1>
            <span className="text-slate-500 text-[13px] font-medium font-mono">
              Chassis #: {selectedVehicle.chs}
            </span>
          </div>

          <div className="flex flex-col text-left sm:text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">MSRP LIST PRICE</span>
            <span className="text-2xl md:text-3xl font-extrabold text-[#184edb] tracking-tight">
              {selectedVehicle.sellPrice}
            </span>
          </div>
        </div>

        {/* Main Info Blocks (Visuals and Spec Highlights) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start w-full box-border">
          {/* Visual Container */}
          <div className="lg:col-span-1 rounded-xl overflow-hidden border border-slate-200 relative min-h-[220px] bg-slate-100 flex items-center justify-center p-4">
            <div className="w-full h-full max-h-36 flex items-center justify-center">
              {selectedVehicle.imageUrl ? (
                <img src={selectedVehicle.imageUrl} alt={selectedVehicle.model} className="max-w-full max-h-full object-contain rounded-lg" />
              ) : (
                selectedVehicle.imageSvg
              )}
            </div>
            <span className="absolute top-4 right-4 bg-emerald-50 text-emerald-600 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1.5 shadow-sm">
              <span className={`w-1.5 h-1.5 rounded-full ${
                selectedVehicle.status === 'Available' ? 'bg-emerald-500' :
                selectedVehicle.status === 'Reserved' ? 'bg-amber-500' :
                selectedVehicle.status === 'In Service' ? 'bg-orange-550' : 'bg-slate-400'
              }`} />
              {selectedVehicle.status}
            </span>
          </div>

          {/* Quick Specs Highlight Box */}
          <div className="lg:col-span-2 flex flex-col justify-start gap-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Brand */}
              <div className="bg-[#f1f3fa] rounded-xl p-4 flex flex-col gap-1.5 border border-slate-150">
                <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Brand</span>
                <span className="text-[16px] font-bold text-slate-800">{selectedVehicle.model.split(' ')[0]}</span>
              </div>
              {/* Year */}
              <div className="bg-[#f1f3fa] rounded-xl p-4 flex flex-col gap-1.5 border border-slate-150">
                <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Year</span>
                <span className="text-[16px] font-bold text-slate-800">{selectedVehicle.year}</span>
              </div>
              {/* Engine */}
              <div className="bg-[#f1f3fa] rounded-xl p-4 flex flex-col gap-1.5 border border-slate-150">
                <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Engine</span>
                <span className="text-[16px] font-bold text-slate-800">{selectedVehicle.eng}</span>
              </div>
              {/* Condition */}
              <div className="bg-[#f1f3fa] rounded-xl p-4 flex flex-col gap-1.5 border border-slate-150">
                <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Condition</span>
                <span className="text-[16px] font-bold text-slate-800">{selectedVehicle.statusText}</span>
              </div>
            </div>


          </div>
        </div>

        {/* Pricing Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {/* Purchase Price */}
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-l-[#184edb] flex flex-col justify-between min-h-[96px] box-border">
            <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">PURCHASE PRICE</span>
            <span className="text-2xl font-bold text-slate-800 tracking-tight">{selectedVehicle.price}</span>
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium mt-1">
              <Info size={13} />
              <span>Incl. Tax & Logistics</span>
            </div>
          </div>

          {/* Selling Price */}
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-l-[#184edb] flex flex-col justify-between min-h-[96px] box-border">
            <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">SELLING PRICE</span>
            <span className="text-2xl font-bold text-slate-800 tracking-tight">{selectedVehicle.sellPrice}</span>
            <div className="mt-1">
              <span className="bg-blue-50 text-[#184edb] text-[9.5px] font-bold px-2 py-0.5 rounded-full border border-blue-100 uppercase">
                LATEST QUOTE
              </span>
            </div>
          </div>

          {/* Profit Margin */}
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-l-emerald-500 flex flex-col justify-between min-h-[96px] box-border">
            <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">PROFIT MARGIN</span>
            <span className="text-2xl font-bold text-emerald-600 tracking-tight">₹{profitMargin.toLocaleString('en-IN')}</span>
            <span className="text-[11px] text-slate-450 font-medium mt-1">
              ~{marginPercent}% Gross Margin
            </span>
          </div>

          {/* Inventory Value */}
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-l-rose-500 flex flex-col justify-between min-h-[96px] box-border">
            <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">INVENTORY VALUE</span>
            <span className="text-2xl font-bold text-slate-800 tracking-tight">{selectedVehicle.price}</span>
            <span className="text-[11px] text-slate-400 font-medium mt-1">
              Asset Base Value
            </span>
          </div>
        </div>


      </div>
    );
  }

  // Register New Vehicle View
  if (isRegistering) {
    return (
      <div className="flex-1 p-6 md:p-8 flex flex-col gap-6 bg-[#f6f8fc] overflow-y-auto box-border max-w-full font-sans">
        <div className="flex items-center gap-2 text-[13px] text-slate-500 font-medium">
          <span className="cursor-pointer hover:text-[#184edb] transition-colors" onClick={() => setIsRegistering(false)}>Vehicles</span>
          <span>&gt;</span>
          <span className="text-[#184edb] font-semibold">Add New Registration</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 m-0 font-heading tracking-tight">
              Register New Vehicle
            </h1>
            <span className="text-slate-500 text-[13.5px] font-medium">
              Complete the form below to add a new unit to the workshop inventory.
            </span>
          </div>

          <div>
            <button className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg text-[13.5px] cursor-pointer transition-colors bg-white">
              <span>Import Excel</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col gap-3 w-full box-border">
          <div className="flex justify-between items-center text-[12px] font-bold">
            <span className="text-[#184edb] uppercase tracking-wider">REGISTRATION PROGRESS</span>
            <span className="text-slate-400">Step 1 of 2: Technical Specifications</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-[#184edb] h-full w-1/2" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col gap-8 w-full box-border">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="bg-[#eef2ff] text-[#184edb] p-2 rounded-lg flex items-center justify-center">
                <CheckCircle size={18} />
              </div>
              <h2 className="text-[16px] font-bold text-slate-800 m-0">
                Vehicle Information
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Vehicle Type</label>
                  <div className="relative">
                    <select
                      value={regVehicleType}
                      onChange={(e) => setRegVehicleType(e.target.value)}
                      className="w-full appearance-none bg-[#fff] border border-slate-200 rounded-lg py-2.5 pl-4 pr-10 text-[14px] text-slate-850 font-medium cursor-pointer focus:outline-none focus:border-[#184edb] transition-colors"
                    >
                      <option value="Eicher">Eicher</option>
                      <option value="Tractor">Tractor</option>
                    </select>
                    <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 pointer-events-none">
                      <ChevronDown size={16} />
                    </span>
                  </div>
                </div>



                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Model</label>
                  <input
                    type="text"
                    placeholder="e.g. Pro 2055"
                    value={regModel}
                    onChange={(e) => setRegModel(e.target.value)}
                    className="w-full px-4 py-2.5 text-[14px] bg-[#fff] border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#184edb] transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Color</label>
                  <input
                    type="text"
                    placeholder="e.g. Polar White"
                    value={regColor}
                    onChange={(e) => setRegColor(e.target.value)}
                    className="w-full px-4 py-2.5 text-[14px] bg-[#fff] border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#184edb] transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Engine Number</label>
                  <input
                    type="text"
                    placeholder="Enter Engine ID"
                    value={regEngineNum}
                    onChange={(e) => setRegEngineNum(e.target.value)}
                    className="w-full px-4 py-2.5 text-[14px] bg-[#fff] border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#184edb] transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Chassis Number</label>
                  <input
                    type="text"
                    placeholder="Enter VIN/Chassis ID"
                    value={regChassisNum}
                    onChange={(e) => setRegChassisNum(e.target.value)}
                    className="w-full px-4 py-2.5 text-[14px] bg-[#fff] border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#184edb] transition-colors"
                  />
                </div>



                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Purchase Price (₹)</label>
                  <input
                    type="text"
                    placeholder="0.00"
                    value={regPurchasePrice}
                    onChange={(e) => setRegPurchasePrice(e.target.value)}
                    className="w-full px-4 py-2.5 text-[14px] bg-[#fff] border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#184edb] transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Selling Price (₹)</label>
                  <input
                    type="text"
                    placeholder="0.00"
                    value={regSellingPrice}
                    onChange={(e) => setRegSellingPrice(e.target.value)}
                    className="w-full px-4 py-2.5 text-[14px] bg-[#fff] border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#184edb] transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Initial Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={regStock}
                    onChange={(e) => setRegStock(e.target.value)}
                    className="w-full px-4 py-2.5 text-[14px] bg-[#fff] border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#184edb] transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Vehicle Image</span>
                <label className="flex-1 min-h-[220px] bg-[#f4f6ff] border-2 border-dashed border-[#d2d9f9] rounded-xl flex flex-col items-center justify-center p-6 text-center text-slate-500 hover:border-[#184edb] transition-colors cursor-pointer group relative overflow-hidden">
                  {regImage ? (
                    <img src={regImage} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#184edb] shadow-sm mb-4 group-hover:scale-105 transition-transform">
                        <Camera size={22} />
                      </div>
                      <span className="text-[14px] font-bold text-slate-800 mb-1">Drop image here or click to upload</span>
                      <span className="text-[12px] text-slate-400 font-medium">PNG, JPG up to 10MB</span>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setRegImage(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }} />
                </label>
              </div>
            </div>
          </div>


        </div>

        <div className="bg-[#f8fafc] border border-slate-100 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 box-border">
          <button
            onClick={() => setIsRegistering(false)}
            className="flex items-center gap-1.5 px-4 py-2 border-none hover:bg-slate-100 text-rose-600 font-semibold rounded-lg text-[13.5px] cursor-pointer transition-colors bg-transparent"
          >
            <X size={16} />
            <span>Cancel</span>
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={handleSaveVehicle}
              className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-[#184edb] font-semibold rounded-lg text-[13.5px] cursor-pointer transition-all bg-white"
            >
              <PlusCircle size={15} />
              <span>Save & Add Another</span>
            </button>

            <button
              onClick={handleSaveVehicle}
              className="flex items-center gap-1.5 px-5 py-2 bg-[#184edb] hover:bg-[#143eb3] text-white font-semibold rounded-lg text-[13.5px] cursor-pointer transition-all border-none shadow-sm"
            >
              <CheckCircle size={15} />
              <span>Save Vehicle</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          <div className="bg-[#f0f4ff] rounded-xl p-5 flex gap-4 box-border border border-[#e2e7f8]">
            <div className="text-[#184edb] flex-shrink-0">
              <div className="bg-white p-2 rounded-lg flex items-center justify-center shadow-sm">
                <ShieldAlert size={20} />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[13.5px] font-bold text-slate-800">VIN Validation</span>
              <span className="text-[12px] text-slate-500 font-medium leading-relaxed">
                All Chassis numbers are automatically validated against the manufacturer database to prevent duplicates.
              </span>
            </div>
          </div>

          <div className="bg-[#f0f4ff] rounded-xl p-5 flex gap-4 box-border border border-[#e2e7f8]">
            <div className="text-[#184edb] flex-shrink-0">
              <div className="bg-white p-2 rounded-lg flex items-center justify-center shadow-sm">
                <RefreshCw size={20} />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[13.5px] font-bold text-slate-800">Auto-Sync</span>
              <span className="text-[12px] text-slate-500 font-medium leading-relaxed">
                Saved vehicles are instantly synced with the Sales and Billing modules for immediate quotation generation.
              </span>
            </div>
          </div>

          <div className="bg-[#f0f4ff] rounded-xl p-5 flex gap-4 box-border border border-[#e2e7f8]">
            <div className="text-[#184edb] flex-shrink-0">
              <div className="bg-white p-2 rounded-lg flex items-center justify-center shadow-sm">
                <History size={20} />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[13.5px] font-bold text-slate-800">Log History</span>
              <span className="text-[12px] text-slate-500 font-medium leading-relaxed">
                The registration process creates a permanent audit trail including timestamp and operator ID.
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Edit View
  if (isEditing) {
    return (
      <div className="flex-1 p-6 md:p-8 flex flex-col gap-6 bg-[#f6f8fc] overflow-y-auto box-border max-w-full font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 m-0 font-heading tracking-tight">
              Edit Vehicle Details
            </h1>
            <span className="text-slate-500 text-[13.5px] font-medium">
              Manage and update technical specifications for {vehicleModel}.
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => { setIsEditing(false); setViewingDetails(vehicleModel === 'Titan 9000-X Excavator'); }}
              className="px-5 py-2 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg text-[13.5px] cursor-pointer transition-all bg-white"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateVehicle}
              className="px-5 py-2 bg-[#184edb] hover:bg-[#143eb3] text-white font-semibold rounded-lg text-[13.5px] cursor-pointer transition-all border-none shadow-sm"
            >
              Update Vehicle
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start w-full box-border">
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Identity & Registration */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col gap-5 box-border">
              <div className="flex items-center gap-3 pb-3.5 border-b border-slate-100">
                <div className="bg-[#eef2ff] text-[#184edb] p-2 rounded-lg flex items-center justify-center">
                  <LayoutDashboard size={18} />
                </div>
                <h2 className="text-[16px] font-bold text-slate-800 m-0">
                  Identity & Registration
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">VEHICLE MODEL</label>
                  <input
                    type="text"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    className="w-full px-4 py-2.5 text-[14px] bg-[#fff] border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#184edb] transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">REGISTRATION NUMBER</label>
                  <input
                    type="text"
                    value={regNumber}
                    onChange={(e) => setRegNumber(e.target.value)}
                    className="w-full px-4 py-2.5 text-[14px] bg-[#fff] border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#184edb] transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">CHASSIS NUMBER</label>
                  <input
                    type="text"
                    value={chassisNumber}
                    onChange={(e) => setChassisNumber(e.target.value)}
                    className="w-full px-4 py-2.5 text-[14px] bg-[#fff] border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#184edb] transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">ENGINE NUMBER</label>
                  <input
                    type="text"
                    value={engineNumber}
                    onChange={(e) => setEngineNumber(e.target.value)}
                    className="w-full px-4 py-2.5 text-[14px] bg-[#fff] border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#184edb] transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">STOCK QUANTITY</label>
                  <input
                    type="number"
                    min="0"
                    value={vehicleStock}
                    onChange={(e) => setVehicleStock(e.target.value)}
                    className="w-full px-4 py-2.5 text-[14px] bg-[#fff] border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#184edb] transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">STATUS</label>
                  <div className="relative">
                    <select
                      value={vehicleStatus}
                      onChange={(e) => setVehicleStatus(e.target.value)}
                      className="w-full appearance-none bg-[#fff] border border-slate-200 rounded-lg py-2.5 pl-4 pr-10 text-[14px] text-slate-850 font-medium cursor-pointer focus:outline-none focus:border-[#184edb] transition-colors"
                    >
                      <option value="Available">Available</option>
                      <option value="Reserved">Reserved</option>
                      <option value="Sold">Sold</option>
                      <option value="In Service">In Service</option>
                      <option value="Out of Stock">Out of Stock</option>
                    </select>
                    <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 pointer-events-none">
                      <ChevronDown size={16} />
                    </span>
                  </div>
                </div>
              </div>
            </div>



            {/* Vehicle Visuals */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col gap-5 box-border">
              <div className="flex items-center gap-3 pb-3.5 border-b border-slate-100">
                <div className="bg-[#eef2ff] text-[#184edb] p-2 rounded-lg flex items-center justify-center">
                  <ImageIcon size={18} />
                </div>
                <h2 className="text-[16px] font-bold text-slate-800 m-0">
                  Vehicle Visuals
                </h2>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="w-[150px] h-[100px] bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                  {vehicleModel === 'Titan 9000-X Excavator' ? (
                    <div className="w-full h-full p-1 bg-white">
                      {ExcavatorDetailsSVG}
                    </div>
                  ) : (
                    TruckVisualSVG
                  )}
                </div>

                <div className="w-[150px] h-[100px] border-2 border-dashed border-slate-200 rounded-lg hover:border-[#184edb] flex flex-col items-center justify-center gap-1.5 text-slate-400 cursor-pointer hover:text-[#184edb] transition-colors">
                  <Camera size={20} />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Add Image</span>
                </div>
              </div>
            </div>
          </div>


        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-8 flex flex-col gap-6 bg-[#f6f8fc] overflow-y-auto box-border max-w-full">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-[13px] text-slate-500 font-medium">
        <span className="cursor-pointer hover:text-[#184edb] transition-colors" onClick={() => { setIsEditing(false); setIsRegistering(false); setViewingDetails(false); }}>Dashboard</span>
        <span>&gt;</span>
        <span className="cursor-pointer hover:text-[#184edb] transition-colors" onClick={() => { setIsEditing(false); setIsRegistering(false); setViewingDetails(false); }}>Inventory</span>
        <span>&gt;</span>
        <span className="text-[#184edb] font-semibold">Vehicles</span>
      </div>

      {/* Page Title */}
      <h1 className="text-3xl font-bold text-slate-900 m-0 font-heading tracking-tight">
        Vehicle Inventory
      </h1>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 w-full">
        {/* Card 1: Total Vehicles */}
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-l-[#184edb] flex items-center justify-between min-h-[96px] box-border">
          <div className="flex flex-col gap-1">
            <span className="text-slate-500 text-[12.5px] font-semibold uppercase tracking-wider">Total Vehicles</span>
            <span className="text-2xl font-bold text-slate-800 tracking-tight">{vehicles.length}</span>
          </div>
          <div className="bg-[#eef2ff] text-[#184edb] p-2.5 rounded-lg flex items-center justify-center">
            <LayoutDashboard size={20} />
          </div>
        </div>

        {/* Card 2: Available */}
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-l-emerald-500 flex items-center justify-between min-h-[96px] box-border">
          <div className="flex flex-col gap-1">
            <span className="text-slate-500 text-[12.5px] font-semibold uppercase tracking-wider">Available</span>
            <span className="text-2xl font-bold text-slate-800 tracking-tight">
              {vehicles.filter(v => v.status === 'Available').length}
            </span>
          </div>
          <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-lg flex items-center justify-center">
            <CheckCircle size={20} />
          </div>
        </div>

        {/* Card 3: Reserved */}
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-l-amber-500 flex items-center justify-between min-h-[96px] box-border">
          <div className="flex flex-col gap-1">
            <span className="text-slate-500 text-[12.5px] font-semibold uppercase tracking-wider">Reserved</span>
            <span className="text-2xl font-bold text-slate-800 tracking-tight">
              {vehicles.filter(v => v.status === 'Reserved').length}
            </span>
          </div>
          <div className="bg-amber-50 text-amber-600 p-2.5 rounded-lg flex items-center justify-center">
            <Bookmark size={20} />
          </div>
        </div>

        {/* Card 4: Sold */}
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-l-sky-500 flex items-center justify-between min-h-[96px] box-border">
          <div className="flex flex-col gap-1">
            <span className="text-slate-500 text-[12.5px] font-semibold uppercase tracking-wider">Sold</span>
            <span className="text-2xl font-bold text-slate-800 tracking-tight">
              {vehicles.filter(v => v.status === 'Sold').length}
            </span>
          </div>
          <div className="bg-sky-50 text-sky-600 p-2.5 rounded-lg flex items-center justify-center">
            <ShoppingCart size={20} />
          </div>
        </div>

        {/* Card 5: In Service */}
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-l-orange-500 flex items-center justify-between min-h-[96px] box-border">
          <div className="flex flex-col gap-1">
            <span className="text-slate-500 text-[12.5px] font-semibold uppercase tracking-wider">In Service</span>
            <span className="text-2xl font-bold text-slate-800 tracking-tight">
              {vehicles.filter(v => v.status === 'In Service').length}
            </span>
          </div>
          <div className="bg-orange-50 text-orange-600 p-2.5 rounded-lg flex items-center justify-center">
            <Wrench size={20} />
          </div>
        </div>

        {/* Card 6: Total Inventory Value */}
        <div className="bg-[#184edb] rounded-xl p-4 shadow-md flex items-center justify-between min-h-[96px] text-white box-border">
          <div className="flex flex-col gap-1">
            <span className="text-blue-100 text-[12.5px] font-semibold uppercase tracking-wider">Total Inventory Value</span>
            <span className="text-2xl font-bold tracking-tight">
              ₹{(vehicles.reduce((sum, v) => {
                const val = parseFloat(v.price.replace(/[^\d.]/g, ''));
                return isNaN(val) ? sum : sum + val;
              }, 0) / 100000).toFixed(1)}L
            </span>
          </div>
          <div className="bg-white/15 text-white p-2.5 rounded-lg flex items-center justify-center">
            <CircleDollarSign size={20} />
          </div>
        </div>
      </div>

      {/* Filter and Action Panel */}
      <div className="bg-white rounded-xl p-5 shadow-sm flex flex-col gap-4 w-full box-border border border-slate-100">
        {/* Row 1: Search & Selector Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 w-full items-center">
          {/* Search box */}
          <div className="relative w-full">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Search by ID, VIN, or Model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-[14px] bg-[#f8fafc] border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#184edb] focus:bg-white transition-colors"
            />
          </div>

          {/* Status dropdown */}
          <div className="relative w-full">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none bg-[#f8fafc] border border-slate-200 rounded-lg py-2 pl-4 pr-10 text-[14px] text-slate-700 font-medium cursor-pointer focus:outline-none focus:border-[#184edb] transition-colors"
            >
              <option value="All">Status: All</option>
              <option value="Available">Available</option>
              <option value="Reserved">Reserved</option>
              <option value="In Service">In Service</option>
              <option value="Sold">Sold</option>
            </select>
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 pointer-events-none">
              <ChevronDown size={16} />
            </span>
          </div>

          {/* Brand dropdown */}
          <div className="relative w-full">
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="w-full appearance-none bg-[#f8fafc] border border-slate-200 rounded-lg py-2 pl-4 pr-10 text-[14px] text-slate-700 font-medium cursor-pointer focus:outline-none focus:border-[#184edb] transition-colors"
            >
              <option value="All">Brand: All</option>
              <option value="Eicher">Eicher</option>
              <option value="Volvo">Volvo</option>
            </select>
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 pointer-events-none">
              <ChevronDown size={16} />
            </span>
          </div>

          {/* Type dropdown */}
          <div className="relative w-full">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full appearance-none bg-[#f8fafc] border border-slate-200 rounded-lg py-2 pl-4 pr-10 text-[14px] text-slate-700 font-medium cursor-pointer focus:outline-none focus:border-[#184edb] transition-colors"
            >
              <option value="All">Type: All</option>
              <option value="Heavy Duty Truck">Heavy Duty Truck</option>
              <option value="Coach Bus">Coach Bus</option>
              <option value="LCV">LCV</option>
              <option value="Tipper Truck">Tipper Truck</option>
            </select>
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 pointer-events-none">
              <ChevronDown size={16} />
            </span>
          </div>

          {/* Date Picker */}
          <div className="relative w-full">
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 pointer-events-none">
              <Calendar size={16} />
            </span>
            <input
              type="text"
              placeholder="mm/dd/yyyy"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full bg-[#f8fafc] border border-slate-200 rounded-lg py-2 pl-4 pr-10 text-[14px] text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#184edb] transition-colors"
            />
          </div>
        </div>

        {/* Row 2: Action Buttons */}
        <div className="flex flex-wrap items-center justify-start gap-2.5">
          <button className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg text-[13.5px] cursor-pointer transition-all duration-200 bg-white">
            <Upload size={15} />
            <span>Import</span>
          </button>

          <button className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg text-[13.5px] cursor-pointer transition-all duration-200 bg-white">
            <Download size={15} />
            <span>Export</span>
            <ChevronDown size={14} className="text-slate-400 ml-0.5" />
          </button>

          <button
            onClick={() => { setIsRegistering(true); setIsEditing(false); setViewingDetails(false); }}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#184edb] hover:bg-[#143eb3] text-white font-semibold rounded-lg text-[13.5px] cursor-pointer transition-all duration-200 border-none shadow-sm"
          >
            <Plus size={16} />
            <span>Add Vehicle</span>
          </button>
        </div>
      </div>

      {/* Vehicles Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden w-full flex flex-col box-border">
        {/* Table Container */}
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse text-left text-slate-600">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-4 px-6 select-none">IMAGE</th>
                <th className="py-4 px-5 select-none">ID</th>
                <th className="py-4 px-5 select-none">VEHICLE DETAILS</th>
                <th className="py-4 px-5 select-none">ENGINE / CHASSIS</th>
                <th className="py-4 px-5 select-none">COLOR</th>
                <th className="py-4 px-5 select-none">PRICING</th>
                <th className="py-4 px-6 select-none">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[13.5px]">
              {filteredVehicles.map((v, idx) => (
                <tr
                  key={idx}
                  className={`hover:bg-slate-50/50 transition-colors cursor-pointer border-l-[3px] ${
                    v.status === 'Available' ? 'border-l-emerald-500' :
                    v.status === 'Reserved' ? 'border-l-amber-500' :
                    v.status === 'In Service' ? 'border-l-orange-500' :
                    v.status === 'Sold' ? 'border-l-sky-500' :
                    v.status === 'Out of Stock' ? 'border-l-rose-500' : 'border-l-transparent'
                  }`}
                  onClick={() => handleRowClick(v)}
                >
                  {/* Image column */}
                  <td className="py-4 px-6 min-w-[100px]">
                    <div className="bg-slate-50 border border-slate-100 rounded-lg overflow-hidden flex items-center justify-center w-[72px] h-[48px] p-0.5">
                      {v.imageUrl ? (
                        <img src={v.imageUrl} alt={v.model} className="w-full h-full object-cover rounded-md" />
                      ) : (
                        v.imageSvg
                      )}
                    </div>
                  </td>

                  {/* ID column */}
                  <td className="py-4 px-5 font-bold text-[#184edb] whitespace-nowrap">
                    {v.id}
                  </td>

                  {/* Vehicle Details column */}
                  <td className="py-4 px-5 whitespace-nowrap">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 text-[14.5px]">{v.model}</span>
                        <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded border ${
                          v.status === 'Available' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          v.status === 'Reserved' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          v.status === 'In Service' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                          v.status === 'Sold' ? 'bg-sky-50 text-sky-600 border-sky-100' :
                          v.status === 'Out of Stock' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                          'bg-slate-50 text-slate-600 border-slate-100'
                        }`}>
                          {v.status} {v.status === 'Available' && v.stock > 0 ? `(${v.stock})` : ''}
                        </span>
                      </div>
                      <span className="text-[12px] text-slate-500 font-medium">
                        {v.category} <span className="text-slate-400 mx-0.5">•</span> {v.statusText}
                      </span>
                    </div>
                  </td>

                  {/* Engine / Chassis column */}
                  <td className="py-4 px-5 font-mono text-[12px] whitespace-nowrap">
                    <div className="flex flex-col gap-0.5">
                      <div>
                        <span className="text-slate-400 font-sans font-semibold mr-1">ENG:</span>
                        <span className="text-slate-700 font-semibold">{v.eng}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-sans font-semibold mr-1">CHS:</span>
                        <span className="text-slate-700 font-semibold">{v.chs}</span>
                      </div>
                    </div>
                  </td>

                  {/* Color column */}
                  <td className="py-4 px-5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-slate-300"
                        style={{ backgroundColor: v.colorHex }}
                      />
                      <span className="text-slate-700 font-medium">{v.colorName}</span>
                    </div>
                  </td>

                  {/* Pricing column */}
                  <td className="py-4 px-5 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 text-[15px]">{v.price}</span>
                      <span className="text-[11.5px] text-emerald-600 font-semibold">
                        Sell: {v.sellPrice}
                      </span>
                    </div>
                  </td>

                  {/* Actions column */}
                  <td className="py-4 px-6 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          handleRowClick(v);
                        }}
                        title="View Vehicle Details"
                        className="p-1.5 bg-blue-50 border border-blue-100 rounded-md text-blue-600 hover:bg-blue-100 cursor-pointer flex items-center justify-center transition-colors shadow-xs"
                      >
                        <Eye size={13} />
                      </button>
                      <button 
                        onClick={() => {
                          setVehicleModel(v.model);
                          setRegNumber(v.id);
                          setChassisNumber(v.chs);
                          setEngineNumber(v.eng);
                          setVehicleStock(v.stock?.toString() || '0');
                          setVehicleStatus(v.status || 'Available');
                          setEditingVehicleId(v.id);
                          setIsEditing(true);
                          setIsRegistering(false);
                          setViewingDetails(false);
                        }}
                        title="Edit Vehicle Details"
                        className="p-1.5 bg-green-50 border border-green-100 rounded-md text-green-600 hover:bg-green-100 cursor-pointer flex items-center justify-center transition-colors shadow-xs"
                      >
                        <Edit size={13} />
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete vehicle ${v.id}?`)) {
                            fetch(`${API_URL}/api/vehicles/${encodeURIComponent(v.id)}`, { method: 'DELETE' })
                              .then(() => {
                                fetchVehicles();
                              })
                              .catch(err => console.error('Error deleting vehicle:', err));
                          }
                        }}
                        title="Delete Vehicle"
                        className="p-1.5 bg-red-50 border border-red-100 rounded-md text-red-600 hover:bg-red-100 cursor-pointer flex items-center justify-center transition-colors shadow-xs"
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

        {/* Table Footer / Pagination */}
        <div className="bg-[#f8fafc] border-t border-slate-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 w-full box-border">
          <span className="text-[13px] text-slate-500 font-medium">
            Showing 1 to {filteredVehicles.length} of {vehicles.length} entries
          </span>

          <div className="flex items-center gap-1.5">
            <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 cursor-pointer transition-colors">
              <ChevronLeft size={16} />
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#184edb] text-white font-bold text-[13.5px] border-none shadow-sm cursor-pointer">
              1
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-[13.5px] font-medium cursor-pointer transition-colors">
              2
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-[13.5px] font-medium cursor-pointer transition-colors">
              3
            </button>
            <span className="text-slate-400 px-1 text-[13px]">...</span>
            <button className="px-2.5 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-[13.5px] font-medium cursor-pointer transition-colors">
              312
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 cursor-pointer transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleInventory;
