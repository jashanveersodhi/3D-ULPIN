import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, Layers, Globe } from 'lucide-react';

const Analytics = ({ store }) => {
  const { properties } = store;

  const floorData = Array.from({ length: 20 }, (_, i) => {
    const floor = i + 1;
    return {
      floor: `F${floor}`,
      count: properties.filter(p => p.floor === floor).length,
    };
  });

  const typeCounts = {};
  properties.forEach(p => {
    typeCounts[p.type] = (typeCounts[p.type] || 0) + 1;
  });
  const typeData = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));

  const statusCounts = { Validated: 0, Pending: 0, 'Needs Review': 0 };
  properties.forEach(p => {
    statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
  });
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  const STATUS_COLORS = {
    Validated: '#10b981',
    Pending: '#f59e0b',
    'Needs Review': '#ef4444',
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card-premium p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-gis-accent/20 text-gis-accent rounded-lg">
              <BarChart3 size={20} />
            </div>
            <h3 className="text-xl font-bold text-gis-ink tracking-tight">Property Distribution by Floor</h3>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={floorData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="floor" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: '#334155' }}
                  contentStyle={{ borderRadius: '16px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#f8fafc', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)' }}
                />
                <Bar dataKey="count" fill="#38bdf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-premium p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-gis-accent/20 text-gis-accent rounded-lg">
              <Layers size={20} />
            </div>
            <h3 className="text-xl font-bold text-gis-ink tracking-tight">Registry Status Analysis</h3>
          </div>
          <div className="h-80 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#f8fafc' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-xs text-gis-muted font-bold uppercase tracking-widest">Total</span>
              <span className="text-3xl font-black text-gis-ink">{properties.length}</span>
            </div>
          </div>
          <div className="flex justify-center gap-6 mt-6">
            {statusData.map(s => (
              <div key={s.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: STATUS_COLORS[s.name] }} />
                <span className="text-xs font-bold text-gis-muted">{s.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="card-premium p-8 lg:col-span-1">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-gis-accent/20 text-gis-accent rounded-lg">
              <Globe size={20} />
            </div>
            <h3 className="text-xl font-bold text-gis-ink tracking-tight">Type Distribution</h3>
          </div>
          <div className="space-y-6">
            {typeData.map((t, i) => (
              <div key={t.name} className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-gis-muted uppercase tracking-wider truncate">{t.name}</span>
                  <span className="text-gis-ink">{t.value} Units</span>
                </div>
                <div className="h-2 bg-gis-bg rounded-full overflow-hidden border border-gis-line">
                  <div
                    className="h-full bg-gis-accent transition-all duration-1000 shadow-[0_0_10px_rgba(56,189,248,0.5)]"
                    style={{ width: `${(t.value / properties.length) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-premium p-8 lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gis-accent/20 text-gis-accent rounded-lg">
              <Layers size={20} />
            </div>
            <h3 className="text-xl font-bold text-gis-ink tracking-tight">Vertical Density Analysis</h3>
          </div>
          <div className="p-6 rounded-2xl bg-gis-bg border border-gis-line text-sm text-gis-muted leading-relaxed font-medium relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gis-accent/5 blur-3xl rounded-full -mr-16 -mt-16" />
            The prototype demonstrates that a 2D building footprint is insufficient for modern urban registries.
            In this model, each floor is a distinct spatial layer.
            By mapping individual property units (flats/offices) as 3D volumes with defined <span className="text-gis-accent font-bold">Z-bottom</span> and <span className="text-gis-accent font-bold">Z-top</span> coordinates,
            the system uniquely identifies vertically stacked properties that would otherwise overlap in a 2D projection.
          </div>
          <div className="mt-8 grid grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-gis-bg border border-gis-line text-center transition-all hover:border-gis-accent/50 group">
              <span className="block text-[10px] font-black text-gis-muted uppercase tracking-widest mb-2">Avg. Unit Height</span>
              <span className="text-2xl font-black text-gis-ink group-hover:text-gis-accent transition-colors">3.72 m</span>
            </div>
            <div className="p-5 rounded-2xl bg-gis-bg border border-gis-line text-center transition-all hover:border-gis-accent/50 group">
              <span className="block text-[10px] font-black text-gis-muted uppercase tracking-widest mb-2">Max Elevation</span>
              <span className="text-2xl font-black text-gis-ink group-hover:text-gis-accent transition-colors">380 m</span>
            </div>
            <div className="p-5 rounded-2xl bg-gis-bg border border-gis-line text-center transition-all hover:border-gis-accent/50 group">
              <span className="block text-[10px] font-black text-gis-muted uppercase tracking-widest mb-2">Vertical Layers</span>
              <span className="text-2xl font-black text-gis-ink group-hover:text-gis-accent transition-colors">102</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
