import React from 'react';

const Card = ({ children, className = '', hover = false, ...props }) => {
  return (
    <div
      className={`bg-gis-card border border-gis-border rounded-xl transition-all duration-200 ${hover ? 'hover:border-gis-accent/30 hover:shadow-lg hover:shadow-gis-accent/5' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`flex items-center justify-between p-4 border-b border-gis-border ${className}`} {...props}>
    {children}
  </div>
);

export const CardBody = ({ children, className = '', ...props }) => (
  <div className={`p-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-sm font-semibold text-gis-ink ${className}`}>{children}</h3>
);

export default Card;
