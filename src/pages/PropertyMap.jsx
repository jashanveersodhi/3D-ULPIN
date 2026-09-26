import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import BuildingScene from '../components/map/BuildingScene';
import ExtractionPage from '../pages/ExtractionPage';
import { Box, RotateCcw, Layers, ArrowRightLeft } from 'lucide-react';

const PropertyMap = ({ store }) => {
  const [viewMode, setViewMode] = useState('3D');
  const [selectedFloor, setSelectedFloor] = useState(25);
  const [selectedUnit, setSelectedUnit] = useState(1);
  const [exploded, setExploded] = useState(false);
  const [activeBuilding, setActiveBuilding] = useState(null);
  const [init3D, setInit3D] = useState(false);

  const { properties } = store;
  const unit = properties.find(p => p.floor === selectedFloor && (p.unit.slice(-1).charCodeAt(0)-64) === selectedUnit)
               || properties.find(p => p.floor === selectedFloor);

  return (
    <div className="h-full w-full animate-fade-in-up">
      <div className="absolute top-6 left-6 z-20 flex gap-3">
        <button
          onClick={() => setViewMode(viewMode === '3D' ? '2D' : '3D')}
          className="btn-primary px-6 py-3 flex items-center gap-2 font-bold"
        >
          <ArrowRightLeft size={18} />
          Switch to {viewMode === '3D' ? '2D AI Map' : '3D ULPIN View'}
        </button>
      </div>

      <div className="w-full h-full relative">
        {viewMode === '2D' ? (
          <ExtractionPage
            onBuildingSelect={(b) => {
              setActiveBuilding(b);
              setViewMode('3D');
            }}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-full">
            <div className="lg:col-span-3 relative h-[calc(100vh-180px)] card-ultra overflow-hidden bg-black">
              {!init3D ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-gis-base/80 backdrop-blur-sm">
                  <Box size={48} className="text-gis-accent mb-4 animate-bounce" />
                  <h2 className="text-2xl font-bold text-white mb-6">3D GPU Acceleration</h2>
                  <button
                    onClick={() => setInit3D(true)}
                    className="btn-primary px-8 py-4 font-bold"
                  >
                    Initialize 3D Scene
                  </button>
                </div>
              ) : null}

              <div className="absolute top-6 left-6 right-6 z-10 flex justify-between items-start pointer-events-none">
                <div className="flex gap-3 pointer-events-auto">
                  <button
                    onClick={() => setExploded(!exploded)}
                    className={`btn-secondary px-5 py-2.5 text-sm font-bold transition-all flex items-center gap-2 ${
                      exploded ? 'bg-gis-accent text-white shadow-lg shadow-gis-accent/30' : ''
                    }`}
                  >
                    <Layers size={16} /> {exploded ? 'Compact View' : 'Exploded View'}
                  </button>
                </div>
              </div>

              <div className="w-full h-full">
                <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-white">Loading 3D Model...</div>}>
                  <Canvas shadows>
                    <BuildingScene
                      store={store}
                      selectedFloor={selectedFloor}
                      setSelectedFloor={setSelectedFloor}
                      selectedUnit={selectedUnit}
                      setSelectedUnit={setSelectedUnit}
                      exploded={exploded}
                      activeBuilding={activeBuilding}
                    />
                  </Canvas>
                </Suspense>
              </div>

              <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end pointer-events-none">
                <div className="bg-gis-card/80 backdrop-blur-xl p-6 rounded-3xl border border-gis-line shadow-2xl pointer-events-auto animate-fade-in-up">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-2 h-2 rounded-full bg-gis-accent animate-pulse" />
                    <span className="text-[10px] font-black text-gis-muted uppercase tracking-widest">Current Floor Index</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <input
                      type="range"
                      min="1"
                      max={activeBuilding?.floors || 102}
                      value={selectedFloor}
                      onChange={(e) => { setSelectedFloor(parseInt(e.target.value)); setSelectedUnit(1); }}
                      className="w-56 accent-gis-accent h-1.5 bg-gis-line rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-2xl font-black text-gis-ink tabular-nums">Floor {selectedFloor}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="card-ultra p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gis-accent/20 text-gis-accent rounded-lg">
                    <Box size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-gis-ink tracking-tight">Property Details</h3>
                </div>
                {unit ? (
                  <div className="space-y-6">
                    <div className="p-6 rounded-2xl bg-gis-base border border-gis-line group transition-all">
                      <span className="block text-[10px] font-black text-gis-muted uppercase tracking-widest mb-2">Proposed 3D ULPIN</span>
                      <span className="text-2xl lg:text-3xl font-mono font-black text-white tracking-tight break-all block leading-tight shadow-sm">
                        {unit.ulpin}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-gis-base border border-gis-line">
                        <span className="block text-[10px] font-black text-gis-muted uppercase mb-1">Type</span>
                        <span className="text-sm font-bold text-gis-ink">{unit.type}</span>
                      </div>
                      <div className="p-4 rounded-2xl bg-gis-base border border-gis-line">
                        <span className="block text-[10px] font-black text-gis-muted uppercase mb-1">Area</span>
                        <span className="text-sm font-bold text-gis-ink">{unit.area.toLocaleString()} sq ft</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-24 text-center text-gis-muted animate-pulse">
                    <Box size={64} className="mx-auto mb-6 opacity-10" />
                    <p className="text-sm font-medium">Select a unit to inspect its spatial record.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyMap;
