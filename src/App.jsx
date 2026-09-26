import React, { useState, useEffect, Suspense, lazy } from 'react';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import { initStore } from './data/store';
import './styles/index.css';

// Lazy load GPU-heavy pages to prevent app-wide crashes
const PropertyMap = lazy(() => import('./pages/PropertyMap'));
const ExtractionPage = lazy(() => import('./pages/ExtractionPage'));
const Registry = lazy(() => import('./pages/Registry'));
const SearchPage = lazy(() => import('./pages/Search'));
const Validation = lazy(() => import('./pages/Validation'));
const Analytics = lazy(() => import('./pages/Analytics'));
const About = lazy(() => import('./pages/About'));
const Demo = lazy(() => import('./pages/Demo'));

const App = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [isPresentation, setIsPresentation] = useState(false);
  const [store, setStore] = useState(null);

  useEffect(() => {
    try {
      const s = initStore();
      setStore(s || { buildings: [], properties: [] });
    } catch (e) {
      console.error("Store Init Failed:", e);
      setStore({ buildings: [], properties: [] });
    }
  }, []);

  if (!store) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gis-bg text-gis-ink text-xl font-bold">
        Loading Spatial Registry...
      </div>
    );
  }

  const renderPage = () => {
    return (
      <Suspense fallback={<div className="p-10 text-center text-gis-muted">Loading Page Components...</div>}>
        {(() => {
          switch (activePage) {
            case 'dashboard': return <Dashboard store={store} setActivePage={setActivePage} />;
            case 'map': return <PropertyMap store={store} />;
            case 'extraction': return <ExtractionPage store={store} />;
            case 'registry': return <Registry store={store} />;
            case 'search': return <SearchPage store={store} onSelectRecord={(r) => setActivePage('map')} />;
            case 'validation': return <Validation store={store} />;
            case 'analytics': return <Analytics store={store} />;
            case 'about': return <About />;
            case 'demo': return <Demo store={store} onComplete={() => setActivePage('dashboard')} />;
            default: return <Dashboard store={store} setActivePage={setActivePage} />;
          }
        })()}
      </Suspense>
    );
  };

  return (
    <div style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Layout
        activePage={activePage}
        setActivePage={setActivePage}
        isPresentation={isPresentation}
        setIsPresentation={setIsPresentation}
      >
        {renderPage()}
      </Layout>
    </div>
  );
};

export default App;
