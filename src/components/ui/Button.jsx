import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconRight: IconRight,
  className = '',
  ...props
}) => {
  const base = 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gis-accent/40 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer';
  
  const variants = {
    primary: 'bg-gis-accent text-white hover:bg-sky-400 active:bg-sky-500 shadow-lg shadow-gis-accent/20',
    secondary: 'bg-gis-card text-gis-ink border border-gis-border hover:border-gis-accent/50 hover:bg-gis-surface',
    ghost: 'text-gis-muted hover:text-gis-ink hover:bg-gis-surface',
    danger: 'bg-gis-error/10 text-gis-error border border-gis-error/30 hover:bg-gis-error/20',
    success: 'bg-gis-success/10 text-gis-success border border-gis-success/30 hover:bg-gis-success/20',
    warning: 'bg-gis-warning/10 text-gis-warning border border-gis-warning/30 hover:bg-gis-warning/20',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
    icon: 'p-2',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : Icon && <Icon size={16} />}
      {children}
      {IconRight && <IconRight size={16} />}
    </button>
  );
};

export default Button;
