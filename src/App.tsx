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
import { SpareParts } from './pages/SpareParts';
import { Suppliers } from './pages/Suppliers';
import type { SupplierType } from './pages/Suppliers';
import { SettingsPage } from './pages/Settings';
import Purchase from './pages/Purchase';
import ServiceBilling from './pages/ServiceBilling';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCustomerName, setSelectedCustomerName] = useState<string | null>(null);

  // Lifted Suppliers states
  const [suppliersList, setSuppliersList] = useState<SupplierType[]>([
    {
      id: 'SUP-9821',
      name: 'AutoParts Direct Ltd.',
      gstNumber: '27AADCA1234F1Z1',
      phone: '+1 202-555-0156',
      email: 'orders@autoparts.com',
      outstanding: '$12,450.00',
      isOutstandingPositive: true,
      status: 'ACTIVE'
    },
    {
      id: 'SUP-7742',
      name: 'Global Engine Spares',
      gstNumber: '19BBEDA4432A1Z9',
      phone: '+1 555-0198-2210',
      email: 'billing@globalspares.co',
      outstanding: '$0.00',
      isOutstandingPositive: false,
      status: 'ACTIVE'
    },
    {
      id: 'SUP-3321',
      name: 'Premium Lubricants Int.',
      gstNumber: '33CCDFA5567G2Z0',
      phone: '+1 212-701-0099',
      email: 'contact@premiumlubes.com',
      outstanding: '$4,200.00',
      isOutstandingPositive: true,
      status: 'INACTIVE'
    },
    {
      id: 'SUP-1102',
      name: 'Zenith Tire Solutions',
      gstNumber: '07AABBA9999K3Z2',
      phone: '+1 415-888-0123',
      email: 'zenith@tires.co',
      outstanding: '$26,200.00',
      isOutstandingPositive: true,
      status: 'ACTIVE'
    }
  ]);

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
          ) : activeTab === 'parts' ? (
            <SpareParts />
          ) : activeTab === 'suppliers' ? (
            <Suppliers
              suppliersList={suppliersList}
              setSuppliersList={setSuppliersList}
            />
          ) : activeTab === 'settings' ? (
            <SettingsPage />
          ) : activeTab === 'purchase' ? (
            <Purchase />
          ) : activeTab === 'billing' ? (
            <ServiceBilling />
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
