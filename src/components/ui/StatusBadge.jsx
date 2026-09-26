import React from 'react';

const StatusBadge = ({ status, className = '' }) => {
  const config = {
    Validated: 'bg-gis-success/10 text-gis-success border-gis-success/20',
    Pending: 'bg-gis-warning/10 text-gis-warning border-gis-warning/20',
    'Needs Review': 'bg-gis-error/10 text-gis-error border-gis-error/20',
    'AI_DETECTED': 'bg-gis-accent/10 text-gis-accent border-gis-accent/20',
    'In Progress': 'bg-gis-secondary/10 text-gis-secondary border-gis-secondary/20',
    'Not Started': 'bg-gis-surface text-gis-muted border-gis-border',
    Completed: 'bg-gis-success/10 text-gis-success border-gis-success/20',
  };

  const colorClass = config[status] || config['Not Started'];

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        status === 'Validated' ? 'bg-gis-success' :
        status === 'Pending' ? 'bg-gis-warning' :
        status === 'Needs Review' ? 'bg-gis-error' :
        status === 'AI_DETECTED' ? 'bg-gis-accent' :
        status === 'In Progress' ? 'bg-gis-secondary' :
        'bg-gis-muted'
      }`} />
      {status}
    </span>
  );
};

export default StatusBadge;
