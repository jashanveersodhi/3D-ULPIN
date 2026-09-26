import React, { useState, useMemo } from 'react';
import { Database, Download, Eye, EyeOff, Search, Filter, MapPin, Building, Home, Route, Trees, Layers } from 'lucide-react';
import { useStore } from '../data/store';
import Card, { CardBody, CardHeader, CardTitle } from '../components/ui/Card';
import StatusBadge from '../components/ui/StatusBadge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';

const LAYER_ICONS = {
  parcels: MapPin,
  buildings: Building,
  roads: Route,
  units: Home,
  greenSpaces: Trees,
};

const SpatialData = () => {
  const { parcels, buildings, units, roads, greenSpaces, spatialLayers, toggleSpatialLayer, selectParcel, selectBuilding, setActivePage } = useStore();
  const [activeTable, setActiveTable] = useState('parcels');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const tableData = useMemo(() => {
    let data = [];
    if (activeTable === 'parcels') data = parcels.map(p => ({
      id: p.id, type: p.landUse, area: p.area, coordinates: `${p.coordinates.lat.toFixed(4)}, ${p.coordinates.lng.toFixed(4)}`,
      status: p.status, confidence: null, ulpin: p.ulpin,
    }));
    else if (activeTable === 'buildings') data = buildings.map(b => ({
      id: b.id, type: b.type, area: b.area, coordinates: `${b.position.lat.toFixed(4)}, ${b.position.lng.toFixed(4)}`,
      status: b.status, confidence: b.confidence, ulpin: b.ulpin,
    }));
    else if (activeTable === 'units') data = units.map(u => ({
      id: u.id, type: u.type, area: u.area, coordinates: `${u.position.lat.toFixed(4)}, ${u.position.lng.toFixed(4)}`,
      status: u.status, confidence: null, ulpin: u.ulpin,
    }));
    else if (activeTable === 'roads') data = roads.map(r => ({
      id: r.id, type: r.type, area: null, coordinates: `${r.path[0][0].toFixed(4)}, ${r.path[0][1].toFixed(4)}`,
      status: 'Validated', confidence: null, ulpin: null,
    }));
    else if (activeTable === 'greenSpaces') data = greenSpaces.map(gs => ({
      id: gs.id, type: 'Green Space', area: gs.area, coordinates: `${gs.polygon[0][0].toFixed(4)}, ${gs.polygon[0][1].toFixed(4)}`,
      status: 'Validated', confidence: null, ulpin: null,
    }));

    if (searchQuery) {
      data = data.filter(d => d.id.toLowerCase().includes(searchQuery.toLowerCase()) || d.type.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (statusFilter) {
      data = data.filter(d => d.status === statusFilter);
    }
    return data;
  }, [activeTable, parcels, buildings, units, roads, greenSpaces, searchQuery, statusFilter]);

  const handleExport = (format) => {
    let content, filename, mimeType;
    if (format === 'csv') {
      const cols = ['id', 'type', 'area', 'coordinates', 'status', 'confidence'];
      content = [cols.join(','), ...tableData.map(r => cols.map(k => `"${r[k] ?? ''}"`).join(','))].join('\n');
      filename = `spatial_data_${activeTable}.csv`;
      mimeType = 'text/csv';
    } else {
      content = JSON.stringify(tableData, null, 2);
      filename = `spatial_data_${activeTable}.json`;
      mimeType = 'application/json';
    }
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6 bg-overlay min-h-full animate-fade-in max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gis-ink">Spatial Data</h1>
          <p className="text-sm text-gis-muted mt-1">Layer management and feature inspection</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" icon={Download} onClick={() => handleExport('csv')}>Export CSV</Button>
          <Button size="sm" variant="secondary" icon={Download} onClick={() => handleExport('json')}>Export JSON</Button>
        </div>
      </div>

      {/* Layer Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {spatialLayers.map((layer) => {
          const Icon = LAYER_ICONS[layer.id] || Layers;
          const count = layer.id === 'parcels' ? parcels.length :
                       layer.id === 'buildings' ? buildings.length :
                       layer.id === 'units' ? units.length :
                       layer.id === 'roads' ? roads.length :
                       greenSpaces.length;
          return (
            <Card key={layer.id} className={`cursor-pointer ${layer.visible ? 'border-gis-accent/30' : 'opacity-60'}`} hover>
              <CardBody onClick={() => { setActiveTable(layer.id); }}>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${layer.visible ? 'bg-gis-accent/10 text-gis-accent' : 'bg-gis-surface text-gis-muted'}`}>
                    <Icon size={18} />
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleSpatialLayer(layer.id); }}
                    className={`p-1.5 rounded-lg transition-colors ${layer.visible ? 'text-gis-accent hover:bg-gis-accent/10' : 'text-gis-muted hover:bg-gis-surface'}`}
                  >
                    {layer.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                </div>
                <p className="text-xs font-medium text-gis-muted uppercase tracking-wider">{layer.name}</p>
                <p className="text-2xl font-bold text-gis-ink mt-1">{count}</p>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <CardTitle className="flex items-center gap-2">
              <Database size={16} className="text-gis-accent" />
              {spatialLayers.find(l => l.id === activeTable)?.name} ({tableData.length} features)
            </CardTitle>
          </div>
        </CardHeader>
        <CardBody>
          {/* Table tabs */}
          <div className="flex gap-1 mb-4 border-b border-gis-border overflow-x-auto">
            {spatialLayers.map(layer => (
              <button
                key={layer.id}
                onClick={() => setActiveTable(layer.id)}
                className={`px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-all ${
                  activeTable === layer.id ? 'text-gis-accent border-gis-accent' : 'text-gis-muted border-transparent hover:text-gis-ink'
                }`}
              >
                {layer.name}
              </button>
            ))}
          </div>

          {/* Search & Filter */}
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gis-muted" />
              <input
                type="text"
                placeholder="Search by ID or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input input-search"
              />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="select w-auto">
              <option value="">All Status</option>
              <option value="Validated">Validated</option>
              <option value="Pending">Pending</option>
              <option value="Needs Review">Needs Review</option>
            </select>
          </div>

          {/* Table */}
          {tableData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-gis-muted border-b border-gis-border">
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">Feature ID</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">Area</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">Coordinates</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gis-border/50">
                  {tableData.slice(0, 50).map((row, i) => (
                    <tr
                      key={row.id || i}
                      className="hover:bg-gis-surface/30 cursor-pointer transition-colors"
                      onClick={() => {
                        if (activeTable === 'parcels') {
                          const p = parcels.find(pp => pp.id === row.id);
                          if (p) { selectParcel(p); setActivePage('ulpin'); }
                        } else if (activeTable === 'buildings') {
                          const b = buildings.find(bb => bb.id === row.id);
                          if (b) { selectBuilding(b); setActivePage('map3d'); }
                        }
                      }}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-gis-accent">{row.id}</td>
                      <td className="px-4 py-3 text-gis-ink">{row.type}</td>
                      <td className="px-4 py-3 text-gis-muted">{row.area ? `${row.area.toLocaleString()} m²` : '—'}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gis-muted">{row.coordinates}</td>
                      <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
                      <td className="px-4 py-3">
                        {row.confidence ? (
                          <span className="text-xs font-bold text-gis-accent">{(row.confidence * 100).toFixed(0)}%</span>
                        ) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {tableData.length > 50 && (
                <p className="text-xs text-gis-muted text-center py-3">
                  Showing 50 of {tableData.length} features
                </p>
              )}
            </div>
          ) : (
            <EmptyState icon={Database} title="No features found" description="Try adjusting your search or filters" />
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default SpatialData;
