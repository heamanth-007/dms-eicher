import { useState, useEffect } from 'react';
import {
  Car,
  ShoppingBag,
  FileText,
  ClipboardList,
  CheckCircle,
  Clock,
  Coins,
  AlertTriangle,
  PackageOpen,
  Users,
  Truck,
  Filter,
  Download,
  Search,
  Plus,
  ArrowUpRight
} from 'lucide-react';

import { getStoredInventory } from '../utils/inventory';

interface CustomerType {
  id: string;
  name: string;
  avatar: string;
  avatarBg: string;
  phone: string;
  district: string;
  vehicles: number;
  lastService: string;
  outstanding: string;
  status: string;
}

interface TransactionType {
  refId: string;
  payeeName: string;
  method: string;
  vehicleJob: string;
  date: string;
  amount: string;
  status: string;
}

interface SupplierType {
  id: string;
  name: string;
  outstanding: string;
  status: string;
}

interface PartType {
  partNumber: string;
  stockStatus: string;
  stock: string;
}

interface JobCardType {
  jcNumber: string;
  status: string;
  readyForPickup: boolean;
}

interface DashboardProps {
  salesCount: number;
  onNavigate: (tab: string) => void;
  onNavigateToService: (subTab: 'dashboard' | 'open-job-cards' | 'completed-jobs' | 'service-history') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ salesCount, onNavigate, onNavigateToService }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<CustomerType[]>([]);
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [parts, setParts] = useState<PartType[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierType[]>([]);
  const [jobcards, setJobcards] = useState<JobCardType[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [localDataTick, setLocalDataTick] = useState(0);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const handleSync = () => setLocalDataTick(prev => prev + 1);
    window.addEventListener('dms_inventory_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('dms_inventory_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  useEffect(() => {
    // Fetch customers
    fetch(`${API_URL}/api/customers`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setCustomers(data);
        }
      })
      .catch(err => console.error('Error fetching customers:', err));

    // Fetch transactions
    fetch(`${API_URL}/api/transactions`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setTransactions(data);
        }
      })
      .catch(err => console.error('Error fetching transactions:', err));

    // Fetch parts
    fetch(`${API_URL}/api/parts`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setParts(data);
        }
      })
      .catch(err => console.error('Error fetching parts:', err));

    // Fetch suppliers
    fetch(`${API_URL}/api/suppliers`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSuppliers(data);
        }
      })
      .catch(err => console.error('Error fetching suppliers:', err));

    // Fetch jobcards
    fetch(`${API_URL}/api/jobcards`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setJobcards(data);
        }
      })
      .catch(err => console.error('Error fetching jobcards:', err));

    // Fetch sales
    fetch(`${API_URL}/api/sales`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSales(data);
        }
      })
      .catch(err => console.error('Error fetching sales:', err));
  }, []);

  // Helper calculations
  const openJobsCount = jobcards.filter(jc => jc.status !== 'COMPLETED').length;
  const closedJobsCount = jobcards.filter(jc => jc.status === 'COMPLETED').length;
  const pendingDeliveryCount = jobcards.filter(jc => jc.readyForPickup).length;

  const totalOutstanding = sales.reduce((sum, s) => {
    if (s.status === 'PENDING') {
      const balStr = s.balanceAmount || s.grandTotal || '0';
      const balNum = Number(balStr.toString().replace(/[^\d.]/g, '')) || 0;
      return sum + balNum;
    }
    return sum;
  }, 0);

  const outstandingStr = totalOutstanding >= 100000
    ? `₹${(totalOutstanding / 100000).toFixed(2)}L`
    : `₹${totalOutstanding.toLocaleString('en-IN')}`;

  const totalCollection = transactions.reduce((sum, t) => {
    if (!t.amount) return sum;
    const value = parseFloat(t.amount.replace(/[^\d.]/g, ''));
    return isNaN(value) ? sum : sum + value;
  }, 0);

  const collectionStr = totalCollection >= 100000
    ? `₹${(totalCollection / 100000).toFixed(2)}L`
    : `₹${totalCollection.toLocaleString('en-IN')}`;

  // Spare parts low stock logic directly synced from inventory
  const storedInventory = getStoredInventory();
  const effectivePartsList = storedInventory.length > 0 ? storedInventory : parts;

  const lowStockCount = effectivePartsList.filter(p => {
    const numStock = parseInt((p.stock || '0').replace(/[^0-9]/g, ''), 10) || 0;
    return p.stockStatus === 'low' || p.stockStatus === 'out' || numStock < 12;
  }).length;

  const outStockCount = effectivePartsList.filter(p => {
    const numStock = parseInt((p.stock || '0').replace(/[^0-9]/g, ''), 10) || 0;
    return p.stockStatus === 'out' || numStock === 0;
  }).length;

  // Real-time calculation for Suppliers count
  let suppliersCount = suppliers.length;
  try {
    const savedSuppliers = localStorage.getItem('dms_suppliers_list');
    if (savedSuppliers) {
      const parsed = JSON.parse(savedSuppliers);
      if (Array.isArray(parsed) && parsed.length > 0) {
        suppliersCount = parsed.length;
      }
    }
  } catch (e) {}

  // Real-time calculation for Service Bills
  let serviceBillsCount = 24;
  let recentServiceBillsList: any[] = [];
  try {
    const savedServiceBills = localStorage.getItem('dms_service_bills');
    if (savedServiceBills) {
      const parsed = JSON.parse(savedServiceBills);
      if (Array.isArray(parsed) && parsed.length > 0) {
        serviceBillsCount = parsed.length;
        recentServiceBillsList = parsed;
      }
    }
  } catch (e) {}

  // Real-time calculation for Counter Sales
  let counterSalesTotalStr = '₹42.5k';
  try {
    const savedCounterSales = localStorage.getItem('dms_counter_sales_bills');
    if (savedCounterSales) {
      const parsed = JSON.parse(savedCounterSales);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const sumTotal = parsed.reduce((acc: number, bill: any) => acc + (Number(bill.grandTotal) || 0), 0);
        if (sumTotal >= 100000) {
          counterSalesTotalStr = `₹${(sumTotal / 100000).toFixed(2)}L`;
        } else if (sumTotal >= 1000) {
          counterSalesTotalStr = `₹${(sumTotal / 1000).toFixed(1)}k`;
        } else {
          counterSalesTotalStr = `₹${sumTotal.toLocaleString('en-IN')}`;
        }
      }
    }
  } catch (e) {}

  const filteredTransactions = transactions.filter(t =>
    t.payeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.refId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.vehicleJob.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 bg-[#f6f8fc] min-h-[calc(100vh-70px)] flex flex-col gap-6 box-border font-sans text-slate-700 text-left">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 m-0 mb-1.5 tracking-tight">Dashboard Overview</h1>
        <p className="text-[13.5px] text-slate-500 m-0">Monitor workshop operations, sales, service performance, and inventory in real time.</p>
      </div>

      {/* KPI Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4 w-full">
        {/* Card 1 */}
        <div
          onClick={() => onNavigate('sales')}
          className="bg-white rounded-xl p-4.5 shadow-sm border border-[#eef2f6] flex flex-col gap-3 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-pointer"
        >
          <div className="flex justify-between items-center">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50">
              <Car className="text-blue-600" size={18} />
            </div>
            <span className="text-[11px] font-semibold inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-green-100 text-green-700">
              <ArrowUpRight size={10} /> +12%
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10.5px] font-bold text-slate-400 tracking-wider">VEHICLE SALES</span>
            <h3 className="text-2xl font-extrabold text-slate-800 m-0">
              {salesCount < 10 ? `0${salesCount}` : salesCount}
            </h3>
          </div>
        </div>

        {/* Card 2 */}
        <div
          onClick={() => onNavigate('counter-sales')}
          className="bg-white rounded-xl p-4.5 shadow-sm border border-[#eef2f6] flex flex-col gap-3 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-pointer"
        >
          <div className="flex justify-between items-center">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-50">
              <ShoppingBag className="text-purple-600" size={18} />
            </div>
            <span className="text-[11px] font-semibold inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-green-100 text-green-700">
              <ArrowUpRight size={10} /> +5%
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10.5px] font-bold text-slate-400 tracking-wider">COUNTER SALES</span>
            <h3 className="text-2xl font-extrabold text-slate-800 m-0">{counterSalesTotalStr}</h3>
          </div>
        </div>

        {/* Card 3 */}
        <div
          onClick={() => onNavigate('billing')}
          className="bg-white rounded-xl p-4.5 shadow-sm border border-[#eef2f6] flex flex-col gap-3 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-pointer"
        >
          <div className="flex justify-between items-center">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-cyan-50">
              <FileText className="text-cyan-600" size={18} />
            </div>
            <span className="text-[11px] font-semibold inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-green-100 text-green-700">
              <ArrowUpRight size={10} /> +8.2%
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10.5px] font-bold text-slate-400 tracking-wider">SERVICE BILLS</span>
            <h3 className="text-2xl font-extrabold text-slate-800 m-0">{serviceBillsCount}</h3>
          </div>
        </div>

        {/* Card 4 */}
        <div
          onClick={() => onNavigateToService('open-job-cards')}
          className="bg-white rounded-xl p-4.5 shadow-sm border border-[#eef2f6] flex flex-col gap-3 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-pointer"
        >
          <div className="flex justify-between items-center">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-orange-50">
              <ClipboardList className="text-orange-600" size={18} />
            </div>
            <span className="text-[11px] font-semibold text-orange-600">Active</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10.5px] font-bold text-slate-400 tracking-wider">OPEN JOBS</span>
            <h3 className="text-2xl font-extrabold text-slate-800 m-0">{openJobsCount}</h3>
          </div>
        </div>

        {/* Card 5 */}
        <div
          onClick={() => onNavigateToService('completed-jobs')}
          className="bg-white rounded-xl p-4.5 shadow-sm border border-[#eef2f6] flex flex-col gap-3 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-pointer"
        >
          <div className="flex justify-between items-center">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-50">
              <CheckCircle className="text-green-600" size={18} />
            </div>
            <span className="text-[11px] font-semibold text-green-600">Done</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10.5px] font-bold text-slate-400 tracking-wider">CLOSED JOBS</span>
            <h3 className="text-2xl font-extrabold text-slate-800 m-0">{closedJobsCount}</h3>
          </div>
        </div>

        {/* Card 6 */}
        <div
          onClick={() => onNavigateToService('open-job-cards')}
          className="bg-white rounded-xl p-4.5 shadow-sm border border-[#eef2f6] flex flex-col gap-3 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-pointer"
        >
          <div className="flex justify-between items-center">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50">
              <Clock className="text-blue-500" size={18} />
            </div>
            <span className="text-[11px] font-semibold text-blue-500">{pendingDeliveryCount} Ready</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10.5px] font-bold text-slate-400 tracking-wider">PENDING DELIVERY</span>
            <h3 className="text-2xl font-extrabold text-slate-800 m-0">{pendingDeliveryCount}</h3>
          </div>
        </div>
      </div>

      {/* KPI Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 w-full">
        {/* Card 1 */}
        <div
          onClick={() => onNavigate('billing')}
          className="bg-white rounded-xl p-4.5 shadow-sm border border-[#eef2f6] flex flex-col gap-3 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-pointer"
        >
          <div className="flex justify-between items-center">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-50">
              <Coins className="text-green-600" size={18} />
            </div>
            <span className="text-[11px] font-semibold inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-green-100 text-green-700">
              <ArrowUpRight size={10} /> +16%
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10.5px] font-bold text-slate-400 tracking-wider">TODAY'S COLLECTION</span>
            <h3 className="text-2xl font-extrabold text-slate-800 m-0">{collectionStr}</h3>
          </div>
        </div>

        {/* Card 2 */}
        <div
          onClick={() => onNavigate('billing')}
          className="bg-white rounded-xl p-4.5 shadow-sm border border-[#eef2f6] flex flex-col gap-3 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-pointer"
        >
          <div className="flex justify-between items-center">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-50">
              <AlertTriangle className="text-red-600" size={18} />
            </div>
            <span className="text-[11px] font-bold text-red-600">Critical</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10.5px] font-bold text-slate-400 tracking-wider">OUTSTANDING</span>
            <h3 className="text-2xl font-extrabold text-slate-800 m-0">{outstandingStr}</h3>
          </div>
        </div>

        {/* Card 3 */}
        <div
          onClick={() => onNavigate('parts')}
          className="bg-white rounded-xl p-4.5 shadow-sm border border-[#eef2f6] flex flex-col gap-3 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-pointer"
        >
          <div className="flex justify-between items-center">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-50">
              <PackageOpen className="text-amber-600" size={18} />
            </div>
            <span className="text-[11px] font-bold text-amber-600">Alert</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10.5px] font-bold text-slate-400 tracking-wider">LOW STOCK ITEMS</span>
            <h3 className="text-2xl font-extrabold text-slate-800 m-0">{lowStockCount}</h3>
          </div>
        </div>

        {/* Card 4 */}
        <div
          onClick={() => onNavigate('customers')}
          className="bg-white rounded-xl p-4.5 shadow-sm border border-[#eef2f6] flex flex-col gap-3 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-pointer"
        >
          <div className="flex justify-between items-center">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-50">
              <Users className="text-purple-500" size={18} />
            </div>
            <span className="text-[11px] font-bold text-purple-500">+4 New</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10.5px] font-bold text-slate-400 tracking-wider">TOTAL CUSTOMERS</span>
            <h3 className="text-2xl font-extrabold text-slate-800 m-0">
              {customers.length || '1.2k'}
            </h3>
          </div>
        </div>

        {/* Card 5 */}
        <div
          onClick={() => onNavigate('suppliers')}
          className="bg-white rounded-xl p-4.5 shadow-sm border border-[#eef2f6] flex flex-col gap-3 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-pointer"
        >
          <div className="flex justify-between items-center">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50">
              <Truck className="text-slate-500" size={18} />
            </div>
            <span className="text-[11px] font-semibold text-green-600">Active</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10.5px] font-bold text-slate-400 tracking-wider">TOTAL SUPPLIERS</span>
            <h3 className="text-2xl font-extrabold text-slate-800 m-0">{suppliersCount}</h3>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Monthly Sales Performance Bar Chart */}
        <div className="bg-white rounded-xl p-6 border border-[#eef2f6] shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800 m-0">Monthly Sales Performance</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span>Vehicle Sales</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                <span className="w-2 h-2 rounded-full bg-blue-900"></span>
                <span>Parts Sales</span>
              </div>
            </div>
          </div>
          <div className="h-[180px] relative flex gap-3">
            <div className="flex flex-col justify-between w-[1px] h-[calc(100%-20px)] border-r border-dashed border-slate-200">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div className="flex-1 flex justify-around items-end h-full">
              {[
                { month: 'JAN', vehicle: 35, parts: 30 },
                { month: 'FEB', vehicle: 42, parts: 32 },
                { month: 'MAR', vehicle: 28, parts: 20 },
                { month: 'APR', vehicle: 55, parts: 45 },
                { month: 'MAY', vehicle: 68, parts: 50 },
                { month: 'JUN', vehicle: 78, parts: 62 },
                { month: 'JUL', vehicle: 85, parts: 70 },
                { month: 'AUG', vehicle: 80, parts: 68 },
              ].map((data, index) => (
                <div key={index} className="flex flex-col items-center h-full justify-end w-10">
                  <div className="flex items-end gap-1 h-[calc(100%-20px)] w-full justify-center">
                    <div className="w-3 rounded-t relative cursor-pointer transition-opacity duration-200 hover:opacity-85 group bg-blue-500" style={{ height: `${data.vehicle}%` }}>
                      <div className="invisible absolute bottom-full left-1/2 -translate-x-1/2 bg-slate-900 text-white px-2 py-1 rounded text-[9px] whitespace-nowrap mb-1 z-10 group-hover:visible">Vehicle: {data.vehicle}%</div>
                    </div>
                    <div className="w-3 rounded-t relative cursor-pointer transition-opacity duration-200 hover:opacity-85 group bg-blue-900" style={{ height: `${data.parts}%` }}>
                      <div className="invisible absolute bottom-full left-1/2 -translate-x-1/2 bg-slate-900 text-white px-2 py-1 rounded text-[9px] whitespace-nowrap mb-1 z-10 group-hover:visible">Parts: {data.parts}%</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold mt-2">{data.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Service Operations Analysis Area Chart */}
        <div className="bg-white rounded-xl p-6 border border-[#eef2f6] shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800 m-0">Service Operations Analysis</h3>
            <select className="border border-slate-200 rounded-md px-2 py-1 text-[11px] text-slate-600 font-semibold outline-none bg-slate-50">
              <option>Last 6 Months</option>
              <option>Last 12 Months</option>
            </select>
          </div>
          <div className="h-[180px] flex flex-col justify-between">
            <svg viewBox="0 0 500 200" className="w-full h-[150px]">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#184edb" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#184edb" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <line x1="0" y1="50" x2="500" y2="50" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="150" x2="500" y2="150" stroke="#f1f5f9" strokeWidth="1" />

              <path
                d="M 10 130 C 90 80, 170 120, 250 50 C 330 20, 410 70, 490 40 L 490 200 L 10 200 Z"
                fill="url(#chartGradient)"
              />
              <path
                d="M 10 130 C 90 80, 170 120, 250 50 C 330 20, 410 70, 490 40"
                fill="none"
                stroke="#184edb"
                strokeWidth="2.5"
              />

              <circle cx="10" cy="130" r="4" fill="#ffffff" stroke="#184edb" strokeWidth="2" />
              <circle cx="250" cy="50" r="4" fill="#ffffff" stroke="#184edb" strokeWidth="2" />
              <circle cx="490" cy="40" r="4" fill="#ffffff" stroke="#184edb" strokeWidth="2" />
            </svg>
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold px-2.5">
              <span>SEP</span>
              <span>OCT</span>
              <span>NOV</span>
              <span>DEC</span>
              <span>JAN</span>
              <span>FEB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">
        {/* Product Sales Share */}
        <div className="bg-white rounded-xl p-6 border border-[#eef2f6] shadow-sm flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-800 m-0 mb-1">Product Sales Share</h3>
          <div className="flex justify-center items-center h-[140px]">
            <div className="w-[120px] h-[120px] relative">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="10" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#184edb"
                  strokeWidth="10"
                  strokeDasharray="163.3 251.2"
                  strokeDashoffset="62.8"
                  transform="rotate(-90 50 50)"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#38bdf8"
                  strokeWidth="10"
                  strokeDasharray="37.7 251.2"
                  strokeDashoffset="-100.5"
                  transform="rotate(-90 50 50)"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#94a3b8"
                  strokeWidth="10"
                  strokeDasharray="25.1 251.2"
                  strokeDashoffset="-138.2"
                  transform="rotate(-90 50 50)"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#ef4444"
                  strokeWidth="10"
                  strokeDasharray="25.1 251.2"
                  strokeDashoffset="-163.3"
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <h2 className="text-lg font-extrabold text-slate-800 m-0">65%</h2>
                <span className="text-[8px] text-slate-400 font-bold tracking-wider block">TOP PARTS</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium"><span className="w-2 h-2 rounded-full bg-blue-600"></span><span>Engine Parts</span></div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium"><span className="w-2 h-2 rounded-full bg-sky-400"></span><span>Lubricants</span></div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium"><span className="w-2 h-2 rounded-full bg-slate-400"></span><span>Filters</span></div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium"><span className="w-2 h-2 rounded-full bg-slate-600"></span><span>Tyres</span></div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium"><span className="w-2 h-2 rounded-full bg-sky-300"></span><span>Accessories</span></div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium"><span className="w-2 h-2 rounded-full bg-red-500"></span><span>Batteries</span></div>
          </div>
        </div>

        {/* Right side Tables Stack */}
        <div className="flex flex-col gap-5">
          {/* Recent Customers */}
          <div className="bg-white rounded-xl p-6 border border-[#eef2f6] shadow-sm">
            <div className="flex justify-between items-center mb-3.5">
              <h3 className="text-sm font-bold text-slate-800 m-0">Recent Customers</h3>
              <div className="flex gap-1.5">
                <button className="bg-slate-50 border border-slate-200 rounded-md w-7 h-7 flex items-center justify-center cursor-pointer text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"><Filter size={14} /></button>
                <button className="bg-slate-50 border border-slate-200 rounded-md w-7 h-7 flex items-center justify-center cursor-pointer text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"><Download size={14} /></button>
              </div>
            </div>
            <div className="w-full overflow-x-auto">
              <table className="w-full border-collapse text-left text-[12.5px]">
                <thead>
                  <tr>
                    <th className="py-2.5 px-3 text-slate-400 font-bold text-[10px] tracking-wider border-b border-slate-100">CUSTOMER ID</th>
                    <th className="py-2.5 px-3 text-slate-400 font-bold text-[10px] tracking-wider border-b border-slate-100">NAME</th>
                    <th className="py-2.5 px-3 text-slate-400 font-bold text-[10px] tracking-wider border-b border-slate-100">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.slice(0, 2).map(c => (
                    <tr key={c.id}>
                      <td className="p-3 border-b border-slate-100 font-bold text-slate-500">{c.id}</td>
                      <td className="p-3 border-b border-slate-100 text-slate-600">{c.name}</td>
                      <td className="p-3 border-b border-slate-100 text-slate-600">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold inline-block ${c.status === 'Active' || c.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-blue-50 text-blue-500'
                          }`}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Service Bills */}
          <div className="bg-white rounded-xl p-6 border border-[#eef2f6] shadow-sm">
            <div className="flex justify-between items-center mb-3.5">
              <h3 className="text-sm font-bold text-slate-800 m-0">Recent Service Bills</h3>
              <button className="bg-transparent border-none text-[#184edb] text-[11px] font-bold cursor-pointer tracking-wider hover:underline">VIEW ALL</button>
            </div>
            <div className="w-full overflow-x-auto">
              <table className="w-full border-collapse text-left text-[12.5px]">
                <thead>
                  <tr>
                    <th className="py-2.5 px-3 text-slate-400 font-bold text-[10px] tracking-wider border-b border-slate-100">BILL ID</th>
                    <th className="py-2.5 px-3 text-slate-400 font-bold text-[10px] tracking-wider border-b border-slate-100">DATE</th>
                    <th className="py-2.5 px-3 text-slate-400 font-bold text-[10px] tracking-wider border-b border-slate-100">AMOUNT</th>
                    <th className="py-2.5 px-3 text-slate-400 font-bold text-[10px] tracking-wider border-b border-slate-100">PAYMENT STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 border-b border-slate-100 font-bold text-slate-500">#SB-4492</td>
                    <td className="p-3 border-b border-slate-100 text-slate-600">Oct 12, 2023</td>
                    <td className="p-3 border-b border-slate-100 font-bold text-slate-700">₹18,450</td>
                    <td className="p-3 border-b border-slate-100 text-slate-600"><span className="px-2 py-0.5 rounded-md text-[10px] font-semibold inline-block bg-green-100 text-green-700">Paid</span></td>
                  </tr>
                  <tr>
                    <td className="p-3 border-b border-slate-100 font-bold text-slate-500">#SB-4493</td>
                    <td className="p-3 border-b border-slate-100 text-slate-600">Oct 14, 2023</td>
                    <td className="p-3 border-b border-slate-100 font-bold text-slate-700">₹24,100</td>
                    <td className="p-3 border-b border-slate-100 text-slate-600"><span className="px-2 py-0.5 rounded-md text-[10px] font-semibold inline-block bg-orange-50 text-orange-600">Pending</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="bg-white rounded-xl p-6 border border-[#eef2f6] shadow-sm">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-sm font-bold text-slate-800 m-0">Transaction History</h3>
          <div className="flex items-center gap-3">
            <div className="relative flex items-center">
              <Search className="absolute left-2.5 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 border border-slate-200 rounded-md text-xs outline-none w-[180px] bg-slate-50 transition-all focus:border-[#184edb] focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <button className="bg-[#184edb] text-white border-none py-1.5 px-3.5 rounded-md text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors hover:bg-blue-900"><Plus size={16} /> New Payment</button>
          </div>
        </div>
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse text-left text-[12.5px]">
            <thead>
              <tr>
                <th className="py-2.5 px-3 text-slate-400 font-bold text-[10px] tracking-wider border-b border-slate-100">REF ID</th>
                <th className="py-2.5 px-3 text-slate-400 font-bold text-[10px] tracking-wider border-b border-slate-100">PAYEE NAME</th>
                <th className="py-2.5 px-3 text-slate-400 font-bold text-[10px] tracking-wider border-b border-slate-100">METHOD</th>
                <th className="py-2.5 px-3 text-slate-400 font-bold text-[10px] tracking-wider border-b border-slate-100">VEHICLE/JOB</th>
                <th className="py-2.5 px-3 text-slate-400 font-bold text-[10px] tracking-wider border-b border-slate-100">DATE</th>
                <th className="py-2.5 px-3 text-slate-400 font-bold text-[10px] tracking-wider border-b border-slate-100">AMOUNT</th>
                <th className="py-2.5 px-3 text-slate-400 font-bold text-[10px] tracking-wider border-b border-slate-100">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(t => (
                <tr key={t.refId}>
                  <td className="p-3 border-b border-slate-100 font-bold text-[#184edb] cursor-pointer hover:underline">{t.refId}</td>
                  <td className="p-3 border-b border-slate-100 font-medium text-slate-700">{t.payeeName}</td>
                  <td className="p-3 border-b border-slate-100 text-slate-600">{t.method}</td>
                  <td className="p-3 border-b border-slate-100 text-slate-600">{t.vehicleJob}</td>
                  <td className="p-3 border-b border-slate-100 text-slate-600">{t.date}</td>
                  <td className="p-3 border-b border-slate-100 font-bold text-slate-700">{t.amount}</td>
                  <td className="p-3 border-b border-slate-100 text-slate-600">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold inline-block ${t.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-blue-600'
                      }`}>{t.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Workshop Performance */}
        <div
          onClick={() => onNavigate('service')}
          className="bg-white rounded-xl p-5 border border-[#eef2f6] shadow-sm flex flex-col gap-4 cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50">
              <Car size={16} className="text-blue-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 m-0">Workshop Performance</h3>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Service Efficiency</span>
              <span className="font-bold">82%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: '82%' }}></div>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Delivery Rate</span>
              <span className="font-bold">88%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: '88%' }}></div>
            </div>
          </div>
        </div>

        {/* Inventory Summary */}
        <div
          onClick={() => onNavigate('parts')}
          className="bg-white rounded-xl p-5 border border-[#eef2f6] shadow-sm flex flex-col gap-4 cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-orange-50">
              <PackageOpen size={16} className="text-orange-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 m-0">Inventory Summary</h3>
          </div>
          <div className="flex justify-between items-center h-full py-2">
            <div className="flex-1 text-center">
              <h4 className="text-2xl font-bold m-0 mb-1 text-slate-700">{effectivePartsList.length || 0}</h4>
              <span className="text-[9px] font-bold text-slate-400 tracking-wider">TOTAL ITEMS</span>
            </div>
            <div className="flex-1 text-center border-l border-r border-slate-200">
              <h4 className="text-2xl font-bold m-0 mb-1 text-orange-600">{lowStockCount}</h4>
              <span className="text-[9px] font-bold text-slate-400 tracking-wider">LOW STOCK</span>
            </div>
            <div className="flex-1 text-center">
              <h4 className="text-2xl font-bold m-0 mb-1 text-red-600">{outStockCount}</h4>
              <span className="text-[9px] font-bold text-slate-400 tracking-wider">OUT STOCK</span>
            </div>
          </div>
        </div>

        {/* Revenue Summary */}
        <div
          onClick={() => onNavigate('billing')}
          className="bg-white rounded-xl p-5 border border-[#eef2f6] shadow-sm flex flex-col gap-4 relative cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-50">
              <Coins size={16} className="text-green-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 m-0">Revenue Summary</h3>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs text-slate-500 pb-1.5 border-b border-dashed border-slate-100">
              <span>Service Revenue</span>
              <span className="font-medium text-slate-800">₹12.4L</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500 pb-1.5 border-b border-dashed border-slate-100">
              <span>Spare Parts Revenue</span>
              <span className="font-medium text-slate-800">₹8.2L</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500 pb-1.5 border-b border-dashed border-slate-100">
              <span>Vehicle Sales Revenue</span>
              <span className="font-medium text-slate-800">₹42.5L</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500 pb-0 border-b-0 pt-1.5">
              <span className="font-bold text-[#184edb]">Total Revenue (MTD)</span>
              <span className="font-bold text-[#184edb]">₹63.1L</span>
            </div>
          </div>

          {/* Floating plus button */}
          <button className="absolute right-4 bottom-4 w-9 h-9 rounded-full bg-[#184edb] text-white border-none flex items-center justify-center cursor-pointer shadow-lg shadow-blue-500/35 transition-all hover:bg-blue-900 hover:scale-105">
            <Plus size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
