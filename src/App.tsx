import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './main page/Dashboard';
import Customers from './main page/Customers';
import VehicleSales from './main page/VehicleSales';
import type { SaleRecord } from './main page/VehicleSales';
import VehicleInventory from './pages/VehicleInventory';
import Mechanics from './pages/Mechanics';
import ServiceDashboard from './pages/ServiceDashboard';
import CounterSales from './pages/CounterSales';
import { Reports } from './pages/Reports';
import { SpareParts } from './pages/SpareParts';
import Purchase from './pages/Purchase';
import ServiceBilling from './pages/ServiceBilling';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCustomerName, setSelectedCustomerName] = useState<string | null>(null);

  // Lifted Service sub-tab and search state
  const [serviceSubTab, setServiceSubTab] = useState<'dashboard' | 'open-job-cards' | 'completed-jobs' | 'service-history'>('dashboard');
  const [serviceSearchTerm, setServiceSearchTerm] = useState('');

  // Lifted Vehicle Sales state
  const [salesRecords, setSalesRecords] = useState<SaleRecord[]>([
    {
      invoiceNo: '#INV-2023-0182',
      customerName: 'Aditya Khanna',
      vehicleModel: 'Eicher Pro 2049',
      status: 'DELIVERED',
      grandTotal: '₹17,43,450',
      district: 'Central Valley',
      deliveryDate: '24 Oct 2023',
      salesExecutive: 'Vikram Singh'
    },
    {
      invoiceNo: '#INV-2023-0180',
      customerName: 'Karthik Reddy',
      vehicleModel: 'Eicher Pro 3019',
      status: 'DELIVERED',
      grandTotal: '₹33,95,000',
      district: 'Coastal Plains',
      deliveryDate: '20 Oct 2023',
      salesExecutive: 'Vikram Singh'
    },
    {
      invoiceNo: '#INV-2023-0178',
      customerName: 'Omkar Logistics Ltd',
      vehicleModel: 'Eicher Pro 6028',
      status: 'DELIVERED',
      grandTotal: '₹54,25,000',
      district: 'Northern Hills',
      deliveryDate: '22 Oct 2023',
      salesExecutive: 'Rajesh Kumar'
    },
    {
      invoiceNo: '#INV-2023-0174',
      customerName: 'Tejas Transports',
      vehicleModel: 'Eicher Pro 6028',
      status: 'PENDING',
      grandTotal: '₹54,25,000',
      district: 'Central Valley',
      deliveryDate: 'Scheduled: 30 Oct 2023',
      salesExecutive: 'Amit Gupta'
    }
  ]);

  const navigateToCustomer = (name: string) => {
    setSelectedCustomerName(name);
    setActiveTab('customers');
  };

  const handleSetActiveTab = (tab: string) => {
    setActiveTab(tab);
    setServiceSearchTerm('');
  };

  const handleNavigateToService = (subTab: 'dashboard' | 'open-job-cards' | 'completed-jobs' | 'service-history') => {
    setServiceSubTab(subTab);
    handleSetActiveTab('service');
  };

  return (
    <div className="flex min-h-screen w-full bg-[#f6f8fc] m-0 p-0 box-border font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={handleSetActiveTab} />
      <div className="flex-1 flex flex-col min-w-0 box-border">
        <Navbar
          activeTab={activeTab}
          serviceSubTab={serviceSubTab}
          setServiceSubTab={setServiceSubTab}
          searchTerm={serviceSearchTerm}
          setSearchTerm={setServiceSearchTerm}
        />
        <main className="flex-1 flex flex-col box-border">
          {activeTab === 'dashboard' ? (
            <Dashboard
              salesCount={salesRecords.length}
              onNavigate={handleSetActiveTab}
              onNavigateToService={handleNavigateToService}
            />
          ) : activeTab === 'customers' ? (
            <Customers
              selectedCustomerName={selectedCustomerName}
              clearSelectedCustomer={() => setSelectedCustomerName(null)}
            />
          ) : activeTab === 'inventory' ? (
            <VehicleInventory />
          ) : activeTab === 'sales' ? (
            <VehicleSales
              sales={salesRecords}
              setSales={setSalesRecords}
              onCustomerClick={navigateToCustomer}
            />
          ) : activeTab === 'service' ? (
            <ServiceDashboard
              subTab={serviceSubTab}
              setSubTab={setServiceSubTab}
              searchTerm={serviceSearchTerm}
            />
          ) : activeTab === 'mechanics' ? (
            <Mechanics />
          ) : activeTab === 'counter-sales' ? (
            <CounterSales />
          ) : activeTab === 'purchase' ? (
            <Purchase />
          ) : activeTab === 'billing' ? (
            <ServiceBilling />
          ) : activeTab === 'reports' ? (
            <Reports />
          ) : activeTab === 'parts' ? (
            <SpareParts />
          ) : (
            <div className="p-10 text-center text-slate-500 flex flex-col items-center justify-center min-h-[50vh]">
              <h2 className="text-2xl text-slate-800 mb-2 font-bold font-heading">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ')} Page</h2>
              <p>This section is under construction. Please select Dashboard from the sidebar.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
