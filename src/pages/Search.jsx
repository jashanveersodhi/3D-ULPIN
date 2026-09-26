import React, { useState, useMemo } from 'react';
import { Search as SearchIcon, Loader2, ArrowRight, MapPin } from 'lucide-react';
import { useStore } from '../data/store';
import Card, { CardBody } from '../components/ui/Card';
import StatusBadge from '../components/ui/StatusBadge';

const SearchPage = () => {
  const { units, setActivePage } = useStore();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState([]);

  const handleSearch = (val) => {
    setQuery(val);
    if (!val) { setResults([]); return; }
    setIsSearching(true);
    setTimeout(() => {
      const filtered = units.filter(u =>
        `${u.ulpin} ${u.unitNumber} ${u.type} ${u.floorLevel} ${u.buildingId}`.toLowerCase().includes(val.toLowerCase())
      ).slice(0, 12);
      setResults(filtered);
      setIsSearching(false);
    }, 300);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-fade-in">
      <Card>
        <CardBody className="text-center py-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-2xl bg-gis-accent/10">
              <SearchIcon size={28} className="text-gis-accent" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gis-ink mb-2">Global Spatial Search</h2>
          <p className="text-sm text-gis-muted mb-6 max-w-lg mx-auto">
            Instantly locate any property unit by its ULPIN, floor, or type across the spatial registry.
          </p>
          <div className="relative max-w-xl mx-auto">
            <SearchIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gis-muted" />
            <input
              type="text"
              className="w-full pl-12 pr-12 py-3.5 bg-gis-surface border border-gis-border rounded-xl text-gis-ink placeholder:text-gis-muted/60 outline-none focus:border-gis-accent/50 focus:ring-2 focus:ring-gis-accent/20 transition-all"
              placeholder="Try 'ULPIN-UN-0001', 'Floor 3', '2BHK'..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {isSearching && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <Loader2 size={20} className="animate-spin text-gis-accent" />
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.length > 0 ? (
          results.map((u) => (
            <Card key={u.id} hover>
              <CardBody>
                <div className="flex justify-between items-start mb-3">
                  <span className="font-mono text-xs text-gis-accent font-bold truncate max-w-[140px]" title={u.ulpin}>{u.ulpin}</span>
                  <StatusBadge status={u.status} />
                </div>
                <div className="grid grid-cols-2 gap-y-2 text-xs">
                  <span className="text-gis-muted">Type:</span>
                  <span className="text-gis-ink font-medium text-right">{u.type}</span>
                  <span className="text-gis-muted">Floor:</span>
                  <span className="text-gis-ink font-medium text-right">{u.floorLevel}</span>
                  <span className="text-gis-muted">Area:</span>
                  <span className="text-gis-ink font-medium text-right">{u.area.toLocaleString()} m²</span>
                </div>
                <button
                  onClick={() => useStore.getState().selectUnit(u) || setActivePage('ulpin')}
                  className="mt-4 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-gis-surface border border-gis-border text-xs font-semibold text-gis-accent hover:bg-gis-accent/10 transition-all"
                >
                  View Details <ArrowRight size={12} />
                </button>
              </CardBody>
            </Card>
          ))
        ) : (
          query && !isSearching && (
            <div className="col-span-full py-16 text-center">
              <SearchIcon size={40} className="mx-auto text-gis-muted/20 mb-3" />
              <p className="text-sm text-gis-muted">No spatial records found matching your query.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default SearchPage;
