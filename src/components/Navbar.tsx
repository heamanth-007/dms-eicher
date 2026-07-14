export const Navbar: React.FC = () => {
  return (
    <header className="h-[70px] bg-gradient-to-r from-[#184edb] to-[#0d287a] border-b border-white/10 flex items-center justify-between px-8 w-full box-border font-sans text-white sticky top-0 z-40">
      <div className="flex items-center">
        <h1 className="text-base font-semibold text-white m-0 tracking-tight">Workshop ERP</h1>
      </div>
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2.5 cursor-pointer hover:bg-white/10 px-3 py-1.5 rounded-full transition-colors">
          <img 
            className="w-8 h-8 rounded-full object-cover border-[1.5px] border-white/30" 
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100" 
            alt="Rohan Sharma" 
          />
          <span className="text-[13.5px] font-semibold text-white/90">Rohan Sharma</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
