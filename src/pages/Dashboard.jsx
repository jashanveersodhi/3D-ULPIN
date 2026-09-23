import React from 'react';
import { Building, Layers, Box, CheckCircle, Clock, ArrowRight, Globe } from 'lucide-react';

const KPICard = ({ label, value, subtext, icon: Icon, color }) => (
  <div className="card-premium p-6 animate-fade-in-up group">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-20 text-current transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
        <Icon size={24} className={color.replace('bg-', 'text-')} />
      </div>
    </div>
    <p className="text-sm text-gis-muted font-semibold tracking-wide uppercase truncate">{label}</p>
    <p className="text-2xl lg:text-4xl font-black text-gis-ink mt-2 tracking-tight truncate">{value}</p>
    <p className="text-xs text-gis-muted mt-2 font-medium opacity-70 truncate">{subtext}</p>
  </div>
);

const Dashboard = ({ store, setActivePage }) => {
  const { buildings, properties } = store;

  const totalBuildings = buildings.length;
  const totalFloors = buildings.reduce((sum, b) => sum + b.floors, 0);
  const totalUnits = properties.length;
  const validatedUnits = properties.filter(p => p.status === 'Validated').length;
  const pendingUnits = properties.filter(p => p.status !== 'Validated').length;

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <KPICard label="Total Buildings" value={totalBuildings} subtext="Registered structures" icon={Building} color="bg-blue-500" />
        <KPICard label="Total Floors" value={totalFloors} subtext="Vertical levels" icon={Layers} color="bg-purple-500" />
        <KPICard label="Property Units" value={totalUnits.toLocaleString()} subtext="Spatial records" icon={Box} color="bg-indigo-500" />
        <KPICard label="Validated" value={`${((validatedUnits/totalUnits)*100).toFixed(1)}%`} subtext={`${validatedUnits.toLocaleString()} verified`} icon={CheckCircle} color="bg-emerald-500" />
        <KPICard label="Pending" value={pendingUnits.toLocaleString()} subtext="Requires review" icon={Clock} color="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Workflow Section */}
        <div className="lg:col-span-2 card-premium p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-gis-accent/20 text-gis-accent rounded-lg">
              <Globe size={20} />
            </div>
            <h3 className="text-xl font-bold text-gis-ink tracking-tight">3D Property Registry Workflow</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
            {[
              { step: '01', label: 'Building', sub: 'Registration' },
              { step: '02', label: '3D', sub: 'Segmentation' },
              { step: '03', label: 'Unit', sub: 'Mapping' },
              { step: '04', label: 'Coordinate', sub: 'Assignment' },
              { step: '05', label: 'Identifier', sub: 'Generation' },
              { step: '06', label: 'Validation', sub: 'Spatially Valid' },
              { step: '07', label: 'Registry', sub: 'Final Record' },
            ].map((item, i) => (
              <div key={i} className="relative p-4 text-center rounded-2xl bg-gis-bg border border-gis-line transition-all duration-300 hover:border-gis-accent/50 hover:-translate-y-1 group">
                <span className="block text-2xl font-black text-gis-accent mb-1 group-hover:scale-110 transition-transform">{item.step}</span>
                <span className="block text-xs font-bold text-gis-ink">{item.label}</span>
                <span className="block text-[10px] text-gis-muted font-medium">{item.sub}</span>
                {i < 6 && (
                  <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                    <ArrowRight size={16} className="text-gis-line group-hover:text-gis-accent transition-colors" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Reference Building Card */}
        <div className="card-premium p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gis-accent/20 text-gis-accent rounded-lg">
                <Building size={20} />
              </div>
              <h3 className="text-xl font-bold text-gis-ink tracking-tight">Reference Building</h3>
            </div>

            <div className="p-6 rounded-2xl bg-gis-bg border border-gis-line relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gis-accent/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-gis-accent/10 transition-colors" />
              <p className="text-lg font-black text-gis-ink mb-1 relative z-10">Empire State Building</p>
              <p className="text-sm text-gis-muted mb-4 relative z-10">350 Fifth Avenue, New York City</p>

              <div className="grid grid-cols-2 gap-y-3 text-xs relative z-10">
                <span className="text-gis-muted font-medium">Floors:</span> <span className="text-gis-ink font-bold">102</span>
                <span className="text-gis-muted font-medium">Roof Height:</span> <span className="text-gis-ink font-bold">~380 m</span>
                <span className="text-gis-muted font-medium">Status:</span>
                <span className="text-emerald-500 font-bold flex items-center gap-1">
                  <CheckCircle size={12} /> Verified
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActivePage('map')}
            className="btn-premium w-full mt-8 py-4 px-6 bg-gis-accent text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-gis-accent/20"
          >
            Open 3D Property Map <ArrowRight size={20} />
          </button>
        </div>
      </div>

      {/* Recent Records Table */}
      <div className="card-premium p-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gis-accent/20 text-gis-accent rounded-lg">
              <Box size={20} />
            </div>
            <h3 className="text-xl font-bold text-gis-ink tracking-tight">Recent Property Records</h3>
          </div>
          <span className="text-xs font-medium text-gis-muted bg-gis-bg px-3 py-1 rounded-full border border-gis-line">
            Prototype demonstration dataset
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-gis-muted border-b border-gis-line">
                <th className="pb-4 pl-4 font-semibold uppercase tracking-wider text-[11px]">Proposed 3D ULPIN</th>
                <th className="pb-4 font-semibold uppercase tracking-wider text-[11px]">Building</th>
                <th className="pb-4 font-semibold uppercase tracking-wider text-[11px]">Floor</th>
                <th className="pb-4 font-semibold uppercase tracking-wider text-[11px]">Unit</th>
                <th className="pb-4 font-semibold uppercase tracking-wider text-[11px]">Type</th>
                <th className="pb-4 font-semibold uppercase tracking-wider text-[11px]">Status</th>
                <th className="pb-4 pr-4 font-semibold uppercase tracking-wider text-[11px]">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gis-line">
              {properties.slice(0, 6).map((p, i) => (
                <tr key={i} className="group hover:bg-gis-accent/5 transition-all duration-150 cursor-pointer">
                  <td className="py-4 pl-4 font-mono text-xs font-bold text-gis-accent truncate max-w-[150px]" title={p.ulpin}>{p.ulpin}</td>
                  <td className="py-4 text-gis-ink font-medium">{p.buildingId}</td>
                  <td className="py-4 text-gis-ink">{p.floor}</td>
                  <td className="py-4 text-gis-ink">{p.unit}</td>
                  <td className="py-4 text-gis-muted">{p.type}</td>
                  <td className="py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold transition-colors ${
                      p.status === 'Validated' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                      p.status === 'Pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-4 pr-4 text-gis-muted italic">{p.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
