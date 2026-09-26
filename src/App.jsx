import React, { Suspense, lazy } from 'react';
import { useStore } from './data/store';
import Layout from './components/layout/Layout';
import { PageLoading } from './components/ui/LoadingState';
import './styles/index.css';

// Lazy load pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Map2D = lazy(() => import('./pages/Map2D'));
const Map3D = lazy(() => import('./pages/Map3D'));
const Extraction = lazy(() => import('./pages/Extraction'));
const UlpinPage = lazy(() => import('./pages/UlpinPage'));
const Registry = lazy(() => import('./pages/Registry'));
const SearchPage = lazy(() => import('./pages/Search'));
const Validation = lazy(() => import('./pages/Validation'));
const SpatialData = lazy(() => import('./pages/SpatialData'));
const Analytics = lazy(() => import('./pages/Analytics'));
const About = lazy(() => import('./pages/About'));
const Settings = lazy(() => import('./pages/Settings'));

const PageRouter = () => {
  const activePage = useStore((s) => s.activePage);

  switch (activePage) {
    case 'dashboard': return <Dashboard />;
    case 'map2d': return <Map2D />;
    case 'map3d': return <Map3D />;
    case 'extraction': return <Extraction />;
    case 'ulpin': return <UlpinPage />;
    case 'registry': return <Registry />;
    case 'search': return <SearchPage />;
    case 'validation': return <Validation />;
    case 'spatial': return <SpatialData />;
    case 'analytics': return <Analytics />;
    case 'about': return <About />;
    case 'settings': return <Settings />;
    default: return <Dashboard />;
  }
};

const App = () => {
  return (
    <Layout>
      <Suspense fallback={<PageLoading />}>
        <PageRouter />
      </Suspense>
    </Layout>
  );
};

export default App;
