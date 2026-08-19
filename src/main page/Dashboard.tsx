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
  Search,
  ArrowUpRight,
  X
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
  const [customers, setCustomers] = useState<CustomerType[]>([]);
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [parts, setParts] = useState<PartType[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierType[]>([]);
  const [jobcards, setJobcards] = useState<JobCardType[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [, setLocalDataTick] = useState(0);

  // Customers Modal controls
  const [showAllCustomersModal, setShowAllCustomersModal] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');

  // Service Bills state & Modal controls
  const [showAllServiceBillsModal, setShowAllServiceBillsModal] = useState(false);
  const [serviceBillsSearch, setServiceBillsSearch] = useState('');

  // Transactions Modal controls
  const [showAllTransactionsModal, setShowAllTransactionsModal] = useState(false);
  const [txnSearchTerm, setTxnSearchTerm] = useState('');
  const [serviceBills, setServiceBills] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('dms_service_bills');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [
      { id: 'sb-101', billNo: 'SB-4492', customerName: 'Balaji Logistics', vehicleNo: 'TN-38-AK-8821', date: 'Oct 12, 2023', grandTotal: 18450, status: 'PAID' },
      { id: 'sb-102', billNo: 'SB-4493', customerName: 'Ramu Transport', vehicleNo: 'TN-37-BY-1102', date: 'Oct 14, 2023', grandTotal: 24100, status: 'PENDING' },
      { id: 'sb-103', billNo: 'SB-4494', customerName: 'City Motors Garage', vehicleNo: 'KA-01-EF-5566', date: 'Oct 18, 2023', grandTotal: 9600, status: 'PAID' }
    ];
  });

  useEffect(() => {
    const loadServiceBills = () => {
      try {
        const saved = localStorage.getItem('dms_service_bills');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) setServiceBills(parsed);
        }
      } catch (e) {}
    };

    loadServiceBills();
    window.addEventListener('storage', loadServiceBills);
    window.addEventListener('dms_billing_updated', loadServiceBills);
    return () => {
      window.removeEventListener('storage', loadServiceBills);
      window.removeEventListener('dms_billing_updated', loadServiceBills);
    };
  }, []);

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
        if (Array.isArray(data)) {
          setCustomers(data);
        }
      })
      .catch(err => console.error('Error fetching customers:', err));

    // Fetch transactions
    fetch(`${API_URL}/api/transactions`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
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

  // Spare parts inventory logic directly synced from Spare Parts page
  const storedInventory = getStoredInventory();
  const effectivePartsList = storedInventory.length > 0 ? storedInventory : parts;

  const lowStockCount = effectivePartsList.filter(p => {
    const numStock = parseInt((p.stock || '0').replace(/[^0-9]/g, ''), 10) || 0;
    return p.stockStatus === 'low' || (numStock > 0 && numStock < 12);
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
      if (Array.isArray(parsed)) {
        suppliersCount = parsed.length;
      }
    }
  } catch (e) {}

  // Real-time calculation for Service Bills
  let serviceBillsCount = 0;
  try {
    const savedServiceBills = localStorage.getItem('dms_service_bills');
    if (savedServiceBills) {
      const parsed = JSON.parse(savedServiceBills);
      if (Array.isArray(parsed)) {
        serviceBillsCount = parsed.length;
      }
    }
  } catch (e) {}

  // Bulletproof numeric parser to avoid NaN
  const parseNumericAmount = (val: any): number => {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    const cleaned = String(val).replace(/[^\d.]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Real-time calculation for Counter Sales
  let counterSalesTotalStr = '₹0';
  try {
    const savedCounterSales = localStorage.getItem('dms_counter_sales_bills');
    if (savedCounterSales) {
      const parsed = JSON.parse(savedCounterSales);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const sumTotal = parsed.reduce((acc: number, bill: any) => acc + parseNumericAmount(bill.grandTotal), 0);
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

  // 1. Service Revenue
  const totalServiceRevenueNum = serviceBills.reduce((acc: number, bill: any) => {
    return acc + parseNumericAmount(bill.grandTotal || bill.subtotal);
  }, 0);

  // 2. Spare Parts Revenue
  let totalSparePartsRevenueNum = 0;
  try {
    const savedCounterSales = localStorage.getItem('dms_counter_sales_bills');
    if (savedCounterSales) {
      const parsed = JSON.parse(savedCounterSales);
      if (Array.isArray(parsed)) {
        totalSparePartsRevenueNum = parsed.reduce((sum: number, b: any) => sum + parseNumericAmount(b.grandTotal || b.subtotal), 0);
      }
    }
  } catch (e) {}

  // 3. Vehicle Sales Revenue
  let totalVehicleSalesRevenueNum = 0;
  try {
    let vSalesList = sales;
    const savedVehicleSales = localStorage.getItem('dms_vehicle_sales');
    if (savedVehicleSales) {
      const parsed = JSON.parse(savedVehicleSales);
      if (Array.isArray(parsed) && parsed.length > 0) {
        vSalesList = parsed;
      }
    }
    totalVehicleSalesRevenueNum = vSalesList.reduce((sum: number, s: any) => {
      return sum + parseNumericAmount(s.grandTotal || s.totalAmount || s.price || s.priceAmount || s.amount);
    }, 0);
  } catch (e) {}

  // Total Revenue = Service Revenue + Spare Parts Revenue + Vehicle Sales Revenue
  const grandTotalRevenueNum = totalServiceRevenueNum + totalSparePartsRevenueNum + totalVehicleSalesRevenueNum;

  const formatRevenueStr = (val: number) => {
    const safeVal = isNaN(val) ? 0 : val;
    if (safeVal === 0) return '₹0';
    if (safeVal >= 10000000) return `₹${(safeVal / 10000000).toFixed(2)}Cr (₹${safeVal.toLocaleString('en-IN')})`;
    if (safeVal >= 100000) return `₹${(safeVal / 100000).toFixed(2)}L (₹${safeVal.toLocaleString('en-IN')})`;
    return `₹${safeVal.toLocaleString('en-IN')}`;
  };

  const serviceRevenueStr = formatRevenueStr(totalServiceRevenueNum);
  const sparePartsRevenueStr = formatRevenueStr(totalSparePartsRevenueNum);
  const vehicleSalesRevenueStr = formatRevenueStr(totalVehicleSalesRevenueNum);
  const totalRevenueStr = formatRevenueStr(grandTotalRevenueNum);

  const allCombinedTransactions: TransactionType[] = transactions.length > 0
    ? transactions
    : [
        ...sales.map((s, idx) => ({
          refId: s.invoiceNo || `TXN-SALE-${100 + idx}`,
          payeeName: s.customerName || 'Customer',
          method: 'Bank Transfer',
          vehicleJob: s.vehicleModel || 'Vehicle Sale',
          date: s.saleDate || s.date || 'Today',
          amount: s.grandTotal ? `₹${Number(s.grandTotal).toLocaleString('en-IN')}` : '₹0',
          status: s.status === 'PAID' ? 'Paid' : (s.status || 'Paid')
        })),
        ...serviceBills.map((sb, idx) => ({
          refId: sb.billNo || `TXN-SB-${200 + idx}`,
          payeeName: sb.customerName || 'Customer',
          method: 'UPI / Cash',
          vehicleJob: sb.vehicleNo || 'Service Bill',
          date: sb.date || 'Today',
          amount: sb.grandTotal ? `₹${Number(sb.grandTotal).toLocaleString('en-IN')}` : '₹0',
          status: sb.status === 'PAID' || sb.status === 'Paid' ? 'Paid' : 'Pending'
        }))
      ];

  const filteredTransactions = allCombinedTransactions;

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


      {/* Tables Stack */}
      <div className="flex flex-col gap-5">
          {/* Recent Customers */}
          <div className="bg-white rounded-xl p-6 border border-[#eef2f6] shadow-sm">
            <div className="flex justify-between items-center mb-3.5">
              <h3 className="text-sm font-bold text-slate-800 m-0">Recent Customers</h3>
              <button 
                type="button"
                onClick={() => setShowAllCustomersModal(true)}
                className="bg-transparent border-none text-[#184edb] text-[11px] font-bold cursor-pointer tracking-wider hover:underline"
              >
                VIEW ALL
              </button>
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
                  {customers.slice(0, 3).map(c => (
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
              <button 
                type="button"
                onClick={() => setShowAllServiceBillsModal(true)}
                className="bg-transparent border-none text-[#184edb] text-[11px] font-bold cursor-pointer tracking-wider hover:underline"
              >
                VIEW ALL
              </button>
            </div>
            <div className="w-full overflow-x-auto">
              <table className="w-full border-collapse text-left text-[12.5px]">
                <thead>
                  <tr>
                    <th className="py-2.5 px-3 text-slate-400 font-bold text-[10px] tracking-wider border-b border-slate-100">BILL ID</th>
                    <th className="py-2.5 px-3 text-slate-400 font-bold text-[10px] tracking-wider border-b border-slate-100">CUSTOMER / VEHICLE</th>
                    <th className="py-2.5 px-3 text-slate-400 font-bold text-[10px] tracking-wider border-b border-slate-100">DATE</th>
                    <th className="py-2.5 px-3 text-slate-400 font-bold text-[10px] tracking-wider border-b border-slate-100">AMOUNT</th>
                    <th className="py-2.5 px-3 text-slate-400 font-bold text-[10px] tracking-wider border-b border-slate-100">PAYMENT STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceBills.slice(0, 3).map((bill: any, idx: number) => (
                    <tr key={bill.id || bill.billNo || idx}>
                      <td className="p-3 border-b border-slate-100 font-bold text-[#184edb]">{bill.billNo || bill.id}</td>
                      <td className="p-3 border-b border-slate-100 font-semibold text-slate-700">
                        {bill.customerName || 'Customer'}
                        {bill.vehicleNo && <span className="block text-[11px] font-mono text-slate-400 font-normal">{bill.vehicleNo}</span>}
                      </td>
                      <td className="p-3 border-b border-slate-100 text-slate-600">{bill.date || 'Today'}</td>
                      <td className="p-3 border-b border-slate-100 font-bold text-slate-700">
                        ₹{(bill.grandTotal || bill.subtotal || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="p-3 border-b border-slate-100 text-slate-600">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold inline-block ${
                          bill.status === 'PAID' || bill.status === 'Paid'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-50 text-orange-600'
                        }`}>
                          {bill.status || 'PAID'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
      </div>

      {/* Transaction History Section */}
      <div className="bg-white rounded-xl p-6 border border-[#eef2f6] shadow-sm">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-sm font-bold text-slate-800 m-0">Transaction History</h3>
          <button
            type="button"
            onClick={() => setShowAllTransactionsModal(true)}
            className="bg-transparent border-none text-[#184edb] text-[11px] font-bold cursor-pointer tracking-wider hover:underline"
          >
            VIEW ALL
          </button>
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
              {filteredTransactions.slice(0, 3).map((t, idx) => (
                <tr key={t.refId || idx}>
                  <td className="p-3 border-b border-slate-100 font-bold text-[#184edb] cursor-pointer hover:underline">{t.refId}</td>
                  <td className="p-3 border-b border-slate-100 font-medium text-slate-700">{t.payeeName}</td>
                  <td className="p-3 border-b border-slate-100 text-slate-600">{t.method}</td>
                  <td className="p-3 border-b border-slate-100 text-slate-600">{t.vehicleJob}</td>
                  <td className="p-3 border-b border-slate-100 text-slate-600">{t.date}</td>
                  <td className="p-3 border-b border-slate-100 font-bold text-slate-700">{t.amount}</td>
                  <td className="p-3 border-b border-slate-100 text-slate-600">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold inline-block ${t.status === 'Paid' || t.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-blue-600'
                      }`}>{t.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
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
              <span className="font-medium text-slate-800">{serviceRevenueStr}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500 pb-1.5 border-b border-dashed border-slate-100">
              <span>Spare Parts Revenue</span>
              <span className="font-medium text-slate-800">{sparePartsRevenueStr}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500 pb-1.5 border-b border-dashed border-slate-100">
              <span>Vehicle Sales Revenue</span>
              <span className="font-medium text-slate-800">{vehicleSalesRevenueStr}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500 pb-0 border-b-0 pt-1.5">
              <span className="font-bold text-[#184edb]">Total Revenue</span>
              <span className="font-bold text-[#184edb]">{totalRevenueStr}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ALL SERVICE BILLS MODAL */}
      {showAllServiceBillsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn text-left">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col border border-slate-100">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-lg font-extrabold text-slate-800 m-0">All Service Bills</h2>
                <span className="text-xs text-slate-400 font-semibold">Total {serviceBills.length} Service Bills Found</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAllServiceBillsModal(false)}
                className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-slate-800 cursor-pointer transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Search & Nav Bar */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3 bg-white flex-wrap">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  type="text"
                  placeholder="Search by Bill No, Customer Name, or Vehicle No..."
                  value={serviceBillsSearch}
                  onChange={(e) => setServiceBillsSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none focus:border-[#184edb]"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAllServiceBillsModal(false);
                  onNavigate('billing');
                }}
                className="px-4 py-2 bg-[#184edb] hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Go to Service Billing Page
              </button>
            </div>

            {/* Modal Table Content */}
            <div className="p-5 overflow-y-auto flex-1">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-slate-100/70 text-slate-500 font-extrabold uppercase text-[10.5px] border-b border-slate-200">
                    <th className="py-3 px-4 w-12">#</th>
                    <th className="py-3 px-4">Bill ID</th>
                    <th className="py-3 px-4">Customer Name</th>
                    <th className="py-3 px-4">Vehicle No</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Grand Total</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {serviceBills
                    .filter((b: any) => {
                      if (!serviceBillsSearch.trim()) return true;
                      const q = serviceBillsSearch.toLowerCase();
                      return (
                        (b.billNo && b.billNo.toLowerCase().includes(q)) ||
                        (b.id && b.id.toLowerCase().includes(q)) ||
                        (b.customerName && b.customerName.toLowerCase().includes(q)) ||
                        (b.vehicleNo && b.vehicleNo.toLowerCase().includes(q))
                      );
                    })
                    .map((b: any, idx: number) => (
                      <tr key={b.id || b.billNo || idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 text-slate-400 font-bold">{idx + 1}</td>
                        <td className="py-3 px-4 font-bold text-[#184edb]">{b.billNo || b.id}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{b.customerName || 'Customer'}</td>
                        <td className="py-3 px-4 font-mono text-slate-600">{b.vehicleNo || '-'}</td>
                        <td className="py-3 px-4 text-slate-500">{b.date || 'Today'}</td>
                        <td className="py-3 px-4 text-right font-bold text-slate-800">
                          ₹{(b.grandTotal || b.subtotal || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                            b.status === 'PAID' || b.status === 'Paid'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {b.status || 'PAID'}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {/* ALL TRANSACTIONS MODAL */}
      {showAllTransactionsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn text-left">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col border border-slate-100">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-lg font-extrabold text-slate-800 m-0">All Transaction History</h2>
                <span className="text-xs text-slate-400 font-semibold">Total {allCombinedTransactions.length} Transactions Found</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAllTransactionsModal(false)}
                className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-slate-800 cursor-pointer transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Search Filter Bar */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3 bg-white">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  type="text"
                  placeholder="Search transactions by Ref ID, Payee, or Vehicle/Job..."
                  value={txnSearchTerm}
                  onChange={(e) => setTxnSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none focus:border-[#184edb]"
                />
              </div>
            </div>

            {/* Modal Table Content */}
            <div className="p-5 overflow-y-auto flex-1">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-slate-100/70 text-slate-500 font-extrabold uppercase text-[10.5px] border-b border-slate-200">
                    <th className="py-3 px-4 w-12">#</th>
                    <th className="py-3 px-4">Ref ID</th>
                    <th className="py-3 px-4">Payee Name</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">Vehicle / Job</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allCombinedTransactions
                    .filter((t: any) => {
                      if (!txnSearchTerm.trim()) return true;
                      const q = txnSearchTerm.toLowerCase();
                      return (
                        (t.refId && t.refId.toLowerCase().includes(q)) ||
                        (t.payeeName && t.payeeName.toLowerCase().includes(q)) ||
                        (t.method && t.method.toLowerCase().includes(q)) ||
                        (t.vehicleJob && t.vehicleJob.toLowerCase().includes(q))
                      );
                    })
                    .map((t: any, idx: number) => (
                      <tr key={t.refId || idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 text-slate-400 font-bold">{idx + 1}</td>
                        <td className="py-3 px-4 font-bold text-[#184edb]">{t.refId}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{t.payeeName}</td>
                        <td className="py-3 px-4 text-slate-600">{t.method}</td>
                        <td className="py-3 px-4 font-mono text-slate-600">{t.vehicleJob}</td>
                        <td className="py-3 px-4 text-slate-500">{t.date}</td>
                        <td className="py-3 px-4 text-right font-bold text-slate-800">{t.amount}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                            t.status === 'Paid' || t.status === 'PAID'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-blue-50 text-blue-600'
                          }`}>
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {/* ALL CUSTOMERS MODAL */}
      {showAllCustomersModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn text-left">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col border border-slate-100">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-lg font-extrabold text-slate-800 m-0">All Customers</h2>
                <span className="text-xs text-slate-400 font-semibold">Total {customers.length} Customers Registered</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAllCustomersModal(false)}
                className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-slate-800 cursor-pointer transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Search Filter Bar */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3 bg-white flex-wrap">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  type="text"
                  placeholder="Search by Customer ID, Name, Phone, or District..."
                  value={customerSearchTerm}
                  onChange={(e) => setCustomerSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none focus:border-[#184edb]"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAllCustomersModal(false);
                  onNavigate('customers');
                }}
                className="px-4 py-2 bg-[#184edb] hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Go to Customers Page
              </button>
            </div>

            {/* Modal Table Content */}
            <div className="p-5 overflow-y-auto flex-1">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-slate-100/70 text-slate-500 font-extrabold uppercase text-[10.5px] border-b border-slate-200">
                    <th className="py-3 px-4 w-12">#</th>
                    <th className="py-3 px-4">Customer ID</th>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Phone Number</th>
                    <th className="py-3 px-4">District</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customers
                    .filter((c: any) => {
                      if (!customerSearchTerm.trim()) return true;
                      const q = customerSearchTerm.toLowerCase();
                      return (
                        (c.id && c.id.toLowerCase().includes(q)) ||
                        (c.name && c.name.toLowerCase().includes(q)) ||
                        (c.phone && c.phone.toLowerCase().includes(q)) ||
                        (c.district && c.district.toLowerCase().includes(q))
                      );
                    })
                    .map((c: any, idx: number) => (
                      <tr key={c.id || idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 text-slate-400 font-bold">{idx + 1}</td>
                        <td className="py-3 px-4 font-bold text-[#184edb]">{c.id}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{c.name}</td>
                        <td className="py-3 px-4 font-mono text-slate-600">{c.phone || '-'}</td>
                        <td className="py-3 px-4 text-slate-500">{c.district || '-'}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                            c.status === 'Active' || c.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-blue-50 text-blue-600'
                          }`}>
                            {c.status || 'Active'}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
