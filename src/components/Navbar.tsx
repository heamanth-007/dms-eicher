import React from 'react';

interface NavbarProps {
  activeTab?: string;
  serviceSubTab?: string;
  setServiceSubTab?: (tab: any) => void;
  searchTerm?: string;
  setSearchTerm?: (term: string) => void;
  userName?: string;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ userName, onLogout }) => {
  return (
    <header className="h-[64px] bg-[#184edb] flex items-center justify-between px-8 w-full box-border font-sans text-white sticky top-0 z-40 shadow-sm">
      
      {/* Left side brand */}
      <div className="flex items-center">
        <span className="text-base font-extrabold tracking-wide uppercase">
          Workshop ERP
        </span>
      </div>

      {/* Right Side Profile */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity">
          <img 
            className="w-9 h-9 rounded-full object-cover border-2 border-white/80 shadow-sm" 
            src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=120" 
            alt={userName || "Rohan Sharma"} 
          />
          <span className="text-[13.5px] font-bold tracking-wide">
            {userName || "Rohan Sharma"}
          </span>
        </div>
        {onLogout && (
          <button 
            onClick={onLogout}
            className="text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5"
          >
            Logout
          </button>
        )}
      </div>

    </header>
  );
};

export default Navbar;
