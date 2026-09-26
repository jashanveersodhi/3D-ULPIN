import React, { useState, useMemo } from 'react';
import { Download, Plus, Search as SearchIcon, Filter } from 'lucide-react';
import { useStore } from '../data/store';
import Card, { CardBody, CardHeader, CardTitle } from '../components/ui/Card';
import StatusBadge from '../components/ui/StatusBadge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';

const PROPERTY_TYPES = ['Residential', 'Commercial', 'Office', 'Retail', 'Mixed-Use', 'Industrial'];

const Registry = () => {
  const { units, buildings, addActivity } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('id');

  const filteredUnits = useMemo(() => {
    return units
      .filter(u => {
        const matchesSearch = !searchTerm || u.ulpin.toLowerCase().includes(searchQuery.toLowerCase()) || u.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = !typeFilter || u.type === typeFilter;
        const matchesStatus = !statusFilter || u.status === statusFilter;
        return matchesSearch && matchesType && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'area') return b.area - a.area;
        if (sortBy === 'floor') return a.floorLevel - b.floorLevel;
        return a.id.localeCompare(b.id);
      });
  }, [units, searchTerm, typeFilter, statusFilter, sortBy]);

  const exportCSV = () => {
    const cols = ['id', 'ulpin', 'buildingId', 'parcelId', 'floorLevel', 'unitNumber', 'type', 'area', 'status'];
    const csv = [
      cols.join(','),
      ...filteredUnits.map(r => cols.map(k => `"${String(r[k] ?? '').replaceAll('"', '""')}"`).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'property_registry.csv';
    a.click();
    URL.revokeObjectURL(url);
    addActivity('Registry exported as CSV', 'success');
  };

  const handleAddProperty = () => {
    addActivity('Add Property form opened (demo)', 'info');
  };

  return (
    <div className="p-6 space-y-6 bg-overlay min-h-full animate-fade-in max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gis-ink">Property Registry</h1>
          <p className="text-sm text-gis-muted mt-1">Comprehensive spatial property database with hierarchical ULPINs</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={Download} onClick={exportCSV}>Export CSV</Button>
          <Button icon={Plus} onClick={handleAddProperty}>Add Property</Button>
        </div>
      </div>

      <Card>
        <CardBody>
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gis-muted" />
              <input
                type="text"
                placeholder="Search ULPIN, unit ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input input-search"
              />
            </div>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="select w-auto">
              <option value="">All Types</option>
              {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="select w-auto">
              <option value="">All Status</option>
              <option value="Validated">Validated</option>
              <option value="Pending">Pending</option>
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="select w-auto">
              <option value="id">Sort by ID</option>
              <option value="area">Sort by Area</option>
              <option value="floor">Sort by Floor</option>
            </select>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Property Units ({filteredUnits.length})</CardTitle>
        </CardHeader>
        <CardBody className="p-0">
          {filteredUnits.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-gis-muted border-b border-gis-border">
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">Unit ULPIN</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">Floor</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">Area</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gis-border/50">
                  {filteredUnits.slice(0, 50).map((u) => (
                    <tr key={u.id} className="hover:bg-gis-surface/30 cursor-pointer transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-gis-accent">{u.ulpin}</td>
                      <td className="px-4 py-3 text-gis-ink">{u.type}</td>
                      <td className="px-4 py-3 text-gis-muted">{u.floorLevel}</td>
                      <td className="px-4 py-3 text-gis-ink">{u.area.toLocaleString()} m²</td>
                      <td className="px-4 py-3"><StatusBadge status={u.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUnits.length > 50 && (
                <p className="text-xs text-gis-muted text-center py-3">Showing 50 of {filteredUnits.length} units</p>
              )}
            </div>
          ) : (
            <EmptyState icon={Filter} title="No units found" description="Try adjusting your search or filters" />
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default Registry;
