import React, { useState, useEffect } from 'react';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import PropertyMap from './pages/PropertyMap';
import Registry from './pages/Registry';
import SearchPage from './pages/Search';
import Validation from './pages/Validation';
import Analytics from './pages/Analytics';
import About from './pages/About';
import Demo from './pages/Demo';
import { initStore } from './data/store';
import './styles/index.css';

const App = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [isPresentation, setIsPresentation] = useState(false);
  const [store, setStore] = useState(null);

  useEffect(() => {
    setStore(initStore());
  }, []);

  if (!store) return <div className="flex items-center justify-center min-h-screen">Loading Registry...</div>;

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard store={store} setActivePage={setActivePage} />;
      case 'map': return <PropertyMap store={store} />;
      case 'registry': return <Registry store={store} />;
      case 'search': return <SearchPage store={store} onSelectRecord={(r) => { setActivePage('map'); }} />;
      case 'validation': return <Validation store={store} />;
      case 'analytics': return <Analytics store={store} />;
      case 'about': return <About />;
      case 'demo': return <Demo store={store} onComplete={() => setActivePage('dashboard')} />;
      default: return <Dashboard store={store} setActivePage={setActivePage} />;
    }
  };

  return (
    <Layout
      activePage={activePage}
      setActivePage={setActivePage}
      isPresentation={isPresentation}
      setIsPresentation={setIsPresentation}
    >
      {renderPage()}
    </Layout>
  );
};

export default App;
