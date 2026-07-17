import React, { useState } from 'react';
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
  Eye,
  Car,
  Download
} from 'lucide-react';
import brakePadsPhoto from '../assets/brake_pads_photo.png';
import brakePadsBlueprint from '../assets/brake_pads_blueprint.png';

interface PartType {
  partNumber: string;
  partName: string;
  category: string;
  brand: string;
  hsnCode: string;
  gstPercent: string;
  purchasePrice: string;
  salePrice: string;
  stock: string;
  stockStatus: 'normal' | 'low' | 'out';
}

export const SpareParts: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'history' | 'live' | 'orders'>('live');
  const [isAdding, setIsAdding] = useState(false);
  const [editingPart, setEditingPart] = useState<string | null>(null);
  const [uom, setUom] = useState<'Piece' | 'Box' | 'Set'>('Piece');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedBrand, setSelectedBrand] = useState('All Brands');
  const [statusTab, setStatusTab] = useState<'All' | 'In Stock' | 'Low Stock' | 'Out of Stock'>('All');

  const partsData: PartType[] = [
    {
      partNumber: 'SP-99231-A',
      partName: 'Oil Filter Premium',
      category: 'Consumables',
      brand: 'Bosch',
      hsnCode: '842123',
      gstPercent: '18%',
      purchasePrice: '$12.50',
      salePrice: '$24.99',
      stock: '1,240',
      stockStatus: 'normal'
    },
    {
      partNumber: 'BR-44102-X',
      partName: 'Ceramic Brake Pads Rear',
      category: 'Braking System',
      brand: 'Brembo',
      hsnCode: '870830',
      gstPercent: '12%',
      purchasePrice: '$85.00',
      salePrice: '$149.00',
      stock: '12',
      stockStatus: 'low'
    },
    {
      partNumber: 'EL-10552-C',
      partName: 'Iridium Spark Plug (Set of 4)',
      category: 'Electrical',
      brand: 'NGK',
      hsnCode: '851110',
      gstPercent: '18%',
      purchasePrice: '$42.20',
      salePrice: '$78.50',
      stock: '0',
      stockStatus: 'out'
    },
    {
      partNumber: 'SU-77021-M',
      partName: 'Front Shock Absorber',
      category: 'Suspension',
      brand: 'Monroe',
      hsnCode: '870880',
      gstPercent: '18%',
      purchasePrice: '$115.00',
      salePrice: '$195.00',
      stock: '45',
      stockStatus: 'normal'
    }
  ];

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
              onClick={() => setEditingPart(null)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-red-50 border border-red-200 text-[#dc2626] font-bold rounded-lg text-[13.5px] cursor-pointer transition-colors shadow-sm"
            >
              <Trash2 size={16} />
              <span>Delete Spare Part</span>
            </button>
            <button
              onClick={() => setEditingPart(null)}
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
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden w-full flex flex-col box-border shadow-sm">
              <div className="bg-white border-b border-slate-150 px-6 py-4.5 flex items-center gap-2.5">
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
                      defaultValue="Brake Pad - Front"
                      className="w-full px-4 py-2.5 text-[14px] bg-[#f1f4fd] border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:border-[#184edb] transition-colors"
                    />
                  </div>

                  {/* Part Number / SKU */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[11.5px] font-bold text-slate-800 uppercase tracking-wider font-sans">Part Number / SKU</label>
                    <input
                      type="text"
                      defaultValue="BP-FR-2024-X"
                      className="w-full px-4 py-2.5 text-[14px] bg-[#f1f4fd] border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:border-[#184edb] transition-colors"
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {/* Category */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[11.5px] font-bold text-slate-800 uppercase tracking-wider font-sans">Category</label>
                    <div className="relative">
                      <select
                        className="w-full appearance-none bg-white border border-slate-255 rounded-lg py-2.5 pl-4 pr-10 text-[14px] text-slate-700 font-semibold cursor-pointer focus:outline-none focus:border-[#184edb] transition-colors"
                        defaultValue="Braking System"
                      >
                        <option>Braking System</option>
                      </select>
                      <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 pointer-events-none">
                        <ChevronDown size={18} />
                      </span>
                    </div>
                  </div>

                  {/* Manufacturer */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[11.5px] font-bold text-slate-800 uppercase tracking-wider font-sans">Manufacturer</label>
                    <input
                      type="text"
                      defaultValue="Brembo Tech"
                      className="w-full px-4 py-2.5 text-[14px] bg-[#f1f4fd] border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:border-[#184edb] transition-colors"
                    />
                  </div>

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
                  <label className="text-[11.5px] font-bold text-slate-800 uppercase tracking-wider font-sans">Purchase Price ($)</label>
                  <input
                    type="text"
                    defaultValue="$ 45.00"
                    className="w-full px-4 py-2.5 text-[14px] bg-[#f1f4fd] border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:border-[#184edb] transition-colors"
                  />
                </div>

                {/* Selling Price */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11.5px] font-bold text-slate-800 uppercase tracking-wider font-sans">Selling Price ($)</label>
                  <input
                    type="text"
                    defaultValue="$ 89.99"
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
                    defaultValue="20"
                    className="w-full px-4 py-2.5 text-[14px] bg-[#f1f4fd] border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:border-[#184edb] transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Part Media & Specifications Card (Full Width) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-4 box-border shadow-sm w-full">
          <div className="flex items-center gap-2.5">
            <Image size={18} className="text-[#184edb]" />
            <span className="font-bold text-slate-800 text-[14.5px]">Part Media & Specifications</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Card 1: Brake Pads Photo */}
            <div className="border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center bg-white min-h-[160px] max-h-[180px] p-2 box-border relative shadow-sm">
              <img
                src={brakePadsPhoto}
                alt="Brake Pad Photo"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>

            {/* Card 2: Brake Pads Blueprint */}
            <div className="border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center bg-white min-h-[160px] max-h-[180px] p-2 box-border relative shadow-sm">
              <img
                src={brakePadsBlueprint}
                alt="Brake Pad Blueprint"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>

            {/* Card 3: Add Media block */}
            <div className="border border-dashed border-slate-250 rounded-xl p-5 flex flex-col items-center justify-center gap-2 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer min-h-[160px] max-h-[180px] box-border">
              <div className="text-slate-450">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
              </div>
              <span className="text-[12.5px] text-slate-500 font-extrabold tracking-wide uppercase">
                ADD MEDIA
              </span>
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
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden w-full flex flex-col box-border shadow-sm">
              <div className="bg-white border-b border-slate-150 px-6 py-4.5 flex items-center gap-2.5">
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
                      placeholder="e.g. Front Brake Pads"
                      className="w-full px-4 py-2.5 text-[14px] bg-white border border-slate-255 rounded-lg text-slate-850 focus:outline-none focus:border-[#184edb] transition-colors"
                    />
                  </div>

                  {/* Category */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[11.5px] font-bold text-slate-800 uppercase tracking-wider">Category</label>
                    <div className="relative">
                      <select
                        className="w-full appearance-none bg-white border border-slate-255 rounded-lg py-2.5 pl-4 pr-10 text-[14px] text-slate-505 font-medium cursor-pointer focus:outline-none focus:border-[#184edb] transition-colors"
                      >
                        <option>Select Category</option>
                      </select>
                      <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-505 pointer-events-none">
                        <ChevronDown size={18} />
                      </span>
                    </div>
                  </div>

                  {/* Brand */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[11.5px] font-bold text-slate-800 uppercase tracking-wider">Brand</label>
                    <div className="relative">
                      <select
                        className="w-full appearance-none bg-white border border-slate-255 rounded-lg py-2.5 pl-4 pr-10 text-[14px] text-slate-505 font-medium cursor-pointer focus:outline-none focus:border-[#184edb] transition-colors"
                      >
                        <option>Select Brand</option>
                      </select>
                      <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-505 pointer-events-none">
                        <ChevronDown size={18} />
                      </span>
                    </div>
                  </div>
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
                    <label className="text-[11.5px] font-bold text-slate-800 uppercase tracking-wider">Purchase Price ($)</label>
                    <input
                      type="text"
                      placeholder="0.00"
                      className="w-full px-4 py-2.5 text-[14px] bg-white border border-slate-255 rounded-lg text-slate-850 focus:outline-none focus:border-[#184edb] transition-colors"
                    />
                  </div>

                  {/* Sale Price */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[11.5px] font-bold text-slate-800 uppercase tracking-wider">Sale Price ($)</label>
                    <input
                      type="text"
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
                    <label className="text-[11.5px] font-bold text-slate-800 uppercase tracking-wider">HSN Code</label>
                    <input
                      type="text"
                      placeholder="e.g. 8708"
                      className="w-full px-4 py-2.5 text-[14px] bg-white border border-slate-255 rounded-lg text-slate-855 focus:outline-none focus:border-[#184edb] transition-colors"
                    />
                  </div>

                  {/* GST */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[11.5px] font-bold text-slate-800 uppercase tracking-wider">GST (%)</label>
                    <div className="relative">
                      <select
                        className="w-full appearance-none bg-white border border-slate-255 rounded-lg py-2.5 pl-4 pr-10 text-[14px] text-[#184edb] font-bold cursor-pointer focus:outline-none focus:border-[#184edb] transition-colors"
                      >
                        <option>18% (Standard)</option>
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
                      placeholder="0"
                      className="w-full pl-4 pr-16 py-2.5 text-[14px] bg-white border border-slate-255 rounded-lg text-slate-850 focus:outline-none focus:border-[#184edb] transition-colors font-semibold"
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
                onClick={() => setIsAdding(false)}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-white hover:bg-slate-50 text-[#184edb] font-bold rounded-lg text-[14px] cursor-pointer transition-colors border-none shadow-sm"
              >
                <Save size={16} />
                <span>Save Changes</span>
              </button>
              <button
                onClick={() => setIsAdding(false)}
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
          <button
            onClick={() => setActiveSubTab('orders')}
            className={`pb-1.5 text-[14px] font-bold border-none bg-transparent cursor-pointer transition-all ${
              activeSubTab === 'orders'
                ? 'text-[#184edb] border-b-2 border-solid border-[#184edb] font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Purchase Orders
          </button>
        </div>
      </div>

      {activeSubTab === 'history' ? (
        <div className="flex-1 p-6 md:p-8 flex flex-col gap-6 bg-[#f6f8fc] overflow-y-auto box-border max-w-full font-sans">
          {/* Header Block */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-bold text-slate-900 m-0 font-heading tracking-tight animate-in fade-in slide-in-from-top-3 duration-300">
                Inventory History & Timeline
              </h1>
              <span className="text-slate-500 text-[14px] font-medium">
                Trace every part movement, purchase, and sale across your enterprise.
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-5 py-2.5 bg-[#184edb] hover:bg-[#143eb3] text-white font-bold rounded-lg text-[13.5px] border-none shadow-sm cursor-pointer transition-colors">
                <Download size={15} />
                <span>Export Report</span>
              </button>
              <button className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-lg text-[13.5px] cursor-pointer transition-colors shadow-sm">
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
                  placeholder="mm/dd/yyyy"
                  className="w-full px-3 py-2.5 text-[13.5px] bg-[#f1f4fd] border border-slate-200 rounded-lg text-slate-650 font-semibold focus:outline-none"
                />
                <span className="text-slate-400 font-bold text-[13px]">to</span>
                <input
                  type="text"
                  placeholder="mm/dd/yyyy"
                  className="w-full px-3 py-2.5 text-[13.5px] bg-[#f1f4fd] border border-slate-200 rounded-lg text-slate-655 font-semibold focus:outline-none"
                />
              </div>
            </div>

            {/* Transaction Type */}
            <div className="bg-white rounded-xl border border-slate-200 p-4.5 shadow-sm flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Transaction Type</label>
              <div className="relative">
                <select
                  className="w-full appearance-none bg-[#f1f4fd] border border-slate-200 rounded-lg py-2.5 pl-4 pr-10 text-[13.5px] text-slate-700 font-semibold cursor-pointer focus:outline-none"
                >
                  <option>All Types</option>
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
                  className="w-full appearance-none bg-[#f1f4fd] border border-slate-200 rounded-lg py-2.5 pl-4 pr-10 text-[13.5px] text-slate-700 font-semibold cursor-pointer focus:outline-none"
                >
                  <option>All Categories</option>
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
                  placeholder="Enter part name or SKU..."
                  className="w-full pl-9 pr-4 py-2.5 text-[13.5px] bg-[#f1f4fd] border border-slate-200 rounded-lg text-slate-850 focus:outline-none font-semibold"
                />
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                </span>
              </div>
            </div>
          </div>

          {/* Timeline History Table */}
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
                    <th className="py-4.5 px-5 select-none font-bold">UPDATED BY</th>
                    <th className="py-4.5 px-6 select-none font-bold text-center">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[14px]">
                  {/* Row 1 */}
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4.5 px-6 whitespace-nowrap text-slate-700">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-slate-800">Oct 24, 2023</span>
                        <span className="text-[12px] text-slate-400 font-bold">09:15 AM</span>
                      </div>
                    </td>
                    <td className="py-4.5 px-5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-50 text-[#184edb] p-2.5 rounded-lg border border-blue-100">
                          <Car size={16} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-slate-805">Ceramic Brake Pads</span>
                          <span className="text-[11.5px] text-slate-400 font-bold">SKU: BP-9921-X</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4.5 px-5 whitespace-nowrap">
                      <span className="bg-red-50 text-red-600 px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-wide">
                        SALE
                      </span>
                    </td>
                    <td className="py-4.5 px-5 whitespace-nowrap text-center text-slate-400 font-medium">-</td>
                    <td className="py-4.5 px-5 whitespace-nowrap text-center text-red-600 font-bold">2</td>
                    <td className="py-4.5 px-5 whitespace-nowrap text-center text-slate-800 font-bold">48</td>
                    <td className="py-4.5 px-5 whitespace-nowrap font-bold text-[#184edb]">#INV-88291</td>
                    <td className="py-4.5 px-5 whitespace-nowrap">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-slate-800">J. Carter</span>
                        <span className="text-[11.5px] text-slate-400 font-bold uppercase tracking-wider">STOREFRONT</span>
                      </div>
                    </td>
                    <td className="py-4.5 px-6 whitespace-nowrap text-center text-slate-450 hover:text-[#184edb] cursor-pointer transition-colors">
                      <Eye size={16} />
                    </td>
                  </tr>

                  {/* Row 2 */}
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4.5 px-6 whitespace-nowrap text-slate-700">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-slate-800">Oct 24, 2023</span>
                        <span className="text-[12px] text-slate-400 font-bold">08:00 AM</span>
                      </div>
                    </td>
                    <td className="py-4.5 px-5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-50 text-[#184edb] p-2.5 rounded-lg border border-blue-100">
                          <Package size={16} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-slate-805">Synthetic Oil 5W-30</span>
                          <span className="text-[11.5px] text-slate-400 font-bold">SKU: OIL-SY-05</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4.5 px-5 whitespace-nowrap">
                      <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-wide">
                        PURCHASE
                      </span>
                    </td>
                    <td className="py-4.5 px-5 whitespace-nowrap text-center text-blue-650 font-bold">120</td>
                    <td className="py-4.5 px-5 whitespace-nowrap text-center text-slate-400 font-medium">-</td>
                    <td className="py-4.5 px-5 whitespace-nowrap text-center text-slate-800 font-bold">340</td>
                    <td className="py-4.5 px-5 whitespace-nowrap font-bold text-[#184edb]">#PO-22105</td>
                    <td className="py-4.5 px-5 whitespace-nowrap">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-slate-800">A. Chen</span>
                        <span className="text-[11.5px] text-slate-400 font-bold uppercase tracking-wider">WAREHOUSE</span>
                      </div>
                    </td>
                    <td className="py-4.5 px-6 whitespace-nowrap text-center text-slate-450 hover:text-[#184edb] cursor-pointer transition-colors">
                      <Eye size={16} />
                    </td>
                  </tr>

                  {/* Row 3 */}
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4.5 px-6 whitespace-nowrap text-slate-700">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-slate-805">Oct 23, 2023</span>
                        <span className="text-[12px] text-slate-400 font-bold">04:45 PM</span>
                      </div>
                    </td>
                    <td className="py-4.5 px-5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-50 text-[#184edb] p-2.5 rounded-lg border border-blue-100">
                          <Layers size={16} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-slate-805">NGK Spark Plug</span>
                          <span className="text-[11.5px] text-slate-400 font-bold">SKU: NGK-77-P</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4.5 px-5 whitespace-nowrap">
                      <span className="bg-purple-50 text-purple-650 px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-wide">
                        ADJUSTMENT
                      </span>
                    </td>
                    <td className="py-4.5 px-5 whitespace-nowrap text-center text-slate-400 font-medium">-</td>
                    <td className="py-4.5 px-5 whitespace-nowrap text-center text-purple-650 font-bold">4</td>
                    <td className="py-4.5 px-5 whitespace-nowrap text-center text-slate-800 font-bold">86</td>
                    <td className="py-4.5 px-5 whitespace-nowrap font-bold text-[#184edb]">#ADJ-901</td>
                    <td className="py-4.5 px-5 whitespace-nowrap">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-slate-800">M. Rodriguez</span>
                        <span className="text-[11.5px] text-slate-400 font-bold uppercase tracking-wider">QC AUDIT</span>
                      </div>
                    </td>
                    <td className="py-4.5 px-6 whitespace-nowrap text-center text-slate-450 hover:text-[#184edb] cursor-pointer transition-colors">
                      <Eye size={16} />
                    </td>
                  </tr>

                  {/* Row 4 */}
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4.5 px-6 whitespace-nowrap text-slate-700">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-slate-805">Oct 23, 2023</span>
                        <span className="text-[12px] text-slate-400 font-bold">11:20 AM</span>
                      </div>
                    </td>
                    <td className="py-4.5 px-5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-50 text-[#184edb] p-2.5 rounded-lg border border-blue-100">
                          <Package size={16} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-slate-805">Car Battery 12V</span>
                          <span className="text-[11.5px] text-slate-400 font-bold">SKU: BAT-XP-12</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4.5 px-5 whitespace-nowrap">
                      <span className="bg-slate-100 text-slate-650 px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-wide">
                        RETURN
                      </span>
                    </td>
                    <td className="py-4.5 px-5 whitespace-nowrap text-center text-slate-800 font-bold">1</td>
                    <td className="py-4.5 px-5 whitespace-nowrap text-center text-slate-400 font-medium">-</td>
                    <td className="py-4.5 px-5 whitespace-nowrap text-center text-slate-800 font-bold">14</td>
                    <td className="py-4.5 px-5 whitespace-nowrap font-bold text-[#184edb]">#RET-452</td>
                    <td className="py-4.5 px-5 whitespace-nowrap">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-slate-805">S. Williams</span>
                        <span className="text-[11.5px] text-slate-400 font-bold uppercase tracking-wider">RETURNS DEPT</span>
                      </div>
                    </td>
                    <td className="py-4.5 px-6 whitespace-nowrap text-center text-slate-455 hover:text-[#184edb] cursor-pointer transition-colors">
                      <Eye size={16} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="bg-[#f8fafc] border-t border-slate-150 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 w-full box-border">
              <span className="text-[13px] text-slate-500 font-semibold">
                Showing 1-10 of 2,481 entries
              </span>

              <div className="flex items-center gap-1.5">
                <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-55 text-slate-400 cursor-pointer">
                  <ChevronLeft size={16} />
                </button>
                <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#184edb] text-white font-bold text-[13.5px] border-none shadow-sm cursor-pointer">
                  1
                </button>
                <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-55 text-slate-650 text-[13.5px] font-medium cursor-pointer">
                  2
                </button>
                <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-55 text-slate-650 text-[13.5px] font-medium cursor-pointer">
                  3
                </button>
                <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-55 text-slate-400 cursor-pointer">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

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
                  <span className="text-[32px] font-extrabold text-white tracking-tight">$1,245,800.00</span>
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
      ) : activeSubTab === 'orders' ? (
        <div className="p-10 text-center text-slate-500 flex flex-col items-center justify-center min-h-[50vh]">
          <h2 className="text-2xl text-slate-800 mb-2 font-bold font-heading">Purchase Orders Page</h2>
          <p>This section is under construction.</p>
        </div>
      ) : (
        <div className="flex-1 p-6 md:p-8 flex flex-col gap-6 bg-[#f6f8fc] overflow-y-auto box-border max-w-full font-sans relative">
          {/* KPI Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 w-full">
            {/* Total Spare Parts */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center justify-between min-h-[90px] box-border relative">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 text-[#184edb] p-2.5 rounded-lg flex items-center justify-center border border-blue-100">
                  <Package size={18} />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-slate-500 text-[12px] font-bold">Total Spare Parts</span>
                  <span className="text-xl font-bold text-slate-800 tracking-tight">12,482</span>
                </div>
              </div>
              <span className="absolute top-3 right-3 text-emerald-600 text-[10.5px] font-bold">
                +4%
              </span>
            </div>

            {/* Total Categories */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center justify-between min-h-[90px] box-border">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 text-[#184edb] p-2.5 rounded-lg flex items-center justify-center border border-blue-100">
                  <Layers size={18} />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-slate-500 text-[12px] font-bold">Total Categories</span>
                  <span className="text-xl font-bold text-slate-800 tracking-tight">84</span>
                </div>
              </div>
            </div>

            {/* Low Stock Items */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center justify-between min-h-[90px] box-border">
              <div className="flex items-center gap-3">
                <div className="bg-orange-50 text-orange-650 p-2.5 rounded-lg flex items-center justify-center border border-orange-100">
                  <AlertTriangle size={18} />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-slate-500 text-[12px] font-bold">Low Stock Items</span>
                  <span className="text-xl font-bold text-orange-500 tracking-tight">32</span>
                </div>
              </div>
            </div>

            {/* Out of Stock */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center justify-between min-h-[90px] box-border">
              <div className="flex items-center gap-3">
                <div className="bg-rose-50 text-rose-600 p-2.5 rounded-lg flex items-center justify-center border border-rose-100">
                  <CircleAlert size={18} />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-slate-500 text-[12px] font-bold">Out of Stock</span>
                  <span className="text-xl font-bold text-rose-600 tracking-tight">42</span>
                </div>
              </div>
            </div>

            {/* Inventory Value */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center justify-between min-h-[90px] box-border">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 text-[#184edb] p-2.5 rounded-lg flex items-center justify-center border border-blue-100">
                  <CircleDollarSign size={18} />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-slate-500 text-[12px] font-bold">Inventory Value</span>
                  <span className="text-xl font-bold text-slate-800 tracking-tight">$842k</span>
                </div>
              </div>
            </div>

            {/* Today's Txns */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center justify-between min-h-[90px] box-border">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 text-[#184edb] p-2.5 rounded-lg flex items-center justify-center border border-blue-100">
                  <Receipt size={18} />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-slate-500 text-[12px] font-bold">Today's Txns</span>
                  <span className="text-xl font-bold text-slate-800 tracking-tight">114</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Options Panel Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 box-border shadow-sm">
            <div className="flex flex-wrap items-center gap-3.5">
              {/* Categories Selector */}
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none bg-[#f1f4fd] hover:bg-[#e8eeff] border border-slate-200 rounded-lg py-2 pl-4 pr-10 text-[13.5px] text-slate-700 font-bold cursor-pointer focus:outline-none transition-colors"
                >
                  <option value="All Categories">All Categories</option>
                </select>
                <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-550 pointer-events-none">
                  <ChevronDown size={16} />
                </span>
              </div>

              {/* Brands Selector */}
              <div className="relative">
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="appearance-none bg-[#f1f4fd] hover:bg-[#e8eeff] border border-slate-200 rounded-lg py-2 pl-4 pr-10 text-[13.5px] text-slate-700 font-bold cursor-pointer focus:outline-none transition-colors"
                >
                  <option value="All Brands">All Brands</option>
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
                    onClick={() => setStatusTab(tab)}
                    className={`px-4 py-1.5 rounded-md text-[13px] font-bold border-none cursor-pointer transition-all ${
                      statusTab === tab
                        ? 'bg-[#184edb] text-white shadow-sm'
                        : 'bg-transparent text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-750 font-bold rounded-lg text-[13.5px] cursor-pointer transition-colors shadow-sm">
                <Printer size={15} className="text-slate-500" />
                <span>Print</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-755 font-bold rounded-lg text-[13.5px] cursor-pointer transition-colors shadow-sm">
                <FileText size={15} className="text-slate-500" />
                <span>Export Excel</span>
              </button>
              <button
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#184edb] hover:bg-[#143eb3] text-white font-bold rounded-lg text-[13.5px] border-none shadow-sm cursor-pointer transition-colors"
              >
                <Plus size={16} />
                <span>Add Spare Part</span>
              </button>
            </div>
          </div>

          {/* Spare Parts Inventory Table Card */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden w-full flex flex-col box-border">
            {/* Table */}
            <div className="overflow-x-auto w-full">
              <table className="w-full border-collapse text-left text-slate-650">
                <thead>
                  <tr className="bg-[#f8fafc] border-b border-slate-200 text-[11.5px] font-bold text-slate-800 uppercase tracking-wider">
                    <th className="py-4.5 px-6 select-none font-bold">PART NUMBER</th>
                    <th className="py-4.5 px-5 select-none font-bold">PART NAME</th>
                    <th className="py-4.5 px-5 select-none font-bold">CATEGORY</th>
                    <th className="py-4.5 px-5 select-none font-bold">BRAND</th>
                    <th className="py-4.5 px-5 select-none font-bold">HSN CODE</th>
                    <th className="py-4.5 px-5 select-none font-bold">GST %</th>
                    <th className="py-4.5 px-5 select-none font-bold">PURCHASE PRICE</th>
                    <th className="py-4.5 px-5 select-none font-bold">SALE PRICE</th>
                    <th className="py-4.5 px-6 select-none font-bold">STOCK</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[14px]">
                  {partsData.map((part) => (
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

                      {/* Category */}
                      <td className="py-4.5 px-5 text-slate-700 font-medium whitespace-nowrap">
                        {part.category}
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

                      {/* Stock */}
                      <td className="py-4.5 px-6 whitespace-nowrap">
                        <span
                          className={`font-bold text-[14.5px] ${
                            part.stockStatus === 'low'
                              ? 'text-orange-500'
                              : part.stockStatus === 'out'
                              ? 'text-rose-600'
                              : 'text-slate-800'
                          }`}
                        >
                          {part.stock}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="bg-[#f8fafc] border-t border-slate-150 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 w-full box-border">
              <span className="text-[13px] text-slate-500 font-semibold">
                Showing 1 - 25 of 12,482 items
              </span>

              <div className="flex items-center gap-1.5">
                <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-55 text-slate-400 cursor-pointer">
                  <ChevronLeft size={16} />
                </button>
                <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#184edb] text-white font-bold text-[13.5px] border-none shadow-sm cursor-pointer">
                  1
                </button>
                <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-55 text-slate-650 text-[13.5px] font-medium cursor-pointer">
                  2
                </button>
                <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-55 text-slate-650 text-[13.5px] font-medium cursor-pointer">
                  3
                </button>
                <span className="px-1 text-slate-400 text-[13.5px] font-medium">...</span>
                <button className="w-10 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-55 text-slate-650 text-[13.5px] font-medium cursor-pointer">
                  499
                </button>
                <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-55 text-slate-400 cursor-pointer">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
