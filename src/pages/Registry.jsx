import React, { useState, useMemo } from 'react';
import { Download, Plus, Search as SearchIcon, Filter } from 'lucide-react';
import { PROPERTY_TYPES } from '../data/store';

const Registry = ({ store }) => {
  const { properties } = store;
  const [searchTerm, setSearchTerm] = useState('');
  const [floorFilter, setFloorFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('floor');

  const filteredProperties = useMemo(() => {
    return properties
      .filter(p => {
        const matchesSearch = !searchTerm || JSON.stringify(p).toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFloor = !floorFilter || p.floor === parseInt(floorFilter);
        const matchesType = !typeFilter || p.type === typeFilter;
        const matchesStatus = !statusFilter || p.status === statusFilter;
        return matchesSearch && matchesFloor && matchesType && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'floor') return a.floor - b.floor;
        if (sortBy === 'area') return b.area - a.area;
        return a.ulpin.localeCompare(b.ulpin);
      });
  }, [properties, searchTerm, floorFilter, typeFilter, statusFilter, sortBy]);

  const exportCSV = () => {
    const cols = ["ulpin", "buildingId", "floor", "unit", "type", "area", "zBottom", "zTop", "x", "y", "z", "status", "updated"];
    const csv = [
      cols.join(","),
      ...filteredProperties.map(r => cols.map(k => `"${String(r[k]).replaceAll('"', '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sih26011_property_registry.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card-premium p-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h3 className="text-2xl font-black text-gis-ink tracking-tight">Property Registry</h3>
          <p className="text-sm text-gis-muted font-medium">Comprehensive 3D spatial property database</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={exportCSV}
            className="btn-premium flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-gis-muted bg-gis-bg border border-gis-line hover:text-gis-ink"
          >
            <Download size={18} /> Export CSV
          </button>
          <button
            className="btn-premium flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-gis-accent shadow-lg shadow-gis-accent/20"
          >
            <Plus size={18} /> Add Property
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8 p-6 rounded-2xl bg-gis-bg border border-gis-line">
        <div className="md:col-span-2 relative group">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gis-muted group-focus-within:text-gis-accent transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search ID, floor, unit, type..."
            className="w-full pl-11 pr-4 py-2.5 text-sm bg-gis-card border border-gis-line rounded-xl focus:ring-2 focus:ring-gis-accent/30 outline-none transition-all text-gis-ink placeholder:text-gis-muted"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2.5 text-sm bg-gis-card border border-gis-line rounded-xl outline-none text-gis-ink font-medium focus:ring-2 focus:ring-gis-accent/30 transition-all cursor-pointer"
          value={floorFilter}
          onChange={(e) => setFloorFilter(e.target.value)}
        >
          <option value="">All floors</option>
          {Array.from(new Set(properties.map(p => p.floor))).sort((a, b) => a - b).map(f => (
            <option key={f} value={f}>Floor {f}</option>
          ))}
        </select>
        <select
          className="px-4 py-2.5 text-sm bg-gis-card border border-gis-line rounded-xl outline-none text-gis-ink font-medium focus:ring-2 focus:ring-gis-accent/30 transition-all cursor-pointer"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">All types</option>
          {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          className="px-4 py-2.5 text-sm bg-gis-card border border-gis-line rounded-xl outline-none text-gis-ink font-medium focus:ring-2 focus:ring-gis-accent/30 transition-all cursor-pointer"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All status</option>
          <option value="Validated">Validated</option>
          <option value="Pending">Pending</option>
          <option value="Needs Review">Needs Review</option>
        </select>
        <select
          className="px-4 py-2.5 text-sm bg-gis-card border border-gis-line rounded-xl outline-none text-gis-ink font-medium focus:ring-2 focus:ring-gis-accent/30 transition-all cursor-pointer"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="floor">Sort by Floor</option>
          <option value="area">Sort by Area</option>
          <option value="ulpin">Sort by Identifier</option>
        </select>
      </div>

      <div className="overflow-x-auto border border-gis-line rounded-2xl bg-gis-card shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gis-bg/50 text-gis-muted border-b border-gis-line">
            <tr className="uppercase tracking-widest text-[10px] font-black">
              <th className="px-6 py-4">3D ULPIN</th>
              <th className="px-6 py-4">Building</th>
              <th className="px-6 py-4">Floor</th>
              <th className="px-6 py-4">Unit</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Area</th>
              <th className="px-6 py-4">Elevation</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gis-line">
            {filteredProperties.length > 0 ? (
              filteredProperties.map((p, i) => (
                <tr key={i} className="hover:bg-gis-accent/5 transition-all duration-150 cursor-pointer group">
                  <td className="px-6 py-4 font-mono text-xs font-bold text-gis-accent truncate max-w-[150px]" title={p.ulpin}>{p.ulpin}</td>
                  <td className="px-6 py-4 text-xs font-medium text-gis-ink">{p.buildingId}</td>
                  <td className="px-6 py-4 font-medium text-gis-ink">{p.floor}</td>
                  <td className="px-6 py-4 font-bold text-gis-ink">{p.unit}</td>
                  <td className="px-6 py-4 text-gis-muted">{p.type}</td>
                  <td className="px-6 py-4 font-medium text-gis-ink">{p.area.toLocaleString()} sq ft</td>
                  <td className="px-6 py-4 text-xs font-mono text-gis-muted">{p.z.toFixed(2)} m</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold transition-colors ${
                      p.status === 'Validated' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                      p.status === 'Pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr className="animate-fade-in-up">
                <td colSpan="8" className="px-6 py-20 text-center text-gis-muted font-medium">
                  <div className="flex flex-col items-center gap-3 opacity-50">
                    <SearchIcon size={40} />
                    <p>No matching property records found in the registry.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Registry;
