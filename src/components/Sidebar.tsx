import {
  LayoutDashboard,
  Users,
  Warehouse,
  Truck,
  Wrench,
  UserCheck,
  Disc,
  ShoppingBag,
  Building2,
  Receipt,
  Settings
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  companyName?: string;
  dealerName?: string;
  logoUrl?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, companyName, dealerName, logoUrl }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'inventory', label: 'Vehicle Inventory', icon: Warehouse },
    { id: 'sales', label: 'Vehicle Sales', icon: Truck },
    { id: 'service', label: 'Service Management', icon: Wrench },
    { id: 'mechanics', label: 'Mechanics', icon: UserCheck },
    { id: 'parts', label: 'Spare Parts', icon: Disc },
    { id: 'purchase', label: 'Purchase', icon: ShoppingBag },
    { id: 'suppliers', label: 'Suppliers', icon: Building2 },
    { id: 'counter-sales', label: 'Counter Sales', icon: Receipt },
    { id: 'billing', label: 'Service Billing', icon: Receipt },
  ];

  return (
    <aside className="w-64 min-w-[16rem] bg-gradient-to-b from-[#184edb] to-[#0d287a] text-white/75 flex flex-col h-screen sticky top-0 p-6 shadow-xl box-border font-heading">
      <div className="mb-8 px-2">
        <div className="flex items-center gap-3">
          <div className="bg-white/15 p-1 rounded-lg flex items-center justify-center flex-shrink-0 w-9 h-9 overflow-hidden">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-full h-full object-contain rounded" />
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <div className="min-w-0">
            <h2 className="text-white text-lg font-bold m-0 tracking-wide truncate">
              {companyName || 'DMS Pro'}
            </h2>
            <span className="text-[11px] text-white/60 uppercase tracking-widest block mt-0.5 truncate">
              {dealerName || 'Heavy Machinery'}
            </span>
          </div>
        </div>
      </div>

      <nav className="flex flex-col gap-1 flex-1 overflow-y-auto pr-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`flex items-center gap-3 bg-transparent border-none text-white/70 px-4 py-2.5 rounded-lg text-[13.5px] font-medium text-left cursor-pointer transition-all duration-200 w-full hover:bg-white/10 hover:text-white group ${
                isActive ? '!bg-[#f1f4fd] !text-[#184edb] font-semibold shadow-md' : ''
              }`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={18} className={`flex-shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 ${isActive ? 'text-[#184edb]' : ''}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="border-t border-white/10 pt-4 mt-auto">
        <button
          className={`flex items-center gap-3 bg-transparent border-none text-white/70 px-4 py-2.5 rounded-lg text-[13.5px] font-medium text-left cursor-pointer transition-all duration-200 w-full hover:bg-white/10 hover:text-white group ${
            activeTab === 'settings' ? '!bg-[#f1f4fd] !text-[#184edb] font-semibold shadow-md' : ''
          }`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings size={18} className={`flex-shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 ${activeTab === 'settings' ? 'text-[#184edb]' : ''}`} />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
};
export default Sidebar;
