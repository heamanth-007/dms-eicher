import React, { useState } from 'react';
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
  Clock,
  ExternalLink,
  Sliders,
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
}

export const VehicleInventory: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [viewingDetails, setViewingDetails] = useState(false);

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
  const [fuelType, setFuelType] = useState('Diesel');
  const [gvw, setGvw] = useState('16,020 KG');
  const [wheelbase, setWheelbase] = useState('4490 mm');
  const [transmission, setTransmission] = useState('6-Speed ET40S6');
  const [mfgYear, setMfgYear] = useState('2024');
  const [odometer, setOdometer] = useState('12450');

  // Register view form states
  const [regVehicleType, setRegVehicleType] = useState('Heavy Duty Truck');
  const [regBrand, setRegBrand] = useState('Eicher');
  const [regModel, setRegModel] = useState('');
  const [regColor, setRegColor] = useState('');
  const [regEngineNum, setRegEngineNum] = useState('');
  const [regChassisNum, setRegChassisNum] = useState('');
  const [regPurchaseDate, setRegPurchaseDate] = useState('');
  const [regPurchasePrice, setRegPurchasePrice] = useState('');
  const [regSellingPrice, setRegSellingPrice] = useState('');
  const [regStockLoc, setRegStockLoc] = useState('Main Warehouse (Bay A)');
  const [regRemarks, setRegRemarks] = useState('');

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

  const vehicles: VehicleType[] = [
    {
      id: '#VEH-8291',
      model: 'Eicher Pro 6028',
      category: 'Heavy Duty Truck',
      statusText: 'Brand New',
      eng: 'E694-TIC-12',
      chs: 'MC26028X1Y0034',
      colorName: 'Arctic White',
      colorHex: '#FFFFFF',
      price: '$42,500',
      sellPrice: '$48,200',
      status: 'Available',
      imageSvg: SemiTruckSVG
    },
    {
      id: '#VEH-7742',
      model: 'Volvo 9400 B11R',
      category: 'Coach Bus',
      statusText: 'Pre-booked',
      eng: 'D11C-410-EU5',
      chs: 'VLB11R4X2Y8822',
      colorName: 'Midnight Blue',
      colorHex: '#1E3A8A',
      price: '$185,000',
      sellPrice: '$210,000',
      status: 'Reserved',
      imageSvg: CoachBusSVG
    },
    {
      id: '#VEH-4410',
      model: 'Eicher Pro 2049',
      category: 'LCV',
      statusText: 'Service Mode',
      eng: 'E366-2L-BS6',
      chs: 'EC2049L3M9102',
      colorName: 'Silver Metallic',
      colorHex: '#94A3B8',
      price: '$22,400',
      sellPrice: '$26,100',
      status: 'In Service',
      imageSvg: LcvSVG
    },
    {
      id: '#VEH-1109',
      model: 'Eicher Pro 8031XM',
      category: 'Tipper Truck',
      statusText: 'Sold Out',
      eng: 'VEDX8-BS6-350',
      chs: 'T8031XM9Z2200',
      colorName: 'Traffic Yellow',
      colorHex: '#EAB308',
      price: '$98,000',
      sellPrice: '$112,000',
      status: 'Sold',
      imageSvg: TipperSVG
    },
    {
      id: '#VEH-1109',
      model: 'Eicher Pro 8031XM',
      category: 'Tipper Truck',
      statusText: 'Sold Out',
      eng: 'VEDX8-BS6-350',
      chs: 'T8031XM9Z2200',
      colorName: 'Traffic Yellow',
      colorHex: '#EAB308',
      price: '$98,000',
      sellPrice: '$112,000',
      status: 'Sold',
      imageSvg: TipperSVG
    },
    {
      id: '#VEH-1109',
      model: 'Eicher Pro 8031XM',
      category: 'Tipper Truck',
      statusText: 'Sold Out',
      eng: 'VEDX8-BS6-350',
      chs: 'T8031XM9Z2200',
      colorName: 'Traffic Yellow',
      colorHex: '#EAB308',
      price: '$98,000',
      sellPrice: '$112,000',
      status: 'Sold',
      imageSvg: TipperSVG
    }
  ];

  const handleRowClick = (_v: VehicleType) => {
    setViewingDetails(true);
    setIsEditing(false);
    setIsRegistering(false);
  };

  // Detailed view of the Vehicle (Titan 9000-X Excavator)
  if (viewingDetails) {
    return (
      <div className="flex-1 p-6 md:p-8 flex flex-col gap-6 bg-[#f6f8fc] overflow-y-auto box-border max-w-full font-sans">
        {/* Navigation Breadcrumb & Back button */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setViewingDetails(false)}
            className="flex items-center gap-2 text-[13px] text-slate-500 hover:text-[#184edb] font-semibold border-none bg-transparent cursor-pointer transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Inventory</span>
          </button>

          <button
            onClick={() => {
              setVehicleModel('Titan 9000-X Excavator');
              setRegNumber('TX-900-34882-B');
              setChassisNumber('EIC3015X2024KL9902');
              setEngineNumber('VDA-10376');
              setFuelType('Diesel');
              setGvw('12,500 KG');
              setWheelbase('4490 mm');
              setTransmission('Hydrostatic');
              setMfgYear('2025');
              setOdometer('0');
              setIsEditing(true);
              setViewingDetails(false);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#184edb] hover:bg-[#143eb3] text-white font-semibold rounded-lg text-[13.5px] cursor-pointer transition-colors border-none shadow-sm"
          >
            <Settings size={15} />
            <span>Edit Specifications</span>
          </button>
        </div>

        {/* Crawler excavator Header details */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] font-bold text-[#184edb] tracking-wider uppercase">HEAVY DUTY • CRAWLER</span>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 m-0 font-heading tracking-tight">
              Titan 9000-X Excavator
            </h1>
            <span className="text-slate-500 text-[13px] font-medium font-mono">
              Serial #: TX-900-34882-B
            </span>
          </div>

          <div className="flex flex-col text-left sm:text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">MSRP LIST PRICE</span>
            <span className="text-2xl md:text-3xl font-extrabold text-[#184edb] tracking-tight">
              $184,500.00
            </span>
          </div>
        </div>

        {/* Main Info Blocks (Visuals and Spec Highlights) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch w-full box-border">
          {/* Visual Container */}
          <div className="lg:col-span-1 rounded-xl overflow-hidden border border-slate-200 relative min-h-[220px] bg-slate-100 flex items-center justify-center">
            {ExcavatorDetailsSVG}
            <span className="absolute top-4 right-4 bg-emerald-50 text-emerald-600 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Available
            </span>
          </div>

          {/* Quick Specs Highlight Box */}
          <div className="lg:col-span-2 flex flex-col justify-between gap-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
              {/* Brand */}
              <div className="bg-[#f1f3fa] rounded-xl p-4 flex flex-col gap-1.5 border border-slate-150">
                <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Brand</span>
                <span className="text-[16px] font-bold text-slate-800">Titan Motors</span>
              </div>
              {/* Year */}
              <div className="bg-[#f1f3fa] rounded-xl p-4 flex flex-col gap-1.5 border border-slate-150">
                <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Year</span>
                <span className="text-[16px] font-bold text-slate-800">2025</span>
              </div>
              {/* Engine */}
              <div className="bg-[#f1f3fa] rounded-xl p-4 flex flex-col gap-1.5 border border-slate-150">
                <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Engine</span>
                <span className="text-[16px] font-bold text-slate-800">VDA-10376</span>
              </div>
              {/* Condition */}
              <div className="bg-[#f1f3fa] rounded-xl p-4 flex flex-col gap-1.5 border border-slate-150">
                <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Condition</span>
                <span className="text-[16px] font-bold text-slate-800">Pristine</span>
              </div>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3">
              <span className="bg-[#eff2fc] text-slate-700 text-[13px] font-semibold px-4 py-2 rounded-lg flex items-center gap-2 border border-[#d2d9f9]">
                <Clock size={16} className="text-[#184edb]" />
                0 Operating Hours
              </span>
              <span className="bg-[#eff2fc] text-slate-700 text-[13px] font-semibold px-4 py-2 rounded-lg flex items-center gap-2 border border-[#d2d9f9]">
                <Sliders size={16} className="text-[#184edb]" />
                450 HP Engine
              </span>
              <span className="bg-[#eff2fc] text-slate-700 text-[13px] font-semibold px-4 py-2 rounded-lg flex items-center gap-2 border border-[#d2d9f9]">
                <Wrench size={16} className="text-[#184edb]" />
                12,500 KG Weight
              </span>
            </div>
          </div>
        </div>

        {/* Pricing Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {/* Purchase Price */}
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-l-[#184edb] flex flex-col justify-between min-h-[96px] box-border">
            <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">PURCHASE PRICE</span>
            <span className="text-2xl font-bold text-slate-800 tracking-tight">₹ 28,150,000</span>
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium mt-1">
              <Info size={13} />
              <span>Incl. Tax & Logistics</span>
            </div>
          </div>

          {/* Selling Price */}
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-l-[#184edb] flex flex-col justify-between min-h-[96px] box-border">
            <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">SELLING PRICE</span>
            <span className="text-2xl font-bold text-slate-800 tracking-tight">₹ 34,500,000</span>
            <div className="mt-1">
              <span className="bg-blue-50 text-[#184edb] text-[9.5px] font-bold px-2 py-0.5 rounded-full border border-blue-100 uppercase">
                LATEST QUOTE
              </span>
            </div>
          </div>

          {/* Profit Margin */}
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-l-emerald-500 flex flex-col justify-between min-h-[96px] box-border">
            <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">PROFIT MARGIN</span>
            <span className="text-2xl font-bold text-emerald-600 tracking-tight">₹ 6,350,000</span>
            <span className="text-[11px] text-slate-450 font-medium mt-1">
              ~22.5% Gross Margin
            </span>
          </div>

          {/* Inventory Value */}
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-l-rose-500 flex flex-col justify-between min-h-[96px] box-border">
            <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">INVENTORY VALUE</span>
            <span className="text-2xl font-bold text-slate-800 tracking-tight">₹ 142.4 Cr</span>
            <span className="text-[11px] text-slate-400 font-medium mt-1">
              Current Total Assets
            </span>
          </div>
        </div>

        {/* Technical Specs Detail Card */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col gap-5 w-full box-border">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <h2 className="text-[16px] font-bold text-slate-800 m-0">
              Technical Specifications
            </h2>
            <div className="text-slate-400 hover:text-[#184edb] cursor-pointer">
              <ExternalLink size={16} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 text-[14px]">
            {/* Column 1 */}
            <div className="flex flex-col gap-3.5">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-55">
                <span className="text-slate-505 font-medium">Fuel Tank Capacity</span>
                <span className="font-bold text-slate-800">450 Liters</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-55">
                <span className="text-slate-505 font-medium">Transmission</span>
                <span className="font-bold text-slate-800">Hydrostatic</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-55">
                <span className="text-slate-505 font-medium">Emission Level</span>
                <span className="font-bold text-slate-800">Tier 4 Final</span>
              </div>
            </div>

            {/* Column 2 */}
            <div className="flex flex-col gap-3.5">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-55">
                <span className="text-slate-505 font-medium">Max Digging Depth</span>
                <span className="font-bold text-slate-800">7.2 Meters</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-55">
                <span className="text-slate-505 font-medium">Bucket Capacity</span>
                <span className="font-bold text-slate-800">1.4 m³</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-55">
                <span className="text-slate-505 font-medium">Drive Type</span>
                <span className="font-bold text-slate-800">Crawler Track</span>
              </div>
            </div>
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
                      <option value="Heavy Duty Truck">Heavy Duty Truck</option>
                      <option value="Coach Bus">Coach Bus</option>
                      <option value="LCV">LCV</option>
                      <option value="Tipper Truck">Tipper Truck</option>
                    </select>
                    <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 pointer-events-none">
                      <ChevronDown size={16} />
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Brand</label>
                  <input
                    type="text"
                    value={regBrand}
                    onChange={(e) => setRegBrand(e.target.value)}
                    className="w-full px-4 py-2.5 text-[14px] bg-[#fff] border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#184edb] transition-colors"
                  />
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
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Purchase Date</label>
                  <input
                    type="text"
                    placeholder="mm/dd/yyyy"
                    value={regPurchaseDate}
                    onChange={(e) => setRegPurchaseDate(e.target.value)}
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
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Vehicle Image</span>
                <div className="flex-1 min-h-[220px] bg-[#f4f6ff] border-2 border-dashed border-[#d2d9f9] rounded-xl flex flex-col items-center justify-center p-6 text-center text-slate-500 hover:border-[#184edb] transition-colors cursor-pointer group">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#184edb] shadow-sm mb-4 group-hover:scale-105 transition-transform">
                    <Camera size={22} />
                  </div>
                  <span className="text-[14px] font-bold text-slate-800 mb-1">Drop image here or click to upload</span>
                  <span className="text-[12px] text-slate-400 font-medium">PNG, JPG up to 10MB</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="bg-[#eef2ff] text-[#184edb] p-2 rounded-lg flex items-center justify-center">
                <ImageIcon size={18} />
              </div>
              <h2 className="text-[16px] font-bold text-slate-800 m-0">
                Inventory & Logistics
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Stock Location</label>
                <div className="relative">
                  <select
                    value={regStockLoc}
                    onChange={(e) => setRegStockLoc(e.target.value)}
                    className="w-full appearance-none bg-[#fff] border border-slate-200 rounded-lg py-2.5 pl-4 pr-10 text-[14px] text-slate-850 font-medium cursor-pointer focus:outline-none focus:border-[#184edb] transition-colors"
                  >
                    <option value="Main Warehouse (Bay A)">Main Warehouse (Bay A)</option>
                    <option value="Offsite Lot B">Offsite Lot B</option>
                    <option value="Staging Lot C">Staging Lot C</option>
                  </select>
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 pointer-events-none">
                    <ChevronDown size={16} />
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Remarks / Additional Notes</label>
                <textarea
                  placeholder="Mention any specific accessories, pre-existing conditions, or delivery notes..."
                  value={regRemarks}
                  onChange={(e) => setRegRemarks(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 text-[14px] bg-[#fff] border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#184edb] transition-colors resize-none font-sans"
                />
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
              onClick={() => setIsRegistering(false)}
              className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-[#184edb] font-semibold rounded-lg text-[13.5px] cursor-pointer transition-all bg-white"
            >
              <PlusCircle size={15} />
              <span>Save & Add Another</span>
            </button>

            <button
              onClick={() => setIsRegistering(false)}
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
              onClick={() => { setIsEditing(false); setViewingDetails(vehicleModel === 'Titan 9000-X Excavator'); }}
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
              </div>
            </div>

            {/* Technical Specifications */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col gap-5 box-border">
              <div className="flex items-center gap-3 pb-3.5 border-b border-slate-100">
                <div className="bg-[#eef2ff] text-[#184edb] p-2 rounded-lg flex items-center justify-center">
                  <Settings size={18} />
                </div>
                <h2 className="text-[16px] font-bold text-slate-800 m-0">
                  Technical Specifications
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">FUEL TYPE</label>
                  <div className="relative">
                    <select
                      value={fuelType}
                      onChange={(e) => setFuelType(e.target.value)}
                      className="w-full appearance-none bg-[#fff] border border-slate-200 rounded-lg py-2.5 pl-4 pr-10 text-[14px] text-slate-850 font-medium cursor-pointer focus:outline-none focus:border-[#184edb] transition-colors"
                    >
                      <option value="Diesel">Diesel</option>
                      <option value="Petrol">Petrol</option>
                      <option value="CNG">CNG</option>
                      <option value="Electric">Electric</option>
                    </select>
                    <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 pointer-events-none">
                      <ChevronDown size={16} />
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">GVW (GROSS VEHICLE WEIGHT)</label>
                  <input
                    type="text"
                    value={gvw}
                    onChange={(e) => setGvw(e.target.value)}
                    className="w-full px-4 py-2.5 text-[14px] bg-[#fff] border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#184edb] transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">WHEELBASE</label>
                  <input
                    type="text"
                    value={wheelbase}
                    onChange={(e) => setWheelbase(e.target.value)}
                    className="w-full px-4 py-2.5 text-[14px] bg-[#fff] border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#184edb] transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">TRANSMISSION</label>
                  <input
                    type="text"
                    value={transmission}
                    onChange={(e) => setTransmission(e.target.value)}
                    className="w-full px-4 py-2.5 text-[14px] bg-[#fff] border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#184edb] transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">MANUFACTURING YEAR</label>
                  <input
                    type="text"
                    value={mfgYear}
                    onChange={(e) => setMfgYear(e.target.value)}
                    className="w-full px-4 py-2.5 text-[14px] bg-[#fff] border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#184edb] transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">ODOMETER (KM)</label>
                  <input
                    type="text"
                    value={odometer}
                    onChange={(e) => setOdometer(e.target.value)}
                    className="w-full px-4 py-2.5 text-[14px] bg-[#fff] border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#184edb] transition-colors"
                  />
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

          <div className="flex flex-col gap-6">
            {/* Inventory Insights */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col gap-5 box-border">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-[16px] font-bold text-slate-850 m-0">
                  Inventory Insights
                </h2>
                <span className="bg-emerald-50 text-emerald-600 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-100">
                  In Stock
                </span>
              </div>

              <div className="bg-[#f3f4f6] rounded-lg p-3.5 flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">LAST SYSTEM UPDATE</span>
                <span className="text-[13.5px] font-bold text-slate-800">Oct 24, 2023 • 14:22 PM</span>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">INVENTORY HISTORY</span>
                <div className="border border-slate-100 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-[12.5px]">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                        <th className="py-2.5 px-4 font-semibold">Action</th>
                        <th className="py-2.5 px-4 font-semibold">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                      <tr>
                        <td className="py-2.5 px-4">Procurement</td>
                        <td className="py-2.5 px-4 text-slate-500">22/10/23</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4">QC Passed</td>
                        <td className="py-2.5 px-4 text-slate-500">23/10/23</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">PRICE HISTORY</span>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between p-3 border border-slate-150 rounded-lg">
                    <div className="flex flex-col">
                      <span className="text-[12.5px] font-bold text-slate-800">Current MSRP</span>
                      <span className="text-[10px] text-slate-400 font-medium">Changed on 15 Oct</span>
                    </div>
                    <span className="text-lg font-bold text-[#184edb]">₹24.50L</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-slate-100 rounded-lg bg-slate-50/50">
                    <div className="flex flex-col">
                      <span className="text-[12.5px] font-medium text-slate-500">Previous MSRP</span>
                      <span className="text-[10px] text-slate-400 font-medium">Effective 1 Jan</span>
                    </div>
                    <span className="text-[15px] font-bold text-slate-500">₹23.85L</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">STATUS TIMELINE</span>
                <div className="flex flex-col pl-2.5 relative border-l border-slate-200 gap-6 ml-1.5">
                  <div className="relative flex flex-col gap-0.5">
                    <span className="absolute -left-[15px] top-1.5 w-2 h-2 rounded-full bg-[#184edb] border-4 border-blue-100" />
                    <span className="text-[13px] font-bold text-slate-800">Arrival at Workshop</span>
                    <span className="text-[11px] text-slate-400 font-medium">Oct 20, 2023</span>
                  </div>
                  <div className="relative flex flex-col gap-0.5">
                    <span className="absolute -left-[14px] top-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 ring-4 ring-white" />
                    <span className="text-[13px] font-bold text-slate-650">Diagnostic Phase</span>
                    <span className="text-[11px] text-slate-400 font-medium">Oct 21, 2023</span>
                  </div>
                  <div className="relative flex flex-col gap-0.5">
                    <span className="absolute -left-[14px] top-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 ring-4 ring-white" />
                    <span className="text-[13px] font-bold text-slate-650">Scheduled for Service</span>
                    <span className="text-[11px] text-slate-400 font-medium">Oct 25, 2023</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Lifecycle */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col gap-4 box-border">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">SERVICE LIFECYCLE</span>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-[12px] font-semibold text-slate-500">
                  <span>Arrival</span>
                  <span>Ready</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#184edb] h-full w-1/2" />
                </div>
              </div>

              <div className="text-center pt-2">
                <span className="text-[13.5px] font-bold text-[#184edb]">
                  Currently: Diagnostic
                </span>
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
            <span className="text-2xl font-bold text-slate-800 tracking-tight">1,248</span>
          </div>
          <div className="bg-[#eef2ff] text-[#184edb] p-2.5 rounded-lg flex items-center justify-center">
            <LayoutDashboard size={20} />
          </div>
        </div>

        {/* Card 2: Available */}
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-l-emerald-500 flex items-center justify-between min-h-[96px] box-border">
          <div className="flex flex-col gap-1">
            <span className="text-slate-500 text-[12.5px] font-semibold uppercase tracking-wider">Available</span>
            <span className="text-2xl font-bold text-slate-800 tracking-tight">432</span>
          </div>
          <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-lg flex items-center justify-center">
            <CheckCircle size={20} />
          </div>
        </div>

        {/* Card 3: Reserved */}
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-l-amber-500 flex items-center justify-between min-h-[96px] box-border">
          <div className="flex flex-col gap-1">
            <span className="text-slate-500 text-[12.5px] font-semibold uppercase tracking-wider">Reserved</span>
            <span className="text-2xl font-bold text-slate-800 tracking-tight">156</span>
          </div>
          <div className="bg-amber-50 text-amber-600 p-2.5 rounded-lg flex items-center justify-center">
            <Bookmark size={20} />
          </div>
        </div>

        {/* Card 4: Sold */}
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-l-sky-500 flex items-center justify-between min-h-[96px] box-border">
          <div className="flex flex-col gap-1">
            <span className="text-slate-500 text-[12.5px] font-semibold uppercase tracking-wider">Sold</span>
            <span className="text-2xl font-bold text-slate-800 tracking-tight">620</span>
          </div>
          <div className="bg-sky-50 text-sky-600 p-2.5 rounded-lg flex items-center justify-center">
            <ShoppingCart size={20} />
          </div>
        </div>

        {/* Card 5: In Service */}
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-l-orange-500 flex items-center justify-between min-h-[96px] box-border">
          <div className="flex flex-col gap-1">
            <span className="text-slate-500 text-[12.5px] font-semibold uppercase tracking-wider">In Service</span>
            <span className="text-2xl font-bold text-slate-800 tracking-tight">40</span>
          </div>
          <div className="bg-orange-50 text-orange-600 p-2.5 rounded-lg flex items-center justify-center">
            <Wrench size={20} />
          </div>
        </div>

        {/* Card 6: Total Inventory Value */}
        <div className="bg-[#184edb] rounded-xl p-4 shadow-md flex items-center justify-between min-h-[96px] text-white box-border">
          <div className="flex flex-col gap-1">
            <span className="text-blue-100 text-[12.5px] font-semibold uppercase tracking-wider">Total Inventory Value</span>
            <span className="text-2xl font-bold tracking-tight">₹14.2M</span>
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
              {vehicles.map((v, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                  onClick={() => handleRowClick(v)}
                >
                  {/* Image column */}
                  <td className="py-4 px-6 min-w-[100px]">
                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-1.5 flex items-center justify-center w-[72px] h-[48px]">
                      {v.imageSvg}
                    </div>
                  </td>

                  {/* ID column */}
                  <td className="py-4 px-5 font-bold text-[#184edb] whitespace-nowrap">
                    {v.id}
                  </td>

                  {/* Vehicle Details column */}
                  <td className="py-4 px-5 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 text-[14.5px]">{v.model}</span>
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
                            alert(`Vehicle ${v.id} deleted successfully (mock delete).`);
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
            Showing 1 to 4 of 1,248 entries
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
