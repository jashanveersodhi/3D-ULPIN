import React, { useState } from 'react';
import { Search as SearchIcon, Loader2, ArrowRight, MapPin } from 'lucide-react';

const SearchPage = ({ store, onSelectRecord }) => {
  const { properties } = store;
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (val) => {
    setQuery(val);
    if (!val) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    setTimeout(() => {
      const filtered = properties.filter(p =>
        `${p.ulpin} ${p.unit} ${p.type} ${p.floor} ${p.buildingId}`.toLowerCase().includes(val.toLowerCase())
      ).slice(0, 12);
      setResults(filtered);
      setIsSearching(false);
    }, 300);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-fade-in-up">
      <div className="card-premium p-12 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-gis-accent/10 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gis-accent/20 text-gis-accent rounded-3xl">
              <SearchIcon size={32} />
            </div>
          </div>
          <h3 className="text-3xl font-black text-gis-ink mb-3 tracking-tight">Global Spatial Search</h3>
          <p className="text-gis-muted max-w-xl mx-auto mb-10 font-medium">
            Instantly locate any property unit by its identifier, floor, or type across the global 3D registry.
          </p>

          <div className="relative max-w-2xl mx-auto group">
            <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-gis-muted group-focus-within:text-gis-accent transition-colors" size={24} />
            <input
              type="text"
              className="w-full pl-14 pr-16 py-5 text-xl bg-gis-bg border border-gis-line rounded-2xl focus:ring-4 focus:ring-gis-accent/20 focus:border-gis-accent outline-none transition-all text-gis-ink placeholder:text-gis-muted shadow-inner"
              placeholder="Try 'Floor 25', 'Unit 25A', 'PROTOTYPE-ESB-F025-U001'..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {isSearching && (
              <div className="absolute right-5 top-1/2 -translate-y-1/2">
                <Loader2 className="animate-spin text-gis-accent" size={24} />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.length > 0 ? (
          results.map((p, i) => (
            <div
              key={i}
              onClick={() => onSelectRecord(p)}
              className="card-premium p-6 cursor-pointer group relative overflow-hidden transition-all duration-300 hover:-translate-y-1"
            >
              <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <MapPin size={16} className="text-gis-accent" />
              </div>

              <div className="flex justify-between items-start mb-4">
                <span className="font-mono text-sm font-black text-gis-accent tracking-tighter">{p.ulpin}</span>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                  p.status === 'Validated' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                }`}>
                  {p.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-y-3 text-xs">
                <span className="text-gis-muted font-medium">Building:</span> <span className="text-gis-ink font-bold text-right">{p.buildingId}</span>
                <span className="text-gis-muted font-medium">Floor:</span> <span className="text-gis-ink font-bold text-right">{p.floor}</span>
                <span className="text-gis-muted font-medium">Unit:</span> <span className="text-gis-ink font-bold text-right">{p.unit}</span>
                <span className="text-gis-muted font-medium">Type:</span> <span className="text-gis-ink font-bold text-right">{p.type}</span>
              </div>

              <div className="mt-6 flex items-center justify-center gap-2 py-2 rounded-xl bg-gis-bg border border-gis-line text-xs font-black text-gis-accent opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                Locate in 3D Space <ArrowRight size={14} />
              </div>
            </div>
          ))
        ) : (
          query && !isSearching && (
            <div className="col-span-full py-20 text-center text-gis-muted animate-fade-in-up">
              <div className="flex flex-col items-center gap-4 opacity-40">
                <SearchIcon size={48} />
                <p className="font-medium">No spatial records found matching your query.</p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default SearchPage;
