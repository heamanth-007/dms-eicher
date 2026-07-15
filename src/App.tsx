import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './main page/Dashboard';
import Customers from './main page/Customers';
import VehicleSales from './main page/VehicleSales';
import VehicleInventory from './pages/VehicleInventory';
import Mechanics from './pages/Mechanics';
import { Reports } from './pages/Reports';
import { SpareParts } from './pages/SpareParts';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCustomerName, setSelectedCustomerName] = useState<string | null>(null);

  const navigateToCustomer = (name: string) => {
    setSelectedCustomerName(name);
    setActiveTab('customers');
  };

  return (
    <div className="flex min-h-screen w-full bg-[#f6f8fc] m-0 p-0 box-border font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col min-w-0 box-border">
        <Navbar />
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
          ) : activeTab === 'mechanics' ? (
            <Mechanics />
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
