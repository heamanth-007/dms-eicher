import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './main page/Dashboard';
import Customers from './main page/Customers';
import VehicleSales from './main page/VehicleSales';
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

  const navigateToCustomer = (name: string) => {
    setSelectedCustomerName(name);
    setActiveTab('customers');
  };

  const handleSetActiveTab = (tab: string) => {
    setActiveTab(tab);
    setServiceSearchTerm('');
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
            <Dashboard />
          ) : activeTab === 'customers' ? (
            <Customers
              selectedCustomerName={selectedCustomerName}
              clearSelectedCustomer={() => setSelectedCustomerName(null)}
            />
          ) : activeTab === 'inventory' ? (
            <VehicleInventory />
          ) : activeTab === 'sales' ? (
            <VehicleSales onCustomerClick={navigateToCustomer} />
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
