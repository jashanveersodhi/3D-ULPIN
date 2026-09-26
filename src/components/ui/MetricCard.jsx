import React from 'react';

const MetricCard = ({ label, value, subtext, icon: Icon, color = 'text-gis-accent', trend, className = '' }) => {
  return (
    <div className={`card p-5 flex flex-col gap-3 ${className}`}>
      <div className="flex items-start justify-between">
        <div className={`p-2.5 rounded-lg bg-gis-surface ${color}`}>
          {Icon && <Icon size={20} />}
        </div>
        {trend && (
          <span className={`text-xs font-medium ${trend > 0 ? 'text-gis-success' : 'text-gis-error'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div>
        <p className="text-xs font-medium text-gis-muted uppercase tracking-wider">{label}</p>
        <p className="text-3xl font-bold text-gis-ink tabular-nums mt-1">{value}</p>
        {subtext && <p className="text-xs text-gis-muted mt-1">{subtext}</p>}
      </div>
    </div>
  );
};

export default MetricCard;
