import React, { useState, useMemo } from 'react';
import { Hash, Copy, Map, Box, Download, Search, Building, Home, ChevronRight, CheckCircle, Filter } from 'lucide-react';
import { useStore } from '../data/store';
import Card, { CardBody, CardHeader, CardTitle } from '../components/ui/Card';
import StatusBadge from '../components/ui/StatusBadge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { Copy as CopyIcon } from 'lucide-react';

const UlpinPage = () => {
  const { parcels, buildings, units, selectedParcel, selectedBuilding, selectParcel, selectBuilding, setActivePage } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [landUseFilter, setLandUseFilter] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const filteredParcels = useMemo(() => {
    return parcels.filter(p => {
      const matchesSearch = !searchQuery || p.ulpin.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLandUse = !landUseFilter || p.landUse === landUseFilter;
      return matchesSearch && matchesLandUse;
    });
  }, [parcels, searchQuery, landUseFilter]);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text).catch(() => {
      // Fallback for environments where clipboard API is unavailable
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    });
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportRecord = (parcel) => {
    const record = {
      parcel: { id: parcel.id, ulpin: parcel.ulpin, area: parcel.area, landUse: parcel.landUse, status: parcel.status, coordinates: parcel.coordinates },
      buildings: parcel.buildings.map(b => ({
        id: b.id, ulpin: b.ulpin, name: b.name, type: b.type, floors: b.floors, height: b.height, area: b.area, confidence: b.confidence,
        units: units.filter(u => u.buildingId === b.id).map(u => ({ id: u.id, ulpin: u.ulpin, floor: u.floorLevel, type: u.type, area: u.area, status: u.status })),
      })),
      exportTimestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(record, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ulpin_record_${parcel.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectedUnits = useMemo(() => {
    if (!selectedBuilding) return [];
    return units.filter(u => u.buildingId === selectedBuilding.id);
  }, [selectedBuilding, units]);

  return (
    <div className="p-6 space-y-6 bg-overlay min-h-full animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gis-ink">ULPIN Registry</h1>
          <p className="text-sm text-gis-muted mt-1">Hierarchical Unique Land Parcel Identification Numbers</p>
        </div>
        <div className="badge-info">Parcel → Building → Unit</div>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gis-muted" />
              <input
                type="text"
                placeholder="Search by ULPIN or Parcel ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input input-search"
              />
            </div>
            <select value={landUseFilter} onChange={(e) => setLandUseFilter(e.target.value)} className="select w-auto">
              <option value="">All Land Uses</option>
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
              <option value="Mixed-Use">Mixed-Use</option>
              <option value="Institutional">Institutional</option>
              <option value="Industrial">Industrial</option>
            </select>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Parcel List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Parcels ({filteredParcels.length})</CardTitle>
            </CardHeader>
            <CardBody className="max-h-[600px] overflow-y-auto p-0">
              {filteredParcels.length > 0 ? (
                <div className="divide-y divide-gis-border/50">
                  {filteredParcels.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => { selectParcel(p); selectBuilding(null); }}
                      className={`p-4 cursor-pointer transition-all hover:bg-gis-surface/50 ${
                        selectedParcel?.id === p.id ? 'bg-gis-accent/5 border-l-2 border-l-gis-accent' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs text-gis-accent font-bold">{p.ulpin}</span>
                        <StatusBadge status={p.status} />
                      </div>
                      <div className="flex items-center justify-between text-xs text-gis-muted">
                        <span>{p.landUse}</span>
                        <span>{p.area.toLocaleString()} m² • {p.buildingCount} bldg</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={Filter} title="No parcels found" description="Try adjusting your search or filters" />
              )}
            </CardBody>
          </Card>
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-2">
          {selectedParcel ? (
            <div className="space-y-6">
              {/* Parcel Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hash size={16} className="text-gis-accent" />
                    Parcel: {selectedParcel.id}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" icon={copiedId === selectedParcel.id ? CheckCircle : CopyIcon} onClick={() => handleCopy(selectedParcel.ulpin, selectedParcel.id)}>
                      {copiedId === selectedParcel.id ? 'Copied!' : 'Copy ULPIN'}
                    </Button>
                    <Button size="sm" variant="secondary" icon={Download} onClick={() => handleExportRecord(selectedParcel)}>
                      Export
                    </Button>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-gis-surface border border-gis-border">
                      <span className="text-[10px] font-semibold text-gis-muted uppercase tracking-wider">Parcel ULPIN</span>
                      <p className="font-mono text-lg text-gis-accent font-bold mt-1">{selectedParcel.ulpin}</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="p-3 rounded-lg bg-gis-surface border border-gis-border">
                        <span className="text-[10px] font-semibold text-gis-muted uppercase tracking-wider">Land Use</span>
                        <p className="text-sm font-bold text-gis-ink mt-1">{selectedParcel.landUse}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-gis-surface border border-gis-border">
                        <span className="text-[10px] font-semibold text-gis-muted uppercase tracking-wider">Area</span>
                        <p className="text-sm font-bold text-gis-ink mt-1">{selectedParcel.area.toLocaleString()} m²</p>
                      </div>
                      <div className="p-3 rounded-lg bg-gis-surface border border-gis-border">
                        <span className="text-[10px] font-semibold text-gis-muted uppercase tracking-wider">Buildings</span>
                        <p className="text-sm font-bold text-gis-ink mt-1">{selectedParcel.buildingCount}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-gis-surface border border-gis-border">
                        <span className="text-[10px] font-semibold text-gis-muted uppercase tracking-wider">Status</span>
                        <div className="mt-1"><StatusBadge status={selectedParcel.status} /></div>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-gis-surface border border-gis-border">
                      <span className="text-[10px] font-semibold text-gis-muted uppercase tracking-wider">Coordinates</span>
                      <p className="text-xs font-mono text-gis-ink mt-1">
                        {selectedParcel.coordinates.lat.toFixed(6)}°N, {selectedParcel.coordinates.lng.toFixed(6)}°E
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" icon={Map} onClick={() => setActivePage('map2d')}>
                        View on 2D Map
                      </Button>
                      <Button size="sm" variant="secondary" icon={Box} onClick={() => setActivePage('map3d')}>
                        View in 3D
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Buildings on this parcel */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building size={16} className="text-gis-secondary" />
                    Buildings ({selectedParcel.buildings.length})
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="space-y-3">
                    {selectedParcel.buildings.map((b) => (
                      <div
                        key={b.id}
                        onClick={() => selectBuilding(b)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          selectedBuilding?.id === b.id
                            ? 'bg-gis-accent/5 border-gis-accent/30'
                            : 'bg-gis-surface border-gis-border hover:border-gis-accent/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-gis-accent font-bold">{b.ulpin}</span>
                            <ChevronRight size={12} className="text-gis-muted" />
                            <span className="text-sm font-semibold text-gis-ink">{b.name}</span>
                          </div>
                          <StatusBadge status={b.status} />
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-xs">
                          <div>
                            <span className="text-gis-muted">Type</span>
                            <p className="text-gis-ink font-medium">{b.type}</p>
                          </div>
                          <div>
                            <span className="text-gis-muted">Floors</span>
                            <p className="text-gis-ink font-medium">{b.floors}</p>
                          </div>
                          <div>
                            <span className="text-gis-muted">Height</span>
                            <p className="text-gis-ink font-medium">{b.height} m</p>
                          </div>
                          <div>
                            <span className="text-gis-muted">Confidence</span>
                            <p className="text-gis-accent font-medium">{(b.confidence * 100).toFixed(0)}%</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>

              {/* Units in selected building */}
              {selectedBuilding && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Home size={16} className="text-gis-success" />
                      Units in {selectedBuilding.name} ({selectedUnits.length})
                    </CardTitle>
                    <Button size="sm" variant="ghost" onClick={() => selectBuilding(null)}>
                      Clear Building
                    </Button>
                  </CardHeader>
                  <CardBody>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="text-gis-muted border-b border-gis-border">
                            <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wider">Unit ULPIN</th>
                            <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wider">Floor</th>
                            <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wider">Type</th>
                            <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wider">Area</th>
                            <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gis-border/50">
                          {selectedUnits.slice(0, 20).map((u) => (
                            <tr key={u.id} className="hover:bg-gis-surface/30">
                              <td className="px-3 py-2 font-mono text-xs text-gis-accent">{u.ulpin}</td>
                              <td className="px-3 py-2 text-gis-ink">{u.floorLevel}</td>
                              <td className="px-3 py-2 text-gis-muted">{u.type}</td>
                              <td className="px-3 py-2 text-gis-ink">{u.area.toLocaleString()} m²</td>
                              <td className="px-3 py-2"><StatusBadge status={u.status} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {selectedUnits.length > 20 && (
                        <p className="text-xs text-gis-muted text-center py-2">
                          Showing 20 of {selectedUnits.length} units
                        </p>
                      )}
                    </div>
                  </CardBody>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardBody>
                <EmptyState
                  icon={Hash}
                  title="Select a Parcel"
                  description="Choose a parcel from the list to view its hierarchical ULPIN structure: Parcel → Building → Unit"
                />
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default UlpinPage;
