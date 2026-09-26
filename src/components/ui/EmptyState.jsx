import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({ icon: Icon = Inbox, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="p-4 rounded-2xl bg-gis-surface mb-4">
      <Icon size={32} className="text-gis-muted" />
    </div>
    <h4 className="text-base font-semibold text-gis-ink mb-1">{title}</h4>
    <p className="text-sm text-gis-muted max-w-sm mb-4">{description}</p>
    {action}
  </div>
);

export default EmptyState;
