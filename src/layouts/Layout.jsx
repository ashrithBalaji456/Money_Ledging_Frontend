import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Users, LayoutDashboard, PlusCircle, LogOut, Menu, X } from 'lucide-react';

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'Admin';

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Borrowers', path: '/borrowers', icon: Users },
    { name: 'Give New Loan', path: '/add-loan', icon: PlusCircle },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0b0f19] text-slate-100">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 glass-panel bg-slate-950/40 border-r border-white/5 relative z-10">
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-wide bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">LENDING</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Notebook Mode</p>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 btn-animate ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 flex flex-col gap-3">
          <div className="px-4 py-3 bg-white/5 rounded-xl border border-white/5">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Logged in as</p>
            <p className="text-sm font-bold text-amber-400 mt-0.5">{username}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl text-sm font-semibold transition-all duration-300 btn-animate"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Top Navbar for Mobile */}
      <header className="md:hidden glass-panel bg-slate-950/40 border-b border-white/5 flex items-center justify-between p-4 relative z-20">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-500/10 rounded-lg border border-amber-500/20 text-amber-400">
            <BookOpen className="h-5 w-5" />
          </div>
          <span className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">LENDING NOTEBOOK</span>
        </div>
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-lg hover:bg-white/5 text-slate-300 focus:outline-none transition-colors"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden glass-panel bg-slate-950/90 border-b border-white/5 px-4 py-4 space-y-2 absolute top-[61px] left-0 right-0 z-30 animate-slide-up">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:bg-white/5'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
          <div className="pt-4 border-t border-white/5 flex items-center justify-between px-4 text-xs text-slate-500">
            <span>User: <strong className="text-amber-400">{username}</strong></span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-red-400 hover:text-red-300 font-bold"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full overflow-y-auto relative z-10">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
