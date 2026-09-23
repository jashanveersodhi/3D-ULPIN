import React, { useState } from 'react';
import {
  LayoutDashboard,
  Box,
  TableProperties,
  Search,
  CheckCircle,
  BarChart3,
  Info,
  Presentation,
  PlayCircle,
  Menu,
  X
} from 'lucide-react';

const Layout = ({ children, activePage, setActivePage, isPresentation, setIsPresentation }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'map', label: '3D Property Map', icon: Box },
    { id: 'registry', label: 'Property Registry', icon: TableProperties },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'validation', label: 'Validation', icon: CheckCircle },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'about', label: 'About Prototype', icon: Info },
  ];

  if (isPresentation) {
    return (
      <div className="min-h-screen bg-gis-bg p-6 animate-fade-in-up">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-gis-accent text-white p-3 rounded-2xl shadow-lg shadow-gis-accent/20">
              <Box size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-gis-ink">3D ULPIN</h1>
              <p className="text-sm text-gis-muted font-medium">Vertical Property Identification & Spatial Registry</p>
            </div>
          </div>
          <button
            onClick={() => setIsPresentation(false)}
            className="btn-premium bg-gis-card text-gis-ink border border-gis-line flex items-center gap-2 hover:bg-white/10"
          >
            <X size={18} /> Exit Presentation Mode
          </button>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gis-bg font-sans selection:bg-gis-accent selection:text-white">
      {/* Sidebar */}
      <aside className={`bg-gis-navy/90 backdrop-blur-xl text-white transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-72' : 'w-20'} flex flex-col border-r border-gis-line shadow-2xl z-20`}>
        <div className="p-6 border-b border-white/5">
          {isSidebarOpen ? (
            <div className="animate-fade-in-up">
              <div className="flex items-center gap-3 mb-1">
                <div className="bg-gis-accent p-1.5 rounded-lg">
                  <Box className="text-white" size={20} />
                </div>
                <span className="text-xl font-black tracking-tight">3D ULPIN</span>
              </div>
              <p className="text-[10px] text-gis-muted font-medium leading-tight opacity-80">Vertical Property Identification & Spatial Registry</p>
            </div>
          ) : (
            <div className="flex justify-center">
              <Box className="text-gis-accent" size={24} />
            </div>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activePage === item.id
                  ? 'bg-gis-accent text-white shadow-lg shadow-gis-accent/20'
                  : 'text-gis-muted hover:bg-white/5 hover:text-white'
              }`}
              title={!isSidebarOpen ? item.label : ''}
            >
              <item.icon size={20} className={`transition-transform duration-200 group-hover:scale-110 ${activePage === item.id ? 'text-white' : 'text-gis-muted group-hover:text-white'}`} />
              {isSidebarOpen && <span className="text-sm font-semibold">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5 bg-black/20">
          {isSidebarOpen ? (
            <div className="text-[11px] text-gis-muted leading-relaxed animate-fade-in-up">
              <span className="block font-bold text-gis-ink mb-1">SIH26011 · 2026</span>
              Prototype data only. Generated identifiers are not official/legal ULPINs.
            </div>
          ) : (
            <div className="text-center text-[10px] font-bold text-gis-muted">SIH26</div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-20 bg-gis-bg/80 backdrop-blur-md border-b border-gis-line px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gis-card rounded-xl text-gis-muted transition-colors border border-transparent hover:border-gis-line"
            >
              <Menu size={20} />
            </button>
            <div className="animate-fade-in-up">
              <h2 className="text-xl font-bold text-gis-ink tracking-tight">
                {navItems.find(i => i.id === activePage)?.label}
              </h2>
              <p className="text-xs text-gis-muted font-medium">Vertical property mapping demonstration</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsPresentation(true)}
              className="btn-premium flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gis-muted bg-gis-card border border-gis-line hover:text-gis-ink hover:bg-white/5"
            >
              <Presentation size={16} /> Presentation Mode
            </button>
            <button
              onClick={() => setActivePage('demo')}
              className="btn-premium flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-gis-accent shadow-lg shadow-gis-accent/20 hover:shadow-gis-accent/40"
            >
              <PlayCircle size={16} /> Start Demo
            </button>
          </div>
        </header>

        <main className="p-8 overflow-auto animate-fade-in-up">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
