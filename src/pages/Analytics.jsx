import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Activity, Building, Map, CheckCircle } from 'lucide-react';

const AnalyticsDashboard = () => {
  const stats = [
    { label: 'Total Buildings', value: '1,284', icon: <Building />, color: 'text-blue-500' },
    { label: 'Area Extracted', value: '4.2M m²', icon: <Map />, color: 'text-emerald-500' },
    { label: 'Verified Units', value: '8,420', icon: <CheckCircle />, color: 'text-purple-500' },
    { label: 'AI Accuracy', value: '94.2%', icon: <Activity />, color: 'text-orange-500' },
  ];

  const confidenceData = [
    { name: 'High Confidence', value: 65, color: '#3aa77b' },
    { name: 'Medium Confidence', value: 25, color: '#f2b544' },
    { name: 'Low / Review', value: 10, color: '#ef4444' },
  ];

  const buildingTypeData = [
    { name: 'Residential', count: 450 },
    { name: 'Commercial', count: 320 },
    { name: 'Industrial', count: 120 },
    { name: 'Govt', count: 80 },
    { name: 'Mixed', count: 314 },
  ];

  return (
    <div className="p-8 h-full bg-gis-bg animate-fade-in-up space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gis-ink tracking-tight">AI Extraction Insights</h1>
          <p className="text-gis-muted font-medium">Real-time geospatial analysis of detected property features</p>
        </div>
        <div className="px-4 py-2 bg-gis-card border border-gis-line rounded-full text-xs font-bold text-gis-muted">
          Last Sync: 2026-09-26 14:20
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="card-premium p-6 bg-gis-card border border-gis-line transition-all hover:border-gis-accent group">
            <div className={`mb-4 p-3 w-fit rounded-xl bg-gis-bg ${stat.color} group-hover:scale-110 transition-transform`}>
              {stat.icon}
            </div>
            <span className="block text-[10px] font-black text-gis-muted uppercase tracking-widest mb-1">{stat.label}</span>
            <span className="text-3xl font-black text-gis-ink">{stat.value}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Confidence Pie Chart */}
        <div className="card-premium p-8 bg-gis-card border border-gis-line">
          <h3 className="text-xl font-bold text-gis-ink mb-6">AI Detection Confidence</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={confidenceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {confidenceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Building Types Bar Chart */}
        <div className="card-premium p-8 bg-gis-card border border-gis-line">
          <h3 className="text-xl font-bold text-gis-ink mb-6">Building Classification</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={buildingTypeData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#8a92a2', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#8a92a2', fontSize: 12}} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="count" fill="#3aa77b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
