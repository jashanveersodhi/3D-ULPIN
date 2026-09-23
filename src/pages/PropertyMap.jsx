import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import BuildingScene from '../components/map/BuildingScene';
import { Box, RotateCcw, Layers, CheckCircle } from 'lucide-react';

const PropertyMap = ({ store }) => {
  const [selectedFloor, setSelectedFloor] = useState(25);
  const [selectedUnit, setSelectedUnit] = useState(1);
  const [exploded, setExploded] = useState(false);
  const [is2D, setIs2D] = useState(false);

  const { properties } = store;
  const unit = properties.find(p => p.floor === selectedFloor && (p.unit.slice(-1).charCodeAt(0)-64) === selectedUnit)
               || properties.find(p => p.floor === selectedFloor);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-full animate-fade-in-up">
      <div className="lg:col-span-3 relative h-[calc(100vh-180px)] card-premium overflow-hidden group bg-black">
        {/* Toolbar HUD */}
        <div className="absolute top-6 left-6 right-6 z-10 flex justify-between items-start pointer-events-none">
          <div className="flex gap-3 pointer-events-auto">
            <button
              onClick={() => setIs2D(!is2D)}
              className={`btn-premium px-5 py-2.5 text-sm font-bold transition-all flex items-center gap-2 ${
                is2D ? 'bg-gis-accent text-white shadow-lg shadow-gis-accent/30' : 'bg-gis-card text-gis-muted border border-gis-line hover:text-gis-ink'
              }`}
            >
              <Box size={16} /> {is2D ? 'Switch to 3D' : 'Switch to 2D'}
            </button>
            <button
              onClick={() => setExploded(!exploded)}
              className={`btn-premium px-5 py-2.5 text-sm font-bold transition-all flex items-center gap-2 ${
                exploded ? 'bg-gis-accent text-white shadow-lg shadow-gis-accent/30' : 'bg-gis-card text-gis-muted border border-gis-line hover:text-gis-ink'
              }`}
            >
              <Layers size={16} /> {exploded ? 'Compact View' : 'Exploded View'}
            </button>
          </div>

          <div className="flex flex-col gap-3 pointer-events-auto">
            <button
              onClick={() => {}}
              className="p-3 btn-premium bg-gis-card border border-gis-line text-gis-muted hover:text-gis-ink shadow-lg"
              title="Reset Camera"
            >
              <RotateCcw size={20} />
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="w-full h-full">
          <Canvas shadows>
            <BuildingScene
              store={store}
              selectedFloor={selectedFloor}
              setSelectedFloor={setSelectedFloor}
              selectedUnit={selectedUnit}
              setSelectedUnit={setSelectedUnit}
              exploded={exploded}
              is2D={is2D}
            />
          </Canvas>
        </div>

        {/* Bottom HUD Elements */}
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
                max="102"
                value={selectedFloor}
                onChange={(e) => { setSelectedFloor(parseInt(e.target.value)); setSelectedUnit(1); }}
                className="w-56 accent-gis-accent h-1.5 bg-gis-line rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-2xl font-black text-gis-ink tabular-nums">Floor {selectedFloor}</span>
            </div>
          </div>

          <div className="bg-gis-card/80 backdrop-blur-xl p-6 rounded-3xl border border-gis-line shadow-2xl pointer-events-auto animate-fade-in-up">
            <span className="block text-[10px] font-black text-gis-muted uppercase tracking-widest mb-3">Spatial Vector System</span>
            <div className="flex gap-6 text-xs font-mono font-bold">
              <span className="flex items-center gap-2 text-red-400"><span className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]" /> X-AXIS</span>
              <span className="flex items-center gap-2 text-green-400"><span className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]" /> Y-AXIS</span>
              <span className="flex items-center gap-2 text-blue-400"><span className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" /> Z-AXIS</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="card-premium p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gis-accent/20 text-gis-accent rounded-lg">
              <Box size={20} />
            </div>
            <h3 className="text-xl font-bold text-gis-ink tracking-tight">Property Details</h3>
          </div>

          {unit ? (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-gis-bg border border-gis-line group transition-all hover:border-gis-accent/40">
                <span className="block text-[10px] font-black text-gis-muted uppercase tracking-widest mb-2">Proposed 3D ULPIN</span>
                <span className="text-2xl lg:text-3xl font-mono font-black text-white tracking-tight break-all block leading-tight shadow-sm">
    {unit.ulpin}
  </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-gis-bg border border-gis-line group transition-all hover:bg-gis-card">
                  <span className="block text-[10px] font-black text-gis-muted uppercase mb-1">Type</span>
                  <span className="text-sm font-bold text-gis-ink">{unit.type}</span>
                </div>
                <div className="p-4 rounded-2xl bg-gis-bg border border-gis-line group transition-all hover:bg-gis-card">
                  <span className="block text-[10px] font-black text-gis-muted uppercase mb-1">Area</span>
                  <span className="text-sm font-bold text-gis-ink">{unit.area.toLocaleString()} sq ft</span>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-gis-bg border border-gis-line space-y-4">
                <span className="block text-[10px] font-black text-gis-muted uppercase tracking-widest">Spatial Coordinates</span>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-gis-card border border-gis-line transition-all hover:border-red-500/50">
                    <span className="block text-[10px] text-gis-muted font-bold mb-1">X</span>
                    <span className="text-sm font-black text-gis-ink">{unit.x} m</span>
                  </div>
                  <div className="p-3 rounded-xl bg-gis-card border border-gis-line transition-all hover:border-green-500/50">
                    <span className="block text-[10px] text-gis-muted font-bold mb-1">Y</span>
                    <span className="text-sm font-black text-gis-ink">{unit.y} m</span>
                  </div>
                  <div className="p-3 rounded-xl bg-gis-card border border-gis-line transition-all hover:border-blue-500/50">
                    <span className="block text-[10px] text-gis-muted font-bold mb-1">Z</span>
                    <span className="text-sm font-black text-gis-ink">{unit.z} m</span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-gis-bg border border-gis-line space-y-4">
                <span className="block text-[10px] font-black text-gis-muted uppercase tracking-widest">Vertical Extent Schematic</span>
                <div className="relative h-32 w-full flex flex-col justify-between items-center py-2 px-4">
                  <div className="text-center">
                    <span className="text-[9px] font-black text-gis-muted uppercase">Z-TOP</span>
                    <p className="text-sm font-black text-gis-ink">{unit.zTop} m</p>
                  </div>
                  <div className="w-1.5 flex-1 bg-gis-accent relative shadow-[0_0_10px_rgba(56,189,248,0.4)]">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gis-card px-3 py-1 rounded-full text-[10px] font-black max-w-[100px] truncate text-center border border-gis-line shadow-xl z-10">
                      Unit {unit.unit}
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="text-[9px] font-black text-gis-muted uppercase">Z-BOTTOM</span>
                    <p className="text-sm font-black text-gis-ink">{unit.zBottom} m</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                <span className="text-sm font-bold tracking-tight">Spatially Validated Record</span>
                <div className="p-1.5 bg-emerald-500 text-white rounded-full shadow-lg shadow-emerald-500/20">
                  <CheckCircle size={16} />
                </div>
              </div>
            </div>
          ) : (
            <div className="py-24 text-center text-gis-muted animate-pulse">
              <Box size={64} className="mx-auto mb-6 opacity-10" />
              <p className="text-sm font-medium">Select a unit in the 3D view to inspect its spatial record.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyMap;
