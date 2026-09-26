import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, AreaChart, Area } from 'recharts';
import { Activity, Building, Map, CheckCircle, TrendingUp } from 'lucide-react';
import { useStore } from '../data/store';
import Card, { CardBody, CardHeader, CardTitle } from '../components/ui/Card';
import MetricCard from '../components/ui/MetricCard';

const Analytics = () => {
  const { parcels, buildings, units } = useStore();

  const landUseData = React.useMemo(() => {
    const counts = {};
    parcels.forEach(p => { counts[p.landUse] = (counts[p.landUse] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [parcels]);

  const buildingTypeData = React.useMemo(() => {
    const counts = {};
    buildings.forEach(b => { counts[b.type] = (counts[b.type] || 0) + 1; });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [buildings]);

  const floorDistribution = React.useMemo(() => {
    const dist = {};
    buildings.forEach(b => {
      const range = b.floors <= 3 ? '1-3' : b.floors <= 6 ? '4-6' : b.floors <= 10 ? '7-10' : '10+';
      dist[range] = (dist[range] || 0) + 1;
    });
    return Object.entries(dist).map(([range, count]) => ({ range, count }));
  }, [buildings]);

  const confidenceData = [
    { name: 'High (>90%)', value: buildings.filter(b => b.confidence > 0.9).length, color: '#10B981' },
    { name: 'Medium (80-90%)', value: buildings.filter(b => b.confidence > 0.8 && b.confidence <= 0.9).length, color: '#F59E0B' },
    { name: 'Low (<80%)', value: buildings.filter(b => b.confidence <= 0.8).length, color: '#EF4444' },
  ];

  const areaTrend = React.useMemo(() => {
    return parcels.slice(0, 12).map((p, i) => ({
      name: `P${i + 1}`,
      area: p.area,
      buildings: p.buildingCount,
    }));
  }, [parcels]);

  const avgConfidence = buildings.length > 0
    ? (buildings.reduce((s, b) => s + b.confidence, 0) / buildings.length * 100).toFixed(1)
    : 0;

  const totalArea = parcels.reduce((s, p) => s + p.area, 0);

  return (
    <div className="p-6 space-y-6 bg-overlay min-h-full animate-fade-in max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gis-ink">Analytics</h1>
          <p className="text-sm text-gis-muted mt-1">Spatial data insights and AI extraction metrics</p>
        </div>
        <span className="badge-info text-[10px]">Demo Data</span>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Parcels" value={parcels.length} icon={Map} color="text-gis-accent" />
        <MetricCard label="Buildings" value={buildings.length} icon={Building} color="text-gis-secondary" />
        <MetricCard label="Total Area" value={`${(totalArea / 1000).toFixed(1)}k m²`} icon={TrendingUp} color="text-gis-warning" />
        <MetricCard label="AI Accuracy" value={`${avgConfidence}%`} icon={Activity} color="text-gis-success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Land Use Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Land Use Distribution</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={landUseData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                    {landUseData.map((entry, i) => (
                      <Cell key={i} fill={['#0EA5E9', '#7C3AED', '#10B981', '#F59E0B', '#EF4444'][i % 5]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#151D2B', border: '1px solid #1E2A3A', borderRadius: 8, color: '#E2E8F0' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* Building Types */}
        <Card>
          <CardHeader>
            <CardTitle>Building Classification</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={buildingTypeData}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
                  <Tooltip cursor={{ fill: 'rgba(148,163,184,0.05)' }} contentStyle={{ background: '#151D2B', border: '1px solid #1E2A3A', borderRadius: 8, color: '#E2E8F0' }} />
                  <Bar dataKey="count" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* Floor Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Floor Distribution</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={floorDistribution}>
                  <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#151D2B', border: '1px solid #1E2A3A', borderRadius: 8, color: '#E2E8F0' }} />
                  <Area type="monotone" dataKey="count" stroke="#0EA5E9" fill="#0EA5E9" fillOpacity={0.2} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* Confidence Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>AI Confidence Breakdown</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={confidenceData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                    {confidenceData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#151D2B', border: '1px solid #1E2A3A', borderRadius: 8, color: '#E2E8F0' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Area Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Parcel Area Trend</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaTrend}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#151D2B', border: '1px solid #1E2A3A', borderRadius: 8, color: '#E2E8F0' }} />
                <Area type="monotone" dataKey="area" stroke="#10B981" fill="#10B981" fillOpacity={0.2} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default Analytics;
