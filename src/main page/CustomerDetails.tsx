import React, { useState, useEffect } from 'react';
import EditCustomer from './EditCustomer';
import { 
  User, 
  Truck, 
  Wrench, 
  FileText, 
  Wallet, 
  Eye, 
  Edit3, 
  ChevronRight, 
  ArrowLeft,
  Search,
  Download,
  SlidersHorizontal,
  Landmark
} from 'lucide-react';

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

interface CustomerDetailsProps {
  customer: CustomerType;
  onBack: () => void;
}

export const CustomerDetails: React.FC<CustomerDetailsProps> = ({ customer: initialCustomer, onBack }) => {
  const [activeTab, setActiveTab] = useState<'vehicles' | 'services' | 'payments'>('vehicles');
  const [currentCustomer, setCurrentCustomer] = useState<CustomerType>(initialCustomer);
  const [isEditing, setIsEditing] = useState(false);
  const [serviceSearchTerm, setServiceSearchTerm] = useState('');

  useEffect(() => {
    setCurrentCustomer(initialCustomer);
  }, [initialCustomer]);

  const customer = currentCustomer;

  const [dbVehicles, setDbVehicles] = useState<any[]>([]);
  const [dbJobCards, setDbJobCards] = useState<any[]>([]);
  const [dbTransactions, setDbTransactions] = useState<any[]>([]);
  const [dbSales, setDbSales] = useState<any[]>([]);

  const dynamicOutstandingNum = dbSales.reduce((acc, s) => {
    if (s.status === 'PENDING') {
      const balStr = s.balanceAmount || s.grandTotal || '0';
      const balNum = Number(balStr.toString().replace(/[^\d.]/g, '')) || 0;
      return acc + balNum;
    }
    return acc;
  }, 0);
  const dynamicOutstandingStr = `₹${dynamicOutstandingNum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  // Calculate dynamic meta based on real fetched data
  const customerMeta = {
    tier: dbJobCards.length > 3 ? 'Gold Tier Client' : 'Standard Client',
    gstNo: '27XXXXX1234F1ZX',
    address: `${customer.district || 'Main Street'}, India`,
    totalServices: dbJobCards.length,
    totalBills: dbSales.length + dbTransactions.length,
    isOverdue: dynamicOutstandingNum > 0,
  };

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    fetch(`${API_URL}/api/vehicles`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setDbVehicles(data);
      })
      .catch(err => console.error('Error fetching vehicles:', err));

    fetch(`${API_URL}/api/jobcards`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setDbJobCards(data.filter((jc: any) => jc.customerName === initialCustomer.name));
      })
      .catch(err => console.error('Error fetching jobcards:', err));

    fetch(`${API_URL}/api/transactions`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setDbTransactions(data.filter((tx: any) => tx.payeeName === initialCustomer.name));
      })
      .catch(err => console.error('Error fetching transactions:', err));

    fetch(`${API_URL}/api/sales`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setDbSales(data.filter((s: any) => s.customerName === initialCustomer.name));
      })
      .catch(err => console.error('Error fetching sales:', err));
  }, [initialCustomer.name]);

  const getVehicleHistory = () => {
    const vehiclesList: any[] = [];
    const modelCounts = new Map<string, number>();

    // 1. Process all Sales first (Source of Truth for purchases)
    dbSales.forEach(sale => {
      const model = sale.vehicleModel;
      const v = dbVehicles.find(v => v.modelName === model || model.includes(v.modelName) || v.modelName.includes(model)) || {};
      
      let isDelivered = sale.status === 'DELIVERED';
      
      if (sale.deliveryDate) {
        const d = new Date(sale.deliveryDate);
        if (!isNaN(d.getTime())) {
          d.setFullYear(d.getFullYear() + 2);

          
          // If delivery date is past or today, automatically consider it delivered
          const deliveryDateObj = new Date(sale.deliveryDate);
          // Set time to 0 to only compare dates
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          deliveryDateObj.setHours(0, 0, 0, 0);
          
          if (deliveryDateObj <= today) {
            isDelivered = true;
          }
        }
      }

      vehiclesList.push({
        id: `SALE-${sale.invoiceNo}`,
        model: model,
        registration: 'Pending Reg.',
        chassis: v.chassisNo || 'Unknown',
        purchaseDate: sale.deliveryDate,
        status: isDelivered ? 'Active' : sale.status,
        statusClass: isDelivered ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100',
        image: v.imageUrl || 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=100'
      });
    });

    // 2. Process Job Cards
    dbJobCards.forEach(jc => {
      const model = jc.vehicleModel;
      const reg = jc.vehicleReg;

      const alreadyHasReg = vehiclesList.find(v => v.registration === reg);
      
      if (!alreadyHasReg) {
        const unassignedSale = vehiclesList.find(v => v.model === model && v.registration === 'Pending Reg.');
        
        if (unassignedSale) {
          unassignedSale.registration = reg;
        } else {
          const v = dbVehicles.find(v => v.modelName === model) || {};
          const pDate = v.createdAt ? new Date(v.createdAt).toLocaleDateString('en-IN') : 'Unknown';
          vehiclesList.push({
            id: `JC-${reg}`,
            model: model,
            registration: reg,
            chassis: v.chassisNo || 'Unknown',
            purchaseDate: pDate,
            status: 'Active',
            statusClass: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
            image: v.imageUrl || 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=100'
          });
        }
      }
    });

    // 3. Count occurrences to mark duplicates for highlighting
    vehiclesList.forEach(v => {
      modelCounts.set(v.model, (modelCounts.get(v.model) || 0) + 1);
    });

    vehiclesList.forEach(v => {
      v.isMultiple = (modelCounts.get(v.model) || 0) > 1;
      v.count = modelCounts.get(v.model);
    });

    return vehiclesList;
  };

  const vehicleHistory = getVehicleHistory();








  if (isEditing) {
    return (
      <EditCustomer 
        customer={customer} 
        onBack={() => setIsEditing(false)} 
        onSave={(updated) => {
          setCurrentCustomer(updated);
          setIsEditing(false);
        }} 
      />
    );
  }

  return (
    <div className="p-8 bg-[#f6f8fc] min-h-[calc(100vh-70px)] flex flex-col gap-6 box-border font-sans text-slate-700 text-left">
      
      {/* Breadcrumbs with Navigation */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <span className="cursor-pointer hover:text-slate-600" onClick={onBack}>Dashboard</span>
            <ChevronRight size={10} />
            <span className="cursor-pointer hover:text-slate-600" onClick={onBack}>Customers</span>
            <ChevronRight size={10} />
            <span className="text-slate-600 font-bold">{customer.id}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 m-0 mt-1.5 tracking-tight font-heading">
            Customer Details - {customer.id}
          </h1>
        </div>

        {/* Top Right Buttons */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs py-2 px-4 rounded-md flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
          >
            <ArrowLeft size={13} /> Back to Customer List
          </button>
          
          <button 
            onClick={() => setIsEditing(true)}
            className="bg-[#184edb] hover:bg-blue-800 text-white font-semibold text-xs py-2 px-4 rounded-md flex items-center gap-2 cursor-pointer transition-colors border-none shadow-sm"
          >
            <Edit3 size={13} /> Edit Profile
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start w-full">
        
        {/* Left Card: Customer Profile details */}
        <div className="bg-white rounded-xl border border-[#eef2f6] shadow-sm p-6 flex flex-col gap-6">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
              <User size={32} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-800 text-[18px]">{customer.name}</span>
                <span className="bg-blue-50 text-[#184edb] text-[9.5px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-blue-100">
                  {customer.status}
                </span>
              </div>
              <span className="text-[12.5px] text-slate-400 font-semibold mt-1">{customerMeta.tier}</span>
            </div>
          </div>

          {/* Details fields */}
          <div className="grid grid-cols-2 gap-y-5 text-[12.5px]">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Customer ID</span>
              <span className="font-bold text-slate-800">{customer.id}</span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone</span>
              <span className="font-semibold text-slate-700">{customer.phone}</span>
            </div>

            <div className="flex flex-col gap-1 col-span-2 border-t border-slate-100/70 pt-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">GST Number</span>
              <span className="font-mono text-slate-700 font-semibold tracking-wide">{customerMeta.gstNo}</span>
            </div>

            <div className="flex flex-col gap-1 col-span-2 border-t border-slate-100/70 pt-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Address</span>
              <span className="text-slate-600 font-medium leading-relaxed">{customerMeta.address}</span>
            </div>
          </div>
        </div>

        {/* Right Section: 4 Stat Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          
          {/* Card 1: Total Vehicles */}
          <div className="bg-white rounded-xl p-6 border border-[#eef2f6] shadow-sm flex flex-col justify-between h-32 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
            <div className="flex justify-between items-center">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-50">
                <Truck className="text-blue-600" size={20} />
              </div>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-300">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
            </div>
            <div className="flex flex-col gap-1 mt-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Vehicles</span>
              <h2 className="text-3xl font-extrabold text-slate-900 m-0 font-heading">{vehicleHistory.length}</h2>
            </div>
          </div>

          {/* Card 2: Total Services */}
          <div className="bg-white rounded-xl p-6 border border-[#eef2f6] shadow-sm flex flex-col justify-between h-32 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
            <div className="flex justify-between items-center">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-50">
                <Wrench className="text-blue-600" size={20} />
              </div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-300">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className="flex flex-col gap-1 mt-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Services</span>
              <h2 className="text-3xl font-extrabold text-slate-900 m-0 font-heading">{customerMeta.totalServices}</h2>
            </div>
          </div>

          {/* Card 3: Total Bills */}
          <div className="bg-white rounded-xl p-6 border border-[#eef2f6] shadow-sm flex flex-col justify-between h-32 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
            <div className="flex justify-between items-center">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-orange-50">
                <FileText className="text-orange-600" size={20} />
              </div>
            </div>
            <div className="flex flex-col gap-1 mt-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Bills</span>
              <h2 className="text-3xl font-extrabold text-slate-900 m-0 font-heading">{customerMeta.totalBills}</h2>
            </div>
          </div>

          {/* Card 4: Outstanding */}
          <div className={`rounded-xl p-6 shadow-sm flex flex-col justify-between h-32 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 border ${
            customerMeta.isOverdue 
              ? 'bg-red-50/50 border-red-100 text-red-700' 
              : 'bg-white border-[#eef2f6] text-slate-700'
          }`}>
            <div className="flex justify-between items-center">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                customerMeta.isOverdue ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600'
              }`}>
                <Wallet size={20} />
              </div>
              {customerMeta.isOverdue && (
                <span className="bg-red-600 text-white text-[8px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                  Overdue
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1 mt-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                customerMeta.isOverdue ? 'text-red-500' : 'text-slate-400'
              }`}>Outstanding</span>
              <h2 className={`text-3xl font-extrabold m-0 font-heading ${
                customerMeta.isOverdue ? 'text-red-700' : 'text-slate-900'
              }`}>{dynamicOutstandingStr}</h2>
            </div>
          </div>

        </div>

      </div>

      {/* Tabs Layout */}
      <div className="bg-white rounded-xl border border-[#eef2f6] shadow-sm overflow-hidden w-full">
        
        {/* Tab Headers */}
        <div className="flex border-b border-slate-100 bg-slate-50/40">
          
          <button 
            onClick={() => setActiveTab('vehicles')}
            className={`py-3.5 px-6 font-bold text-[12.5px] cursor-pointer bg-transparent border-none outline-none transition-colors border-b-[2.5px] ${
              activeTab === 'vehicles' 
                ? 'border-[#184edb] text-[#184edb]' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Vehicle History
          </button>

          <button 
            onClick={() => setActiveTab('services')}
            className={`py-3.5 px-6 font-bold text-[12.5px] cursor-pointer bg-transparent border-none outline-none transition-colors border-b-[2.5px] ${
              activeTab === 'services' 
                ? 'border-[#184edb] text-[#184edb]' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Service Records
          </button>

          <button 
            onClick={() => setActiveTab('payments')}
            className={`py-3.5 px-6 font-bold text-[12.5px] cursor-pointer bg-transparent border-none outline-none transition-colors border-b-[2.5px] ${
              activeTab === 'payments' 
                ? 'border-[#184edb] text-[#184edb]' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Payment History
          </button>



        </div>

        {/* Tab Panels */}
        <div className="w-full">
          
          {/* VEHICLES TAB */}
          {activeTab === 'vehicles' && (
            <div className="overflow-x-auto w-full">
              <table className="w-full border-collapse text-left text-[12px]">
                <thead>
                  <tr className="bg-slate-50/20">
                    <th className="py-3.5 px-6 text-slate-400 font-bold text-[9.5px] tracking-wider border-b border-slate-100">VEHICLE MODEL</th>
                    <th className="py-3.5 px-6 text-slate-400 font-bold text-[9.5px] tracking-wider border-b border-slate-100">REGISTRATION NO.</th>
                    <th className="py-3.5 px-6 text-slate-400 font-bold text-[9.5px] tracking-wider border-b border-slate-100">CHASSIS NO.</th>
                    <th className="py-3.5 px-6 text-slate-400 font-bold text-[9.5px] tracking-wider border-b border-slate-100">PURCHASE DATE</th>
                    <th className="py-3.5 px-6 text-slate-400 font-bold text-[9.5px] tracking-wider border-b border-slate-100">STATUS</th>
                    <th className="py-3.5 px-6 text-slate-400 font-bold text-[9.5px] tracking-wider border-b border-slate-100 text-center">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicleHistory.map((veh, i) => (
                    <tr key={i} className={`hover:bg-slate-50/80 transition-colors ${veh.isMultiple ? 'bg-blue-50/40' : ''}`}>
                      <td className="p-4 px-6 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <img 
                            src={veh.image} 
                            alt={veh.model}
                            className={`w-10 h-8 object-cover rounded-md border shadow-xs flex-shrink-0 ${veh.isMultiple ? 'border-blue-300 ring-2 ring-blue-100' : 'border-slate-100'}`}
                          />
                          <div className="flex flex-col">
                            <span className="font-extrabold text-slate-800 hover:underline hover:text-[#184edb]">
                              {veh.model}
                            </span>
                            {veh.isMultiple && (
                              <span className="text-[9px] font-extrabold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded w-max mt-1">
                                {veh.count}x Purchased
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 px-6 border-b border-slate-100 text-slate-700 font-semibold">{veh.registration}</td>
                      <td className="p-4 px-6 border-b border-slate-100 text-slate-500 font-mono text-[11px]">{veh.chassis}</td>
                      <td className="p-4 px-6 border-b border-slate-100 text-slate-500 font-medium">{veh.purchaseDate}</td>
                      <td className="p-4 px-6 border-b border-slate-100">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold inline-block ${veh.statusClass}`}>
                          {veh.status}
                        </span>
                      </td>
                      <td className="p-4 px-6 border-b border-slate-100 text-center">
                        <button 
                          className="bg-transparent border-none text-[#184edb] hover:text-blue-800 cursor-pointer p-1"
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* SERVICES TAB */}
          {activeTab === 'services' && (() => {
            const mockServiceLog = [
              {
                jobCard: 'JC-2024-9182',
                date: 'Oct 12, 2023',
                description: 'Hydraulic pump failure & filter replacement',
                mechanic: 'Mark Henderson',
                labour: '₹450.00',
                parts: '₹1,240.50',
                total: '₹1,690.50'
              },
              {
                jobCard: 'JC-2024-9245',
                date: 'Feb 15, 2024',
                description: 'Engine diagnostic & routine 1000hr service',
                mechanic: 'Sarah Jenkins',
                labour: '₹280.00',
                parts: '₹310.20',
                total: '₹590.20'
              },
              {
                jobCard: 'JC-2023-8812',
                date: 'Nov 05, 2023',
                description: 'Track adjustment & sprocket inspection',
                mechanic: 'Mark Henderson',
                labour: '₹320.00',
                parts: '₹0.00',
                total: '₹320.00'
              },
              {
                jobCard: 'JC-2023-8700',
                date: 'Aug 22, 2023',
                description: 'Electrical short in lighting system',
                mechanic: 'David Smith',
                labour: '₹120.00',
                parts: '₹45.50',
                total: '₹165.50'
              }
            ];

            const realServiceLog = dbJobCards.map(jc => ({
              jobCard: jc.jcNumber,
              date: jc.inTime ? new Date(jc.inTime).toLocaleDateString('en-IN') : 'Unknown',
              description: jc.complaintSummary || 'N/A',
              mechanic: jc.mechanicName || 'Unassigned',
              labour: '-',
              parts: '-',
              total: jc.status || '-'
            }));

            const serviceLog = dbJobCards.length > 0 ? realServiceLog : mockServiceLog;

            const filteredLogs = serviceLog.filter(log => 
              log.jobCard.toLowerCase().includes(serviceSearchTerm.toLowerCase()) ||
              log.description.toLowerCase().includes(serviceSearchTerm.toLowerCase()) ||
              log.mechanic.toLowerCase().includes(serviceSearchTerm.toLowerCase())
            );

            return (
              <div className="flex flex-col w-full">
                
                {/* Header Filter Row */}
                <div className="p-4 px-6 border-b border-slate-100 bg-slate-50/10 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-800 m-0 font-heading">Service Log</h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <button className="bg-white border border-slate-200 rounded-md py-1.5 px-4 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors text-slate-600 hover:bg-slate-50">
                      <SlidersHorizontal size={13} /> Filter by Date Range
                    </button>
                    
                    <div className="relative flex items-center">
                      <Search className="absolute left-3 text-slate-450" size={13} />
                      <input 
                        type="text" 
                        placeholder="Job number..."
                        value={serviceSearchTerm}
                        onChange={(e) => setServiceSearchTerm(e.target.value)}
                        className="pl-9 pr-3 py-1.5 border border-slate-200 rounded-md text-xs outline-none w-52 bg-slate-50 text-slate-700 font-medium placeholder-slate-400 focus:border-blue-400 focus:bg-white transition-all"
                      />
                    </div>

                    <button className="bg-white border border-slate-200 rounded-md p-1.5 flex items-center justify-center cursor-pointer transition-colors text-slate-600 hover:bg-slate-50">
                      <Download size={13} />
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto w-full">
                  <table className="w-full border-collapse text-left text-[12px]">
                    <thead>
                      <tr className="bg-slate-50/20 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                        <th className="py-3 px-6 border-b border-slate-100">JOB CARD NO.</th>
                        <th className="py-3 px-6 border-b border-slate-100">SERVICE DATE</th>
                        <th className="py-3 px-6 border-b border-slate-100">COMPLAINT / DESCRIPTION</th>
                        <th className="py-3 px-6 border-b border-slate-100">MECHANIC</th>
                        <th className="py-3 px-6 border-b border-slate-100">LABOUR</th>
                        <th className="py-3 px-6 border-b border-slate-100">PARTS</th>
                        <th className="py-3 px-6 border-b border-slate-100">TOTAL BILL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLogs.map((ser, i) => (
                        <tr key={i} className="hover:bg-slate-50/40 transition-colors text-slate-700 font-medium">
                          <td className="py-3.5 px-6 border-b border-slate-100 font-bold text-[#184edb] hover:underline cursor-pointer">
                            {ser.jobCard}
                          </td>
                          <td className="py-3.5 px-6 border-b border-slate-100 text-slate-500">{ser.date}</td>
                          <td className="py-3.5 px-6 border-b border-slate-100 text-slate-700 font-semibold">{ser.description}</td>
                          <td className="py-3.5 px-6 border-b border-slate-100 text-slate-700">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-slate-350 flex-shrink-0" />
                              <span>{ser.mechanic}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-6 border-b border-slate-100 text-slate-500">{ser.labour}</td>
                          <td className="py-3.5 px-6 border-b border-slate-100 text-slate-500">{ser.parts}</td>
                          <td className="py-3.5 px-6 border-b border-slate-100 text-slate-900 font-bold">{ser.total}</td>
                        </tr>
                      ))}
                      
                      {filteredLogs.length === 0 && (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-400 font-semibold">
                            No service records found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer */}
                <div className="p-4 bg-slate-50/10 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div>
                    Showing {filteredLogs.length} of {dbJobCards.length} records
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="w-7 h-7 bg-white border border-slate-200 rounded-md flex items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-50" disabled>
                      &lt;
                    </button>
                    <button className="w-8 h-7 bg-white border border-slate-200 rounded-md flex items-center justify-center text-slate-700 font-bold text-xs">
                      1
                    </button>
                    <button className="w-7 h-7 bg-white border border-slate-200 rounded-md flex items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-50" disabled>
                      &gt;
                    </button>
                  </div>
                </div>

              </div>
            );
          })()}

          {/* PAYMENTS TAB */}
          {activeTab === 'payments' && (() => {
            const paymentHistory: Array<{
              invoiceNo: string;
              subtitle: string;
              date: string;
              amount: string;
              paid: string;
              balance: string;
              method: string;
              isUpi: boolean;
              isNa: boolean;
              status: string;
              statusClass: string;
              receiptAvailable: boolean;
            }> = [];
            dbSales.forEach(s => {
              paymentHistory.push({
                invoiceNo: s.invoiceNo,
                subtitle: s.vehicleModel,
                date: s.deliveryDate,
                amount: s.grandTotal,
                paid: s.advancePaid || (s.status === 'DELIVERED' ? s.grandTotal : '₹0'),
                balance: s.balanceAmount || (s.status === 'DELIVERED' ? '₹0' : s.grandTotal),
                method: s.status === 'DELIVERED' ? 'Bank Transfer' : 'Not Applicable',
                isUpi: false,
                isNa: s.status !== 'DELIVERED',
                status: s.status === 'DELIVERED' ? 'PAID' : (s.status === 'PENDING' ? 'UNPAID' : 'CANCELLED'),
                statusClass: s.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100',
                receiptAvailable: s.status === 'DELIVERED'
              });
            });
            dbTransactions.forEach(t => {
              paymentHistory.push({
                invoiceNo: t.refId,
                subtitle: t.vehicleJob,
                date: t.date,
                amount: t.amount,
                paid: t.amount,
                balance: '₹0',
                method: t.method,
                isUpi: t.method.includes('UPI'),
                isNa: false,
                status: 'PAID',
                statusClass: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
                receiptAvailable: true
              });
            });

            return (
              <div className="flex flex-col w-full">
                
                {/* Header Filter Row */}
                <div className="p-4 px-6 border-b border-slate-100 bg-slate-50/10 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <select className="border border-slate-200 rounded-md py-1.5 px-3 text-xs outline-none bg-white text-slate-700 font-semibold focus:border-blue-400">
                      <option>All Payments</option>
                    </select>

                    <select className="border border-slate-200 rounded-md py-1.5 px-3 text-xs outline-none bg-white text-slate-700 font-semibold focus:border-blue-400">
                      <option>Date (Newest)</option>
                    </select>
                  </div>

                  <div>
                    <button className="bg-transparent border-none text-[#184edb] hover:text-blue-800 font-bold text-xs cursor-pointer flex items-center gap-1.5">
                      <Download size={13} /> Export Statement (PDF/Excel)
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto w-full">
                  <table className="w-full border-collapse text-left text-[12px]">
                    <thead>
                      <tr className="bg-slate-50/20 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                        <th className="py-3 px-6 border-b border-slate-100">INVOICE NUMBER</th>
                        <th className="py-3 px-6 border-b border-slate-100">BILL DATE</th>
                        <th className="py-3 px-6 border-b border-slate-100 text-right">BILL AMOUNT</th>
                        <th className="py-3 px-6 border-b border-slate-100 text-right">PAID AMOUNT</th>
                        <th className="py-3 px-6 border-b border-slate-100 text-right">BALANCE</th>
                        <th className="py-3 px-6 border-b border-slate-100">PAYMENT METHOD</th>
                        <th className="py-3 px-6 border-b border-slate-100">STATUS</th>
                        <th className="py-3 px-6 border-b border-slate-100 text-center">RECEIPT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentHistory.map((pay, i) => (
                        <tr key={i} className="hover:bg-slate-50/40 transition-colors text-slate-700 font-medium">
                          
                          {/* Invoice No & Subtitle */}
                          <td className="py-4 px-6 border-b border-slate-100">
                            <div className="flex flex-col">
                              <span className="font-extrabold text-[#184edb] hover:underline cursor-pointer">{pay.invoiceNo}</span>
                              <span className="text-[10px] text-slate-400 mt-0.5">{pay.subtitle}</span>
                            </div>
                          </td>

                          {/* Date */}
                          <td className="py-4 px-6 border-b border-slate-100 text-slate-500">{pay.date}</td>

                          {/* Bill Amount */}
                          <td className="py-4 px-6 border-b border-slate-100 text-slate-900 font-extrabold text-right">
                            {pay.amount}
                          </td>

                          {/* Paid Amount */}
                          <td className="py-4 px-6 border-b border-slate-100 text-slate-500 text-right">
                            {pay.paid}
                          </td>

                          {/* Balance */}
                          <td className={`py-4 px-6 border-b border-slate-100 text-right font-semibold ${
                            pay.balance !== '0.00' && pay.status === 'UNPAID' ? 'text-red-600 font-bold' : 'text-slate-500'
                          }`}>
                            {pay.balance}
                          </td>

                          {/* Payment Method */}
                          <td className="py-4 px-6 border-b border-slate-100">
                            {pay.isNa ? (
                              <span className="text-slate-400 font-medium">{pay.method}</span>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Landmark size={13} className="text-slate-400" />
                                <span className="text-slate-700 font-semibold">{pay.method}</span>
                              </div>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-4 px-6 border-b border-slate-100">
                            <span className={`px-2.5 py-0.5 rounded text-[9.5px] font-bold inline-block ${pay.statusClass}`}>
                              {pay.status}
                            </span>
                          </td>

                          {/* Receipt */}
                          <td className="py-4 px-6 border-b border-slate-100 text-center">
                            {pay.receiptAvailable ? (
                              <button className="bg-transparent border-none text-[#184edb] hover:text-blue-800 cursor-pointer">
                                <FileText size={15} />
                              </button>
                            ) : (
                              <FileText size={15} className="text-slate-300 mx-auto" />
                            )}
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            );
          })()}



        </div>

      </div>
    </div>
  );
};

export default CustomerDetails;

// Updated CustomerDetails.tsx
