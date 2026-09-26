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
  X,
  Layers
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
      <div className="min-h-screen bg-slate-100 p-6">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 text-white p-3 rounded-2xl">
              <Box size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900">3D ULPIN</h1>
              <p className="text-sm text-slate-500">Vertical Property Identification</p>
            </div>
          </div>
          <button
            onClick={() => setIsPresentation(false)}
            className="px-4 py-2 bg-white border rounded-xl flex items-center gap-2"
          >
            <X size={18} /> Exit
          </button>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-slate-100 font-sans">
      <aside className={`bg-slate-900 text-white transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} flex flex-col border-r border-slate-800`}>
        <div className="p-6 border-b border-slate-800">
          {isSidebarOpen ? (
            <div className="flex items-center gap-3">
              <Box className="text-blue-400" size={20} />
              <span className="text-xl font-bold">3D ULPIN</span>
            </div>
          ) : (
            <div className="flex justify-center"><Box className="text-blue-400" size={24} /></div>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activePage === item.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              {isSidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          ))}
          <button
            onClick={() => setActivePage('extraction')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activePage === 'extraction' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Layers size={20} />
            {isSidebarOpen && <span className="text-sm font-medium">AI Extraction</span>}
          </button>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-16 bg-white border-b px-8 flex items-center justify-between z-10">
          <div className="flex items-center gap-6">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">
              <Menu size={20} />
            </button>
            <h2 className="text-lg font-bold text-slate-900">
              {navItems.find(i => i.id === activePage)?.label || 'AI Extraction'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsPresentation(true)} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 border rounded-lg hover:bg-slate-200">
              Presentation
            </button>
            <button onClick={() => setActivePage('demo')} className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700">
              Start Demo
            </button>
          </div>
        </header>

        <main className="p-8 overflow-auto h-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
