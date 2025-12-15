import React, { useRef, useEffect } from 'react';
import { LayoutDashboard, Users, MessageSquareText, Settings, Activity, Menu, X, ShieldCheck, LogOut } from 'lucide-react';
import { AppTranslations } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  userProfile?: {
      name: string;
      role: string;
      email: string;
      facility: string;
  };
  t: AppTranslations;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, onLogout, userProfile, t }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const mainContentRef = useRef<HTMLElement>(null);

  // Scroll to top when tab changes
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeTab]);

  const navItems = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'patients', label: t.patients, icon: Users },
    { id: 'communication', label: t.communication, icon: MessageSquareText },
    { id: 'analytics', label: t.analytics, icon: Activity },
    { id: 'settings', label: t.settings, icon: Settings },
  ];

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleLogoClick = () => {
    setActiveTab('dashboard');
    // Force scroll to top even if already on dashboard (React state update bail-out prevention)
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Sidebar - Posh Midnight Theme */}
      <aside className="hidden md:flex flex-col w-72 bg-[#0f172a] text-white shadow-2xl z-20 transition-all duration-300">
        <div className="p-8">
          <button 
            onClick={handleLogoClick} 
            className="flex items-center gap-4 mb-8 text-left hover:opacity-80 transition-opacity w-full cursor-pointer group select-none focus:outline-none"
            aria-label="Go to Dashboard Home"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30 flex items-center justify-center font-bold text-white text-xl group-hover:scale-105 transition-transform">J</div>
            <div>
                <h1 className="text-xl font-bold tracking-tight leading-none text-white">Jemine AI</h1>
                <p className="text-[11px] uppercase tracking-widest text-slate-400 font-semibold mt-1">Hospital & Pharmacy</p>
            </div>
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto px-6 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[14px] font-medium transition-all duration-300 group ${
                activeTab === item.id
                  ? 'bg-white/10 text-white shadow-inner backdrop-blur-sm border border-white/5'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white hover:translate-x-1'
              }`}
            >
              <item.icon size={20} className={`transition-colors ${activeTab === item.id ? "text-indigo-400" : "text-slate-500 group-hover:text-white"}`} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 mt-auto">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5 backdrop-blur-md mb-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex items-center gap-2 text-indigo-300 mb-1 relative z-10">
                    <ShieldCheck size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">HIPAA Secure</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight relative z-10">Connection encrypted (TLS 1.3).</p>
            </div>

            <div className="flex items-center gap-4 px-1 pt-4 border-t border-white/10">
                <div className="relative">
                    <img src={`https://ui-avatars.com/api/?name=${userProfile?.name || 'User'}&background=10b981&color=fff`} alt="User" className="w-10 h-10 rounded-full border-2 border-slate-700 shadow-sm" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#0f172a] rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{userProfile?.name || 'Provider'}</p>
                    <p className="text-xs text-slate-400 truncate">{userProfile?.role || 'Staff'}</p>
                </div>
                <button onClick={onLogout} className="text-slate-500 hover:text-rose-400 transition bg-white/5 p-2 rounded-xl">
                    <LogOut size={16} />
                </button>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f8fafc] relative">
        {/* Decorative Background Blur */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-50/50 to-transparent pointer-events-none"></div>

        {/* Mobile Header */}
        <header className="md:hidden bg-white/90 backdrop-blur-xl border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-30">
          <button 
            onClick={handleLogoClick} 
            className="flex items-center gap-2 active:opacity-70 transition-opacity focus:outline-none"
          >
             <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white text-sm">J</div>
             <span className="font-bold text-slate-900">Jemine AI</span>
          </button>
          <button onClick={toggleMenu} className="p-2 rounded-xl active:bg-slate-100">
            {isMobileMenuOpen ? <X size={24} className="text-slate-600" /> : <Menu size={24} className="text-slate-600" />}
          </button>
        </header>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-[70px] left-0 w-full h-[calc(100vh-70px)] bg-white z-50 p-4 animate-fade-in flex flex-col">
            <nav className="space-y-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-base font-medium transition-colors ${
                      activeTab === item.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'
                    }`}
                  >
                    <item.icon size={20} />
                    {item.label}
                  </button>
                ))}
            </nav>
            <div className="mt-auto">
                <button onClick={onLogout} className="w-full flex items-center gap-3 px-5 py-4 text-rose-600 font-medium bg-rose-50 rounded-2xl">
                    <LogOut size={20} /> {t.logout}
                </button>
            </div>
          </div>
        )}

        {/* Scrollable Content Area */}
        <main 
            ref={mainContentRef}
            className="flex-1 overflow-y-auto p-4 md:p-10 scroll-smooth relative z-10"
        >
            <div className="max-w-[1280px] mx-auto animate-fade-in-up">
                {children}
            </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;