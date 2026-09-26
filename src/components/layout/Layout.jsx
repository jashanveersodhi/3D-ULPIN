import React, { useState } from 'react';
import {
  LayoutDashboard, Map, Box, Cpu, Layers, Hash,
  Database, Settings, ChevronLeft, ChevronRight, Menu, X,
  TableProperties, Search, CheckCircle, Info, Maximize2
} from 'lucide-react';
import { useStore } from '../../data/store';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'map2d', label: '2D Map', icon: Map },
  { id: 'map3d', label: '3D Property Map', icon: Box },
  { id: 'extraction', label: 'AI Extraction', icon: Cpu },
  { id: 'ulpin', label: 'ULPIN', icon: Hash },
  { id: 'registry', label: 'Property Registry', icon: TableProperties },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'validation', label: 'Validation', icon: CheckCircle },
  { id: 'spatial', label: 'Spatial Data', icon: Database },
  { id: 'analytics', label: 'Analytics', icon: Layers },
  { id: 'about', label: 'About Prototype', icon: Info },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const Layout = ({ children }) => {
  const { activePage, setActivePage, sidebarCollapsed, toggleSidebar } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (page) => {
    setActivePage(page);
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen w-full bg-gis-bg overflow-hidden">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative z-50 h-full bg-gis-panel border-r border-gis-border flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        } ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo */}
        <div className={`p-4 border-b border-gis-border flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="w-8 h-8 rounded-lg bg-gis-accent flex items-center justify-center shrink-0">
            <Box size={18} className="text-white" />
          </div>
          {!sidebarCollapsed && (
            <div className="overflow-hidden">
              <h1 className="text-base font-bold text-gis-ink whitespace-nowrap">3D ULPIN</h1>
              <p className="text-[10px] text-gis-muted whitespace-nowrap">Spatial Registry Platform</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${
                activePage === item.id
                  ? 'bg-gis-accent/10 text-gis-accent border border-gis-accent/20'
                  : 'text-gis-muted hover:text-gis-ink hover:bg-gis-surface border border-transparent'
              }`}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <item.icon size={18} className="shrink-0" />
              {!sidebarCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Collapse toggle - desktop */}
        <div className="hidden lg:block p-3 border-t border-gis-border">
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-gis-muted hover:text-gis-ink hover:bg-gis-surface transition-all text-sm"
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /><span>Collapse</span></>}
          </button>
        </div>

        {/* Mobile close */}
        <div className="lg:hidden p-3 border-t border-gis-border">
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-gis-muted hover:text-gis-ink hover:bg-gis-surface transition-all text-sm"
          >
            <X size={16} /><span>Close</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 bg-gis-panel border-b border-gis-border flex items-center justify-between px-4 shrink-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gis-muted hover:text-gis-ink hover:bg-gis-surface"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-sm font-semibold text-gis-ink">
              {NAV_ITEMS.find(i => i.id === activePage)?.label || 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge-warning text-[10px]">Demo / Prototype</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
