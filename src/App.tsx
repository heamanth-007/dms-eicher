import { useState, useEffect } from 'react';
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
import { SettingsPage } from './main page/Settings';
import Purchase from './pages/Purchase';
import ServiceBilling from './pages/ServiceBilling';
import SignUp from './pages/SignUp';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCustomerName, setSelectedCustomerName] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(() => {
    try {
      const saved = localStorage.getItem('dms_current_user');
      if (saved) return JSON.parse(saved);
    } catch (e) { }
    return null;
  });

  const handleAuthSuccess = (user: { name: string; email: string }) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('dms_current_user', JSON.stringify(user));
    } catch (e) { }
  };

  const handleSetCurrentUser = (user: { name: string; email: string } | null) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem('dms_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('dms_user');
    }
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        const target = e.target as HTMLElement;

        if (
          target.tagName === 'INPUT' &&
          !['submit', 'reset', 'button', 'checkbox', 'radio', 'file'].includes((target as HTMLInputElement).type)
        ) {
          if (target.getAttribute('data-no-focus-shift') === 'true') {
            return;
          }

          const isSearchInput =
            (target as HTMLInputElement).type === 'search' ||
            target.getAttribute('placeholder')?.toLowerCase().includes('search') ||
            target.className?.toLowerCase().includes('search');

          if (isSearchInput) {
            return;
          }

          e.preventDefault();

          const container = target.closest('form, [role="dialog"]') || document.body;

          const focusableSelector = 'input:not([readonly]):not([disabled]), select:not([disabled]), textarea:not([disabled])';
          const elements = Array.from(container.querySelectorAll(focusableSelector)) as HTMLElement[];

          const visibleElements = elements.filter(el => {
            if (el.tagName === 'INPUT' && (el as HTMLInputElement).type === 'hidden') return false;
            return el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0;
          });

          const index = visibleElements.indexOf(target);
          if (index > -1 && index < visibleElements.length - 1) {
            visibleElements[index + 1].focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, []);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Lifted Suppliers states with LocalStorage persistence
  const [suppliersList, setSuppliersList] = useState<SupplierType[]>(() => {
    try {
      const saved = localStorage.getItem('dms_suppliers_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) { }
    return [
      {
        id: 'SUP-6496',
        name: 'sheasan',
        gstNumber: '87DD4AD',
        phone: '8895484621',
        email: 'HDJNSUjd@ygd.com',
        outstanding: '₹85,548.00',
        isOutstandingPositive: true,
        status: 'ACTIVE'
      },
      {
        id: 'SUP-6212',
        name: 'vj enterprises',
        gstNumber: 'sds87s54d8sd',
        phone: '5498549858',
        email: 'hsdgfv@tyfgd.com',
        outstanding: '₹7,845.00',
        isOutstandingPositive: true,
        status: 'ACTIVE'
      }
    ];
  });

  // Automatically sync suppliersList to localStorage
  useEffect(() => {
    try {
      if (suppliersList && suppliersList.length > 0) {
        localStorage.setItem('dms_suppliers_list', JSON.stringify(suppliersList));
      }
    } catch (e) { }
  }, [suppliersList]);

  // Lifted Vehicle Sales state
  const [salesRecords, setSalesRecords] = useState<SaleRecord[]>([]);

  // Default settings
  const DEFAULT_SETTINGS = {
    companyName: 'AutoPro Elite Motors',
    dealerName: 'Alexander Sterling',
    gstNumber: '22AAAAA0000A1Z5',
    panNumber: 'ABCDE1234F',
    streetAddress: 'Industrial Park West, Sector 12, Block C',
    city: 'Automotive City',
    stateName: 'California',
    pinCode: '90210',
    mobileNumber: '+1 (555) 012-3456',
    phoneNum: '+1 (555) 987-6543',
    emailAddress: 'contact@autopro-elite.com',
    websiteUrl: 'www.autopro-elite.com',
    logoUrl: ''
  };

  // Company Settings state (initialized from localStorage if available)
  const [companySettings, setCompanySettings] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('dms_company_settings');
      if (saved) return JSON.parse(saved);
    } catch (e) { }
    return DEFAULT_SETTINGS;
  });

  // Lifted Service sub-tab and search state
  const [serviceSubTab, setServiceSubTab] = useState<'dashboard' | 'open-job-cards' | 'completed-jobs' | 'service-history' | 'job-queue'>('dashboard');
  const [serviceSearchTerm, setServiceSearchTerm] = useState('');

  const updateCompanySettingsState = (newSettings: any) => {
    setCompanySettings(newSettings);
    try {
      localStorage.setItem('dms_company_settings', JSON.stringify(newSettings));
    } catch (e) { }
  };

  const fetchSettings = (updatedData?: any) => {
    if (updatedData) {
      updateCompanySettingsState(updatedData);
    }
    fetch(`${API_URL}/api/settings`)
      .then((res) => res.json())
      .then((data) => {
        if (data && (data.companyName || data.dealerName)) {
          updateCompanySettingsState(data);
        }
      })
      .catch((err) => console.error('Error fetching settings in App:', err));
  };

  // Fetch initial suppliers, sales records, and company settings
  useEffect(() => {
    fetchSettings();

    fetch(`${API_URL}/api/suppliers`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setSuppliersList(data);
          try {
            localStorage.setItem('dms_suppliers_list', JSON.stringify(data));
          } catch (e) { }
        }
      })
      .catch((err) => console.error('Error fetching suppliers:', err));

    fetch(`${API_URL}/api/sales`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setSalesRecords(data);
        }
      })
      .catch((err) => console.error('Error fetching sales:', err));
  }, []);

  const navigateToCustomer = (name: string) => {
    setSelectedCustomerName(name);
    setActiveTab('customers');
  };

  const handleSetActiveTab = (tab: string) => {
    setActiveTab(tab);
    setServiceSearchTerm('');
  };

  const handleNavigateToService = (subTab: 'dashboard' | 'open-job-cards' | 'completed-jobs' | 'service-history' | 'job-queue') => {
    setServiceSubTab(subTab);
    handleSetActiveTab('service');
  };

  if (!currentUser) {
    return <SignUp onAuthSuccess={handleAuthSuccess} />;
    return <SignUp onAuthSuccess={handleSetCurrentUser} />;
  }

  return (
    <div className="flex min-h-screen w-full bg-[#f6f8fc] m-0 p-0 box-border font-sans">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleSetActiveTab}
        companyName={companySettings.companyName}
        dealerName={companySettings.dealerName}
        logoUrl={companySettings.logoUrl}
      />
      <div className="flex-1 flex flex-col min-w-0 box-border">
        <Navbar
          activeTab={activeTab}
          serviceSubTab={serviceSubTab}
          setServiceSubTab={setServiceSubTab}
          searchTerm={serviceSearchTerm}
          setSearchTerm={setServiceSearchTerm}
          userName={currentUser.name}
          onLogout={() => handleSetCurrentUser(null)}
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
              onNavigateToMechanics={() => handleSetActiveTab('mechanics')}
            />
          ) : activeTab === 'mechanics' ? (
            <Mechanics onNavigateToService={handleNavigateToService} />
          ) : activeTab === 'counter-sales' ? (
            <CounterSales companySettings={companySettings} />
          ) : activeTab === 'parts' ? (
            <SpareParts />
          ) : activeTab === 'suppliers' ? (
            <Suppliers
              suppliersList={suppliersList}
              setSuppliersList={setSuppliersList}
            />
          ) : activeTab === 'settings' ? (
            <SettingsPage onSettingsUpdated={fetchSettings} />
          ) : activeTab === 'purchase' ? (
            <Purchase suppliersList={suppliersList} />
          ) : activeTab === 'billing' ? (
            <ServiceBilling companySettings={companySettings} />
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
