import React from 'react';
import { Loader2 } from 'lucide-react';

export const Spinner = ({ size = 24, className = '' }) => (
  <Loader2 size={size} className={`animate-spin text-gis-accent ${className}`} />
);

export const PageLoading = () => (
  <div className="flex flex-col items-center justify-center h-full gap-4">
    <Spinner size={32} />
    <p className="text-sm text-gis-muted">Loading...</p>
  </div>
);

export const SkeletonCard = () => (
  <div className="card p-5 animate-pulse">
    <div className="h-4 bg-gis-surface rounded w-1/3 mb-3" />
    <div className="h-8 bg-gis-surface rounded w-2/3 mb-2" />
    <div className="h-3 bg-gis-surface rounded w-1/2" />
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 animate-pulse">
        <div className="h-4 bg-gis-surface rounded flex-1" />
        <div className="h-4 bg-gis-surface rounded flex-1" />
        <div className="h-4 bg-gis-surface rounded flex-1" />
      </div>
    ))}
  </div>
);

export const SkeletonMap = () => (
  <div className="w-full h-full bg-gis-surface animate-pulse rounded-xl flex items-center justify-center">
    <Spinner size={32} />
  </div>
);

export default { Spinner, PageLoading, SkeletonCard, SkeletonTable, SkeletonMap };
