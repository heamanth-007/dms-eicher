import React, { useState, useEffect } from 'react';
import {
  Printer,
  FileSpreadsheet,
  FileText,
  ShoppingCart,
  TrendingUp,
  CreditCard,
  AlertTriangle,
  Truck,
  ChevronDown,
  Calendar,
  Filter,
  Search
} from 'lucide-react';

interface SupplierType {
  id: string;
  name: string;
  gstNumber: string;
  phone: string;
  email: string;
  outstanding: string;
  isOutstandingPositive: boolean;
  status: 'ACTIVE' | 'INACTIVE';
}

interface SupplierLedgerProps {
  selectedSupplier: SupplierType | null;
  setSelectedSupplier: (supplier: SupplierType | null) => void;
  suppliersList: SupplierType[];
  onBack?: () => void;
}

export const SupplierLedger: React.FC<SupplierLedgerProps> = ({
  selectedSupplier,
  setSelectedSupplier,
  suppliersList,
  onBack
}) => {
  const [ledgerSupplier, setLedgerSupplier] = useState('Global Parts Corp.');
  const [ledgerDateRange, setLedgerDateRange] = useState('');
  const [ledgerTxType, setLedgerTxType] = useState('All Transactions');

  useEffect(() => {
    if (selectedSupplier) {
      setLedgerSupplier(selectedSupplier.name);
    }
  }, [selectedSupplier]);

  return (
    <div className="flex-1 flex flex-col p-6 gap-6 bg-[#f6f8fc] min-w-0 font-sans text-left">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-[13px] font-semibold text-[#64748b]">
        <span onClick={onBack} className="cursor-pointer hover:text-slate-800 transition-colors">Dashboard</span>
        <span className="text-[#94a3b8] font-normal">&gt;</span>
        <span onClick={onBack} className="cursor-pointer hover:text-slate-800 transition-colors">Suppliers</span>
        <span className="text-[#94a3b8] font-normal">&gt;</span>
        <span className="text-[#184edb]">Ledger</span>
      </div>

      {/* Header section with print/export actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-[28px] font-bold text-[#0f172a] font-heading tracking-tight">
          Ledger: {selectedSupplier?.name || ledgerSupplier}
        </h1>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white hover:bg-slate-50 text-[#475569] font-bold text-[13px] px-4 py-2 rounded-lg border border-[#cbd5e1] transition-all cursor-pointer">
            <Printer size={15} />
            <span>Print</span>
          </button>
          <button className="flex items-center gap-2 bg-white hover:bg-slate-50 text-[#475569] font-bold text-[13px] px-4 py-2 rounded-lg border border-[#cbd5e1] transition-all cursor-pointer">
            <FileSpreadsheet size={15} className="text-[#10b981]" />
            <span>Excel</span>
          </button>
          <button className="flex items-center gap-2 bg-[#184edb] hover:bg-[#1544c2] text-white font-bold text-[13px] px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer">
            <FileText size={15} />
            <span>PDF Export</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Purchase */}
        <div className="bg-white border border-[#e2e8f0] p-5.5 rounded-xl flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)] min-h-[125px] relative">
          <div className="flex items-start justify-between">
            <div className="bg-[#eff6ff] p-2.5 rounded-lg flex items-center justify-center text-[#184edb]">
              <ShoppingCart size={20} />
            </div>
            <div className="flex items-center gap-0.5 text-[#10b981] text-[12px] font-bold">
              <span>+8.2%</span>
              <TrendingUp size={14} className="stroke-[2.5px]" />
            </div>
          </div>
          <div className="mt-3.5">
            <span className="text-[26px] font-extrabold text-[#0f172a] leading-none">$124,580.00</span>
            <span className="block text-[10.5px] font-bold text-[#64748b] tracking-wider uppercase mt-1.5">TOTAL PURCHASE</span>
          </div>
        </div>

        {/* Card 2: Total Paid */}
        <div className="bg-white border border-[#e2e8f0] p-5.5 rounded-xl flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)] min-h-[125px] relative">
          <div className="flex items-start justify-between">
            <div className="bg-[#eff6ff] p-2.5 rounded-lg flex items-center justify-center text-[#184edb]">
              <CreditCard size={20} />
            </div>
            <span className="text-[11.5px] font-semibold text-[#64748b]">Last 30 Days</span>
          </div>
          <div className="mt-3.5">
            <span className="text-[26px] font-extrabold text-[#0f172a] leading-none">$98,240.00</span>
            <span className="block text-[10.5px] font-bold text-[#64748b] tracking-wider uppercase mt-1.5">TOTAL PAID</span>
          </div>
        </div>

        {/* Card 3: Outstanding Balance */}
        <div className="bg-white border border-[#e2e8f0] p-5.5 rounded-xl flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)] min-h-[125px] relative">
          <div className="flex items-start justify-between">
            <div className="bg-[#fef2f2] p-2.5 rounded-lg flex items-center justify-center text-[#dc2626]">
              <AlertTriangle size={20} />
            </div>
            <div className="flex items-center gap-1 text-[#dc2626] text-[11.5px] font-bold">
              <span>Attention</span>
              <AlertTriangle size={12} className="stroke-[2.5px]" />
            </div>
          </div>
          <div className="mt-3.5">
            <span className="text-[26px] font-extrabold text-[#dc2626] leading-none">
              {selectedSupplier?.outstanding || '$0.00'}
            </span>
            <span className="block text-[10.5px] font-bold text-[#64748b] tracking-wider uppercase mt-1.5">OUTSTANDING BALANCE</span>
          </div>
        </div>

        {/* Card 4: Last Payment Made */}
        <div className="bg-[#184edb] text-white p-5.5 rounded-xl flex flex-col justify-between shadow-[0_4px_12px_rgba(24,78,219,0.15)] min-h-[125px] relative">
          <div className="flex items-start justify-between">
            <div className="bg-white/10 p-2.5 rounded-lg flex items-center justify-center text-white">
              <CreditCard size={20} />
            </div>
            <span className="text-[11px] font-bold text-[#a4c2ff] tracking-wide">OCT 15, 2023</span>
          </div>
          <div className="mt-3.5">
            <span className="text-[26px] font-extrabold text-white leading-none">$12,400.00</span>
            <span className="block text-[10.5px] font-bold text-[#a4c2ff] tracking-wider uppercase mt-1.5">LAST PAYMENT MADE</span>
          </div>
        </div>
      </div>

      {/* Filter Records card */}
      <div className="bg-white border border-[#e2e8f0] p-5 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-wrap lg:flex-nowrap items-end gap-4">
        <div className="flex-1 min-w-[220px] flex flex-col gap-1.5">
          <label className="text-[12px] font-bold text-[#475569]">Select Supplier</label>
          <div className="relative">
            <Truck className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={16} />
            <select
              value={ledgerSupplier}
              onChange={(e) => {
                const val = e.target.value;
                setLedgerSupplier(val);
                const found = suppliersList.find(s => s.name === val);
                if (found) setSelectedSupplier(found);
              }}
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#cbd5e1] rounded-lg text-[13.5px] text-[#0f172a] font-semibold appearance-none focus:outline-none focus:border-[#184edb]"
            >
              {suppliersList.map((s) => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748b] pointer-events-none" />
          </div>
        </div>

        <div className="w-[200px] flex flex-col gap-1.5">
          <label className="text-[12px] font-bold text-[#475569]">Date Range</label>
          <div className="relative">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={16} />
            <input
              type="text"
              placeholder="mm/dd/yyyy"
              value={ledgerDateRange}
              onChange={(e) => setLedgerDateRange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#cbd5e1] rounded-lg text-[13.5px] text-[#0f172a] font-medium focus:outline-none focus:border-[#184edb]"
            />
          </div>
        </div>

        <div className="w-[200px] flex flex-col gap-1.5">
          <label className="text-[12px] font-bold text-[#475569]">Transaction Type</label>
          <div className="relative">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={16} />
            <select
              value={ledgerTxType}
              onChange={(e) => setLedgerTxType(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#cbd5e1] rounded-lg text-[13.5px] text-[#0f172a] font-semibold appearance-none focus:outline-none focus:border-[#184edb]"
            >
              <option>All Transactions</option>
              <option>Purchases</option>
              <option>Payments</option>
              <option>Credit Notes</option>
            </select>
            <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748b] pointer-events-none" />
          </div>
        </div>

        <div className="flex gap-2.5">
          <button className="bg-[#184edb] hover:bg-[#1544c2] text-white font-bold text-[13.5px] px-6 py-2.5 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer h-[41px] flex items-center gap-2 border-0">
            <Search size={15} />
            <span>Apply Filters</span>
          </button>
          <button className="bg-white hover:bg-slate-50 text-[#64748b] font-bold text-[13.5px] px-6 py-2.5 rounded-lg border border-[#cbd5e1] transition-all cursor-pointer h-[41px]">
            Reset
          </button>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col relative">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#f1f5fd] border-b border-[#e2e8f0]">
                <th className="py-4.5 px-6 text-[12px] font-extrabold text-[#475569] tracking-wider uppercase">Date</th>
                <th className="py-4.5 px-6 text-[12px] font-extrabold text-[#475569] tracking-wider uppercase">Reference No</th>
                <th className="py-4.5 px-6 text-[12px] font-extrabold text-[#475569] tracking-wider uppercase">Type</th>
                <th className="py-4.5 px-6 text-[12px] font-extrabold text-[#475569] tracking-wider uppercase">Description</th>
                <th className="py-4.5 px-6 text-[12px] font-extrabold text-[#475569] tracking-wider uppercase">Debit ($)</th>
                <th className="py-4.5 px-6 text-[12px] font-extrabold text-[#475569] tracking-wider uppercase">Credit ($)</th>
                <th className="py-4.5 px-6 text-[12px] font-extrabold text-[#475569] tracking-wider uppercase">Balance ($)</th>
                <th className="py-4.5 px-6 text-[12px] font-extrabold text-[#475569] tracking-wider uppercase">Payment Mode</th>
                <th className="py-4.5 px-6 text-[12px] font-extrabold text-[#475569] tracking-wider uppercase">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {/* Row 1 */}
              <tr className="border-b border-[#e2e8f0] hover:bg-slate-50/50 transition-colors">
                <td className="py-4 px-6 text-[13px] font-bold text-[#0f172a]">01/10/2023</td>
                <td className="py-4 px-6 text-[13px] text-[#64748b] font-medium">-</td>
                <td className="py-4 px-6 text-[12px] text-[#0f172a] font-bold">Balance</td>
                <td className="py-4 px-6 text-[13px] text-[#0f172a] font-bold">Opening Balance Forwarded</td>
                <td className="py-4 px-6 text-[13px] text-[#0f172a] font-semibold">0.00</td>
                <td className="py-4 px-6 text-[13px] text-[#0f172a] font-semibold">0.00</td>
                <td className="py-4 px-6 text-[13px] text-[#0f172a] font-bold">15,400.00</td>
                <td className="py-4 px-6 text-[13px] text-[#64748b] font-medium">-</td>
                <td className="py-4 px-6 text-[12.5px] text-[#475569] font-medium">Forwarded from FY22</td>
              </tr>

              {/* Row 2 */}
              <tr className="border-b border-[#e2e8f0] hover:bg-slate-50/50 transition-colors">
                <td className="py-4 px-6 text-[13px] font-bold text-[#0f172a]">05/10/2023</td>
                <td className="py-4 px-6 text-[13px] font-bold text-[#184edb] cursor-pointer hover:underline">PUR-2023-0982</td>
                <td className="py-4 px-6">
                  <span className="bg-[#eff6ff] text-[#1e40af] text-[10px] font-extrabold px-2.5 py-0.5 rounded tracking-wide uppercase">
                    PURCHASE
                  </span>
                </td>
                <td className="py-4 px-6 text-[13px] text-[#475569] font-medium max-w-[220px]">
                  Engine Spares & Gaskets Set (50 units)
                </td>
                <td className="py-4 px-6 text-[13px] text-[#0f172a] font-semibold">8,500.00</td>
                <td className="py-4 px-6 text-[13px] text-[#0f172a] font-semibold">0.00</td>
                <td className="py-4 px-6 text-[13px] text-[#0f172a] font-bold">23,900.00</td>
                <td className="py-4 px-6 text-[13px] text-[#0f172a] font-semibold">Credit Account</td>
                <td className="py-4 px-6 text-[12.5px] text-[#475569] font-medium">Due in 30 days</td>
              </tr>

              {/* Row 3 */}
              <tr className="border-b border-[#e2e8f0] hover:bg-slate-50/50 transition-colors">
                <td className="py-4 px-6 text-[13px] font-bold text-[#0f172a]">10/10/2023</td>
                <td className="py-4 px-6 text-[13px] font-bold text-[#184edb] cursor-pointer hover:underline">PAY-9921-X</td>
                <td className="py-4 px-6">
                  <span className="bg-[#e6f4ea] text-[#137333] text-[10px] font-extrabold px-2.5 py-0.5 rounded tracking-wide uppercase">
                    PAYMENT
                  </span>
                </td>
                <td className="py-4 px-6 text-[13px] text-[#475569] font-medium max-w-[220px]">
                  Partial Settlement against INV-8821
                </td>
                <td className="py-4 px-6 text-[13px] text-[#0f172a] font-semibold">0.00</td>
                <td className="py-4 px-6 text-[13px] text-[#10b981] font-bold">10,000.00</td>
                <td className="py-4 px-6 text-[13px] text-[#0f172a] font-bold">13,900.00</td>
                <td className="py-4 px-6 text-[13px] text-[#0f172a] font-semibold">Bank Transfer</td>
                <td className="py-4 px-6 text-[12.5px] text-[#475569] font-medium">Reference: TXN0021</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
