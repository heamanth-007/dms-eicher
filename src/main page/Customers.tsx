import React, { useState, useEffect } from 'react';
import {
  Upload,
  UserPlus,
  Calendar,
  FileText,
  ChevronLeft,
  ChevronRight,
  Users,
  AlertCircle,
  Truck,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { CustomerDetails } from './CustomerDetails';
import { AddCustomer } from './AddCustomer';
import { EditCustomer } from './EditCustomer';

interface CustomerType {
  _id?: string;
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

interface CustomersProps {
  selectedCustomerName?: string | null;
  clearSelectedCustomer?: () => void;
}

export const Customers: React.FC<CustomersProps> = ({ selectedCustomerName, clearSelectedCustomer }) => {
  const [district, setDistrict] = useState('All Districts');
  const [state, setState] = useState('All States');
  const [vehicleType, setVehicleType] = useState('All Types');
  const [dateRange, setDateRange] = useState('');
  const [customers, setCustomers] = useState<CustomerType[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerType | null>(null);
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerType | null>(null);

  useEffect(() => {
    if (selectedCustomerName && customers.length > 0) {
      const found = customers.find(
        c => c.name.toLowerCase().includes(selectedCustomerName.toLowerCase()) || 
             c.id.toLowerCase().includes(selectedCustomerName.toLowerCase())
      );
      if (found) {
        setSelectedCustomer(found);
        setIsAddingCustomer(false);
      } else {
        const tempCustomer: CustomerType = {
          id: '#CUST-9921',
          name: selectedCustomerName,
          avatar: selectedCustomerName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
          avatarBg: 'bg-indigo-100 text-indigo-600',
          phone: '+91 98765 43210',
          district: 'Central Valley',
          vehicles: 1,
          lastService: 'Oct 24, 2023',
          outstanding: '₹0.00',
          status: 'ACTIVE'
        };
        setSelectedCustomer(tempCustomer);
        setIsAddingCustomer(false);
      }
      if (clearSelectedCustomer) {
        clearSelectedCustomer();
      }
    }
  }, [selectedCustomerName, customers, clearSelectedCustomer]);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchCustomers = () => {
    fetch(`${API_URL}/api/customers`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCustomers(data);
          localStorage.setItem('dms_customers', JSON.stringify(data));
        }
      })
      .catch(err => {
        console.error('Error fetching customers:', err);
      });

    fetch(`${API_URL}/api/sales`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setSales(data);
      })
      .catch(err => console.error('Error fetching sales:', err));
  };

  const handleSaveEditedCustomer = (updatedCustomer: CustomerType) => {
    const updatedList = customers.map(c => c.id === updatedCustomer.id ? updatedCustomer : c);
    setCustomers(updatedList);
    localStorage.setItem('dms_customers', JSON.stringify(updatedList));

    fetch(`${API_URL}/api/customers/${encodeURIComponent(updatedCustomer.id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedCustomer)
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to update customer');
        return res.json();
      })
      .then(() => {
        setIsEditingCustomer(false);
        setEditingCustomer(null);
        fetchCustomers();
      })
      .catch(err => {
        console.error('Error updating customer:', err);
        setIsEditingCustomer(false);
        setEditingCustomer(null);
      });
  };

  const handleDeleteCustomer = (customer: CustomerType) => {
    if (window.confirm(`Are you sure you want to delete ${customer.name}?`)) {
      const updatedList = customers.filter(c => c.id !== customer.id);
      setCustomers(updatedList);
      localStorage.setItem('dms_customers', JSON.stringify(updatedList));

      fetch(`${API_URL}/api/customers/${encodeURIComponent(customer.id)}`, {
        method: 'DELETE'
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to delete customer');
          return res.json();
        })
        .then(() => {
          fetchCustomers();
        })
        .catch(err => {
          console.error('Error deleting customer:', err);
        });
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);



  const handleClearFilters = () => {
    setDistrict('All Districts');
    setState('All States');
    setVehicleType('All Types');
    setDateRange('');
  };

  // Filter customers locally
  const filteredCustomers = customers.filter(c => {
    if (district !== 'All Districts' && c.district !== district) return false;
    return true;
  });

  const totalOutstanding = sales.reduce((sum, s) => {
    if (s.status === 'PENDING') {
      const balStr = s.balanceAmount || s.grandTotal || '0';
      const balNum = Number(balStr.toString().replace(/[^\d.]/g, '')) || 0;
      return sum + balNum;
    }
    return sum;
  }, 0);

  const getCustomerOutstandingStr = (cName: string) => {
    const custOut = sales.reduce((sum, s) => {
      if (s.status === 'PENDING' && s.customerName === cName) {
        const balStr = s.balanceAmount || s.grandTotal || '0';
        const balNum = Number(balStr.toString().replace(/[^\d.]/g, '')) || 0;
        return sum + balNum;
      }
      return sum;
    }, 0);
    return `₹${custOut.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  const outstandingStr = totalOutstanding >= 100000 
    ? `₹${(totalOutstanding / 100000).toFixed(2)}L` 
    : `₹${totalOutstanding.toLocaleString('en-IN')}`;

  if (selectedCustomer) {
    return <CustomerDetails customer={selectedCustomer} onBack={() => setSelectedCustomer(null)} />;
  }

  if (isAddingCustomer) {
    return (
      <AddCustomer
        onBack={() => setIsAddingCustomer(false)}
        onSave={() => {
          setIsAddingCustomer(false);
          fetchCustomers();
        }}
        onSaveAndAddVehicle={() => {
          setIsAddingCustomer(false);
          fetchCustomers();
        }}
      />
    );
  }

  if (isEditingCustomer && editingCustomer) {
    return (
      <EditCustomer
        customer={editingCustomer}
        onBack={() => {
          setIsEditingCustomer(false);
          setEditingCustomer(null);
        }}
        onSave={(updatedCustomer) => {
          handleSaveEditedCustomer(updatedCustomer);
        }}
      />
    );
  }

  return (
    <div className="p-8 bg-[#f6f8fc] min-h-[calc(100vh-70px)] flex flex-col gap-6 box-border font-sans text-slate-700 text-left">

      {/* Top Header Row with Actions */}
      <div className="flex justify-between items-center">
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Management &gt; Customers</span>
          <h1 className="text-2xl font-extrabold text-slate-900 m-0 mt-1.5 tracking-tight">Customers</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-white border border-slate-200 rounded-md py-2 px-4 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors text-slate-600 hover:bg-slate-50">
            <Upload size={14} /> Import
          </button>
          <button
            onClick={() => setIsAddingCustomer(true)}
            className="bg-[#184edb] text-white border-none py-2 px-4 rounded-md text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors hover:bg-blue-900"
          >
            <UserPlus size={14} /> Add Customer
          </button>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white rounded-xl p-6 border border-[#eef2f6] shadow-sm flex flex-col md:flex-row md:items-end gap-4">
        {/* District Select */}
        <div className="flex-1 flex flex-col gap-2">
          <label className="text-[10px] font-bold text-slate-400 tracking-wider">DISTRICT</label>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="border border-slate-200 rounded-md py-2 px-3 text-xs outline-none bg-slate-50 text-slate-700 font-medium"
          >
            <option>All Districts</option>
            <option>Central Valley</option>
            <option>Northern Hills</option>
            <option>Coastal Plains</option>
          </select>
        </div>

        {/* State Select */}
        <div className="flex-1 flex flex-col gap-2">
          <label className="text-[10px] font-bold text-slate-400 tracking-wider">STATE</label>
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="border border-slate-200 rounded-md py-2 px-3 text-xs outline-none bg-slate-50 text-slate-700 font-medium"
          >
            <option>All States</option>
            <option>California</option>
            <option>Texas</option>
            <option>New York</option>
          </select>
        </div>

        {/* Vehicle Type Select */}
        <div className="flex-1 flex flex-col gap-2">
          <label className="text-[10px] font-bold text-slate-400 tracking-wider">VEHICLE TYPE</label>
          <select
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            className="border border-slate-200 rounded-md py-2 px-3 text-xs outline-none bg-slate-50 text-slate-700 font-medium"
          >
            <option>All Types</option>
            <option>Tractor</option>
            <option>Excavator</option>
            <option>Truck</option>
          </select>
        </div>

        {/* Date Range Picker */}
        <div className="flex-1 flex flex-col gap-2">
          <label className="text-[10px] font-bold text-slate-400 tracking-wider">DATE RANGE</label>
          <div className="relative flex items-center">
            <Calendar className="absolute left-3 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Select dates"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="pl-9 pr-3 py-2 border border-slate-200 rounded-md text-xs outline-none w-full bg-slate-50 text-slate-700 font-medium"
            />
          </div>
        </div>

        {/* Clear Filters Button */}
        <button
          onClick={handleClearFilters}
          className="bg-blue-50/70 border-none text-[#184edb] font-semibold text-xs py-2 px-5 rounded-md cursor-pointer transition-colors hover:bg-blue-100/70"
        >
          Clear Filters
        </button>
      </div>

      {/* Main Customers Table Card */}
      <div className="bg-white rounded-xl border border-[#eef2f6] shadow-sm overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse text-left text-[12.5px]">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="py-3.5 px-4 text-slate-400 font-bold text-[10px] tracking-wider border-b border-slate-100">CUSTOMER ID</th>
                <th className="py-3.5 px-4 text-slate-400 font-bold text-[10px] tracking-wider border-b border-slate-100">NAME</th>
                <th className="py-3.5 px-4 text-slate-400 font-bold text-[10px] tracking-wider border-b border-slate-100">PHONE NUMBER</th>
                <th className="py-3.5 px-4 text-slate-400 font-bold text-[10px] tracking-wider border-b border-slate-100">DISTRICT</th>
                <th className="py-3.5 px-4 text-slate-400 font-bold text-[10px] tracking-wider border-b border-slate-100">VEHICLES</th>
                <th className="py-3.5 px-4 text-slate-400 font-bold text-[10px] tracking-wider border-b border-slate-100">LAST SERVICE</th>
                <th className="py-3.5 px-4 text-slate-400 font-bold text-[10px] tracking-wider border-b border-slate-100">OUTSTANDING</th>
                <th className="py-3.5 px-4 text-slate-400 font-bold text-[10px] tracking-wider border-b border-slate-100">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-50/40 transition-colors group">
                  <td
                    onClick={() => setSelectedCustomer(customer)}
                    className="p-4 border-b border-slate-100 font-bold text-[#184edb] cursor-pointer hover:underline"
                  >
                    {customer.id}
                  </td>
                  <td className="p-4 border-b border-slate-100 text-slate-700">
                    <div
                      onClick={() => setSelectedCustomer(customer)}
                      className="flex items-center gap-2.5 cursor-pointer hover:text-[#184edb] group-row"
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] ${customer.avatarBg}`}>
                        {customer.avatar}
                      </div>
                      <span className="font-semibold group-hover:underline">{customer.name}</span>
                    </div>
                  </td>
                  <td className="p-4 border-b border-slate-100 text-slate-500 font-medium">{customer.phone}</td>
                  <td className="p-4 border-b border-slate-100 text-slate-600">{customer.district}</td>
                  <td className="p-4 border-b border-slate-100 text-slate-600 font-semibold">{customer.vehicles}</td>
                  <td className="p-4 border-b border-slate-100 text-slate-500">{customer.lastService}</td>
                  <td className="p-4 border-b border-slate-100 font-bold text-slate-700">{getCustomerOutstandingStr(customer.name)}</td>
                  <td className="p-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setSelectedCustomer(customer)}
                        title="View Customer Details"
                        className="p-1.5 bg-blue-50 border border-blue-100 rounded-md text-blue-600 hover:bg-blue-100 cursor-pointer flex items-center justify-center transition-colors shadow-xs"
                      >
                        <Eye size={13} />
                      </button>
                      <button 
                        onClick={() => {
                          setEditingCustomer(customer);
                          setIsEditingCustomer(true);
                        }}
                        title="Edit Customer Details"
                        className="p-1.5 bg-green-50 border border-green-100 rounded-md text-green-600 hover:bg-green-100 cursor-pointer flex items-center justify-center transition-colors shadow-xs"
                      >
                        <Edit size={13} />
                      </button>
                      <button 
                        onClick={() => handleDeleteCustomer(customer)}
                        title="Delete Customer"
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

        {/* Table Footer with Actions and Pagination */}
        <div className="p-4 bg-slate-50/30 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-[11.5px] text-slate-400 font-medium">Showing 1-{filteredCustomers.length} of {customers.length} customers</span>
            <button className="bg-white border border-slate-200 rounded-md py-1 px-3 text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer text-slate-600 hover:bg-slate-50">
              <FileText size={12} /> Export PDF
            </button>
            <button className="bg-white border border-slate-200 rounded-md py-1 px-3 text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer text-slate-600 hover:bg-slate-50">
              <FileText size={12} /> Export Excel
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button className="w-7 h-7 bg-white border border-slate-200 rounded-md flex items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-50"><ChevronLeft size={14} /></button>
            <button className="w-7 h-7 bg-[#184edb] text-white rounded-md flex items-center justify-center font-bold text-xs">1</button>
            <button className="w-7 h-7 bg-white border border-slate-200 rounded-md flex items-center justify-center text-slate-500 font-semibold text-xs cursor-pointer hover:bg-slate-50">2</button>
            <button className="w-7 h-7 bg-white border border-slate-200 rounded-md flex items-center justify-center text-slate-500 font-semibold text-xs cursor-pointer hover:bg-slate-50">3</button>
            <span className="text-slate-400 text-xs px-1">...</span>
            <button className="w-7 h-7 bg-white border border-slate-200 rounded-md flex items-center justify-center text-slate-500 font-semibold text-xs cursor-pointer hover:bg-slate-50">12</button>
            <button className="w-7 h-7 bg-white border border-slate-200 rounded-md flex items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-50"><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      {/* Bottom Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Total Customers */}
        <div className="bg-white rounded-xl p-5 border border-[#eef2f6] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50">
            <Users className="text-blue-600" size={24} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider">TOTAL CUSTOMERS</span>
            <h3 className="text-2xl font-extrabold text-slate-800 m-0">{customers.length}</h3>
            <span className="text-[10.5px] font-bold text-green-600 flex items-center gap-0.5 mt-0.5">
              <ArrowUpRight size={12} /> +12% this month
            </span>
          </div>
        </div>

        {/* Total Outstanding */}
        <div className="bg-white rounded-xl p-5 border border-[#eef2f6] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-50">
            <FileText className="text-red-600" size={24} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider">TOTAL OUTSTANDING</span>
            <h3 className="text-2xl font-extrabold text-slate-800 m-0">{outstandingStr}</h3>
            <span className="text-[10.5px] font-bold text-red-600 flex items-center gap-1 mt-0.5">
              <AlertCircle size={12} /> Live Balance
            </span>
          </div>
        </div>

        {/* Fleet Coverage */}
        <div className="bg-white rounded-xl p-5 border border-[#eef2f6] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50">
            <Truck className="text-blue-600" size={24} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider">FLEET COVERAGE</span>
            <h3 className="text-2xl font-extrabold text-slate-800 m-0">
              {customers.reduce((acc, c) => acc + (c.vehicles || 0), 0)}
            </h3>
            <span className="text-[10.5px] font-bold text-slate-400 flex items-center gap-1 mt-0.5">
              <AlertCircle size={12} /> Registered Units
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ArrowUpRight = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="7" y1="17" x2="17" y2="7"></line>
    <polyline points="7 7 17 7 17 17"></polyline>
  </svg>
);

export default Customers;
