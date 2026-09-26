import React, { useState, Suspense } from 'react';
import { Building, Map, Hash, Cpu, TrendingUp, ArrowRight, Clock, CheckCircle, AlertCircle, Maximize2, Box } from 'lucide-react';
import { useStore } from '../data/store';
import MetricCard from '../components/ui/MetricCard';
import Card, { CardBody, CardHeader, CardTitle } from '../components/ui/Card';
import StatusBadge from '../components/ui/StatusBadge';
import { PageLoading } from '../components/ui/LoadingState';

// Lazy-load the 3D preview to keep initial page load fast
const Dashboard3DPreview = React.lazy(() => import('../components/Dashboard3DPreview'));

const Dashboard = () => {
  const { parcels, buildings, units, activities, setActivePage, selectParcel, selectBuilding } = useStore();
  const [preview3D, setPreview3D] = useState(true);

  const totalArea = parcels.reduce((s, p) => s + p.area, 0);
  const avgConfidence = buildings.length > 0
    ? (buildings.reduce((s, b) => s + b.confidence, 0) / buildings.length * 100).toFixed(1)
    : 0;
  const validatedUnits = units.filter(u => u.status === 'Validated').length;

  return (
    <div className="p-6 space-y-6 bg-overlay min-h-full animate-fade-in">
      {/* Metrics — preserved */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard label="Total Parcels" value={parcels.length} subtext="Registered land parcels" icon={Map} color="text-gis-accent" />
        <MetricCard label="Buildings" value={buildings.length} subtext="Detected structures" icon={Building} color="text-gis-secondary" />
        <MetricCard label="Units" value={units.length} subtext="Individual flats" icon={Hash} color="text-gis-success" />
        <MetricCard label="Total Area" value={`${(totalArea / 1000).toFixed(1)}k`} subtext="Square meters" icon={TrendingUp} color="text-gis-warning" />
        <MetricCard label="AI Accuracy" value={`${avgConfidence}%`} subtext="Avg confidence" icon={Cpu} color="text-gis-accent" />
        <MetricCard label="Validated" value={validatedUnits} subtext="Verified units" icon={CheckCircle} color="text-gis-success" />
      </div>

      {/* NEW: Embedded 3D Preview + Reference Building */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Embedded 3D Preview — same scene as full 3D page */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Box size={16} className="text-gis-accent" />
              3D Property Map — Live Preview
            </CardTitle>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreview3D(!preview3D)}
                className="text-xs text-gis-muted hover:text-gis-accent transition-colors"
              >
                {preview3D ? 'Hide' : 'Show'}
              </button>
              <button
                onClick={() => setActivePage('map3d')}
                className="flex items-center gap-1 text-xs text-gis-accent hover:text-gis-accent-hover transition-colors"
              >
                <Maximize2 size={12} /> Expand
              </button>
            </div>
          </CardHeader>
          {preview3D && (
            <div className="h-[350px] relative">
              <Suspense fallback={<PageLoading />}>
                <Dashboard3DPreview />
              </Suspense>
              {/* Overlay hint */}
              <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end pointer-events-none">
                <div className="bg-gis-card/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gis-border">
                  <p className="text-[10px] text-gis-muted">Click any building to inspect its ULPIN</p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Reference Building — preserved */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building size={16} className="text-gis-accent" />
              Reference Building
            </CardTitle>
            <StatusBadge status="Validated" />
          </CardHeader>
          <CardBody>
            <div className="p-4 rounded-xl bg-gis-surface border border-gis-border relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gis-accent/5 rounded-full -mr-10 -mt-10 blur-2xl" />
              <p className="text-lg font-bold text-gis-ink mb-1 relative z-10">Empire State Building</p>
              <p className="text-sm text-gis-muted mb-4 relative z-10">350 Fifth Avenue, New York City</p>
              <div className="grid grid-cols-2 gap-y-3 text-xs relative z-10">
                <span className="text-gis-muted font-medium">Floors:</span>
                <span className="text-gis-ink font-bold">102</span>
                <span className="text-gis-muted font-medium">Roof Height:</span>
                <span className="text-gis-ink font-bold">~380 m</span>
                <span className="text-gis-muted font-medium">Type:</span>
                <span className="text-gis-ink font-bold">Commercial</span>
                <span className="text-gis-muted font-medium">Status:</span>
                <span className="text-gis-success font-bold flex items-center gap-1">
                  <CheckCircle size={12} /> Verified
                </span>
              </div>
            </div>
            <button
              onClick={() => setActivePage('map3d')}
              className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
            >
              Open 3D Property Map <ArrowRight size={16} />
            </button>
          </CardBody>
        </Card>
      </div>

      {/* Workflow strip — preserved */}
      <Card>
        <CardBody>
          <h4 className="text-xs font-semibold text-gis-muted uppercase tracking-wider mb-4">3D Property Registry Workflow</h4>
          <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
            {[
              { step: '01', label: 'Building', sub: 'Registration' },
              { step: '02', label: '3D', sub: 'Segmentation' },
              { step: '03', label: 'Unit', sub: 'Mapping' },
              { step: '04', label: 'Coordinate', sub: 'Assignment' },
              { step: '05', label: 'Identifier', sub: 'Generation' },
              { step: '06', label: 'Validation', sub: 'Spatially Valid' },
              { step: '07', label: 'Registry', sub: 'Final Record' },
            ].map((item, i) => (
              <div key={i} className="relative p-3 text-center rounded-xl bg-gis-surface border border-gis-border hover:border-gis-accent/30 transition-all group">
                <span className="block text-xl font-bold text-gis-accent mb-1 group-hover:scale-110 transition-transform">{item.step}</span>
                <span className="block text-xs font-semibold text-gis-ink">{item.label}</span>
                <span className="block text-[10px] text-gis-muted">{item.sub}</span>
                {i < 6 && (
                  <div className="hidden md:block absolute -right-2.5 top-1/2 -translate-y-1/2 z-10">
                    <ArrowRight size={14} className="text-gis-border group-hover:text-gis-accent transition-colors" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <span className="text-xs text-gis-muted bg-gis-surface px-2 py-1 rounded-full">Demo Data</span>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'AI Extraction', icon: Cpu, page: 'extraction', color: 'text-gis-accent' },
                { label: '2D Map', icon: Map, page: 'map2d', color: 'text-gis-success' },
                { label: '3D Model', icon: Building, page: 'map3d', color: 'text-gis-secondary' },
                { label: 'ULPIN Gen', icon: Hash, page: 'ulpin', color: 'text-gis-warning' },
              ].map((action) => (
                <button
                  key={action.page}
                  onClick={() => setActivePage(action.page)}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gis-surface hover:bg-gis-input border border-gis-border hover:border-gis-accent/30 transition-all group"
                >
                  <action.icon size={24} className={`${action.color} group-hover:scale-110 transition-transform`} />
                  <span className="text-xs font-medium text-gis-ink">{action.label}</span>
                </button>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <Clock size={16} className="text-gis-muted" />
          </CardHeader>
          <CardBody className="max-h-[250px] overflow-y-auto">
            <div className="space-y-3">
              {activities.slice(0, 6).map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gis-surface/50 transition-colors">
                  <div className={`mt-0.5 ${
                    activity.type === 'success' ? 'text-gis-success' :
                    activity.type === 'warning' ? 'text-gis-warning' :
                    activity.type === 'error' ? 'text-gis-error' : 'text-gis-accent'
                  }`}>
                    {activity.type === 'success' ? <CheckCircle size={14} /> :
                     activity.type === 'warning' ? <AlertCircle size={14} /> :
                     <Clock size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gis-ink leading-relaxed">{activity.message}</p>
                    <p className="text-[10px] text-gis-muted mt-0.5">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Recent Parcels Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Parcels</CardTitle>
          <button onClick={() => setActivePage('spatial')} className="text-xs text-gis-accent hover:text-gis-accent-hover flex items-center gap-1">
            View All <ArrowRight size={12} />
          </button>
        </CardHeader>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-gis-muted border-b border-gis-border">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">ULPIN</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">Land Use</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">Area</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">Buildings</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gis-border/50">
                {parcels.slice(0, 6).map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-gis-surface/30 cursor-pointer transition-colors"
                    onClick={() => { selectParcel(p); setActivePage('ulpin'); }}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-gis-accent">{p.ulpin}</td>
                    <td className="px-4 py-3 text-gis-ink">{p.landUse}</td>
                    <td className="px-4 py-3 text-gis-muted">{p.area.toLocaleString()} m²</td>
                    <td className="px-4 py-3 text-gis-ink">{p.buildingCount}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default Dashboard;
